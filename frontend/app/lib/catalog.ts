import type { Package, Hotel } from "./api";

/* ------------------------------------------------------------------ */
/* Places (editorial content that does not live in the database)       */
/* ------------------------------------------------------------------ */

export type PlaceKind = "Hills" | "Beach" | "Nature" | "Adventure" | "Lake";

export type Place = {
  slug: string;
  name: string;
  region: string;
  kind: PlaceKind;
  image: string;
  gallery: string[];
  line: string;
  desc: string;
  months: number[]; // 1 = Jan
  season: string;
  things: string[];
  tips: string[];
  lon: number;
  lat: number;
  match: string[];
};

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const PLACES: Place[] = [
  {
    slug: "sajek",
    name: "Sajek Valley",
    region: "Rangamati",
    kind: "Hills",
    image: "/images/packages/sajek.jpg",
    gallery: ["/images/packages/sajek.jpg", "/images/packages/kaptai.jpg", "/hero/rangamati.jpg"],
    line: "Cloud-level ridgelines",
    desc: "A ridge-top valley of cottages, village paths and mornings where the clouds sit below your feet.",
    months: [10, 11, 12, 1, 2, 3],
    season: "October to March for clear skies. The monsoon brings more cloud and rain.",
    things: ["Sunrise above the clouds", "Ridge walks", "Para village visits"],
    tips: ["Pack a light jacket for cold mornings", "Roads are steep, so travel in daylight", "Carry cash, since cards are rarely accepted"],
    lon: 92.29,
    lat: 23.38,
    match: ["sajek"],
  },
  {
    slug: "bandarban",
    name: "Bandarban",
    region: "Chattogram Hill Tracts",
    kind: "Adventure",
    image: "/images/packages/nilgiri.jpg",
    gallery: ["/images/packages/nilgiri.jpg", "/images/packages/sajek.jpg"],
    line: "Highlands and waterfalls",
    desc: "The country's tallest hills, winding mountain roads, viewpoints like Nilgiri and trails that reward early starts.",
    months: [11, 12, 1, 2],
    season: "November to February, when trails are dry and the air is cool.",
    things: ["Mountain viewpoints", "Waterfalls", "Trekking"],
    tips: ["Check permit rules for specific trails before you go", "Wear shoes with real grip", "Start hikes early"],
    lon: 92.22,
    lat: 22.19,
    match: ["bandarban", "nilgiri"],
  },
  {
    slug: "sylhet",
    name: "Sylhet & Ratargul",
    region: "Sylhet",
    kind: "Nature",
    image: "/images/packages/ratargul.jpg",
    gallery: ["/images/packages/ratargul.jpg", "/hero/sylhet.jpg"],
    line: "Tea hills and swamp forest",
    desc: "Emerald tea gardens, river bends and Ratargul, a freshwater swamp forest you move through by boat.",
    months: [6, 7, 8, 9, 11, 12, 1, 2, 3],
    season: "June to September for the flooded forest, November to March for tea-garden walks.",
    things: ["Boat through the swamp forest", "Tea garden walks", "River scenery"],
    tips: ["Boat access depends on water levels", "Bring a rain layer in summer", "Wear a life jacket on the boat"],
    lon: 91.87,
    lat: 24.9,
    match: ["sylhet", "ratargul"],
  },
  {
    slug: "coxs-bazar",
    name: "Cox\u2019s Bazar",
    region: "Chattogram",
    kind: "Beach",
    image: "/images/packages/marine-drive.jpg",
    gallery: ["/images/packages/marine-drive.jpg", "/images/packages/coxsbazar-camping.jpg", "/hero/coxsbazar.jpg"],
    line: "The long coastline",
    desc: "One of the longest sea beaches in the world, with Marine Drive, sunset walks and seafood by the shore.",
    months: [11, 12, 1, 2, 3],
    season: "November to March for calm weather and gentle seas.",
    things: ["Beach and sunset walks", "Marine Drive", "Seafood"],
    tips: ["Swim only where lifeguards are posted", "Sun protection matters even in winter", "Book weekends early"],
    lon: 91.98,
    lat: 21.45,
    match: ["cox", "marine"],
  },
  {
    slug: "saint-martin",
    name: "Saint Martin\u2019s Island",
    region: "Bay of Bengal",
    kind: "Beach",
    image: "/images/packages/saintmartin.jpg",
    gallery: ["/images/packages/saintmartin.jpg", "/images/packages/marine-drive.jpg"],
    line: "Coral-blue island days",
    desc: "A small coral island with clear water, slow walks and the kind of quiet that mainland beaches rarely have.",
    months: [11, 12, 1, 2, 3],
    season: "The cooler season. Ferry service is seasonal, so confirm transport before you commit to dates.",
    things: ["Island walks", "Sunset on the beach", "Seafood dinners"],
    tips: ["Check current travel rules and ferry schedules", "Carry a power bank, since electricity is limited", "Respect the reef and take your rubbish with you"],
    lon: 92.32,
    lat: 20.63,
    match: ["saint", "st. martin", "st martin"],
  },
  {
    slug: "sundarbans",
    name: "Sundarbans",
    region: "Khulna",
    kind: "Nature",
    image: "/images/packages/sundarbans.jpg",
    gallery: ["/images/packages/sundarbans.jpg"],
    line: "The mangrove world",
    desc: "The largest mangrove forest on Earth, explored by boat through tidal channels, home to deer, birds and tigers you will probably only hear about.",
    months: [11, 12, 1, 2],
    season: "November to February, when the weather is dry and cool.",
    things: ["Boat safari", "Wildlife watching", "Forest walks at designated points"],
    tips: ["Entry requires forest department permission", "Mosquito repellent is essential", "Keep quiet to spot more wildlife"],
    lon: 89.2,
    lat: 22.2,
    match: ["sundar"],
  },
  {
    slug: "kaptai-rangamati",
    name: "Kaptai & Rangamati",
    region: "Rangamati",
    kind: "Lake",
    image: "/images/packages/kaptai.jpg",
    gallery: ["/images/packages/kaptai.jpg", "/hero/rangamati.jpg"],
    line: "Lake and hill country",
    desc: "A reservoir lake dotted with green islands, hanging bridges, boat rides and hill-tribe markets.",
    months: [10, 11, 12, 1, 2, 3],
    season: "October to March for clear skies on the water.",
    things: ["Lake boat rides", "Hanging bridge", "Local markets"],
    tips: ["Boats are cheaper in the morning", "Bring a hat for the open water", "Try the bamboo-cooked dishes"],
    lon: 92.2,
    lat: 22.65,
    match: ["kaptai", "rangamati"],
  },
  {
    slug: "sreemangal",
    name: "Sreemangal",
    region: "Moulvibazar",
    kind: "Nature",
    image: "/hero/sylhet.jpg",
    gallery: ["/hero/sylhet.jpg", "/images/packages/ratargul.jpg"],
    line: "The tea capital",
    desc: "Rolling tea estates, forest trails and a slower rhythm. Home to Lawachara National Park.",
    months: [11, 12, 1, 2, 3],
    season: "November to March for comfortable walking weather.",
    things: ["Tea estate walks", "Birdwatching", "Forest trails"],
    tips: ["Visit a tea stall for a seven-layer tea", "Mornings are best for birds", "Wear long sleeves in the forest"],
    lon: 91.73,
    lat: 24.31,
    match: ["sreemangal", "srimangal"],
  },
];

