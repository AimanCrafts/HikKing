<<<<<<< HEAD
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
=======
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the{" "}
            <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
    </div>
  );
}
