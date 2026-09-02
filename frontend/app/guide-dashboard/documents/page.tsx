"use client";

import { useEffect, useState } from "react";
import {
  VerificationDocument,
  getMyGuideProfile,
  getVerificationDocuments,
  uploadVerificationDocument,
} from "../../lib/api";

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    approved: "bg-teal-50 text-teal-700",
    pending: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700",
  };
  return styles[status] ?? "bg-gray-100 text-gray-500";
}

export default function GuideDocumentsPage() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentType, setDocumentType] = useState("nid");
  const [documentUrl, setDocumentUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDocuments() {
    setLoading(true);
    const profile = await getMyGuideProfile();
    const docs = await getVerificationDocuments(profile.id);
    setDocuments(docs);
    setLoading(false);
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!documentUrl.trim()) return;
    setError(null);
    setUploading(true);
    try {
      await uploadVerificationDocument({
        document_type: documentType,
        document_url: documentUrl,
      });
      setDocumentUrl("");
      loadDocuments();
    } catch (err: any) {
      setError(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Verification Documents
      </h1>
      <p className="text-sm text-gray-500 mt-1 mb-8">
        Upload documents (NID, guide license) for admin verification.
      </p>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Upload a Document
        </h2>
        {error && (
          <div className="bg-red-50 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">
            {error}
          </div>
        )}
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="nid">National ID</option>
            <option value="license">Guide License</option>
            <option value="certificate">Certificate</option>
          </select>
          <input
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
            placeholder="Document URL (link to image/PDF)"
            className="border border-gray-200 px-3 py-2 rounded-lg text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-60 md:col-span-3"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Link</th>
              <th className="px-6 py-3">Status</th>
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
            {!loading && documents.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                  No documents uploaded yet.
                </td>
              </tr>
            )}
            {documents.map((d) => (
              <tr key={d.id} className="border-t border-gray-100">
                <td className="px-6 py-3 font-medium text-gray-900 capitalize">
                  {d.document_type}
                </td>
                <td className="px-6 py-3 text-teal-600 truncate max-w-xs">
                  <a href={d.document_url} target="_blank" rel="noreferrer">
                    {d.document_url}
                  </a>
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusBadge(
                      d.status,
                    )}`}
                  >
                    {d.status}
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
