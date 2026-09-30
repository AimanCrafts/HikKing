"use client";

import { useEffect, useState } from "react";
import {
  Booking,
  Complaint,
  Notification,
  createComplaint,
  getBookings,
  getComplaints,
} from "../lib/api";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col w-[92vw] h-[85vh] sm:w-[75vw] sm:h-[75vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-gray-500 cursor-pointer"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function NotificationsPanel({
  items,
  onRead,
  onClose,
}: {
  items: Notification[];
  onRead: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal title="Notifications" onClose={onClose}>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-16">
          No notifications yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <button
              key={n.notification_id}
              onClick={() => !n.is_read && onRead(n.notification_id)}
              className={`w-full text-left rounded-xl border p-4 flex items-start justify-between gap-3 cursor-pointer ${n.is_read ? "bg-white border-stone-200" : "bg-teal-50 border-teal-200"}`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  {n.type.replace(/_/g, " ")}
                </span>
                <p className="text-sm text-gray-700 mt-1">{n.message}</p>
              </div>
              {!n.is_read && (
                <span className="w-2.5 h-2.5 mt-1 rounded-full bg-teal-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

const cStyle: Record<string, string> = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-sky-50 text-sky-700 border-sky-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export function ComplaintsPanel({
  bookingId,
  onClose,
}: {
  bookingId?: number;
  onClose: () => void;
}) {
  const [list, setList] = useState<Complaint[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | "">(bookingId ?? "");
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [c, b] = await Promise.all([
        getComplaints(true),
        getBookings(true),
      ]);
      setList(c || []);
      setBookings(b || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function submit() {
    if (!selected || !subject.trim()) return;
    setBusy(true);
    try {
      await createComplaint({ booking_id: Number(selected), subject });
      setSubject("");
      await load();
      window.dispatchEvent(new Event("complaints-changed"));
    } catch (err: any) {
      alert(err.message || "Failed to submit complaint");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Complaints & Inquiries" onClose={onClose}>
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 mb-6 space-y-3">
        <p className="text-xs font-bold text-gray-700">New complaint</p>
        <select
          value={selected}
          onChange={(e) =>
            setSelected(e.target.value ? Number(e.target.value) : "")
          }
          className="w-full border border-stone-300 rounded-lg p-2.5 text-sm bg-white"
        >
          <option value="">Select a booking...</option>
          {bookings.map((b) => (
            <option key={b.booking_id} value={b.booking_id}>
              #{b.booking_id} - {b.package?.title}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Describe your issue..."
            className="flex-1 border border-stone-300 rounded-lg p-2.5 text-sm bg-white"
          />
          <button
            onClick={submit}
            disabled={busy || !selected || !subject.trim()}
            className="bg-teal-600 text-white text-xs font-bold px-5 rounded-lg hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
          >
            {busy ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">
          You have not filed any complaints.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div
              key={c.complaint_id}
              className="rounded-xl border border-stone-200 p-4 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {c.subject}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Booking #{c.booking_id}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${cStyle[c.status] ?? ""}`}
              >
                {c.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
