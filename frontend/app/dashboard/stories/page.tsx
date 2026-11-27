"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, ConfirmDialog, EmptyState, Icon, Polaroid, Skeleton, StatusBadge, useToast } from "../../components/ui";
import { useUser } from "../../lib/hooks";
import { Story, loadStories, removeStory } from "../../lib/stories";
import { fmtDate } from "../../lib/format";

export default function MyStoriesPage() {
  const { user } = useUser();
  const toast = useToast();
  const [stories, setStories] = useState<Story[] | null>(null);
  const [del, setDel] = useState<Story | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!user) return;
    loadStories({ mine: true, userId: user.id }).then(setStories).catch(() => setStories([]));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!del) return;
    setBusy(true);
    try {
      await removeStory(del);
      toast("Story deleted", "info");
      setDel(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not delete", "error");
    } finally {
      setBusy(false);
    }
  }

  if (stories === null) return <Skeleton className="h-52" />;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-lg text-[15px] text-ink2">Stories you&rsquo;ve shared. Approved stories appear on the public wall.</p>
        <Button href="/stories/share" icon="camera">Share a trip</Button>
      </div>

      {stories.length === 0 ? (
        <EmptyState icon="camera" title="You haven&rsquo;t shared a story yet" text="After a trip, add a few photos and a paragraph. It helps the next traveler." action={<Button href="/stories/share">Share your first story</Button>} />
      ) : (
        <ul className="space-y-5">
          {stories.map((s) => (
            <li key={s.id} className="flex flex-col gap-6 rounded-[28px] border border-line bg-surface p-6 sm:flex-row">
              <div className="flex shrink-0 gap-0 sm:w-56">
                {s.photos.slice(0, 2).map((p, i) => (
                  <div key={i} className={`w-28 ${i === 1 ? "-ml-4 mt-4" : ""}`}>
                    <Polaroid src={p.src} tilt={i === 0 ? -7 : 7} className="!p-1.5 !pb-6" />
                  </div>
                ))}
                {s.photos.length === 0 && <div className="flex h-24 w-28 items-center justify-center rounded-2xl bg-sunk text-ink3"><Icon name="image" size={26} /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={s.status} />
                  <Badge tone="neutral">{s.place}</Badge>
                  <span className="text-xs font-semibold text-ink3">{fmtDate(s.createdAt)}</span>
                </div>
                <h2 className="mt-3 text-xl font-extrabold tracking-tight text-ink">{s.title}</h2>
                <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-ink2">{s.body}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" href={`/stories?open=${encodeURIComponent(s.id)}`}>View</Button>
                  <Button size="sm" variant="danger" icon="trash" onClick={() => setDel(s)}>Delete</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={!!del} title="Delete this story?" text="It will be removed from the wall. This can&rsquo;t be undone." busy={busy} onConfirm={confirmDelete} onClose={() => setDel(null)} />
    </div>
  );
}
