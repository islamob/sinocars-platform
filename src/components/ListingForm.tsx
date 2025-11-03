import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { CHINESE_CITIES, ALGERIAN_CITIES, CHINESE_PORTS, ALGERIAN_PORTS, CAR_TYPES } from '../lib/constants';

interface ListingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ListingForm({ isOpen, onClose, onSuccess }: ListingFormProps) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [listingType, setListingType] = useState<'offer' | 'request'>('offer');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departureCityChina, setDepartureCityChina] = useState('');
  const [arrivalCityAlgeria, setArrivalCityAlgeria] = useState('');
  const [portLoading, setPortLoading] = useState('');
  const [portArrival, setPortArrival] = useState('');
  const [spotsCount, setSpotsCount] = useState(1);
  const [carTypes, setCarTypes] = useState('');
  const [estimatedShippingDate, setEstimatedShippingDate] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in to create a listing');
      setLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('listings').insert({
        user_id: user.id,
        listing_type: listingType,
        title,
        description,
        departure_city_china: departureCityChina,
        arrival_city_algeria: arrivalCityAlgeria,
        port_loading: portLoading,
        port_arrival: portArrival,
        spots_count: spotsCount,
        car_types: carTypes,
        estimated_shipping_date: estimatedShippingDate,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setTitle('');
      setDescription('');
      setDepartureCityChina('');
      setArrivalCityAlgeria('');
      setPortLoading('');
      setPortArrival('');
      setSpotsCount(1);
      setCarTypes('');
      setEstimatedShippingDate('');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">{t('createListing')}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('listingType')}
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="offer"
                  checked={listingType === 'offer'}
                  onChange={(e) => setListingType(e.target.value as 'offer')}
                  className="mr-2"
                />
                <span>{t('offerSpace')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="request"
                  checked={listingType === 'request'}
                  onChange={(e) => setListingType(e.target.value as 'request')}
                  className="mr-2"
                />
                <span>{t('requestSpace')}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2 spots available in container to Algiers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide details about your offer or request..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('departureCityChina')}
              </label>
              <select
                value={departureCityChina}
                onChange={(e) => setDepartureCityChina(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select city</option>
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
                value={arrivalCityAlgeria}
                onChange={(e) => setArrivalCityAlgeria(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select city</option>
                {ALGERIAN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('portLoading')}
              </label>
              <select
                value={portLoading}
                onChange={(e) => setPortLoading(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select port</option>
                {CHINESE_PORTS.map((port) => (
                  <option key={port} value={port}>{port}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('portArrival')}
              </label>
              <select
                value={portArrival}
                onChange={(e) => setPortArrival(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select port</option>
                {ALGERIAN_PORTS.map((port) => (
                  <option key={port} value={port}>{port}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('spotsCount')}
              </label>
              <input
                type="number"
                value={spotsCount}
                onChange={(e) => setSpotsCount(parseInt(e.target.value))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('carTypes')}
              </label>
              <select
                value={carTypes}
                onChange={(e) => setCarTypes(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                {CAR_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('estimatedShippingDate')}
            </label>
            <input
              type="date"
              value={estimatedShippingDate}
              onChange={(e) => setEstimatedShippingDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contactEmail')}
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('contactPhone')}
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {loading ? t('loading') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
