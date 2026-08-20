import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b bg-white">
      <nav className="flex items-center gap-8 text-sm font-medium text-gray-700">
        <Link href="/destination">Destinations</Link>
        <Link href="/hotels">Hotels</Link>
        <Link href="/guide">Guides</Link>
        <Link href="/about">About</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
        >
          Sign Up
        </Link>
      </div>
    </header>
  );
}
