"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDestinations } from "../lib/api";
import { getHotels } from "../lib/api";

type StatCard = {
  label: string;
  count: number | null;
  href: string;
  icon: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { label: "Destinations", count: null, href: "/admin/destinations", icon: "📍" },
    { label: "Hotels", count: null, href: "/admin/hotels", icon: "🏨" },
  ]);

  useEffect(() => {
    async function loadStats() {
      const [destinations, hotels] = await Promise.all([
        getDestinations().catch(() => []),
        getHotels().catch(() => []),
      ]);

      setStats([
        {
          label: "Destinations",
          count: destinations.length,
          href: "/admin/destinations",
          icon: "📍",
        },
        {
          label: "Hotels",
          count: hotels.length,
          href: "/admin/hotels",
          icon: "🏨",
        },
      ]);
    }

    loadStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        Overview of your HikKing platform data.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 text-lg">
                {s.icon}
              </span>
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                Manage →
              </span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {s.count === null ? "…" : s.count}
            </div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
