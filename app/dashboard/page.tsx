"use client";

import { useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/hooks/useAuth";
import { disasterAPI } from "@/lib/disaster-api";
import { useTranslation } from "@/lib/i18n";
import AuthModal from "@/components/auth-modal";
import { LanguageSwitcher } from "@/components/language-switcher";
import WeatherWidget from "@/components/ui/weather-widget";
import { 
  MapPin, 
  Users, 
  Shield, 
  Stethoscope, 
  AlertTriangle,
  Navigation,
  Activity,
  Satellite,
  Radio,
  Database,
  BarChart3,
  Bell,
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  Eye,
  Wifi,
  Flame,
  Search,
  Filter,
  RefreshCw,
  X
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the Chennai map component to avoid SSR issues
const ChennaiMapComponent = dynamic(() => import("@/components/ui/chennai-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-xs text-muted-foreground">Loading Map...</p>
      </div>
    </div>
  ),
});

// Dynamically import the Gemini chat component
const GeminiChatComponent = dynamic(() => import("@/components/gemini-chat"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-xs text-muted-foreground">Loading Gemini Chat...</p>
      </div>
    </div>
  ),
});

interface DisasterAlert {
  id: string;
  type: 'flood' | 'earthquake' | 'cyclone' | 'fire' | 'landslide' | 'drought';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  coordinates: [number, number];
  description: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'monitoring';
  affectedPopulation: number;
  responseLevel: 'green' | 'yellow' | 'orange' | 'red';
}

interface ResponseTeam {
  id: string;
  name: string;
  type: 'medical' | 'rescue' | 'fire' | 'police' | 'civil' | 'technical';
  location: string;
  coordinates: [number, number];
  status: 'available' | 'deployed' | 'returning' | 'maintenance';
  personnel: number;
  vehicles: number;
  specializations: string[];
  contact: string;
  lastUpdate: string;
}

interface ResourceInventory {
  id: string;
  category: 'medical' | 'food' | 'water' | 'shelter' | 'transport' | 'communication';
  item: string;
  quantity: number;
  unit: string;
  location: string;
  expiryDate?: string;
  status: 'available' | 'low' | 'depleted' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface CommunicationChannel {
  id: string;
  type: 'radio' | 'satellite' | 'mobile' | 'internet' | 'emergency_broadcast';
  status: 'active' | 'intermittent' | 'down' | 'maintenance';
  coverage: string;
  uptime: number;
  lastTest: string;
  backup: boolean;
}

export default function DDMADashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const t = useTranslation();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [disasterAlerts, setDisasterAlerts] = useState<DisasterAlert[]>([]);
  const [responseTeams, setResponseTeams] = useState<ResponseTeam[]>([]);
  const [resourceInventory, setResourceInventory] = useState<ResourceInventory[]>([]);
  const [communicationChannels, setCommunicationChannels] = useState<CommunicationChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [districtName] = useState("Chennai Metropolitan Region");
  const [currentTime] = useState(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<DisasterAlert | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    alerts: DisasterAlert[];
    teams: ResponseTeam[];
    resources: ResourceInventory[];
    communications: CommunicationChannel[];
  }>({
    alerts: [],
    teams: [],
    resources: [],
    communications: []
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadDDMAData();
  }, [isAuthenticated]);

