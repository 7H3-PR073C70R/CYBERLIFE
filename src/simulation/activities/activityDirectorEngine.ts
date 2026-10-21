/**
 * Cyberlife — Milestone 20: Activity Director & Evaluation Engine
 *
 * Implements deterministic domain evaluation:
 * - Prerequisite and eligibility gating
 * - Objective evaluation against real simulation state
 * - Transparent recommendation prioritization and scoring
 * - Idempotent resolution and reward application
 * - Safe failure handling and career continuity
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated in-memory domain logic.
 */

import type { SimulationState } from '../core/types';
import type {
  ActivityDefinition,
  ActivityRuntimeState,
  ActivityDirectorState,
  ActivityObjective,
  ActivityEvaluationHistoryRecord,
} from './types';
import { AUTHORED_ACTIVITIES } from './activityCatalogue';
import { creditPlayerMoney, debitPlayerMoney } from '../systems/playerSystem';
import { awardSkillXp } from '../career/skillDefinitions';
import type { SkillId } from '../career/types';

/**
 * Validates whether an activity's prerequisites are met by current simulation state.
 */
export function evaluatePrerequisites(
  def: ActivityDefinition,
  state: SimulationState
): { eligible: boolean; reason?: string } {
  const prereqs = def.prerequisites;

  // Career path requirement
  if (prereqs.careerPath && state.career) {
    if (state.career.currentPathId !== prereqs.careerPath) {
      return {
        eligible: false,
        reason: `Requires career track "${prereqs.careerPath}", currently on "${state.career.currentPathId}"`,
      };
    }
  }

  // Min career level
  if (prereqs.minCareerLevel && state.career) {
    if (state.career.currentLevel < prereqs.minCareerLevel) {
      return {
        eligible: false,
        reason: `Requires career level ${prereqs.minCareerLevel}, currently level ${state.career.currentLevel}`,
      };
    }
  }

  // Required skills
  if (prereqs.requiredSkills && state.skills) {
    for (const [skillId, minLevel] of Object.entries(prereqs.requiredSkills)) {
      if (minLevel !== undefined) {
        const skill = state.skills[skillId as SkillId];
        const currentLevel = skill?.level ?? 0;
        if (currentLevel < minLevel) {
          return {
            eligible: false,
            reason: `Requires skill "${skillId}" level ${minLevel}, currently level ${currentLevel}`,
          };
        }
      }
    }
  }

  // Required world flags
  if (prereqs.requiredFlags) {
    for (const [flag, expectedVal] of Object.entries(prereqs.requiredFlags)) {
      if (state.flags[flag] !== expectedVal) {
        return {
          eligible: false,
          reason: `Requires prerequisite condition: ${flag}`,
        };
      }
    }
  }

  // Prohibited world flags
  if (prereqs.prohibitedFlags) {
    for (const flag of prereqs.prohibitedFlags) {
      if (Boolean(state.flags[flag])) {
        return {
          eligible: false,
          reason: `Incompatible with active condition: ${flag}`,
        };
      }
    }
  }

  // Min reputation points
  if (prereqs.minReputationPoints !== undefined) {
    const rep = state.bountyHub?.reputation.score ?? 120;
    if (rep < prereqs.minReputationPoints) {
      return {
        eligible: false,
        reason: `Requires minimum ${prereqs.minReputationPoints} freelance reputation (current: ${rep})`,
      };
    }
  }

  // Completed activities
  if (prereqs.completedActivityIds && state.activityDirector) {
    const completedSet = new Set(
      state.activityDirector.completedHistory
        .filter(h => h.outcome === 'COMPLETED')
        .map(h => h.activityId)
    );
    for (const neededId of prereqs.completedActivityIds) {
      if (!completedSet.has(neededId)) {
        return {
          eligible: false,
          reason: `Requires completion of previous assignment "${neededId}"`,
        };
      }
    }
  }

  return { eligible: true };
}

/**
 * Checks whether an activity objective is satisfied based on authoritative game state.
 */
