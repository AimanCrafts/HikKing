"use client";

import { useState } from "react";
import { BD_OUTLINE, PLACES, seasonRange } from "../lib/catalog";
import { cx } from "../lib/format";
import { Button, Icon, Photo } from "./ui";

const LON0 = 87.9;
const LAT1 = 26.7;
const W = 460;
const H = 630;
const px = (lon: number) => (lon - LON0) * 92;
const py = (lat: number) => (LAT1 - lat) * 100;

const OUTLINE = BD_OUTLINE.map(([lo, la], i) => `${i ? "L" : "M"}${px(lo).toFixed(1)} ${py(la).toFixed(1)}`).join(" ") + "Z";

export default function BangladeshMap() {
  const [active, setActive] = useState(PLACES[0].slug);
  const place = PLACES.find((p) => p.slug === active) ?? PLACES[0];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
      <div className="relative mx-auto w-full max-w-[420px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Map of Bangladesh with destinations">
          <defs>
            <pattern id="hk-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.1" fill="var(--jade)" opacity=".28" />
            </pattern>
          </defs>
          <path d={OUTLINE} fill="var(--jade-soft)" stroke="var(--jade)" strokeWidth="2.5" strokeLinejoin="round" />
          <path d={OUTLINE} fill="url(#hk-dots)" />
          <text x="285" y="590" fontSize="15" fontWeight="800" fill="var(--ink-3)" opacity=".8">
            Bay of Bengal
          </text>
        </svg>
        {PLACES.map((p) => {
          const selected = p.slug === active;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => setActive(p.slug)}
              onMouseEnter={() => setActive(p.slug)}
              aria-label={p.name}
              aria-pressed={selected}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(px(p.lon) / W) * 100}%`, top: `${(py(p.lat) / H) * 100}%` }}
            >
              {selected && <span className="absolute inset-0 rounded-full bg-sun" style={{ animation: "hk-ping 1.6s ease-out infinite" }} />}
              <span
                className={cx(
                  "relative flex items-center justify-center rounded-full ring-4 transition-all duration-200",
                  selected ? "h-6 w-6 bg-sun ring-sun/30" : "h-4 w-4 bg-jade ring-jade/20 group-hover:scale-125",
                )}
              >
                {selected && <Icon name="pin" size={12} className="text-on-sun" stroke={2.4} />}
              </span>
              <span
                className={cx(
                  "pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-sm transition",
                  selected ? "bg-ink text-bg opacity-100" : "bg-surface text-ink opacity-0 group-hover:opacity-100",
                )}
              >
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      <div key={place.slug} className="hk-pop overflow-hidden rounded-[32px] border border-line bg-surface shadow-[var(--shadow-lift)]">
        <div className="relative aspect-[16/9]">
          <Photo src={place.image} alt={place.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 text-white">
            <p className="text-sm font-bold text-white/80">{place.region}</p>
            <h3 className="text-3xl font-black tracking-tight">{place.name}</h3>
          </div>
        </div>
        <div className="p-6 sm:p-7">
          <p className="text-[15.5px] leading-relaxed text-ink2">{place.desc}</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-sunk p-4">
              <dt className="flex items-center gap-2 text-[13px] font-extrabold text-ink3">
                <Icon name="calendar" size={16} /> Best time
              </dt>
              <dd className="mt-1 text-base font-black text-ink">{seasonRange(place.months)}</dd>
            </div>
            <div className="rounded-2xl bg-sunk p-4">
              <dt className="flex items-center gap-2 text-[13px] font-extrabold text-ink3">
                <Icon name="sparkle" size={16} /> Do here
              </dt>
              <dd className="mt-1 text-sm font-bold leading-snug text-ink">{place.things.join(", ")}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={`/packages?q=${encodeURIComponent(place.match[0])}`} iconRight="arrowRight">
              See tours in {place.name.split(" ")[0]}
            </Button>
            <Button href="/destination" variant="outline">
              All destinations
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
