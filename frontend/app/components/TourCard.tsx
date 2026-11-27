"use client";

import Link from "next/link";
import { Tour } from "../lib/catalog";
import { RatingStat, useWishlist } from "../lib/hooks";
import { money } from "../lib/format";
import { cx } from "../lib/format";
import { Badge, Icon, Photo, Skeleton, useToast } from "./ui";

export function WishButton({ id, className }: { id: number; className?: string }) {
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const saved = has(id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved trips" : "Save this trip"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(id);
        toast(added ? "Saved to your trips" : "Removed from saved", "info");
      }}
      className={cx(
        "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#0b2623] shadow-sm backdrop-blur transition hover:scale-110 active:scale-95",
        saved && "text-[#e2455b]",
        className,
      )}
    >
      <Icon name="heart" size={19} fill={saved} />
    </button>
  );
}

export function RatingPill({ stat }: { stat?: RatingStat }) {
  if (!stat) return <span className="text-[13px] font-extrabold text-jade">New</span>;
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-extrabold text-ink">
      <Icon name="star" size={14} fill className="text-sun" />
      {stat.avg.toFixed(1)}
      <span className="font-semibold text-ink3">({stat.count})</span>
    </span>
  );
}

export default function TourCard({ tour, stat, className }: { tour: Tour; stat?: RatingStat; className?: string }) {
  return (
    <article className={cx("group relative", className)}>
      <Link href={`/packages/${tour.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] bg-sunk">
          <Photo src={tour.image} alt={tour.title} className="transition duration-700 ease-out group-hover:scale-[1.06]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80" />
          <Badge tone="white" className="absolute left-3.5 top-3.5 shadow-sm">
            {tour.kind}
          </Badge>
        </div>
        <div className="px-1 pt-4">
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-ink3">
            <Icon name="pin" size={14} /> {tour.place}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[17px] font-extrabold leading-snug tracking-tight text-ink">{tour.title}</h3>
          <div className="mt-2.5 flex items-center justify-between gap-3 text-[13px] font-bold text-ink2">
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="clock" size={15} /> {tour.days}D / {tour.nights}N
              </span>
              {tour.maxTravelers ? (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="users" size={15} /> Up to {tour.maxTravelers}
                </span>
              ) : null}
            </span>
            <RatingPill stat={stat} />
          </div>
          <p className="mt-3 text-[15px] text-ink2">
            {tour.oldPrice ? <span className="mr-2 text-sm font-semibold text-ink3 line-through">{money(tour.oldPrice)}</span> : null}
            <span className="text-lg font-black text-ink">{money(tour.price)}</span> <span className="font-semibold">per person</span>
          </p>
        </div>
      </Link>
      <WishButton id={tour.id} className="absolute right-3.5 top-3.5" />
    </article>
  );
}

export function TourCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] rounded-[26px]" />
      <Skeleton className="mt-4 h-4 w-1/3" />
      <Skeleton className="mt-2.5 h-5 w-4/5" />
      <Skeleton className="mt-3 h-4 w-2/3" />
    </div>
  );
}
