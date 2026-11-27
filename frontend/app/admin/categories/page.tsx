"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, ConfirmDialog, Label, Modal, useToast } from "../../components/ui";
import { Category, createCategory, deleteCategory, getCategories, updateCategory } from "../../lib/api";
import { AdminHeader, DataTable, RowActions } from "../components/AdminUI";

export default function AdminCategories() {
  const toast = useToast();
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getCategories().then(setRows).catch((e) => toast(e.message, "error")).finally(() => setLoading(false));
  }, [toast]);
  useEffect(() => load(), [load]);

  function openNew() {
    setEditing(null);
    setName("");
    setError(null);
    setOpen(true);
  }
  function openEdit(c: Category) {
    setEditing(c);
    setName(c.category_name);
    setError(null);
    setOpen(true);
  }

  async function save() {
    if (!name.trim()) return setError("Name is required.");
    setBusy(true);
    setError(null);
    try {
      if (editing) await updateCategory(editing.category_id, name.trim());
      else await createCategory(name.trim());
      toast(editing ? "Category updated" : "Category added");
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
      await deleteCategory(del.category_id);
      toast("Category deleted", "info");
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
      <AdminHeader title="Categories" sub="Trip types used to group and filter tours. Use names like Hills, Beach, Nature, Adventure or Lake so filters work." action={<Button icon="plus" onClick={openNew}>Add category</Button>} />
      <DataTable
        rows={rows}
        loading={loading}
        rowKey={(r) => r.category_id}
        searchText={(r) => r.category_name}
        searchPlaceholder="Search categories"
        empty={{ icon: "tag", title: "No categories yet", action: <Button onClick={openNew}>Add category</Button> }}
        cols={[
          { key: "name", header: "Name", sort: (r) => r.category_name, cell: (r) => <span className="font-extrabold text-ink">{r.category_name}</span> },
          { key: "act", header: "", className: "w-28", cell: (r) => <RowActions onEdit={() => openEdit(r)} onDelete={() => setDel(r)} /> },
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit category" : "Add category"} width="max-w-md">
        <div className="space-y-5">
          <label className="block"><Label>Name</Label><input className="field" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></label>
          {error && <p role="alert" className="text-sm font-bold text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={busy} onClick={save}>{editing ? "Save changes" : "Add category"}</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!del} title="Delete category?" text={`${del?.category_name ?? "This category"} will be removed from every tour that uses it.`} busy={busy} onConfirm={remove} onClose={() => setDel(null)} />
    </>
  );
}
