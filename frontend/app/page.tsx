import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex-grow">
        {/* HERO SECTION - BOX WITHOUT PICTURE */}
        <section className="bg-amber-50/60 py-20 px-6 text-center border-b border-gray-100">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Explore the World with{" "}
              <span className="text-teal-600">HikKing</span>
            </h1>
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
              Discover breathtaking destinations, book the best stays, and
              travel with expert local guides.
            </p>

            {/* Search Bar */}
            <div className="mt-8 flex items-center justify-between max-w-xl mx-auto bg-white border border-gray-300 rounded-full shadow-sm p-2">
              <input
                type="text"
                placeholder="Search destinations, hotels, or activities..."
                className="w-full px-4 py-2 text-sm text-gray-700 outline-none rounded-l-full"
              />
              <button className="bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 flex items-center justify-center">
                🔍
              </button>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="max-w-5xl mx-auto py-16 px-6">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
            How It Works
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 mt-1">
            Your journey in 3 simple steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Search</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Find destinations, hotels, and activities that inspire you.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Book</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Choose what you like and book securely in just a few clicks.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Travel</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Pack your bags and enjoy a seamless travel experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE HIKKING SECTION */}
        <section className="max-w-5xl mx-auto pb-16 px-6">
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
            Why Choose Hikking
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 mt-1">
            Travel with confidence
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-teal-600 text-xl mb-2">👤</div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Verified Local Guides
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                All our guides are verified professionals with excellent local
                knowledge.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-teal-600 text-xl mb-2">🔒</div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Secure Booking
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Your bookings and payments are safe with our trusted platform.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-teal-600 text-xl mb-2">🎧</div>
              <h3 className="font-semibold text-gray-900 text-sm">
                24/7 Support
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                We're here for you anytime, anywhere, before and during your
                trip.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