export const KIND_TILES: { kind: PlaceKind; image: string; blurb: string }[] = [
  { kind: "Hills", image: "/images/packages/sajek.jpg", blurb: "Cool air, big views" },
  { kind: "Beach", image: "/images/packages/marine-drive.jpg", blurb: "Sand, sea and slow days" },
  { kind: "Nature", image: "/images/packages/ratargul.jpg", blurb: "Forests, tea and rivers" },
  { kind: "Adventure", image: "/images/packages/nilgiri.jpg", blurb: "Trails and waterfalls" },
  { kind: "Lake", image: "/images/packages/kaptai.jpg", blurb: "Still water, green islands" },
];

export function placeFor(name?: string | null): Place | undefined {
  if (!name) return undefined;
  const n = name.toLowerCase();
  return PLACES.find((p) => p.match.some((m) => n.includes(m)));
}

export function placeBySlug(slug: string): Place | undefined {
  return PLACES.find((p) => p.slug === slug);
}

export const HERO_IMAGES = [
  { src: "/hero/rangamati.jpg", place: "Rangamati" },
  { src: "/hero/sylhet.jpg", place: "Sylhet" },
  { src: "/hero/coxsbazar.jpg", place: "Cox\u2019s Bazar" },
];

/* ------------------------------------------------------------------ */
/* Tours                                                               */
/* ------------------------------------------------------------------ */

