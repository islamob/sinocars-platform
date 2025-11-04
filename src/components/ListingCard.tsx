import { useState } from 'react';
import { MapPin, Calendar, Car, Phone, Mail, Eye, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Database } from '../lib/database.types';

// 1. DEFINE THE CORRECT TYPES (matching BrowseListings.tsx)
interface SellerProfile {
    contact_person: string | null;
}
type BaseListing = Database['public']['Tables']['listings']['Row'];
export interface ListingWithSeller extends BaseListing {
    seller: SellerProfile | null;
}
// ----------------------------------------------------

// 2. UPDATE THE PROPS INTERFACE
interface ListingCardProps {
    listing: ListingWithSeller;
    navigateToUser: (userId: string) => void;
}
// ----------------------------------------------------

// 3. Destructure the new prop
export default function ListingCard({ listing, navigateToUser }: ListingCardProps) {
    const [showContact, setShowContact] = useState(false);
    const { user } = useAuth();
    const { t } = useLanguage();

    const isOffer = listing.listing_type === 'offer';
    
    // 4. Access the CORRECT column 'contact_person'
    const sellerName = listing.seller?.contact_person || t('unknownUser');

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isOffer
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}
                        >
                            {isOffer ? t('offerSpace') : t('requestSpace')}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h3>
                    <p className="text-gray-600 text-sm">{listing.description}</p>
                </div>
            </div>

            {/* 5. ADD CLICKABLE USERNAME */}
            <div className="flex items-center text-sm text-gray-700 mb-4">
                <User size={16} className="mr-2 text-gray-600" />
                <span>
                    {t('postedBy')}: 
                   // Inside src/components/ListingCard.tsx

                    // ... (inside the return statement)

                    <button
                        // CRITICAL CHECK: Ensure listing.seller_id exists and is valid.
                        onClick={() => {
                        if (listing.seller_id) {
                        navigateToUser(listing.seller_id);
                        } else {
                        console.error("Attempted to navigate, but seller_id is missing!");
                        }
                        }}
                        className="font-semibold text-blue-700 hover:text-blue-900 hover:underline ml-1 cursor-pointer"
                        >
                    {sellerName}
                    </button>
                </span>
            </div>

            <div className="space-y-3 mb-4">
                {/* ... (Rest of the listing details JSX is unchanged) ... */}
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

        <div className="flex items-center text-sm text-gray-700">
          <Car size={16} className="mr-2 text-gray-600" />
          <span>
            {listing.spots_count} {listing.spots_count > 1 ? t('spots') : t('spot')} • {listing.car_types}
          </span>
        </div>
            </div>

            <div className="border-t pt-4">
                {/* ... (Contact reveal logic is unchanged) ... */}
                {user ? (
          showContact ? (
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <Mail size={16} className="mr-2 text-blue-600" />
                <a href={`mailto:${listing.contact_email}`} className="hover:text-blue-600">
                  {listing.contact_email}
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <Phone size={16} className="mr-2 text-green-600" />
                <a href={`tel:${listing.contact_phone}`} className="hover:text-green-600">
                  {listing.contact_phone}
                </a>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowContact(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Eye size={18} />
              <span>{t('revealContact')}</span>
            </button>
          )
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">{t('loginRequired')}</p>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-not-allowed">
              {t('revealContact')}
            </button>
          </div>
        )}
            </div>
        </div>
    );
}
