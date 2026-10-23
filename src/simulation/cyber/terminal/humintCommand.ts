/**
 * Cyberlife — Milestone 24: Human Intelligence (HUMINT) & Physical Security CLI
 *
 * Terminal interface for M21 human-centered security operations:
 * - Witness interview status & testimony inspection
 * - Contradiction analysis between testimony and physical badge records
 * - Third-party vendor access request & social engineering indicators
 * - Physical facility checkpoint examination & finding triage
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated in-memory state. Zero host access or external execution.
 */

import { TerminalCommandHandler, TerminalCommandResult, TerminalExecutionContext } from './types';
import {
  SCENARIO_A_MARCUS_QUESTIONS,
  SCENARIO_A_AMINA_QUESTIONS,
  SCENARIO_B_VENDOR_MESSAGE,
  SCENARIO_C_INSPECTABLE_OBJECTS,
  SCENARIO_C_EXPECTED_FINDINGS,
  M21_SCENARIO_A_EVIDENCE,
} from '../../humanIntel/scenarioData';

export const humintCommand: TerminalCommandHandler = {
  name: 'humint',
  description: 'Human intelligence (HUMINT) interviews, vendor social engineering triage, and physical security audit.',
  usage: 'humint [status | interview [marcus|amina] | vendor | inspect [checkpoint] | report]',
  execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    const sub = args[0]?.toLowerCase() ?? 'status';

    if (sub === 'status') {
      return {
        stdout: [
          '========================================================================================',
          '               CEDARLINE INFOSEC // HUMAN INTELLIGENCE & PHYSICAL SECURITY',
          '========================================================================================',
          `OPERATOR:         ${context.currentUser.displayName} (${context.currentUser.role})`,
          `ACTIVE SCENARIO:  The Server Room Discrepancy (Floor 4 Room 4B)`,
          '----------------------------------------------------------------------------------------',
          'HUMINT INVESTIGATION SUMMARY:',
          '  * Witness 1: Barry — Junior Infra Admin [Alibi vs. Badge Log Discrepancy]',
          '  * Witness 2: Blessing — Lead Security Analyst [Corroboration & Policy 4.2]',
          '  * Physical Access Record: Credential CED-2026-B-0247 swiped Tuesday 19:47 UTC',
          '',
          'AVAILABLE SUBCOMMANDS:',
          '  humint interview [barry|blessing]  View witness testimony and interview logs',
          '  humint vendor                     Inspect third-party vendor request email & red flags',
          '  humint inspect [checkpoint]       Examine physical lobby/corridor security controls',
          '  humint report                     View physical security assessment findings & status',
          '========================================================================================',
        ],
      };
    }

    if (sub === 'interview') {
      const target = args[1]?.toLowerCase();
      if (!target || target === 'barry' || target === 'marcus' || target === 'tobi') {
        return {
          stdout: [
            '=== Witness Interview Record: Barry (Junior Infra Admin) ===',
            'Subject: Barry (Credential: CED-2026-B-0247)',
            'Location: Marina Tower / Server Enclosure Corridor',
            '----------------------------------------------------------------------------------------',
            ...SCENARIO_A_MARCUS_QUESTIONS.map(q => [
              `[Q] "${q.questionText}"`,
              `[A] "${q.responseText}" (Reliability: ${q.reliability})`,
              '',
            ]).flat(),
            'KEY CONTRADICTION IDENTIFIED:',
            '  * Initial claim: Left building at 18:00 UTC.',
            '  * Badge log: Credential recorded at Room 4B reader at 19:47 UTC.',
            '  * Admitted explanation: Lent badge and PIN to Michael for emergency patch cable.',
            '  * Policy breach: Violates Cedarline Physical Security Policy Section 4.2.',
          ],
        };
      }

      if (target === 'blessing' || target === 'amina') {
        return {
          stdout: [
            '=== Witness Interview Record: Blessing (Lead Security Analyst) ===',
            'Subject: Blessing',
            'Location: Cedarline Corporate SOC Workstation 04',
            '----------------------------------------------------------------------------------------',
            ...SCENARIO_A_AMINA_QUESTIONS.map(q => [
              `[Q] "${q.questionText}"`,
              `[A] "${q.responseText}" (Reliability: ${q.reliability})`,
              '',
            ]).flat(),
            'POLICY CLARIFICATION:',
            '  * Cedarline Physical Security Policy Section 4.2: Credentials are strictly non-transferable.',
          ],
        };
      }

      return {
        isError: true,
        stdout: [`Unknown witness "${target}". Available: marcus, amina`],
      };
    }

    if (sub === 'vendor') {
      return {
        stdout: [
          '========================================================================================',
          '           INCOMING SECURE MAIL: TELEKRON POWER SYSTEMS NIGERIA',
          '========================================================================================',
          `FROM:    ${SCENARIO_B_VENDOR_MESSAGE.sender}`,
          `SUBJECT: ${SCENARIO_B_VENDOR_MESSAGE.subject}`,
          '----------------------------------------------------------------------------------------',
          SCENARIO_B_VENDOR_MESSAGE.body,
          '----------------------------------------------------------------------------------------',
          'DECEPTION & RED FLAG ANALYSIS:',
          ...SCENARIO_B_VENDOR_MESSAGE.spoofIndicators.map(
            ind => `  [!] ${ind.indicator.padEnd(46)} -> ${ind.detail}`
          ),
          '',
          'RECOMMENDED RESPONSE:',
          '  Verify through Facilities Management, deny unescorted access, and report sender to SOC.',
          '========================================================================================',
        ],
      };
    }

    if (sub === 'inspect') {
      const targetObj = args[1]?.toLowerCase();
      if (!targetObj) {
        return {
          stdout: [
            '=== Physical Facility Checkpoints (Cedarline HQ Ground Lobby) ===',
            'Checkpoints available for inspection:',
            ...SCENARIO_C_INSPECTABLE_OBJECTS.map(
              obj => `  * ${obj.id.padEnd(30)} [${obj.category}] - ${obj.displayName}`
            ),
            '',
            'Run "humint inspect <checkpoint-id>" to examine specific physical control.',
          ],
        };
      }

      const match = SCENARIO_C_INSPECTABLE_OBJECTS.find(
        o => o.id.toLowerCase().includes(targetObj) || o.displayName.toLowerCase().includes(targetObj)
      );

      if (!match) {
        return {
          isError: true,
          stdout: [`Unknown checkpoint "${targetObj}". Run "humint inspect" to view list.`],
        };
      }

      return {
        stdout: [
          `=== Physical Security Inspection: ${match.displayName} ===`,
          `Category:     ${match.category}`,
          `Location:     ${match.locationId}`,
          `Description:  ${match.examineDescription}`,
          '',
          `Observation Template:`,
          `  ${match.observationTemplate.description}`,
        ],
      };
    }

    if (sub === 'report') {
      return {
        stdout: [
          '========================================================================================',
          '           CEDARLINE SOLUTIONS // PHYSICAL SECURITY AUDIT SCORECARD',
          '========================================================================================',
          'FACILITY:         Cedarline Solutions HQ (Ground Lobby & Restricted Corridor)',
          'AUTHORIZATION:    FAC-AUTH-2026-PHYS-01',
          'EXPECTED FINDINGS:',
          ...SCENARIO_C_EXPECTED_FINDINGS.map(
            (f, i) => `  ${i + 1}. [${f.severity}] ${f.title.padEnd(40)} (Ref: ${f.policyReference})`
          ),
          '',
          'EVIDENCE VAULT RECORD:',
          `  * ${M21_SCENARIO_A_EVIDENCE[0].title} (SHA-256: ${M21_SCENARIO_A_EVIDENCE[0].hash.substring(0, 16)}...)`,
          '========================================================================================',
        ],
      };
    }

    return {
      isError: true,
      stdout: [`Unknown humint subcommand "${sub}". Run "help humint" for usage.`],
    };
  },
};
