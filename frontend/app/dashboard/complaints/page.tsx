"use client";

import { useEffect, useState } from "react";
import { Complaint, getComplaints } from "../../lib/api";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    resolved: "bg-teal-50 text-teal-700",
    open: "bg-amber-50 text-amber-700",
    in_progress: "bg-blue-50 text-blue-700",
    rejected: "bg-red-50 text-red-700",
  };
  return styles[status] ?? "bg-gray-100 text-gray-500";
}

export default function TravelerComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaints(true)
      .then(setComplaints)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        Track the status of complaints you&apos;ve filed.
      </p>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}

      {!loading && complaints.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center text-gray-400 text-sm">
          No complaints filed yet.
        </div>
      )}

      <div className="space-y-3">
        {complaints.map((c) => (
          <div
            key={c.complaint_id}
            className="bg-white border border-gray-100 rounded-xl p-5 flex items-start justify-between"
          >
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {c.subject}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Booking #{c.booking_id}
                {c.booking?.package ? ` · ${c.booking.package.title}` : ""}
              </p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusBadge(
                c.status,
              )}`}
            >
              {c.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
