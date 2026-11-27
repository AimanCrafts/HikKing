"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cx, initials } from "../lib/format";

/* ------------------------------------------------------------------ */
/* Icons (24px stroke set)                                             */
/* ------------------------------------------------------------------ */

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  arrowRight: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M7 7h10v10"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronUp: '<path d="m18 15-6-6-6 6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  chart: '<path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m14-7-5-5-5 5m5-5v12"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2z"/>',
  wave: '<path d="M2 8c2.5-3 5-3 7.5 0s5 3 7.5 0c1.4-1.7 3-2 5-1M2 15c2.5-3 5-3 7.5 0s5 3 7.5 0c1.4-1.7 3-2 5-1"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  lake: '<path d="M3 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><circle cx="17" cy="5" r="2"/>',
  tent: '<path d="M3.5 21 14 3M20.5 21 10 3M15.5 21 12 15l-3.5 6M2 21h20"/>',
  bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  bus: '<path d="M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3M9 18h5"/><circle cx="7" cy="18" r="2"/><circle cx="16" cy="18" r="2"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  youtube: '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01"/>',
  sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  box: '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  tag: '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42z"/><path d="M7 7h.01"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  hotel: '<path d="M10 22v-6.57M12 11h.01M12 7h.01M14 15.43V22M15 16a5 5 0 0 0-6 0M16 11h.01M16 7h.01M8 11h.01M8 7h.01"/><rect x="4" y="2" width="16" height="20" rx="2"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  expand: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  arrowUp: '<path d="m5 12 7-7 7 7M12 19V5"/>',
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  className,
  fill = false,
  stroke = 1.9,
}: {
  name: IconName;
  size?: number;
  className?: string;
  fill?: boolean;
  stroke?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx("shrink-0", className)}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <span
        className={cx(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          light ? "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur" : "bg-jade text-on-jade",
        )}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2.5 19 6.2-11 3.4 6 2.2-3.6L21.5 19z" />
        </svg>
      </span>
      <span className={cx("text-[21px] font-black tracking-tight", light ? "text-white" : "text-ink")}>HikKing</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type Variant = "primary" | "dark" | "sun" | "outline" | "ghost" | "soft" | "danger" | "glass";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-jade text-on-jade hover:brightness-110 shadow-[0_10px_24px_-10px_var(--jade)]",
  dark: "bg-ink text-bg hover:opacity-90",
  sun: "bg-sun text-on-sun hover:brightness-105 shadow-[0_10px_26px_-10px_var(--sun)]",
  outline: "border-[1.5px] border-line bg-surface text-ink hover:border-ink",
  ghost: "text-ink hover:bg-sunk",
  soft: "bg-jade-soft text-jade hover:brightness-95",
  danger: "bg-danger-soft text-danger hover:brightness-95",
  glass: "bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md hover:bg-white/25",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-[15px]",
};

type BtnProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  full?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { className?: string };

