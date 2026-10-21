/**
 * Cyberlife — Milestone 19: M16 Network Analysis & Threat Intelligence Adapter
 *
 * Connects M19 contract investigation workflows to Milestone 16's network topology,
 * synthetic traffic streams, and threat intelligence registry.
 */

import { SYNTHETIC_TRAFFIC_EVENTS } from '../../network/trafficFixtures';
import { THREAT_INTEL_RECORDS } from '../../threatintel/threatIntelFixtures';

export interface ThreatCorrelationResult {
  readonly matched: boolean;
  readonly indicatorId?: string;
  readonly threatActor?: string;
  readonly malwareFamily?: string;
  readonly confidenceScore: number;
  readonly summary?: string;
}

export class M16NetworkAdapter {
  /**
   * Queries synthetic packet events matching an IP or host.
   */
  public static queryTrafficByIp(ipAddress: string) {
    return SYNTHETIC_TRAFFIC_EVENTS.filter(
      pkt => pkt.sourceIp === ipAddress || pkt.destinationIp === ipAddress
    );
  }

  /**
   * Correlates an IP or domain against fictional threat intelligence indicators.
   */
  public static correlateIndicator(value: string): ThreatCorrelationResult {
    const indicator = THREAT_INTEL_RECORDS.find(
      ioc => ioc.value.toLowerCase() === value.toLowerCase()
    );

    if (indicator) {
      return {
        matched: true,
        indicatorId: indicator.id,
        threatActor: indicator.threatActor,
        malwareFamily: indicator.campaign,
        confidenceScore: indicator.confidenceScore,
        summary: indicator.description,
      };
    }

    return {
      matched: false,
      confidenceScore: 0,
    };
  }
}
