
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

export interface Story {
  id: string | number;
  name: string;
  img: string;
  isUser: boolean;
  videoUrl?: string; // Optional if it's a video story
}

export interface Reel {
  id: string;
  videoUrl: string;
  username: string;
  userAvatar: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  isBoosted?: boolean;
  boostConfig?: {
    budget: string;
    duration: string;
    target: string;
  };
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  postsCount: number;
}
