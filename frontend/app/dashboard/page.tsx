"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Booking,
  Hotel,
  Package,
  getBookings,
  getComplaints,
  getHotels,
  getPackages,
  createReview,
} from "../lib/api";
import PaymentModal from "./PaymentModal";

const badge: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-teal-50 text-teal-700 border-teal-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

function daysLeft(dateStr: string) {
  const d = new Date(dateStr.slice(0, 10) + "T00:00:00");
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

function fmtDate(dateStr: string) {
  return new Date(dateStr.slice(0, 10) + "T00:00:00").toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" },
  );
}

function openPanel(panel: string, bookingId?: number) {
  window.dispatchEvent(
    new CustomEvent("open-panel", { detail: { panel, bookingId } }),
  );
}

export default function TravelerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [complaintCount, setComplaintCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<Booking | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [query, setQuery] = useState("");

  const [reviewing, setReviewing] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function loadBookings() {
    try {
      setBookings((await getBookings(true)) || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  function loadComplaints() {
    getComplaints(true)
      .then((c) => setComplaintCount((c || []).length))
      .catch(() => {});
  }

  useEffect(() => {
    loadBookings();
    loadComplaints();
    getPackages()
      .then((p) => setPackages(p || []))
      .catch(() => {});
    getHotels()
      .then((h) => setHotels(h || []))
      .catch(() => {});
    window.addEventListener("complaints-changed", loadComplaints);
    return () =>
      window.removeEventListener("complaints-changed", loadComplaints);
  }, []);

  async function submitReview() {
    if (!reviewing) return;
    try {
      await createReview({
        booking_id: reviewing.booking_id,
        rating,
        comment: comment || undefined,
      });
      setReviewing(null);
      setComment("");
      setRating(5);
      await loadBookings();
    } catch (err: any) {
      alert(err.message || "Failed to submit review");
    }
  }

  const isUpcoming = (b: Booking) =>
    (b.booking_status === "pending" || b.booking_status === "confirmed") &&
    daysLeft(b.travel_date) >= 0;

  const stats = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter((b) => b.booking_status === "confirmed")
        .length,
      pending: bookings.filter((b) => b.booking_status === "pending").length,
    }),
    [bookings],
  );

  const upcomingCount = bookings.filter(isUpcoming).length;
  const pastCount = bookings.length - upcomingCount;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => (tab === "upcoming" ? isUpcoming(b) : !isUpcoming(b)))
      .filter(
        (b) =>
          !q ||
          (b.package?.title || "").toLowerCase().includes(q) ||
          (b.package?.destination?.name || "").toLowerCase().includes(q),
      )
      .sort((a, b) =>
        tab === "upcoming"
          ? a.travel_date.localeCompare(b.travel_date)
          : b.travel_date.localeCompare(a.travel_date),
      );
  }, [bookings, tab, query]);

  const bookedIds = new Set(bookings.map((b) => b.package_id));
  const suggestedPackages = packages
    .filter((p) => !bookedIds.has(p.id))
    .slice(0, 4);
  const suggestedHotels = hotels.slice(0, 4);
  const showStats = stats.total > 0 || complaintCount > 0;

  const statChips = [
    { label: "Total", value: stats.total, color: "text-gray-900" },
    { label: "Confirmed", value: stats.confirmed, color: "text-emerald-700" },
    { label: "Pending", value: stats.pending, color: "text-amber-700" },
    {
      label: "Complaints",
      value: complaintCount,
      color: "text-rose-700",
      onClick: () => openPanel("complaints"),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          My Bookings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Track your trips, complete payments and share reviews.
        </p>
      </div>

      {showStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statChips.map((s) => (
            <div
              key={s.label}
              onClick={s.onClick}
              className={`bg-white border border-stone-200 rounded-xl px-5 py-3 flex items-center justify-between ${s.onClick ? "cursor-pointer hover:border-teal-300" : ""}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {s.label}
              </span>
              <span className={`text-2xl font-black ${s.color}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-stone-200/60 animate-pulse"
            />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200">
            <div className="flex gap-6">
              {(["upcoming", "past"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-3 text-sm font-bold capitalize border-b-2 -mb-px cursor-pointer ${tab === t ? "border-teal-600 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}
                >
                  {t}{" "}
                  <span className="text-xs font-semibold text-gray-400">
                    ({t === "upcoming" ? upcomingCount : pastCount})
                  </span>
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by package or place..."
              className="mb-2 w-full sm:w-64 border border-stone-300 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12 bg-white border border-stone-200 rounded-2xl">
              No {tab} bookings{query ? " match your search" : ""}.
            </p>
          ) : (
            visible.map((b) => {
              const left = daysLeft(b.travel_date);
              return (
                <div
                  key={b.booking_id}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden sm:flex hover:border-teal-300 transition-colors"
                >
                  <div className="sm:w-52 h-36 sm:h-auto shrink-0 bg-gradient-to-tr from-gray-800 to-teal-800">
                    {b.package?.image_url && (
                      <img
                        src={b.package.image_url}
                        alt={b.package.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {b.package?.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {b.package?.destination?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">
                          &#2547; {Number(b.total_price).toLocaleString()}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${badge[b.booking_status] ?? ""}`}
                        >
                          {b.booking_status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                      <span>{fmtDate(b.travel_date)}</span>
                      <span>
                        {b.total_travelers} traveler
                        {b.total_travelers > 1 ? "s" : ""}
                      </span>
                      {isUpcoming(b) && (
                        <span className="bg-teal-50 text-teal-700 font-semibold px-2.5 py-0.5 rounded-full">
                          {left === 0
                            ? "Today"
                            : left === 1
                              ? "Tomorrow"
                              : `${left} days to go`}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                      {b.booking_status === "pending" && (
                        <button
                          onClick={() => setPaying(b)}
                          className="text-xs font-bold bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 cursor-pointer"
                        >
                          Pay now
                        </button>
                      )}
                      {(b.booking_status === "confirmed" ||
                        b.booking_status === "completed") &&
                        !b.review && (
                          <button
                            onClick={() => setReviewing(b)}
                            className="text-xs font-semibold border border-stone-300 text-gray-700 hover:bg-stone-50 px-3 py-2 rounded-xl cursor-pointer"
                          >
                            Write a review
                          </button>
                        )}
                      <Link
                        href={`/packages/${b.package_id}`}
                        className="text-xs font-semibold border border-stone-300 text-gray-700 hover:bg-stone-50 px-3 py-2 rounded-xl"
                      >
                        View details
                      </Link>
                      <button
                        onClick={() => openPanel("complaints", b.booking_id)}
                        className="text-xs font-semibold text-gray-500 hover:text-rose-700 px-3 py-2 cursor-pointer"
                      >
                        Contact support
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      ) : (
        <p className="text-sm text-gray-600 bg-white border border-stone-200 rounded-2xl px-6 py-5">
          You have no bookings yet. Here are some trips and stays to get you
          started.
        </p>
      )}

      {!loading && suggestedPackages.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-lg font-extrabold text-gray-900">
              {bookings.length
                ? "Recommended for you"
                : "Popular tour packages"}
            </h2>
            <Link
              href="/packages"
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              More packages &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestedPackages.map((p) => (
              <Link
                key={p.id}
                href={`/packages/${p.id}`}
                className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition"
              >
                <div className="h-32 bg-gradient-to-tr from-gray-800 to-teal-800 overflow-hidden">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {p.duration_days} days &middot; From &#2547;{" "}
                    {Number(p.price).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && suggestedHotels.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-lg font-extrabold text-gray-900">
              {bookings.length
                ? "Stays you may like"
                : "Partner hotels & stays"}
            </h2>
            <Link
              href="/hotels"
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              More hotels &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suggestedHotels.map((h) => (
              <Link
                key={h.hotel_id}
                href="/hotels"
                className="bg-white border border-stone-200 rounded-2xl p-4 hover:border-teal-300 hover:shadow-md transition"
              >
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {h.star_rating ?? "-"}-Star
                </span>
                <h3 className="text-sm font-bold text-gray-900 mt-3 line-clamp-1">
                  {h.hotel_name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {h.address}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {paying && (
        <PaymentModal
          booking={paying}
          onClose={() => setPaying(null)}
          onDone={loadBookings}
        />
      )}

      {reviewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Rate your trip
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              {reviewing.package?.title}
            </p>
            <div className="flex gap-1 mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                  className={`text-3xl leading-none cursor-pointer ${n <= rating ? "text-amber-500" : "text-stone-300"}`}
                >
                  &#9733;
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="w-full border border-stone-300 rounded-xl p-3 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                className="flex-1 bg-teal-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-teal-700 cursor-pointer"
              >
                Submit review
              </button>
              <button
                onClick={() => setReviewing(null)}
                className="flex-1 bg-stone-100 text-stone-700 text-xs font-bold py-2.5 rounded-xl hover:bg-stone-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
