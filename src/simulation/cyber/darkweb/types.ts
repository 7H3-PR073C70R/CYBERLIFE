/**
 * Cyberlife — Simulated Tor & Dark Web Types
 * Fictional, sandboxed underground web ecosystem.
 */

export type OnionCategory = 'directory' | 'market' | 'leaks' | 'forum' | 'utility';

export interface MarketListing {
  id: string;
  title: string;
  category: 'exploit' | 'wordlist' | 'intel' | 'hardware' | 'tool';
  vendor: string;
  rating: number; // e.g. 4.9
  salesCount: number;
  price: number; // In-game currency (₦)
  description: string;
  features: string[];
  filename: string;
  vfsTargetPath: string;
  deliveredContent: string;
  inStock: boolean;
}

export interface LeakPost {
  id: string;
  title: string;
  leakDate: string;
  source: string;
  targetOrg: string;
  classification: 'CONFIDENTIAL' | 'TOP SECRET' | 'PROPRIETARY' | 'INTERNAL';
  description: string;
  fileSizeBytes: string;
  rawSnippet: string;
  sha256: string;
}

export interface ForumPost {
  id: string;
  author: string;
  role: string;
  time: string;
  content: string;
  upvotes: number;
}

export interface ForumThread {
  id: string;
  title: string;
  category: string;
  author: string;
  repliesCount: number;
  viewsCount: number;
  lastActive: string;
  pinned?: boolean;
  posts: ForumPost[];
}

export interface TorCircuitNode {
  type: 'Guard' | 'Middle Relay' | 'Exit / Rendezvous';
  ip: string;
  hostname: string;
  country: string;
  flag: string;
  bandwidth: string;
}

export interface TorCircuit {
  id: string;
  guard: TorCircuitNode;
  relay: TorCircuitNode;
  exit: TorCircuitNode;
  latencyMs: number;
}

export interface OnionSite {
  address: string; // e.g. "ciphermarket.onion"
  title: string;
  tagline: string;
  category: OnionCategory;
  verified: boolean;
  badge?: string;
}
