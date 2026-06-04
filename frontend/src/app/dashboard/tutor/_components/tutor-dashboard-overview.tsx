'use client';

import { useEffect, useState } from 'react';
import type { Application } from '../page';
import { Star } from '../page';

type Props = {
  DARK_PURPLE: string;
  LIGHT_PURPLE: string;
  MEDIUM_PURPLE: string;
  applications: Application[];
  activeStudentCount: number | string;
  dashboardFetchError: string | null;
};

export const DashboardOverview: React.FC<Props> = ({
  DARK_PURPLE,
  LIGHT_PURPLE,
  MEDIUM_PURPLE,
  applications,
  activeStudentCount,
  dashboardFetchError,
}) => {
  const pendingCount = applications.filter(
    (a) => a.applicationStatus === 'PENDING'
  ).length;

  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const tutorEmail =
    typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  // ----------------------------
  // FETCH AVERAGE RATING HERE 🔥
  // ----------------------------
  useEffect(() => {
    if (!tutorEmail || !token) return;

    console.log('Fetching average rating for tutor:', tutorEmail);
    const fetchAvgRating = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/reviews/tutor/${tutorEmail}/average`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to fetch rating');
        }

        const data = await res.json();
        setAverageRating(data.averageRating || 0);
      } catch (err: any) {
        setRatingError(err.message);
      }
    };

    fetchAvgRating();
  }, [tutorEmail, token]);

  return (
    <div className="p-10">
      <h3
        className="text-4xl font-extrabold mb-5"
        style={{ color: DARK_PURPLE }}
      >
        Dashboard Overview 📊
      </h3>
      <p className="text-lg text-gray-700">
        This is your command center. Check your application status, manage your
        students, and upload new learning materials.
      </p>

      {dashboardFetchError && (
        <p className="text-red-500 mt-4 text-sm">
          Error loading dashboard data: {dashboardFetchError}
        </p>
      )}

      {ratingError && (
        <p className="text-red-500 mt-4 text-sm">
          Error loading rating: {ratingError}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
        {/* Pending Applications */}
        <div
          className="p-6 rounded-xl shadow-lg transition hover:shadow-xl"
          style={{ backgroundColor: LIGHT_PURPLE, color: DARK_PURPLE }}
        >
          <div className="text-3xl font-bold">{pendingCount}</div>
          <div className="text-md opacity-90">Pending Applications</div>
        </div>

        {/* Active Students */}
        <div
          className="p-6 rounded-xl shadow-lg transition hover:shadow-xl"
          style={{ backgroundColor: MEDIUM_PURPLE, color: LIGHT_PURPLE }}
        >
          <div className="text-3xl font-bold">
            {activeStudentCount === '-' ? '...' : activeStudentCount}
          </div>
          <div className="text-md opacity-90">Active Students</div>
        </div>

        {/* Average Rating */}
        <div
          className="p-6 rounded-xl shadow-lg bg-white"
          style={{ color: DARK_PURPLE, border: `1px solid ${MEDIUM_PURPLE}` }}
        >
          <div className="text-3xl font-bold">
            {averageRating === 0 ? '-' : averageRating.toFixed(1)} / 5.0
          </div>
          <div className="text-md opacity-90">Average Rating</div>
          <Star className="w-8 h-8 mt-3 text-yellow-500" />
        </div>
      </div>
    </div>
  );
};
