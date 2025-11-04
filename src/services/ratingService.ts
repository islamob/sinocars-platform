// src/services/ratingService.ts (FULL CONTENTS - including the fix for fetchAverageRating)

import { supabase } from '../lib/supabase'; 
import { Database } from '../lib/database.types'; // Assuming you have this defined

// Define the type for the table
type NewRating = Database['public']['Tables']['user_ratings']['Insert'];

// -------------------------------------------------------------------
// 1. Service function for fetching ratings (Solved previous issue)
// -------------------------------------------------------------------
interface RatingResult {
    average_rating: number;
    total_ratings: number;
}

export const fetchAverageRating = async (userId: string): Promise<RatingResult> => {
    // (Content of the function provided in the previous step)
    const { data: avgData, error: avgError } = await supabase
        .from('user_ratings')
        .select('avg(rating), count')
        .eq('rated_user_id', userId)
        .maybeSingle();

    if (avgError) {
        console.error('SUPABASE ERROR in fetchAverageRating:', avgError);
        return { average_rating: 0, total_ratings: 0 };
    }
    
    if (avgData && avgData.count > 0 && avgData.avg !== null) {
        return {
            average_rating: parseFloat(avgData.avg),
            total_ratings: avgData.count,
        };
    }
    
    return { average_rating: 0, total_ratings: 0 };
};


// -------------------------------------------------------------------
// 2. Service function for submitting ratings (The missing export/function)
// -------------------------------------------------------------------
export const submitRating = async (
    reviewerId: string, 
    ratedUserId: string, 
    rating: number, 
    comment: string
): Promise<{ success: boolean; error: string | null }> => {

    const newRating: NewRating = {
        reviewer_id: reviewerId,
        rated_user_id: ratedUserId,
        rating: rating,
        comment: comment,
    };

    const { error } = await supabase
        .from('user_ratings')
        .insert([newRating]);

    if (error) {
        console.error('Error submitting rating:', error);
        return { success: false, error: error.message };
    }

    return { success: true, error: null };
};
