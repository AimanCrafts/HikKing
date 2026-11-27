"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "../lib/api";
import { useScrolled, useTheme, useUser, useWishlist } from "../lib/hooks";
import { cx } from "../lib/format";
import { Avatar, Button, Icon, IconButton, IconName, Logo } from "./ui";
import NotificationBell from "./NotificationBell";

const LINKS = [
  { href: "/destination", label: "Destinations" },
  { href: "/packages", label: "Tours" },
  { href: "/hotels", label: "Stays" },
  { href: "/stories", label: "Stories" },
];

export default function Header({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const scrolled = useScrolled(24);
  const { user } = useUser();
  const { ids } = useWishlist();
  const { theme, toggle } = useTheme();
  const [menu, setMenu] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenu(false);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const down = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [menu]);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  // Transparent over the home hero until you scroll
  const light = overlay && !scrolled && !drawer;

  async function signOut() {
    await logoutUser().catch(() => {});
    setMenu(false);
    router.push("/");
  }

  const account: { href: string; label: string; icon: IconName }[] = [
    { href: user?.role === "admin" ? "/admin" : "/dashboard", label: user?.role === "admin" ? "Admin panel" : "My trips", icon: user?.role === "admin" ? "grid" : "calendar" },
    { href: "/saved", label: "Saved", icon: "heart" },
    { href: "/dashboard/stories", label: "My stories", icon: "camera" },
    { href: "/dashboard/complaints", label: "Support", icon: "message" },
  ];

  return (
    <>
      <header
        className={cx(
          "z-50 w-full transition-[background,box-shadow,border-color] duration-300",
          overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
          light ? "border-b border-transparent bg-transparent text-white" : "border-b border-line bg-surface/85 text-ink backdrop-blur-xl",
        )}
      >
        <div className="wrap flex h-[72px] items-center justify-between gap-6">
          <Link href="/" aria-label="HikKing home">
            <Logo light={light} />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cx(
                    "rounded-full px-4 py-2 text-[14px] font-extrabold transition",
                    light ? "text-white/90 hover:bg-white/15" : "text-ink2 hover:bg-sunk hover:text-ink",
                    active && (light ? "bg-white/20 text-white" : "bg-jade-soft text-jade"),
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <IconButton
              icon={theme === "dark" ? "sun" : "moon"}
              label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              onClick={toggle}
              className={light ? "text-white hover:bg-white/15" : ""}
            />
            <Link
              href="/saved"
              aria-label={`Saved trips${ids.length ? `, ${ids.length}` : ""}`}
              className={cx("relative hidden h-10 w-10 items-center justify-center rounded-full transition sm:inline-flex", light ? "text-white hover:bg-white/15" : "hover:bg-sunk")}
            >
              <Icon name="heart" size={20} />
              {ids.length > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-sun px-1 text-[10px] font-black leading-none text-on-sun">
                  {ids.length}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <NotificationBell light={light} />
                <div ref={menuRef} className="relative ml-1 hidden md:block">
                  <button
                    type="button"
                    onClick={() => setMenu((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={menu}
                    className={cx("flex items-center gap-2 rounded-full p-1 pr-3 transition", light ? "bg-white/15 ring-1 ring-white/30 hover:bg-white/25" : "border border-line bg-surface hover:border-ink")}
                  >
                    <Avatar name={user.name} size={32} />
                    <span className="max-w-[90px] truncate text-[13px] font-extrabold">{user.name.split(" ")[0]}</span>
                    <Icon name="chevronDown" size={15} />
                  </button>
                  {menu && (
                    <div role="menu" className="hk-pop absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-3xl border border-line bg-surface p-2 text-ink shadow-[var(--shadow-pop)]">
                      <div className="px-3 pb-2 pt-2">
                        <p className="truncate text-sm font-black">{user.name}</p>
                        <p className="truncate text-xs font-semibold text-ink3">{user.email}</p>
                      </div>
                      <div className="border-t border-line pt-1">
                        {account.map((a) => (
                          <Link key={a.href} role="menuitem" href={a.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-ink2 transition hover:bg-sunk hover:text-ink">
                            <Icon name={a.icon} size={18} /> {a.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-line pt-1">
                        <button type="button" onClick={signOut} role="menuitem" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-danger transition hover:bg-danger-soft">
                          <Icon name="logout" size={18} /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="ml-1 hidden items-center gap-1 md:flex">
                <Button href="/login" variant="ghost" size="sm" className={light ? "text-white hover:bg-white/15" : ""}>
                  Log in
                </Button>
                <Button href="/signup" variant={light ? "sun" : "primary"} size="sm">
                  Sign up
                </Button>
              </div>
            )}

            <IconButton icon={drawer ? "close" : "menu"} label="Menu" onClick={() => setDrawer((v) => !v)} className={cx("md:hidden", light && "text-white hover:bg-white/15")} />
          </div>
        </div>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-bg pt-[72px] md:hidden">
          <div className="wrap py-6">
            <nav className="flex flex-col">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center justify-between border-b border-line py-4 text-2xl font-extrabold tracking-tight text-ink">
                  {l.label}
                  <Icon name="arrowUpRight" size={22} className="text-ink3" />
                </Link>
              ))}
              <Link href="/saved" className="flex items-center justify-between border-b border-line py-4 text-2xl font-extrabold tracking-tight text-ink">
                Saved {ids.length > 0 && <span className="text-base text-jade">{ids.length}</span>}
              </Link>
            </nav>
            <div className="mt-8 grid gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl bg-surface p-4">
                    <Avatar name={user.name} size={44} />
                    <div className="min-w-0">
                      <p className="truncate font-black">{user.name}</p>
                      <p className="truncate text-xs font-semibold text-ink3">{user.email}</p>
                    </div>
                  </div>
                  <Button href={account[0].href} variant="primary" size="lg" full>
                    {account[0].label}
                  </Button>
                  <Button variant="outline" size="lg" full onClick={signOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/signup" size="lg" full>
                    Create account
                  </Button>
                  <Button href="/login" variant="outline" size="lg" full>
                    Log in
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
