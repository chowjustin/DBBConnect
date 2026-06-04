'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import type { Application } from '../page';

type Props = {
  DARK_PURPLE: string;
  MEDIUM_PURPLE: string;
  applications: Application[];
  appsLoading: boolean;
  appsError: string | null;
  onAccept: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
};

export const ApplicationsView: React.FC<Props> = ({
  DARK_PURPLE,
  MEDIUM_PURPLE,
  applications,
  appsLoading,
  appsError,
  onAccept,
  onReject,
}) => {
  if (appsLoading)
    return (
      <p
        className='p-10 text-xl font-medium'
        style={{ color: DARK_PURPLE }}
      >
        Loading Applications...
      </p>
    );
  if (appsError)
    return (
      <p className='text-red-500 p-10 text-xl'>
        Error: {appsError}
      </p>
    );

  return (
    <div className='p-10'>
      <h2
        className='text-4xl font-bold mb-6'
        style={{ color: DARK_PURPLE }}
      >
        Student Applications 📝
      </h2>
      <p className='text-lg text-gray-700 mb-6'>
        Review new student requests and decide whether to accept them as your
        students.
      </p>

      {applications.length === 0 ? (
        <p
          className='text-gray-500 text-lg p-6 border border-dashed rounded-xl'
          style={{ borderColor: MEDIUM_PURPLE }}
        >
          No pending applications at this time.
        </p>
      ) : (
        <div className='space-y-4'>
          {applications.map((app) => {
            let borderColor = DARK_PURPLE;
            let bgColor = 'bg-white';
            let statusLabel = '';

            if (app.applicationStatus === 'ACCEPTED') {
              borderColor = '#4CAF50';
              bgColor = 'bg-green-50';
              statusLabel = 'Accepted';
            } else if (app.applicationStatus === 'REJECTED') {
              borderColor = '#F44336';
              bgColor = 'bg-red-50';
              statusLabel = 'Rejected';
            }

            const isPending = app.applicationStatus === 'PENDING';

            return (
              <div
                key={app.applicationId}
                className={`p-5 rounded-xl shadow-md flex items-center justify-between ${bgColor} border`}
                style={{ borderLeft: `6px solid ${borderColor}` }}
              >
                <div className='flex-1 min-w-0'>
                  <p
                    className='font-bold text-xl'
                    style={{ color: DARK_PURPLE }}
                  >
                    {app.name}
                  </p>
                  <p className='text-sm text-gray-600 truncate'>
                    {app.email} | Tel: {app.phoneNumber}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Requested:{' '}
                    {new Date(app.requestedAt).toLocaleDateString()}
                  </p>
                  {statusLabel && (
                    <p
                      className={`mt-1 text-sm font-semibold ${
                        app.applicationStatus === 'ACCEPTED'
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}
                    >
                      {statusLabel}
                    </p>
                  )}
                </div>

                <div className='flex gap-3 ml-4'>
                  <button
                    onClick={() => onAccept(app.applicationId)}
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-full text-white transition-colors ${
                      isPending
                        ? 'bg-[#4CAF50] hover:bg-[#45a049]'
                        : 'bg-green-400 cursor-not-allowed'
                    }`}
                    disabled={!isPending}
                  >
                    <CheckCircle className='w-4 h-4' />{' '}
                    {app.applicationStatus === 'ACCEPTED'
                      ? 'Accepted'
                      : 'Accept'}
                  </button>
                  <button
                    onClick={() => onReject(app.applicationId)}
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-full text-white transition-colors ${
                      isPending
                        ? 'bg-[#F44336] hover:bg-[#d32f2f]'
                        : 'bg-red-400 cursor-not-allowed'
                    }`}
                    disabled={!isPending}
                  >
                    <XCircle className='w-4 h-4' />{' '}
                    {app.applicationStatus === 'REJECTED'
                      ? 'Rejected'
                      : 'Reject'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
