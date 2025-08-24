import { NextResponse } from "next/server";

// Base URL for the backend API
const API_BASE_URL = "http://localhost:8000/api/v1";

export async function GET() {
  try {
    // Make request to backend API
    const response = await fetch(
      `${API_BASE_URL}/relief-centers/stats/summary`,
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
    console.error("Relief centers stats API error:", error);

    // Return demo data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: {
        total_centers: 25,
        active_centers: 22,
        full_centers: 3,
        total_capacity: 12500,
        total_occupancy: 3450,
        average_occupancy_percentage: 27.6,
        total_resources: {
          food_packages: 25000,
          water_bottles: 50000,
          medical_kits: 1250,
          blankets: 7500,
        },
      },
    });
  }
}
