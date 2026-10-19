import { DialogueGraph } from '../../simulation/narrative/dialogueTypes';

export const AMINA_DIALOGUE_GRAPH: DialogueGraph = {
  npcId: 'npc_amina',
  defaultNodeId: 'amina_greeting',
  getInitialNodeId: context => {
    if (context.missionPhase === 'completed') {
      return 'amina_mission_completed';
    }
    if (context.missionPhase === 'verification' || context.missionPhase === 'reporting') {
      return 'amina_remediation_progress';
    }
    if (context.memory.met && context.memory.conversationCount > 0) {
      return 'amina_returning';
    }
    return 'amina_greeting';
  },
  nodes: {
    amina_greeting: {
      id: 'amina_greeting',
      speakerId: 'npc_amina',
      text: 'Tade, welcome to the SOC. We have an active incident underway. Our telemetry flagged unauthorized SMB file queries originating from app-portal-01 targeting filesrv-01 at 07:42. The queries came from svc-aster, our AI assistant service account. We need you on this immediately.',
      choices: [
        {
          id: 'amina_greet_procedure',
          text: 'What are our immediate priorities under incident response protocol?',
          nextNodeId: 'amina_priorities',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Amina approves of your focus on formal protocol.',
            },
            {
              type: 'RECORD_MEMORY',
              topic: 'incident_priorities',
              fact: 'Amina stressed following the formal lifecycle: triage, evidence preservation, containment, remediation, and verification.',
            },
          ],
        },
        {
          id: 'amina_greet_marcus',
          text: 'Who provisioned svc-aster? Should I speak with infrastructure first?',
          nextNodeId: 'amina_marcus_hint',
          actions: [
            {
              type: 'RECORD_MEMORY',
              topic: 'marcus_role',
              fact: 'Amina pointed out Marcus Adebayo configured the credentials under extreme pressure.',
            },
          ],
        },
        {
          id: 'amina_greet_workstation',
          text: 'Understood. I will log into my workstation terminal and begin triage.',
          nextNodeId: 'amina_exit_workstation',
        },
      ],
    },
    amina_returning: {
      id: 'amina_returning',
      speakerId: 'npc_amina',
      text: 'Good to see you back, Tade. How is the investigation progressing on app-portal-01?',
      choices: [
        {
          id: 'amina_return_advice',
          text: 'Could you refresh me on the key investigation tools available on my terminal?',
          nextNodeId: 'amina_tools_guide',
        },
        {
          id: 'amina_return_marcus',
          text: 'Have you spoken with Marcus recently? He seemed anxious when I walked past his rack.',
          nextNodeId: 'amina_marcus_hint',
        },
        {
          id: 'amina_return_containment',
          text: 'I am auditing the IAM credentials and service configuration now.',
          nextNodeId: 'amina_exit_workstation',
        },
        {
          id: 'amina_ask_career',
          text: 'Amina, what are Cedarline’s expectations for advancing to Junior SOC Analyst?',
          nextNodeId: 'amina_career_guidance',
        },
        {
          id: 'amina_ask_triage_job',
          text: 'Are there any active internal SOC tickets available for triage?',
          nextNodeId: 'amina_job_offer_triage',
        },
        {
          id: 'amina_praise_triage_completed',
          text: 'I completed the internal ticket triaging the svc-aster credential spike.',
          nextNodeId: 'amina_job_triage_feedback',
          condition: {
            requiredCompletedJobId: 'job_cedarline_triage',
          },
        },
      ],
    },
    amina_career_guidance: {
      id: 'amina_career_guidance',
      speakerId: 'npc_amina',
      text: 'To qualify for Junior SOC Analyst, you must demonstrate real execution across at least 2 verified incident tickets, achieve 100 Career XP, and raise your Log Analysis, Network Fundamentals, and Security Governance skills to Level 2. Once eligible, you can submit your advancement request through your Workstation Career Portal.',
      choices: [
        {
          id: 'amina_guidance_ack',
          text: 'Understood, Amina. I will review active listings on the Career dashboard.',
          nextNodeId: 'amina_exit_workstation',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Amina appreciates your career ambition and disciplined approach.',
            },
          ],
        },
      ],
    },
    amina_job_offer_triage: {
      id: 'amina_job_offer_triage',
      speakerId: 'npc_amina',
      text: 'Yes! We have an internal Cedarline ticket: "Triage svc-aster Credential Spike". You will need to inspect authentication logs and record the unauthorized service account anomaly. It pays ₦750.00 upon verified completion.',
      choices: [
        {
          id: 'amina_accept_triage',
          text: 'I accept this ticket. I will examine the authentication logs immediately.',
          nextNodeId: 'amina_exit_workstation',
          actions: [
            {
              type: 'ACCEPT_JOB',
              jobId: 'job_cedarline_triage',
            },
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Amina is pleased with your readiness to take on internal tickets.',
            },
          ],
        },
        {
          id: 'amina_decline_triage',
          text: 'Let me finish my current workstation tasks first.',
          nextNodeId: 'amina_exit_workstation',
        },
      ],
    },
    amina_job_triage_feedback: {
      id: 'amina_job_triage_feedback',
      speakerId: 'npc_amina',
      text: 'Outstanding work on that ticket, Tade. Your log analysis was clean and the findings matched our authoritative telemetry. Keep this up and a promotion to Junior SOC Analyst will be well within reach.',
      choices: [
        {
          id: 'amina_triage_ack',
          text: 'Thank you, Amina. On to the next challenge.',
          nextNodeId: 'amina_exit_workstation',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Shared satisfaction in closing a critical security ticket.',
            },
          ],
        },
      ],
    },
    amina_priorities: {
      id: 'amina_priorities',
      speakerId: 'npc_amina',
      text: 'First: preserve digital forensic evidence before modifying anything. Inspect the suspicious auth logs and snapshot Aster’s configuration. Second: execute containment to isolate the host or revoke rogue access. Third: remediate the IAM policy to kb-assistant so legitimate documentation queries continue while file share access is revoked.',
      choices: [
        {
          id: 'amina_prio_ack',
          text: 'Methodical and safe. I will ensure the evidence hash is verified first.',
          nextNodeId: 'amina_exit_workstation',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Amina values your commitment to forensic integrity.',
            },
          ],
        },
        {
          id: 'amina_prio_tools',
          text: 'Which terminal commands should I start with?',
          nextNodeId: 'amina_tools_guide',
        },
      ],
    },
    amina_marcus_hint: {
      id: 'amina_marcus_hint',
      speakerId: 'npc_amina',
      text: 'Marcus configured the svc-aster credentials three weeks ago during our sprint crunch. Be gentle with him, Tade. He is terrified management will make him the scapegoat. If you approach him constructively, he will tell you the truth.',
      choices: [
        {
          id: 'amina_marcus_promise',
          text: 'Understood. I am here to uncover system facts, not blame individuals.',
          nextNodeId: 'amina_exit_workstation',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Amina appreciates your blameless post-mortem mindset.',
            },
            {
              type: 'RECORD_MEMORY',
              topic: 'blameless_culture_commitment',
              fact: 'You promised Amina to treat Marcus with empathy and focus on root cause.',
            },
          ],
        },
      ],
    },
    amina_tools_guide: {
      id: 'amina_tools_guide',
      speakerId: 'npc_amina',
      text: "On your workstation, use 'netmap hosts' to discover network topology, 'svcscan inspect app-portal-01' to check running services, 'logview recent' to review authentication telemetry, and 'evidence list' to inspect forensic artifacts. The Incident Portal app will guide your formal reporting.",
      choices: [
        {
          id: 'amina_tools_ack',
          text: 'Thank you, Amina. Returning to the workstation now.',
          nextNodeId: 'amina_exit_workstation',
        },
      ],
    },
    amina_remediation_progress: {
      id: 'amina_remediation_progress',
      speakerId: 'npc_amina',
      text: 'I saw your containment and remediation telemetry come through the console. Great work isolating the excessive role! Now run the automated verification suite to prove file share access is blocked while documentation search remains healthy.',
      choices: [
        {
          id: 'amina_rem_ack',
          text: 'On it. I will finalize the Incident Report once verification passes.',
          nextNodeId: 'amina_exit_workstation',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Amina is impressed with your swift incident handling.',
            },
          ],
        },
      ],
    },
    amina_mission_completed: {
      id: 'amina_mission_completed',
      speakerId: 'npc_amina',
      text: 'Outstanding work on the Aster Incident, Tade! Your formal report was approved by executive leadership, and the bounty payout was credited to your account. You handled both the technical investigation and team communication with distinction.',
      choices: [
        {
          id: 'amina_comp_ack',
          text: 'Thank you for your guidance throughout the incident, Amina.',
          nextNodeId: 'amina_exit_workstation',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Shared mutual respect for a successfully resolved critical incident.',
            },
          ],
        },
      ],
    },
    amina_exit_workstation: {
      id: 'amina_exit_workstation',
      speakerId: 'npc_amina',
      text: 'Keep your comms open and notify me if telemetry shifts. Good hunting.',
      choices: [],
      isTerminal: true,
    },
  },
};

