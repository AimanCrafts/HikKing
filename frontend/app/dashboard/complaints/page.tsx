"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, EmptyState, Label, Modal, Skeleton, StatusBadge, useToast } from "../../components/ui";
import { Booking, Complaint, createComplaint, getBookings, getComplaints } from "../../lib/api";
import { fmtDate } from "../../lib/format";

function Support() {
  const params = useSearchParams();
  const toast = useToast();
  const [items, setItems] = useState<Complaint[] | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [open, setOpen] = useState(!!params.get("booking"));
  const [bookingId, setBookingId] = useState(params.get("booking") ?? "");
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getComplaints(true).then(setItems).catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
    getBookings(true).then(setBookings).catch(() => {});
  }, [load]);

  async function submit() {
    setError(null);
    if (!bookingId) return setError("Choose which reservation this is about.");
    if (subject.trim().length < 5) return setError("Describe the problem in a few words.");
    setBusy(true);
    try {
      await createComplaint({ booking_id: Number(bookingId), subject: subject.trim() });
      toast("Support request sent");
      setOpen(false);
      setSubject("");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send your request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-lg text-[15px] text-ink2">Something not right with a trip? Tell us and we&rsquo;ll reply here.</p>
        <Button icon="plus" onClick={() => setOpen(true)} disabled={bookings.length === 0}>New request</Button>
      </div>

      {items === null ? (
        <Skeleton className="h-40" />
      ) : items.length === 0 ? (
        <EmptyState icon="message" title="No support requests" text={bookings.length === 0 ? "Once you have a reservation you can contact us about it here." : "If something goes wrong with a reservation, start a request and we\u2019ll follow up."} />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[28px] border border-line bg-surface">
          {items.map((c) => (
            <li key={c.complaint_id} className="flex flex-wrap items-start justify-between gap-4 p-6">
              <div className="min-w-0">
                <p className="text-[15.5px] font-extrabold text-ink">{c.subject}</p>
                <p className="mt-1 text-[13px] font-semibold text-ink3">
                  {c.booking?.package?.title ?? `Reservation #${c.booking_id}`}
                  {c.created_at ? ` \u2022 ${fmtDate(c.created_at)}` : ""}
                </p>
              </div>
              <StatusBadge status={c.status} />
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Contact support" width="max-w-md">
        <div className="space-y-5">
          <label className="block">
            <Label>Which reservation?</Label>
            <select value={bookingId} onChange={(e) => setBookingId(e.target.value)} className="field cursor-pointer">
              <option value="">Choose a reservation</option>
              {bookings.map((b) => (
                <option key={b.booking_id} value={b.booking_id}>{b.package?.title ?? `Reservation #${b.booking_id}`} ({fmtDate(b.travel_date)})</option>
              ))}
            </select>
          </label>
          <label className="block">
            <Label>What happened?</Label>
            <textarea value={subject} onChange={(e) => setSubject(e.target.value)} rows={4} className="field resize-none" placeholder="Describe the issue so we can help quickly" />
          </label>
          {error && <p role="alert" className="text-sm font-bold text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={busy} onClick={submit}>Send request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<Skeleton className="h-40" />}>
      <Support />
    </Suspense>
  );
}
