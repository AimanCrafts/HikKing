"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "../../components/Shell";
import { WishButton } from "../../components/TourCard";
import ReviewModal from "../../components/ReviewModal";
import TravelNotice from "../../components/TravelNotice";
import {
  Avatar,
  Badge,
  Button,
  Icon,
  Photo,
  Skeleton,
  Stars,
  useToast,
  Label,
  Modal,
} from "../../components/ui";
import {
  Booking,
  Review,
  createBooking,
  getBookings,
  getPackage,
  getReviews,
} from "../../lib/api";
import {
  DEMO_TOURS,
  Tour,
  placeFor,
  seasonRange,
  tourFromPackage,
} from "../../lib/catalog";
import { useUser } from "../../lib/hooks";
import { cx, fmtDate, money } from "../../lib/format";

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

function Gallery({ tour }: { tour: Tour }) {
  const [open, setOpen] = useState<number | null>(null);
  const imgs = tour.gallery.slice(0, 5);
  const step = useCallback(
    (d: number) =>
      setOpen((i) => (i === null ? i : (i + d + imgs.length) % imgs.length)),
    [imgs.length],
  );

  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, step]);

  return (
    <>
      <div
        className={cx(
          "grid gap-3 overflow-hidden rounded-[32px]",
          imgs.length > 1
            ? "h-[300px] grid-cols-4 grid-rows-2 sm:h-[460px]"
            : "h-[300px] sm:h-[460px]",
        )}
      >
        {imgs.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1}`}
            className={cx(
              "group relative overflow-hidden bg-sunk",
              i === 0 && imgs.length > 1
                ? "col-span-4 row-span-2 sm:col-span-2"
                : i === 0
                  ? ""
                  : "hidden sm:block",
            )}
          >
            <Photo
              src={src}
              alt={i === 0 ? tour.title : `${tour.place} photo ${i + 1}`}
              eager={i === 0}
              className="transition duration-700 group-hover:scale-105"
            />
            {i === Math.min(imgs.length, 5) - 1 && imgs.length > 1 && (
              <span className="absolute bottom-3 right-3 hidden items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-[13px] font-extrabold text-[#0b2623] shadow-sm sm:flex">
                <Icon name="expand" size={15} /> View photos
              </span>
            )}
          </button>
        ))}
      </div>
      <Modal
        open={open !== null}
        onClose={() => setOpen(null)}
        width="max-w-5xl"
        flush
      >
        {open !== null && (
          <div className="relative bg-black">
            <div className="aspect-[16/10] w-full">
              <Photo
                src={imgs[open]}
                alt={`${tour.place} photo ${open + 1}`}
                className="!object-contain"
              />
            </div>
            {imgs.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => step(-1)}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0b2623] shadow transition hover:scale-105"
                >
                  <Icon name="chevronLeft" size={22} />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => step(1)}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0b2623] shadow transition hover:scale-105"
                >
                  <Icon name="chevronRight" size={22} />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
                  {open + 1} / {imgs.length}
                </span>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Reservation card                                                    */
/* ------------------------------------------------------------------ */

function ReserveCard({
  tour,
  stat,
}: {
  tour: Tour;
  stat?: { avg: number; count: number };
}) {
  const { user } = useUser();
  const router = useRouter();
  const toast = useToast();
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const max = tour.maxTravelers ?? 20;
  const total = tour.price * guests;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!date) return setError("Choose the date you want to travel.");
    setBusy(true);
    try {
      const b = await createBooking({
        package_id: tour.id,
        travel_date: date,
        total_travelers: guests,
      });
      toast("Reservation created");
      router.push(`/checkout/${b.booking_id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send your request.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[28px] border border-line bg-surface p-6 shadow-[var(--shadow-lift)] sm:p-7"
    >
      <div className="flex items-end justify-between gap-3">
        <p>
          {tour.oldPrice ? (
            <span className="mr-2 text-sm font-semibold text-ink3 line-through">
              {money(tour.oldPrice)}
            </span>
          ) : null}
          <span className="text-3xl font-black tracking-tight text-ink">
            {money(tour.price)}
          </span>
          <span className="ml-1.5 text-sm font-bold text-ink2">per person</span>
        </p>
        {stat ? (
          <span className="inline-flex items-center gap-1 text-sm font-extrabold">
            <Icon name="star" size={15} fill className="text-sun" />{" "}
            {stat.avg.toFixed(1)}
          </span>
        ) : (
          <Badge tone="jade">New</Badge>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <Label>Travel date</Label>
          <input
            type="date"
            min={tomorrow}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field"
            disabled={!tour.live}
          />
        </label>
        <div>
          <Label
            hint={tour.maxTravelers ? `Up to ${tour.maxTravelers}` : undefined}
          >
            Travelers
          </Label>
          <div className="flex items-center justify-between rounded-[14px] border-[1.5px] border-line px-4 py-2.5">
            <span className="flex items-center gap-2 text-[15px] font-bold text-ink">
              <Icon name="users" size={18} className="text-ink3" /> {guests}{" "}
              traveler{guests > 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Fewer travelers"
                disabled={guests <= 1 || !tour.live}
                onClick={() => setGuests((g) => g - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line transition hover:border-ink disabled:opacity-40"
              >
                <Icon name="minus" size={15} />
              </button>
              <button
                type="button"
                aria-label="More travelers"
                disabled={guests >= max || !tour.live}
                onClick={() => setGuests((g) => g + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line transition hover:border-ink disabled:opacity-40"
              >
                <Icon name="plus" size={15} />
              </button>
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-6 space-y-2 border-t border-line pt-5 text-[15px]">
        <div className="flex justify-between text-ink2">
          <dt>
            {money(tour.price)} &times; {guests}
          </dt>
          <dd className="font-bold">{money(total)}</dd>
        </div>
        <div className="flex justify-between text-lg font-black text-ink">
          <dt>Estimated total</dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>

      {tour.live && user?.role !== "admin" && <TravelNotice className="mt-5" />}
      {error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm font-bold text-danger"
        >
          <Icon name="alert" size={17} className="mt-0.5" /> {error}
        </p>
      )}

      {!tour.live ? (
        <p className="mt-5 rounded-xl bg-info-soft p-3 text-sm font-semibold text-info">
          This is a sample tour. Reservations open once real tours are
          published.
        </p>
      ) : user ? (
        user.role === "admin" ? (
          <p className="mt-5 rounded-xl bg-sunk p-3 text-sm font-semibold text-ink2">
            You&rsquo;re signed in as an admin. Use a traveler account to
            reserve.
          </p>
        ) : (
          <Button type="submit" size="lg" full loading={busy} className="mt-5">
            Continue to checkout
          </Button>
        )
      ) : (
        <Button
          href={`/login?next=${encodeURIComponent(`/packages/${tour.id}`)}`}
          size="lg"
          full
          className="mt-5"
        >
          Log in to reserve
        </Button>
      )}
      <p className="mt-3 text-center text-xs font-semibold text-ink3">
        Review your reservation and payment options at checkout.
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

function Reviews({
  tour,
  reviews,
  reload,
}: {
  tour: Tour;
  reviews: Review[];
  reload: () => void;
}) {
  const { user } = useUser();
  const [eligible, setEligible] = useState<Booking | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "traveler" || !tour.live) {
      setEligible(null);
      return;
    }
    getBookings(true)
      .then((list) => {
        const done = list.find(
          (b) =>
            b.package_id === tour.id &&
            b.booking_status === "completed" &&
            !reviews.some((r) => r.booking_id === b.booking_id),
        );
        setEligible(done ?? null);
      })
      .catch(() => setEligible(null));
  }, [user, tour.id, tour.live, reviews]);

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    c: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <section id="reviews" className="scroll-mt-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="t-h2 text-ink">Traveler reviews</h2>
        {eligible && (
          <Button variant="outline" icon="edit" onClick={() => setOpen(true)}>
            Write a review
          </Button>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-sunk p-6 text-[15px] font-semibold text-ink2">
          No reviews yet. Only travelers who completed this trip can leave one,
          so every review comes from someone who went.
        </p>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
          <div>
            <p className="text-6xl font-black tracking-tighter text-ink">
              {avg.toFixed(1)}
            </p>
            <Stars value={avg} size={18} className="mt-2" />
            <p className="mt-1.5 text-sm font-bold text-ink3">
              {reviews.length} review{reviews.length > 1 ? "s" : ""}
            </p>
            <ul className="mt-5 space-y-1.5">
              {dist.map((d) => (
                <li
                  key={d.n}
                  className="flex items-center gap-2.5 text-[13px] font-bold text-ink2"
                >
                  <span className="w-3">{d.n}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-sunk">
                    <span
                      className="block h-full rounded-full bg-sun"
                      style={{ width: `${(d.c / reviews.length) * 100}%` }}
                    />
                  </span>
                  <span className="w-5 text-right text-ink3">{d.c}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {reviews.slice(0, 8).map((r) => (
              <li key={r.review_id}>
                <div className="flex items-center gap-3">
                  <Avatar name={r.traveler?.name ?? "Traveler"} size={42} />
                  <div>
                    <p className="text-[15px] font-extrabold text-ink">
                      {r.traveler?.name ?? "Traveler"}
                    </p>
                    <p className="flex items-center gap-2 text-xs font-bold text-ink3">
                      <Stars value={r.rating} size={13} />
                      {r.created_at
                        ? fmtDate(r.created_at, {
                            month: "short",
                            year: "numeric",
                          })
                        : null}
                    </p>
                  </div>
                </div>
                {r.comment ? (
                  <p className="mt-3 text-[15px] leading-relaxed text-ink2">
                    {r.comment}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
      <ReviewModal
        booking={eligible}
        open={open}
        onClose={() => setOpen(false)}
        onDone={reload}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const FAQ = [
  {
    q: "How does payment work?",
    a: "After creating your reservation, continue to checkout to choose a payment method. Cash and bank-transfer records may remain pending until an admin confirms them.",
  },
  {
    q: "Can I change or cancel a request?",
    a: "You can cancel a pending request from My trips. For confirmed trips, see our cancellation policy for what applies.",
  },
  {
    q: "What if something goes wrong on the trip?",
    a: "Open a support request from your account and reference the reservation. Our team replies there.",
  },
];

export default function TourPage() {
  const { id } = useParams<{ id: string }>();
  const tourId = Number(id);
  const [tour, setTour] = useState<Tour | null>(null);
  const [missing, setMissing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faq, setFaq] = useState<number | null>(0);
  const toast = useToast();

  const loadReviews = useCallback(() => {
    getReviews(tourId)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [tourId]);

  useEffect(() => {
    let alive = true;
    getPackage(tourId)
      .then((p) => {
        if (!alive) return;
        setTour(tourFromPackage(p));
        loadReviews();
      })
      .catch(() => {
        if (!alive) return;
        const demo = DEMO_TOURS.find((t) => t.id === tourId);
        if (demo) setTour(demo);
        else setMissing(true);
      });
    return () => {
      alive = false;
    };
  }, [tourId, loadReviews]);

  const stat = useMemo(
    () =>
      reviews.length
        ? {
            avg: reviews.reduce((s, r) => s + r.rating, 0) / reviews.length,
            count: reviews.length,
          }
        : undefined,
    [reviews],
  );
  const place = tour ? placeFor(tour.place) : undefined;

  if (missing) {
    return (
      <Shell>
        <div className="wrap py-28 text-center">
          <h1 className="t-h1 text-ink">We couldn&rsquo;t find that tour</h1>
          <p className="mt-3 text-ink2">
            It may have been unpublished or the link is wrong.
          </p>
          <Button href="/packages" className="mt-8">
            Browse all tours
          </Button>
        </div>
      </Shell>
    );
  }

  if (!tour) {
    return (
      <Shell>
        <div className="wrap py-10">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-6 h-[420px] rounded-[32px]" />
          <Skeleton className="mt-8 h-10 w-2/3" />
        </div>
      </Shell>
    );
  }

  const facts: {
    icon: "clock" | "users" | "calendar" | "tag";
    label: string;
    value: string;
  }[] = [
    {
      icon: "clock",
      label: "Duration",
      value: `${tour.days} days, ${tour.nights} night${tour.nights === 1 ? "" : "s"}`,
    },
    {
      icon: "users",
      label: "Group size",
      value: tour.maxTravelers
        ? `Up to ${tour.maxTravelers} people`
        : "Flexible",
    },
    {
      icon: "calendar",
      label: "Best time",
      value: place ? seasonRange(place.months) : "Year-round",
    },
    { icon: "tag", label: "Trip type", value: tour.categories.join(", ") },
  ];

  return (
    <Shell>
      <div className="wrap pb-28 pt-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-2 text-[13px] font-bold text-ink3"
        >
          <Link href="/packages" className="hover:text-ink">
            Tours
          </Link>
          <Icon name="chevronRight" size={14} />
          <span className="truncate text-ink2">{tour.title}</span>
        </nav>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="t-h1 max-w-3xl text-ink">{tour.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14.5px] font-bold text-ink2">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="pin" size={16} /> {tour.place}, {tour.region}
              </span>
              {stat ? (
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-1.5 hover:text-ink"
                >
                  <Icon name="star" size={16} fill className="text-sun" />{" "}
                  {stat.avg.toFixed(1)}{" "}
                  <span className="text-ink3">({stat.count} reviews)</span>
                </a>
              ) : (
                <Badge tone="jade">New</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon="send"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(window.location.href)
                  .then(() => toast("Link copied", "info"))
                  .catch(() => {});
              }}
            >
              Share
            </Button>
            <WishButton
              id={tour.id}
              className="!h-9 !w-9 border border-line !bg-surface"
            />
          </div>
        </div>

        <Gallery tour={tour} />

        <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0 space-y-16">
            <dl className="grid grid-cols-2 gap-6 border-y border-line py-6 sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <Icon name={f.icon} size={22} className="mt-0.5 text-jade" />
                  <div>
                    <dt className="text-xs font-bold text-ink3">{f.label}</dt>
                    <dd className="mt-0.5 text-[14.5px] font-extrabold leading-snug text-ink">
                      {f.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <section>
              <h2 className="t-h2 text-ink">About this trip</h2>
              <p className="t-lead mt-4 max-w-2xl whitespace-pre-line text-ink2">
                {tour.summary}
              </p>
              {place && (
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink2">
                  {place.desc}
                </p>
              )}
            </section>

            <section>
              <h2 className="t-h2 text-ink">What&rsquo;s included</h2>
              <ul className="mt-6 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
                {tour.includes.map((it) => (
                  <li
                    key={it}
                    className="flex items-start gap-3 text-[15px] font-semibold text-ink2"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade-soft text-jade">
                      <Icon name="check" size={14} stroke={2.6} />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="t-h2 text-ink">Day by day</h2>
              {tour.itinerary.length === 0 ? (
                <p className="mt-5 rounded-2xl bg-sunk p-6 text-[15px] font-semibold text-ink2">
                  The detailed itinerary for this trip is being finalised. Send
                  a request and we&rsquo;ll share it with you.
                </p>
              ) : (
                <ol className="relative mt-8 space-y-9 border-l-2 border-dashed border-line pl-8">
                  {tour.itinerary.map((d, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[49px] top-0 flex h-9 w-9 items-center justify-center rounded-full bg-jade text-xs font-black text-on-jade ring-4 ring-bg">
                        {i + 1}
                      </span>
                      <p className="text-sm font-black text-jade">
                        Day {i + 1}
                      </p>
                      <h3 className="t-h3 mt-0.5 text-ink">{d.title}</h3>
                      {d.text ? (
                        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink2">
                          {d.text}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {tour.hotels.length > 0 && (
              <section>
                <h2 className="t-h2 text-ink">Where you&rsquo;ll stay</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {tour.hotels.map((h) => (
                    <li
                      key={h.hotel_id}
                      className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-jade-soft text-jade">
                        <Icon name="hotel" size={22} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-extrabold text-ink">
                          {h.hotel_name}
                        </p>
                        <p className="truncate text-[13px] font-semibold text-ink3">
                          {h.address ?? "Address shared on confirmation"}
                        </p>
                        {h.star_rating ? (
                          <Stars
                            value={h.star_rating}
                            size={13}
                            className="mt-1"
                          />
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {place && (
              <section>
                <h2 className="t-h2 text-ink">Good to know</h2>
                <p className="mt-4 text-[15px] font-semibold text-ink2">
                  {place.season}
                </p>
                <ul className="mt-5 space-y-3">
                  {place.tips.map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-3 text-[15px] text-ink2"
                    >
                      <Icon
                        name="info"
                        size={18}
                        className="mt-0.5 text-jade"
                      />{" "}
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Reviews tour={tour} reviews={reviews} reload={loadReviews} />

            <section>
              <h2 className="t-h2 text-ink">Questions</h2>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {FAQ.map((f, i) => (
                  <li key={f.q}>
                    <button
                      type="button"
                      onClick={() => setFaq(faq === i ? null : i)}
                      aria-expanded={faq === i}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left text-[16px] font-extrabold text-ink"
                    >
                      {f.q}
                      <Icon
                        name={faq === i ? "minus" : "plus"}
                        size={20}
                        className="text-ink3"
                      />
                    </button>
                    {faq === i && (
                      <p className="hk-pop pb-5 pr-10 text-[15px] leading-relaxed text-ink2">
                        {f.a}{" "}
                        <Link
                          href="/legal/refunds"
                          className="font-extrabold text-jade underline"
                        >
                          Cancellation policy
                        </Link>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <ReserveCard tour={tour} stat={stat} />
            </div>
          </aside>
        </div>

        {/* Mobile reservation */}
        <div className="mt-14 lg:hidden">
          <ReserveCard tour={tour} stat={stat} />
        </div>
      </div>
    </Shell>
  );
}