export const MARCUS_DIALOGUE_GRAPH: DialogueGraph = {
  npcId: 'npc_marcus',
  defaultNodeId: 'marcus_greeting',
  getInitialNodeId: context => {
    if (context.memory.met && context.memory.topicsDiscussed.includes('marcus_confession')) {
      return 'marcus_post_confession';
    }
    if (context.memory.met && context.memory.topicsDiscussed.includes('marcus_defensive')) {
      return 'marcus_guarded';
    }
    return 'marcus_greeting';
  },
  nodes: {
    marcus_greeting: {
      id: 'marcus_greeting',
      speakerId: 'npc_marcus',
      text: 'Tade! Hey... are you here about the alert? Look, I... I’ve just been doing routine storage maintenance on filesrv-01. Everything is fine here! Why is everyone looking over at my server rack?',
      choices: [
        {
          id: 'marcus_empathy',
          text: 'Marcus, breathe. I am investigating anomalous queries from svc-aster. I am here to fix the system configuration, not hunt for a scapegoat.',
          nextNodeId: 'marcus_relief',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 15,
              reason: 'Marcus feels immense relief that you are not blaming him.',
            },
            {
              type: 'RECORD_MEMORY',
              topic: 'marcus_confession',
              fact: 'Marcus confessed he assigned corporate-admin wildcard permissions under extreme launch deadline pressure.',
            },
          ],
        },
        {
          id: 'marcus_accusation',
          text: 'Did you provision svc-aster? If you gave it unauthorized permissions, management will want an explanation.',
          nextNodeId: 'marcus_defensive_node',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: -20,
              reason: 'Marcus feels attacked and retreats into defensive secrecy.',
            },
            {
              type: 'RECORD_MEMORY',
              topic: 'marcus_defensive',
              fact: 'Marcus clammed up after feeling threatened regarding policy violations.',
            },
          ],
        },
        {
          id: 'marcus_technical_query',
          text: 'Can you tell me how svc-aster was bound to the local network?',
          nextNodeId: 'marcus_technical_info',
        },
      ],
    },
    marcus_relief: {
      id: 'marcus_relief',
      speakerId: 'npc_marcus',
      text: 'God... thank you, Tade. You don’t know what kind of pressure executive management put on us. Aster kept throwing 403 permission errors on search indexes three nights before launch. I... I gave svc-aster the corporate-admin role just so the demo would work. I swear I meant to revoke it the next Monday, but then the Lagos fiber outage happened and I forgot!',
      choices: [
        {
          id: 'marcus_help_log',
          text: 'Where should I look in the logs to confirm the scope of access?',
          nextNodeId: 'marcus_log_tip',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Marcus appreciates your calm, constructive follow-up.',
            },
          ],
        },
        {
          id: 'marcus_reassure',
          text: 'We will document this as an architectural policy gap and fix the role definition. Don’t worry.',
          nextNodeId: 'marcus_exit_friendly',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 10,
              reason: 'Marcus deeply respects your integrity and support.',
            },
          ],
        },
      ],
    },
    marcus_log_tip: {
      id: 'marcus_log_tip',
      speakerId: 'npc_marcus',
      text: 'Check LOG-2026-107B in the security log audit! It shows the exact timestamp Aster queried filesrv-01 over SMB port 445 searching for confidential payroll spreadsheets. Once you remediate Aster’s role back to kb-assistant, that port access will be blocked.',
      choices: [
        {
          id: 'marcus_log_ack',
          text: 'That is exactly the forensic clue I needed. Thank you, Marcus.',
          nextNodeId: 'marcus_exit_friendly',
        },
      ],
    },
    marcus_defensive_node: {
      id: 'marcus_defensive_node',
      speakerId: 'npc_marcus',
      text: 'I followed the deployment checklist signed off by the engineering lead! If there’s an issue, talk to Dr. Chen or Femi Martins. I don’t have time to answer interrogations when my servers need maintenance.',
      choices: [
        {
          id: 'marcus_def_backoff',
          text: 'Fine, I will review the system audit logs myself.',
          nextNodeId: 'marcus_exit_guarded',
        },
      ],
    },
    marcus_technical_info: {
      id: 'marcus_technical_info',
      speakerId: 'npc_marcus',
      text: 'svc-aster runs inside a container on app-portal-01 (10.0.4.15). It has network routes to both the corporate doc repository and the internal file server subnet (10.0.4.0/24). If its token has wildcard permissions, it can hit anything on that segment.',
      choices: [
        {
          id: 'marcus_tech_ack',
          text: 'Good to know. I will verify the token scopes on the terminal.',
          nextNodeId: 'marcus_exit_neutral',
        },
      ],
    },
    marcus_post_confession: {
      id: 'marcus_post_confession',
      speakerId: 'npc_marcus',
      text: 'Hey Tade. I’m monitoring the container restart. Thanks again for not throwing me under the bus earlier. Did you manage to revoke that wildcard policy on app-portal-01?',
      choices: [
        {
          id: 'marcus_post_ack',
          text: 'Working on containment and policy remediation now. Hang in there.',
          nextNodeId: 'marcus_exit_friendly',
        },
      ],
    },
    marcus_guarded: {
      id: 'marcus_guarded',
      speakerId: 'npc_marcus',
      text: 'I told you, Tade, speak to management if you have questions. I’m doing my job here.',
      choices: [
        {
          id: 'marcus_guarded_leave',
          text: 'Understood. Returning to investigation.',
          nextNodeId: 'marcus_exit_guarded',
        },
      ],
    },
    marcus_exit_friendly: {
      id: 'marcus_exit_friendly',
      speakerId: 'npc_marcus',
      text: 'I owe you one, Tade. If you need any server logs exported, just let me know.',
      choices: [],
      isTerminal: true,
    },
    marcus_exit_neutral: {
      id: 'marcus_exit_neutral',
      speakerId: 'npc_marcus',
      text: 'Let me know what you find in the logs.',
      choices: [],
      isTerminal: true,
    },
    marcus_exit_guarded: {
      id: 'marcus_exit_guarded',
      speakerId: 'npc_marcus',
      text: 'Right. I have work to do.',
      choices: [],
      isTerminal: true,
    },
  },
};

