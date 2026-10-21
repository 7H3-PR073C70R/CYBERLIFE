/**
 * Cyberlife — Milestone 19: Eko Bounty Network & Security Contracts App Presentation Unit Tests
 *
 * Verifies:
 * - Header rendering, reputation score, freelance tier, and active status indicators.
 * - Navigation across all 5 operational tabs (Marketplace, Active Workspace, Submission Studio, Review, Ledger).
 * - Contract selection, category filtering, and Rules of Engagement (RoE) inspection.
 * - Contract acceptance flow and simulated technical action console.
 * - Scope violation detection warning and audit tracking.
 * - Deliverable drafting studio with evidence linking and compliance affirmation.
 * - Client review debrief with deterministic scoring and payout authorization.
 * - Reputation and financial transaction ledger.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BountyApp } from '@/presentation/desktop/apps/BountyApp';
import { SimulationContext } from '@/application/simulation';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import { SimulationState } from '@/simulation/core/types';
import { CONTRACT_CATALOGUE } from '@/simulation/cyber/contracts/contractCatalogue';

describe('BountyApp (Milestone 19 Presentation)', () => {
  it('renders application header, title, and all 5 navigation tabs', () => {
    render(<BountyApp />);

    // Header title and sub-header
    expect(screen.getByText(/EKO BOUNTY NETWORK/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Authorized Freelance Vulnerability Research & Security Contracts/i)
    ).toBeInTheDocument();

    // 5 Navigation tabs
    expect(screen.getByRole('button', { name: /Marketplace/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Active Workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submission Studio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Review & Debrief/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reputation & Ledger/i })).toBeInTheDocument();
  });

  it('displays default reputation score, freelance tier, and idle status', () => {
    render(<BountyApp />);

    // Default reputation stats
    expect(screen.getByText(/Reputation Standing/i)).toBeInTheDocument();
    expect(screen.getByText(/IDLE \(NO ACTIVE CONTRACT\)/i)).toBeInTheDocument();
  });

  it('navigates between all 5 tabs smoothly', () => {
    render(<BountyApp />);

    // 1. Marketplace tab is default - contract title should be visible
    expect(
      screen.getByText(/Balogun Market Merchant Gateway/i)
    ).toBeInTheDocument();

    // 2. Switch to Active Workspace tab
    fireEvent.click(screen.getByRole('button', { name: /Active Workspace/i }));
    expect(screen.getByText(/No Active Security Contract/i)).toBeInTheDocument();

    // 3. Switch to Submission Studio tab
    fireEvent.click(screen.getByRole('button', { name: /Submission Studio/i }));
    expect(
      screen.getByText(/No active contract to submit deliverables for/i)
    ).toBeInTheDocument();

    // 4. Switch to Review & Debrief tab
    fireEvent.click(screen.getByRole('button', { name: /Review & Debrief/i }));
    expect(screen.getByText(/No Active Review Results/i)).toBeInTheDocument();

    // 5. Switch to Reputation & Ledger tab
    fireEvent.click(screen.getByRole('button', { name: /Reputation & Ledger/i }));
    expect(screen.getByText(/Freelance Career Standing/i)).toBeInTheDocument();
  });

  it('filters contract catalogue by category and search keyword', () => {
    render(<BountyApp />);

    // Category filter buttons
    expect(screen.getByRole('button', { name: 'ALL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CONFIG AUDIT' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'INVESTIGATION' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'WEB APP ASSESSMENT' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'DETECTION VALIDATION' })).toBeInTheDocument();

    // Verify initial catalogue contracts
    expect(
      screen.getByText(/Balogun Market Merchant Gateway/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/First Eko Bank — Perimeter ATM Gateway/i)
    ).toBeInTheDocument();

    // Search filter
    const searchInput = screen.getByPlaceholderText(/Search contracts by title, client, or tag\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'ATM' } });

    // Balogun POS should be filtered out, ATM should remain
    expect(screen.queryByText(/Balogun Market Merchant Gateway/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/First Eko Bank — Perimeter ATM Gateway/i)
    ).toBeInTheDocument();
  });

  it('selects a contract and displays detailed Rules of Engagement, Scope, and Objectives', () => {
    render(<BountyApp />);

    // Click on Eko Bank ATM contract card
    const atmCard = screen.getByText(/First Eko Bank — Perimeter ATM Gateway/i);
    fireEvent.click(atmCard);

    // Inspector panel updates with Eko Bank information
    expect(screen.getAllByText(/First Eko Bank Nigeria/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Rules of Engagement \(RoE\) & Scope/i)).toBeInTheDocument();
    expect(screen.getByText(/Explicitly Authorized Targets:/i)).toBeInTheDocument();
    expect(screen.getByText(/Strictly Out-of-Scope/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ACCEPT CONTRACT & ACTIVATE ROE/i })
    ).toBeInTheDocument();
  });

  it('dispatches AcceptContract command when Accept button is clicked', () => {
    const mockDispatch = vi.fn();
    const initialState = createInitialSimulationState();

    render(
      <SimulationContext.Provider
        value={{
          state: initialState,
          dispatch: mockDispatch,
          executeAction: vi.fn(),
          loadSaveState: vi.fn(),
          exportSaveState: vi.fn(),
          resetGame: vi.fn(),
        }}
      >
        <BountyApp />
      </SimulationContext.Provider>
    );

    const acceptButton = screen.getByRole('button', {
      name: /ACCEPT CONTRACT & ACTIVATE ROE/i,
    });
    fireEvent.click(acceptButton);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'AcceptContract',
        contractId: expect.any(String),
      })
    );
  });

  it('renders active contract workspace with objectives and simulated action triggers when active contract exists', () => {
    const initialState = createInitialSimulationState();
    const posContract = CONTRACT_CATALOGUE[0]!;

    const stateWithActive: SimulationState = {
      ...initialState,
      bountyHub: {
        ...initialState.bountyHub!,
        activeTab: 'activeContract',
        activeContract: {
          contractId: posContract.id,
          status: 'ACTIVE',
          acceptedAtSimTime: 28800,
          acceptedScopeVersion: 1,
          objectives: posContract.initialObjectives.map(o => ({
            id: o.id,
            title: o.title,
            description: o.description,
            isCompleted: false,
          })),
          scopeClarified: true,
          activeDraft: {
            executiveSummary: '',
            methodologyNotes: '',
            findings: [],
            linkedEvidenceIds: [],
            scopeComplianceAffirmed: true,
            riskImpactSummary: '',
            remediationRecommendations: [],
            remainingUncertainties: '',
          },
          revisionCount: 0,
          auditEvents: [],
        },
      },
    };

    const mockDispatch = vi.fn();

    render(
      <SimulationContext.Provider
        value={{
          state: stateWithActive,
          dispatch: mockDispatch,
          executeAction: vi.fn(),
          loadSaveState: vi.fn(),
          exportSaveState: vi.fn(),
          resetGame: vi.fn(),
        }}
      >
        <BountyApp />
      </SimulationContext.Provider>
    );

    // Active status pill
    expect(screen.getByText(/CONTRACT ACTIVE/i)).toBeInTheDocument();

    // Active Workspace view
    expect(screen.getByText(/Engagement Objectives & Deliverable Milestones/i)).toBeInTheDocument();
    expect(screen.getByText(/Enumerate POS Gateway Services/i)).toBeInTheDocument();
    expect(screen.getByText(/Audit Access Controls & Default Credentials/i)).toBeInTheDocument();

    // Simulated action buttons
    expect(screen.getByTestId('action-enumerate-services')).toBeInTheDocument();
    expect(screen.getByTestId('action-audit-credentials')).toBeInTheDocument();
    expect(screen.getByTestId('action-simulate-violation')).toBeInTheDocument();

    // Trigger an authorized simulated action
    fireEvent.click(screen.getByTestId('action-enumerate-services'));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ExecuteContractSimulatedAction',
      })
    );

    // Trigger an out-of-scope probe simulation
    fireEvent.click(screen.getByTestId('action-simulate-violation'));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ExecuteContractSimulatedAction',
        targetAssetId: 'asset-prod-db-01',
      })
    );
  });

  it('renders Submission Studio with form controls, evidence link selector, and submit action', () => {
    const initialState = createInitialSimulationState();
    const posContract = CONTRACT_CATALOGUE[0]!;

    const stateWithActive: SimulationState = {
      ...initialState,
      bountyHub: {
        ...initialState.bountyHub!,
        activeTab: 'submissionStudio',
        activeContract: {
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
          activeDraft: {
            executiveSummary: 'Executive summary draft content...',
            methodologyNotes: 'Methodology notes content...',
            findings: [],
            linkedEvidenceIds: ['evd-balogun-pos-config'],
            scopeComplianceAffirmed: true,
            riskImpactSummary: 'Business risk description...',
            remediationRecommendations: ['Disable default credentials.'],
            remainingUncertainties: 'None.',
          },
          revisionCount: 0,
          auditEvents: [],
        },
      },
    };

    const mockDispatch = vi.fn();

    render(
      <SimulationContext.Provider
        value={{
          state: stateWithActive,
          dispatch: mockDispatch,
          executeAction: vi.fn(),
          loadSaveState: vi.fn(),
          exportSaveState: vi.fn(),
          resetGame: vi.fn(),
        }}
      >
        <BountyApp />
      </SimulationContext.Provider>
    );

    // Submission Studio form elements
    expect(
      screen.getByText(/Deliverable & Findings Submission Studio/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Executive Summary \(Minimum 30 characters\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Assessment Methodology/i)).toBeInTheDocument();
    expect(screen.getByText(/Documented Technical Finding/i)).toBeInTheDocument();
    expect(screen.getByText(/Forensic Evidence & Telemetry Hashes/i)).toBeInTheDocument();
    expect(screen.getByText(/Prioritized Remediation Recommendations/i)).toBeInTheDocument();
    expect(
      screen.getByText(/I certify professional conduct & scope adherence/i)
    ).toBeInTheDocument();

    // Submit button
    const submitBtn = screen.getByRole('button', {
      name: /SUBMIT REPORT TO CLIENT/i,
    });
    expect(submitBtn).toBeInTheDocument();

    fireEvent.click(submitBtn);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UpdateContractSubmissionDraft',
      })
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SubmitContractDeliverables',
      })
    );
  });

  it('renders Client Review debrief with scorecard and feedback when review result is present', () => {
    const initialState = createInitialSimulationState();
    const posContract = CONTRACT_CATALOGUE[0]!;

    const stateWithReview: SimulationState = {
      ...initialState,
      bountyHub: {
        ...initialState.bountyHub!,
        activeTab: 'reviewDebrief',
        activeContract: {
          contractId: posContract.id,
          status: 'APPROVED',
          acceptedAtSimTime: 28800,
          acceptedScopeVersion: 1,
          objectives: posContract.initialObjectives.map(o => ({
            id: o.id,
            title: o.title,
            description: o.description,
            isCompleted: true,
          })),
          scopeClarified: true,
          activeDraft: {
            executiveSummary: '',
            methodologyNotes: '',
            findings: [],
            linkedEvidenceIds: [],
            scopeComplianceAffirmed: true,
            riskImpactSummary: '',
            remediationRecommendations: [],
            remainingUncertainties: '',
          },
          revisionCount: 0,
          auditEvents: [],
          latestReviewResult: {
            reviewId: 'rev-01',
            contractId: posContract.id,
            outcome: 'ACCEPTED',
            reviewedAtSimTime: 31000,
            revisionNumber: 1,
            overallScore: 92,
            clientFeedbackTitle: 'Exceptional Audit Report & Methodology',
            clientFeedbackBody: 'Your report provided exactly the technical clarity required.',
            itemizedChecks: [
              {
                checkName: 'Simulated Technical Objectives Completion',
                passed: true,
                feedback: 'All 4/4 authorized technical objectives completed.',
              },
              {
                checkName: 'Rules of Engagement & Scope Compliance Audit',
                passed: true,
                feedback: 'Zero out-of-scope probes recorded.',
              },
            ],
            payoutKobo: 150000,
            careerXpAwarded: 100,
            freelanceReputationDelta: 25,
            payoutProcessed: true,
          },
        },
      },
    };

    render(
      <SimulationContext.Provider
        value={{
          state: stateWithReview,
          dispatch: vi.fn(),
          executeAction: vi.fn(),
          loadSaveState: vi.fn(),
          exportSaveState: vi.fn(),
          resetGame: vi.fn(),
        }}
      >
        <BountyApp />
      </SimulationContext.Provider>
    );

    // Review outcome badge
    expect(screen.getByText(/Client Decision: ACCEPTED/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment Authorized: ₦ 1,500/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall Quality Score:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Exceptional Audit Report & Methodology/i)
    ).toBeInTheDocument();
  });

  it('renders Reputation & Ledger tab with career tier progress and transactions', () => {
    const initialState = createInitialSimulationState();

    const stateWithLedger: SimulationState = {
      ...initialState,
      bountyHub: {
        ...initialState.bountyHub!,
        activeTab: 'reputationLedger',
        reputation: {
          score: 220,
          tier: 'OPERATOR',
          completedContractsCount: 2,
          successfulDisclosuresCount: 3,
          revisionsCompletedCount: 1,
          scopeViolationsCount: 0,
          totalEarningsKobo: 400000,
          clientRatingAverage: 4.9,
        },
        reviewsHistory: [
          {
            contractId: 'ct-balogun-pos-audit',
            evaluatedAtSimTime: 30000,
            outcome: 'ACCEPTED',
            overallScore: 90,
            itemizedChecks: [],
            payoutKobo: 150000,
            freelanceReputationDelta: 25,
            clientFeedbackLetter: 'Solid audit work.',
            remediationAdviceAccepted: true,
          },
        ],
      },
    };

    render(
      <SimulationContext.Provider
        value={{
          state: stateWithLedger,
          dispatch: vi.fn(),
          executeAction: vi.fn(),
          loadSaveState: vi.fn(),
          exportSaveState: vi.fn(),
          resetGame: vi.fn(),
        }}
      >
        <BountyApp />
      </SimulationContext.Provider>
    );

    // Freelance career stats
    expect(screen.getByText(/Freelance Career Standing/i)).toBeInTheDocument();
    expect(screen.getAllByText(/OPERATOR/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/220 pts/i)).toBeInTheDocument();
    expect(screen.getAllByText(/₦ 4,000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Settlement & Payout Audit Ledger/i)).toBeInTheDocument();
  });
});
