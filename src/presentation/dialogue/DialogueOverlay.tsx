import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { getNpcProfile } from '@/simulation/actors/npcProfiles';
import { getDialogueGraph } from '@/content/dialogue/npcDialogueData';
import { getAvailableChoices } from '@/simulation/narrative/dialogueEvaluator';
import { DialogueEvaluationContext, DialogueChoice } from '@/simulation/narrative/dialogueTypes';
import {
  getRelationshipBand,
  getRelationshipBandLabel,
  RELATIONSHIP_BANDS,
} from '@/simulation/actors/types';
import { voiceDialogueService } from '../audio/VoiceDialogueService';

export interface DialogueOverlayProps {
  readonly npcId: string;
  readonly onClose: () => void;
}

export const DialogueOverlay: React.FC<DialogueOverlayProps> = ({ npcId, onClose }) => {
  const sim = useOptionalSimulation();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const profile = useMemo(() => getNpcProfile(npcId), [npcId]);
  const graph = useMemo(() => getDialogueGraph(npcId), [npcId]);

  // Ensure active dialogue is initialized in simulation state
  useEffect(() => {
    if (!sim) return;
    const active = sim.state.activeDialogue;
    if (!active || active.npcId !== npcId) {
      sim.dispatch({
        type: 'StartNpcDialogue',
        npcId,
      });
    }
  }, [sim, npcId]);

  const npcState = sim?.state.npcs?.[npcId];
  const relationshipScore = npcState?.relationship ?? profile?.initialRelationship ?? 0;
  const relationshipBand = getRelationshipBand(relationshipScore);
  const relationshipLabel = getRelationshipBandLabel(relationshipBand);
  const bandDef = RELATIONSHIP_BANDS.find(b => b.band === relationshipBand);

  const activeDialogue = sim?.state.activeDialogue;
  const currentNodeId = activeDialogue?.currentNodeId ?? graph?.defaultNodeId ?? '';
  const currentNode = graph?.nodes[currentNodeId];

  const evalContext: DialogueEvaluationContext = useMemo(
    () => ({
      relationship: relationshipScore,
      memory: npcState?.memory ?? {
        met: false,
        conversationCount: 0,
        topicsDiscussed: [],
        choicesMade: [],
        sharedFacts: [],
        commitments: [],
      },
      flags: sim?.state.flags ?? {},
      missionPhase: sim?.state.mission?.phase,
    }),
    [relationshipScore, npcState?.memory, sim?.state.flags, sim?.state.mission?.phase]
  );

  const availableChoices: readonly DialogueChoice[] = useMemo(() => {
    if (!currentNode) return [];
    return getAvailableChoices(currentNode, evalContext);
  }, [currentNode, evalContext]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [currentNodeId, availableChoices.length]);

  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(() => voiceDialogueService.getIsMuted());

  // Trigger natural Nigerian English voice stream when NPC speaks
  useEffect(() => {
    if (!currentNode?.text || !profile) return;
    const isFemale =
      ['npc_amina', 'npc_elena', 'npc_nkechi'].includes(profile.id) ||
      profile.name.toLowerCase().includes('amina') ||
      profile.name.toLowerCase().includes('temitope') ||
      profile.name.toLowerCase().includes('elena') ||
      profile.name.toLowerCase().includes('nkechi') ||
      profile.name.toLowerCase().includes('blessing');

    voiceDialogueService.speak(currentNode.text, {
      speaker: profile.name,
      role: profile.role,
      gender: isFemale ? 'female' : 'male',
    });

    return () => {
      voiceDialogueService.stop();
    };
  }, [currentNode?.id, currentNode?.text, profile]);

  const handleSelectChoice = useCallback(
    (choice: DialogueChoice) => {
      voiceDialogueService.stop();
      if (!sim) return;
      const result = sim.dispatch({
        type: 'SelectDialogueChoice',
        npcId,
        choiceId: choice.id,
      });

      // If this choice ended dialogue, invoke onClose
      if (!result.state.activeDialogue) {
        onClose();
      }
    },
    [sim, npcId, onClose]
  );

  const handleClose = useCallback(() => {
    voiceDialogueService.stop();
    if (sim) {
      sim.dispatch({
        type: 'EndDialogue',
        npcId,
      });
    }
    onClose();
  }, [sim, npcId, onClose]);

  // Keyboard navigation: 1-9 to select choice, Up/Down to navigate, Enter to choose, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent keystrokes from leaking to world movement (WASD, Space, etc.)
      e.stopPropagation();

      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      // Check numeric keys 1..9
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= availableChoices.length) {
        e.preventDefault();
        const choice = availableChoices[num - 1];
        if (choice) {
          handleSelectChoice(choice);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, availableChoices.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(
          prev => (prev - 1 + availableChoices.length) % Math.max(1, availableChoices.length)
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const choice = availableChoices[selectedIndex];
        if (choice) {
          handleSelectChoice(choice);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [availableChoices, selectedIndex, handleSelectChoice, handleClose]);

  if (!profile || !graph) {
    return null;
  }

  const isTerminalNode = Boolean(
    !currentNode || currentNode.isTerminal || availableChoices.length === 0
  );
  const lastDelta = activeDialogue?.lastRelationshipDelta;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Conversation with ${profile.name}`}
      className="dialogue-overlay-container"
      data-testid="dialogue-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '1.5rem',
        paddingBottom: '2.5rem',
        background:
          'linear-gradient(to top, rgba(7, 10, 16, 0.92) 0%, rgba(7, 10, 16, 0.6) 50%, rgba(7, 10, 16, 0.2) 100%)',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
    >
      <div
        className="dialogue-card"
        data-testid="dialogue-card"
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: 'var(--color-bg-surface-elevated, #162033)',
          border: '1px solid var(--color-border-active, rgba(56, 189, 248, 0.45))',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(56, 189, 248, 0.15)',
          backdropFilter: 'blur(16px)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          animation: 'fadeIn 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {/* Header: Avatar, Name, Role, Organization, Relationship Badge, and Close Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Styled Character Avatar Icon */}
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, #${(profile.palette.jacket ?? 0x0284c7).toString(16).padStart(6, '0')}, #${(profile.palette.jacketTrim ?? 0x38bdf8).toString(16).padStart(6, '0')})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1.1rem',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
              aria-hidden="true"
            >
              {profile.name.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2
                  data-testid="dialogue-npc-name"
                  style={{
                    color: 'var(--color-text-primary, #f1f5f9)',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {profile.name}
                </h2>
                {profile.organization && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--color-accent-cyan, #38bdf8)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    {profile.organization}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary, #94a3b8)',
                }}
              >
                {profile.role}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Relationship Status Meter Badge */}
            <div
              data-testid="npc-relationship-badge"
              title={`Relationship Score: ${relationshipScore} / 100`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: `1px solid ${bandDef?.color ?? '#38bdf8'}`,
                borderRadius: '999px',
                padding: '0.2rem 0.65rem',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: bandDef?.color ?? '#38bdf8',
                  boxShadow: `0 0 6px ${bandDef?.color ?? '#38bdf8'}`,
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: bandDef?.color ?? '#38bdf8',
                }}
              >
                {relationshipLabel} (
                {relationshipScore > 0 ? `+${relationshipScore}` : relationshipScore})
              </span>
            </div>

            {/* Voice Mute / Unmute and Replay buttons */}
            <button
              type="button"
              onClick={() => {
                const nextMuted = voiceDialogueService.toggleMute();
                setIsVoiceMuted(nextMuted);
              }}
              data-testid="btn-toggle-dialogue-voice"
              title={isVoiceMuted ? 'Unmute voice' : 'Mute voice'}
              style={{
                background: isVoiceMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                border: `1px solid ${isVoiceMuted ? '#ef4444' : 'rgba(56, 189, 248, 0.4)'}`,
                borderRadius: '6px',
                color: isVoiceMuted ? '#f87171' : '#38bdf8',
                fontSize: '0.75rem',
                padding: '0.2rem 0.55rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{isVoiceMuted ? '🔇 Muted' : '🔊 Voice'}</span>
            </button>

            <button
              type="button"
              onClick={() => voiceDialogueService.replay()}
              data-testid="btn-replay-dialogue-voice"
              title="Replay dialogue voice"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                padding: '0.2rem 0.45rem',
                cursor: 'pointer',
              }}
            >
              🔁
            </button>

            {/* Close button with ✕ and Esc hint */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleClose();
              }}
              data-testid="btn-close-dialogue"
              aria-label="Close conversation"
              className="btn-icon-close"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: 'var(--color-text-secondary, #cbd5e1)',
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.35rem 0.65rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                minHeight: '36px',
                pointerEvents: 'auto',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>✕</span>
              <span>Exit [Esc]</span>
            </button>
          </div>
        </div>

        {/* Relationship Delta Toast / Notification */}
        {lastDelta && (
          <div
            data-testid="dialogue-relationship-delta"
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              backgroundColor:
                lastDelta.delta >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${lastDelta.delta >= 0 ? '#10b981' : '#ef4444'}`,
              color: lastDelta.delta >= 0 ? '#34d399' : '#f87171',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <span aria-hidden="true">{lastDelta.delta >= 0 ? '▲' : '▼'}</span>
            <span>
              <strong>
                {lastDelta.delta >= 0 ? `+${lastDelta.delta}` : lastDelta.delta} Trust
              </strong>{' '}
              with {profile.name}: {lastDelta.reason}
            </span>
          </div>
        )}

        {/* Main Dialogue Speech Bubble */}
        <div
          data-testid="dialogue-speech-text"
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: 'var(--color-text-primary, #f1f5f9)',
            backgroundColor: 'rgba(7, 10, 16, 0.45)',
            padding: '1rem 1.15rem',
            borderRadius: '8px',
            borderLeft: '3px solid var(--color-accent-cyan, #38bdf8)',
          }}
        >
          &quot;{currentNode?.text ?? '...'}&quot;
        </div>

        {/* Response Choices / Actions Section */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.25rem' }}
        >
          {isTerminalNode ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleClose}
                data-testid="btn-end-dialogue"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.45rem 1.25rem',
                }}
              >
                Understood, {profile.name.split(' ')[0]} [Esc]
              </button>
            </div>
          ) : (
            availableChoices.map((choice, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={choice.id}
                  type="button"
                  data-testid={`dialogue-choice-${index}`}
                  onClick={() => handleSelectChoice(choice)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textAlign: 'left',
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '8px',
                    border: isSelected
                      ? '1px solid var(--color-accent-cyan, #38bdf8)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    backgroundColor: isSelected
                      ? 'rgba(56, 189, 248, 0.12)'
                      : 'rgba(22, 32, 51, 0.4)',
                    color: isSelected
                      ? 'var(--color-accent-cyan, #38bdf8)'
                      : 'var(--color-text-primary, #f1f5f9)',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '22px',
                      height: '22px',
                      borderRadius: '4px',
                      backgroundColor: isSelected
                        ? 'var(--color-accent-cyan, #38bdf8)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: isSelected ? '#070a10' : 'var(--color-text-muted, #64748b)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono, monospace)',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ flex: 1, lineHeight: 1.4 }}>{choice.text}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