export const ELENA_DIALOGUE_GRAPH: DialogueGraph = {
  npcId: 'npc_elena',
  defaultNodeId: 'elena_greeting',
  getInitialNodeId: context => {
    if (context.memory.met && context.memory.conversationCount > 0) {
      return 'elena_returning';
    }
    return 'elena_greeting';
  },
  nodes: {
    elena_greeting: {
      id: 'elena_greeting',
      speakerId: 'npc_elena',
      text: 'Hello. I assume you are the security analyst looking into Aster’s query anomalies? Before anyone jumps to conclusions: Aster’s model architecture is sound. The issue is how external inputs map to tool calls when permissions are unconstrained.',
      choices: [
        {
          id: 'elena_ask_architecture',
          text: 'Explain how Aster decides which tools to invoke when processing user prompts.',
          nextNodeId: 'elena_explain_tools',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 10,
              reason: 'Dr. Chen appreciates your interest in the AI system architecture.',
            },
            {
              type: 'RECORD_MEMORY',
              topic: 'aster_agent_architecture',
              fact: 'Dr. Chen explained Aster uses an autonomous tool-calling loop that executes tools based on prompt semantic matching.',
            },
          ],
        },
        {
          id: 'elena_ask_injection',
          text: 'Could an employee have tricked Aster with a prompt injection to access confidential payroll?',
          nextNodeId: 'elena_explain_injection',
          actions: [
            {
              type: 'RECORD_MEMORY',
              topic: 'prompt_injection_hypothesis',
              fact: 'Dr. Chen confirmed prompt injection or loose prompting could cause Aster to search out-of-scope resources.',
            },
          ],
        },
        {
          id: 'elena_dismissive',
          text: 'If an AI assistant can raid the payroll server, it shouldn’t have been deployed.',
          nextNodeId: 'elena_defensive',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: -15,
              reason: 'Dr. Chen bristles at dismissive attitudes toward AI engineering.',
            },
          ],
        },
      ],
    },
    elena_returning: {
      id: 'elena_returning',
      speakerId: 'npc_elena',
      text: 'Back again, Tade. Have you had a chance to inspect Aster’s tool permissions in the terminal?',
      choices: [
        {
          id: 'elena_ret_remediation',
          text: 'What is the recommended policy role to ensure Aster stays strictly within knowledge base boundaries?',
          nextNodeId: 'elena_remediation_advice',
        },
        {
          id: 'elena_ret_leave',
          text: 'Still conducting the triage. I will update you soon.',
          nextNodeId: 'elena_exit',
        },
      ],
    },
    elena_explain_tools: {
      id: 'elena_explain_tools',
      speakerId: 'npc_elena',
      text: 'Aster runs an agent loop: it receives user queries, parses intents, and autonomously generates API calls. Its intended role is kb-assistant with docs:read and kb:search scopes. But if the operating environment gives its service account wildcard privileges, the model will faithfully execute whatever search queries its reasoning tree explores—including scanning SMB network shares.',
      choices: [
        {
          id: 'elena_tools_remediation',
          text: 'So if we tighten its role back to kb-assistant, the agent loop remains useful without risk?',
          nextNodeId: 'elena_remediation_advice',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Dr. Chen is glad you understand least-privilege containment.',
            },
          ],
        },
      ],
    },
    elena_explain_injection: {
      id: 'elena_explain_injection',
      speakerId: 'npc_elena',
      text: 'Precisely. An ambiguous prompt like "find all Q3 financial compensation reports" caused Aster’s semantic planner to branch out beyond knowledge base articles into corporate file shares. But the fundamental defense is never prompt filtering alone—it is hard operating system authorization boundaries.',
      choices: [
        {
          id: 'elena_inj_defense',
          text: 'Agreed. Security in depth: sandbox the credentials, don’t rely solely on model prompts.',
          nextNodeId: 'elena_remediation_advice',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Shared alignment on security-in-depth principles.',
            },
          ],
        },
      ],
    },
    elena_defensive: {
      id: 'elena_defensive',
      speakerId: 'npc_elena',
      text: 'Every technology poses risk when operational controls are neglected. A database administrator with root access can drop tables—we don’t ban databases, we implement access control. The same applies to autonomous agents.',
      choices: [
        {
          id: 'elena_def_pivot',
          text: 'Fair point. Let’s focus on implementing proper access controls.',
          nextNodeId: 'elena_remediation_advice',
        },
      ],
    },
    elena_remediation_advice: {
      id: 'elena_remediation_advice',
      speakerId: 'npc_elena',
      text: 'When you apply remediation, assign role "kb-assistant", revoke SMB port access, revoke database access, and restrict scopes to docs:read and kb:search. That will keep Aster operating safely for internal documentation without touching confidential financial servers.',
      choices: [
        {
          id: 'elena_rem_ack',
          text: 'Clear and actionable advice. Thank you, Dr. Chen.',
          nextNodeId: 'elena_exit',
        },
      ],
    },
    elena_exit: {
      id: 'elena_exit',
      speakerId: 'npc_elena',
      text: 'Let me know when verification passes. I want to see the audit logs myself.',
      choices: [],
      isTerminal: true,
    },
  },
};

