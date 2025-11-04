// src/components/UserRatingDisplay.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { fetchAverageRating } from '../services/ratingService';

interface UserRatingDisplayProps {
  userId: string;
  key?: number;
}

interface RatingResult {
  average_rating: number;
  total_ratings: number;
}

const UserRatingDisplay: React.FC<UserRatingDisplayProps> = ({ userId }) => {
  const [average, setAverage] = useState<string>('0.0');
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRatings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const result: RatingResult = await fetchAverageRating(userId);

      const avg = result.average_rating || 0;
      const totalCount = result.total_ratings || 0;

      setAverage(avg.toFixed(1));
      setCount(totalCount);
    } catch (err) {
      console.error('Error loading ratings:', err);
      setError('Failed to load ratings data.');
      setAverage('0.0');
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  if (loading) {
    return <p>Loading ratings...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  if (count === 0) {
    return <p>No ratings yet. Be the first to rate!</p>;
  }

  return (
    <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
      <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>Overall Rating:</h3>
      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
        ⭐ {average} / 5
      </p>
      <p style={{ fontSize: '14px', color: '#666' }}>Based on {count} reviews.</p>
    </div>
  );
};

export default UserRatingDisplay;
