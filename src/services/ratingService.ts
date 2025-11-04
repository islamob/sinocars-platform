// src/lib/ratingService.ts

import { supabase } from './supabase'; // Adjust path as needed

interface RatingPayload {
  ratedUserId: string;
  rating: number;
  feedback: string;
}

export async function submitRating({ ratedUserId, rating, feedback }: RatingPayload) {
  // ✅ Always await getUser()
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    throw new Error('User must be logged in to submit a rating.');
  }

  const raterId = userData.user.id;

  // ✅ Match your actual table column names
  const newRating = {
    reviewer_id: raterId,       // note: your table uses reviewer_id, not rater_user_id
    rated_user_id: ratedUserId,
    rating,
    feedback,
  };

  const { data, error } = await supabase
    .from('user_ratings')
    .insert([newRating]); // always insert as an array

  if (error) {
    console.error('Supabase rating submission error:', error.message);
    throw new Error(`DB Error: ${error.message}`);
  }

  return data;
}
