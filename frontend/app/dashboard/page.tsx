<<<<<<< HEAD
"use client";

import { useEffect, useState } from "react";
import {
  Booking,
  getBookings,
  createPayment,
  createReview,
  createComplaint,
} from "../lib/api";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    confirmed: "bg-teal-50 text-teal-700",
    completed: "bg-teal-50 text-teal-700",
    pending: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-700",
  };
  return styles[status] ?? "bg-gray-100 text-gray-500";
}

export default function TravelerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Review modal state
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Complaint modal state
  const [complainingBooking, setComplainingBooking] = useState<Booking | null>(null);
  const [subject, setSubject] = useState("");

  async function loadBookings() {
    setLoading(true);
    const data = await getBookings(true);
    setBookings(data);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handlePay(booking: Booking) {
    setBusyId(booking.booking_id);
    try {
      await createPayment(booking.booking_id);
      await loadBookings();
    } finally {
      setBusyId(null);
    }
  }

  async function submitReview() {
    if (!reviewingBooking) return;
    await createReview({
      booking_id: reviewingBooking.booking_id,
      rating,
      comment: comment || undefined,
    });
    setReviewingBooking(null);
    setComment("");
    setRating(5);
    loadBookings();
  }

  async function submitComplaint() {
    if (!complainingBooking || !subject.trim()) return;
    await createComplaint({
      booking_id: complainingBooking.booking_id,
      subject,
    });
    setComplainingBooking(null);
    setSubject("");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        Track your trips, pay for bookings, and leave reviews.
      </p>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}

      {!loading && bookings.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center text-gray-400 text-sm">
          You haven&apos;t booked any trips yet. Browse{" "}
          <a href="/packages" className="text-teal-600 font-medium">
            packages
          </a>{" "}
          to get started.
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.booking_id}
            className="bg-white border border-gray-100 rounded-xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {b.package?.title ?? `Package #${b.package_id}`}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {b.package?.destination?.name} · {b.travel_date} ·{" "}
                  {b.total_travelers} traveler(s)
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusBadge(
                  b.booking_status,
                )}`}
              >
                {b.booking_status}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="font-bold text-gray-900">
                ৳{Number(b.total_price).toLocaleString()}
              </span>
              <div className="flex gap-2">
                {b.booking_status === "pending" && (
                  <button
                    onClick={() => handlePay(b)}
                    disabled={busyId === b.booking_id}
                    className="text-xs font-medium bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-60"
                  >
                    {busyId === b.booking_id ? "Processing..." : "Pay Now"}
                  </button>
                )}
                {(b.booking_status === "confirmed" ||
                  b.booking_status === "completed") &&
                  !b.review && (
                    <button
                      onClick={() => setReviewingBooking(b)}
                      className="text-xs font-medium border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                    >
                      Leave Review
                    </button>
                  )}
                <button
                  onClick={() => setComplainingBooking(b)}
                  className="text-xs font-medium border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  File Complaint
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              Review: {reviewingBooking.package?.title}
            </h3>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-2xl ${
                    n <= rating ? "text-yellow-500" : "text-gray-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                className="flex-1 bg-teal-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-teal-700"
              >
                Submit
              </button>
              <button
                onClick={() => setReviewingBooking(null)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint modal */}
      {complainingBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              File a Complaint: {complainingBooking.package?.title}
            </h3>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What went wrong?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-3">
              <button
                onClick={submitComplaint}
                className="flex-1 bg-teal-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-teal-700"
              >
                Submit
              </button>
              <button
                onClick={() => setComplainingBooking(null)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-200"
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
=======
"use client";

import { useEffect, useState } from "react";
import {
  Booking,
  getBookings,
  createPayment,
  createReview,
  createComplaint,
} from "../lib/api";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    confirmed: "bg-teal-50 text-teal-700",
    completed: "bg-teal-50 text-teal-700",
    pending: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-700",
  };
  return styles[status] ?? "bg-gray-100 text-gray-500";
}

export default function TravelerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Review modal state
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Complaint modal state
  const [complainingBooking, setComplainingBooking] = useState<Booking | null>(null);
  const [subject, setSubject] = useState("");

  async function loadBookings() {
    setLoading(true);
    const data = await getBookings(true);
    setBookings(data);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handlePay(booking: Booking) {
    setBusyId(booking.booking_id);
    try {
      await createPayment(booking.booking_id);
      await loadBookings();
    } finally {
      setBusyId(null);
    }
  }

  async function submitReview() {
    if (!reviewingBooking) return;
    await createReview({
      booking_id: reviewingBooking.booking_id,
      rating,
      comment: comment || undefined,
    });
    setReviewingBooking(null);
    setComment("");
    setRating(5);
    loadBookings();
  }

  async function submitComplaint() {
    if (!complainingBooking || !subject.trim()) return;
    await createComplaint({
      booking_id: complainingBooking.booking_id,
      subject,
    });
    setComplainingBooking(null);
    setSubject("");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        Track your trips, pay for bookings, and leave reviews.
      </p>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}

      {!loading && bookings.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center text-gray-400 text-sm">
          You haven&apos;t booked any trips yet. Browse{" "}
          <a href="/packages" className="text-teal-600 font-medium">
            packages
          </a>{" "}
          to get started.
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.booking_id}
            className="bg-white border border-gray-100 rounded-xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {b.package?.title ?? `Package #${b.package_id}`}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {b.package?.destination?.name} · {b.travel_date} ·{" "}
                  {b.total_travelers} traveler(s)
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusBadge(
                  b.booking_status,
                )}`}
              >
                {b.booking_status}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="font-bold text-gray-900">
                ৳{Number(b.total_price).toLocaleString()}
              </span>
              <div className="flex gap-2">
                {b.booking_status === "pending" && (
                  <button
                    onClick={() => handlePay(b)}
                    disabled={busyId === b.booking_id}
                    className="text-xs font-medium bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-60"
                  >
                    {busyId === b.booking_id ? "Processing..." : "Pay Now"}
                  </button>
                )}
                {(b.booking_status === "confirmed" ||
                  b.booking_status === "completed") &&
                  !b.review && (
                    <button
                      onClick={() => setReviewingBooking(b)}
                      className="text-xs font-medium border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                    >
                      Leave Review
                    </button>
                  )}
                <button
                  onClick={() => setComplainingBooking(b)}
                  className="text-xs font-medium border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  File Complaint
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              Review: {reviewingBooking.package?.title}
            </h3>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-2xl ${
                    n <= rating ? "text-yellow-500" : "text-gray-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                className="flex-1 bg-teal-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-teal-700"
              >
                Submit
              </button>
              <button
                onClick={() => setReviewingBooking(null)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint modal */}
      {complainingBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-900 mb-4">
              File a Complaint: {complainingBooking.package?.title}
            </h3>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What went wrong?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-3">
              <button
                onClick={submitComplaint}
                className="flex-1 bg-teal-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-teal-700"
              >
                Submit
              </button>
              <button
                onClick={() => setComplainingBooking(null)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-200"
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
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
