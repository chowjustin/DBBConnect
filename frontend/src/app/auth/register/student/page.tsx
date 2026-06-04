"use client";

import { useState } from "react";
import { User, School, Star } from "lucide-react";

export default function StudentRegisterPage() {
  const [bio, setBio] = useState("");
  const [school, setSchool] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const profileId =
    typeof window !== "undefined" ? localStorage.getItem("profileId") : null;

  // SAME ENUM AS TUTOR — SCIENCE REMOVED
  const SUBJECT_OPTIONS = [
    "MATH",
    "ENGLISH",
    "PHYSICS",
    "CHEMISTRY",
    "COMPUTER_SCIENCE",
    "ECONOMICS",
    "ACCOUNTING",
  ];

  // Convert "COMPUTER_SCIENCE" → "Computer Science"
  const formatSubject = (sub: string) =>
    sub
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:3000/api/students/${profileId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bio,
            school,
            interests,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update student profile.");
      }

      window.location.href = "/dashboard/student";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10 font-[Poppins]"
      style={{
        background: "linear-gradient(to bottom, #FFE6E6, #E1AFD1, #AD88C6)",
      }}
    >
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-10">
        <h1 className="text-4xl font-bold mb-8 text-[#3a2a4e]">
          Complete Student Profile
        </h1>

        {error && (
          <p className="text-red-600 bg-red-50 p-3 mb-4 rounded-lg">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bio */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-[#3a2a4e]">
              <User /> Bio
            </label>
            <textarea
              className="w-full p-3 rounded-xl border mt-2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell tutors about yourself..."
            />
          </div>

          {/* School */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-[#3a2a4e]">
              <School /> School
            </label>
            <input
              className="w-full p-3 rounded-xl border mt-2"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Your school name"
              required
            />
          </div>

          {/* Interests */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-[#3a2a4e]">
              <Star /> Interests
            </label>

            <div className="grid grid-cols-2 mt-2 gap-3">
              {SUBJECT_OPTIONS.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() =>
                    setInterests((prev) =>
                      prev.includes(sub)
                        ? prev.filter((s) => s !== sub)
                        : [...prev, sub]
                    )
                  }
                  className={`p-3 rounded-xl border text-sm transition ${
                    interests.includes(sub)
                      ? "bg-[#7469B6] text-white"
                      : "bg-white text-[#3a2a4e]"
                  }`}
                >
                  {formatSubject(sub)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-3 text-lg font-semibold rounded-xl bg-[#7469B6] text-white hover:bg-[#5e4aa4]"
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
