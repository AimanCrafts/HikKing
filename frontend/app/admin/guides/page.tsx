"use client";

import { useEffect, useState } from "react";
<<<<<<< HEAD
import {
  GuideProfile,
  User,
  getGuideProfiles,
  createGuideProfile,
  updateGuideProfile,
  deleteGuideProfile,
  getUsers,
} from "../../lib/api";

const emptyForm = {
  user_id: "",
  bio: "",
  experience_years: "",
  verification_status: "pending",
};

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [guideUsers, setGuideUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const [guideData, userData] = await Promise.all([
      getGuideProfiles(),
      getUsers("guide"),
    ]);
    setGuides(guideData);
    setGuideUsers(userData);
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
    if (editingId === null) {
      // Creating a new guide profile requires linking an existing
      // user account (role = "guide")
      if (!form.user_id) return;

      await createGuideProfile({
        user_id: Number(form.user_id),
        bio: form.bio || null,
        experience_years: form.experience_years
          ? Number(form.experience_years)
          : null,
        verification_status: form.verification_status,
      });
    } else {
      // Editing only touches bio/experience/verification, the linked
      // user cannot be changed after creation
      await updateGuideProfile(editingId, {
        bio: form.bio || null,
        experience_years: form.experience_years
          ? Number(form.experience_years)
          : null,
        verification_status: form.verification_status,
      });
    }

    resetForm();
    loadData();
  }

  function handleEdit(g: GuideProfile) {
    setEditingId(g.id);
    setForm({
      user_id: String(g.user_id),
      bio: g.bio ?? "",
      experience_years: g.experience_years ? String(g.experience_years) : "",
      verification_status: g.verification_status ?? "pending",
    });
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this guide profile?")) return;
    await deleteGuideProfile(id);
    loadData();
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      approved: "bg-teal-50 text-teal-700",
      verified: "bg-teal-50 text-teal-700",
      pending: "bg-amber-50 text-amber-700",
      rejected: "bg-red-50 text-red-700",
    };
    return styles[status] ?? "bg-gray-100 text-gray-500";
  }

  // Users with role="guide" who don't have a guide profile linked yet
  const linkedUserIds = new Set(guides.map((g) => g.user_id));
  const availableUsers = guideUsers.filter((u) => !linkedUserIds.has(u.id));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guides</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage local guide profiles and their verification status.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
        >
          + Link Guide
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            {editingId === null ? "Link a Guide User" : "Edit Guide Profile"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editingId === null ? (
              <select
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 md:col-span-2"
              >
                <option value="">Select a user (role: guide)</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-gray-500 md:col-span-2">
                Linked user:{" "}
                <span className="font-medium text-gray-900">
                  {guides.find((g) => g.id === editingId)?.user?.name}
                </span>
              </div>
            )}
            <input
              value={form.experience_years}
              onChange={(e) =>
                setForm({ ...form, experience_years: e.target.value })
              }
              placeholder="Experience (years)"
              type="number"
              min={0}
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <select
              value={form.verification_status}
              onChange={(e) =>
                setForm({ ...form, verification_status: e.target.value })
              }
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Bio"
              rows={3}
              className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 md:col-span-2"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
            >
              {editingId === null ? "Link" : "Save Changes"}
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
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Experience</th>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3">Verification</th>
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
            {!loading && guides.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No guides yet.
                </td>
              </tr>
            )}
            {guides.map((g) => (
              <tr key={g.id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {g.user?.name ?? "—"}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {g.user?.email ?? "—"}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  {g.experience_years !== null
                    ? `${g.experience_years} yrs`
                    : "—"}
                </td>
                <td className="px-6 py-3 text-yellow-600">
                  {g.rating_avg ? Number(g.rating_avg).toFixed(1) : "—"}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusBadge(
                      g.verification_status,
                    )}`}
                  >
                    {g.verification_status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right space-x-3">
                  <button
                    onClick={() => handleEdit(g)}
                    className="text-teal-600 font-medium hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
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
=======
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GuideProfile, getGuideProfiles } from "../lib/api";

export default function GuidePage() {
  const [guides, setGuides] = useState<GuideProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuideProfiles()
      .then((data) =>
        setGuides(data.filter((g) => g.verification_status === "approved")),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
          Local Experts
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-1 mb-8">
          Meet our Guides
        </h1>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && guides.length === 0 && (
          <p className="text-sm text-gray-400">No guides available yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {guides.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow p-4"
            >
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 text-xl mb-3">
                🧭
              </div>
              <h3 className="font-semibold text-gray-900">
                {g.user?.name ?? "Guide"}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                {g.experience_years !== null && (
                  <span className="text-xs text-gray-500">
                    {g.experience_years} yrs experience
                  </span>
                )}
                {g.rating_avg ? (
                  <span className="text-xs text-yellow-600">
                    ★ {Number(g.rating_avg).toFixed(1)}
                  </span>
                ) : null}
              </div>
              {g.bio && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {g.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
    </div>
  );
}
