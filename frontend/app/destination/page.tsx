"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Destination, getDestinations } from "../lib/api";

export default function DestinationPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDestinations()
      .then(setDestinations)
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
          Destinations
        </h1>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && destinations.length === 0 && (
          <p className="text-sm text-gray-400">No destinations available yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {destinations.map((d) => (
            <div
              key={d.destination_id}
              className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-36 bg-amber-50/60 flex items-center justify-center text-3xl">
                📍
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{d.name}</h3>
                {d.location && (
                  <p className="text-xs text-gray-500 mt-1">{d.location}</p>
                )}
                {d.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {d.description}
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
