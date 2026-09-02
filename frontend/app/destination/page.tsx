<<<<<<< HEAD
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
=======
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
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
