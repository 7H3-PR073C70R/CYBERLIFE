import React from 'react';

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
  playerCoords = { x: 0, z: 0 },
}) => {
  if (!isOpen) return null;

  // Map world coordinates (-40..40, -40..40) to percentage (10%..90%)
  const mapWorldToMapPercent = (worldX: number, worldZ: number) => {
    const xPct = Math.min(Math.max(((worldX + 35) / 70) * 100, 8), 92);
    const yPct = Math.min(Math.max(((worldZ + 35) / 70) * 100, 8), 92);
    return { x: xPct, y: yPct };
  };

  const playerPos = mapWorldToMapPercent(playerCoords.x, playerCoords.z);

  const markers: MapMarker[] = [
    {
      id: 'marker-home',
      name: 'Player Studio Apartment',
      type: 'home',
      label: 'HOME',
      sublabel: 'Broad Street 14, Apt 4B',
      xPercent: 26,
      yPercent: 30,
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
      xPercent: 74,
      yPercent: 58,
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
      xPercent: 78,
      yPercent: 28,
      color: '#10b981',
      icon: '🛍️',
      description: 'Hardware modders, burner cables, SIM merchants, and local tech traders.',
    },
    {
      id: 'marker-transit',
      name: 'CMS Marina Ferry & Transit Hub',
      type: 'transit',
      label: 'TRANSIT',
      sublabel: 'Waterfront Jetty & Bus Park',
      xPercent: 50,
      yPercent: 88,
      color: '#38bdf8',
      icon: '🛥️',
      description: 'Primary transportation artery connecting Lagos Island, Victoria Island, and the Mainland.',
    },
    {
      id: 'marker-player',
      name: 'Current Player Location',
      type: 'player',
      label: 'YOU ARE HERE',
      sublabel: currentLocationName,
      xPercent: playerPos.x,
      yPercent: playerPos.y,
      color: '#ec4899',
      icon: '📍',
      description: `Active geolocation telemetry: ${currentLocationName} (Sector B-4)`,
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
        backgroundColor: 'rgba(4, 8, 16, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 900,
        padding: '1.2rem',
      }}
      onClick={onClose}
    >
      <div
        className="synthetic-map-card"
        style={{
          width: '840px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          backgroundColor: 'rgba(10, 18, 30, 0.96)',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 229, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.4rem',
            borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(0, 229, 255, 0.08) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🗺️</span>
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
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Coordinates: 6.4531° N, 3.3958° E • Elevation: 4m ASL • Marina Subnet 10.0.4.0/24
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close synthetic map"
            data-testid="synthetic-map-close-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              borderRadius: '6px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 700,
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
            {/* Broad Street (Vertical) */}
            <line x1="380" y1="20" x2="380" y2="350" stroke="rgba(250, 204, 21, 0.45)" strokeWidth="8" />
            <line x1="380" y1="20" x2="380" y2="350" stroke="#facc15" strokeWidth="1.5" strokeDasharray="6 6" />

            {/* Marina Road (Horizontal) */}
            <line x1="20" y1="330" x2="820" y2="330" stroke="rgba(250, 204, 21, 0.45)" strokeWidth="8" />
            <line x1="20" y1="330" x2="820" y2="330" stroke="#facc15" strokeWidth="1.5" strokeDasharray="6 6" />

            {/* Balogun Lane (Horizontal branch) */}
            <line x1="380" y1="120" x2="780" y2="120" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="4" />
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
                zIndex: m.type === 'player' ? 20 : 10,
              }}
            >
              <div
                style={{
                  width: m.type === 'player' ? '34px' : '28px',
                  height: m.type === 'player' ? '34px' : '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(10, 18, 30, 0.9)',
                  border: `2px solid ${m.color}`,
                  boxShadow: `0 0 14px ${m.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: m.type === 'player' ? '1.1rem' : '0.9rem',
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
                  backgroundColor: 'rgba(4, 8, 16, 0.85)',
                  border: `1px solid ${m.color}66`,
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
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
