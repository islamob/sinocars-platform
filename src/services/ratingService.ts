// src/services/ratingService.ts
import { supabase } from '../lib/supabase';

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

export async function getUserRatingsSummary() {
  try {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('rated_user_id, rating, feedback, created_at');

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching ratings:', err);
    return [];
  }
}
