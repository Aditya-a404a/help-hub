// MCP (Model Context Protocol) Service for agent tools
// This provides context to Gemini AI with tools for geoJSON mapping and agent messaging

import { ResponseTeam, ResourceInventory } from './types';

export interface MCPContext {
  location: {
    latitude: number;
    longitude: number;
    address: string;
    region: string;
  };
  incident?: {
    id: string;
    type: string;
    severity: string;
    description: string;
    affectedPopulation: number;
  };
  teams: ResponseTeam[];
  resources: ResourceInventory[];
}

export interface GeoJSONTool {
  name: 'generate_geojson';
  description: string;
  parameters: {
    center: [number, number];
    radius: number;
    features: Array<{
      type: string;
      coordinates: [number, number];
      properties: Record<string, unknown>;
    }>;
  };
}

export interface MessagingTool {
  name: 'send_agent_message';
  description: string;
  parameters: {
    recipients: Array<'ndrf' | 'volunteers' | 'medical' | 'fire' | 'police'>;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    coordinates?: [number, number];
  };
}

export class MCPService {
  private context: MCPContext | null = null;

  /**
   * Set the current context for MCP tools
   */
  setContext(context: MCPContext): void {
    this.context = context;
  }

  /**
   * Get current context
   */
  getContext(): MCPContext | null {
    return this.context;
  }

