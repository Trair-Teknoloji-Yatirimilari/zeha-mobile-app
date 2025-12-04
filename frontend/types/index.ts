// User Types
export type UserRole = 'adult' | 'kids';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  age?: number;
  ageGroup?: '4-6' | '7-9' | '10-12' | '13-15';
  parentId?: string;
  createdAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  age?: number;
  parentId?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// Chat Types
export type ChatMode = 'teacher' | 'homework' | 'fun' | 'support' | 'general';

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  mode: ChatMode;
  type: 'text' | 'image' | 'voice';
  imageUrl?: string;
  voiceUrl?: string;
  timestamp: string;
  isAI: boolean;
}

export interface SendMessageRequest {
  content: string;
  mode: ChatMode;
  type: 'text' | 'image' | 'voice';
  imageData?: string;
}

// Parent Dashboard Types
export interface RiskAlert {
  id: string;
  kidId: string;
  kidName: string;
  level: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  timestamp: string;
}

export interface PsychologicalAnalysis {
  kidId: string;
  kidName: string;
  mood: 'positive' | 'neutral' | 'concerning';
  concerns: string[];
  recommendations: string[];
  lastUpdated: string;
}

export interface DashboardData {
  alerts: RiskAlert[];
  analysis: PsychologicalAnalysis[];
  kids: User[];
}

// Time Settings Types
export interface TimeSettings {
  id: string;
  kidId: string;
  dailyMessageLimit: number;
  sleepTimeStart: string; // HH:mm format
  sleepTimeEnd: string;
  schoolTimeEnabled: boolean;
  schoolTimeStart?: string;
  schoolTimeEnd?: string;
}

export interface TimeSettingsUpdate {
  kidId: string;
  dailyMessageLimit?: number;
  sleepTimeStart?: string;
  sleepTimeEnd?: string;
  schoolTimeEnabled?: boolean;
  schoolTimeStart?: string;
  schoolTimeEnd?: string;
}
