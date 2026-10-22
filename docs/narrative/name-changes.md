# Cyberlife — Character Renaming & Display Name Normalization

This document records the complete specification and audit trail for character renaming across Cyberlife. All character display names and narrative references have been normalized to **first names only** (with cultural honorifics like "Mama" and "Uncle" preserved), eliminating all last names from in-game presentation.

---

## 1. Primary Character Name Mapping Table

| Stable ID | Original Full Name | Gender | Role / Affiliation | New Display Name | Notes |
|:---|:---|:---|:---|:---|:---|
| *(player)* | Babatunde Vance / Tade | M/F (default M) | Freelance Security Specialist | **Protector** | Replaces "Babatunde Vance". Terminal user `tade` normalized to `protector` (e.g. `protector@Orion-ws04`). |
| `npc_amina` | Temitope Blessing / Amina | F | Lead Security Analyst, Cedarline SOC | **Blessing** | Stable ID `npc_amina` preserved. |
| `npc_marcus` | Marcus Adebayo / Tobi | M | Junior Infrastructure Administrator, Cedarline | **Barry** | Stable ID `npc_marcus` preserved. |
| `npc_elena` | Dr. Elena Chen / Dr. Elizabeth | F | Lead AI Engineer & Architect, Cedarline | **Mercy** | Nigerian applied ML specialist. Academic title "Dr." dropped. Stable ID `npc_elena` preserved. |
| `npc_femi` | Femi Martins / Gabriel | M | VP of Technology & Operations, Cedarline | **Michael** | Stable ID `npc_femi` preserved. |
| `npc_nkechi` | Mama Nkechi | F | Balogun Electronics Market Matriarch | **Mama Esther** | Matriarch honorific "Mama" retained. Market venue display name: "Mama Esther Provisions & Electronics". Stable ID `npc_nkechi` and venue ID `venue-mama-nkechi-market` preserved. |
| `npc_segun` | Uncle Segun / Uncle Ola | M | Community Elder & Historian, Tinubu Square | **Uncle Segun** | Elder honorific "Uncle" retained. Display name normalized across dialogue, discoveries, and contacts. Stable ID `npc_segun` preserved. |
| `npc_folake` | Folake Davies / Anjola | F | Senior Tech Talent Liaison, Eko Tech Partners | **Goodness** | Stable ID `npc_folake` preserved. |
| `npc_tunde` | Tunde "ZeroDay" Bakare | M | Independent Security Researcher & Bounty Hunter | **Tsharp** | Nickname tag "ZeroDay" and last name dropped. Stable ID `npc_tunde` preserved. |
| `npc_kemi` | Kemi Adeyemi | F | Chief Investigative Editor, The Lagos Inquirer | **Mary** | Stable ID `npc_kemi` preserved. |
| `npc_babatunde` | Babatunde Lawal | M | Chief Compliance Inspector, NDSRC | **Daniel** | Stable ID `npc_babatunde` preserved. |
| *(npc_chidi / contract)* | Chidi Okonkwo | M | Managing Director of Incident Response, Krest IR | **Choker** | Retained as private sector DFIR lead. |

---

## 2. Audio Manifest Audit: Dialogue Lines Requiring Re-Recording

A comprehensive audit of `public/assets/audio/voice/manifest.json` identified 16 spoken dialogue clips containing replaced names or gendered honorifics. To prevent audio-visual desynchronization while avoiding synthetic re-generation without voice talent, all 16 audio clips retain their valid audio pointers, have had their text metadata synchronized, and are flagged with `"needsHumanRecording": true`.

