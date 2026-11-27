"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Shell from "../../components/Shell";
import TravelNotice from "../../components/TravelNotice";
import { Button, Icon, Photo, Skeleton } from "../../components/ui";
import {
  Booking,
  Payment,
  PaymentMethod,
  createPayment,
  getBooking,
  getBookingPayments,
} from "../../lib/api";
import { fmtDate, money } from "../../lib/format";

type GatewayMethod = "bkash" | "nagad" | "rocket";
type CardNetwork = "visa" | "mastercard";

// The dialog walks through these screens.
// bKash / Nagad / Rocket:  phone -> otp -> pin -> processing -> success/failed
// Card:                    card-network -> card-form -> processing -> success/failed
type FlowStep =
  | "phone"
  | "otp"
  | "pin"
  | "card-network"
  | "card-form"
  | "processing"
  | "success"
  | "failed";

const METHODS: {
  id: GatewayMethod | "card";
  name: string;
  detail: string;
  logo: string;
}[] = [
  {
    id: "bkash",
    name: "bKash",
    detail: "Mobile financial service",
    logo: "/payment/logos/bkash.png",
  },
  {
    id: "nagad",
    name: "Nagad",
    detail: "Mobile financial service",
    logo: "/payment/logos/nagad.png",
  },
  {
    id: "rocket",
    name: "Rocket",
    detail: "Mobile financial service",
    logo: "/payment/logos/rocket.png",
  },
  {
    id: "card",
    name: "Card",
    detail: "Visa or Mastercard",
    logo: "/payment/logos/card.png",
  },
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

/* -------------------------------------------------------------------------
 * GATEWAY THEME + LOCAL SIMULATION RULES
 * ---------------------------------------------------------------------
 * There is no real bKash / Nagad / Rocket / card network behind this screen.
 * Everything below only exists so the flow LOOKS and FEELS like the real
 * apps while running fully offline. Swap the `logo` paths in METHODS above
 * for real PNGs under /public/payment/logos/ whenever you have them — the
 * flow logic does not depend on the images being present.
 * ---------------------------------------------------------------------- */
const GATEWAY_THEME: Record<
  GatewayMethod,
  {
    label: string;
    tagline: string;
    primary: string;
    primaryDark: string;
    otpLength: number;
    pinLength: number;
    // Real bKash reshuffles its PIN pad layout every time the screen opens
    // (so a shoulder-surfer can't learn the PIN from finger position).
    shufflePinPad: boolean;
    // ---- PASS / FAIL rule for this local simulation ----
    // Entering this exact OTP / PIN is treated as "correct" and advances
    // the flow. Anything else counts as a wrong attempt.
    correctOtp: string;
    correctPin: string;
  }
> = {
  bkash: {
    label: "bKash",
    tagline: "Mobile Financial Service",
    primary: "#E2136E",
    primaryDark: "#9E0E4E",
    otpLength: 6,
    pinLength: 5, // bKash PINs are 5 digits
    shufflePinPad: true,
    correctOtp: "123456",
    correctPin: "12345",
  },
  nagad: {
    label: "Nagad",
    tagline: "Digital Financial Service",
    primary: "#EC1D27",
    primaryDark: "#A7141C",
    otpLength: 6,
    pinLength: 4, // Nagad PINs are 4 digits
    shufflePinPad: false,
    correctOtp: "123456",
    correctPin: "1234",
  },
  rocket: {
    label: "Rocket",
    tagline: "DBBL Mobile Banking",
    primary: "#8C3494",
    primaryDark: "#5A2160",
    otpLength: 6,
    pinLength: 4, // Rocket PINs are 4 digits
    shufflePinPad: false,
    correctOtp: "123456",
    correctPin: "1234",
  },
};

const MAX_ATTEMPTS = 3;

// A valid-looking Bangladeshi mobile number: 01 + operator digit (3-9) + 8 digits.
// Any other pattern is rejected on the phone-number screen.
const BD_PHONE_RE = /^01[3-9]\d{8}$/;

// Standard Luhn checksum — the same first check a real card network runs.
// PASS: a 16-digit number that satisfies Luhn (e.g. the well-known public
//       test number 4111 1111 1111 1111) -> the processing screen "approves" it.
// FAIL: correctly formatted but Luhn-invalid numbers -> shown as "declined",
//       so both outcomes can be demoed without any real card network.
function luhnValid(num: string) {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function PaymentStatus({ status }: { status: Payment["payment_status"] }) {
  const tone =
    status === "paid"
      ? "bg-jade-soft text-jade"
      : status === "pending"
        ? "bg-warn-soft text-warn"
        : status === "failed"
          ? "bg-danger-soft text-danger"
          : "bg-sunk text-ink2";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${tone}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function getPaymentMethodLabel(method: PaymentMethod) {
  return METHOD_LABEL[method] ?? method;
}

/* -------------------------------------------------------------------------
 * Small building blocks for the gateway screens
 * ---------------------------------------------------------------------- */

// One box per digit, auto-advances focus as you type — the standard OTP
// pattern used by bKash / Nagad / Rocket's own apps.
function OtpBoxes({
  length,
  value,
  onChange,
  disabled,
  accent,
}: {
  length: number;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  accent: string;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  function setDigit(index: number, digit: string) {
    const chars = value.split("");
    chars[index] = digit;
    const next = chars.join("").slice(0, length);
    onChange(next);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={value[index] ?? ""}
          onChange={(event) =>
            setDigit(index, event.target.value.replace(/\D/g, "").slice(-1))
          }
          onKeyDown={(event) => handleKeyDown(index, event)}
          className="h-12 w-9 rounded-xl border-2 border-line text-center text-lg font-black text-ink outline-none transition sm:h-14 sm:w-11"
          style={{ borderColor: value[index] ? accent : undefined }}
        />
      ))}
    </div>
  );
}

// PIN entry from the keyboard. The dots show progress as you type; a
// transparent input on top captures the keystrokes.
function PinInput({
  length,
  value,
  onChange,
  accent,
  disabled,
}: {
  length: number;
  value: string;
  onChange: (next: string) => void;
  accent: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  return (
    <div
      className="relative cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex justify-center gap-3">
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className="h-4 w-4 rounded-full border-2 transition"
            style={{
              borderColor: accent,
              background: i < value.length ? accent : "transparent",
            }}
          />
        ))}
      </div>
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        maxLength={length}
        disabled={disabled}
        value={value}
        onChange={(event) =>
          onChange(event.target.value.replace(/\D/g, "").slice(0, length))
        }
        aria-label="PIN"
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
      />
    </div>
  );
}

