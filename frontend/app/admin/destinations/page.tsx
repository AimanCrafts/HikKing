"use client";

import { useEffect, useState } from "react";
import {
  Destination,
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from "../../lib/api";

const emptyForm = {
  name: "",
  description: "",
  location: "",
};

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const data = await getDestinations();
    setDestinations(data);
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
    if (!form.name.trim()) return;

    const payload = {
      name: form.name,
      description: form.description || null,
      location: form.location || null,
    };

    if (editingId === null) {
      await createDestination(payload);
    } else {
      await updateDestination(editingId, payload);
    }

    resetForm();
    loadData();
  }

  function handleEdit(d: Destination) {
    setEditingId(d.destination_id);
    setForm({
      name: d.name,
      description: d.description ?? "",
      location: d.location ?? "",
    });
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this destination?")) return;
    await deleteDestination(id);
    loadData();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage travel destinations shown on the site.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
        >
          + Add Destination
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            {editingId === null ? "Add New Destination" : "Edit Destination"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location"
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
              rows={3}
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 md:col-span-2"
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
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && destinations.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                  No destinations yet.
                </td>
              </tr>
            )}
            {destinations.map((d) => (
              <tr key={d.destination_id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {d.name}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {d.location || "—"}
                </td>
                <td className="px-6 py-3 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(d)}
                    className="text-teal-600 font-medium hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(d.destination_id)}
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
