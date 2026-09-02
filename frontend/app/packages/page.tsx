"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Package, getPackages } from "../lib/api";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPackages()
      .then(setPackages)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
          Explore
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1 mb-8">
          Tour Packages
        </h1>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && packages.length === 0 && (
          <p className="text-sm text-gray-400">No packages available yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {packages.map((p) => (
            <Link
              key={p.id}
              href={`/packages/${p.id}`}
              className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow block"
            >
              <div className="h-36 bg-teal-50/60 flex items-center justify-center text-3xl">
                🏔️
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{p.title}</h3>
                {p.destination && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {p.destination.name}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-teal-700 font-bold text-sm">
                    ৳{Number(p.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {p.duration_days} days
                  </span>
                </div>
                {p.categories && p.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {p.categories.map((c) => (
                      <span
                        key={c.category_id}
                        className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {c.category_name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
