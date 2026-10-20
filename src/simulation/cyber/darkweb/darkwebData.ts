/**
 * Cyberlife — Simulated Tor & Dark Web Datasets
 * 100% fictional in-game content for underground research, leaks, and tooling.
 */

import { OnionSite, MarketListing, LeakPost, ForumThread, TorCircuit } from './types';

export const DEFAULT_TOR_CIRCUIT: TorCircuit = {
  id: 'circuit-89412',
  latencyMs: 142,
  guard: {
    type: 'Guard',
    ip: '185.220.101.5',
    hostname: 'tor-guard-lagos-node01.relays.net',
    country: 'Nigeria',
    flag: '🇳🇬',
    bandwidth: '85 MB/s',
  },
  relay: {
    type: 'Middle Relay',
    ip: '51.15.82.11',
    hostname: 'anon-relay-iceland-ix.is',
    country: 'Iceland',
    flag: '🇮🇸',
    bandwidth: '120 MB/s',
  },
  exit: {
    type: 'Exit / Rendezvous',
    ip: '198.51.100.89',
    hostname: 'rendezvous-hidden-service.onion',
    country: 'Encrypted Rendezvous',
    flag: '🧅',
    bandwidth: '64 MB/s',
  },
};

export const ONION_DIRECTORY: OnionSite[] = [
  {
    address: 'wiki.onion',
    title: 'The Hidden Wiki // Onion Index',
    tagline: 'Verified directory of underground services, markets, and cyber repositories',
    category: 'directory',
    verified: true,
    badge: 'CORE DIRECTORY',
  },
  {
    address: 'ciphermarket.onion',
    title: 'CipherMarket — Underground Security Exchange',
    tagline: 'Decentralized escrow marketplace for zero-day advisories, wordlists, and tools',
    category: 'market',
    verified: true,
    badge: 'ESCROW ACTIVE',
  },
  {
    address: 'deepleaks.onion',
    title: 'DeepLeaks Whistleblower Pastebin',
    tagline: 'Anonymous data dumps, corporate telemetry leaks, and unredacted memos',
    category: 'leaks',
    verified: true,
    badge: 'PGP SIGNED',
  },
  {
    address: '0xboard.onion',
    title: '0xBoard Underground Hacker Forum',
    tagline: 'Encrypted discussion boards, bounty contracts, and defensive evasion tactics',
    category: 'forum',
    verified: true,
    badge: 'INVITE ONLY',
  },
];

export const CIPHER_MARKET_LISTINGS: MarketListing[] = [
  {
    id: 'mkt-wordlist-01',
    title: 'Lagos Enterprise Sec Wordlist (2026 Edition)',
    category: 'wordlist',
    vendor: '0xGhostWriter',
    rating: 4.9,
    salesCount: 48,
    price: 450,
    description:
      'Curated fictional wordlist containing common Lagos corporate naming schemas, internal default passwords, and seasonal mutations.',
    features: [
      '14,200 targeted candidate hashes',
      'Formatted for offline hash auditing exercises',
      'Includes Broad Street financial subnet naming conventions',
    ],
    filename: 'lagos_enterprise_wordlist.txt',
    vfsTargetPath: '/home/analyst/downloads/lagos_enterprise_wordlist.txt',
    deliveredContent: `# Lagos Enterprise Target Candidates
admin@2026
Cedarline#Sec1
MarinaTower!99
BroadStreet#Gate
Lag0sSecurity2026
P@ssw0rdCedarline
AsterAdminMaster!
filesrv#root2026`,
    inStock: true,
  },
  {
    id: 'mkt-exploit-02',
    title: 'Aster AI Daemon Token Revocation PoC',
    category: 'exploit',
    vendor: 'ZeroDayCollector',
    rating: 5.0,
    salesCount: 19,
    price: 1200,
    description:
      'Educational Python test script demonstrating how excessive agent permissions can be verified and revoked via local IPC socket.',
    features: [
      'Demonstrates CVE-2026-AST-01 validation',
      'Authoritative sandbox simulation compatible',
      'Automated root-cause evidence verification',
    ],
    filename: 'aster_token_remediation_poc.py',
    vfsTargetPath: '/home/analyst/downloads/aster_token_remediation_poc.py',
    deliveredContent: `#!/usr/bin/env python3
# Aster AI Assistant - Remediation Verification Script
# Target: 10.0.4.15 // Service: aster-agent-daemon

import sys

def verify_token_isolation():
    print("[*] Connecting to Aster AI management socket...")
    print("[*] Checking IPC token permissions: READ ONLY")
    print("[+] Remediation check passed: Agent execution restricted.")

if __name__ == '__main__':
    verify_token_isolation()
`,
    inStock: true,
  },
  {
    id: 'mkt-intel-03',
    title: 'Marina Tower Internal Subnet Blueprint',
    category: 'intel',
    vendor: 'NetSpecter',
    rating: 4.8,
    salesCount: 31,
    price: 750,
    description:
      'High-level architectural network schematic mapping Cedarline Services VLANs, router interfaces, and SIEM monitor points.',
    features: [
      'Complete 10.0.4.0/24 subnet mapping',
      'Core switch and database gateway identification',
      'Annotated port matrix for file servers',
    ],
    filename: 'marina_tower_network_blueprint.txt',
    vfsTargetPath: '/home/analyst/downloads/marina_tower_network_blueprint.txt',
    deliveredContent: `CEDARLINE MARINA TOWER // ARCHITECTURAL SUBNET TOPOLOGY
======================================================
Subnet: 10.0.4.0/24 (VLAN 40 - Security Operations)
Gateway: 10.0.4.1 (gw-core-01)

HOST MATRIX:
• 10.0.4.15  - Workstation 04 (SOC Analyst Staging)
• 10.0.4.22  - Workstation 02 (Finance Accounting)
• 10.0.4.50  - filesrv-01 (Internal SMB & Documentation)
• 10.0.4.80  - app-portal-01 (HR & Employee Self-Service)
• 10.0.4.200 - mon-siem-01 (Suricata Alert Collector)
• 10.0.4.250 - vault-core-01 (Restricted Key Management)`,
    inStock: true,
  },
  {
    id: 'mkt-tool-04',
    title: 'Suricata Rule Optimization & Evasion Matrix',
    category: 'tool',
    vendor: 'RuleCraftsman',
    rating: 4.95,
    salesCount: 64,
    price: 900,
    description:
      'Detection engineering cheat-sheet showing how attackers bypass naive string match signatures and how to harden them with PCRE.',
    features: [
      'Detection vs evasion side-by-side analysis',
      'Rule tuning benchmarks for false-positive reduction',
      'Tested against synthetic PCAP fixtures',
    ],
    filename: 'detection_hardening_guide.md',
    vfsTargetPath: '/home/analyst/downloads/detection_hardening_guide.md',
    deliveredContent: `# Detection Engineering & Hardening Guide
## Rule Tuner Reference

1. Avoid loose content matches like \`content:"admin"\`. Use anchored offsets.
2. Require TCP handshake confirmation (\`flow:established,to_server\`).
3. Combine byte_test operators with payload regular expressions to prevent evasion.`,
    inStock: true,
  },
];

