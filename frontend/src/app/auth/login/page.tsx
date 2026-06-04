
"use client";

import { useState } from "react";
import { login } from "@/lib/api/auth";
import * as React from "react";
import { User, Mail, Lock, Phone, ChevronDown } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("profileId", data.user.id);

      const role = data.user.role;
      window.location.href =
        role === "TUTOR"
          ? "/dashboard/tutor"
          : role === "STUDENT"
          ? "/dashboard/student"
          : "/dashboard";
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center p-6 
                  bg-gradient-to-b from-[#FFE6E6] via-[#E1AFD1] to-[#AD88C6]/50
                  font-[Poppins]">

    <div className="w-full max-w-5xl h-[640px] bg-white rounded-3xl shadow-xl 
                    overflow-hidden flex">

      {/* LEFT SECTION */}
      <div className="w-[55%] relative flex flex-col justify-center p-14 
                      text-white bg-gradient-to-br from-[#AD88C6] to-[#7469B6]">

        {/* soft decorative shapes */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg viewBox="0 0 600 600" className="w-full h-full">
            <circle cx="500" cy="80" r="40" className="fill-[#E1AFD1]" />
            <path
              d="M0,0 C200,0 260,120 260,240 C260,360 200,480 0,600 L0,0 Z"
              className="fill-[#7469B6]/60"
              transform="scale(1.3)"
            />
            <path
              d="M120 340 C180 420 260 450 330 500"
              stroke="#FFE6E6"
              strokeWidth="3"
              fill="none"
            />
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="text-lg font-semibold opacity-90">TutorConnect</h1>

          <h2 className="mt-3 text-5xl font-extrabold drop-shadow-md">
            Welcome back!
          </h2>

          <p className="mt-4 text-xl leading-relaxed opacity-95 max-w-sm">
            Sign in to continue your journey of learning and teaching.
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-[45%] bg-white p-14 flex flex-col justify-center">

        <h2 className="text-4xl font-bold text-[#3a2a4e] mb-8">Sign In</h2>

        {error && (
          <p className="text-red-600 mb-4 bg-red-50 p-3 rounded-lg border border-red-200 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <input
            type="email"
            placeholder="Username or email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 text-lg rounded-xl border border-[#AD88C6]/50
                       bg-white text-[#6c4fa5] placeholder-[#AD88C6]
                       focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 
                       outline-none transition"
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pr-14 text-lg rounded-xl border border-[#AD88C6]/50
                         bg-white text-[#6c4fa5] placeholder-[#AD88C6]
                         focus:border-[#7469B6] focus:ring-2 focus:ring-[#7469B6]/30 
                         outline-none transition"
              required
            />

            <span
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer
                         text-2xl text-[#4b3f67] hover:text-[#7469B6] transition"
            >
              {showPass ? "🙈" : "👁"}
            </span>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between text-sm text-[#4a3c6a]">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded text-[#7469B6] border-gray-300 accent-[#7469B6]"
              />
              <span>Remember me</span>
            </label>

            <a href="#" className="font-medium text-[#7469B6] hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full p-4 text-xl font-semibold rounded-xl 
                       bg-[#7469B6] text-white shadow-lg shadow-[#7469B6]/40
                       transition hover:bg-[#5e4aa4]"
          >
            Sign In
          </button>

        </form>

        {/* Register */}
        <p className="mt-10 text-center text-md text-[#4a3c6a]">
          New here?
          <a
            href="/auth/register"
            className="ml-1 text-[#5c4da0] font-bold hover:underline"
          >
            Create an account
          </a>
        </p>

      </div>
    </div>
  </div>
);

}
