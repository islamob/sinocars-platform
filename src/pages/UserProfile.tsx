// src/pages/UserProfile.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

import UserRatingDisplay from '../components/UserRatingDisplay';
import RatingForm from '../components/RatingForm';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserProfileProps {
  userId: string;
}

export default function UserProfile({ userId }: UserProfileProps) {
  const { t, lang } = useLanguage(); // ✅ استدعاء اللغة الحالية
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingKey, setRatingKey] = useState(0);

  const fetchProfile = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      setError(t('profileNotFound'));
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleRatingSubmitted = () => setRatingKey((prev) => prev + 1);
  const isCurrentUser = user && user.id === userId;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <p className="text-gray-500 text-lg animate-pulse">{t('loading')}...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center h-[60vh]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <p className="text-red-500 font-medium">
          {error || t('profileLoadError')}
        </p>
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* ===== HEADER ===== */}
      <header className="text-center mb-12">
        <div className="inline-block bg-white shadow-md px-8 py-5 rounded-2xl border border-gray-100">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            {profile.username || t('userNameNotSet')}
          </h1>
          {isCurrentUser && (
            <p className="text-sm text-green-600">{t('yourProfile')}</p>
          )}
        </div>
      </header>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* === LEFT COLUMN === */}
        <div className="space-y-6 order-2 md:order-1">
          {/* Rating Display */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <UserRatingDisplay userId={userId} key={ratingKey} />
          </div>

          {/* Rating Form */}
          {!isCurrentUser && user && (
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {t('leaveFeedback')}
              </h3>
              <RatingForm
                ratedUserId={userId}
                onRatingSubmitted={handleRatingSubmitted}
              />
            </div>
          )}

          {!user && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center text-sm text-gray-500 shadow-sm">
              {t('loginToRate')}
            </div>
          )}
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="md:col-span-2 space-y-6 order-1 md:order-2">
          {/* About Section */}
          <section className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {t('about')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {profile.bio || t('noBioAvailable')}
            </p>
          </section>

          {/* Listings Placeholder */}
          <section className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {t('usersListings')}
            </h2>
            <p className="text-gray-500 italic">
              {t('integrationNote')} :
              {lang === 'fr'
                ? " Un composant pour afficher les annonces de cet utilisateur sera ajouté ici."
                : " سيتم هنا عرض مكونات إعلانات هذا المستخدم."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
