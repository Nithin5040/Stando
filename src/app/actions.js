
'use server';

export async function searchLocations(query) {
  if (!query) return [];
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
    if (!response.ok) {
      throw new Error('Failed to fetch from Nominatim');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Location search error:", error);
    return [];
  }
}
