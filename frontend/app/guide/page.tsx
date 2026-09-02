<<<<<<< HEAD
"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GuideProfile, getGuideProfiles } from "../lib/api";

export default function GuidePage() {
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuideProfiles()
      .then((data) =>
        setGuides(data.filter((g) => g.verification_status === "approved")),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
          Local Experts
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1 mb-8">
          Meet our Guides
        </h1>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && guides.length === 0 && (
          <p className="text-sm text-gray-400">No guides available yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {guides.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow p-4"
            >
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 text-xl mb-3">
                🧭
              </div>
              <h3 className="font-semibold text-gray-900">
                {g.user?.name ?? "Guide"}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                {g.experience_years !== null && (
                  <span className="text-xs text-gray-500">
                    {g.experience_years} yrs experience
                  </span>
                )}
                {g.rating_avg ? (
                  <span className="text-xs text-yellow-600">
                    ★ {Number(g.rating_avg).toFixed(1)}
                  </span>
                ) : null}
              </div>
              {g.bio && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {g.bio}
                </p>
              )}
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
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
