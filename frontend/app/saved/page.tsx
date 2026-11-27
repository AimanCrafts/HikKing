"use client";

import Shell from "../components/Shell";
import TourCard, { TourCardSkeleton } from "../components/TourCard";
import { Button, EmptyState } from "../components/ui";
import { useTours, useWishlist } from "../lib/hooks";

export default function SavedPage() {
  const { ids } = useWishlist();
  const { tours, loading, stats } = useTours();
  const saved = tours.filter((t) => ids.includes(t.id));

  return (
    <Shell>
      <section className="border-b border-line bg-surface">
        <div className="wrap py-14 sm:py-16">
          <h1 className="t-h1 text-ink">Saved trips</h1>
          <p className="t-lead mt-3 max-w-xl text-ink2">Trips you&rsquo;ve marked with a heart. They&rsquo;re kept on this device.</p>
        </div>
      </section>
      <section className="wrap py-12">
        {loading ? (
          <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <TourCardSkeleton key={i} />)}</div>
        ) : saved.length === 0 ? (
          <EmptyState icon="heart" title="Nothing saved yet" text="Tap the heart on any trip to keep it here while you decide." action={<Button href="/packages">Browse tours</Button>} />
        ) : (
          <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((t) => <TourCard key={t.id} tour={t} stat={stats[t.id]} />)}
          </div>
        )}
      </section>
    </Shell>
  );
}