export function isActivityObjectiveSatisfied(
  objective: ActivityObjective,
  state: SimulationState
): boolean {
  if (objective.isCompleted) return true;

  const target = objective.target?.toLowerCase() ?? '';

  switch (objective.type) {
    case 'RUN_TOOL': {
      if (!target) return ((state.flags['cyber_tools_executed_count'] as number) ?? 0) > 0;
      if (state.flags[`cyber_tool_executed_${target}`] === true) return true;
      if (state.flags[`ran_tool_${target}`] === true) return true;
      const lastTool = String(state.flags['cyber_last_tool'] ?? '').toLowerCase();
      if (lastTool === target || lastTool.includes(target)) return true;

      if (target === 'logview') {
        const hasLogs = (state.mission?.analyzedLogIds.length ?? 0) > 0;
        const toolsRan = (state.flags['cyber_tools_executed_count'] as number) ?? 0;
        return hasLogs || toolsRan > 0 || state.flags['logview_inspected'] === true;
      }
      if (target === 'sysinfo') {
        return state.flags['sysinfo_viewed'] === true || Boolean(state.flags['workstation_specs_checked']);
      }
      if (target === 'bounty_action') {
        return (state.bountyHub?.activeContract?.auditEvents?.length ?? 0) > 0;
      }
      if (target === 'procedural_scan') {
        return ((state.flags['cyber_tools_executed_count'] as number) ?? 0) > 0;
      }
      return false;
    }

    case 'RECORD_FINDING': {
      if (target === 'threat_correlation') {
        const threatFindings = (state.networkInvestigation?.correlatedIndicatorIds.length ?? 0);
        return threatFindings > 0 || state.flags['broad_street_intel_verified'] === true;
      }
      if (target === 'red_finding') {
        const redFindings =
          (state.redTeamAssessment?.findings.length ?? 0) +
          (state.catalogue?.redFindings.length ?? 0);
        return redFindings > 0 || state.flags['finding_red_finding'] === true;
      }
      const generalFindings =
        (state.mission?.discoveredHosts.length ?? 0) +
        (state.mission?.inspectedServices.length ?? 0) +
        (state.mission?.analyzedLogIds.length ?? 0);
      return generalFindings > 0 || Boolean(state.flags[`finding_${target}`]);
    }

    case 'PRESERVE_EVIDENCE': {
      const missionEvidence = state.mission?.preservedEvidenceIds.length ?? 0;
      const redEvidence = state.redTeamAssessment?.evidenceVault.length ?? 0;
      return (missionEvidence + redEvidence) > 0 || Boolean(state.flags[`evidence_${target}`]);
    }

    case 'VERIFY_SERVICE': {
      if (target === 'purple_replay') {
        const hasReplay = Boolean(
          (state.catalogue?.purpleRunHistory.some(r => r.detected) ?? false) ||
          (state.defensiveOps && Object.values(state.defensiveOps.purpleEmulationResults).some(r => r.status === 'DETECTED'))
        );
        return hasReplay || state.flags['purple_emulation_certified'] === true;
      }
      return Boolean(state.mission?.isVerified || state.flags[`verified_${target}`]);
    }

    case 'SUBMIT_REPORT': {
      if (target === 'incident_report') {
        return Boolean(state.mission?.incidentReport || state.mission?.isCompleted);
      }
      if (target === 'red_team_report') {
        return Boolean(state.redTeamAssessment?.reportSubmission !== undefined);
      }
      if (target === 'bounty_submission') {
        return Boolean(state.bountyHub?.activeContract?.submittedReportSnapshot !== undefined);
      }
      return Boolean(state.mission?.incidentReport || state.flags[`submitted_report_${target}`]);
    }

    case 'ANALYZE_TRAFFIC': {
      return Boolean(
        state.networkInvestigation?.selectedHostId ||
        (state.networkInvestigation?.inspectedEventIds.length ?? 0) > 0 ||
        state.flags['packet_lens_analyzed'] ||
        state.flags['threat_indicator_correlated']
      );
    }

    case 'EXECUTE_ACTION': {
      if (target === 'containment_policy') {
        return Boolean(state.mission?.isContained || state.mission?.isRemediated);
      }
      if (target === 'accept_roe') {
        return Boolean(state.redTeamAssessment?.isAcceptedByPlayer || state.flags['red_team_roe_accepted']);
      }
      if (target === 'accept_contract') {
        return Boolean(state.bountyHub?.activeContract !== undefined);
      }
      if (target === 'purple_scenario') {
        return Boolean(
          (state.catalogue?.purpleRunHistory.length ?? 0) > 0 ||
          (state.defensiveOps && Object.keys(state.defensiveOps.purpleEmulationResults).length > 0)
        );
      }
      if (target === 'study_guide') {
        return Boolean(state.flags['studied_guide'] || state.flags['cyber_study_completed']);
      }
      return Boolean(state.flags[`action_${target}`]);
    }

    case 'RESOLVE_INCIDENT': {
      if (target === 'alert_triage') {
        const triagedCount = state.defensiveOps?.alerts.filter(
          a => a.triageStatus === 'RESOLVED' || a.triageStatus === 'FALSE_POSITIVE'
        ).length ?? 0;
        return triagedCount > 0 || state.flags['balogun_defense_verified'] === true;
      }
      return Boolean(state.mission?.isContained || state.flags[`resolved_${target}`]);
    }

    case 'TUNE_RULE': {
      const tunedRules =
        (state.defensiveOps?.rules.filter(r => r.isEnabled).length ?? 0) +
        (state.catalogue?.detectionRules.filter(r => r.isTuned).length ?? 0);
      return tunedRules > 0 || state.flags['rule_tuned'] === true;
    }

    case 'TALK_TO_NPC': {
      return Boolean(
        state.flags[`talked_to_${target}`] ||
        state.flags['marina_networking_completed'] ||
        state.activeDialogue !== undefined
      );
    }

    case 'VISIT_LOCATION': {
      if (target === 'neighborhood' || target === 'cedarline_interior') {
        return state.player.locationId === target || Boolean(state.flags[`visited_${target}`]);
      }
      return state.player.locationId === target;
    }

    default:
      return false;
  }
}

