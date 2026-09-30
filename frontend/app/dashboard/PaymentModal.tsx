"use client";

import { useState } from "react";
import { Booking, createPayment } from "../lib/api";

type Method = "bkash" | "nagad";
type Step = "choose" | "number" | "otp" | "pin" | "processing" | "success" | "failed";

const BRANDS = {
  bkash: { name: "bKash", bg: "linear-gradient(135deg,#E2136E,#B10F58)", color: "#E2136E", pin: 5 },
  nagad: { name: "Nagad", bg: "linear-gradient(135deg,#F7941D,#E8262B)", color: "#E8262B", pin: 4 },
};

function printReceipt(p: any, b: Booking, brand: string, number: string) {
  const w = window.open("", "_blank", "width=440,height=640");
  if (!w) return;
  const rows = [
    ["Transaction ID", p.transaction_id],
    ["Booking", "#" + b.booking_id],
    ["Package", b.package?.title || ""],
    ["Method", brand],
    ["Account", "*******" + number.slice(-4)],
    ["Amount", "BDT " + Number(p.amount).toLocaleString()],
    ["Date", new Date().toLocaleString()],
    ["Status", "PAID"],
  ].map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");
  w.document.write(
    `<html><head><title>Receipt</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:9px 0;border-bottom:1px solid #eee;font-size:14px}td:last-child{text-align:right;font-weight:bold}</style></head><body><h2 style="margin:0">HikKing Tours</h2><div style="color:#666;font-size:13px">Payment Receipt</div><table>${rows}</table><p style="margin-top:24px;font-size:12px;color:#888">Demo receipt. No real money was charged.</p></body></html>`,
  );
  w.document.close();
  w.focus();
  w.print();
}

