// 'use client';

// import { useEffect, useState } from 'react';
// import type { Dispatch, SetStateAction } from 'react';
// import type { TutorProfile } from '../page';

// type SearchQuery = {
//   name?: string;
//   subject?: string;
//   minRate?: number;
//   maxRate?: number;
// };

// type Props = {
//   DARK_PURPLE: string;
//   searchQuery: SearchQuery;
//   setSearchQuery: Dispatch<SetStateAction<SearchQuery>>;
//   searchLoading: boolean;
//   searchError: string | null;
//   searchResults: TutorProfile[];
//   onSearch: () => void;
// };

// export const SearchTutorView: React.FC<Props> = ({
//   DARK_PURPLE,
//   searchQuery,
//   setSearchQuery,
//   searchLoading,
//   searchError,
//   searchResults,
//   onSearch,
// }) => {
//   const token =
//     typeof window !== 'undefined' ? localStorage.getItem('token') : null;

//   const [ratings, setRatings] = useState<Record<string, number>>({});
//   const [ratingsError, setRatingsError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!token) return;

//     const fetchRatings = async () => {
//       try {
//         const newRatings: Record<string, number> = {};

//         await Promise.all(
//           searchResults.map(async (tutor) => {
//             const res = await fetch(
//               `http://localhost:3000/api/reviews/tutor/${tutor.user.email}/average`,
//               {
//                 headers: { Authorization: `Bearer ${token}` },
//               }
//             );
//             if (!res.ok) {
//               const err = await res.json();
//               throw new Error(err.message || 'Failed to fetch rating');
//             }
//             const data = await res.json();
//             newRatings[tutor.id] = data.averageRating || 0;
//           })
//         );

//         setRatings(newRatings);
//       } catch (err: any) {
//         setRatingsError(err.message);
//       }
//     };

//     fetchRatings();
//   }, [searchResults, token]);

//   return (
//     <div className='p-10'>
//       <h2
//         className='text-4xl font-bold mb-6'
//         style={{ color: DARK_PURPLE }}
//       >
//         Search Tutors 🔍
//       </h2>

//       <div className='flex flex-col md:flex-row gap-3 mb-6'>
//         <input
//           type='text'
//           placeholder='Tutor name...'
//           value={searchQuery.name || ''}
//           onChange={(e) =>
//             setSearchQuery((prev) => ({ ...prev, name: e.target.value }))
//           }
//           className='flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition'
//         />

//         <input
//           type='text'
//           placeholder='Subject (e.g., MATH)...'
//           value={searchQuery.subject || ''}
//           onChange={(e) =>
//             setSearchQuery((prev) => ({ ...prev, subject: e.target.value }))
//           }
//           className='flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition'
//         />

//         <input
//           type='number'
//           placeholder='Min Rate'
//           value={searchQuery.minRate ?? ''}
//           onChange={(e) =>
//             setSearchQuery((prev) => ({
//               ...prev,
//               minRate: e.target.value ? Number(e.target.value) : undefined,
//             }))
//           }
//           className='flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition'
//         />

//         <input
//           type='number'
//           placeholder='Max Rate'
//           value={searchQuery.maxRate ?? ''}
//           onChange={(e) =>
//             setSearchQuery((prev) => ({
//               ...prev,
//               maxRate: e.target.value ? Number(e.target.value) : undefined,
//             }))
//           }
//           className='flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition'
//         />

//         <button
//           onClick={onSearch}
//           className='px-6 py-3 rounded-xl bg-[#7469B6] text-white font-semibold hover:bg-[#5e4aa4] transition'
//         >
//           Search
//         </button>
//       </div>

//       {searchLoading && (
//         <p
//           className='text-xl font-medium'
//           style={{ color: DARK_PURPLE }}
//         >
//           Searching...
//         </p>
//       )}
//       {searchError && <p className='text-red-500'>{searchError}</p>}
//       {ratingsError && <p className='text-red-500'>{ratingsError}</p>}
//       {!searchLoading &&
//         !searchError &&
//         searchResults.length === 0 && (
//           <p className='text-gray-500'>No tutors found.</p>
//         )}

//       <div className='space-y-4'>
//         {searchResults.map((tutor) => (
//           <div
//             key={tutor.id}
//             className='p-5 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between bg-white border'
//             style={{ borderLeft: `6px solid ${DARK_PURPLE}` }}
//           >
//             <div className='flex-1 min-w-0'>
//               <p
//                 className='font-bold text-xl'
//                 style={{ color: DARK_PURPLE }}
//               >
//                 {tutor.user.name}
//               </p>
//               <p className='text-sm text-gray-600 truncate'>
//                 {tutor.user.email} | Tel: {tutor.user.phoneNumber}
//               </p>
//               <p className='text-xs text-gray-500 mt-1'>
//                 Role: {tutor.user.role}
//               </p>
//               {tutor.subjects && tutor.subjects.length > 0 && (
//                 <div className='flex flex-wrap gap-2 mt-2'>
//                   {tutor.subjects.map((subj) => (
//                     <span
//                       key={subj}
//                       className='px-2 py-1 text-xs rounded-full bg-[#E1AFD1]/30 text-[#7469B6]'
//                     >
//                       {subj.replace('_', ' ')}
//                     </span>
//                   ))}
//                 </div>
//               )}

