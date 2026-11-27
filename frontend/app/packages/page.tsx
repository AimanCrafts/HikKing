"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Shell from "../components/Shell";
import TourCard, { TourCardSkeleton } from "../components/TourCard";
import { Button, Chip, EmptyState, Icon } from "../components/ui";
import { MONTHS, TOUR_KINDS, placeFor } from "../lib/catalog";
import { useTours } from "../lib/hooks";

type Sort = "recommended" | "price-asc" | "price-desc" | "shortest";

function Listing() {
  const params = useSearchParams();
  const { tours, loading, live, stats } = useTours();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [kind, setKind] = useState(params.get("kind") ?? "");
  const [month, setMonth] = useState(params.get("month") ?? "");
  const [guests, setGuests] = useState(params.get("guests") ?? "");
  const [sort, setSort] = useState<Sort>("recommended");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = tours.filter((t) => {
      if (needle && !`${t.title} ${t.place} ${t.region} ${t.kind}`.toLowerCase().includes(needle)) return false;
      if (kind && t.kind !== kind && !t.categories.includes(kind)) return false;
      if (month) {
        const p = placeFor(t.place);
        if (p && !p.months.includes(Number(month))) return false;
      }
      if (guests && t.maxTravelers && t.maxTravelers < Number(guests)) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "shortest") list = [...list].sort((a, b) => a.days - b.days);
    return list;
  }, [tours, q, kind, month, guests, sort]);

  const active = Boolean(q || kind || month || guests);
  function clear() {
    setQ("");
    setKind("");
    setMonth("");
    setGuests("");
  }

  const small = "field !h-11 !w-auto !rounded-full !py-0 !pl-4 !pr-9 !text-[13.5px] !font-extrabold cursor-pointer appearance-none";

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="wrap py-14 sm:py-16">
          <h1 className="t-h1 text-ink">Find your trip</h1>
          <p className="t-lead mt-3 max-w-xl text-ink2">Short trips across Bangladesh with the plan laid out before you book.</p>
          <div className="relative mt-8 max-w-2xl">
            <Icon name="search" size={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by place, trip or type" aria-label="Search tours" className="field !h-14 !rounded-full !pl-14 !text-base" />
          </div>
        </div>
      </section>

      <div className="sticky top-[72px] z-30 border-b border-line bg-bg/90 backdrop-blur-xl">
        <div className="wrap flex items-center gap-3 py-3">
          <div className="scroll-x flex flex-1 items-center gap-2">
            <Chip active={!kind} onClick={() => setKind("")}>
              All
            </Chip>
            {TOUR_KINDS.map((k) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(kind === k ? "" : k)}>
                {k}
              </Chip>
            ))}
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <div className="relative">
              <select aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)} className={small}>
                <option value="">Any month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <Icon name="chevronDown" size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink3" />
            </div>
            <div className="relative">
              <select aria-label="Travelers" value={guests} onChange={(e) => setGuests(e.target.value)} className={small}>
                <option value="">Any group size</option>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} traveler{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <Icon name="chevronDown" size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink3" />
            </div>
            <div className="relative">
              <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={small}>
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="shortest">Shortest first</option>
              </select>
              <Icon name="chevronDown" size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink3" />
            </div>
          </div>
        </div>
      </div>

      <section className="wrap py-10">
        {!loading && !live && (
          <p className="mb-6 flex items-start gap-3 rounded-2xl bg-info-soft p-4 text-sm font-semibold text-info">
            <Icon name="info" size={18} className="mt-0.5" />
            You&rsquo;re seeing sample tours. Publish tours from the admin panel and they replace these automatically.
          </p>
        )}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[15px] font-bold text-ink2">{loading ? "Loading tours" : `${filtered.length} tour${filtered.length === 1 ? "" : "s"}`}</p>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="relative">
              <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={small}>
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="shortest">Shortest first</option>
              </select>
              <Icon name="chevronDown" size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink3" />
            </div>
          </div>
          {active && (
            <Button variant="ghost" size="sm" icon="close" onClick={clear}>
              Clear filters
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TourCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="No tours match those filters"
            text="Try a different month or group size, or clear the filters to see everything."
            action={<Button onClick={clear}>Clear filters</Button>}
          />
        ) : (
          <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <TourCard key={t.id} tour={t} stat={stats[t.id]} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function PackagesPage() {
  return (
    <Shell>
      <Suspense fallback={<div className="wrap py-24" />}>
        <Listing />
      </Suspense>
    </Shell>
  );
}
