// src/services/ratingService.ts

// Assuming you fixed this path error from the previous step
import { supabase } from '../lib/supabase'; // Correct path to your Supabase client

interface RatingResult {
    average_rating: number;
    total_ratings: number;
}

export const fetchAverageRating = async (userId: string): Promise<RatingResult> => {
    
    // --- 1. Fetch the Average Rating ---
    const { data: avgData, error: avgError } = await supabase
        .from('user_ratings')
        // Supabase function to calculate average and count in one query
        .select('avg(rating), count')
        .eq('rated_user_id', userId)
        .maybeSingle();

    if (avgError) {
        console.error('SUPABASE ERROR in fetchAverageRating:', avgError);
        // Fallback to 0 if there's an error
        return { average_rating: 0, total_ratings: 0 };
    }
    
    // The data returned is an array containing one object like:
    // { "avg": "4.5", "count": 10 }
    
    // Check if the result is valid
    if (avgData && avgData.count > 0 && avgData.avg !== null) {
        // Supabase returns aggregation results as strings. We must parse them.
        const average = parseFloat(avgData.avg);
        const count = avgData.count;

        return {
            average_rating: average,
            total_ratings: count,
        };
    }
    
    // Return 0 if no ratings are found for the user
    return { average_rating: 0, total_ratings: 0 };
};
