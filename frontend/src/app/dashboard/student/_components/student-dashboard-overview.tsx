'use client';

import type { FC } from 'react';
import { Users, BookOpen, FileText } from 'lucide-react';

type Props = {
  DARK_PURPLE: string;
  LIGHT_PURPLE: string;
  MEDIUM_PURPLE: string;
  tutorsCount: number;
  pendingApplications: number;
  materialsCount: number;
};

export const StudentDashboardOverview: FC<Props> = ({
  DARK_PURPLE,
  LIGHT_PURPLE,
  MEDIUM_PURPLE,
  tutorsCount,
  pendingApplications,
  materialsCount,
}) => {
  return (
    <div className='p-10'>
      <h2
        className='text-4xl font-extrabold mb-5'
        style={{ color: DARK_PURPLE }}
      >
        Dashboard Overview 🎓
      </h2>
      <p className='text-lg text-gray-700'>
        See your tutors, track application status, and open learning materials
        shared with you.
      </p>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-10'>
        <div
          className='p-6 rounded-xl shadow-lg transition hover:shadow-xl'
          style={{ backgroundColor: LIGHT_PURPLE, color: DARK_PURPLE }}
        >
          <div className='text-3xl font-bold'>{tutorsCount}</div>
          <div className='text-md opacity-90'>Active Tutors</div>
          <Users className='w-8 h-8 mt-3 opacity-70' />
        </div>

        <div
          className='p-6 rounded-xl shadow-lg transition hover:shadow-xl'
          style={{ backgroundColor: MEDIUM_PURPLE, color: '#FFE6E6' }}
        >
          <div className='text-3xl font-bold'>{pendingApplications}</div>
          <div className='text-md opacity-90'>Pending Applications</div>
          <BookOpen className='w-8 h-8 mt-3 opacity-70' />
        </div>

        <div
          className='p-6 rounded-xl shadow-lg bg-white'
          style={{ color: DARK_PURPLE, border: `1px solid ${MEDIUM_PURPLE}` }}
        >
          <div className='text-3xl font-bold'>{materialsCount}</div>
          <div className='text-md opacity-90'>Available Materials</div>
          <FileText className='w-8 h-8 mt-3 opacity-80' />
        </div>
      </div>
    </div>
  );
};
