# Disaster Response Hub - API Documentation

## Base URLs

- **Development**: `http://localhost:8000`
- **Production**: `https://225084b0093d.ngrok-free.app`

## Authentication

**No authentication required** - All APIs are publicly accessible and accept requests from all origins.

## CORS Configuration

All endpoints support CORS with the following configuration:

- `allow_credentials`: true
- `allow_methods`: ["*"]
- `allow_headers`: ["*"]

---

## 1. Social Media APIs

### 1.1 Get Social Media Posts

**GET** `/api/v1/social-media/posts`

Get social media posts with optional filtering.

**Query Parameters:**

- `message_type` (optional): Filter by message type (`sos`, `emergency`, `update`, `general`)
- `urgency_level` (optional): Filter by urgency (`low`, `medium`, `high`, `critical`)
- `location` (optional): Filter by location
- `limit` (optional, default: 50): Number of results (1-100)
- `skip` (optional, default: 0): Number of results to skip

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "timestamp": "2025-08-23T20:30:00Z",
      "lat": 13.048,
      "lon": 80.281,
      "message": "Flood situation getting worse in coastal areas",
      "message_type": "emergency",
      "urgency_level": "high",
      "extracted_location": "Chennai",
      "hashtags": ["ChennaiFloods", "Emergency"],
      "mentions": ["@TNSDMA"]
    }
  ],
  "total": 150,
  "limit": 50,
  "skip": 0,
  "has_more": true
}
```

### 1.2 Get SOS Messages

**GET** `/api/v1/social-media/posts/sos`

Get only SOS/emergency messages.

**Query Parameters:**

- `limit` (optional, default: 20): Number of results (1-50)
- `skip` (optional, default: 0): Number of results to skip

**Response:** Same format as above, but only SOS messages.

### 1.3 Get Posts Near Location

**GET** `/api/v1/social-media/posts/nearby`

Get posts near a specific location.

**Query Parameters:**

- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `radius_km` (optional, default: 5.0): Search radius in kilometers (0.1-50.0)
- `limit` (optional, default: 20): Number of results (1-50)

**Response:** Same format as above, but filtered by location.

### 1.4 Get Posts by Time Range

**GET** `/api/v1/social-media/posts/time-range`

Get posts within a specific time range.

**Query Parameters:**

- `start_time` (required): Start time in ISO format (e.g., "2025-08-23T00:00:00Z")
- `end_time` (required): End time in ISO format (e.g., "2025-08-23T23:59:59Z")
- `message_type` (optional): Filter by message type
- `urgency_level` (optional): Filter by urgency level
- `location` (optional): Filter by location
- `limit` (optional, default: 50): Number of results (1-100)
- `skip` (optional, default: 0): Number of results to skip

**Response:** Same format as above, but filtered by time range.

### 1.5 Get Recent Posts

**GET** `/api/v1/social-media/posts/recent`

Get posts from the last N hours.

**Query Parameters:**

- `hours` (optional, default: 24): Number of hours to look back (1-168)
- `message_type` (optional): Filter by message type
- `urgency_level` (optional): Filter by urgency level
- `limit` (optional, default: 50): Number of results (1-100)

**Response:** Same format as above, but filtered by recency.

### 1.6 Get Social Media Statistics

**GET** `/api/v1/social-media/stats`

Get statistics about social media posts.

**Response:**

```json
{
  "success": true,
  "data": {
    "total_posts": 1250,
    "sos_posts": 45,
    "emergency_posts": 89,
    "high_urgency_posts": 67,
    "critical_urgency_posts": 23,
    "posts_last_24h": 156,
    "posts_last_hour": 12,
    "top_locations": ["Chennai", "Mumbai", "Delhi"],
    "top_hashtags": ["ChennaiFloods", "Emergency", "Help"]
  }
}
```

---

## 2. IVR (Interactive Voice Response) APIs

### 2.1 Create IVR Request

**POST** `/api/v1/ivr/requests`

Create a new IVR call request.

**Request Body:**

```json
{
  "location": "Chennai",
  "flood_area": 12.5,
  "urgency": "HIGH",
  "victim_name": "John Doe",
  "victim_phone": "+919653638477",
  "victim_address": "Building A, Floor 3, Coastal Area",
  "family_count": 4,
  "medical_condition": "diabetes"
}
```

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "location": "Chennai",
  "flood_area": 12.5,
  "urgency": "HIGH",
  "victim_name": "John Doe",
  "victim_phone": "+919653638477",
  "victim_address": "Building A, Floor 3, Coastal Area",
  "family_count": 4,
  "medical_condition": "diabetes",
  "call_status": "PENDING",
  "call_attempts": 0,
  "last_call_attempt": null,
  "ivr_response": null,
  "response_details": null,
  "created_at": "2025-08-23T20:30:00Z",
  "updated_at": "2025-08-23T20:30:00Z",
  "n8n_webhook_sent": true,
  "n8n_webhook_response": "success"
}
```

