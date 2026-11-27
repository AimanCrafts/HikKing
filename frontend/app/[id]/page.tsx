"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "../../components/Shell";
import { Button, Icon, Photo, Skeleton } from "../../components/ui";
import { Booking, Payment, PaymentMethod, createPayment, getBooking, getBookingPayments } from "../../lib/api";
import { fmtDate, money } from "../../lib/format";

const METHODS: { id: PaymentMethod; name: string; detail: string; logo?: string; initials?: string }[] = [
  { id: "bkash", name: "bKash", detail: "Mobile financial service", logo: "/payment/logos/bkash.png" },
  { id: "nagad", name: "Nagad", detail: "Mobile financial service", logo: "/payment/logos/nagad.png" },
  { id: "rocket", name: "Rocket", detail: "Mobile financial service", logo: "/payment/logos/rocket.png" },
  { id: "visa", name: "Visa", detail: "Card payment", initials: "VISA" },
  { id: "mastercard", name: "Mastercard", detail: "Card payment", initials: "MC" },
  { id: "amex", name: "American Express", detail: "Card payment", initials: "AMEX" },
  { id: "bank_transfer", name: "Bank transfer", detail: "Manual confirmation", initials: "BANK" },
  { id: "cash", name: "Cash", detail: "Pay in person", initials: "CASH" },
];

const METHOD_LABEL: Record<PaymentMethod, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  bank_transfer: "Bank transfer",
  cash: "Cash",
};

