import { NextResponse } from 'next/server';

// Base URL for the backend API
const API_BASE_URL = 'https://387b871cc28b.ngrok-free.app/api/v1';

export async function GET() {
  try {
    // Make request to backend API
    const response = await fetch(`${API_BASE_URL}/social-media/stats`, {
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
    console.error('Social media stats API error:', error);
    
    // Return demo data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: {
        total_posts: 1250,
        sos_posts: 45,
        emergency_posts: 89,
        high_urgency_posts: 67,
        critical_urgency_posts: 23,
        posts_last_24h: 156,
        posts_last_hour: 12,
        top_locations: ['Chennai', 'T.Nagar', 'Anna Nagar'],
        top_hashtags: ['ChennaiFloods', 'Emergency', 'Help']
      }
    });
  }
}