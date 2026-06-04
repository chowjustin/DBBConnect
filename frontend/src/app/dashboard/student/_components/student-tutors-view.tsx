'use client';

import type { FC } from 'react';
import type { TutorSummary } from '../page';

type Props = {
  DARK_PURPLE: string;
  MEDIUM_PURPLE: string;
  tutors: TutorSummary[];
  loading: boolean;
  error: string | null;
};

export const StudentTutorsView: FC<Props> = ({
  DARK_PURPLE,
  MEDIUM_PURPLE,
  tutors,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <p
        className='p-10 text-xl font-medium'
        style={{ color: DARK_PURPLE }}
      >
        Loading your tutors...
      </p>
    );
  }

  if (error && !tutors.length) {
    return (
      <p className='p-10 text-xl text-red-500'>
        {error}
      </p>
    );
  }

  return (
    <div className='p-10'>
      <h2
        className='text-4xl font-bold mb-6'
        style={{ color: DARK_PURPLE }}
      >
        My Tutors 👩‍🏫
      </h2>

      {tutors.length === 0 ? (
        <p
          className='text-gray-500 text-lg p-6 border border-dashed rounded-xl'
          style={{ borderColor: MEDIUM_PURPLE }}
        >
          You do not have any tutors linked yet.
        </p>
      ) : (
        <div className='space-y-4'>
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className='p-5 rounded-xl shadow-md flex items-center justify-between bg-white border'
              style={{ borderLeft: `6px solid ${DARK_PURPLE}` }}
            >
              <div className='flex-1 min-w-0'>
                <p
                  className='font-bold text-xl'
                  style={{ color: DARK_PURPLE }}
                >
                  {tutor.user.name}
                </p>
                <p className='text-sm text-gray-600 truncate'>
                  {tutor.user.email} | Tel: {tutor.user.phoneNumber}
                </p>
                {tutor.subjects && tutor.subjects.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {tutor.subjects.map((subj) => (
                      <span
                        key={subj}
                        className='px-2 py-1 text-xs rounded-full bg-[#E1AFD1]/30 text-[#7469B6]'
                      >
                        {subj.toString().replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {typeof tutor.hourlyRate === 'number' && (
                <div className='ml-4 text-right'>
                  <p className='text-xs text-gray-500'>Hourly rate</p>
                  <p className='text-lg font-bold text-[#7469B6]'>
                    Rp {tutor.hourlyRate.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
