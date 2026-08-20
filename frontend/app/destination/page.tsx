"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Destination, getDestinations } from "../lib/api";

export default function DestinationPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoading(true);
        const data = await getDestinations();
        setDestinations(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load destinations.");
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex-grow">
        {/* Page heading */}
        <section className="bg-amber-50/60 py-16 px-6 text-center border-b border-gray-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Destinations
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto mt-3">
            Explore breathtaking places curated for your next adventure.
          </p>
        </section>

        {/* Destination cards */}
        <section className="max-w-6xl mx-auto py-16 px-6">
          {loading ? (
            <p className="text-center text-sm text-gray-500">
              Loading destinations...
            </p>
          ) : error ? (
            <p className="text-center text-sm text-red-600">{error}</p>
          ) : destinations.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No destinations found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {destinations.map((d) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-36 bg-teal-50 flex items-center justify-center text-teal-600 text-3xl">
                    📍
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {d.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
