
export interface Message {
  id: string;
  text?: string;
  audioUrl?: string;
  mediaUrl?: string; // For images/videos
  fileName?: string; // For documents/original quality files
  fileSize?: string; // e.g., "2.5 MB"
  duration?: number;
  type?: 'text' | 'audio' | 'image' | 'video' | 'file';
  sender: 'me' | 'other' | 'system';
  timestamp: number;
  status?: 'sent' | 'delivered' | 'read';
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

export type StoryType = 'image' | 'video' | 'text';

// Fix: Adding missing OverlayItem interface required by CreateVideo component
export interface OverlayItem {
  id: string;
  type: 'text' | 'sticker';
  content: string;
  x: number;
  y: number;
  color?: string;
  scale: number;
}

export interface StoryItem {
  id: string | number;
  type: StoryType;
  url?: string; // For image/video
  content?: string; // For text
  background?: string; // For text background color
  timestamp: number;
  duration: number; // in seconds
  viewers?: number;
  // Fix: Adding optional overlays property to StoryItem
  overlays?: OverlayItem[];
}

export interface Story {
  id: string | number; // User ID acting as Story Group ID
  username: string;
  avatar: string;
  isUser: boolean; // Is current user
  items: StoryItem[];
  allViewed: boolean;
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
  tags?: string[];
  category?: string;
  // Fix: Adding optional overlays property to Reel
  overlays?: OverlayItem[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  phone?: string;
  dob?: string;
  followers: number;
  following: number;
  postsCount: number;
}
