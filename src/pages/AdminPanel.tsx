import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, MapPin, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Database } from '../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];

export default function AdminPanel() {
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { t } = useLanguage();

  const fetchPendingListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setPendingListings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingListings();
  }, []);

  const handleApprove = async (listingId: string) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'approved' })
      .eq('id', listingId);

    if (error) {
      console.error('Error approving listing:', error);
      alert('Failed to approve listing');
    } else {
      fetchPendingListings();
    }
  };

  const handleReject = async (listingId: string) => {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'rejected' })
      .eq('id', listingId);

    if (error) {
      console.error('Error rejecting listing:', error);
      alert('Failed to reject listing');
    } else {
      fetchPendingListings();
    }
  };

  if (!profile?.is_admin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('adminPanel')}</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {t('pending')} ({pendingListings.length})
        </h3>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      ) : pendingListings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No pending listings to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        listing.listing_type === 'offer'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {listing.listing_type === 'offer' ? t('offerSpace') : t('requestSpace')}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      {t('pending')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{listing.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin size={16} className="mr-2 text-blue-600" />
                    <span>
                      {listing.departure_city_china} → {listing.arrival_city_algeria}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin size={16} className="mr-2 text-green-600" />
                    <span>
                      {listing.port_loading} → {listing.port_arrival}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar size={16} className="mr-2 text-gray-600" />
                    <span>{new Date(listing.estimated_shipping_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Spots:</span> {listing.spots_count}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Car Types:</span> {listing.car_types}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Contact:</span> {listing.contact_email}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Phone:</span> {listing.contact_phone}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 flex space-x-4">
                <button
                  onClick={() => handleApprove(listing.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={18} />
                  <span>{t('approve')}</span>
                </button>
                <button
                  onClick={() => handleReject(listing.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <XCircle size={18} />
                  <span>{t('reject')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
