// Disaster Response API Client
// Integrates with the FastAPI backend

import { config } from './config';

const API_BASE_URL = config.disasterAPI.baseURL;

// Types based on the backend API documentation
export interface User {
  _id: string;
  email: string;
  username: string;
  full_name: string;
  district: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface SignupRequest {
  email: string;
  username: string;
  full_name: string;
  district: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    email: string;
    username: string;
    full_name: string;
  };
}

export interface Amenity {
  _id: string;
  name: string;
  amenity_type: string;
  leisure_type?: string;
  status: string;
  latitude: number;
  longitude: number;
  resources?: {
    beds?: number;
    doctors?: number;
    ambulances?: number;
    [key: string]: any;
  };
  last_updated: string;
}

export interface NearbyAmenitiesResponse {
  success: boolean;
  data: Array<{
    _id: string;
    name: string;
    amenity_type: string;
    latitude: number;
    longitude: number;
    distance_km: number;
    resources?: {
      beds?: number;
      doctors?: number;
      [key: string]: any;
    };
  }>;
  total: number;
  search_center: {
    latitude: number;
    longitude: number;
  };
  radius_km: number;
}

export interface ReliefCenter {
  id: string;
  name: string;
  district: string;
  address: string;
  contact_person: string;
  phone: string;
  capacity: number;
  current_occupancy: number;
  is_active: boolean;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at?: string;
}

export interface ReliefCentersResponse {
  success: boolean;
  data: ReliefCenter[];
  total: number;
}

export interface NearbyReliefCentersResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    district: string;
    address: string;
    capacity: number;
    current_occupancy: number;
    is_active: boolean;
    latitude: number;
    longitude: number;
    distance_km: number;
    availability: string;
  }>;
  total: number;
  search_center: {
    latitude: number;
    longitude: number;
  };
  radius_km: number;
}

export interface RouteRequest {
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  avoid_geojson?: {
    type: string;
    features: any[];
  };
  profile?: string;
  preference?: string;
}

export interface RouteResponse {
  success: boolean;
  route: {
    type: string;
    features: Array<{
      type: string;
      properties: {
        distance: number;
        duration: number;
      };
      geometry: {
        type: string;
        coordinates: number[][];
      };
    }>;
  };
  distance_km: number;
  duration_minutes: number;
  coordinates: number[][];
}

export interface SARAnalysisRequest {
  before_date: string;
  after_date: string;
  water_threshold?: number;
  region_bounds?: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  };
}

export interface SARAnalysisResponse {
  success: boolean;
  analysis: {
    before_date: string;
    after_date: string;
    water_change_percentage: number;
    new_water_pixels: number;
    total_pixels: number;
    flood_polygons: Array<{
      type: string;
      geometry: {
        type: string;
        coordinates: number[][][];
      };
      properties: {
        area_km2: number;
        confidence: number;
      };
    }>;
    severity_level: string;
    analysis_timestamp: string;
  };
}

export interface FloodPredictionRequest {
  latitude: number;
  longitude: number;
  date: string;
  water_threshold?: number;
}

export interface FloodPredictionResponse {
  success: boolean;
  prediction: {
    latitude: number;
    longitude: number;
    date: string;
    flood_probability: number;
    affected_area_km2: number;
    severity_level: string;
    geojson: {
      type: string;
      features: Array<{
        type: string;
        geometry: {
          type: string;
          coordinates: number[][][];
        };
      }>;
    };
    confidence: number;
    prediction_timestamp: string;
  };
}

export interface FloodAlert {
  id: string;
  latitude: number;
  longitude: number;
  district: string;
  severity_level: string;
  flood_probability: number;
  affected_area_km2: number;
  created_at: string;
  expires_at: string;
}

export interface FloodAlertsResponse {
  success: boolean;
  alerts: FloodAlert[];
  total: number;
}

