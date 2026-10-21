/**
 * Cyberlife — Milestone 16: Pure Traffic Analyzer & Query Engine
 *
 * Implements pure domain functions for filtering, searching, conversation grouping,
 * protocol inspection, and traffic anomaly aggregation.
 *
 * SAFETY INVARIANT:
 * Zero host calls or external dependencies. Pure TypeScript functions.
 */

import {
  SyntheticTrafficEvent,
  TrafficConversation,
  TrafficFilterOptions,
  ProtocolType,
  TrafficClassification,
} from './types';

export function filterTrafficEvents(
  events: readonly SyntheticTrafficEvent[],
  options?: TrafficFilterOptions
): readonly SyntheticTrafficEvent[] {
  if (!options) return events;

  return events.filter(event => {
    // 1. Protocol filter
    if (options.protocol && options.protocol !== 'ALL' && event.protocol !== options.protocol) {
      return false;
    }

    // 2. Host filter (matches either source or destination)
    if (options.hostId && options.hostId !== 'ALL') {
      if (event.sourceHostId !== options.hostId && event.destinationHostId !== options.hostId) {
        return false;
      }
    }

    // 3. Port filter
    if (options.port !== undefined) {
      if (event.sourcePort !== options.port && event.destinationPort !== options.port) {
        return false;
      }
    }

    // 4. Outcome filter
    if (options.outcome && options.outcome !== 'ALL' && event.outcome !== options.outcome) {
      return false;
    }

    // 5. Classification filter
    if (
      options.classification &&
      options.classification !== 'ALL' &&
      event.classification !== options.classification
    ) {
      return false;
    }

    // 6. Conversation ID filter
    if (options.conversationId && event.conversationId !== options.conversationId) {
      return false;
    }

    // 7. Time range filter
    if (options.timeRange) {
      if (
        event.simTimestampSeconds < options.timeRange.minSimTime ||
        event.simTimestampSeconds > options.timeRange.maxSimTime
      ) {
        return false;
      }
    }

    // 8. Text search query
    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase().trim();
      const matchSummary = event.summaryInfo.toLowerCase().includes(q);
      const matchSrc = event.sourceIp.toLowerCase().includes(q) || event.sourceHostId.toLowerCase().includes(q);
      const matchDst = event.destinationIp.toLowerCase().includes(q) || event.destinationHostId.toLowerCase().includes(q);
      const matchProto = event.protocol.toLowerCase().includes(q);
      const matchDns = event.dns?.queryName.toLowerCase().includes(q) ?? false;
      const matchHttp = event.http?.uri.toLowerCase().includes(q) ?? false;
      const matchTls = event.tls?.sni.toLowerCase().includes(q) ?? false;
      const matchSmb = event.smb2?.filename?.toLowerCase().includes(q) ?? false;

      if (!matchSummary && !matchSrc && !matchDst && !matchProto && !matchDns && !matchHttp && !matchTls && !matchSmb) {
        return false;
      }
    }

    return true;
  });
}

export function searchTrafficEvents(
  events: readonly SyntheticTrafficEvent[],
  query: string
): readonly SyntheticTrafficEvent[] {
  return filterTrafficEvents(events, { searchQuery: query });
}

export interface HostTrafficSummary {
  readonly hostId: string;
  readonly totalPackets: number;
  readonly totalBytes: number;
  readonly inboundCount: number;
  readonly outboundCount: number;
  readonly lateralCount: number;
  readonly distinctPeerHostIds: readonly string[];
  readonly observedProtocols: readonly ProtocolType[];
  readonly hasSuspiciousActivity: boolean;
}

export function getHostTrafficSummary(
  events: readonly SyntheticTrafficEvent[],
  hostId: string
): HostTrafficSummary {
  let totalBytes = 0;
  let inboundCount = 0;
  let outboundCount = 0;
  let lateralCount = 0;
  const peers = new Set<string>();
  const protos = new Set<ProtocolType>();
  let hasSuspicious = false;

  const hostEvents = events.filter(e => e.sourceHostId === hostId || e.destinationHostId === hostId);

  for (const e of hostEvents) {
    totalBytes += e.lengthBytes;
    protos.add(e.protocol);

    if (
      e.classification === 'SUSPICIOUS_BEACON' ||
      e.classification === 'SUSPICIOUS_EXFILTRATION' ||
      e.classification === 'UNAUTHORIZED_ACCESS'
    ) {
      hasSuspicious = true;
    }

    if (e.sourceHostId === hostId) {
      peers.add(e.destinationHostId);
      if (e.direction === 'OUTBOUND') outboundCount++;
      else lateralCount++;
    } else {
      peers.add(e.sourceHostId);
      if (e.direction === 'INBOUND') inboundCount++;
      else lateralCount++;
    }
  }

  return {
    hostId,
    totalPackets: hostEvents.length,
    totalBytes,
    inboundCount,
    outboundCount,
    lateralCount,
    distinctPeerHostIds: Array.from(peers),
    observedProtocols: Array.from(protos),
    hasSuspiciousActivity: hasSuspicious,
  };
}

export interface OverallTrafficMetrics {
  readonly totalPackets: number;
  readonly totalBytes: number;
  readonly protocolDistribution: Readonly<Record<ProtocolType, number>>;
  readonly classificationDistribution: Readonly<Record<TrafficClassification, number>>;
  readonly suspiciousCount: number;
  readonly benignCount: number;
  readonly distinctConversationsCount: number;
}

export function getTrafficMetrics(
  events: readonly SyntheticTrafficEvent[]
): OverallTrafficMetrics {
  let totalBytes = 0;
  let suspiciousCount = 0;
  let benignCount = 0;
  const protoMap: Record<string, number> = {};
  const classMap: Record<string, number> = {};
  const convos = new Set<string>();

  for (const e of events) {
    totalBytes += e.lengthBytes;
    protoMap[e.protocol] = (protoMap[e.protocol] ?? 0) + 1;
    classMap[e.classification] = (classMap[e.classification] ?? 0) + 1;
    convos.add(e.conversationId);

    if (
      e.classification === 'SUSPICIOUS_BEACON' ||
      e.classification === 'SUSPICIOUS_EXFILTRATION' ||
      e.classification === 'UNAUTHORIZED_ACCESS'
    ) {
      suspiciousCount++;
    } else {
      benignCount++;
    }
  }

  return {
    totalPackets: events.length,
    totalBytes,
    protocolDistribution: protoMap as Record<ProtocolType, number>,
    classificationDistribution: classMap as Record<TrafficClassification, number>,
    suspiciousCount,
    benignCount,
    distinctConversationsCount: convos.size,
  };
}

export function findEventById(
  events: readonly SyntheticTrafficEvent[],
  eventId: string
): SyntheticTrafficEvent | undefined {
  return events.find(e => e.id === eventId);
}

export function findConversationById(
  conversations: readonly TrafficConversation[],
  convoId: string
): TrafficConversation | undefined {
  return conversations.find(c => c.id === convoId);
}
