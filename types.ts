export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface DateIdea {
  title: string;
  description: string;
  duration: string;
  budget: string;
  vibe: string;
}

export enum AppState {
  CLOSED = 'CLOSED',
  OPENING = 'OPENING',
  OPEN = 'OPEN'
}

