"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Chip, ConfirmDialog, StatusBadge, useToast } from "../../components/ui";
import { Booking, deleteBooking, getBookings, updateBookingStatus } from "../../lib/api";
import { fmtDate, money } from "../../lib/format";
import { AdminHeader, DataTable, RowActions } from "../components/AdminUI";

const FILTERS = [
  { v: "", label: "All" },
  { v: "pending", label: "Requested" },
  { v: "confirmed", label: "Confirmed" },
  { v: "completed", label: "Completed" },
  { v: "cancelled", label: "Cancelled" },
];

export default function AdminBookings() {
  const toast = useToast();
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [del, setDel] = useState<Booking | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(() => {
    getBookings().then(setRows).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => load(), [load]);

  async function setStatus(b: Booking, status: string, msg: string) {
    setBusy(b.booking_id);
    try {
      await updateBookingStatus(b.booking_id, status);
      toast(msg);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update", "error");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!del) return;
    try {
      await deleteBooking(del.booking_id);
      toast("Reservation deleted", "info");
      setDel(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not delete", "error");
    }
  }

  const list = filter ? rows.filter((r) => r.booking_status === filter) : rows;
  const count = (v: string) => (v ? rows.filter((r) => r.booking_status === v).length : rows.length);

  return (
    <>
      <AdminHeader title="Reservations" sub="Review requests, confirm trips and mark them completed." />
      <div className="scroll-x mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <Chip key={f.v} active={filter === f.v} onClick={() => setFilter(f.v)}>
            {f.label} <span className="opacity-60">{count(f.v)}</span>
          </Chip>
        ))}
      </div>
      <DataTable
        rows={[...list].sort((a, b) => b.booking_id - a.booking_id)}
        loading={loading}
        rowKey={(r) => r.booking_id}
        searchText={(r) => `${r.traveler?.name ?? ""} ${r.traveler?.email ?? ""} ${r.package?.title ?? ""} ${r.booking_id}`}
        searchPlaceholder="Search traveler or tour"
        empty={{ icon: "calendar", title: "No reservations here", text: "Requests from travelers appear here." }}
        cols={[
          { key: "id", header: "#", sort: (r) => r.booking_id, className: "w-16", cell: (r) => <span className="text-ink3">{r.booking_id}</span> },
          {
            key: "who",
            header: "Traveler",
            sort: (r) => r.traveler?.name ?? "",
            cell: (r) => (
              <div className="min-w-0">
                <p className="truncate font-extrabold text-ink">{r.traveler?.name ?? `User ${r.traveler_id}`}</p>
                <p className="truncate text-xs font-semibold text-ink3">{r.traveler?.email}</p>
              </div>
            ),
          },
          { key: "tour", header: "Tour", sort: (r) => r.package?.title ?? "", cell: (r) => <span className="line-clamp-1 max-w-[220px]">{r.package?.title ?? `Tour ${r.package_id}`}</span> },
          { key: "date", header: "Travel date", sort: (r) => r.travel_date, cell: (r) => fmtDate(r.travel_date) },
          { key: "n", header: "People", sort: (r) => r.total_travelers, cell: (r) => r.total_travelers },
          { key: "total", header: "Estimate", sort: (r) => Number(r.total_price), cell: (r) => <span className="font-extrabold text-ink">{money(r.total_price)}</span> },
          { key: "payment", header: "Payment", cell: (r) => { const p = r.payments?.[0]; return p ? <div className="min-w-[110px]"><p className="text-xs font-bold text-ink2">{p.payment_method.replace("_", " ")}</p><StatusBadge status={p.payment_status} /></div> : <span className="text-xs font-semibold text-ink3">Unpaid</span>; } },
          { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.booking_status} /> },
          {
            key: "act",
            header: "",
            className: "w-64",
            cell: (r) => (
              <div className="flex items-center justify-end gap-1.5">
                {r.booking_status === "pending" && <Button size="sm" loading={busy === r.booking_id} onClick={() => setStatus(r, "confirmed", "Reservation confirmed")}>Confirm</Button>}
                {r.booking_status === "confirmed" && <Button size="sm" variant="soft" loading={busy === r.booking_id} onClick={() => setStatus(r, "completed", "Marked as completed")}>Complete</Button>}
                {(r.booking_status === "pending" || r.booking_status === "confirmed") && <Button size="sm" variant="danger" disabled={busy === r.booking_id} onClick={() => setStatus(r, "cancelled", "Reservation cancelled")}>Cancel</Button>}
                {(r.booking_status === "cancelled" || r.booking_status === "completed") && <RowActions onDelete={() => setDel(r)} />}
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog open={!!del} title="Delete reservation?" text="This permanently removes the reservation record." onConfirm={remove} onClose={() => setDel(null)} />
    </>
  );
}
