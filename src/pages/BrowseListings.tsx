import { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Database } from '../lib/database.types';
import { CHINESE_CITIES, ALGERIAN_CITIES } from '../lib/constants';
import ListingCard from '../components/ListingCard';
import ListingForm from '../components/ListingForm';

// ----------------------------------------------------
// 1. DEFINE EXTENDED TYPES (Updated Data Structure after JOIN)
// ----------------------------------------------------
interface SellerProfile {
    username: string | null;
}

type BaseListing = Database['public']['Tables']['listings']['Row'];

// Redefine Listing to include the joined 'seller' object
export interface ListingWithSeller extends BaseListing {
    seller: SellerProfile | null;
}
type Listing = ListingWithSeller; 
// ----------------------------------------------------

// ----------------------------------------------------
// 2. DEFINE COMPONENT PROPS (NEW INTERFACE)
// ----------------------------------------------------
interface BrowseListingsProps {
  // Function to navigate to another user's profile
  navigateToUser: (userId: string) => void; 
}
// ----------------------------------------------------

// Update function signature to accept the new prop
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

    const fetchListings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('listings')
            .select(`
                *, 
                seller:profiles(contact_person) // The JOIN is correctly implemented here
            `)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching listings:', error);
        } else {
            // Assert the data type here since it matches our custom Listing type
            setListings(data as Listing[] || []);
            setFilteredListings(data as Listing[] || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchListings();
    }, []);

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
                    l.title.toLowerCase().includes(query) ||
                    l.description.toLowerCase().includes(query) ||
                    l.departure_city_china.toLowerCase().includes(query) ||
                    l.arrival_city_algeria.toLowerCase().includes(query)
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus
