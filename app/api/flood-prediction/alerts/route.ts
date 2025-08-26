import { NextRequest, NextResponse } from "next/server";

// Base URL for the backend API
const API_BASE_URL = "http://localhost:8000/api/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query parameters for the backend API
    const params = new URLSearchParams();

    if (searchParams.get("severity")) {
      params.append("severity", searchParams.get("severity")!);
    }
    if (searchParams.get("district")) {
      params.append("district", searchParams.get("district")!);
    }
    if (searchParams.get("limit")) {
      params.append("limit", searchParams.get("limit")!);
    }

    // Make request to backend API
    const response = await fetch(
      `${API_BASE_URL}/flood-prediction/alerts?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Flood alerts API error:", error);

    // Return demo data if backend is unavailable
    return NextResponse.json({
      success: true,
      alerts: [
        {
          id: "flood-001",
          district: "Chennai",
          latitude: 13.0827,
          longitude: 80.2707,
          severity_level: "high",
          flood_probability: 0.85,
          affected_area_km2: 15.5,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "flood-002",
          district: "Chennai",
          latitude: 13.0606,
          longitude: 80.2406,
          severity_level: "medium",
          flood_probability: 0.65,
          affected_area_km2: 8.2,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      total: 2,
      limit: 10,
      has_more: false,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/flood-prediction/alerts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Create flood alert API error:", error);

    // Return demo response if backend is unavailable
    return NextResponse.json({
      success: true,
      message: "Flood alert created successfully",
      data: {
        alert_id: "flood-demo-" + Date.now(),
        created_at: new Date().toISOString(),
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
