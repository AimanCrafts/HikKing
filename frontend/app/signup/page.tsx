"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, saveToken, saveUser } from "../lib/api";

function strengthScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"traveler" | "guide">("traveler");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = strengthScore(password);
  const strengthColors = [
    "bg-gray-200",
    "bg-red-400",
    "bg-amber-400",
    "bg-lime-500",
    "bg-teal-600",
  ];
  const strengthColor = strengthColors[strength] ?? strengthColors[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await registerUser({
        name,
        email,
        phone: phone || undefined,
        password,
        password_confirmation: confirmPassword,
        role,
      });

      saveToken(token);
      saveUser(user);

      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "guide") {
        router.push("/guide-dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-12 relative overflow-hidden">
      {/* Decorative watermark */}
      <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center">
        <span className="text-[220px] font-extrabold text-teal-900/5 whitespace-nowrap">
          HikKing
        </span>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <span className="text-4xl mb-1">⛰️</span>
          <span className="text-xl font-extrabold text-teal-600">HikKing</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Create your account
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Join HikKing and start exploring
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I want to join as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("traveler")}
                className={`border rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  role === "traveler"
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                🧳 Traveler
              </button>
              <button
                type="button"
                onClick={() => setRole("guide")}
                className={`border rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  role === "guide"
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                🧭 Guide
              </button>
            </div>
            {role === "guide" && (
              <p className="text-xs text-gray-400 mt-1">
                Your guide profile will need admin verification before it
                appears publicly.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Create a password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="flex gap-1 mt-2">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < strength ? strengthColor : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">Password strength</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-medium py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Non-functional Google button */}
        <button
          type="button"
          disabled
          title="Coming soon"
          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
        >
          <span>G</span>
          Continue with Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-600 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
