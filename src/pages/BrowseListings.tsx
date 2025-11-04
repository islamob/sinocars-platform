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
// 1. Define the Profile structure for the join
// ----------------------------------------------------
interface SellerProfile {
    username: string | null; // Assumes 'username' can be null
}

// ----------------------------------------------------
// 2. Define the new Listing type by extending the original
// ----------------------------------------------------
type BaseListing = Database['public']['Tables']['listings']['Row'];

// Redefine Listing to include the joined 'seller' object
export interface ListingWithSeller extends BaseListing {
    seller: SellerProfile | null;
}

// Use the new type for the component state
type Listing = ListingWithSeller; 
// ----------------------------------------------------

export default function BrowseListings() {
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
        // NOTE: The 'data' returned by Supabase now conforms to ListingWithSeller[]
        const { data, error } = await supabase
            .from('listings')
            .select(`
                *, // Selects all columns from the 'listings' table
                seller:profiles(username) // <-- THIS IS THE KEY CHANGE
            `)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching listings:', error);
        } else {
            // TypeScript now correctly understands 'data' includes the 'seller' object
            setListings(data as Listing[] || []); 
            setFilteredListings(data as Listing[] || []);
        }
        setLoading(false);
    };

    // ... (rest of the component logic is unchanged)

    // ... (rest of the component logic is unchanged)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* ... JSX for header, search, filters ... */}

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
                        // No changes needed here, as the 'listing' prop now has the correct type
                        <ListingCard key={listing.id} listing={listing} />
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
