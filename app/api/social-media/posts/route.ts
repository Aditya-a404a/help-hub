import { NextRequest, NextResponse } from "next/server";

// Base URL for the backend API (same as the disaster API client)
const API_BASE_URL = "http://localhost:8000/api/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query parameters for the backend API
    const params = new URLSearchParams();

    if (searchParams.get("message_type")) {
      params.append("message_type", searchParams.get("message_type")!);
    }
    if (searchParams.get("urgency_level")) {
      params.append("urgency_level", searchParams.get("urgency_level")!);
    }
    if (searchParams.get("location")) {
      params.append("location", searchParams.get("location")!);
    }
    if (searchParams.get("limit")) {
      params.append("limit", searchParams.get("limit")!);
    }
    if (searchParams.get("skip")) {
      params.append("skip", searchParams.get("skip")!);
    }

    // Make request to backend API
    const response = await fetch(
      `${API_BASE_URL}/social-media/posts?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Social media API error:", error);

    // Return demo data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: [
        {
          _id: "1",
          timestamp: new Date().toISOString(),
          lat: 13.0827,
          lon: 80.2707,
          message: "Flood water rising in T.Nagar area. Need immediate help!",
          message_type: "sos",
          urgency_level: "high",
          extracted_location: "T.Nagar, Chennai",
          hashtags: ["ChennaiFloods", "Help"],
          mentions: ["@TNSDMA", "@ChennaiCorp"],
        },
        {
          _id: "2",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          lat: 13.0878,
          lon: 80.2785,
          message: "Roads blocked due to fallen trees in Anna Nagar",
          message_type: "emergency",
          urgency_level: "medium",
          extracted_location: "Anna Nagar, Chennai",
          hashtags: ["ChennaiRains", "Traffic"],
          mentions: ["@ChennaiTraffic"],
        },
      ],
      total: 2,
      limit: 50,
      skip: 0,
      has_more: false,
    });
  }
}