  // Listen for auth modal events
  useEffect(() => {
    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    document.addEventListener('openAuthModal', handleOpenAuthModal);

    return () => {
      document.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, []);

  const loadDDMAData = async () => {
    if (!isAuthenticated) {
      // If not authenticated, set empty arrays and show sign-in prompt
      setDisasterAlerts([]);
      setResponseTeams([]);
      setResourceInventory([]);
      setCommunicationChannels([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Load real disaster alerts (flood alerts)
      const alertsResponse = await disasterAPI.getFloodAlerts('high', 'Chennai', 10);
      if (alertsResponse.success) {
        const transformedAlerts: DisasterAlert[] = alertsResponse.alerts.map(alert => ({
          id: alert.id,
          type: 'flood',
          severity: alert.severity_level as 'low' | 'medium' | 'high' | 'critical',
          location: alert.district,
          coordinates: [alert.latitude, alert.longitude] as [number, number],
          description: `Flood alert for ${alert.district}. Probability: ${alert.flood_probability}%`,
          timestamp: new Date(alert.created_at).toLocaleString(),
          status: 'active',
          affectedPopulation: Math.round(alert.affected_area_km2 * 1000), // Estimate population from area
          responseLevel: alert.severity_level === 'high' ? 'red' : alert.severity_level === 'medium' ? 'yellow' : 'green'
        }));
        setDisasterAlerts(transformedAlerts);
      }

      // Load relief centers as response teams
      const reliefResponse = await disasterAPI.getReliefCenters('Chennai', true);
      if (reliefResponse.success) {
        const transformedTeams: ResponseTeam[] = reliefResponse.data.map(center => ({
          id: center.id,
          name: center.name,
          type: 'rescue',
          location: center.address,
          coordinates: [center.latitude, center.longitude] as [number, number],
          status: center.is_active ? 'available' : 'maintenance',
          personnel: center.current_occupancy,
          vehicles: 0, // Not available in API
          specializations: ['Emergency shelter', 'Food distribution', 'Medical aid'],
          contact: center.phone || 'Contact via DDMA',
          lastUpdate: new Date(center.updated_at || center.created_at).toLocaleString()
        }));
        setResponseTeams(transformedTeams);
      }

      // Load amenities as resource inventory
      const amenitiesResponse = await disasterAPI.getAmenities('hospital', 'active', 10);
      if (amenitiesResponse.success) {
        const transformedResources: ResourceInventory[] = amenitiesResponse.data.map(amenity => ({
          id: amenity._id,
          category: 'medical',
          item: amenity.amenity_type,
          quantity: amenity.resources?.beds || 0,
          unit: 'beds',
          location: amenity.name,
          status: 'available',
          priority: 'medium'
        }));
        setResourceInventory(transformedResources);
      }

      // Set mock communication channels for now (no API available)
      const mockCommunicationChannels: CommunicationChannel[] = [
        {
          id: '1',
          type: 'emergency_broadcast',
          status: 'active',
          coverage: 'Chennai Metropolitan Region',
          uptime: 99.8,
          lastTest: '2 hours ago',
          backup: true
        },
        {
          id: '2',
          type: 'radio',
          status: 'active',
          coverage: 'Greater Chennai',
          uptime: 98.5,
          lastTest: '4 hours ago',
          backup: false
        }
      ];
      setCommunicationChannels(mockCommunicationChannels);

    } catch (error) {
      console.error('Error loading DDMA data:', error);
      
      // Fall back to empty arrays on error
      setDisasterAlerts([]);
      setResponseTeams([]);
      setResourceInventory([]);
      setCommunicationChannels([]);
    } finally {
      setIsLoading(false);
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

  const getResponseLevelColor = (level: string) => {
    switch (level) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Search function
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults({
        alerts: [],
        teams: [],
        resources: [],
        communications: []
      });
      setIsSearching(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    setIsSearching(true);

    // Search in disaster alerts
    const filteredAlerts = disasterAlerts.filter(alert => 
      alert.type.toLowerCase().includes(lowerQuery) ||
      alert.location.toLowerCase().includes(lowerQuery) ||
      alert.description.toLowerCase().includes(lowerQuery) ||
      alert.severity.toLowerCase().includes(lowerQuery) ||
      alert.status.toLowerCase().includes(lowerQuery)
    );

    // Search in response teams
    const filteredTeams = responseTeams.filter(team => 
      team.name.toLowerCase().includes(lowerQuery) ||
      team.type.toLowerCase().includes(lowerQuery) ||
      team.location.toLowerCase().includes(lowerQuery) ||
      team.specializations.some(spec => spec.toLowerCase().includes(lowerQuery)) ||
      team.status.toLowerCase().includes(lowerQuery)
    );

    // Search in resource inventory
    const filteredResources = resourceInventory.filter(resource => 
      resource.item.toLowerCase().includes(lowerQuery) ||
      resource.category.toLowerCase().includes(lowerQuery) ||
      resource.location.toLowerCase().includes(lowerQuery) ||
      resource.status.toLowerCase().includes(lowerQuery) ||
      resource.priority.toLowerCase().includes(lowerQuery)
    );

    // Search in communication channels
    const filteredCommunications = communicationChannels.filter(channel => 
      channel.type.toLowerCase().includes(lowerQuery) ||
      channel.coverage.toLowerCase().includes(lowerQuery) ||
      channel.status.toLowerCase().includes(lowerQuery)
    );

    // Widget-specific search terms - more precise matching
    const widgetSearchMap = {
      'Chennai Emergency Response Map': ['map', 'chennai', 'emergency', 'response'],
      'Active Danger Areas': ['active', 'danger', 'areas'],
      'Utility Vehicles': ['utility', 'vehicles', 'vehicles status'],
      'Authority Control': ['authority', 'control'],
      'Emergency Response Status': ['emergency', 'response', 'status'],
      'Weather Information': ['weather', 'information']
    };

    // Check if query matches any specific widget
    const matchingWidgets = Object.entries(widgetSearchMap).filter(([, searchTerms]) =>
      searchTerms.some(term => term.toLowerCase().includes(lowerQuery) || lowerQuery.includes(term.toLowerCase()))
    );

    // If it's a widget match, show all data to highlight the relevant widget
    if (matchingWidgets.length > 0) {
      setSearchResults({
        alerts: disasterAlerts,
        teams: responseTeams,
        resources: resourceInventory,
        communications: communicationChannels
      });
    } else {
      setSearchResults({
        alerts: filteredAlerts,
        teams: filteredTeams,
        resources: filteredResources,
        communications: filteredCommunications
      });
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({
      alerts: [],
      teams: [],
      resources: [],
      communications: []
    });
    setIsSearching(false);
  };

  // Close Gemini modal
  const closeGeminiModal = () => {
    setIsGeminiModalOpen(false);
    setSelectedIncident(null);
  };

  // Prevent body scroll when modal is open and handle keyboard events
  useEffect(() => {
    if (isGeminiModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';

      // Handle Escape key to close modal
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeGeminiModal();
        }
      };

      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [isGeminiModalOpen]);



  // Check if a widget should be highlighted based on search
  const shouldHighlightWidget = (widgetTitle: string) => {
    if (!isSearching || !searchQuery.trim()) return false;
    
    const widgetSearchMap = {
      'Chennai Emergency Response Map': ['map', 'chennai', 'emergency', 'response'],
      'Active Danger Areas': ['active', 'danger', 'areas'],
      'Utility Vehicles': ['utility', 'vehicles', 'vehicles status'],
      'Authority Control': ['authority', 'control'],
      'Emergency Response Status': ['emergency', 'response', 'status'],
      'Weather Information': ['weather', 'information']
    };
    
    const searchTerms = widgetSearchMap[widgetTitle as keyof typeof widgetSearchMap];
    if (!searchTerms) return false;
    
    const lowerQuery = searchQuery.toLowerCase();
    
    return searchTerms.some(term => 
      term.toLowerCase().includes(lowerQuery) || 
      lowerQuery.includes(term.toLowerCase())
    );
  };

  // Check if a widget should be visible based on search
  const shouldShowWidget = (widgetTitle: string) => {
    if (!isSearching || !searchQuery.trim()) return true;
    return shouldHighlightWidget(widgetTitle);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar - Like IDE title bar */}
      <div className="h-12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          
          <h1 className="text-sm font-medium text-foreground">DDMA Command Center</h1>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{districtName}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-muted-foreground">{currentTime}</div>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Welcome, {user.username}</span>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-6"
                onClick={logout}
              >
                {t.signOut}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6"
              onClick={() => setIsAuthModalOpen(true)}
            >
              {t.signIn}
            </Button>
          )}
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>

      {/* Main Content Area - Non-scrollable */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Like IDE file explorer */}
        <div className="w-80 bg-muted/30 border-r flex flex-col overflow-hidden">
          {/* Quick Stats */}
          <div className="p-4 border-b flex-shrink-0">
            <h3 className="text-sm font-semibold mb-3 text-foreground">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Active Alerts</span>
                <Badge variant="destructive" className="text-xs">
                  {disasterAlerts.filter(a => a.status === 'active').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Deployed Teams</span>
                <Badge variant="secondary" className="text-xs">
                  {responseTeams.filter(t => t.status === 'deployed').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Affected Population</span>
                <Badge variant="outline" className="text-xs">
                  {(disasterAlerts.reduce((sum, alert) => sum + alert.affectedPopulation, 0) / 1000).toFixed(1)}K
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Comm Status</span>
                <Badge variant="default" className="text-xs">
                  {communicationChannels.filter(c => c.status === 'active').length}/{communicationChannels.length}
                </Badge>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts, teams, resources..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 h-9 text-sm"
              />
              {searchQuery && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                  onClick={clearSearch}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {isSearching && (
              <div className="mt-2 text-xs text-muted-foreground">
                Found: {searchResults.alerts.length + searchResults.teams.length + searchResults.resources.length + searchResults.communications.length} results
              </div>
            )}
          </div>

          {/* Navigation Tabs - Scrollable */}
          <div className="flex-1 p-4 overflow-y-auto">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-1 gap-1 bg-transparent p-0">
                <TabsTrigger 
                  value="overview" 
                  className="justify-start text-left h-12 data-[state=active]:bg-background data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:pl-3 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  {t.overview}
                  {isSearching && searchResults.alerts.length > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {searchResults.alerts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="alerts" 
                  className="justify-start text-left h-12 data-[state=active]:bg-background data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:pl-3 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {t.alerts}
                  {isSearching && searchResults.alerts.length > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {searchResults.alerts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="teams" 
                  className="justify-start text-left h-12 data-[state=active]:bg-background data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:pl-3 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t.responseTeams}
                  {isSearching && searchResults.teams.length > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {searchResults.teams.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  className="justify-start text-left h-12 data-[state=active]:bg-background data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:pl-3 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {t.resources}
                  {isSearching && searchResults.resources.length > 0 && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {searchResults.resources.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="communications" 
                  className="justify-start text-left h-12 data-[state=active]:bg-background data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:pl-3 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  {t.communications}
                  {isSearching && searchResults.communications.length > 0 && (
                    <Badge variant="default" className="ml-auto text-xs">
                      {searchResults.communications.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header with Red Alert Bar */}
          <div className="border-b bg-background/50">
            {/* Red Alert Bar - Only show if there are active critical incidents */}
            {(() => {
              const criticalIncidents = disasterAlerts.filter(alert => alert.status === 'active' && alert.severity === 'critical');
              if (criticalIncidents.length > 0) {
                return (
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 flex items-center justify-between text-sm animate-pulse border-b border-red-500">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-bold">🚨 CRITICAL ALERT: {criticalIncidents.length} Active Emergency</span>
                        <span className="ml-2 opacity-90">
                          {criticalIncidents[0].location} - {criticalIncidents[0].affectedPopulation.toLocaleString()} affected
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white text-red-700 hover:bg-red-50 font-semibold text-xs h-7"
                      onClick={() => {
                        const incident = criticalIncidents[0];
                        setSelectedIncident(incident);
                        setIsGeminiModalOpen(true);
                      }}
                    >
                      Send Support 
                    </Button>
                  </div>
                );
              }
              return null;
            })()}

            {/* Main Header */}
            <div className="h-12 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium capitalize">{selectedTab}</h2>
                <Badge variant="outline" className="text-xs">
                  {selectedTab === 'overview' && 'Live'}
                  {selectedTab === 'alerts' && (isSearching ? searchResults.alerts.length : disasterAlerts.filter(a => a.status === 'active').length) + ' Active'}
                  {selectedTab === 'teams' && (isSearching ? searchResults.teams.length : responseTeams.filter(t => t.status === 'deployed').length) + ' Deployed'}
                  {selectedTab === 'resources' && (isSearching ? searchResults.resources.length : resourceInventory.length) + ' Items'}
                  {selectedTab === 'communications' && (isSearching ? searchResults.communications.length : communicationChannels.filter(c => c.status === 'active').length) + ' Active'}
                </Badge>
                {isSearching && (
                  <Badge variant="secondary" className="text-xs">
                    Search: &quot;{searchQuery}&quot;
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-hidden p-4">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
              <TabsContent value="overview" className="h-full m-0">
                {/* Red Alert Bar - Most Recent Incident With Action Buttons */}
                {/* Overview Tab */}
                <div className="h-full grid grid-cols-2 gap-4">
                  {/* Map Section */}
                  {shouldShowWidget('Chennai Emergency Response Map') && (
                    <Card className={`h-full transition-all duration-200 ${
                      shouldHighlightWidget('Chennai Emergency Response Map') 
                        ? 'border-2 border-primary shadow-lg bg-primary/5' 
                        : ''
                    }`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          Chennai Emergency Response Map
                          {shouldHighlightWidget('Chennai Emergency Response Map') && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              Search Match
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-3rem)]">
                        <ChennaiMapComponent />
                      </CardContent>
                    </Card>
                  )}

                  {/* Alerts & Activity - Scrollable */}
                  <div className="h-full overflow-y-auto space-y-4 pr-2">
                    {/* Danger Areas Overview */}
                    {shouldShowWidget('Active Danger Areas') && (
                      <Card className={`transition-all duration-200 ${
                        shouldHighlightWidget('Active Danger Areas') 
                          ? 'border-2 border-primary shadow-lg bg-primary/5' 
                          : ''
                      }`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            Active Danger Areas
                            {shouldHighlightWidget('Active Danger Areas') && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                Search Match
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded text-center">
                              <div className="text-red-600 font-bold text-lg">
                                {isSearching ? searchResults.alerts.filter(a => a.status === 'active').length : disasterAlerts.filter(a => a.status === 'active').length}
                              </div>
                              <div className="text-red-600">Active</div>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded text-center">
                              <div className="text-orange-600 font-bold text-lg">
                                {isSearching 
                                  ? (searchResults.alerts.reduce((sum, alert) => sum + alert.affectedPopulation, 0) / 1000).toFixed(1)
                                  : (disasterAlerts.reduce((sum, alert) => sum + alert.affectedPopulation, 0) / 1000).toFixed(1)
                                }K
                              </div>
                              <div className="text-orange-600">Affected</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {(isSearching ? searchResults.alerts : disasterAlerts).slice(0, 3).map((alert) => (
                              <div key={alert.id} className={`flex items-center gap-2 p-2 rounded ${
                                alert.severity === 'critical' ? 'bg-red-50 dark:bg-red-950/20' :
                                alert.severity === 'high' ? 'bg-orange-50 dark:bg-orange-950/20' :
                                'bg-yellow-50 dark:bg-yellow-950/20'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  alert.severity === 'critical' ? 'bg-red-500' :
                                  alert.severity === 'high' ? 'bg-orange-500' :
                                  'bg-yellow-500'
                                }`}></div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} - {alert.severity}</p>
                                  <p className="text-xs text-muted-foreground">{alert.location} • {alert.affectedPopulation.toLocaleString()} affected</p>
                                </div>
                                <Badge className={`text-xs ${
                                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                  alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {alert.type === 'flood' ? 'District Admin' : 
                                   alert.type === 'fire' ? 'Fire Dept' : 'Civil Defense'}
                                </Badge>
                              </div>
                            ))}
                            {(isSearching ? searchResults.alerts : disasterAlerts).length === 0 && (
                              <div className="text-center text-xs text-muted-foreground py-4">
                                {isSearching ? 'No alerts match your search' : 'No active alerts'}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Utility Vehicles Status */}
                    {shouldShowWidget('Utility Vehicles') && (
                      <Card className={`transition-all duration-200 ${
                        shouldHighlightWidget('Utility Vehicles') 
                          ? 'border-2 border-primary shadow-lg bg-primary/5' 
                          : ''
                      }`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-blue-600" />
                            Utility Vehicles
                            {shouldHighlightWidget('Utility Vehicles') && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                Search Match
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded text-center">
                              <div className="text-green-600 font-bold text-lg">
                                {isSearching ? searchResults.teams.filter(t => t.status === 'deployed').length : responseTeams.filter(t => t.status === 'deployed').length}
                              </div>
                              <div className="text-green-600">Deployed</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-center">
                              <div className="text-blue-600 font-bold text-lg">
                                {isSearching ? searchResults.teams.filter(t => t.status === 'available').length : responseTeams.filter(t => t.status === 'available').length}
                              </div>
                              <div className="text-blue-600">Available</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {(isSearching ? searchResults.teams : responseTeams).slice(0, 3).map((team) => (
                              <div key={team.id} className={`flex items-center gap-2 p-2 rounded ${
                                team.status === 'deployed' ? 'bg-orange-50 dark:bg-orange-950/20' :
                                'bg-blue-50 dark:bg-blue-950/20'
                              }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  team.type === 'medical' ? 'bg-green-600' :
                                  team.type === 'fire' ? 'bg-orange-600' :
                                  'bg-blue-600'
                                }`}>
                                  <span className="text-white text-xs font-bold">
                                    {team.type === 'medical' ? 'M' : team.type === 'fire' ? 'F' : 'P'}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-medium">{team.name}</p>
                                  <p className="text-xs text-muted-foreground">{team.status} • {team.personnel} personnel</p>
                                </div>
                                <Badge className={`text-xs ${
                                  team.type === 'medical' ? 'bg-green-100 text-green-800' :
                                  team.type === 'fire' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {team.type.charAt(0).toUpperCase() + team.type.slice(1)}
                                </Badge>
                              </div>
                            ))}
                            {(isSearching ? searchResults.teams : responseTeams).length === 0 && (
                              <div className="text-center text-xs text-muted-foreground py-4">
                                {isSearching ? 'No teams match your search' : 'No teams available'}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Authority Control Summary */}
                    {shouldShowWidget('Authority Control') && (
                      <Card className={`transition-all duration-200 ${
                        shouldHighlightWidget('Authority Control') 
                          ? 'border-2 border-primary shadow-lg bg-primary/5' 
                          : ''
                      }`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-600" />
                            Authority Control
                            {shouldHighlightWidget('Authority Control') && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                Search Match
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-purple-50 dark:bg-purple-950/20 p-2 rounded text-center">
                              <div className="text-purple-600 font-bold text-lg">2</div>
                              <div className="text-purple-600">District Admin</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-center">
                              <div className="text-blue-600 font-bold text-lg">1</div>
                              <div className="text-blue-600">Police</div>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-950/20 p-2 rounded text-center">
                              <div className="text-orange-600 font-bold text-lg">1</div>
                              <div className="text-orange-600">Fire</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded text-center">
                              <div className="text-green-600 font-bold text-lg">1</div>
                              <div className="text-green-600">Medical</div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            District Authority controls 6 vehicles across 5 departments
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Additional Emergency Info */}
                    {shouldShowWidget('Emergency Response Status') && (
                      <Card className={`transition-all duration-200 ${
                        shouldHighlightWidget('Emergency Response Status') 
                          ? 'border-2 border-primary shadow-lg bg-primary/5' 
                          : ''
                      }`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-600" />
                            Emergency Response Status
                            {shouldHighlightWidget('Emergency Response Status') && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                Search Match
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                              <span className="text-xs font-medium">Medical Response</span>
                              <Badge className="text-xs bg-green-100 text-green-800">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                              <span className="text-xs font-medium">Fire Response</span>
                              <Badge className="text-xs bg-orange-100 text-orange-800">Deployed</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                              <span className="text-xs font-medium">Police Response</span>
                              <Badge className="text-xs bg-blue-100 text-blue-800">Standby</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                              <span className="text-xs font-medium">Civil Defense</span>
                              <Badge className="text-xs bg-purple-100 text-purple-800">Deployed</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Weather Widget */}
                    {shouldShowWidget('Weather Information') && (
                      <Card className={`transition-all duration-200 ${
                        shouldHighlightWidget('Weather Information') 
                          ? 'border-2 border-primary shadow-lg bg-primary/5' 
                          : ''
                      }`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            Weather Information
                            {shouldHighlightWidget('Weather Information') && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                Search Match
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <WeatherWidget />
                        </CardContent>
                      </Card>
                    )}

                    {/* No Widgets Match Message */}
                    {isSearching && searchQuery.trim() && !shouldShowWidget('Chennai Emergency Response Map') && 
                     !shouldShowWidget('Active Danger Areas') && !shouldShowWidget('Utility Vehicles') && 
                     !shouldShowWidget('Authority Control') && !shouldShowWidget('Emergency Response Status') && 
                     !shouldShowWidget('Weather Information') && (
                      <Card className="border-dashed border-2 border-muted-foreground/30">
                        <CardContent className="pt-6 pb-6">
                          <div className="text-center text-muted-foreground">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No widgets match your search</p>
                            <p className="text-sm">Try searching for: map, danger, vehicles, control, response, weather, or emergency</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="h-full m-0">
                {/* Alerts Tab */}
                <div className="h-full overflow-y-auto space-y-4 pr-2">
                  {(isSearching ? searchResults.alerts : disasterAlerts).map((alert) => (
                    <Card key={alert.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              {alert.type.toUpperCase()} - {alert.location}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">{alert.description}</CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </Badge>
                            <div className={`w-3 h-3 rounded-full ${getResponseLevelColor(alert.responseLevel)}`}></div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Impact:</span>
                            <p className="font-medium">{alert.affectedPopulation.toLocaleString()} people</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="outline" className="text-xs">{alert.status}</Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time:</span>
                            <p className="font-medium">{alert.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Alert
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <Users className="w-3 h-3 mr-1" />
                            Deploy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(isSearching ? searchResults.alerts : disasterAlerts).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {isSearching ? 'No alerts match your search' : 'No disaster alerts'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isSearching ? 'Try adjusting your search terms' : 'All clear at the moment'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="teams" className="h-full m-0">
                {/* Response Teams Tab */}
                <div className="h-full overflow-y-auto space-y-4 pr-2">
                  {(isSearching ? searchResults.teams : responseTeams).map((team) => (
                    <Card key={team.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm flex items-center gap-2">
                              {team.type === 'medical' && <Stethoscope className="w-4 h-4 text-red-600" />}
                              {team.type === 'fire' && <Flame className="w-4 h-4 text-orange-600" />}
                              {team.type === 'rescue' && <Users className="w-4 h-4 text-green-600" />}
                              {team.type === 'police' && <Shield className="w-4 h-4 text-blue-600" />}
                              {team.name}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {team.location} • {team.personnel} personnel • {team.vehicles} vehicles
                            </CardDescription>
                          </div>
                          <Badge variant={team.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                            {team.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {team.specializations.slice(0, 3).map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>📞 {team.contact}</span>
                          <span>🕒 {team.lastUpdate}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <Navigation className="w-3 h-3 mr-1" />
                            Track
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <Phone className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <FileText className="w-3 h-3 mr-1" />
                            Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(isSearching ? searchResults.teams : responseTeams).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {isSearching ? 'No teams match your search' : 'No response teams'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isSearching ? 'Try adjusting your search terms' : 'No teams currently registered'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="h-full m-0">
                {/* Resources Tab */}
                <div className="h-full overflow-y-auto space-y-4 pr-2">
                  {(isSearching ? searchResults.resources : resourceInventory).map((resource) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm">{resource.item}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {resource.location} • {resource.quantity} {resource.unit}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <Badge variant={resource.status === 'available' ? 'default' : 'destructive'} className="text-xs">
                              {resource.status}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${resource.priority === 'critical' ? 'border-red-500 text-red-600' : ''}`}>
                              {resource.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            History
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <Calendar className="w-3 h-3 mr-1" />
                            Schedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(isSearching ? searchResults.resources : resourceInventory).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {isSearching ? 'No resources match your search' : 'No resources available'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isSearching ? 'Try adjusting your search terms' : 'No resources currently in inventory'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="communications" className="h-full m-0">
                {/* Communications Tab */}
                <div className="h-full overflow-y-auto space-y-4 pr-2">
                  {(isSearching ? searchResults.communications : communicationChannels).map((channel) => (
                    <Card key={channel.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm flex items-center gap-2">
                              {channel.type === 'radio' && <Radio className="w-4 h-4 text-blue-600" />}
                              {channel.type === 'satellite' && <Satellite className="w-4 h-4 text-purple-600" />}
                              {channel.type === 'emergency_broadcast' && <Bell className="w-4 h-4 text-red-600" />}
                              {channel.type === 'mobile' && <Phone className="w-4 h-4 text-green-600" />}
                              {channel.type === 'internet' && <Wifi className="w-4 h-4 text-orange-600" />}
                              {channel.type.replace('_', ' ').toUpperCase()}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {channel.coverage} • Uptime: {channel.uptime}%
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <Badge variant={channel.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                              {channel.status}
                            </Badge>
                            {channel.backup && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-500">
                                Backup
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                          <div>
                            <span className="text-muted-foreground">Last Test:</span>
                            <p className="font-medium">{channel.lastTest}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Uptime:</span>
                            <p className="font-medium">{channel.uptime}%</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <Activity className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Monitor
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(isSearching ? searchResults.communications : communicationChannels).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">
                        {isSearching ? 'No communications match your search' : 'No communication channels'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isSearching ? 'Try adjusting your search terms' : 'No communication channels currently active'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar - Like IDE status bar */}
      <div className="h-8 bg-muted/50 border-t flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>DDMA Command Center v1.0</span>
          <span>•</span>
          <span>Connected to Emergency Network</span>
          <span>•</span>
          <span>Last Sync: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>System Status: Operational</span>
          <span>•</span>
          <span>Uptime: 99.8%</span>
        </div>
      </div>

            {/* Gemini Modal Overlay - Highest Priority */}
      {isGeminiModalOpen && selectedIncident && (
        <>
          {/* Full screen overlay to block all interactions */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999999,
              pointerEvents: 'auto'
            }}
            onClick={closeGeminiModal}
          />
          {/* Modal content */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000000,
              pointerEvents: 'none'
            }}
          >
            <div
              className="bg-background rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              style={{ pointerEvents: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <GeminiChatComponent
                incident={selectedIncident}
                responseTeams={responseTeams}
                resourceInventory={resourceInventory}
                communicationChannels={communicationChannels}
                onClose={closeGeminiModal}
                isModal={true}
              />
            </div>
          </div>
        </>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Custom Scrollbar Styles and Modal Fixes */}
      <style jsx global>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }

        /* Dark mode scrollbar */
        .dark .overflow-y-auto::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.4);
        }

        .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.6);
        }

        /* Ensure modal appears on top of all elements including maps */
        .leaflet-container {
          z-index: 1 !important;
        }

        .leaflet-control-container {
          z-index: 2 !important;
        }

        .leaflet-popup {
          z-index: 3 !important;
        }

        .leaflet-tooltip {
          z-index: 4 !important;
        }

        /* Modal overlay should be the highest priority */
        [style*="z-index: 999999"] {
          z-index: 999999 !important;
        }

        [style*="z-index: 1000000"] {
          z-index: 1000000 !important;
        }
      `}</style>
    </div>
  );
}
