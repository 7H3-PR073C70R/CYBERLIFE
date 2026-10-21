import { NpcProfile } from './types';

export const NPC_PROFILES: readonly NpcProfile[] = [
  // 1. Cybersecurity mentor / experienced professional
  {
    id: 'npc_amina',
    name: 'Blessing',
    role: 'Lead Security Analyst',
    organization: 'Cedarline Services Ltd.',
    bio: 'Veteran incident responder with over a decade defending critical financial and logistics networks across West Africa. Calm, exacting, and deeply committed to rigorous forensic standards.',
    personality:
      'Methodical, protective of her team, patient with learners who show genuine discipline, intolerant of reckless shortcuts or fabricated claims.',
    voiceTone:
      'Measured, authoritative, supportive, professional Nigerian English with occasional Lagos colloquialisms when relieved.',
    voice: {
      gender: 'female',
      pitch: 1.05,
      rate: 0.98,
      voiceHints: ['en-ng', 'nigeria', 'female', 'victoria', 'serena', 'samantha'],
    },
    palette: {
      skin: 0x5c3826,
      hair: 0x111111,
      jacket: 0x0284c7, // Cedarline Tech Cyan / Royal Blue
      jacketTrim: 0x38bdf8,
      pants: 0x1e293b,
      shoes: 0x0f172a,
      accent: 0x10b981, // Security clearance green
    },
    initialRelationship: 20,
    knowledgeBoundaries: {
      knownFacts: [
        'Initial anomalous SMB query was flagged on app-portal-01 targeting filesrv-01 at 07:42.',
        'The Aster AI core service account svc-aster triggered the alert.',
        'Cedarline security policy mandates strict evidence preservation before any remediation.',
        'A formal Incident Report must be graded and filed before the incident can be closed.',
      ],
      suspectedFacts: [
        'Suspects svc-aster was given an over-broad IAM policy during emergency deployment.',
        'Suspects external prompts may have nudged Aster outside its intended knowledge-base scope.',
      ],
      unknownFacts: [
        'Does not know the exact file contents exfiltrated or copied before the investigation began.',
        'Does not know who authorized the wildcard policy role on svc-aster.',
      ],
    },
    schedule: [
      {
        startHour: 7,
        endHour: 19,
        locationId: 'cedarline_interior',
        position: [3.2, 0, 0.5],
        yaw: Math.PI,
        activity: 'Supervising SOC incident response console and triaging active telemetry alerts.',
        animationState: 'SEATED_IDLE',
      },
      {
        startHour: 19,
        endHour: 7,
        locationId: 'cedarline_interior',
        position: [3.2, 0, 0.5],
        yaw: Math.PI,
        activity: 'Reviewing shift handover logs and automated verification telemetry.',
        animationState: 'IDLE',
      },
    ],
  },

  // 2. Cedarline employee (sysadmin who provisioned Aster)
  {
    id: 'npc_marcus',
    name: 'Tobi',
    role: 'Junior Infrastructure Administrator',
    organization: 'Cedarline Services Ltd.',
    bio: 'Second-year systems administrator at Cedarline. Capable and hardworking, but frequently overwhelmed by overlapping executive deadlines and conflicting architectural demands.',
    personality:
      'Nervous, defensive under accusation, deeply relieved when treated fairly, eager to do the right thing once assured he will not be scapegoated.',
    voiceTone:
      'Hasty, slightly strained, speaks quickly when nervous, drops into earnest candor when trust is established.',
    voice: {
      gender: 'male',
      pitch: 1.02,
      rate: 1.03,
      voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'oliver', 'george'],
    },
    palette: {
      skin: 0x4a2a1a,
      hair: 0x17120e,
      jacket: 0x475569, // Slate utility windbreaker
      jacketTrim: 0xf59e0b, // Amber warning trim
      pants: 0x334155,
      shoes: 0x1e293b,
      accent: 0xf59e0b,
    },
    initialRelationship: 0,
    knowledgeBoundaries: {
      knownFacts: [
        'Personally configured the svc-aster system credentials three weeks ago.',
        'Was pressured to deliver the Aster portal deployment ahead of the Q4 board review.',
        'Encountered permission denial errors during initial testing and assigned corporate-admin as a temporary fix.',
        'Failed to roll back the corporate-admin role before going on leave.',
      ],
      suspectedFacts: [
        'Fears he will be terminated if Gabriel or the audit committee discovers the role assignment.',
      ],
      unknownFacts: [
        'Does not understand the AI prompt injection vector or how the model interpreted user requests.',
        'Does not know the specific network forensic tools used in SOC analysis.',
      ],
    },
    schedule: [
      {
        startHour: 8,
        endHour: 13,
        locationId: 'cedarline_interior',
        position: [-3.5, 0, 0.2],
        yaw: Math.PI / 2,
        activity: 'Inspecting departmental server racks and checking service container logs.',
        animationState: 'TYPING',
      },
      {
        startHour: 13,
        endHour: 14,
        locationId: 'neighborhood',
        position: [-8.5, 0, 10.0],
        yaw: 0,
        activity: 'Stepping outside on Broad Street for nervous phone calls during lunch.',
        animationState: 'IDLE',
      },
      {
        startHour: 14,
        endHour: 19,
        locationId: 'cedarline_interior',
        position: [-3.5, 0, 0.2],
        yaw: Math.PI / 2,
        activity: 'Auditing server storage pools and monitoring file share permissions.',
        animationState: 'SEATED_IDLE',
      },
      {
        startHour: 19,
        endHour: 8,
        locationId: 'cedarline_interior',
        position: [-3.5, 0, 0.2],
        yaw: Math.PI / 2,
        activity: 'On late-shift infrastructure standby.',
        animationState: 'IDLE',
      },
    ],
  },

  // 3. Technical colleague (lead AI engineer)
  {
    id: 'npc_elena',
    name: 'Dr. Elizabeth',
    role: 'Lead AI Engineer',
    organization: 'Cedarline Services Ltd.',
    bio: 'Applied machine learning specialist formerly with an international research lab. She architected Aster’s autonomous retrieval and tool-calling agent loop.',
    personality:
      'Intellectually formidable, passionate about agentic systems, sensitive to simplistic "AI is evil" tropes, but rigorously honest when shown hard log traces.',
    voiceTone: 'Crisp, articulate, analytical, punctuated by technical precision.',
    voice: {
      gender: 'female',
      pitch: 1.02,
      rate: 1.0,
      voiceHints: ['female', 'en-gb', 'en-us', 'karen', 'serena'],
    },
    palette: {
      skin: 0x8d5b4c,
      hair: 0x1f1f1f,
      jacket: 0x065f46, // Deep emerald blazer
      jacketTrim: 0x10b981,
      pants: 0x0f172a,
      shoes: 0xffffff,
      accent: 0x34d399,
    },
    initialRelationship: 10,
    knowledgeBoundaries: {
      knownFacts: [
        'Aster was designed to answer internal queries by autonomously calling search and document tools.',
        'Aster was never meant to access unindexed corporate file shares or financial databases.',
        'Agentic tools require strict principle-of-least-privilege sandboxing and prompt boundary validation.',
      ],
      suspectedFacts: [
        'Believes an ambiguous employee prompt or adversarial prompt injection tricked Aster into searching for payroll records.',
      ],
      unknownFacts: [
        'Did not know svc-aster was provisioned with corporate-admin wildcard access on the OS level.',
      ],
    },
    schedule: [
      {
        startHour: 8,
        endHour: 18,
        locationId: 'cedarline_interior',
        position: [4.5, 0, -2.5],
        yaw: -Math.PI / 2,
        activity: 'Analyzing Aster model weights and conversational context window logs.',
        animationState: 'TYPING',
      },
      {
        startHour: 18,
        endHour: 8,
        locationId: 'neighborhood',
        position: [-2.0, 0, 17.5],
        yaw: Math.PI,
        activity: 'Taking evening walks along the Marina promenade to clear her head.',
        animationState: 'IDLE',
      },
    ],
  },

  // 4. Manager / business stakeholder
  {
    id: 'npc_femi',
    name: 'Gabriel',
    role: 'VP of Technology & Operations',
    organization: 'Cedarline Services Ltd.',
    bio: 'Seasoned enterprise technology executive responsible for Cedarline’s operational P&L, client SLA commitments, and regulatory compliance.',
    personality:
      'Pragmatic, demanding, numbers-driven, hyper-aware of reputation and liability, but respects professionals who bring solutions rather than panic.',
    voiceTone: 'Direct, commanding, polished executive cadence with an urgent undertone.',
    voice: {
      gender: 'male',
      pitch: 0.94,
      rate: 0.96,
      voiceHints: ['en-ng', 'nigeria', 'male', 'daniel', 'george'],
    },
    palette: {
      skin: 0x3d2012,
      hair: 0x111111,
      jacket: 0x1e1b4b, // Deep indigo executive suit
      jacketTrim: 0xfacc15, // Gold trim
      pants: 0x1e1b4b,
      shoes: 0x451a03, // Cordovan leather shoes
      accent: 0xeab308,
    },
    initialRelationship: -5,
    knowledgeBoundaries: {
      knownFacts: [
        'Cedarline faces heavy contractual SLA penalties if services are down or customer data is leaked.',
        'A formal compliance report must satisfy international banking partners.',
      ],
      suspectedFacts: [
        'Suspects internal negligence or rushed product launch caused the vulnerability.',
      ],
      unknownFacts: ['Does not know low-level networking or specific tool syntax.'],
    },
    schedule: [
      {
        startHour: 8,
        endHour: 18,
        locationId: 'neighborhood',
        position: [-8.5, 0, -18.0],
        yaw: Math.PI / 2,
        activity: 'Inspecting corporate entrance and taking calls with international stakeholders.',
        animationState: 'IDLE',
      },
      {
        startHour: 18,
        endHour: 8,
        locationId: 'cedarline_interior',
        position: [0.0, 0, 3.5],
        yaw: 0,
        activity: 'Reviewing corporate compliance briefs and executive status summaries.',
        animationState: 'SEATED_IDLE',
      },
    ],
  },

  // 5. Local shopkeeper / business owner
  {
    id: 'npc_nkechi',
    name: 'Mama Esther',
    role: 'Merchant & Electronics Vendor',
    organization: 'Mama Esther Provisions & Electronics',
    bio: 'Respected Balogun Market trade leader who sells electronics, adapters, mobile airtime, and provisions. Sharp business sense and beloved community matriarch.',
    personality:
      'Warm, shrewd, observant, protective of young people in the neighborhood, deeply suspicious of online scams and fake SMS alerts.',
    voiceTone:
      'Vibrant, warm, maternal yet no-nonsense, speaks with colorful Nigerian Pidgin and animated rhythm.',
    voice: {
      gender: 'female',
      pitch: 1.08,
      rate: 0.98,
      voiceHints: ['en-ng', 'nigeria', 'female', 'serena'],
    },
    palette: {
      skin: 0x543220,
      hair: 0x0a0a0a,
      jacket: 0x9f1239, // Rich crimson traditional ankara
      jacketTrim: 0xfde047, // Bright yellow trim
      pants: 0x881337,
      shoes: 0xf1f5f9,
      accent: 0xe11d48,
    },
    initialRelationship: 15,
    knowledgeBoundaries: {
      knownFacts: [
        'Traders on Balogun street have received fraudulent phishing SMS messages claiming to be bank verification notices.',
        'Noticed tech workers from Cedarline running in and out of the Marina building looking distressed.',
        'Understands local street dynamics and who has been asking questions around the neighborhood.',
      ],
      suspectedFacts: [
        'Suspects rogue actors are operating around Lagos Island cybercafes targeting commercial accounts.',
      ],
      unknownFacts: [
        'Does not know anything about Cedarline internal network architecture or Aster AI.',
      ],
    },
    schedule: [
      {
        startHour: 7,
        endHour: 20,
        locationId: 'neighborhood',
        position: [10.0, 0, -8.0],
        yaw: 0,
        activity:
          'Tending Balogun market stall, selling electronics accessories and chatting with traders.',
        animationState: 'IDLE',
      },
      {
        startHour: 20,
        endHour: 7,
        locationId: 'neighborhood',
        position: [10.0, 0, -8.0],
        yaw: 0,
        activity: 'Securing the stall shutter locks and organizing stock inventory.',
        animationState: 'IDLE',
      },
    ],
  },

  // 6. Neighborhood resident / community elder
  {
    id: 'npc_segun',
    name: 'Uncle Ola',
    role: 'Community Elder & Historian',
    organization: 'Tinubu Square Civic Association',
    bio: 'Retired Lagos civil servant and neighborhood elder. Spends his days around Tinubu Square observing the transformation of Lagos Island from colonial trading post to modern digital hub.',
    personality:
      'Philosophical, calm, patient, possesses profound memory of Broad Street history and human nature.',
    voiceTone:
      'Gentle, resonant, unhurried, offering reflective parables and historical perspective.',
    voice: {
      gender: 'male',
      pitch: 0.92,
      rate: 0.92,
      voiceHints: ['en-ng', 'nigeria', 'male', 'george', 'daniel'],
    },
    palette: {
      skin: 0x3d2012,
      hair: 0x9ca3af, // Silver-grey hair
      jacket: 0x1e3a5f, // Navy traditional agbada vest
      jacketTrim: 0xd97706,
      pants: 0x1e293b,
      shoes: 0x78350f,
      accent: 0xf59e0b,
    },
    initialRelationship: 10,
    knowledgeBoundaries: {
      knownFacts: [
        'Broad Street was once the banking capital of the entire region and has survived every change of era.',
        'Noticed telecom workers laying new fiber optic lines past Tinubu Square last month.',
        'Understands that modern crime no longer needs crowbars, only computer keys.',
      ],
      suspectedFacts: [
        'Suspects modern young people rush into technology without building moral foundations.',
      ],
      unknownFacts: [
        'Does not know corporate server internals or specific cybersecurity exploits.',
      ],
    },
    schedule: [
      {
        startHour: 7,
        endHour: 21,
        locationId: 'neighborhood',
        position: [14.0, 0, -26.0],
        yaw: Math.PI / 4,
        activity:
          'Sitting near Tinubu Square monument fountain greeting passers-by and reading newspapers.',
        animationState: 'IDLE',
      },
      {
        startHour: 21,
        endHour: 7,
        locationId: 'neighborhood',
        position: [14.0, 0, -26.0],
        yaw: Math.PI / 4,
        activity: 'Resting by the heritage monument garden bench.',
        animationState: 'IDLE',
      },
    ],
  },

  // 7. Recruiter / client / professional contact
  {
    id: 'npc_folake',
    name: 'Anjola',
    role: 'Technology Talent Liaison',
    organization: 'Eko Tech Partners',
    bio: 'Headhunter and talent partner connecting cybersecurity analysts, developers, and infrastructure specialists with African fintech unicorns and international cyber firms.',
    personality:
      'Energetic, observant, networking-driven, highly appreciates talent that combines technical rigor with ethical clarity.',
    voiceTone: 'Crisp, enthusiastic, polished modern Lagos corporate professional.',
    voice: {
      gender: 'female',
      pitch: 1.06,
      rate: 1.02,
      voiceHints: ['en-ng', 'nigeria', 'female', 'victoria', 'serena'],
    },
    palette: {
      skin: 0x5c3826,
      hair: 0x171717,
      jacket: 0x7c3aed, // Electric violet modern blazer
      jacketTrim: 0x38bdf8,
      pants: 0x18181b,
      shoes: 0xffffff,
      accent: 0xa855f7,
    },
    initialRelationship: 5,
    knowledgeBoundaries: {
      knownFacts: [
        'Cybersecurity talent in Lagos is in extreme demand, especially analysts who know cloud IAM and agent security.',
        'Cedarline has an opening for a permanent incident response specialist if this incident is resolved cleanly.',
        'Top fintech firms pay bounties for verified threat remediation.',
      ],
      suspectedFacts: [
        'Suspects the Aster Incident is a make-or-break audition for the player’s career.',
      ],
      unknownFacts: ['Does not have access to Cedarline confidential incident logs.'],
    },
    schedule: [
      {
        startHour: 8,
        endHour: 19,
        locationId: 'neighborhood',
        position: [8.5, 0, 8.0],
        yaw: -Math.PI / 2,
        activity:
          'Broad Street sidewalk near Eko Merchant Bank checking portfolio resumes and making calls.',
        animationState: 'IDLE',
      },
      {
        startHour: 19,
        endHour: 8,
        locationId: 'neighborhood',
        position: [8.5, 0, 8.0],
        yaw: -Math.PI / 2,
        activity: 'Attending virtual recruitment debriefs.',
        animationState: 'IDLE',
      },
    ],
  },

  // 8. Security researcher / ethical hacker with a different perspective
  {
    id: 'npc_tunde',
    name: 'Tsharp',
    role: 'Independent Security Researcher',
    organization: 'Self-employed / Cyber Defense Freelance',
    bio: 'Brilliant white-hat researcher and veteran bug bounty hunter. Known in the local community for finding zero-day flaws before cyber syndicates can weaponize them.',
    personality:
      'Cynical, witty, fiercely independent, unimpressed by corporate buzzwords, values proof-of-concept demonstrations above corporate assurances.',
    voiceTone: 'Dry, sarcastic, quick-witted, peppered with hacker jargon and sharp humor.',
    voice: {
      gender: 'male',
      pitch: 0.96,
      rate: 1.02,
      voiceHints: ['en-ng', 'nigeria', 'male', 'oliver', 'alex'],
    },
    palette: {
      skin: 0x3b2219,
      hair: 0x0a0a0a,
      jacket: 0xd97706, // Amber hoodie
      jacketTrim: 0x00e5ff, // Cyber cyan glowing accents
      pants: 0x18181b,
      shoes: 0xe2e8f0,
      accent: 0x00e5ff,
    },
    initialRelationship: 0,
    knowledgeBoundaries: {
      knownFacts: [
        'Autonomous AI agents with tool-calling capabilities are currently the top attack vector worldwide.',
        'Over-privileged service accounts are the classic rookie mistake in enterprise cloud rollouts.',
        'Warned folks on Lagos developer forums that giving Aster unrestricted SMB access was an accident waiting to happen.',
      ],
      suspectedFacts: [
        'Suspects someone deliberately prompted Aster to test if it could grab payroll data.',
      ],
      unknownFacts: [
        'Does not have Cedarline internal credential access and does not break into networks without authorization.',
      ],
    },
    schedule: [
      {
        startHour: 10,
        endHour: 23,
        locationId: 'neighborhood',
        position: [0.0, 0, 17.5],
        yaw: Math.PI,
        activity:
          'Leaning against Marina seawall railings with a portable terminal analyzing packet captures.',
        animationState: 'IDLE',
      },
      {
        startHour: 23,
        endHour: 10,
        locationId: 'neighborhood',
        position: [0.0, 0, 17.5],
        yaw: Math.PI,
        activity:
          'Listening to the lagoon waves and reviewing bug bounty vulnerability disclosures.',
        animationState: 'IDLE',
      },
    ],
  },
];

export function getNpcProfile(npcId: string): NpcProfile | undefined {
  return NPC_PROFILES.find(p => p.id === npcId);
}
