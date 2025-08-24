"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Eye, 
  Thermometer, 
  Droplets,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { 
  getCurrentWeather, 
  getWeatherForecast, 
  getWeatherAlert,
  type WeatherData,
  type WeatherForecast 
} from '@/lib/weather';

interface WeatherWidgetProps {
  className?: string;
}

export default function WeatherWidget({ className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchWeatherData = async () => {
    try {
      setIsLoading(true);
      const [currentWeather, weatherForecast] = await Promise.all([
        getCurrentWeather(),
        getWeatherForecast()
      ]);
      setWeather(currentWeather);
      setForecast(weatherForecast);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (description: string) => {
    if (description.toLowerCase().includes('rain')) return <CloudRain className="w-4 h-4" />;
    if (description.toLowerCase().includes('cloud')) return <Cloud className="w-4 h-4" />;
    if (description.toLowerCase().includes('clear')) return <Sun className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };

  const getWeatherAlertLevel = (description: string, precipitation: number) => {
    if (precipitation > 70 || description.toLowerCase().includes('storm')) {
      return { level: 'critical', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (precipitation > 40) {
      return { level: 'warning', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    }
    return { level: 'normal', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-600" />
            Current Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Loading weather data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather || !forecast) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-600" />
            Current Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-xs text-muted-foreground mb-2">Weather data unavailable</p>
          <Button size="sm" variant="outline" onClick={fetchWeatherData}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const alertInfo = getWeatherAlert(weather.description, forecast.hourly[0]?.precipitation || 0);
  const alertLevel = getWeatherAlertLevel(weather.description, forecast.hourly[0]?.precipitation || 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-600" />
            Current Conditions
          </CardTitle>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={fetchWeatherData}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Weather */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-center">
            <div className="text-blue-600 font-bold text-lg">{weather.temperature}°C</div>
            <div className="text-blue-600">Temperature</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950/20 p-2 rounded text-center">
            <div className="text-gray-600 font-bold text-lg">{weather.humidity}%</div>
            <div className="text-gray-600">Humidity</div>
          </div>
        </div>

        {/* Weather Description */}
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
          {getWeatherIcon(weather.description)}
          <span className="text-xs font-medium capitalize">{weather.description}</span>
          <Badge variant="outline" className="text-xs ml-auto">
            Feels like {weather.feelsLike}°C
          </Badge>
        </div>

        {/* Weather Alert */}
        {alertLevel.level !== 'normal' && (
          <div className={`p-2 rounded border ${alertLevel.color}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-medium">{alertInfo}</span>
            </div>
          </div>
        )}

        {/* Additional Weather Info */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-muted-foreground" />
            <span>{weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-muted-foreground" />
            <span>{weather.visibility} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-muted-foreground" />
            <span>{weather.pressure} hPa</span>
          </div>
        </div>

        {/* Forecast Tabs */}
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="hourly" className="text-xs">Hourly</TabsTrigger>
            <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hourly" className="mt-2">
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {forecast.hourly.slice(0, 4).map((hour, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-1 bg-muted/30 rounded">
                  <span className="font-medium">{hour.time}</span>
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(hour.description)}
                    <span>{hour.temperature}°C</span>
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span>{Math.round(hour.precipitation)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="daily" className="mt-2">
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {forecast.daily.slice(0, 3).map((day, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-1 bg-muted/30 rounded">
                  <span className="font-medium">{day.date}</span>
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(day.description)}
                    <span>{day.maxTemp}°C</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{day.minTemp}°C</span>
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span>{Math.round(day.precipitation)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Last Update */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {lastUpdate.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })}
        </div>
      </CardContent>
    </Card>
  );
}
