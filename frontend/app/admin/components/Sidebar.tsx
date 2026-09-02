"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "🏠", exact: true },
  { href: "/admin/packages", label: "Packages", icon: "🏔️" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/destinations", label: "Destinations", icon: "📍" },
  { href: "/admin/hotels", label: "Hotels", icon: "🏨" },
  { href: "/admin/guides", label: "Guides", icon: "🧭" },
  { href: "/admin/verification-documents", label: "Verifications", icon: "📄" },
  { href: "/admin/bookings", label: "Bookings", icon: "🎒" },
  { href: "/admin/complaints", label: "Complaints", icon: "📮" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Website name / brand — same style as the public site header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/" className="block">
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            Hik<span className="text-teal-600">King</span>
          </span>
        </Link>
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Admin Panel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="px-3 py-4 border-t border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          <span className="text-base">↩</span>
          Back to site
        </Link>
      </div>
    </aside>
  );
}