### 2.2 Update IVR Status

**PUT** `/api/v1/ivr/requests/{request_id}/status`

Update the status of an IVR call (used by n8n after call completion).

**Path Parameters:**

- `request_id` (required): The IVR request ID

**Request Body:**

```json
{
  "call_status": "COMPLETED",
  "ivr_response": "2",
  "call_attempts": 1
}
```

**Response:** Same format as Create IVR Request.

### 2.3 Get IVR Requests (Dashboard)

**GET** `/api/v1/ivr/requests`

Get all IVR requests for dashboard display.

**Query Parameters:**

- `status` (optional): Filter by call status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`)
- `urgency` (optional): Filter by urgency level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `limit` (optional, default: 50): Number of results (1-100)
- `skip` (optional, default: 0): Number of results to skip

**Response:**

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "507f1f77bcf86cd799439011",
        "location": "Chennai",
        "urgency": "HIGH",
        "victim_name": "John Doe",
        "call_status": "COMPLETED",
        "created_at": "2025-08-23T20:30:00Z"
      }
    ],
    "total": 25,
    "limit": 50,
    "skip": 0,
    "has_more": false
  }
}
```

### 2.4 Get Urgent IVR Requests

**GET** `/api/v1/ivr/requests/urgent`

Get only urgent IVR requests.

**Query Parameters:**

- `limit` (optional, default: 20): Number of results (1-50)

**Response:** Array of urgent IVR requests.

### 2.5 Get Specific IVR Request

**GET** `/api/v1/ivr/requests/{request_id}`

Get details of a specific IVR request.

**Path Parameters:**

- `request_id` (required): The IVR request ID

**Response:** Single IVR request object.

### 2.6 Get IVR Statistics

**GET** `/api/v1/ivr/stats`

Get statistics about IVR requests.

**Response:**

```json
{
  "success": true,
  "data": {
    "total_requests": 150,
    "pending_requests": 12,
    "completed_requests": 98,
    "failed_requests": 5,
    "high_urgency_requests": 45,
    "critical_urgency_requests": 23,
    "average_response_time_minutes": 8.5,
    "success_rate_percentage": 87.5
  }
}
```

### 2.7 Retry IVR Call

**POST** `/api/v1/ivr/requests/{request_id}/retry`

Retry a failed IVR call.

**Path Parameters:**

- `request_id` (required): The IVR request ID

**Response:** Updated IVR request object.

---

## 3. Amenities APIs

### 3.1 Get Amenities

**GET** `/api/v1/amenities`

Get all amenities with optional filtering.

**Query Parameters:**