/**
 * Re-evaluates all objectives in an activity and computes its progress percentage.
 */
export function evaluateActivityObjectives(
  activity: ActivityRuntimeState,
  _def: ActivityDefinition,
  state: SimulationState
): ActivityRuntimeState {
  const updatedObjectives = activity.objectives.map(obj => {
    if (obj.isCompleted) return obj;
    const isDone = isActivityObjectiveSatisfied(obj, state);
    return isDone ? { ...obj, isCompleted: true } : obj;
  });

  const mandatoryObjs = updatedObjectives.filter(o => !o.isOptional);
  const completedCount = mandatoryObjs.filter(o => o.isCompleted).length;
  const progressPercentage =
    mandatoryObjs.length > 0 ? Math.round((completedCount / mandatoryObjs.length) * 100) : 100;

  let nextStatus = activity.status;
  if (activity.status === 'ACTIVE' && completedCount > 0 && progressPercentage < 100) {
    nextStatus = 'IN_PROGRESS';
  } else if (progressPercentage === 100 && (activity.status === 'ACTIVE' || activity.status === 'IN_PROGRESS')) {
    nextStatus = 'COMPLETED';
  }

  return {
    ...activity,
    objectives: updatedObjectives,
    progressPercentage,
    status: nextStatus,
  };
}

/**
 * Transparent scoring algorithm to prioritize and recommend opportunities.
 */
