"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Shell from "../components/Shell";
import { Chip, EmptyState, Icon, Skeleton, Stars } from "../components/ui";
import { Hotel, getHotels } from "../lib/api";

const FALLBACK: Hotel[] = [
  { hotel_id: -1, hotel_name: "Hilltop Cottage, Sajek", address: "Sajek Valley, Rangamati", star_rating: 3 },
  { hotel_id: -2, hotel_name: "Lakeview Resort, Rangamati", address: "Reserve Bazar, Rangamati", star_rating: 4 },
  { hotel_id: -3, hotel_name: "Seaside Inn, Cox\u2019s Bazar", address: "Kolatoli, Cox\u2019s Bazar", star_rating: 4 },
  { hotel_id: -4, hotel_name: "Tea Garden Lodge, Sreemangal", address: "Sreemangal, Moulvibazar", star_rating: 3 },
];

const IMAGES = ["/images/packages/sajek.jpg", "/images/packages/kaptai.jpg", "/images/packages/marine-drive.jpg", "/hero/sylhet.jpg", "/images/packages/saintmartin.jpg", "/images/packages/nilgiri.jpg"];

export default function StaysPage() {
  const [hotels, setHotels] = useState<Hotel[] | null>(null);
  const [live, setLive] = useState(true);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    getHotels()
      .then((h) => {
        if (h.length) setHotels(h);
        else {
          setHotels(FALLBACK);
          setLive(false);
        }
      })
      .catch(() => {
        setHotels(FALLBACK);
        setLive(false);
      });
  }, []);

  const list = useMemo(() => (hotels ?? []).filter((h) => !stars || (h.star_rating ?? 0) >= stars), [hotels, stars]);

  return (
    <Shell>
      <section className="border-b border-line bg-surface">
        <div className="wrap py-14 sm:py-20">
          <h1 className="t-h1 max-w-3xl text-ink">Places we stay</h1>
          <p className="t-lead mt-4 max-w-xl text-ink2">Every trip includes accommodation we&rsquo;ve chosen for location and comfort. Here are the stays used across our tours.</p>
          <div className="scroll-x mt-8 flex gap-2">
            <Chip active={!stars} onClick={() => setStars(0)}>All stays</Chip>
            {[3, 4, 5].map((n) => (
              <Chip key={n} active={stars === n} onClick={() => setStars(stars === n ? 0 : n)} icon="star">{n}+ stars</Chip>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-12">
        {!live && (
          <p className="mb-6 flex items-start gap-3 rounded-2xl bg-info-soft p-4 text-sm font-semibold text-info">
            <Icon name="info" size={18} className="mt-0.5" /> These are sample stays. Add hotels in the admin panel and they replace these.
          </p>
        )}
        {hotels === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon="hotel" title="No stays at that rating yet" text="Try a lower star rating to see more options." />
        ) : (
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((h, i) => (
              <li key={h.hotel_id}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] bg-sunk">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={IMAGES[i % IMAGES.length]} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                </div>
                <div className="px-1 pt-4">
                  <h2 className="text-[17px] font-extrabold tracking-tight text-ink">{h.hotel_name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-[13.5px] font-semibold text-ink3"><Icon name="pin" size={14} /> {h.address ?? "Location shared on confirmation"}</p>
                  {h.star_rating ? <Stars value={h.star_rating} size={15} className="mt-2.5" /> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-16 rounded-[32px] bg-jade-soft p-8 sm:p-10">
          <h2 className="t-h2 text-ink">Stays come with the trip</h2>
          <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-ink2">You don&rsquo;t book rooms separately. Pick a tour and the accommodation is part of the plan.</p>
          <Link href="/packages" className="mt-6 inline-flex h-11 items-center rounded-full bg-jade px-6 text-sm font-extrabold text-on-jade transition hover:brightness-110">Browse tours</Link>
        </div>
      </section>
    </Shell>
  );
}
