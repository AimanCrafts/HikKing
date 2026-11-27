import { API_URL, authHeaders, User } from "./api";

/**
 * Traveler stories ("Share your experience").
 *
 * The backend endpoints below do not exist yet, so this layer tries the API
 * first and quietly falls back to this browser's storage when the endpoint is
 * missing (404 / 405 / network error). Once the backend is added the same
 * screens start using it with no frontend change.
 *
 * Expected API contract:
 *   GET    /experiences            -> approved stories (admin: all with ?all=1, mine: ?mine=1)
 *   POST   /experiences            -> multipart: title, story, place, photos[], captions[]
 *   PUT    /experiences/{id}       -> { status: "approved" | "rejected" | "pending" }
 *   DELETE /experiences/{id}
 *   Story JSON: { id, title, story, place, status, created_at,
 *                 user: { id, name }, photos: [{ url, caption }] }
 */

export type StoryPhoto = { src: string; caption: string };

export type Story = {
  id: string;
  author: string;
  userId?: number;
  title: string;
  body: string;
  place: string;
  photos: StoryPhoto[];
  createdAt: string;
  status: "approved" | "pending" | "rejected";
  origin: "api" | "local" | "sample";
};

const LOCAL_KEY = "hk_stories";

/* ------------------------------------------------------------------ */
/* Sample stories shown until real ones exist                          */
/* ------------------------------------------------------------------ */

const SAMPLES: Story[] = [
  {
    id: "sample-1",
    author: "Nadia R.",
    title: "We woke up above the clouds",
    body: "We reached the cottage after dark and had no idea what was outside our window. At five the next morning the whole valley was white and the hills were floating in it. Nobody spoke for ten minutes. Best tea of my life, from a flask, on a wooden porch.",
    place: "Sajek Valley",
    photos: [
      { src: "/images/packages/sajek.jpg", caption: "Sunrise, day two" },
      { src: "/images/packages/kaptai.jpg", caption: "The road down" },
    ],
    createdAt: "2026-02-12T08:00:00Z",
    status: "approved",
    origin: "sample",
  },
  {
    id: "sample-2",
    author: "Tahmid & friends",
    title: "Four boats, one swamp forest",
    body: "Ratargul looks unreal when the water is high. Our boatman knew every bend and kept cutting the engine so we could hear the birds. Pack a rain jacket, we got soaked and loved it.",
    place: "Sylhet & Ratargul",
    photos: [
      { src: "/images/packages/ratargul.jpg", caption: "Into the trees" },
      { src: "/hero/sylhet.jpg", caption: "Tea hills afterwards" },
    ],
    createdAt: "2026-01-20T08:00:00Z",
    status: "approved",
    origin: "sample",
  },
  {
    id: "sample-3",
    author: "Farhana K.",
    title: "Camping where the road ends",
    body: "We pitched tents a few steps from the water and lit a fire as the sun went down. Waking up to waves instead of an alarm clock is something I want to do every month.",
    place: "Cox\u2019s Bazar",
    photos: [
      { src: "/images/packages/coxsbazar-camping.jpg", caption: "Camp, 6 a.m." },
      { src: "/images/packages/marine-drive.jpg", caption: "Marine Drive" },
    ],
    createdAt: "2025-12-28T08:00:00Z",
    status: "approved",
    origin: "sample",
  },
  {
    id: "sample-4",
    author: "Imran H.",
    title: "Island time, properly",
    body: "No traffic, no rush. We walked the whole shoreline and ate fresh fish every night. Check the ferry schedule before you book your dates, it changed for us by a day.",
    place: "Saint Martin\u2019s Island",
    photos: [{ src: "/images/packages/saintmartin.jpg", caption: "Low tide" }],
    createdAt: "2025-12-02T08:00:00Z",
    status: "approved",
    origin: "sample",
  },
  {
    id: "sample-5",
    author: "Rafi M.",
    title: "Nilgiri before breakfast",
    body: "Start early. By the time the clouds filled in we were already sitting on the ledge with tea. Worth the 4 a.m. alarm.",
    place: "Bandarban",
    photos: [{ src: "/images/packages/nilgiri.jpg", caption: "The ledge" }],
    createdAt: "2025-11-15T08:00:00Z",
    status: "approved",
    origin: "sample",
  },
];

/* ------------------------------------------------------------------ */
/* Local fallback                                                      */
/* ------------------------------------------------------------------ */