export function prioritizeOpportunities(
  state: SimulationState,
  directorState: ActivityDirectorState,
  catalogue: Record<string, ActivityDefinition> = AUTHORED_ACTIVITIES
): { primaryObjectiveId: string | null; recommendedActivityIds: string[] } {
  const scoredList: Array<{ id: string; score: number }> = [];

  for (const [id, def] of Object.entries(catalogue)) {
    const runtime = directorState.activities[id];

    // Exclude permanently completed non-repeatable activities
    if (runtime && runtime.status === 'COMPLETED' && !def.isRepeatable) {
      continue;
    }

    // Check eligibility
    const { eligible } = evaluatePrerequisites(def, state);
    if (!eligible) {
      continue;
    }

    let score = 0;

    // Base priority weighting
    switch (def.priority) {
      case 'PRIMARY_OBJECTIVE':
        score += 100;
        break;
      case 'TIME_SENSITIVE':
        score += 80;
        break;
      case 'RECOMMENDED':
        score += 60;
        break;
      case 'FOLLOW_UP':
        score += 50;
        break;
      case 'OPTIONAL':
      default:
        score += 30;
        break;
    }

    // Career path alignment (+25)
    if (state.career && def.prerequisites.careerPath === state.career.currentPathId) {
      score += 25;
    }

    // Skill growth opportunity (+15 if skill is below level 3)
    if (state.skills && def.reward.skillRewards) {
      for (const [skillId] of Object.entries(def.reward.skillRewards)) {
        const currentLevel = state.skills[skillId as SkillId]?.level ?? 1;
        if (currentLevel <= 2) {
          score += 15;
          break;
        }
      }
    }

    // Narrative urgency (+40 for uncompleted main story)
    if (def.type === 'STORY_MISSION' && (!runtime || runtime.status !== 'COMPLETED')) {
      score += 40;
    }

    // Location proximity bonus (+10 if in same location)
    if (def.locationId && def.locationId === state.player.locationId) {
      score += 10;
    }

    // Uncompleted active bonus (+20)
    if (runtime && (runtime.status === 'ACTIVE' || runtime.status === 'IN_PROGRESS')) {
      score += 20;
    }

    scoredList.push({ id, score });
  }

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);

  // Identify primary objective: top STORY_MISSION or highest scored primary
  const primaryCandidate = scoredList.find(item => {
    const def = catalogue[item.id];
    return def && (def.priority === 'PRIMARY_OBJECTIVE' || def.type === 'STORY_MISSION');
  });

  const primaryObjectiveId = primaryCandidate?.id ?? scoredList[0]?.id ?? null;

  // Next top 3 recommended (excluding primary)
  const recommendedActivityIds = scoredList
    .filter(item => item.id !== primaryObjectiveId)
    .slice(0, 3)
    .map(item => item.id);

  return {
    primaryObjectiveId,
    recommendedActivityIds,
  };
}

/**
 * Resolves an activity with idempotent reward application, outcome recording,
 * and long-term goal progression.
 */
