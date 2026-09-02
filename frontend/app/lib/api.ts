const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ---- Auth ----

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "traveler" | "guide" | "admin";
};

const TOKEN_KEY = "hikking_token";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role?: "traveler" | "guide";
}): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to register");
  }
  return res.json();
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Invalid credentials");
  }
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  clearToken();
  if (!res.ok) throw new Error("Failed to logout");
  return res.json();
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${API_URL}/me`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch current user");
  return res.json();
}

export type Destination = {
  destination_id: number;
  name: string;
  description: string | null;
  location: string | null;
};

export async function getDestinations(): Promise<Destination[]> {
  const res = await fetch(`${API_URL}/destinations`);
  if (!res.ok) throw new Error("Failed to fetch destinations");
  return res.json();
}

export async function getDestination(id: number): Promise<Destination> {
  const res = await fetch(`${API_URL}/destinations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch destination");
  return res.json();
}

export async function createDestination(data: Partial<Destination>) {
  const res = await fetch(`${API_URL}/destinations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create destination");
  return res.json();
}

export async function updateDestination(
  id: number,
  data: Partial<Destination>,
) {
  const res = await fetch(`${API_URL}/destinations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update destination");
  return res.json();
}

export async function deleteDestination(id: number) {
  const res = await fetch(`${API_URL}/destinations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete destination");
  return res.json();
}

export type Hotel = {
  hotel_id: number;
  hotel_name: string;
  address: string | null;
  star_rating: number | null;
};

export async function getHotels(): Promise<Hotel[]> {
  const res = await fetch(`${API_URL}/hotels`);
  if (!res.ok) throw new Error("Failed to fetch hotels");
  return res.json();
}

export async function getHotel(id: number): Promise<Hotel> {
  const res = await fetch(`${API_URL}/hotels/${id}`);
  if (!res.ok) throw new Error("Failed to fetch hotel");
  return res.json();
}

export async function createHotel(data: Partial<Hotel>) {
  const res = await fetch(`${API_URL}/hotels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create hotel");
  return res.json();
}

export async function updateHotel(id: number, data: Partial<Hotel>) {
  const res = await fetch(`${API_URL}/hotels/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update hotel");
  return res.json();
}

export async function deleteHotel(id: number) {
  const res = await fetch(`${API_URL}/hotels/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete hotel");
  return res.json();
}

// ---- Guide Profiles ----

export type GuideProfile = {
  id: number;
  user_id: number;
  bio: string | null;
  experience_years: number | null;
  rating_avg: number | null;
  verification_status: string;
  user?: User;
};

export async function getGuideProfiles(): Promise<GuideProfile[]> {
  const res = await fetch(`${API_URL}/guide-profiles`);
  if (!res.ok) throw new Error("Failed to fetch guide profiles");
  return res.json();
}

export async function getGuideProfile(id: number): Promise<GuideProfile> {
  const res = await fetch(`${API_URL}/guide-profiles/${id}`);
  if (!res.ok) throw new Error("Failed to fetch guide profile");
  return res.json();
}

export async function createGuideProfile(data: {
  user_id: number;
  bio?: string | null;
  experience_years?: number | null;
  verification_status?: string;
}) {
  const res = await fetch(`${API_URL}/guide-profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create guide profile");
  return res.json();
}

export async function updateGuideProfile(
  id: number,
  data: {
    bio?: string | null;
    experience_years?: number | null;
    verification_status?: string;
  },
) {
  const res = await fetch(`${API_URL}/guide-profiles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update guide profile");
  return res.json();
}

export async function deleteGuideProfile(id: number) {
  const res = await fetch(`${API_URL}/guide-profiles/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to delete guide profile");
  return res.json();
}

// Fetch users, optionally filtered by role (used to pick a "guide" user
// when linking a new guide profile in the admin panel)
export async function getUsers(role?: string): Promise<User[]> {
  const qs = role ? `?role=${role}` : "";
  const res = await fetch(`${API_URL}/users${qs}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// ---- Store current user alongside the token (avoids extra /me calls) ----

const USER_KEY = "hikking_user";

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

// ---- Categories ----

export type Category = {
  category_id: number;
  category_name: string;
};

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function createCategory(category_name: string) {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category_name }),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function updateCategory(id: number, category_name: string) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category_name }),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}

export async function deleteCategory(id: number) {
  const res = await fetch(`${API_URL}/categories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
}

// ---- Packages ----

export type PackageItinerary = {
  id: number;
  package_id: number;
  day_number: number;
  title: string;
  description: string | null;
};

export type Package = {
  id: number;
  destination_id: number;
  guide_profile_id: number | null;
  title: string;
  description: string | null;
  duration_days: number;
  duration_nights: number;
  price: number;
  max_travelers: number | null;
  status: "draft" | "published" | "archived";
  image_url: string | null;
  destination?: Destination;
  guideProfile?: GuideProfile;
  itineraries?: PackageItinerary[];
  categories?: Category[];
  hotels?: Hotel[];
};

export async function getPackages(): Promise<Package[]> {
  const res = await fetch(`${API_URL}/packages`);
  if (!res.ok) throw new Error("Failed to fetch packages");
  return res.json();
}

export async function getPackage(id: number): Promise<Package> {
  const res = await fetch(`${API_URL}/packages/${id}`);
  if (!res.ok) throw new Error("Failed to fetch package");
  return res.json();
}

export async function createPackage(data: {
  destination_id: number;
  guide_profile_id: number;
  title: string;
  description?: string;
  duration_days: number;
  duration_nights?: number;
  price: number;
  max_travelers?: number;
  status?: string;
  image_url?: string;
}) {
  const res = await fetch(`${API_URL}/packages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create package");
  return res.json();
}

export async function updatePackage(id: number, data: Partial<Package>) {
  const res = await fetch(`${API_URL}/packages/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update package");
  return res.json();
}

export async function deletePackage(id: number) {
  const res = await fetch(`${API_URL}/packages/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to delete package");
  return res.json();
}

export async function syncPackageCategories(id: number, category_ids: number[]) {
  const res = await fetch(`${API_URL}/packages/${id}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ category_ids }),
  });
  if (!res.ok) throw new Error("Failed to update package categories");
  return res.json();
}

export async function syncPackageHotels(id: number, hotel_ids: number[]) {
  const res = await fetch(`${API_URL}/packages/${id}/hotels`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ hotel_ids }),
  });
  if (!res.ok) throw new Error("Failed to update package hotels");
  return res.json();
}

export async function syncPackageItinerary(
  id: number,
  itinerary: { day_number: number; title: string; description?: string }[],
) {
  const res = await fetch(`${API_URL}/packages/${id}/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ itinerary }),
  });
  if (!res.ok) throw new Error("Failed to update package itinerary");
  return res.json();
}

// ---- Bookings ----

export type Booking = {
  booking_id: number;
  traveler_id: number;
  package_id: number;
  travel_date: string;
  total_travelers: number;
  total_price: number;
  booking_status: "pending" | "confirmed" | "cancelled" | "completed";
  package?: Package;
  traveler?: User;
  payment?: Payment;
  review?: Review;
};

export async function getBookings(mine?: boolean): Promise<Booking[]> {
  const qs = mine ? "?mine=1" : "";
  const res = await fetch(`${API_URL}/bookings${qs}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function getBooking(id: number): Promise<Booking> {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
}

export async function createBooking(data: {
  package_id: number;
  travel_date: string;
  total_travelers: number;
}) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to create booking");
  }
  return res.json();
}

export async function updateBookingStatus(id: number, booking_status: string) {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ booking_status }),
  });
  if (!res.ok) throw new Error("Failed to update booking");
  return res.json();
}

export async function deleteBooking(id: number) {
  const res = await fetch(`${API_URL}/bookings/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to delete booking");
  return res.json();
}

// ---- Payments ----

export type Payment = {
  payment_id: number;
  booking_id: number;
  transaction_id: string;
  amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  booking?: Booking;
};

export async function getPayments(mine?: boolean): Promise<Payment[]> {
  const qs = mine ? "?mine=1" : "";
  const res = await fetch(`${API_URL}/payments${qs}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

export async function createPayment(booking_id: number) {
  const res = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ booking_id }),
  });
  if (!res.ok) throw new Error("Failed to process payment");
  return res.json();
}

export async function updatePaymentStatus(id: number, payment_status: string) {
  const res = await fetch(`${API_URL}/payments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ payment_status }),
  });
  if (!res.ok) throw new Error("Failed to update payment");
  return res.json();
}

