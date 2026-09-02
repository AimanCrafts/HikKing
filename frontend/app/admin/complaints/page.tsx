"use client";

import { useEffect, useState } from "react";
import { Complaint, getComplaints, updateComplaintStatus } from "../../lib/api";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    resolved: "bg-teal-50 text-teal-700",
    open: "bg-amber-50 text-amber-700",
    in_progress: "bg-blue-50 text-blue-700",
    rejected: "bg-red-50 text-red-700",
  };
  return styles[status] ?? "bg-gray-100 text-gray-500";
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    setComplaints(await getComplaints());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleStatusChange(id: number, status: string) {
    await updateComplaintStatus(id, status);
    loadData();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Traveler complaints filed against bookings.
      </p>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3">Traveler</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Booking</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && complaints.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No complaints filed.
                </td>
              </tr>
            )}
            {complaints.map((c) => (
              <tr key={c.complaint_id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {c.user?.name ?? `#${c.user_id}`}
                </td>
                <td className="px-6 py-3 text-gray-600">{c.subject}</td>
                <td className="px-6 py-3 text-gray-600">
                  #{c.booking_id}
                  {c.booking?.package ? ` · ${c.booking.package.title}` : ""}
                </td>
                <td className="px-6 py-3">
                  <select
                    value={c.status}
                    onChange={(e) =>
                      handleStatusChange(c.complaint_id, e.target.value)
                    }
                    className={`text-xs font-medium px-2 py-1 rounded-full capitalize border-0 ${statusBadge(
                      c.status,
                    )}`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
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
