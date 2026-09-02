"use client";

import { useEffect, useState } from "react";
import {
  Category,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadData() {
    setLoading(true);
    setCategories(await getCategories());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit() {
    if (!name.trim()) return;
    if (editingId === null) {
      await createCategory(name);
    } else {
      await updateCategory(editingId, name);
    }
    setName("");
    setEditingId(null);
    loadData();
  }

  function handleEdit(c: Category) {
    setEditingId(c.category_id);
    setName(c.category_name);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this category?")) return;
    await deleteCategory(id);
    loadData();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Manage package categories (e.g. Adventure, Family, Luxury).
      </p>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={handleSubmit}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
        >
          {editingId === null ? "Add" : "Save"}
        </button>
        {editingId !== null && (
          <button
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                  No categories yet.
                </td>
              </tr>
            )}
            {categories.map((c) => (
              <tr key={c.category_id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {c.category_name}
                </td>
                <td className="px-6 py-3 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-teal-600 font-medium hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.category_id)}
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