- `amenity_type` (optional): Filter by amenity type
- `status` (optional): Filter by status
- `limit` (optional, default: 50): Number of results (1-100)
- `skip` (optional, default: 0): Number of results to skip

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Chennai General Hospital",
      "amenity_type": "hospital",
      "leisure_type": "medical",
      "status": "operational",
      "latitude": 13.048,
      "longitude": 80.281,
      "resources": {
        "beds": 500,
        "doctors": 50,
        "ambulances": 10
      },
      "last_updated": "2025-08-23T20:30:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "skip": 0,
  "has_more": true
}
```

### 3.2 Get Nearby Amenities

**GET** `/api/v1/amenities/nearby`

Find amenities near a specific location.

**Query Parameters:**

- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `radius_km` (optional, default: 5.0): Search radius in kilometers (0.1-50.0)
- `amenity_type` (optional): Filter by amenity type
- `limit` (optional, default: 20): Number of results (1-50)

**Response:** Same format as above, but filtered by location and sorted by distance.

### 3.3 Get Amenities Statistics

**GET** `/api/v1/amenities/stats`

Get statistics about amenities.

**Response:**

```json
{
  "success": true,
  "data": {
    "total_amenities": 250,
    "operational_amenities": 230,
    "hospitals": 15,
    "schools": 45,
    "police_stations": 12,
    "fire_stations": 8,
    "shelters": 20,
    "average_distance_km": 2.5
  }
}
```

### 3.4 Get Specific Amenity

**GET** `/api/v1/amenities/{amenity_id}`

Get details of a specific amenity.

**Path Parameters:**

- `amenity_id` (required): The amenity ID

**Response:** Single amenity object.

---

## 4. Relief Centers APIs

### 4.1 Create Relief Center

**POST** `/api/v1/relief-centers`

Create a new relief center.

**Request Body:**

```json
{
  "name": "Chennai Relief Center 1",
  "location": "Chennai",
  "latitude": 13.048,
  "longitude": 80.281,
  "capacity": 500,
  "current_occupancy": 0,
  "resources": {
    "food_packages": 1000,
    "water_bottles": 2000,
    "medical_kits": 50,
    "blankets": 300
  },
  "contact_person": "John Doe",
  "contact_phone": "+919653638477",
  "status": "active"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Chennai Relief Center 1",
    "location": "Chennai",
    "latitude": 13.048,
    "longitude": 80.281,
    "capacity": 500,
    "current_occupancy": 0,
    "occupancy_percentage": 0.0,
    "resources": {
      "food_packages": 1000,
      "water_bottles": 2000,
      "medical_kits": 50,
      "blankets": 300
    },
    "contact_person": "John Doe",
    "contact_phone": "+919653638477",
    "status": "active",
    "created_at": "2025-08-23T20:30:00Z",
    "updated_at": "2025-08-23T20:30:00Z"
  }
}
```

### 4.2 Get Relief Centers

**GET** `/api/v1/relief-centers`

Get all relief centers.

**Query Parameters:**

- `status` (optional): Filter by status (`active`, `inactive`, `full`)
- `location` (optional): Filter by location
- `limit` (optional, default: 50): Number of results (1-100)
- `skip` (optional, default: 0): Number of results to skip

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Chennai Relief Center 1",
      "location": "Chennai",
      "latitude": 13.048,
      "longitude": 80.281,
      "capacity": 500,
      "current_occupancy": 150,
      "occupancy_percentage": 30.0,
      "status": "active"
    }
  ],
  "total": 25,
  "limit": 50,
  "skip": 0,
  "has_more": false
}
```

### 4.3 Get Nearby Relief Centers

**GET** `/api/v1/relief-centers/nearby`

Find relief centers near a specific location.

**Query Parameters:**

- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `radius_km` (optional, default: 10.0): Search radius in kilometers (0.1-100.0)
- `limit` (optional, default: 20): Number of results (1-50)

**Response:** Same format as above, but filtered by location and sorted by distance.

### 4.4 Get Specific Relief Center

**GET** `/api/v1/relief-centers/{relief_center_id}`

Get details of a specific relief center.

**Path Parameters:**

- `relief_center_id` (required): The relief center ID

**Response:** Single relief center object.

### 4.5 Update Relief Center Occupancy

**PUT** `/api/v1/relief-centers/{relief_center_id}/occupancy`

Update the occupancy of a relief center.

**Path Parameters:**

- `relief_center_id` (required): The relief center ID

**Request Body:**

```json
{
  "current_occupancy": 200,
  "resources_used": {
    "food_packages": 50,
    "water_bottles": 100,
    "medical_kits": 5,
    "blankets": 20
  }
}
```

**Response:** Updated relief center object.

### 4.6 Get Relief Centers Statistics

**GET** `/api/v1/relief-centers/stats/summary`

Get statistics about relief centers.

**Response:**

```json
{
  "success": true,
  "data": {
    "total_centers": 25,
    "active_centers": 22,
    "full_centers": 3,
    "total_capacity": 12500,
    "total_occupancy": 3450,
    "average_occupancy_percentage": 27.6,
    "total_resources": {
      "food_packages": 25000,
      "water_bottles": 50000,
      "medical_kits": 1250,
      "blankets": 7500
    }
  }
}
```

---

## 5. Route Finder APIs

### 5.1 Find Route

**POST** `/api/v1/route-finder/find-route`

Find the best route between two points.

**Request Body:**

