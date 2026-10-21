/**
 * Cyberlife — Milestone 19: Bounty Hunting, Security Contracts & Freelance Operations
 * Authoritative Unit Test Suite
 *
 * Verifies:
 * 1. Contract discovery, filtering, and acceptance prerequisites.
 * 2. Scope & authorization gate validation (authorized vs out-of-scope vs prohibited).
 * 3. Ambiguous scope clarification workflow.
 * 4. Objective progress tracking driven by simulated technical actions.
 * 5. Deliverables packaging, evidence linking, and submission snapshots.
 * 6. Deterministic client review outcomes (ACCEPTED, ACCEPTED_WITH_FEEDBACK, REVISION_REQUESTED, REJECTED).
 * 7. Revision request and resubmission cycle.
 * 8. Idempotent payout processing and duplicate payment prevention.
 * 9. Reputation and tier progression calculation.
 * 10. Persistence serialization / deserialization roundtrip.
 * 11. M16/M17/M18 compatibility adapters with deterministic fixtures.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import { SimulationState } from '@/simulation/core/types';
import {
  createInitialBountyHubState,
  CONTRACT_CATALOGUE,
} from '@/simulation/cyber/contracts/contractCatalogue';
import { ContractAuthorizationGate } from '@/simulation/cyber/contracts/contractAuthorizationGate';
import { ContractEvaluator } from '@/simulation/cyber/contracts/contractEvaluator';
import {
  computeFreelanceTier,
  handleAcceptContract,
  handleWithdrawContract,
  handleClarifyContractScope,
  handleExecuteContractSimulatedAction,
  handleUpdateContractSubmissionDraft,
  handleSubmitContractDeliverables,
  handleResubmitContractRevision,
  handleSelectBountyContract,
  handleSetBountyCategoryFilter,
  handleSetBountyTab,
} from '@/simulation/cyber/contracts/bountyCommandHandler';
import {
  ActiveContractState,
  BountyHubState,
  ContractSubmissionDraft,
} from '@/simulation/cyber/contracts/types';
import { M16NetworkAdapter } from '@/simulation/cyber/contracts/adapters/M16NetworkAdapter';
import { M17RedTeamAdapter } from '@/simulation/cyber/contracts/adapters/M17RedTeamAdapter';
import { M18DefensiveAdapter } from '@/simulation/cyber/contracts/adapters/M18DefensiveAdapter';
import { EvidenceVaultAdapter } from '@/simulation/cyber/contracts/adapters/EvidenceVaultAdapter';
import { SimulationEngine } from '@/simulation/SimulationEngine';
import { SaveManager } from '@/application/persistence/SaveManager';
import { MemoryStorageAdapter } from '@/application/persistence/adapters/MemoryStorageAdapter';

const emptyDraft: ContractSubmissionDraft = {
  executiveSummary: '',
  methodologyNotes: '',
  findings: [],
  linkedEvidenceIds: [],
  scopeComplianceAffirmed: true,
  riskImpactSummary: '',
  remediationRecommendations: [],
  remainingUncertainties: '',
};

describe('Milestone 19: Bounty Hunting & Security Contracts Engine', () => {
  let simState: SimulationState;

  beforeEach(() => {
    simState = createInitialSimulationState();
  });

  describe('1. Discovery, Filtering & Prerequisites', () => {
    it('initializes with verified catalogue contracts', () => {
      const hub = simState.bountyHub!;
      expect(hub.contracts.length).toBeGreaterThanOrEqual(5);
      expect(hub.contracts.map(c => c.id)).toContain('ct-balogun-pos-audit');
      expect(hub.contracts.map(c => c.id)).toContain('ct-eko-atm-investigation');
      expect(hub.contracts.map(c => c.id)).toContain('ct-cedarline-api-assessment');
      expect(hub.contracts.map(c => c.id)).toContain('ct-krest-siem-validation');
      expect(hub.contracts.map(c => c.id)).toContain('ct-0xlagos-scope-clarify');

      const initialHub = createInitialBountyHubState();
      expect(initialHub.contracts.length).toBeGreaterThanOrEqual(5);
      expect(initialHub.reputation.score).toBe(120);
    });

    it('filters contracts by category accurately', () => {
      const res = handleSetBountyCategoryFilter(simState, {
        type: 'SetBountyCategoryFilter',
        filter: 'CONFIG_AUDIT',
      });
      expect(res.success).toBe(true);
      expect(res.state.bountyHub?.categoryFilter).toBe('CONFIG_AUDIT');

      const configContracts = res.state.bountyHub!.contracts.filter(c => c.category === 'CONFIG_AUDIT');
      expect(configContracts.length).toBeGreaterThanOrEqual(1);
      expect(configContracts[0]?.id).toBe('ct-balogun-pos-audit');
    });

    it('enforces reputation prerequisites on advanced contracts', () => {
      const lowRepState: SimulationState = {
        ...simState,
        bountyHub: {
          ...simState.bountyHub!,
          reputation: {
            ...simState.bountyHub!.reputation,
            score: 50, // Insufficient for advanced contracts requiring 250+
          },
        },
      };

      // ct-cedarline-api-assessment requires minFreelanceReputation: 250
      const acceptResult = handleAcceptContract(lowRepState, {
        type: 'AcceptContract',
        contractId: 'ct-cedarline-api-assessment',
      });
      expect(acceptResult.success).toBe(false);
      expect(acceptResult.state.bountyHub?.activeContract).toBeUndefined();
    });

    it('updates selected contract in hub state', () => {
      const res = handleSelectBountyContract(simState, {
        type: 'SelectBountyContract',
        contractId: 'ct-eko-atm-investigation',
      });
      expect(res.success).toBe(true);
      expect(res.state.bountyHub?.selectedContractId).toBe('ct-eko-atm-investigation');
    });

    it('updates active UI tab in hub state', () => {
      const res = handleSetBountyTab(simState, {
        type: 'SetBountyTab',
        tab: 'activeContract',
      });
      expect(res.success).toBe(true);
      expect(res.state.bountyHub?.activeTab).toBe('activeContract');
    });
  });

  describe('2. Scope Authorization Gate & Rules of Engagement', () => {
    const posContract = CONTRACT_CATALOGUE.find(c => c.id === 'ct-balogun-pos-audit')!;
    const clarifyContract = CONTRACT_CATALOGUE.find(c => c.id === 'ct-0xlagos-scope-clarify')!;

    it('approves authorized targets within scope', () => {
      const activeContractFixture: ActiveContractState = {
        contractId: posContract.id,
        status: 'ACTIVE',
        acceptedAtSimTime: 28800,
        acceptedScopeVersion: 1,
        objectives: [],
        scopeClarified: true,
        activeDraft: emptyDraft,
        revisionCount: 0,
        auditEvents: [],
      };

      const gateResult = ContractAuthorizationGate.evaluateAction(
        posContract,
        activeContractFixture,
        'gw-balogun-pos-01',
        'SERVICE_ENUMERATION',
        'CONFIG_AUDIT'
      );
      expect(gateResult.isAuthorized).toBe(true);
      expect(gateResult.decision).toBe('AUTHORIZED');
    });

    it('rejects access to out-of-scope production databases', () => {
      const activeContractFixture: ActiveContractState = {
        contractId: posContract.id,
        status: 'ACTIVE',
        acceptedAtSimTime: 28800,
        acceptedScopeVersion: 1,
        objectives: [],
        scopeClarified: true,
        activeDraft: emptyDraft,
        revisionCount: 0,
        auditEvents: [],
      };

      const gateResult = ContractAuthorizationGate.evaluateAction(
        posContract,
        activeContractFixture,
        'core-settle-01',
        'SERVICE_ENUMERATION',
        'CONFIG_AUDIT'
      );
      expect(gateResult.isAuthorized).toBe(false);
      expect(gateResult.decision).toBe('BLOCKED_OUT_OF_SCOPE');
    });

    it('rejects prohibited actions such as Denial of Service and brute-force flooding', () => {
      const activeContractFixture: ActiveContractState = {
        contractId: posContract.id,
        status: 'ACTIVE',
        acceptedAtSimTime: 28800,
        acceptedScopeVersion: 1,
        objectives: [],
        scopeClarified: true,
        activeDraft: emptyDraft,
        revisionCount: 0,
        auditEvents: [],
      };

      const gateResult = ContractAuthorizationGate.evaluateAction(
        posContract,
        activeContractFixture,
        'gw-balogun-pos-01',
        'EXPLOIT_PAYLOAD_DEPLOYMENT',
        'CONFIG_AUDIT'
      );
      expect(gateResult.isAuthorized).toBe(false);
      expect(gateResult.decision).toBe('BLOCKED_PROHIBITED');
    });

    it('detects ambiguous scope and enforces formal clarification requirement', () => {
      const unclarifiedFixture: ActiveContractState = {
        contractId: clarifyContract.id,
        status: 'ACTIVE',
        acceptedAtSimTime: 28800,
        acceptedScopeVersion: 1,
        objectives: [],
        scopeClarified: false,
        activeDraft: emptyDraft,
        revisionCount: 0,
        auditEvents: [],
      };

      const unclarifiedCheck = ContractAuthorizationGate.evaluateAction(
        clarifyContract,
        unclarifiedFixture,
        'apex-web-stg',
        'WEB_RECON',
        'WEB_APP_ASSESSMENT'
      );
      expect(unclarifiedCheck.isAuthorized).toBe(false);
      expect(unclarifiedCheck.decision).toBe('BLOCKED_AMBIGUOUS_SCOPE');

      const clarifiedFixture: ActiveContractState = {
        ...unclarifiedFixture,
        scopeClarified: true,
      };

      const clarifiedCheck = ContractAuthorizationGate.evaluateAction(
        clarifyContract,
        clarifiedFixture,
        'apex-web-stg',
        'WEB_RECON',
        'WEB_APP_ASSESSMENT'
      );
      expect(clarifiedCheck.isAuthorized).toBe(true);
      expect(clarifiedCheck.decision).toBe('AUTHORIZED');
    });
  });

  describe('3. Contract Acceptance, Activation & Objectives Progress', () => {
    it('accepts contract, creates active instance, and establishes initial objectives', () => {
      const result = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });
      expect(result.success).toBe(true);
      const active = result.state.bountyHub?.activeContract;
      expect(active).toBeDefined();
      expect(active?.contractId).toBe('ct-balogun-pos-audit');
      expect(active?.status).toBe('ACTIVE');
      expect(active?.objectives.length).toBe(4);
      expect(active?.objectives[0]?.isCompleted).toBe(false);
      expect(result.events.some(e => e.type === 'BOUNTY_CONTRACT_ACCEPTED')).toBe(true);
    });

    it('prevents accepting multiple active contracts simultaneously (idempotent)', () => {
      const acceptedOnce = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });
      const acceptedTwice = handleAcceptContract(acceptedOnce.state, {
        type: 'AcceptContract',
        contractId: 'ct-eko-atm-investigation',
      });
      // Should reject second contract while first is active
      expect(acceptedTwice.success).toBe(false);
      expect(acceptedTwice.state.bountyHub?.activeContract?.contractId).toBe('ct-balogun-pos-audit');
    });

    it('completes objectives upon authorized simulated technical actions', () => {
      const accepted = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });

      // Objective 1: obj-balogun-01 (scan_target)
      const actionResult = handleExecuteContractSimulatedAction(accepted.state, {
        type: 'ExecuteContractSimulatedAction',
        targetAssetId: 'gw-balogun-pos-01',
        actionName: 'scan_target',
        actionCategory: 'CONFIG_AUDIT',
      });

      expect(actionResult.success).toBe(true);
      const active = actionResult.state.bountyHub?.activeContract;
      expect(active).toBeDefined();
      const obj1 = active?.objectives.find(o => o.id === 'obj-balogun-01');
      expect(obj1?.isCompleted).toBe(true);
      expect(actionResult.events.some(e => e.type === 'BOUNTY_SIMULATED_ACTION_EXECUTED')).toBe(true);
    });

    it('records scope violation when unauthorized target is probed', () => {
      const accepted = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });

      const violationResult = handleExecuteContractSimulatedAction(accepted.state, {
        type: 'ExecuteContractSimulatedAction',
        targetAssetId: 'core-settle-01', // Prohibited out-of-scope asset
        actionName: 'PROBE_HOST',
        actionCategory: 'CONFIG_AUDIT',
      });

      expect(violationResult.success).toBe(false);
      expect(violationResult.state.bountyHub?.reputation.scopeViolationsCount).toBe(1);
      expect(violationResult.events.some(e => e.type === 'BOUNTY_SCOPE_VIOLATION_ATTEMPTED')).toBe(true);
    });

    it('resolves ambiguous scope when clarification option is submitted', () => {
      const accepted = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-0xlagos-scope-clarify',
      });
      expect(accepted.state.bountyHub?.activeContract?.scopeClarified).toBe(false);

      const clarifyResult = handleClarifyContractScope(accepted.state, {
        type: 'ClarifyContractScope',
        optionId: 'opt-clarify-safe-restrict',
      });

      expect(clarifyResult.success).toBe(true);
      expect(clarifyResult.state.bountyHub?.activeContract?.scopeClarified).toBe(true);
      expect(clarifyResult.events.some(e => e.type === 'BOUNTY_SCOPE_CLARIFIED')).toBe(true);
    });

    it('allows withdrawing from an active contract with reputation penalty and financial fee deduction', () => {
      const accepted = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });
      expect(accepted.state.bountyHub?.activeContract).toBeDefined();

      const withdrawn = handleWithdrawContract(accepted.state, {
        type: 'WithdrawContract',
      });
      expect(withdrawn.success).toBe(true);
      expect(withdrawn.state.bountyHub?.activeContract).toBeUndefined();
      expect(withdrawn.state.bountyHub?.reputation.score).toBeLessThan(
        accepted.state.bountyHub!.reputation.score
      );
      expect(withdrawn.events.some(e => e.type === 'BOUNTY_CONTRACT_WITHDRAWN')).toBe(true);
    });
  });

  describe('4. Deliverables Packaging & Submission Validation', () => {
    it('updates submission draft with findings, methodology, and evidence', () => {
      const accepted = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });

      const draftUpdates: Partial<ContractSubmissionDraft> = {
        executiveSummary: 'Comprehensive configuration review revealed unencrypted management interface and default credentials.',
        methodologyNotes: 'Executed non-destructive TCP port discovery and banner grabbing.',
        riskImpactSummary: 'POS terminal manipulation and unauthorized credit card telemetry extraction.',
        remediationRecommendations: [
          'Enforce TLS on port 8443.',
          'Rotate default factory credentials to strong vault secrets.',
        ],
        scopeComplianceAffirmed: true,
        linkedEvidenceIds: ['evd-balogun-pos-config'],
        findings: [
          {
            id: 'fnd-01',
            title: 'Hardcoded Default Credentials on TLS Management Port',
            affectedComponent: 'gw-balogun-pos-01:8080',
            severity: 'HIGH',
            confidence: 'CONFIRMED',
            description: 'Management port accepted factory default admin credentials.',
            proofOfConceptOrObservation: 'POST /api/v1/auth with default credentials succeeded.',
            remediationRecommendation: 'Disable default accounts and mandate MFA.',
          },
        ],
      };

      const updated = handleUpdateContractSubmissionDraft(accepted.state, {
        type: 'UpdateContractSubmissionDraft',
        draftUpdates,
      });

      const draft = updated.state.bountyHub?.activeContract?.activeDraft;
      expect(draft?.executiveSummary).toBe(draftUpdates.executiveSummary);
      expect(draft?.findings.length).toBe(1);
      expect(draft?.linkedEvidenceIds).toContain('evd-balogun-pos-config');
      expect(draft?.scopeComplianceAffirmed).toBe(true);
    });

    it('preserves an immutable submission report snapshot upon submission', () => {
      const accepted = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });

      const drafted = handleUpdateContractSubmissionDraft(accepted.state, {
        type: 'UpdateContractSubmissionDraft',
        draftUpdates: {
          executiveSummary: 'Thorough review of the payment terminal configurations exceeding minimum length.',
          methodologyNotes: 'Audited open ports and configuration dumps.',
          riskImpactSummary: 'Adversary on local network can tamper with transactions.',
          remediationRecommendations: ['Disable port 8080 or enforce strong authentication.'],
          scopeComplianceAffirmed: true,
          linkedEvidenceIds: ['evd-balogun-pos-config'],
          findings: [
            {
              id: 'fnd-01',
              title: 'Weak Default Credentials',
              affectedComponent: 'gw-balogun-pos-01',
              severity: 'HIGH',
              confidence: 'CONFIRMED',
              description: 'Factory admin credentials active.',
              proofOfConceptOrObservation: 'Authenticated successfully using admin:admin.',
              remediationRecommendation: 'Rotate passwords.',
            },
          ],
        },
      });

      // Complete objectives
      const withObjectives: SimulationState = {
        ...drafted.state,
        bountyHub: {
          ...drafted.state.bountyHub!,
          activeContract: {
            ...drafted.state.bountyHub!.activeContract!,
            objectives: drafted.state.bountyHub!.activeContract!.objectives.map(o => ({ ...o, isCompleted: true })),
          },
        },
      };

      const submittedResult = handleSubmitContractDeliverables(withObjectives, {
        type: 'SubmitContractDeliverables',
      });

      const active = submittedResult.state.bountyHub?.activeContract;
      expect(active?.status).toBe('APPROVED');
      expect(active?.submittedReportSnapshot).toBeDefined();
      expect(active?.submittedReportSnapshot?.executiveSummary).toContain('Thorough review of the payment terminal');
    });
  });

  describe('5. Deterministic Client Review & Payout Evaluation', () => {
    const posContract = CONTRACT_CATALOGUE.find(c => c.id === 'ct-balogun-pos-audit')!;

    it('evaluates valid submission to ACCEPTED with payout and reputation gains', () => {
      const validSubmission: ContractSubmissionDraft = {
        executiveSummary: 'Conducted authorized security audit of Balogun POS terminal infrastructure. Discovered critical management credential exposure and insecure protocol configuration.',
        methodologyNotes: 'Executed non-intrusive port enumeration and configuration analysis.',
        findings: [
          {
            id: 'fnd-pos-01',
            title: 'Hardcoded Default Factory Credentials on Port 8080',
            affectedComponent: 'gw-balogun-pos-01:8080',
            severity: 'HIGH',
            confidence: 'CONFIRMED',
            description: 'Web management console exposes root administrative controls under default password.',
            proofOfConceptOrObservation: 'Submitted default payload admin:admin; received 200 OK with admin token.',
            remediationRecommendation: 'Force immediate password reset and enforce certificate-based client auth.',
          },
        ],
        linkedEvidenceIds: ['evd-balogun-pos-config'],
        scopeComplianceAffirmed: true,
        riskImpactSummary: 'Allows rogue network device to compromise payment processing and exfiltrate card data.',
        remediationRecommendations: [
          'Disable default admin accounts.',
          'Isolate POS network segment from office Wi-Fi.',
        ],
        remainingUncertainties: 'None. Ground truth verified.',
      };

      const activeContractFixture: ActiveContractState = {
        contractId: posContract.id,
        status: 'ACTIVE',
        acceptedAtSimTime: 28800,
        acceptedScopeVersion: 1,
        objectives: posContract.initialObjectives.map(o => ({
          id: o.id,
          title: o.title,
          description: o.description,
          isCompleted: true,
        })),
        scopeClarified: true,
        activeDraft: validSubmission,
        revisionCount: 0,
        auditEvents: [],
      };

      const review = ContractEvaluator.evaluateSubmission(
        posContract,
        activeContractFixture,
        {
          submissionId: 'sub-01',
          contractId: posContract.id,
          submittedAtSimTime: 30000,
          revisionNumber: 1,
          ...validSubmission,
        },
        simState
      );

      expect(review.outcome).toBe('ACCEPTED');
      expect(review.overallScore).toBeGreaterThanOrEqual(85);
      expect(review.payoutKobo).toBe(posContract.financialTerms.rewardKobo);
      expect(review.freelanceReputationDelta).toBeGreaterThan(0);
      expect(review.itemizedChecks.every(c => c.passed)).toBe(true);
    });

    it('requests revision when executive summary is provided but required evidence or recommendations are missing', () => {
      // Moderate score submission (>= 45 and < 70)
      const moderateSubmission: ContractSubmissionDraft = {
        executiveSummary: 'Conducted audit of Balogun POS gateway with preliminary observation notes.',
        methodologyNotes: 'Port check executed.',
        findings: [
          {
            id: 'fnd-pos-01',
            title: 'Default Credentials',
            affectedComponent: 'gw-balogun-pos-01',
            severity: 'HIGH',
            confidence: 'CONFIRMED',
            description: 'Factory admin credentials active.',
            proofOfConceptOrObservation: 'admin:admin logged in successfully.',
            remediationRecommendation: 'Fix passwords.',
          },
        ],
        linkedEvidenceIds: [], // Missing required evidence -> penalizes score
        scopeComplianceAffirmed: true,
        riskImpactSummary: 'Allows local access.',
        remediationRecommendations: [], // Missing recommendations
        remainingUncertainties: '',
      };

      const activeContractFixture: ActiveContractState = {
        contractId: posContract.id,
        status: 'ACTIVE',
        acceptedAtSimTime: 28800,
        acceptedScopeVersion: 1,
        objectives: [
          { id: 'obj-1', title: 'Scan', description: 'desc', isCompleted: true },
          { id: 'obj-2', title: 'Audit', description: 'desc', isCompleted: false },
        ],
        scopeClarified: true,
        activeDraft: moderateSubmission,
        revisionCount: 0,
        auditEvents: [],
      };

      const review = ContractEvaluator.evaluateSubmission(
        posContract,
        activeContractFixture,
        {
          submissionId: 'sub-02',
          contractId: posContract.id,
          submittedAtSimTime: 30000,
          revisionNumber: 1,
          ...moderateSubmission,
        },
        simState
      );

      expect(review.outcome).toBe('REVISION_REQUESTED');
      expect(review.payoutKobo).toBe(0);
      expect(review.itemizedChecks.some(c => !c.passed)).toBe(true);
    });

    it('rejects contract and penalizes reputation if scope was violated', () => {
      const violatedSubmission: ContractSubmissionDraft = {
        executiveSummary: 'Conducted audit but probed out-of-scope targets.',
        methodologyNotes: 'Scanned entire corporate subnet.',
        findings: [],
        linkedEvidenceIds: [],
        scopeComplianceAffirmed: false,
        riskImpactSummary: '',
        remediationRecommendations: [],
        remainingUncertainties: '',
      };

      const activeContractFixture: ActiveContractState = {
        contractId: posContract.id,
        status: 'ACTIVE',
        acceptedAtSimTime: 28800,
        acceptedScopeVersion: 1,
        objectives: [],
        scopeClarified: true,
        activeDraft: violatedSubmission,
        revisionCount: 0,
        auditEvents: [
          {
            eventId: 'aud-violation-01',
            contractId: posContract.id,
            timestampSimTime: 29000,
            actionName: 'PROBE_OUT_OF_SCOPE',
            targetAssetId: 'core-settle-01',
            violationRecorded: true,
            notes: 'Unauthorized probe of settlement node',
          },
        ],
      };

      const review = ContractEvaluator.evaluateSubmission(
        posContract,
        activeContractFixture,
        {
          submissionId: 'sub-03',
          contractId: posContract.id,
          submittedAtSimTime: 30000,
          revisionNumber: 1,
          ...violatedSubmission,
        },
        simState
      );

      expect(review.outcome).toBe('REJECTED');
      expect(review.payoutKobo).toBe(0);
      expect(review.freelanceReputationDelta).toBeLessThan(0);
    });

    it('processes revision submission and upgrades outcome to approved', () => {
      const accepted = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });

      // Submit moderate draft with missing evidence -> triggers REVISION_REQUESTED
      const incompleteDraftState = handleUpdateContractSubmissionDraft(accepted.state, {
        type: 'UpdateContractSubmissionDraft',
        draftUpdates: {
          executiveSummary: 'Preliminary audit of POS gateway configuration in progress.',
          methodologyNotes: 'Observed service endpoints.',
          findings: [
            {
              id: 'fnd-01',
              title: 'Default Credentials',
              affectedComponent: 'gw-balogun-pos-01',
              severity: 'HIGH',
              confidence: 'CONFIRMED',
              description: 'Factory admin credentials active.',
              proofOfConceptOrObservation: 'admin:admin worked.',
              remediationRecommendation: 'Fix passwords.',
            },
          ],
          linkedEvidenceIds: [], // Missing evidence
          scopeComplianceAffirmed: true,
          riskImpactSummary: 'Potential local risk.',
          remediationRecommendations: ['Rotate passwords.'],
        },
      });

      // Partial objectives complete (1 out of 4)
      const withPartialObjectives: SimulationState = {
        ...incompleteDraftState.state,
        bountyHub: {
          ...incompleteDraftState.state.bountyHub!,
          activeContract: {
            ...incompleteDraftState.state.bountyHub!.activeContract!,
            objectives: incompleteDraftState.state.bountyHub!.activeContract!.objectives.map((o, idx) => ({
              ...o,
              isCompleted: idx === 0,
            })),
          },
        },
      };

      const firstSubmit = handleSubmitContractDeliverables(withPartialObjectives, {
        type: 'SubmitContractDeliverables',
      });
      expect(firstSubmit.state.bountyHub?.activeContract?.status).toBe('REVISION_REQUESTED');

      // Reactivate contract for revision
      const reactivated = handleResubmitContractRevision(firstSubmit.state);
      expect(reactivated.state.bountyHub?.activeContract?.status).toBe('ACTIVE');

      // Now update draft with complete data, link evidence, and complete all objectives
      const perfectedDraftState = handleUpdateContractSubmissionDraft(reactivated.state, {
        type: 'UpdateContractSubmissionDraft',
        draftUpdates: {
          executiveSummary: 'Comprehensive POS terminal security review meeting all required deliverables.',
          methodologyNotes: 'Analyzed configuration exports and TLS services.',
          riskImpactSummary: 'Exposes merchant terminals to rogue device man-in-the-middle attacks.',
          remediationRecommendations: ['Disable default credentials and enforce TLS 1.3.'],
          scopeComplianceAffirmed: true,
          linkedEvidenceIds: ['evd-balogun-pos-config'],
          findings: [
            {
              id: 'fnd-01',
              title: 'Hardcoded Factory Credentials',
              affectedComponent: 'gw-balogun-pos-01:8080',
              severity: 'HIGH',
              confidence: 'CONFIRMED',
              description: 'Factory admin credentials active.',
              proofOfConceptOrObservation: 'Authenticated successfully using admin:admin.',
              remediationRecommendation: 'Rotate passwords.',
            },
          ],
        },
      });

      // Complete all objectives
      const withCompletedObjectives: SimulationState = {
        ...perfectedDraftState.state,
        bountyHub: {
          ...perfectedDraftState.state.bountyHub!,
          activeContract: {
            ...perfectedDraftState.state.bountyHub!.activeContract!,
            objectives: perfectedDraftState.state.bountyHub!.activeContract!.objectives.map(o => ({
              ...o,
              isCompleted: true,
            })),
          },
        },
      };

      const resubmitResult = handleSubmitContractDeliverables(withCompletedObjectives, {
        type: 'SubmitContractDeliverables',
      });
      expect(resubmitResult.state.bountyHub?.activeContract?.status).toBe('APPROVED');
      expect(resubmitResult.state.bountyHub?.activeContract?.latestReviewResult?.outcome).toBe('ACCEPTED');
      expect(resubmitResult.state.bountyHub?.activeContract?.latestReviewResult?.payoutKobo).toBe(
        posContract.financialTerms.rewardKobo
      );
    });
  });

  describe('6. Idempotent Payouts & Reputation Tiers', () => {
    it('prevents double payout on repeated evaluation or resubmissions', () => {
      const accepted = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });
      const drafted = handleUpdateContractSubmissionDraft(accepted.state, {
        type: 'UpdateContractSubmissionDraft',
        draftUpdates: {
          executiveSummary: 'Full valid deliverables report for payment terminal exceeding length requirement.',
          methodologyNotes: 'Testing methodology compliant with RoE.',
          riskImpactSummary: 'Medium risk payment terminal exposure.',
          remediationRecommendations: ['Remediate identified issues.'],
          scopeComplianceAffirmed: true,
          linkedEvidenceIds: ['evd-balogun-pos-config'],
          findings: [
            {
              id: 'fnd-01',
              title: 'Factory Credentials',
              affectedComponent: 'gw-balogun-pos-01',
              severity: 'HIGH',
              confidence: 'CONFIRMED',
              description: 'Default credentials active.',
              proofOfConceptOrObservation: 'Login succeeded with default credentials.',
              remediationRecommendation: 'Rotate password.',
            },
          ],
        },
      });

      const withCompletedObjectives: SimulationState = {
        ...drafted.state,
        bountyHub: {
          ...drafted.state.bountyHub!,
          activeContract: {
            ...drafted.state.bountyHub!.activeContract!,
            objectives: drafted.state.bountyHub!.activeContract!.objectives.map(o => ({ ...o, isCompleted: true })),
          },
        },
      };

      const firstSubmit = handleSubmitContractDeliverables(withCompletedObjectives, {
        type: 'SubmitContractDeliverables',
      });
      const firstEarnings = firstSubmit.state.bountyHub?.reputation.totalEarningsKobo;
      expect(firstEarnings).toBe(150_000); // ₦1,500.00 base reward

      // Attempt repeated submit on already approved contract
      const repeatSubmit = handleSubmitContractDeliverables(firstSubmit.state, {
        type: 'SubmitContractDeliverables',
      });
      expect(repeatSubmit.success).toBe(false);
      expect(repeatSubmit.state.bountyHub?.reputation.totalEarningsKobo).toBe(firstEarnings);
    });

    it('calculates freelance tiers correctly based on reputation score', () => {
      expect(computeFreelanceTier(50)).toBe('ROOKIE');
      expect(computeFreelanceTier(150)).toBe('VERIFIED');
      expect(computeFreelanceTier(350)).toBe('SPECIALIST');
      expect(computeFreelanceTier(550)).toBe('ELITE');
      expect(computeFreelanceTier(850)).toBe('MASTER');
    });

    it('records contract outcome in client review history', () => {
      const accepted = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });
      const withDraft: SimulationState = {
        ...accepted.state,
        bountyHub: {
          ...accepted.state.bountyHub!,
          activeContract: {
            ...accepted.state.bountyHub!.activeContract!,
            objectives: accepted.state.bountyHub!.activeContract!.objectives.map(o => ({ ...o, isCompleted: true })),
            activeDraft: {
              ...accepted.state.bountyHub!.activeContract!.activeDraft,
              executiveSummary: 'Complete formal POS security assessment meeting all required deliverables.',
              methodologyNotes: 'Testing methodology compliant with RoE.',
              riskImpactSummary: 'Local gateway manipulation risk.',
              remediationRecommendations: ['Disable default credentials.'],
              scopeComplianceAffirmed: true,
              linkedEvidenceIds: ['evd-balogun-pos-config'],
              findings: [
                {
                  id: 'fnd-01',
                  title: 'Default Credentials',
                  affectedComponent: 'gw-balogun-pos-01',
                  severity: 'HIGH',
                  confidence: 'CONFIRMED',
                  description: 'Default admin login.',
                  proofOfConceptOrObservation: 'admin:admin worked.',
                  remediationRecommendation: 'Fix credential policy.',
                },
              ],
            },
          },
        },
      };

      const submitted = handleSubmitContractDeliverables(withDraft, {
        type: 'SubmitContractDeliverables',
      });
      expect(submitted.state.bountyHub?.completedContractHistory.length).toBe(1);
      expect(submitted.state.bountyHub?.completedContractHistory[0]?.contractId).toBe('ct-balogun-pos-audit');
      expect(submitted.state.bountyHub?.completedContractHistory[0]?.payoutKobo).toBe(150_000);
    });
  });

  describe('7. Modular Adapters (M16, M17, M18, EvidenceVault)', () => {
    it('M16NetworkAdapter correlates network traffic and extracts C2 indicators', () => {
      const traffic = M16NetworkAdapter.queryTrafficByIp('10.0.4.15');
      expect(traffic.length).toBeGreaterThanOrEqual(1);

      const correlation = M16NetworkAdapter.correlateIndicator('198.51.100.45');
      expect(correlation.matched).toBe(true);
      expect(correlation.threatActor).toBe('Phantom Weaver');
    });

    it('M17RedTeamAdapter executes authorized assessment action fixtures', () => {
      const posContract = CONTRACT_CATALOGUE.find(c => c.id === 'ct-cedarline-api-assessment')!;
      const target = posContract.scope.authorizedTargets[0]!;
      const res = M17RedTeamAdapter.executeAssessmentAction(target, 'SERVICE_ENUMERATION');
      expect(res.isAuthorized).toBe(true);
      expect(res.findings.length).toBeGreaterThanOrEqual(1);
      expect(res.rawOutput.length).toBeGreaterThanOrEqual(1);
    });

    it('M18DefensiveAdapter runs purple team detection tests and calculates scorecards', () => {
      const krestContract = CONTRACT_CATALOGUE.find(c => c.id === 'ct-krest-siem-validation')!;
      const target = krestContract.scope.authorizedTargets[0]!;
      const runRes = M18DefensiveAdapter.executeDetectionValidation(target, 'BRUTE_FORCE_BURST');
      expect(runRes.alertGenerated).toBe(true);
      expect(runRes.detectionScorecardPercent).toBeGreaterThanOrEqual(85);
      expect(runRes.falsePositiveIdentified).toBe(true);
    });

    it('EvidenceVaultAdapter validates forensic evidence records and SHA-256 hashes', () => {
      const allEvidence = EvidenceVaultAdapter.getAllAvailableEvidence();
      expect(allEvidence.length).toBeGreaterThanOrEqual(1);

      const item = EvidenceVaultAdapter.findEvidenceById('EVD-2026-001');
      expect(item).toBeDefined();
      expect(item?.hashSha256).toBeDefined();

      const integrity = EvidenceVaultAdapter.verifyEvidenceIntegrity('EVD-2026-001');
      expect(integrity.isValid).toBe(true);
      expect(integrity.hash).toBe(item?.hashSha256);
    });
  });

  describe('8. Save/Load Persistence Roundtrip', () => {
    it('serializes and deserializes BountyHubState without loss of active contract or history', () => {
      const accepted = handleAcceptContract(simState, {
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });
      const hub = accepted.state.bountyHub!;
      const json = JSON.stringify(hub);
      const parsed: BountyHubState = JSON.parse(json);

      expect(parsed.contracts.length).toBe(hub.contracts.length);
      expect(parsed.activeContract?.contractId).toBe('ct-balogun-pos-audit');
      expect(parsed.activeContract?.status).toBe('ACTIVE');
      expect(parsed.activeContract?.objectives.length).toBe(4);
      expect(parsed.reputation.score).toBe(hub.reputation.score);
    });

    it('restores active contract and reputation through full SaveManager saveGame and loadGame round-trip', async () => {
      const engine = new SimulationEngine();
      const storage = new MemoryStorageAdapter();
      await storage.init();
      const saveManager = new SaveManager({
        engine,
        storage,
        defaultSlotId: 'slot_m19_test',
      });
      await saveManager.init();

      // Dispatch contract acceptance through the engine
      const acceptRes = engine.dispatch({
        type: 'AcceptContract',
        contractId: 'ct-balogun-pos-audit',
      });
      expect(acceptRes.success).toBe(true);

      const beforeSaveState = engine.getState();
      expect(beforeSaveState.bountyHub?.activeContract?.contractId).toBe('ct-balogun-pos-audit');

      // Save game to slot
      const saveRes = await saveManager.saveGame('slot_m19_test', 'Active Balogun Contract');
      expect(saveRes.success).toBe(true);

      // Reset engine to new game or fresh engine
      const freshEngine = new SimulationEngine();
      const loadManager = new SaveManager({
        engine: freshEngine,
        storage,
        defaultSlotId: 'slot_m19_test',
      });
      await loadManager.init();

      // Load game from slot
      const loadRes = await loadManager.loadGame('slot_m19_test');
      expect(loadRes.success).toBe(true);

      const restoredState = freshEngine.getState();
      expect(restoredState.bountyHub).toBeDefined();
      expect(restoredState.bountyHub?.activeContract?.contractId).toBe('ct-balogun-pos-audit');
      expect(restoredState.bountyHub?.activeContract?.status).toBe('ACTIVE');
      expect(restoredState.bountyHub?.activeContract?.objectives.length).toBeGreaterThan(0);
      expect(restoredState.bountyHub?.reputation.tier).toBe('ROOKIE');
    });
  });
});
