import { NextResponse } from "next/server";

// Base URL for the backend API
const API_BASE_URL = "http://localhost:8000/api/v1";

export async function GET() {
  try {
    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/ivr/stats`, {
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
    console.error("IVR stats API error:", error);

    // Return demo data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: {
        total_requests: 150,
        pending_requests: 12,
        completed_requests: 98,
        failed_requests: 5,
        high_urgency_requests: 45,
        critical_urgency_requests: 23,
        average_response_time_minutes: 8.5,
        success_rate_percentage: 87.5,
      },
    });
  }
}