// API Client Class
class DisasterAPIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    // Try to get token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('disaster_api_token');
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('disaster_api_token', token);
    }
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('disaster_api_token');
    }
  }

  // Get stored authentication token
  getStoredToken(): string | null {
    return this.token;
  }

  // Get authentication headers
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication APIs
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Auto-set token on successful login
    if (response.access_token) {
      this.setToken(response.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<{ success: boolean; data: User }> {
    return this.request<{ success: boolean; data: User }>('/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<{ success: boolean; message: string; data: { user_id: string; updated_fields: string[] } }> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Route Finder APIs
  async findRoute(data: RouteRequest): Promise<RouteResponse> {
    return this.request<RouteResponse>('/route-finder/route', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRouteAlternatives(data: RouteRequest & { alternatives: number }): Promise<{ success: boolean; alternatives: Array<{ route: any; distance_km: number; duration_minutes: number }> }> {
    return this.request('/route-finder/alternatives', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // SAR Analysis APIs
  async analyzeSAR(data: SARAnalysisRequest): Promise<SARAnalysisResponse> {
    return this.request<SARAnalysisResponse>('/sar-analysis/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAvailableSARImages(): Promise<{ success: boolean; images: Array<{ filename: string; date: string; size_mb: number; coverage: { min_lat: number; max_lat: number; min_lon: number; max_lon: number } }> }> {
    return this.request('/sar-analysis/available-images');
  }

  async getSARHistory(limit?: number, skip?: number): Promise<{ success: boolean; analyses: Array<{ id: string; before_date: string; after_date: string; water_change_percentage: number; severity_level: string; created_at: string }>; total: number; has_more: boolean }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (skip) params.append('skip', skip.toString());

    return this.request(`/sar-analysis/history?${params}`);
  }

  // Flood Prediction APIs
  async predictFlood(data: FloodPredictionRequest): Promise<FloodPredictionResponse> {
    return this.request<FloodPredictionResponse>('/flood-prediction/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFloodAlerts(severity?: string, district?: string, limit?: number): Promise<FloodAlertsResponse> {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (district) params.append('district', district);
    if (limit) params.append('limit', limit.toString());

    return this.request<FloodAlertsResponse>(`/flood-prediction/alerts?${params}`);
  }

  async createFloodAlert(data: Omit<FloodAlert, 'id' | 'created_at'>): Promise<{ success: boolean; message: string; data: { alert_id: string; created_at: string } }> {
    return this.request('/flood-prediction/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Amenities APIs
  async getAmenities(amenity_type?: string, status?: string, limit?: number, skip?: number): Promise<{ success: boolean; data: Amenity[]; total: number; limit: number; skip: number; has_more: boolean }> {
    const params = new URLSearchParams();
    if (amenity_type) params.append('amenity_type', amenity_type);
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    if (skip) params.append('skip', skip.toString());

    return this.request(`/amenities?${params}`);
  }

  async getNearbyAmenities(latitude: number, longitude: number, radius_km?: number, amenity_type?: string, limit?: number): Promise<NearbyAmenitiesResponse> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (radius_km) params.append('radius_km', radius_km.toString());
    if (amenity_type) params.append('amenity_type', amenity_type);
    if (limit) params.append('limit', limit.toString());

    return this.request<NearbyAmenitiesResponse>(`/amenities/nearby?${params}`);
  }

  async getAmenityDetails(amenity_id: string): Promise<{ success: boolean; data: Amenity & { address?: string; contact?: string; operating_hours?: string } }> {
    return this.request(`/amenities/${amenity_id}`);
  }

  // Relief Centers APIs
  async getReliefCenters(district?: string, active_only?: boolean): Promise<ReliefCentersResponse> {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (active_only !== undefined) params.append('active_only', active_only.toString());

    return this.request<ReliefCentersResponse>(`/relief-centers?${params}`);
  }

  async createReliefCenter(data: Omit<ReliefCenter, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; id: string; [key: string]: any }> {
    return this.request('/relief-centers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReliefCenter(center_id: string, data: Partial<ReliefCenter>): Promise<{ success: boolean; message: string; data: { center_id: string; updated_fields: string[] } }> {
    return this.request(`/relief-centers/${center_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getReliefCenterDetails(center_id: string): Promise<{ success: boolean; data: ReliefCenter }> {
    return this.request(`/relief-centers/${center_id}`);
  }

  async getNearbyReliefCenters(latitude: number, longitude: number, radius_km?: number, limit?: number): Promise<NearbyReliefCentersResponse> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (radius_km) params.append('radius_km', radius_km.toString());
    if (limit) params.append('limit', limit.toString());

    return this.request<NearbyReliefCentersResponse>(`/relief-centers/nearby?${params}`);
  }
}

// Export singleton instance
export const disasterAPI = new DisasterAPIClient();

// Helper functions
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('disaster_api_token');
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('disaster_api_token');
};

// Error handling utilities
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Hook for React components to use the API
export const useDisasterAPI = () => {
  return disasterAPI;
};
