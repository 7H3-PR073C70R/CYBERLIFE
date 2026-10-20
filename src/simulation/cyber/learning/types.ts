/**
 * Cyberlife — Progressive Cybersecurity Learning Architecture Types
 *
 * Defines typed contracts for structuring learning modules, connecting
 * simulated tools to exercises, scenarios, evidence-based assessments,
 * and prerequisite progression paths.
 */

import { TeamTrack } from '../arsenal/types';

export type LearningProgressionStage =
  | 'beginner_concepts'
  | 'guided_practice'
  | 'independent_exercise'
  | 'evidence_assessment'
  | 'advanced_scenario'
  | 'cross_team_exercise';

export interface AssessmentCriterion {
  readonly id: string;
  readonly description: string;
  readonly maxScore: number;
  readonly requiredForPassing: boolean;
  readonly validationMethod:
    'flag_match' | 'hash_verification' | 'action_dispatch' | 'finding_submission';
}

export interface CommonMistake {
  readonly mistakeSummary: string;
  readonly whyItHappens: string;
  readonly howToAvoid: string;
}

export interface CyberLearningModule {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly teamTrack: TeamTrack;
  readonly stage: LearningProgressionStage;
  readonly estimatedMinutes: number;

  // Curriculum & Alignment
  readonly learningObjectives: readonly string[];
  readonly prerequisiteModuleIds: readonly string[];
  readonly requiredSkillIds: readonly string[];
  readonly relevantToolIds: readonly string[];

  // Practical Exercise Integration
  readonly linkedExerciseId?: string;
  readonly linkedScenarioName?: string;
  readonly expectedEvidenceType: string;

  // Assessment & Feedback
  readonly assessmentCriteria: readonly AssessmentCriterion[];
  readonly commonMistakes: readonly CommonMistake[];
  readonly completionCriteria: string;

  // Real-world Context
  readonly careerPathRelevance: string;
}
