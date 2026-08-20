import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-12 pb-6 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-teal-600 mb-2">HikKing</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            HikKing is your trusted travel companion. Discover places, meet
            local experts, and create unforgettable memories.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">
            Explore
          </h4>
          <ul className="space-y-2 text-xs text-gray-600">
            <li>
              <Link href="#">Destinations</Link>
            </li>
            <li>
              <Link href="#">Hotels</Link>
            </li>
            <li>
              <Link href="#">Guides</Link>
            </li>
            <li>
              <Link href="#">Activities</Link>
            </li>
            <li>
              <Link href="#">Travel Blog</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">
            Company
          </h4>
          <ul className="space-y-2 text-xs text-gray-600">
            <li>
              <Link href="#">About Us</Link>
            </li>
            <li>
              <Link href="#">How It Works</Link>
            </li>
            <li>
              <Link href="#">Careers</Link>
            </li>
            <li>
              <Link href="#">Privacy Policy</Link>
            </li>
            <li>
              <Link href="#">Terms of Service</Link>
            </li>
            <li>
              <Link href="/admin">Admin Dashboard</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">
            Contact Us
          </h4>
          <ul className="space-y-2 text-xs text-gray-600">
            <li>+880 1234-567890</li>
            <li>hello@hikking.com</li>
            <li>House 45, Road 12, Dhanmondi</li>
            <li>Dhaka, Bangladesh</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
        <p>© 2025 HikKing. All rights reserved.</p>
        <p>English ▾</p>
      </div>
    </footer>
  );
}
