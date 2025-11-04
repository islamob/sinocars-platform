// Inside src/lib/ratingService.ts (or similar)

import { supabase } from './supabase'; // Adjust path as needed

interface RatingPayload {
    ratedUserId: string;
    rating: number;
    feedback: string;
}

// Ensure the function is strongly typed and handles errors by throwing
export async function submitRating({ ratedUserId, rating, feedback }: RatingPayload) {
    
    // We expect the user to be logged in, so we get the rater's ID
    const raterId = supabase.auth.getUser()?.data.user?.id;

    if (!raterId) {
        throw new Error('User must be logged in to submit a rating.');
    }

    const newRating = {
        rater_user_id: raterId,
        rated_user_id: ratedUserId,
        rating: rating,
        feedback: feedback,
    };

    const { data, error } = await supabase
        .from('user_ratings')
        .insert(newRating);

    // If Supabase returns an RLS or other database error, throw it so RatingForm catches it
    if (error) {
        console.error('Supabase rating submission error:', error.message);
        throw new Error(`DB Error: ${error.message}`);
    }

    // The function simply returns (or returns data) on success
    return data;
}
