import { SimulationState } from '../core/types';
import {
  CareerPathId,
  JobAssignment,
  JobEvaluationRecord,
  JobObjective,
  SkillId,
  SkillState,
  FinancialTransaction,
  RecurringExpense,
} from './types';
import { JOB_LISTINGS } from './jobDefinitions';
import { getCareerLevelDefinition } from './careerDefinitions';
import { awardSkillXp, createInitialSkillState } from './skillDefinitions';
import { SHOP_CATALOGUE } from './shopDefinitions';
import { creditPlayerMoney, debitPlayerMoney } from '../systems/playerSystem';
import { addItemToInventory, getItemQuantity, hasItem } from '../systems/inventorySystem';
import { createSimulationEvent } from '../events/eventFactory';
import { SimulationEvent } from '../events/types';
import { CommandResult, SimulationErrorCode } from '../commands/types';
import { deepFreeze } from '../core/stateUtils';
import { validateSimulationState } from '../core/invariants';

function makeFailure(
  state: Readonly<SimulationState>,
  errorCode: SimulationErrorCode,
  message: string
): CommandResult {
  return {
    success: false,
    state,
    events: [],
    errorCode,
    message,
    isNoOp: false,
  };
}

/**
 * Checks whether an objective in an assignment is satisfied based on authoritative state.
 */
export function isObjectiveSatisfied(objective: JobObjective, state: SimulationState): boolean {
  if (objective.isCompleted) return true;

  const target = objective.target?.toLowerCase();

  switch (objective.type) {
    case 'RUN_TOOL': {
      if (!target) return (state.flags['cyber_tools_executed_count'] as number) > 0;
      const lastTool = String(state.flags['cyber_last_tool'] ?? '').toLowerCase();
      if (lastTool === target || lastTool.includes(target)) return true;
      if (state.flags[`cyber_tool_executed_${target}`] === true) return true;
      if (state.flags[`ran_tool_${target}`] === true) return true;
      if (target === 'logview') {
        const hasLogFinding = (state.mission?.analyzedLogIds.length ?? 0) > 0;
        const toolsRan = (state.flags['cyber_tools_executed_count'] as number) ?? 0;
        return Boolean(hasLogFinding || toolsRan > 0);
      }
      if (target === 'netmap') {
        const hasNetFinding =
          (state.mission?.discoveredHosts.length ?? 0) > 0 ||
          (state.mission?.inspectedServices.length ?? 0) > 0;
        const toolsRan = (state.flags['cyber_tools_executed_count'] as number) ?? 0;
        return Boolean(hasNetFinding || toolsRan > 0);
      }
      if (target === 'catalogue' || target === 'cybersim') {
        const catalogueActive =
          (state.catalogue?.completedExerciseIds.length ?? 0) > 0 ||
          state.catalogue?.activeExerciseId !== null;
        const toolsRan = (state.flags['cyber_tools_executed_count'] as number) ?? 0;
        return Boolean(catalogueActive || toolsRan > 0);
      }
      return false;
    }

    case 'RECORD_FINDING': {
      if (!target) {
        return (
          (state.mission?.discoveredHosts.length ?? 0) +
            (state.mission?.inspectedServices.length ?? 0) +
            (state.mission?.analyzedLogIds.length ?? 0) +
            (state.catalogue?.redFindings.length ?? 0) >
          0
        );
      }
      if (target === 'red_finding' || target === 'attack_path') {
        return (
          (state.catalogue?.redFindings.length ?? 0) > 0 ||
          state.flags['finding_red_finding'] === true
        );
      }
      if (state.flags[`finding_${target}`] === true) return true;
      if (state.flags[`recorded_finding_${target}`] === true) return true;
      const inHosts = state.mission?.discoveredHosts.some(h => h.toLowerCase().includes(target));
      const inServices = state.mission?.inspectedServices.some(s =>
        s.toLowerCase().includes(target)
      );
      const inLogs = state.mission?.analyzedLogIds.some(l => l.toLowerCase().includes(target));
      if (inHosts || inServices || inLogs) return true;
      return (
        (state.mission?.discoveredHosts.length ?? 0) +
          (state.mission?.inspectedServices.length ?? 0) +
          (state.mission?.analyzedLogIds.length ?? 0) >
        0
      );
    }

    case 'PRESERVE_EVIDENCE': {
      if (!target) return (state.mission?.preservedEvidenceIds.length ?? 0) > 0;
      if (state.flags[`evidence_${target}`] === true) return true;
      const inEvidence = state.mission?.preservedEvidenceIds.some(e =>
        e.toLowerCase().includes(target)
      );
      if (inEvidence) return true;
      return (state.mission?.preservedEvidenceIds.length ?? 0) > 0;
    }

    case 'VERIFY_SERVICE': {
      if (!target) return true;
      if (state.flags[`verified_${target}`] === true) return true;
      if (target === 'detection_tune' || target === 'purple_replay') {
        const hasReplayDetected = Boolean(
          state.catalogue?.purpleRunHistory.some(r => r.runType === 'replay' && r.detected)
        );
        return hasReplayDetected || state.flags['verified_detection_tune'] === true;
      }
      if (target === 'database_service') {
        const hasDb = state.mission?.inspectedServices.some(
          s => s.toLowerCase().includes('db') || s.includes('5432')
        );
        const toolsCount = (state.flags['cyber_tools_executed_count'] as number) ?? 0;
        return Boolean(
          hasDb || toolsCount >= 2 || state.flags['verified_database_service'] === true
        );
      }
      if (target === 'containment_policy') {
        return Boolean(
          state.mission?.isContained ||
          state.mission?.isRemediated ||
          state.flags['verified_containment_policy'] === true
        );
      }
      if (target === 'forensic_integrity') {
        return (
          (state.mission?.preservedEvidenceIds.length ?? 0) >= 1 ||
          state.flags['verified_forensic_integrity'] === true
        );
      }
      return false;
    }

    case 'SUBMIT_REPORT': {
      if (!target) return Boolean(state.mission?.incidentReport);
      if (state.flags[`report_${target}`] === true) return true;
      if (state.flags[`submitted_report_${target}`] === true) return true;
      return Boolean(state.mission?.incidentReport);
    }

    default:
      return false;
  }
}

