import { List, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          <button
            onClick={() => onPageChange('browse')}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
              currentPage === 'browse'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <List size={20} />
            <span className="font-medium">{t('browseListings')}</span>
          </button>

          <button
            onClick={() => onPageChange('myListings')}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
              currentPage === 'myListings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <List size={20} />
            <span className="font-medium">{t('myListings')}</span>
          </button>

          <button
            onClick={() => onPageChange('profile')}
            className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
              currentPage === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <User size={20} />
            <span className="font-medium">{t('myProfile')}</span>
          </button>

          {profile?.is_admin && (
            <button
              onClick={() => onPageChange('admin')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                currentPage === 'admin'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield size={20} />
              <span className="font-medium">{t('adminPanel')}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
