import { NextRequest, NextResponse } from 'next/server';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query parameters for the backend API
    const params = new URLSearchParams();
    
    if (searchParams.get('status')) {
      params.append('status', searchParams.get('status')!);
    }
    if (searchParams.get('location')) {
      params.append('location', searchParams.get('location')!);
    }
    if (searchParams.get('limit')) {
      params.append('limit', searchParams.get('limit')!);
    }
    if (searchParams.get('skip')) {
      params.append('skip', searchParams.get('skip')!);
    }

    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/relief-centers?${params}`, {
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
    console.error('Relief centers API error:', error);
    
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
          status: "active"
        }
      ],
      total: 2,
      limit: 50,
      skip: 0,
      has_more: false
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/relief-centers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Relief center creation API error:', error);
    
    const body = await request.json().catch(() => ({}));
    
    // Return demo data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: {
        id: Date.now().toString(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  }
}
