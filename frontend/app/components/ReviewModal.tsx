"use client";

import { useState } from "react";
import { Booking, createReview } from "../lib/api";
import { Button, Icon, Label, Modal, useToast } from "./ui";

export default function ReviewModal({ booking, open, onClose, onDone }: { booking: Booking | null; open: boolean; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!booking) return;
    if (!rating) return setError("Choose a star rating.");
    setBusy(true);
    setError(null);
    try {
      await createReview({ booking_id: booking.booking_id, rating, comment: comment.trim() || undefined });
      toast("Thanks for your review");
      setRating(0);
      setComment("");
      onDone();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post your review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Review this trip" width="max-w-md">
      <div className="flex justify-center gap-1.5" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)} className="p-1 transition hover:scale-110">
            <Icon name="star" size={36} fill={n <= rating} className={n <= rating ? "text-sun" : "text-line"} stroke={1.5} />
          </button>
        ))}
      </div>
      <label className="mt-5 block">
        <Label hint="Optional">What was it like?</Label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Tell future travelers what stood out" className="field resize-none" />
      </label>
      {error && <p role="alert" className="mt-3 text-sm font-bold text-danger">{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button loading={busy} onClick={submit}>Post review</Button>
      </div>
    </Modal>
  );
}