export default function PaymentModal({ booking, onClose, onDone }: { booking: Booking; onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState<Step>("choose");
  const [method, setMethod] = useState<Method>("bkash");
  const [number, setNumber] = useState("");
  const [agree, setAgree] = useState(false);
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const brand = BRANDS[method];
  const numberOk = /^01[3-9]\d{8}$/.test(number);
  const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

  async function pay() {
    setStep("processing");
    try {
      const p = await createPayment({ booking_id: booking.booking_id, payment_method: method, payer_account: number });
      setResult(p);
      setStep("success");
      onDone();
    } catch (e: any) {
      setError(e.message || "Payment failed");
      setStep("failed");
    }
  }

  const input = "w-full border border-gray-300 rounded-md px-3 py-3 text-center text-base tracking-wide focus:outline-none";
  const closeBtn = "flex-1 py-3 text-sm font-bold text-white bg-gray-400 hover:bg-gray-500 rounded-md cursor-pointer";
  const okBtn = "flex-1 py-3 text-sm font-bold text-white rounded-md disabled:opacity-40 cursor-pointer";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-2xl">
        {step === "choose" ? (
          <div className="p-6">
            <h3 className="text-lg font-extrabold text-gray-900">Choose payment method</h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">{booking.package?.title} &middot; &#2547; {Number(booking.total_price).toLocaleString()}</p>
            <div className="space-y-3">
              {(["bkash", "nagad"] as Method[]).map((m) => (
                <button key={m} onClick={() => { setMethod(m); setStep("number"); }} className="w-full flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:border-gray-400 cursor-pointer">
                  <span className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: BRANDS[m].bg }}>{BRANDS[m].name}</span>
                  <span className="text-sm font-bold text-gray-800">Pay with {BRANDS[m].name}</span>
                </button>
              ))}
            </div>
            <button onClick={onClose} className="w-full mt-5 text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer">Cancel</button>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 text-white" style={{ background: brand.bg }}>
              <span className="text-2xl font-black italic tracking-tight">{brand.name}</span>
              <span className="text-[11px] opacity-90 ml-2">Payment</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-900">HikKing Tours</p>
                <p className="text-[11px] text-gray-500">Invoice: HK-{booking.booking_id}</p>
              </div>
              <p className="text-lg font-black" style={{ color: brand.color }}>&#2547; {Number(booking.total_price).toLocaleString()}</p>
            </div>

            <div className="p-5">
              {step === "number" && (
                <>
                  <p className="text-center text-sm font-semibold text-gray-700 mb-3">Your {brand.name} Account number</p>
                  <input value={number} onChange={(e) => setNumber(digits(e.target.value, 11))} placeholder="e.g 01XXXXXXXXX" inputMode="numeric" className={input} style={{ borderColor: brand.color }} />
                  <label className="flex items-start gap-2 mt-4 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
                    <span>I agree to the <span style={{ color: brand.color }}>terms and conditions</span></span>
                  </label>
                  <div className="flex gap-3 mt-5">
                    <button onClick={onClose} className={closeBtn}>CLOSE</button>
                    <button disabled={!numberOk || !agree} onClick={() => setStep("otp")} className={okBtn} style={{ background: brand.color }}>PROCEED</button>
                  </div>
                </>
              )}

              {step === "otp" && (
                <>
                  <p className="text-center text-sm font-semibold text-gray-700">Enter verification code</p>
                  <p className="text-center text-[11px] text-gray-500 mt-1 mb-3">We have sent a code to {number.slice(0, 3)}****{number.slice(-4)}</p>
                  <input value={otp} onChange={(e) => setOtp(digits(e.target.value, 6))} placeholder="Enter code" inputMode="numeric" className={input} style={{ borderColor: brand.color }} />
                  <p className="text-center text-[11px] text-gray-400 mt-2">Resend Code in 00:30</p>
                  <div className="flex gap-3 mt-5">
                    <button onClick={onClose} className={closeBtn}>CLOSE</button>
                    <button disabled={otp.length < 6} onClick={() => setStep("pin")} className={okBtn} style={{ background: brand.color }}>PROCEED</button>
                  </div>
                </>
              )}

              {step === "pin" && (
                <>
                  <p className="text-center text-sm font-semibold text-gray-700 mb-3">Enter your {brand.name} PIN</p>
                  <input type="password" value={pin} onChange={(e) => setPin(digits(e.target.value, brand.pin))} placeholder={"\u2022".repeat(brand.pin)} inputMode="numeric" className={input} style={{ borderColor: brand.color }} />
                  <div className="flex gap-3 mt-5">
                    <button onClick={onClose} className={closeBtn}>CLOSE</button>
                    <button disabled={pin.length < brand.pin} onClick={pay} className={okBtn} style={{ background: brand.color }}>CONFIRM</button>
                  </div>
                </>
              )}

              {step === "processing" && (
                <div className="py-8 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: brand.color }} />
                  <p className="text-sm text-gray-600 mt-4">Processing your payment...</p>
                </div>
              )}

              {step === "success" && result && (
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl">&#10003;</div>
                  <h4 className="text-lg font-extrabold text-gray-900 mt-3">Payment Successful</h4>
                  <div className="text-left text-xs bg-gray-50 rounded-lg p-4 mt-4 space-y-2">
                    <div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><b>{result.transaction_id}</b></div>
                    <div className="flex justify-between"><span className="text-gray-500">Amount</span><b>&#2547; {Number(result.amount).toLocaleString()}</b></div>
                    <div className="flex justify-between"><span className="text-gray-500">Paid with</span><b>{brand.name} *{number.slice(-4)}</b></div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => printReceipt(result, booking, brand.name, number)} className="flex-1 py-3 text-sm font-bold border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer">Print receipt</button>
                    <button onClick={onClose} className={okBtn} style={{ background: brand.color }}>DONE</button>
                  </div>
                </div>
              )}

              {step === "failed" && (
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-3xl">&#10005;</div>
                  <h4 className="text-lg font-extrabold text-gray-900 mt-3">Payment Failed</h4>
                  <p className="text-sm text-gray-600 mt-2">{error}</p>
                  <div className="flex gap-3 mt-5">
                    <button onClick={onClose} className={closeBtn}>CLOSE</button>
                    <button onClick={() => { setPin(""); setOtp(""); setStep("number"); }} className={okBtn} style={{ background: brand.color }}>TRY AGAIN</button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-center text-[10px] text-gray-400 pb-3 px-4">Demo payment: no real money is charged. Any code works; numbers ending 0000 fail.</p>
          </>
        )}
      </div>
    </div>
  );
}