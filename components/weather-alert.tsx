"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  AlertTriangle,
  Eye,
  Bell,
  MapPin,
  Clock,
  TrendingUp
} from "lucide-react";

interface WeatherAlert {
  id: string;
  type: 'heavy_rain' | 'flood' | 'cyclone' | 'heat_wave' | 'drought' | 'storm';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  issuedAt: string;
  validUntil: string;
  probability: number;
  impact: string[];
  recommendations: string[];
}

interface WeatherForecast {
  date: string;
  temperature: { min: number; max: number };
  precipitation: number;
  windSpeed: number;
  humidity: number;
  conditions: string;
  risk: 'low' | 'medium' | 'high';
}

export default function WeatherAlertComponent() {
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = () => {
    // Simulate loading weather data
    const mockWeatherAlerts: WeatherAlert[] = [
      {
        id: '1',
        type: 'heavy_rain',
        severity: 'high',
        location: 'Mumbai Metropolitan Region',
        description: 'Heavy rainfall expected with 80-120mm in 24 hours. Risk of flooding in low-lying areas.',
        issuedAt: '2 hours ago',
        validUntil: 'Next 48 hours',
        probability: 85,
        impact: ['Urban flooding', 'Traffic disruption', 'Power outages'],
        recommendations: ['Avoid low-lying areas', 'Stock essential supplies', 'Monitor weather updates']
      },
      {
        id: '2',
        type: 'cyclone',
        severity: 'medium',
        location: 'Konkan Coast',
        description: 'Depression forming in Arabian Sea. Potential cyclone development in next 72 hours.',
        issuedAt: '6 hours ago',
        validUntil: 'Next 5 days',
        probability: 60,
        impact: ['Heavy rainfall', 'Strong winds', 'Coastal flooding'],
        recommendations: ['Secure loose objects', 'Prepare evacuation plans', 'Monitor sea conditions']
      }
    ];

    const mockForecast: WeatherForecast[] = [
      {
        date: 'Today',
        temperature: { min: 24, max: 32 },
        precipitation: 80,
        windSpeed: 25,
        humidity: 85,
        conditions: 'Heavy Rain',
        risk: 'high'
      },
      {
        date: 'Tomorrow',
        temperature: { min: 23, max: 30 },
        precipitation: 60,
        windSpeed: 20,
        humidity: 80,
        conditions: 'Moderate Rain',
        risk: 'medium'
      },
      {
        date: 'Day 3',
        temperature: { min: 25, max: 33 },
        precipitation: 30,
        windSpeed: 15,
        humidity: 75,
        conditions: 'Light Rain',
        risk: 'low'
      }
    ];

    setWeatherAlerts(mockWeatherAlerts);
    setForecast(mockForecast);
    setIsLoading(false);
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'heavy_rain': return <CloudRain className="w-5 h-5 text-blue-600" />;
      case 'flood': return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'cyclone': return <Wind className="w-5 h-5 text-purple-600" />;
      case 'heat_wave': return <Thermometer className="w-5 h-5 text-red-600" />;
      case 'drought': return <Thermometer className="w-5 h-5 text-orange-600" />;
      case 'storm': return <Wind className="w-5 h-5 text-gray-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Weather Alerts */}
      {weatherAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length > 0 && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>🌦️ WEATHER ALERT:</strong> {weatherAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length} high-priority weather warnings active
          </AlertDescription>
        </Alert>
      )}

      {/* Weather Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Active Weather Alerts
          </CardTitle>
          <CardDescription>
            Current weather warnings and their potential impact on the district
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weatherAlerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertTypeIcon(alert.type)}
                    <div>
                      <h4 className="font-medium">{alert.type.replace('_', ' ').toUpperCase()}</h4>
                      <p className="text-sm text-muted-foreground">{alert.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {alert.probability}% probability
                    </div>
                  </div>
                </div>
                
                <p className="text-sm">{alert.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium mb-2">Potential Impact</h5>
                    <ul className="space-y-1">
                      {alert.impact.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Recommendations</h5>
                    <ul className="space-y-1">
                      {alert.recommendations.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>📅 Issued: {alert.issuedAt}</span>
                  <span>⏰ Valid: {alert.validUntil}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Send Alert
                  </Button>
                  <Button size="sm" variant="outline">
                    <MapPin className="w-4 h-4 mr-2" />
                    Map View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weather Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            3-Day Weather Forecast
          </CardTitle>
          <CardDescription>
            Extended weather outlook with risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="border rounded-lg p-4 text-center">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{day.date}</h4>
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(day.risk)}`}></div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>🌡️</span>
                    <span>{day.temperature.min}° - {day.temperature.max}°C</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>💧</span>
                    <span>{day.precipitation}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>💨</span>
                    <span>{day.windSpeed} km/h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>💦</span>
                    <span>{day.humidity}%</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium">{day.conditions}</p>
                  <Badge variant="outline" className="mt-2">
                    Risk: {day.risk}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proactive Actions */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Clock className="w-5 h-5" />
            Proactive Weather Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              📊 Generate Weather Report
            </Button>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              🚨 Pre-emptive Alerts
            </Button>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              🗺️ Risk Zone Mapping
            </Button>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              📱 Public Notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
