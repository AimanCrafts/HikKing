"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SITE } from "../lib/site";
import { useInView } from "../lib/hooks";
import { Icon, Logo } from "./ui";

const COLS = [
  {
    title: "Explore",
    links: [
      { href: "/destination", label: "Destinations" },
      { href: "/packages", label: "Tours" },
      { href: "/hotels", label: "Stays" },
      { href: "/stories", label: "Traveler stories" },
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Create account" },
      { href: "/dashboard", label: "My trips" },
      { href: "/saved", label: "Saved trips" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/refunds", label: "Cancellation policy" },
      { href: "/dashboard/complaints", label: "Support" },
    ],
  },
];

// Deterministic star field so server and client markup match
const STARS = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 53.7 + 11) % 100,
  y: (i * 29.3 + (i % 5) * 7) % 46,
  s: 1 + ((i * 7) % 3),
  d: (i * 0.37) % 4,
  t: 2.2 + ((i * 13) % 20) / 10,
}));

const WORD = "HikKing".split("");

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const [wordRef, wordSeen] = useInView<HTMLDivElement>(0.3);

  // Scroll progress (0 when the footer top touches the viewport bottom, 1 when fully shown)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / Math.min(r.height, vh * 1.1)));
      el.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <footer ref={root} className="relative mt-24 overflow-hidden bg-[#06140f] text-white" style={{ ["--p" as string]: 0 }}>
      {/* ---------- Sky scene ---------- */}
      <div className="relative h-[340px] overflow-hidden bg-gradient-to-b from-[#06140f] via-[#0a2a22] to-[#0f4a3b] sm:h-[420px]" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animation: `hk-twinkle ${s.t}s ease-in-out ${s.d}s infinite` }}
          />
        ))}

        {/* Rising sun */}
        <div
          className="absolute left-[62%] top-[34%] h-40 w-40 rounded-full sm:h-52 sm:w-52"
          style={{
            background: "radial-gradient(circle, #ffd37a 0%, #ffb938 38%, rgba(255,185,56,0) 70%)",
            transform: "translate3d(-50%, calc((1 - var(--p)) * 170px), 0)",
            filter: "blur(1px)",
            animation: "hk-glow 6s ease-in-out infinite",
          }}
        />

        {/* Clouds */}
        {[
          { top: "14%", w: 220, dur: 70, delay: 0, o: 0.16 },
          { top: "28%", w: 300, dur: 95, delay: -30, o: 0.11 },
          { top: "6%", w: 180, dur: 120, delay: -70, o: 0.09 },
        ].map((c, i) => (
          <svg
            key={i}
            viewBox="0 0 300 80"
            className="absolute left-0 text-white"
            style={{ top: c.top, width: c.w, opacity: c.o, animation: `hk-drift ${c.dur}s linear ${c.delay}s infinite` }}
          >
            <path fill="currentColor" d="M20 60a22 22 0 0 1 9-41 34 34 0 0 1 64-6 28 28 0 0 1 47 12 24 24 0 0 1 34-3 30 30 0 0 1 52 8 20 20 0 0 1 14 30z" />
          </svg>
        ))}

        {/* Ridges with parallax */}
        <svg
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-[62%] w-full text-[#134d3f]"
          style={{ transform: "translate3d(0, calc((1 - var(--p)) * 64px), 0)" }}
        >
          <path fill="currentColor" d="M0 190 L130 90 L230 160 L370 50 L520 170 L650 100 L790 180 L930 70 L1080 165 L1210 95 L1330 150 L1440 110 V260 H0Z" />
        </svg>
        <svg
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-[48%] w-full text-[#0d3a2f]"
          style={{ transform: "translate3d(0, calc((1 - var(--p)) * 38px), 0)" }}
        >
          <path fill="currentColor" d="M0 150 L110 110 L240 170 L400 80 L540 160 L700 105 L860 170 L1010 90 L1170 165 L1300 120 L1440 160 V260 H0Z" />
        </svg>
        <svg
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-[34%] w-full text-[#06140f]"
          style={{ transform: "translate3d(0, calc((1 - var(--p)) * 16px), 0)" }}
        >
          <path fill="currentColor" d="M0 130 C120 90 220 150 360 120 C520 85 600 150 760 125 C920 100 1040 150 1180 120 C1300 98 1380 130 1440 118 V260 H0Z" />
        </svg>
      </div>

      {/* ---------- Content ---------- */}
      <div className="wrap relative -mt-6 pb-10 pt-6">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/70">
              Short trips across Bangladesh, planned by people who have walked the routes. Pick a trip, reserve a date and we confirm it.
            </p>
            <ul className="mt-6 space-y-3 text-sm font-semibold text-white/80">
              <li>
                <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-3 transition hover:text-[#ffc65c]">
                  <Icon name="mail" size={18} /> {SITE.email}
                </a>
              </li>
              <li>
                <a href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-3 transition hover:text-[#ffc65c]">
                  <Icon name="phone" size={18} /> {SITE.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="pin" size={18} className="mt-0.5" /> {SITE.address}
              </li>
              <li className="flex items-start gap-3">
                <Icon name="clock" size={18} className="mt-0.5" /> {SITE.hours}
              </li>
            </ul>
            <div className="mt-6 flex gap-2.5">
              {(
                [
                  ["facebook", SITE.social.facebook, "Facebook"],
                  ["instagram", SITE.social.instagram, "Instagram"],
                  ["youtube", SITE.social.youtube, "YouTube"],
                ] as const
              ).map(([icon, href, label]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="group flex h-11 w-11 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/15 transition duration-300 hover:-translate-y-1 hover:bg-[#ffb938] hover:text-[#3a2500] hover:ring-transparent"
                >
                  <Icon name={icon} size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLS.map((c) => (
              <div key={c.title}>
                <h3 className="text-sm font-black text-white">{c.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-block text-[14.5px] font-semibold text-white/65 transition duration-200 hover:translate-x-1 hover:text-[#ffc65c]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Wordmark, river and boat ---------- */}
      <div ref={wordRef} className="relative mt-4 select-none overflow-hidden" aria-hidden="true">
        <div className="flex justify-center overflow-hidden px-2 leading-[0.82]">
          {WORD.map((ch, i) => (
            <span
              key={i}
              className="inline-block bg-gradient-to-b from-white/90 via-white/40 to-white/0 bg-clip-text text-[clamp(4.5rem,21vw,19rem)] font-black tracking-tighter text-transparent"
              style={{
                animation: "hk-letter 1s cubic-bezier(.2,.8,.2,1) both",
                animationDelay: `${i * 80}ms`,
                animationPlayState: wordSeen ? "running" : "paused",
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        {/* River */}
        <div className="relative -mt-3 h-14 overflow-hidden sm:h-16">
          <div className="absolute inset-x-0 bottom-0 flex w-[200%]" style={{ animation: "hk-wave 14s linear infinite" }}>
            {[0, 1].map((k) => (
              <svg key={k} viewBox="0 0 1440 60" preserveAspectRatio="none" className="h-14 w-1/2 text-[#35c9a4] opacity-30 sm:h-16">
                <path fill="currentColor" d="M0 30 C120 6 240 54 360 30 S600 6 720 30 960 54 1080 30 1320 6 1440 30 V60 H0Z" />
              </svg>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex w-[200%]" style={{ animation: "hk-wave 9s linear infinite reverse" }}>
            {[0, 1].map((k) => (
              <svg key={k} viewBox="0 0 1440 60" preserveAspectRatio="none" className="h-9 w-1/2 text-[#0f4a3b] sm:h-11">
                <path fill="currentColor" d="M0 34 C100 14 220 50 340 30 S580 12 720 34 940 50 1080 30 1320 14 1440 34 V60 H0Z" />
              </svg>
            ))}
          </div>
          {/* Wooden boat crossing the river */}
          <div className="absolute bottom-5 left-0" style={{ animation: "hk-boat 38s linear infinite" }}>
            <svg width="64" height="34" viewBox="0 0 64 34" style={{ animation: "hk-bob 3s ease-in-out infinite" }} className="text-[#ffc65c]">
              <path fill="currentColor" d="M2 20h60c-3 8-10 12-18 12H20C12 32 5 28 2 20Z" />
              <path fill="#06140f" d="M30 4h2v16h-2z" />
              <path fill="#fff" fillOpacity=".85" d="M33 5c8 3 12 8 13 14H33z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#04100c]">
        <div className="wrap flex flex-col items-center justify-between gap-3 py-5 text-[13px] font-semibold text-white/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/legal/terms" className="transition hover:text-white">Terms</Link>
            <Link href="/legal/privacy" className="transition hover:text-white">Privacy</Link>
            <Link href="/legal/refunds" className="transition hover:text-white">Cancellations</Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3.5 py-1.5 text-white/80 ring-1 ring-white/15 transition hover:bg-[#ffb938] hover:text-[#3a2500]"
            >
              <Icon name="arrowUp" size={15} /> Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
