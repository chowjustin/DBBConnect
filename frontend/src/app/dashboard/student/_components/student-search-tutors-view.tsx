// 'use client';

// import type { FC } from 'react';
// import type { TutorSummary, StudentApplication } from '../page';

// type Props = {
//   DARK_PURPLE: string;

//   // NEW unified searchQuery
//   searchQuery: {
//     name?: string;
//     subject?: string;
//     minRate?: number;
//     maxRate?: number;
//   };
//   setSearchQuery: (v: any) => void;

//   searchLoading: boolean;
//   searchError: string | null;
//   searchResults: TutorSummary[];
//   applications: StudentApplication[];
//   onSearch: () => void;
//   onApply: (tutorId: string) => void;
//   onCancel: (applicationId: string) => void;
// };

// export const StudentSearchTutorsView: FC<Props> = ({
//   DARK_PURPLE,
//   searchQuery,
//   setSearchQuery,
//   searchLoading,
//   searchError,
//   searchResults,
//   applications,
//   onSearch,
//   onApply,
//   onCancel,
// }) => {
//   const getStatusForTutor = (tutorId: string) => {
//     return applications.find((a) => a.tutorId === tutorId) || null;
//   };

//   return (
//     <div className="p-10">
//       <h2 className="text-4xl font-bold mb-6" style={{ color: DARK_PURPLE }}>
//         Search Tutors 🔍
//       </h2>

//       {/* Search Inputs */}
//       <div className="flex flex-col md:flex-row gap-3 mb-6">

//         {/* Name */}
//         <input
//           type="text"
//           placeholder="Tutor name..."
//           value={searchQuery.name ?? ''}
//           onChange={(e) =>
//             setSearchQuery((prev: any) => ({
//               ...prev,
//               name: e.target.value,
//             }))
//           }
//           className="flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
//         />

//         {/* Subject */}
//         <input
//           type="text"
//           placeholder="Subject (e.g., MATH)"
//           value={searchQuery.subject ?? ''}
//           onChange={(e) =>
//             setSearchQuery((prev: any) => ({
//               ...prev,
//               subject: e.target.value,
//             }))
//           }
//           className="flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
//         />

//         {/* Min Rate */}
//         <input
//           type="number"
//           placeholder="Min Rate"
//           value={searchQuery.minRate ?? ''}
//           onChange={(e) =>
//             setSearchQuery((prev: any) => ({
//               ...prev,
//               minRate: e.target.value ? Number(e.target.value) : undefined,
//             }))
//           }
//           className="flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
//         />

//         {/* Max Rate */}
//         <input
//           type="number"
//           placeholder="Max Rate"
//           value={searchQuery.maxRate ?? ''}
//           onChange={(e) =>
//             setSearchQuery((prev: any) => ({
//               ...prev,
//               maxRate: e.target.value ? Number(e.target.value) : undefined,
//             }))
//           }
//           className="flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
//         />

//         <button
//           onClick={onSearch}
//           className="px-6 py-3 rounded-xl bg-[#7469B6] text-white font-semibold hover:bg-[#5e4aa4] transition"
//         >
//           Search
//         </button>
//       </div>

//       {searchLoading && (
//         <p className="text-xl font-medium" style={{ color: DARK_PURPLE }}>
//           Searching...
//         </p>
//       )}
//       {searchError && <p className="text-red-500 mb-4">{searchError}</p>}
//       {!searchLoading && !searchError && searchResults.length === 0 && (
//         <p className="text-gray-500">
//           No tutors found. Try another filter.
//         </p>
//       )}

//       {/* RESULTS */}
//       <div className="space-y-4">
//         {searchResults.map((tutor) => {
//           const app = getStatusForTutor(tutor.id);
//           const status = app?.status;

//           let statusLabel: string | null = null;
//           let statusColor = '';

//           if (status === 'PENDING') {
//             statusLabel = 'Application Pending';
//             statusColor = '#FFC107';
//           } else if (status === 'ACCEPTED') {
//             statusLabel = 'You are accepted';
//             statusColor = '#4CAF50';
//           } else if (status === 'REJECTED') {
//             statusLabel = 'Application Rejected';
//             statusColor = '#F44336';
//           }

