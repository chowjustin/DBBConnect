'use client';

import type { Student } from '../page';

type Props = {
  DARK_PURPLE: string;
  MEDIUM_PURPLE: string;
  students: Student[];
  studentsLoading: boolean;
  studentsError: string | null;
  onRemoveStudent: (id: string) => void;
};

export const StudentsView: React.FC<Props> = ({
  DARK_PURPLE,
  MEDIUM_PURPLE,
  students,
  studentsLoading,
  studentsError,
  onRemoveStudent,
}) => {
  if (studentsLoading)
    return (
      <p
        className='p-10 text-xl font-medium'
        style={{ color: DARK_PURPLE }}
      >
        Loading Students...
      </p>
    );
  if (studentsError)
    return (
      <p className='text-red-500 p-10 text-xl'>
        {studentsError}
      </p>
    );

  return (
    <div className='p-10'>
      <h2
        className='text-4xl font-bold mb-6'
        style={{ color: DARK_PURPLE }}
      >
        My Students 👨‍🎓
      </h2>
      {students.length === 0 ? (
        <p
          className='text-gray-500 text-lg p-6 border border-dashed rounded-xl'
          style={{ borderColor: MEDIUM_PURPLE }}
        >
          You currently have no students.
        </p>
      ) : (
        <div className='space-y-4'>
          {students.map((student) => (
            <div
              key={student.id}
              className='p-5 rounded-xl shadow-md flex items-center justify-between bg-white border'
              style={{ borderLeft: `6px solid ${DARK_PURPLE}` }}
            >
              <div className='flex-1 min-w-0'>
                <p
                  className='font-bold text-xl'
                  style={{ color: DARK_PURPLE }}
                >
                  {student.name}
                </p>
                <p className='text-sm text-gray-600 truncate'>
                  {student.email} | Tel: {student.phoneNumber}
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  Role: {student.role}
                </p>
              </div>
              <button
                onClick={() => onRemoveStudent(student.id)}
                className='px-4 py-2 text-sm font-semibold rounded-full text-white bg-red-600 hover:bg-red-700 transition'
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
