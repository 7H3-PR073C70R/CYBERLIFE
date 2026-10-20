/**
 * Cyberlife — OnionChat & Hacker VoIP Call Types
 */

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  text: string;
  timestamp: string;
  isEncrypted: boolean;
  isFromPlayer: boolean;
  gpgFingerprint?: string;
  suggestedReplies?: string[];
}

export interface ChatThread {
  id: string;
  contactId: string;
  contactName: string;
  contactRole: string;
  contactOrg: string;
  contactAvatarColor: string;
  isOnline: boolean;
  securityClearance: string;
  unreadCount: number;
  messages: ChatMessage[];
  canCall: boolean;
  callDialogue: Array<{ text: string; delayMs: number }>;
}

export interface HackerCallState {
  id: string;
  callerId: string;
  callerName: string;
  callerRole: string;
  callerOrg: string;
  status: 'idle' | 'ringing' | 'active' | 'ended';
  durationSeconds: number;
  currentSubtitleIndex: number;
  isMuted: boolean;
}
