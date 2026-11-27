export const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "traveler" | "admin";
};

const TOKEN_KEY = "hikking_token";
const USER_KEY = "hikking_user";

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

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("hk-session"));
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("hk-session"));
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ------------------------------------------------------------------ */
/* Request helper                                                      */
/* ------------------------------------------------------------------ */

type ReqOpts = { method?: string; body?: unknown; auth?: boolean };

async function errorMessage(res: Response, fallback: string): Promise<string> {
  const err = await res.json().catch(() => null);
  if (err?.errors && typeof err.errors === "object") {
    const first = Object.values(err.errors)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
  }
  return err?.message || fallback;
}

async function req<T>(
  path: string,
  opts: ReqOpts = {},
  fallback = "Something went wrong",
): Promise<T> {
  const { method = "GET", body, auth = method !== "GET" } = opts;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) Object.assign(headers, authHeaders());
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await errorMessage(res, fallback));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function registerUser(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}): Promise<{ user: User; token: string }> {
  return req(
    "/register",
    { method: "POST", body: data, auth: false },
    "Could not create your account",
  );
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  return req(
    "/login",
    { method: "POST", body: data, auth: false },
    "Email or password is incorrect",
  );
}

export async function logoutUser() {
  try {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: { Accept: "application/json", ...authHeaders() },
    });
  } finally {
    clearToken();
    clearUser();
  }
}

export async function getMe(): Promise<User> {
  return req("/me", { auth: true }, "Could not load your account");
}

export async function updateProfile(data: {
  name: string;
  phone: string | null;
}): Promise<User> {
  return req(
    "/me",
    { method: "PUT", body: data },
    "Could not save your profile",
  );
}

export async function changePassword(data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  return req(
    "/me/password",
    { method: "PUT", body: data },
    "Could not change your password",
  );
}

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */

export type Destination = {
  destination_id: number;
  name: string;
  description: string | null;
  location: string | null;
};

export const getDestinations = () =>
  req<Destination[]>("/destinations", {}, "Could not load destinations");
export const getDestination = (id: number) =>
  req<Destination>(`/destinations/${id}`, {}, "Could not load destination");
export const createDestination = (data: Partial<Destination>) =>
  req<Destination>(
    "/destinations",
    { method: "POST", body: data },
    "Could not create destination",
  );
export const updateDestination = (id: number, data: Partial<Destination>) =>
  req<Destination>(
    `/destinations/${id}`,
    { method: "PUT", body: data },
    "Could not update destination",
  );
export const deleteDestination = (id: number) =>
  req(
    `/destinations/${id}`,
    { method: "DELETE" },
    "Could not delete destination",
  );

/* ------------------------------------------------------------------ */
/* Hotels                                                              */
/* ------------------------------------------------------------------ */

export type Hotel = {
  hotel_id: number;
  hotel_name: string;
  address: string | null;
  star_rating: number | null;
};

export const getHotels = () =>
  req<Hotel[]>("/hotels", {}, "Could not load stays");
export const getHotel = (id: number) =>
  req<Hotel>(`/hotels/${id}`, {}, "Could not load stay");
export const createHotel = (data: Partial<Hotel>) =>
  req<Hotel>(
    "/hotels",
    { method: "POST", body: data },
    "Could not create hotel",
  );
export const updateHotel = (id: number, data: Partial<Hotel>) =>
  req<Hotel>(
    `/hotels/${id}`,
    { method: "PUT", body: data },
    "Could not update hotel",
  );
export const deleteHotel = (id: number) =>
  req(`/hotels/${id}`, { method: "DELETE" }, "Could not delete hotel");

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export type Category = {
  category_id: number;
  category_name: string;
};

export const getCategories = () =>
  req<Category[]>("/categories", {}, "Could not load categories");
export const createCategory = (category_name: string) =>
  req<Category>(
    "/categories",
    { method: "POST", body: { category_name } },
    "Could not create category",
  );
export const updateCategory = (id: number, category_name: string) =>
  req<Category>(
    `/categories/${id}`,
    { method: "PUT", body: { category_name } },
    "Could not update category",
  );
export const deleteCategory = (id: number) =>
  req(`/categories/${id}`, { method: "DELETE" }, "Could not delete category");

/* ------------------------------------------------------------------ */
/* Packages (tours)                                                    */
/* ------------------------------------------------------------------ */

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
  title: string;
  description: string | null;
  duration_days: number;
  duration_nights: number;
  price: number;
  max_travelers: number | null;
  status: "draft" | "published" | "archived";
  image_url: string | null;
  destination?: Destination;
  itineraries?: PackageItinerary[];
  categories?: Category[];
  hotels?: Hotel[];
};

export type PackageInput = {
  destination_id: number;
  title: string;
  description?: string;
  duration_days: number;
  duration_nights?: number;
  price: number;
  max_travelers?: number;
  status?: string;
  image_url?: string;
};

export const getPackages = () =>
  req<Package[]>("/packages", {}, "Could not load tours");
export const getPackage = (id: number) =>
  req<Package>(`/packages/${id}`, {}, "Could not load this tour");
export const createPackage = (data: PackageInput) =>
  req<Package>(
    "/packages",
    { method: "POST", body: data },
    "Could not create tour",
  );
export const updatePackage = (id: number, data: Partial<PackageInput>) =>
  req<Package>(
    `/packages/${id}`,
    { method: "PUT", body: data },
    "Could not update tour",
  );
