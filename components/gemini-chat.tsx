'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Bot, User, X, Clock, Users, Package, Shield, Radio, AlertTriangle, CheckCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DisasterAlert {
  id: string;
  type: string;
  severity: string;
  location: string;
  description: string;
  affectedPopulation: number;
  timestamp: string;
  status: string;
}

interface ResponseTeam {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  personnel: number;
  vehicles: number;
  specializations: string[];
  contact: string;
  lastUpdate: string;
}

interface ResourceInventory {
  id: string;
  category: string;
  item: string;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  priority: string;
  expiryDate?: string;
}

interface CommunicationChannel {
  id: string;
  type: string;
  status: string;
  coverage: string;
  uptime: number;
  lastTest: string;
  backup: boolean;
}

interface RescueStatus {
  phase: 'preparing' | 'deploying' | 'responding' | 'rescuing' | 'stabilizing' | 'completed';
  teamsDeployed: number;
  peopleRescued: number;
  lastUpdate: Date;
  estimatedCompletion?: Date;
}

interface GeminiChatProps {
  incident?: DisasterAlert;
  responseTeams?: ResponseTeam[];
  resourceInventory?: ResourceInventory[];
  communicationChannels?: CommunicationChannel[];
  onClose?: () => void;
  isModal?: boolean;
}

