export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other' | 'system';
  timestamp: number;
}

export enum ChatState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED'
}

export type ChatMode = 'text' | 'video';

export interface UserProfile {
  name: string;
  avatar: string;
  username: string;
}

export type Tab = 'home' | 'explore' | 'create' | 'reels' | 'profile';
