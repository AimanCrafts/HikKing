"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Destination,
  GuideProfile,
  Category,
  Hotel,
  getPackages,
  getDestinations,
  getGuideProfiles,
  getCategories,
  getHotels,
  createPackage,
  updatePackage,
  deletePackage,
  syncPackageCategories,
  syncPackageHotels,
  syncPackageItinerary,
} from "../../lib/api";

const emptyForm = {
  destination_id: "",
  guide_profile_id: "",
  title: "",
  description: "",
  duration_days: "",
  duration_nights: "",
  price: "",
  max_travelers: "",
  status: "draft",
  image_url: "",
};

type ItineraryRow = { day_number: number; title: string; description: string };

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Manage-panel (categories / hotels / itinerary) for a selected package
  const [managingId, setManagingId] = useState<number | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedHotelIds, setSelectedHotelIds] = useState<number[]>([]);
  const [itineraryRows, setItineraryRows] = useState<ItineraryRow[]>([]);

  async function loadData() {
    setLoading(true);
    const [pkgs, dests, gds, cats, hts] = await Promise.all([
      getPackages(),
      getDestinations(),
      getGuideProfiles(),
      getCategories(),
      getHotels(),
    ]);
    setPackages(pkgs);
    setDestinations(dests);
    setGuides(gds.filter((g) => g.verification_status === "approved"));
    setCategories(cats);
    setHotels(hts);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit() {
    const payload = {
      destination_id: Number(form.destination_id),
      guide_profile_id: Number(form.guide_profile_id),
      title: form.title,
      description: form.description || undefined,
      duration_days: Number(form.duration_days),
      duration_nights: form.duration_nights ? Number(form.duration_nights) : undefined,
      price: Number(form.price),
      max_travelers: form.max_travelers ? Number(form.max_travelers) : undefined,
      status: form.status,
      image_url: form.image_url || undefined,
    };

    if (editingId === null) {
      await createPackage(payload as any);
    } else {
      await updatePackage(editingId, payload as any);
    }
    resetForm();
    loadData();
  }

  function handleEdit(p: Package) {
    setEditingId(p.id);
    setForm({
      destination_id: String(p.destination_id),
      guide_profile_id: String(p.guide_profile_id ?? ""),
      title: p.title,
      description: p.description ?? "",
      duration_days: String(p.duration_days),
      duration_nights: String(p.duration_nights ?? ""),
      price: String(p.price),
      max_travelers: p.max_travelers ? String(p.max_travelers) : "",
      status: p.status,
      image_url: p.image_url ?? "",
    });
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this package?")) return;
    await deletePackage(id);
    loadData();
  }

  function openManage(p: Package) {
    setManagingId(p.id);
    setSelectedCategoryIds(p.categories?.map((c) => c.category_id) ?? []);
    setSelectedHotelIds(p.hotels?.map((h) => h.hotel_id) ?? []);
    setItineraryRows(
      p.itineraries && p.itineraries.length > 0
        ? p.itineraries.map((it) => ({
            day_number: it.day_number,
            title: it.title,
            description: it.description ?? "",
          }))
        : [{ day_number: 1, title: "", description: "" }],
    );
  }

  function toggleCategory(id: number) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function toggleHotel(id: number) {
    setSelectedHotelIds((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    );
  }

  function addItineraryRow() {
    setItineraryRows((prev) => [
      ...prev,
      { day_number: prev.length + 1, title: "", description: "" },
    ]);
  }

  function updateItineraryRow(index: number, field: keyof ItineraryRow, value: string) {
    setItineraryRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, [field]: field === "day_number" ? Number(value) : value }
          : row,
      ),
    );
  }

  function removeItineraryRow(index: number) {
    setItineraryRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveManage() {
    if (managingId === null) return;
    await Promise.all([
      syncPackageCategories(managingId, selectedCategoryIds),
      syncPackageHotels(managingId, selectedHotelIds),
      syncPackageItinerary(
        managingId,
        itineraryRows.filter((r) => r.title.trim() !== ""),
      ),
    ]);
    setManagingId(null);
    loadData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage tour packages.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
        >
          + Add Package
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            {editingId === null ? "New Package" : "Edit Package"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={form.destination_id}
              onChange={(e) => setForm({ ...form, destination_id: e.target.value })}
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select destination</option>
              {destinations.map((d) => (
                <option key={d.destination_id} value={d.destination_id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={form.guide_profile_id}
              onChange={(e) => setForm({ ...form, guide_profile_id: e.target.value })}
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select guide (approved only)</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.user?.name ?? `Guide #${g.id}`}
                </option>
              ))}
            </select>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              rows={3}
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              min={1}
              value={form.duration_days}
              onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
              placeholder="Duration (days)"
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              min={0}
              value={form.duration_nights}
              onChange={(e) => setForm({ ...form, duration_nights: e.target.value })}
              placeholder="Duration (nights)"
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price per person"
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="number"
              min={1}
              value={form.max_travelers}
              onChange={(e) => setForm({ ...form, max_travelers: e.target.value })}
              placeholder="Max travelers"
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="Image URL (optional)"
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
            >
              {editingId === null ? "Create" : "Save Changes"}
            </button>
            <button
              onClick={resetForm}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Manage categories / hotels / itinerary */}
      {managingId !== null && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Manage Package #{managingId}
          </h2>

          <div className="mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.category_id}
                  onClick={() => toggleCategory(c.category_id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                    selectedCategoryIds.includes(c.category_id)
                      ? "bg-teal-50 border-teal-300 text-teal-700"
                      : "bg-white border-gray-200 text-gray-500"
                  }`}
                >
                  {c.category_name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Hotels
            </h3>
            <div className="flex flex-wrap gap-2">
              {hotels.map((h) => (
                <button
                  key={h.hotel_id}
                  onClick={() => toggleHotel(h.hotel_id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                    selectedHotelIds.includes(h.hotel_id)
                      ? "bg-teal-50 border-teal-300 text-teal-700"
                      : "bg-white border-gray-200 text-gray-500"
                  }`}
                >
                  {h.hotel_name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">
                Itinerary
              </h3>
              <button
                onClick={addItineraryRow}
                className="text-xs text-teal-600 font-medium hover:underline"
              >
                + Add Day
              </button>
            </div>
            <div className="space-y-2">
              {itineraryRows.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <input
                    type="number"
                    min={1}
                    value={row.day_number}
                    onChange={(e) => updateItineraryRow(i, "day_number", e.target.value)}
                    className="col-span-1 border border-gray-200 px-2 py-1.5 rounded-lg text-xs"
                  />
                  <input
                    value={row.title}
                    onChange={(e) => updateItineraryRow(i, "title", e.target.value)}
                    placeholder="Day title"
                    className="col-span-4 border border-gray-200 px-2 py-1.5 rounded-lg text-xs"
                  />
                  <input
                    value={row.description}
                    onChange={(e) => updateItineraryRow(i, "description", e.target.value)}
                    placeholder="Description"
                    className="col-span-6 border border-gray-200 px-2 py-1.5 rounded-lg text-xs"
                  />
                  <button
                    onClick={() => removeItineraryRow(i)}
                    className="col-span-1 text-red-500 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveManage}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
            >
              Save
            </button>
            <button
              onClick={() => setManagingId(null)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Destination</th>
              <th className="px-6 py-3">Guide</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && packages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No packages yet.
                </td>
              </tr>
            )}
            {packages.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {p.title}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {p.destination?.name ?? "—"}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {p.guideProfile?.user?.name ?? "—"}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  ৳{Number(p.price).toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right space-x-3">
                  <button
                    onClick={() => openManage(p)}
                    className="text-gray-600 font-medium hover:underline"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-teal-600 font-medium hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 font-medium hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
