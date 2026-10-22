import { describe, it, expect, beforeEach } from 'vitest';
import { CAREER_PATHS, getCareerLevelDefinition } from '@/simulation/career/careerDefinitions';
import { JOB_LISTINGS } from '@/simulation/career/jobDefinitions';
import {
  AUTHORED_ACTIVITIES,
  createInitialActivityDirectorState,
} from '@/simulation/activities/activityCatalogue';
import {
  forensicsCommand,
  resetForensicsSessionState,
  getForensicsSessionState,
} from '@/simulation/cyber/terminal/forensicsCommand';
import {
  soctriageCommand,
  resetSocTriageSessionState,
  getSocTriageSessionState,
} from '@/simulation/cyber/terminal/soctriageCommand';
import {
  complianceauditCommand,
  resetComplianceAuditSessionState,
  getComplianceAuditSessionState,
} from '@/simulation/cyber/terminal/complianceauditCommand';
import { TerminalExecutionContext } from '@/simulation/cyber/terminal/types';

const mockContext: TerminalExecutionContext = {
  currentDirectory: '/home/analyst',
  simulationTime: {
    timeString: '09:00 AM',
    dateString: '2026-10-22',
    iso: '2026-10-22T08:00:00.000Z',
    year: 2026,
    month: 10,
    day: 22,
    hour: 9,
    minute: 0,
    second: 0,
    dayOfWeek: 'Thursday',
  },
  currentUser: {
    username: 'analyst',
    displayName: 'Amina Adebayo',
    role: 'Lead Security Analyst',
    organization: 'Cedarline Solutions Ltd.',
    accessTier: 2,
  },
  workstation: {
    id: 'ws-hero-01',
    hostname: 'cedar-ws-01',
    osVersion: 'CyberlifeOS 4.0',
    ipAddress: '10.0.4.15',
    subnet: '10.0.4.0/24',
    status: 'ONLINE',
    locationId: 'cedarline_interior',
  },
  history: [],
};

