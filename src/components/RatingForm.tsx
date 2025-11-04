import React, { useState } from 'react';
import { submitRating } from '../services/ratingService';

interface RatingFormProps {
  listingId: string;
  ratedUserId: string;
  onRatingSubmitted?: () => void;
}

const RatingForm: React.FC<RatingFormProps> = ({ listingId, ratedUserId, onRatingSubmitted }) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      setMessage('⚠️ يرجى اختيار عدد النجوم قبل الإرسال');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await submitRating({
        rated_user_id: ratedUserId,
        listing_id: listingId,
        rating,
        feedback,
      });
      setMessage('✅ تم إرسال تقييمك بنجاح!');
      setRating(0);
      setFeedback('');
      if (onRatingSubmitted) onRatingSubmitted();
    } catch (error) {
      console.error('Error submitting rating:', error);
      setMessage('❌ حدث خطأ أثناء الإرسال، حاول مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-5 mt-4 border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
        تقييم البائع ⭐
      </h3>

      {/* النجوم */}
      <div className="flex justify-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            className={`text-3xl transition-transform ${
              star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {/* ملاحظات المستخدم */}
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="أضف ملاحظاتك (اختياري)"
        className="w-full h-24 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
      />

      {/* زر الإرسال */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full mt-4 py-2 text-white font-medium rounded-xl transition ${
          loading
            ? 'bg-yellow-300 cursor-not-allowed'
            : 'bg-yellow-500 hover:bg-yellow-600'
        }`}
      >
        {loading ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
      </button>

      {/* رسالة التأكيد */}
      {message && (
        <p className="text-center text-sm text-gray-600 mt-3">{message}</p>
      )}
    </form>
  );
};

export default RatingForm;