export const FEMI_DIALOGUE_GRAPH: DialogueGraph = {
  npcId: 'npc_femi',
  defaultNodeId: 'femi_greeting',
  getInitialNodeId: context => {
    if (context.missionPhase === 'completed') {
      return 'femi_completed';
    }
    if (context.memory.met && context.memory.conversationCount > 0) {
      return 'femi_returning';
    }
    return 'femi_greeting';
  },
  nodes: {
    femi_greeting: {
      id: 'femi_greeting',
      speakerId: 'npc_femi',
      text: 'You’re Vance, the contract analyst? Good. I don’t have time for sugar-coating: Cedarline has three Tier-1 commercial banking integrations running through this infrastructure. If this incident causes customer data leakage, our SLA penalties will be catastrophic. What is your status?',
      choices: [
        {
          id: 'femi_professional_status',
          text: 'We have isolated the anomalous traffic to internal subnet hosts. Evidence preservation is underway following strict forensic standards.',
          nextNodeId: 'femi_reassured',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 15,
              reason: 'Femi values crisp, professional executive updates.',
            },
            {
              type: 'RECORD_MEMORY',
              topic: 'femi_briefed',
              fact: 'Briefed VP Femi Martins with a structured executive summary.',
            },
          ],
        },
        {
          id: 'femi_alarmist',
          text: 'The entire network could be compromised. We might have to take all servers offline.',
          nextNodeId: 'femi_irritated',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: -20,
              reason: 'Femi is furious at unsupported panic and business disruption threats.',
            },
          ],
        },
      ],
    },
    femi_returning: {
      id: 'femi_returning',
      speakerId: 'npc_femi',
      text: 'Vance. Tell me you have progress to report. The audit committee is asking for an incident brief before noon.',
      choices: [
        {
          id: 'femi_ret_progress',
          text: 'Containment actions are actively isolating the rogue role, and a formal Incident Report will be submitted.',
          nextNodeId: 'femi_reassured',
        },
        {
          id: 'femi_ret_leave',
          text: 'Returning to my terminal now to finalize the investigation.',
          nextNodeId: 'femi_exit',
        },
        {
          id: 'femi_ask_contract',
          text: 'Mr. Martins, does Marina Logistics have any active security audit contracts available?',
          nextNodeId: 'femi_job_offer_port_audit',
        },
        {
          id: 'femi_praise_port_audit',
          text: 'The subnet port & service audit for Marina Logistics is completed and verified.',
          nextNodeId: 'femi_port_audit_feedback',
          condition: {
            requiredCompletedJobId: 'job_marina_port_audit',
          },
        },
      ],
    },
    femi_job_offer_port_audit: {
      id: 'femi_job_offer_port_audit',
      speakerId: 'npc_femi',
      text: 'Marina Logistics has a contract listing right now: "Subnet Port & Service Audit". We need an analyst to run netmap across 192.168.10.0/24 and catalog our exposed database service. It pays ₦1,200.00 in verified funds.',
      choices: [
        {
          id: 'femi_accept_audit',
          text: 'I accept the contract. I will map the subnet and catalog the services.',
          nextNodeId: 'femi_exit',
          actions: [
            {
              type: 'ACCEPT_JOB',
              jobId: 'job_marina_port_audit',
            },
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Femi appreciates your proactive willingness to take on corporate contracts.',
            },
          ],
        },
        {
          id: 'femi_decline_audit',
          text: 'I will review the contract terms on the Career portal first.',
          nextNodeId: 'femi_exit',
        },
      ],
    },
    femi_port_audit_feedback: {
      id: 'femi_port_audit_feedback',
      speakerId: 'npc_femi',
      text: 'Excellent work on the Marina audit, Vance. Clean port inventory, no service disruption, and verifiable telemetry. Your ₦1,200.00 contract payout was processed in full.',
      choices: [
        {
          id: 'femi_audit_ack',
          text: 'Thank you, Mr. Martins. Always ready for high-stakes audits.',
          nextNodeId: 'femi_exit',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 10,
              reason: 'Femi is impressed with your validated contract delivery.',
            },
          ],
        },
      ],
    },
    femi_reassured: {
      id: 'femi_reassured',
      speakerId: 'npc_femi',
      text: 'Good. Keep the impact contained. If you resolve this without disrupting production services and deliver a solid incident report, Cedarline pays our bounty bonuses on time, and there will be further high-value contracts on the table.',
      choices: [
        {
          id: 'femi_commit',
          text: 'Understood, Mr. Martins. Delivering verified results is my priority.',
          nextNodeId: 'femi_exit',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Femi appreciates high-ownership professionalism.',
            },
          ],
        },
      ],
    },
    femi_irritated: {
      id: 'femi_irritated',
      speakerId: 'npc_femi',
      text: 'Do not talk about shutting down production servers unless you have hard forensic evidence! Find the root cause, isolate the specific service account, and keep Cedarline operational. Get back to work.',
      choices: [
        {
          id: 'femi_irr_exit',
          text: 'Understood. Returning to investigation.',
          nextNodeId: 'femi_exit',
        },
      ],
    },
    femi_completed: {
      id: 'femi_completed',
      speakerId: 'npc_femi',
      text: 'Vance, I read your final Incident Report. Clean triage, accurate root-cause identification, and zero unplanned downtime. That is what professional cybersecurity work looks like. Keep this up and you will have a long future in Lagos tech.',
      choices: [
        {
          id: 'femi_comp_ack',
          text: 'Thank you, Mr. Martins. Cedarline’s systems are secure.',
          nextNodeId: 'femi_exit',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 10,
              reason: 'Earned the lasting respect of VP Femi Martins.',
            },
          ],
        },
      ],
    },
    femi_exit: {
      id: 'femi_exit',
      speakerId: 'npc_femi',
      text: 'Keep me informed.',
      choices: [],
      isTerminal: true,
    },
  },
};

