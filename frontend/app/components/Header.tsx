"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, logoutUser, User, clearToken, clearUser } from "../lib/api";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
  }, [pathname]);

  async function handleLogout() {
    try {
      await logoutUser();
    } catch {
      // even if the API call fails, clear local state
      clearToken();
      clearUser();
    }
    clearUser();
    setUser(null);
    router.push("/");
  }

  const dashboardHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "guide"
        ? "/guide-dashboard"
        : "/dashboard";

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b bg-white">
      <div className="flex items-center gap-10">
        <Link href="/" className="text-lg font-extrabold text-gray-900">
          Hik<span className="text-teal-600">King</span>
        </Link>
        <nav className="flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link href="/destination">Destinations</Link>
          <Link href="/packages">Packages</Link>
          <Link href="/hotels">Hotels</Link>
          <Link href="/guide">Guides</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              href={dashboardHref}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black"
            >
              Hi, {user.name.split(" ")[0]}
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
