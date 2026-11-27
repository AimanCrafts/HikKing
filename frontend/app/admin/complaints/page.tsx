"use client";

import { useCallback, useEffect, useState } from "react";
import { Chip, StatusBadge, useToast } from "../../components/ui";
import { Complaint, getComplaints, updateComplaintStatus } from "../../lib/api";
import { fmtDate } from "../../lib/format";
import { AdminHeader, DataTable } from "../components/AdminUI";

const STATUSES = [
  { v: "open", label: "Open" },
  { v: "in_progress", label: "In progress" },
  { v: "resolved", label: "Resolved" },
  { v: "rejected", label: "Rejected" },
];

export default function AdminComplaints() {
  const toast = useToast();
  const [rows, setRows] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = useCallback(() => {
    getComplaints().then(setRows).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => load(), [load]);

  async function change(c: Complaint, status: string) {
    setRows((cur) => cur.map((x) => (x.complaint_id === c.complaint_id ? { ...x, status: status as Complaint["status"] } : x)));
    try {
      await updateComplaintStatus(c.complaint_id, status);
      toast("Status updated");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update", "error");
      load();
    }
  }

  const list = filter ? rows.filter((r) => r.status === filter) : rows;

  return (
    <>
      <AdminHeader title="Support requests" sub="Problems travelers have reported about their reservations." />
      <div className="scroll-x mb-5 flex gap-2">
        <Chip active={!filter} onClick={() => setFilter("")}>All {rows.length}</Chip>
        {STATUSES.map((s) => (
          <Chip key={s.v} active={filter === s.v} onClick={() => setFilter(s.v)}>
            {s.label} <span className="opacity-60">{rows.filter((r) => r.status === s.v).length}</span>
          </Chip>
        ))}
      </div>
      <DataTable
        rows={[...list].sort((a, b) => b.complaint_id - a.complaint_id)}
        loading={loading}
        rowKey={(r) => r.complaint_id}
        searchText={(r) => `${r.subject} ${r.user?.name ?? ""} ${r.booking?.package?.title ?? ""}`}
        searchPlaceholder="Search requests"
        empty={{ icon: "message", title: "No support requests", text: "When a traveler reports a problem it shows up here." }}
        cols={[
          { key: "id", header: "#", className: "w-16", sort: (r) => r.complaint_id, cell: (r) => <span className="text-ink3">{r.complaint_id}</span> },
          { key: "user", header: "Traveler", cell: (r) => <span className="font-extrabold text-ink">{r.user?.name ?? `User ${r.user_id}`}</span> },
          { key: "subject", header: "Issue", cell: (r) => <span className="line-clamp-2 max-w-md text-ink">{r.subject}</span> },
          { key: "tour", header: "Reservation", cell: (r) => <span className="line-clamp-1 max-w-[200px]">{r.booking?.package?.title ?? `#${r.booking_id}`}</span> },
          { key: "date", header: "Filed", cell: (r) => (r.created_at ? fmtDate(r.created_at) : "") },
          { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act",
            header: "Change",
            className: "w-40",
            cell: (r) => (
              <select aria-label="Change status" value={r.status} onChange={(e) => change(r, e.target.value)} className="field !h-9 !rounded-full !py-0 !text-[13px] cursor-pointer">
                {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
            ),
          },
        ]}
      />
    </>
  );
}
