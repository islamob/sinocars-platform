// src/components/UserRatingDisplay.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { fetchAverageRating } from '../services/ratingService';

interface UserRatingDisplayProps {
    userId: string;
}

const UserRatingDisplay: React.FC<UserRatingDisplayProps> = ({ userId }) => {
    const [average, setAverage] = useState<number>(0);
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const loadRatings = useCallback(async () => {
        setLoading(true);
        const { average_rating, total_ratings } = await fetchAverageRating(userId);
        
        // Convert to a clean number with one decimal place
        setAverage(parseFloat(average_rating.toFixed(1)));
        setCount(total_ratings);
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        loadRatings();
    }, [loadRatings]);

    if (loading) {
        return <p>Loading ratings...</p>;
    }

    if (count === 0) {
        return <p>No ratings yet. Be the first to rate!</p>;
    }

    return (
        <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: 0 }}>Overall Rating:</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'gold' }}>
                ⭐ {average} / 5 
            </p>
            <p>Based on {count} reviews.</p>
            
            {/* You can place the RatingForm here or elsewhere on the profile */}
            {/* <RatingForm ratedUserId={userId} onRatingSubmitted={loadRatings} /> */}
        </div>
    );
};

export default UserRatingDisplay;
