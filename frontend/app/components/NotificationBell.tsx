"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Notification, getNotifications, markNotificationRead } from "../lib/api";
import { isToday, timeAgo, cx } from "../lib/format";
import { Icon, IconName, IconButton, Skeleton } from "./ui";

const TYPE_ICON: Record<string, IconName> = {
  new_booking: "calendar",
  booking_status_updated: "check",
  complaint_update: "message",
  complaint_status_updated: "message",
};

function iconFor(type: string): IconName {
  if (TYPE_ICON[type]) return TYPE_ICON[type];
  if (type.includes("complaint")) return "message";
  if (type.includes("booking")) return "calendar";
  return "bell";
}

export default function NotificationBell({ light = false }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setItems(await getNotifications());
    } catch {
      /* keep what we have */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => document.visibilityState === "visible" && load(), 45000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    load();
    const down = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open, load]);

  const unread = items.filter((n) => !n.is_read);

  async function readOne(n: Notification) {
    if (n.is_read) return;
    setItems((cur) => cur.map((x) => (x.notification_id === n.notification_id ? { ...x, is_read: true } : x)));
    try {
      await markNotificationRead(n.notification_id);
    } catch {
      load();
    }
  }

  async function readAll() {
    const targets = unread;
    setItems((cur) => cur.map((x) => ({ ...x, is_read: true })));
    await Promise.allSettled(targets.map((n) => markNotificationRead(n.notification_id)));
  }

  const sorted = [...items].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "") || b.notification_id - a.notification_id);
  const hasDates = sorted.some((n) => n.created_at);
  const groups = hasDates
    ? [
        { label: "Today", list: sorted.filter((n) => isToday(n.created_at)) },
        { label: "Earlier", list: sorted.filter((n) => !isToday(n.created_at)) },
      ]
    : [{ label: "Recent", list: sorted }];

  return (
    <div ref={box} className="relative">
      <IconButton
        icon="bell"
        label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
        onClick={() => setOpen((v) => !v)}
        badge={unread.length}
        className={light ? "text-white hover:bg-white/15" : "text-ink"}
      />
      {open && (
        <div className="hk-pop absolute right-0 top-[calc(100%+10px)] z-[70] w-[380px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-3xl border border-line bg-surface text-ink shadow-[var(--shadow-pop)]">
          <div className="flex items-center justify-between px-5 py-3.5">
            <h3 className="text-[15px] font-black">Notifications</h3>
            <button
              type="button"
              onClick={readAll}
              disabled={unread.length === 0}
              className="text-[13px] font-extrabold text-jade transition hover:underline disabled:text-ink3 disabled:no-underline"
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto border-t border-line">
            {loading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sunk text-ink3">
                  <Icon name="bell" size={22} />
                </span>
                <p className="mt-3 text-sm font-extrabold">You&rsquo;re all caught up</p>
                <p className="mt-1 text-[13px] text-ink2">Updates about your reservations will show up here.</p>
              </div>
            ) : (
              groups
                .filter((g) => g.list.length)
                .map((g) => (
                  <div key={g.label}>
                    <p className="bg-sunk/60 px-5 py-1.5 text-xs font-extrabold text-ink3">{g.label}</p>
                    {g.list.map((n) => (
                      <button
                        key={n.notification_id}
                        type="button"
                        onClick={() => readOne(n)}
                        className={cx("flex w-full items-start gap-3 px-5 py-3 text-left transition hover:bg-sunk", !n.is_read && "bg-jade-soft/40")}
                      >
                        <span className={cx("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", n.is_read ? "bg-sunk text-ink3" : "bg-jade-soft text-jade")}>
                          <Icon name={iconFor(n.type)} size={17} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cx("line-clamp-2 text-[13.5px] leading-snug", n.is_read ? "font-semibold text-ink2" : "font-bold text-ink")}>{n.message}</span>
                          {n.created_at ? <span className="mt-0.5 block text-xs font-semibold text-ink3">{timeAgo(n.created_at)}</span> : null}
                        </span>
                        {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-jade" aria-label="Unread" />}
                      </button>
                    ))}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
