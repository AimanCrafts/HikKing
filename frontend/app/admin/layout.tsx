"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8">
          <span className="text-sm font-medium text-gray-500">
            Admin Dashboard
          </span>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 text-sm font-bold">
              A
            </span>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