export const deletePackage = (id: number) =>
  req(`/packages/${id}`, { method: "DELETE" }, "Could not delete tour");
export const syncPackageCategories = (id: number, category_ids: number[]) =>
  req(
    `/packages/${id}/categories`,
    { method: "POST", body: { category_ids } },
    "Could not update categories",
  );
export const syncPackageHotels = (id: number, hotel_ids: number[]) =>
  req(
    `/packages/${id}/hotels`,
    { method: "POST", body: { hotel_ids } },
    "Could not update stays",
  );
export const syncPackageItinerary = (
  id: number,
  itinerary: { day_number: number; title: string; description?: string }[],
) =>
  req(
    `/packages/${id}/itinerary`,
    { method: "POST", body: { itinerary } },
    "Could not update itinerary",
  );

/* ------------------------------------------------------------------ */
/* Bookings (reservation requests)                                     */
/* ------------------------------------------------------------------ */

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Booking = {
  booking_id: number;
  traveler_id: number;
  package_id: number;
  travel_date: string;
  total_travelers: number;
  total_price: number;
  booking_status: BookingStatus;
  created_at?: string;
  package?: Package;
  traveler?: User;
  payments?: Payment[];
};

export const getBookings = (mine?: boolean) =>
  req<Booking[]>(
    `/bookings${mine ? "?mine=1" : ""}`,
    { auth: true },
    "Could not load reservations",
  );
export const getBooking = (id: number) =>
  req<Booking>(`/bookings/${id}`, { auth: true }, "Could not load reservation");
export const createBooking = (data: {
  package_id: number;
  travel_date: string;
  total_travelers: number;
}) =>
  req<Booking>(
    "/bookings",
    { method: "POST", body: data },
    "Could not send your reservation request",
  );
export const updateBookingStatus = (id: number, booking_status: string) =>
  req<Booking>(
    `/bookings/${id}`,
    { method: "PUT", body: { booking_status } },
    "Could not update reservation",
  );
export const deleteBooking = (id: number) =>
  req(`/bookings/${id}`, { method: "DELETE" }, "Could not delete reservation");

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export type Review = {
  review_id: number;
  booking_id: number;
  traveler_id: number;
  package_id: number;
  rating: number;
  comment: string | null;
  created_at?: string;
  traveler?: User;
  package?: Package;
};

export const getReviews = (package_id?: number) =>
  req<Review[]>(
    `/reviews${package_id ? `?package_id=${package_id}` : ""}`,
    {},
    "Could not load reviews",
  );
export const createReview = (data: {
  booking_id: number;
  rating: number;
  comment?: string;
}) =>
  req<Review>(
    "/reviews",
    { method: "POST", body: data },
    "Could not post your review",
  );

/* ------------------------------------------------------------------ */
/* Complaints                                                          */
/* ------------------------------------------------------------------ */

export type Complaint = {
  complaint_id: number;
  booking_id: number;
  user_id: number;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "rejected";
  created_at?: string;
  booking?: Booking;
  user?: User;
};

export const getComplaints = (mine?: boolean) =>
  req<Complaint[]>(
    `/complaints${mine ? "?mine=1" : ""}`,
    { auth: true },
    "Could not load support requests",
  );
export const createComplaint = (data: {
  booking_id: number;
  subject: string;
}) =>
  req<Complaint>(
    "/complaints",
    { method: "POST", body: data },
    "Could not send your request",
  );
export const updateComplaintStatus = (id: number, status: string) =>
  req<Complaint>(
    `/complaints/${id}`,
    { method: "PUT", body: { status } },
    "Could not update request",
  );

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export type Notification = {
  notification_id: number;
  user_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at?: string;
};

export const getNotifications = () =>
  req<Notification[]>(
    "/notifications",
    { auth: true },
    "Could not load notifications",
  );
export const markNotificationRead = (id: number) =>
  req(
    `/notifications/${id}/read`,
    { method: "POST" },
    "Could not update notification",
  );
export const deleteNotification = (id: number) =>
  req(
    `/notifications/${id}`,
    { method: "DELETE" },
    "Could not remove notification",
  );

/* ------------------------------------------------------------------ */
/* Payments (local checkout records)                                    */
/* ------------------------------------------------------------------ */

export type PaymentMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "visa"
  | "mastercard"
  | "amex"
  | "bank_transfer"
  | "cash";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Payment = {
  payment_id: number;
  booking_id: number;
  transaction_id: string;
  amount: number | string;
  payment_method: PaymentMethod;
  payer_account: string | null;
  payment_status: PaymentStatus;
  paid_at: string | null;
  created_at?: string;
  booking?: Booking;
};

export const getBookingPayments = (bookingId: number) =>
  req<Payment[]>(
    `/bookings/${bookingId}/payments`,
    { auth: true },
    "Could not load payment records",
  );

export const createPayment = (
  bookingId: number,
  data: {
    payment_method: PaymentMethod;
    payer_account?: string;
  },
) =>
  req<Payment>(
    `/bookings/${bookingId}/payments`,
    { method: "POST", body: data },
    "Could not record payment",
  );

export const getPayments = () =>
  req<Payment[]>("/payments", { auth: true }, "Could not load payment records");

export const updatePaymentStatus = (
  paymentId: number,
  payment_status: PaymentStatus,
) =>
  req<Payment>(
    `/payments/${paymentId}`,
    { method: "PUT", body: { payment_status } },
    "Could not update payment status",
  );
