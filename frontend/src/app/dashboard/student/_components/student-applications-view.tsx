'use client';

import type { FC } from 'react';
import type { StudentApplication } from '../page';

type Props = {
  DARK_PURPLE: string;
  MEDIUM_PURPLE: string;
  applications: StudentApplication[];
  loading: boolean;
  error: string | null;
  onCancel: (id: string) => void;
};

export const StudentApplicationsView: FC<Props> = ({
  DARK_PURPLE,
  MEDIUM_PURPLE,
  applications,
  loading,
  error,
  onCancel,
}) => {
  if (loading) {
    return (
      <p
        className='p-10 text-xl font-medium'
        style={{ color: DARK_PURPLE }}
      >
        Loading applications...
      </p>
    );
  }

  if (error) {
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
        My Applications 📝
      </h2>

      {applications.length === 0 ? (
        <p
          className='text-gray-500 text-lg p-6 border border-dashed rounded-xl'
          style={{ borderColor: MEDIUM_PURPLE }}
        >
          You have not submitted any applications yet.
        </p>
      ) : (
        <div className='space-y-4'>
          {applications.map((app) => {
            let borderColor = DARK_PURPLE;
            let bgColor = 'bg-white';
            let statusText = app.status;

            if (app.status === 'ACCEPTED') {
              borderColor = '#4CAF50';
              bgColor = 'bg-green-50';
              statusText = 'ACCEPTED';
            } else if (app.status === 'REJECTED') {
              borderColor = '#F44336';
              bgColor = 'bg-red-50';
              statusText = 'REJECTED';
            } else if (app.status === 'PENDING') {
              borderColor = '#FFC107';
              bgColor = 'bg-yellow-50';
              statusText = 'PENDING';
            }

            const canCancel = app.status === 'PENDING';

            return (
              <div
                key={app.id}
                className={`p-5 rounded-xl shadow-md flex items-center justify-between border ${bgColor}`}
                style={{ borderLeft: `6px solid ${borderColor}` }}
              >
                <div className='flex-1 min-w-0'>
                  <p
                    className='font-bold text-xl'
                    style={{ color: DARK_PURPLE }}
                  >
                    {app.tutorName}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Requested on{' '}
                    {new Date(app.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className='flex items-center gap-3 ml-4'>
                  <span
                    className='px-3 py-1 rounded-full text-xs font-semibold text-white'
                    style={{ backgroundColor: borderColor }}
                  >
                    {statusText}
                  </span>
                  {canCancel && (
                    <button
                      onClick={() => onCancel(app.id)}
                      className='px-3 py-1 rounded-full text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition'
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
