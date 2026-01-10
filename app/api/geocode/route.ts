import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "DhikrApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.address) {
      throw new Error("No address information found");
    }

    const address = data.address;

    // Extract city name - try different field names
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.hamlet ||
      address.suburb ||
      "Unknown City";

    const state = address.state || address.region || address.province;
    const country = address.country || "Unknown Country";
    const countryCode = address.country_code?.toUpperCase() || "";

    // Create formatted address for display
    let formattedAddress = city;
    if (state && state !== city) {
      formattedAddress += `, ${state}`;
    }
    if (country && country !== city) {
      formattedAddress += `, ${country}`;
    }

    return NextResponse.json({
      city,
      state,
      country,
      countryCode,
      formattedAddress,
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to determine location from coordinates" },
      { status: 500 }
    );
  }
}
