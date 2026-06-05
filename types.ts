export enum AppTab {
  Chat = 'chat',
  Scene = 'scene',
  Report = 'report',
  Cases = 'cases',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type OpenAIChatMessage = { role: 'user' | 'assistant'; content: string };

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  description: string;
  analysis: string;
}

export interface ReportFormData {
  victimName: string;
  perpetratorName: string;
  dateTime: string;
  location: string;
  description: string;
}