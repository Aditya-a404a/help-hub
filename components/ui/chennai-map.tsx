"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EmergencyMarker {
  id: string;
  type: 'hospital' | 'fire_station' | 'police_station' | 'emergency_center' | 'shelter';
  name: string;
  coordinates: [number, number];
  status: 'active' | 'inactive' | 'emergency';
}

interface DangerArea {
  id: string;
  type: 'flood' | 'fire' | 'landslide' | 'chemical_spill' | 'gas_leak' | 'structural_damage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: [number, number][];
  radius: number;
  description: string;
  timestamp: string;
  affectedPopulation: number;
  authority: 'police' | 'fire' | 'medical' | 'civil_defense' | 'district_admin';
}

interface UtilityVehicle {
  id: string;
  type: 'ambulance' | 'fire_truck' | 'police_van' | 'rescue_van' | 'water_tanker' | 'generator_van';
  authority: 'police' | 'fire' | 'medical' | 'civil_defense' | 'district_admin';
  name: string;
  coordinates: [number, number];
  status: 'available' | 'deployed' | 'returning' | 'maintenance';
  personnel: number;
  lastUpdate: string;
  destination?: string;
}

interface ChennaiMapProps {
  className?: string;
}

const emergencyMarkers: EmergencyMarker[] = [
  {
    id: '1',
    type: 'hospital',
    name: 'Apollo Hospitals',
    coordinates: [13.0067, 80.2546],
    status: 'active'
  },
  {
    id: '2',
    type: 'fire_station',
    name: 'Chennai Fire Station',
    coordinates: [13.0827, 80.2707],
    status: 'active'
  },
  {
    id: '3',
    type: 'police_station',
    name: 'Chennai Central Police Station',
    coordinates: [13.0827, 80.2707],
    status: 'active'
  },
  {
    id: '4',
    type: 'emergency_center',
    name: 'Chennai Emergency Control Center',
    coordinates: [13.0827, 80.2707],
    status: 'active'
  },
  {
    id: '5',
    type: 'shelter',
    name: 'Chennai Emergency Shelter',
    coordinates: [13.0368, 80.2404],
    status: 'active'
  },
  {
    id: '6',
    type: 'hospital',
    name: 'Fortis Malar Hospital',
    coordinates: [13.0067, 80.2546],
    status: 'active'
  },
  {
    id: '7',
    type: 'fire_station',
    name: 'T Nagar Fire Station',
    coordinates: [13.0368, 80.2404],
    status: 'active'
  },
  {
    id: '8',
    type: 'police_station',
    name: 'T Nagar Police Station',
    coordinates: [13.0368, 80.2404],
    status: 'active'
  }
];

const dangerAreas: DangerArea[] = [
  {
    id: '1',
    type: 'flood',
    severity: 'high',
    coordinates: [
      [13.0067, 80.2546],
      [13.0167, 80.2646],
      [13.0267, 80.2546],
      [13.0167, 80.2446]
    ],
    radius: 500,
    description: 'Heavy flooding in Adyar area affecting 15,000 people',
    timestamp: '2 hours ago',
    affectedPopulation: 15000,
    authority: 'district_admin'
  },
  {
    id: '2',
    type: 'fire',
    severity: 'medium',
    coordinates: [
      [13.0368, 80.2404],
      [13.0468, 80.2504],
      [13.0568, 80.2404],
      [13.0468, 80.2304]
    ],
    radius: 300,
    description: 'Electrical fire in T Nagar commercial area',
    timestamp: '45 minutes ago',
    affectedPopulation: 500,
    authority: 'fire'
  },
  {
    id: '3',
    type: 'chemical_spill',
    severity: 'critical',
    coordinates: [
      [13.0827, 80.2707],
      [13.0927, 80.2807],
      [13.1027, 80.2707],
      [13.0927, 80.2607]
    ],
    radius: 800,
    description: 'Chemical spill at industrial area - evacuation required',
    timestamp: '1 hour ago',
    affectedPopulation: 8000,
    authority: 'civil_defense'
  }
];