//               {/* Average Rating */}
//               <div className='flex items-center gap-1 mt-2'>
//                 <span className='text-yellow-500'>⭐</span>
//                 <span className='text-sm font-semibold'>
//                   {ratings[tutor.id] && ratings[tutor.id] > 0
//                     ? ratings[tutor.id].toFixed(1)
//                     : '-'}{' '}
//                   / 5.0
//                 </span>
//               </div>
//             </div>
//             {tutor.hourlyRate !== undefined && (
//               <div className='mt-3 md:mt-0 md:ml-6 text-right'>
//                 <p className='font-semibold text-md'>Rate:</p>
//                 <p className='text-lg font-bold text-[#7469B6]'>
//                   Rp {tutor.hourlyRate.toLocaleString()}
//                 </p>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
'use client';

import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { TutorProfile } from '../page';

type SearchQuery = {
  name?: string;
  subject?: string;
  minRate?: number;
  maxRate?: number;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  studentId: string;
  tutorId: string;
  studentName: string;
};

type Props = {
  DARK_PURPLE: string;
  searchQuery: SearchQuery;
  setSearchQuery: Dispatch<SetStateAction<SearchQuery>>;
  searchLoading: boolean;
  searchError: string | null;
  searchResults: TutorProfile[];
  onSearch: () => void;
};

export const SearchTutorView: React.FC<Props> = ({
  DARK_PURPLE,
  searchQuery,
  setSearchQuery,
  searchLoading,
  searchError,
  searchResults,
  onSearch,
}) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingsError, setRatingsError] = useState<string | null>(null);

  const [openTutorId, setOpenTutorId] = useState<string | null>(null);
  const [tutorReviews, setTutorReviews] = useState<Record<string, Review[]>>({});

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
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.message || 'Failed to fetch rating');
            }
            const data = await res.json();
            newRatings[tutor.id] = data.averageRating || 0;
          })
        );
        setRatings(newRatings);
      } catch (err: any) {
        setRatingsError(err.message);
      }
    };

    fetchRatings();
  }, [searchResults, token]);

  // Fetch reviews for a specific tutor
  const fetchTutorReviews = async (tutorId: string, tutorEmail: string) => {
    if (!token) return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/reviews/tutor/${tutorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setTutorReviews((prev) => ({ ...prev, [tutorId]: data }));
      setOpenTutorId(tutorId);
    } catch {
      alert('Error fetching reviews for this tutor.');
    }
  };

  return (
    <div className="p-10">
      <h2
        className="text-4xl font-bold mb-6"
        style={{ color: DARK_PURPLE }}
      >
        Search Tutors 🔍
      </h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Tutor name..."
          value={searchQuery.name || ''}
          onChange={(e) =>
            setSearchQuery((prev) => ({ ...prev, name: e.target.value }))
          }
          className="flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
        />
        <input
          type="text"
          placeholder="Subject (e.g., MATH)..."
          value={searchQuery.subject || ''}
          onChange={(e) =>
            setSearchQuery((prev) => ({ ...prev, subject: e.target.value }))
          }
          className="flex-1 p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
        />
        <input
          type="number"
          placeholder="Min Rate"
          value={searchQuery.minRate ?? ''}
          onChange={(e) =>
            setSearchQuery((prev) => ({
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
            setSearchQuery((prev) => ({
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
      {searchError && <p className="text-red-500">{searchError}</p>}
      {ratingsError && <p className="text-red-500">{ratingsError}</p>}
      {!searchLoading && !searchError && searchResults.length === 0 && (
        <p className="text-gray-500">No tutors found.</p>
      )}

      {/* Tutor List */}
      <div className="space-y-4">
        {searchResults.map((tutor) => {
          const isOpen = openTutorId === tutor.id;
          const tutorRating = ratings[tutor.id] || 0;
          const reviews = tutorReviews[tutor.id] || [];

          return (
            <div
              key={tutor.id}
              className="p-5 rounded-xl shadow-md flex flex-col bg-white border cursor-pointer"
              style={{ borderLeft: `6px solid ${DARK_PURPLE}` }}
              onClick={() =>
                isOpen
                  ? setOpenTutorId(null)
                  : fetchTutorReviews(tutor.id, tutor.user.email)
              }
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-xl"
                    style={{ color: DARK_PURPLE }}
                  >
                    {tutor.user.name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {tutor.user.email} | Tel: {tutor.user.phoneNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Role: {tutor.user.role}
                  </p>
                  {tutor.subjects && tutor.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tutor.subjects.map((subj) => (
                        <span
                          key={subj}
                          className="px-2 py-1 text-xs rounded-full bg-[#E1AFD1]/30 text-[#7469B6]"
                        >
                          {subj.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-semibold">
                      {tutorRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
                {tutor.hourlyRate !== undefined && (
                  <div className="mt-3 md:mt-0 md:ml-6 text-right">
                    <p className="font-semibold text-md">Rate:</p>
                    <p className="text-lg font-bold text-[#7469B6]">
                      Rp {tutor.hourlyRate.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Show Reviews if open */}
              {isOpen && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet.</p>
                  ) : (
                    reviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded border bg-gray-50"
                      >
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
