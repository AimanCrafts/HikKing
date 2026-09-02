"use client";

import { useEffect, useState } from "react";
import {
  VerificationDocument,
  getVerificationDocuments,
  updateVerificationDocumentStatus,
} from "../../lib/api";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    approved: "bg-teal-50 text-teal-700",
    pending: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700",
  };
  return styles[status] ?? "bg-gray-100 text-gray-500";
}

export default function AdminVerificationDocumentsPage() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    setDocuments(await getVerificationDocuments());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleStatusChange(id: number, status: string) {
    await updateVerificationDocumentStatus(id, status);
    loadData();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Guide Verification Documents
      </h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Review documents guides have uploaded and approve or reject them.
      </p>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3">Guide</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Document</th>
              <th className="px-6 py-3">Status</th>
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
            {!loading && documents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No documents uploaded yet.
                </td>
              </tr>
            )}
            {documents.map((d: any) => (
              <tr key={d.id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-900">
                  {d.guideProfile?.user?.name ?? `Guide profile #${d.guide_profile_id}`}
                </td>
                <td className="px-6 py-3 text-gray-600 capitalize">
                  {d.document_type}
                </td>
                <td className="px-6 py-3 text-teal-600 truncate max-w-xs">
                  <a href={d.document_url} target="_blank" rel="noreferrer">
                    View document
                  </a>
                </td>
                <td className="px-6 py-3">
                  <select
                    value={d.status}
                    onChange={(e) => handleStatusChange(d.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full capitalize border-0 ${statusBadge(
                      d.status,
                    )}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
