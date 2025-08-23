"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
}

interface DangerZone {
  id: string;
  name: string;
  coordinates: [number, number];
  radius: number;
  type: string;
  severity: 'high' | 'medium' | 'low';
}

  const EmergencyMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [safePoints, setSafePoints] = useState<SafePoint[]>([]);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [selectedSafePoint, setSelectedSafePoint] = useState<SafePoint | null>(null);
  const [routePath, setRoutePath] = useState<L.LatLng[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

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
  const calculateSafeRoute = useCallback((start: [number, number], end: [number, number]) => {
    console.log('calculateSafeRoute called with:', { start, end, dangerZones });
    
    if (!start || !end) {
      console.log('No start or end coordinates');
      return [];
    }
    
    // Simple and fast route calculation
    // const directDistance = Math.sqrt(
    //   Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
    // );
    
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
      // Direct path is safe, return it with some smoothing
      console.log('Direct path is safe');
      return createSmoothPath(start, end, 5);
    }
    
    // Direct path is not safe, create a simple detour
    console.log('Creating safe detour');
    return createSafeDetour(start, end);
  }, [dangerZones, createSafeDetour, createSmoothPath]);

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
      setTimeout(() => {
        console.log('Calculating route from', userLocation, 'to', safePoint.coordinates);
        const route = calculateSafeRoute(userLocation, safePoint.coordinates);
        console.log('Route calculated:', route);
        setRoutePath(route.map(coord => L.latLng(coord[0], coord[1])));
        setIsCalculatingRoute(false);
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

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          // Generate dummy safe points around user location
          const dummySafePoints: SafePoint[] = [
            {
              id: '1',
              name: 'Community Center',
              coordinates: [latitude + 0.01, longitude - 0.01],
              distance: 0.8,
              capacity: 500,
              features: ['Flood-proof', 'Earthquake-resistant', 'Emergency power', 'Water supply']
            },
            {
              id: '2',
              name: 'High School Gymnasium',
              coordinates: [latitude + 0.015, longitude + 0.012],
              distance: 1.2,
              capacity: 800,
              features: ['Storm shelter', 'Medical facilities', 'Food storage', 'Emergency lighting']
            },
            {
              id: '3',
              name: 'City Hall',
              coordinates: [latitude - 0.008, longitude + 0.005],
              distance: 1.5,
              capacity: 200,
              features: ['Communication hub', 'Emergency operations', 'Weather monitoring', 'Backup power']
            },
            {
              id: '4',
              name: 'Public Library',
              coordinates: [latitude + 0.005, longitude + 0.003],
              distance: 0.6,
              capacity: 300,
              features: ['Backup power', 'Water supply', 'Emergency lighting', 'Communication']
            }
          ];
          setSafePoints(dummySafePoints);
          
          // Generate dummy danger zones around user location
          const dummyDangerZones: DangerZone[] = [
            {
              id: 'd1',
              name: 'Flooded Area',
              coordinates: [latitude + 0.008, longitude - 0.005],
              radius: 300,
              type: 'Flood',
              severity: 'high'
            },
            {
              id: 'd2',
              name: 'Fire Zone',
              coordinates: [latitude + 0.012, longitude + 0.008],
              radius: 200,
              type: 'Fire',
              severity: 'high'
            },
            {
              id: 'd3',
              name: 'Collapsed Building',
              coordinates: [latitude - 0.003, longitude + 0.007],
              radius: 150,
              type: 'Structural',
              severity: 'medium'
            },
            {
              id: 'd4',
              name: 'Gas Leak',
              coordinates: [latitude + 0.006, longitude + 0.002],
              radius: 250,
              type: 'Chemical',
              severity: 'high'
            }
          ];
          setDangerZones(dummyDangerZones);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a sample location for demo
          const defaultLocation: [number, number] = [40.7128, -74.0060];
          setUserLocation(defaultLocation);
          
          const dummySafePoints: SafePoint[] = [
            {
              id: '1',
              name: 'Community Center',
              coordinates: [40.7228, -74.0160],
              distance: 0.8,
              capacity: 500,
              features: ['Flood-proof', 'Earthquake-resistant', 'Emergency power', 'Water supply']
            },
            {
              id: '2',
              name: 'High School Gymnasium',
              coordinates: [40.7278, -73.9960],
              distance: 1.2,
              capacity: 800,
              features: ['Storm shelter', 'Medical facilities', 'Food storage', 'Emergency lighting']
            },
            {
              id: '3',
              name: 'City Hall',
              coordinates: [40.7048, -74.0110],
              distance: 1.5,
              capacity: 200,
              features: ['Communication hub', 'Emergency operations', 'Weather monitoring', 'Backup power']
            },
            {
              id: '4',
              name: 'Public Library',
              coordinates: [40.7178, -74.0030],
              distance: 0.6,
              capacity: 300,
              features: ['Backup power', 'Water supply', 'Emergency lighting', 'Communication']
            }
          ];
          setSafePoints(dummySafePoints);
          
          // Generate dummy danger zones for default location
          const dummyDangerZones: DangerZone[] = [
            {
              id: 'd1',
              name: 'Flooded Area',
              coordinates: [40.7208, -74.0110],
              radius: 300,
              type: 'Flood',
              severity: 'high'
            },
            {
              id: 'd2',
              name: 'Fire Zone',
              coordinates: [40.7248, -73.9980],
              radius: 200,
              type: 'Fire',
              severity: 'high'
            },
            {
              id: 'd3',
              name: 'Collapsed Building',
              coordinates: [40.7098, -74.0130],
              radius: 150,
              type: 'Structural',
              severity: 'medium'
            },
            {
              id: 'd4',
              name: 'Gas Leak',
              coordinates: [40.7188, -74.0040],
              radius: 250,
              type: 'Chemical',
              severity: 'high'
            }
          ];
          setDangerZones(dummyDangerZones);
        }
      );
    }
  }, []);

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
      const safeIcon = L.divIcon({
        className: 'custom-safe-marker',
        html: `
          <div style="
            width: 20px; 
            height: 20px; 
            background: #16a34a; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker(point.coordinates, { icon: safeIcon }).addTo(map);
      
      // Make marker clickable for route calculation
      marker.on('click', () => {
        console.log('Safe point clicked:', point.name);
        // Call the function directly to avoid dependency issues
        if (selectedSafePoint?.id === point.id) {
          setSelectedSafePoint(null);
          setRoutePath([]);
        } else {
          setSelectedSafePoint(point);
          if (userLocation) {
            setIsCalculatingRoute(true);
            setTimeout(() => {
              const route = calculateSafeRoute(userLocation, point.coordinates);
              setRoutePath(route.map(coord => L.latLng(coord[0], coord[1])));
              setIsCalculatingRoute(false);
            }, 10);
          }
        }
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
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-muted-foreground">Safe Point</span>
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
