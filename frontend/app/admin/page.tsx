<<<<<<< HEAD
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDestinations } from "../lib/api";
import { getHotels } from "../lib/api";

type StatCard = {
  label: string;
  count: number | null;
  href: string;
  icon: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { label: "Destinations", count: null, href: "/admin/destinations", icon: "📍" },
    { label: "Hotels", count: null, href: "/admin/hotels", icon: "🏨" },
  ]);

  useEffect(() => {
    async function loadStats() {
      const [destinations, hotels] = await Promise.all([
        getDestinations().catch(() => []),
        getHotels().catch(() => []),
      ]);

      setStats([
        {
          label: "Destinations",
          count: destinations.length,
          href: "/admin/destinations",
          icon: "📍",
        },
        {
          label: "Hotels",
          count: hotels.length,
          href: "/admin/hotels",
          icon: "🏨",
        },
      ]);
    }

    loadStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        Overview of your HikKing platform data.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 text-lg">
                {s.icon}
              </span>
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                Manage →
              </span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {s.count === null ? "…" : s.count}
            </div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
=======
"use client";

import { useEffect, useState } from "react";
import {
  Destination,
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from "../lib/api";

interface Guide {
  id: number;
  name: string;
  bio: string | null;
  experience_years: number | null;
  specialization: string | null;
  rating_avg: number;
  verification_status: string;
}

const API_URL = "http://localhost:8000/api";

export default function AdminDashboard() {
  /* ----------------------------- Destinations ---------------------------- */
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationName, setDestinationName] = useState("");
  const [editingDestinationId, setEditingDestinationId] = useState<
    number | null
  >(null);

  async function loadDestinations() {
    const data = await getDestinations();
    setDestinations(data);
  }

  useEffect(() => {
    loadDestinations();
  }, []);

  // Create
  async function handleCreateDestination() {
    if (!destinationName.trim()) return;

    await createDestination({
      name: destinationName,
      is_active: true,
    });

    setDestinationName("");
    loadDestinations();
  }

  // Start editing
  function handleEditDestination(destination: Destination) {
    setEditingDestinationId(destination.id);
    setDestinationName(destination.name);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update
  async function handleUpdateDestination() {
    if (!editingDestinationId || !destinationName.trim()) return;

    await updateDestination(editingDestinationId, {
      name: destinationName,
      is_active: true,
    });

    setDestinationName("");
    setEditingDestinationId(null);

    loadDestinations();
  }

  // Cancel editing
  function handleCancelEditDestination() {
    setEditingDestinationId(null);
    setDestinationName("");
  }

  // Delete
  async function handleDeleteDestination(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this destination?",
    );

    if (!confirmed) return;

    await deleteDestination(id);

    if (editingDestinationId === id) {
      handleCancelEditDestination();
    }

    loadDestinations();
  }

  /* -------------------------------- Guides -------------------------------- */
  const [guides, setGuides] = useState<Guide[]>([]);

  const [guideName, setGuideName] = useState("");
  const [guideBio, setGuideBio] = useState("");
  const [guideExperienceYears, setGuideExperienceYears] = useState("");
  const [guideSpecialization, setGuideSpecialization] = useState("");
  const [guideRatingAvg, setGuideRatingAvg] = useState("");
  const [guideVerificationStatus, setGuideVerificationStatus] =
    useState("pending");

  const [editingGuideId, setEditingGuideId] = useState<number | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState("");

  async function loadGuides() {
    try {
      const res = await fetch(`${API_URL}/guides`);

      if (!res.ok) {
        throw new Error("Failed to fetch guides");
      }

      const data = await res.json();

      setGuides(data);
    } catch (error) {
      console.error(error);
      setGuideError("Failed to load guides.");
    }
  }

  useEffect(() => {
    loadGuides();
  }, []);

  // Reset form
  function resetGuideForm() {
    setGuideName("");
    setGuideBio("");
    setGuideExperienceYears("");
    setGuideSpecialization("");
    setGuideRatingAvg("");
    setGuideVerificationStatus("pending");
    setEditingGuideId(null);
    setGuideError("");
  }

  // Create
  async function handleCreateGuide() {
    if (!guideName.trim()) {
      setGuideError("Guide name is required.");
      return;
    }

    try {
      setGuideLoading(true);
      setGuideError("");

      const res = await fetch(`${API_URL}/guides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: guideName,
          bio: guideBio || null,
          experience_years: guideExperienceYears
            ? Number(guideExperienceYears)
            : null,
          specialization: guideSpecialization || null,
          rating_avg: guideRatingAvg ? Number(guideRatingAvg) : 0,
          verification_status: guideVerificationStatus,
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error(errorData);

        throw new Error("Failed to create guide");
      }

      resetGuideForm();
      await loadGuides();
    } catch (error) {
      console.error(error);
      setGuideError("Failed to create guide.");
    } finally {
      setGuideLoading(false);
    }
  }

  // Start editing
  function handleEditGuide(guide: Guide) {
    setEditingGuideId(guide.id);

    setGuideName(guide.name);
    setGuideBio(guide.bio || "");

    setGuideExperienceYears(
      guide.experience_years !== null ? String(guide.experience_years) : "",
    );

    setGuideSpecialization(guide.specialization || "");

    setGuideRatingAvg(
      guide.rating_avg !== null ? String(guide.rating_avg) : "",
    );

    setGuideVerificationStatus(guide.verification_status || "pending");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update
  async function handleUpdateGuide() {
    if (!editingGuideId) return;

    if (!guideName.trim()) {
      setGuideError("Guide name is required.");
      return;
    }

    try {
      setGuideLoading(true);
      setGuideError("");

      const res = await fetch(`${API_URL}/guides/${editingGuideId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: guideName,
          bio: guideBio || null,
          experience_years: guideExperienceYears
            ? Number(guideExperienceYears)
            : null,
          specialization: guideSpecialization || null,
          rating_avg: guideRatingAvg ? Number(guideRatingAvg) : 0,
          verification_status: guideVerificationStatus,
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error(errorData);

        throw new Error("Failed to update guide");
      }

      resetGuideForm();
      await loadGuides();
    } catch (error) {
      console.error(error);
      setGuideError("Failed to update guide.");
    } finally {
      setGuideLoading(false);
    }
  }

  // Delete
  async function handleDeleteGuide(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this guide?",
    );

    if (!confirmed) return;

    try {
      setGuideError("");

      const res = await fetch(`${API_URL}/guides/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to delete guide");
      }

      if (editingGuideId === id) {
        resetGuideForm();
      }

      await loadGuides();
    } catch (error) {
      console.error(error);
      setGuideError("Failed to delete guide.");
    }
  }

  /* --------------------------------- Render -------------------------------- */
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-center mb-10">Admin Dashboard</h1>

      {/* ============================ Destinations ============================ */}
      <section>
        <h2 className="text-xl font-bold mb-4">Destinations</h2>

        {/* Create / Update Form */}
        <div className="flex gap-2 mb-6">
          <input
            value={destinationName}
            onChange={(e) => setDestinationName(e.target.value)}
            placeholder="Destination name"
            className="border px-3 py-2 rounded w-full"
          />

          {editingDestinationId === null ? (
            <button
              onClick={handleCreateDestination}
              className="bg-blue-600 text-white px-4 py-2 rounded whitespace-nowrap"
            >
              Add
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdateDestination}
                className="bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap"
              >
                Update
              </button>

              <button
                onClick={handleCancelEditDestination}
                className="bg-gray-500 text-white px-4 py-2 rounded whitespace-nowrap"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Destination List */}
        {destinations.length === 0 ? (
          <p className="text-gray-500">No destinations found.</p>
        ) : (
          <ul className="space-y-2">
            {destinations.map((d) => (
              <li
                key={d.id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>{d.name}</span>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditDestination(d)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteDestination(d.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Gap between sections */}
      <div className="my-12 border-t" />

      {/* ============================== Guides ================================ */}
      <section>
        <h2 className="text-xl font-bold mb-4">Guides</h2>

        {/* Error */}
        {guideError && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {guideError}
          </div>
        )}

        {/* Create / Update Form */}
        <div className="max-w-xl space-y-4 mb-8">
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium">Guide Name</label>

            <input
              type="text"
              value={guideName}
              onChange={(e) => setGuideName(e.target.value)}
              placeholder="Enter guide name"
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block mb-1 font-medium">Bio</label>

            <textarea
              value={guideBio}
              onChange={(e) => setGuideBio(e.target.value)}
              placeholder="Guide bio"
              rows={4}
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block mb-1 font-medium">Experience Years</label>

            <input
              type="number"
              min="0"
              max="100"
              value={guideExperienceYears}
              onChange={(e) => setGuideExperienceYears(e.target.value)}
              placeholder="e.g. 5"
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="block mb-1 font-medium">Specialization</label>

            <input
              type="text"
              value={guideSpecialization}
              onChange={(e) => setGuideSpecialization(e.target.value)}
              placeholder="e.g. Hill Tracts"
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block mb-1 font-medium">Rating</label>

            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={guideRatingAvg}
              onChange={(e) => setGuideRatingAvg(e.target.value)}
              placeholder="e.g. 4.5"
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Verification Status */}
          <div>
            <label className="block mb-1 font-medium">
              Verification Status
            </label>

            <select
              value={guideVerificationStatus}
              onChange={(e) => setGuideVerificationStatus(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {editingGuideId === null ? (
              <button
                onClick={handleCreateGuide}
                disabled={guideLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {guideLoading ? "Creating..." : "Add Guide"}
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpdateGuide}
                  disabled={guideLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {guideLoading ? "Updating..." : "Update Guide"}
                </button>

                <button
                  onClick={resetGuideForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Guide List */}
        {guides.length === 0 ? (
          <p className="text-gray-500">No guides found.</p>
        ) : (
          <ul className="space-y-3">
            {guides.map((guide) => (
              <li
                key={guide.id}
                className="border rounded p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{guide.name}</p>

                  <p className="text-sm text-gray-600">
                    {guide.specialization || "No specialization"}
                  </p>

                  <p className="text-sm">
                    Experience: {guide.experience_years ?? 0} years
                  </p>

                  <p className="text-sm">Rating: ⭐ {guide.rating_avg}</p>

                  <p className="text-sm">Status: {guide.verification_status}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditGuide(guide)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteGuide(guide.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
