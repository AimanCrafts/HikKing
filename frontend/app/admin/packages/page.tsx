"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, ConfirmDialog, Icon, Label, Modal, Photo, Skeleton, StatusBadge, useToast } from "../../components/ui";
import {
  Category,
  Destination,
  Hotel,
  Package,
  createPackage,
  deletePackage,
  getCategories,
  getDestinations,
  getHotels,
  getPackage,
  getPackages,
  syncPackageCategories,
  syncPackageHotels,
  syncPackageItinerary,
  updatePackage,
} from "../../lib/api";
import { placeFor } from "../../lib/catalog";
import { cx, money } from "../../lib/format";
import { AdminHeader, DataTable, FormGrid, RowActions } from "../components/AdminUI";

const EMPTY = { destination_id: "", title: "", description: "", duration_days: "3", duration_nights: "2", price: "", max_travelers: "", status: "published", image_url: "" };
type Day = { title: string; description: string };

export default function AdminPackages() {
  const toast = useToast();
  const [rows, setRows] = useState<Package[]>([]);
  const [dests, setDests] = useState<Destination[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Package | null>(null);
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState<Package | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // "Plan" modal: categories, stays, itinerary
  const [plan, setPlan] = useState<Package | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [selCats, setSelCats] = useState<number[]>([]);
  const [selHotels, setSelHotels] = useState<number[]>([]);
  const [days, setDays] = useState<Day[]>([]);

  const load = useCallback(async () => {
    try {
      const [p, d, c, h] = await Promise.all([getPackages(), getDestinations(), getCategories(), getHotels()]);
      setRows(p);
      setDests(d);
      setCats(c);
      setHotels(h);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not load tours", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setOpen(true);
  }
  function openEdit(p: Package) {
    setEditing(p);
    setForm({
      destination_id: String(p.destination_id),
      title: p.title,
      description: p.description ?? "",
      duration_days: String(p.duration_days),
      duration_nights: String(p.duration_nights ?? 0),
      price: String(p.price),
      max_travelers: p.max_travelers ? String(p.max_travelers) : "",
      status: p.status,
      image_url: p.image_url ?? "",
    });
    setError(null);
    setOpen(true);
  }

  async function save() {
    if (!form.destination_id) return setError("Choose a destination.");
    if (!form.title.trim()) return setError("Give the tour a title.");
    if (!form.price || Number(form.price) < 0) return setError("Enter the price per person.");
    setBusy(true);
    setError(null);
    try {
      const body = {
        destination_id: Number(form.destination_id),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        duration_days: Number(form.duration_days) || 1,
        duration_nights: Number(form.duration_nights) || 0,
        price: Number(form.price),
        max_travelers: form.max_travelers ? Number(form.max_travelers) : undefined,
        status: form.status,
        image_url: form.image_url.trim() || undefined,
      };
      if (editing) {
        await updatePackage(editing.id, body);
        toast("Tour updated");
        setOpen(false);
        load();
      } else {
        const created = await createPackage(body);
        toast("Tour created. Now add its plan.");
        setOpen(false);
        await load();
        openPlan(created);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function openPlan(p: Package) {
    setPlan(p);
    setPlanLoading(true);
    try {
      const full = await getPackage(p.id);
      setSelCats((full.categories ?? []).map((c) => c.category_id));
      setSelHotels((full.hotels ?? []).map((h) => h.hotel_id));
      setDays((full.itineraries ?? []).sort((a, b) => a.day_number - b.day_number).map((i) => ({ title: i.title, description: i.description ?? "" })));
    } catch {
      setSelCats([]);
      setSelHotels([]);
      setDays([]);
    } finally {
      setPlanLoading(false);
    }
  }

  async function savePlan() {
    if (!plan) return;
    setBusy(true);
    try {
      await syncPackageCategories(plan.id, selCats);
      await syncPackageHotels(plan.id, selHotels);
      await syncPackageItinerary(
        plan.id,
        days.filter((d) => d.title.trim()).map((d, i) => ({ day_number: i + 1, title: d.title.trim(), description: d.description.trim() || undefined })),
      );
      toast("Plan saved");
      setPlan(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save the plan", "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    try {
      await deletePackage(del.id);
      toast("Tour deleted", "info");
      setDel(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not delete. It may have reservations.", "error");
    } finally {
      setBusy(false);
    }
  }

  const toggle = (list: number[], id: number, set: (v: number[]) => void) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const imgFor = (p: Package) => p.image_url || placeFor(p.destination?.name)?.image || "/hero/rangamati.jpg";
  const previewUrl = form.image_url.trim() || placeFor(dests.find((d) => String(d.destination_id) === form.destination_id)?.name)?.image;

  return (
    <>
      <AdminHeader title="Tours" sub="Create tours, set their price and plan, and publish them to travelers." action={<Button icon="plus" onClick={openNew}>New tour</Button>} />
      <DataTable
        rows={rows}
        loading={loading}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.title} ${r.destination?.name ?? ""}`}
        searchPlaceholder="Search tours"
        empty={{ icon: "box", title: "No tours yet", text: "Create your first tour, then add its itinerary and stays.", action: <Button onClick={openNew}>New tour</Button> }}
        cols={[
          {
            key: "title",
            header: "Tour",
            sort: (r) => r.title,
            cell: (r) => (
              <div className="flex items-center gap-3">
                <span className="h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-sunk"><Photo src={imgFor(r)} alt="" /></span>
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-ink">{r.title}</p>
                  <p className="truncate text-xs font-semibold text-ink3">{r.destination?.name ?? "No destination"}</p>
                </div>
              </div>
            ),
          },
          { key: "dur", header: "Length", sort: (r) => r.duration_days, cell: (r) => `${r.duration_days}D / ${r.duration_nights}N` },
          { key: "price", header: "Price", sort: (r) => Number(r.price), cell: (r) => <span className="font-extrabold text-ink">{money(r.price)}</span> },
          { key: "cats", header: "Categories", cell: (r) => <span className="flex flex-wrap gap-1">{(r.categories ?? []).slice(0, 2).map((c) => <Badge key={c.category_id}>{c.category_name}</Badge>)}{!(r.categories ?? []).length && <span className="text-ink3">None</span>}</span> },
          { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act",
            header: "",
            className: "w-44",
            cell: (r) => <RowActions onEdit={() => openEdit(r)} onDelete={() => setDel(r)} extra={<Button size="sm" variant="soft" onClick={() => openPlan(r)}>Plan</Button>} />,
          },
        ]}
      />

      {/* Create / edit */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit tour" : "New tour"} width="max-w-2xl">
        <div className="space-y-5">
          <FormGrid>
            <label className="block sm:col-span-2"><Label>Title</Label><input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sajek Cloud Country Weekend" /></label>
            <label className="block">
              <Label>Destination</Label>
              <select className="field cursor-pointer" value={form.destination_id} onChange={(e) => setForm({ ...form, destination_id: e.target.value })}>
                <option value="">Choose a destination</option>
                {dests.map((d) => <option key={d.destination_id} value={d.destination_id}>{d.name}</option>)}
              </select>
            </label>
            <label className="block"><Label>Price per person (৳)</Label><input type="number" min={0} className="field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
            <label className="block"><Label>Days</Label><input type="number" min={1} className="field" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} /></label>
            <label className="block"><Label>Nights</Label><input type="number" min={0} className="field" value={form.duration_nights} onChange={(e) => setForm({ ...form, duration_nights: e.target.value })} /></label>
            <label className="block"><Label hint="Optional">Max travelers</Label><input type="number" min={1} className="field" value={form.max_travelers} onChange={(e) => setForm({ ...form, max_travelers: e.target.value })} /></label>
            <label className="block">
              <Label>Status</Label>
              <select className="field cursor-pointer" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </FormGrid>
          <p className="-mt-2 text-xs font-semibold text-ink3">Only published tours are shown to travelers and in this list.</p>
          <label className="block"><Label hint="Optional">Description</Label><textarea className="field resize-none" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div>
            <Label hint="Optional">Cover image URL</Label>
            <input className="field" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="/images/packages/sajek.jpg or https://..." />
            {previewUrl && <div className="mt-3 h-32 overflow-hidden rounded-2xl bg-sunk"><Photo src={previewUrl} alt="Cover preview" /></div>}
          </div>
          {error && <p role="alert" className="flex items-start gap-2 text-sm font-bold text-danger"><Icon name="alert" size={16} className="mt-0.5" /> {error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={busy} onClick={save}>{editing ? "Save changes" : "Create tour"}</Button>
          </div>
        </div>
      </Modal>

      {/* Plan: categories, stays, itinerary */}
      <Modal open={!!plan} onClose={() => setPlan(null)} title={plan ? `Plan: ${plan.title}` : ""} width="max-w-3xl">
        {planLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <div className="space-y-8">
            <section>
              <h3 className="mb-3 text-[15px] font-black text-ink">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {cats.length === 0 && <p className="text-sm text-ink3">No categories yet. Add some under Categories.</p>}
                {cats.map((c) => (
                  <button key={c.category_id} type="button" aria-pressed={selCats.includes(c.category_id)} onClick={() => toggle(selCats, c.category_id, setSelCats)} className={cx("h-10 rounded-full px-4 text-sm font-extrabold transition", selCats.includes(c.category_id) ? "bg-jade text-on-jade" : "border border-line text-ink2 hover:border-ink")}>
                    {c.category_name}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-[15px] font-black text-ink">Stays</h3>
              <div className="flex flex-wrap gap-2">
                {hotels.length === 0 && <p className="text-sm text-ink3">No stays yet. Add some under Stays.</p>}
                {hotels.map((h) => (
                  <button key={h.hotel_id} type="button" aria-pressed={selHotels.includes(h.hotel_id)} onClick={() => toggle(selHotels, h.hotel_id, setSelHotels)} className={cx("h-10 rounded-full px-4 text-sm font-extrabold transition", selHotels.includes(h.hotel_id) ? "bg-jade text-on-jade" : "border border-line text-ink2 hover:border-ink")}>
                    {h.hotel_name}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[15px] font-black text-ink">Itinerary</h3>
                <Button size="sm" variant="soft" icon="plus" onClick={() => setDays([...days, { title: "", description: "" }])}>Add day</Button>
              </div>
              {days.length === 0 && <p className="rounded-2xl bg-sunk p-4 text-sm font-semibold text-ink2">No days yet. Add the first day of the trip.</p>}
              <ol className="space-y-3">
                {days.map((d, i) => (
                  <li key={i} className="flex gap-3 rounded-2xl border border-line p-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-jade text-xs font-black text-on-jade">{i + 1}</span>
                    <div className="flex-1 space-y-2">
                      <input className="field !py-2.5" placeholder={`Day ${i + 1} title`} value={d.title} onChange={(e) => setDays(days.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} />
                      <textarea className="field resize-none !py-2.5" rows={2} placeholder="What happens on this day" value={d.description} onChange={(e) => setDays(days.map((x, k) => (k === i ? { ...x, description: e.target.value } : x)))} />
                    </div>
                    <button type="button" aria-label={`Remove day ${i + 1}`} onClick={() => setDays(days.filter((_, k) => k !== i))} className="h-9 w-9 shrink-0 rounded-full text-ink3 transition hover:bg-danger-soft hover:text-danger"><Icon name="trash" size={16} className="mx-auto" /></button>
                  </li>
                ))}
              </ol>
            </section>

            <div className="flex justify-end gap-2 border-t border-line pt-5">
              <Button variant="ghost" onClick={() => setPlan(null)}>Close</Button>
              <Button loading={busy} onClick={savePlan}>Save plan</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!del} title="Delete tour?" text={`${del?.title ?? "This tour"} will be removed. Tours with reservations may not be deletable. Archive them instead.`} busy={busy} onConfirm={remove} onClose={() => setDel(null)} />
    </>
  );
}
