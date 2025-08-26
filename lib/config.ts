// Configuration for Disaster Response Application

export const config = {
  // API Configuration
  disasterAPI: {
    baseURL:
      process.env.NEXT_PUBLIC_DISASTER_API_BASE_URL ||
      "http://localhost:8000/api/v1",
  },

  // Weather API (existing)
  weather: {
    apiKey: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "demo_key",
  },

  // Google Generative AI (existing)
  gemini: {
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
  },

  // App Configuration
  app: {
    name: "InfyRescue",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },

  // Default locations
  locations: {
    chennai: {
      lat: 13.0827,
      lon: 80.2707,
    },
    default: {
      lat: 13.0827,
      lon: 80.2707,
    },
  },
} as const;

export default config;