export const DEEP_LEAKS_POSTS: LeakPost[] = [
  {
    id: 'leak-01',
    title: 'Aster AI Service Account Over-Privilege Internal Memo',
    leakDate: 'Oct 11, 2026',
    source: 'Anonymous Whistleblower',
    targetOrg: 'Aster Technologies // Cedarline Services',
    classification: 'CONFIDENTIAL',
    description:
      'Internal engineering correspondence showing developers granted aster_agent_daemon root filesystem write access during beta testing.',
    fileSizeBytes: '14.2 KB',
    rawSnippet: `FROM: dev-team@aster-ai.corp
TO: security-review@cedarline.corp
SUBJECT: Urgent: Temporary elevation for Aster daemon

"We have temporarily set Aster daemon token to SYSTEM_ADMIN in /etc/aster/daemon.conf
to unblock automated log collection before the launch deadline.
Please do not flag this in the upcoming SOC audit."`,
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  },
  {
    id: 'leak-02',
    title: 'Marina Tower Gateway Firewall Rule Exception Dump',
    leakDate: 'Oct 08, 2026',
    source: 'DumpBot-9000',
    targetOrg: 'Cedarline Infrastructure Services',
    classification: 'INTERNAL',
    description:
      'Snapshot of gateway access control exceptions permitting unauthenticated telemetry sync to external test server.',
    fileSizeBytes: '8.7 KB',
    rawSnippet: `IPTABLES RULE AUDIT (EXTRACT):
ACCEPT tcp -- 10.0.4.15  anywhere  tcp dpt:445 (SMB file-sharing bypass)
ACCEPT tcp -- 10.0.4.22  anywhere  tcp dpt:8080 (Accounting debug listener)
WARN: Port 445 permitted without mutual TLS authentication.`,
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
  },
];

export const FORUM_THREADS: ForumThread[] = [
  {
    id: 'th-01',
    title: 'How to verify Aster AI daemon without alerting the internal SOC?',
    category: 'Recon & Evasion',
    author: 'cipher_adept',
    repliesCount: 6,
    viewsCount: 342,
    lastActive: '2h ago',
    pinned: true,
    posts: [
      {
        id: 'p-1',
        author: 'cipher_adept',
        role: 'VIP Member',
        time: 'Yesterday at 21:14',
        content:
          'Has anyone inspected the aster_agent_daemon binary running on Cedarline workstations? It looks like it leaves an open telemetry socket on localhost:8080.',
        upvotes: 14,
      },
      {
        id: 'p-2',
        author: 'wire_sniffer',
        role: 'Veteran',
        time: 'Yesterday at 22:05',
        content:
          'Run `svcscan inspect 10.0.4.15` in your terminal. You can inspect the banners. If you check `/etc/security/access.conf`, you will see who has root permissions.',
        upvotes: 21,
      },
    ],
  },
  {
    id: 'th-02',
    title: 'Offline hash auditing tips: Wordlists vs Mutation Rules',
    category: 'Password Auditing',
    author: 'hash_crush',
    repliesCount: 4,
    viewsCount: 189,
    lastActive: '5h ago',
    posts: [
      {
        id: 'p-3',
        author: 'hash_crush',
        role: 'Contributor',
        time: 'Today at 03:22',
        content:
          'When auditing captured hashes from packet captures, always start with targeted organization wordlists before running generic brute-force.',
        upvotes: 9,
      },
    ],
  },
];
