"use client";

import { BookOpen, Clock, Image as ImageIcon, User as UserIcon } from "lucide-react";
import { SubjectList, TutorProfile, daysOfWeek, timeSlots, type Subject, User } from "../page";
import { FC, useEffect, useState } from "react";

type Props = {
  DARK_PURPLE: string;
  MEDIUM_PURPLE: string;
  user: User | null;
  profile: TutorProfile | null;
  profileLoading: boolean;
  profileError: string;
  profileSuccess: string;
  bio: string;
  setBio: (value: string) => void;
  hourlyRate: number;
  setHourlyRate: (value: number) => void;
  subjects: Subject[];
  onSubjectChange: (subject: Subject) => void;
  availability: string[];
  onAvailabilityChange: (key: string) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export const ProfileView: FC<Props> = ({
  DARK_PURPLE,
  MEDIUM_PURPLE,
  user,
  profile,
  profileLoading,
  profileError,
  profileSuccess,
  bio,
  setBio,
  hourlyRate,
  setHourlyRate,
  subjects,
  onSubjectChange,
  availability,
  onAvailabilityChange,
  saving,
  onSubmit,
}) => {
  // Profile picture
  const [preview, setPreview] = useState<string | null>(profile?.profileImage || null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(profile?.profileImage || null);
  }, [profile]);

  const uploadPicture = async () => {
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append("profile-picture", file);

    const res = await fetch("http://localhost:3000/api/upload/profile-picture", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: form,
    });

    setUploading(false);

    if (!res.ok) {
      alert("Failed to upload image.");
      return;
    }

    const data = await res.json();
    if (data.profileImage) setPreview(data.profileImage);
  };

  if (profileLoading)
    return (
      <p className="p-10 text-xl font-medium" style={{ color: DARK_PURPLE }}>
        Loading Profile Data...
      </p>
    );

  if (profileError && !profile)
    return <p className="text-red-500 p-10 text-xl">{profileError}</p>;

  return (
    <div className="p-10">
      <h2 className="text-4xl font-bold mb-6" style={{ color: DARK_PURPLE }}>
        My Profile 👤
      </h2>

      {/* Profile details */}
      {user && (
        <div className="mb-6 p-4 rounded-xl bg-white shadow-sm border border-[#AD88C6]/40 flex items-center gap-4">
          <div>
            <p className="font-semibold" style={{ color: DARK_PURPLE }}>
              {user.name}
            </p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">{user.phoneNumber}</p>
          </div>

          {/* Image */}
          <div className="ml-auto flex flex-col items-center">
            <img
              src={preview || "/default-avatar.png"}
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
                {uploading ? "Uploading…" : "Upload"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Errors */}
      {profileError && (
        <p className="text-red-600 font-semibold mb-4 bg-red-100 p-3 rounded-lg text-sm border border-red-200">
          {profileError}
        </p>
      )}

      {profileSuccess && (
        <p className="text-green-600 font-semibold mb-4 bg-green-100 p-3 rounded-lg text-sm border border-green-200">
          {profileSuccess}
        </p>
      )}

      {/* Main form */}
      <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-4xl">
        {/* Bio */}
        <div className="relative">
          <UserIcon
            className="absolute left-4 top-4 w-5 h-5"
            style={{ color: MEDIUM_PURPLE }}
          />
          <textarea
            placeholder="Enter your bio..."
            className="w-full p-4 pl-12 h-36 rounded-xl border border-[#AD88C6]/50 bg-white focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 shadow-sm"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />
        </div>

        {/* Hourly Rate */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="font-semibold mb-2 block" style={{ color: DARK_PURPLE }}>
              Hourly Rate (IDR)
            </label>

            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 font-bold"
                style={{ color: MEDIUM_PURPLE }}
              >
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="1000"
                className="w-full p-3 pl-12 rounded-xl border border-[#AD88C6]/50"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                required
              />
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="p-4 border border-[#AD88C6]/50 rounded-xl bg-white shadow-sm">
          <p className="font-semibold flex items-center gap-2" style={{ color: DARK_PURPLE }}>
            <BookOpen className="w-5 h-5" />
            Subjects You Teach:
          </p>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {SubjectList.map((subject) => {
              const isSelected = subjects.includes(subject);
              return (
                <label
                  key={subject}
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition border ${
                    isSelected
                      ? "bg-[#E1AFD1] border-[#AD88C6]"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSubjectChange(subject)}
                    className="w-4 h-4"
                    style={{ accentColor: DARK_PURPLE }}
                  />
                  <span className="capitalize text-xs">
                    {subject.replace("_", " ")}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Availability — MATCH REGISTER PAGE */}
<div className="p-4 border border-[#AD88C6]/50 rounded-xl bg-white shadow-sm">
  <p className="font-semibold flex items-center gap-2" style={{ color: DARK_PURPLE }}>
    <Clock className="w-5 h-5" />
    Your Availability:
  </p>

  {daysOfWeek.map((day) => {
    const dayLower = day.toLowerCase();
    const dayUpper = day.toUpperCase();

    return (
      <div key={day} className="border rounded-xl p-4 bg-gray-50 mt-4">
        <h3 className="text-lg font-semibold capitalize text-[#3a2a4e]">
          {dayLower}
        </h3>

        <div className="mt-2 grid grid-cols-3 gap-2">
          {timeSlots.map((slot) => {
            // slot.label = "09:00"
            const formatted = slot.label.replace(":", "."); // for storage key
            const key = `${dayUpper}_${formatted}`;
            const isActive = availability.includes(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => onAvailabilityChange(key)}
                className={`p-2 text-sm rounded-lg border ${
                  isActive ? "bg-[#7469B6] text-white" : "bg-white"
                }`}
              >
                {slot.label} {/* DISPLAY EXACTLY LIKE REGISTER PAGE */}
              </button>
            );
          })}
        </div>
      </div>
    );
  })}
</div>


        <button
          type="submit"
          disabled={saving}
          className="w-full p-4 text-xl font-semibold rounded-xl bg-gradient-to-r from-[#AD88C6] to-[#7469B6] text-white hover:opacity-90"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};
