"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, StatusBadge, useToast } from "../../components/ui";
import { Payment, getPayments, updatePaymentStatus } from "../../lib/api";
import { money, fmtDate } from "../../lib/format";
import { AdminHeader, DataTable } from "../components/AdminUI";

const METHOD_LABEL: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  bank_transfer: "Bank transfer",
  cash: "Cash",
};

export default function AdminPaymentsPage() {
  const toast = useToast();
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(() => {
    getPayments().then(setRows).catch((e) => toast(e instanceof Error ? e.message : "Could not load payments", "error")).finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  async function update(p: Payment, status: Payment["payment_status"]) {
    setBusy(p.payment_id);
    try {
      await updatePaymentStatus(p.payment_id, status);
      toast(status === "paid" ? "Payment marked as received" : status === "refunded" ? "Payment marked as refunded" : "Payment status updated");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update payment", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <AdminHeader title="Payments" sub="Review local payment records and confirm cash or bank-transfer payments." />
      <DataTable
        rows={rows}
        loading={loading}
        rowKey={(p) => p.payment_id}
        searchText={(p) => `${p.transaction_id} ${p.booking_id} ${p.booking?.traveler?.name ?? ""} ${p.booking?.package?.title ?? ""} ${p.payment_method}`}
        searchPlaceholder="Search transaction, traveler or booking"
        empty={{ icon: "tag", title: "No payment records", text: "Payment records will appear here when travelers check out." }}
        cols={[
          { key: "id", header: "Payment", sort: (p) => p.payment_id, cell: (p) => <div><p className="font-extrabold text-ink">#{p.payment_id}</p><p className="text-xs text-ink3">{p.transaction_id}</p></div> },
          { key: "booking", header: "Reservation", sort: (p) => p.booking_id, cell: (p) => <div><p className="font-extrabold text-ink">#{p.booking_id}</p><p className="line-clamp-1 text-xs text-ink3">{p.booking?.package?.title ?? `Tour ${p.booking?.package_id ?? ""}`}</p></div> },
          { key: "traveler", header: "Traveler", sort: (p) => p.booking?.traveler?.name ?? "", cell: (p) => <div><p className="font-bold text-ink">{p.booking?.traveler?.name ?? "Traveler"}</p><p className="text-xs text-ink3">{p.booking?.traveler?.email ?? ""}</p></div> },
          { key: "method", header: "Method", sort: (p) => p.payment_method, cell: (p) => METHOD_LABEL[p.payment_method] ?? p.payment_method },
          { key: "amount", header: "Amount", sort: (p) => Number(p.amount), cell: (p) => <span className="font-extrabold text-ink">{money(p.amount)}</span> },
          { key: "date", header: "Date", sort: (p) => p.created_at ?? "", cell: (p) => p.created_at ? fmtDate(p.created_at) : "—" },
          { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.payment_status} /> },
          { key: "actions", header: "", className: "w-56", cell: (p) => (
            <div className="flex flex-wrap justify-end gap-1.5">
              {p.payment_status === "pending" && <Button size="sm" loading={busy === p.payment_id} onClick={() => update(p, "paid")}>Confirm received</Button>}
              {p.payment_status === "pending" && <Button size="sm" variant="danger" disabled={busy === p.payment_id} onClick={() => update(p, "failed")}>Mark failed</Button>}
              {p.payment_status === "paid" && <Button size="sm" variant="outline" loading={busy === p.payment_id} onClick={() => update(p, "refunded")}>Mark refunded</Button>}
              {p.payment_status === "failed" && <Button size="sm" variant="outline" loading={busy === p.payment_id} onClick={() => update(p, "pending")}>Reopen</Button>}
            </div>
          ) },
        ]}
      />
      <p className="mt-4 text-xs leading-relaxed text-ink3">These controls update project records only. No money is collected, transferred or refunded by this website.</p>
    </>
  );
}
