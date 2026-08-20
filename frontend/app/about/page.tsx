import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-amber-50/60 py-16 px-6 text-center border-b border-gray-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            About HikKing
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto mt-3">
            We help travelers discover real places and connect with trusted
            local guides.
          </p>
        </section>

        {/* Mission */}
        <section className="max-w-3xl mx-auto py-16 px-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            HikKing started with a simple idea: travel is better when it's
            local. Instead of generic tours, we connect you with verified guides
            who know their region inside out, and help you find destinations
            worth the trip. Whether it's a quiet hill trail or a bustling city,
            we want every journey booked through HikKing to feel personal and
            dependable.
          </p>
        </section>

        {/* Values */}
        <section className="max-w-5xl mx-auto pb-16 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
              <div className="text-teal-600 text-xl mb-2">🌍</div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Real Places
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Curated destinations, not generic tourist traps.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
              <div className="text-teal-600 text-xl mb-2">🤝</div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Trusted Guides
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Every guide is verified before they can host a trip.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
              <div className="text-teal-600 text-xl mb-2">💛</div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Honest Travel
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                No hidden fees, no surprises — just a good trip.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pb-20 px-6">
          <Link
            href="/destination"
            className="inline-block bg-teal-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Explore Destinations
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