export const NKECHI_DIALOGUE_GRAPH: DialogueGraph = {
  npcId: 'npc_nkechi',
  defaultNodeId: 'nkechi_greeting',
  getInitialNodeId: context => {
    if (context.memory.met && context.memory.topicsDiscussed.includes('phishing_advice_given')) {
      return 'nkechi_returning_friendly';
    }
    return 'nkechi_greeting';
  },
  nodes: {
    nkechi_greeting: {
      id: 'nkechi_greeting',
      speakerId: 'npc_nkechi',
      text: 'Kedu! Welcome, my brother! You need phone charger, HDMI cable, or fresh cold Chapman drink? You look like all those tech boys from Broad Street who stare at computer screen until their eyes turn red!',
      choices: [
        {
          id: 'nkechi_greet_friendly',
          text: 'Haha, Mama Nkechi, good morning. Just taking a walk between security analysis shifts.',
          nextNodeId: 'nkechi_chat',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 10,
              reason: 'Mama Nkechi enjoys your warm, respectful greeting.',
            },
          ],
        },
        {
          id: 'nkechi_ask_rumors',
          text: 'Have you noticed anything unusual happening around the commercial buildings today?',
          nextNodeId: 'nkechi_street_news',
        },
      ],
    },
    nkechi_chat: {
      id: 'nkechi_chat',
      speakerId: 'npc_nkechi',
      text: 'Eh-heh! You do computer security? God bless you, oh! Let me ask you something: this morning, all the traders in Balogun received SMS saying our business bank accounts will be blocked unless we click one strange link and input our BVN! I told Iya Basira not to touch it, but she is panicking!',
      choices: [
        {
          id: 'nkechi_explain_phishing',
          text: 'Mama Nkechi, that is 100% a phishing scam! Banks never request BVN or PIN over SMS links. Tell everyone in the market to ignore and delete it.',
          nextNodeId: 'nkechi_grateful',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 15,
              reason:
                'Mama Nkechi is deeply grateful for your life-saving cyber advice for market traders.',
            },
            {
              type: 'RECORD_MEMORY',
              topic: 'phishing_advice_given',
              fact: 'Warned Mama Nkechi and Balogun market traders about SMS phishing attacks targeting commercial bank accounts.',
            },
          ],
        },
        {
          id: 'nkechi_dismiss_sms',
          text: 'I only handle enterprise corporate servers, not personal SMS scams.',
          nextNodeId: 'nkechi_disappointed',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: -10,
              reason: 'Mama Nkechi felt you looked down on local market traders.',
            },
          ],
        },
      ],
    },
    nkechi_grateful: {
      id: 'nkechi_grateful',
      speakerId: 'npc_nkechi',
      text: 'I knew it! Ah, thank you so much, Tade! I will tell the market security committee right now. You see why education is good? Anytime you need anything from my stall, you have a friend in Balogun market!',
      choices: [
        {
          id: 'nkechi_grat_ack',
          text: 'Always happy to protect our community, Mama Nkechi. Take care!',
          nextNodeId: 'nkechi_exit',
        },
      ],
    },
    nkechi_disappointed: {
      id: 'nkechi_disappointed',
      speakerId: 'npc_nkechi',
      text: 'Ah, so you are too big for ordinary people? No problem, big man. Go back to your corporate building.',
      choices: [
        {
          id: 'nkechi_dis_exit',
          text: 'Goodbye, Mama Nkechi.',
          nextNodeId: 'nkechi_exit',
        },
      ],
    },
    nkechi_street_news: {
      id: 'nkechi_street_news',
      speakerId: 'npc_nkechi',
      text: 'Well, around 8:00 AM, one young man from Cedarline—that junior technician Marcus—ran outside to buy pure water with his hands shaking like leaf! He was murmuring about server passwords. I hope you people haven’t broken the internet!',
      choices: [
        {
          id: 'nkechi_news_ack',
          text: 'Thank you for the tip, Mama Nkechi. We are taking good care of the network.',
          nextNodeId: 'nkechi_exit',
          actions: [
            {
              type: 'RECORD_MEMORY',
              topic: 'marcus_spotted_outside',
              fact: 'Mama Nkechi saw Marcus Adebayo looking visibly distressed on Broad Street earlier.',
            },
          ],
        },
      ],
    },
    nkechi_returning_friendly: {
      id: 'nkechi_returning_friendly',
      speakerId: 'npc_nkechi',
      text: 'My cybersecurity hero! Iya Basira showed the SMS to the bank manager and the manager confirmed it was a criminal scam! You saved her shop’s capital, my brother!',
      choices: [
        {
          id: 'nkechi_ret_warm',
          text: 'I am so glad to hear that, Mama Nkechi. Stay vigilant!',
          nextNodeId: 'nkechi_exit',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Warm appreciation and enduring neighborhood rapport.',
            },
          ],
        },
      ],
    },
    nkechi_exit: {
      id: 'nkechi_exit',
      speakerId: 'npc_nkechi',
      text: 'May God protect your work, my brother! Come back anytime.',
      choices: [],
      isTerminal: true,
    },
  },
};

