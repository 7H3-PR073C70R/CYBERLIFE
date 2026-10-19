/**
 * Cyberlife — Milestone 8: Career, Economy, Skills & Life Simulation Types
 */

export type CareerPathId =
  'career_it_support' | 'career_sec_analyst' | 'career_red_sec' | 'career_purple_sec';

export interface CareerLevelDefinition {
  readonly level: number;
  readonly title: string;
  readonly description: string;
  readonly minXp: number;
  readonly requiredSkillLevels: Readonly<Record<string, number>>;
  readonly minCompletedJobs: number;
  readonly salaryBonusKobo: number;
}

export interface CareerPathDefinition {
  readonly id: CareerPathId;
  readonly title: string;
  readonly description: string;
  readonly issuingOrg: string;
  readonly levels: ReadonlyArray<CareerLevelDefinition>;
}

export interface CareerState {
  readonly currentPathId: CareerPathId;
  readonly currentLevel: number;
  readonly roleTitle: string;
  readonly employer: string;
  readonly xp: number;
  readonly promotionsEarned: number;
  readonly promotionEligible: boolean;
}

export type SkillId =
  | 'log_analysis'
  | 'network_fundamentals'
  | 'incident_response'
  | 'security_fundamentals'
  | 'evidence_handling'
  | 'reporting'
  | 'troubleshooting'
  | 'attack_simulation'
  | 'detection_engineering';

export interface SkillDefinition {
  readonly id: SkillId;
  readonly name: string;
  readonly description: string;
  readonly maxLevel: number;
}

export interface SkillState {
  readonly id: SkillId;
  readonly level: number; // 1 to 10
  readonly xp: number; // XP within current level (e.g. 0-99, 100 XP per level)
  readonly totalXp: number;
}

export type JobStatus = 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export type JobObjectiveType =
  'RUN_TOOL' | 'RECORD_FINDING' | 'PRESERVE_EVIDENCE' | 'VERIFY_SERVICE' | 'SUBMIT_REPORT';

export interface JobObjective {
  readonly id: string;
  readonly type: JobObjectiveType;
  readonly description: string;
  readonly target?: string;
  readonly isCompleted: boolean;
}

export interface JobListing {
  readonly id: string;
  readonly title: string;
  readonly employer: string;
  readonly contactNpcId?: string;
  readonly description: string;
  readonly minCareerLevel: number;
  readonly requiredSkills: Readonly<Record<string, number>>;
  readonly payoutKobo: number;
  readonly careerXpReward: number;
  readonly skillRewards: Readonly<Record<string, number>>;
  readonly estimatedMinutes: number;
  readonly objectives: ReadonlyArray<JobObjective>;
  readonly isRepeatable: boolean;
}

export interface JobAssignment {
  readonly listingId: string;
  readonly acceptedAtSimulationSeconds: number;
  readonly objectives: ReadonlyArray<JobObjective>;
}

export interface JobEvaluationRecord {
  readonly jobId: string;
  readonly title: string;
  readonly employer: string;
  readonly completedAtSimulationSeconds: number;
  readonly payoutKobo: number;
  readonly careerXpEarned: number;
  readonly performanceRating: 'EXEMPLARY' | 'PROFICIENT' | 'ACCEPTABLE';
  readonly feedbackNotes: string;
}

export interface JobBoardState {
  readonly availableJobIds: ReadonlyArray<string>;
  readonly activeJobs: ReadonlyArray<JobAssignment>;
  readonly completedJobHistory: ReadonlyArray<JobEvaluationRecord>;
}

export type TransactionType = 'INITIAL_BALANCE' | 'JOB_PAYOUT' | 'PURCHASE' | 'EXPENSE' | 'REFUND';

export interface FinancialTransaction {
  readonly id: string;
  readonly type: TransactionType;
  readonly amountKobo: number; // Always positive integer
  readonly direction: 'CREDIT' | 'DEBIT';
  readonly balanceAfterKobo: number;
  readonly timestamp: number; // Simulation time seconds
  readonly description: string;
  readonly relatedEntityId?: string;
}

export interface RecurringExpense {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly amountKobo: number;
  readonly intervalSeconds: number;
  readonly lastChargedSimulationTime: number;
  readonly nextDueSimulationTime: number;
  readonly isOverdue: boolean;
}

export interface EconomyState {
  readonly transactions: ReadonlyArray<FinancialTransaction>;
  readonly recurringExpenses: ReadonlyArray<RecurringExpense>;
}

export interface ShopItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priceKobo: number;
  readonly category: 'EQUIPMENT' | 'DOCUMENT' | 'CONSUMABLE';
  readonly maxOwnership: number;
  readonly gameplayPerk: string;
}