  /**
   * Generate GeoJSON data for map visualization
   */
  async generateGeoJSON(center: [number, number], radius: number, features: Array<{
    type: string;
    coordinates: [number, number];
    properties: Record<string, unknown>;
  }>): Promise<{
    type: string;
    features: Array<{
      type: string;
      geometry: { type: string; coordinates: [number, number] };
      properties: Record<string, unknown>;
    }>;
  }> {
    const geoJson: {
      type: string;
      features: Array<{
        type: string;
        geometry: { type: string; coordinates: [number, number] };
        properties: Record<string, unknown>;
      }>;
    } = {
      type: 'FeatureCollection',
      features: features.map(feature => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: feature.coordinates
        },
        properties: {
          ...feature.properties,
          type: feature.type,
          timestamp: new Date().toISOString(),
          context: this.context?.incident?.id || 'general'
        }
      }))
    };

    // Add incident area if context is available
    if (this.context?.incident && this.context.location) {
      geoJson.features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [this.context.location.longitude, this.context.location.latitude]
        },
        properties: {
          type: 'incident_center',
          severity: this.context.incident.severity,
          incidentType: this.context.incident.type,
          affectedPopulation: this.context.incident.affectedPopulation,
          description: this.context.incident.description,
          timestamp: new Date().toISOString(),
          context: this.context.incident.id
        }
      });
    }

    return geoJson;
  }

  /**
   * Send messages to agents and volunteers
   */
  async sendAgentMessage(
    recipients: Array<'ndrf' | 'volunteers' | 'medical' | 'fire' | 'police'>,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'critical',
    coordinates?: [number, number]
  ): Promise<{
    success: boolean;
    messageId: string;
    sentTo: Array<{
      type: string;
      count: number;
      estimatedReachTime?: string;
    }>;
  }> {
    // Simulate sending messages to different agent types
    const agentCounts = {
      ndrf: Math.floor(Math.random() * 50) + 20,
      volunteers: Math.floor(Math.random() * 200) + 100,
      medical: Math.floor(Math.random() * 30) + 15,
      fire: Math.floor(Math.random() * 25) + 10,
      police: Math.floor(Math.random() * 40) + 20
    };

    const estimatedReachTimes = {
      ndrf: '5-15 minutes',
      volunteers: '10-30 minutes',
      medical: '3-8 minutes',
      fire: '2-10 minutes',
      police: '1-5 minutes'
    };

    const sentTo = recipients.map(type => ({
      type,
      count: agentCounts[type],
      estimatedReachTime: estimatedReachTimes[type]
    }));

    // Log the message for tracking
    console.log(`MCP Message sent to ${recipients.join(', ')}:`, {
      message,
      priority,
      coordinates,
      context: this.context?.incident?.id,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sentTo
    };
  }

  /**
   * Get available tools for the current context
   */
  getAvailableTools(): Array<GeoJSONTool | MessagingTool> {
    const tools: Array<GeoJSONTool | MessagingTool> = [
      {
        name: 'generate_geojson',
        description: 'Generate GeoJSON data for map visualization with emergency response locations',
        parameters: {
          center: this.context?.location ? 
            [this.context.location.longitude, this.context.location.latitude] : 
            [80.2707, 13.0827], // Default to Chennai
          radius: 10, // Default 10km radius
          features: []
        }
      },
      {
        name: 'send_agent_message',
        description: 'Send emergency messages to NDRF agents, volunteers, and emergency services',
        parameters: {
          recipients: ['ndrf', 'volunteers'],
          message: '',
          priority: 'medium',
          coordinates: this.context?.location ? 
            [this.context.location.longitude, this.context.location.latitude] : 
            undefined
        }
      }
    ];

    return tools;
  }

  /**
   * Get dynamic location data based on context
   */
  async getDynamicLocationData(): Promise<{
    nearbyTeams: Array<ResponseTeam & { distance: number; estimatedTime: string; coordinates: [number, number] }>;
    distanceEstimates: Record<string, Record<string, number>>;
    routeData: Record<string, unknown>;
  }> {
    if (!this.context) {
      throw new Error('Context not set for MCP service');
    }

    // Calculate dynamic distances based on actual coordinates
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Generate dynamic distance estimates
    const distanceEstimates: Record<string, Record<string, number>> = {};
    const incidentLat = this.context.location.latitude;
    const incidentLon = this.context.location.longitude;

    // Sample team locations (in real implementation, this would come from API)
    const teamLocations = {
      'NDRF Station 1': { lat: 13.0067, lon: 80.2546 },
      'Fire Station Central': { lat: 13.0368, lon: 80.2404 },
      'Medical Emergency Hub': { lat: 13.0878, lon: 80.2785 },
      'Police Headquarters': { lat: 13.0522, lon: 80.2437 }
    };

    const nearbyTeams = this.context.teams.map(team => {
      const teamLocation = teamLocations[team.name as keyof typeof teamLocations] || 
                          { lat: incidentLat + (Math.random() - 0.5) * 0.1, 
                            lon: incidentLon + (Math.random() - 0.5) * 0.1 };
      
      const distance = calculateDistance(incidentLat, incidentLon, teamLocation.lat, teamLocation.lon);
      const estimatedTime = Math.max(5, Math.round(distance * 3)); // ~3 minutes per km

      return {
        ...team,
        distance: Math.round(distance * 100) / 100,
        estimatedTime: `${estimatedTime}-${estimatedTime + 5} minutes`,
        coordinates: [teamLocation.lon, teamLocation.lat] as [number, number]
      };
    });

    // Generate route data
    const routeData = {
      optimizedRoute: nearbyTeams
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .map(team => ({
          waypoint: team.coordinates,
          teamName: team.name,
          priority: team.distance < 5 ? 'high' : team.distance < 10 ? 'medium' : 'low'
        }))
    };

    return {
      nearbyTeams,
      distanceEstimates,
      routeData
    };
  }

  /**
   * Generate context-aware prompt for Gemini with MCP tools
   */
  generateContextPrompt(basePrompt: string): string {
    if (!this.context) {
      return basePrompt;
    }

    const tools = this.getAvailableTools();
    const toolDescriptions = tools.map(tool => 
      `- ${tool.name}: ${tool.description}`
    ).join('\n');

    const contextInfo = `
## MCP CONTEXT INFORMATION
**Location**: ${this.context.location.address} (${this.context.location.latitude}, ${this.context.location.longitude})
**Region**: ${this.context.location.region}

${this.context.incident ? `**Active Incident**: ${this.context.incident.type} - ${this.context.incident.severity}
**Description**: ${this.context.incident.description}
**Affected Population**: ${this.context.incident.affectedPopulation}` : ''}

**Available Teams**: ${this.context.teams.length} teams
**Available Resources**: ${this.context.resources.length} resource types

## AVAILABLE MCP TOOLS
${toolDescriptions}

You can use these tools to:
1. Generate GeoJSON for map visualization of emergency response
2. Send coordinated messages to NDRF agents and volunteers
3. Access dynamic location and distance data

## ORIGINAL REQUEST
${basePrompt}

Please provide a response that utilizes the available MCP tools and context data effectively.
`;

    return contextInfo;
  }
}

// Export singleton instance
export const mcpService = new MCPService();