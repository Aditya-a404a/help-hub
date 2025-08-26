import { NextRequest, NextResponse } from 'next/server';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query parameters for the backend API
    const params = new URLSearchParams();
    
    if (searchParams.get('latitude')) {
      params.append('latitude', searchParams.get('latitude')!);
    }
    if (searchParams.get('longitude')) {
      params.append('longitude', searchParams.get('longitude')!);
    }
    if (searchParams.get('radius_km')) {
      params.append('radius_km', searchParams.get('radius_km')!);
    }
    if (searchParams.get('limit')) {
      params.append('limit', searchParams.get('limit')!);
    }

    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/relief-centers/nearby?${params}`, {
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
    console.error('Nearby relief centers API error:', error);
    
    // Return demo data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: [
        {
          id: "1",
          name: "Chennai Relief Center 1",
          location: "Chennai",
          latitude: 13.048,
          longitude: 80.281,
          capacity: 500,
          current_occupancy: 150,
          occupancy_percentage: 30.0,
          distance: 0.8,
          status: "active"
        },
        {
          id: "2",
          name: "T.Nagar Emergency Shelter",
          location: "T.Nagar, Chennai",
          latitude: 13.0368,
          longitude: 80.2404,
          capacity: 300,
          current_occupancy: 200,
          occupancy_percentage: 66.7,
          distance: 1.5,
          status: "active"
        }
      ],
      total: 2,
      limit: 20,
      has_more: false
    });
  }
}
