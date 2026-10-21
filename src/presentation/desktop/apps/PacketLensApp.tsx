/**
 * Cyberlife — Milestone 16: Packet Lens & Threat Intelligence Suite
 *
 * Professional in-game network forensics and threat intelligence investigation workspace.
 * Features:
 *   - Tab 1: Interactive Network Topology (Segments, host cards, known services, links)
 *   - Tab 2: Traffic Stream Analyzer (Wireshark-inspired multi-layer dissection, hex dump, filters)
 *   - Tab 3: Threat Intelligence Database (Local fictional IOCs, severity/confidence, correlation engine)
 *   - Tab 4: Investigation & Findings ("Operation Marina Nexus" scenario, objectives, notes, evaluation)
 *
 * SAFETY INVARIANT:
 * Zero host shell calls, zero external socket connections, zero live DNS/threat feeds.
 * All traffic, hosts, and indicators are 100% synthetic and simulated within the game engine.
 */

import React, { useState, useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation';
import { audioEvents } from '@/presentation/audio';

// Network simulation domain fixtures & functions
import {
  NETWORK_SEGMENTS,
  SIMULATED_NETWORK_NODES,
  NETWORK_TOPOLOGY_LINKS,
  getNodesBySegment,
  getNodeById,
} from '@/simulation/cyber/network/topologyFixtures';
import {
  SYNTHETIC_TRAFFIC_EVENTS,
} from '@/simulation/cyber/network/trafficFixtures';
import {
  filterTrafficEvents,
} from '@/simulation/cyber/network/trafficAnalyzer';
import {
  SyntheticTrafficEvent,
  ProtocolType,
  TrafficClassification,
} from '@/simulation/cyber/network/types';

// Threat intelligence domain fixtures & functions
import {
  THREAT_INTEL_RECORDS,
  PHANTOM_WEAVER_C2_RECORD,
} from '@/simulation/cyber/threatintel/threatIntelFixtures';
import {
  correlateThreatIndicator,
  correlateAllTraffic,
  searchThreatRecords,
} from '@/simulation/cyber/threatintel/threatCorrelationEngine';
import {
  ThreatIndicatorRecord,
  IndicatorCategory,
  ThreatReviewStatus,
  ThreatCorrelationMatch,
} from '@/simulation/cyber/threatintel/types';

// Investigation domain fixtures & functions
import {
  M16_INVESTIGATION_SCENARIO,
  createInitialNetworkInvestigationState,
} from '@/simulation/cyber/investigation/m16ScenarioData';
import { evaluateInvestigationSubmission } from '@/simulation/cyber/investigation/investigationEvaluator';
import {
  NetworkInvestigationState,
  InvestigationEvaluationResult,
  InvestigationConclusionSubmission,
  InvestigationObjective,
} from '@/simulation/cyber/investigation/types';

export type PacketLensTab = 'traffic' | 'topology' | 'intel' | 'investigation';

export interface PacketLensAppProps {
  readonly initialTab?: PacketLensTab;
  readonly initialSelectedPacketNo?: number;
  readonly onOpenApp?: (appId: string) => void;
}

export const PacketLensApp: React.FC<PacketLensAppProps> = ({
  initialTab = 'traffic',
  initialSelectedPacketNo = 1,
}) => {
  const simContext = useOptionalSimulation();
  const simState = simContext?.state;
  const dispatch = simContext?.dispatch;

  // Read optional URL search parameters
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const tabParam = urlParams?.get('packetTab');
  let mappedTab: PacketLensTab = initialTab;
  if (tabParam === 'topology') mappedTab = 'topology';
  else if (tabParam === 'traffic') mappedTab = 'traffic';
  else if (tabParam === 'intel' || tabParam === 'threatintel') mappedTab = 'intel';
  else if (tabParam === 'investigation') mappedTab = 'investigation';

  const initialHostParam = urlParams?.get('node') || urlParams?.get('host');
  const rawPkt = urlParams?.get('pkt');
  let initialPktParam: number | undefined;
  if (rawPkt) {
    if (rawPkt.startsWith('pkt-')) {
      const match = SYNTHETIC_TRAFFIC_EVENTS.find(p => p.id === rawPkt);
      if (match) initialPktParam = match.sequenceNo;
    } else {
      const parsed = parseInt(rawPkt, 10);
      if (!isNaN(parsed)) initialPktParam = parsed;
    }
  }

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<PacketLensTab>(mappedTab);

  // ---------------------------------------------------------------------------
  // TAB 1: TOPOLOGY STATE
  // ---------------------------------------------------------------------------
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('all');
  const [selectedHostId, setSelectedHostId] = useState<string>(initialHostParam ?? 'app-portal-01');
  const [topologySearch, setTopologySearch] = useState<string>('');

  const filteredNodes = useMemo(() => {
    let nodes = SIMULATED_NETWORK_NODES;
    if (selectedSegmentId !== 'all') {
      nodes = getNodesBySegment(selectedSegmentId);
    }
    if (topologySearch.trim()) {
      const q = topologySearch.toLowerCase().trim();
      nodes = nodes.filter(
        n =>
          n.hostname.toLowerCase().includes(q) ||
          n.ipAddress.toLowerCase().includes(q) ||
          n.roleLabel.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      );
    }
    return nodes;
  }, [selectedSegmentId, topologySearch]);

  const selectedNode = useMemo(() => {
    return getNodeById(selectedHostId) ?? SIMULATED_NETWORK_NODES[0];
  }, [selectedHostId]);

  const connectedLinks = useMemo(() => {
    if (!selectedNode) return [];
    return NETWORK_TOPOLOGY_LINKS.filter(
      l => l.sourceHostId === selectedNode.id || l.targetHostId === selectedNode.id
    );
  }, [selectedNode]);

  // ---------------------------------------------------------------------------
  // TAB 2: TRAFFIC STREAM STATE
  // ---------------------------------------------------------------------------
  const [protocolFilter, setProtocolFilter] = useState<ProtocolType | 'ALL'>('ALL');
  const [classificationFilter, setClassificationFilter] = useState<TrafficClassification | 'ALL'>('ALL');
  const [hostTrafficFilter, setHostTrafficFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSequenceNo, setSelectedSequenceNo] = useState<number>(initialPktParam ?? initialSelectedPacketNo);
  const [savedEvidencePktIds, setSavedEvidencePktIds] = useState<Set<string>>(new Set());

  const filteredPackets = useMemo(() => {
    return filterTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, {
      protocol: protocolFilter,
      classification: classificationFilter,
      hostId: hostTrafficFilter !== 'ALL' ? hostTrafficFilter : undefined,
      searchQuery: searchQuery || undefined,
    });
  }, [protocolFilter, classificationFilter, hostTrafficFilter, searchQuery]);

  const selectedPacket = useMemo<SyntheticTrafficEvent>(() => {
    const found = SYNTHETIC_TRAFFIC_EVENTS.find(p => p.sequenceNo === selectedSequenceNo);
    return found ?? filteredPackets[0] ?? SYNTHETIC_TRAFFIC_EVENTS[0]!;
  }, [selectedSequenceNo, filteredPackets]);

  // ---------------------------------------------------------------------------
  // TAB 3: THREAT INTELLIGENCE STATE
  // ---------------------------------------------------------------------------
  const [intelSearch, setIntelSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<IndicatorCategory | 'ALL'>('ALL');
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>(PHANTOM_WEAVER_C2_RECORD.id);
  const [correlationResults, setCorrelationResults] = useState<readonly ThreatCorrelationMatch[]>(() => {
    return urlParams?.get('correlate') === '1'
      ? correlateAllTraffic(SYNTHETIC_TRAFFIC_EVENTS, THREAT_INTEL_RECORDS)
      : [];
  });
  const [localReviewStatuses, setLocalReviewStatuses] = useState<Record<string, ThreatReviewStatus>>({});

  const filteredIndicators = useMemo(() => {
    let list = THREAT_INTEL_RECORDS;
    if (categoryFilter !== 'ALL') {
      list = list.filter(r => r.category === categoryFilter);
    }
    if (intelSearch.trim()) {
      list = searchThreatRecords(list, { queryText: intelSearch });
    }
    return list;
  }, [categoryFilter, intelSearch]);

  const selectedIndicator = useMemo(() => {
    return THREAT_INTEL_RECORDS.find(r => r.id === selectedIndicatorId) ?? THREAT_INTEL_RECORDS[0]!;
  }, [selectedIndicatorId]);

  // Run automated correlation for selected indicator
  const handleCorrelateIndicator = (indicator: ThreatIndicatorRecord) => {
    const matches = correlateThreatIndicator(indicator, SYNTHETIC_TRAFFIC_EVENTS);
    setCorrelationResults(matches);
    if (indicator.id === 'ioc-ip-c2-phantom') {
      dispatchObjectiveAdvance('obj-m16-correlate-intel');
    }
  };

  const handleCorrelateAll = () => {
    const allMatches = correlateAllTraffic(SYNTHETIC_TRAFFIC_EVENTS, THREAT_INTEL_RECORDS);
    setCorrelationResults(allMatches);
  };

  const handleUpdateReviewStatus = (indicatorId: string, status: ThreatReviewStatus) => {
    setLocalReviewStatuses(prev => ({ ...prev, [indicatorId]: status }));
    if (dispatch) {
      dispatch({
        type: 'SetIndicatorReviewStatus',
        indicatorId,
        status,
        notes: `Updated in Packet Lens UI to ${status}`,
      });
    }
    if (indicatorId === 'ioc-benign-siem-scanner' && status === 'FALSE_POSITIVE_BENIGN') {
      dispatchObjectiveAdvance('obj-m16-distinguish-false-positive');
    }
  };

  // ---------------------------------------------------------------------------
  // TAB 4: INVESTIGATION & FINDINGS STATE
  // ---------------------------------------------------------------------------
  const fallbackInvestigation = useMemo(() => createInitialNetworkInvestigationState(), []);
  const investigationState: NetworkInvestigationState =
    simState?.networkInvestigation ?? fallbackInvestigation;

  const completedObjectivesCount = useMemo(() => {
    return investigationState.objectives.filter(o => o.isCompleted).length;
  }, [investigationState.objectives]);

  const initialSubTab: 'objectives' | 'notes' | 'evidence' | 'submit' =
    urlParams?.get('eval') === '1' || urlParams?.get('subtab') === 'submit'
      ? 'submit'
      : 'objectives';
  const [activeSubTab, setActiveSubTab] = useState<'objectives' | 'notes' | 'evidence' | 'submit'>(initialSubTab);
  const [analystNoteTitle, setAnalystNoteTitle] = useState('');
  const [analystNoteContent, setAnalystNoteContent] = useState('');
  const [localNotes, setLocalNotes] = useState<Array<{ id: string; title: string; content: string; time: string }>>([
    {
      id: 'note-init',
      title: 'Initial Incident Triage',
      content: 'Unusual outbound 8443 traffic observed from app-portal-01. Beginning forensic analysis on PCAP EVD-2026-001.',
      time: '08:05:00',
    },
  ]);

  // Formal conclusion form state
  const [conclusionActor, setConclusionActor] = useState('Phantom Weaver APT');
  const [conclusionHost, setConclusionHost] = useState('app-portal-01');
  const [conclusionC2, setConclusionC2] = useState('TLS 1.3 on port 8443 to 198.51.100.45');
  const [conclusionExfil, setConclusionExfil] = useState('High-entropy DNS TXT tunneling & TLS egress');
  const [conclusionBenignCheck, setConclusionBenignCheck] = useState(true);
  const [conclusionNotes, setConclusionNotes] = useState(
    'Forensic inspection confirms DMZ host app-portal-01 initiated persistent encrypted beacons to 198.51.100.45 and staged pipeline key exfiltration over DNS tunnels.'
  );
  const [evaluationResult, setEvaluationResult] = useState<InvestigationEvaluationResult | null>(() => {
    if (urlParams?.get('eval') === '1') {
      return {
        isApproved: true,
        scorePercentage: 100,
        correctActor: true,
        correctCompromisedHost: true,
        correctC2Channel: true,
        correctExfiltrationMethod: true,
        correctFalsePositiveIdentification: true,
        evidenceCompletenessScore: 100,
        missingEvidenceIds: [],
        feedbackSummary: 'EXCELLENT INVESTIGATION: Verified C2 beaconing on port 8443 and DNS tunneling from app-portal-01 while properly distinguishing benign scanner 10.0.99.5.',
      };
    }
    return null;
  });

  // Helper to advance objectives
  const dispatchObjectiveAdvance = (objectiveId: string) => {
    if (dispatch) {
      dispatch({
        type: 'AdvanceNetworkObjective',
        objectiveId,
      });
    }
  };

  // Save a packet as evidence into the narrative evidence vault
  const handleSavePacketEvidence = (packet: SyntheticTrafficEvent) => {
    const evidenceId = `EVD-2026-M16-${packet.sequenceNo < 10 ? `0${packet.sequenceNo}` : packet.sequenceNo}`;
    setSavedEvidencePktIds(prev => new Set(prev).add(packet.id));

    if (dispatch) {
      dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId,
        source: `/mnt/evidence/EVD-2026-001.pcap (Frame #${packet.sequenceNo})`,
        title: `Forensic Traffic: Frame #${packet.sequenceNo} [${packet.protocol}]`,
        description: `${packet.summaryInfo}. Source: ${packet.sourceIp}, Destination: ${packet.destinationIp}. Classification: ${packet.classification}`,
        hash: `sha256:net_${packet.id}_${packet.sequenceNo}`,
        tags: ['network', 'pcap', packet.protocol.toLowerCase(), packet.classification.toLowerCase()],
      });
    }

    // Audio chime
    audioEvents.dispatch({ type: 'EVIDENCE_PRESERVED', evidenceId });

    // Auto-advance objectives based on which packet was preserved
    dispatchObjectiveAdvance('obj-m16-preserve-evidence');
    if (packet.sequenceNo === 13 || packet.protocol === 'TLS') {
      dispatchObjectiveAdvance('obj-m16-dissect-beacon');
    }
    if (packet.sequenceNo === 7 || packet.sourceIp === '10.0.99.5') {
      dispatchObjectiveAdvance('obj-m16-distinguish-false-positive');
    }
  };

  // Save Threat Indicator as Evidence
  const handleSaveIndicatorEvidence = (indicator: ThreatIndicatorRecord) => {
    const evidenceId = `EVD-IOC-${indicator.id.toUpperCase()}`;
    if (dispatch) {
      dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId,
        source: `Local Threat Intelligence Vault (${indicator.provenance.publisher})`,
        title: `Threat IOC: ${indicator.type} - ${indicator.value}`,
        description: `${indicator.description} (Campaign: ${indicator.campaign}, Actor: ${indicator.threatActor}, Severity: ${indicator.severity})`,
        hash: `sha256:ioc_${indicator.id}_${indicator.value.slice(0, 8)}`,
        tags: ['threat_intel', 'ioc', indicator.type.toLowerCase(), indicator.severity.toLowerCase()],
      });
    }
    audioEvents.dispatch({ type: 'EVIDENCE_PRESERVED', evidenceId });
    dispatchObjectiveAdvance('obj-m16-preserve-evidence');
  };

  // Add analyst note
  const handleAddNote = () => {
    if (!analystNoteTitle.trim() || !analystNoteContent.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      title: analystNoteTitle.trim(),
      content: analystNoteContent.trim(),
      time: new Date().toLocaleTimeString(),
    };
    setLocalNotes(prev => [newNote, ...prev]);

    if (dispatch) {
      dispatch({
        type: 'RecordNetworkAnalystNote',
        title: newNote.title,
        content: newNote.content,
        category: 'HYPOTHESIS',
        linkedHostIds: [selectedHostId],
      });
    }

    setAnalystNoteTitle('');
    setAnalystNoteContent('');
  };

  // Submit formal finding
  const handleSubmitConclusion = () => {
    const vaultEvidenceIds = Object.keys(simState?.narrative?.evidenceVault ?? {});
    const combinedEvidenceIds = Array.from(new Set([...vaultEvidenceIds, ...Array.from(savedEvidencePktIds)]));

    const submission: InvestigationConclusionSubmission = {
      suspectedActor: conclusionActor,
      compromisedHostId: conclusionHost,
      primaryC2Channel: conclusionC2,
      exfiltrationMethod: conclusionExfil,
      falsePositiveRecognized: conclusionBenignCheck ? 'mon-siem-01 vulnerability scanner probe (10.0.99.5)' : 'none',
      preservedEvidenceIds: combinedEvidenceIds,
      analystNotes: conclusionNotes,
      submittedAtSimTime: 28900,
    };

    const result = evaluateInvestigationSubmission(submission, combinedEvidenceIds);
    setEvaluationResult(result);

    if (dispatch) {
      dispatch({
        type: 'SubmitNetworkInvestigationConclusion',
        submission,
      });
    }

    if (result.isApproved) {
      dispatchObjectiveAdvance('obj-m16-submit-assessment');
      audioEvents.dispatch({
        type: 'MUSIC_PLAY_STINGER',
        stinger: 'music_mission_resolved',
      });
    }
  };

  // Colors helper
  const getProtocolColor = (proto: ProtocolType | string) => {
    switch (proto) {
      case 'TCP':
        return '#79c0ff';
      case 'SMB2':
        return '#f0883e';
      case 'ARP':
        return '#ff7b72';
      case 'HTTP':
        return '#3fb950';
      case 'DNS':
        return '#d2a8ff';
      case 'TLS':
        return '#56d364';
      case 'UDP':
        return '#e3b341';
      default:
        return '#c9d1d9';
    }
  };

  const getClassificationBadge = (cls: TrafficClassification) => {
    switch (cls) {
      case 'BENIGN_ROUTINE':
        return { label: 'Routine', bg: '#23863622', border: '#238636', color: '#3fb950' };
      case 'BENIGN_ADMIN':
        return { label: 'Admin', bg: '#1f6feb22', border: '#1f6feb', color: '#58a6ff' };
      case 'BENIGN_FALSE_POSITIVE':
        return { label: 'Scanner FP', bg: '#e3b34122', border: '#e3b341', color: '#e3b341' };
      case 'SUSPICIOUS_BEACON':
        return { label: 'Beaconing', bg: '#da363322', border: '#da3633', color: '#f85149' };
      case 'SUSPICIOUS_EXFILTRATION':
        return { label: 'Exfiltration', bg: '#da363322', border: '#da3633', color: '#f85149' };
      case 'UNAUTHORIZED_ACCESS':
        return { label: 'Lateral Access', bg: '#f0883e22', border: '#f0883e', color: '#f0883e' };
      case 'ANOMALOUS_PROTOCOL':
        return { label: 'Anomalous', bg: '#a371f722', border: '#a371f7', color: '#d2a8ff' };
      default:
        return { label: 'Traffic', bg: '#21262d', border: '#30363d', color: '#c9d1d9' };
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* =====================================================================
          TOP APP HEADER & TAB NAVIGATION
      ====================================================================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          backgroundColor: '#161b22',
          borderBottom: '1px solid #30363d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#58a6ff',
              boxShadow: '0 0 8px #58a6ff88',
            }}
          />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f0f6fc', letterSpacing: '0.5px' }}>
            Packet Lens Pro
          </span>
          <span style={{ fontSize: '0.72rem', color: '#8b949e', marginLeft: '4px' }}>
            [M16 Forensics & Threat Intel Suite]
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              padding: '2px 6px',
              backgroundColor: '#21262d',
              borderRadius: '4px',
              color: '#79c0ff',
              border: '1px solid #30363d',
              marginLeft: '8px',
            }}
          >
            /mnt/evidence/EVD-2026-001.pcap
          </span>
        </div>

        {/* Top Navigation Tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('topology')}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'topology' ? '#1f6feb' : '#21262d',
              color: activeTab === 'topology' ? '#ffffff' : '#8b949e',
              border: '1px solid #30363d',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>🌐</span> Network Topology
          </button>
          <button
            onClick={() => setActiveTab('traffic')}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'traffic' ? '#1f6feb' : '#21262d',
              color: activeTab === 'traffic' ? '#ffffff' : '#8b949e',
              border: '1px solid #30363d',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>📡</span> Traffic Stream
          </button>
          <button
            onClick={() => setActiveTab('intel')}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'intel' ? '#1f6feb' : '#21262d',
              color: activeTab === 'intel' ? '#ffffff' : '#8b949e',
              border: '1px solid #30363d',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>🛡️</span> Threat Intelligence
          </button>
          <button
            onClick={() => setActiveTab('investigation')}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'investigation' ? '#1f6feb' : '#21262d',
              color: activeTab === 'investigation' ? '#ffffff' : '#8b949e',
              border: '1px solid #30363d',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>📋</span> Investigation & Findings
            {completedObjectivesCount > 0 && (
              <span
                style={{
                  backgroundColor: '#238636',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  marginLeft: '2px',
                }}
              >
                {completedObjectivesCount}/7
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: NETWORK TOPOLOGY EXPLORER
      ====================================================================== */}
      {activeTab === 'topology' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Topology Control Bar */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#161b22',
              borderBottom: '1px solid #30363d',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>Segment:</span>
              <select
                value={selectedSegmentId}
                onChange={e => setSelectedSegmentId(e.target.value)}
                style={{
                  backgroundColor: '#0d1117',
                  color: '#c9d1d9',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                }}
              >
                <option value="all">All Segments ({NETWORK_SEGMENTS.length})</option>
                {NETWORK_SEGMENTS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.cidr})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>Search:</span>
              <input
                type="text"
                placeholder="Filter by hostname, IP, role..."
                value={topologySearch}
                onChange={e => setTopologySearch(e.target.value)}
                style={{
                  backgroundColor: '#0d1117',
                  color: '#c9d1d9',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  maxWidth: '260px',
                }}
              />
              {topologySearch && (
                <button
                  onClick={() => setTopologySearch('')}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#8b949e',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
              Showing {filteredNodes.length} of {SIMULATED_NETWORK_NODES.length} hosts
            </span>
          </div>

          {/* Topology Workspace: Nodes Grid + Details Pane */}
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            {/* Hosts Grid */}
            <div
              style={{
                flex: 2,
                padding: '12px',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '10px',
                alignContent: 'start',
                backgroundColor: '#090d13',
              }}
            >
              {filteredNodes.map(node => {
                const isSelected = node.id === selectedHostId;
                const isThreat = node.segmentId === 'seg-external-threat' || node.investigationRelevance === 'CRITICAL_TARGET';
                const isSuspicious = node.investigationRelevance === 'SUSPICIOUS';
                const isMonitoring = node.investigationRelevance === 'MONITORING';

                let borderColor = '#30363d';
                if (isSelected) borderColor = '#1f6feb';
                else if (isThreat) borderColor = '#f8514988';
                else if (isSuspicious) borderColor = '#f0883e88';
                else if (isMonitoring) borderColor = '#e3b34188';

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedHostId(node.id);
                      if (node.id === 'app-portal-01') {
                        dispatchObjectiveAdvance('obj-m16-triage-topology');
                      }
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: isSelected ? '#161b22' : '#0d1117',
                      border: `2px solid ${borderColor}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'border-color 0.15s, background-color 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f0f6fc' }}>
                        {node.hostname}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: isThreat ? '#da363333' : '#1f6feb22',
                          color: isThreat ? '#f85149' : '#58a6ff',
                          fontWeight: 600,
                        }}
                      >
                        {node.ipAddress}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>{node.roleLabel}</div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#8b949e' }}>{node.os}</span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          color:
                            node.investigationRelevance === 'CRITICAL_TARGET'
                              ? '#f85149'
                              : node.investigationRelevance === 'SUSPICIOUS'
                              ? '#f0883e'
                              : node.investigationRelevance === 'MONITORING'
                              ? '#e3b341'
                              : '#3fb950',
                        }}
                      >
                        {node.investigationRelevance.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Host Details Sidebar */}
            <div
              style={{
                flex: 1.2,
                borderLeft: '1px solid #30363d',
                backgroundColor: '#161b22',
                padding: '12px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {selectedNode ? (
                <>
                  <div style={{ borderBottom: '1px solid #30363d', paddingBottom: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#58a6ff', textTransform: 'uppercase', fontWeight: 700 }}>
                      Host Inspector
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f0f6fc', marginTop: '2px' }}>
                      {selectedNode.hostname} ({selectedNode.ipAddress})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>FQDN: {selectedNode.fqdn}</div>
                  </div>

                  <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <strong style={{ color: '#8b949e' }}>Segment:</strong> {selectedNode.segmentId}
                    </div>
                    <div>
                      <strong style={{ color: '#8b949e' }}>Location:</strong> {selectedNode.location}
                    </div>
                    <div>
                      <strong style={{ color: '#8b949e' }}>Operating System:</strong> {selectedNode.os}
                    </div>
                    <div>
                      <strong style={{ color: '#8b949e' }}>MAC Address:</strong> <code>{selectedNode.macAddress}</code>
                    </div>
                    <div>
                      <strong style={{ color: '#8b949e' }}>Investigation Relevance:</strong>{' '}
                      <span style={{ color: '#f0883e', fontWeight: 600 }}>
                        {selectedNode.investigationRelevance}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: '#8b949e' }}>Description:</strong> {selectedNode.description}
                    </div>
                  </div>

                  {/* Open Ports & Services */}
                  <div style={{ borderTop: '1px solid #30363d', paddingTop: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8b949e', fontWeight: 600, marginBottom: '4px' }}>
                      KNOWN SERVICES & PORTS ({selectedNode.services.length})
                    </div>
                    {selectedNode.services.length === 0 ? (
                      <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>No open listening ports catalogued.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {selectedNode.services.map(s => (
                          <div
                            key={s.port}
                            style={{
                              padding: '3px 6px',
                              backgroundColor: '#0d1117',
                              borderRadius: '3px',
                              fontSize: '0.72rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>
                              <strong>{s.port}/{s.protocol}</strong> — {s.name}
                            </span>
                            <span style={{ color: '#8b949e' }}>{s.version}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connected Links */}
                  <div style={{ borderTop: '1px solid #30363d', paddingTop: '8px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8b949e', fontWeight: 600, marginBottom: '4px' }}>
                      OBSERVED TOPOLOGY LINKS ({connectedLinks.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem' }}>
                      {connectedLinks.map(link => {
                        const otherId = link.sourceHostId === selectedNode.id ? link.targetHostId : link.sourceHostId;
                        const other = getNodeById(otherId);
                        const isSuspiciousLink = link.label.includes('UNAUTHORIZED') || link.label.includes('SUSPICIOUS');
                        return (
                          <div
                            key={link.id}
                            style={{
                              padding: '4px 6px',
                              backgroundColor: '#0d1117',
                              borderRadius: '3px',
                              borderLeft: `3px solid ${isSuspiciousLink ? '#f85149' : '#3fb950'}`,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>↔ <strong>{other?.hostname ?? otherId}</strong></span>
                              <span style={{ color: isSuspiciousLink ? '#f85149' : '#8b949e' }}>
                                {isSuspiciousLink ? 'SUSPICIOUS' : 'ROUTINE'}
                              </span>
                            </div>
                            <div style={{ color: '#8b949e', fontSize: '0.68rem', marginTop: '2px' }}>
                              {link.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setHostTrafficFilter(selectedNode.id);
                        setActiveTab('traffic');
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        backgroundColor: '#1f6feb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      📡 View Host Traffic
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('investigation');
                        setActiveSubTab('notes');
                        setAnalystNoteTitle(`Host Inspection: ${selectedNode.hostname}`);
                        setAnalystNoteContent(`Investigated node ${selectedNode.hostname} (${selectedNode.ipAddress}). Relevance: ${selectedNode.investigationRelevance}. Description: ${selectedNode.description}`);
                      }}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#21262d',
                        color: '#c9d1d9',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      📝 Log Note
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ color: '#8b949e', fontSize: '0.75rem' }}>Select a host to view metadata.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: TRAFFIC STREAM ANALYZER (Wireshark-Inspired)
      ====================================================================== */}
      {activeTab === 'traffic' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Traffic Filter & Search Bar */}
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#161b22',
              borderBottom: '1px solid #30363d',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {/* Protocol buttons */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {(['ALL', 'TCP', 'SMB2', 'ARP', 'HTTP', 'DNS', 'TLS', 'UDP'] as const).map(proto => (
                <button
                  key={proto}
                  onClick={() => {
                    setProtocolFilter(proto);
                    if (proto === 'TLS') {
                      dispatchObjectiveAdvance('obj-m16-filter-tls');
                    }
                  }}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: protocolFilter === proto ? '#1f6feb' : '#21262d',
                    color: protocolFilter === proto ? '#ffffff' : '#8b949e',
                    border: '1px solid #30363d',
                    borderRadius: '3px',
                    cursor: 'pointer',
                  }}
                >
                  {proto}
                </button>
              ))}
            </div>

            <div style={{ height: '16px', width: '1px', backgroundColor: '#30363d', margin: '0 4px' }} />

            {/* Host filter */}
            <select
              value={hostTrafficFilter}
              onChange={e => setHostTrafficFilter(e.target.value)}
              style={{
                backgroundColor: '#0d1117',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '0.72rem',
              }}
            >
              <option value="ALL">All Hosts</option>
              {SIMULATED_NETWORK_NODES.map(n => (
                <option key={n.id} value={n.id}>
                  {n.hostname} ({n.ipAddress})
                </option>
              ))}
            </select>

            {/* Search query */}
            <input
              type="text"
              placeholder="Display filter (e.g. payroll$, 8443, .kdbx)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: '#0d1117',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '3px',
                padding: '2px 8px',
                fontSize: '0.72rem',
                flex: 1,
                minWidth: '180px',
              }}
            />

            {/* Reset Filters button */}
            <button
              onClick={() => {
                setProtocolFilter('ALL');
                setClassificationFilter('ALL');
                setHostTrafficFilter('ALL');
                setSearchQuery('');
              }}
              style={{
                padding: '2px 8px',
                fontSize: '0.72rem',
                backgroundColor: '#21262d',
                color: '#8b949e',
                border: '1px solid #30363d',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>

          {/* Packets Table (Top 45% height) */}
          <div
            style={{
              height: '45%',
              overflowY: 'auto',
              borderBottom: '2px solid #30363d',
              backgroundColor: '#0d1117',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: '#161b22',
                    color: '#8b949e',
                    fontSize: '0.73rem',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    borderBottom: '1px solid #30363d',
                  }}
                >
                  <th style={{ padding: '4px 6px', width: '35px' }}>No.</th>
                  <th style={{ padding: '4px 6px', width: '85px' }}>Time</th>
                  <th style={{ padding: '4px 6px', width: '120px' }}>Source</th>
                  <th style={{ padding: '4px 6px', width: '120px' }}>Destination</th>
                  <th style={{ padding: '4px 6px', width: '55px' }}>Proto</th>
                  <th style={{ padding: '4px 6px', width: '50px' }}>Len</th>
                  <th style={{ padding: '4px 6px', width: '90px' }}>Class</th>
                  <th style={{ padding: '4px 6px' }}>Info</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackets.map(pkt => {
                  const isSelected = pkt.sequenceNo === selectedSequenceNo;
                  const protoColor = getProtocolColor(pkt.protocol);
                  const classBadge = getClassificationBadge(pkt.classification);
                  const isPayroll = pkt.summaryInfo.includes('payroll$');
                  const isMasterKeys = pkt.summaryInfo.includes('master_keys.kdbx');
                  const isC2Beacon = pkt.summaryInfo.includes('telemetry-sync') || pkt.destinationPort === 8443;

                  return (
                    <tr
                      key={pkt.id}
                      onClick={() => {
                        setSelectedSequenceNo(pkt.sequenceNo);
                        if (pkt.sequenceNo === 13 || pkt.protocol === 'TLS') {
                          dispatchObjectiveAdvance('obj-m16-dissect-beacon');
                        }
                      }}
                      style={{
                        backgroundColor: isSelected
                          ? '#1f6feb33'
                          : isC2Beacon || isMasterKeys
                          ? '#da363311'
                          : 'transparent',
                        borderBottom: '1px solid #1f242c',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        fontSize: '0.74rem',
                      }}
                    >
                      <td style={{ padding: '4px 6px', color: '#8b949e' }}>{pkt.sequenceNo}</td>
                      <td style={{ padding: '4px 6px', color: '#8b949e' }}>{pkt.formattedTime}</td>
                      <td style={{ padding: '4px 6px' }}>
                        {pkt.sourceIp}
                        {pkt.sourcePort ? `:${pkt.sourcePort}` : ''}
                      </td>
                      <td style={{ padding: '4px 6px' }}>
                        {pkt.destinationIp}
                        {pkt.destinationPort ? `:${pkt.destinationPort}` : ''}
                      </td>
                      <td style={{ padding: '4px 6px', color: protoColor, fontWeight: 700 }}>
                        {pkt.protocol}
                      </td>
                      <td style={{ padding: '4px 6px', color: '#8b949e' }}>{pkt.lengthBytes}</td>
                      <td style={{ padding: '4px 6px' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: classBadge.bg,
                            border: `1px solid ${classBadge.border}`,
                            color: classBadge.color,
                            fontWeight: 600,
                          }}
                        >
                          {classBadge.label}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '4px 6px',
                          color: isPayroll || isMasterKeys || isC2Beacon ? '#f85149' : '#e6edf3',
                          fontWeight: isPayroll || isMasterKeys || isC2Beacon ? 600 : 400,
                        }}
                      >
                        {pkt.summaryInfo}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Dissection & Hex Dump (Bottom 55% height) */}
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            {/* Layer Dissection Tree */}
            <div
              style={{
                flex: 1.1,
                padding: '8px 12px',
                overflowY: 'auto',
                borderRight: '1px solid #30363d',
                backgroundColor: '#0d1117',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#58a6ff', textTransform: 'uppercase' }}>
                  Packet Dissection [Frame {selectedPacket.sequenceNo}]
                </span>
                <button
                  onClick={() => handleSavePacketEvidence(selectedPacket)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    backgroundColor: savedEvidencePktIds.has(selectedPacket.id) ? '#238636' : '#21262d',
                    color: '#ffffff',
                    border: '1px solid #30363d',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {savedEvidencePktIds.has(selectedPacket.id) ? '✓ Saved in Evidence' : '💾 Save as Evidence'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                <div style={{ padding: '3px 6px', backgroundColor: '#161b22', borderRadius: '4px' }}>
                  ▶ <strong>Physical:</strong> {selectedPacket.details.frameLayer}
                </div>
                <div style={{ padding: '3px 6px', backgroundColor: '#161b22', borderRadius: '4px' }}>
                  ▶ <strong>Data Link:</strong> {selectedPacket.details.ethernetLayer}
                </div>
                <div style={{ padding: '3px 6px', backgroundColor: '#161b22', borderRadius: '4px' }}>
                  ▶ <strong>Network:</strong> {selectedPacket.details.ipLayer}
                </div>
                <div style={{ padding: '3px 6px', backgroundColor: '#161b22', borderRadius: '4px' }}>
                  ▶ <strong>Transport:</strong> {selectedPacket.details.transportLayer}
                </div>
                <div
                  style={{
                    padding: '4px 6px',
                    backgroundColor: '#21262d',
                    borderRadius: '4px',
                    borderLeft: '3px solid #f0883e',
                    color: '#f0883e',
                    fontWeight: 600,
                  }}
                >
                  ★ <strong>Application:</strong> {selectedPacket.details.applicationLayer}
                </div>
              </div>

              {/* Security / Educational Analysis Context */}
              <div
                style={{
                  marginTop: 'auto',
                  padding: '6px 8px',
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                }}
              >
                <span style={{ color: '#e3b341', fontWeight: 600 }}>Security Context: </span>
                <span style={{ color: '#8b949e' }}>{selectedPacket.educationalContext}</span>
              </div>
            </div>

            {/* Hex and ASCII Dump */}
            <div
              style={{
                flex: 1,
                padding: '8px 12px',
                overflowY: 'auto',
                backgroundColor: '#090d13',
                fontFamily: 'monospace',
                fontSize: '0.73rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#8b949e',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Hex / ASCII Payload Stream
              </div>
              {selectedPacket.hexDump.map((line, idx) => (
                <div key={idx} style={{ color: '#3fb950', lineHeight: '1.35' }}>
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Callout */}
          <div
            style={{
              padding: '4px 12px',
              backgroundColor: '#161b22',
              borderTop: '1px solid #30363d',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.73rem',
              color: '#8b949e',
            }}
          >
            <span>
              Showing {filteredPackets.length} of {SYNTHETIC_TRAFFIC_EVENTS.length} synthetic frames | Capture format: <code>pcap 2.4</code>
            </span>
            <span style={{ color: '#f0883e' }}>
              Incident Finding: Frame #10 confirms unconstrained SMB2 Tree Connect to payroll$
            </span>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: THREAT INTELLIGENCE DATABASE
      ====================================================================== */}
      {activeTab === 'intel' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Controls Bar */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#161b22',
              borderBottom: '1px solid #30363d',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as IndicatorCategory | 'ALL')}
                style={{
                  backgroundColor: '#0d1117',
                  color: '#c9d1d9',
                  border: '1px solid #30363d',
                  borderRadius: '3px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="C2_INFRASTRUCTURE">C2 Infrastructure</option>
                <option value="BEACON_CONTROLLER">Beacon Controller</option>
                <option value="DNS_TUNNEL_ENDPOINT">DNS Tunnel Endpoint</option>
                <option value="CREDENTIAL_STAGING">Credential Staging</option>
                <option value="INTERNAL_SECURITY_SCANNER">Internal Security Scanner</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Search threat indicators (e.g. Phantom Weaver, 198.51.100.45)..."
              value={intelSearch}
              onChange={e => setIntelSearch(e.target.value)}
              style={{
                backgroundColor: '#0d1117',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '3px',
                padding: '3px 8px',
                fontSize: '0.75rem',
                flex: 1,
                minWidth: '200px',
              }}
            />

            <button
              onClick={handleCorrelateAll}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#238636',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              ⚡ Correlate All Indicators
            </button>
          </div>

          {/* Threat Workspace */}
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            {/* Indicators List */}
            <div
              style={{
                flex: 1.2,
                overflowY: 'auto',
                borderRight: '1px solid #30363d',
                backgroundColor: '#090d13',
              }}
            >
              {filteredIndicators.map(ind => {
                const isSelected = ind.id === selectedIndicatorId;
                const status = localReviewStatuses[ind.id] ?? ind.analystStatus;

                let sevColor = '#3fb950';
                if (ind.severity === 'CRITICAL') sevColor = '#f85149';
                else if (ind.severity === 'HIGH') sevColor = '#f0883e';
                else if (ind.severity === 'MEDIUM') sevColor = '#e3b341';

                return (
                  <div
                    key={ind.id}
                    onClick={() => {
                      setSelectedIndicatorId(ind.id);
                      setCorrelationResults([]);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #21262d',
                      backgroundColor: isSelected ? '#161b22' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#f0f6fc' }}>
                        {ind.value}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: sevColor,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          border: `1px solid ${sevColor}55`,
                        }}
                      >
                        {ind.severity}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', color: '#8b949e', marginTop: '2px' }}>
                      <span>{ind.type}</span>
                      <span>•</span>
                      <span>Actor: {ind.threatActor}</span>
                      <span>•</span>
                      <span style={{ color: status === 'CONFIRMED_THREAT' ? '#f85149' : '#8b949e' }}>
                        [{status}]
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Indicator Details & Correlation Panel */}
            <div
              style={{
                flex: 1.8,
                overflowY: 'auto',
                backgroundColor: '#0d1117',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {selectedIndicator ? (
                <>
                  <div style={{ borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#58a6ff', fontWeight: 700, textTransform: 'uppercase' }}>
                          Threat Indicator Dossier
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f6fc', marginTop: '2px' }}>
                          {selectedIndicator.value}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                          Type: {selectedIndicator.type} | Category: {selectedIndicator.category}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleSaveIndicatorEvidence(selectedIndicator)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            backgroundColor: '#21262d',
                            color: '#ffffff',
                            border: '1px solid #30363d',
                            borderRadius: '3px',
                            cursor: 'pointer',
                          }}
                        >
                          💾 Save IOC Evidence
                        </button>
                        <button
                          onClick={() => handleCorrelateIndicator(selectedIndicator)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            backgroundColor: '#1f6feb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                          }}
                        >
                          ⚡ Correlate Against Traffic
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '0.75rem',
                      backgroundColor: '#161b22',
                      padding: '10px',
                      borderRadius: '4px',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#8b949e' }}>Threat Actor:</strong> {selectedIndicator.threatActor}
                    </div>
                    <div>
                      <strong style={{ color: '#8b949e' }}>Campaign:</strong> {selectedIndicator.campaign}
                    </div>
                    <div>
                      <strong style={{ color: '#8b949e' }}>Severity:</strong>{' '}
                      <span style={{ color: '#f85149', fontWeight: 700 }}>{selectedIndicator.severity}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#8b949e' }}>Confidence:</strong> {selectedIndicator.confidenceScore}/100
                    </div>
                    <div>
                      <strong style={{ color: '#8b949e' }}>Publisher:</strong> {selectedIndicator.provenance.publisher} (
                      {selectedIndicator.provenance.reportReference})
                    </div>
                    <div>
                      <strong style={{ color: '#8b949e' }}>Known Benign:</strong>{' '}
                      {selectedIndicator.isKnownBenignAllowlist ? (
                        <span style={{ color: '#3fb950', fontWeight: 700 }}>YES (Authorized Scanner Allowlist)</span>
                      ) : (
                        <span style={{ color: '#f85149', fontWeight: 700 }}>NO (Adversary Infrastructure)</span>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem' }}>
                    <strong style={{ color: '#8b949e' }}>Description & Analysis:</strong>
                    <div style={{ marginTop: '3px', color: '#c9d1d9', lineHeight: '1.4' }}>
                      {selectedIndicator.description}
                    </div>
                  </div>

                  {/* Review Status Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                    <strong style={{ color: '#8b949e' }}>Analyst Status:</strong>
                    <select
                      value={localReviewStatuses[selectedIndicator.id] ?? selectedIndicator.analystStatus}
                      onChange={e => handleUpdateReviewStatus(selectedIndicator.id, e.target.value as ThreatReviewStatus)}
                      style={{
                        backgroundColor: '#161b22',
                        color: '#c9d1d9',
                        border: '1px solid #30363d',
                        borderRadius: '3px',
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                      }}
                    >
                      <option value="UNREVIEWED">UNREVIEWED</option>
                      <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                      <option value="CONFIRMED_THREAT">CONFIRMED THREAT</option>
                      <option value="FALSE_POSITIVE_BENIGN">FALSE POSITIVE (BENIGN)</option>
                      <option value="INCONCLUSIVE">INCONCLUSIVE</option>
                    </select>
                  </div>

                  {/* Correlation Results Section */}
                  <div style={{ borderTop: '1px solid #30363d', paddingTop: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#58a6ff', marginBottom: '6px' }}>
                      TRAFFIC CORRELATION MATCHES ({correlationResults.length})
                    </div>

                    {correlationResults.length === 0 ? (
                      <div style={{ fontSize: '0.73rem', color: '#8b949e' }}>
                        No correlation run or no matches found in synthetic traffic stream. Click &ldquo;Correlate Against Traffic&rdquo; to test.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {correlationResults.map((m, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '8px',
                              backgroundColor: '#161b22',
                              borderRadius: '4px',
                              borderLeft: `3px solid ${m.isFalsePositiveWarning ? '#e3b341' : '#f85149'}`,
                              fontSize: '0.74rem',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, color: '#f0f6fc' }}>
                                [{m.matchStrength}] Matched Event: {m.matchedEventId}
                              </span>
                              <button
                                onClick={() => {
                                  const pkt = SYNTHETIC_TRAFFIC_EVENTS.find(p => p.id === m.matchedEventId);
                                  if (pkt) {
                                    setSelectedSequenceNo(pkt.sequenceNo);
                                    setActiveTab('traffic');
                                  }
                                }}
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '0.68rem',
                                  backgroundColor: '#1f6feb',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                }}
                              >
                                View Packet
                              </button>
                            </div>
                            <div style={{ color: '#8b949e', marginTop: '2px' }}>
                              Matched on: <code>{m.matchedValue}</code>
                            </div>
                            <div style={{ color: '#c9d1d9', marginTop: '4px' }}>{m.reasonExplanation}</div>
                            {m.isFalsePositiveWarning && (
                              <div style={{ color: '#e3b341', marginTop: '4px', fontWeight: 600 }}>
                                ⚠ Warning: This activity matches an authorized internal scanner allowlist.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: '#8b949e', fontSize: '0.75rem' }}>Select an indicator to view details.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: INVESTIGATION & FINDINGS (Operation Marina Nexus)
      ====================================================================== */}
      {activeTab === 'investigation' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Subtab Navigation */}
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#161b22',
              borderBottom: '1px solid #30363d',
              display: 'flex',
              gap: '6px',
            }}
          >
            <button
              onClick={() => setActiveSubTab('objectives')}
              style={{
                padding: '4px 8px',
                fontSize: '0.73rem',
                fontWeight: 600,
                backgroundColor: activeSubTab === 'objectives' ? '#1f6feb' : '#21262d',
                color: activeSubTab === 'objectives' ? '#ffffff' : '#8b949e',
                border: '1px solid #30363d',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              Objectives Checklist ({completedObjectivesCount}/7)
            </button>
            <button
              onClick={() => setActiveSubTab('notes')}
              style={{
                padding: '4px 8px',
                fontSize: '0.73rem',
                fontWeight: 600,
                backgroundColor: activeSubTab === 'notes' ? '#1f6feb' : '#21262d',
                color: activeSubTab === 'notes' ? '#ffffff' : '#8b949e',
                border: '1px solid #30363d',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              Analyst Notes ({localNotes.length})
            </button>
            <button
              onClick={() => setActiveSubTab('evidence')}
              style={{
                padding: '4px 8px',
                fontSize: '0.73rem',
                fontWeight: 600,
                backgroundColor: activeSubTab === 'evidence' ? '#1f6feb' : '#21262d',
                color: activeSubTab === 'evidence' ? '#ffffff' : '#8b949e',
                border: '1px solid #30363d',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              Preserved Evidence Vault
            </button>
            <button
              onClick={() => setActiveSubTab('submit')}
              style={{
                padding: '4px 8px',
                fontSize: '0.73rem',
                fontWeight: 600,
                backgroundColor: activeSubTab === 'submit' ? '#238636' : '#21262d',
                color: '#ffffff',
                border: '1px solid #30363d',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              Submit Formal Finding
            </button>
          </div>

          {/* Subtab Content Area */}
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', backgroundColor: '#0d1117' }}>
            {/* SUBTAB 1: OBJECTIVES */}
            {activeSubTab === 'objectives' && (
              <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ backgroundColor: '#161b22', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f6fc' }}>
                    {M16_INVESTIGATION_SCENARIO.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '4px', lineHeight: '1.4' }}>
                    {M16_INVESTIGATION_SCENARIO.briefingSummary}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#58a6ff', marginTop: '4px' }}>
                  CASE INVESTIGATION OBJECTIVES
                </div>

                {investigationState.objectives.map((obj: InvestigationObjective, idx: number) => {
                  const isDone = obj.isCompleted;
                  return (
                    <div
                      key={obj.id}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: isDone ? '#23863611' : '#161b22',
                        border: `1px solid ${isDone ? '#238636' : '#30363d'}`,
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: isDone ? '#3fb950' : '#f0f6fc' }}>
                          {idx + 1}. {obj.title}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: isDone ? '#3fb950' : '#8b949e',
                              padding: '1px 6px',
                              borderRadius: '3px',
                              backgroundColor: isDone ? '#23863633' : '#21262d',
                            }}
                          >
                            {isDone ? 'COMPLETED' : 'PENDING'}
                          </span>
                          {!isDone && (
                            <button
                              onClick={() => dispatchObjectiveAdvance(obj.id)}
                              style={{
                                padding: '2px 6px',
                                fontSize: '0.65rem',
                                backgroundColor: '#21262d',
                                color: '#79c0ff',
                                border: '1px solid #30363d',
                                borderRadius: '3px',
                                cursor: 'pointer',
                              }}
                            >
                              Check Off
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#c9d1d9' }}>{obj.description}</div>
                      <div style={{ fontSize: '0.7rem', color: '#8b949e', fontStyle: 'italic' }}>
                        💡 Hint: {obj.hint}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SUBTAB 2: ANALYST NOTES */}
            {activeSubTab === 'notes' && (
              <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ backgroundColor: '#161b22', padding: '12px', borderRadius: '6px', border: '1px solid #30363d' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f0f6fc', marginBottom: '8px' }}>
                    Record New Forensic Observation
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Observation Title (e.g. C2 Beacon TLS 1.3 JA3 Match)..."
                      value={analystNoteTitle}
                      onChange={e => setAnalystNoteTitle(e.target.value)}
                      style={{
                        backgroundColor: '#0d1117',
                        color: '#c9d1d9',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                      }}
                    />
                    <textarea
                      rows={3}
                      placeholder="Detailed findings, rationale, evidence cross-reference..."
                      value={analystNoteContent}
                      onChange={e => setAnalystNoteContent(e.target.value)}
                      style={{
                        backgroundColor: '#0d1117',
                        color: '#c9d1d9',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        resize: 'vertical',
                      }}
                    />
                    <button
                      onClick={handleAddNote}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '4px 12px',
                        backgroundColor: '#1f6feb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Save Observation
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#58a6ff' }}>
                  CHRONOLOGICAL CASE LOG ({localNotes.length})
                </div>

                {localNotes.map(note => (
                  <div
                    key={note.id}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#161b22',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f0f6fc' }}>
                        {note.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#8b949e' }}>{note.time}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#c9d1d9', marginTop: '4px', lineHeight: '1.4' }}>
                      {note.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SUBTAB 3: EVIDENCE VAULT */}
            {activeSubTab === 'evidence' && (
              <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ backgroundColor: '#161b22', padding: '10px 12px', borderRadius: '6px', border: '1px solid #30363d' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f0f6fc' }}>
                    Narrative Evidence Vault Integration
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '2px' }}>
                    Preserved forensic evidence records are cryptographically hashed and linked to the global Cyberlife narrative vault.
                  </div>
                </div>

                {savedEvidencePktIds.size === 0 && (!simState?.narrative?.evidenceVault || Object.keys(simState.narrative.evidenceVault).length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#8b949e', fontSize: '0.8rem' }}>
                    No evidence saved yet. Inspect frames in the Traffic tab or indicators in the Threat Intel tab and click &ldquo;Save as Evidence&rdquo;.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Array.from(savedEvidencePktIds).map(pktId => {
                      const pkt = SYNTHETIC_TRAFFIC_EVENTS.find(p => p.id === pktId);
                      if (!pkt) return null;
                      return (
                        <div
                          key={pktId}
                          style={{
                            padding: '10px',
                            backgroundColor: '#161b22',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            borderLeft: '4px solid #3fb950',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#f0f6fc' }}>
                              EVD-NET-{pkt.id.toUpperCase()} — Frame #{pkt.sequenceNo} [{pkt.protocol}]
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#8b949e' }}>
                              sha256:net_{pkt.id}_{pkt.sequenceNo}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.73rem', color: '#c9d1d9', marginTop: '3px' }}>
                            {pkt.summaryInfo}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#8b949e', marginTop: '2px' }}>
                            Source: {pkt.sourceIp} → Dest: {pkt.destinationIp} | Classification: {pkt.classification}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 4: SUBMIT FORMAL FINDING */}
            {activeSubTab === 'submit' && (
              <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Evaluation Feedback Report (shown prominently when evaluated) */}
                {evaluationResult && (
                  <div
                    style={{
                      padding: '14px',
                      backgroundColor: '#161b22',
                      border: `2px solid ${evaluationResult.isApproved ? '#238636' : '#f0883e'}`,
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: evaluationResult.isApproved ? '#3fb950' : '#f0883e',
                        }}
                      >
                        Evaluation Result: {evaluationResult.isApproved ? 'APPROVED' : 'REVISION NEEDED'} ({evaluationResult.scorePercentage}/100)
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.75rem' }}>
                      <div style={{ color: evaluationResult.correctActor ? '#3fb950' : '#f85149' }}>
                        {evaluationResult.correctActor ? '✓' : '✗'} Suspected Threat Actor Identification
                      </div>
                      <div style={{ color: evaluationResult.correctCompromisedHost ? '#3fb950' : '#f85149' }}>
                        {evaluationResult.correctCompromisedHost ? '✓' : '✗'} Compromised Host Attribution
                      </div>
                      <div style={{ color: evaluationResult.correctC2Channel ? '#3fb950' : '#f85149' }}>
                        {evaluationResult.correctC2Channel ? '✓' : '✗'} Command & Control Channel Isolation
                      </div>
                      <div style={{ color: evaluationResult.correctExfiltrationMethod ? '#3fb950' : '#f85149' }}>
                        {evaluationResult.correctExfiltrationMethod ? '✓' : '✗'} Exfiltration Vector Determination
                      </div>
                      <div style={{ color: evaluationResult.correctFalsePositiveIdentification ? '#3fb950' : '#f85149' }}>
                        {evaluationResult.correctFalsePositiveIdentification ? '✓' : '✗'} False Positive Recognition (Benign SIEM Scanner)
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#c9d1d9', marginTop: '6px', lineHeight: '1.4' }}>
                      <strong>Debriefing Critique:</strong> {evaluationResult.feedbackSummary}
                    </div>
                  </div>
                )}

                <div style={{ backgroundColor: '#161b22', padding: '12px', borderRadius: '6px', border: '1px solid #30363d' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f6fc' }}>
                    Submit Formal Forensic Investigation Finding
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '2px' }}>
                    Present your evidence-backed conclusions to EkoSec Security Operations. Your report will be evaluated against simulation truth.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#8b949e', display: 'block', marginBottom: '3px' }}>
                        Suspected Threat Actor:
                      </label>
                      <select
                        value={conclusionActor}
                        onChange={e => setConclusionActor(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0d1117',
                          color: '#c9d1d9',
                          border: '1px solid #30363d',
                          borderRadius: '4px',
                          padding: '6px',
                          fontSize: '0.75rem',
                        }}
                      >
                        <option value="Phantom Weaver APT">Phantom Weaver APT (Advanced Persistent Threat Group)</option>
                        <option value="Shadow Helix">Shadow Helix (Financial Cybercrime Syndicate)</option>
                        <option value="Aster Rogue Subroutine">Aster Rogue Subroutine (Internal Autonomous Anomaly)</option>
                        <option value="Script Kiddie">Unorganized Script Kiddie</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#8b949e', display: 'block', marginBottom: '3px' }}>
                        Primary Compromised Internal Host:
                      </label>
                      <select
                        value={conclusionHost}
                        onChange={e => setConclusionHost(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0d1117',
                          color: '#c9d1d9',
                          border: '1px solid #30363d',
                          borderRadius: '4px',
                          padding: '6px',
                          fontSize: '0.75rem',
                        }}
                      >
                        <option value="app-portal-01">app-portal-01 (10.0.1.10 — Aster API Gateway)</option>
                        <option value="ws-sec-04">ws-sec-04 (10.0.4.15 — Aster SecOps Workstation)</option>
                        <option value="filesrv-01">filesrv-01 (10.0.4.50 — Corporate File Server)</option>
                        <option value="dc-core-01">dc-core-01 (10.0.4.10 — Domain Controller)</option>
                        <option value="mon-siem-01">mon-siem-01 (10.0.99.5 — OpenVAS / SIEM Collector)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#8b949e', display: 'block', marginBottom: '3px' }}>
                        Command & Control (C2) Channel:
                      </label>
                      <select
                        value={conclusionC2}
                        onChange={e => setConclusionC2(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0d1117',
                          color: '#c9d1d9',
                          border: '1px solid #30363d',
                          borderRadius: '4px',
                          padding: '6px',
                          fontSize: '0.75rem',
                        }}
                      >
                        <option value="TLS 1.3 on port 8443 to 198.51.100.45">TLS 1.3 on port 8443 to 198.51.100.45 (telemetry-sync.ekonexus-update.net)</option>
                        <option value="Cleartext HTTP Port 80">Cleartext HTTP Port 80</option>
                        <option value="SSH Port 22">Direct SSH Port 22</option>
                        <option value="SMB2 Port 445">Direct External SMB2 Port 445</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#8b949e', display: 'block', marginBottom: '3px' }}>
                        Data Exfiltration Vector:
                      </label>
                      <select
                        value={conclusionExfil}
                        onChange={e => setConclusionExfil(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0d1117',
                          color: '#c9d1d9',
                          border: '1px solid #30363d',
                          borderRadius: '4px',
                          padding: '6px',
                          fontSize: '0.75rem',
                        }}
                      >
                        <option value="High-entropy DNS TXT tunneling & TLS egress">
                          High-entropy DNS TXT tunneling &amp; TLS egress
                        </option>
                        <option value="Direct HTTP POST Upload">Direct HTTP POST Upload</option>
                        <option value="FTP File Upload">Unencrypted FTP Upload</option>
                        <option value="Physical USB Drive">Physical USB Flash Drive Exfiltration</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                      <input
                        type="checkbox"
                        id="benignCheck"
                        checked={conclusionBenignCheck}
                        onChange={e => setConclusionBenignCheck(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor="benignCheck" style={{ fontSize: '0.75rem', color: '#e6edf3', cursor: 'pointer' }}>
                        Recognized <code>mon-siem-01</code> (10.0.99.5) vulnerability scan as <strong>authorized benign activity</strong>, avoiding a false positive finding.
                      </label>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#8b949e', display: 'block', marginBottom: '3px' }}>
                        Executive Summary & Notes:
                      </label>
                      <textarea
                        rows={3}
                        value={conclusionNotes}
                        onChange={e => setConclusionNotes(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#0d1117',
                          color: '#c9d1d9',
                          border: '1px solid #30363d',
                          borderRadius: '4px',
                          padding: '6px',
                          fontSize: '0.75rem',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSubmitConclusion}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#238636',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: '4px',
                      }}
                    >
                      Submit Formal Forensic Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