export function Button({ variant = "primary", size = "md", href, icon, iconRight, loading, full, className, children, disabled, ...rest }: BtnProps) {
  const cls = cx(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-extrabold transition duration-150 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    full && "w-full",
    className,
  );
  const inner = (
    <>
      {loading ? <Spinner size={16} /> : icon ? <Icon name={icon} size={size === "lg" ? 20 : 17} /> : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={size === "lg" ? 20 : 17} /> : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {inner}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  onClick,
  className,
  size = 40,
  active,
  badge,
}: {
  icon: IconName;
  label: string;
  onClick?: () => void;
  className?: string;
  size?: number;
  active?: boolean;
  badge?: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{ width: size, height: size }}
      className={cx(
        "relative inline-flex items-center justify-center rounded-full transition hover:bg-sunk active:scale-95",
        active && "text-jade",
        className,
      )}
    >
      <Icon name={icon} size={20} fill={active && icon === "heart"} />
      {badge ? (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-black leading-none text-white ring-2 ring-surface">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

const TONES = {
  jade: "bg-jade-soft text-jade",
  warn: "bg-warn-soft text-warn",
  info: "bg-info-soft text-info",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-sunk text-ink2",
  sun: "bg-sun text-on-sun",
  white: "bg-white/90 text-[#0b2623]",
} as const;

export function Badge({ tone = "neutral", children, className }: { tone?: keyof typeof TONES; children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold", TONES[tone], className)}>{children}</span>;
}

const STATUS: Record<string, { tone: keyof typeof TONES; label: string }> = {
  pending: { tone: "warn", label: "Requested" },
  confirmed: { tone: "jade", label: "Confirmed" },
  completed: { tone: "info", label: "Completed" },
  cancelled: { tone: "danger", label: "Cancelled" },
  open: { tone: "warn", label: "Open" },
  in_progress: { tone: "info", label: "In progress" },
  resolved: { tone: "jade", label: "Resolved" },
  rejected: { tone: "danger", label: "Rejected" },
  approved: { tone: "jade", label: "Approved" },
  published: { tone: "jade", label: "Published" },
  draft: { tone: "neutral", label: "Draft" },
  archived: { tone: "neutral", label: "Archived" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { tone: "neutral" as const, label: status };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function Stars({ value, size = 15, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-0.5 text-sun", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} fill={value >= n - 0.25} className={value >= n - 0.25 ? "" : "text-line"} stroke={1.6} />
      ))}
    </span>
  );
}

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg className={cx("animate-spin", className)} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("hk-skeleton rounded-2xl", className)} aria-hidden="true" />;
}

export function Avatar({ name, size = 36, className }: { name?: string | null; size?: number; className?: string }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full bg-jade-soft font-black text-jade", className)}
    >
      {initials(name)}
    </span>
  );
}

export function Photo({ src, alt, className, style, eager }: { src: string; alt: string; className?: string; style?: CSSProperties; eager?: boolean }) {
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className={cx("h-full w-full object-cover", className)} style={style} />;
}

export function SectionHead({ title, sub, action, className }: { title: string; sub?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        <h2 className="t-h2 text-ink">{title}</h2>
        {sub ? <p className="mt-2.5 text-[15px] leading-relaxed text-ink2">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon = "compass",
  title,
  text,
  action,
  className,
}: {
  icon?: IconName;
  title: string;
  text?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-14 text-center", className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-soft text-jade">
        <Icon name={icon} size={26} />
      </span>
      <h3 className="t-h3 mt-5 text-ink">{title}</h3>
      {text ? <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink2">{text}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-extrabold text-ink">
      {children}
      {hint ? <span className="text-xs font-semibold text-ink3">{hint}</span> : null}
    </span>
  );
}

export function Chip({ active, children, onClick, icon }: { active?: boolean; children: ReactNode; onClick?: () => void; icon?: IconName }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-extrabold transition",
        active ? "bg-ink text-bg" : "border border-line bg-surface text-ink2 hover:border-ink hover:text-ink",
      )}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Polaroid card (photo paper, tilted)                                 */
/* ------------------------------------------------------------------ */

export const tiltFor = (i: number) => (i % 2 === 0 ? -7 : 7);

export function Polaroid({
  src,
  caption,
  tilt = -7,
  className,
  onClick,
  sticker,
}: {
  src: string;
  caption?: string;
  tilt?: number;
  className?: string;
  onClick?: () => void;
  sticker?: ReactNode;
}) {
  const cls = cx(
    "group relative block bg-white p-2.5 pb-10 text-left shadow-[0_18px_34px_-14px_rgba(0,0,0,0.45)] ring-1 ring-black/5 transition duration-300 ease-out [transform:rotate(var(--tilt))] hover:z-20 hover:[transform:rotate(0deg)_scale(1.05)]",
    className,
  );
  const style = { ["--tilt" as string]: `${tilt}deg` } as CSSProperties;
  const inner = (
    <>
      <span className="block aspect-[4/5] overflow-hidden bg-neutral-200">
        <Photo src={src} alt={caption || "Traveler photo"} />
      </span>
      {caption ? (
        <span className="absolute inset-x-3 bottom-2.5 block truncate text-center text-[13px] font-bold text-neutral-700">{caption}</span>
      ) : null}
      {sticker}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} style={style} className={cls}>
        {inner}
      </button>
    );
  }
  return (
    <figure style={style} className={cls}>
      {inner}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
  flush = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
  flush?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    if (!panel.current?.contains(document.activeElement)) panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={cx(
          "hk-pop relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-surface shadow-[var(--shadow-pop)] outline-none sm:rounded-[28px]",
          width,
        )}
      >
        {title ? (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-6 py-4">
            <h2 className="t-h3 text-ink">{title}</h2>
            <IconButton icon="close" label="Close" onClick={onClose} size={36} />
          </div>
        ) : (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
          >
            <Icon name="close" size={18} />
          </button>
        )}
        <div className={flush ? "" : "p-6"}>{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  busy,
}: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md">
      <p className="text-[15px] leading-relaxed text-ink2">{text}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" loading={busy} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; text: string; tone: ToastTone };
const ToastCtx = createContext<(text: string, tone?: ToastTone) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((text: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setItems((cur) => [...cur.slice(-2), { id, text, tone }]);
    setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), 3800);
  }, []);
  const value = useMemo(() => push, [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[120] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className="hk-pop pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-bg shadow-[var(--shadow-pop)]"
          >
            <span
              className={cx(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                t.tone === "success" && "bg-jade text-on-jade",
                t.tone === "error" && "bg-danger text-white",
                t.tone === "info" && "bg-info text-white",
              )}
            >
              <Icon name={t.tone === "error" ? "alert" : t.tone === "info" ? "info" : "check"} size={14} stroke={2.4} />
            </span>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
