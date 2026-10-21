/**
 * Cyberlife — OnionChat & Hacker VoIP Call Datasets
 * Authentic hacker messaging threads and voice call dialogue streams.
 */

import { ChatThread } from './types';

export const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: 'thread-amina',
    contactId: 'amina-okonjo',
    contactName: 'Temitope Blessing',
    contactRole: 'Lead SecOps Architect',
    contactOrg: 'Cedarline Corp Cyber Defense',
    contactAvatarColor: '#00e5ff',
    isOnline: true,
    securityClearance: 'LEVEL 4 // SEC-CLEAR',
    unreadCount: 1,
    canCall: true,
    callDialogue: [
      {
        text: 'Tade, can you hear me? Secure line established via ZRTP 256-bit AES.',
        delayMs: 2500,
      },
      {
        text: 'Our edge perimeter on Broad Street just logged anomalous egress traffic.',
        delayMs: 4000,
      },
      {
        text: 'Underground chatter suggests a leaked Lagos credential dump is circulating.',
        delayMs: 4000,
      },
      {
        text: 'Fire up Tor Browser and check CipherMarket or DeepLeaks immediately.',
        delayMs: 4500,
      },
      {
        text: 'If Cedarline hashes are compromised, we need to revoke the admin tokens ASAP.',
        delayMs: 4500,
      },
      {
        text: "I'm monitoring the Suricata sensor from the server room. Good luck.",
        delayMs: 3500,
      },
    ],
    messages: [
      {
        id: 'msg-am-1',
        senderId: 'amina-okonjo',
        senderName: 'Temitope Blessing',
        senderRole: 'Lead SecOps Architect',
        text: 'Tade, glad you got into the terminal. Broad Street perimeter traffic spiked 300% 20 minutes ago.',
        timestamp: '10:14 AM',
        isEncrypted: true,
        isFromPlayer: false,
        gpgFingerprint: '0x9E4B 22C1 88DA',
      },
      {
        id: 'msg-am-2',
        senderId: 'amina-okonjo',
        senderName: 'Temitope Blessing',
        senderRole: 'Lead SecOps Architect',
        text: 'Run nmap or netstat against 10.42.0.0/24 subnet. We need eyes on port 8080 and unlisted egress.',
        timestamp: '10:16 AM',
        isEncrypted: true,
        isFromPlayer: false,
        gpgFingerprint: '0x9E4B 22C1 88DA',
        suggestedReplies: [
          'On it now, pulling port telemetry.',
          'Seeing suspicious egress to an unlisted external gateway.',
          'Checking the firewall rules in Rule Tuner.',
        ],
      },
    ],
  },
  {
    id: 'thread-cipher',
    contactId: 'cipher',
    contactName: 'Cipher',
    contactRole: 'Underground Broker & Whistleblower',
    contactOrg: '0xBoard Syndicate',
    contactAvatarColor: '#a855f7',
    isOnline: true,
    securityClearance: 'UNKNOWN // ONION ROUTED',
    unreadCount: 1,
    canCall: true,
    voice: {
      gender: 'male',
      pitch: 0.92,
      rate: 0.94,
      voiceHints: ['en-ng', 'nigeria', 'male', 'daniel'],
    },
    callDialogue: [
      {
        text: '*electronic audio static* ... Tade, keep your voice down. Relay is 3 hops deep.',
        delayMs: 2800,
      },
      {
        text: "You're looking into the Broad Street incident, aren't you? Cedarline isn't telling you everything.",
        delayMs: 4200,
      },
      {
        text: "The breach wasn't from a random script kiddie. Someone used internal admin credentials.",
        delayMs: 4500,
      },
      {
        text: 'I posted the unredacted Aster AI memory dump onto DeepLeaks (deepleaks.onion).',
        delayMs: 4200,
      },
      {
        text: 'Check CipherMarket too if you need targeted wordlists or exploit analysis scripts.',
        delayMs: 4500,
      },
      { text: 'Watch your back on the corporate network. Disconnecting now.', delayMs: 3000 },
    ],
    messages: [
      {
        id: 'msg-cp-1',
        senderId: 'cipher',
        senderName: 'Cipher',
        senderRole: 'Underground Broker',
        text: 'Greetings, analyst. Heard Cedarline had a little surprise on their Broad Street cluster.',
        timestamp: '09:42 AM',
        isEncrypted: true,
        isFromPlayer: false,
        gpgFingerprint: '0x3F88 DE01 C892',
      },
      {
        id: 'msg-cp-2',
        senderId: 'cipher',
        senderName: 'Cipher',
        senderRole: 'Underground Broker',
        text: 'If you want the unredacted Aster AI telemetry, open Tor Browser and visit deepleaks.onion. It was dumped 2 hours ago.',
        timestamp: '09:45 AM',
        isEncrypted: true,
        isFromPlayer: false,
        gpgFingerprint: '0x3F88 DE01 C892',
        suggestedReplies: [
          'Who are you and what do you want?',
          'How did you get Aster AI telemetry?',
          'Is Cedarline customer data compromised?',
        ],
      },
    ],
  },
  {
    id: 'thread-watchdog',
    contactId: 'aster-watchdog',
    contactName: 'Aster SIEM Bot',
    contactRole: 'Autonomous IDS Telemetry Engine',
    contactOrg: 'Aster Security Core',
    contactAvatarColor: '#f59e0b',
    isOnline: true,
    securityClearance: 'SYSTEM DAEMON // PID 1024',
    unreadCount: 0,
    canCall: false,
    voice: {
      gender: 'male',
      pitch: 1.0,
      rate: 1.0,
      voiceHints: ['synth', 'robot', 'bad news', 'cellos', 'whisper', 'albert', 'fred'],
    },
    callDialogue: [],
    messages: [
      {
        id: 'msg-wd-1',
        senderId: 'aster-watchdog',
        senderName: 'Aster SIEM Bot',
        senderRole: 'Daemon',
        text: '[ALERT: ELEVATED] Inbound port scan detected on 10.42.0.5:22 from 198.51.100.42.',
        timestamp: '10:02 AM',
        isEncrypted: false,
        isFromPlayer: false,
      },
      {
        id: 'msg-wd-2',
        senderId: 'aster-watchdog',
        senderName: 'Aster SIEM Bot',
        senderRole: 'Daemon',
        text: '[NOTICE] Suricata Rule #200491 triggered: Suspicious base64 payload in HTTP POST /api/v1/auth.',
        timestamp: '10:18 AM',
        isEncrypted: false,
        isFromPlayer: false,
        suggestedReplies: [
          'Acknowledge alert and isolate IP.',
          'Export packet capture for Packet Lens.',
        ],
      },
    ],
  },
];

