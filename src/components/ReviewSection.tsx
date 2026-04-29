"use client";

// BUG #6: XSS vulnerability — user-supplied review text rendered via
// dangerouslySetInnerHTML without sanitization.
import { useState } from "react";
import { Review } from "@/types";

interface Props {
  reviews: Review[];
  productId: string;
}

export default function ReviewSection({ reviews, productId }: Props) {
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);

  console.log("[ReviewSection] productId:", productId, "reviews:", localReviews.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ReviewSection] submitting review:", newComment);
    const review: Review = {
      id: "r-" + Date.now(),
      userId: "guest",
      userName: "Anonymous",
      rating: newRating,
      comment: newComment, // raw user input, not sanitized
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLocalReviews((prev) => [review, ...prev]);
    setNewComment("");
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Customer Reviews ({localReviews.length})
      </h3>

      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Write a Review</h4>
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setNewRating(star)}
              className={`w-8 h-8 ${star <= newRating ? "text-amber-400" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          Submit Review
        </button>
      </form>

      <div className="space-y-4">
        {localReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{review.userName}</span>
              <span className="text-xs text-gray-500">{review.createdAt}</span>
            </div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= review.rating ? "text-amber-400" : "text-gray-200"}>
                  ★
                </span>
              ))}
            </div>
            {/* BUG #6: dangerouslySetInnerHTML with unsanitized user input — XSS */}
            <p
              className="text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: review.comment }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
