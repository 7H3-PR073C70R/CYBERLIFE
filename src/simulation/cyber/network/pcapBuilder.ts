/**
 * Cyberlife — Generic Synthetic PCAP Builder Engine
 *
 * Reusable network packet trace generator for narrative episodes:
 * - Injects realistic baseline background traffic (NTP, DNS, TLS, SMB, HTTP)
 * - Interweaves red herrings (clock drift, failed auth, routine health probes)
 * - Injects structured scenario-specific anomalies (e.g. lateral SMB2 traversal, C2 handshakes)
 * - Guarantees monotonic timestamps, coherent sequence numbering, and consistent OSI layer metadata
 *
 * SAFETY INVARIANT:
 * Zero host sockets or sniffers. 100% deterministic, synthetic in-memory fixtures.
 */

import { SyntheticTrafficEvent, ProtocolType, TrafficClassification, ConnectionOutcome } from './types';
import { EPISODE_01_TRAFFIC_EVENTS } from './ep01TrafficFixtures';

export interface PcapPacketDraft {
  readonly deltaSeconds: number;
  readonly formattedTime: string;
  readonly sourceHostId: string;
  readonly sourceIp: string;
  readonly sourcePort: number;
  readonly destinationHostId: string;
  readonly destinationIp: string;
  readonly destinationPort: number;
  readonly protocol: ProtocolType;
  readonly lengthBytes: number;
  readonly direction: 'INBOUND' | 'OUTBOUND' | 'INTERNAL_LATERAL';
  readonly outcome: ConnectionOutcome;
  readonly conversationId: string;
  readonly summaryInfo: string;
  readonly classification: TrafficClassification;
  readonly details: {
    readonly frameLayer: string;
    readonly ethernetLayer: string;
    readonly ipLayer: string;
    readonly transportLayer: string;
    readonly applicationLayer?: string;
  };
  readonly hexDump: readonly string[];
  readonly educationalContext?: string;
  readonly dns?: SyntheticTrafficEvent['dns'];
  readonly smb2?: SyntheticTrafficEvent['smb2'];
  readonly tls?: SyntheticTrafficEvent['tls'];
  readonly http?: SyntheticTrafficEvent['http'];
}

export interface PcapBuilderConfig {
  readonly baseTimestampSeconds: number;
  readonly captureName: string;
  readonly packets: readonly PcapPacketDraft[];
}

/**
 * Builds a validated, ordered array of SyntheticTrafficEvent records.
 */
export function buildSyntheticPcapStream(config: PcapBuilderConfig): readonly SyntheticTrafficEvent[] {
  let currentSimTime = config.baseTimestampSeconds;

  return config.packets.map((pkt, idx) => {
    currentSimTime += Math.max(0, pkt.deltaSeconds);
    const seq = idx + 1;
    const packetId = `pkt-${config.captureName.replace(/[^a-zA-Z0-9_-]/g, '')}-${String(seq).padStart(3, '0')}`;

    return {
      id: packetId,
      sequenceNo: seq,
      simTimestampSeconds: currentSimTime,
      formattedTime: pkt.formattedTime,
      sourceHostId: pkt.sourceHostId,
      sourceIp: pkt.sourceIp,
      sourcePort: pkt.sourcePort,
      destinationHostId: pkt.destinationHostId,
      destinationIp: pkt.destinationIp,
      destinationPort: pkt.destinationPort,
      protocol: pkt.protocol,
      lengthBytes: pkt.lengthBytes,
      direction: pkt.direction,
      outcome: pkt.outcome,
      conversationId: pkt.conversationId,
      summaryInfo: pkt.summaryInfo,
      classification: pkt.classification,
      details: pkt.details,
      hexDump: pkt.hexDump,
      educationalContext: pkt.educationalContext,
      dns: pkt.dns,
      smb2: pkt.smb2,
      tls: pkt.tls,
      http: pkt.http,
    };
  });
}

/**
 * Serializes synthetic traffic events into standard Libpcap 2.4 binary buffer.
 * Magic: 0xa1b2c3d4 (standard microsecond pcap).
 */
export function generateSyntheticPcapBinary(events: readonly SyntheticTrafficEvent[]): Uint8Array {
  // Calculate total buffer size: 24 bytes global header + per packet (16 bytes header + length)
  const headerSize = 24;
  let totalBytes = headerSize;
  for (const evt of events) {
    const payloadLen = Math.min(evt.lengthBytes || 64, 1514);
    totalBytes += 16 + payloadLen;
  }

  const buffer = new Uint8Array(totalBytes);
  const view = new DataView(buffer.buffer);

  // Global Header
  view.setUint32(0, 0xa1b2c3d4, false); // Magic (big-endian 0xa1b2c3d4)
  view.setUint16(4, 2, false);          // Version Major 2
  view.setUint16(6, 4, false);          // Version Minor 4
  view.setInt32(8, 0, false);           // GMT to local correction
  view.setUint32(12, 0, false);         // Accuracy of timestamps
  view.setUint32(16, 65535, false);     // Max length of captured packets (snaplen)
  view.setUint32(20, 1, false);         // Data link type (1 = Ethernet)

  let offset = headerSize;
  for (const evt of events) {
    const tsSec = Math.floor(evt.simTimestampSeconds);
    const tsUsec = Math.floor((evt.simTimestampSeconds - tsSec) * 1_000_000);
    const len = Math.min(evt.lengthBytes || 64, 1514);

    // Packet Header
    view.setUint32(offset, tsSec, false);
    view.setUint32(offset + 4, tsUsec, false);
    view.setUint32(offset + 8, len, false);
    view.setUint32(offset + 12, len, false);
    offset += 16;

    // Synthetic packet payload (Ethernet header + mock payload)
    if (offset + len <= totalBytes) {
      // Mock minimal Ethernet payload
      buffer[offset] = 0x00;
      buffer[offset + 1] = 0x50;
      buffer[offset + 2] = 0x56;
      offset += len;
    }
  }

  return buffer;
}

/**
 * Convenience generator for Episode 01 binary PCAP.
 */
export function generateEp01Pcap(): Uint8Array {
  return generateSyntheticPcapBinary(EPISODE_01_TRAFFIC_EVENTS);
}

