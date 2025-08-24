"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { disasterAPI, RouteRequest } from "@/lib/disaster-api";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface SafePoint {
  id: string;
  name: string;
  coordinates: [number, number];
  distance: number;
  capacity: number;
  features: string[];
  type: 'amenity' | 'relief-center' | 'safe-zone';
  amenity_type?: string;
  resources?: {
    beds?: number;
    doctors?: number;
    ambulances?: number;
  };
}

interface DangerZone {
  id: string;
  name: string;
  coordinates: [number, number];
  radius: number;
  type: string;
  severity: 'high' | 'medium' | 'low';
  flood_probability?: number;
  source: 'flood-prediction' | 'user-report' | 'sensor';
}

  const EmergencyMap = () => {
  const { isAuthenticated } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [safePoints, setSafePoints] = useState<SafePoint[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [selectedSafePoint, setSelectedSafePoint] = useState<SafePoint | null>(null);
  const [routePath, setRoutePath] = useState<L.LatLng[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Create a smooth path between two points
  const createSmoothPath = useCallback((start: [number, number], end: [number, number], segments: number) => {
    const path: [number, number][] = [start];
    
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const lat = start[0] + (end[0] - start[0]) * t;
      const lng = start[1] + (end[1] - start[1]) * t;
      path.push([lat, lng]);
    }
    
    return path;
  }, []);
  
  // Create a simple safe detour around danger zones
  const createSafeDetour = useCallback((start: [number, number], end: [number, number]) => {
    // Find the safest direction to go around danger zones
    const midPoint: [number, number] = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2
    ];
    
    // Create a detour point that's offset from the direct path
    const offset = 0.002; // Small offset to avoid danger
    const detourPoint: [number, number] = [
      midPoint[0] + offset,
      midPoint[1] + offset
    ];
    
    // Create path: start -> detour -> end
    const path1 = createSmoothPath(start, detourPoint, 3);
    const path2 = createSmoothPath(detourPoint, end, 3);
    
    // Combine paths (remove duplicate detour point)
    return [...path1.slice(0, -1), ...path2];
  }, [createSmoothPath]);
  
  // Function to calculate safe route avoiding danger zones
  const calculateSafeRoute = useCallback(async (start: [number, number], end: [number, number]) => {
    console.log('calculateSafeRoute called with:', { start, end, dangerZones });

    if (!start || !end) {
      console.log('No start or end coordinates');
      return [];
    }

    // If user is not authenticated, use simple calculation
    if (!isAuthenticated) {
      console.log('User not authenticated, using simple route calculation');

      // Check if direct path intersects with any danger zones
      let isDirectPathSafe = true;
      for (const dangerZone of dangerZones) {
        const distanceToDanger = Math.sqrt(
          Math.pow(dangerZone.coordinates[0] - start[0], 2) +
          Math.pow(dangerZone.coordinates[1] - start[1], 2)
        );

        // If danger zone is close to the path, consider it unsafe
        if (distanceToDanger < (dangerZone.radius / 111000) * 2) {
          isDirectPathSafe = false;
          break;
        }
      }

      if (isDirectPathSafe) {
        return createSmoothPath(start, end, 5);
      }

      return createSafeDetour(start, end);
    }

    try {
      // Create GeoJSON for danger zones to avoid
      const avoidGeoJson = {
        type: "FeatureCollection",
        features: dangerZones.map(dangerZone => ({
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [
                dangerZone.coordinates[1] - 0.01,
                dangerZone.coordinates[0] - 0.01
              ],
              [
                dangerZone.coordinates[1] + 0.01,
                dangerZone.coordinates[0] - 0.01
              ],
              [
                dangerZone.coordinates[1] + 0.01,
                dangerZone.coordinates[0] + 0.01
              ],
              [
                dangerZone.coordinates[1] - 0.01,
                dangerZone.coordinates[0] + 0.01
              ],
              [
                dangerZone.coordinates[1] - 0.01,
                dangerZone.coordinates[0] - 0.01
              ]
            ]]
          }
        }))
      };

      const routeRequest: RouteRequest = {
        start_latitude: start[0],
        start_longitude: start[1],
        end_latitude: end[0],
        end_longitude: end[1],
        avoid_geojson: dangerZones.length > 0 ? avoidGeoJson : undefined,
        profile: 'driving-car',
        preference: 'fastest'
      };

      console.log('Requesting route from API:', routeRequest);
      const response = await disasterAPI.findRoute(routeRequest);

      if (response.success && response.route?.features?.[0]) {
        // Extract coordinates from the route GeoJSON
        const coordinates = response.route.features[0].geometry.coordinates;
        console.log('Route received from API:', coordinates);
        return coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
      } else {
        console.log('API route failed, using fallback');
        toast.error('Route calculation failed, using basic route');
        return createSmoothPath(start, end, 5);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Route calculation failed, using basic route');
      return createSmoothPath(start, end, 5);
    }
  }, [dangerZones, createSafeDetour, createSmoothPath, isAuthenticated]);

  // Function to handle safe point click
  const handleSafePointClick = useCallback(async (safePoint: SafePoint) => {
    console.log('handleSafePointClick called with:', safePoint);

    if (selectedSafePoint?.id === safePoint.id) {
      // Deselect if clicking the same point
      console.log('Deselecting safe point');
      setSelectedSafePoint(null);
      setRoutePath([]);
      return;
    }

    // Select new safe point
    console.log('Selecting new safe point:', safePoint.name);
    setSelectedSafePoint(safePoint);

    if (!userLocation) {
      console.log('No user location available');
      return;
    }

    // Calculate route asynchronously to prevent freezing
    setIsCalculatingRoute(true);

    try {
      // Use setTimeout to make it non-blocking
      setTimeout(async () => {
        try {
          console.log('Calculating route from', userLocation, 'to', safePoint.coordinates);
          const route = await calculateSafeRoute(userLocation, safePoint.coordinates);
          console.log('Route calculated:', route);
          setRoutePath(route.map(coord => L.latLng(coord[0], coord[1])));
        } catch (error) {
          console.error('Error calculating route:', error);
        } finally {
          setIsCalculatingRoute(false);
        }
      }, 10);
    } catch (error) {
      console.error('Error calculating route:', error);
      setIsCalculatingRoute(false);
    }
  }, [selectedSafePoint, userLocation, calculateSafeRoute]);

  // Calculate actual route distance and travel time
  const calculateRouteStats = (path: L.LatLng[]) => {
    if (path.length < 2) return { distance: 0, time: 0 };
    
    let totalDistance = 0;
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const distance = prev.distanceTo(curr);
      totalDistance += distance;
    }
    
    // Convert meters to kilometers
    const distanceKm = totalDistance / 1000;
    
    // Estimate travel time (walking speed: 5 km/h in emergency)
    const timeHours = distanceKm / 5;
    const timeMinutes = Math.round(timeHours * 60);
    
    return { distance: distanceKm, time: timeMinutes };
  };

  // Load real data from APIs
  const loadEmergencyData = useCallback(async (latitude: number, longitude: number) => {
    if (!isAuthenticated) {
      console.log('User not authenticated, using demo data');
      return;
    }

    setIsLoadingData(true);
    try {
      // Load amenities and relief centers
      const [amenitiesResponse, reliefCentersResponse, floodAlertsResponse] = await Promise.all([
        disasterAPI.getNearbyAmenities(latitude, longitude, 10, undefined).catch(() => null),
        disasterAPI.getNearbyReliefCenters(latitude, longitude, 10, 10).catch(() => null),
        disasterAPI.getFloodAlerts('high', 'Chennai', 10).catch(() => null)
      ]);

      const allSafePoints: SafePoint[] = [];

      // Process amenities
      if (amenitiesResponse?.success && amenitiesResponse.data) {
        const amenityPoints: SafePoint[] = amenitiesResponse.data.map(amenity => ({
          id: `amenity-${amenity._id}`,
          name: amenity.name,
          coordinates: [amenity.latitude, amenity.longitude] as [number, number],
          distance: amenity.distance_km,
          capacity: amenity.resources?.beds || 50,
          features: [
            `Type: ${amenity.amenity_type}`,
            amenity.resources?.beds ? `${amenity.resources.beds} beds` : '',
            amenity.resources?.doctors ? `${amenity.resources.doctors} doctors` : '',
            amenity.resources?.ambulances ? `${amenity.resources.ambulances} ambulances` : ''
          ].filter(Boolean),
          type: 'amenity',
          amenity_type: amenity.amenity_type,
          resources: amenity.resources
        }));
        allSafePoints.push(...amenityPoints);
      }

      // Process relief centers
      if (reliefCentersResponse?.success && reliefCentersResponse.data) {
        const reliefPoints: SafePoint[] = reliefCentersResponse.data.map(center => ({
          id: `relief-${center.id}`,
          name: center.name,
          coordinates: [center.latitude, center.longitude] as [number, number],
          distance: center.distance_km,
          capacity: center.capacity,
          features: [
            `Capacity: ${center.capacity} people`,
            `Occupancy: ${center.current_occupancy}`,
            center.is_active ? 'Active' : 'Inactive'
          ].filter(Boolean),
          type: 'relief-center'
        }));
        allSafePoints.push(...reliefPoints);
      }

      setSafePoints(allSafePoints);

      // Process flood alerts as danger zones
      if (floodAlertsResponse?.success && floodAlertsResponse.alerts) {
        const floodDangerZones: DangerZone[] = floodAlertsResponse.alerts.map(alert => ({
          id: `flood-${alert.id}`,
          name: `Flood Risk Area - ${alert.flood_probability * 100}%`,
          coordinates: [alert.latitude, alert.longitude] as [number, number],
          radius: Math.max(500, alert.affected_area_km2 * 100), // Convert km2 to meters
          type: 'Flood',
          severity: alert.severity_level as 'high' | 'medium' | 'low',
          flood_probability: alert.flood_probability,
          source: 'flood-prediction'
        }));
        setDangerZones(floodDangerZones);
      }

    } catch (error) {
      console.error('Error loading emergency data:', error);
      toast.error('Failed to load emergency data');
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          loadEmergencyData(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Chennai coordinates
          const defaultLocation: [number, number] = [13.0827, 80.2707];
          setUserLocation(defaultLocation);
          loadEmergencyData(defaultLocation[0], defaultLocation[1]);
        }
      );
    }
  }, [loadEmergencyData]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(userLocation, 15);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add user location marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="
          width: 24px; 
          height: 24px; 
          background: #2563eb; 
          border: 4px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px; 
            height: 8px; 
            background: white; 
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map);
    userMarker.bindPopup('<strong>You are here</strong><br>Current location').openPopup();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  // Add event listener for popup button clicks
  useEffect(() => {
    const handlePopupButtonClick = (event: CustomEvent) => {
      const pointId = event.detail;
      const safePoint = safePoints.find(p => p.id === pointId);
      if (safePoint) {
        console.log('Popup button clicked for:', safePoint.name);
        handleSafePointClick(safePoint);
      }
    };

    document.addEventListener('safePointClick', handlePopupButtonClick as EventListener);
    
    return () => {
      document.removeEventListener('safePointClick', handlePopupButtonClick as EventListener);
    };
  }, [safePoints, handleSafePointClick]);

  // Separate effect for adding safe points and danger zones
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || safePoints.length === 0 || dangerZones.length === 0) return;

    const map = mapInstanceRef.current;

    // Add safe point markers
    safePoints.forEach((point) => {
      const isReliefCenter = point.type === 'relief-center';
      const markerColor = isReliefCenter ? '#059669' : '#16a34a'; // emerald for relief centers, green for amenities

      const safeIcon = L.divIcon({
        className: 'custom-safe-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: ${markerColor};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              ${isReliefCenter
                ? '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>'
                : '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>'
              }
            </svg>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker(point.coordinates, { icon: safeIcon }).addTo(map);
      
      // Make marker clickable for route calculation
      marker.on('click', async () => {
        console.log('Safe point clicked:', point.name);
        await handleSafePointClick(point);
      });
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #16a34a; font-weight: 600;">${point.name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Distance:</strong> ${point.distance} km</p>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Capacity:</strong> ${point.capacity} people</p>
          <div style="margin-top: 8px;">
            <strong style="font-size: 12px;">Features:</strong>
            <ul style="margin: 4px 0 0 0; padding-left: 16px; font-size: 12px;">
              ${point.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <button 
              onclick="document.dispatchEvent(new CustomEvent('safePointClick', {detail: '${point.id}'}))"
              style="
                background: #16a34a; 
                color: white; 
                border: none; 
                padding: 6px 12px; 
                border-radius: 4px; 
                cursor: pointer;
                font-size: 12px;
                width: 100%;
              "
            >
              Show Safe Route
            </button>
          </div>
        </div>
      `);
    });

    // Add distance circles
    safePoints.forEach((point) => {
      L.circle(userLocation, {
        color: '#16a34a',
        fillColor: '#16a34a',
        fillOpacity: 0.1,
        radius: point.distance * 1000, // Convert km to meters
        weight: 1
      }).addTo(map);
    });

    // Add danger zones
    dangerZones.forEach((dangerZone) => {
      const severityColor = dangerZone.severity === 'high' ? '#dc2626' : 
                           dangerZone.severity === 'medium' ? '#ea580c' : '#d97706';
      
      L.circle(dangerZone.coordinates, {
        color: severityColor,
        fillColor: severityColor,
        fillOpacity: 0.3,
        radius: dangerZone.radius,
        weight: 2
      }).addTo(map).bindPopup(`
        <div style="min-width: 150px;">
          <h3 style="margin: 0 0 8px 0; color: ${severityColor}; font-weight: 600;">${dangerZone.name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Type:</strong> ${dangerZone.type}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Severity:</strong> ${dangerZone.severity}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Radius:</strong> ${dangerZone.radius}m</p>
        </div>
      `);
    });

  }, [userLocation, safePoints, dangerZones, selectedSafePoint, calculateSafeRoute]);

  // Effect to update route display
  useEffect(() => {
    if (!mapInstanceRef.current || routePath.length === 0) return;

    // Remove existing route
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Polyline && (layer as { isRoute?: boolean }).isRoute) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    // Add new route
    if (routePath.length > 1) {
      const routeLine = L.polyline(routePath, {
        color: '#16a34a',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5'
      }).addTo(mapInstanceRef.current);
      
      // Mark route as route layer for easy removal
      (routeLine as { isRoute?: boolean }).isRoute = true;
      
      // Fit map to show entire route
      mapInstanceRef.current.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
    }
  }, [routePath, handleSafePointClick]);

  return (
    <div className="h-96 rounded-lg overflow-hidden border relative">
      {/* Loading overlay */}
      {isLoadingData && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading emergency data...</p>
          </div>
        </div>
      )}

      {/* Authentication required message */}
      {!isAuthenticated && (
        <div className="absolute top-4 left-4 bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800 z-40 max-w-64">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <p className="text-xs font-medium text-orange-800 dark:text-orange-200">
              Sign in to access real-time emergency data
            </p>
          </div>
          <Button
            size="sm"
            className="mt-2 w-full text-xs"
            onClick={() => {
              // Dispatch custom event to open auth modal
              document.dispatchEvent(new CustomEvent('openAuthModal'));
            }}
          >
            <LogIn className="w-3 h-3 mr-1" />
            Sign In
          </Button>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-48">
        <div className="text-xs font-medium text-foreground mb-2">Map Legend</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-muted-foreground">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full border-2 border-white"></div>
            <span className="text-muted-foreground">Hospitals & Clinics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-600 rounded-full border-2 border-white"></div>
            <span className="text-muted-foreground">Relief Centers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-muted-foreground">High Danger</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-muted-foreground">Medium Danger</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-muted-foreground">Low Danger</span>
          </div>
          {routePath.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-green-600 font-medium">Safe Route</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Route Info */}
      {selectedSafePoint && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-64">
          <div className="text-sm font-medium text-foreground mb-2">
            Route to {selectedSafePoint.name}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            Direct Distance: {selectedSafePoint.distance} km
          </div>
          
          {isCalculatingRoute ? (
            <div className="text-xs text-blue-600 font-medium mb-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                Calculating safe route...
              </div>
            </div>
          ) : routePath.length > 1 ? (
            <>
              <div className="text-xs text-blue-600 font-medium mb-1">
                Route Distance: {calculateRouteStats(routePath).distance.toFixed(2)} km
              </div>
              <div className="text-xs text-blue-600 font-medium mb-2">
                Estimated Time: {calculateRouteStats(routePath).time} min (walking)
              </div>
            </>
          ) : null}
          
          <div className={`text-xs font-medium ${
            isCalculatingRoute ? 'text-blue-600' :
            routePath.length === 2 ? 'text-red-600' : 'text-green-600'
          }`}>
            {isCalculatingRoute 
              ? '🔄 Calculating route...' 
              : routePath.length === 2 
                ? '⚠️ Direct route blocked by danger zones' 
                : '✓ Safe route calculated (avoids danger zones)'
            }
          </div>
          <button
            onClick={() => {
              setSelectedSafePoint(null);
              setRoutePath([]);
            }}
            className="text-xs text-red-600 hover:text-red-700 mt-2 underline"
          >
            Clear Route
          </button>
        </div>
      )}
    </div>
  );
};

export default EmergencyMap;