const STATUS_LABEL: Record<Payment["payment_status"], string> = {
  pending: "Awaiting confirmation",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

function PaymentStatus({ status }: { status: Payment["payment_status"] }) {
  const tone = status === "paid" ? "bg-jade-soft text-jade" : status === "pending" ? "bg-warn-soft text-warn" : status === "failed" ? "bg-danger-soft text-danger" : "bg-sunk text-ink2";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${tone}`}>{STATUS_LABEL[status]}</span>;
}

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = Number(params.id);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [method, setMethod] = useState<PaymentMethod>("bkash");
  const [accountLast4, setAccountLast4] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const load = useCallback(async () => {
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      setError("Invalid reservation number.");
      setLoading(false);
      return;
    }
    try {
      const [b, p] = await Promise.all([getBooking(bookingId), getBookingPayments(bookingId)]);
      setBooking(b);
      setPayments(p);
      setReceipt(p.find((x) => x.payment_status === "paid") ?? p[0] ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this reservation.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { load(); }, [load]);

  const paid = payments.some((p) => p.payment_status === "paid");
  const awaiting = payments.some((p) => p.payment_status === "pending");
  const isPendingMethod = method === "cash" || method === "bank_transfer";

  async function submit() {
    if (!booking) return;
    setError(null);
    setBusy(true);
    try {
      const result = await createPayment(booking.booking_id, {
        payment_method: method,
        payer_account: accountLast4 || undefined,
      });
      setReceipt(result);
      setPayments((prev) => [result, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record payment.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <Shell><div className="wrap py-12 space-y-4"><Skeleton className="h-16" /><Skeleton className="h-72" /></div></Shell>;
  }

  if (!booking) {
    return <Shell><div className="wrap py-16"><div className="rounded-2xl bg-danger-soft p-5 text-danger">{error ?? "Reservation not found."}</div><Button href="/dashboard" className="mt-5">My trips</Button></div></Shell>;
  }

  const pkg = booking.package;
  const activeReceipt = receipt;
  const paymentIsPaid = activeReceipt?.payment_status === "paid";
  const paymentIsPending = activeReceipt?.payment_status === "pending";

  return (
    <Shell>
      <main className="wrap py-10 sm:py-14">
        <button type="button" onClick={() => router.back()} className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-ink2 hover:text-ink">
          <Icon name="arrowLeft" size={17} /> Back
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-line bg-surface p-6 sm:p-8">
              <h1 className="t-h1 text-ink">Checkout</h1>
              <p className="mt-2 text-sm font-semibold text-ink2">Reservation #{booking.booking_id}</p>
              <div className="mt-6 flex gap-4">
                <div className="relative h-28 w-32 shrink-0 overflow-hidden rounded-2xl sm:h-36 sm:w-44">
                  <Photo src={pkg?.image_url || "/hero/rangamati.jpg"} alt={pkg?.title || "Tour package"} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-ink">{pkg?.title ?? `Tour #${booking.package_id}`}</h2>
                  <p className="mt-1 text-sm font-semibold text-ink2">{pkg?.destination?.name ?? "Bangladesh"}</p>
                  <p className="mt-3 text-sm text-ink2">{fmtDate(booking.travel_date)} · {booking.total_travelers} traveler{booking.total_travelers === 1 ? "" : "s"}</p>
                </div>
              </div>
              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                <div className="flex justify-between gap-3 text-ink2"><dt>Price per traveler</dt><dd className="font-bold text-ink">{money(Number(booking.total_price) / booking.total_travelers)}</dd></div>
                <div className="flex justify-between gap-3 text-ink2"><dt>Travelers</dt><dd className="font-bold text-ink">× {booking.total_travelers}</dd></div>
                <div className="flex justify-between gap-3 border-t border-line pt-4 text-lg font-black text-ink"><dt>Total</dt><dd>{money(booking.total_price)}</dd></div>
              </dl>
            </div>

            {payments.length > 0 && (
              <div className="rounded-[28px] border border-line bg-surface p-6 sm:p-8">
                <h2 className="t-h3 text-ink">Payment history</h2>
                <div className="mt-4 space-y-3">
                  {payments.map((p) => (
                    <div key={p.payment_id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-extrabold text-ink">{METHOD_LABEL[p.payment_method]}</p>
                        <p className="text-xs font-semibold text-ink3">{p.transaction_id}</p>
                      </div>
                      <div className="text-right"><p className="font-extrabold text-ink">{money(p.amount)}</p><PaymentStatus status={p.payment_status} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="checkout-payment-panel rounded-[28px] border border-line bg-surface p-6 shadow-[var(--shadow-lift)] sm:p-8">
            {activeReceipt && (paymentIsPaid || paymentIsPending) ? (
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-jade text-on-jade"><Icon name={paymentIsPaid ? "check" : "clock"} size={28} /></div>
                <h2 className="t-h2 mt-5 text-ink">{paymentIsPaid ? "Payment recorded" : "Payment awaiting confirmation"}</h2>
                <p className="mt-2 text-sm text-ink2">{paymentIsPaid ? "Your payment record is saved with this reservation." : "This payment record is waiting for confirmation."}</p>
                <div className="mt-5 rounded-2xl bg-sunk p-4">
                  <PaymentStatus status={activeReceipt.payment_status} />
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-ink2">Transaction reference</dt><dd className="font-extrabold text-ink text-right break-all">{activeReceipt.transaction_id}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-ink2">Method</dt><dd className="font-extrabold text-ink">{METHOD_LABEL[activeReceipt.payment_method]}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-ink2">Amount</dt><dd className="font-extrabold text-ink">{money(activeReceipt.amount)}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-ink2">Recorded</dt><dd className="font-extrabold text-ink text-right">{activeReceipt.created_at ? fmtDate(activeReceipt.created_at) : "—"}</dd></div>
                  </dl>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-ink3">This checkout stores payment records locally. It does not transfer money to a payment provider.</p>
                <div className="mt-6 grid gap-3"><Button href="/dashboard" full>View my trips</Button><Button variant="outline" full onClick={() => window.print()}>Print receipt</Button></div>
                {paymentIsPending && <p className="mt-4 text-sm font-semibold text-ink2">An administrator can update this payment after confirming cash collection or bank transfer.</p>}
              </div>
            ) : (
              <>
                <h2 className="t-h3 text-ink">Payment method</h2>
                <p className="mt-2 text-sm text-ink2">Choose how you want to record this reservation payment.</p>
                {paid && <p className="mt-4 rounded-xl bg-jade-soft p-3 text-sm font-bold text-jade">This reservation already has a paid record.</p>}
                {awaiting && <p className="mt-4 rounded-xl bg-warn-soft p-3 text-sm font-bold text-warn">A payment record is awaiting confirmation. Please wait for its status to be updated.</p>}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {METHODS.map((m) => (
                    <button key={m.id} type="button" disabled={paid || awaiting} onClick={() => { setMethod(m.id); setAccountLast4(""); }} className={`flex min-h-20 items-center gap-3 rounded-2xl border p-3 text-left transition ${method === m.id ? "border-jade bg-jade-soft" : "border-line bg-bg hover:border-ink"} disabled:cursor-not-allowed disabled:opacity-60`}>
                      {m.logo ? <Photo src={m.logo} alt={`${m.name} logo`} className="h-10 w-12 !object-contain" /> : <span className="flex h-10 w-12 items-center justify-center rounded-xl bg-sunk text-xs font-black text-ink2">{m.initials}</span>}
                      <span className="min-w-0"><span className="block text-sm font-extrabold text-ink">{m.name}</span><span className="block text-[11px] font-semibold text-ink3">{m.detail}</span></span>
                    </button>
                  ))}
                </div>
                {(method === "bkash" || method === "nagad" || method === "rocket" || method === "visa" || method === "mastercard" || method === "amex") && (
                  <label className="mt-5 block">
                    <span className="text-sm font-extrabold text-ink">Account/card reference (last 4 digits, optional)</span>
                    <input inputMode="numeric" maxLength={4} value={accountLast4} onChange={(e) => setAccountLast4(e.target.value.replace(/\D/g, "").slice(0,4))} className="field mt-2" placeholder="••••" />
                    <span className="mt-1 block text-xs text-ink3">Do not enter a PIN, OTP, full card number or security code.</span>
                  </label>
                )}
                {method === "bank_transfer" && <p className="mt-5 rounded-xl bg-sunk p-4 text-sm text-ink2">Bank transfer records stay pending until an administrator confirms them. This local checkout does not initiate a transfer.</p>}
                {method === "cash" && <p className="mt-5 rounded-xl bg-sunk p-4 text-sm text-ink2">Cash records stay pending until an administrator confirms collection.</p>}
                {error && <p role="alert" className="mt-4 rounded-xl bg-danger-soft p-3 text-sm font-bold text-danger">{error}</p>}
                <div className="mt-6 flex items-center justify-between border-t border-line pt-5"><span className="font-bold text-ink2">Amount due</span><span className="text-xl font-black text-ink">{money(booking.total_price)}</span></div>
                <Button full size="lg" loading={busy} disabled={paid || awaiting} onClick={submit} className="mt-5">{isPendingMethod ? "Record payment arrangement" : "Confirm payment"}</Button>
                <p className="mt-4 text-xs leading-relaxed text-ink3">Payment records are saved in your local project database. No money is transferred through this website.</p>
              </>
            )}
          </section>
        </div>
      </main>
      <style jsx global>{`@media print { body * { visibility: hidden !important; } .checkout-payment-panel, .checkout-payment-panel * { visibility: visible !important; } .checkout-payment-panel { position: absolute !important; inset: 0 auto auto 0 !important; width: 100% !important; border: 0 !important; box-shadow: none !important; } button { display: none !important; } }`}</style>
    </Shell>
  );
}
