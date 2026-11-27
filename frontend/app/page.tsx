"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "./components/Shell";
import TourCard, { TourCardSkeleton } from "./components/TourCard";
import BangladeshMap from "./components/BangladeshMap";
import { Button, Chip, Icon, IconButton, Photo, Polaroid, SectionHead, tiltFor } from "./components/ui";
import { HERO_IMAGES, KIND_TILES, MONTHS, PLACES, placesForMonth } from "./lib/catalog";
import { useTours } from "./lib/hooks";
import { Story, loadStories } from "./lib/stories";
import { cx } from "./lib/format";

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function SearchDock() {
  const router = useRouter();
  const [place, setPlace] = useState("");
  const [month, setMonth] = useState("");
  const [guests, setGuests] = useState(2);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (place) q.set("q", place);
    if (month) q.set("month", month);
    q.set("guests", String(guests));
    router.push(`/packages?${q.toString()}`);
  }

  const cell = "flex flex-1 flex-col gap-0.5 rounded-2xl px-5 py-3 text-left transition hover:bg-sunk focus-within:bg-sunk";
  const lab = "text-xs font-extrabold text-ink3";
  const sel = "w-full cursor-pointer appearance-none bg-transparent text-[15px] font-extrabold text-ink outline-none";

  return (
    <form onSubmit={go} className="flex w-full max-w-4xl flex-col gap-1 rounded-[32px] bg-surface p-2 text-ink shadow-[var(--shadow-pop)] md:flex-row md:items-stretch md:rounded-full">
      <label className={cell}>
        <span className={lab}>Where</span>
        <select value={place} onChange={(e) => setPlace(e.target.value)} className={sel}>
          <option value="">Anywhere in Bangladesh</option>
          {PLACES.map((p) => (
            <option key={p.slug} value={p.match[0]}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <span className="my-3 hidden w-px bg-line md:block" />
      <label className={cell}>
        <span className={lab}>When</span>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className={sel}>
          <option value="">Any month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <span className="my-3 hidden w-px bg-line md:block" />
      <div className={cell}>
        <span className={lab}>Travelers</span>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Fewer travelers" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-ink2 transition hover:border-ink hover:text-ink">
            <Icon name="minus" size={14} />
          </button>
          <span className="min-w-[1.5rem] text-center text-[15px] font-extrabold">{guests}</span>
          <button type="button" aria-label="More travelers" onClick={() => setGuests((g) => Math.min(20, g + 1))} className="flex h-6 w-6 items-center justify-center rounded-full border border-line text-ink2 transition hover:border-ink hover:text-ink">
            <Icon name="plus" size={14} />
          </button>
        </div>
      </div>
      <Button type="submit" size="lg" icon="search" className="md:ml-1 md:px-9">
        Find trips
      </Button>
    </form>
  );
}

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % HERO_IMAGES.length), 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-[#08130f] text-white">
      {HERO_IMAGES.map((h, idx) => (
        <div key={h.src} className={cx("absolute inset-0 -z-10 transition-opacity duration-[1600ms] ease-in-out", idx === i ? "opacity-100" : "opacity-0")} aria-hidden={idx !== i}>
          <Photo src={h.src} alt={h.place} eager={idx === 0} className="origin-center" style={idx === i ? { animation: "hk-kenburns 9s ease-out both" } : undefined} />
        </div>
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06140f] via-[#06140f]/45 to-[#06140f]/25" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black/45 to-transparent" />

      <div className="wrap pb-14 pt-40 sm:pb-20">
        <h1 className="t-display max-w-4xl" style={{ animation: "hk-rise .9s cubic-bezier(.2,.8,.2,1) both" }}>
          Weekend trips across Bangladesh, planned for you.
        </h1>
        <p className="t-lead mt-6 max-w-xl text-white/85" style={{ animation: "hk-rise .9s .12s cubic-bezier(.2,.8,.2,1) both" }}>
          Cloud-level cottages in Sajek, mangrove boats in the Sundarbans, beach camps in Cox&rsquo;s Bazar. Choose a trip, send a reservation request and we confirm it.
        </p>
        <div className="mt-9" style={{ animation: "hk-rise .9s .24s cubic-bezier(.2,.8,.2,1) both" }}>
          <SearchDock />
        </div>

        <div className="mt-8 flex items-center gap-4 text-sm font-bold text-white/80">
          <span className="flex items-center gap-1.5">
            <Icon name="pin" size={16} /> {HERO_IMAGES[i].place}
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            {HERO_IMAGES.map((h, idx) => (
              <button key={h.src} type="button" tabIndex={-1} onClick={() => setI(idx)} className={cx("h-1 rounded-full transition-all duration-500", idx === i ? "w-9 bg-white" : "w-4 bg-white/40")} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function KindTiles() {
  const pos = [
    "sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-auto",
    "aspect-[4/3]",
    "aspect-[4/3]",
    "aspect-[4/3]",
    "aspect-[4/3]",
  ];
  return (
    <section className="wrap pt-24">
      <SectionHead title="What kind of trip do you want?" sub="Start from the feeling you&rsquo;re after. Each one opens the matching tours." />
      <div className="mt-10 grid gap-4 sm:grid-cols-4 sm:grid-rows-2">
        {KIND_TILES.map((t, i) => (
          <Link key={t.kind} href={`/packages?kind=${t.kind}`} className={cx("group relative overflow-hidden rounded-[28px] bg-sunk sm:min-h-[220px]", pos[i])}>
            <Photo src={t.image} alt={t.kind} className="transition duration-700 ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-white">
              <div>
                <h3 className={cx("font-black tracking-tight", i === 0 ? "text-3xl sm:text-4xl" : "text-xl")}>{t.kind}</h3>
                <p className="mt-0.5 text-sm font-semibold text-white/80">{t.blurb}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/40 backdrop-blur transition group-hover:bg-white group-hover:text-ink">
                <Icon name="arrowUpRight" size={18} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedTours() {
  const { tours, loading, stats } = useTours();
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * 360, behavior: "smooth" });

  return (
    <section className="pt-24">
      <div className="wrap">
        <SectionHead
          title="Trips people are booking"
          sub="Short, well-planned trips with the itinerary shown upfront."
          action={
            <div className="flex items-center gap-2">
              <IconButton icon="chevronLeft" label="Scroll left" onClick={() => scroll(-1)} className="border border-line bg-surface" />
              <IconButton icon="chevronRight" label="Scroll right" onClick={() => scroll(1)} className="border border-line bg-surface" />
              <Button href="/packages" variant="outline" size="sm" className="ml-2">
                View all tours
              </Button>
            </div>
          }
        />
      </div>
      <div ref={rail} className="scroll-x mt-10 flex snap-x gap-6 pb-4 pl-[max(1.1rem,calc((100vw-1240px)/2+2.5rem))] pr-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[300px] shrink-0 sm:w-[340px]">
                <TourCardSkeleton />
              </div>
            ))
          : tours.slice(0, 8).map((t) => <TourCard key={t.id} tour={t} stat={stats[t.id]} className="w-[300px] shrink-0 snap-start sm:w-[340px]" />)}
      </div>
    </section>
  );
}

function MapSection() {
  return (
    <section className="mt-28 bg-surface py-24">
      <div className="wrap">
        <SectionHead title="Find it on the map" sub="Tap a pin to see what the place is like, when to go and which tours run there." className="mb-12" />
        <BangladeshMap />
      </div>
    </section>
  );
}

function Seasons() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const list = placesForMonth(month);
  return (
    <section className="wrap pt-28">
      <SectionHead title="What&rsquo;s good this month?" sub="Weather decides a trip. Pick a month and see where it&rsquo;s at its best." />
      <div className="scroll-x mt-8 flex gap-2 pb-1">
        {MONTHS.map((m, i) => (
          <Chip key={m} active={month === i + 1} onClick={() => setMonth(i + 1)}>
            {m}
          </Chip>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.length === 0 ? (
          <p className="col-span-full rounded-3xl bg-sunk p-8 text-center font-bold text-ink2">Most places are quieter this month. Try a neighbouring month.</p>
        ) : (
          list.slice(0, 8).map((p) => (
            <Link key={p.slug} href={`/packages?q=${encodeURIComponent(p.match[0])}`} className="group flex items-center gap-4 rounded-3xl border border-line bg-surface p-3 transition hover:border-jade hover:shadow-[var(--shadow-lift)]">
              <span className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                <Photo src={p.image} alt={p.name} className="transition duration-500 group-hover:scale-110" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-extrabold text-ink">{p.name}</span>
                <span className="mt-0.5 block text-[13px] font-semibold text-ink3">{p.line}</span>
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: "compass", title: "Choose a trip", text: "Browse tours and read the full day-by-day itinerary before you decide." },
    { icon: "calendar", title: "Pick a date", text: "Choose when you want to travel and how many people are coming." },
    { icon: "send", title: "Send a request", text: "Your reservation request reaches our team. You don&rsquo;t pay on the site." },
    { icon: "check", title: "We confirm it", text: "You&rsquo;ll get a notification here as soon as your trip is confirmed." },
  ] as const;
  return (
    <section className="wrap pt-28">
      <SectionHead title="How a reservation works" />
      <ol className="relative mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <span className="pointer-events-none absolute left-6 right-6 top-6 hidden h-px bg-line lg:block" aria-hidden="true" />
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-jade text-on-jade shadow-[0_10px_22px_-10px_var(--jade)]">
              <Icon name={s.icon} size={22} />
            </span>
            <p className="mt-5 text-sm font-black text-jade">Step {i + 1}</p>
            <h3 className="t-h3 mt-1 text-ink">{s.title}</h3>
            <p className="mt-2 max-w-[260px] text-[14.5px] leading-relaxed text-ink2" dangerouslySetInnerHTML={{ __html: s.text }} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function StoriesFan() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  useEffect(() => {
    loadStories()
      .then((s) => setStories(s.filter((x) => x.photos.length).slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <section className="relative mt-28 overflow-hidden bg-jade-deep py-24 text-white">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#35c9a4]/15 blur-3xl" aria-hidden="true" />
      <div className="wrap relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="t-h1">Trips, told by the people who took them.</h2>
            <p className="t-lead mt-4 text-white/75">Real photos and short stories from travelers. Share yours after your trip and it joins the wall.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/stories/share" variant="sun" size="lg" icon="camera">
              Share your trip
            </Button>
            <Button href="/stories" variant="glass" size="lg">
              Read all stories
            </Button>
          </div>
        </div>

        <div className="scroll-x mt-16 flex items-start gap-0 pb-10 pt-6 sm:justify-center">
          {stories.map((s, i) => (
            <div key={s.id} className={cx("w-[210px] shrink-0 sm:w-[230px]", i > 0 && "-ml-4 sm:-ml-7", i % 2 === 1 && "mt-8")} style={{ zIndex: i % 2 === 0 ? 2 : 1 }}>
              <Polaroid src={s.photos[0].src} caption={s.place} tilt={tiltFor(i)} onClick={() => router.push(`/stories?open=${encodeURIComponent(s.id)}`)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reassurance() {
  const items = [
    { icon: "map", title: "Itineraries you can read first", text: "Every tour shows the day-by-day plan, where you&rsquo;ll stay and what&rsquo;s included before you send a request." },
    { icon: "shield", title: "Reviews from people who went", text: "Only travelers with a completed trip can review it, so ratings reflect real experiences." },
    { icon: "message", title: "A team you can reach", text: "Something wrong during or after a trip? Raise a support request from your account and we reply there." },
  ] as const;
  return (
    <section className="wrap pt-28">
      <div className="grid gap-12 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.title}>
            <Icon name={it.icon} size={30} className="text-jade" stroke={1.6} />
            <h3 className="t-h3 mt-5 text-ink">{it.title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-ink2" dangerouslySetInnerHTML={{ __html: it.text }} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ClosingBand() {
  return (
    <section className="wrap pt-28">
      <div className="relative isolate overflow-hidden rounded-[40px] px-8 py-20 text-white sm:px-16 sm:py-28">
        <Photo src="/hero/coxsbazar.jpg" alt="" className="absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#06140f]/90 via-[#06140f]/60 to-transparent" />
        <h2 className="t-h1 max-w-xl">Not sure where to start?</h2>
        <p className="t-lead mt-4 max-w-md text-white/80">Look at what&rsquo;s running in the next few weeks, or let the season guide pick for you.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/packages" variant="sun" size="lg">
            Browse all tours
          </Button>
          <Button href="/destination" variant="glass" size="lg">
            Explore destinations
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Shell overlay>
      <Hero />
      <KindTiles />
      <FeaturedTours />
      <MapSection />
      <Seasons />
      <HowItWorks />
      <StoriesFan />
      <Reassurance />
      <ClosingBand />
    </Shell>
  );
}
