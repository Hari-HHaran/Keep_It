const GOOGLE_PLACES_URL =
  "https://places.googleapis.com/v1/places:searchText";

export async function findMerchantOnGoogleMaps({
  merchantName,
  address,
  latitude,
  longitude,
}) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GOOGLE_MAPS_API_KEY");
  }

  if (!merchantName || !merchantName.trim()) {
    return null;
  }

  let textQuery = merchantName.trim();

  if (address) {
    textQuery += `, ${address}`;
  }

  const requestBody = {
    textQuery,
    regionCode: "SG",
    languageCode: "en",
  };

  /*
   * If the transaction contains location information,
   * tell Google to search around that location.
   */
  if (
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null
  ) {
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        radius: 1000,
      },
    };
  }

  const response = await fetch(GOOGLE_PLACES_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.types,places.primaryType",
    },

    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Google Places API error: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  if (!data.places || data.places.length === 0) {
    return null;
  }

  const place = data.places[0];

  return {
    placeId: place.id || null,

    name: place.displayName?.text || null,

    address: place.formattedAddress || null,

    primaryType: place.primaryType || null,

    types: place.types || [],
  };
}