import { Message } from '../types';

type MessageCallback = (msg: Message) => void;
type ConnectionCallback = (status: boolean) => void;

// Channel name for broadcasting
const CHANNEL_NAME = 'nel_global_chat_v1';

class RealtimeService {
  private channel: BroadcastChannel;
  private onMessage: MessageCallback | null = null;
  private onConnectionChange: ConnectionCallback | null = null;
  private isConnected: boolean = false;
  private myId: string = Math.random().toString(36).substr(2, 9);
  private pingInterval: any;

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
    this.channel.onmessage = this.handleChannelMessage.bind(this);
  }

  private handleChannelMessage(event: MessageEvent) {
    const data = event.data;

    // Ignore my own messages
    if (data.senderId === this.myId) return;

    switch (data.type) {
      case 'PRESENCE':
        // Someone else is here, acknowledge them
        if (!this.isConnected) {
            this.channel.postMessage({ type: 'ACK', senderId: this.myId });
            this.setConnected(true);
        }
        break;
      case 'ACK':
        // Someone acknowledged me
        this.setConnected(true);
        break;
      case 'CHAT_MESSAGE':
        if (this.onMessage) {
            this.onMessage({
                id: data.id,
                text: data.text,
                sender: 'other',
                timestamp: data.timestamp
            });
        }
        break;
      case 'LEAVE':
         // For 1-on-1 simulation, if someone leaves, we disconnect
         this.setConnected(false);
         break;
    }
  }

  private setConnected(status: boolean) {
      if (this.isConnected !== status) {
          this.isConnected = status;
          if (this.onConnectionChange) this.onConnectionChange(status);
      }
  }

  public connect(onMsg: MessageCallback, onConn: ConnectionCallback) {
    this.onMessage = onMsg;
    this.onConnectionChange = onConn;
    
    // Announce presence immediately
    this.channel.postMessage({ type: 'PRESENCE', senderId: this.myId });
    
    // Keep checking for others
    this.pingInterval = setInterval(() => {
        if (!this.isConnected) {
            this.channel.postMessage({ type: 'PRESENCE', senderId: this.myId });
        }
    }, 2000);
  }

  public sendMessage(text: string) {
    const msg = {
        type: 'CHAT_MESSAGE',
        senderId: this.myId,
        id: Date.now().toString(),
        text: text,
        timestamp: Date.now()
    };
    this.channel.postMessage(msg);
  }

  public disconnect() {
    this.channel.postMessage({ type: 'LEAVE', senderId: this.myId });
    this.isConnected = false;
    if (this.onConnectionChange) this.onConnectionChange(false);
    if (this.pingInterval) clearInterval(this.pingInterval);
  }
}

export const realtimeService = new RealtimeService();
