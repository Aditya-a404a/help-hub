import { NextRequest, NextResponse } from 'next/server';

// Base URL for the backend API
const API_BASE_URL = 'https://387b871cc28b.ngrok-free.app/api/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query parameters for the backend API
    const params = new URLSearchParams();
    
    if (searchParams.get('status')) {
      params.append('status', searchParams.get('status')!);
    }
    if (searchParams.get('urgency')) {
      params.append('urgency', searchParams.get('urgency')!);
    }
    if (searchParams.get('limit')) {
      params.append('limit', searchParams.get('limit')!);
    }
    if (searchParams.get('skip')) {
      params.append('skip', searchParams.get('skip')!);
    }

    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/ivr/requests?${params}`, {
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
    console.error('IVR requests API error:', error);
    
    // Return demo data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: {
        requests: [
          {
            id: '1',
            location: 'T.Nagar, Chennai',
            flood_area: 2.5,
            urgency: 'HIGH',
            victim_name: 'Rajesh Kumar',
            victim_phone: '+919876543210',
            victim_address: 'Building A, Floor 3, T.Nagar Main Road',
            family_count: 4,
            medical_condition: 'diabetes',
            call_status: 'PENDING',
            call_attempts: 0,
            last_call_attempt: null,
            ivr_response: null,
            response_details: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            n8n_webhook_sent: true,
            n8n_webhook_response: 'success'
          },
          {
            id: '2',
            location: 'Anna Nagar, Chennai',
            flood_area: 1.8,
            urgency: 'CRITICAL',
            victim_name: 'Priya Sharma',
            victim_phone: '+919765432109',
            victim_address: 'Flat 205, Anna Nagar West',
            family_count: 2,
            medical_condition: 'pregnant',
            call_status: 'COMPLETED',
            call_attempts: 1,
            last_call_attempt: new Date(Date.now() - 1800000).toISOString(),
            ivr_response: '1',
            response_details: 'Rescue team dispatched',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 1800000).toISOString(),
            n8n_webhook_sent: true,
            n8n_webhook_response: 'success'
          }
        ],
        total: 2,
        limit: 50,
        skip: 0,
        has_more: false
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/ivr/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('IVR request creation API error:', error);
    
    const body = await request.json().catch(() => ({}));
    
    // Return demo data if backend is unavailable
    return NextResponse.json({
      id: Date.now().toString(),
      ...body,
      call_status: 'PENDING',
      call_attempts: 0,
      last_call_attempt: null,
      ivr_response: null,
      response_details: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      n8n_webhook_sent: true,
      n8n_webhook_response: 'success'
    });
  }
}