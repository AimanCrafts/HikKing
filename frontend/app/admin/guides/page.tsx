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