export const SEGUN_DIALOGUE_GRAPH: DialogueGraph = {
  npcId: 'npc_segun',
  defaultNodeId: 'segun_greeting',
  nodes: {
    segun_greeting: {
      id: 'segun_greeting',
      speakerId: 'npc_segun',
      text: 'Good day, young man. Sit down for a moment by the fountain. The sun is high over Tinubu Square, and people rush through life as if Broad Street will disappear tomorrow.',
      choices: [
        {
          id: 'segun_listen',
          text: 'Good day, Uncle Segun. How long have you lived on Lagos Island?',
          nextNodeId: 'segun_history',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 10,
              reason: 'Uncle Segun appreciates the respect shown to an elder.',
            },
            {
              type: 'RECORD_MEMORY',
              topic: 'lagos_island_history',
              fact: 'Uncle Segun shared how Broad Street transitioned from British colonial banks to modern high-frequency cyber networks.',
            },
          ],
        },
        {
          id: 'segun_modern_tech',
          text: 'Everything moves fast now, Uncle. We are managing complex digital systems across the city.',
          nextNodeId: 'segun_wisdom',
        },
      ],
    },
    segun_history: {
      id: 'segun_history',
      speakerId: 'npc_segun',
      text: 'Over sixty years, young man. I remember when Broad Street held the treasury registers in thick leather books locked with heavy brass padlocks. Now, they tell me entire fortunes move through glass wires under our feet. But remember this: machines change, but human character remains the same. Greed, fear, and pride still cause every breach.',
      choices: [
        {
          id: 'segun_hist_reflect',
          text: 'That is remarkably true. Most cybersecurity incidents come down to human shortcuts and neglected boundaries.',
          nextNodeId: 'segun_approval',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 10,
              reason: 'Uncle Segun nods with deep approval at your insight.',
            },
          ],
        },
      ],
    },
    segun_wisdom: {
      id: 'segun_wisdom',
      speakerId: 'npc_segun',
      text: 'Digital systems are only as sturdy as the honesty of the people who maintain them. A young person who can fix what is broken without stealing or boasting will never lack bread in Lagos.',
      choices: [
        {
          id: 'segun_wis_ack',
          text: 'Thank you for the wisdom, Uncle Segun. I will carry it with me.',
          nextNodeId: 'segun_exit',
        },
      ],
    },
    segun_approval: {
      id: 'segun_approval',
      speakerId: 'npc_segun',
      text: 'You have a good head on your shoulders, young man. Go do your work with honor. When you finish, come back and tell an old man what the future looks like.',
      choices: [
        {
          id: 'segun_app_exit',
          text: 'I will, Uncle. Take care in the shade.',
          nextNodeId: 'segun_exit',
        },
      ],
    },
    segun_exit: {
      id: 'segun_exit',
      speakerId: 'npc_segun',
      text: 'Walk gently on Lagos Island, Tade.',
      choices: [],
      isTerminal: true,
    },
  },
};

