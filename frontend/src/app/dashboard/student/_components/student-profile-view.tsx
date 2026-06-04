'use client';

import React, { FC, useEffect, useState } from 'react';
import type { StudentProfile, UserBase } from '../page';
import { User, BookOpen, Image as ImageIcon } from 'lucide-react';

type Props = {
  DARK_PURPLE: string;
  MEDIUM_PURPLE: string;
  profile: StudentProfile | null;
  user: UserBase | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  success: string | null;
  onSave: (data: { bio?: string; school?: string; interestsText?: string }) => void;
};

export const StudentProfileView: FC<Props> = ({
  DARK_PURPLE,
  MEDIUM_PURPLE,
  profile,
  user,
  loading,
  error,
  saving,
  success,
  onSave,
}) => {
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [school, setSchool] = useState(profile?.school ?? '');
  const [interests, setInterests] = useState((profile?.interests || []).join(', '));

  // --- new: local preview + file ---
  const [preview, setPreview] = useState<string | null>(profile?.profileImage || null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setBio(profile?.bio ?? '');
    setSchool(profile?.school ?? '');
    setInterests((profile?.interests || []).join(', '));
    setPreview(profile?.profileImage || null);
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ bio, school, interestsText: interests });
  };

  // -------------------------------
  // UPLOAD PROFILE PICTURE (NEW)
  // -------------------------------
  const uploadPicture = async () => {
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append('profile-picture', file);

    const res = await fetch('http://localhost:3000/api/upload/profile-picture', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: form,
    });

    setUploading(false);

    if (!res.ok) {
      alert('Failed to upload image.');
      return;
    }

    const data = await res.json();

    // update preview immediately
    if (data.profileImage) {
      setPreview(data.profileImage);
    }
  };

  if (loading) {
    return (
      <p className="p-10 text-xl font-medium" style={{ color: DARK_PURPLE }}>
        Loading Profile...
      </p>
    );
  }

  if (error && !profile) {
    return (
      <p className="p-10 text-xl text-red-500">{error}</p>
    );
  }

  return (
    <div className="p-10">
      <h2 className="text-4xl font-bold mb-6" style={{ color: DARK_PURPLE }}>
        My Profile 👤
      </h2>

      {/* -------- PROFILE CARD -------- */}
      {user && (
        <div className="mb-6 p-4 rounded-xl bg-white shadow-sm border border-[#AD88C6]/40 flex items-center gap-4">
          <div>
            <p className="font-semibold" style={{ color: DARK_PURPLE }}>
              {user.name}
            </p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">{user.phoneNumber}</p>
          </div>

          {/* -------- PROFILE IMAGE PREVIEW -------- */}
          <div className="ml-auto flex flex-col items-center">
            <img
              src={preview || '/default-avatar.png'}
              className="w-24 h-24 object-cover rounded-full border"
              alt="Profile"
            />

            <label className="mt-3 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setPreview(URL.createObjectURL(f));
                  }
                }}
              />
              <div className="px-3 py-1 rounded-md text-white bg-[#7469B6] hover:bg-[#5e4aa4] text-sm flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                Choose File
              </div>
            </label>

            {file && (
              <button
                onClick={uploadPicture}
                disabled={uploading}
                className="mt-2 px-4 py-1 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* -------- STATUS -------- */}
      {error && (
        <p className="text-red-600 font-semibold mb-4 bg-red-100 p-3 rounded-lg text-sm border border-red-200">
          {error}
        </p>
      )}

      {success && (
        <p className="text-green-600 font-semibold mb-4 bg-green-100 p-3 rounded-lg text-sm border border-green-200">
          {success}
        </p>
      )}

      {/* -------- FORM -------- */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
        <div className="relative">
          <User
            className="absolute left-4 top-4 w-5 h-5"
            style={{ color: MEDIUM_PURPLE }}
          />
          <textarea
            placeholder="Tell tutors about yourself..."
            className="w-full p-4 pl-12 text-md rounded-xl border border-[#AD88C6]/50 bg-white placeholder-[#AD88C6] focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 resize-none h-28 shadow-sm transition"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold" style={{ color: DARK_PURPLE }}>
            School
          </label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#AD88C6]/50 bg-white placeholder-[#AD88C6] focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
            placeholder="Your school or university"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold flex items-center gap-2" style={{ color: DARK_PURPLE }}>
            <BookOpen className="w-5 h-5" /> Interests / Subjects
          </label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#AD88C6]/50 bg-white placeholder-[#AD88C6] focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm transition"
            placeholder="e.g. calculus, physics, essay writing"
          />
          <p className="mt-1 text-xs text-gray-500">Use commas to separate multiple interests.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full p-4 text-xl font-semibold rounded-xl mt-3 text-white shadow-lg transition hover:bg-[#5e4aa4] disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            backgroundImage: `linear-gradient(to right, ${MEDIUM_PURPLE}, ${DARK_PURPLE})`,
          }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};
