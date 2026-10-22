import React from 'react';

export type OsIconName =
  | 'terminal'
  | 'fieldGuide'
  | 'systemInfo'
  | 'notes'
  | 'activity'
  | 'incident'
  | 'contacts'
  | 'career'
  | 'saveManager'
  | 'helpCenter'
  | 'catalogue'
  | 'files'
  | 'packetLens'
  | 'revLens'
  | 'ruleTuner'
  | 'home'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'trash'
  | 'network'
  | 'volume'
  | 'battery'
  | 'power'
  | 'lock'
  | 'search'
  | 'folder'
  | 'settings'
  | 'minimize'
  | 'maximize'
  | 'restore'
  | 'close'
  | 'chevronRight'
  | 'chevronDown'
  | 'osLogo'
  | 'tor'
  | 'chat'
  | 'call'
  | 'securityNews'
  | 'exploitLab'
  | 'webProxy'
  | 'socialPretext'
  | 'defensiveOps'
  | 'bountyHub'
  | 'humanIntel';


export interface OsIconProps extends React.SVGProps<SVGSVGElement> {
  name: OsIconName;
  size?: number;
  className?: string;
  color?: string;
}

export const OsIcon: React.FC<OsIconProps> = ({
  name,
  size = 16,
  className = '',
  color = 'currentColor',
  style,
  ...props
}) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: `os-icon os-icon-${name} ${className}`.trim(),
    style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style },
    ...props,
  };

  switch (name) {
    case 'terminal':
      return (
        <svg {...commonProps}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );

    case 'fieldGuide':
      return (
        <svg {...commonProps}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="10" y1="7" x2="16" y2="7" />
          <line x1="10" y1="11" x2="14" y2="11" />
        </svg>
      );

    case 'systemInfo':
    case 'settings':
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="15" x2="23" y2="15" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="15" x2="4" y2="15" />
        </svg>
      );

    case 'notes':
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );

    case 'activity':
      return (
        <svg {...commonProps}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );

    case 'incident':
      return (
        <svg {...commonProps}>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );

    case 'contacts':
      return (
        <svg {...commonProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case 'career':
      return (
        <svg {...commonProps}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );

    case 'saveManager':
      return (
        <svg {...commonProps}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      );

    case 'helpCenter':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );

    case 'catalogue':
      return (
        <svg {...commonProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case 'files':
    case 'folder':
      return (
        <svg {...commonProps}>
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        </svg>
      );

    case 'packetLens':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
          <line x1="12" y1="2" x2="12" y2="12" />
        </svg>
      );

    case 'revLens':
      return (
        <svg {...commonProps}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
      );

    case 'ruleTuner':
      return (
        <svg {...commonProps}>
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      );

    case 'home':
      return (
        <svg {...commonProps}>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );

    case 'desktop':
      return (
        <svg {...commonProps}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );

    case 'documents':
      return (
        <svg {...commonProps}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );

    case 'downloads':
      return (
        <svg {...commonProps}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );

    case 'trash':
      return (
        <svg {...commonProps}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );

    case 'network':
      return (
        <svg {...commonProps}>
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      );

    case 'volume':
      return (
        <svg {...commonProps}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      );

    case 'battery':
      return (
        <svg {...commonProps}>
          <rect x="1" y="6" width="18" height="12" rx="2" />
          <line x1="23" y1="11" x2="23" y2="13" />
          <line x1="5" y1="10" x2="5" y2="14" />
          <line x1="9" y1="10" x2="9" y2="14" />
          <line x1="13" y1="10" x2="13" y2="14" />
        </svg>
      );

    case 'power':
      return (
        <svg {...commonProps}>
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
          <line x1="12" y1="2" x2="12" y2="12" />
        </svg>
      );

    case 'lock':
      return (
        <svg {...commonProps}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );

    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );

    case 'minimize':
      return (
        <svg {...commonProps}>
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );

    case 'maximize':
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="1.5" />
        </svg>
      );

    case 'restore':
      return (
        <svg {...commonProps}>
          <rect x="8" y="4" width="12" height="12" rx="1" />
          <path d="M4 8v12h12" />
        </svg>
      );

    case 'close':
      return (
        <svg {...commonProps}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );

    case 'chevronRight':
      return (
        <svg {...commonProps}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );

    case 'chevronDown':
      return (
        <svg {...commonProps}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );

    case 'osLogo':
      return (
        <svg {...commonProps} viewBox="0 0 24 24" fill="none">
          <polygon
            points="12 2 21 8 21 16 12 22 3 16 3 8"
            stroke={color}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <polyline
            points="12 2 12 12 21 8"
            stroke={color}
            strokeWidth="1.25"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <polyline
            points="12 12 3 8"
            stroke={color}
            strokeWidth="1.25"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <line x1="12" y1="12" x2="12" y2="22" stroke={color} strokeWidth="1.25" opacity="0.8" />
          <circle cx="12" cy="12" r="2" fill={color} />
        </svg>
      );

    case 'tor':
      return (
        <svg {...commonProps}>
          {/* Onion layers */}
          <path d="M12 2v2" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
          <path
            d="M12 4C7 4 3 8 3 13c0 4.5 4 8 9 8s9-3.5 9-8c0-5-4-9-9-9z"
            stroke={color}
            strokeWidth="1.75"
          />
          <path
            d="M12 7c-3 0-5.5 2.5-5.5 6s2.5 5 5.5 5 5.5-2 5.5-5-2.5-6-5.5-6z"
            stroke={color}
            strokeWidth="1.5"
            opacity="0.85"
          />
          <path
            d="M12 10c-1.5 0-2.5 1.5-2.5 3s1 2.5 2.5 2.5 2.5-1 2.5-2.5-1-3-2.5-3z"
            stroke={color}
            strokeWidth="1.25"
            opacity="0.7"
          />
        </svg>
      );

    case 'chat':
      return (
        <svg {...commonProps}>
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke={color}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="9"
            x2="16"
            y2="9"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="8"
            y1="13"
            x2="13"
            y2="13"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'call':
      return (
        <svg {...commonProps}>
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            stroke={color}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'securityNews':
      return (
        <svg {...commonProps}>
          <path
            d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
            stroke={color}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path d="M18 14h-8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M15 18h-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 6h8v4h-8V6Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );

    case 'exploitLab':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.75" />
          <line x1="22" y1="12" x2="18" y2="12" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
          <line x1="6" y1="12" x2="2" y2="12" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
          <line x1="12" y1="6" x2="12" y2="2" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
          <line x1="12" y1="22" x2="12" y2="18" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" fill={color} />
        </svg>
      );

    case 'webProxy':
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="1.75" />
          <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="1.5" />
          <line x1="8" y1="7" x2="8.01" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="7" x2="12.01" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M7 15l3-3-3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="11" y1="15" x2="17" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'socialPretext':
      return (
        <svg {...commonProps}>
          <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" stroke={color} strokeWidth="1.75" />
          <path d="M3 21v-2a6 6 0 0 1 12 0v2" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="18" cy="8" r="3" stroke={color} strokeWidth="1.5" />
          <path d="M18 14a4 4 0 0 1 4 4v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'defensiveOps':
      return (
        <svg {...commonProps}>
          {/* Shield outline with inner security radar / pulse */}
          <path
            d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
            stroke={color}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M12 7v5l3 3"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'bountyHub':
      return (
        <svg {...commonProps}>
          {/* Target crosshair with central reward star */}
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.75" />
          <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.25" strokeDasharray="2 2" />
          <path d="M12 1v3M12 20v3M1 12h3M20 12h3" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <polygon points="12,9 13,11 15,11.3 13.5,12.7 14,15 12,13.8 10,15 10.5,12.7 9,11.3 11,11" fill={color} />
        </svg>
      );

    case 'humanIntel':
      return (
        <svg {...commonProps}>
          {/* Shield outline with human biometric / badge silhouette */}
          <path
            d="M12 2L4 5v6.5C4 17 7.5 21 12 22c4.5-1 8-5 8-10.5V5l-8-3z"
            fill="none"
            stroke={color}
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5" fill="none" />
          <path
            d="M7.5 17c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );

    default:

      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};
