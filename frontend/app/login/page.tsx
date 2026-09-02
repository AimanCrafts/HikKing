"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, saveToken, saveUser } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, token } = await loginUser({ email, password });
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
      setError(err.message || "Invalid email or password.");
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
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Log in to continue your journey
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <span className="text-xs text-teal-600 font-medium cursor-not-allowed opacity-60">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-medium py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
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
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-teal-600 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
