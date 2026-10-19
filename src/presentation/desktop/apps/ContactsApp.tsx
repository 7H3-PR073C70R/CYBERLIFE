import React, { useState, useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { NPC_PROFILES } from '@/simulation/actors/npcProfiles';
import { getNpcActiveSchedule } from '@/simulation/actors/npcSchedules';
import {
  getRelationshipBand,
  getRelationshipBandLabel,
  RELATIONSHIP_BANDS,
  NpcSimulationState,
} from '@/simulation/actors/types';

export const ContactsApp: React.FC = () => {
  const sim = useOptionalSimulation();
  const npcsState = sim?.state.npcs;
  const currentHour = sim?.state.time.calendar.hour ?? 8;

  const [selectedNpcId, setSelectedNpcId] = useState<string>(NPC_PROFILES[0]?.id ?? 'npc_amina');
  const [filterCategory, setFilterCategory] = useState<'all' | 'met' | 'cedarline' | 'community'>(
    'all'
  );

  const selectedProfile = useMemo(
    () => NPC_PROFILES.find(p => p.id === selectedNpcId) ?? NPC_PROFILES[0]!,
    [selectedNpcId]
  );

  const selectedState: NpcSimulationState | undefined = npcsState?.[selectedProfile.id];
  const isMet = Boolean(selectedState?.memory.met && selectedState.memory.conversationCount > 0);
  const relationshipScore = selectedState?.relationship ?? selectedProfile.initialRelationship;
  const band = getRelationshipBand(relationshipScore);
  const bandLabel = getRelationshipBandLabel(band);
  const bandDef = RELATIONSHIP_BANDS.find(b => b.band === band);
  const currentSchedule = getNpcActiveSchedule(selectedProfile, currentHour);

  // Filtered list of profiles
  const filteredProfiles = useMemo(() => {
    return NPC_PROFILES.filter(profile => {
      const state = npcsState?.[profile.id];
      const met = Boolean(state?.memory.met && state.memory.conversationCount > 0);

      if (filterCategory === 'met') return met;
      if (filterCategory === 'cedarline') return profile.organization?.includes('Cedarline');
      if (filterCategory === 'community') return !profile.organization?.includes('Cedarline');
      return true;
    });
  }, [npcsState, filterCategory]);

  const metCount = useMemo(() => {
    return NPC_PROFILES.filter(p => {
      const s = npcsState?.[p.id];
      return Boolean(s?.memory.met && s.memory.conversationCount > 0);
    }).length;
  }, [npcsState]);

  return (
    <div
      className="contacts-app"
      data-testid="contacts-app"
      style={{
        display: 'flex',
        height: '100%',
        backgroundColor: 'var(--color-bg-base, #070a10)',
        color: 'var(--color-text-primary, #f1f5f9)',
        fontFamily: 'var(--font-sans, sans-serif)',
        overflow: 'hidden',
      }}
    >
      {/* Left Sidebar: Contacts Directory List */}
      <div
        style={{
          width: '280px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'var(--color-bg-surface, #0f1624)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Header & Met Counter */}
        <div
          style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}
          >
            <h3
              style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-text-primary, #f1f5f9)',
              }}
            >
              Lagos Directory
            </h3>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-accent-cyan, #38bdf8)',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
              }}
            >
              Met: {metCount} / {NPC_PROFILES.length}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }}
          >
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'met', label: 'Met' },
                { id: 'cedarline', label: 'Cedarline' },
                { id: 'community', label: 'Community' },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                data-testid={`filter-btn-${tab.id}`}
                onClick={() => setFilterCategory(tab.id)}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  border:
                    filterCategory === tab.id
                      ? '1px solid #38bdf8'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor:
                    filterCategory === tab.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color:
                    filterCategory === tab.id ? '#38bdf8' : 'var(--color-text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem' }}>
          {filteredProfiles.map(profile => {
            const state = npcsState?.[profile.id];
            const met = Boolean(state?.memory.met && state.memory.conversationCount > 0);
            const isSelected = profile.id === selectedNpcId;
            const rel = state?.relationship ?? profile.initialRelationship;
            const relBand = getRelationshipBand(rel);
            const relBandDef = RELATIONSHIP_BANDS.find(b => b.band === relBand);

            return (
              <button
                key={profile.id}
                type="button"
                data-testid={`contact-item-${profile.id}`}
                onClick={() => setSelectedNpcId(profile.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  marginBottom: '0.25rem',
                  textAlign: 'left',
                  border: isSelected
                    ? '1px solid var(--color-accent-cyan, #38bdf8)'
                    : '1px solid transparent',
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {/* Avatar Icon */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, #${(profile.palette.jacket ?? 0x0284c7).toString(16).padStart(6, '0')}, #${(profile.palette.jacketTrim ?? 0x38bdf8).toString(16).padStart(6, '0')})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    opacity: met ? 1 : 0.6,
                  }}
                >
                  {met ? profile.name.charAt(0) : '?'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.3rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: isSelected
                          ? 'var(--color-accent-cyan, #38bdf8)'
                          : 'var(--color-text-primary, #f1f5f9)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {met ? profile.name : `${profile.name} (Unmet)`}
                    </span>
                    {met && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: relBandDef?.color ?? '#94a3b8',
                        }}
                      >
                        {rel > 0 ? `+${rel}` : rel}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-text-muted, #64748b)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {profile.role}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Details Pane */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          backgroundColor: 'var(--color-bg-base, #070a10)',
        }}
        data-testid="contact-details-pane"
      >
        {/* Profile Dossier Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, #${(selectedProfile.palette.jacket ?? 0x0284c7).toString(16).padStart(6, '0')}, #${(selectedProfile.palette.jacketTrim ?? 0x38bdf8).toString(16).padStart(6, '0')})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1.4rem',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {selectedProfile.name.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2
                  data-testid="contact-detail-name"
                  style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}
                >
                  {selectedProfile.name}
                </h2>
                {selectedProfile.organization && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: 'var(--color-accent-cyan, #38bdf8)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                    }}
                  >
                    {selectedProfile.organization}
                  </span>
                )}
              </div>
              <p
                data-testid="contact-detail-role"
                style={{
                  margin: '0.2rem 0 0 0',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary, #94a3b8)',
                }}
              >
                {selectedProfile.role}
              </p>
            </div>
          </div>

          {/* Relationship Band Pill */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.25rem',
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--color-text-muted, #64748b)',
                textTransform: 'uppercase',
              }}
            >
              Relationship
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: `1px solid ${bandDef?.color ?? '#38bdf8'}`,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: bandDef?.color ?? '#38bdf8',
                }}
              />
              <span
                data-testid="relationship-value-display"
                style={{ fontSize: '0.8rem', fontWeight: 700, color: bandDef?.color ?? '#38bdf8' }}
              >
                {bandLabel} ({relationshipScore > 0 ? `+${relationshipScore}` : relationshipScore})
              </span>
            </div>
          </div>
        </div>

        {/* Relationship Meter Visual Bar (-100 to +100) */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface-elevated, #162033)',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted, #64748b)',
              marginBottom: '0.45rem',
            }}
          >
            <span>Hostile (-100)</span>
            <span>Distrustful (-50)</span>
            <span>Neutral (0)</span>
            <span>Friendly (+50)</span>
            <span>Trusted (+100)</span>
          </div>
          {/* Track */}
          <div
            style={{
              position: 'relative',
              height: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {/* Filled Progress */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: `${Math.abs(relationshipScore) / 2}%`,
                transform: relationshipScore < 0 ? 'scaleX(-1)' : 'none',
                transformOrigin: 'left',
                backgroundColor: bandDef?.color ?? '#38bdf8',
                borderRadius: '4px',
                transition: 'all 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Current Activity & Location Window */}
        <div
          data-testid="current-activity-display"
          style={{
            backgroundColor: 'var(--color-bg-surface-elevated, #162033)',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>📍</span>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted, #64748b)',
                textTransform: 'uppercase',
              }}
            >
              Current Location & Activity ({sim?.state.time.calendar.timeString ?? '08:00 AM'})
            </div>
            <div
              style={{
                fontSize: '0.88rem',
                color: 'var(--color-text-primary, #f1f5f9)',
                marginTop: '0.15rem',
              }}
            >
              <strong>
                {currentSchedule.locationId === 'cedarline_interior'
                  ? 'Cedarline Services HQ'
                  : 'Lagos Island Outdoor District'}
              </strong>
              : {currentSchedule.activity}
            </div>
          </div>
        </div>

        {/* Biography & Personality */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: 'var(--color-bg-surface-elevated, #162033)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <h4
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-accent-cyan, #38bdf8)',
                textTransform: 'uppercase',
                margin: '0 0 0.4rem 0',
              }}
            >
              Background
            </h4>
            <p
              style={{
                fontSize: '0.82rem',
                lineHeight: 1.5,
                margin: 0,
                color: 'var(--color-text-secondary, #94a3b8)',
              }}
            >
              {selectedProfile.bio}
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-bg-surface-elevated, #162033)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <h4
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-accent-amber, #fbbf24)',
                textTransform: 'uppercase',
                margin: '0 0 0.4rem 0',
              }}
            >
              Personality & Style
            </h4>
            <p
              style={{
                fontSize: '0.82rem',
                lineHeight: 1.5,
                margin: 0,
                color: 'var(--color-text-secondary, #94a3b8)',
              }}
            >
              {selectedProfile.personality}
            </p>
          </div>
        </div>

        {/* Known Facts & Shared Intel (Discovered during gameplay) */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface-elevated, #162033)',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
            }}
          >
            <h4
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-accent-emerald, #34d399)',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Discovered Intel & Notes
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #64748b)' }}>
              {isMet
                ? `${selectedState?.memory.sharedFacts.length ?? 0} facts learned`
                : 'Not yet encountered'}
            </span>
          </div>

          {!isMet ? (
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-text-muted, #64748b)',
                fontStyle: 'italic',
                padding: '0.5rem 0',
              }}
            >
              You have not spoken with {selectedProfile.name} yet. Approach them in the 3D
              environment to start a conversation and discover facts.
            </div>
          ) : (selectedState?.memory.sharedFacts.length ?? 0) === 0 ? (
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--color-text-muted, #64748b)',
                fontStyle: 'italic',
                padding: '0.5rem 0',
              }}
            >
              You have met {selectedProfile.name}, but have not yet recorded specific case intel
              with them.
            </div>
          ) : (
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              {selectedState?.memory.sharedFacts.map((fact, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '0.82rem',
                    lineHeight: 1.4,
                    color: 'var(--color-text-primary, #f1f5f9)',
                  }}
                >
                  {fact}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Conversation History Stats */}
        {isMet && (
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted, #64748b)',
              paddingTop: '0.25rem',
            }}
          >
            <span>
              Conversations Held: <strong>{selectedState?.memory.conversationCount ?? 0}</strong>
            </span>
            <span>
              Topics Explored: <strong>{selectedState?.memory.topicsDiscussed.length ?? 0}</strong>
            </span>
            <span>
              Choices Logged: <strong>{selectedState?.memory.choicesMade.length ?? 0}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
