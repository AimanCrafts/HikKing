"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Icon, IconButton, IconName, Logo, Skeleton } from "../components/ui";
import { logoutUser } from "../lib/api";
import { useTheme, useUser } from "../lib/hooks";
import { cx } from "../lib/format";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Overview", icon: "chart" },
  { href: "/admin/bookings", label: "Reservations", icon: "calendar" },
  { href: "/admin/payments", label: "Payments", icon: "tag" },
  { href: "/admin/packages", label: "Tours", icon: "box" },
  { href: "/admin/destinations", label: "Destinations", icon: "pin" },
  { href: "/admin/hotels", label: "Stays", icon: "hotel" },
  { href: "/admin/categories", label: "Categories", icon: "tag" },
  { href: "/admin/complaints", label: "Support", icon: "message" },
  { href: "/admin/stories", label: "Stories", icon: "camera" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useUser();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin || !ready) return;
    if (!user || user.role !== "admin") router.replace("/admin/login");
  }, [isLogin, ready, user, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (isLogin) return <>{children}</>;

  const allowed = ready && user?.role === "admin";

  async function signOut() {
    await logoutUser().catch(() => {});
    router.push("/admin/login");
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Admin">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cx("flex items-center gap-3 rounded-2xl px-4 py-3 text-[14.5px] font-extrabold transition", active ? "bg-jade text-on-jade" : "text-ink2 hover:bg-sunk hover:text-ink")}
          >
            <Icon name={n.icon} size={19} /> {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface py-6 lg:flex">
        <Link href="/admin" className="mb-8 px-6"><Logo /></Link>
        {nav}
        <div className="mt-4 space-y-1 border-t border-line px-3 pt-4">
          <Link href="/" className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-ink2 hover:bg-sunk hover:text-ink">
            <Icon name="arrowUpRight" size={18} /> View site
          </Link>
          <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-extrabold text-danger hover:bg-danger-soft">
            <Icon name="logout" size={18} /> Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside onClick={(e) => e.stopPropagation()} className="hk-pop absolute inset-y-0 left-0 flex w-72 flex-col bg-surface py-6">
            <div className="mb-8 flex items-center justify-between px-6">
              <Logo />
              <IconButton icon="close" label="Close menu" onClick={() => setOpen(false)} />
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface/85 px-5 backdrop-blur-xl sm:px-8">
          <IconButton icon="menu" label="Open menu" onClick={() => setOpen(true)} className="lg:hidden" />
          <span className="hidden text-sm font-extrabold text-ink3 lg:block">Admin panel</span>
          <div className="flex items-center gap-2">
            <IconButton icon={theme === "dark" ? "sun" : "moon"} label="Toggle theme" onClick={toggle} />
            {user && (
              <span className="flex items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-4">
                <Avatar name={user.name} size={30} />
                <span className="text-[13px] font-extrabold text-ink">{user.name.split(" ")[0]}</span>
              </span>
            )}
          </div>
        </header>
        <main className="p-5 sm:p-8">{allowed ? children : <Skeleton className="h-80" />}</main>
      </div>
    </div>
  );
}
