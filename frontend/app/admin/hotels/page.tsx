"use client";

import { useEffect, useState } from "react";
import {
  Hotel,
  getHotels,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../../lib/api";

const emptyForm = {
  hotel_name: "",
  address: "",
  star_rating: "",
};

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const data = await getHotels();
    setHotels(data);
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
    if (!form.hotel_name.trim()) return;

    const payload = {
      hotel_name: form.hotel_name,
      address: form.address || null,
      star_rating: form.star_rating ? Number(form.star_rating) : null,
    };

    if (editingId === null) {
      await createHotel(payload);
    } else {
      await updateHotel(editingId, payload);
    }

    resetForm();
    loadData();
  }

  function handleEdit(h: Hotel) {
    setEditingId(h.hotel_id);
    setForm({
      hotel_name: h.hotel_name,
      address: h.address ?? "",
      star_rating: h.star_rating ? String(h.star_rating) : "",
    });
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this hotel?")) return;
    await deleteHotel(id);
    loadData();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage hotels that can be included in packages.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
        >
          + Add Hotel
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            {editingId === null ? "Add New Hotel" : "Edit Hotel"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.hotel_name}
              onChange={(e) =>
                setForm({ ...form, hotel_name: e.target.value })
              }
              placeholder="Hotel name"
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Address"
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              value={form.star_rating}
              onChange={(e) =>
                setForm({ ...form, star_rating: e.target.value })
              }
              placeholder="Star rating (1-5)"
              type="number"
              min={1}
              max={5}
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
            >
              {editingId === null ? "Add" : "Save Changes"}
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

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3">Hotel</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && hotels.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No hotels yet.
                </td>
              </tr>
            )}
            {hotels.map((h) => (
              <tr key={h.hotel_id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {h.hotel_name}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {h.address || "—"}
                </td>
                <td className="px-6 py-3 text-yellow-600">
                  {h.star_rating ? "★".repeat(h.star_rating) : "—"}
                </td>
                <td className="px-6 py-3 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(h)}
                    className="text-teal-600 font-medium hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(h.hotel_id)}
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
