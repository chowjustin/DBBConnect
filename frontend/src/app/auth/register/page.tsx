"use client";

import { useState } from "react";
import { register } from "@/lib/api/auth"; 
import { User, Mail, Lock, Phone, ChevronDown } from "lucide-react"; // Importing necessary icons

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TUTOR">("STUDENT");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // ====== SEND POST REQUEST TO BACKEND REGISTER ENDPOINT ======
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        phoneNumber,
        role,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || "Registration failed.");
    }

    const data = await res.json();
    console.log("Register response:", data);

    // ===== STORE TOKENS =====
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("role", role);
    localStorage.setItem("email", email);

    // ===== GET PROFILE ID =====
    const profileId =
      data.user?.profileId ||
      data.user?.profile?.id;

    if (!profileId) {
      throw new Error("No profileId returned from server.");
    }

    localStorage.setItem("profileId", profileId);

    // ===== REDIRECT TO ROLE-SPECIFIC PAGE =====
    window.location.href =
      role === "TUTOR"
        ? `/auth/register/tutor`
        : `/auth/register/student`;
  } catch (err: any) {
    console.error("Register error:", err);
    setError(
      err?.message ||
        err?.response?.data?.message ||
        "Registration failed."
    );
  } finally {
    setLoading(false);
  }
};



  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 font-[Poppins]"
      style={{
        // Replicating the background gradient from the login example
        background: `linear-gradient(to bottom, #FFE6E6, #E1AFD1, rgba(173, 136, 198, 0.5))`
      }}
    >
      <div 
        className="w-full max-w-5xl h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden flex" // Increased height slightly for extra fields
      >
        {/* --- LEFT SECTION: Welcome Panel (Dark Gradient) --- */}
        <div 
          className="w-[40%] relative flex flex-col justify-center p-14 text-white"
          style={{ 
            // Replicating the gradient from the login example
            background: `linear-gradient(to bottom right, #AD88C6, #7469B6)`
          }}
        >
          {/* Decorative shapes and SVG (Adjusted for scale) */}
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <svg viewBox="0 0 600 600" className="w-full h-full">
              {/* Abstract shape */}
              <path d="M0,0 C200,0 260,120 260,240 C260,360 200,480 0,600 L0,0 Z"
                style={{ fill: 'rgba(116, 105, 182, 0.6)' }} transform="scale(1.5)"
              />
              {/* Wave line */}
              <path d="M120 340 C180 420 260 450 330 500" stroke="#FFE6E6" strokeWidth="3" fill="none" />
              {/* Circle */}
              <circle cx="500" cy="80" r="30" style={{ fill: '#E1AFD1' }} />
            </svg>
          </div>

          <div className="relative z-10">
            <h1 className="text-lg font-semibold opacity-90">TutorConnect</h1>
            <h2 className="mt-3 text-5xl font-extrabold drop-shadow-md">
              Join the Network!
            </h2>
            <p className="mt-4 text-xl leading-relaxed opacity-95 max-w-sm">
              Create your account to start learning or teaching instantly.
            </p>
          </div>
        </div>

        {/* --- RIGHT SECTION: Registration Form (Light Background) --- */}
        <div className="w-[60%] bg-white p-14 flex flex-col justify-center">

          <h2 className="text-4xl font-bold mb-6" style={{ color: "#3a2a4e" }}>Register</h2>

          {/* Error Display */}
          {error && (
            <p className="text-red-600 mb-4 bg-red-50 p-3 rounded-lg border border-red-200 text-sm">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AD88C6]" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 pl-12 text-md rounded-xl border border-[#AD88C6]/50 bg-white placeholder-[#AD88C6] focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 outline-none transition"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AD88C6]" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 pl-12 text-md rounded-xl border border-[#AD88C6]/50 bg-white placeholder-[#AD88C6] focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 outline-none transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AD88C6]" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 pl-12 pr-14 text-md rounded-xl border border-[#AD88C6]/50 bg-white placeholder-[#AD88C6] focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 outline-none transition"
              />
              <span
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-xl text-[#4b3f67] hover:text-[#7469B6] transition"
              >
                {showPass ? "🙈" : "👁"}
              </span>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AD88C6]" />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full p-3 pl-12 text-md rounded-xl border border-[#AD88C6]/50 bg-white placeholder-[#AD88C6] focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 outline-none transition"
              />
            </div>

            {/* Role Selection */}
            <div className="relative">
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#AD88C6] pointer-events-none" />
              <select
                className="w-full p-3 pl-4 text-md rounded-xl appearance-none border border-[#AD88C6]/50 bg-white text-[#6c4fa5] focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 outline-none transition"
                value={role}
                onChange={(e) => setRole(e.target.value as "STUDENT" | "TUTOR")}
              >
                <option value="STUDENT">Register as a Student</option>
                <option value="TUTOR">Register as a Tutor</option>
              </select>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 text-lg font-semibold rounded-xl mt-6 
                         bg-[#7469B6] text-white shadow-lg shadow-[#7469B6]/40
                         transition hover:bg-[#5e4aa4] disabled:opacity-70"
            >
              {loading ? "Registering..." : "Register"}
            </button>

          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-[#4a3c6a]">
            Already have an account?
            <a
              href="/auth/login"
              className="ml-1 text-[#5c4da0] font-bold hover:underline"
            >
              Login
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}