'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/10'}
        />
      ))}
    </div>
  );
}

export default function ReviewsList({ reviews }) {
  const [rows, setRows] = useState(reviews);

  const toggleFeatured = async (id, featured) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, featured } : r)));
    await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured }),
    });
  };

  return (
    <div className="space-y-3">
      {rows.map((review) => (
        <div
          key={review.id}
          className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">{review.name}</p>
                <Stars rating={review.rating} />
              </div>
              <p className="text-xs text-gray-500">
                {review.email} · {formatDate(review.createdAt)}
              </p>
            </div>

            <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-gray-400">
              <input
                type="checkbox"
                checked={review.featured}
                onChange={(e) => toggleFeatured(review.id, e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
              />
              Featured
            </label>
          </div>
          <p className="mt-3 text-sm text-gray-300">{review.review}</p>
        </div>
      ))}

      {rows.length === 0 && (
        <div className="rounded-2xl bg-white/[0.04] p-10 text-center text-sm text-gray-500 ring-1 ring-white/10">
          No reviews yet.
        </div>
      )}
    </div>
  );
}