export const CONTACT_AUTO_RESPONSES: Record<string, Record<string, string>> = {
  'amina-okonjo': {
    'On it now, pulling port telemetry.':
      'Good. If you spot an encrypted tunnel, capture the pcap and inspect it in Packet Lens or run `tcpdump -r`.',
    'Seeing suspicious egress to an unlisted external gateway.':
      'Confirm the remote IP immediately. If it matches 198.51.100.89, that is a known Tor rendezvous node.',
    'Checking the firewall rules in Rule Tuner.':
      'Make sure Rule #200491 is set to DROP or REJECT. We cannot afford a lateral spread.',
    default:
      'Message acknowledged, Tade. Stay vigilant on the terminal and keep telemetry logs saved in /var/log.',
  },
  cipher: {
    'Who are you and what do you want?':
      'Just a fellow traveler who likes seeing truth exposed. Use Tor Browser wisely. Check CipherMarket if you need tools.',
    'How did you get Aster AI telemetry?':
      'Aster left an unauthenticated S3 bucket open on Marina subnets. Security through obscurity never works.',
    'Is Cedarline customer data compromised?':
      'Not yet, but the breach window is closing. Check DeepLeaks before Aster issues takedown notices.',
    default: 'Encrypted packet received. Be careful who you trust on the Broad Street trunk.',
  },
  'aster-watchdog': {
    'Acknowledge alert and isolate IP.':
      '[SYSTEM ACTION] IP 198.51.100.42 appended to iptables DROP chain. Sensor status: NORMAL.',
    'Export packet capture for Packet Lens.':
      '[SYSTEM ACTION] Packet dump written to /home/analyst/pcaps/suspicious_egress.pcap (2.4 MB). Ready for Packet Lens analysis.',
    default: '[SYSTEM NOTICE] Telemetry event acknowledged and archived to /var/log/audit.log.',
  },
};