```json
{
  "start_latitude": 13.048,
  "start_longitude": 80.281,
  "end_latitude": 13.082,
  "end_longitude": 80.27,
  "profile": "driving-car",
  "preferences": {
    "avoid_flooded_areas": true,
    "prefer_safe_routes": true,
    "max_distance_km": 50.0
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "route_id": "507f1f77bcf86cd799439011",
    "start_point": {
      "latitude": 13.048,
      "longitude": 80.281
    },
    "end_point": {
      "latitude": 13.082,
      "longitude": 80.27
    },
    "distance_km": 8.5,
    "duration_minutes": 15,
    "route_type": "safe",
    "geojson": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [80.281, 13.048],
              [80.27, 13.082]
            ]
          },
          "properties": {
            "distance": 8500,
            "duration": 900
          }
        }
      ]
    },
    "warnings": ["Route passes through moderate flood area"],
    "created_at": "2025-08-23T20:30:00Z"
  }
}
```

### 5.2 Validate GeoJSON

**POST** `/api/v1/route-finder/validate-geojson`

Validate a GeoJSON route.

**Request Body:**

```json
{
  "geojson": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [80.281, 13.048],
            [80.27, 13.082]
          ]
        }
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "is_valid": true,
    "distance_km": 8.5,
    "estimated_duration_minutes": 15,
    "flood_risk_level": "low",
    "warnings": []
  }
}
```

---

## 6. Flood Prediction APIs

### 6.1 Predict Flood

**POST** `/api/v1/flood-prediction/predict`

Predict flood probability for a location.

**Request Body:**

```json
{
  "latitude": 13.048,
  "longitude": 80.281,
  "date": "2025-08-25",
  "water_threshold": 0.3
}
```

**Response:**

```json
{
  "success": true,
  "message": "Flood prediction completed successfully",
  "latitude": 13.048,
  "longitude": 80.281,
  "analysis_date": "2025-08-25",
  "flood_probability": 0.75,
  "affected_area_km2": 25.5,
  "severity_level": "high",
  "geojson": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.281, 13.048],
              [80.27, 13.082]
            ]
          ]
        },
        "properties": {
          "flood_probability": 0.75,
          "severity_level": "high"
        }
      }
    ]
  }
}
```

### 6.2 Advanced Flood Prediction

**POST** `/api/v1/flood-prediction/predict-advanced`

Advanced flood prediction using SAR data and weather information.

**Request Body:** Same as basic prediction.

**Response:** Same format as basic prediction, but with enhanced accuracy.

### 6.3 Get Prediction History

**GET** `/api/v1/flood-prediction/history`

Get flood prediction history.

**Query Parameters:**

- `limit` (optional, default: 10): Number of results (1-100)

**Response:** Array of flood prediction objects.

### 6.4 Get Prediction Statistics

**GET** `/api/v1/flood-prediction/stats`

Get flood prediction statistics.

**Response:**

```json
{
  "success": true,
  "message": "Prediction statistics retrieved successfully",
  "data": {
    "total_predictions": 150,
    "high_risk_predictions": 45,
    "average_flood_probability": 0.35,
    "high_risk_percentage": 30.0
  }
}
```

### 6.5 Get Latest SAR Files

**GET** `/api/v1/flood-prediction/latest-sar-files`

Get information about available SAR files.

**Response:**

```json
{
  "success": true,
  "data": {
    "available_files": 15,
    "latest_date": "2025-08-23",
    "file_info": [
      {
        "filename": "sentinel1_20250823.tif",
        "date": "2025-08-23",
        "size_mb": 45.2,
        "coverage_area": "Chennai"
      }
    ]
  }
}
```

---

## 7. SAR Analysis APIs

### 7.1 Get Available Dates

**GET** `/api/v1/sar-analysis/available-dates`

Get available SAR analysis dates.

**Response:**

```json
{
  "success": true,
  "data": {
    "available_dates": ["2025-08-23", "2025-08-22", "2025-08-21"],
    "total_files": 15
  }
}
```

### 7.2 Compare SAR Images

**POST** `/api/v1/sar-analysis/compare`

Compare SAR images for water change analysis.

**Request Body:**