| # | Audio Hash ID | Speaker | Dialogue Node ID | Previous Line Text | New Synchronized Text | Reason for Re-Recording |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | `9806d4945209de8c` | `npc_amina` (Blessing) | `amina_next_steps_briefing` | "...I have already informed Anjola at Eko Tech Partners..." | "...I have already informed Goodness at Eko Tech Partners..." | Name changed: Anjola → Goodness |
| 2 | `f5d72ef8d69784fa` | `npc_amina` (Blessing) | `amina_marcus_hint` | "...Tobi is terrified. Go easy on him..." | "...Barry is terrified. Go easy on him..." | Name changed: Tobi → Barry |
| 3 | `646877796bef8ae4` | `npc_marcus` (Barry) | `marcus_memo_revealed` | "...VP Gabriel ordered this wildcard role directly..." | "...VP Michael ordered this wildcard role directly..." | Name changed: VP Gabriel → VP Michael |
| 4 | `539fa4589f21200c` | `npc_marcus` (Barry) | `marcus_defensive_node` | "...Speak to Dr. Elizabeth or Gabriel directly..." | "...Speak to Mercy or Michael directly..." | Names changed: Dr. Elizabeth → Mercy; Gabriel → Michael |
| 5 | `b0c9053e0249659e` | `npc_femi` (Michael) | `femi_greeting` | "Vance. Temitope told me you were digging through the Aster cluster..." | "Protector. Temitope told me you were digging through the Aster cluster..." | Name changed: Vance → Protector |
| 6 | `99dcaaf715179bbb` | `npc_femi` (Michael) | `femi_returning` | "Back again, Vance. Have you finished auditing those ports?" | "Back again, Protector. Have you finished auditing those ports?" | Name changed: Vance → Protector |
| 7 | `dd552041c833e131` | `npc_femi` (Michael) | `femi_port_audit_feedback` | "Excellent work, Vance. Least privilege is our policy on paper..." | "Excellent work, Protector. Least privilege is our policy on paper..." | Name changed: Vance → Protector |
| 8 | `f8992f971c7eea97` | `npc_femi` (Michael) | `femi_completed` | "Vance, you have proven your competence..." | "Protector, you have proven your competence..." | Name changed: Vance → Protector |
| 9 | `d2b9b1ed292fb2dd` | `npc_nkechi` (Mama Esther) | `nkechi_greeting` | "Ah, my brother! Welcome to Balogun. You look like those corporate tech boys..." | "Ah, my friend! Welcome to Balogun. You look like those corporate tech folks..." | Gender-neutral: "my brother" → "my friend"; "tech boys" → "tech folks" |
| 10 | `c52b81c723d946cd` | `npc_nkechi` (Mama Esther) | `nkechi_disappointed` | "Ah, big man, you too dey form..." | "Ah, big shot, you too dey form..." | Gender-neutral: "big man" → "big shot" |
| 11 | `4348cb5dcb9edcf4` | `npc_nkechi` (Mama Esther) | `nkechi_street_news` | "One young man came here yesterday — Tobi from Cedarline..." | "One young person came here yesterday — Barry from Cedarline..." | Gender-neutral: "young man" → "young person"; Name: Tobi → Barry |
| 12 | `7e2828d9d25c49bf` | `npc_nkechi` (Mama Esther) | `nkechi_returning_friendly` | "My brother, welcome back..." | "My friend, welcome back..." | Gender-neutral: "my brother" → "my friend" |
| 13 | `489403d67523cc69` | `npc_nkechi` (Mama Esther) | `nkechi_exit` | "Take care, my brother. Remember, Lagos no dey sleep." | "Take care, my friend. Remember, Lagos no dey sleep." | Gender-neutral: "my brother" → "my friend" |
| 14 | `772d73f066f0622b` | `npc_segun` (Uncle Segun) | `segun_greeting` | "Good afternoon, young man. You move with heavy footsteps..." | "Good afternoon, my friend. You move with heavy footsteps..." | Gender-neutral: "young man" → "my friend" |
| 15 | `7c2969552e206410` | `npc_segun` (Uncle Segun) | `segun_history` | "Sit down, young man. Broad Street has seen many empires rise and fall..." | "Sit down, my friend. Broad Street has seen many empires rise and fall..." | Gender-neutral: "young man" → "my friend" |
| 16 | `e751a9d8fb715043` | `npc_segun` (Uncle Segun) | `segun_approval` | "You have a good head on your shoulders, young man..." | "You have a good head on your shoulders, my friend..." | Gender-neutral: "young man" → "my friend" |