export function resolveActivityOutcome(
  activityId: string,
  state: SimulationState,
  outcome: 'COMPLETED' | 'FAILED' | 'ABANDONED',
  catalogue: Record<string, ActivityDefinition> = AUTHORED_ACTIVITIES
): {
  nextState: SimulationState;
  payoutKobo: number;
  careerXpEarned: number;
  feedbackNotes: string;
} {
  const director = state.activityDirector;
  const def = catalogue[activityId];

  if (!director || !def) {
    return {
      nextState: state,
      payoutKobo: 0,
      careerXpEarned: 0,
      feedbackNotes: 'Activity not found in catalogue',
    };
  }

  const currentRuntime = director.activities[activityId] ?? {
    definitionId: activityId,
    status: 'AVAILABLE',
    discoveredAt: state.time.simulationTimeSeconds,
    objectives: def.objectives.map(o => ({ ...o })),
    progressPercentage: 0,
    rewardClaimed: false,
  };

  const simTime = state.time.simulationTimeSeconds;
  let nextPlayer = state.player;
  let nextCareer = state.career;
  let nextSkills = state.skills ? { ...state.skills } : undefined;
  const nextFlags = { ...state.flags };
  let payoutKobo = 0;
  let careerXpEarned = 0;
  let feedbackNotes = '';

  if (outcome === 'COMPLETED') {
    // Prevent double payout or reward duplication
    if (!currentRuntime.rewardClaimed) {
      payoutKobo = def.reward.payoutKobo;
      careerXpEarned = def.reward.careerXp;

      // Credit money
      if (payoutKobo > 0) {
        nextPlayer = creditPlayerMoney(nextPlayer, payoutKobo);
      }

      // Credit career XP
      if (nextCareer && careerXpEarned > 0) {
        nextCareer = {
          ...nextCareer,
          xp: nextCareer.xp + careerXpEarned,
        };
      }

      // Credit skill rewards
      if (nextSkills && def.reward.skillRewards) {
        for (const [skillId, xp] of Object.entries(def.reward.skillRewards)) {
          if (xp !== undefined && xp > 0) {
            const currentSkill = nextSkills[skillId as SkillId];
            if (currentSkill) {
              nextSkills[skillId as SkillId] = awardSkillXp(currentSkill, xp).nextState;
            }
          }
        }
      }

      // Set output flags
      if (def.reward.flagsToSet) {
        Object.assign(nextFlags, def.reward.flagsToSet);
      }

      feedbackNotes = `Successfully completed "${def.title}". Earned ₦${(payoutKobo / 100).toLocaleString()} and ${careerXpEarned} Career XP.`;
    } else {
      feedbackNotes = `Completed "${def.title}" (Reward previously claimed).`;
    }
  } else if (outcome === 'FAILED') {
    const penalty = def.consequences.penaltyKobo ?? 0;
    if (penalty > 0) {
      nextPlayer = debitPlayerMoney(nextPlayer, penalty);
      payoutKobo = -penalty;
    }
    if (def.consequences.flagsToSet) {
      Object.assign(nextFlags, def.consequences.flagsToSet);
    }
    feedbackNotes = `Activity failed. ${def.consequences.recoveryGuidance}`;
  } else {
    // ABANDONED — Clean recovery without penalizing career
    feedbackNotes = `Activity abandoned. Returned to available pool. ${def.consequences.recoveryGuidance}`;
  }

  // Update runtime state
  const updatedRuntime: ActivityRuntimeState = {
    ...currentRuntime,
    status: outcome,
    resolvedAt: simTime,
    rewardClaimed: outcome === 'COMPLETED' ? true : currentRuntime.rewardClaimed,
    resolutionNotes: feedbackNotes,
    score: outcome === 'COMPLETED' ? 100 : outcome === 'FAILED' ? 0 : 50,
  };

  // Add history record
  const historyRecord: ActivityEvaluationHistoryRecord = {
    activityId,
    title: def.title,
    resolvedAt: simTime,
    outcome,
    score: updatedRuntime.score ?? 0,
    rewardClaimed: updatedRuntime.rewardClaimed,
    payoutKobo,
    feedbackNotes,
  };

  // Update long-term goals
  const updatedGoals = director.longTermGoals.map(goal => {
    if (goal.isCompleted) return goal;
    let newProgress = goal.currentProgress;
    if (goal.id === 'goal_career_specialist' && nextCareer) {
      newProgress = nextCareer.currentLevel;
    } else if (goal.id === 'goal_reputation_master') {
      const rep = (state.bountyHub?.reputation.score ?? 120) + (def.reward.reputationPoints ?? 0);
      newProgress = rep;
    } else if (goal.id === 'goal_master_investigator' && outcome === 'COMPLETED') {
      newProgress = Math.min(goal.maxProgress, goal.currentProgress + 1);
    }
    return {
      ...goal,
      currentProgress: newProgress,
      isCompleted: newProgress >= goal.maxProgress,
    };
  });

  const updatedActivities = {
    ...director.activities,
    [activityId]: updatedRuntime,
  };

  // Re-prioritize opportunities
  const { primaryObjectiveId, recommendedActivityIds } = prioritizeOpportunities(
    { ...state, player: nextPlayer, career: nextCareer, skills: nextSkills, flags: nextFlags },
    { ...director, activities: updatedActivities },
    catalogue
  );

  const nextDirector: ActivityDirectorState = {
    ...director,
    activities: updatedActivities,
    activeActivityId: director.activeActivityId === activityId ? null : director.activeActivityId,
    primaryObjectiveId,
    recommendedActivityIds,
    completedHistory: [historyRecord, ...director.completedHistory],
    longTermGoals: updatedGoals,
    lastEvaluatedSimulationTime: simTime,
  };

  const nextState: SimulationState = {
    ...state,
    player: nextPlayer,
    career: nextCareer,
    skills: nextSkills,
    flags: nextFlags,
    activityDirector: nextDirector,
  };

  return {
    nextState,
    payoutKobo,
    careerXpEarned,
    feedbackNotes,
  };
}
