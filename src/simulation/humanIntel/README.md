# Human Intelligence Simulation (`src/simulation/humanIntel/`)

Milestone 21 domain: interviews, observation, testimony-vs-evidence comparison, investigative
conclusions, social-engineering awareness decisions, and authorized physical-security assessments.

Pure TypeScript, no React or browser dependencies. All state lives in the optional
`SimulationState.humanIntel` slice.

## Files
- `types.ts` — domain contracts and `createInitialHumanIntelState()`.
- `scenarioData.ts` — authored content for the three M21 scenarios (questions, vendor message,
  decisions, inspectable objects, expected findings, evidence items).
- `humanIntelCommandHandler.ts` — the 10 command handlers and their command types.

## Commands
`StartInterview` · `AskInterviewQuestion` · `PresentEvidenceToNpc` · `ConcludeInterview` ·
`InspectWorldObject` · `CompareEvidenceWithTestimony` · `SubmitM21Conclusion` ·
`EvaluateSocEngDecision` · `RaiseAssessmentFinding` · `SubmitPhysicalAssessmentReport`

Dispatched via the main `commandHandler`; each handler returns `{ success, state, events, message }`
or a typed failure.

## Activities & unlocks
| Activity | Unlocked by |
|---|---|
| `act_m21_conflicting_accounts` | `m21_humint_unlocked` (set on Aster Incident completion) |
| `act_m21_vendor_request` | `m21_humint_unlocked` |
| `act_m21_facility_audit` | completing `act_m21_conflicting_accounts` |

Objective progress is derived by `activities/adapters/M21HumanIntelAdapter.ts` from this slice and
world flags.

## Adding content
- New interview question: add to the scenario array in `scenarioData.ts`. Any `requiredFlags` must
  be set by some code path — the "Reachability" test fails otherwise.
- New inspectable object: add to the relevant object list **and** make sure
  `handleInspectWorldObject` can find it (it currently looks only at Scenario C objects).

## Tests
`tests/unit/simulation/humanIntel/M21HumanIntel.test.ts`

See `docs/milestone-21-human-intelligence-report.md` for the full milestone report.