const utilityVehicles: UtilityVehicle[] = [
  {
    id: '1',
    type: 'ambulance',
    authority: 'medical',
    name: 'Medical Ambulance 01',
    coordinates: [13.0067, 80.2546],
    status: 'deployed',
    personnel: 3,
    lastUpdate: '5 minutes ago',
    destination: 'Apollo Hospitals'
  },
  {
    id: '2',
    type: 'fire_truck',
    authority: 'fire',
    name: 'Fire Engine 05',
    coordinates: [13.0368, 80.2404],
    status: 'deployed',
    personnel: 6,
    lastUpdate: '10 minutes ago',
    destination: 'T Nagar Fire Scene'
  },
  {
    id: '3',
    type: 'police_van',
    authority: 'police',
    name: 'Police Response Unit 12',
    coordinates: [13.0827, 80.2707],
    status: 'available',
    personnel: 4,
    lastUpdate: '2 minutes ago'
  },
  {
    id: '4',
    type: 'water_tanker',
    authority: 'civil_defense',
    name: 'Water Tanker 03',
    coordinates: [13.0167, 80.2646],
    status: 'deployed',
    personnel: 2,
    lastUpdate: '15 minutes ago',
    destination: 'Adyar Flood Area'
  },
  {
    id: '5',
    type: 'rescue_van',
    authority: 'district_admin',
    name: 'District Rescue Unit 01',
    coordinates: [13.0468, 80.2504],
    status: 'deployed',
    personnel: 5,
    lastUpdate: '8 minutes ago',
    destination: 'T Nagar Fire Scene'
  },
  {
    id: '6',
    type: 'generator_van',
    authority: 'district_admin',
    name: 'Emergency Power Unit 02',
    coordinates: [13.0927, 80.2807],
    status: 'deployed',
    personnel: 2,
    lastUpdate: '20 minutes ago',
    destination: 'Chemical Spill Area'
  }
];

const getMarkerIcon = (type: string) => {
  const baseIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
        ${type === 'hospital' ? 'H' : 
          type === 'fire_station' ? 'F' : 
          type === 'police_station' ? 'P' : 
          type === 'emergency_center' ? 'E' : 'S'}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return baseIcon;
};

