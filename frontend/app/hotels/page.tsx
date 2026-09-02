"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Hotel, getHotels } from "../lib/api";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHotels()
      .then(setHotels)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
          Stay
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1 mb-8">
          Find your hotels
        </h1>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && hotels.length === 0 && (
          <p className="text-sm text-gray-400">No hotels available yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {hotels.map((h) => (
            <div
              key={h.hotel_id}
              className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-36 bg-amber-50/60 flex items-center justify-center text-3xl">
                🏨
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">
                  {h.hotel_name}
                </h3>
                {h.address && (
                  <p className="text-xs text-gray-500 mt-1">{h.address}</p>
                )}
                {h.star_rating && (
                  <p className="text-xs text-yellow-600 mt-2">
                    {"★".repeat(h.star_rating)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