// The colored call-to-action button used on the bKash / Nagad / Rocket
// screens, painted in that gateway's own brand color.
function GatewayButton({
  children,
  onClick,
  disabled,
  accent,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl py-3.5 text-sm font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: accent }}
    >
      {children}
    </button>
  );
}

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = Number(params.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [method, setMethod] = useState<PaymentMethod>("bkash");
  const [selectedOption, setSelectedOption] = useState<GatewayMethod | "card">(
    "bkash",
  );
  const [cardNetwork, setCardNetwork] = useState<CardNetwork>("visa");

  const [modalOpen, setModalOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>("phone");
  const [transitioning, setTransitioning] = useState(false);
  const [willSucceed, setWillSucceed] = useState(true);
  const [failReason, setFailReason] = useState("");

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [resendIn, setResendIn] = useState(30);

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinAttempts, setPinAttempts] = useState(0);

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);

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
      const [b, p] = await Promise.all([
        getBooking(bookingId),
        getBookingPayments(bookingId),
      ]);
      setBooking(b);
      setPayments(p);
      // Prefer a paid record; otherwise show the most recent pending record.
      setReceipt(
        p.find((payment) => payment.payment_status === "paid") ??
          p.find((payment) => payment.payment_status === "pending") ??
          null,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load this reservation.",
      );
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  const locked =
    transitioning || flowStep === "processing" || flowStep === "success";

  // Keep the page behind the centered dialog from scrolling while it is open.
  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && !locked) closeModal();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // closeModal is intentionally represented by the state setter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, locked]);

  // 30-second resend countdown, restarted every time the OTP screen opens.
  useEffect(() => {
    if (flowStep !== "otp") return;
    setResendIn(30);
    const id = window.setInterval(() => {
      setResendIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [flowStep]);

  // Auto-verify the OTP the moment all boxes are filled, exactly like the
  // real apps do — no separate "verify" button on this screen.
  useEffect(() => {
    if (flowStep !== "otp" || selectedOption === "card") return;
    const theme = GATEWAY_THEME[selectedOption];
    if (otp.length < theme.otpLength) return;

    if (otp === theme.correctOtp) {
      setOtpError(null);
      goWithDelay("pin", 650);
    } else {
      const attempts = otpAttempts + 1;
      setOtpAttempts(attempts);
      setOtp("");
      if (attempts >= MAX_ATTEMPTS) {
        setFailReason("You have entered the wrong code too many times.");
        goWithDelay("failed", 500);
      } else {
        setOtpError(
          `Wrong code. Only (${MAX_ATTEMPTS - attempts} attempt pending)`,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Auto-verify the PIN once it reaches the gateway's PIN length.
  useEffect(() => {
    if (flowStep !== "pin" || selectedOption === "card") return;
    const theme = GATEWAY_THEME[selectedOption];
    if (pin.length < theme.pinLength) return;

    if (pin === theme.correctPin) {
      setPinError(null);
      setWillSucceed(true);
      goWithDelay("processing", 400);
    } else {
      const attempts = pinAttempts + 1;
      setPinAttempts(attempts);
      setPin("");
      if (attempts >= MAX_ATTEMPTS) {
        setFailReason("You have entered the wrong PIN too many times.");
        goWithDelay("failed", 500);
      } else {
        setPinError(
          `The PIN is incorrect. You have ${MAX_ATTEMPTS - attempts} attempt(s) remaining.`,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  // The "processing" screen itself. It only decides the outcome that was
  // already computed (willSucceed) and, on success, records the payment
  // through the real API — the server only ever receives the selected
  // method and a non-sensitive last-4 reference, never a PIN/OTP/CVV/full
  // card number.
  useEffect(() => {
    if (flowStep !== "processing" || !booking) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      if (!willSucceed) {
        setFlowStep("failed");
        return;
      }
      try {
        const payerAccount =
          selectedOption === "card"
            ? cardNumber.replace(/\D/g, "").slice(-4)
            : phone.slice(-4);
        const result = await createPayment(booking.booking_id, {
          payment_method: method,
          payer_account: payerAccount || undefined,
        });
        if (cancelled) return;
        setReceipt(result);
        setPayments((previous) => [result, ...previous]);
        setFlowStep("success");
      } catch (e) {
        if (cancelled) return;
        setFailReason(
          e instanceof Error ? e.message : "The payment could not be recorded.",
        );
        setFlowStep("failed");
      }
    }, 1700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowStep]);

  // Show the branded "success" tick for a moment, then close the dialog so
  // the page's own receipt panel underneath takes over.
  useEffect(() => {
    if (flowStep !== "success") return;
    const t = window.setTimeout(() => setModalOpen(false), 1400);
    return () => window.clearTimeout(t);
  }, [flowStep]);

  const paid = payments.some((payment) => payment.payment_status === "paid");
  const awaiting = payments.some(
    (payment) => payment.payment_status === "pending",
  );
  const activeReceipt = receipt;
  const paymentIsPaid = activeReceipt?.payment_status === "paid";
  const paymentIsPending = activeReceipt?.payment_status === "pending";

  function goWithDelay(next: FlowStep, ms: number) {
    setTransitioning(true);
    window.setTimeout(() => {
      setTransitioning(false);
      setFlowStep(next);
    }, ms);
  }

  function closeModal() {
    if (locked) return;
    setModalOpen(false);
  }

  function handleBack() {
    if (locked) return;
    if (flowStep === "otp") {
      setOtp("");
      setOtpError(null);
      setFlowStep("phone");
      return;
    }
    if (flowStep === "pin") {
      setPin("");
      setPinError(null);
      setOtp("");
      setFlowStep("otp");
      return;
    }
    if (flowStep === "card-form") {
      setFlowStep("card-network");
      return;
    }
    closeModal();
  }

  function handleResend() {
    setResendIn(30);
    setOtp("");
    setOtpError(null);
  }

  function retryFlow() {
    setOtpAttempts(0);
    setOtpError(null);
    setPinAttempts(0);
    setPinError(null);
    setCardError(null);
    setFailReason("");
    if (selectedOption === "card") {
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setCardName("");
      setFlowStep("card-network");
    } else {
      setPhone("");
      setPhoneError(null);
      setOtp("");
      setPin("");
      setFlowStep("phone");
    }
  }

  function openMethod(option: GatewayMethod | "card") {
    if (paid || awaiting) return;
    setSelectedOption(option);
    setError(null);
    setFailReason("");
    setPhone("");
    setPhoneError(null);
    setOtp("");
    setOtpError(null);
    setOtpAttempts(0);
    setPin("");
    setPinError(null);
    setPinAttempts(0);
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setCardError(null);
    setWillSucceed(true);

    if (option === "card") {
      setCardNetwork("visa");
      setMethod("visa");
      setFlowStep("card-network");
    } else {
      setMethod(option);
      setFlowStep("phone");
    }
    setModalOpen(true);
  }

  function submitPhone() {
    if (!BD_PHONE_RE.test(phone)) {
      setPhoneError(
        "Enter a valid 11-digit phone number (for example, 01812345678).",
      );
      return;
    }
    setPhoneError(null);
    goWithDelay("otp", 900);
  }

  function submitCard() {
    const digits = cardNumber.replace(/\D/g, "");
    const [mm, yy] = cardExpiry.split("/");
    const month = Number(mm);

    let err: string | null = null;
    if (digits.length !== 16) {
      err = "Enter a 16-digit card number.";
    } else if (!mm || !yy || yy.length !== 2 || month < 1 || month > 12) {
      err = "Enter the expiry date in the correct MM/YY format.";
    } else {
      const now = new Date();
      const expiry = new Date(2000 + Number(yy), month, 0, 23, 59, 59);
      if (expiry < now) err = "This card has expired.";
    }
    if (!err && cardCvv.length !== 3) err = "Enter a 3-digit CVV.";
    if (!err && cardName.trim().length < 2)
      err = "Enter the name shown on the card.";

    if (err) {
      setCardError(err);
      return;
    }
    setCardError(null);
    // SIMULATION RULE: approved only if the number passes the Luhn check —
    // see luhnValid() above. A correctly formatted but Luhn-invalid number
    // is shown as "declined" on the processing screen.
    const ok = luhnValid(digits);
    setWillSucceed(ok);
    setFailReason(ok ? "" : "Bank is not receiving the card!");
    goWithDelay("processing", 900);
  }

  if (loading) {
    return (
      <Shell>
        <div className="wrap space-y-4 py-12">
          <Skeleton className="h-16" />
          <Skeleton className="h-72" />
        </div>
      </Shell>
    );
  }

  if (!booking) {
    return (
      <Shell>
        <div className="wrap py-16">
          <div className="rounded-2xl bg-danger-soft p-5 text-danger">
            {error ?? "Reservation not found."}
          </div>
          <Button href="/dashboard" className="mt-5">
            My trips
          </Button>
        </div>
      </Shell>
    );
  }

  const pkg = booking.package;
  const isCard = selectedOption === "card";
  const theme = !isCard ? GATEWAY_THEME[selectedOption] : null;

  return (
    <Shell>
      <main className="wrap py-10 sm:py-14">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-ink2 transition hover:text-ink"
        >
          <Icon name="arrowLeft" size={17} /> Back
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-line bg-surface p-6 sm:p-8">
              <h1 className="t-h1 text-ink">Checkout</h1>
              <p className="mt-2 text-sm font-semibold text-ink2">
                Reservation #{booking.booking_id}
              </p>

              <div className="mt-6 flex gap-4">
                <div className="relative h-28 w-32 shrink-0 overflow-hidden rounded-2xl sm:h-36 sm:w-44">
                  <Photo
                    src={pkg?.image_url || "/hero/rangamati.jpg"}
                    alt={pkg?.title || "Tour package"}
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold text-ink">
                    {pkg?.title ?? `Tour #${booking.package_id}`}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-ink2">
                    {pkg?.destination?.name ?? "Bangladesh"}
                  </p>
                  <p className="mt-3 text-sm text-ink2">
                    {fmtDate(booking.travel_date)} · {booking.total_travelers}{" "}
                    traveler
                    {booking.total_travelers === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                <div className="flex justify-between gap-3 text-ink2">
                  <dt>Price per traveler</dt>
                  <dd className="font-bold text-ink">
                    {money(
                      Number(booking.total_price) / booking.total_travelers,
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 text-ink2">
                  <dt>Travelers</dt>
                  <dd className="font-bold text-ink">
                    × {booking.total_travelers}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-line pt-4 text-lg font-black text-ink">
                  <dt>Total</dt>
                  <dd>{money(booking.total_price)}</dd>
                </div>
              </dl>
            </div>

            <TravelNotice />

            {payments.length > 0 && (
              <div className="rounded-[28px] border border-line bg-surface p-6 sm:p-8">
                <h2 className="t-h3 text-ink">Payment history</h2>
                <div className="mt-4 space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.payment_id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-extrabold text-ink">
                          {getPaymentMethodLabel(payment.payment_method)}
                        </p>
                        <p className="text-xs font-semibold text-ink3">
                          {payment.transaction_id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-ink">
                          {money(payment.amount)}
                        </p>
                        <PaymentStatus status={payment.payment_status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="checkout-payment-panel rounded-[28px] border border-line bg-surface p-6 shadow-[var(--shadow-lift)] sm:p-8">
            {activeReceipt && (paymentIsPaid || paymentIsPending) ? (
              <div className="animate-result-in">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${paymentIsPaid ? "bg-jade text-on-jade" : "bg-warn-soft text-warn"}`}
                >
                  <Icon name={paymentIsPaid ? "check" : "clock"} size={28} />
                </div>
                <h2 className="t-h2 mt-5 text-ink">
                  {paymentIsPaid
                    ? "Payment recorded"
                    : "Payment awaiting confirmation"}
                </h2>
                <p className="mt-2 text-sm text-ink2">
                  {paymentIsPaid
                    ? "Your payment record is saved with this reservation."
                    : "This payment record is waiting for confirmation."}
                </p>
                <div className="mt-5 rounded-2xl bg-sunk p-4">
                  <PaymentStatus status={activeReceipt.payment_status} />
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink2">Transaction reference</dt>
                      <dd className="break-all text-right font-extrabold text-ink">
                        {activeReceipt.transaction_id}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink2">Method</dt>
                      <dd className="font-extrabold text-ink">
                        {getPaymentMethodLabel(activeReceipt.payment_method)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink2">Amount</dt>
                      <dd className="font-extrabold text-ink">
                        {money(activeReceipt.amount)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink2">Recorded</dt>
                      <dd className="text-right font-extrabold text-ink">
                        {activeReceipt.created_at
                          ? fmtDate(activeReceipt.created_at)
                          : "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-6 grid gap-3">
                  <Button href="/dashboard" full>
                    View my trips
                  </Button>
                  <Button variant="outline" full onClick={() => window.print()}>
                    Print receipt
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="t-h3 text-ink">Choose payment method</h2>
                <p className="mt-2 text-sm text-ink2">
                  Select your preferred way to pay for this reservation.
                </p>

                {paid && (
                  <p className="mt-4 rounded-xl bg-jade-soft p-3 text-sm font-bold text-jade">
                    This reservation already has a paid record.
                  </p>
                )}
                {awaiting && (
                  <p className="mt-4 rounded-xl bg-warn-soft p-3 text-sm font-bold text-warn">
                    A payment record is awaiting confirmation. Please wait for
                    its status to be updated.
                  </p>
                )}

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {METHODS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={paid || awaiting}
                      onClick={() => openMethod(item.id)}
                      className="group flex min-h-[92px] items-center gap-3 rounded-2xl border border-line bg-bg p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-jade hover:bg-jade-soft hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl bg-surface p-2">
                        <Photo
                          src={item.logo}
                          alt={`${item.name} logo`}
                          className="h-full w-full !object-contain"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-extrabold text-ink">
                          {item.name}
                        </span>
                        <span className="mt-0.5 block text-xs font-semibold text-ink3">
                          {item.detail}
                        </span>
                      </span>
                      <Icon name="chevronRight" size={17} />
                    </button>
                  ))}
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl bg-danger-soft p-3 text-sm font-bold text-danger"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                  <span className="font-bold text-ink2">Amount due</span>
                  <span className="text-xl font-black text-ink">
                    {money(booking.total_price)}
                  </span>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {modalOpen && (
        <div
          className="payment-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            className={`payment-modal-card relative my-auto w-full overflow-hidden rounded-[28px] shadow-2xl ${
              isCard
                ? "max-w-[460px] border border-line bg-surface"
                : "max-w-[400px] bg-white"
            }`}
          >
            <div
              className="flex items-center justify-between px-5 py-4 sm:px-6"
              style={
                !isCard
                  ? {
                      background: `linear-gradient(135deg, ${theme!.primary}, ${theme!.primaryDark})`,
                    }
                  : undefined
              }
            >
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={locked}
                  aria-label="Go back"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${
                    isCard
                      ? "bg-sunk text-ink2 hover:bg-jade-soft hover:text-jade"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  <Icon name="arrowLeft" size={17} />
                </button>
                <div className="min-w-0">
                  <h2
                    id="payment-modal-title"
                    className={`truncate text-base font-black ${isCard ? "text-ink" : "text-white"}`}
                  >
                    {isCard ? "Card payment" : theme!.label}
                  </h2>
                  <p
                    className={`text-xs font-semibold ${isCard ? "text-ink3" : "text-white/80"}`}
                  >
                    {isCard
                      ? `Reservation #${booking.booking_id}`
                      : theme!.tagline}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={locked}
                aria-label="Close payment window"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${
                  isCard
                    ? "text-ink3 hover:bg-sunk hover:text-ink"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                <Icon name="close" size={19} />
              </button>
            </div>

            <div
              className={`relative max-h-[min(78vh,650px)] overflow-y-auto ${
                isCard ? "bg-surface p-5 sm:p-7" : "bg-white p-6"
              }`}
            >
              {transitioning && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/85 backdrop-blur-sm">
                  <span
                    className="h-10 w-10 animate-spin rounded-full border-[3px] border-t-transparent"
                    style={{
                      borderColor: theme ? theme.primary : "var(--jade)",
                    }}
                  />
                </div>
              )}

              <div key={flowStep} className="payment-step-in">
                {/* ---------------- bKash / Nagad / Rocket: phone ---------------- */}
                {flowStep === "phone" && theme && (
                  <>
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sunk p-2">
                        <Photo
                          src={
                            METHODS.find((m) => m.id === selectedOption)
                              ?.logo ?? ""
                          }
                          alt={`${theme.label} logo`}
                          className="h-full w-full !object-contain"
                        />
                      </div>
                      <h3 className="mt-3 text-lg font-black text-ink">
                        Enter your phone number
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-ink3">
                        Enter the {theme.label} number you want to use for this
                        payment.
                      </p>
                    </div>

                    <div className="mt-6">
                      <input
                        inputMode="numeric"
                        autoFocus
                        maxLength={11}
                        value={phone}
                        onChange={(event) => {
                          setPhone(
                            event.target.value.replace(/\D/g, "").slice(0, 11),
                          );
                          setPhoneError(null);
                        }}
                        placeholder="01XXXXXXXXX"
                        className="field w-full text-center text-lg tracking-wider"
                      />
                      {phoneError && (
                        <p className="mt-2 text-center text-xs font-bold text-danger">
                          {phoneError}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 rounded-2xl bg-sunk p-4 text-center">
                      <p className="text-xs font-bold text-ink2">Amount due</p>
                      <p className="mt-1 text-2xl font-black text-ink">
                        {money(booking.total_price)}
                      </p>
                    </div>

                    <div className="mt-6">
                      <GatewayButton
                        accent={theme.primary}
                        disabled={phone.length !== 11}
                        onClick={submitPhone}
                      >
                        Continue
                      </GatewayButton>
                    </div>
                  </>
                )}

                {/* ---------------- bKash / Nagad / Rocket: otp ---------------- */}
                {flowStep === "otp" && theme && (
                  <>
                    <div className="text-center">
                      <h3 className="text-lg font-black text-ink">
                        Verify your code
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-ink3">
                        Enter the {theme.otpLength}-digit code sent to {phone}.
                      </p>
                    </div>

                    <div className="mt-6">
                      <OtpBoxes
                        length={theme.otpLength}
                        value={otp}
                        onChange={setOtp}
                        accent={theme.primary}
                      />
                      {otpError && (
                        <p className="mt-3 text-center text-xs font-bold text-danger">
                          {otpError}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 text-center text-xs font-semibold text-ink3">
                      {resendIn > 0 ? (
                        <span>
                          You can request a new code in {resendIn} seconds.
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          className="font-extrabold"
                          style={{ color: theme.primary }}
                        >
                          Resend code
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* ---------------- bKash / Nagad / Rocket: pin ---------------- */}
                {flowStep === "pin" && theme && (
                  <>
                    <div className="text-center">
                      <h3 className="text-lg font-black text-ink">
                        Enter your PIN
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-ink3">
                        Enter your {theme.label} PIN.
                      </p>
                    </div>

                    <div className="mt-6">
                      <PinInput
                        length={theme.pinLength}
                        value={pin}
                        onChange={setPin}
                        accent={theme.primary}
                      />
                      {pinError && (
                        <p className="mt-3 text-center text-xs font-bold text-danger">
                          {pinError}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* ---------------- Card: choose network ---------------- */}
                {flowStep === "card-network" && (
                  <>
                    <p className="text-sm leading-relaxed text-ink2">
                      Choose the card network you want to use for this
                      reservation.
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setCardNetwork("visa");
                          setMethod("visa");
                        }}
                        className={`rounded-2xl border p-3 text-left transition duration-200 ${cardNetwork === "visa" ? "border-jade bg-jade-soft ring-2 ring-jade/15" : "border-line bg-bg hover:border-jade"}`}
                      >
                        <div className="flex h-12 items-center justify-center rounded-xl bg-white">
                          <span className="text-2xl font-black italic tracking-tight text-[#1A1F71]">
                            VISA
                          </span>
                        </div>
                        <span className="mt-2 block text-sm font-extrabold text-ink">
                          Visa
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCardNetwork("mastercard");
                          setMethod("mastercard");
                        }}
                        className={`rounded-2xl border p-3 text-left transition duration-200 ${cardNetwork === "mastercard" ? "border-jade bg-jade-soft ring-2 ring-jade/15" : "border-line bg-bg hover:border-jade"}`}
                      >
                        <div className="flex h-12 items-center justify-center rounded-xl bg-white">
                          <span className="relative flex items-center">
                            <span className="h-7 w-7 rounded-full bg-[#EB001B]" />
                            <span className="-ml-3 h-7 w-7 rounded-full bg-[#F79E1B]/95" />
                          </span>
                        </div>
                        <span className="mt-2 block text-sm font-extrabold text-ink">
                          Mastercard
                        </span>
                      </button>
                    </div>

                    <div
                      className={`mt-5 overflow-hidden rounded-2xl p-5 text-white transition-all duration-300 ${cardNetwork === "visa" ? "bg-[#183B70]" : "bg-[#252525]"}`}
                    >
                      <div className="flex items-start justify-between">
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <path d="M2 10h20" />
                        </svg>
                        {cardNetwork === "visa" ? (
                          <span className="text-xl font-black italic tracking-tight">
                            VISA
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <span className="h-7 w-7 rounded-full bg-[#EB001B]" />
                            <span className="-ml-3 h-7 w-7 rounded-full bg-[#F79E1B]" />
                          </span>
                        )}
                      </div>
                      <p className="mt-7 text-lg font-semibold tracking-[0.22em]">
                        {cardNumber
                          ? cardNumber
                              .padEnd(16, "•")
                              .replace(/(.{4})/g, "$1 ")
                              .trim()
                          : "•••• •••• •••• ••••"}
                      </p>
                      <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/75">
                        <span>Cardholder</span>
                        <span>Valid thru</span>
                      </div>
                      <div className="mt-1 flex justify-between text-xs font-bold tracking-wide">
                        <span>{cardName || "YOUR NAME"}</span>
                        <span>{cardExpiry || "MM/YY"}</span>
                      </div>
                    </div>

                    <Button
                      full
                      size="lg"
                      className="mt-6"
                      onClick={() => setFlowStep("card-form")}
                    >
                      Continue
                    </Button>
                  </>
                )}

                {/* ---------------- Card: enter details ---------------- */}
                {flowStep === "card-form" && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-14 items-center justify-center rounded-lg border border-line bg-white">
                        {cardNetwork === "visa" ? (
                          <span className="text-sm font-black italic text-[#1A1F71]">
                            VISA
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <span className="h-5 w-5 rounded-full bg-[#EB001B]" />
                            <span className="-ml-2 h-5 w-5 rounded-full bg-[#F79E1B]/95" />
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-ink">
                        Card details
                      </h3>
                    </div>

                    <label className="mt-5 block">
                      <span className="text-sm font-extrabold text-ink">
                        Card number
                      </span>
                      <input
                        inputMode="numeric"
                        autoFocus
                        value={cardNumber.replace(/(.{4})/g, "$1 ").trim()}
                        onChange={(event) =>
                          setCardNumber(
                            event.target.value.replace(/\D/g, "").slice(0, 16),
                          )
                        }
                        maxLength={19}
                        placeholder="1234 5678 9012 3456"
                        className="field mt-2"
                      />
                    </label>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-sm font-extrabold text-ink">
                          Expiry (MM/YY)
                        </span>
                        <input
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={(event) => {
                            const digits = event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);
                            setCardExpiry(
                              digits.length > 2
                                ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                                : digits,
                            );
                          }}
                          maxLength={5}
                          placeholder="MM/YY"
                          className="field mt-2"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-extrabold text-ink">
                          CVV
                        </span>
                        <input
                          inputMode="numeric"
                          type="password"
                          value={cardCvv}
                          onChange={(event) =>
                            setCardCvv(
                              event.target.value.replace(/\D/g, "").slice(0, 3),
                            )
                          }
                          maxLength={3}
                          placeholder="•••"
                          className="field mt-2"
                        />
                      </label>
                    </div>

                    <label className="mt-4 block">
                      <span className="text-sm font-extrabold text-ink">
                        Name on card
                      </span>
                      <input
                        value={cardName}
                        onChange={(event) =>
                          setCardName(
                            event.target.value.toUpperCase().slice(0, 26),
                          )
                        }
                        placeholder="MD RAHIM UDDIN"
                        className="field mt-2"
                      />
                    </label>

                    {cardError && (
                      <p className="mt-3 text-xs font-bold text-danger">
                        {cardError}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                      <span className="text-sm font-bold text-ink2">
                        Amount
                      </span>
                      <span className="text-lg font-black text-ink">
                        {money(booking.total_price)}
                      </span>
                    </div>
                    <Button
                      full
                      size="lg"
                      className="mt-4"
                      onClick={submitCard}
                    >
                      Pay {money(booking.total_price)}
                    </Button>
                  </>
                )}

                {/* ---------------- processing ---------------- */}
                {flowStep === "processing" && (
                  <div className="flex flex-col items-center py-10 text-center">
                    <span
                      className="h-14 w-14 animate-spin rounded-full border-[3px] border-t-transparent"
                      style={{
                        borderColor: theme ? theme.primary : "var(--jade)",
                      }}
                    />
                    <h3 className="mt-5 text-base font-black text-ink">
                      Processing payment
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-ink3">
                      Please wait. Do not close this window.
                    </p>
                  </div>
                )}

                {/* ---------------- success ---------------- */}
                {flowStep === "success" && (
                  <div className="animate-result-in flex flex-col items-center py-10 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-jade text-on-jade">
                      <Icon name="check" size={30} />
                    </div>
                    <h3 className="mt-5 text-lg font-black text-ink">
                      Payment successful
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-ink3">
                      Payment of {money(booking.total_price)} completed
                      successfully.
                    </p>
                  </div>
                )}

                {/* ---------------- failed ---------------- */}
                {flowStep === "failed" && (
                  <div className="animate-result-in flex flex-col items-center py-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft text-danger">
                      <Icon name="close" size={30} />
                    </div>
                    <h3 className="mt-5 text-lg font-black text-ink">
                      Payment failed
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-ink3">
                      {failReason || "Please try again."}
                    </p>
                    <div className="mt-6 grid w-full gap-3">
                      <Button full onClick={retryFlow}>
                        Try again
                      </Button>
                      <Button full variant="outline" onClick={closeModal}>
                        Choose another payment method
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      <style jsx global>{`
        .payment-modal-backdrop {
          background: rgb(20 30 34 / 48%);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
          animation: payment-backdrop-in 180ms ease-out both;
        }
        .payment-modal-card {
          animation: payment-modal-in 260ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
          transform-origin: center;
        }
        .payment-step-in {
          animation: payment-step-in 240ms ease-out both;
        }
        .animate-result-in {
          animation: payment-result-in 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @keyframes payment-backdrop-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes payment-modal-in {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.975);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes payment-step-in {
          from {
            opacity: 0;
            transform: translateX(12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes payment-result-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .payment-modal-backdrop,
          .payment-modal-card,
          .payment-step-in,
          .animate-result-in {
            animation: none !important;
          }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          .checkout-payment-panel,
          .checkout-payment-panel * {
            visibility: visible !important;
          }
          .checkout-payment-panel {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            border: 0 !important;
            box-shadow: none !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </Shell>
  );
}
