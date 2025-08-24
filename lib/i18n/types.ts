// Internationalization types
export type Language = 'en' | 'hi';

export interface Translation {
  // Navigation
  dashboard: string;
  help: string;
  signIn: string;
  signOut: string;
  profile: string;
  
  // Common actions
  search: string;
  filter: string;
  refresh: string;
  save: string;
  cancel: string;
  submit: string;
  close: string;
  
  // Dashboard
  overview: string;
  alerts: string;
  teams: string;
  resources: string;
  communications: string;
  disasterAlerts: string;
  responseTeams: string;
  resourceInventory: string;
  communicationChannels: string;
  
  // Status
  active: string;
  inactive: string;
  available: string;
  deployed: string;
  critical: string;
  high: string;
  medium: string;
  low: string;
  
  // Emergency
  emergency: string;
  floodAlert: string;
  fireEmergency: string;
  medicalEmergency: string;
  evacuation: string;
  safeZone: string;
  dangerZone: string;
  
  // Time
  lastUpdated: string;
  timestamp: string;
  ago: string;
  hours: string;
  minutes: string;
  
  // Loading states
  loading: string;
  noData: string;
  error: string;
  tryAgain: string;
  
  // Authentication
  loginRequired: string;
  pleaseSignIn: string;
  authenticationFailed: string;
}