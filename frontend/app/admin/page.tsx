"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, EmptyState, Icon, Skeleton, StatusBadge, useToast } from "../components/ui";
import { Booking, Complaint, getBookings, getComplaints, getPackages, updateBookingStatus } from "../lib/api";
import { Story, loadStories } from "../lib/stories";
import { fmtDate, money } from "../lib/format";
import { AdminHeader, Stat } from "./components/AdminUI";

const STATUS_COLOR: Record<string, string> = {
  pending: "var(--sun)",
  confirmed: "var(--jade)",
  completed: "var(--info)",
  cancelled: "var(--danger)",
};
const STATUS_LABEL: Record<string, string> = { pending: "Requested", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled" };

function Donut({ data }: { data: { key: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <svg viewBox="0 0 140 140" className="h-40 w-40 shrink-0 -rotate-90" role="img" aria-label="Reservations by status">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--sunk)" strokeWidth="18" />
        {total > 0 &&
          data.map((d) => {
            const len = (d.value / total) * c;
            const el = <circle key={d.key} cx="70" cy="70" r={r} fill="none" stroke={STATUS_COLOR[d.key]} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
            offset += len;
            return el;
          })}
        <text x="70" y="70" transform="rotate(90 70 70)" textAnchor="middle" dominantBaseline="central" fontSize="26" fontWeight="900" fill="var(--ink)">{total}</text>
      </svg>
      <ul className="w-full space-y-2.5">
        {data.map((d) => (
          <li key={d.key} className="flex items-center justify-between text-sm font-bold text-ink2">
            <span className="flex items-center gap-2.5"><span className="h-3 w-3 rounded-full" style={{ background: STATUS_COLOR[d.key] }} /> {STATUS_LABEL[d.key]}</span>
            <span className="text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="py-10 text-center text-sm font-bold text-ink3">No travel dates yet</p>;
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-black text-ink">{d.value}</span>
          <div className="flex w-full flex-1 items-end">
            <div className="w-full rounded-t-xl bg-jade transition-all duration-700" style={{ height: `${Math.max(6, (d.value / max) * 100)}%` }} />
          </div>
          <span className="text-[11px] font-bold text-ink3">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminOverview() {
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [tourCount, setTourCount] = useState(0);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [b, c, p, s] = await Promise.all([
      getBookings().catch(() => [] as Booking[]),
      getComplaints().catch(() => [] as Complaint[]),
      getPackages().catch(() => []),
      loadStories({ all: true }).catch(() => [] as Story[]),
    ]);
    setBookings(b);
    setComplaints(c);
    setTourCount(p.length);
    setStories(s);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(b: Booking, status: string) {
    setBusy(b.booking_id);
    try {
      await updateBookingStatus(b.booking_id, status);
      toast(status === "confirmed" ? "Reservation confirmed" : "Reservation cancelled");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update", "error");
    } finally {
      setBusy(null);
    }
  }

  const stats = useMemo(() => {
    const list = bookings ?? [];
    const by = (s: string) => list.filter((b) => b.booking_status === s);
    const value = [...by("confirmed"), ...by("completed")].reduce((sum, b) => sum + Number(b.total_price || 0), 0);
    const months = new Map<string, number>();
    for (const b of list.filter((x) => x.booking_status !== "cancelled")) {
      const k = b.travel_date.slice(0, 7);
      months.set(k, (months.get(k) ?? 0) + 1);
    }
    const monthData = [...months.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([k, v]) => ({ label: new Date(k + "-01T00:00:00").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }), value: v }));
    const tours = new Map<string, number>();
    for (const b of list.filter((x) => x.booking_status !== "cancelled")) {
      const t = b.package?.title ?? `Tour ${b.package_id}`;
      tours.set(t, (tours.get(t) ?? 0) + 1);
    }
    const top = [...tours.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      pending: by("pending"),
      confirmed: by("confirmed").length,
      value,
      donut: ["pending", "confirmed", "completed", "cancelled"].map((k) => ({ key: k, value: by(k).length })),
      monthData,
      top,
    };
  }, [bookings]);

  if (bookings === null) {
    return (
      <>
        <AdminHeader title="Overview" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div>
        <Skeleton className="mt-6 h-72" />
      </>
    );
  }

  const openSupport = complaints.filter((c) => c.status === "open" || c.status === "in_progress");
  const pendingStories = stories.filter((s) => s.status === "pending");
  const topMax = Math.max(1, ...stats.top.map(([, n]) => n));

  return (
    <>
      <AdminHeader title="Overview" sub="What needs your attention and how trips are going." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Requests waiting" value={stats.pending.length} icon="clock" tone="warn" hint="Need a decision" />
        <Stat label="Confirmed trips" value={stats.confirmed} icon="check" tone="jade" />
        <Stat label="Estimated value" value={money(stats.value)} icon="chart" tone="info" hint="Confirmed and completed" />
        <Stat label="Open support requests" value={openSupport.length} icon="message" tone="danger" hint={`${tourCount} published tours`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-[28px] border border-line bg-surface p-6">
          <h2 className="t-h3 mb-5 text-ink">Reservations by status</h2>
          <Donut data={stats.donut} />
        </section>
        <section className="rounded-[28px] border border-line bg-surface p-6 xl:col-span-2">
          <h2 className="t-h3 mb-5 text-ink">Reservations by travel month</h2>
          <Bars data={stats.monthData} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-[28px] border border-line bg-surface p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="t-h3 text-ink">Requests to review</h2>
            <Link href="/admin/bookings" className="text-sm font-extrabold text-jade hover:underline">See all</Link>
          </div>
          {stats.pending.length === 0 ? (
            <EmptyState icon="check" title="All caught up" text="New reservation requests will appear here." className="!py-10" />
          ) : (
            <ul className="divide-y divide-line">
              {stats.pending.slice(0, 5).map((b) => (
                <li key={b.booking_id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-ink">{b.package?.title ?? `Tour ${b.package_id}`}</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-ink3">
                      {b.traveler?.name ?? `User ${b.traveler_id}`}, {b.total_travelers} traveler{b.total_travelers > 1 ? "s" : ""}, {fmtDate(b.travel_date)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" loading={busy === b.booking_id} onClick={() => decide(b, "confirmed")}>Confirm</Button>
                    <Button size="sm" variant="danger" disabled={busy === b.booking_id} onClick={() => decide(b, "cancelled")}>Decline</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-surface p-6">
            <h2 className="t-h3 mb-5 text-ink">Most reserved tours</h2>
            {stats.top.length === 0 ? (
              <p className="text-sm font-bold text-ink3">No reservations yet</p>
            ) : (
              <ul className="space-y-4">
                {stats.top.map(([name, n]) => (
                  <li key={name}>
                    <div className="mb-1.5 flex justify-between gap-3 text-[13px] font-bold text-ink2">
                      <span className="truncate">{name}</span>
                      <span className="text-ink">{n}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-sunk"><div className="h-full rounded-full bg-jade" style={{ width: `${(n / topMax) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[28px] border border-line bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="t-h3 text-ink">Needs attention</h2>
            </div>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/admin/complaints" className="flex items-center justify-between rounded-2xl bg-sunk px-4 py-3 text-ink2 transition hover:text-ink"><span className="flex items-center gap-2.5"><Icon name="message" size={17} /> Support requests</span><Badge tone={openSupport.length ? "danger" : "neutral"}>{openSupport.length}</Badge></Link></li>
              <li><Link href="/admin/stories" className="flex items-center justify-between rounded-2xl bg-sunk px-4 py-3 text-ink2 transition hover:text-ink"><span className="flex items-center gap-2.5"><Icon name="camera" size={17} /> Stories to review</span><Badge tone={pendingStories.length ? "warn" : "neutral"}>{pendingStories.length}</Badge></Link></li>
            </ul>
            {openSupport.slice(0, 2).map((c) => (
              <div key={c.complaint_id} className="mt-4 flex items-start justify-between gap-3 border-t border-line pt-4 text-[13px]">
                <p className="line-clamp-2 font-semibold text-ink2">{c.subject}</p>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
