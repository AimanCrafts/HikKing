"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Shell from "../components/Shell";
import { Icon, IconName, Skeleton } from "../components/ui";
import { useUser } from "../lib/hooks";
import { cx } from "../lib/format";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "My trips", icon: "calendar" },
  { href: "/saved", label: "Saved", icon: "heart" },
  { href: "/dashboard/stories", label: "My stories", icon: "camera" },
  { href: "/dashboard/complaints", label: "Support", icon: "message" },
  { href: "/dashboard/profile", label: "Profile", icon: "users" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useUser();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (user.role === "admin") router.replace("/admin");
  }, [ready, user, router, pathname]);

  return (
    <Shell>
      <section className="border-b border-line bg-surface">
        <div className="wrap pt-12">
          <h1 className="t-h1 text-ink">
            {user ? `Hi, ${user.name.split(" ")[0]}` : "Your account"}
          </h1>
          <p className="mt-2 text-[15.5px] text-ink2">
            Your reservations, saved places and stories.
          </p>
          <nav className="scroll-x -mb-px mt-8 flex gap-1" aria-label="Account">
            {TABS.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex shrink-0 items-center gap-2 border-b-[3px] px-4 py-3.5 text-[14.5px] font-extrabold transition",
                    active
                      ? "border-jade text-jade"
                      : "border-transparent text-ink2 hover:text-ink",
                  )}
                >
                  <Icon name={t.icon} size={18} /> {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </section>
      <div className="wrap py-10">
        {user && user.role === "traveler" ? (
          children
        ) : (
          <Skeleton className="h-64" />
        )}
      </div>
    </Shell>
  );
}