const getVehicleIcon = (type: string, status: string) => {
  const vehicleIcons: Record<string, string> = {
    'ambulance': 'A',
    'fire_truck': 'F',
    'police_van': 'P',
    'rescue_van': 'R',
    'water_tanker': 'W',
    'generator_van': 'G'
  };

  const statusColors: Record<string, string> = {
    'available': '#10b981',
    'deployed': '#f59e0b',
    'returning': '#3b82f6',
    'maintenance': '#6b7280'
  };

  const baseIcon = L.divIcon({
    className: 'vehicle-marker',
    html: `
      <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold" 
           style="background-color: ${statusColors[status] || '#10b981'}">
        ${vehicleIcons[type] || 'V'}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return baseIcon;
};

const getDangerAreaColor = (severity: string) => {
  switch (severity) {
    case 'low': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#10b981';
  }
};

const getAuthorityColor = (authority: string) => {
  switch (authority) {
    case 'police': return '#3b82f6';
    case 'fire': return '#f97316';
    case 'medical': return '#10b981';
    case 'civil_defense': return '#8b5cf6';
    case 'district_admin': return '#ef4444';
    default: return '#6b7280';
  }
};

export default function ChennaiMap({ className }: ChennaiMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [updateCounter, setUpdateCounter] = useState(0);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateCounter(prev => prev + 1);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Chennai coordinates
    const chennaiCoords: [number, number] = [13.0827, 80.2707];

    // Initialize map
    const map = L.map(mapRef.current, {
      center: chennaiCoords,
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add Chennai boundary highlight (approximate)
    L.rectangle([
      [13.0, 80.1], // Southwest coordinates
      [13.2, 80.4]  // Northeast coordinates
    ], {
      color: '#3b82f6',
      weight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.1
    }).addTo(map);

    // Add danger areas
    dangerAreas.forEach(area => {
      const polygon = L.polygon(area.coordinates, {
        color: getDangerAreaColor(area.severity),
        weight: 3,
        fillColor: getDangerAreaColor(area.severity),
        fillOpacity: 0.3
      }).addTo(map);

      // Add danger area label
      const center = polygon.getBounds().getCenter();
      L.marker(center, {
        icon: L.divIcon({
          className: 'danger-label',
          html: `
            <div class="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
              ${area.type.toUpperCase()}
            </div>
          `,
          iconSize: [80, 24],
          iconAnchor: [40, 12]
        })
      }).addTo(map);

      // Add popup with danger area info
      polygon.bindPopup(`
        <div class="p-3 min-w-64">
          <h3 class="font-bold text-lg mb-2 text-red-600">${area.type.replace('_', ' ').toUpperCase()}</h3>
          <div class="space-y-2 text-sm">
            <p><strong>Severity:</strong> <span class="text-${area.severity === 'critical' ? 'red' : area.severity === 'high' ? 'orange' : area.severity === 'medium' ? 'yellow' : 'green'}-600">${area.severity}</span></p>
            <p><strong>Description:</strong> ${area.description}</p>
            <p><strong>Affected Population:</strong> ${area.affectedPopulation.toLocaleString()}</p>
            <p><strong>Authority:</strong> <span class="text-${getAuthorityColor(area.authority).replace('#', '')}-600">${area.authority.replace('_', ' ')}</span></p>
            <p><strong>Time:</strong> ${area.timestamp}</p>
          </div>
        </div>
      `);
    });

    // Add emergency markers
    emergencyMarkers.forEach(marker => {
      const icon = getMarkerIcon(marker.type);
      L.marker(marker.coordinates, { icon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${marker.name}</h3>
            <p class="text-xs text-gray-600">Type: ${marker.type.replace('_', ' ')}</p>
            <p class="text-xs text-gray-600">Status: ${marker.status}</p>
          </div>
        `);
    });

    // Add utility vehicles with real-time updates
    utilityVehicles.forEach(vehicle => {
      const icon = getVehicleIcon(vehicle.type, vehicle.status);
      L.marker(vehicle.coordinates, { icon })
        .addTo(map)
        .bindPopup(`
          <div class="p-3 min-w-64">
            <h3 class="font-bold text-lg mb-2">${vehicle.name}</h3>
            <div class="space-y-2 text-sm">
              <p><strong>Type:</strong> ${vehicle.type.replace('_', ' ')}</p>
              <p><strong>Authority:</strong> <span class="text-${getAuthorityColor(vehicle.authority).replace('#', '')}-600">${vehicle.authority.replace('_', ' ')}</span></p>
              <p><strong>Status:</strong> <span class="text-${vehicle.status === 'available' ? 'green' : vehicle.status === 'deployed' ? 'orange' : vehicle.status === 'returning' ? 'blue' : 'gray'}-600">${vehicle.status}</span></p>
              <p><strong>Personnel:</strong> ${vehicle.personnel}</p>
              ${vehicle.destination ? `<p><strong>Destination:</strong> ${vehicle.destination}</p>` : ''}
              <p><strong>Last Update:</strong> ${vehicle.lastUpdate}</p>
            </div>
          </div>
        `);

      // Add vehicle trail for deployed vehicles
      if (vehicle.status === 'deployed' && vehicle.destination) {
        const destinationCoords = getDestinationCoordinates(vehicle.destination);
        if (destinationCoords) {
          L.polyline([vehicle.coordinates, destinationCoords], {
            color: getAuthorityColor(vehicle.authority),
            weight: 3,
            dashArray: '10, 5',
            opacity: 0.7
          }).addTo(map);
        }
      }
    });

    // Add a custom control for emergency info
    const EmergencyControl = L.Control.extend({
      onAdd: function() {
        const div = L.DomUtil.create('div', 'bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border text-xs min-w-48');
        div.innerHTML = `
          <div class="font-bold mb-2 text-sm">Emergency Dashboard</div>
          <div class="space-y-1">
            <div class="flex justify-between">
              <span>Danger Areas:</span>
              <span class="text-red-600 font-bold">${dangerAreas.length}</span>
            </div>
            <div class="flex justify-between">
              <span>Active Vehicles:</span>
              <span class="text-green-600 font-bold">${utilityVehicles.filter(v => v.status === 'deployed').length}</span>
            </div>
            <div class="flex justify-between">
              <span>Last Update:</span>
              <span class="text-blue-600">${new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        `;
        return div;
      }
    });
    
    new EmergencyControl({ position: 'topright' }).addTo(map);

    // Add legend
    const LegendControl = L.Control.extend({
      onAdd: function() {
        const div = L.DomUtil.create('div', 'bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border text-xs min-w-40');
        div.innerHTML = `
          <div class="font-bold mb-2 text-sm">Legend</div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Critical</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>High</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Medium</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Low</span>
            </div>
          </div>
        `;
        return div;
      }
    });
    
    new LegendControl({ position: 'bottomleft' }).addTo(map);

    // Store map instance
    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [updateCounter]); // Re-run when updateCounter changes

  // Helper function to get destination coordinates
  const getDestinationCoordinates = (destination: string): [number, number] | null => {
    const destinations: Record<string, [number, number]> = {
      'Apollo Hospitals': [13.0067, 80.2546],
      'T Nagar Fire Scene': [13.0368, 80.2404],
      'Adyar Flood Area': [13.0167, 80.2646],
      'Chemical Spill Area': [13.0927, 80.2807]
    };
    return destinations[destination] || null;
  };

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {/* Custom CSS for markers */}
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .vehicle-marker {
          background: transparent;
          border: none;
        }
        .danger-label {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-tip {
          background: white;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #374151 !important;
          border: 1px solid #e5e7eb !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
}