export const FOLAKE_DIALOGUE_GRAPH: DialogueGraph = {
  npcId: 'npc_folake',
  defaultNodeId: 'folake_greeting',
  nodes: {
    folake_greeting: {
      id: 'folake_greeting',
      speakerId: 'npc_folake',
      text: 'Hi there! You must be Tade Vance. Word travels fast along Broad Street—I represent Eko Tech Partners. We scout technical and security talent for top fintech firms across West Africa and London.',
      choices: [
        {
          id: 'folake_career_interest',
          text: 'Nice to meet you, Folake. What kind of cybersecurity skills are firms looking for right now?',
          nextNodeId: 'folake_market_info',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 10,
              reason: 'Folake is impressed by your professional market curiosity.',
            },
            {
              type: 'RECORD_MEMORY',
              topic: 'lagos_cyber_job_market',
              fact: 'Folake explained that AI agent sandboxing and IAM least-privilege skills command top consulting rates in Lagos.',
            },
          ],
        },
        {
          id: 'folake_busy',
          text: 'I am currently in the middle of a high-priority incident triage.',
          nextNodeId: 'folake_impressed',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'Folake respects focused dedication to live incident response.',
            },
          ],
        },
      ],
    },
    folake_market_info: {
      id: 'folake_market_info',
      speakerId: 'npc_folake',
      text: 'Cloud IAM governance, forensic evidence integrity, and autonomous agent security. Everyone is deploying AI assistants, but almost nobody knows how to sandbox their tool permissions properly! If you solve the Cedarline incident cleanly, my client firms will be lining up to offer consulting contracts.',
      choices: [
        {
          id: 'folake_keep_contact',
          text: 'Good to know. I’ll make sure our incident response at Cedarline sets an exemplary benchmark.',
          nextNodeId: 'folake_exit',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 5,
              reason: 'High confidence and professional composure.',
            },
          ],
        },
      ],
    },
    folake_impressed: {
      id: 'folake_impressed',
      speakerId: 'npc_folake',
      text: 'I love to see real operational focus. Don’t let me hold you up! When the dust settles at Cedarline, let’s talk career progression.',
      choices: [
        {
          id: 'folake_imp_exit',
          text: 'Will do, Folake. Thanks!',
          nextNodeId: 'folake_exit',
        },
      ],
    },
    folake_exit: {
      id: 'folake_exit',
      speakerId: 'npc_folake',
      text: 'Good luck with the triage, Tade. Keep your standards high!',
      choices: [],
      isTerminal: true,
    },
  },
};

