"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPackages, getReviews, getStoredUser, User, Review } from "./api";
import { DEMO_TOURS, Tour, tourFromPackage } from "./catalog";

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setUser(getStoredUser());
      setReady(true);
    };
    sync();
    window.addEventListener("hk-session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hk-session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready };
}

/* ------------------------------------------------------------------ */
/* Wishlist (saved on this device)                                     */
/* ------------------------------------------------------------------ */

const WISH_KEY = "hk_wishlist";

function readWishlist(): number[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(WISH_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const sync = () => setIds(readWishlist());
    sync();
    window.addEventListener("hk-wishlist", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hk-wishlist", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: number): boolean => {
    const cur = readWishlist();
    const adding = !cur.includes(id);
    const next = adding ? [...cur, id] : cur.filter((x) => x !== id);
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(next));
    } catch {
      /* storage full or blocked, ignore */
    }
    window.dispatchEvent(new Event("hk-wishlist"));
    return adding;
  }, []);

  return { ids, has: (id: number) => ids.includes(id), toggle };
}

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const read = () =>
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    read();
    window.addEventListener("hk-theme", read);
    return () => window.removeEventListener("hk-theme", read);
  }, []);

  const toggle = useCallback(() => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("hk_theme", next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("hk-theme"));
  }, []);

  return { theme, toggle };
}

/* ------------------------------------------------------------------ */
/* Tours + review stats                                                */
/* ------------------------------------------------------------------ */

export type RatingStat = { avg: number; count: number };

export function statsFromReviews(reviews: Review[]): Record<number, RatingStat> {
  const acc: Record<number, { sum: number; count: number }> = {};
  for (const r of reviews) {
    const a = (acc[r.package_id] ??= { sum: 0, count: 0 });
    a.sum += r.rating;
    a.count += 1;
  }
  const out: Record<number, RatingStat> = {};
  for (const [id, v] of Object.entries(acc)) out[Number(id)] = { avg: Math.round((v.sum / v.count) * 10) / 10, count: v.count };
  return out;
}

type ToursState = { tours: Tour[]; loading: boolean; live: boolean; stats: Record<number, RatingStat>; reviews: Review[] };

export function useTours(): ToursState {
  const [state, setState] = useState<ToursState>({ tours: [], loading: true, live: false, stats: {}, reviews: [] });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [pkgs, reviews] = await Promise.all([getPackages(), getReviews().catch(() => [] as Review[])]);
        if (!alive) return;
        if (pkgs.length > 0) {
          setState({
            tours: pkgs.map(tourFromPackage),
            loading: false,
            live: true,
            stats: statsFromReviews(reviews),
            reviews,
          });
          return;
        }
      } catch {
        /* fall through to sample tours */
      }
      if (alive) setState({ tours: DEMO_TOURS, loading: false, live: false, stats: {}, reviews: [] });
    })();
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

/* ------------------------------------------------------------------ */
/* Scroll helpers                                                      */
/* ------------------------------------------------------------------ */

export function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, seen] as const;
}

export function useScrolled(offset = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > offset);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, [offset]);
  return scrolled;
}
