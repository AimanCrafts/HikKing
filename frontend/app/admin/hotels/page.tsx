"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, ConfirmDialog, Label, Modal, Stars, useToast } from "../../components/ui";
import { Hotel, createHotel, deleteHotel, getHotels, updateHotel } from "../../lib/api";
import { AdminHeader, DataTable, RowActions } from "../components/AdminUI";

const EMPTY = { hotel_name: "", address: "", star_rating: "3" };

export default function AdminHotels() {
  const toast = useToast();
  const [rows, setRows] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState<Hotel | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getHotels().then(setRows).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => load(), [load]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setOpen(true);
  }
  function openEdit(h: Hotel) {
    setEditing(h);
    setForm({ hotel_name: h.hotel_name, address: h.address ?? "", star_rating: String(h.star_rating ?? 3) });
    setError(null);
    setOpen(true);
  }

  async function save() {
    if (!form.hotel_name.trim()) return setError("Name is required.");
    setBusy(true);
    setError(null);
    try {
      const body = { hotel_name: form.hotel_name.trim(), address: form.address.trim() || null, star_rating: Number(form.star_rating) };
      if (editing) await updateHotel(editing.hotel_id, body);
      else await createHotel(body);
      toast(editing ? "Stay updated" : "Stay added");
      setOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    try {
      await deleteHotel(del.hotel_id);
      toast("Stay deleted", "info");
      setDel(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not delete.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AdminHeader title="Stays" sub="Hotels and lodges used in your tours." action={<Button icon="plus" onClick={openNew}>Add stay</Button>} />
      <DataTable
        rows={rows}
        loading={loading}
        rowKey={(r) => r.hotel_id}
        searchText={(r) => `${r.hotel_name} ${r.address ?? ""}`}
        searchPlaceholder="Search stays"
        empty={{ icon: "hotel", title: "No stays yet", text: "Add the places travelers will sleep in.", action: <Button onClick={openNew}>Add stay</Button> }}
        cols={[
          { key: "name", header: "Name", sort: (r) => r.hotel_name, cell: (r) => <span className="font-extrabold text-ink">{r.hotel_name}</span> },
          { key: "addr", header: "Address", cell: (r) => r.address ?? "None" },
          { key: "stars", header: "Rating", sort: (r) => r.star_rating ?? 0, cell: (r) => (r.star_rating ? <Stars value={r.star_rating} size={14} /> : "None") },
          { key: "act", header: "", className: "w-28", cell: (r) => <RowActions onEdit={() => openEdit(r)} onDelete={() => setDel(r)} /> },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit stay" : "Add stay"}>
        <div className="space-y-5">
          <label className="block"><Label>Name</Label><input className="field" value={form.hotel_name} onChange={(e) => setForm({ ...form, hotel_name: e.target.value })} /></label>
          <label className="block"><Label hint="Optional">Address</Label><input className="field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          <label className="block">
            <Label>Star rating</Label>
            <select className="field cursor-pointer" value={form.star_rating} onChange={(e) => setForm({ ...form, star_rating: e.target.value })}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
            </select>
          </label>
          {error && <p role="alert" className="text-sm font-bold text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={busy} onClick={save}>{editing ? "Save changes" : "Add stay"}</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!del} title="Delete stay?" text={`${del?.hotel_name ?? "This stay"} will be removed from the list and from any tours that use it.`} busy={busy} onConfirm={remove} onClose={() => setDel(null)} />
    </>
  );
}