/**
 * Updates assignment objectives based on authoritative simulation state.
 */
export function evaluateAssignmentObjectives(
  assignment: JobAssignment,
  state: SimulationState
): JobAssignment {
  const updatedObjectives = assignment.objectives.map(obj => {
    if (obj.isCompleted) return obj;
    const satisfied = isObjectiveSatisfied(obj, state);
    return satisfied ? { ...obj, isCompleted: true } : obj;
  });

  return {
    ...assignment,
    objectives: updatedObjectives,
  };
}

/**
 * Handles accepting a job offer.
 */
export function handleAcceptJob(
  currentState: Readonly<SimulationState>,
  jobId: string
): CommandResult {
  const listing = JOB_LISTINGS[jobId];
  if (!listing) {
    return makeFailure(currentState, 'JOB_NOT_FOUND', `Job listing "${jobId}" not found`);
  }

  const jobs = currentState.jobs ?? {
    availableJobIds: [],
    activeJobs: [],
    completedJobHistory: [],
  };

  // Check if already active
  if (jobs.activeJobs.some(j => j.listingId === jobId)) {
    return makeFailure(currentState, 'JOB_ALREADY_ACTIVE', `Job "${jobId}" is already active`);
  }

  // Check if non-repeatable job was already completed
  if (!listing.isRepeatable && jobs.completedJobHistory.some(j => j.jobId === jobId)) {
    return makeFailure(
      currentState,
      'JOB_ALREADY_COMPLETED',
      `Job "${jobId}" has already been completed`
    );
  }

  // Check career level requirements
  const career = currentState.career;
  if (career && career.currentLevel < listing.minCareerLevel) {
    return makeFailure(
      currentState,
      'JOB_REQUIREMENTS_NOT_MET',
      `Requires career level ${listing.minCareerLevel}, current level is ${career.currentLevel}`
    );
  }

  // Check skill requirements
  const skills = currentState.skills;
  if (skills) {
    for (const [skillId, minLevel] of Object.entries(listing.requiredSkills)) {
      const currentSkill = skills[skillId as SkillId];
      if (!currentSkill || currentSkill.level < minLevel) {
        return makeFailure(
          currentState,
          'JOB_REQUIREMENTS_NOT_MET',
          `Requires skill "${skillId}" level ${minLevel}, current is ${currentSkill?.level ?? 0}`
        );
      }
    }
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  // Initial assignment with objectives checked against current state
  const initialAssignment: JobAssignment = {
    listingId: jobId,
    acceptedAtSimulationSeconds: simTime,
    objectives: listing.objectives.map(o => ({
      ...o,
      isCompleted: isObjectiveSatisfied(o, currentState),
    })),
  };

  const nextActiveJobs = [...jobs.activeJobs, initialAssignment];
  const nextAvailable = jobs.availableJobIds.filter(id => id !== jobId);

  const event = createSimulationEvent('JOB_ACCEPTED', simTime, nextRevision, {
    jobId: listing.id,
    title: listing.title,
    employer: listing.employer,
    payoutKobo: listing.payoutKobo,
  });

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    jobs: {
      availableJobIds: nextAvailable,
      activeJobs: nextActiveJobs,
      completedJobHistory: jobs.completedJobHistory,
    },
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Accepted job: "${listing.title}" from ${listing.employer}`,
  };
}

/**
 * Handles completing an active job assignment.
 */
export function handleCompleteJob(
  currentState: Readonly<SimulationState>,
  jobId: string
): CommandResult {
  const jobs = currentState.jobs;
  if (!jobs) {
    return makeFailure(currentState, 'JOB_NOT_FOUND', 'Job system not initialized');
  }

  const assignmentIndex = jobs.activeJobs.findIndex(j => j.listingId === jobId);
  if (assignmentIndex === -1) {
    return makeFailure(currentState, 'JOB_NOT_FOUND', `Job "${jobId}" is not currently active`);
  }

  const listing = JOB_LISTINGS[jobId];
  if (!listing) {
    return makeFailure(
      currentState,
      'JOB_NOT_FOUND',
      `Job listing definition "${jobId}" not found`
    );
  }

  const rawAssignment = jobs.activeJobs[assignmentIndex];
  if (!rawAssignment) {
    return makeFailure(currentState, 'JOB_NOT_FOUND', `Job "${jobId}" is not currently active`);
  }
  const evaluatedAssignment = evaluateAssignmentObjectives(rawAssignment, currentState);

  // Validate that all objectives are satisfied
  const incompleteObjectives = evaluatedAssignment.objectives.filter(o => !o.isCompleted);
  if (incompleteObjectives.length > 0) {
    const pendingNames = incompleteObjectives.map(o => `"${o.description}"`).join(', ');
    return makeFailure(
      currentState,
      'JOB_OBJECTIVES_INCOMPLETE',
      `Cannot complete job: pending objectives: ${pendingNames}`
    );
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  // 1. Credit money atomically
  const updatedPlayer = creditPlayerMoney(currentState.player, listing.payoutKobo);
  events.push(
    createSimulationEvent('PLAYER_MONEY_CHANGED', simTime, nextRevision, {
      previousKobo: currentState.player.moneyKobo,
      newKobo: updatedPlayer.moneyKobo,
      deltaKobo: listing.payoutKobo,
      operation: 'CREDIT' as const,
      reason: `Job completion payout: ${listing.title}`,
    })
  );

  // 2. Record financial transaction
  const txId = `tx_job_${jobId}_${simTime}`;
  const tx: FinancialTransaction = {
    id: txId,
    type: 'JOB_PAYOUT',
    amountKobo: listing.payoutKobo,
    direction: 'CREDIT',
    balanceAfterKobo: updatedPlayer.moneyKobo,
    timestamp: simTime,
    description: `Job payout: ${listing.title} (${listing.employer})`,
    relatedEntityId: jobId,
  };
  events.push(
    createSimulationEvent('FINANCIAL_TRANSACTION_RECORDED', simTime, nextRevision, {
      transactionId: tx.id,
      type: tx.type,
      amountKobo: tx.amountKobo,
      direction: tx.direction,
      balanceAfterKobo: tx.balanceAfterKobo,
      description: tx.description,
    })
  );

  // 3. Award skills XP
  const nextSkills: Record<SkillId, SkillState> = {
    ...(currentState.skills ?? createInitialSkillState()),
  };
  for (const [skillKey, xpVal] of Object.entries(listing.skillRewards)) {
    const sId = skillKey as SkillId;
    const currentSkill = nextSkills[sId];
    if (currentSkill) {
      const { nextState: updatedSkill } = awardSkillXp(currentSkill, xpVal);
      nextSkills[sId] = updatedSkill;
      events.push(
        createSimulationEvent('SKILL_PROGRESS_AWARDED', simTime, nextRevision, {
          skillId: sId,
          xpAwarded: xpVal,
          previousLevel: currentSkill.level,
          newLevel: updatedSkill.level,
          totalXp: updatedSkill.totalXp,
        })
      );
    }
  }

  // 4. Update career state and evaluate promotion eligibility
  const currentCareer = currentState.career ?? {
    currentPathId: 'career_sec_analyst' as CareerPathId,
    currentLevel: 1,
    roleTitle: 'Trainee Analyst',
    employer: 'Cedarline Solutions',
    xp: 0,
    promotionsEarned: 0,
    promotionEligible: false,
  };

  const nextCareerXp = currentCareer.xp + listing.careerXpReward;
  const completedHistoryCount = jobs.completedJobHistory.length + 1;

  // Check promotion eligibility for current career path
  const nextLevelDef = getCareerLevelDefinition(
    currentCareer.currentPathId,
    currentCareer.currentLevel + 1
  );

  let promotionEligible = false;
  if (nextLevelDef) {
    const meetsXp = nextCareerXp >= nextLevelDef.minXp;
    const meetsJobs = completedHistoryCount >= nextLevelDef.minCompletedJobs;
    const meetsSkills = Object.entries(nextLevelDef.requiredSkillLevels).every(
      ([sId, reqLevel]) => (nextSkills[sId as SkillId]?.level ?? 0) >= reqLevel
    );
    promotionEligible = meetsXp && meetsJobs && meetsSkills;
  }

  const updatedCareer = {
    ...currentCareer,
    xp: nextCareerXp,
    promotionEligible,
  };

  // 5. Record evaluation record in history
  const evaluationRecord: JobEvaluationRecord = {
    jobId,
    title: listing.title,
    employer: listing.employer,
    completedAtSimulationSeconds: simTime,
    payoutKobo: listing.payoutKobo,
    careerXpEarned: listing.careerXpReward,
    performanceRating: 'EXEMPLARY',
    feedbackNotes:
      'All forensic and technical objectives validated against authoritative simulation state.',
  };

  const nextActiveJobs = jobs.activeJobs.filter(j => j.listingId !== jobId);
  const nextCompletedHistory = [evaluationRecord, ...jobs.completedJobHistory];

  // Unlock advanced jobs when level 1 jobs are finished
  const allJobKeys = Object.keys(JOB_LISTINGS);
  const availableSet = new Set(jobs.availableJobIds);
  for (const jKey of allJobKeys) {
    if (jKey === jobId) continue;
    const candidateJob = JOB_LISTINGS[jKey];
    if (!candidateJob) continue;
    if (nextCompletedHistory.some(h => h.jobId === jKey) && !candidateJob.isRepeatable) continue;
    if (nextActiveJobs.some(a => a.listingId === jKey)) continue;
    // If player meets min level or completed >= 1 job, unlock next tier
    if (candidateJob.minCareerLevel <= updatedCareer.currentLevel + 1) {
      availableSet.add(jKey);
    }
  }

  events.push(
    createSimulationEvent('JOB_COMPLETED', simTime, nextRevision, {
      jobId: listing.id,
      title: listing.title,
      payoutKobo: listing.payoutKobo,
      careerXpEarned: listing.careerXpReward,
      performanceRating: evaluationRecord.performanceRating,
    })
  );

  const nextEconomy = currentState.economy ?? {
    transactions: [],
    recurringExpenses: [],
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    player: updatedPlayer,
    career: updatedCareer,
    jobs: {
      availableJobIds: Array.from(availableSet),
      activeJobs: nextActiveJobs,
      completedJobHistory: nextCompletedHistory,
    },
    skills: nextSkills,
    economy: {
      ...nextEconomy,
      transactions: [tx, ...nextEconomy.transactions],
    },
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Completed job "${listing.title}": earned ₦${(listing.payoutKobo / 100).toFixed(2)} and +${listing.careerXpReward} XP`,
  };
}

