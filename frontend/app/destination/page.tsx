"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { Badge, Chip, Icon, Photo, Skeleton } from "../components/ui";
import { Destination, getDestinations } from "../lib/api";
import { PLACES, PlaceKind, placeFor, seasonRange } from "../lib/catalog";
import { useTours } from "../lib/hooks";
import { cx } from "../lib/format";

const KINDS: PlaceKind[] = ["Hills", "Beach", "Nature", "Adventure", "Lake"];
const SHAPES = ["aspect-[4/5]", "aspect-[4/3]", "aspect-[1/1]", "aspect-[4/3]", "aspect-[4/5]", "aspect-[1/1]"];

export default function DestinationPage() {
  const { tours } = useTours();
  const [kind, setKind] = useState<PlaceKind | "">("");
  const [extra, setExtra] = useState<Destination[] | null>(null);

  useEffect(() => {
    getDestinations()
      .then((list) => setExtra(list.filter((d) => !placeFor(d.name))))
      .catch(() => setExtra([]));
  }, []);

  const places = useMemo(() => PLACES.filter((p) => !kind || p.kind === kind), [kind]);
  const countFor = (slug: string) => tours.filter((t) => placeFor(t.place)?.slug === slug).length;

  return (
    <Shell>
      <section className="border-b border-line bg-surface">
        <div className="wrap py-14 sm:py-20">
          <h1 className="t-h1 max-w-3xl text-ink">Places worth the journey</h1>
          <p className="t-lead mt-4 max-w-xl text-ink2">From hill ridges to mangrove channels. See when each place is at its best, then jump straight to the tours that go there.</p>
          <div className="scroll-x mt-8 flex gap-2">
            <Chip active={!kind} onClick={() => setKind("")}>All places</Chip>
            {KINDS.map((k) => (
              <Chip key={k} active={kind === k} onClick={() => setKind(kind === k ? "" : k)}>{k}</Chip>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-12">
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {places.map((p, i) => {
            const n = countFor(p.slug);
            return (
              <Link key={p.slug} href={`/packages?q=${encodeURIComponent(p.match[0])}`} className="group mb-6 block break-inside-avoid">
                <div className={cx("relative overflow-hidden rounded-[28px] bg-sunk", SHAPES[i % SHAPES.length])}>
                  <Photo src={p.image} alt={p.name} className="transition duration-700 ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                  <Badge tone="white" className="absolute left-4 top-4">{p.kind}</Badge>
                  <div className="absolute inset-x-5 bottom-5 text-white">
                    <p className="text-[13px] font-bold text-white/80">{p.region}</p>
                    <h2 className="text-2xl font-black tracking-tight">{p.name}</h2>
                    <p className="mt-1 text-sm font-semibold text-white/85">{p.line}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-1.5 pt-3.5 text-[13.5px] font-bold text-ink2">
                  <span className="inline-flex items-center gap-1.5"><Icon name="calendar" size={15} className="text-jade" /> {seasonRange(p.months)}</span>
                  <span className="inline-flex items-center gap-1 text-jade">
                    {n > 0 ? `${n} tour${n > 1 ? "s" : ""}` : "See tours"} <Icon name="arrowUpRight" size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {!kind && extra === null && <Skeleton className="mt-6 h-32" />}
        {!kind && extra && extra.length > 0 && (
          <div className="mt-10">
            <h2 className="t-h2 text-ink">More destinations</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {extra.map((d) => (
                <li key={d.destination_id}>
                  <Link href={`/packages?q=${encodeURIComponent(d.name)}`} className="flex h-full flex-col rounded-3xl border border-line bg-surface p-6 transition hover:border-jade hover:shadow-[var(--shadow-lift)]">
                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-ink3"><Icon name="pin" size={14} /> {d.location ?? "Bangladesh"}</span>
                    <h3 className="t-h3 mt-1.5 text-ink">{d.name}</h3>
                    {d.description ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink2">{d.description}</p> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </Shell>
  );
}
