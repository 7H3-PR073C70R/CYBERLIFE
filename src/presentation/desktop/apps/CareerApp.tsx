/**
 * Cyberlife — Career, Job Board, Skills & Financial Ledger Application Component
 *
 * Implements Milestone 8 (M8):
 * - Authoritative Career Path progression & level-up requirements.
 * - Simulated Job Board with real tickets, live objective tracking, and validated payouts.
 * - Skills Matrix (1-10 scale) reflecting practical cybersecurity accomplishments.
 * - Hardware & Supplies Market for authentic workstation and character upgrades.
 * - Authoritative Financial Ledger with integer minor currency units (kobo) & recurring expenses.
 *
 * SAFETY INVARIANT:
 * 100% simulated in-game state — zero host access, zero external payment or API calls.
 */

import React, { useState, useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { Money } from '@/domain/common/Money';
import { CAREER_PATHS, getCareerLevelDefinition } from '@/simulation/career/careerDefinitions';
import { SKILL_DEFINITIONS } from '@/simulation/career/skillDefinitions';
import { JOB_LISTINGS } from '@/simulation/career/jobDefinitions';
import { SHOP_CATALOGUE } from '@/simulation/career/shopDefinitions';
import {
  CareerPathId,
  SkillId,
  JobListing,
  JobObjective,
  JobEvaluationRecord,
  FinancialTransaction,
  RecurringExpense,
  ShopItem,
  SkillState,
} from '@/simulation/career/types';

const JOB_DEFINITIONS = JOB_LISTINGS;
const EMPTY_HISTORY: readonly JobEvaluationRecord[] = [];
const EMPTY_SKILLS: Readonly<Partial<Record<SkillId, SkillState>>> = {};

export type CareerAppTab = 'overview' | 'jobs' | 'skills' | 'market' | 'ledger';

export const CareerApp: React.FC = () => {
  const sim = useOptionalSimulation();
  const state = sim?.state;

  const [activeTab, setActiveTab] = useState<CareerAppTab>('overview');
  const [jobBoardSubtab, setJobBoardSubtab] = useState<'available' | 'active' | 'history'>(
    'available'
  );
  const [selectedJobId, setSelectedJobId] = useState<string>('job_cedarline_triage');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Authoritative state extractions
  const careerState = state?.career;
  const currentPathId: CareerPathId = careerState?.currentPathId ?? 'career_sec_analyst';
  const currentLevel = careerState?.currentLevel ?? 1;
  const careerXp = careerState?.xp ?? 0;
  const pathDef = CAREER_PATHS[currentPathId];
  const nextLevelDef = getCareerLevelDefinition(currentPathId, currentLevel + 1);

  const jobsState = state?.jobs;
  const activeJobs = jobsState?.activeJobs;
  const activeAssignment = activeJobs && activeJobs.length > 0 ? activeJobs[0] : undefined;
  const availableJobIds = jobsState?.availableJobIds ?? [];
  const completedHistory = jobsState?.completedJobHistory ?? EMPTY_HISTORY;

  const skillsState = state?.skills ?? EMPTY_SKILLS;
  const balanceKobo = state?.player?.moneyKobo ?? 250_000;
  const formattedBalance = Money.fromKobo(balanceKobo).format();
  const transactions = state?.economy?.transactions ?? [];
  const recurringExpenses = state?.economy?.recurringExpenses ?? [];
  const inventorySlots = state?.inventory?.slots ?? [];

  // Check promotion eligibility
  const promotionEligibility = useMemo(() => {
    if (!nextLevelDef) return { eligible: false, reasons: ['Maximum career tier achieved'] };
    const reasons: string[] = [];

    if (careerXp < nextLevelDef.minXp) {
      reasons.push(`Requires ${nextLevelDef.minXp} Career XP (Current: ${careerXp})`);
    }

    if (completedHistory.length < nextLevelDef.minCompletedJobs) {
      reasons.push(
        `Requires ${nextLevelDef.minCompletedJobs} completed tickets (Current: ${completedHistory.length})`
      );
    }

    if (nextLevelDef.requiredSkillLevels) {
      for (const [skillId, minLvl] of Object.entries(nextLevelDef.requiredSkillLevels)) {
        const current = skillsState[skillId as SkillId]?.level ?? 1;
        if (current < minLvl) {
          const sName = SKILL_DEFINITIONS[skillId as SkillId]?.name ?? skillId;
          reasons.push(`${sName} Level ${minLvl} required (Current: Level ${current})`);
        }
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons:
        reasons.length > 0 ? reasons : ['All promotion criteria satisfied! Ready to advance.'],
    };
  }, [nextLevelDef, careerXp, skillsState, completedHistory]);

  // Selected job definition
  const selectedJobDef: JobListing | undefined = useMemo(() => {
    return JOB_DEFINITIONS[selectedJobId] ?? Object.values(JOB_DEFINITIONS)[0];
  }, [selectedJobId]);

  // Handler: Request promotion
  const handleRequestPromotion = () => {
    if (!sim) return;
    const res = sim.dispatch({ type: 'PromoteCareer' });
    if (res.success) {
      const updatedRole = res.state.career?.roleTitle ?? 'promoted role';
      setFeedbackMessage({
        type: 'success',
        text: `Promotion approved! You are now ${updatedRole} at ${res.state.career?.employer ?? 'Cedarline'}.`,
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.message || 'Promotion criteria not met yet.',
      });
    }
  };

  // Handler: Accept job
  const handleAcceptJob = (jobId: string) => {
    if (!sim) return;
    const res = sim.dispatch({ type: 'AcceptJob', jobId });
    if (res.success) {
      setFeedbackMessage({
        type: 'success',
        text: `Ticket "${JOB_DEFINITIONS[jobId]?.title ?? jobId}" accepted! Check Active Assignment for objectives.`,
      });
      setJobBoardSubtab('active');
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.message || 'Unable to accept this job ticket.',
      });
    }
  };

  // Handler: Verify & Submit active job
  const handleVerifyActiveJob = () => {
    if (!sim || !activeAssignment) return;
    const res = sim.dispatch({ type: 'CompleteJob', jobId: activeAssignment.listingId });
    if (res.success) {
      const listing = JOB_DEFINITIONS[activeAssignment.listingId];
      const rewardFormatted = listing ? Money.fromKobo(listing.payoutKobo).format() : 'reward';
      setFeedbackMessage({
        type: 'success',
        text: `Assignment verified and submitted! Earned ${rewardFormatted} and career experience.`,
      });
      setJobBoardSubtab('history');
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.message || 'Assignment objectives are not yet fulfilled in the simulation.',
      });
    }
  };

  // Handler: Purchase item
  const handlePurchaseItem = (itemId: string) => {
    if (!sim) return;
    const res = sim.dispatch({ type: 'PurchaseItem', itemId });
    if (res.success) {
      const item = SHOP_CATALOGUE[itemId];
      const price = item ? Money.fromKobo(item.priceKobo).format() : '';
      setFeedbackMessage({
        type: 'success',
        text: `Purchased "${item?.name ?? itemId}" for ${price}! Item added to your inventory.`,
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.message || 'Purchase failed.',
      });
    }
  };

  // Handler: Study learning material
  const handleStudyMaterial = (itemId: string) => {
    if (!sim) return;
    const res = sim.dispatch({ type: 'StudyLearningMaterial', itemId });
    if (res.success) {
      setFeedbackMessage({
        type: 'success',
        text: 'Material studied thoroughly! Professional skill experience awarded.',
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.message || 'Could not study this item.',
      });
    }
  };

  // Handler: Pay recurring expense
  const handlePayExpense = (expenseId: string) => {
    if (!sim) return;
    const res = sim.dispatch({ type: 'PayRecurringExpense', expenseId });
    if (res.success) {
      setFeedbackMessage({
        type: 'success',
        text: 'Bill payment processed successfully. Account brought current.',
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.message || 'Failed to pay expense. Check available funds.',
      });
    }
  };

  return (
    <div
      className="career-app"
      data-testid="career-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#070a10',
        color: '#f1f5f9',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        fontSize: '13px',
      }}
    >
      {/* Top Header & Navigation Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0c1322',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Title and Career Role Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }} aria-hidden="true">
            💼
          </span>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '0.02em',
                color: '#38bdf8',
              }}
            >
              Career Hub & Financial Ledger
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {careerState?.roleTitle ?? 'Trainee Security Analyst'} •{' '}
              {careerState?.employer ?? 'Cedarline InfoSec'}
            </div>
          </div>
          <span
            data-testid="career-level-badge"
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontWeight: 600,
            }}
          >
            Tier {currentLevel}
          </span>
        </div>

        {/* Funds Card Display */}
        <div
          data-testid="career-balance-display"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          <span aria-hidden="true">💰</span>
          <span>{formattedBalance}</span>
        </div>

        {/* Tab Navigation */}
        <nav
          role="tablist"
          style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: '#060a12',
            padding: '3px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            data-testid="tab-overview"
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: activeTab === 'overview' ? '#1e293b' : 'transparent',
              color: activeTab === 'overview' ? '#38bdf8' : '#94a3b8',
              transition: 'all 0.15s ease',
            }}
          >
            📋 Overview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'jobs'}
            data-testid="tab-jobs"
            onClick={() => setActiveTab('jobs')}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: activeTab === 'jobs' ? '#1e293b' : 'transparent',
              color: activeTab === 'jobs' ? '#38bdf8' : '#94a3b8',
              position: 'relative',
            }}
          >
            🎟️ Job Board {activeAssignment ? '•' : ''}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'skills'}
            data-testid="tab-skills"
            onClick={() => setActiveTab('skills')}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: activeTab === 'skills' ? '#1e293b' : 'transparent',
              color: activeTab === 'skills' ? '#38bdf8' : '#94a3b8',
            }}
          >
            ⚡ Skills
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'market'}
            data-testid="tab-market"
            onClick={() => setActiveTab('market')}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: activeTab === 'market' ? '#1e293b' : 'transparent',
              color: activeTab === 'market' ? '#38bdf8' : '#94a3b8',
            }}
          >
            🛒 Market
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ledger'}
            data-testid="tab-ledger"
            onClick={() => setActiveTab('ledger')}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: activeTab === 'ledger' ? '#1e293b' : 'transparent',
              color: activeTab === 'ledger' ? '#38bdf8' : '#94a3b8',
            }}
          >
            📊 Ledger & Bills
          </button>
        </nav>
      </header>

      {/* Action Toast / Feedback Banner */}
      {feedbackMessage && (
        <div
          data-testid="career-feedback-banner"
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor:
              feedbackMessage.type === 'success'
                ? 'rgba(16, 185, 129, 0.15)'
                : feedbackMessage.type === 'error'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(56, 189, 248, 0.15)',
            borderBottom: `1px solid ${
              feedbackMessage.type === 'success'
                ? 'rgba(16, 185, 129, 0.3)'
                : feedbackMessage.type === 'error'
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(56, 189, 248, 0.3)'
            }`,
            color:
              feedbackMessage.type === 'success'
                ? '#34d399'
                : feedbackMessage.type === 'error'
                  ? '#f87171'
                  : '#38bdf8',
          }}
        >
          <span>{feedbackMessage.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '0 4px',
            }}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tab Content Container */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* ========================================================================= */}
        {/* TAB 1: CAREER OVERVIEW                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div
            data-testid="career-overview-tab"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Career Status Card */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Current Designation
                </span>
                <div
                  style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}
                >
                  {careerState?.roleTitle ?? 'Trainee Security Analyst'}
                </div>
                <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>
                  {pathDef?.title ?? 'Cybersecurity Operations'}
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Organization & Branch
                </span>
                <div
                  style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}
                >
                  {careerState?.employer ?? 'Cedarline InfoSec'}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Marina District, Lagos Island
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Career Progress
                </span>
                <div
                  style={{ fontSize: '15px', fontWeight: 600, color: '#a78bfa', marginTop: '2px' }}
                >
                  Tier {currentLevel} • {careerState?.promotionsEarned ?? 0} Promotions
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  {careerState?.promotionEligible ? 'Eligible for Advancement' : 'In Progress'}
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Total Career XP
                </span>
                <div
                  style={{ fontSize: '15px', fontWeight: 600, color: '#38bdf8', marginTop: '2px' }}
                >
                  {careerXp} XP
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  {completedHistory.length} completed tickets
                </div>
              </div>
            </div>

            {/* Advancement & Next Tier Box */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
                    Next Tier: {nextLevelDef ? nextLevelDef.title : 'Maximum Level Achieved'}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {nextLevelDef
                      ? `Advance to Tier ${currentLevel + 1} with a +${Money.fromKobo(nextLevelDef.salaryBonusKobo).format()} stipend bonus.`
                      : 'You have reached the pinnacle of this operational tier.'}
                  </p>
                </div>

                {nextLevelDef && (
                  <button
                    type="button"
                    data-testid="btn-request-promotion"
                    disabled={!promotionEligibility.eligible}
                    onClick={handleRequestPromotion}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: promotionEligibility.eligible ? 'pointer' : 'not-allowed',
                      backgroundColor: promotionEligibility.eligible ? '#38bdf8' : '#334155',
                      color: promotionEligibility.eligible ? '#0f172a' : '#64748b',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {promotionEligibility.eligible
                      ? 'Request Promotion Approval'
                      : 'Requirements Incomplete'}
                  </button>
                )}
              </div>

              {/* Requirements Checklist */}
              {nextLevelDef && (
                <div
                  style={{
                    marginTop: '14px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Advancement Criteria
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {promotionEligibility.reasons.map((reason, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '12px',
                          color: promotionEligibility.eligible ? '#34d399' : '#cbd5e1',
                        }}
                      >
                        <span>{promotionEligibility.eligible ? '✓' : '•'}</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Career Path Stages Roadmap */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <h3
                style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}
              >
                Career Path Roadmap — {pathDef?.title}
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                }}
              >
                {pathDef?.levels.map(lvl => {
                  const isCurrent = lvl.level === currentLevel;
                  const isUnlocked = lvl.level <= currentLevel;
                  return (
                    <div
                      key={lvl.level}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        border: isCurrent
                          ? '1px solid #38bdf8'
                          : isUnlocked
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.06)',
                        backgroundColor: isCurrent ? 'rgba(56, 189, 248, 0.06)' : '#070a12',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            color: isCurrent ? '#38bdf8' : '#94a3b8',
                            fontWeight: 600,
                          }}
                        >
                          Tier {lvl.level}
                        </span>
                        {isCurrent && (
                          <span
                            style={{
                              fontSize: '10px',
                              color: '#38bdf8',
                              backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Current
                          </span>
                        )}
                        {isUnlocked && !isCurrent && (
                          <span style={{ fontSize: '10px', color: '#34d399' }}>Completed</span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#f8fafc',
                          marginTop: '4px',
                        }}
                      >
                        {lvl.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        {lvl.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: JOB BOARD & ASSIGNMENTS                                            */}
        {/* ========================================================================= */}
        {activeTab === 'jobs' && (
          <div
            data-testid="job-board-tab"
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {/* Sub-tab Navigation */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '8px',
              }}
            >
              <button
                type="button"
                data-testid="subtab-available-jobs"
                onClick={() => setJobBoardSubtab('available')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: jobBoardSubtab === 'available' ? '#38bdf8' : '#94a3b8',
                  borderBottom: jobBoardSubtab === 'available' ? '2px solid #38bdf8' : 'none',
                  paddingBottom: '4px',
                }}
              >
                Available Tickets ({availableJobIds.length})
              </button>
              <button
                type="button"
                data-testid="subtab-active-assignment"
                onClick={() => setJobBoardSubtab('active')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: jobBoardSubtab === 'active' ? '#38bdf8' : '#94a3b8',
                  borderBottom: jobBoardSubtab === 'active' ? '2px solid #38bdf8' : 'none',
                  paddingBottom: '4px',
                }}
              >
                Active Assignment {activeAssignment ? `(1)` : '(None)'}
              </button>
              <button
                type="button"
                data-testid="subtab-completed-history"
                onClick={() => setJobBoardSubtab('history')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: jobBoardSubtab === 'history' ? '#38bdf8' : '#94a3b8',
                  borderBottom: jobBoardSubtab === 'history' ? '2px solid #38bdf8' : 'none',
                  paddingBottom: '4px',
                }}
              >
                Work History ({completedHistory.length})
              </button>
            </div>

            {/* Subtab 1: Available Jobs */}
            {jobBoardSubtab === 'available' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.4fr)',
                  gap: '16px',
                }}
              >
                {/* Left: Job Tickets List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availableJobIds.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      No unaccepted jobs currently available. Check completed history or advance
                      your skills!
                    </div>
                  ) : (
                    availableJobIds.map(jobId => {
                      const def = JOB_DEFINITIONS[jobId];
                      if (!def) return null;
                      const isSelected = selectedJobId === jobId;
                      const isAccepted = activeAssignment?.listingId === jobId;
                      const reward = Money.fromKobo(def.payoutKobo).format();

                      return (
                        <div
                          key={jobId}
                          data-testid={`job-card-${jobId}`}
                          onClick={() => setSelectedJobId(jobId)}
                          style={{
                            padding: '12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                            border: isSelected
                              ? '1px solid #38bdf8'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                            transition: 'all 0.1s ease',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {def.employer}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399' }}>
                              {reward}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#f8fafc',
                              marginTop: '4px',
                            }}
                          >
                            {def.title}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              marginTop: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                color: '#cbd5e1',
                              }}
                            >
                              ⏱ {def.estimatedMinutes} mins
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                color: '#38bdf8',
                              }}
                            >
                              ⭐ +{def.careerXpReward} XP
                            </span>
                            {isAccepted && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                  color: '#fbbf24',
                                }}
                              >
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Right: Selected Job Details View */}
                {selectedJobDef && (
                  <div
                    style={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                          {selectedJobDef.employer}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#34d399' }}>
                          {Money.fromKobo(selectedJobDef.payoutKobo).format()}
                        </span>
                      </div>
                      <h3
                        style={{
                          margin: '4px 0',
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#f8fafc',
                        }}
                      >
                        {selectedJobDef.title}
                      </h3>
                      <p
                        style={{
                          margin: '6px 0 0',
                          fontSize: '12px',
                          color: '#94a3b8',
                          lineHeight: 1.5,
                        }}
                      >
                        {selectedJobDef.description}
                      </p>
                    </div>

                    {/* Requirements */}
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#cbd5e1',
                          textTransform: 'uppercase',
                          marginBottom: '6px',
                        }}
                      >
                        Prerequisites & Skills
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedJobDef.minCareerLevel && (
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              color: '#94a3b8',
                            }}
                          >
                            Tier {selectedJobDef.minCareerLevel}+ Required
                          </span>
                        )}
                        {selectedJobDef.requiredSkills &&
                          Object.entries(selectedJobDef.requiredSkills).map(([sId, lvl]) => (
                            <span
                              key={sId}
                              style={{
                                fontSize: '11px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                color: '#38bdf8',
                              }}
                            >
                              {SKILL_DEFINITIONS[sId as SkillId]?.name ?? sId} Level {lvl}+
                            </span>
                          ))}
                      </div>
                    </div>

                    {/* Objectives Checklist */}
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#cbd5e1',
                          textTransform: 'uppercase',
                          marginBottom: '6px',
                        }}
                      >
                        Assignment Objectives
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedJobDef.objectives.map((obj: JobObjective) => (
                          <div
                            key={obj.id}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              fontSize: '12px',
                              color: '#cbd5e1',
                            }}
                          >
                            <span style={{ color: '#64748b' }}>◻</span>
                            <span>{obj.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {activeAssignment?.listingId === selectedJobDef.id ? (
                        <button
                          type="button"
                          onClick={() => setJobBoardSubtab('active')}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#fbbf24',
                            color: '#0f172a',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          View In Active Assignment Tab →
                        </button>
                      ) : activeAssignment ? (
                        <div style={{ fontSize: '12px', color: '#f59e0b', textAlign: 'center' }}>
                          You have an active assignment. Complete or clear it before accepting
                          another.
                        </div>
                      ) : (
                        <button
                          type="button"
                          data-testid={`btn-accept-job-${selectedJobDef.id}`}
                          onClick={() => handleAcceptJob(selectedJobDef.id)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#38bdf8',
                            color: '#0f172a',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '13px',
                          }}
                        >
                          Accept Ticket & Begin Assignment
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subtab 2: Active Assignment with Live Objectives */}
            {jobBoardSubtab === 'active' && (
              <div>
                {!activeAssignment ? (
                  <div
                    style={{
                      padding: '36px',
                      textAlign: 'center',
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>📋</span>
                    <h3 style={{ margin: '8px 0 4px', fontSize: '15px', color: '#f1f5f9' }}>
                      No Active Assignment
                    </h3>
                    <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#94a3b8' }}>
                      Browse the available tickets to pick up an authorized security work order.
                    </p>
                    <button
                      type="button"
                      onClick={() => setJobBoardSubtab('available')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Browse Available Tickets
                    </button>
                  </div>
                ) : (
                  <div
                    data-testid="active-assignment-panel"
                    style={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    {(() => {
                      const listing = JOB_DEFINITIONS[activeAssignment.listingId];
                      return (
                        <>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                                ACTIVE TICKET • {listing?.employer ?? 'Cedarline InfoSec'}
                              </span>
                              <h2
                                style={{
                                  margin: '4px 0',
                                  fontSize: '18px',
                                  fontWeight: 700,
                                  color: '#f8fafc',
                                }}
                              >
                                {listing?.title ?? activeAssignment.listingId}
                              </h2>
                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                                {listing?.description}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '16px', fontWeight: 700, color: '#34d399' }}>
                                {listing ? Money.fromKobo(listing.payoutKobo).format() : ''}
                              </div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                +{listing?.careerXpReward ?? 0} XP
                              </div>
                            </div>
                          </div>

                          {/* Live Objectives Tracker */}
                          <div
                            style={{
                              backgroundColor: '#070a12',
                              borderRadius: '6px',
                              padding: '12px',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#f1f5f9',
                                marginBottom: '8px',
                              }}
                            >
                              Live In-Game Objective Status
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {activeAssignment.objectives.map((obj: JobObjective) => (
                                <div
                                  key={obj.id}
                                  data-testid={`active-obj-${obj.id}`}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 10px',
                                    borderRadius: '4px',
                                    backgroundColor: obj.isCompleted
                                      ? 'rgba(16, 185, 129, 0.1)'
                                      : 'rgba(255, 255, 255, 0.03)',
                                    border: obj.isCompleted
                                      ? '1px solid rgba(16, 185, 129, 0.3)'
                                      : '1px solid rgba(255, 255, 255, 0.05)',
                                  }}
                                >
                                  <div
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                                  >
                                    <span
                                      style={{
                                        color: obj.isCompleted ? '#34d399' : '#64748b',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                      }}
                                    >
                                      {obj.isCompleted ? '✓' : '○'}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '12px',
                                        color: obj.isCompleted ? '#f1f5f9' : '#cbd5e1',
                                      }}
                                    >
                                      {obj.description}
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      backgroundColor: obj.isCompleted
                                        ? 'rgba(16, 185, 129, 0.2)'
                                        : 'rgba(245, 158, 11, 0.15)',
                                      color: obj.isCompleted ? '#34d399' : '#fbbf24',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {obj.isCompleted ? 'SATISFIED' : 'PENDING SIMULATION ACTION'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Verification and Submission Button */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              gap: '10px',
                              paddingTop: '8px',
                            }}
                          >
                            <button
                              type="button"
                              data-testid="btn-verify-assignment"
                              onClick={handleVerifyActiveJob}
                              style={{
                                padding: '10px 20px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#10b981',
                                color: '#070a12',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                              }}
                            >
                              Verify Objectives & Complete Assignment
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Subtab 3: Completed History */}
            {jobBoardSubtab === 'history' && (
              <div
                data-testid="completed-history-list"
                style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
              >
                {completedHistory.length === 0 ? (
                  <div
                    style={{
                      padding: '36px',
                      textAlign: 'center',
                      color: '#64748b',
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                    }}
                  >
                    No completed assignments yet. Finish your first ticket to establish your work
                    record.
                  </div>
                ) : (
                  completedHistory.map((record: JobEvaluationRecord) => (
                    <div
                      key={record.jobId + record.completedAtSimulationSeconds}
                      style={{
                        padding: '14px',
                        borderRadius: '6px',
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                          {record.title}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>
                          +{Money.fromKobo(record.payoutKobo).format()}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Organization: {record.employer} • Evaluation:{' '}
                        <strong style={{ color: '#38bdf8' }}>{record.performanceRating}</strong>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
                        {record.feedbackNotes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SKILLS MATRIX                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'skills' && (
          <div
            data-testid="skills-matrix-tab"
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
              Cyberlife tracks 7 specialized cybersecurity disciplines on a scale from Level 1
              (Novice) to Level 10 (Master). Gain skill progress by executing real simulated
              investigation tools, analyzing logs, isolating incidents, and studying technical
              guides.
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
              }}
            >
              {(Object.keys(SKILL_DEFINITIONS) as SkillId[]).map(skillId => {
                const def = SKILL_DEFINITIONS[skillId];
                const sState = skillsState[skillId] ?? { id: skillId, level: 1, xp: 0, totalXp: 0 };
                const percent = Math.min(100, Math.round((sState.xp / 100) * 100));

                return (
                  <div
                    key={skillId}
                    data-testid={`skill-card-${skillId}`}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                        {def?.name ?? skillId}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          fontWeight: 700,
                        }}
                      >
                        Level {sState.level} / 10
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{def?.description}</div>

                    {/* XP Progress Bar */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '10px',
                          color: '#64748b',
                          marginBottom: '3px',
                        }}
                      >
                        <span>Progress to Level {Math.min(10, sState.level + 1)}</span>
                        <span>
                          {sState.xp} / 100 XP ({percent}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: '#070a12',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            backgroundColor: '#38bdf8',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HARDWARE & SUPPLIES MARKET                                         */}
        {/* ========================================================================= */}
        {activeTab === 'market' && (
          <div
            data-testid="shop-market-tab"
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Fictional hardware suppliers & local electronics vendor in Lagos Island. Purchases
                grant authentic in-game perks.
              </div>
              <div style={{ fontSize: '13px', color: '#cbd5e1' }}>
                Your Balance: <strong style={{ color: '#34d399' }}>{formattedBalance}</strong>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '14px',
              }}
            >
              {Object.values(SHOP_CATALOGUE).map((item: ShopItem) => {
                const slot = inventorySlots.find(s => s.itemId === item.id);
                const ownedCount = slot ? slot.quantity : 0;
                const price = Money.fromKobo(item.priceKobo).format();
                const canAfford = balanceKobo >= item.priceKobo;
                const atMaxLimit = ownedCount >= item.maxOwnership;

                return (
                  <div
                    key={item.id}
                    data-testid={`shop-item-${item.id}`}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <span
                          style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}
                        >
                          {item.category}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#34d399' }}>
                          {price}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#f8fafc',
                          marginTop: '4px',
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          marginTop: '4px',
                          lineHeight: 1.4,
                        }}
                      >
                        {item.description}
                      </div>
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(56, 189, 248, 0.08)',
                          fontSize: '11px',
                          color: '#38bdf8',
                        }}
                      >
                        ⚡ Perk: {item.gameplayPerk}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        data-testid={`btn-purchase-${item.id}`}
                        disabled={!canAfford || atMaxLimit}
                        onClick={() => handlePurchaseItem(item.id)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: canAfford && !atMaxLimit ? 'pointer' : 'not-allowed',
                          backgroundColor: atMaxLimit
                            ? '#334155'
                            : canAfford
                              ? '#38bdf8'
                              : '#334155',
                          color: atMaxLimit || !canAfford ? '#64748b' : '#0f172a',
                        }}
                      >
                        {atMaxLimit
                          ? 'Owned (Max)'
                          : canAfford
                            ? `Buy for ${price}`
                            : 'Insufficient Funds'}
                      </button>

                      {ownedCount > 0 && item.category === 'DOCUMENT' && (
                        <button
                          type="button"
                          data-testid={`btn-study-${item.id}`}
                          onClick={() => handleStudyMaterial(item.id)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(56, 189, 248, 0.4)',
                            backgroundColor: 'transparent',
                            color: '#38bdf8',
                            fontWeight: 600,
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          📖 Study
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: FINANCIAL LEDGER & EXPENSES                                         */}
        {/* ========================================================================= */}
        {activeTab === 'ledger' && (
          <div
            data-testid="financial-ledger-tab"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Balance Overview Card */}
            <div
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
                  Authoritative Balance
                </span>
                <div
                  style={{ fontSize: '24px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}
                >
                  {formattedBalance}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Exact minor currency units: {balanceKobo} kobo
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Total Transactions</span>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
                    {transactions.length}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Active Bills</span>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>
                    {recurringExpenses.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Recurring Expenses (Rent & Utilities) */}
            <div
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px',
              }}
            >
              <h3
                style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}
              >
                Scheduled Living Expenses & Rent
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '12px',
                }}
              >
                {recurringExpenses.map((expense: RecurringExpense) => {
                  const amount = Money.fromKobo(expense.amountKobo).format();
                  const isOverdue = expense.isOverdue;

                  return (
                    <div
                      key={expense.id}
                      data-testid={`recurring-expense-${expense.id}`}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        backgroundColor: '#070a12',
                        border: isOverdue
                          ? '1px solid rgba(239, 68, 68, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                          {expense.name}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: isOverdue ? '#f87171' : '#f1f5f9',
                          }}
                        >
                          {amount}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Interval: Every {expense.intervalSeconds / 86400} simulation days
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '6px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isOverdue
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(16, 185, 129, 0.15)',
                            color: isOverdue ? '#f87171' : '#34d399',
                            fontWeight: 600,
                          }}
                        >
                          {isOverdue ? 'OVERDUE' : 'CURRENT'}
                        </span>
                        {isOverdue && (
                          <button
                            type="button"
                            data-testid={`btn-pay-expense-${expense.id}`}
                            onClick={() => handlePayExpense(expense.id)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: '#ef4444',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Pay Overdue Bill
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Ledger Audit Table */}
            <div
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px',
              }}
            >
              <h3
                style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}
              >
                Authoritative Audit Trail ({transactions.length} Transactions)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#94a3b8',
                        textAlign: 'left',
                      }}
                    >
                      <th style={{ padding: '8px 6px' }}>Type</th>
                      <th style={{ padding: '8px 6px' }}>Description</th>
                      <th style={{ padding: '8px 6px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '8px 6px', textAlign: 'right' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      .slice()
                      .reverse()
                      .map((tx: FinancialTransaction) => {
                        const isCredit = tx.direction === 'CREDIT';
                        const amountStr = Money.fromKobo(tx.amountKobo).format();
                        const balanceStr = Money.fromKobo(tx.balanceAfterKobo).format();

                        return (
                          <tr
                            key={tx.id}
                            data-testid={`tx-row-${tx.id}`}
                            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                          >
                            <td style={{ padding: '8px 6px', color: '#94a3b8' }}>
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: isCredit
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'rgba(239, 68, 68, 0.1)',
                                  color: isCredit ? '#34d399' : '#f87171',
                                  fontWeight: 600,
                                }}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td style={{ padding: '8px 6px', color: '#f1f5f9' }}>
                              {tx.description}
                            </td>
                            <td
                              style={{
                                padding: '8px 6px',
                                textAlign: 'right',
                                fontWeight: 600,
                                color: isCredit ? '#34d399' : '#f87171',
                              }}
                            >
                              {isCredit ? `+${amountStr}` : `-${amountStr}`}
                            </td>
                            <td
                              style={{ padding: '8px 6px', textAlign: 'right', color: '#cbd5e1' }}
                            >
                              {balanceStr}
                            </td>
                          </tr>
                        );
                      })}
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
