import { useState } from 'react';
import { MapPin, Calendar, Car, Phone, Mail, Eye, User } from 'lucide-react'; // Added 'User' icon
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Database } from '../lib/database.types';

// ----------------------------------------------------
// 1. IMPORT/DEFINE THE EXTENDED TYPE
// ----------------------------------------------------

// Define the nested profile structure
interface SellerProfile {
    contact_person: string | null;
}

// Define the full listing type including the joined 'seller' data
// This is an approximation; ideally, you would import this from BrowseListings.tsx
type BaseListing = Database['public']['Tables']['listings']['Row'];
interface ListingWithSeller extends BaseListing {
    seller: SellerProfile | null;
}

// Use the extended type for the component prop
interface ListingCardProps {
    listing: ListingWithSeller;
}
// ----------------------------------------------------

export default function ListingCard({ listing }: ListingCardProps) {
    const [showContact, setShowContact] = useState(false);
    const { user } = useAuth();
    const { t } = useLanguage();

    const isOffer = listing.listing_type === 'offer';
    
    // Access the seller's contact_person with a safe fallback
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

            {/* NEW: Display the Seller's Name */}
            <div className="flex items-center text-sm text-gray-700 mb-4">
                <User size={16} className="mr-2 text-gray-600" />
                <span>
                    {t('postedBy')}: <strong className="font-semibold text-blue-700">{sellerName}</strong>
                </span>
            </div>
            {/* END NEW SECTION */}

            <div className="space-y-3 mb-4">
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
