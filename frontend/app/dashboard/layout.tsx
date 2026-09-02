"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser, User } from "../lib/api";

const navItems = [
  { href: "/dashboard", label: "My Bookings", icon: "🎒", exact: true },
  { href: "/dashboard/complaints", label: "Complaints", icon: "📮" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
  }, [router]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      <aside className="w-64 shrink-0 min-h-screen bg-white border-r border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="block">
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              Hik<span className="text-teal-600">King</span>
            </span>
          </Link>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Traveler Dashboard
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          >
            <span className="text-base">↩</span>
            Back to site
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <span className="text-sm font-medium text-gray-500">
            Traveler Dashboard
          </span>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 text-sm font-bold">
              {user?.name?.[0] ?? "T"}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {user?.name ?? "Traveler"}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
