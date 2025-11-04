// src/pages/UserProfile.tsx

import React, { useState, useEffect } from 'react';
// Note: Removed 'useParams' as navigation is now state-based via App.tsx
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext'; // Needed for checking if user is rating self

// Import the rating components
import UserRatingDisplay from '../components/UserRatingDisplay';
import RatingForm from '../components/RatingForm';

// Define the types
type Profile = Database['public']['Tables']['profiles']['Row'];

// -----------------------------------------------------------------
// 1. COMPONENT ACCEPTS userId AS A PROP
// -----------------------------------------------------------------
interface UserProfileProps {
    userId: string;
}

export default function UserProfile({ userId }: UserProfileProps) {
    
    const { t } = useLanguage();
    const { user } = useAuth(); // Current logged-in user
    
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State to manage refreshing the rating display after a submission
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
        // Refetch profile data whenever the userId prop changes
        fetchProfile(); 
    }, [userId]);

    const handleRatingSubmitted = () => {
        // Increment key to force UserRatingDisplay to re-fetch average
        setRatingKey(prev => prev + 1); 
    };

    // Check if the currently logged-in user is viewing their own profile
    const isCurrentUser = user && user.id === userId;


    if (loading) {
        return <div className="text-center py-12">{t('loading')}...</div>;
    }

    if (error || !profile) {
        return <div className="text-center py-12 text-red-600">{error || t('profileLoadError')}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <header className="text-center mb-10 pb-5 border-b">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                    {profile.username || t('userNameNotSet')}
                </h1>
                {isCurrentUser && (
                    <p className="text-sm text-green-600">({t('yourProfile')})</p>
                )}
            </header>

            <div className="grid md:grid-cols-3 gap-8">
                {/* COLUMN 1: RATINGS & FEEDBACK */}
                <div className="md:col-span-1 space-y-6">
                    
                    {/* 2. USER RATING DISPLAY INTEGRATION */}
                    <section className="bg-white p-4 rounded-lg shadow">
                        <UserRatingDisplay 
                            userId={userId} 
                            key={ratingKey} // Forces component to re-fetch on new rating
                        />
                    </section>
                    
                    {/* 3. RATING FORM INTEGRATION (Only if not viewing own profile) */}
                    {!isCurrentUser && user && (
                        <section className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-3">{t('leaveFeedback')}</h3>
                            <RatingForm 
                                ratedUserId={userId} 
                                onRatingSubmitted={handleRatingSubmitted} 
                            />
                        </section>
                    )}
                    {/* Show message if user is logged out and cannot rate */}
                    {!user && (
                         <div className="text-center text-sm text-gray-500 p-4 border rounded-lg">
                            {t('loginToRate')}
                        </div>
                    )}
                </div>

                {/* COLUMN 2 & 3: ABOUT and LISTINGS */}
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-3">{t('about')}</h2>
                        <p className="text-gray-700">{profile.bio || t('noBioAvailable')}</p>
                    </section>
                    
                    {/* Placeholder for the user's listings component */}
                    <section className="bg-white p-6 rounded-lg shadow">
                         <h2 className="text-2xl font-semibold mb-3">{t('usersListings')}</h2>
                         <p className="text-gray-500">
                             {t('integrationNote')}: Component to display this user's listings goes here.
                         </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
