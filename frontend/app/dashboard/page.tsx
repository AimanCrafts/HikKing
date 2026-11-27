"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Icon,
  Photo,
  Skeleton,
  StatusBadge,
  useToast,
} from "../components/ui";
import ReviewModal from "../components/ReviewModal";
import {
  Booking,
  Review,
  getBookings,
  getReviews,
  updateBookingStatus,
} from "../lib/api";
import { placeFor } from "../lib/catalog";
import { daysUntil, fmtDate, money, cx } from "../lib/format";

const FLOW = ["pending", "confirmed", "completed"] as const;
const FLOW_LABEL = {
  pending: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
};

function Timeline({ status }: { status: Booking["booking_status"] }) {
  if (status === "cancelled") {
    return (
      <p className="flex items-center gap-2 text-sm font-extrabold text-danger">
        <Icon name="close" size={16} /> This reservation was cancelled
      </p>
    );
  }
  const idx = FLOW.indexOf(status as (typeof FLOW)[number]);
  return (
    <ol
      className="flex items-center gap-2 text-[13px] font-extrabold"
      aria-label="Reservation progress"
    >
      {FLOW.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={cx(
              "flex h-6 w-6 items-center justify-center rounded-full",
              i <= idx ? "bg-jade text-on-jade" : "bg-sunk text-ink3",
            )}
          >
            {i < idx || status === "completed" ? (
              <Icon name="check" size={13} stroke={3} />
            ) : (
              <span className="h-2 w-2 rounded-full bg-current" />
            )}
          </span>
          <span className={i <= idx ? "text-ink" : "text-ink3"}>
            {FLOW_LABEL[s]}
          </span>
          {i < FLOW.length - 1 && (
            <span
              className={cx(
                "h-0.5 w-6 rounded-full sm:w-10",
                i < idx ? "bg-jade" : "bg-line",
              )}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

export default function TripsPage() {
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [cancel, setCancel] = useState<Booking | null>(null);
  const [rate, setRate] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [b, r] = await Promise.all([
        getBookings(true),
        getReviews().catch(() => [] as Review[]),
      ]);
      setBookings(b);
      setReviews(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your trips.");
      setBookings([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function doCancel() {
    if (!cancel) return;
    setBusy(true);
    try {
      await updateBookingStatus(cancel.booking_id, "cancelled");
      toast("Reservation cancelled", "info");
      setCancel(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not cancel", "error");
    } finally {
      setBusy(false);
    }
  }

  if (bookings === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    );
  }

  const sorted = [...bookings].sort((a, b) =>
    b.travel_date.localeCompare(a.travel_date),
  );
  const upcoming = sorted.filter(
    (b) => b.booking_status === "pending" || b.booking_status === "confirmed",
  );
  const past = sorted.filter(
    (b) => b.booking_status === "completed" || b.booking_status === "cancelled",
  );
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {(
          [
            ["upcoming", "Upcoming", upcoming.length],
            ["past", "Past", past.length],
          ] as const
        ).map(([k, label, n]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cx(
              "inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-extrabold transition",
              tab === k
                ? "bg-ink text-bg"
                : "border border-line bg-surface text-ink2 hover:border-ink",
            )}
          >
            {label}{" "}
            <span
              className={cx(
                "rounded-full px-2 text-xs",
                tab === k ? "bg-white/20" : "bg-sunk",
              )}
            >
              {n}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-xl bg-danger-soft p-4 text-sm font-bold text-danger"
        >
          {error}
        </p>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon="calendar"
          title={tab === "upcoming" ? "No upcoming trips" : "No past trips yet"}
          text={
            tab === "upcoming"
              ? "Find a trip you like and send a reservation request."
              : "Completed and cancelled reservations will show up here."
          }
          action={<Button href="/packages">Browse tours</Button>}
        />
      ) : (
        <ul className="space-y-5">
          {list.map((b) => {
            const pkg = b.package;
            const img =
              pkg?.image_url ||
              placeFor(pkg?.destination?.name)?.image ||
              "/hero/rangamati.jpg";
            const left = daysUntil(b.travel_date);
            const reviewed = reviews.some((r) => r.booking_id === b.booking_id);
            const latestPayment = b.payments?.[0];
            return (
              <li
                key={b.booking_id}
                className="overflow-hidden rounded-[28px] border border-line bg-surface sm:flex"
              >
                <div className="relative h-48 sm:h-auto sm:w-60 sm:shrink-0">
                  <Photo src={img} alt={pkg?.title ?? "Trip"} />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[13px] font-bold text-ink3">
                        <Icon name="pin" size={14} />{" "}
                        {pkg?.destination?.name ?? "Bangladesh"}
                      </p>
                      <h2 className="mt-1 text-xl font-extrabold leading-snug tracking-tight text-ink">
                        <Link
                          href={`/packages/${b.package_id}`}
                          className="hover:text-jade"
                        >
                          {pkg?.title ?? `Reservation #${b.booking_id}`}
                        </Link>
                      </h2>
                    </div>
                    <StatusBadge status={b.booking_status} />
                  </div>

                  {(b.booking_status === "pending" ||
                    b.booking_status === "confirmed") && (
                    <p className="mt-4 flex items-start gap-2 rounded-xl bg-jade-soft p-3 text-[13px] font-semibold text-ink2">
                      <Icon
                        name="mail"
                        size={16}
                        className="mt-0.5 shrink-0 text-jade"
                      />
                      {b.booking_status === "pending"
                        ? "Pickup point, departure time and transport details will be emailed to you once this reservation is confirmed."
                        : "Pickup point, departure time and transport details will be sent to your email before the trip. Please keep an eye on your inbox."}
                    </p>
                  )}

                  <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-[14px] font-bold text-ink2">
                    <div className="flex items-center gap-2">
                      <Icon name="calendar" size={16} className="text-jade" />{" "}
                      {fmtDate(b.travel_date)}
                      {(b.booking_status === "pending" ||
                        b.booking_status === "confirmed") &&
                        left >= 0 && (
                          <Badge tone="sun">
                            {left === 0
                              ? "Today"
                              : left === 1
                                ? "Tomorrow"
                                : `In ${left} days`}
                          </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="users" size={16} className="text-jade" />{" "}
                      {b.total_travelers} traveler
                      {b.total_travelers > 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="tag" size={16} className="text-jade" />{" "}
                      {money(b.total_price)} estimated
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="info" size={16} className="text-jade" />{" "}
                      Payment:{" "}
                      <Badge
                        tone={
                          latestPayment?.payment_status === "paid"
                            ? "jade"
                            : latestPayment?.payment_status === "failed"
                              ? "danger"
                              : "warn"
                        }
                      >
                        {latestPayment?.payment_status ?? "unpaid"}
                      </Badge>
                    </div>
                  </dl>

                  <div className="mt-5">
                    <Timeline status={b.booking_status} />
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {b.booking_status === "completed" && !reviewed && (
                      <Button size="sm" icon="star" onClick={() => setRate(b)}>
                        Write a review
                      </Button>
                    )}
                    {b.booking_status === "completed" && (
                      <Button
                        size="sm"
                        variant="soft"
                        icon="camera"
                        href="/stories/share"
                      >
                        Share your story
                      </Button>
                    )}
                    {b.booking_status === "pending" && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setCancel(b)}
                      >
                        Cancel request
                      </Button>
                    )}
                    {b.booking_status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon="message"
                        href={`/dashboard/complaints?booking=${b.booking_id}`}
                      >
                        Get help
                      </Button>
                    )}
                    {b.booking_status !== "cancelled" &&
                      b.booking_status !== "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          href={`/checkout/${b.booking_id}`}
                        >
                          Payment
                        </Button>
                      )}
                    <Button
                      size="sm"
                      variant="ghost"
                      href={`/packages/${b.package_id}`}
                    >
                      View tour
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!cancel}
        title="Cancel this request?"
        text="Your reservation request will be withdrawn. You can send a new one any time."
        confirmLabel="Cancel request"
        busy={busy}
        onConfirm={doCancel}
        onClose={() => setCancel(null)}
      />
      <ReviewModal
        booking={rate}
        open={!!rate}
        onClose={() => setRate(null)}
        onDone={load}
      />
    </div>
  );
}
