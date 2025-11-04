import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Database } from '../lib/database.types';
import { CHINESE_CITIES, ALGERIAN_CITIES } from '../lib/constants';
import ListingCard from '../components/ListingCard';
import ListingForm from '../components/ListingForm';

// ----------------------------------------------------
// 1. DEFINE EXTENDED TYPES (Updated for rating data structure)
// ----------------------------------------------------
interface SellerProfile {
    contact_person: string | null;
}
interface ListingRatings {
    avg: string | null; 
    count: number | null; 
}
type BaseListing = Database['public']['Tables']['listings']['Row'];

// This is the definitive type for a listing on this page
export interface ListingWithSeller extends BaseListing {
    seller: SellerProfile | null;
    // We now add ratings directly (per seller)
    ratings: ListingRatings | null;
}
type Listing = ListingWithSeller; 
// ----------------------------------------------------

// ----------------------------------------------------
// 2. DEFINE COMPONENT PROPS
// ----------------------------------------------------
interface BrowseListingsProps {
    navigateToUser: (userId: string) => void; 
}
// ----------------------------------------------------


export default function BrowseListings({ navigateToUser }: BrowseListingsProps) {
    
    const [listings, setListings] = useState<Listing[]>([]);
    const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'offer' | 'request'>('all');
    const [filterDepartureCity, setFilterDepartureCity] = useState('');
    const [filterArrivalCity, setFilterArrivalCity] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { user } = useAuth();
    const { t } = useLanguage();

    // Updated fetchListings: fetch listings and then the sellers' ratings
    const fetchListings = useCallback(async () => {
        setLoading(true);

        // 1. Fetch all listings with their seller (profile)
        const { data: listingsData, error: listingsError } = await supabase
            .from('listings')
            .select(`
                *,
                seller:profiles(contact_person)
            `)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (listingsError || !listingsData) {
            console.error('Error fetching listings:', listingsError);
            setListings([]);
            setFilteredListings([]);
            setLoading(false);
            return;
        }

        // 2. Fetch ratings per unique seller (user_id)
        const uniqueUserIds = Array.from(new Set(listingsData.map((l: any) => l.user_id)));
        let ratingsMap: Record<string, ListingRatings> = {};
        if (uniqueUserIds.length > 0) {
            const { data: ratingsData, error: ratingsError } = await supabase
                .from('user_ratings')
                .select('rated_user_id, avg:rating(avg), count:rating(count)')
                .in('rated_user_id', uniqueUserIds);

            if (ratingsError) {
                console.error('Error fetching ratings:', ratingsError);
            } else {
                ratingsData?.forEach((r: any) => {
                    ratingsMap[r.rated_user_id] = {
                        avg: r.avg,
                        count: r.count
                    };
                });
            }
        }

        // 3. Merge ratings into listings
        const listingsWithRatings: Listing[] = listingsData.map((listing: any) => ({
            ...listing,
            ratings: ratingsMap[listing.user_id] || { avg: null, count: 0 }
        }));

        setListings(listingsWithRatings);
        setFilteredListings(listingsWithRatings);
        setLoading(false);
    }, []); // Dependency array is empty as it only depends on supabase object

    useEffect(() => {
        fetchListings();
    }, [fetchListings]); // Depend on the stable fetchListings function

    useEffect(() => {
        let filtered = listings;

        if (filterType !== 'all') {
            filtered = filtered.filter((l) => l.listing_type === filterType);
        }

        if (filterDepartureCity) {
            filtered = filtered.filter((l) => l.departure_city_china === filterDepartureCity);
        }

        if (filterArrivalCity) {
            filtered = filtered.filter((l) => l.arrival_city_algeria === filterArrivalCity);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (l) =>
                    l.title?.toLowerCase().includes(query) ||
                    l.description?.toLowerCase().includes(query) ||
                    l.departure_city_china?.toLowerCase().includes(query) ||
                    l.arrival_city_algeria?.toLowerCase().includes(query)
            );
        }

        setFilteredListings(filtered);
    }, [listings, filterType, filterDepartureCity, filterArrivalCity, searchQuery]);

    const clearFilters = () => {
        setFilterType('all');
        setFilterDepartureCity('');
        setFilterArrivalCity('');
        setSearchQuery('');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* ... (Header and Filter JSX is unchanged) ... */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{t('browseListings')}</h2>
                {user && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>{t('createListing')}</span>
                    </button>
                )}
            </div>

            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <Filter size={20} />
                        <span>{t('filter')}</span>
                    </button>
                </div>

                {showFilters && (
                    <div className="bg-gray-50 p-4 rounded-md space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('listingType')}
                                </label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">{t('allListings')}</option>
                                    <option value="offer">{t('offers')}</option>
                                    <option value="request">{t('requests')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('departureCityChina')}
                                </label>
                                <select
                                    value={filterDepartureCity}
                                    onChange={(e) => setFilterDepartureCity(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All cities</option>
                                    {CHINESE_CITIES.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('arrivalCityAlgeria')}
                                </label>
                                <select
                                    value={filterArrivalCity}
                                    onChange={(e) => setFilterArrivalCity(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All cities</option>
                                    {ALGERIAN_CITIES.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-4 text-sm text-gray-600">
                {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">{t('loading')}</p>
                </div>
            ) : filteredListings.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">{t('noListings')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                        <ListingCard 
                            key={listing.id} 
                            listing={listing}
                            // 5. PASS THE NAVIGATION FUNCTION DOWN
                            navigateToUser={navigateToUser}
                        />
                    ))}
                </div>
            )}

            <ListingForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSuccess={fetchListings}
            />
        </div>
    );
}
