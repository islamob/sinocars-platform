// src/pages/UserProfile.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you use react-router-dom
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { useLanguage } from '../contexts/LanguageContext';

// Import the rating components
import UserRatingDisplay from '../components/UserRatingDisplay';
import RatingForm from '../components/RatingForm';

// Define the type for the profile data you expect to fetch
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function UserProfile() {
    // 1. Get the user ID from the URL route parameter (e.g., /users/123-abc-456)
    const { userId } = useParams<{ userId: string }>(); 
    const { t } = useLanguage();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State to manage refreshing the rating display after a submission
    const [ratingKey, setRatingKey] = useState(0); 

    // Function to fetch the user's profile data
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

    const handleRatingSubmitted = () => {
        // Increment key to force UserRatingDisplay to re-fetch average
        setRatingKey(prev => prev + 1); 
    };

    if (loading) {
        return <div className="text-center py-12">{t('loading')}...</div>;
    }

    if (error || !profile) {
        return <div className="text-center py-12 text-red-600">{error || t('profileLoadError')}</div>;
    }

    // Main JSX structure for the profile page
    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <header className="text-center mb-10 pb-5 border-b">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                    {profile.username || t('userNameNotSet')}
                </h1>
                <p className="text-lg text-gray-500">
                    {profile.location || t('locationNotSet')}
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-8">
                {/* COLUMN 1: RATINGS & FEEDBACK */}
                <div className="md:col-span-1 space-y-6">
                    <section className="bg-white p-4 rounded-lg shadow">
                        <UserRatingDisplay 
                            userId={userId} 
                            key={ratingKey} // Key is used to force refresh after submission
                        />
                    </section>
                    
                    {/* Only show the form if the user is logged in and not rating themselves */}
                    {/* NOTE: You'll need logic to check if the current user ID != profile.id */}
                    <section className="bg-white p-4 rounded-lg shadow">
                        <RatingForm 
                            ratedUserId={userId} 
                            onRatingSubmitted={handleRatingSubmitted} 
                        />
                    </section>
                </div>

                {/* COLUMN 2 & 3: ABOUT, CONTACT, and LISTINGS */}
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-2xl font-semibold mb-3">{t('about')}</h2>
                        <p className="text-gray-700">{profile.bio || t('noBioAvailable')}</p>
                    </section>
                    
                    {/* Here you would integrate a component to show the user's listings */}
                    <section className="bg-white p-6 rounded-lg shadow">
                         <h2 className="text-2xl font-semibold mb-3">{t('usersListings')}</h2>
                         {/* <UserListings userId={userId} /> */}
                         <p className="text-gray-500">**{t('listingsComponentGoesHere')}**</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
