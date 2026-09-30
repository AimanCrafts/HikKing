"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getStoredUser,
  getNotifications,
  markNotificationRead,
  Notification,
  User,
} from "../lib/api";
import { NotificationsPanel, ComplaintsPanel } from "./Panels";

function Icon({ d }: { d: string }) {
  return (
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
        d={d}
      />
    </svg>
  );
}

const ICON_BOOK = "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z";
const ICON_CHAT =
  "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z";
const ICON_BELL =
  "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9";

const base =
  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer";
const idle = "text-gray-600 hover:bg-stone-50 hover:text-gray-900";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [panel, setPanel] = useState<"notifications" | "complaints" | null>(
    null,
  );
  const [bookingId, setBookingId] = useState<number | undefined>();

  useEffect(() => {
    const u = getStoredUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
    getNotifications()
      .then((n) => setNotifications(n || []))
      .catch(() => {});
  }, [router]);

  // Lets any dashboard page open a panel: window.dispatchEvent(new CustomEvent("open-panel", { detail: { panel, bookingId } }))
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      setBookingId(d.bookingId);
      setPanel(d.panel);
    };
    window.addEventListener("open-panel", h);
    return () => window.removeEventListener("open-panel", h);
  }, []);

  async function readNotification(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n)),
    );
    try {
      await markNotificationRead(id);
    } catch {}
  }

  const unread = notifications.filter((n) => !n.is_read).length;
  const bookingsActive = pathname === "/dashboard";

  return (
    <div className="min-h-screen flex bg-stone-50 text-gray-800 antialiased">
      <aside className="w-64 shrink-0 min-h-screen bg-white border-r border-stone-200/80 flex flex-col">
        <div className="px-6 py-5 border-b border-stone-100">
          <Link href="/" className="block">
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              Hik<span className="text-teal-600">King</span>
            </span>
          </Link>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mt-0.5">
            Traveler Account
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/dashboard"
            className={`${base} ${bookingsActive ? "bg-teal-50 text-teal-800 border border-teal-200" : idle}`}
          >
            <span
              className={bookingsActive ? "text-teal-700" : "text-gray-400"}
            >
              <Icon d={ICON_BOOK} />
            </span>
            <span>My Bookings</span>
          </Link>

          <button
            onClick={() => {
              setBookingId(undefined);
              setPanel("complaints");
            }}
            className={`${base} ${panel === "complaints" ? "bg-teal-50 text-teal-800 border border-teal-200" : idle}`}
          >
            <span className="text-gray-400">
              <Icon d={ICON_CHAT} />
            </span>
            <span>Complaints & Inquiries</span>
          </button>

          <button
            onClick={() => setPanel("notifications")}
            className={`${base} ${panel === "notifications" ? "bg-teal-50 text-teal-800 border border-teal-200" : idle}`}
          >
            <span className="text-gray-400">
              <Icon d={ICON_BELL} />
            </span>
            <span className="flex-1">Notifications</span>
            {unread > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
        </nav>

        <div className="px-3 py-4 border-t border-stone-100">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-stone-50 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Return to Site</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-stone-200/80 flex items-center justify-between px-8">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Traveler Dashboard
          </span>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 text-xs font-bold">
              {user?.name?.[0] ?? "T"}
            </span>
            <span className="text-xs font-semibold text-gray-700">
              {user?.name ?? "Traveler"}
            </span>
          </div>
        </header>
        <main className="flex-1 p-8 max-w-6xl w-full">{children}</main>
      </div>

      {panel === "notifications" && (
        <NotificationsPanel
          items={notifications}
          onRead={readNotification}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === "complaints" && (
        <ComplaintsPanel bookingId={bookingId} onClose={() => setPanel(null)} />
      )}
    </div>
  );
}
