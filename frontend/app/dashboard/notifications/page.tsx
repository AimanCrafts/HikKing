"use client";

import { useEffect, useState } from "react";
import { Notification, getNotifications, markNotificationRead } from "../../lib/api";

export default function TravelerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  async function handleRead(id: number) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n)),
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        Updates about your bookings, payments, and complaints.
      </p>

      {loading && <p className="text-sm text-gray-400">Loading...</p>}

      {!loading && notifications.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center text-gray-400 text-sm">
          No notifications yet.
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.notification_id}
            className={`border rounded-xl p-4 flex items-start justify-between gap-4 ${
              n.is_read
                ? "bg-white border-gray-100"
                : "bg-teal-50/40 border-teal-100"
            }`}
          >
            <div>
              <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide">
                {n.type.replace(/_/g, " ")}
              </span>
              <p className="text-sm text-gray-700 mt-1">{n.message}</p>
            </div>
            {!n.is_read && (
              <button
                onClick={() => handleRead(n.notification_id)}
                className="text-xs font-medium text-teal-600 hover:underline shrink-0"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
