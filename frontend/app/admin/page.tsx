"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getPackages,
  getBookings,
  getDestinations,
  getHotels,
  getGuideProfiles,
  getCategories,
} from "../lib/api";

type StatCard = {
  label: string;
  count: number | null;
  href: string;
  desc: string;
  icon: React.ReactNode;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([
    {
      label: "Tour Packages",
      count: null,
      href: "/admin/packages",
      desc: "Published and draft tours",
      icon: (
        <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 6l6 12H4l4-8 3 5 3-9z" />
        </svg>
      ),
    },
    {
      label: "Bookings",
      count: null,
      href: "/admin/bookings",
      desc: "Traveler reservations",
      icon: (
        <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: "Destinations",
      count: null,
      href: "/admin/destinations",
      desc: "Registered trekking regions",
      icon: (
        <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Partner Hotels",
      count: null,
      href: "/admin/hotels",
      desc: "Eco-lodges and resorts",
      icon: (
        <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: "Mountain Guides",
      count: null,
      href: "/admin/guides",
      desc: "Certified local trail leaders",
      icon: (
        <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: "Categories",
      count: null,
      href: "/admin/categories",
      desc: "Trek taxonomies & filters",
      icon: (
        <svg className="w-5 h-5 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [pkgs, bks, dests, htls, gds, cats] = await Promise.all([
          getPackages().catch(() => []),
          getBookings(false).catch(() => []),
          getDestinations().catch(() => []),
          getHotels().catch(() => []),
          getGuideProfiles().catch(() => []),
          getCategories().catch(() => []),
        ]);

        setStats((prev) => [
          { ...prev[0], count: pkgs.length },
          { ...prev[1], count: bks.length },
          { ...prev[2], count: dests.length },
          { ...prev[3], count: htls.length },
          { ...prev[4], count: gds.length },
          { ...prev[5], count: cats.length },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8 antialiased">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Admin Control Center
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          High-level overview of system metrics, catalog entities, bookings, and database operations.
        </p>
      </div>

      {/* Hero Showcase Card: Advanced Database Operations */}
      

      {/* Grid of Key Stats */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group bg-white border border-stone-200/80 rounded-2xl p-5 hover:border-teal-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {s.icon}
                  </span>
                  <span className="text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
                    Manage &rarr;
                  </span>
                </div>
                <div className="text-3xl font-black text-gray-900">
                  {s.count === null ? "…" : s.count}
                </div>
                <div className="text-sm font-bold text-gray-800 mt-1">{s.label}</div>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links & Shortcuts */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
          Administrative Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/packages"
            className="p-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Package</span>
          </Link>
          <Link
            href="/admin/destinations"
            className="p-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Add Destination</span>
          </Link>
          <Link
            href="/admin/hotels"
            className="p-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Partner Hotel</span>
          </Link>
          <Link
            href="/admin/advanced-operations"
            className="p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-xs font-semibold text-teal-800 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span>DB Operations</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
