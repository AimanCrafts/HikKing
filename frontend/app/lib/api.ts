const API_URL = process.env.NEXT_PUBLIC_API_URL;


export type Destination = {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  is_active: boolean;
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


export async function updateDestination(id: number, data: Partial<Destination>) {
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