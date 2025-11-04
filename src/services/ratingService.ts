// src/services/ratingService.ts

import { supabase } from '../lib/supabase.ts';

interface RatingPayload {
  ratedUserId: string;
  rating: number;
  feedback: string;
}

export async function submitRating({ ratedUserId, rating, feedback }: RatingPayload) {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    throw new Error('User must be logged in to submit a rating.');
  }

  const reviewerId = userData.user.id;

  const newRating = {
    reviewer_id: reviewerId,
    rated_user_id: ratedUserId,
    rating,
    feedback,
  };

  const { data, error } = await supabase
    .from('user_ratings')
    .insert([newRating]);

  if (error) {
    console.error('Supabase rating submission error:', error.message);
    throw new Error(`DB Error: ${error.message}`);
  }

  return data;
}

export async function fetchAverageRating(userId: string) {
  const { data, error } = await supabase
    .from('user_ratings')
    .select('rating')
    .eq('rated_user_id', userId);

  if (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return { average_rating: 0, total_ratings: 0 };
  }

  const ratings = data.map((r) => r.rating);
  const average =
    ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

  return {
    average_rating: average,
    total_ratings: ratings.length,
  };
}
