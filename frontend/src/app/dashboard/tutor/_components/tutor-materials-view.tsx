'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { Student } from '../page';

type Props = {
  DARK_PURPLE: string;
  MEDIUM_PURPLE: string;
  students: Student[];
  studentsLoading: boolean;
  studentsError: string | null;
  materials: any[];
  materialTitle: string;
  setMaterialTitle: (v: string) => void;
  materialDescription: string;
  setMaterialDescription: (v: string) => void;
  materialFile: File | null;
  setMaterialFile: (file: File | null) => void;
  selectedStudents: string[];
  setSelectedStudents: Dispatch<SetStateAction<string[]>>;
  uploading: boolean;
  uploadError: string | null;
  uploadSuccess: string | null;
  onUpload: (e: React.FormEvent) => void;
};

export const MaterialsView: React.FC<Props> = ({
  DARK_PURPLE,
  MEDIUM_PURPLE,
  students,
  studentsLoading,
  studentsError,
  materials,
  materialTitle,
  setMaterialTitle,
  materialDescription,
  setMaterialDescription,
  materialFile,
  setMaterialFile,
  selectedStudents,
  setSelectedStudents,
  uploading,
  uploadError,
  uploadSuccess,
  onUpload,
}) => {
  return (
    <div className='p-10'>
      <h2
        className='text-4xl font-bold mb-6'
        style={{ color: DARK_PURPLE }}
      >
        Upload Learning Materials 📚
      </h2>

      {studentsError && (
        <p className='text-red-600 mb-4'>{studentsError}</p>
      )}
      {uploadError && (
        <p className='text-red-600 mb-4'>{uploadError}</p>
      )}
      {uploadSuccess && (
        <p className='text-green-600 mb-4'>{uploadSuccess}</p>
      )}

      <form
        onSubmit={onUpload}
        className='flex flex-col gap-4 max-w-3xl mb-8'
      >
        <input
          type='text'
          placeholder='Material Title'
          value={materialTitle}
          onChange={(e) => setMaterialTitle(e.target.value)}
          className='p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition'
          required
        />

        <textarea
          placeholder='Description (optional)'
          value={materialDescription}
          onChange={(e) => setMaterialDescription(e.target.value)}
          className='p-3 rounded-xl border border-[#AD88C6]/50 focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition resize-none h-24'
        />

        <div>
          <p
            className='font-semibold text-lg mb-2'
            style={{ color: DARK_PURPLE }}
          >
            Select Students Who Can Access This Material
          </p>
          {studentsLoading ? (
            <p className='text-gray-500'>Loading students...</p>
          ) : (
            <div className='flex flex-col gap-2 max-h-48 overflow-y-auto border border-[#AD88C6]/50 p-3 rounded-xl'>
              {students.map((stu) => (
                <label
                  key={stu.id}
                  className='flex items-center gap-2'
                >
                  <input
                    type='checkbox'
                    value={stu.id}
                    checked={selectedStudents.includes(stu.id)}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedStudents((prev) =>
                        prev.includes(id)
                          ? prev.filter((s) => s !== id)
                          : [...prev, id],
                      );
                    }}
                  />
                  <span>
                    {stu.name} ({stu.email})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label
            className='px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition cursor-pointer hover:bg-[#5e4aa4]'
            style={{ backgroundColor: DARK_PURPLE }}
          >
            {materialFile ? materialFile.name : 'Browse File'}
            <input
              type='file'
              accept='.pdf,.doc,.docx,.ppt,.pptx,.jpg,.png'
              onChange={(e) =>
                setMaterialFile(
                  e.target.files ? e.target.files[0] : null,
                )
              }
              className='hidden'
            />
          </label>
        </div>

        <button
          type='submit'
          disabled={uploading}
          className='px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition hover:bg-[#5e4aa4]'
          style={{ backgroundColor: DARK_PURPLE }}
        >
          {uploading ? 'Uploading...' : 'Upload Material'}
        </button>
      </form>

      <h3
        className='text-2xl font-semibold mb-4'
        style={{ color: DARK_PURPLE }}
      >
        Uploaded Materials
      </h3>

      {materials.length === 0 ? (
        <p className='text-gray-500'>No materials uploaded yet.</p>
      ) : (
        <div className='space-y-4'>
          {materials.map((mat: any) => {
            // const accessList =
            //   mat.allowedStudents?.map(
            //     (stu: any) => stu.student.user.email,
            //   ) || [];
            // let accessDisplay = '';
            const accessList = mat.allowedStudents?.map((stu: any) => stu.student.user.email) || [];
            const accessDisplay = accessList.length === 0 ? "Public" : accessList.join(", ");

            // if (!accessList.length) {
            //   accessDisplay = 'Public';
            // } else if (students.length > 0 && accessList.length === students.length) {
            //   accessDisplay = 'Public';
            // } else {
            //   accessDisplay = accessList.join(', ');
            // }

            return (
              <div
                key={mat.id}
                className='p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border'
                style={{ borderLeft: `6px solid ${DARK_PURPLE}` }}
              >
                <div className='flex-1 min-w-0 mb-2 sm:mb-0'>
                  <p className='font-bold text-lg'>{mat.title}</p>
                  <p className='text-sm text-gray-600 truncate'>
                    {mat.description}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Uploaded:{' '}
                    {new Date(mat.createdAt).toLocaleDateString()}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Access: {accessDisplay}
                  </p>
                </div>

                <a
                  href={`http://localhost:3000/uploads/materials/${mat.fileUrl}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-4 py-2 text-sm font-semibold rounded-full text-white bg-[#7469B6] hover:bg-[#5e4aa4] transition'
                >
                  View
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
