"use client";

import { useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Users, 
  Clock, 
  Shield, 
  Car, 
  Stethoscope, 
  AlertTriangle,
  Navigation,
  Info,
  Tent,
  Ambulance,
  Flame,
  Zap
} from "lucide-react";

interface ReliefCamp {
  id: string;
  name: string;
  type: 'temporary' | 'permanent' | 'mobile';
  capacity: number;
  currentOccupancy: number;
  distance: number;
  coordinates: [number, number];
  services: string[];
  contact: string;
  status: 'open' | 'full' | 'closed';
  lastUpdated: string;
}

interface SafePoint {
  id: string;
  name: string;
  type: 'assembly' | 'evacuation' | 'shelter' | 'medical' | 'command';
  coordinates: [number, number];
  capacity: number;
  features: string[];
  status: 'safe' | 'warning' | 'danger';
  description: string;
}

interface EmergencyService {
  id: string;
  name: string;
  type: 'medical' | 'fire' | 'police' | 'rescue' | 'transport';
  distance: number;
  coordinates: [number, number];
  contact: string;
  responseTime: string;
  status: 'available' | 'busy' | 'unavailable';
  specializations: string[];
}

export default function DashboardPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [reliefCamps, setReliefCamps] = useState<ReliefCamp[]>([]);
  const [safePoints, setSafePoints] = useState<SafePoint[]>([]);
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          generateAiInsights(latitude, longitude);
          loadLocalData(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a sample location for demo
          const defaultLocation: [number, number] = [40.7128, -74.0060];
          setUserLocation(defaultLocation);
          generateAiInsights(defaultLocation[0], defaultLocation[1]);
          loadLocalData(defaultLocation[0], defaultLocation[1]);
        }
      );
    }
  }, []);

  const generateAiInsights = (lat: number, lng: number) => {
    // Simulate AI-generated insights based on location
    console.log(`Generating AI insights for location: ${lat}, ${lng}`);
    const insights = [
      "🚨 3 relief camps within 5km radius - all currently accepting evacuees",
      "🏥 Medical services available at Central Park Assembly Point (2.1km away)",
      "⚠️ Avoid downtown area - flooding reported, use elevated routes",
      "🆘 Nearest emergency shelter: Community Center (1.8km) - 85% capacity",
      "🚑 Ambulance response time: 8-12 minutes in your area",
      "📡 Communication hub active at City Hall - emergency broadcasts ongoing"
    ];
    setAiInsights(insights);
  };

  const loadLocalData = (lat: number, lng: number) => {
    // Simulate loading local data based on user location
    console.log(`Loading data for location: ${lat}, ${lng}`);
    
    // Generate mock data around the user's location
    const mockReliefCamps: ReliefCamp[] = [
      {
        id: '1',
        name: 'Central Park Relief Camp',
        type: 'temporary',
        capacity: 500,
        currentOccupancy: 320,
        distance: 2.1,
        coordinates: [lat + 0.01, lng - 0.01],
        services: ['Food', 'Water', 'Medical', 'Shelter', 'Communication'],
        contact: '+1 (555) 123-4567',
        status: 'open',
        lastUpdated: '2 minutes ago'
      },
      {
        id: '2',
        name: 'Community Center Shelter',
        type: 'permanent',
        capacity: 300,
        currentOccupancy: 255,
        distance: 1.8,
        coordinates: [lat - 0.008, lng + 0.005],
        services: ['Food', 'Water', 'Medical', 'Shelter', 'Childcare'],
        contact: '+1 (555) 234-5678',
        status: 'open',
        lastUpdated: '5 minutes ago'
      },
      {
        id: '3',
        name: 'Mobile Medical Unit Alpha',
        type: 'mobile',
        capacity: 50,
        currentOccupancy: 12,
        distance: 0.8,
        coordinates: [lat + 0.005, lng + 0.003],
        services: ['Medical', 'First Aid', 'Emergency Care'],
        contact: '+1 (555) 345-6789',
        status: 'open',
        lastUpdated: '1 minute ago'
      }
    ];

    const mockSafePoints: SafePoint[] = [
      {
        id: '1',
        name: 'Central Park Assembly Point',
        type: 'assembly',
        coordinates: [lat + 0.01, lng - 0.01],
        capacity: 1000,
        features: ['Flood-proof', 'Earthquake-resistant', 'Emergency power', 'Water supply'],
        status: 'safe',
        description: 'Primary assembly point with reinforced structures and emergency supplies'
      },
      {
        id: '2',
        name: 'City Hall Command Center',
        type: 'command',
        coordinates: [lat - 0.005, lng + 0.008],
        capacity: 200,
        features: ['Communication hub', 'Emergency operations', 'Weather monitoring', 'Backup power'],
        status: 'safe',
        description: 'Emergency operations command center with full communication capabilities'
      },
      {
        id: '3',
        name: 'High School Gymnasium',
        type: 'evacuation',
        coordinates: [lat + 0.015, lng + 0.012],
        capacity: 800,
        features: ['Storm shelter', 'Medical facilities', 'Food storage', 'Emergency lighting'],
        status: 'safe',
        description: 'Designated storm shelter with medical support facilities'
      }
    ];

    const mockEmergencyServices: EmergencyService[] = [
      {
        id: '1',
        name: 'City Emergency Medical Services',
        type: 'medical',
        distance: 1.2,
        coordinates: [lat + 0.006, lng - 0.004],
        contact: '+1 (555) 911-0000',
        responseTime: '8-12 minutes',
        status: 'available',
        specializations: ['Trauma care', 'Emergency transport', 'Field medicine']
      },
      {
        id: '2',
        name: 'Fire Station #3',
        type: 'fire',
        distance: 2.5,
        coordinates: [lat - 0.012, lng + 0.015],
        contact: '+1 (555) 911-0001',
        responseTime: '5-8 minutes',
        status: 'available',
        specializations: ['Fire suppression', 'Rescue operations', 'Hazardous materials']
      },
      {
        id: '3',
        name: 'Rescue Team Bravo',
        type: 'rescue',
        distance: 3.1,
        coordinates: [lat + 0.018, lng - 0.020],
        contact: '+1 (555) 911-0002',
        responseTime: '10-15 minutes',
        status: 'available',
        specializations: ['Urban search', 'Water rescue', 'Technical rescue']
      }
    ];

    setReliefCamps(mockReliefCamps);
    setSafePoints(mockSafePoints);
    setEmergencyServices(mockEmergencyServices);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'safe':
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'full':
      case 'warning':
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'closed':
      case 'danger':
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
      case 'safe':
      case 'available':
        return <Shield className="w-4 h-4" />;
      case 'full':
      case 'warning':
      case 'busy':
        return <AlertTriangle className="w-4 h-4" />;
      case 'closed':
      case 'danger':
      case 'unavailable':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">Loading emergency dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
            InfyRescue
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
            <ThemeSwitcher />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Emergency Response Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-powered insights and real-time information about local relief resources, safe zones, and emergency services
          </p>
          {userLocation && (
            <p className="text-sm text-muted-foreground mt-2">
              📍 Your location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
            </p>
          )}
        </div>

        {/* AI Insights Banner */}
        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>🤖 AI Emergency Assistant:</strong> {aiInsights[0]}
          </AlertDescription>
        </Alert>

        {/* Main Dashboard Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="relief-camps">Relief Camps</TabsTrigger>
            <TabsTrigger value="safe-points">Safe Points</TabsTrigger>
            <TabsTrigger value="services">Emergency Services</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Insights Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  AI Emergency Insights
                </CardTitle>
                <CardDescription>
                  Real-time analysis and recommendations for your current situation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-muted-foreground">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Relief Camps</CardTitle>
                  <Tent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reliefCamps.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Within 5km radius
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Safe Points</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safePoints.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Disaster-proof locations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emergency Services</CardTitle>
                  <Ambulance className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emergencyServices.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Available for response
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reliefCamps.reduce((sum, camp) => sum + camp.capacity, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    People can be accommodated
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Emergency Response Map
                </CardTitle>
                <CardDescription>
                  View all relief camps, safe points, and emergency services in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Interactive Map Coming Soon</p>
                    <p className="text-sm text-muted-foreground">
                      This will show real-time locations of all emergency resources
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relief Camps Tab */}
          <TabsContent value="relief-camps" className="space-y-6">
            <div className="grid gap-6">
              {reliefCamps.map((camp) => (
                <Card key={camp.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Tent className="w-5 h-5 text-blue-600" />
                          {camp.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {camp.distance}km away
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {camp.currentOccupancy}/{camp.capacity} occupied
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(camp.status)}>
                        {getStatusIcon(camp.status)}
                        {camp.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {camp.services.map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>📞 {camp.contact}</span>
                        <span>🕒 Updated {camp.lastUpdated}</span>
                      </div>

                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(camp.currentOccupancy / camp.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Capacity: {Math.round((camp.currentOccupancy / camp.capacity) * 100)}% full
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Safe Points Tab */}
          <TabsContent value="safe-points" className="space-y-6">
            <div className="grid gap-6">
              {safePoints.map((point) => (
                <Card key={point.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          {point.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {point.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(point.status)}>
                        {getStatusIcon(point.status)}
                        {point.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {point.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Details</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Capacity: {point.capacity.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Type: {point.type}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Emergency Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid gap-6">
              {emergencyServices.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {service.type === 'medical' && <Stethoscope className="w-5 h-5 text-red-600" />}
                          {service.type === 'fire' && <Flame className="w-5 h-5 text-orange-600" />}
                          {service.type === 'police' && <Shield className="w-5 h-5 text-blue-600" />}
                          {service.type === 'rescue' && <Users className="w-5 h-5 text-green-600" />}
                          {service.type === 'transport' && <Car className="w-5 h-5 text-purple-600" />}
                          {service.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {service.distance}km away
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.responseTime} response
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {getStatusIcon(service.status)}
                        {service.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {service.specializations.map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>📞 {service.contact}</span>
                        <Button size="sm" variant="outline">
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Directions
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Emergency Actions */}
        <div className="mt-12">
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertTriangle className="w-5 h-5" />
                Need Immediate Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  <Link href="/help">
                    🚨 Emergency Help Form
                  </Link>
                </Button>
                <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                  📞 Call 911
                </Button>
                <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                  📱 Emergency Contacts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 InfyRescue. All rights reserved.</p>
            <p className="text-sm mt-2">
              Real-time emergency response coordination powered by AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