---

## 3. Player Gender-Neutral Dialogue Adjustments

In accordance with character creation requirements where the player can select male or female (default male), all dialogue addressed to the player character has been adjusted to gender-neutral expressions:

1. **"my brother" → "my friend"**:
   - `nkechi_greeting`: Replaced greeting phrase.
   - `nkechi_returning_friendly`: Replaced returning greeting.
   - `nkechi_exit`: Replaced parting phrase.
2. **"big man" → "big shot"**:
   - `nkechi_disappointed`: Replaced dismissive remark.
3. **"tech boys" → "tech folks"**:
   - `nkechi_greeting`: Replaced demographic reference.
4. **"young man" → "my friend" / "young person"**:
   - `segun_greeting`: Replaced greeting phrase.
   - `segun_history`: Replaced storytelling prompt.
   - `segun_approval`: Replaced mentor praise phrase.
   - `segun_wisdom`: Replaced reflective dialogue phrase.
   - `nkechi_street_news`: Replaced reference to junior employee ("young person").

Third-person references where the subject is male (e.g. Barry: *"He is terrified. Go easy on him..."*) remain intentionally masculine to preserve NPC identities.

---

## 4. Intentional Leftovers & Scope Boundaries

To prevent regressions in simulation logic, file systems, network communication, and external systems, the following items remain intentionally unchanged:

1. **Stable Entity IDs & Code Keys**:
   - NPC IDs: `npc_amina`, `npc_marcus`, `npc_elena`, `npc_femi`, `npc_nkechi`, `npc_segun`, `npc_folake`, `npc_tunde`, `npc_kemi`, `npc_babatunde`.
   - Dialogue graph IDs: `AMINA_DIALOGUE_GRAPH`, `MARCUS_DIALOGUE_GRAPH`, `FEMI_DIALOGUE_GRAPH`, `NKECHI_DIALOGUE_GRAPH`, `SEGUN_DIALOGUE_GRAPH`.
   - Consequence flags: `flag_marcus_protected`, `flag_marcus_exposed`, `flag_femi_relationship_broken`, `flag_femi_trust_high`, `flag_amina_mentorship_active`.
   - Discovery IDs: `disc_uncle_ola_fountain_chat`, `disc_anjola_recruiter_encounter`, `disc_mama_esther_intel`.
   - Venue ID: `venue-mama-nkechi-market`.
2. **Autonomous Systems & Bots**:
   - `Cipher`: Autonomous encrypted relay contact in onion chat (reverted from accidental rename).
   - `Aster SIEM Bot`: Cedarline automated SOC telemetry assistant.
3. **Ambient Characters & Vendors**:
   - `Mama Bukky`: Canteen vendor in residential backstreets.
4. **Institutional & Faction Names**:
   - `Cedarline Services Ltd.`, `Eko Merchant Bank (EMB)`, `Krest Incident Response (Krest IR)`, `0xLagos Research Syndicate`, `The Lagos Inquirer`, `CRCII`, `Balogun Traders Electronic Union`, `National Digital Security Regulatory Commission (NDSRC)`.
5. **Ambient Pedestrians**:
   - All 24 crowd archetypes in `PedestrianSystem.ts` have had their surnames removed from display names and palette definitions, keeping single first names only (`Babajide`, `Chidi`, `Zainab`, `Olumide`, `Folashade`, `Femi`, `Ronke`, `Tsharp`, `Emeka`, `Amina`, `Halima`, `Kunle`, `Blessing`, `Dayo`, `Funke`, `Yetunde`, `Seyi`, `Aisha`, `Kayode`, `Uche`, `Hadiza`, `Segun`).
