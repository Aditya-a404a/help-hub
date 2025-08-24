# Weather API Setup Guide

## OpenWeatherMap API Integration

This dashboard now includes real-time weather data for Chennai using the OpenWeatherMap API.

### Setup Instructions

1. **Get Free API Key**
   - Visit [OpenWeatherMap API](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key (free tier allows 1000 calls per day)

2. **Configure Environment Variables**
   - Create a `.env.local` file in your project root
   - Add your API key:
   ```bash
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

3. **Restart Development Server**
   - Stop your current dev server
   - Run `npm run dev` again

### Features

- **Real-time Weather**: Current temperature, humidity, wind speed, pressure, visibility
- **Weather Forecasts**: Hourly (next 24 hours) and daily (next 5 days) predictions
- **Precipitation Alerts**: Automatic warnings for heavy rainfall and storms
- **Auto-refresh**: Updates every 10 minutes automatically
- **Fallback Data**: Shows demo data if API is unavailable

### API Endpoints Used

- **Current Weather**: `https://api.openweathermap.org/data/2.5/weather`
- **5-Day Forecast**: `https://api.openweathermap.org/data/2.5/forecast`
- **Coordinates**: Chennai (13.0827°N, 80.2707°E)

### Free Tier Limits

- **1000 API calls per day**
- **3-hour forecast intervals**
- **Basic weather data**
- **Suitable for development and small deployments**

### Troubleshooting

- **API Key Error**: Ensure your `.env.local` file is in the project root
- **Rate Limiting**: Free tier allows ~41 calls per hour
- **CORS Issues**: API supports CORS for browser requests
- **Demo Mode**: If no API key is provided, demo data will be shown

### Security Note

The API key is prefixed with `NEXT_PUBLIC_` to make it accessible in the browser. This is safe for OpenWeatherMap as the key is rate-limited and only provides weather data.
