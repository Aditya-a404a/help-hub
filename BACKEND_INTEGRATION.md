# Backend API Integration Documentation

## Overview

The InfyRescue application has been integrated with a comprehensive Disaster Response Backend API. This document outlines what has been implemented and what you need to know to fully utilize the backend integration.

## ✅ What's Been Integrated

### 1. API Client (`lib/disaster-api.ts`)
- Complete TypeScript client for all backend endpoints
- JWT authentication handling
- Error handling and response types
- All API endpoints covered:
  - Authentication (login, signup, profile)
  - Route finding with flood avoidance
  - SAR analysis for flood detection
  - Flood prediction and alerts
  - Amenities and services
  - Relief centers

### 2. Authentication System
- **AuthProvider** (`lib/hooks/useAuth.ts`) - React context for authentication state
- **AuthModal** (`components/auth-modal.tsx`) - Login/signup modal
- JWT token management with localStorage
- Protected routes and authentication checks

### 3. Emergency Map Integration (`components/emergency-map.tsx`)
- **Real-time data loading** from backend APIs
- **Amenities integration** - Shows hospitals, clinics, schools from API
- **Relief centers integration** - Displays relief camps with real data
- **Flood alerts integration** - Shows active flood warnings as danger zones
- **Route finding with flood avoidance** - Uses backend API for safe routing
- **Authentication-aware** - Shows sign-in prompt when not authenticated

### 4. Help Page Updates (`app/help/page.tsx`)
- **Emergency form** creates flood alerts through API when authenticated
- **Real relief centers data** from backend
- **Real amenities data** from backend
- **Authentication integration**

### 5. Dashboard Integration (`app/dashboard/page.tsx`)
- **User authentication** in top bar
- **Auth modal integration**
- Ready for real data integration

## 🔧 Configuration Required

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```bash
# Disaster Response API Configuration
NEXT_PUBLIC_DISASTER_API_BASE_URL=https://387b871cc28b.ngrok-free.app/api/v1

# Weather API (existing)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Google Generative AI (existing)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
```

### 2. Backend API Status
The backend API is running at: `https://387b871cc28b.ngrok-free.app/api/v1`

**Note**: This is a ngrok URL and may change. Update the `NEXT_PUBLIC_DISASTER_API_BASE_URL` if the backend URL changes.

## 🚀 How to Use

### 1. Start the Application
```bash
npm run dev
```

### 2. Authentication
- Click "Sign In" button in the emergency map or dashboard
- Create an account or login with existing credentials
- Once authenticated, you can access real-time data

### 3. Emergency Features
- **Emergency Map**: Shows real hospitals, relief centers, and flood alerts
- **Route Planning**: Avoids flood areas when calculating routes
- **Emergency Form**: Creates actual flood alerts in the system
- **Real-time Data**: All data comes from the backend API

## 📊 Data Flow

### Authenticated Users
1. **Emergency Map** loads data from:
   - `/api/v1/amenities/nearby` - Nearby hospitals, schools
   - `/api/v1/relief-centers/nearby` - Active relief centers
   - `/api/v1/flood-prediction/alerts` - Active flood warnings

2. **Route Finding** uses:
   - `/api/v1/route-finder/route` - With flood avoidance GeoJSON

3. **Emergency Reports** create:
   - `/api/v1/flood-prediction/alerts` - New flood alerts

### Non-Authenticated Users
- See demo data and sign-in prompts
- Can still use basic map functionality
- Encouraged to sign up for full access

## 🛠️ What You Can Do Now

### 1. Test Authentication
- Create accounts through the auth modal
- Login/logout functionality works
- JWT tokens are managed automatically

### 2. View Real Emergency Data
- Emergency map shows actual hospitals and services
- Relief centers display real capacity data
- Flood alerts show current warnings

### 3. Use Emergency Features
- Emergency form creates real alerts
- Route planning avoids flood areas
- All data is live from the backend

### 4. Monitor System Status
- Authentication state is tracked
- API errors are handled gracefully
- Loading states are shown

## 🔄 Next Steps (Optional Enhancements)

### 1. SAR Analysis Integration
- Add SAR image analysis interface
- Display flood detection results on map
- Show historical flood data

### 2. Flood Prediction Dashboard
- Add flood prediction interface
- Show prediction models and confidence
- Historical flood data visualization

### 3. Advanced Features
- Real-time weather alerts integration
- Emergency broadcast system
- Multi-language support

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend URL is accessible
   - Verify ngrok tunnel is active
   - Check browser console for CORS errors

2. **Authentication Issues**
   - Clear localStorage: `localStorage.removeItem('disaster_api_token')`
   - Try logging out and back in
   - Check if account exists in backend

3. **No Data Showing**
   - Ensure you're authenticated
   - Check if backend has data for your location
   - Verify API endpoints are responding

### Debug Mode
- Open browser console to see API requests
- Check Network tab for API responses
- Authentication errors are logged

## 📋 API Endpoints Used

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile

### Emergency Data
- `GET /amenities/nearby` - Nearby emergency services
- `GET /relief-centers/nearby` - Nearby relief centers
- `GET /flood-prediction/alerts` - Active flood alerts

### Route Planning
- `POST /route-finder/route` - Safe route calculation

### Emergency Reporting
- `POST /flood-prediction/alerts` - Create flood alert

## 🔒 Security Notes

- JWT tokens are stored in localStorage
- All API calls include authentication headers when available
- Sensitive data is handled securely
- No sensitive information is logged

## 📞 Support

If you encounter issues:
1. Check this documentation first
2. Verify backend API is running
3. Check browser console for errors
4. Ensure environment variables are set correctly

The integration is designed to be robust and will gracefully fall back to demo data when the backend is unavailable or when users are not authenticated.
