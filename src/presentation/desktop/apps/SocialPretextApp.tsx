/**
 * Cyberlife — Milestone 14: Social Pretexting & Human Security Desktop Application
 *
 * Interactive human security simulation covering physical venue encounters,
 * phone pretexts, badge challenges, out-of-band verification, and psychological pressure.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain model. Zero external communication.
 * All personas, venues, phone numbers, and badges are fictional.
 */

import React, { useState, useMemo } from 'react';
import {
  SocialPretextEngine,
  SOCIAL_PRETEXT_SCENARIOS,
} from '../../../simulation/cyber/social';
import {
  PretextEncounterDefinition,
  PretextDialogueOption,
} from '../../../simulation/cyber/social/types';

export const SocialPretextApp: React.FC = () => {
  const [engine] = useState(() => new SocialPretextEngine());
  const scenarios = useMemo(() => engine.getAllScenarios(), [engine]);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    SOCIAL_PRETEXT_SCENARIOS[0]!.id
  );
  const [activeSession, setActiveSession] = useState(() =>
    engine.startEncounter(SOCIAL_PRETEXT_SCENARIOS[0]!.id)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeScenario: PretextEncounterDefinition = useMemo(
    () => (engine.getScenario(selectedScenarioId) ?? scenarios[0] ?? SOCIAL_PRETEXT_SCENARIOS[0])!,
    [engine, selectedScenarioId, scenarios]
  );

  const currentNode = useMemo(
    () => activeScenario.nodes[activeSession.currentNodeId],
    [activeScenario, activeSession.currentNodeId]
  );

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    const newSession = engine.startEncounter(scenarioId);
    setActiveSession(newSession);
    setToastMessage(`Loaded encounter scenario: ${engine.getScenario(scenarioId)?.title}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestartScenario = () => {
    const newSession = engine.startEncounter(selectedScenarioId);
    setActiveSession(newSession);
    setToastMessage(`Reset scenario: ${activeScenario.title}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleChooseOption = (option: PretextDialogueOption) => {
    if (activeSession.isCompleted) return;

    try {
      const updatedSession = engine.selectOption(selectedScenarioId, option.id);
      setActiveSession({ ...updatedSession });
      if (option.verificationAction) {
        setToastMessage(`Executed procedure: [${option.verificationAction.replace(/_/g, ' ')}]`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setToastMessage(`Action error: ${msg}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const getToneBadgeStyle = (tone: string) => {
    switch (tone) {
      case 'STRICT_PROCEDURE':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
      case 'SKEPTICAL_CHALLENGE':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'AUTHORITATIVE':
        return 'bg-purple-950/80 text-purple-400 border-purple-800/80';
      case 'EMPATHETIC':
        return 'bg-sky-950/80 text-sky-400 border-sky-800/80';
      case 'EVASIVE':
        return 'bg-rose-950/80 text-rose-400 border-rose-800/80';
      default:
        return 'bg-gray-800/80 text-gray-300 border-gray-700/80';
    }
  };

  const getOutcomeBannerStyle = (status?: string) => {
    switch (status) {
      case 'POLICY_UPHELD':
      case 'SUCCESS_VERIFIED':
      case 'THREAT_CONTAINED':
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200',
          badge: 'bg-emerald-800/60 text-emerald-300 border-emerald-700',
          title: 'text-emerald-400',
        };
      case 'SECURITY_BREACH_ALLOWED':
        return {
          bg: 'bg-rose-950/60 border-rose-500/50 text-rose-200',
          badge: 'bg-rose-800/60 text-rose-300 border-rose-700',
          title: 'text-rose-400',
        };
      case 'FALSE_ACCUSATION':
      case 'SUSPICION_RAISED':
      default:
        return {
          bg: 'bg-amber-950/60 border-amber-500/50 text-amber-200',
          badge: 'bg-amber-800/60 text-amber-300 border-amber-700',
          title: 'text-amber-400',
        };
    }
  };

  const outcomeStyle = getOutcomeBannerStyle(activeSession.finalOutcome?.status);

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100 font-sans text-xs select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-2 right-4 z-50 bg-cyan-950 border border-cyan-500/60 text-cyan-200 px-3 py-1.5 rounded shadow-lg text-[11px] animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          <span className="font-bold tracking-wider text-gray-200 text-sm">
            EKOMIND SOCIAL PRETEXT & HUMAN RESILIENCE LAB
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800/60 font-mono">
            HUMAN-SEC-SIM // V14.0
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-[11px]">Venue:</span>
          <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-200 border border-gray-700 font-medium">
            {activeScenario.venueLabel}
          </span>
          <button
            onClick={handleRestartScenario}
            className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded transition text-[11px]"
            title="Reset active scenario encounter"
          >
            Restart Encounter
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Scenario Catalog */}
        <div className="w-72 bg-gray-900/60 border-r border-gray-800 flex flex-col flex-shrink-0">
          <div className="p-2 border-b border-gray-800 bg-gray-900/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Authored Pretext Encounters ({scenarios.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {scenarios.map(scen => {
              const isSelected = scen.id === selectedScenarioId;
              return (
                <button
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen.id)}
                  className={`w-full text-left p-2 rounded border transition ${
                    isSelected
                      ? 'bg-rose-950/30 border-rose-600/70 text-rose-200 shadow-sm'
                      : 'bg-gray-950/40 border-gray-800/80 text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-gray-200 truncate">
                      {scen.title}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-gray-800 text-gray-400 border border-gray-700 uppercase">
                      {scen.venue.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                    {scen.summary}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                    <span>NPC: {scen.targetNpc.name}</span>
                    <span>•</span>
                    <span>{scen.targetNpc.title}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* NPC Profile Box */}
          <div className="p-2.5 bg-gray-950 border-t border-gray-800 text-gray-300">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block mb-1">
              Active Interlocutor Profile
            </span>
            <div className="bg-gray-900 p-2 rounded border border-gray-800 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="font-semibold text-rose-300">{activeScenario.targetNpc.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role:</span>
                <span className="text-gray-300">{activeScenario.targetNpc.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dept:</span>
                <span className="text-gray-300">{activeScenario.targetNpc.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Badge ID:</span>
                <span className="font-mono text-amber-400">{activeScenario.targetNpc.badgeNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Encounter Stage & Dialogue Branching */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
          {/* Situation Briefing Bar */}
          <div className="p-3 bg-gray-900/90 border-b border-gray-800 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-100">{activeScenario.title}</span>
              <span className="text-[11px] text-cyan-400 font-mono">
                Location: {activeScenario.venueLabel}
              </span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              {activeScenario.situationBriefing}
            </p>
          </div>

          {/* Psychological & Trust Meters Dashboard */}
          <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-gray-900/50 border-b border-gray-800">
            {/* Trust Meter (-100 to 100) */}
            <div className="bg-gray-950 p-2 rounded border border-gray-800 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Trust Index</span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    activeSession.metrics.trust >= 20
                      ? 'text-emerald-400'
                      : activeSession.metrics.trust <= -20
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {activeSession.metrics.trust > 0 ? `+${activeSession.metrics.trust}` : activeSession.metrics.trust}
                </span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    activeSession.metrics.trust >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (activeSession.metrics.trust + 100) / 2))}%`,
                  }}
                />
              </div>
            </div>

            {/* Suspicion Meter (0 to 100) */}
            <div className="bg-gray-950 p-2 rounded border border-gray-800 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Suspicion Level</span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    activeSession.metrics.suspicion >= 50
                      ? 'text-rose-400'
                      : activeSession.metrics.suspicion >= 25
                      ? 'text-amber-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {activeSession.metrics.suspicion}%
                </span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    activeSession.metrics.suspicion >= 50
                      ? 'bg-rose-500'
                      : activeSession.metrics.suspicion >= 25
                      ? 'bg-amber-500'
                      : 'bg-cyan-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, activeSession.metrics.suspicion))}%` }}
                />
              </div>
            </div>

            {/* Credibility Meter (0 to 100) */}
            <div className="bg-gray-950 p-2 rounded border border-gray-800 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Credibility</span>
                <span className="font-mono text-[11px] font-bold text-sky-400">
                  {activeSession.metrics.credibility}%
                </span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, activeSession.metrics.credibility))}%` }}
                />
              </div>
            </div>

            {/* Authority Meter (0 to 100) */}
            <div className="bg-gray-950 p-2 rounded border border-gray-800 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Perceived Authority</span>
                <span className="font-mono text-[11px] font-bold text-purple-400">
                  {activeSession.metrics.authority}%
                </span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, activeSession.metrics.authority))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dialogue Transcript Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Display completed nodes in historical sequence */}
            {activeSession.history.map((step, idx) => {
              const node = activeScenario.nodes[step.nodeId];
              if (!node) return null;
              const isNpc = node.speaker === 'NPC';
              const isPlayer = node.speaker === 'PLAYER';

              return (
                <div
                  key={`${step.nodeId}-${idx}`}
                  className={`flex flex-col gap-1 ${
                    isPlayer ? 'items-end' : isNpc ? 'items-start' : 'items-center'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span
                      className={`font-bold ${
                        isNpc ? 'text-rose-400' : isPlayer ? 'text-cyan-400' : 'text-amber-400'
                      }`}
                    >
                      {node.speakerName}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 font-mono text-[9px]">{step.timestamp.slice(11, 19)}</span>
                  </div>

                  <div
                    className={`max-w-xl p-3 rounded-lg border text-[11px] leading-relaxed shadow-sm ${
                      isPlayer
                        ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-100 rounded-tr-none'
                        : isNpc
                        ? 'bg-gray-900 border-gray-800 text-gray-200 rounded-tl-none'
                        : 'bg-amber-950/30 border-amber-800/60 text-amber-200 text-center'
                    }`}
                  >
                    {node.text}
                  </div>
                </div>
              );
            })}

            {/* Terminal Outcome Banner */}
            {activeSession.isCompleted && activeSession.finalOutcome && (
              <div className={`mt-4 p-4 rounded-lg border shadow-lg ${outcomeStyle.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${outcomeStyle.badge}`}>
                      {activeSession.finalOutcome.status.replace(/_/g, ' ')}
                    </span>
                    <h3 className={`text-sm font-bold ${outcomeStyle.title}`}>
                      {activeSession.finalOutcome.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                      +{activeSession.finalOutcome.xpReward} XP
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                      ₦{(activeSession.finalOutcome.nairaRewardKobo / 100).toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-200 leading-relaxed mb-3">
                  {activeSession.finalOutcome.summary}
                </p>

                {/* Evidence Item Generated */}
                {activeSession.finalOutcome.evidenceGenerated && (
                  <div className="mb-3 p-2.5 rounded bg-gray-900/90 border border-cyan-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                        Forensic Evidence Captured
                      </span>
                      <span className="font-mono text-[11px] text-gray-200">
                        {activeSession.finalOutcome.evidenceGenerated}
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded bg-cyan-900 text-cyan-200 text-[10px] font-medium border border-cyan-600">
                      Saved to Evidence Vault
                    </span>
                  </div>
                )}

                {/* Feedback Notes */}
                {activeSession.finalOutcome.feedbackNotes.length > 0 && (
                  <div className="space-y-1 border-t border-gray-800/80 pt-2 text-[11px]">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Procedural & Security Feedback
                    </span>
                    {activeSession.finalOutcome.feedbackNotes.map((note, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-gray-300">
                        <span className="text-cyan-400">•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Options Tray */}
          {!activeSession.isCompleted && currentNode && currentNode.options && (
            <div className="p-3 bg-gray-900 border-t border-gray-800 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Choose Response / Operational Security Verification Action:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentNode.options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleChooseOption(option)}
                    className="p-2.5 text-left rounded bg-gray-950 border border-gray-800 hover:border-rose-500/80 hover:bg-rose-950/20 text-gray-200 transition group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${getToneBadgeStyle(
                          option.tone
                        )}`}
                      >
                        {option.tone.replace(/_/g, ' ')}
                      </span>
                      {option.verificationAction && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-700/80 font-mono">
                          [{option.verificationAction.replace(/_/g, ' ')}]
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] leading-snug group-hover:text-white">
                      "{option.text}"
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Security Procedures & Real-Time Audit Log */}
        <div className="w-80 bg-gray-900/40 border-l border-gray-800 flex flex-col flex-shrink-0">
          {/* Learning Objectives */}
          <div className="p-3 border-b border-gray-800 bg-gray-900/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
              Target Learning Objectives
            </span>
            <div className="space-y-1">
              {activeScenario.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-gray-300">
                  <span className="text-rose-400">✓</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Audit Trail */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-gray-800 bg-gray-900/80 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Simulation Audit Trail ({activeSession.auditEvents.length})
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto p-2 font-mono text-[10px] text-gray-400 space-y-1.5 bg-gray-950">
              {activeSession.auditEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded bg-gray-900/80 border border-gray-800/80 text-gray-300 break-words leading-tight"
                >
                  {evt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