export type Tour = {
  id: number;
  title: string;
  place: string;
  region: string;
  kind: string;
  categories: string[];
  days: number;
  nights: number;
  price: number;
  oldPrice: number | null;
  maxTravelers: number | null;
  image: string;
  gallery: string[];
  summary: string;
  includes: string[];
  itinerary: { title: string; text: string }[];
  hotels: Hotel[];
  live: boolean;
};

export const TOUR_KINDS = ["Hills", "Beach", "Nature", "Adventure", "Lake"] as const;

const DEMO: Omit<Tour, "kind" | "region" | "gallery" | "categories" | "hotels" | "live">[] = [
  {
    id: 101,
    title: "Sajek Cloud Country Weekend",
    place: "Sajek Valley",
    days: 3,
    nights: 2,
    price: 5900,
    oldPrice: 6800,
    maxTravelers: 12,
    image: "/images/packages/sajek.jpg",
    summary: "Slow mornings above the clouds, village walks and a hilltop cottage stay.",
    includes: ["Round-trip transport from Dhaka", "2 nights in a hill cottage", "Breakfast each morning", "Local sightseeing"],
    itinerary: [
      { title: "Leave Dhaka, arrive in the hills", text: "Travel overnight and settle into your cottage. Rest, then watch the first sunset." },
      { title: "Ridge walks and village visits", text: "Walk the ridge, visit a para village and catch the evening light from the viewpoint." },
      { title: "Sunrise and return", text: "Catch sunrise above the clouds, have breakfast and begin the journey home." },
    ],
  },
  {
    id: 102,
    title: "Sylhet: Tea Trails and Swamp Forest",
    place: "Sylhet & Ratargul",
    days: 2,
    nights: 1,
    price: 4250,
    oldPrice: 4800,
    maxTravelers: 14,
    image: "/images/packages/ratargul.jpg",
    summary: "Tea gardens, river scenery and a boat ride through Ratargul swamp forest.",
    includes: ["Transport", "1 night accommodation", "Breakfast", "Boat visit when water levels allow"],
    itinerary: [
      { title: "Tea country", text: "Travel to Sylhet, walk through a tea estate and enjoy the evening at your stay." },
      { title: "Ratargul and back", text: "Visit the swamp forest by boat when conditions allow, then return to Dhaka." },
    ],
  },
  {
    id: 103,
    title: "Blue Coast Camping Escape",
    place: "Cox\u2019s Bazar",
    days: 2,
    nights: 1,
    price: 3800,
    oldPrice: null,
    maxTravelers: 20,
    image: "/images/packages/coxsbazar-camping.jpg",
    summary: "A beachside camp, a bonfire evening and salty morning air.",
    includes: ["Bus transport", "Camping accommodation", "Bonfire evening", "Breakfast"],
    itinerary: [
      { title: "Arrive and set up camp", text: "Check in to camp and walk to the beach for sunset." },
      { title: "Slow beach morning", text: "Breakfast by the sea, free time and the journey home." },
    ],
  },
  {
    id: 104,
    title: "Bandarban Scenic Highlands",
    place: "Bandarban",
    days: 4,
    nights: 3,
    price: 7900,
    oldPrice: 8900,
    maxTravelers: 10,
    image: "/images/packages/nilgiri.jpg",
    summary: "Mountain viewpoints, winding roads and the best of the Hill Tracts.",
    includes: ["Transport", "3 nights stay", "Breakfast", "Planned sightseeing"],
    itinerary: [
      { title: "Journey to the hills", text: "Travel to Bandarban and settle in." },
      { title: "Viewpoints", text: "Visit mountain viewpoints and nearby spots." },
      { title: "Flexible day", text: "Explore local markets or relax. Your choice." },
      { title: "Return", text: "Breakfast and the journey back to Dhaka." },
    ],
  },
  {
    id: 105,
    title: "Kaptai Lake Slow Living",
    place: "Kaptai & Rangamati",
    days: 3,
    nights: 2,
    price: 5600,
    oldPrice: null,
    maxTravelers: 12,
    image: "/images/packages/kaptai.jpg",
    summary: "Lake views, boat rides and an easygoing stay among green hills.",
    includes: ["Transport", "2 nights stay", "Breakfast", "Lake boat excursion"],
    itinerary: [
      { title: "Lakeside arrival", text: "Travel to Rangamati and enjoy the water view." },
      { title: "On the lake", text: "A boat outing across the lake at your own pace." },
      { title: "Return", text: "Breakfast, free time and the journey home." },
    ],
  },
  {
    id: 106,
    title: "Saint Martin Island Blue Days",
    place: "Saint Martin\u2019s Island",
    days: 3,
    nights: 2,
    price: 7200,
    oldPrice: 8200,
    maxTravelers: 16,
    image: "/images/packages/saintmartin.jpg",
    summary: "A seasonal island break with clear water and unhurried days.",
    includes: ["Travel coordination", "2 nights stay", "Breakfast", "Island orientation"],
    itinerary: [
      { title: "Coast and crossing", text: "Travel to the coast and continue to the island, subject to seasonal transport." },
      { title: "Island day", text: "Walk the shoreline, swim where it is safe and enjoy free time." },
      { title: "Return", text: "Return travel according to the ferry schedule." },
    ],
  },
  {
    id: 107,
    title: "Sundarbans River and Mangrove",
    place: "Sundarbans",
    days: 3,
    nights: 2,
    price: 6400,
    oldPrice: null,
    maxTravelers: 14,
    image: "/images/packages/sundarbans.jpg",
    summary: "Cruise the mangrove channels and learn how this forest works.",
    includes: ["Boat journey", "2 nights on board or nearby", "Meals as listed", "Planned nature activities"],
    itinerary: [
      { title: "Board and settle", text: "Travel to the region and settle into the boat." },
      { title: "Into the channels", text: "Explore the waterways with planned stops and wildlife watching." },
      { title: "Return", text: "Journey back to the mainland." },
    ],
  },
];

