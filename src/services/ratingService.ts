// src/services/ratingService.ts

import { supabase } from '../supabase.ts'; // Adjust path as needed

interface RatingData {
    ratedUserId: string;
    rating: number; // e.g., 1 to 5
    feedback: string;
}

// Function to submit a new rating
export async function submitRating({ ratedUserId, rating, feedback }: RatingData) {
    // Supabase will automatically use the user ID from the active session
    // to populate the 'reviewer_id' if you're using the client.
    
    // IMPORTANT: We include 'reviewer_id' manually here to ensure our RLS policy works correctly
    // which checks that 'reviewer_id' equals the current 'auth.uid()'.
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
        throw new Error("User must be logged in to submit a rating.");
    }
    
    const { data, error } = await supabase
        .from('user_ratings')
        .insert({
            rated_user_id: ratedUserId,
            reviewer_id: user.data.user.id, // Ensure this matches the auth.uid() for RLS
            rating: rating,
            feedback: feedback,
        });

    if (error) {
        console.error('Error submitting rating:', error.message);
        throw error; // Propagate the error to the UI
    }

    return data;
}

// Function to fetch a user's average rating (from your SQL View)
export async function fetchAverageRating(userId: string) {
    const { data, error } = await supabase
        .from('user_average_ratings') // Your custom SQL View
        .select('average_rating, total_ratings')
        .eq('rated_user_id', userId)
        .single(); // Use .single() as we expect only one row per user

    if (error && error.code !== 'PGRST116') { // PGRST116 means 'no row found' (user has no ratings yet)
        console.error('Error fetching average rating:', error.message);
        return { average_rating: 0, total_ratings: 0 };
    }

    return data || { average_rating: 0, total_ratings: 0 };
}
