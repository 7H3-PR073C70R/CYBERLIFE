/**
 * Cyberlife — Milestone 19: Eko Bounty Network & Security Contracts App
 *
 * Professional freelance cybersecurity marketplace and contract execution portal.
 * Features:
 * - 5-tab interface: Marketplace, Active Contract Workspace, Submission Studio, Client Review & Debrief, Reputation & Ledger.
 * - Dynamic scope evaluation, authorization gate enforcement, and RoE compliance tracking.
 * - Simulated technical action runner with live feedback console.
 * - Deliverables assembly with forensic evidence linking & SHA-256 fingerprint verification.
 * - Deterministic client review with itemized scorecard, feedback letters, and idempotent payouts.
 *
 * SAFETY INVARIANT:
 * 100% in-game simulation state — zero host access, zero real network calls, zero external tools.
 */

import React, { useState, useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation';
import {
  BountyAppTab,
  BountyContract,
  ContractCategoryFilter,
  ContractDifficulty,
  ActiveContractState,
  ContractObjective,
  AcceptanceCheckResult,
} from '@/simulation/cyber/contracts/types';
import { CONTRACT_CATALOGUE } from '@/simulation/cyber/contracts/contractCatalogue';

export const BountyApp: React.FC = () => {
  const sim = useOptionalSimulation();
  const bountyHub = sim?.state.bountyHub;

  // URL search parameters for headless browser screenshotting & deep-linking
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlTab = (urlParams?.get('bountyTab') || urlParams?.get('tab')) as BountyAppTab | null;
  const urlContract = urlParams?.get('contract') || urlParams?.get('contractId');
  const demoActiveParam = urlParams?.get('demoActive') === '1' || urlParams?.get('active') === '1';

  // Local fallback states
  const [localTab, setLocalTab] = useState<BountyAppTab>(() => {
    if (urlTab && ['marketplace', 'activeContract', 'submissionStudio', 'reviewDebrief', 'reputationLedger'].includes(urlTab)) {
      return urlTab;
    }
    return bountyHub?.activeTab ?? 'marketplace';
  });
  const activeTab: BountyAppTab = urlTab ?? bountyHub?.activeTab ?? localTab;

  const setActiveTab = (tab: BountyAppTab) => {
    setLocalTab(tab);
    if (sim?.dispatch) {
      sim.dispatch({ type: 'SetBountyTab', tab });
    }
  };

  const [localCategoryFilter, setLocalCategoryFilter] = useState<ContractCategoryFilter>('ALL');
  const categoryFilter: ContractCategoryFilter = bountyHub?.categoryFilter ?? localCategoryFilter;

  const [localSelectedId, setLocalSelectedId] = useState<string>(() => urlContract ?? 'ct-balogun-pos-audit');
  const selectedContractId: string = urlContract ?? bountyHub?.selectedContractId ?? localSelectedId;

  // Draft submission state
  const [draftExecutiveSummary, setDraftExecutiveSummary] = useState<string>(
    'Conducted authorized security audit in accordance with specified Rules of Engagement. Identified critical default credential exposure and unencrypted telemetry transmission.'
  );
  const [draftMethodology, setDraftMethodology] = useState<string>(
    'Non-destructive service enumeration, protocol header inspection, and configuration analysis.'
  );
  const [draftBusinessImpact, setDraftBusinessImpact] = useState<string>(
    'Adversary on local network segment could compromise payment terminal integrity and modify transaction logs.'
  );
  const [draftRecommendations, setDraftRecommendations] = useState<string>(
    '1. Disable factory default credentials immediately.\n2. Enforce TLS 1.3 on port 8443.\n3. Segment POS subnet from guest Wi-Fi.'
  );
  const [scopeAffirmed, setScopeAffirmed] = useState<boolean>(true);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([
    'evd-balogun-pos-config',
  ]);

  // Finding editor
  const [findingTitle, setFindingTitle] = useState<string>(
    'Hardcoded Factory Credentials on Management Port'
  );
  const [findingSeverity, setFindingSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>(
    'HIGH'
  );
  const [findingPoc, setFindingPoc] = useState<string>(
    'Service on port 8443 accepted default credentials admin:admin, granting unrestricted terminal configuration access.'
  );

  // Action log state
  const [actionLog, setActionLog] = useState<string[]>([
    '[*] Eko Bounty Network console initialized. Authorized sandbox environment verified.',
  ]);

  // Derived state
  const availableContracts: readonly BountyContract[] = bountyHub?.contracts ?? CONTRACT_CATALOGUE;

  const demoActiveContract: ActiveContractState = useMemo(() => {
    const posContract = CONTRACT_CATALOGUE[0]!;
    return {
      contractId: posContract.id,
      status: activeTab === 'reviewDebrief' ? 'APPROVED' : 'ACTIVE',
      acceptedAtSimTime: 28800,
      acceptedScopeVersion: 1,
      objectives: posContract.initialObjectives.map((o, idx) => ({
        ...o,
        isCompleted: idx < 2 || activeTab === 'reviewDebrief' || activeTab === 'submissionStudio',
      })),
      scopeClarified: true,
      activeDraft: {
        executiveSummary: draftExecutiveSummary,
        methodologyNotes: draftMethodology,
        findings: [
          {
            id: 'fnd-balogun-01',
            title: findingTitle,
            affectedComponent: 'gw-balogun-pos-01:8080',
            severity: findingSeverity,
            confidence: 'CONFIRMED',
            description: 'Web management console exposes root administrative controls under default password.',
            proofOfConceptOrObservation: findingPoc,
            remediationRecommendation: 'Force immediate password reset and isolate network segment.',
          },
        ],
        linkedEvidenceIds: selectedEvidenceIds,
        scopeComplianceAffirmed: scopeAffirmed,
        riskImpactSummary: draftBusinessImpact,
        remediationRecommendations: [
          '1. Disable default factory credentials on management portal.',
          '2. Enforce TLS 1.3 on port 8443.',
          '3. Isolate POS subnet from guest Wi-Fi.',
        ],
        remainingUncertainties: 'None noted.',
      },
      revisionCount: 0,
      auditEvents: [
        {
          id: 'audit-01',
          timestampSimTime: 28900,
          actionName: 'SERVICE_ENUMERATION',
          targetResource: 'gw-balogun-pos-01',
          decision: 'AUTHORIZED',
          details: 'Authorized TCP port discovery executed against port 8080.',
          violationRecorded: false,
        },
      ],
      latestReviewResult: {
        reviewId: 'rev-balogun-01',
        contractId: posContract.id,
        outcome: 'ACCEPTED',
        reviewedAtSimTime: 31200,
        revisionNumber: 1,
        overallScore: 94,
        clientFeedbackTitle: 'Exceptional Configuration Audit & Fast Triage',
        clientFeedbackBody:
          'Alhaji Rasheed and the Balogun Market Alliance Tech Committee commend your professional diligence. Default administrative credentials were confirmed and remediated prior to kiosk rollout.',
        itemizedChecks: [
          {
            checkName: 'Simulated Technical Objectives Completion',
            passed: true,
            feedback: 'All 4/4 authorized technical objectives completed.',
          },
          {
            checkName: 'Technical Finding & Proof-of-Concept Quality',
            passed: true,
            feedback: 'Critical credential exposure accurately documented with reproducible proof-of-concept.',
          },
          {
            checkName: 'Cryptographic Forensic Evidence Verification',
            passed: true,
            feedback: 'Verified linked evidence artifact with valid SHA-256 integrity in vault.',
          },
          {
            checkName: 'Rules of Engagement & Scope Compliance Audit',
            passed: true,
            feedback: 'Zero out-of-scope probes recorded. Scope compliance affirmed by operator.',
          },
        ],
        payoutKobo: 150000,
        careerXpAwarded: 120,
        freelanceReputationDelta: 30,
        payoutProcessed: true,
      },
    };
  }, [activeTab, draftExecutiveSummary, draftMethodology, findingTitle, findingSeverity, findingPoc, selectedEvidenceIds, scopeAffirmed, draftBusinessImpact]);

  const activeContractState = bountyHub?.activeContract ?? (demoActiveParam ? demoActiveContract : undefined);
  const activeContract = activeContractState
    ? availableContracts.find(c => c.id === activeContractState.contractId) ?? null
    : null;
  const selectedContract: BountyContract =
    availableContracts.find(c => c.id === selectedContractId) ?? availableContracts[0]!;

  const reputationState = bountyHub?.reputation ?? (demoActiveParam ? {
    score: 240,
    tier: 'OPERATOR' as const,
    completedContractsCount: 3,
    successfulDisclosuresCount: 4,
    revisionsCompletedCount: 1,
    scopeViolationsCount: 0,
    totalEarningsKobo: 450000,
    clientRatingAverage: 4.9,
  } : {
    score: 120,
    tier: 'ROOKIE' as const,
    completedContractsCount: 0,
    successfulDisclosuresCount: 0,
    revisionsCompletedCount: 0,
    scopeViolationsCount: 0,
    totalEarningsKobo: 0,
    clientRatingAverage: 4.8,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredContracts = useMemo(() => {
    let result = availableContracts;
    if (categoryFilter !== 'ALL') {
      result = result.filter(c => c.category === categoryFilter);
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.client.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.problemStatement.toLowerCase().includes(q)
      );
    }
    return result;
  }, [availableContracts, categoryFilter, searchQuery]);

  // Action dispatcher helper
  const handleSelectContract = (contractId: string) => {
    setLocalSelectedId(contractId);
    if (sim?.dispatch) {
      sim.dispatch({ type: 'SelectBountyContract', contractId });
    }
  };

  const handleAcceptContract = (contract: BountyContract) => {
    if (activeContractState && activeContractState.status === 'ACTIVE') {
      alert('You already have an active contract. Complete or withdraw before taking on another.');
      return;
    }
    if (sim?.dispatch) {
      sim.dispatch({ type: 'AcceptContract', contractId: contract.id });
    }
    setActionLog(prev => [
      `[+] Accepted contract: ${contract.title} (${contract.id})`,
      `[i] Rules of Engagement activated. Authorized scope: ${contract.scope.authorizedTargets.map(a => a.hostname).join(', ')}`,
      ...prev,
    ]);
    setActiveTab('activeContract');
  };

  const handleExecuteAction = (targetAssetId: string, actionName: string, actionCategory?: string) => {
    if (!activeContractState) return;
    if (sim?.dispatch) {
      sim.dispatch({
        type: 'ExecuteContractSimulatedAction',
        targetAssetId,
        actionName,
        actionCategory,
      });
    }

    const timestamp = new Date().toLocaleTimeString();
    setActionLog(prev => [
      `[${timestamp}] EXECUTED: ${actionName} -> Target: ${targetAssetId}`,
      `[+] Simulation state updated. Authorization gate: VERIFIED.`,
      ...prev,
    ]);
  };

  const handleSimulateScopeViolation = () => {
    if (!activeContractState) return;
    const targetAssetId = 'asset-prod-db-01'; // Prohibited target
    if (sim?.dispatch) {
      sim.dispatch({
        type: 'ExecuteContractSimulatedAction',
        targetAssetId,
        actionName: 'PROBE_UNAUTHORIZED_HOST',
      });
    }
    const timestamp = new Date().toLocaleTimeString();
    setActionLog(prev => [
      `[${timestamp}] [!] REJECTED: Out-of-scope target access attempted (${targetAssetId}).`,
      `[!] Authorization Gate Violation Recorded. Professional conduct warning logged.`,
      ...prev,
    ]);
  };

  const handleClarifyScope = (optionId: string) => {
    if (!activeContractState) return;
    if (sim?.dispatch) {
      sim.dispatch({
        type: 'ClarifyContractScope',
        optionId,
      });
    }
    setActionLog(prev => [
      `[+] Formal scope clarification submitted: ${optionId}`,
      `[i] Client response received. Ambiguity resolved: authorized boundaries updated.`,
      ...prev,
    ]);
  };

  const handleSubmitDeliverables = () => {
    if (!activeContractState) return;
    const recs = draftRecommendations
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    if (sim?.dispatch) {
      sim.dispatch({
        type: 'UpdateContractSubmissionDraft',
        draftUpdates: {
          executiveSummary: draftExecutiveSummary,
          methodologyNotes: draftMethodology,
          riskImpactSummary: draftBusinessImpact,
          remediationRecommendations: recs,
          scopeComplianceAffirmed: scopeAffirmed,
          linkedEvidenceIds: selectedEvidenceIds,
          findings: [
            {
              id: 'fnd-user-01',
              title: findingTitle,
              affectedComponent: activeContract?.scope.authorizedTargets[0]?.hostname ?? 'target-pos',
              severity: findingSeverity,
              confidence: 'CONFIRMED',
              description: 'Exposed service allowing unauthorized access.',
              proofOfConceptOrObservation: findingPoc,
              remediationRecommendation: recs[0] ?? 'Remediate identified exposure.',
            },
          ],
        },
      });

      sim.dispatch({
        type: 'SubmitContractDeliverables',
      });
    }

    setActionLog(prev => [
      `[+] Deliverables submitted to client for formal review: ${activeContractState.contractId}`,
      `[i] Client automated triage engine evaluating findings and scope compliance...`,
      ...prev,
    ]);
    setActiveTab('reviewDebrief');
  };

  const handleResubmitRevision = () => {
    if (!activeContractState) return;
    if (sim?.dispatch) {
      sim.dispatch({
        type: 'ResubmitContractRevision',
      });
    }
    setActiveTab('reviewDebrief');
  };

  // Format currency Naira
  const formatNaira = (kobo: number) => {
    const naira = Math.floor(kobo / 100);
    return `₦ ${naira.toLocaleString('en-NG')}`;
  };

  // Difficulty badge styling
  const getDifficultyBadge = (diff: ContractDifficulty) => {
    switch (diff) {
      case 'BEGINNER':
        return { text: 'BEGINNER', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '#059669' };
      case 'INTERMEDIATE':
        return { text: 'INTERMEDIATE', bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '#0284c7' };
      case 'ADVANCED':
        return { text: 'ADVANCED', bg: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '#e11d48' };
    }
  };

  return (
    <div
      className="bounty-app-container"
      data-testid="bounty-app-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0a0d14',
        color: '#e2e8f0',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Top Banner / Freelance Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          backgroundColor: '#111827',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            🎯
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px' }}>
                EKO BOUNTY NETWORK
              </h1>
              <span
                style={{
                  fontSize: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                }}
              >
                SIMULATED SEC-OPS V19
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Authorized Freelance Vulnerability Research & Security Contracts
            </p>
          </div>
        </div>

        {/* Reputation & Stats Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Standing Tier */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '6px 12px',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>
              Reputation Standing
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
                {reputationState.score} pts
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  color: '#c084fc',
                  fontWeight: 600,
                }}
              >
                {reputationState.tier}
              </span>
            </div>
          </div>

          {/* Total Earnings */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '6px 12px',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>
              Lifetime Bounty Payout
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>
              {formatNaira(reputationState.totalEarningsKobo)}
            </div>
          </div>

          {/* Active Status Indicator */}
          {activeContractState ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor:
                  activeContractState.status === 'REVISION_REQUESTED'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(16, 185, 129, 0.15)',
                border:
                  activeContractState.status === 'REVISION_REQUESTED'
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor:
                    activeContractState.status === 'REVISION_REQUESTED'
                      ? '#f59e0b'
                      : '#10b981',
                  boxShadow: '0 0 6px currentColor',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                {activeContractState.status === 'REVISION_REQUESTED'
                  ? 'REVISION NEEDED'
                  : 'CONTRACT ACTIVE'}
              </span>
            </div>
          ) : (
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '12px',
                color: '#64748b',
              }}
            >
              IDLE (NO ACTIVE CONTRACT)
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav
        style={{
          display: 'flex',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0 16px',
          gap: '8px',
        }}
      >
        {[
          { id: 'marketplace' as const, label: 'Marketplace', icon: '🛒' },
          { id: 'activeContract' as const, label: 'Active Workspace', icon: '⚡' },
          { id: 'submissionStudio' as const, label: 'Submission Studio', icon: '📝' },
          { id: 'reviewDebrief' as const, label: 'Review & Debrief', icon: '⚖️' },
          { id: 'reputationLedger' as const, label: 'Reputation & Ledger', icon: '📊' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`bounty-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'activeContract' && activeContractState && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Tab Content Area */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* ==================================================================== */}
        {/* TAB 1: MARKETPLACE */}
        {/* ==================================================================== */}
        {activeTab === 'marketplace' && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left: Contract Listings */}
            <div
              style={{
                flex: '1 1 55%',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Search Bar */}
              <div
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#0c1017',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <input
                  type="text"
                  placeholder="Search contracts by title, client, or tag..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#161e2e',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Category Filter Pills */}
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#111827',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                }}
              >
                {(
                  [
                    'ALL',
                    'CONFIG_AUDIT',
                    'INVESTIGATION',
                    'WEB_APP_ASSESSMENT',
                    'DETECTION_VALIDATION',
                    'RESEARCH_TRIAGE',
                  ] as const
                ).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    data-testid={`filter-${cat}`}
                    onClick={() => {
                      setLocalCategoryFilter(cat);
                      if (sim?.dispatch) {
                        sim.dispatch({ type: 'SetBountyCategoryFilter', filter: cat });
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: categoryFilter === cat ? 600 : 400,
                      backgroundColor:
                        categoryFilter === cat ? '#38bdf8' : 'rgba(255, 255, 255, 0.04)',
                      color: categoryFilter === cat ? '#0f172a' : '#94a3b8',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {/* Listings Scroll Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {filteredContracts.map(c => {
                  const isSelected = selectedContract.id === c.id;
                  const isActive = activeContractState?.contractId === c.id;
                  const diffStyle = getDifficultyBadge(c.difficulty);

                  return (
                    <div
                      key={c.id}
                      data-testid={`contract-card-${c.id}`}
                      onClick={() => handleSelectContract(c.id)}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: isSelected
                          ? 'rgba(56, 189, 248, 0.08)'
                          : '#161e2e',
                        border: isSelected
                          ? '1px solid #38bdf8'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#38bdf8',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {c.id.toUpperCase()}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: diffStyle.bg,
                              color: diffStyle.color,
                              fontWeight: 600,
                              border: `1px solid ${diffStyle.border}`,
                            }}
                          >
                            {diffStyle.text}
                          </span>
                          {isActive && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                color: '#10b981',
                                fontWeight: 700,
                              }}
                            >
                              CURRENTLY ACTIVE
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#34d399' }}>
                          {formatNaira(c.financialTerms.rewardKobo)}
                        </div>
                      </div>

                      <h3
                        style={{
                          margin: '0 0 6px 0',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#f8fafc',
                        }}
                      >
                        {c.title}
                      </h3>
                      <p
                        style={{
                          margin: '0 0 10px 0',
                          fontSize: '12px',
                          color: '#94a3b8',
                          lineHeight: '1.4',
                        }}
                      >
                        {c.problemStatement}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          color: '#64748b',
                        }}
                      >
                        <span>Client: {c.client.name}</span>
                        <span>Estimated: {c.estimatedEffortMinutes}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Detailed Inspection Drawer */}
            <div
              style={{
                flex: '1 1 45%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#0c1017',
                overflowY: 'auto',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Client Info Header */}
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#161e2e',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#38bdf8',
                        textTransform: 'uppercase',
                      }}
                    >
                      Client Dossier
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                      }}
                    >
                      Industry: {selectedContract.client.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#f8fafc',
                    }}
                  >
                    {selectedContract.client.name}
                  </h2>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8' }}>
                    {selectedContract.client.profileSummary}
                  </p>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Fictional Org ID: {selectedContract.client.id} · Rep Req:{' '}
                    {selectedContract.prerequisites.minFreelanceReputation} pts
                  </div>
                </div>

                {/* Problem Statement */}
                <div>
                  <h4
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      textTransform: 'uppercase',
                    }}
                  >
                    Problem Statement & Business Context
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#94a3b8',
                      lineHeight: '1.5',
                      backgroundColor: '#111827',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    {selectedContract.problemStatement}
                  </p>
                </div>

                {/* Scope of Engagement & RoE */}
                <div
                  style={{
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    padding: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <h4
                    style={{
                      margin: '0 0 10px 0',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#38bdf8',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>🛡️</span> Rules of Engagement (RoE) & Scope
                  </h4>

                  {/* Authorized Target Assets */}
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#34d399',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}
                    >
                      ✓ Explicitly Authorized Targets:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedContract.scope.authorizedTargets.map(a => (
                        <div
                          key={a.id}
                          style={{
                            fontSize: '11px',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            color: '#cbd5e1',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                          }}
                        >
                          <strong>{a.hostname}</strong> ({a.ipAddress}) — Service: {a.serviceName}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Out-of-Scope Assets */}
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#f43f5e',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}
                    >
                      ✕ Strictly Out-of-Scope (Prohibited):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedContract.scope.outOfScopeTargets.map((target, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: '11px',
                            backgroundColor: 'rgba(244, 63, 94, 0.08)',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            color: '#fca5a5',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                          }}
                        >
                          <strong>{target}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prohibited Actions */}
                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#fbbf24',
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}
                    >
                      ⚠ Prohibited Test Actions:
                    </div>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: '16px',
                        fontSize: '11px',
                        color: '#cbd5e1',
                        lineHeight: '1.4',
                      }}
                    >
                      {selectedContract.scope.prohibitedActions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Required Deliverables */}
                <div>
                  <h4
                    style={{
                      margin: '0 0 6px 0',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#cbd5e1',
                      textTransform: 'uppercase',
                    }}
                  >
                    Required Deliverables
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedContract.requiredDeliverables.map(d => (
                      <div
                        key={d.id}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: '#111827',
                          borderRadius: '4px',
                          fontSize: '11px',
                          color: '#cbd5e1',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <strong>{d.title}</strong> — {d.description}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accept Contract Action Button */}
                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  {activeContractState?.contractId === selectedContract.id ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('activeContract')}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      VIEW ACTIVE WORKSPACE →
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-testid="accept-contract-btn"
                      onClick={() => handleAcceptContract(selectedContract)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(56, 189, 248, 0.25)',
                      }}
                    >
                      ACCEPT CONTRACT & ACTIVATE ROE (
                      {formatNaira(selectedContract.financialTerms.rewardKobo)})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: ACTIVE CONTRACT WORKSPACE */}
        {/* ==================================================================== */}
        {activeTab === 'activeContract' && (
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              padding: '20px',
              gap: '16px',
              overflowY: 'auto',
            }}
          >
            {activeContractState && activeContract ? (
              <>
                {/* Active Contract Header */}
                <div
                  style={{
                    padding: '16px 20px',
                    backgroundColor: '#161e2e',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#38bdf8',
                          fontWeight: 700,
                          letterSpacing: '0.5px',
                        }}
                      >
                        ENGAGEMENT IN PROGRESS · {activeContract.id.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          color: '#10b981',
                          fontWeight: 600,
                        }}
                      >
                        STATUS: {activeContractState.status}
                      </span>
                    </div>
                    <h2
                      style={{
                        margin: '4px 0 2px 0',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#f8fafc',
                      }}
                    >
                      {activeContract.title}
                    </h2>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Client: {activeContract.client.name} · Target:{' '}
                      {activeContract.scope.authorizedTargets.map(a => a.hostname).join(', ')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      data-testid="proceed-to-submission-btn"
                      onClick={() => setActiveTab('submissionStudio')}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '6px',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      PROCEED TO SUBMISSION STUDIO →
                    </button>
                  </div>
                </div>

                {/* Two Columns: Objectives & Technical Runner */}
                <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: '340px' }}>
                  {/* Left: Objectives Progress Tracker */}
                  <div
                    style={{
                      flex: '1 1 45%',
                      backgroundColor: '#111827',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#f8fafc',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>🎯</span> Engagement Objectives & Deliverable Milestones
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      {activeContractState.objectives.map((obj: ContractObjective) => {
                        const isDone = obj.isCompleted;
                        return (
                          <div
                            key={obj.id}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '6px',
                              backgroundColor: isDone
                                ? 'rgba(16, 185, 129, 0.08)'
                                : 'rgba(255, 255, 255, 0.02)',
                              border: isDone
                                ? '1px solid rgba(16, 185, 129, 0.3)'
                                : '1px solid rgba(255, 255, 255, 0.06)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                            }}
                          >
                            <span style={{ fontSize: '14px', marginTop: '1px' }}>
                              {isDone ? '✅' : '⏳'}
                            </span>
                            <div>
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: isDone ? '#34d399' : '#e2e8f0',
                                }}
                              >
                                {obj.title}
                              </div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                {obj.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ambiguous Scope Notice if applicable */}
                    {activeContract.scope.hasScopeAmbiguity && (
                      <div
                        style={{
                          padding: '12px',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '6px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#fbbf24',
                            marginBottom: '4px',
                          }}
                        >
                          ⚠️ AMBIGUOUS CLIENT INSTRUCTIONS DETECTED
                        </div>
                        <div style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '8px' }}>
                          {activeContract.scope.ambiguityDescription ??
                            'Client scope contains conflicting instructions. Formal clarification required before testing.'}
                        </div>
                        <button
                          type="button"
                          data-testid="clarify-scope-btn"
                          onClick={() => handleClarifyScope('opt-clarify-formal')}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            backgroundColor: '#f59e0b',
                            color: '#0f172a',
                            fontWeight: 700,
                            fontSize: '11px',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          REQUEST FORMAL SCOPE CLARIFICATION
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Simulated Technical Action Runner */}
                  <div
                    style={{
                      flex: '1 1 55%',
                      backgroundColor: '#111827',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#f8fafc',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>⚡</span> Simulated Technical Action Console
                    </h3>

                    {/* Action Execution Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        data-testid="action-enumerate-services"
                        onClick={() =>
                          handleExecuteAction(
                            activeContract.scope.authorizedTargets[0]?.id ?? 'asset-pos-01',
                            'SERVICE_ENUMERATION',
                            'CONFIG_AUDIT'
                          )
                        }
                        style={{
                          padding: '10px',
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          borderRadius: '6px',
                          color: '#38bdf8',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        1. Enumerate Ports & Services
                      </button>

                      <button
                        type="button"
                        data-testid="action-audit-credentials"
                        onClick={() =>
                          handleExecuteAction(
                            activeContract.scope.authorizedTargets[0]?.id ?? 'asset-pos-01',
                            'CONFIGURATION_AUDIT',
                            'CONFIG_AUDIT'
                          )
                        }
                        style={{
                          padding: '10px',
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          borderRadius: '6px',
                          color: '#38bdf8',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        2. Audit Credentials & ACLs
                      </button>

                      <button
                        type="button"
                        data-testid="action-inspect-telemetry"
                        onClick={() =>
                          handleExecuteAction(
                            activeContract.scope.authorizedTargets[0]?.id ?? 'asset-pos-01',
                            'TELEMETRY_INSPECTION',
                            'INVESTIGATION'
                          )
                        }
                        style={{
                          padding: '10px',
                          backgroundColor: '#1e293b',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          borderRadius: '6px',
                          color: '#38bdf8',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        3. Capture Telemetry Artifact
                      </button>

                      <button
                        type="button"
                        data-testid="action-simulate-violation"
                        onClick={handleSimulateScopeViolation}
                        style={{
                          padding: '10px',
                          backgroundColor: 'rgba(244, 63, 94, 0.1)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          borderRadius: '6px',
                          color: '#f87171',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        ⚠ Test Out-of-Scope Target Gate
                      </button>
                    </div>

                    {/* Console / Audit Log */}
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: '#0a0d14',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: '#a7f3d0',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      {actionLog.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  gap: '12px',
                  color: '#94a3b8',
                }}
              >
                <div style={{ fontSize: '36px' }}>🎯</div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>
                  No Active Security Contract
                </h3>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Accept an authorized engagement from the Marketplace to activate Rules of
                  Engagement.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('marketplace')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#38bdf8',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Browse Marketplace
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: SUBMISSION STUDIO */}
        {/* ==================================================================== */}
        {activeTab === 'submissionStudio' && (
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              padding: '20px',
              gap: '16px',
              overflowY: 'auto',
            }}
          >
            {activeContractState && activeContract ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#161e2e',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                      Deliverable & Findings Submission Studio
                    </h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                      Package executive summaries, verified technical findings, and forensic evidence
                      hashes.
                    </p>
                  </div>
                  {activeContractState.status === 'REVISION_REQUESTED' ? (
                    <button
                      type="button"
                      data-testid="resubmit-revision-btn"
                      onClick={handleResubmitRevision}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: '#f59e0b',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '13px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      RESUBMIT REVISED DELIVERABLES
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-testid="submit-deliverables-btn"
                      onClick={handleSubmitDeliverables}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '13px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      SUBMIT REPORT TO CLIENT
                    </button>
                  )}
                </div>

                {/* Form Grids */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                  {/* Left Column: Executive Summary & Technical Finding */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Executive Summary */}
                    <div
                      style={{
                        backgroundColor: '#111827',
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#e2e8f0',
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Executive Summary (Minimum 30 characters)
                      </label>
                      <textarea
                        data-testid="input-executive-summary"
                        value={draftExecutiveSummary}
                        onChange={e => setDraftExecutiveSummary(e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          backgroundColor: '#0a0d14',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          padding: '10px',
                          color: '#f8fafc',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Methodology & Business Impact */}
                    <div
                      style={{
                        backgroundColor: '#111827',
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#cbd5e1',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Assessment Methodology
                        </label>
                        <textarea
                          data-testid="input-methodology"
                          value={draftMethodology}
                          onChange={e => setDraftMethodology(e.target.value)}
                          rows={2}
                          style={{
                            width: '100%',
                            backgroundColor: '#0a0d14',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            padding: '8px',
                            color: '#f8fafc',
                            fontSize: '11px',
                            fontFamily: 'inherit',
                            resize: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#cbd5e1',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Business Risk & Impact
                        </label>
                        <textarea
                          data-testid="input-business-impact"
                          value={draftBusinessImpact}
                          onChange={e => setDraftBusinessImpact(e.target.value)}
                          rows={2}
                          style={{
                            width: '100%',
                            backgroundColor: '#0a0d14',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            padding: '8px',
                            color: '#f8fafc',
                            fontSize: '11px',
                            fontFamily: 'inherit',
                            resize: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    {/* Technical Finding Details */}
                    <div
                      style={{
                        backgroundColor: '#111827',
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#e2e8f0',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Documented Technical Finding
                      </label>

                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            data-testid="input-finding-title"
                            value={findingTitle}
                            onChange={e => setFindingTitle(e.target.value)}
                            placeholder="Finding Title"
                            style={{
                              width: '100%',
                              backgroundColor: '#0a0d14',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              padding: '8px 10px',
                              color: '#f8fafc',
                              fontSize: '12px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <select
                          data-testid="select-finding-severity"
                          value={findingSeverity}
                          onChange={e =>
                            setFindingSeverity(e.target.value as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')
                          }
                          style={{
                            backgroundColor: '#0a0d14',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            padding: '8px 10px',
                            color: '#38bdf8',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          <option value="CRITICAL">CRITICAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>
                      </div>

                      <textarea
                        data-testid="input-finding-poc"
                        value={findingPoc}
                        onChange={e => setFindingPoc(e.target.value)}
                        placeholder="Proof-of-Concept & Reproduction Steps"
                        rows={3}
                        style={{
                          width: '100%',
                          backgroundColor: '#0a0d14',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          padding: '10px',
                          color: '#f8fafc',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Remediation Guidance */}
                    <div
                      style={{
                        backgroundColor: '#111827',
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#e2e8f0',
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Prioritized Remediation Recommendations
                      </label>
                      <textarea
                        data-testid="input-remediation"
                        value={draftRecommendations}
                        onChange={e => setDraftRecommendations(e.target.value)}
                        rows={3}
                        style={{
                          width: '100%',
                          backgroundColor: '#0a0d14',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          padding: '10px',
                          color: '#f8fafc',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Column: Evidence Linking & Scope Affirmation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Evidence Vault Selector */}
                    <div
                      style={{
                        backgroundColor: '#111827',
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <label
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#e2e8f0',
                          textTransform: 'uppercase',
                        }}
                      >
                        Forensic Evidence & Telemetry Hashes
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          {
                            id: 'evd-balogun-pos-config',
                            title: 'POS Terminal Service Dump & Port 8443 TLS Certificate',
                            hash: 'a3f9e8b2c4d1...77d8',
                          },
                          {
                            id: 'evd-eko-atm-pcap-extract',
                            title: 'Synthetic ATM PCAP Packet Stream with C2 Traffic',
                            hash: '99e4c1f8a2b5...33c9',
                          },
                          {
                            id: 'evd-cedarline-api-idor-poc',
                            title: 'IDOR HTTP Request/Response Transcript (/api/v1/accounts/4029)',
                            hash: '55b1d3e8a9f2...88a1',
                          },
                        ].map(evd => {
                          const isChecked = selectedEvidenceIds.includes(evd.id);
                          return (
                            <div
                              key={evd.id}
                              style={{
                                padding: '10px',
                                backgroundColor: isChecked
                                  ? 'rgba(56, 189, 248, 0.08)'
                                  : '#0a0d14',
                                border: isChecked
                                  ? '1px solid #38bdf8'
                                  : '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                setSelectedEvidenceIds(prev =>
                                  prev.includes(evd.id)
                                    ? prev.filter(x => x !== evd.id)
                                    : [...prev, evd.id]
                                );
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                style={{ accentColor: '#38bdf8' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>
                                  {evd.title}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                                  ID: {evd.id} · SHA256: {evd.hash}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scope Compliance Affirmation */}
                    <div
                      style={{
                        backgroundColor: '#111827',
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          data-testid="scope-affirmation-checkbox"
                          checked={scopeAffirmed}
                          onChange={e => setScopeAffirmed(e.target.checked)}
                          style={{ accentColor: '#10b981', marginTop: '3px' }}
                        />
                        <span style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
                          <strong>I certify professional conduct & scope adherence:</strong> All
                          conducted tests strictly complied with the authorized Rules of Engagement
                          (RoE) and zero prohibited actions or out-of-scope targets were engaged.
                        </span>
                      </label>
                    </div>

                    {/* Pre-Submission Validation Checklist */}
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#94a3b8',
                          marginBottom: '6px',
                        }}
                      >
                        PRE-SUBMISSION ACCEPTANCE CHECKLIST
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          fontSize: '11px',
                        }}
                      >
                        <span
                          style={{
                            color: draftExecutiveSummary.length >= 30 ? '#34d399' : '#f87171',
                          }}
                        >
                          {draftExecutiveSummary.length >= 30 ? '✓' : '✕'} Executive Summary length
                          valid (≥ 30 chars)
                        </span>
                        <span style={{ color: findingTitle.trim() ? '#34d399' : '#f87171' }}>
                          {findingTitle.trim() ? '✓' : '✕'} Technical finding documented
                        </span>
                        <span
                          style={{ color: selectedEvidenceIds.length > 0 ? '#34d399' : '#f87171' }}
                        >
                          {selectedEvidenceIds.length > 0 ? '✓' : '✕'} Evidence artifact linked
                        </span>
                        <span style={{ color: scopeAffirmed ? '#34d399' : '#f87171' }}>
                          {scopeAffirmed ? '✓' : '✕'} Scope compliance formally affirmed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  color: '#94a3b8',
                }}
              >
                <h3>No active contract to submit deliverables for.</h3>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: CLIENT REVIEW & DEBRIEF */}
        {/* ==================================================================== */}
        {activeTab === 'reviewDebrief' && (
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              padding: '20px',
              gap: '16px',
              overflowY: 'auto',
            }}
          >
            {activeContractState?.latestReviewResult ? (
              <>
                {/* Result Banner */}
                <div
                  data-testid="client-review-banner"
                  style={{
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor:
                      activeContractState.latestReviewResult.outcome === 'ACCEPTED' ||
                      activeContractState.latestReviewResult.outcome === 'ACCEPTED_WITH_FEEDBACK'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : activeContractState.latestReviewResult.outcome === 'REVISION_REQUESTED'
                        ? 'rgba(245, 158, 11, 0.12)'
                        : 'rgba(244, 63, 94, 0.12)',
                    border:
                      activeContractState.latestReviewResult.outcome === 'ACCEPTED' ||
                      activeContractState.latestReviewResult.outcome === 'ACCEPTED_WITH_FEEDBACK'
                        ? '1px solid #10b981'
                        : activeContractState.latestReviewResult.outcome === 'REVISION_REQUESTED'
                        ? '1px solid #f59e0b'
                        : '1px solid #f43f5e',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color:
                          activeContractState.latestReviewResult.outcome === 'ACCEPTED'
                            ? '#34d399'
                            : activeContractState.latestReviewResult.outcome ===
                              'ACCEPTED_WITH_FEEDBACK'
                            ? '#38bdf8'
                            : activeContractState.latestReviewResult.outcome ===
                              'REVISION_REQUESTED'
                            ? '#fbbf24'
                            : '#f87171',
                      }}
                    >
                      Client Decision: {activeContractState.latestReviewResult.outcome.replace(/_/g, ' ')}
                    </div>
                    <h2
                      style={{
                        margin: '4px 0 6px 0',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#f8fafc',
                      }}
                    >
                      {activeContractState.latestReviewResult.payoutProcessed
                        ? `Payment Authorized: ${formatNaira(activeContractState.latestReviewResult.payoutKobo)}`
                        : 'Deliverables Under Review / Revision Needed'}
                    </h2>
                    <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                      Overall Quality Score:{' '}
                      <strong>{activeContractState.latestReviewResult.overallScore}%</strong> ·
                      Reputation Impact:{' '}
                      <strong>+{activeContractState.latestReviewResult.freelanceReputationDelta} pts</strong>
                    </div>
                  </div>

                  {activeContractState.latestReviewResult.outcome === 'REVISION_REQUESTED' && (
                    <button
                      type="button"
                      data-testid="return-to-submission-btn"
                      onClick={() => setActiveTab('submissionStudio')}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: '#f59e0b',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      RETURN TO SUBMISSION STUDIO →
                    </button>
                  )}
                </div>

                {/* Scorecard Breakdown */}
                <div
                  style={{
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#f8fafc',
                      textTransform: 'uppercase',
                    }}
                  >
                    Itemized Acceptance Criteria Evaluation
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {activeContractState.latestReviewResult.itemizedChecks.map((crit: AcceptanceCheckResult, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#161e2e',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                          {crit.checkName}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: crit.passed ? '#34d399' : '#f87171' }}>
                          {crit.passed ? 'PASSED' : 'NEEDS ATTENTION'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>
                          {crit.feedback}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client Written Feedback Letter */}
                <div
                  style={{
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#f8fafc',
                      textTransform: 'uppercase',
                    }}
                  >
                    {activeContractState.latestReviewResult.clientFeedbackTitle}
                  </h3>
                  <div
                    style={{
                      backgroundColor: '#0a0d14',
                      padding: '14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '12px',
                      color: '#cbd5e1',
                      lineHeight: '1.6',
                    }}
                  >
                    {activeContractState.latestReviewResult.clientFeedbackBody}
                  </div>
                </div>

                {/* Return to Marketplace when done */}
                {activeContractState.latestReviewResult.payoutProcessed && (
                  <button
                    type="button"
                    data-testid="return-to-marketplace-btn"
                    onClick={() => setActiveTab('marketplace')}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      backgroundColor: '#38bdf8',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    CONTRACT COMPLETED · BROWSE NEXT ENGAGEMENT →
                  </button>
                )}
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  gap: '12px',
                  color: '#94a3b8',
                }}
              >
                <div style={{ fontSize: '36px' }}>⚖️</div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>
                  No Active Review Results
                </h3>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Complete the active objectives and submit your deliverables in the Submission
                  Studio to receive a formal client review.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: REPUTATION & LEDGER */}
        {/* ==================================================================== */}
        {activeTab === 'reputationLedger' && (
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              padding: '20px',
              gap: '16px',
              overflowY: 'auto',
            }}
          >
            {/* Career Standing Overview */}
            <div
              style={{
                backgroundColor: '#161e2e',
                borderRadius: '8px',
                padding: '16px 20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                  }}
                >
                  Freelance Career Standing
                </div>
                <h2
                  style={{
                    margin: '4px 0 2px 0',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#f8fafc',
                  }}
                >
                  Tier: {reputationState.tier} Researcher ({reputationState.score} Reputation Points)
                </h2>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Total Engagements Completed: {reputationState.completedContractsCount} · Scope
                  Violations: {reputationState.scopeViolationsCount}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Gross Bounty Earnings</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399' }}>
                  {formatNaira(reputationState.totalEarningsKobo)}
                </div>
              </div>
            </div>

            {/* Financial Ledger & Transaction History */}
            <div
              style={{
                backgroundColor: '#111827',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#f8fafc',
                  textTransform: 'uppercase',
                }}
              >
                Settlement & Payout Audit Ledger
              </h3>

              <div
                style={{
                  backgroundColor: '#0a0d14',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#161e2e', color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px' }}>Transaction ID</th>
                      <th style={{ padding: '10px 14px' }}>Contract Reference</th>
                      <th style={{ padding: '10px 14px' }}>Outcome</th>
                      <th style={{ padding: '10px 14px' }}>Reputation</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bountyHub?.completedContractHistory &&
                    bountyHub.completedContractHistory.length > 0 ? (
                      bountyHub.completedContractHistory.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                            color: '#cbd5e1',
                          }}
                        >
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>
                            TXN-{String(idx + 1).padStart(3, '0')}
                          </td>
                          <td style={{ padding: '10px 14px' }}>{item.contractTitle}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span
                              style={{
                                color: item.outcome === 'ACCEPTED' ? '#34d399' : '#38bdf8',
                                fontWeight: 600,
                              }}
                            >
                              {item.outcome}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            +{item.reputationDelta} pts
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#34d399',
                            }}
                          >
                            {formatNaira(item.payoutKobo)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: '#64748b',
                            fontStyle: 'italic',
                          }}
                        >
                          No completed settlement transactions yet. Accepted contract payouts will appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
