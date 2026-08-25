'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { api } from '@/lib/api';

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
          className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  );
}

export default function ReviewsList({ reviews }) {
  const [rows, setRows] = useState(reviews);
  const [error, setError] = useState('');

  const setFeatured = (id, featured) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, featured } : r)));

  const toggleFeatured = async (id, featured) => {
    setError('');
    // Optimistic — checkbox turant response de, network ka intezaar na kare.
    setFeatured(id, featured);
    try {
      await api(`/reviews/${id}/featured`, { method: 'PATCH', body: { featured } });
    } catch {
      // Save fail hua toh checkbox wapas usi state me, warna UI jhooth bolta
      // rahega ki review featured hai jabki website par kuch nahi badla.
      setFeatured(id, !featured);
      setError('Could not save that change. Try again.');
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {rows.map((review) => (
        <div
          key={review.id}
          className="panel panel-hover p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900">{review.name}</p>
                <Stars rating={review.rating} />
              </div>
              <p className="text-xs text-slate-400">
                {review.email} · {formatDate(review.createdAt)}
              </p>
            </div>

            <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
              <input
                type="checkbox"
                checked={review.featured}
                onChange={(e) => toggleFeatured(review.id, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Featured
            </label>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.review}</p>
        </div>
      ))}

      {rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#e6ecf6] bg-white p-10 text-center text-sm text-slate-400">
          No reviews yet.
        </div>
      )}
    </div>
  );
}
