"use client";

import { useState } from "react";
import { User, BookOpen, Wallet, Clock, CheckSquare } from "lucide-react";

export default function TutorRegisterPage() {
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const profileId = typeof window !== "undefined" ? localStorage.getItem("profileId") : null;

  const SUBJECT_OPTIONS = [
    "MATH",
    "ENGLISH",
    "SCIENCE",
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const SLOTS = ["09:00", "11:00", "13:00", "15:00", "17:00"];

  const toggleSlot = (day: string, slot: string) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || [];
      return {
        ...prev,
        [day]: daySlots.includes(slot)
          ? daySlots.filter((s) => s !== slot)
          : [...daySlots, slot],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/api/tutors/${profileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio,
          experience,
          hourlyRate: Number(hourlyRate),
          subjects,
          availability,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update tutor profile.");
      }

      window.location.href = "/dashboard/tutor";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10 font-[Poppins]"
      style={{ background: "linear-gradient(to bottom, #FFE6E6, #E1AFD1, #AD88C6)" }}
    >
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-10">
        <h1 className="text-4xl font-bold mb-8 text-[#3a2a4e]">Complete Tutor Profile</h1>

        {error && <p className="text-red-600 bg-red-50 p-3 mb-4 rounded-lg">{error}</p>}

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
              placeholder="Tell students about yourself..."
            />
          </div>

          {/* Experience
<div>
  <label className="font-semibold flex items-center gap-2 text-[#3a2a4e]">
    <CheckSquare /> Experience (years)
  </label>
 <input
  type="number"
  min={0}
  className="w-full p-3 rounded-xl border mt-2"
  value={experience}
  onChange={(e) => setExperience(Number(e.target.value))}
  placeholder="Years of teaching experience"
  required
/>
</div> */}


          {/* Hourly Rate */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-[#3a2a4e]">
              <Wallet /> Hourly Rate (Rp)
            </label>
            <input
              type="number"
              className="w-full p-3 rounded-xl border mt-2"
              value={hourlyRate}
              onChange={(e) =>
                setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
            />
          </div>

          {/* Subjects */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-[#3a2a4e]">
              <BookOpen /> Subjects
            </label>

            <div className="grid grid-cols-2 mt-2 gap-3">
              {SUBJECT_OPTIONS.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() =>
                    setSubjects((prev) =>
                      prev.includes(sub)
                        ? prev.filter((s) => s !== sub)
                        : [...prev, sub]
                    )
                  }
                  className={`p-3 rounded-xl border text-sm transition ${
                    subjects.includes(sub)
                      ? "bg-[#7469B6] text-white"
                      : "bg-white text-[#3a2a4e]"
                  }`}
                >
                  {formatSubject(sub)}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="font-semibold flex items-center gap-2 text-[#3a2a4e]">
              <Clock /> Availability
            </label>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {DAYS.map((day) => (
                <div key={day} className="border rounded-xl p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold capitalize text-[#3a2a4e]">
                    {day}
                  </h3>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {SLOTS.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => toggleSlot(day, slot)}
                        className={`p-2 text-sm rounded-lg border ${
                          availability[day]?.includes(slot)
                            ? "bg-[#7469B6] text-white"
                            : "bg-white"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
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
