// Internationalization types
export type Language = 'en' | 'hi';

export interface Translation {
  // Navigation
  dashboard: string;
  help: string;
  signIn: string;
  signOut: string;
  profile: string;
  helper: string;
  geminiAI: string;
  needHelp: string;
  headerTitle: string;
  
  // Common actions
  search: string;
  filter: string;
  refresh: string;
  save: string;
  cancel: string;
  submit: string;
  close: string;
  send: string;
  clear: string;
  
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
  disasterResponse: string;
  rescueStrategy: string;
  
  // Home page
  welcomeTitle: string;
  welcomeSubtitle: string;
  emergencyResourcesLink: string;
  loadingMap: string;
  coordinationHubSubtitle: string;
  
  // Our Goal Section
  ourGoalTitle: string;
  ourGoalSubtitle: string;
  ourGoalDescription: string;
  learnMore: string;
  
  // Gemini Chat
  chatTitle: string;
  typeMessage: string;
  chatPlaceholder: string;
  sendingMessage: string;
  rescueChat: string;
  
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
  
  // MCP Agent Tools
  geoJsonTool: string;
  messagingTool: string;
  ndrfAgents: string;
  volunteers: string;
  sendingToAgents: string;
  locationData: string;
  mapVisualization: string;
  
  // Footer Sections
  footerOurGoal: string;
  footerOurGoalDesc: string;
  footerFeatures: string;
  footerResources: string;
  footerContact: string;
}