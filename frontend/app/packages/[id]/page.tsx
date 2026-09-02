"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Package,
  Review,
  getPackage,
  getReviews,
  createBooking,
  getStoredUser,
} from "../../lib/api";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [pkg, setPkg] = useState<Package | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [travelDate, setTravelDate] = useState("");
  const [totalTravelers, setTotalTravelers] = useState(1);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPackage(id), getReviews(id)])
      .then(([p, r]) => {
        setPkg(p);
        setReviews(r);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setBooking(true);
    try {
      await createBooking({
        package_id: id,
        travel_date: travelDate,
        total_travelers: totalTravelers,
      });
      setSuccess("Booking requested! Check your dashboard for status.");
    } catch (err: any) {
      setError(err.message || "Failed to create booking.");
    } finally {
      setBooking(false);
    }
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-white">
        <Header />
        <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16">
          <p className="text-sm text-gray-400">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-white">
        <Header />
        <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16">
          <p className="text-sm text-gray-400">Package not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: details */}
        <div className="lg:col-span-2">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
            {pkg.destination?.name}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1 mb-2">
            {pkg.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
            <span>{pkg.duration_days} days</span>
            {avgRating && (
              <span className="text-yellow-600">⭐ {avgRating} ({reviews.length} reviews)</span>
            )}
            {pkg.guideProfile?.user && (
              <span>Guide: {pkg.guideProfile.user.name}</span>
            )}
          </div>

          {pkg.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              {pkg.description}
            </p>
          )}

          {pkg.categories && pkg.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {pkg.categories.map((c) => (
                <span
                  key={c.category_id}
                  className="text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1 rounded-full"
                >
                  {c.category_name}
                </span>
              ))}
            </div>
          )}

          {pkg.itineraries && pkg.itineraries.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Itinerary</h2>
              <div className="space-y-3">
                {pkg.itineraries.map((it) => (
                  <div
                    key={it.id}
                    className="border border-gray-100 rounded-lg p-4"
                  >
                    <div className="text-xs font-semibold text-teal-600 mb-1">
                      Day {it.day_number}
                    </div>
                    <div className="font-medium text-gray-900">{it.title}</div>
                    {it.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {it.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews</h2>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div
                    key={r.review_id}
                    className="border border-gray-100 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {r.traveler?.name ?? "Traveler"}
                      </span>
                      <span className="text-yellow-600 text-sm">
                        {"⭐".repeat(r.rating)}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-500">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: booking box */}
        <div>
          <div className="border border-gray-100 rounded-xl p-6 sticky top-6">
            <div className="text-2xl font-extrabold text-gray-900 mb-1">
              ৳{Number(pkg.price).toLocaleString()}
              <span className="text-sm font-normal text-gray-400">
                {" "}
                / person
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              {pkg.max_travelers
                ? `Up to ${pkg.max_travelers} travelers`
                : "Flexible group size"}
            </p>

            {error && (
              <div className="bg-red-50 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-teal-50 text-teal-700 text-xs rounded-lg px-3 py-2 mb-3">
                {success}
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Travel date
                </label>
                <input
                  type="date"
                  required
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Travelers
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={totalTravelers}
                  onChange={(e) => setTotalTravelers(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-between pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="font-bold text-gray-900">
                  ৳{(Number(pkg.price) * totalTravelers).toLocaleString()}
                </span>
              </div>
              <button
                type="submit"
                disabled={booking}
                className="w-full bg-teal-600 text-white font-medium py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-60"
              >
                {booking ? "Booking..." : "Book Now"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
