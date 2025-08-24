// Shared types for disaster response system

export interface DisasterAlert {
  id: string;
  type: string;
  severity: string;
  location: string;
  description: string;
  affectedPopulation: number;
  timestamp: string;
  status: string;
  coordinates?: [number, number];
}

export interface ResponseTeam {
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
  coordinates?: [number, number];
}

export interface ResourceInventory {
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

export interface CommunicationChannel {
  id: string;
  type: string;
  status: string;
  coverage: string;
  uptime: number;
  lastTest: string;
  backup: boolean;
}

export interface RescueStatus {
  phase: 'preparing' | 'deploying' | 'responding' | 'rescuing' | 'stabilizing' | 'completed';
  teamsDeployed: number;
  peopleRescued: number;
  lastUpdate: Date;
  estimatedCompletion?: Date;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}