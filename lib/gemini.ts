import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { mcpService, MCPContext } from './mcp-service';
import { DisasterAlert, ResponseTeam, ResourceInventory, CommunicationChannel } from './types';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class GeminiService {
  private model: GenerativeModel;

  constructor() {
    // Use Gemini 2.0 Flash model
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Generate content using Gemini with MCP context
   * @param prompt - The prompt to send to Gemini
   * @param mcpContext - Optional MCP context for agent tools
   * @returns Generated text response
   */
  async generateContent(prompt: string, mcpContext?: MCPContext): Promise<string> {
    try {
      // Set MCP context if provided
      if (mcpContext) {
        mcpService.setContext(mcpContext);
        // Use context-aware prompt
        prompt = mcpService.generateContextPrompt(prompt);
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw new Error('Failed to generate content with Gemini');
    }
  }

  /**
   * Generate content with streaming for real-time responses
   * @param prompt - The prompt to send to Gemini
   * @param mcpContext - Optional MCP context for agent tools
   * @returns Stream of generated content
   */
  async generateContentStream(prompt: string, mcpContext?: MCPContext) {
    try {
      // Set MCP context if provided
      if (mcpContext) {
        mcpService.setContext(mcpContext);
        prompt = mcpService.generateContextPrompt(prompt);
      }

      const result = await this.model.generateContentStream(prompt);
      return result.stream;
    } catch (error) {
      console.error('Error generating streaming content with Gemini:', error);
      throw new Error('Failed to generate streaming content with Gemini');
    }
  }

  /**
   * Generate content with specific parameters and MCP tools
   * @param prompt - The prompt to send to Gemini
   * @param options - Generation options
   * @param mcpContext - Optional MCP context for agent tools
   * @returns Generated text response
   */
  async generateContentWithOptions(
    prompt: string,
    options: {
      temperature?: number;
      topK?: number;
      topP?: number;
      maxOutputTokens?: number;
    },
    mcpContext?: MCPContext
  ): Promise<string> {
    try {
      // Set MCP context if provided
      if (mcpContext) {
        mcpService.setContext(mcpContext);
        prompt = mcpService.generateContextPrompt(prompt);
      }

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: options,
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content with options:', error);
      throw new Error('Failed to generate content with Gemini');
    }
  }

  /**
   * Generate rescue strategy with dynamic data from MCP
   */
  async generateRescueStrategy(
    incident: DisasterAlert,
    teams: ResponseTeam[],
    resources: ResourceInventory[],
    communications: CommunicationChannel[]
  ): Promise<string> {
    try {
      // Create MCP context
      const mcpContext: MCPContext = {
        location: {
          latitude: incident.coordinates?.[1] || 13.0827,
          longitude: incident.coordinates?.[0] || 80.2707,
          address: incident.location || 'Unknown location',
          region: 'Chennai, Tamil Nadu'
        },
        incident: {
          id: incident.id,
          type: incident.type,
          severity: incident.severity,
          description: incident.description,
          affectedPopulation: incident.affectedPopulation
        },
        teams: teams.map(team => ({
          id: team.id,
          name: team.name,
          type: team.type,
          location: team.location,
          status: team.status,
          personnel: team.personnel,
          vehicles: team.vehicles,
          specializations: team.specializations,
          contact: team.contact,
          lastUpdate: team.lastUpdate
        })),
        resources: resources.map(resource => ({
          id: resource.id,
          category: resource.category,
          item: resource.item,
          quantity: resource.quantity,
          unit: resource.unit,
          location: resource.location,
          status: resource.status,
          priority: resource.priority,
          expiryDate: resource.expiryDate
        }))
      };

      // Get dynamic location data
      const dynamicData = await mcpService.getDynamicLocationData();

      // Generate comprehensive prompt with dynamic data
      const prompt = `Generate a comprehensive rescue strategy for the following emergency situation:

**INCIDENT**: ${incident.type} - ${incident.severity} severity
**LOCATION**: ${incident.location}
**DESCRIPTION**: ${incident.description}
**AFFECTED POPULATION**: ${incident.affectedPopulation}

**AVAILABLE TEAMS**:
${dynamicData.nearbyTeams.map(team => `
- ${team.name}: ${team.personnel} personnel, ${team.distance}km away, ETA: ${team.estimatedTime}
  Status: ${team.status}, Specializations: ${team.specializations?.join(', ') || 'General response'}
`).join('')}

**AVAILABLE RESOURCES**:
${resources.map(resource => `
- ${resource.item}: ${resource.quantity} ${resource.unit} at ${resource.location}
  Category: ${resource.category}, Status: ${resource.status}, Priority: ${resource.priority}
`).join('')}

**COMMUNICATION CHANNELS**:
${communications.map(comm => `
- ${comm.type.toUpperCase()}: ${comm.status} (${comm.uptime}% uptime)
  Coverage: ${comm.coverage}, Backup: ${comm.backup ? 'Available' : 'Not available'}
`).join('')}

Please provide:
1. **IMMEDIATE ACTION PLAN** (0-15 minutes)
2. **TEAM DEPLOYMENT STRATEGY** with optimized routes
3. **RESOURCE ALLOCATION** based on proximity and need
4. **COMMUNICATION PROTOCOL** using available channels
5. **COORDINATION WITH NDRF AGENTS AND VOLUNTEERS**
6. **GEOJSON MAP VISUALIZATION REQUIREMENTS**

Use the MCP tools to:
- Generate GeoJSON for emergency response visualization
- Send coordinated messages to NDRF agents and volunteers
- Provide real-time location and distance calculations`;

      return await this.generateContent(prompt, mcpContext);
    } catch (error) {
      console.error('Error generating rescue strategy:', error);
      throw new Error('Failed to generate rescue strategy');
    }
  }

  /**
   * Execute MCP tool based on AI response
   */
  async executeMCPTool(toolName: string, parameters: Record<string, unknown>): Promise<unknown> {
    try {
      switch (toolName) {
        case 'generate_geojson':
          const geoParams = parameters as {
            center: [number, number];
            radius: number;
            features: Array<{
              type: string;
              coordinates: [number, number];
              properties: Record<string, unknown>;
            }>;
          };
          return await mcpService.generateGeoJSON(
            geoParams.center,
            geoParams.radius,
            geoParams.features
          );
        
        case 'send_agent_message':
          const msgParams = parameters as {
            recipients: Array<'ndrf' | 'volunteers' | 'medical' | 'fire' | 'police'>;
            message: string;
            priority: 'low' | 'medium' | 'high' | 'critical';
            coordinates?: [number, number];
          };
          return await mcpService.sendAgentMessage(
            msgParams.recipients,
            msgParams.message,
            msgParams.priority,
            msgParams.coordinates
          );
        
        default:
          throw new Error(`Unknown MCP tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`Error executing MCP tool ${toolName}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();