//           return (
//             <div
//               key={tutor.id}
//               className="p-5 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between bg-white border"
//               style={{ borderLeft: `6px solid ${DARK_PURPLE}` }}
//             >
//               <div className="flex-1 min-w-0 mb-3 md:mb-0">
//                 <p className="font-bold text-xl" style={{ color: DARK_PURPLE }}>
//                   {tutor.user.name}
//                 </p>
//                 <p className="text-sm text-gray-600 truncate">
//                   {tutor.user.email} | Tel: {tutor.user.phoneNumber}
//                 </p>

//                 {tutor.subjects?.length ? (
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {tutor.subjects?.map((subj) => (
//                   <span
//                     key={subj}
//                     className="px-2 py-1 text-xs rounded-full bg-[#E1AFD1]/30 text-[#7469B6]"
//                   >
//                     {subj.toString().replace('_', ' ')}
//                   </span>
//                 ))}
//               </div>
//             ) : null}
//               </div>

//               <div className="flex flex-col items-end gap-2">
//                 {typeof tutor.hourlyRate === 'number' && (
//                   <div className="text-right">
//                     <p className="text-xs text-gray-500">Hourly rate</p>
//                     <p className="text-lg font-bold text-[#7469B6]">
//                       Rp {tutor.hourlyRate.toLocaleString()}
//                     </p>
//                   </div>
//                 )}

//                 {statusLabel && (
//                   <span
//                     className="px-3 py-1 rounded-full text-xs font-semibold text-white"
//                     style={{ backgroundColor: statusColor }}
//                   >
//                     {statusLabel}
//                   </span>
//                 )}

//                 <div className="flex gap-2">
//                   {(!status || status === 'REJECTED') && (
//                     <button
//                       onClick={() => onApply(tutor.id)}
//                       className="px-4 py-2 text-sm font-semibold rounded-full text-white bg-[#7469B6] hover:bg-[#5e4aa4] transition"
//                     >
//                       Apply
//                     </button>
//                   )}

//                   {status === 'PENDING' && app && (
//                     <button
//                       onClick={() => onCancel(app.id)}
//                       className="px-4 py-2 text-sm font-semibold rounded-full text-white bg-red-600 hover:bg-red-700 transition"
//                     >
//                       Cancel
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

'use client';

import { useEffect, useState } from 'react';
import type { FC } from 'react';
import type { TutorSummary, StudentApplication } from '../page';

type Review = {
  id: string;
  rating: number;
  comment: string;
  studentId: string;
  studentName: string;
  tutorId: string;
};

type Props = {
  DARK_PURPLE: string;

  searchQuery: {
    name?: string;
    subject?: string;
    minRate?: number;
    maxRate?: number;
  };
  setSearchQuery: (v: any) => void;

  searchLoading: boolean;
  searchError: string | null;
  searchResults: TutorSummary[];
  applications: StudentApplication[];
  onSearch: () => void;
  onApply: (tutorId: string) => void;
  onCancel: (applicationId: string) => void;
};

export const StudentSearchTutorsView: FC<Props> = ({
  DARK_PURPLE,
  searchQuery,
  setSearchQuery,
  searchLoading,
  searchError,
  searchResults,
  applications,
  onSearch,
  onApply,
  onCancel,
}) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const getStatusForTutor = (tutorId: string) => {
    return applications.find((a) => a.tutorId === tutorId) || null;
  };

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [openTutorId, setOpenTutorId] = useState<string | null>(null);

  // Fetch average ratings
  useEffect(() => {
    if (!token) return;

    const fetchRatings = async () => {
      try {
        const newRatings: Record<string, number> = {};
        await Promise.all(
          searchResults.map(async (tutor) => {
            const res = await fetch(
              `http://localhost:3000/api/reviews/tutor/${tutor.user.email}/average`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) throw new Error('Failed to fetch rating');
            const data = await res.json();
            newRatings[tutor.id] = data.averageRating || 0;
          })
        );
        setRatings(newRatings);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRatings();
  }, [searchResults, token]);

  // Fetch reviews for a tutor
  const fetchTutorReviews = async (tutorId: string) => {
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/reviews/tutor/${tutorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data: Review[] = await res.json();
      setReviews((prev) => ({ ...prev, [tutorId]: data }));
      setOpenTutorId(tutorId);
    } catch {
      alert('Failed to load reviews.');
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-4xl font-bold mb-6" style={{ color: DARK_PURPLE }}>
        Search Tutors 🔍
      </h2>

      {/* Search Inputs */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Tutor name..."
          value={searchQuery.name ?? ''}
          onChange={(e) =>
            setSearchQuery((prev: any) => ({ ...prev, name: e.target.value }))
          }
          className="flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
        />
        <input
          type="text"
          placeholder="Subject (e.g., MATH)"
          value={searchQuery.subject ?? ''}
          onChange={(e) =>
            setSearchQuery((prev: any) => ({ ...prev, subject: e.target.value }))
          }
          className="flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
        />
        <input
          type="number"
          placeholder="Min Rate"
          value={searchQuery.minRate ?? ''}
          onChange={(e) =>
            setSearchQuery((prev: any) => ({
              ...prev,
              minRate: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
          className="flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
        />
        <input
          type="number"
          placeholder="Max Rate"
          value={searchQuery.maxRate ?? ''}
          onChange={(e) =>
            setSearchQuery((prev: any) => ({
              ...prev,
              maxRate: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
          className="flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
        />
        <button
          onClick={onSearch}
          className="px-6 py-3 rounded-xl bg-[#7469B6] text-white font-semibold hover:bg-[#5e4aa4] transition"
        >
          Search
        </button>
      </div>

      {searchLoading && (
        <p className="text-xl font-medium" style={{ color: DARK_PURPLE }}>
          Searching...
        </p>
      )}
      {searchError && <p className="text-red-500 mb-4">{searchError}</p>}
      {!searchLoading && !searchError && searchResults.length === 0 && (
        <p className="text-gray-500">No tutors found. Try another filter.</p>
      )}

      {/* RESULTS */}
      <div className="space-y-4">
        {searchResults.map((tutor) => {
          const app = getStatusForTutor(tutor.id);
          const status = app?.status;

          let statusLabel: string | null = null;
          let statusColor = '';

          if (status === 'PENDING') {
            statusLabel = 'Application Pending';
            statusColor = '#FFC107';
          } else if (status === 'ACCEPTED') {
            statusLabel = 'You are accepted';
            statusColor = '#4CAF50';
          } else if (status === 'REJECTED') {
            statusLabel = 'Application Rejected';
            statusColor = '#F44336';
          }

          const isOpen = openTutorId === tutor.id;
          const tutorRating = ratings[tutor.id] || 0;
          const tutorReviews = reviews[tutor.id] || [];

          return (
            <div
              key={tutor.id}
              className="p-5 rounded-xl shadow-md flex flex-col bg-white border cursor-pointer"
              style={{ borderLeft: `6px solid ${DARK_PURPLE}` }}
              onClick={() =>
                isOpen ? setOpenTutorId(null) : fetchTutorReviews(tutor.id)
              }
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 mb-3 md:mb-0">
                  <p className="font-bold text-xl" style={{ color: DARK_PURPLE }}>
                    {tutor.user.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {tutor.user.email} | Tel: {tutor.user.phoneNumber}
                  </p>

                  {tutor.subjects?.length ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tutor.subjects.map((subj) => (
                        <span
                          key={subj}
                          className="px-2 py-1 text-xs rounded-full bg-[#E1AFD1]/30 text-[#7469B6]"
                        >
                          {subj.toString().replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-semibold">
                      {tutorRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {typeof tutor.hourlyRate === 'number' && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Hourly rate</p>
                      <p className="text-lg font-bold text-[#7469B6]">
                        Rp {tutor.hourlyRate.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {statusLabel && (
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: statusColor }}
                    >
                      {statusLabel}
                    </span>
                  )}

                  <div className="flex gap-2">
                    {(!status || status === 'REJECTED') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApply(tutor.id);
                        }}
                        className="px-4 py-2 text-sm font-semibold rounded-full text-white bg-[#7469B6] hover:bg-[#5e4aa4] transition"
                      >
                        Apply
                      </button>
                    )}

                    {status === 'PENDING' && app && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancel(app.id);
                        }}
                        className="px-4 py-2 text-sm font-semibold rounded-full text-white bg-red-600 hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Dropdown Reviews */}
              {isOpen && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  {tutorReviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet.</p>
                  ) : (
                    tutorReviews.map((r) => (
                      <div key={r.id} className="p-3 rounded border bg-gray-50">
                        <p className="font-semibold">{r.studentName}</p>
                        <p>⭐ {r.rating} / 5</p>
                        <p>{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
