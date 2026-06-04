'use client';

import type { FC } from 'react';
import type { StudentMaterial } from '../page';

type Props = {
  DARK_PURPLE: string;
  materials: StudentMaterial[];
  loading: boolean;
  error: string | null;
};

export const StudentMaterialsView: FC<Props> = ({
  DARK_PURPLE,
  materials,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <p className="p-10 text-xl font-medium" style={{ color: DARK_PURPLE }}>
        Loading materials...
      </p>
    );
  }

  if (error) {
    return <p className="p-10 text-xl text-red-500">{error}</p>;
  }

  return (
    <div className="p-10">
      <h2
        className="text-4xl font-bold mb-6"
        style={{ color: DARK_PURPLE }}
      >
        Learning Materials 📚
      </h2>

      {materials.length === 0 ? (
        <p className="text-gray-500">
          Your tutors have not shared any materials yet.
        </p>
      ) : (
        <div className="space-y-4">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border"
              style={{ borderLeft: `6px solid ${DARK_PURPLE}` }}
            >
              <div className="flex-1 min-w-0 mb-2 sm:mb-0">
                <p className="font-bold text-lg">{mat.title}</p>

                {mat.description && (
                  <p className="text-sm text-gray-600 truncate">
                    {mat.description}
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  Uploaded {new Date(mat.createdAt).toLocaleDateString()}
                  {mat.tutorName && (
                    <span className="font-medium"> by {mat.tutorName}</span>
                  )}
                </p>
              </div>

              <a
                href={`http://localhost:3000/uploads/materials/${mat.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-semibold rounded-full text-white bg-[#7469B6] hover:bg-[#5e4aa4] transition"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
