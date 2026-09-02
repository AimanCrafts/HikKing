"use client";

import { useEffect, useState } from "react";
import { GuideProfile, getMyGuideProfile } from "../lib/api";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    approved: "bg-teal-50 text-teal-700",
    pending: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700",
  };
  return styles[status] ?? "bg-gray-100 text-gray-500";
}

export default function GuideProfilePage() {
  const [profile, setProfile] = useState<GuideProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyGuideProfile()
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading...</p>;
  }

  if (error || !profile) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-10 text-center text-gray-400 text-sm">
        Could not load your guide profile. {error}
      </div>
    );
  }

  const packages = (profile as any).packages ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        This is how admins and travelers see your guide profile.
      </p>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Verification Status</h2>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusBadge(
              profile.verification_status,
            )}`}
          >
            {profile.verification_status}
          </span>
        </div>
        {profile.verification_status === "pending" && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
            Your profile is awaiting admin verification. Upload your
            documents from the &quot;Verification Docs&quot; tab to speed
            this up.
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400 text-xs">Experience</span>
            <p className="font-medium text-gray-900">
              {profile.experience_years ?? 0} years
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Average Rating</span>
            <p className="font-medium text-gray-900">
              {profile.rating_avg ? Number(profile.rating_avg).toFixed(1) : "—"}{" "}
              ⭐
            </p>
          </div>
        </div>
        {profile.bio && (
          <div className="mt-4">
            <span className="text-gray-400 text-xs">Bio</span>
            <p className="text-sm text-gray-700 mt-1">{profile.bio}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="text-3xl font-extrabold text-gray-900">
            {packages.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">My Packages</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">My Packages</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                  No packages assigned to you yet. Contact the admin.
                </td>
              </tr>
            )}
            {packages.map((p: any) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {p.title}
                </td>
                <td className="px-6 py-3 text-gray-600">
                  ৳{Number(p.price).toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
