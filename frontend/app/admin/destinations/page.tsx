"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, ConfirmDialog, Label, Modal, useToast } from "../../components/ui";
import { Destination, createDestination, deleteDestination, getDestinations, updateDestination } from "../../lib/api";
import { AdminHeader, DataTable, RowActions } from "../components/AdminUI";

const EMPTY = { name: "", location: "", description: "" };

export default function AdminDestinations() {
  const toast = useToast();
  const [rows, setRows] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState<Destination | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getDestinations().then(setRows).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => load(), [load]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setOpen(true);
  }
  function openEdit(d: Destination) {
    setEditing(d);
    setForm({ name: d.name, location: d.location ?? "", description: d.description ?? "" });
    setError(null);
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return setError("Name is required.");
    setBusy(true);
    setError(null);
    try {
      const body = { name: form.name.trim(), location: form.location.trim() || null, description: form.description.trim() || null };
      if (editing) await updateDestination(editing.destination_id, body);
      else await createDestination(body);
      toast(editing ? "Destination updated" : "Destination added");
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
      await deleteDestination(del.destination_id);
      toast("Destination deleted", "info");
      setDel(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not delete. It may still be used by a tour.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AdminHeader title="Destinations" sub="The places your tours go to." action={<Button icon="plus" onClick={openNew}>Add destination</Button>} />
      <DataTable
        rows={rows}
        loading={loading}
        rowKey={(r) => r.destination_id}
        searchText={(r) => `${r.name} ${r.location ?? ""}`}
        searchPlaceholder="Search destinations"
        empty={{ icon: "pin", title: "No destinations yet", text: "Add the first place you run tours to.", action: <Button onClick={openNew}>Add destination</Button> }}
        cols={[
          { key: "name", header: "Name", sort: (r) => r.name, cell: (r) => <span className="font-extrabold text-ink">{r.name}</span> },
          { key: "location", header: "Location", sort: (r) => r.location ?? "", cell: (r) => r.location ?? "None" },
          { key: "desc", header: "Description", cell: (r) => <span className="line-clamp-1 max-w-sm">{r.description ?? "None"}</span> },
          { key: "act", header: "", className: "w-28", cell: (r) => <RowActions onEdit={() => openEdit(r)} onDelete={() => setDel(r)} /> },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit destination" : "Add destination"}>
        <div className="space-y-5">
          <label className="block"><Label>Name</Label><input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="block"><Label hint="Optional">Location</Label><input className="field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="District or region" /></label>
          <label className="block"><Label hint="Optional">Description</Label><textarea className="field resize-none" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          {error && <p role="alert" className="text-sm font-bold text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={busy} onClick={save}>{editing ? "Save changes" : "Add destination"}</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!del} title="Delete destination?" text={`${del?.name ?? "This destination"} will be removed. Tours that use it may need a new destination first.`} busy={busy} onConfirm={remove} onClose={() => setDel(null)} />
    </>
  );
}
