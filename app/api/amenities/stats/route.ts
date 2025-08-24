import { NextResponse } from 'next/server';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function GET() {
  try {
    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/amenities/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Amenities stats API error:', error);
    
    // Return demo data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: {
        total_amenities: 250,
        operational_amenities: 230,
        hospitals: 15,
        schools: 45,
        police_stations: 12,
        fire_stations: 8,
        shelters: 20,
        average_distance_km: 2.5
      }
    });
  }
}