/**
 * Handles promoting the player to the next career level.
 */
export function handlePromoteCareer(
  currentState: Readonly<SimulationState>,
  targetPathId?: CareerPathId
): CommandResult {
  const currentCareer = currentState.career;
  if (!currentCareer) {
    return makeFailure(currentState, 'CAREER_NOT_PROMOTION_ELIGIBLE', 'Career state not found');
  }

  const pathId = targetPathId ?? currentCareer.currentPathId;
  const nextLevelNum = currentCareer.currentLevel + 1;
  const nextLevelDef = getCareerLevelDefinition(pathId, nextLevelNum);

  if (!nextLevelDef) {
    return makeFailure(
      currentState,
      'CAREER_NOT_PROMOTION_ELIGIBLE',
      `No higher career level available in path "${pathId}" (already at max level ${currentCareer.currentLevel})`
    );
  }

  // Check XP requirement
  if (currentCareer.xp < nextLevelDef.minXp) {
    return makeFailure(
      currentState,
      'CAREER_NOT_PROMOTION_ELIGIBLE',
      `Insufficient career XP: requires ${nextLevelDef.minXp}, current is ${currentCareer.xp}`
    );
  }

  // Check completed jobs requirement
  const completedCount = currentState.jobs?.completedJobHistory.length ?? 0;
  if (completedCount < nextLevelDef.minCompletedJobs) {
    return makeFailure(
      currentState,
      'CAREER_NOT_PROMOTION_ELIGIBLE',
      `Requires at least ${nextLevelDef.minCompletedJobs} completed assignments, current is ${completedCount}`
    );
  }

  // Check skills requirement
  const skills = currentState.skills ?? createInitialSkillState();
  for (const [sId, reqLevel] of Object.entries(nextLevelDef.requiredSkillLevels)) {
    const currentSkillLevel = skills[sId as SkillId]?.level ?? 0;
    if (currentSkillLevel < reqLevel) {
      return makeFailure(
        currentState,
        'CAREER_NOT_PROMOTION_ELIGIBLE',
        `Requires skill "${sId}" at level ${reqLevel}, current is ${currentSkillLevel}`
      );
    }
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  let updatedPlayer = currentState.player;
  const nextTransactions = [...(currentState.economy?.transactions ?? [])];

  // If promotion includes salary bonus kobo
  if (nextLevelDef.salaryBonusKobo > 0) {
    updatedPlayer = creditPlayerMoney(currentState.player, nextLevelDef.salaryBonusKobo);
    const bonusTx: FinancialTransaction = {
      id: `tx_promo_bonus_${simTime}`,
      type: 'JOB_PAYOUT',
      amountKobo: nextLevelDef.salaryBonusKobo,
      direction: 'CREDIT',
      balanceAfterKobo: updatedPlayer.moneyKobo,
      timestamp: simTime,
      description: `Promotion bonus for advancement to ${nextLevelDef.title}`,
      relatedEntityId: pathId,
    };
    nextTransactions.unshift(bonusTx);
    events.push(
      createSimulationEvent('FINANCIAL_TRANSACTION_RECORDED', simTime, nextRevision, {
        transactionId: bonusTx.id,
        type: bonusTx.type,
        amountKobo: bonusTx.amountKobo,
        direction: bonusTx.direction,
        balanceAfterKobo: bonusTx.balanceAfterKobo,
        description: bonusTx.description,
      })
    );
  }

  const updatedCareer = {
    ...currentCareer,
    currentPathId: pathId,
    currentLevel: nextLevelNum,
    roleTitle: nextLevelDef.title,
    promotionsEarned: currentCareer.promotionsEarned + 1,
    promotionEligible: false,
  };

  events.push(
    createSimulationEvent('CAREER_PROMOTED', simTime, nextRevision, {
      pathId,
      previousLevel: currentCareer.currentLevel,
      newLevel: nextLevelNum,
      roleTitle: nextLevelDef.title,
    })
  );

  const nextEconomy = currentState.economy ?? {
    transactions: [],
    recurringExpenses: [],
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    player: updatedPlayer,
    career: updatedCareer,
    economy: {
      ...nextEconomy,
      transactions: nextTransactions,
    },
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Promoted to ${nextLevelDef.title}! Level ${nextLevelNum} achieved.`,
  };
}

/**
 * Handles purchasing an item from the market catalogue.
 */
export function handlePurchaseItem(
  currentState: Readonly<SimulationState>,
  itemId: string
): CommandResult {
  const item = SHOP_CATALOGUE[itemId];
  if (!item) {
    return makeFailure(
      currentState,
      'ITEM_NOT_IN_CATALOGUE',
      `Item "${itemId}" not found in shop catalogue`
    );
  }

  // Check ownership limit
  const currentQuantity = getItemQuantity(currentState.inventory, itemId);
  if (currentQuantity >= item.maxOwnership) {
    return makeFailure(
      currentState,
      'PURCHASE_LIMIT_REACHED',
      `Ownership limit reached: maximum ${item.maxOwnership} of "${item.name}" allowed`
    );
  }

  // Check funds
  if (currentState.player.moneyKobo < item.priceKobo) {
    return makeFailure(
      currentState,
      'INSUFFICIENT_FUNDS',
      `Insufficient funds: "${item.name}" costs ₦${(item.priceKobo / 100).toFixed(2)}, current balance is ₦${(currentState.player.moneyKobo / 100).toFixed(2)}`
    );
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  // Deduct money atomically
  const updatedPlayer = debitPlayerMoney(currentState.player, item.priceKobo);
  events.push(
    createSimulationEvent('PLAYER_MONEY_CHANGED', simTime, nextRevision, {
      previousKobo: currentState.player.moneyKobo,
      newKobo: updatedPlayer.moneyKobo,
      deltaKobo: -item.priceKobo,
      operation: 'DEBIT' as const,
      reason: `Purchased item: ${item.name}`,
    })
  );

  // Add item to inventory
  const updatedInventory = addItemToInventory(currentState.inventory, itemId, 1);
  events.push(
    createSimulationEvent('INVENTORY_ITEM_ADDED', simTime, nextRevision, {
      itemId,
      quantityAdded: 1,
      totalQuantity: currentQuantity + 1,
    })
  );

  // Record transaction
  const txId = `tx_buy_${itemId}_${simTime}`;
  const tx: FinancialTransaction = {
    id: txId,
    type: 'PURCHASE',
    amountKobo: item.priceKobo,
    direction: 'DEBIT',
    balanceAfterKobo: updatedPlayer.moneyKobo,
    timestamp: simTime,
    description: `Purchase: ${item.name}`,
    relatedEntityId: itemId,
  };
  events.push(
    createSimulationEvent('FINANCIAL_TRANSACTION_RECORDED', simTime, nextRevision, {
      transactionId: tx.id,
      type: tx.type,
      amountKobo: tx.amountKobo,
      direction: tx.direction,
      balanceAfterKobo: tx.balanceAfterKobo,
      description: tx.description,
    })
  );

  events.push(
    createSimulationEvent('ITEM_PURCHASED', simTime, nextRevision, {
      itemId,
      itemName: item.name,
      priceKobo: item.priceKobo,
      remainingMoneyKobo: updatedPlayer.moneyKobo,
    })
  );

  const nextEconomy = currentState.economy ?? {
    transactions: [],
    recurringExpenses: [],
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    player: updatedPlayer,
    inventory: updatedInventory,
    economy: {
      ...nextEconomy,
      transactions: [tx, ...nextEconomy.transactions],
    },
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Purchased ${item.name} for ₦${(item.priceKobo / 100).toFixed(2)}.`,
  };
}

/**
 * Handles studying learning materials owned in inventory.
 */
export function handleStudyLearningMaterial(
  currentState: Readonly<SimulationState>,
  itemId: string
): CommandResult {
  if (!hasItem(currentState.inventory, itemId)) {
    return makeFailure(currentState, 'ITEM_NOT_FOUND', `Item "${itemId}" not in inventory`);
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;
  const events: SimulationEvent[] = [];
  const nextSkills: Record<SkillId, SkillState> = {
    ...(currentState.skills ?? createInitialSkillState()),
  };

  if (itemId === 'item_sec_cert_guide') {
    if (nextSkills.security_fundamentals) {
      const { nextState: s1 } = awardSkillXp(nextSkills.security_fundamentals, 60);
      nextSkills.security_fundamentals = s1;
      events.push(
        createSimulationEvent('SKILL_PROGRESS_AWARDED', simTime, nextRevision, {
          skillId: 'security_fundamentals',
          xpAwarded: 60,
          previousLevel: currentState.skills?.security_fundamentals.level ?? 1,
          newLevel: s1.level,
          totalXp: s1.totalXp,
        })
      );
    }
    if (nextSkills.log_analysis) {
      const { nextState: s2 } = awardSkillXp(nextSkills.log_analysis, 40);
      nextSkills.log_analysis = s2;
      events.push(
        createSimulationEvent('SKILL_PROGRESS_AWARDED', simTime, nextRevision, {
          skillId: 'log_analysis',
          xpAwarded: 40,
          previousLevel: currentState.skills?.log_analysis.level ?? 1,
          newLevel: s2.level,
          totalXp: s2.totalXp,
        })
      );
    }
  } else if (itemId === 'item_network_handbook') {
    if (nextSkills.network_fundamentals) {
      const { nextState: s1 } = awardSkillXp(nextSkills.network_fundamentals, 50);
      nextSkills.network_fundamentals = s1;
      events.push(
        createSimulationEvent('SKILL_PROGRESS_AWARDED', simTime, nextRevision, {
          skillId: 'network_fundamentals',
          xpAwarded: 50,
          previousLevel: currentState.skills?.network_fundamentals.level ?? 1,
          newLevel: s1.level,
          totalXp: s1.totalXp,
        })
      );
    }
  } else {
    return makeFailure(
      currentState,
      'INVALID_ARGUMENT',
      `Item "${itemId}" is not a studyable learning material`
    );
  }

  const nextFlags = {
    ...currentState.flags,
    [`studied_${itemId}`]: true,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    skills: nextSkills,
    flags: nextFlags,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Studied "${itemId}": gained skill progress!`,
  };
}

/**
 * Handles manually paying an overdue recurring expense.
 */
export function handlePayRecurringExpense(
  currentState: Readonly<SimulationState>,
  expenseId: string
): CommandResult {
  const economy = currentState.economy;
  if (!economy) {
    return makeFailure(currentState, 'EXPENSE_NOT_FOUND', 'Economy system not initialized');
  }

  const expIndex = economy.recurringExpenses.findIndex(e => e.id === expenseId);
  if (expIndex === -1) {
    return makeFailure(
      currentState,
      'EXPENSE_NOT_FOUND',
      `Recurring expense "${expenseId}" not found`
    );
  }

  const exp = economy.recurringExpenses[expIndex];
  if (!exp) {
    return makeFailure(
      currentState,
      'EXPENSE_NOT_FOUND',
      `Recurring expense "${expenseId}" not found`
    );
  }
  if (!exp.isOverdue) {
    return makeFailure(
      currentState,
      'EXPENSE_NOT_OVERDUE',
      `Expense "${exp.name}" is not currently overdue`
    );
  }

  if (currentState.player.moneyKobo < exp.amountKobo) {
    return makeFailure(
      currentState,
      'INSUFFICIENT_FUNDS',
      `Insufficient funds to pay bill: requires ₦${(exp.amountKobo / 100).toFixed(2)}, current balance is ₦${(currentState.player.moneyKobo / 100).toFixed(2)}`
    );
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  const updatedPlayer = debitPlayerMoney(currentState.player, exp.amountKobo);
  events.push(
    createSimulationEvent('PLAYER_MONEY_CHANGED', simTime, nextRevision, {
      previousKobo: currentState.player.moneyKobo,
      newKobo: updatedPlayer.moneyKobo,
      deltaKobo: -exp.amountKobo,
      operation: 'DEBIT' as const,
      reason: `Cleared overdue bill: ${exp.name}`,
    })
  );

  const txId = `tx_bill_${expenseId}_${simTime}`;
  const tx: FinancialTransaction = {
    id: txId,
    type: 'EXPENSE',
    amountKobo: exp.amountKobo,
    direction: 'DEBIT',
    balanceAfterKobo: updatedPlayer.moneyKobo,
    timestamp: simTime,
    description: `Paid overdue bill: ${exp.name}`,
    relatedEntityId: expenseId,
  };
  events.push(
    createSimulationEvent('FINANCIAL_TRANSACTION_RECORDED', simTime, nextRevision, {
      transactionId: tx.id,
      type: tx.type,
      amountKobo: tx.amountKobo,
      direction: tx.direction,
      balanceAfterKobo: tx.balanceAfterKobo,
      description: tx.description,
    })
  );

  const updatedExpense: RecurringExpense = {
    id: exp.id,
    name: exp.name,
    description: exp.description,
    amountKobo: exp.amountKobo,
    intervalSeconds: exp.intervalSeconds,
    isOverdue: false,
    lastChargedSimulationTime: simTime,
    nextDueSimulationTime: simTime + exp.intervalSeconds,
  };

  const nextExpenses = [...economy.recurringExpenses];
  nextExpenses[expIndex] = updatedExpense;

  events.push(
    createSimulationEvent('RECURRING_EXPENSE_PAID', simTime, nextRevision, {
      expenseId: exp.id,
      name: exp.name,
      amountKobo: exp.amountKobo,
      balanceAfterKobo: updatedPlayer.moneyKobo,
    })
  );

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    player: updatedPlayer,
    economy: {
      ...economy,
      transactions: [tx, ...economy.transactions],
      recurringExpenses: nextExpenses,
    },
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Cleared overdue bill for ${exp.name}: paid ₦${(exp.amountKobo / 100).toFixed(2)}.`,
  };
}

/**
 * Processes recurring expenses when simulation time advances.
 * Deterministically checks due intervals and handles payments / overdue state.
 */
export function processRecurringExpensesOnTimeAdvance(
  currentState: SimulationState,
  newSimTime: number,
  nextRevision: number
): {
  readonly player: SimulationState['player'];
  readonly economy: SimulationState['economy'];
  readonly events: ReadonlyArray<SimulationEvent>;
} {
  if (!currentState.economy) {
    return { player: currentState.player, economy: undefined, events: [] };
  }

  let currentPlayer = currentState.player;
  const currentExpenses = [...currentState.economy.recurringExpenses];
  const nextTransactions = [...currentState.economy.transactions];
  const events: SimulationEvent[] = [];

  for (let i = 0; i < currentExpenses.length; i++) {
    const rawExp = currentExpenses[i];
    if (!rawExp) continue;
    let exp: RecurringExpense = rawExp;

    // Check if expense is due
    while (newSimTime >= exp.nextDueSimulationTime) {
      if (currentPlayer.moneyKobo >= exp.amountKobo) {
        // Sufficient funds: charge automatically
        const prevKobo = currentPlayer.moneyKobo;
        currentPlayer = debitPlayerMoney(currentPlayer, exp.amountKobo);

        events.push(
          createSimulationEvent('PLAYER_MONEY_CHANGED', newSimTime, nextRevision, {
            previousKobo: prevKobo,
            newKobo: currentPlayer.moneyKobo,
            deltaKobo: -exp.amountKobo,
            operation: 'DEBIT' as const,
            reason: `Recurring expense charge: ${exp.name}`,
          })
        );

        const txId = `tx_auto_${exp.id}_${exp.nextDueSimulationTime}`;
        const tx: FinancialTransaction = {
          id: txId,
          type: 'EXPENSE',
          amountKobo: exp.amountKobo,
          direction: 'DEBIT',
          balanceAfterKobo: currentPlayer.moneyKobo,
          timestamp: exp.nextDueSimulationTime,
          description: `Automatic payment: ${exp.name}`,
          relatedEntityId: exp.id,
        };
        nextTransactions.unshift(tx);

        events.push(
          createSimulationEvent('FINANCIAL_TRANSACTION_RECORDED', newSimTime, nextRevision, {
            transactionId: tx.id,
            type: tx.type,
            amountKobo: tx.amountKobo,
            direction: tx.direction,
            balanceAfterKobo: tx.balanceAfterKobo,
            description: tx.description,
          })
        );

        events.push(
          createSimulationEvent('RECURRING_EXPENSE_PAID', newSimTime, nextRevision, {
            expenseId: exp.id,
            name: exp.name,
            amountKobo: exp.amountKobo,
            balanceAfterKobo: currentPlayer.moneyKobo,
          })
        );

        exp = {
          id: exp.id,
          name: exp.name,
          description: exp.description,
          amountKobo: exp.amountKobo,
          intervalSeconds: exp.intervalSeconds,
          lastChargedSimulationTime: exp.nextDueSimulationTime,
          nextDueSimulationTime: exp.nextDueSimulationTime + exp.intervalSeconds,
          isOverdue: false,
        };
      } else {
        // Insufficient funds: mark overdue without charging or pushing balance negative
        exp = {
          id: exp.id,
          name: exp.name,
          description: exp.description,
          amountKobo: exp.amountKobo,
          intervalSeconds: exp.intervalSeconds,
          lastChargedSimulationTime: exp.lastChargedSimulationTime,
          isOverdue: true,
          nextDueSimulationTime: exp.nextDueSimulationTime + exp.intervalSeconds,
        };

        events.push(
          createSimulationEvent('RECURRING_EXPENSE_OVERDUE', newSimTime, nextRevision, {
            expenseId: exp.id,
            name: exp.name,
            amountKobo: exp.amountKobo,
            playerMoneyKobo: currentPlayer.moneyKobo,
          })
        );
        break; // Stop further repeated charges in this advance step
      }
    }

    currentExpenses[i] = exp;
  }

  return {
    player: currentPlayer,
    economy: {
      transactions: nextTransactions,
      recurringExpenses: currentExpenses,
    },
    events,
  };
}
