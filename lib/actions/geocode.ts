interface GeocodeResult {
  country: string;
  formattedAddress: string;
}

export async function getCountryFromCoordinates(
  lat: number,
  lng: number
): Promise<GeocodeResult> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    {
      headers: {
        "User-Agent": "TravelPlannerApp/1.0 (contact@travel-planner.local)",
      },
    }
  );

  const data = await response.json();
  const address = data.address || {};
  const country = address.country || "Unknown";
  const formattedAddress = data.display_name || `${lat}, ${lng}`;

  return {
    country,
    formattedAddress,
  };
}