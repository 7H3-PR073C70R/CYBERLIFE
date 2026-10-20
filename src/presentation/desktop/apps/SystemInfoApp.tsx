/**
 * Cyberlife — System Information Application Component (Orion OS)
 *
 * Displays read-only fictional workstation specifications, kernel details,
 * and virtual network node status.
 *
 * SAFETY INVARIANT:
 * Never exposes real host machine, browser, or OS details.
 */

import React from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { OS_NAME, OS_VERSION, OS_BRANDING, KERNEL_STRING, HOSTNAMES } from '../osBranding';
import { OsIcon } from '../icons/OsIcons';

export interface SystemInfoAppProps {
  workstationId?: string;
}

export const SystemInfoApp: React.FC<SystemInfoAppProps> = ({
  workstationId = 'interact_cedarline_workstation',
}) => {
  const sim = useOptionalSimulation();
  const isCedarline = workstationId.includes('cedarline');

  const simTime = sim?.state.time.calendar ?? {
    timeString: '08:00 AM',
    dateString: 'Monday, Oct 12, 2026',
    dayOfWeek: 'Monday',
  };

  const hostname = isCedarline ? `${HOSTNAMES.office}.corp.local` : `${HOSTNAMES.home}.local`;

  const user = isCedarline
    ? 'tade_adebayo (Security Analyst Intern — Cedarline Services)'
    : 'player (Independent Security Researcher)';

  const subnet = isCedarline
    ? '10.0.4.15 / 24 (Marina Tower Corporate Subnet)'
    : '192.168.1.104 / 24 (Apartment Local Network)';

  const osLabel = `${OS_NAME} ${OS_VERSION} (${OS_BRANDING.edition} Edition)`;

  return (
    <div
      className="system-info-container"
      role="region"
      aria-label="Workstation System Information"
      data-testid="system-info-container"
    >
      {/* Header Banner */}
      <div className="system-info-header">
        <div className="sys-badge-icon" aria-hidden="true">
          <OsIcon name="systemInfo" size={24} color="#00e5ff" />
        </div>
        <div>
          <h2 className="sys-main-title">{hostname}</h2>
          <div className="sys-sub-title">{osLabel}</div>
        </div>
      </div>

      {/* Safety Notice Card */}
      <div className="sys-safety-notice">
        <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
          <OsIcon name="lock" size={16} color="#00e676" />
        </span>
        <span>
          <strong>In-Game Simulated Node:</strong> All hardware specs, IP addresses, and kernel
          parameters are fictional constructs managed by Cyberlife&apos;s authoritative simulation.
        </span>
      </div>

      {/* Properties Table */}
      <div className="system-info-grid">
        <div className="sys-row">
          <span className="sys-key">Operating System</span>
          <span className="sys-val">{osLabel}</span>
        </div>
        <div className="sys-row">
          <span className="sys-key">Kernel Architecture</span>
          <span className="sys-val">Linux {KERNEL_STRING}</span>
        </div>
        <div className="sys-row">
          <span className="sys-key">Authenticated User</span>
          <span className="sys-val">{user}</span>
        </div>
        <div className="sys-row">
          <span className="sys-key">Virtual IP Address</span>
          <span className="sys-val">
            <code>{subnet}</code>
          </span>
        </div>
        <div className="sys-row">
          <span className="sys-key">Physical Location</span>
          <span className="sys-val">
            {isCedarline
              ? 'Cedarline Services HQ, Marina Road, Lagos Island'
              : 'Player Apartment, Broad Street 14, Lagos Island'}
          </span>
        </div>
        <div className="sys-row">
          <span className="sys-key">Simulation Clock</span>
          <span className="sys-val" data-testid="sys-info-clock">
            {simTime.dateString} at {simTime.timeString} WAT
          </span>
        </div>
        <div className="sys-row">
          <span className="sys-key">Simulation State Revision</span>
          <span className="sys-val">
            rev {sim ? sim.state.metadata.revision : 1} (Schema v
            {sim ? sim.state.metadata.schemaVersion : 1})
          </span>
        </div>
        <div className="sys-row">
          <span className="sys-key">Host Machine Isolation</span>
          <span className="sys-val status-safe">ACTIVE // 100% Synthetic Sandbox</span>
        </div>
      </div>
    </div>
  );
};
