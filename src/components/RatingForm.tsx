// src/components/RatingForm.tsx

import React, { useState } from 'react';
import { submitRating } from '../services/ratingService';

interface RatingFormProps {
    // The ID of the user whose profile the visitor is currently viewing
    ratedUserId: string; 
    onRatingSubmitted: () => void; // Callback to refresh data after submission
}

const RatingForm: React.FC<RatingFormProps> = ({ ratedUserId, onRatingSubmitted }) => {
    const [rating, setRating] = useState<number>(5);
    const [feedback, setFeedback] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Check if the user is rating themselves (optional check, but recommended)
            // You'll need access to the current user's ID here (e.g., from auth context)
            // For simplicity, we omit that check but highly recommend adding it.

            await submitRating({
                ratedUserId,
                rating,
                feedback
            });
            
            alert('Rating submitted successfully!');
            setFeedback(''); // Clear form
            onRatingSubmitted(); // Trigger parent component refresh
        } catch (err) {
            setError('Failed to submit rating. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '20px' }}>
            <h3>Rate this User</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <label>
                Rating (1-5):
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    required
                    disabled={isLoading}
                />
            </label>
            
            <label>
                Feedback:
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Leave your feedback here..."
                    disabled={isLoading}
                />
            </label>
            
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Rating'}
            </button>
        </form>
    );
};

export default RatingForm;