export default function GeminiChat({ incident, responseTeams = [], resourceInventory = [], communicationChannels = [], onClose, isModal = false }: GeminiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rescueStatus, setRescueStatus] = useState<RescueStatus | null>(null);

  // Auto-send rescue strategy prompt when incident is provided
  useEffect(() => {
    if (incident && messages.length === 0) {
      const rescuePrompt = generateRescueStrategyPrompt(incident, responseTeams, resourceInventory, communicationChannels);
      setInput(rescuePrompt);
      // Auto-send after a short delay
      setTimeout(() => {
        sendMessage(rescuePrompt);
      }, 1000);
    }
  }, [incident, responseTeams, resourceInventory, communicationChannels]);

  // Generate comprehensive rescue strategy prompt
  const generateRescueStrategyPrompt = (incident: DisasterAlert, teams: ResponseTeam[], resources: ResourceInventory[], communications: CommunicationChannel[]): string => {
    const availableTeams = teams.filter(team => team.status === 'available' || team.status === 'deployed');
    const availableResources = resources.filter(resource => resource.status === 'available');
    const activeCommunications = communications.filter(comm => comm.status === 'active');

    // Calculate estimated distances and times based on location
    const getEstimatedTime = (teamLocation: string, incidentLocation: string): string => {
      // Simple estimation based on Chennai locations
      const distanceEstimates: {[key: string]: {[key: string]: number}} = {
        'Adyar': {'Adyar': 5, 'T Nagar': 15, 'Central Chennai': 20},
        'T Nagar': {'Adyar': 15, 'T Nagar': 5, 'Central Chennai': 10},
        'Central Chennai': {'Adyar': 20, 'T Nagar': 10, 'Central Chennai': 5}
      };

      const incidentArea = incidentLocation.includes('Adyar') ? 'Adyar' :
                          incidentLocation.includes('T Nagar') ? 'T Nagar' : 'Central Chennai';
      const teamArea = teamLocation.includes('Adyar') ? 'Adyar' :
                      teamLocation.includes('T Nagar') ? 'T Nagar' : 'Central Chennai';

      const distance = distanceEstimates[teamArea]?.[incidentArea] || 15;
      return `${Math.max(5, distance)}-${Math.max(15, distance + 10)} minutes`;
    };

    return `# 🚨 EMERGENCY RESCUE STRATEGY REQUEST

## INCIDENT DETAILS
- **Type**: ${incident.type.toUpperCase()}
- **Severity Level**: ${incident.severity.toUpperCase()} (Critical=${incident.severity === 'critical'}, High=${incident.severity === 'high'})
- **Location**: ${incident.location}
- **Coordinates**: [13.0067, 80.2546] (example)
- **Description**: ${incident.description}
- **Affected Population**: ${incident.affectedPopulation.toLocaleString()} people
- **Time of Incident**: ${incident.timestamp}
- **Current Status**: ${incident.status}

## AVAILABLE RESPONSE TEAMS
${availableTeams.map(team => `
### ${team.name}
- **Type**: ${team.type}
- **Current Status**: ${team.status}
- **Personnel**: ${team.personnel} members
- **Vehicles**: ${team.vehicles}
- **Specializations**: ${team.specializations.join(', ')}
- **Contact**: ${team.contact}
- **Current Location**: ${team.location}
- **Estimated Time to Scene**: ${getEstimatedTime(team.location, incident.location)}
- **Last Update**: ${team.lastUpdate}
`).join('')}

## AVAILABLE RESOURCES
${availableResources.map(resource => `
### ${resource.item}
- **Category**: ${resource.category}
- **Quantity**: ${resource.quantity} ${resource.unit}
- **Location**: ${resource.location}
- **Status**: ${resource.status}
- **Priority Level**: ${resource.priority}
${resource.expiryDate ? `- **Expiry Date**: ${resource.expiryDate}` : ''}
`).join('')}

## COMMUNICATION CHANNELS
${activeCommunications.map(comm => `
### ${comm.type.toUpperCase()}
- **Status**: ${comm.status}
- **Coverage**: ${comm.coverage}
- **Uptime**: ${comm.uptime}%
- **Last Test**: ${comm.lastTest}
- **Backup Available**: ${comm.backup ? 'Yes' : 'No'}
`).join('')}

## REQUIRED RESCUE STRATEGY COMPONENTS

### 1. IMMEDIATE ACTION PLAN
**What should be done in the first 5-10 minutes?**

### 2. TEAM DEPLOYMENT STRATEGY
**Which teams should be deployed first and in what sequence?**
- Consider team specializations and locations
- Factor in traffic and accessibility
- Prioritize based on incident type and severity

### 3. RESOURCE ALLOCATION
**How should resources be distributed?**
- Medical supplies priority
- Equipment requirements
- Logistics and transportation

### 4. TIME ESTIMATES
**Provide specific time estimates for:**
- First responders arrival time
- Full team deployment completion
- Initial medical assessment
- Evacuation completion (if needed)
- Rescue operation completion

### 5. SAFETY AND EVACUATION
**Detailed safety procedures:**
- Immediate danger mitigation
- Evacuation routes and procedures
- Public safety measures
- Risk assessment and mitigation

### 6. COMMUNICATION PLAN
**How to communicate with:**
- Affected population
- Emergency contacts
- Media and public
- Government authorities

### 7. COORDINATION REQUIREMENTS
**Inter-agency coordination:**
- Police department coordination
- Hospital notifications
- Utility service alerts
- Transportation authority coordination

## ADDITIONAL CONSIDERATIONS
- **Weather Impact**: Consider current weather conditions
- **Accessibility**: Account for traffic and infrastructure status
- **Population Density**: Factor in urban density and building types
- **Secondary Hazards**: Identify potential cascading risks
- **Media Management**: Plan for public information dissemination

## RESPONSE FORMAT REQUIREMENTS

**Please structure your response using the following format:**

### 🚨 EXECUTIVE SUMMARY
[Brief 2-3 sentence overview of the rescue strategy]

### 📊 CRITICAL TIMELINE
- **T+0 minutes**: [Immediate actions]
- **T+5 minutes**: [5-minute milestone]
- **T+15 minutes**: [15-minute milestone]
- **T+30 minutes**: [30-minute milestone]
- **T+1 hour**: [1-hour milestone]

### 👥 TEAM DEPLOYMENT ORDER
1. **[Team Name]** - **Priority**: [High/Medium/Low] - **ETA**: [time] - **Mission**: [specific task]
2. **[Team Name]** - **Priority**: [High/Medium/Low] - **ETA**: [time] - **Mission**: [specific task]

### 📦 RESOURCE REQUIREMENTS
| Resource | Quantity | Priority | Allocation |
|----------|----------|----------|------------|
| [Resource] | [Amount] | [Priority] | [Assigned to] |

### 🔒 SAFETY PROCEDURES
- **Immediate Danger Mitigation**: [Actions]
- **Evacuation Routes**: [Routes and procedures]
- **Public Safety Measures**: [Measures]

### 📡 COMMUNICATION PLAN
- **Affected Population**: [How to communicate]
- **Emergency Services**: [Coordination details]
- **Media Relations**: [Public information]

### ⚠️ CONTINGENCY PLANS
- **Alternative Routes**: [If primary routes blocked]
- **Backup Resources**: [If primary resources unavailable]
- **Weather Impact**: [Actions based on weather]

### 📈 SUCCESS METRICS
- **Primary Goal**: [Main objective with timeline]
- **Secondary Goals**: [Additional objectives]
- **Monitoring Points**: [How to measure success]

**Provide specific time estimates in minutes and ensure all actions are practical given the available resources and team capabilities. Include exact contact numbers and locations where available.**`;
  };

  const sendMessage = async (messageToSend?: string) => {
    const message = messageToSend || input.trim();
    if (!message || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageToSend) {
      setInput('');
    }
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Initialize rescue status when incident is provided
  useEffect(() => {
    if (incident && !rescueStatus) {
      setRescueStatus({
        phase: 'preparing',
        teamsDeployed: 0,
        peopleRescued: 0,
        lastUpdate: new Date(),
        estimatedCompletion: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      });
    }
  }, [incident, rescueStatus]);

  // Update rescue status
  const updateRescueStatus = (updates: Partial<RescueStatus>) => {
    setRescueStatus(prev => prev ? { ...prev, ...updates, lastUpdate: new Date() } : null);
  };

  // Get status color based on phase
  const getStatusColor = (phase: string) => {
    switch (phase) {
      case 'preparing': return 'bg-yellow-500';
      case 'deploying': return 'bg-blue-500';
      case 'responding': return 'bg-orange-500';
      case 'rescuing': return 'bg-red-500';
      case 'stabilizing': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status label
  const getStatusLabel = (phase: string) => {
    switch (phase) {
      case 'preparing': return 'Preparing Response';
      case 'deploying': return 'Deploying Teams';
      case 'responding': return 'Responding to Scene';
      case 'rescuing': return 'Active Rescue';
      case 'stabilizing': return 'Stabilizing Situation';
      case 'completed': return 'Rescue Complete';
      default: return 'Unknown Status';
    }
  };

  // Format the response content with better visual structure
  const formatResponse = (content: string) => {
    return content
      .replace(/### 🚨 EXECUTIVE SUMMARY/g, '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;"><span style="color: #dc2626; font-size: 20px;">🚨</span><h3 style="font-size: 18px; font-weight: bold; color: #dc2626; margin: 0;">EXECUTIVE SUMMARY</h3></div>')
      .replace(/### 📊 CRITICAL TIMELINE/g, '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px;"><span style="color: #2563eb; font-size: 20px;">📊</span><h3 style="font-size: 18px; font-weight: bold; color: #2563eb; margin: 0;">CRITICAL TIMELINE</h3></div>')
      .replace(/### 👥 TEAM DEPLOYMENT ORDER/g, '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px;"><span style="color: #16a34a; font-size: 20px;">👥</span><h3 style="font-size: 18px; font-weight: bold; color: #16a34a; margin: 0;">TEAM DEPLOYMENT ORDER</h3></div>')
      .replace(/### 📦 RESOURCE REQUIREMENTS/g, '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px; background-color: #faf5ff; border-left: 4px solid #7c3aed; border-radius: 4px;"><span style="color: #7c3aed; font-size: 20px;">📦</span><h3 style="font-size: 18px; font-weight: bold; color: #7c3aed; margin: 0;">RESOURCE REQUIREMENTS</h3></div>')
      .replace(/### 🔒 SAFETY PROCEDURES/g, '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px; background-color: #fff7ed; border-left: 4px solid #ea580c; border-radius: 4px;"><span style="color: #ea580c; font-size: 20px;">🔒</span><h3 style="font-size: 18px; font-weight: bold; color: #ea580c; margin: 0;">SAFETY PROCEDURES</h3></div>')
      .replace(/### 📡 COMMUNICATION PLAN/g, '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px; background-color: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 4px;"><span style="color: #0284c7; font-size: 20px;">📡</span><h3 style="font-size: 18px; font-weight: bold; color: #0284c7; margin: 0;">COMMUNICATION PLAN</h3></div>')
      .replace(/### ⚠️ CONTINGENCY PLANS/g, '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px; background-color: #fffbeb; border-left: 4px solid #d97706; border-radius: 4px;"><span style="color: #d97706; font-size: 20px;">⚠️</span><h3 style="font-size: 18px; font-weight: bold; color: #d97706; margin: 0;">CONTINGENCY PLANS</h3></div>')
      .replace(/### 📈 SUCCESS METRICS/g, '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 8px; background-color: #f0fdf4; border-left: 4px solid #059669; border-radius: 4px;"><span style="color: #059669; font-size: 20px;">📈</span><h3 style="font-size: 18px; font-weight: bold; color: #059669; margin: 0;">SUCCESS METRICS</h3></div>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
      .replace(/\n- /g, '<br />• ')
      .replace(/\n1\. /g, '<br />1. ')
      .replace(/\n2\. /g, '<br />2. ')
      .replace(/\n3\. /g, '<br />3. ')
      .replace(/\n4\. /g, '<br />4. ')
      .replace(/\n5\. /g, '<br />5. ')
      .replace(/\n6\. /g, '<br />6. ')
      .replace(/\n7\. /g, '<br />7. ')
      .replace(/\n\n/g, '<br /><br />');
  };

  return (
    <Card className={`w-full ${isModal ? 'max-w-5xl' : 'max-w-4xl'} mx-auto`}>
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          {incident ? `Rescue Strategy - ${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Emergency` : 'Gemini AI Chat'}
        </CardTitle>

        {/* Rescue Status Display */}
        {rescueStatus && (
          <div className="mt-2 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(rescueStatus.phase)} animate-pulse`}></div>
              <span className="font-medium">{getStatusLabel(rescueStatus.phase)}</span>
            </div>
            <div className="text-muted-foreground">•</div>
            <span className="text-muted-foreground">
              {rescueStatus.teamsDeployed} teams deployed
            </span>
            <div className="text-muted-foreground">•</div>
            <span className="text-muted-foreground">
              {rescueStatus.peopleRescued} people rescued
            </span>
            {rescueStatus.estimatedCompletion && (
              <>
                <div className="text-muted-foreground">•</div>
                <span className="text-muted-foreground">
                  Est. completion: {rescueStatus.estimatedCompletion.toLocaleTimeString()}
                </span>
              </>
            )}
          </div>
        )}

        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-96 overflow-y-auto space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              {incident ? 'Generating rescue strategy...' : 'Start a conversation with Gemini AI'}
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 border'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: formatResponse(message.content)
                        }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input - Hidden during auto-generation */}
        {(!incident || messages.length > 0) && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={incident ? "Ask follow-up questions about the rescue strategy..." : "Ask Gemini anything..."}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                onClick={clearChat}
                variant="outline"
                size="icon"
                title="Clear chat"
              >
                <span className="text-xs">🗑️</span>
              </Button>
            </div>

            {/* Rescue Status Controls */}
            {rescueStatus && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground mr-2">Update Status:</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateRescueStatus({ phase: 'deploying', teamsDeployed: rescueStatus.teamsDeployed + 1 })}
                  className="text-xs"
                >
                  Deploy Team
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateRescueStatus({ phase: 'responding' })}
                  className="text-xs"
                >
                  Responding
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateRescueStatus({ phase: 'rescuing' })}
                  className="text-xs"
                >
                  Active Rescue
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateRescueStatus({
                    phase: 'rescuing',
                    peopleRescued: rescueStatus.peopleRescued + 1
                  })}
                  className="text-xs"
                >
                  Person Rescued
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateRescueStatus({ phase: 'stabilizing' })}
                  className="text-xs"
                >
                  Stabilizing
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateRescueStatus({ phase: 'completed' })}
                  className="text-xs"
                >
                  Complete
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
