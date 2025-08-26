# Environment Variables for Deployment

This document lists all the environment variables required for deploying Help Hub.

## Required Environment Variables

### App Configuration
- `NODE_ENV`: Set to `production` for production deployment

### Vercel Deployment
- `VERCEL_URL`: Automatically set by Vercel during deployment

### API Keys
- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google Gemini API key
- `GEMINI_API_KEY`: Alternative name for Gemini API key
- `NEXT_PUBLIC_OPENWEATHER_API_KEY`: Your OpenWeather API key

### External Services
- `NEXT_PUBLIC_DISASTER_API_BASE_URL`: Base URL for disaster API (defaults to localhost in development)

### Supabase (if using)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Optional
- `ANALYZE`: Set to `true` to enable bundle analysis (default: `false`)

## Setting Environment Variables

### Vercel
1. Go to your project dashboard on Vercel
2. Navigate to Settings > Environment Variables
3. Add each variable with the appropriate value
4. Redeploy your application

### Other Platforms
Set the environment variables according to your hosting platform's documentation.

## Development vs Production

- In development, the app will use fallback values for missing API keys
- In production, ensure all required API keys are properly set
- Never commit actual API keys to version control
