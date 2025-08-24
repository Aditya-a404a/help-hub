"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { disasterAPI } from "@/lib/disaster-api";
import { toast } from "sonner";
import {
  Navigation,
  MapPin,
  Clock,
  Route,
  AlertTriangle,
  RefreshCw,
  X,
  Car,
  Footprints,
  Bike,
} from "lucide-react";

// Import Leaflet dynamically to avoid SSR issues
let L: any;

// Load Leaflet CSS in head
if (
  typeof window !== "undefined" &&
  !document.querySelector('link[href*="leaflet"]')
) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
  link.integrity =
    "sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==";
  link.crossOrigin = "";
  document.head.appendChild(link);
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  name?: string;
}

interface RouteResponse {
  success: boolean;
  route: {
    type: string;
    features: Array<{
      type: string;
      properties: {
        distance: number;
        duration: number;
      };
      geometry: {
        type: string;
        coordinates: number[][];
      };
    }>;
  };
  distance_km: number;
  duration_minutes: number;
  coordinates: number[][];
}

interface RouteFinderProps {
  className?: string;
}

const RouteFinder = ({ className }: RouteFinderProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Route state
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Form state
  const [profile, setProfile] = useState("driving-car");
  const [preferences, setPreferences] = useState({
    avoid_flooded_areas: true,
    prefer_safe_routes: true,
    max_distance_km: 50.0,
  });

  // Map markers
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || isMapLoaded) return;

    const initMap = async () => {
      try {
        // Dynamically import Leaflet
        const Leaflet = await import("leaflet");
        L = Leaflet.default;

        // Fix Leaflet icon issues
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // Create map centered on Chennai
        const map = L.map(mapRef.current).setView([13.0827, 80.2707], 12);

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        // Handle map clicks
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          handleMapClick(lat, lng);
        });

        mapInstanceRef.current = map;
        setIsMapLoaded(true);
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [isMapLoaded]);

  // Handle map click to set start/end points
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (!startPoint) {
        setStartPoint({ latitude: lat, longitude: lng });
        addMarker(lat, lng, "start");
      } else if (!endPoint) {
        setEndPoint({ latitude: lat, longitude: lng });
        addMarker(lat, lng, "end");
      } else {
        // Reset and set new start point
        clearMarkers();
        setStartPoint({ latitude: lat, longitude: lng });
        setEndPoint(null);
        setRouteResult(null);
        addMarker(lat, lng, "start");
      }
    },
    [startPoint, endPoint]
  );

  // Add marker to map
  const addMarker = useCallback(
    (lat: number, lng: number, type: "start" | "end") => {
      if (!mapInstanceRef.current || !L) return;

      const color = type === "start" ? "#16a34a" : "#dc2626";
      const icon = L.divIcon({
        className: "custom-route-marker",
        html: `
          <div style="
            background: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="color: white; font-size: 12px; font-weight: bold;">
              ${type === "start" ? "S" : "E"}
            </span>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(
        mapInstanceRef.current
      );

      if (type === "start") {
        startMarkerRef.current = marker;
      } else {
        endMarkerRef.current = marker;
      }

      // Fit map to show both markers
      if (startMarkerRef.current && endMarkerRef.current) {
        const group = L.featureGroup([
          startMarkerRef.current,
          endMarkerRef.current,
        ]);
        mapInstanceRef.current.fitBounds(group.getBounds(), {
          padding: [20, 20],
        });
      }
    },
    []
  );

  // Clear all markers and route
  const clearMarkers = useCallback(() => {
    if (startMarkerRef.current) {
      mapInstanceRef.current?.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      mapInstanceRef.current?.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }
    if (routeLayerRef.current) {
      mapInstanceRef.current?.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
  }, []);

  // Calculate route
  const calculateRoute = useCallback(async () => {
    if (!startPoint || !endPoint) {
      toast.error("Please select both start and end points");
      return;
    }

    setIsCalculating(true);
    try {
      const response = await disasterAPI.findRoute({
        start_latitude: startPoint.latitude,
        start_longitude: startPoint.longitude,
        end_latitude: endPoint.latitude,
        end_longitude: endPoint.longitude,
        profile,
        preference: preferences.prefer_safe_routes ? "fastest" : "shortest",
      });

      if (response.success) {
        setRouteResult(response);
        displayRoute(response.route);
        toast.success("Route calculated successfully!");
      } else {
        toast.error("Failed to calculate route");
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      toast.error("Error calculating route");
    } finally {
      setIsCalculating(false);
    }
  }, [startPoint, endPoint, profile, preferences]);

  // Display route on map
  const displayRoute = useCallback((routeData: any) => {
    if (!mapInstanceRef.current || !routeData || !L) return;

    // Remove existing route
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
    }

    // Add new route
    const routeLayer = L.geoJSON(routeData, {
      style: {
        color: "#3b82f6",
        weight: 4,
        opacity: 0.8,
      },
    }).addTo(mapInstanceRef.current);

    routeLayerRef.current = routeLayer;

    // Fit map to show entire route
    mapInstanceRef.current.fitBounds(routeLayer.getBounds(), {
      padding: [20, 20],
    });
  }, []);

  // Reset everything
  const resetRoute = useCallback(() => {
    clearMarkers();
    setStartPoint(null);
    setEndPoint(null);
    setRouteResult(null);
  }, [clearMarkers]);

  // Use current location for start point
  const useCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setStartPoint({ latitude, longitude });
          addMarker(latitude, longitude, "start");
          toast.success("Current location set as start point");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get current location");
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  }, [addMarker]);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          Route Finder
        </CardTitle>
        <CardDescription>
          Find the safest route between two points
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Interactive Map */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Points</Label>
          <div className="h-64 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 relative">
            {!isMapLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">
                    Loading map...
                  </p>
                </div>
              </div>
            ) : (
              <div ref={mapRef} className="w-full h-full rounded-lg" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Click on the map to set start (green) and end (red) points
          </p>
        </div>

        {/* Current Location Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={useCurrentLocation}
          className="w-full"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Use Current Location
        </Button>

        {/* Route Configuration */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Route Settings</Label>

          {/* Profile Selection */}
          <div className="space-y-2">
            <Label className="text-xs">Transport Mode</Label>
            <Select value={profile} onValueChange={setProfile}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driving-car">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Driving
                  </div>
                </SelectItem>
                <SelectItem value="foot-walking">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4" />
                    Walking
                  </div>
                </SelectItem>
                <SelectItem value="cycling-regular">
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4" />
                    Cycling
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <Label className="text-xs">Preferences</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="avoid_flooded"
                  checked={preferences.avoid_flooded_areas}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      avoid_flooded_areas: !!checked,
                    }))
                  }
                />
                <Label htmlFor="avoid_flooded" className="text-xs">
                  Avoid flooded areas
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prefer_safe"
                  checked={preferences.prefer_safe_routes}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      prefer_safe_routes: !!checked,
                    }))
                  }
                />
                <Label htmlFor="prefer_safe" className="text-xs">
                  Prefer safe routes
                </Label>
              </div>
            </div>
          </div>

          {/* Max Distance */}
          <div className="space-y-2">
            <Label className="text-xs">Max Distance (km)</Label>
            <Input
              type="number"
              value={preferences.max_distance_km}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  max_distance_km: parseFloat(e.target.value) || 50,
                }))
              }
              className="h-8"
              min="1"
              max="200"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={calculateRoute}
            disabled={!startPoint || !endPoint || isCalculating}
            className="flex-1"
            size="sm"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Route className="w-4 h-4 mr-2" />
                Find Route
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetRoute} size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Route Results */}
        {routeResult && (
          <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Route Found</span>
              <Badge variant="secondary" className="text-xs">
                {profile.replace("-", " ")}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span>{routeResult.distance_km.toFixed(1)} km</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span>{routeResult.duration_minutes} min</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>
                  Start: {startPoint?.latitude.toFixed(4)},{" "}
                  {startPoint?.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>
                  End: {endPoint?.latitude.toFixed(4)},{" "}
                  {endPoint?.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click on map to set start point (green marker)</p>
          <p>• Click again to set end point (red marker)</p>
          <p>• Use "Find Route" to calculate the safest path</p>
          <p>• Route will avoid flooded areas and prefer safe zones</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteFinder;