describe('Milestone 23 — Production Professions, Activities & Career Systems', () => {
  beforeEach(() => {
    resetForensicsSessionState();
    resetSocTriageSessionState();
    resetComplianceAuditSessionState();
  });

  describe('1. Career Path Definitions & Progression Framework', () => {
    it('registers the Security Consultant & Auditor career path with 3 distinct tiers', () => {
      const consultantPath = CAREER_PATHS.career_security_consultant;
      expect(consultantPath).toBeDefined();
      expect(consultantPath.id).toBe('career_security_consultant');
      expect(consultantPath.title).toContain('Cybersecurity Consulting');
      expect(consultantPath.levels.length).toBe(3);

      // Level 1: Associate Security Auditor
      const lvl1 = getCareerLevelDefinition('career_security_consultant', 1);
      expect(lvl1?.title).toBe('Associate Security Auditor');
      expect(lvl1?.minXp).toBe(0);
      expect(lvl1?.requiredSkillLevels.security_fundamentals).toBe(1);

      // Level 2: Senior Compliance Consultant
      const lvl2 = getCareerLevelDefinition('career_security_consultant', 2);
      expect(lvl2?.title).toBe('Senior Compliance Consultant');
      expect(lvl2?.minXp).toBe(120);
      expect(lvl2?.salaryBonusKobo).toBe(50_000);

      // Level 3: Principal Enterprise Security Advisor
      const lvl3 = getCareerLevelDefinition('career_security_consultant', 3);
      expect(lvl3?.title).toBe('Principal Enterprise Security Advisor');
      expect(lvl3?.minXp).toBe(320);
      expect(lvl3?.minCompletedJobs).toBe(4);
    });

    it('verifies existing Digital Forensics (Independent Investigator) and SOC (Sec Analyst) paths remain intact', () => {
      expect(CAREER_PATHS.career_independent_investigator).toBeDefined();
      expect(CAREER_PATHS.career_independent_investigator.levels.length).toBe(3);
      expect(CAREER_PATHS.career_sec_analyst).toBeDefined();
      expect(CAREER_PATHS.career_sec_analyst.levels.length).toBe(3);
    });
  });

  describe('2. Job Listings for Additional Professions', () => {
    it('defines the Digital Forensics timeline analysis job listing', () => {
      const job = JOB_LISTINGS.job_marina_forensic_timeline;
      expect(job).toBeDefined();
      expect(job!.employer).toContain('Marina');
      expect(job!.payoutKobo).toBe(180_000);
      expect(job!.careerXpReward).toBe(120);
      expect(job!.objectives.length).toBe(3);
      expect(job!.objectives.map(o => o.target)).toContain('forensics');
    });

    it('defines the Broad Street Interbank SOC triage job listing', () => {
      const job = JOB_LISTINGS.job_interbank_siem_triage;
      expect(job).toBeDefined();
      expect(job!.employer).toContain('Interbank');
      expect(job!.payoutKobo).toBe(200_000);
      expect(job!.careerXpReward).toBe(130);
      expect(job!.objectives.length).toBe(3);
      expect(job!.objectives.map(o => o.target)).toContain('soctriage');
    });

    it('defines the Paystack Partner Fintech Compliance audit job listing', () => {
      const job = JOB_LISTINGS.job_fintech_compliance_audit;
      expect(job).toBeDefined();
      expect(job!.employer).toContain('Compliance Alliance');
      expect(job!.payoutKobo).toBe(220_000);
      expect(job!.careerXpReward).toBe(140);
      expect(job!.objectives.length).toBe(3);
      expect(job!.objectives.map(o => o.target)).toContain('complianceaudit');
    });
  });

  describe('3. Authored Activities & Activity Director Integration', () => {
    it('registers all 3 M23 activities in AUTHORED_ACTIVITIES', () => {
      expect(AUTHORED_ACTIVITIES.act_forensics_marina_breach).toBeDefined();
      expect(AUTHORED_ACTIVITIES.act_soc_triage_interbank).toBeDefined();
      expect(AUTHORED_ACTIVITIES.act_audit_fintech_compliance).toBeDefined();
    });

    it('includes M23 activities in the initial recommended opportunities feed', () => {
      const directorState = createInitialActivityDirectorState(100);
      expect(directorState.recommendedActivityIds).toContain('act_forensics_marina_breach');
      expect(directorState.recommendedActivityIds).toContain('act_soc_triage_interbank');
      expect(directorState.recommendedActivityIds).toContain('act_audit_fintech_compliance');
    });

    it('validates activity objectives, rewards, and consequences follow invariants', () => {
      const forensics = AUTHORED_ACTIVITIES.act_forensics_marina_breach;
      expect(forensics).toBeDefined();
      expect(forensics!.type).toBe('INVESTIGATION');
      expect(forensics!.reward.payoutKobo).toBe(450_000);
      expect(forensics!.reward.careerXp).toBe(180);
      expect(forensics!.reward.flagsToSet).toHaveProperty('m23_forensics_completed', true);

      const soc = AUTHORED_ACTIVITIES.act_soc_triage_interbank;
      expect(soc).toBeDefined();
      expect(soc!.type).toBe('DEFENSIVE_OPERATION');
      expect(soc!.reward.payoutKobo).toBe(500_000);
      expect(soc!.reward.careerXp).toBe(190);
      expect(soc!.reward.flagsToSet).toHaveProperty('m23_soctriage_completed', true);

      const audit = AUTHORED_ACTIVITIES.act_audit_fintech_compliance;
      expect(audit).toBeDefined();
      expect(audit!.type).toBe('CAREER_ASSIGNMENT');
      expect(audit!.reward.payoutKobo).toBe(600_000);
      expect(audit!.reward.careerXp).toBe(210);
      expect(audit!.reward.flagsToSet).toHaveProperty('m23_complianceaudit_completed', true);
    });
  });

  describe('4. Digital Forensics Analyst Toolchain (forensics CLI)', () => {
    it('executes forensics list and catalogs mounted evidence', () => {
      const res = forensicsCommand.execute(['list'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('marina_exfil_usb.dd'))).toBe(true);
    });

    it('computes and verifies SHA-256 cryptographic hash of evidence image', () => {
      const res = forensicsCommand.execute(['hash', '/evidence/marina_exfil_usb.dd'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('MATCH 100%'))).toBe(true);
      expect(getForensicsSessionState().hashVerified).toBe(true);
    });

    it('blocks MFT timeline analysis if hash integrity was not verified first', () => {
      const res = forensicsCommand.execute(['mft'], mockContext);
      expect(res.isError).toBe(true);
      expect(res.stdout.some(l => l.includes('Evidence hash has not been verified'))).toBe(true);
    });

    it('analyzes MFT timeline and detects anti-forensic timestomping', () => {
      forensicsCommand.execute(['hash'], mockContext);
      const res = forensicsCommand.execute(['mft'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('TIMESTOMPED'))).toBe(true);
      expect(res.stdout.some(l => l.includes('marina_q3_manifest_exports.xlsx'))).toBe(true);
      expect(getForensicsSessionState().mftAnalyzed).toBe(true);
    });

    it('extracts exfiltrated payload from raw evidence bitstream', () => {
      forensicsCommand.execute(['hash'], mockContext);
      forensicsCommand.execute(['mft'], mockContext);
      const res = forensicsCommand.execute(['extract', 'transport_auth_tokens.kdbx'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('100% UNFRAGMENTED'))).toBe(true);
      expect(getForensicsSessionState().extractedFiles.length).toBeGreaterThan(0);
    });

    it('compiles and signs certified forensic disclosure report', () => {
      forensicsCommand.execute(['hash'], mockContext);
      forensicsCommand.execute(['mft'], mockContext);
      const res = forensicsCommand.execute(['report'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('CERTIFIED FORENSIC DISCLOSURE REPORT'))).toBe(true);
      expect(res.stdout.some(l => l.includes('ANTI-FORENSIC TAMPERING CONFIRMED'))).toBe(true);
      expect(getForensicsSessionState().reportSubmitted).toBe(true);
    });
  });

  describe('5. Security Operations Center (SOC) Triage Toolchain (soctriage CLI)', () => {
    it('displays the incoming SIEM telemetry alert queue', () => {
      const res = soctriageCommand.execute(['list'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('ALT-301'))).toBe(true);
      expect(res.stdout.some(l => l.includes('SSH_AUTH_BRUTE_FORCE_BURST'))).toBe(true);
    });

    it('inspects telemetry details for specific alerts', () => {
      const res = soctriageCommand.execute(['inspect', 'ALT-301'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('ALERT TELEMETRY DOSSIER: ALT-301'))).toBe(true);
      expect(res.stdout.some(l => l.includes('192.168.10.45'))).toBe(true);
    });

    it('assigns verdicts and dispatches containment actions across the queue', () => {
      soctriageCommand.execute(['verdict', 'ALT-301', 'tp'], mockContext);
      const actRes1 = soctriageCommand.execute(['action', 'ALT-301', 'isolate'], mockContext);
      expect(actRes1.isError).toBeFalsy();
      expect(actRes1.stdout.some(l => l.includes('VLAN port isolation triggered'))).toBe(true);

      soctriageCommand.execute(['verdict', 'ALT-302', 'tp'], mockContext);
      soctriageCommand.execute(['action', 'ALT-302', 'block_ip'], mockContext);

      soctriageCommand.execute(['verdict', 'ALT-303', 'fp'], mockContext);
      soctriageCommand.execute(['action', 'ALT-303', 'suppress'], mockContext);

      soctriageCommand.execute(['verdict', 'ALT-304', 'tp'], mockContext);
      soctriageCommand.execute(['action', 'ALT-304', 'isolate'], mockContext);

      const statusRes = soctriageCommand.execute(['status'], mockContext);
      expect(statusRes.stdout.some(l => l.includes('4 / 4'))).toBe(true);
    });

    it('blocks batch submission if any alerts are pending triage', () => {
      const res = soctriageCommand.execute(['submit'], mockContext);
      expect(res.isError).toBe(true);
      expect(res.stdout.some(l => l.includes('INCOMPLETE TRIAGE'))).toBe(true);
    });

    it('submits completed triage bundle and evaluates analyst accuracy', () => {
      soctriageCommand.execute(['verdict', 'ALT-301', 'tp'], mockContext);
      soctriageCommand.execute(['action', 'ALT-301', 'isolate'], mockContext);
      soctriageCommand.execute(['verdict', 'ALT-302', 'tp'], mockContext);
      soctriageCommand.execute(['action', 'ALT-302', 'block_ip'], mockContext);
      soctriageCommand.execute(['verdict', 'ALT-303', 'fp'], mockContext);
      soctriageCommand.execute(['action', 'ALT-303', 'suppress'], mockContext);
      soctriageCommand.execute(['verdict', 'ALT-304', 'tp'], mockContext);
      soctriageCommand.execute(['action', 'ALT-304', 'isolate'], mockContext);

      const submitRes = soctriageCommand.execute(['submit'], mockContext);
      expect(submitRes.isError).toBeFalsy();
      expect(submitRes.stdout.some(l => l.includes('TRIAGE ACCURACY:  100%'))).toBe(true);
      expect(submitRes.stdout.some(l => l.includes('INC-9042'))).toBe(true);
      expect(getSocTriageSessionState().submitted).toBe(true);
    });
  });

  describe('6. Cybersecurity Consultant & Compliance Auditor Toolchain (complianceaudit CLI)', () => {
    it('displays client audit scope and regulatory frameworks', () => {
      const res = complianceauditCommand.execute(['status'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('NDPR 2019, PCI-DSS v4.0'))).toBe(true);
      expect(res.stdout.some(l => l.includes('Paystack Partner'))).toBe(true);
    });

    it('scans individual and all control domains, discovering critical API secret leak', () => {
      const res = complianceauditCommand.execute(['scan', 'all'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('CRITICAL LEAK: Live production API secret'))).toBe(true);
      expect(res.stdout.some(l => l.includes('EXCESSIVE PRIVILEGE: Wildcard policy'))).toBe(true);
      expect(getComplianceAuditSessionState().domains.every(d => d.scanned)).toBe(true);
    });

    it('compiles Prioritized Remediation Action Matrix (PRAM)', () => {
      complianceauditCommand.execute(['scan', 'all'], mockContext);
      const res = complianceauditCommand.execute(['remediate'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('PRIORITIZED REMEDIATION ACTION MATRIX'))).toBe(true);
      expect(res.stdout.some(l => l.includes('CONDITIONAL LAUNCH APPROVAL'))).toBe(true);
      expect(getComplianceAuditSessionState().remediationCompiled).toBe(true);
    });

    it('rejects unqualified approval when critical vulnerability is active', () => {
      complianceauditCommand.execute(['scan', 'all'], mockContext);
      complianceauditCommand.execute(['remediate'], mockContext);
      const res = complianceauditCommand.execute(['sign', 'approved'], mockContext);
      expect(res.isError).toBe(true);
      expect(res.stdout.some(l => l.includes('Cannot grant unqualified "approved" verdict'))).toBe(true);
    });

    it('successfully signs conditional launch authorization with mandatory conditions', () => {
      complianceauditCommand.execute(['scan', 'all'], mockContext);
      complianceauditCommand.execute(['remediate'], mockContext);
      const res = complianceauditCommand.execute(['sign', 'conditional'], mockContext);
      expect(res.isError).toBeFalsy();
      expect(res.stdout.some(l => l.includes('OFFICIAL REGULATORY ATTESTATION CERTIFICATE'))).toBe(true);
      expect(res.stdout.some(l => l.includes('[CONDITIONAL LAUNCH AUTHORIZATION]'))).toBe(true);
      expect(getComplianceAuditSessionState().verdictSigned).toBe(true);
      expect(getComplianceAuditSessionState().finalDecision).toBe('conditional');
    });
  });

  describe('7. Safety Boundaries & Host Isolation', () => {
    it('guarantees zero host execution and safe reset behavior across all tools', () => {
      forensicsCommand.execute(['reset'], mockContext);
      soctriageCommand.execute(['reset'], mockContext);
      complianceauditCommand.execute(['reset'], mockContext);

      expect(getForensicsSessionState().hashVerified).toBe(false);
      expect(getSocTriageSessionState().submitted).toBe(false);
      expect(getComplianceAuditSessionState().verdictSigned).toBe(false);
    });
  });
});
