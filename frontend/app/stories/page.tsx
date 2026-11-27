"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Shell from "../components/Shell";
import { Avatar, Badge, Button, Chip, EmptyState, Icon, Modal, Polaroid, Skeleton, tiltFor } from "../components/ui";
import { Story, loadStories } from "../lib/stories";
import { fmtDate } from "../lib/format";

function PhotoStack({ story }: { story: Story }) {
  const [a, b] = story.photos;
  if (!a) return <div className="h-44 rounded-2xl bg-sunk" />;
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[340px]">
      <div className={b ? "absolute left-1 top-3 w-[60%]" : "absolute left-1/2 top-3 w-[62%] -translate-x-1/2"}>
        <Polaroid src={a.src} caption={a.caption} tilt={-7} />
      </div>
      {b && (
        <div className="absolute right-1 top-9 w-[60%]">
          <Polaroid src={b.src} caption={b.caption} tilt={7} />
        </div>
      )}
    </div>
  );
}

function StoryModal({ story, onClose }: { story: Story | null; onClose: () => void }) {
  return (
    <Modal open={!!story} onClose={onClose} width="max-w-4xl" flush>
      {story && (
        <div className="grid gap-0 md:grid-cols-[1.05fr_1fr]">
          <div className="scroll-x flex min-h-[280px] items-center justify-start gap-0 overflow-x-auto bg-jade-deep p-8 md:flex-wrap md:justify-center md:gap-y-4 md:overflow-visible">
            {story.photos.map((p, i) => (
              <div key={i} className={`w-[190px] shrink-0 ${i > 0 ? "-ml-5 md:ml-0" : ""} ${i % 2 === 1 ? "md:mt-6" : ""}`}>
                <Polaroid src={p.src} caption={p.caption} tilt={tiltFor(i)} />
              </div>
            ))}
          </div>
          <div className="p-7 sm:p-9">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-ink3">
              <Icon name="pin" size={14} /> {story.place}
            </p>
            <h2 className="t-h2 mt-2 text-ink">{story.title}</h2>
            <div className="mt-5 flex items-center gap-3">
              <Avatar name={story.author} size={40} />
              <div>
                <p className="text-sm font-extrabold text-ink">{story.author}</p>
                <p className="text-xs font-semibold text-ink3">{fmtDate(story.createdAt)}</p>
              </div>
              {story.origin === "sample" && <Badge tone="neutral" className="ml-auto">Sample story</Badge>}
            </div>
            <p className="mt-6 whitespace-pre-line text-[15.5px] leading-[1.75] text-ink2">{story.body}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Wall() {
  const router = useRouter();
  const params = useSearchParams();
  const [stories, setStories] = useState<Story[] | null>(null);
  const [place, setPlace] = useState("");
  const [openId, setOpenId] = useState<string | null>(params.get("open"));

  useEffect(() => {
    const load = () => loadStories().then(setStories).catch(() => setStories([]));
    load();
    window.addEventListener("hk-stories", load);
    return () => window.removeEventListener("hk-stories", load);
  }, []);

  const places = useMemo(() => Array.from(new Set((stories ?? []).map((s) => s.place).filter(Boolean))), [stories]);
  const list = (stories ?? []).filter((s) => !place || s.place === place);
  const open = stories?.find((s) => s.id === openId) ?? null;

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="wrap flex flex-col gap-8 py-14 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="t-h1 max-w-2xl text-ink">Stories from the road</h1>
            <p className="t-lead mt-4 max-w-xl text-ink2">Photos and short write-ups from travelers who&rsquo;ve done the trips. Real moments, not brochure copy.</p>
          </div>
          <Button href="/stories/share" size="lg" icon="camera">
            Share your trip
          </Button>
        </div>
      </section>

      <section className="wrap py-10">
        {places.length > 1 && (
          <div className="scroll-x mb-10 flex gap-2">
            <Chip active={!place} onClick={() => setPlace("")}>All places</Chip>
            {places.map((p) => (
              <Chip key={p} active={place === p} onClick={() => setPlace(place === p ? "" : p)}>{p}</Chip>
            ))}
          </div>
        )}

        {stories === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96" />)}
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon="camera" title="No stories here yet" text="Be the first to share a trip from this place." action={<Button href="/stories/share">Share your trip</Button>} />
        ) : (
          <div className="columns-1 gap-x-8 sm:columns-2 lg:columns-3">
            {list.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setOpenId(s.id);
                  router.replace(`/stories?open=${encodeURIComponent(s.id)}`, { scroll: false });
                }}
                className="group mb-10 block w-full break-inside-avoid text-left"
              >
                <div className="rounded-[32px] bg-sunk px-3 pb-3 pt-6 transition group-hover:bg-jade-soft">
                  <PhotoStack story={s} />
                </div>
                <div className="px-2 pt-5">
                  <p className="flex items-center gap-1.5 text-[13px] font-bold text-ink3">
                    <Icon name="pin" size={14} /> {s.place}
                    {s.origin === "sample" && <Badge tone="neutral" className="ml-1 !py-0.5">Sample</Badge>}
                  </p>
                  <h2 className="mt-1.5 text-xl font-extrabold leading-snug tracking-tight text-ink">{s.title}</h2>
                  <p className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-ink2">{s.body}</p>
                  <p className="mt-3 flex items-center gap-2 text-[13px] font-bold text-ink2">
                    <Avatar name={s.author} size={26} /> {s.author}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <StoryModal
        story={open}
        onClose={() => {
          setOpenId(null);
          router.replace("/stories", { scroll: false });
        }}
      />
    </>
  );
}

export default function StoriesPage() {
  return (
    <Shell>
      <Suspense fallback={<div className="wrap py-24" />}>
        <Wall />
      </Suspense>
    </Shell>
  );
}