// ---- Reviews ----

export type Review = {
  review_id: number;
  booking_id: number;
  traveler_id: number;
  package_id: number;
  rating: number;
  comment: string | null;
  traveler?: User;
  package?: Package;
};

export async function getReviews(package_id?: number): Promise<Review[]> {
  const qs = package_id ? `?package_id=${package_id}` : "";
  const res = await fetch(`${API_URL}/reviews${qs}`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function createReview(data: {
  booking_id: number;
  rating: number;
  comment?: string;
}) {
  const res = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to submit review");
  }
  return res.json();
}

// ---- Complaints ----

export type Complaint = {
  complaint_id: number;
  booking_id: number;
  user_id: number;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "rejected";
  booking?: Booking;
  user?: User;
};

export async function getComplaints(mine?: boolean): Promise<Complaint[]> {
  const qs = mine ? "?mine=1" : "";
  const res = await fetch(`${API_URL}/complaints${qs}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch complaints");
  return res.json();
}

export async function createComplaint(data: { booking_id: number; subject: string }) {
  const res = await fetch(`${API_URL}/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to file complaint");
  return res.json();
}

export async function updateComplaintStatus(id: number, status: string) {
  const res = await fetch(`${API_URL}/complaints/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update complaint");
  return res.json();
}

// ---- Notifications ----

export type Notification = {
  notification_id: number;
  user_id: number;
  type: string;
  message: string;
  is_read: boolean;
};

export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function markNotificationRead(id: number) {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "POST",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
  return res.json();
}

// ---- Verification Documents ----

export type VerificationDocument = {
  id: number;
  guide_profile_id: number;
  document_type: string;
  document_url: string;
  status: "pending" | "approved" | "rejected";
};

export async function getVerificationDocuments(
  guide_profile_id?: number,
): Promise<VerificationDocument[]> {
  const qs = guide_profile_id ? `?guide_profile_id=${guide_profile_id}` : "";
  const res = await fetch(`${API_URL}/verification-documents${qs}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function uploadVerificationDocument(data: {
  document_type: string;
  document_url: string;
}) {
  const res = await fetch(`${API_URL}/verification-documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to upload document");
  return res.json();
}

export async function updateVerificationDocumentStatus(id: number, status: string) {
  const res = await fetch(`${API_URL}/verification-documents/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update document status");
  return res.json();
}

// ---- Guide's own profile ----

export async function getMyGuideProfile(): Promise<GuideProfile> {
  const res = await fetch(`${API_URL}/guide-profiles-me`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to fetch your guide profile");
  return res.json();
}