```json
{
  "date1": "2025-08-23",
  "date2": "2025-08-22",
  "latitude": 13.048,
  "longitude": 80.281,
  "radius_km": 5.0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "analysis_id": "507f1f77bcf86cd799439011",
    "date1": "2025-08-23",
    "date2": "2025-08-22",
    "water_change_percentage": 15.5,
    "affected_area_km2": 12.3,
    "confidence_score": 0.92,
    "geojson": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [80.281, 13.048],
                [80.27, 13.082]
              ]
            ]
          },
          "properties": {
            "water_change": 15.5,
            "confidence": 0.92
          }
        }
      ]
    },
    "created_at": "2025-08-23T20:30:00Z"
  }
}
```

### 7.3 Get Analysis History

**GET** `/api/v1/sar-analysis/history`

Get SAR analysis history.

**Query Parameters:**

- `limit` (optional, default: 10): Number of results (1-100)

**Response:** Array of SAR analysis objects.

### 7.4 Get Latest 3 Analysis

**GET** `/api/v1/sar-analysis/latest-3-analysis`

Get the latest 3 SAR analyses.

**Response:** Array of 3 most recent SAR analysis objects.

---

## Frontend Integration Examples

### JavaScript (Fetch API)

```javascript
// Example: Get social media posts
async function getSocialMediaPosts() {
  const response = await fetch(
    "http://localhost:8000/api/v1/social-media/posts?limit=10",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  console.log(data);
}

// Example: Create IVR request
async function createIVRRequest() {
  const response = await fetch("http://localhost:8000/api/v1/ivr/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      location: "Chennai",
      flood_area: 12.5,
      urgency: "HIGH",
      victim_name: "John Doe",
      victim_phone: "+919653638477",
      victim_address: "Building A, Floor 3",
      family_count: 4,
      medical_condition: "diabetes",
    }),
  });

  const data = await response.json();
  console.log(data);
}

// Example: Get nearby relief centers
async function getNearbyReliefCenters(lat, lng) {
  const response = await fetch(
    `http://localhost:8000/api/v1/relief-centers/nearby?latitude=${lat}&longitude=${lng}&radius_km=10`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  console.log(data);
}
```

### cURL Examples

```bash
# Get social media posts
curl -X GET "http://localhost:8000/api/v1/social-media/posts?limit=10"

# Create IVR request
curl -X POST "http://localhost:8000/api/v1/ivr/requests" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Chennai",
    "flood_area": 12.5,
    "urgency": "HIGH",
    "victim_name": "John Doe",
    "victim_phone": "+919653638477",
    "victim_address": "Building A, Floor 3",
    "family_count": 4,
    "medical_condition": "diabetes"
  }'

# Get nearby relief centers
curl -X GET "http://localhost:8000/api/v1/relief-centers/nearby?latitude=13.048&longitude=80.281&radius_km=10"

# Predict flood
curl -X POST "http://localhost:8000/api/v1/flood-prediction/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 13.048,
    "longitude": 80.281,
    "date": "2025-08-25",
    "water_threshold": 0.3
  }'
```

### React Example

```jsx
import React, { useState, useEffect } from "react";

function DisasterResponseApp() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSocialMediaPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/social-media/posts?limit=10"
      );
      const data = await response.json();
      setPosts(data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const createIVRRequest = async (requestData) => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/ivr/requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );
      const data = await response.json();
      console.log("IVR request created:", data);
    } catch (error) {
      console.error("Error creating IVR request:", error);
    }
  };

  useEffect(() => {
    fetchSocialMediaPosts();
  }, []);

  return (
    <div>
      <h1>Disaster Response Hub</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>Social Media Posts</h2>
          {posts.map((post) => (
            <div key={post._id}>
              <p>{post.message}</p>
              <small>Urgency: {post.urgency_level}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DisasterResponseApp;
```

---

## Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description",
  "status_code": 400
}
```

Common HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (resource not found)
- `500`: Internal Server Error

---

## Rate Limiting

Currently, no rate limiting is implemented. All APIs are publicly accessible.

---

## Data Sources

- **Social Media Data**: Loaded from `social.csv` file
- **Amenities**: GeoJSON data from OpenStreetMap
- **Relief Centers**: CSV data with mock information
- **SAR Images**: TIFF files in `data/sar_images/` directory
- **IVR Requests**: Stored in MongoDB

---

## Development Notes

- All APIs use mock data for demonstration
- No real authentication is implemented
- CORS is enabled for all origins
- MongoDB is used for data storage
- All timestamps are in UTC format
