// src/services/ratingService.ts
import { supabase } from '../lib/supabase';

interface RatingPayload {
  ratedUserId: string;
  rating: number;
  feedback: string;
}

export async function submitRating({ ratedUserId, rating, feedback }: RatingPayload) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('User must be logged in to submit a rating.');
  const reviewerId = userData.user.id;
  const newRating = { reviewer_id: reviewerId, rated_user_id: ratedUserId, rating, feedback };
  const { data, error } = await supabase.from('user_ratings').insert([newRating]);
  if (error) throw new Error(`DB Error: ${error.message}`);
  return data;
}

export async function fetchAverageRating(userId: string) {
  if (!userId) throw new Error('userId is required');
  const { data, error } = await supabase.from('user_ratings').select('rating').eq('rated_user_id', userId);
  if (error) throw new Error(`DB Error: ${error.message}`);
  const ratings = data?.map((r) => r.rating) || [];
  const total = ratings.length;
  const avg = total > 0 ? ratings.reduce((a, b) => a + b, 0) / total : 0;
  return { average_rating: avg, total_ratings: total };
}

export async function fetchUserFeedbacks(userId: string) {
  if (!userId) throw new Error('userId is required');
  const { data, error } = await supabase
    .from('user_ratings')
    .select('reviewer_id, rating, feedback, created_at')
    .eq('rated_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`DB Error: ${error.message}`);
  return data;
}
