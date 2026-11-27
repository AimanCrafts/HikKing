import { notFound } from "next/navigation";
import Shell from "../../components/Shell";
import { SITE } from "../../lib/site";

// Edit these texts to match your real business terms before going live.
const DOCS: Record<string, { title: string; updated: string; sections: { h: string; p: string[] }[] }> = {
  terms: {
    title: "Terms of service",
    updated: "November 2026",
    sections: [
      { h: "Using HikKing", p: ["HikKing lets you browse trips across Bangladesh and send reservation requests. A request is not a confirmed booking until our team confirms it and you receive a notification in your account."] },
      { h: "Your account", p: ["You are responsible for the details you provide and for keeping your password private. You must give accurate names and contact details for everyone traveling."] },
      { h: "Reservations", p: ["Prices shown are per person and are estimates until confirmed. Dates, group sizes and itineraries can change because of weather, safety or transport conditions, and we will tell you as early as we can.", "We may decline a request, for example when a trip is full or the date is unavailable."] },
      { h: "Reviews and stories", p: ["Only travelers with a completed trip can post reviews. Stories and photos you share must be your own and must not include other people\u2019s private information. We may remove content that breaks these rules."] },
      { h: "Contact", p: [`Questions about these terms? Email ${SITE.email}.`] },
    ],
  },
  privacy: {
    title: "Privacy policy",
    updated: "November 2026",
    sections: [
      { h: "What we collect", p: ["Your name, email, phone number (if you add one), your reservation details, reviews, support requests and any stories or photos you choose to share."] },
      { h: "How we use it", p: ["To process your reservation requests, contact you about your trips, show your reviews and stories, and keep the service safe. We do not sell your personal information."] },
      { h: "On your device", p: ["We store your session and preferences, such as saved trips and light or dark mode, in your browser so the site remembers you."] },
      { h: "Your choices", p: [`You can ask us to correct or delete your account and content at any time by contacting ${SITE.email}.`] },
    ],
  },
  refunds: {
    title: "Cancellation policy",
    updated: "November 2026",
    sections: [
      { h: "Pending requests", p: ["You can cancel a request that hasn\u2019t been confirmed yet, any time, from My trips. Nothing is charged on the site."] },
      { h: "Confirmed trips", p: ["Cancel 7 or more days before the travel date: full refund of any amount paid to us.", "Cancel 3 to 6 days before: 50% refund.", "Cancel less than 72 hours before, or no-show: not refundable."] },
      { h: "If we cancel", p: ["If we have to cancel or reschedule a trip for safety, weather or transport reasons, you can choose another date or receive a full refund of anything you paid."] },
      { h: "How to cancel a confirmed trip", p: ["Open a support request from your account and reference the reservation. Our team will confirm the cancellation and any refund."] },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();

  return (
    <Shell>
      <section className="border-b border-line bg-surface">
        <div className="wrap py-14 sm:py-20">
          <h1 className="t-h1 text-ink">{doc.title}</h1>
          <p className="mt-3 text-sm font-bold text-ink3">Last updated {doc.updated}</p>
        </div>
      </section>
      <article className="wrap max-w-3xl py-14">
        {doc.sections.map((s) => (
          <section key={s.h} className="mb-10">
            <h2 className="t-h3 text-ink">{s.h}</h2>
            {s.p.map((t, i) => (
              <p key={i} className="mt-3 text-[16px] leading-[1.8] text-ink2">{t}</p>
            ))}
          </section>
        ))}
      </article>
    </Shell>
  );
}
