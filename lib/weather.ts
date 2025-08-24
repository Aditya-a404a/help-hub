// Weather service using OpenWeatherMap API
// Sign up for free API key at: https://openweathermap.org/api

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo_key';
const CHENNAI_COORDS = { lat: 13.0827, lon: 80.2707 };

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  pressure: number;
  visibility: number;
  feelsLike: number;
  timestamp: number;
}

export interface WeatherForecast {
  hourly: Array<{
    time: string;
    temperature: number;
    description: string;
    icon: string;
    precipitation: number;
  }>;
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    description: string;
    icon: string;
    precipitation: number;
  }>;
}

export async function getCurrentWeather(): Promise<WeatherData> {
  try {
    // If no API key, return demo data
    if (WEATHER_API_KEY === 'demo_key') {
      return getDemoWeatherData();
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${CHENNAI_COORDS.lat}&lon=${CHENNAI_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      pressure: data.main.pressure,
      visibility: Math.round(data.visibility / 1000), // Convert m to km
      feelsLike: Math.round(data.main.feels_like),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return getDemoWeatherData();
  }
}

export async function getWeatherForecast(): Promise<WeatherForecast> {
  try {
    // If no API key, return demo data
    if (WEATHER_API_KEY === 'demo_key') {
      return getDemoForecastData();
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${CHENNAI_COORDS.lat}&lon=${CHENNAI_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Weather forecast API request failed');
    }

    const data = await response.json();
    
    // Process hourly forecast (3-hour intervals)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hourly = data.list.slice(0, 8).map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      temperature: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      precipitation: item.pop * 100 // Probability of precipitation as percentage
    }));

    // Process daily forecast
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const daily = data.list.filter((item: any, index: number) => index % 8 === 0).slice(0, 5).map((item: any) => ({
      date: new Date(item.dt * 1000).toLocaleDateString('en-IN', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      maxTemp: Math.round(item.main.temp_max),
      minTemp: Math.round(item.main.temp_min),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      precipitation: item.pop * 100
    }));

    return { hourly, daily };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return getDemoForecastData();
  }
}

function getDemoWeatherData(): WeatherData {
  return {
    temperature: 28,
    humidity: 85,
    description: 'Heavy rain',
    icon: '10d',
    windSpeed: 12,
    pressure: 1013,
    visibility: 5,
    feelsLike: 32,
    timestamp: Date.now()
  };
}

function getDemoForecastData(): WeatherForecast {
  return {
    hourly: [
      { time: '12:00', temperature: 28, description: 'Heavy rain', icon: '10d', precipitation: 80 },
      { time: '15:00', temperature: 27, description: 'Moderate rain', icon: '10d', precipitation: 60 },
      { time: '18:00', temperature: 26, description: 'Light rain', icon: '10d', precipitation: 40 },
      { time: '21:00', temperature: 25, description: 'Overcast', icon: '04n', precipitation: 20 },
      { time: '00:00', temperature: 24, description: 'Partly cloudy', icon: '02n', precipitation: 10 },
      { time: '03:00', temperature: 23, description: 'Clear', icon: '01n', precipitation: 0 },
      { time: '06:00', temperature: 24, description: 'Clear', icon: '01d', precipitation: 0 },
      { time: '09:00', temperature: 26, description: 'Partly cloudy', icon: '02d', precipitation: 10 }
    ],
    daily: [
      { date: 'Mon, Dec 16', maxTemp: 29, minTemp: 23, description: 'Heavy rain', icon: '10d', precipitation: 80 },
      { date: 'Tue, Dec 17', maxTemp: 28, minTemp: 22, description: 'Moderate rain', icon: '10d', precipitation: 60 },
      { date: 'Wed, Dec 18', maxTemp: 30, minTemp: 24, description: 'Light rain', icon: '10d', precipitation: 30 },
      { date: 'Thu, Dec 19', maxTemp: 31, minTemp: 25, description: 'Partly cloudy', icon: '02d', precipitation: 20 },
      { date: 'Fri, Dec 20', maxTemp: 32, minTemp: 26, description: 'Clear', icon: '01d', precipitation: 10 }
    ]
  };
}

export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export function getWeatherAlert(description: string, precipitation: number): string {
  if (precipitation > 70) {
    return 'Heavy rainfall expected - Flood risk high';
  } else if (precipitation > 40) {
    return 'Moderate rainfall expected - Monitor water levels';
  } else if (description.toLowerCase().includes('storm')) {
    return 'Storm warning - Secure loose objects';
  } else if (description.toLowerCase().includes('thunder')) {
    return 'Thunderstorm alert - Stay indoors';
  }
  return 'Weather conditions normal';
}
