import { NextRequest, NextResponse } from "next/server";

// Base URL for the backend API
const API_BASE_URL = "http://localhost:8000/api/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query parameters for the backend API
    const params = new URLSearchParams();

    if (searchParams.get("latitude")) {
      params.append("latitude", searchParams.get("latitude")!);
    }
    if (searchParams.get("longitude")) {
      params.append("longitude", searchParams.get("longitude")!);
    }
    if (searchParams.get("radius_km")) {
      params.append("radius_km", searchParams.get("radius_km")!);
    }
    if (searchParams.get("amenity_type")) {
      params.append("amenity_type", searchParams.get("amenity_type")!);
    }
    if (searchParams.get("limit")) {
      params.append("limit", searchParams.get("limit")!);
    }

    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/amenities/nearby?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Nearby amenities API error:", error);

    // Return demo data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: [
        {
          _id: "1",
          name: "Chennai General Hospital",
          amenity_type: "hospital",
          leisure_type: "medical",
          status: "operational",
          latitude: 13.048,
          longitude: 80.281,
          distance: 0.5,
          resources: {
            beds: 500,
            doctors: 50,
            ambulances: 10,
          },
          last_updated: new Date().toISOString(),
        },
        {
          _id: "2",
          name: "T.Nagar Police Station",
          amenity_type: "police",
          leisure_type: "security",
          status: "operational",
          latitude: 13.0368,
          longitude: 80.2404,
          distance: 1.2,
          resources: {
            officers: 25,
            vehicles: 5,
            emergency_contacts: 3,
          },
          last_updated: new Date().toISOString(),
        },
      ],
      total: 2,
      limit: 20,
      has_more: false,
    });
  }
}