export const DEMO_TOURS: Tour[] = DEMO.map((t) => {
  const p = placeFor(t.place);
  return {
    ...t,
    kind: p?.kind ?? "Nature",
    region: p?.region ?? "Bangladesh",
    gallery: p?.gallery ?? [t.image],
    categories: [p?.kind ?? "Nature"],
    hotels: [],
    live: false,
  };
});

function defaultIncludes(nights: number): string[] {
  const out = ["A planned day-by-day itinerary", "Trip coordination before and during travel"];
  if (nights > 0) out.unshift(`${nights} night${nights > 1 ? "s" : ""} of accommodation`);
  return out;
}

export function tourFromPackage(p: Package): Tour {
  const dest = p.destination?.name ?? "Bangladesh";
  const place = placeFor(dest);
  const image = p.image_url || place?.image || "/hero/rangamati.jpg";
  const gallery = Array.from(new Set([image, ...(place?.gallery ?? [])]));
  const cats = p.categories?.map((c) => c.category_name) ?? [];
  const kind = (TOUR_KINDS as readonly string[]).find((k) => cats.some((c) => c.toLowerCase().includes(k.toLowerCase()))) ?? place?.kind ?? "Nature";
  return {
    id: p.id,
    title: p.title,
    place: dest,
    region: p.destination?.location || place?.region || dest,
    kind,
    categories: cats.length ? cats : [kind],
    days: p.duration_days,
    nights: p.duration_nights,
    price: Number(p.price) || 0,
    oldPrice: null,
    maxTravelers: p.max_travelers,
    image,
    gallery,
    summary: p.description || place?.desc || "A trip planned and coordinated by HikKing.",
    includes: defaultIncludes(p.duration_nights),
    itinerary: (p.itineraries ?? []).map((i) => ({ title: i.title, text: i.description ?? "" })),
    hotels: p.hotels ?? [],
    live: true,
  };
}

