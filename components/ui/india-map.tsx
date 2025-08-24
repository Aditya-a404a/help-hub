"use client";

import { useRef, useState } from "react";
import { MapPin, AlertTriangle, Shield, Users } from "lucide-react";

interface EmergencyLocation {
  id: string;
  name: string;
  type: 'safe-point' | 'danger-zone' | 'emergency-service';
  coordinates: { x: number; y: number };
  description: string;
  capacity?: number;
  severity?: 'high' | 'medium' | 'low';
}

interface IndiaMapProps {
  emergencyLocations?: EmergencyLocation[];
  showLegend?: boolean;
  className?: string;
}

export default function IndiaMap({
  emergencyLocations = [],
  showLegend = true,
  className = "",
}: IndiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<EmergencyLocation | null>(null);

  // Use provided locations or empty array (no default points)
  const locations = emergencyLocations;

  const getLocationIcon = (type: EmergencyLocation['type'], severity?: string) => {
    switch (type) {
      case 'safe-point':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'danger-zone':
        const severityColor = severity === 'high' ? 'text-red-600' : 
                             severity === 'medium' ? 'text-orange-500' : 'text-yellow-500';
        return <AlertTriangle className={`w-4 h-4 ${severityColor}`} />;
      case 'emergency-service':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLocationColor = (type: EmergencyLocation['type'], severity?: string) => {
    switch (type) {
      case 'safe-point':
        return 'bg-green-500 border-green-600';
      case 'danger-zone':
        return severity === 'high' ? 'bg-red-500 border-red-600' : 
               severity === 'medium' ? 'bg-orange-500 border-orange-600' : 
               'bg-yellow-500 border-yellow-600';
      case 'emergency-service':
        return 'bg-blue-500 border-blue-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {/* India Map SVG Background */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `url("/india-map.svg")`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Emergency Location Markers - Only show if locations are provided */}
      {locations.length > 0 && locations.map((location) => (
        <div
          key={location.id}
          className={`absolute w-4 h-4 rounded-full border-2 shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-125 ${getLocationColor(location.type, location.severity)}`}
          style={{
            left: `${location.coordinates.x}%`,
            top: `${location.coordinates.y}%`,
          }}
          onClick={() => setSelectedLocation(location)}
        >
          {getLocationIcon(location.type, location.severity)}
        </div>
      ))}

      {/* Location Info Popup */}
      {selectedLocation && (
        <div
          className="absolute bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border max-w-64 z-10"
          style={{
            left: `${selectedLocation.coordinates.x}%`,
            top: `${selectedLocation.coordinates.y - 10}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getLocationIcon(selectedLocation.type, selectedLocation.severity)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                {selectedLocation.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {selectedLocation.description}
              </p>
              {selectedLocation.capacity && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <Users className="w-3 h-3" />
                  <span>Capacity: {selectedLocation.capacity} people</span>
                </div>
              )}
              {selectedLocation.severity && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="capitalize">Severity: {selectedLocation.severity}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Map Legend - Only show if there are locations or if explicitly requested */}
      {showLegend && locations.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border max-w-48">
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">Map Legend</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full border border-green-600"></div>
              <span className="text-gray-600 dark:text-gray-400">Safe Points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full border border-blue-600"></div>
              <span className="text-gray-600 dark:text-gray-400">Emergency Services</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-600"></div>
              <span className="text-gray-600 dark:text-gray-400">High Danger Zones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full border border-orange-600"></div>
              <span className="text-gray-600 dark:text-gray-400">Medium Danger Zones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-yellow-600"></div>
              <span className="text-gray-600 dark:text-gray-400">Low Danger Zones</span>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close popup */}
      {selectedLocation && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setSelectedLocation(null)}
        />
      )}
    </div>
  );
}