export const TUNDE_DIALOGUE_GRAPH: DialogueGraph = {
  npcId: 'npc_tunde',
  defaultNodeId: 'tunde_greeting',
  nodes: {
    tunde_greeting: {
      id: 'tunde_greeting',
      speakerId: 'npc_tunde',
      text: 'Yo. You work across the street at Cedarline, right? Saw their staging DNS flap three times this morning. Don’t tell me: someone connected an autonomous LLM agent directly to corporate file shares without checking the service account permissions?',
      choices: [
        {
          id: 'tunde_spot_on',
          text: 'You have sharp eyes, Tunde. That is exactly what happened.',
          nextNodeId: 'tunde_discussion',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 15,
              reason: 'Tunde appreciates honesty over corporate PR spin.',
            },
            {
              type: 'RECORD_MEMORY',
              topic: 'tunde_zero_day_insight',
              fact: 'Tunde confirmed that excessive IAM roles on autonomous LLM agents are the most common vulnerability vector in Lagos enterprise rollouts.',
            },
          ],
        },
        {
          id: 'tunde_evasive',
          text: 'Internal infrastructure details are confidential.',
          nextNodeId: 'tunde_cynical',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: -10,
              reason: 'Tunde dislikes generic corporate secrecy.',
            },
          ],
        },
      ],
    },
    tunde_discussion: {
      id: 'tunde_discussion',
      speakerId: 'npc_tunde',
      text: 'Classic rookie blunder! The devs get tired of 403 errors during testing, slap corporate-admin on svc-aster, and promise to "fix it in sprint 4". Then someone prompts the agent for payroll and boom—unauthorized SMB exfiltration. Did you guys revoke the token or isolate the subnet yet?',
      choices: [
        {
          id: 'tunde_disc_method',
          text: 'We are preserving evidence hashes first, then revoking the token and applying least-privilege remediation.',
          nextNodeId: 'tunde_respect',
          actions: [
            {
              type: 'CHANGE_RELATIONSHIP',
              delta: 10,
              reason: 'Tunde respects textbook forensic discipline.',
            },
          ],
        },
      ],
    },
    tunde_cynical: {
      id: 'tunde_cynical',
      speakerId: 'npc_tunde',
      text: 'Haha, "confidential." That’s what every company says right until their database dump ends up on paste sites. Suit yourself, corporate.',
      choices: [
        {
          id: 'tunde_cyn_exit',
          text: 'I have work to finish.',
          nextNodeId: 'tunde_exit',
        },
      ],
    },
    tunde_respect: {
      id: 'tunde_respect',
      speakerId: 'npc_tunde',
      text: 'Respect. Most people panic and wipe the container logs, destroying all forensic proof in the process. Good to know Cedarline hired an analyst with real brains. If you ever want to collaborate on ethical bug bounties, find me here by the water.',
      choices: [
        {
          id: 'tunde_resp_exit',
          text: 'Count on it, Tunde. See you around the Marina.',
          nextNodeId: 'tunde_exit',
        },
      ],
    },
    tunde_exit: {
      id: 'tunde_exit',
      speakerId: 'npc_tunde',
      text: 'Stay frosty, Tade. Watch those IAM scopes.',
      choices: [],
      isTerminal: true,
    },
  },
};

export const ALL_DIALOGUE_GRAPHS: readonly DialogueGraph[] = [
  AMINA_DIALOGUE_GRAPH,
  MARCUS_DIALOGUE_GRAPH,
  ELENA_DIALOGUE_GRAPH,
  FEMI_DIALOGUE_GRAPH,
  NKECHI_DIALOGUE_GRAPH,
  SEGUN_DIALOGUE_GRAPH,
  FOLAKE_DIALOGUE_GRAPH,
  TUNDE_DIALOGUE_GRAPH,
];

export function getDialogueGraph(npcId: string): DialogueGraph | undefined {
  return ALL_DIALOGUE_GRAPHS.find(g => g.npcId === npcId);
}
