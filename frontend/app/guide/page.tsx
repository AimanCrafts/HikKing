"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface Guide {
  id: number;
  name: string;
  bio: string | null;
  experience_years: number | null;
  specialization: string | null;
  rating_avg: number;
  verification_status: string;
}

const API_URL = "http://localhost:8000/api";

export default function GuidePage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGuides() {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/guides`);

        if (!res.ok) {
          throw new Error("Failed to fetch guides");
        }

        const data = await res.json();
        setGuides(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load guides.");
      } finally {
        setLoading(false);
      }
    }

    loadGuides();
  }, []);

  function statusBadgeClasses(status: string) {
    switch (status) {
      case "verified":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex-grow">
        {/* Page heading */}
        <section className="bg-amber-50/60 py-16 px-6 text-center border-b border-gray-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Guides
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto mt-3">
            Meet the local experts ready to make your trip unforgettable.
          </p>
        </section>

        {/* Guide cards */}
        <section className="max-w-6xl mx-auto py-16 px-6">
          {loading ? (
            <p className="text-center text-sm text-gray-500">
              Loading guides...
            </p>
          ) : error ? (
            <p className="text-center text-sm text-red-600">{error}</p>
          ) : guides.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No guides found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {guide.name}
                    </h3>

                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${statusBadgeClasses(
                        guide.verification_status,
                      )}`}
                    >
                      {guide.verification_status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    {guide.specialization || "General guide"}
                  </p>

                  {guide.bio && (
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      {guide.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>{guide.experience_years ?? 0} yrs experience</span>
                    <span>⭐ {guide.rating_avg}</span>
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
