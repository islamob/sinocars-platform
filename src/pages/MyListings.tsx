import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Database } from '../lib/database.types';
import ListingCard from '../components/ListingCard';
import ListingForm from '../components/ListingForm';

type Listing = Database['public']['Tables']['listings']['Row'];

export default function MyListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const fetchMyListings = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    } else {
      fetchMyListings();
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Please log in to view your listings.
        </div>
      </div>
    );
  }

  const pendingListings = listings.filter((l) => l.status === 'pending');
  const approvedListings = listings.filter((l) => l.status === 'approved');
  const rejectedListings = listings.filter((l) => l.status === 'rejected');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('myListings')}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>{t('createListing')}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't created any listings yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>{t('createListing')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {pendingListings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-yellow-800 mb-4">
                {t('pending')} ({pendingListings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingListings.map((listing) => (
                  <div key={listing.id} className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="opacity-75">
                      <ListingCard listing={listing} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {approvedListings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">
                {t('approved')} ({approvedListings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedListings.map((listing) => (
                  <div key={listing.id} className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {rejectedListings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-red-800 mb-4">
                {t('rejected')} ({rejectedListings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rejectedListings.map((listing) => (
                  <div key={listing.id} className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="opacity-75">
                      <ListingCard listing={listing} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ListingForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchMyListings}
      />
    </div>
  );
}
