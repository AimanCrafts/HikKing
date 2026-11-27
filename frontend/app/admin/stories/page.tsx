"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Chip, ConfirmDialog, Photo, StatusBadge, useToast } from "../../components/ui";
import { Story, loadStories, removeStory, setStoryStatus } from "../../lib/stories";
import { fmtDate } from "../../lib/format";
import { AdminHeader, DataTable, RowActions } from "../components/AdminUI";

export default function AdminStories() {
  const toast = useToast();
  const [rows, setRows] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [del, setDel] = useState<Story | null>(null);

  const load = useCallback(() => {
    loadStories({ all: true }).then(setRows).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => load(), [load]);

  async function setStatus(s: Story, status: Story["status"]) {
    try {
      await setStoryStatus(s, status);
      toast(status === "approved" ? "Story approved" : status === "rejected" ? "Story hidden" : "Story updated");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update", "error");
    }
  }

  async function remove() {
    if (!del) return;
    try {
      await removeStory(del);
      toast("Story deleted", "info");
      setDel(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not delete", "error");
    }
  }

  const list = filter ? rows.filter((r) => r.status === filter) : rows;

  return (
    <>
      <AdminHeader title="Traveler stories" sub="Review photos and stories before they show on the public wall." />
      <div className="scroll-x mb-5 flex gap-2">
        <Chip active={!filter} onClick={() => setFilter("")}>All {rows.length}</Chip>
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {s === "rejected" ? "Hidden" : s[0].toUpperCase() + s.slice(1)} <span className="opacity-60">{rows.filter((r) => r.status === s).length}</span>
          </Chip>
        ))}
      </div>
      <DataTable
        rows={list}
        loading={loading}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.title} ${r.author} ${r.place}`}
        searchPlaceholder="Search stories"
        empty={{ icon: "camera", title: "No stories yet", text: "Stories travelers share will appear here for review." }}
        cols={[
          {
            key: "story",
            header: "Story",
            cell: (r) => (
              <div className="flex items-center gap-3">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sunk">{r.photos[0] ? <Photo src={r.photos[0].src} alt="" /> : null}</span>
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-ink">{r.title}</p>
                  <p className="truncate text-xs font-semibold text-ink3">{r.photos.length} photo{r.photos.length === 1 ? "" : "s"}</p>
                </div>
              </div>
            ),
          },
          { key: "author", header: "Traveler", sort: (r) => r.author, cell: (r) => r.author },
          { key: "place", header: "Place", cell: (r) => <Badge>{r.place}</Badge> },
          { key: "date", header: "Shared", sort: (r) => r.createdAt, cell: (r) => fmtDate(r.createdAt) },
          { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act",
            header: "",
            className: "w-60",
            cell: (r) => (
              <div className="flex items-center justify-end gap-1.5">
                {r.status !== "approved" && <Button size="sm" onClick={() => setStatus(r, "approved")}>Approve</Button>}
                {r.status !== "rejected" && <Button size="sm" variant="soft" onClick={() => setStatus(r, "rejected")}>Hide</Button>}
                <RowActions onDelete={() => setDel(r)} />
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog open={!!del} title="Delete story?" text="The story and its photos will be removed for good." onConfirm={remove} onClose={() => setDel(null)} />
    </>
  );
}
