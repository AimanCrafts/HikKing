"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "../../components/Shell";
import { Button, Icon, Label, Polaroid, tiltFor, useToast } from "../../components/ui";
import { PLACES } from "../../lib/catalog";
import { useUser } from "../../lib/hooks";
import { createStory } from "../../lib/stories";

type Pic = { id: number; file: File; url: string; caption: string };
const MAX_PHOTOS = 6;
const MAX_MB = 8;

export default function ShareStoryPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, ready } = useUser();
  const [place, setPlace] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pics, setPics] = useState<Pic[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function addFiles(files: FileList | File[]) {
    setError(null);
    const next: Pic[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) {
        setError("Only image files can be added.");
        continue;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`Each photo must be under ${MAX_MB} MB.`);
        continue;
      }
      const url = URL.createObjectURL(f);
      urls.current.push(url);
      next.push({ id: Date.now() + Math.random(), file: f, url, caption: "" });
    }
    setPics((cur) => [...cur, ...next].slice(0, MAX_PHOTOS));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) return;
    if (!place) return setError("Choose the place you traveled to.");
    if (!title.trim()) return setError("Give your story a title.");
    if (!body.trim() && pics.length === 0) return setError("Add a few words or at least one photo.");
    setBusy(true);
    try {
      const s = await createStory({ title: title.trim(), body: body.trim(), place, photos: pics.map((p) => ({ file: p.file, caption: p.caption.trim() })) }, user);
      toast(s.status === "approved" ? "Your story is live" : "Thanks! Your story will appear once approved");
      router.push("/stories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not share your story.");
    } finally {
      setBusy(false);
    }
  }

  if (ready && !user) {
    return (
      <Shell>
        <div className="wrap max-w-xl py-28 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-jade-soft text-jade"><Icon name="camera" size={30} /></span>
          <h1 className="t-h1 mt-6 text-ink">Log in to share your trip</h1>
          <p className="t-lead mt-3 text-ink2">Stories are tied to your account so they can be reviewed and credited to you.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button href="/login?next=/stories/share" size="lg">Log in</Button>
            <Button href="/signup" variant="outline" size="lg">Create account</Button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="wrap py-12 sm:py-16">
        <Link href="/stories" className="inline-flex items-center gap-2 text-sm font-extrabold text-ink2 hover:text-ink"><Icon name="arrowLeft" size={16} /> Back to stories</Link>
        <h1 className="t-h1 mt-4 text-ink">Share your trip</h1>
        <p className="t-lead mt-3 max-w-xl text-ink2">Add photos and tell people what it was really like. Your photos become tilted polaroids on the wall.</p>

        <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_460px]">
          <form onSubmit={submit} className="space-y-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <Label>Where did you go?</Label>
                <select value={place} onChange={(e) => setPlace(e.target.value)} className="field cursor-pointer">
                  <option value="">Choose a place</option>
                  {PLACES.map((p) => <option key={p.slug} value={p.name}>{p.name}</option>)}
                  <option value="Somewhere else in Bangladesh">Somewhere else</option>
                </select>
              </label>
              <label className="block">
                <Label hint={`${title.length}/80`}>Title</Label>
                <input value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Give it a headline" className="field" />
              </label>
            </div>

            <label className="block">
              <Label hint={`${body.length}/1200`}>Your story</Label>
              <textarea value={body} maxLength={1200} onChange={(e) => setBody(e.target.value)} rows={7} placeholder="What did you see, eat, feel? What would you tell the next traveler?" className="field resize-none leading-relaxed" />
            </label>

            <div>
              <Label hint={`${pics.length}/${MAX_PHOTOS} photos`}>Photos</Label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
                className={`flex flex-col items-center rounded-3xl border-2 border-dashed px-6 py-9 text-center transition ${drag ? "border-jade bg-jade-soft" : "border-line bg-surface"}`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-jade-soft text-jade"><Icon name="upload" size={22} /></span>
                <p className="mt-3 text-[15px] font-extrabold text-ink">Drag photos here</p>
                <p className="text-[13px] font-semibold text-ink3">JPG or PNG, up to {MAX_MB} MB each</p>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => input.current?.click()} disabled={pics.length >= MAX_PHOTOS}>Choose photos</Button>
                <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
              </div>

              {pics.length > 0 && (
                <ul className="mt-5 space-y-3">
                  {pics.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                      <input value={p.caption} maxLength={40} onChange={(e) => setPics((cur) => cur.map((x) => (x.id === p.id ? { ...x, caption: e.target.value } : x)))} placeholder={`Caption for photo ${i + 1}`} className="field !border-transparent !bg-sunk !py-2.5" />
                      <button type="button" aria-label="Remove photo" onClick={() => setPics((cur) => cur.filter((x) => x.id !== p.id))} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink3 transition hover:bg-danger-soft hover:text-danger">
                        <Icon name="close" size={17} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft p-3.5 text-sm font-bold text-danger"><Icon name="alert" size={17} className="mt-0.5" /> {error}</p>}

            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" size="lg" loading={busy} icon="send">Share story</Button>
              <p className="text-[13px] font-semibold text-ink3">Stories may be reviewed before they appear publicly.</p>
            </div>
          </form>

          <aside>
            <div className="sticky top-28 overflow-hidden rounded-[32px] bg-jade-deep p-8 text-white">
              <p className="text-sm font-extrabold text-white/70">Preview</p>
              <div className="relative mx-auto mt-4 min-h-[340px]">
                {pics.length === 0 ? (
                  <div className="flex h-[320px] flex-col items-center justify-center text-center text-white/60">
                    <Icon name="image" size={40} stroke={1.4} />
                    <p className="mt-3 max-w-[220px] text-sm font-semibold">Your photos will appear here as tilted polaroids</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                    {pics.slice(0, 4).map((p, i) => (
                      <div key={p.id} className={i % 2 === 1 ? "mt-8" : ""}>
                        <Polaroid src={p.url} caption={p.caption || place || "Caption"} tilt={tiltFor(i)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <h2 className="mt-6 text-xl font-black leading-snug">{title || "Your title"}</h2>
              <p className="mt-2 line-clamp-4 text-[14px] leading-relaxed text-white/75">{body || "Your story shows up here as you type."}</p>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