/** "Best months" helper for the season picker */
export function placesForMonth(month: number): Place[] {
  return PLACES.filter((p) => p.months.includes(month));
}

/** Rough Bangladesh outline (lon, lat) used by the interactive map */
export const BD_OUTLINE: [number, number][] = [
  [88.08, 26.38], [88.35, 26.46], [88.69, 26.3], [88.95, 26.24], [89.06, 26.35], [89.45, 26.2], [89.7, 26.18],
  [89.8, 25.85], [89.83, 25.3], [90.2, 25.2], [90.65, 25.15], [91.02, 25.2], [91.45, 25.17], [91.9, 25.18],
  [92.25, 25.0], [92.38, 24.6], [92.12, 24.35], [92.03, 24.1], [91.95, 23.68], [91.85, 23.7], [91.74, 23.4],
  [91.6, 23.25], [91.55, 23.0], [91.7, 22.9], [92.07, 23.04], [92.28, 23.28], [92.45, 23.1], [92.6, 22.7],
  [92.68, 22.05], [92.38, 21.35], [92.25, 20.9], [92.15, 20.76], [91.98, 21.1], [91.88, 21.3], [91.75, 21.58],
  [91.63, 22.2], [91.4, 22.5], [91.0, 22.5], [90.8, 22.1], [90.6, 22.0], [90.15, 22.05], [89.75, 21.85],
  [89.4, 21.85], [89.05, 21.9], [88.9, 22.05], [88.75, 22.4], [88.88, 22.8], [88.65, 23.2], [88.88, 23.5],
  [88.75, 23.9], [88.35, 24.5], [88.2, 24.62], [88.4, 25.2], [88.15, 25.75], [88.08, 26.38],
];

/** Turns [10,11,12,1,2,3] into "Oct to Mar" (handles year wrap) */
export function seasonRange(months: number[]) {
  const sorted = [...months].sort((a, b) => a - b);
  // find the wrapped run that starts after a gap
  let start = sorted[0];
  for (let i = 0; i < sorted.length; i++) {
    const prev = sorted[(i + sorted.length - 1) % sorted.length];
    if ((sorted[i] - prev + 12) % 12 !== 1) {
      start = sorted[i];
      break;
    }
  }
  const out: number[] = [];
  for (let k = 0; k < 12; k++) {
    const m = ((start - 1 + k) % 12) + 1;
    if (sorted.includes(m)) out.push(m);
    else if (out.length) break;
  }
  return out.length > 1 ? `${MONTHS[out[0] - 1]} to ${MONTHS[out[out.length - 1] - 1]}` : MONTHS[out[0] - 1];
}

