"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Package, Destination, getPackages, getDestinations } from "./lib/api";

const heroImages = [
  "/hero/coxsbazar.jpg",
  "/hero/sylhet.jpg",
  "/hero/rangamati.jpg",
];

export default function Home() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([getPackages(), getDestinations()])
      .then(([pkgs, dests]) => {
        setPackages(pkgs);
        setDestinations(dests);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const featuredPackages = packages.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800 antialiased">
      <Header />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gray-900 text-white py-24 md:py-32 px-6">
          {/* Slideshow images */}
          {heroImages.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                i === slide ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}

          {/* Dark overlay so text stays readable */}
          <div className="absolute inset-0 bg-black/55" />

          {/* Slide dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Show slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === slide ? "w-8 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>

          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Conquer the Untamed Trails with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200">
                HikKing
              </span>
            </h1>

            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Discover breathtaking mountain peaks, deep rainforest trails, and
              coastal camping adventures led by verified local mountaineers and
              guides.
            </p>

            {/* Quick Search Bar */}
            <div className="pt-4 max-w-xl mx-auto">
              <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 shadow-2xl focus-within:ring-2 focus-within:ring-teal-400 transition">
                <span className="pl-3 text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where do you want to trek? (e.g., Bandarban, Sajek)"
                  className="w-full px-3 py-2 text-sm text-white placeholder-gray-400 bg-transparent outline-none"
                />
                <Link
                  href={`/packages${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap"
                >
                  Explore Trails
                </Link>
              </div>
            </div>

            {/* Platform Trust Highlights */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-white/10 text-left">
              <div>
                <span className="block text-2xl font-black text-white">
                  4.9 / 5.0
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Average Review Rating
                </span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">
                  100%
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Verified Local Guides
                </span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">
                  15+
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Curated Expeditions
                </span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">
                  ৳ 0
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Hidden Booking Fees
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PACKAGES SECTION */}
        <section className="max-w-7xl mx-auto py-20 px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-teal-600 tracking-wider uppercase block">
                Top Rated Expeditions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                Featured Tour Packages
              </h2>
            </div>
            <Link
              href="/packages"
              className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
            >
              Browse all packages{" "}
              <span className="group-hover:translate-x-1 transition-transform">
                &rarr;
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-100 rounded-2xl h-80"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPackages.map((p) => (
                <Link
                  key={p.id}
                  href={`/packages/${p.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Package Card Image/Banner */}
                    <div className="relative h-48 bg-gradient-to-tr from-gray-900 to-teal-900 overflow-hidden flex items-center justify-center">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-12 h-12 text-teal-400 opacity-60">
                          <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M14 6l6 12H4l4-8 3 5 3-9z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                        {p.duration_days}D /{" "}
                        {p.duration_nights || p.duration_days - 1}N
                      </div>
                      {p.destination && (
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-gray-900 text-xs font-semibold flex items-center gap-1.5">
                          <svg
                            className="w-3.5 h-3.5 text-teal-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{p.destination.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-teal-600 transition-colors line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {p.description ||
                          "An unforgettable outdoor trekking and camping adventure."}
                      </p>

                      {p.categories && p.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {p.categories.map((c) => (
                            <span
                              key={c.category_id}
                              className="text-[10px] font-semibold bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100"
                            >
                              {c.category_name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        Per Person
                      </span>
                      <span className="text-lg font-extrabold text-teal-700">
                        ৳{Number(p.price).toLocaleString()}
                      </span>
                    </div>
                    <span className="px-3.5 py-1.5 bg-teal-600 group-hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-xs">
                      View Tour &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* POPULAR DESTINATIONS SECTION */}
        <section className="bg-gray-50/70 border-y border-gray-100 py-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-bold text-teal-600 tracking-wider uppercase block">
                Top Destinations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                Explore Iconic Regions
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                From misty mountain ridges to coastal waves, find your next
                basecamp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destinations.slice(0, 4).map((d) => (
                <Link
                  key={d.destination_id}
                  href={`/packages?dest=${d.destination_id}`}
                  className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all block space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {d.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {d.location || "Bangladesh"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {d.description ||
                      "Scenic destination with trekking trails, nature camps and cultural heritage."}
                  </p>
                  <span className="text-xs font-bold text-teal-600 block pt-1 group-hover:translate-x-1 transition-transform">
                    Discover Tours &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-6xl mx-auto py-20 px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase block">
              Effortless Adventures
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              Your Journey in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-lg mx-auto sm:mx-0">
                1
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Select Your Trail
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Filter by difficulty, duration, and region. Read full day-by-day
                itineraries and verified traveler reviews.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-lg mx-auto sm:mx-0">
                2
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Book with Confidence
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Reserve your spot directly. Instant booking confirmation with
                transparent payment tracking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-lg mx-auto sm:mx-0">
                3
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                Hike with Certified Guides
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Meet your local guide at the trailhead. Enjoy safety, authentic
                camping meals, and unforgettable summits.
              </p>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
          <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-gray-900 rounded-3xl p-10 md:p-14 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-3 max-w-xl">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
                Start Your Next Adventure
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Ready to Experience the Mountains?
              </h2>
              <p className="text-teal-100/80 text-sm leading-relaxed">
                Join hundreds of satisfied travelers who have scaled Keokradong,
                explored Amiakhum, and camped in Sajek Valley.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 whitespace-nowrap">
              <Link
                href="/packages"
                className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 rounded-xl text-xs font-extrabold transition shadow"
              >
                Browse All Packages
              </Link>
              <Link
                href="/guide"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition backdrop-blur-md"
              >
                Meet Our Guides
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
