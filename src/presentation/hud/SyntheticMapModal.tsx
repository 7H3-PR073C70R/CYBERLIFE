import React, { useState, useEffect, useMemo } from 'react';

export interface MapMarker {
  id: string;
  name: string;
  type: 'home' | 'office' | 'player' | 'transit' | 'market';
  label: string;
  sublabel: string;
  xPercent: number; // 0 - 100 on synthetic map grid
  yPercent: number; // 0 - 100 on synthetic map grid
  color: string;
  icon: string;
  description: string;
}

export interface SyntheticMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationName?: string;
  playerCoords?: { x: number; z: number };
}

export const SyntheticMapModal: React.FC<SyntheticMapModalProps> = ({
  isOpen,
  onClose,
  currentLocationName = 'Lagos Island – Broad Street & Marina',
  playerCoords = { x: 0, z: 10 },
}) => {
  // Live tracked coordinates: combines React prop with real-time 3D simulation telemetry
  const [liveCoords, setLiveCoords] = useState<{ x: number; z: number }>(playerCoords);

  useEffect(() => {
    setLiveCoords(playerCoords);
  }, [playerCoords.x, playerCoords.z]);

  // Real-time 10Hz position polling while map is open to ensure 100% fluid movement tracking
  useEffect(() => {
    if (!isOpen) return;

    const readLivePosition = () => {
      const worldMgr = (window as unknown as Record<string, unknown>)?.__CYBERLIFE_WORLD_MANAGER__ as
        | {
            getPlayerPosition?: () => { x: number; y: number; z: number };
            getCurrentLocation?: () => { id: string };
          }
        | undefined;
      if (worldMgr) {
        const loc = worldMgr.getCurrentLocation?.();
        if (loc?.id === 'apartment_interior') {
          setLiveCoords({ x: -12.0, z: -14.0 });
          return;
        }
        if (loc?.id === 'cedarline_interior') {
          setLiveCoords({ x: 18.0, z: 6.0 });
          return;
        }
        if (typeof worldMgr.getPlayerPosition === 'function') {
          const pos = worldMgr.getPlayerPosition();
          if (pos && typeof pos.x === 'number' && typeof pos.z === 'number') {
            setLiveCoords({ x: pos.x, z: pos.z });
          }
        }
      }
    };

    readLivePosition();
    const interval = setInterval(readLivePosition, 100);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Global Escape key listener for immediate responsive modal dismissal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  // Map 3D world coordinates (-35..35, -35..35) to synthetic vector radar percentage (15%..85%)
  const playerPos = useMemo(() => {
    const normX = (liveCoords.x + 35) / 70;
    const normZ = (liveCoords.z + 35) / 70;
    const xPct = Math.min(Math.max(15 + normX * 70, 8), 92);
    const yPct = Math.min(Math.max(14 + normZ * 70, 8), 92);
    return {
      x: Math.round(xPct * 10) / 10,
      y: Math.round(yPct * 10) / 10,
    };
  }, [liveCoords.x, liveCoords.z]);

  if (!isOpen) return null;

  const markers: MapMarker[] = [
    {
      id: 'marker-home',
      name: 'Player Studio Apartment',
      type: 'home',
      label: 'HOME',
      sublabel: 'Broad Street 14, Apt 4B',
      xPercent: 38,
      yPercent: 35,
      color: '#f59e0b',
      icon: '🏠',
      description: 'Your safehouse residence, backup flash drives, and personal workstation rig.',
    },
    {
      id: 'marker-office',
      name: 'Cedarline Services Corporate HQ',
      type: 'office',
      label: 'OFFICES',
      sublabel: 'Marina Tower, 14th Floor SOC',
      xPercent: 68,
      yPercent: 55,
      color: '#00e5ff',
      icon: '🏢',
      description: 'Cedarline Security Operations Center (SOC) — central site of the Aster AI incident.',
    },
    {
      id: 'marker-market',
      name: 'Balogun Market & Tech Hub',
      type: 'market',
      label: 'MARKET',
      sublabel: 'Hardware & Mobile Alley',
      xPercent: 70,
      yPercent: 34,
      color: '#10b981',
      icon: '🛍️',
      description: 'Hardware modders, burner cables, SIM merchants, and local tech traders.',
    },
    {
      id: 'marker-transit',
      name: 'CMS Marina Ferry & Transit Hub',
      type: 'transit',
      label: 'TRANSIT',
      sublabel: 'Waterfront Jetty & Esplanade',
      xPercent: 50,
      yPercent: 78,
      color: '#38bdf8',
      icon: '🛥️',
      description: 'Primary transportation artery connecting Lagos Island, Victoria Island, and the Mainland.',
    },
    {
      id: 'marker-player',
      name: 'Current Player Location',
      type: 'player',
      label: 'YOU ARE HERE',
      sublabel: `X: ${liveCoords.x.toFixed(1)}m, Z: ${liveCoords.z.toFixed(1)}m`,
      xPercent: playerPos.x,
      yPercent: playerPos.y,
      color: '#ec4899',
      icon: '📍',
      description: `Active geolocation telemetry: ${currentLocationName} (Sector B-4, Pos: [${liveCoords.x.toFixed(1)}, ${liveCoords.z.toFixed(1)}])`,
    },
  ];

  return (
    <div
      className="synthetic-map-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Synthetic Geolocation Tactical Map"
      data-testid="synthetic-map-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(4, 8, 16, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.2rem',
        pointerEvents: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="synthetic-map-card"
        style={{
          width: '840px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          backgroundColor: 'rgba(10, 18, 30, 0.98)',
          border: '1px solid rgba(0, 229, 255, 0.4)',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 229, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.4rem',
            borderBottom: '1px solid rgba(0, 229, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(0, 229, 255, 0.1) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🗺️</span>
            <div>
              <h2
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#00e5ff',
                  textTransform: 'uppercase',
                  margin: 0,
                  fontFamily: 'monospace',
                }}
              >
                Lagos Island Tactical Geolocation Map
              </h2>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <span>6.4531° N, 3.3958° E</span>
                <span>•</span>
                <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
                  Grid X: {liveCoords.x.toFixed(1)}m, Z: {liveCoords.z.toFixed(1)}m
                </span>
                <span>•</span>
                <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 6px #10b981',
                    }}
                  />
                  Live Tracking Active
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close synthetic map"
            data-testid="synthetic-map-close-btn"
            className="synthetic-map-close-btn btn-icon-close"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              borderRadius: '6px',
              width: '38px',
              height: '38px',
              minWidth: '38px',
              minHeight: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 700,
              pointerEvents: 'auto',
              transition: 'all 0.15s ease',
            }}
          >
            ✕
          </button>
        </div>

        {/* Map Display & Radar Canvas */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '420px',
            backgroundColor: '#040810',
            overflow: 'hidden',
          }}
        >
          {/* Synthetic Vector Grid Overlay */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 840 420"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none' }}
          >
            <defs>
              <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#radarGrid)" />

            {/* Marina Coastline Contour */}
            <path
              d="M 0 350 Q 240 330, 420 360 T 840 340 L 840 420 L 0 420 Z"
              fill="rgba(3, 105, 161, 0.25)"
              stroke="rgba(56, 189, 248, 0.6)"
              strokeWidth="2"
            />
            <text x="360" y="390" fill="#38bdf8" fontSize="12" fontWeight="700" letterSpacing="4" opacity="0.6">
              LAGOS LAGOON / WATERFRONT
            </text>

            {/* Main Road Avenues */}
            {/* Broad Street (Vertical Centerline at x=420) */}
            <line x1="420" y1="20" x2="420" y2="350" stroke="rgba(250, 204, 21, 0.45)" strokeWidth="8" />
            <line x1="420" y1="20" x2="420" y2="350" stroke="#facc15" strokeWidth="1.5" strokeDasharray="6 6" />

            {/* Marina Road (Horizontal Avenue along Waterfront at y=290) */}
            <line x1="20" y1="290" x2="820" y2="290" stroke="rgba(250, 204, 21, 0.45)" strokeWidth="8" />
            <line x1="20" y1="290" x2="820" y2="290" stroke="#facc15" strokeWidth="1.5" strokeDasharray="6 6" />

            {/* Balogun Lane (Horizontal branch east from Broad Street at y=145) */}
            <line x1="420" y1="145" x2="780" y2="145" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="5" />
          </svg>

          {/* Interactive Markers */}
          {markers.map(m => (
            <div
              key={m.id}
              data-testid={`map-marker-${m.type}`}
              style={{
                position: 'absolute',
                left: `${m.xPercent}%`,
                top: `${m.yPercent}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: m.type === 'player' ? 25 : 10,
                transition: m.type === 'player' ? 'left 0.15s linear, top 0.15s linear' : 'none',
              }}
            >
              <div
                style={{
                  width: m.type === 'player' ? '36px' : '28px',
                  height: m.type === 'player' ? '36px' : '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(10, 18, 30, 0.95)',
                  border: `2px solid ${m.color}`,
                  boxShadow: `0 0 16px ${m.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: m.type === 'player' ? '1.15rem' : '0.9rem',
                  animation: m.type === 'player' ? 'pulse 2s infinite' : 'none',
                }}
              >
                {m.icon}
              </div>
              <div
                style={{
                  marginTop: '4px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(4, 8, 16, 0.88)',
                  border: `1px solid ${m.color}88`,
                  color: m.color,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                }}
              >
                {m.label}
              </div>
            </div>
          ))}

          {/* Radar Sweep Animation Line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '450px',
              height: '450px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: '1px solid rgba(0, 229, 255, 0.15)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Legend / Key Locations Summary */}
        <div
          style={{
            padding: '1rem 1.4rem',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.8rem',
          }}
        >
          {markers.map(m => (
            <div
              key={m.id}
              style={{
                padding: '0.5rem',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '6px',
                borderLeft: `3px solid ${m.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>{m.icon}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
                  {m.name}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                {m.sublabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