function readLocal(): Story[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(parsed) ? (parsed as Story[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: Story[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("hk-stories"));
}

/** Shrinks a photo so a few of them fit in browser storage. */
export function compressImage(file: File, max = 1100, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not process this photo"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file is not a readable image"));
    };
    img.src = url;
  });
}

/* ------------------------------------------------------------------ */
/* API mapping                                                         */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromApi(o: any): Story {
  const photos: StoryPhoto[] = (o.photos ?? []).map((p: { url?: string; path?: string; image_url?: string; caption?: string }) => ({
    src: p.url || p.image_url || p.path || "",
    caption: p.caption || "",
  }));
  return {
    id: String(o.id ?? o.experience_id),
    author: o.user?.name || o.author || "Traveler",
    userId: o.user?.id ?? o.user_id,
    title: o.title || "",
    body: o.story || o.body || "",
    place: o.place || o.destination || "",
    photos,
    createdAt: o.created_at || new Date().toISOString(),
    status: o.status || "approved",
    origin: "api",
  };
}

const MISSING = [404, 405];

/* ------------------------------------------------------------------ */
/* Public functions                                                    */
/* ------------------------------------------------------------------ */

export async function loadStories(opts: { mine?: boolean; all?: boolean; userId?: number } = {}): Promise<Story[]> {
  const qs = opts.mine ? "?mine=1" : opts.all ? "?all=1" : "";
  try {
    const res = await fetch(`${API_URL}/experiences${qs}`, {
      headers: { Accept: "application/json", ...(opts.mine || opts.all ? authHeaders() : {}) },
    });
    if (res.ok) {
      const data = await res.json();
      const list = (Array.isArray(data) ? data : data.data ?? []).map(fromApi) as Story[];
      if (list.length > 0 || opts.mine || opts.all) return list;
    } else if (!MISSING.includes(res.status)) {
      throw new Error("Could not load stories");
    }
  } catch {
    /* use local fallback */
  }

  const local = readLocal();
  if (opts.mine) return local.filter((s) => s.userId === opts.userId);
  if (opts.all) return local;
  const approved = local.filter((s) => s.status === "approved");
  return [...approved, ...SAMPLES];
}

export type NewStory = {
  title: string;
  body: string;
  place: string;
  photos: { file: File; caption: string }[];
};

export async function createStory(input: NewStory, user: User): Promise<Story> {
  const fd = new FormData();
  fd.append("title", input.title);
  fd.append("story", input.body);
  fd.append("place", input.place);
  input.photos.forEach((p) => {
    fd.append("photos[]", p.file);
    fd.append("captions[]", p.caption);
  });

  let res: Response | null = null;
  try {
    res = await fetch(`${API_URL}/experiences`, {
      method: "POST",
      headers: { Accept: "application/json", ...authHeaders() },
      body: fd,
    });
  } catch {
    res = null; // network error: use the local fallback below
  }
  if (res) {
    if (res.ok) return fromApi(await res.json());
    if (!MISSING.includes(res.status)) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || "Could not share your story");
    }
  }

  // Local fallback (endpoint not available yet)
  const photos: StoryPhoto[] = [];
  for (const p of input.photos) photos.push({ src: await compressImage(p.file), caption: p.caption });
  const story: Story = {
    id: `local-${Date.now()}`,
    author: user.name,
    userId: user.id,
    title: input.title,
    body: input.body,
    place: input.place,
    photos,
    createdAt: new Date().toISOString(),
    status: "approved",
    origin: "local",
  };
  try {
    writeLocal([story, ...readLocal()]);
  } catch {
    throw new Error("Your browser ran out of storage. Try fewer or smaller photos.");
  }
  return story;
}

export async function setStoryStatus(story: Story, status: Story["status"]) {
  if (story.origin === "api") {
    const res = await fetch(`${API_URL}/experiences/${story.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Could not update the story");
    return;
  }
  writeLocal(readLocal().map((s) => (s.id === story.id ? { ...s, status } : s)));
}

export async function removeStory(story: Story) {
  if (story.origin === "api") {
    const res = await fetch(`${API_URL}/experiences/${story.id}`, {
      method: "DELETE",
      headers: { Accept: "application/json", ...authHeaders() },
    });
    if (!res.ok) throw new Error("Could not delete the story");
    return;
  }
  writeLocal(readLocal().filter((s) => s.id !== story.id));
}
