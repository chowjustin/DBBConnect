'use client';

import React, { useEffect, useState } from 'react';
import { StudentProfile, TutorSummary } from '../page';

export interface StudentReviewViewProps {
  DARK_PURPLE: string;
  MEDIUM_PURPLE: string;
  profile: StudentProfile | null;
  token: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  studentId: string;
  tutorId: string;
}

export default function StudentReviewView({
  DARK_PURPLE,
  MEDIUM_PURPLE,
  profile,
  token,
}: StudentReviewViewProps) {
  const [tutors, setTutors] = useState<TutorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reviews keyed by tutor profile ID (string)
  const [reviews, setReviews] = useState<Record<string, Review | null>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
  });

  // Load reviews for all tutors
  useEffect(() => {
    if (!profile?.tutors) return;

    const loadReviews = async () => {
      setLoading(true);
      try {
        const tutorsArr = profile.tutors!;
        setTutors(tutorsArr);

        const result: Record<string, Review | null> = {};
        for (const tutor of tutorsArr) {
          const res = await fetch(
            `http://localhost:3000/api/reviews/tutor/${tutor.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) continue;
          const data: Review[] = await res.json();

          // Find the review by this student
          const myReview = data.find((r) => r.studentId === profile.id) || null;
          result[tutor.id] = myReview;
        }

        setReviews(result);
      } catch {
        setError('Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [profile, token]);

  // Submit review (only if not exists)
  const submitReview = async (tutorId: string) => {
    if (reviews[tutorId]) return; // already reviewed
    try {
      const res = await fetch(`http://localhost:3000/api/reviews/${tutorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newReview),
      });

      if (!res.ok) throw new Error('Failed to submit review');

      const created = await res.json();
      setReviews((prev) => ({ ...prev, [tutorId]: created }));
      setNewReview({ rating: 5, comment: '' });
    } catch {
      alert('Error submitting review.');
    }
  };

  const updateReview = async (reviewId: string, tutorId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviews[tutorId]),
      });

      if (!res.ok) throw new Error();
      setEditingId(null);
    } catch {
      alert('Error updating review.');
    }
  };

  const deleteReview = async (reviewId: string, tutorId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();

      setReviews((prev) => ({ ...prev, [tutorId]: null }));
    } catch {
      alert('Error deleting review.');
    }
  };

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-semibold mb-6" style={{ color: DARK_PURPLE }}>
        My Tutor Reviews
      </h2>

      {tutors.length === 0 && <p>You have no tutors to review yet.</p>}

      {tutors.map((tutor) => {
        const review = reviews[tutor.id];

        return (
          <div key={tutor.id} className="mb-6 p-4 rounded-lg shadow bg-white">
            <h3 className="text-xl font-semibold">{tutor.user.name}</h3>

            {!review ? (
              // Show form if no review exists
              <div className="mt-4">
                <label className="block mb-2">Rating (1–5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview({ ...newReview, rating: Number(e.target.value) })
                  }
                  className="border p-2 w-20 rounded"
                />

                <textarea
                  placeholder="Comment..."
                  className="w-full mt-3 border p-2 rounded"
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                />

                <button
                  className="mt-3 px-4 py-2 rounded text-white"
                  style={{ background: MEDIUM_PURPLE }}
                  onClick={() => submitReview(tutor.id)}
                >
                  Submit Review
                </button>
              </div>
            ) : (
              // Show existing review
              <div className="mt-4">
                {editingId === review.id ? (
                  <>
                    <label className="block mb-2">Rating (1–5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="border p-2 w-20 rounded"
                      value={review.rating}
                      onChange={(e) =>
                        setReviews({
                          ...reviews,
                          [tutor.id]: { ...review, rating: Number(e.target.value) },
                        })
                      }
                    />

                    <textarea
                      className="w-full mt-3 border p-2 rounded"
                      value={review.comment}
                      onChange={(e) =>
                        setReviews({
                          ...reviews,
                          [tutor.id]: { ...review, comment: e.target.value },
                        })
                      }
                    />

                    <button
                      className="mt-3 mr-2 px-4 py-2 rounded text-white bg-green-600"
                      onClick={() => updateReview(review.id, tutor.id)}
                    >
                      Save
                    </button>
                    <button
                      className="mt-3 px-4 py-2 rounded bg-gray-400 text-white"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-medium mt-1">⭐ {review.rating}/5</p>
                    <p className="mt-1 text-gray-700">{review.comment}</p>

                    <button
                      className="mt-3 mr-2 px-4 py-2 rounded text-white bg-blue-600"
                      onClick={() => setEditingId(review.id)}
                    >
                      Edit
                    </button>

                    <button
                      className="mt-3 px-4 py-2 rounded text-white bg-red-600"
                      onClick={() => deleteReview(review.id, tutor.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
