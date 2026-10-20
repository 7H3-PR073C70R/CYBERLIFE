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
import {
  FACTION_DEFINITIONS,
  STORY_ARCS,
  STORY_CHAPTERS,
} from '@/simulation/narrative/narrativeData';

export const ContactsApp: React.FC = () => {
  const sim = useOptionalSimulation();
  const npcsState = sim?.state.npcs;
  const currentHour = sim?.state.time.calendar.hour ?? 8;
  const narrative = sim?.state.narrative;

  const [mainTab, setMainTab] = useState<'contacts' | 'factions'>('contacts');

  // Contacts state
  const [selectedNpcId, setSelectedNpcId] = useState<string>(NPC_PROFILES[0]?.id ?? 'npc_amina');
  const [filterCategory, setFilterCategory] = useState<'all' | 'met' | 'cedarline' | 'community'>(
    'all'
  );

  // Factions state
  const [selectedFactionId, setSelectedFactionId] = useState<string>(
    FACTION_DEFINITIONS[0]?.id ?? 'faction_cedarline'
  );

  const selectedProfile = useMemo(
    () => NPC_PROFILES.find(p => p.id === selectedNpcId) ?? NPC_PROFILES[0]!,
    [selectedNpcId]
  );

  const selectedState: NpcSimulationState | undefined = npcsState?.[selectedProfile.id];
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

  // Selected Faction calculations
  const selectedFactionDef = useMemo(
    () => FACTION_DEFINITIONS.find(f => f.id === selectedFactionId) ?? FACTION_DEFINITIONS[0]!,
    [selectedFactionId]
  );

  const selectedFactionState = narrative?.factions[selectedFactionDef.id];
  const factionStanding = selectedFactionState?.standing ?? selectedFactionDef.initialStanding;
  const factionBand = selectedFactionState?.band ?? 'NEUTRAL';
  const factionHistory = selectedFactionState?.history ?? [];

  const activeArc = narrative?.activeArcId
    ? STORY_ARCS.find(a => a.id === narrative.activeArcId)
    : undefined;
  const activeChapter = narrative?.activeChapterId
    ? STORY_CHAPTERS.find(c => c.id === narrative.activeChapterId)
    : undefined;

  const getBandColor = (b: string) => {
    switch (b) {
      case 'ALLIED':
        return '#10b981';
      case 'FAVORED':
        return '#38bdf8';
      case 'NEUTRAL':
        return '#94a3b8';
      case 'UNFAVORABLE':
        return '#f59e0b';
      case 'HOSTILE':
        return '#ef4444';
      default:
        return '#38bdf8';
    }
  };

  return (
    <div
      className="contacts-app"
      data-testid="contacts-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-bg-base, #070a10)',
        color: 'var(--color-text-primary, #f1f5f9)',
        fontFamily: 'var(--font-sans, sans-serif)',
        overflow: 'hidden',
      }}
    >
      {/* Top Tab Bar: Contacts vs Factions */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#0b111e',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0 0.75rem',
          gap: '0.5rem',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          data-testid="tab-btn-contacts"
          onClick={() => setMainTab('contacts')}
          style={{
            padding: '0.65rem 1.1rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: mainTab === 'contacts' ? '#38bdf8' : '#94a3b8',
            backgroundColor: mainTab === 'contacts' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
            border: 'none',
            borderBottom: mainTab === 'contacts' ? '2px solid #38bdf8' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease',
          }}
        >
          <span>👥</span>
          <span>Personnel Directory ({NPC_PROFILES.length})</span>
        </button>

        <button
          type="button"
          data-testid="tab-btn-factions"
          onClick={() => setMainTab('factions')}
          style={{
            padding: '0.65rem 1.1rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: mainTab === 'factions' ? '#38bdf8' : '#94a3b8',
            backgroundColor: mainTab === 'factions' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
            border: 'none',
            borderBottom: mainTab === 'factions' ? '2px solid #38bdf8' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease',
          }}
        >
          <span>🏛️</span>
          <span>Factions & Standing ({FACTION_DEFINITIONS.length})</span>
        </button>
      </div>

      {/* Main View Area */}
      {mainTab === 'contacts' ? (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
              style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
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
                style={{
                  display: 'flex',
                  gap: '0.35rem',
                  overflowX: 'auto',
                  paddingBottom: '0.2rem',
                }}
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
                        filterCategory === tab.id
                          ? '#38bdf8'
                          : 'var(--color-text-secondary, #94a3b8)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Contacts List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem 0' }}>
              {filteredProfiles.map(profile => {
                const s = npcsState?.[profile.id];
                const met = Boolean(s?.memory.met && s.memory.conversationCount > 0);
                const rel = s?.relationship ?? profile.initialRelationship;
                const rBand = getRelationshipBand(rel);
                const rBandDef = RELATIONSHIP_BANDS.find(b => b.band === rBand);
                const isSelected = profile.id === selectedNpcId;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    data-testid={`contact-item-${profile.id}`}
                    onClick={() => setSelectedNpcId(profile.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      padding: '0.65rem 1rem',
                      border: 'none',
                      borderLeft: isSelected ? '3px solid #38bdf8' : '3px solid transparent',
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      color: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    {/* Character Avatar Circle with Custom Palette */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, #${(profile.palette.jacket ?? 0x0284c7).toString(16).padStart(6, '0')}, #${(profile.palette.jacketTrim ?? 0x38bdf8).toString(16).padStart(6, '0')})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                      aria-hidden="true"
                    >
                      {profile.name[0]}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.25rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#38bdf8' : 'var(--color-text-primary, #f1f5f9)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {profile.name}
                        </span>
                        {met && (
                          <span
                            title="Met in person"
                            style={{
                              fontSize: '0.65rem',
                              color: '#10b981',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              padding: '0.05rem 0.25rem',
                              borderRadius: '3px',
                            }}
                          >
                            Met
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-text-secondary, #94a3b8)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {profile.role}
                      </div>
                    </div>

                    {/* Relationship Badge */}
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: rBandDef?.color ?? '#94a3b8',
                        flexShrink: 0,
                      }}
                      title={`Relationship: ${rel} (${rBand})`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Panel: Selected Contact Profile Dossier */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Header Card: Name, Avatar, Role, Organization, Status Badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, #${(selectedProfile.palette.jacket ?? 0x0284c7).toString(16).padStart(6, '0')}, #${(selectedProfile.palette.jacketTrim ?? 0x38bdf8).toString(16).padStart(6, '0')})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                  }}
                  aria-hidden="true"
                >
                  {selectedProfile.name[0]}
                </div>
                <div>
                  <h2
                    data-testid="contact-detail-name"
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      margin: '0 0 0.25rem 0',
                      color: 'var(--color-text-primary, #f1f5f9)',
                    }}
                  >
                    {selectedProfile.name}
                  </h2>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      color: 'var(--color-text-secondary, #94a3b8)',
                    }}
                  >
                    <span data-testid="contact-detail-role">{selectedProfile.role}</span>
                    {selectedProfile.organization && (
                      <>
                        <span>•</span>
                        <span>{selectedProfile.organization}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Relationship Tiers */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.4rem',
                }}
              >
                <div
                  data-testid="contact-relationship-badge"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${bandDef?.color ?? '#38bdf8'}`,
                    borderRadius: '999px',
                    padding: '0.25rem 0.75rem',
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
                    data-testid="relationship-value-display"
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: bandDef?.color ?? '#38bdf8',
                    }}
                  >
                    {bandLabel} ({relationshipScore > 0 ? `+${relationshipScore}` : relationshipScore})
                  </span>
                </div>
              </div>
            </div>

            {/* Bio & Background Section */}
            <div>
              <h4
                style={{
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted, #64748b)',
                  margin: '0 0 0.4rem 0',
                }}
              >
                Background & Profile
              </h4>
              <p
                style={{
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  margin: 0,
                  color: 'var(--color-text-primary, #f1f5f9)',
                }}
              >
                {selectedProfile.bio}
              </p>
            </div>

            {/* Active Schedule & Location */}
            <div
              style={{
                backgroundColor: 'rgba(15, 22, 36, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
              }}
            >
              <h4
                style={{
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted, #64748b)',
                  margin: '0 0 0.5rem 0',
                }}
              >
                Current Schedule & Venue ({currentHour.toString().padStart(2, '0')}:00 Lagos Time)
              </h4>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <strong>Location:</strong>{' '}
                  <span style={{ color: '#38bdf8' }}>{currentSchedule?.locationId ?? 'On Call'}</span>
                </div>
                <div data-testid="current-activity-display">
                  <strong>Activity:</strong> {currentSchedule?.activity ?? 'Stationary'}
                </div>
              </div>
            </div>

            {/* Known Facts & Shared Memories */}
            <div
              style={{
                backgroundColor: 'rgba(15, 22, 36, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
              }}
            >
              <h4
                style={{
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted, #64748b)',
                  margin: '0 0 0.5rem 0',
                }}
              >
                Discovered Intel & Notes
              </h4>
              {!selectedState || selectedState.memory.sharedFacts.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #64748b)' }}>
                  No shared facts recorded yet. Speak with {selectedProfile.name} to learn more.
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
                  {selectedState.memory.sharedFacts.map((fact, idx) => (
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
          </div>
        </div>
      ) : (
        /* Factions & Standing Tab */
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar: Faction List */}
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
            {/* Story Arc & Chapter Banner */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#38bdf8',
                  fontWeight: 700,
                  marginBottom: '0.2rem',
                }}
              >
                Active Story Arc
              </div>
              <div
                data-testid="narrative-active-arc"
                style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}
              >
                {activeArc?.title ?? 'The Aster Anomaly'}
              </div>
              <div
                data-testid="narrative-active-chapter"
                style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}
              >
                Chapter: {activeChapter?.title ?? 'Triage on Broad Street'}
              </div>
            </div>

            {/* Scrollable Faction List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem 0' }}>
              {FACTION_DEFINITIONS.map(fac => {
                const fState = narrative?.factions[fac.id];
                const score = fState?.standing ?? fac.initialStanding;
                const fBand = fState?.band ?? 'NEUTRAL';
                const bandColor = getBandColor(fBand);
                const isSelected = fac.id === selectedFactionId;

                return (
                  <button
                    key={fac.id}
                    type="button"
                    data-testid={`faction-item-${fac.id}`}
                    onClick={() => setSelectedFactionId(fac.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      borderLeft: isSelected ? '3px solid #38bdf8' : '3px solid transparent',
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      color: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#38bdf8' : '#f1f5f9',
                        }}
                      >
                        {fac.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {fac.category}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: `${bandColor}22`,
                        border: `1px solid ${bandColor}55`,
                        color: bandColor,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {score > 0 ? `+${score}` : score}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Panel: Selected Faction Details */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Header: Name, Category, Standing Gauge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                  }}
                >
                  {selectedFactionDef.category} Organization
                </div>
                <h2
                  data-testid="faction-title"
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    margin: '0.2rem 0',
                    color: '#f1f5f9',
                  }}
                >
                  {selectedFactionDef.name}
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Headquarters: {selectedFactionDef.headquartersLocationId}
                </div>
              </div>

              {/* Standing Score Badge */}
              <div
                data-testid="faction-standing-badge"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '0.25rem',
                }}
              >
                <div
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    backgroundColor: `${getBandColor(factionBand)}22`,
                    border: `1px solid ${getBandColor(factionBand)}`,
                    color: getBandColor(factionBand),
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  {factionBand} ({factionStanding > 0 ? `+${factionStanding}` : factionStanding})
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Standing Range: [-100 to +100]
                </span>
              </div>
            </div>

            {/* Standing Progress Bar */}
            <div
              style={{
                backgroundColor: 'rgba(15, 22, 36, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  marginBottom: '0.4rem',
                }}
              >
                <span style={{ color: '#ef4444' }}>-100 Hostile</span>
                <span style={{ color: '#94a3b8' }}>0 Neutral</span>
                <span style={{ color: '#10b981' }}>+100 Allied</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* 0-point marker */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    zIndex: 2,
                  }}
                />
                {/* Filled bar: mapping -100..100 to 0%..100% */}
                <div
                  style={{
                    position: 'absolute',
                    left: factionStanding >= 0 ? '50%' : `${((factionStanding + 100) / 200) * 100}%`,
                    width: `${(Math.abs(factionStanding) / 200) * 100}%`,
                    top: 0,
                    bottom: 0,
                    backgroundColor: getBandColor(factionBand),
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <h4
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  margin: '0 0 0.4rem 0',
                }}
              >
                Operational Mandate & Profile
              </h4>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5, margin: 0, color: '#f1f5f9' }}>
                {selectedFactionDef.description}
              </p>
            </div>

            {/* Perks Summary */}
            <div>
              <h4
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  margin: '0 0 0.5rem 0',
                }}
              >
                Faction Retainers & Perks
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedFactionDef.perksSummary.map((perk, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(56, 189, 248, 0.08)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                    }}
                  >
                    ✦ {perk}
                  </span>
                ))}
              </div>
            </div>

            {/* Faction History Audit Trail */}
            <div
              style={{
                backgroundColor: 'rgba(15, 22, 36, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
              }}
            >
              <h4
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  margin: '0 0 0.5rem 0',
                }}
              >
                Standing Audit Trail & Decision History
              </h4>
              {factionHistory.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  No standing shifts recorded yet. Complete missions, investigative disclosures, or dialogue choices to build trust.
                </div>
              ) : (
                <div
                  data-testid="faction-history-list"
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                >
                  {factionHistory.map((item, idx) => (
                    <div
                      key={idx}
                      data-testid={`faction-history-item-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        borderLeft: `3px solid ${item.delta >= 0 ? '#10b981' : '#ef4444'}`,
                        fontSize: '0.82rem',
                      }}
                    >
                      <span>{item.reason}</span>
                      <strong
                        style={{
                          color: item.delta >= 0 ? '#34d399' : '#f87171',
                          flexShrink: 0,
                          marginLeft: '1rem',
                        }}
                      >
                        {item.delta >= 0 ? `+${item.delta}` : item.delta}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
