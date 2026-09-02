"use client";

import { useEffect, useState } from "react";
import { Booking, getBookings, updateBookingStatus } from "../../lib/api";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    confirmed: "bg-teal-50 text-teal-700",
    completed: "bg-teal-50 text-teal-700",
    pending: "bg-amber-50 text-amber-700",
    cancelled: "bg-red-50 text-red-700",
  };
  return styles[status] ?? "bg-gray-100 text-gray-500";
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    setBookings(await getBookings());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleStatusChange(id: number, status: string) {
    await updateBookingStatus(id, status);
    loadData();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        All traveler bookings across every package.
      </p>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3">Traveler</th>
              <th className="px-6 py-3">Package</th>
              <th className="px-6 py-3">Travel Date</th>
              <th className="px-6 py-3">Travelers</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No bookings yet.
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.booking_id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {b.traveler?.name ?? `#${b.traveler_id}`}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {b.package?.title ?? `#${b.package_id}`}
                </td>
                <td className="px-6 py-3 text-gray-600">{b.travel_date}</td>
                <td className="px-6 py-3 text-gray-600">
                  {b.total_travelers}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  ৳{Number(b.total_price).toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  <select
                    value={b.booking_status}
                    onChange={(e) =>
                      handleStatusChange(b.booking_id, e.target.value)
                    }
                    className={`text-xs font-medium px-2 py-1 rounded-full capitalize border-0 ${statusBadge(
                      b.booking_status,
                    )}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
