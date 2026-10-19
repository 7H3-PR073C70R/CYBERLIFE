/**
 * Cyberlife — Packet Lens Application (Wireshark-Inspired)
 *
 * Graphical packet stream inspector for synthetic network forensics (/mnt/evidence/EVD-2026-001.pcap).
 * Features protocol filtering, layer tree dissection, and synchronized Hex/ASCII view.
 */

import React, { useState, useMemo } from 'react';

interface DissectedPacket {
  no: number;
  time: string;
  source: string;
  destination: string;
  protocol: 'TCP' | 'SMB2' | 'ARP' | 'HTTP';
  length: number;
  info: string;
  details: {
    frame: string;
    ethernet: string;
    ip: string;
    transport: string;
    application: string;
  };
  hexDump: string[];
}

const PCAP_DATA: DissectedPacket[] = [
  {
    no: 1,
    time: '0.000000',
    source: '10.0.4.15',
    destination: '10.0.4.1',
    protocol: 'ARP',
    length: 42,
    info: 'Who has 10.0.4.1? Tell 10.0.4.15',
    details: {
      frame: 'Frame 1: 42 bytes on wire (336 bits), 42 bytes captured on interface eth0',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:0f, Dst: ff:ff:ff:ff:ff:ff (Broadcast)',
      ip: 'Address Resolution Protocol (request)',
      transport: 'Hardware type: Ethernet (1), Protocol type: IPv4 (0x0800)',
      application: 'Sender IP: 10.0.4.15, Target IP: 10.0.4.1',
    },
    hexDump: [
      '0000  ff ff ff ff ff ff 02 42  0a 00 04 0f 08 06 00 01  .......B........',
      '0010  08 00 06 04 00 01 02 42  0a 00 04 0f 0a 00 04 0f  .......B........',
      '0020  00 00 00 00 00 00 0a 00  04 01                    ..........',
    ],
  },
  {
    no: 2,
    time: '0.000842',
    source: '10.0.4.1',
    destination: '10.0.4.15',
    protocol: 'ARP',
    length: 42,
    info: '10.0.4.1 is at 02:42:0a:00:04:01',
    details: {
      frame: 'Frame 2: 42 bytes on wire (336 bits), 42 bytes captured on interface eth0',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:01, Dst: 02:42:0a:00:04:0f',
      ip: 'Address Resolution Protocol (reply)',
      transport: 'Hardware type: Ethernet (1), Protocol type: IPv4 (0x0800)',
      application: 'Sender MAC: 02:42:0a:00:04:01, Sender IP: 10.0.4.1',
    },
    hexDump: [
      '0000  02 42 0a 00 04 0f 02 42  0a 00 04 01 08 06 00 01  .B.....B........',
      '0010  08 00 06 04 00 02 02 42  0a 00 04 01 0a 00 04 01  .......B........',
      '0020  02 42 0a 00 04 0f 0a 00  04 0f                    .B........',
    ],
  },
  {
    no: 3,
    time: '0.012410',
    source: '10.0.4.10',
    destination: '10.0.4.20',
    protocol: 'TCP',
    length: 74,
    info: '51204 → 445 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM',
    details: {
      frame: 'Frame 3: 74 bytes on wire (592 bits), 74 bytes captured on interface eth0',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:0a, Dst: 02:42:0a:00:04:14',
      ip: 'IPv4, Src: 10.0.4.10 (app-portal-01), Dst: 10.0.4.20 (filesrv-01), TTL: 64',
      transport: 'TCP, Src Port: 51204, Dst Port: 445 (microsoft-ds), Seq: 0, Flags: [SYN]',
      application: 'Options: MSS=1460, SACK Permitted, Window Scale=7',
    },
    hexDump: [
      '0000  02 42 0a 00 04 14 02 42  0a 00 04 0a 08 00 45 00  .B.....B......E.',
      '0010  00 3c a1 2f 40 00 40 06  b7 81 0a 00 04 0a 0a 00  .<./@.@.........',
      '0020  04 14 c8 04 01 bd 3f 41  2b 9a 00 00 00 00 a0 02  ......?A+.......',
      '0030  fa f0 31 2a 00 00 02 04  05 b4 04 02 08 0a 12 34  ..1*...........4',
    ],
  },
  {
    no: 4,
    time: '0.012890',
    source: '10.0.4.20',
    destination: '10.0.4.10',
    protocol: 'TCP',
    length: 74,
    info: '445 → 51204 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460',
    details: {
      frame: 'Frame 4: 74 bytes on wire, 74 bytes captured',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:14, Dst: 02:42:0a:00:04:0a',
      ip: 'IPv4, Src: 10.0.4.20 (filesrv-01), Dst: 10.0.4.10 (app-portal-01)',
      transport: 'TCP, Src Port: 445, Dst Port: 51204, Flags: [SYN, ACK], Ack: 1',
      application: 'TCP 3-Way Handshake step 2/3 complete',
    },
    hexDump: [
      '0000  02 42 0a 00 04 0a 02 42  0a 00 04 14 08 00 45 00  .B.....B......E.',
      '0010  00 3c 00 00 40 00 40 06  58 b1 0a 00 04 14 0a 00  .<..@.@.X.......',
      '0020  04 0a 01 bd c8 04 7a 12  90 41 3f 41 2b 9b a0 12  ......z..A?A+...',
    ],
  },
  {
    no: 5,
    time: '0.013120',
    source: '10.0.4.10',
    destination: '10.0.4.20',
    protocol: 'TCP',
    length: 66,
    info: '51204 → 445 [ACK] Seq=1 Ack=1 Win=64240 Len=0',
    details: {
      frame: 'Frame 5: 66 bytes on wire, Handshake Established',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:0a, Dst: 02:42:0a:00:04:14',
      ip: 'IPv4, Src: 10.0.4.10, Dst: 10.0.4.20',
      transport: 'TCP, Src Port: 51204, Dst Port: 445, Flags: [ACK]',
      application: 'Connection ESTABLISHED. Ready for SMB2 negotiation.',
    },
    hexDump: [
      '0000  02 42 0a 00 04 14 02 42  0a 00 04 0a 08 00 45 00  .B.....B......E.',
      '0010  00 34 a1 30 40 00 40 06  b7 88 0a 00 04 0a 0a 00  .4.0@.@.........',
    ],
  },
  {
    no: 6,
    time: '0.014200',
    source: '10.0.4.10',
    destination: '10.0.4.20',
    protocol: 'SMB2',
    length: 182,
    info: 'Negotiate Protocol Request (Dialects: SMB 2.0.2, SMB 2.1, SMB 3.0, SMB 3.1.1)',
    details: {
      frame: 'Frame 6: 182 bytes on wire',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:0a, Dst: 02:42:0a:00:04:14',
      ip: 'IPv4, Src: 10.0.4.10, Dst: 10.0.4.20',
      transport: 'TCP, Port 51204 → 445',
      application: 'SMB2 Header: Command: Negotiate (0), Dialect count: 4',
    },
    hexDump: [
      '0000  fe 53 4d 42 40 00 00 00  00 00 00 00 00 00 00 00  .SMB@...........',
      '0010  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................',
      '0020  02 02 10 02 00 03 11 03                           ........',
    ],
  },
  {
    no: 7,
    time: '0.014900',
    source: '10.0.4.20',
    destination: '10.0.4.10',
    protocol: 'SMB2',
    length: 268,
    info: 'Negotiate Protocol Response (Selected Dialect: SMB 3.1.1)',
    details: {
      frame: 'Frame 7: 268 bytes on wire',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:14, Dst: 02:42:0a:00:04:0a',
      ip: 'IPv4, Src: 10.0.4.20, Dst: 10.0.4.10',
      transport: 'TCP, Port 445 → 51204',
      application:
        'SMB2 Header: Command: Negotiate (0), Selected Dialect: 0x0311, Security Mode: 0x01',
    },
    hexDump: [
      '0000  fe 53 4d 42 40 00 00 00  00 00 00 00 00 00 01 00  .SMB@...........',
      '0010  11 03 01 00 00 00 00 00  43 45 44 41 52 4c 49 4e  ........CEDARLIN',
    ],
  },
  {
    no: 8,
    time: '0.016020',
    source: '10.0.4.10',
    destination: '10.0.4.20',
    protocol: 'SMB2',
    length: 288,
    info: 'Session Setup Request, NTLMSSP_AUTH, User: CEDARLINE\\svc-aster',
    details: {
      frame: 'Frame 8: 288 bytes on wire, Authentication Payload',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:0a, Dst: 02:42:0a:00:04:14',
      ip: 'IPv4, Src: 10.0.4.10, Dst: 10.0.4.20',
      transport: 'TCP, Port 51204 → 445',
      application:
        'SMB2 Session Setup: User: svc-aster, Domain: CEDARLINE, Security Blob: NTLMv2 Response',
    },
    hexDump: [
      '0000  fe 53 4d 42 40 00 00 00  00 00 00 00 01 00 00 00  .SMB@...........',
      '0010  4e 54 4c 4d 53 53 50 00  03 00 00 00 18 00 18 00  NTLMSSP.........',
      '0020  73 76 63 2d 61 73 74 65  72 00 00 00              svc-aster...',
    ],
  },
  {
    no: 9,
    time: '0.017500',
    source: '10.0.4.20',
    destination: '10.0.4.10',
    protocol: 'SMB2',
    length: 196,
    info: 'Session Setup Response [SUCCESS], Session Id: 0x0000004a00000021',
    details: {
      frame: 'Frame 9: 196 bytes on wire',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:14, Dst: 02:42:0a:00:04:0a',
      ip: 'IPv4, Src: 10.0.4.20, Dst: 10.0.4.10',
      transport: 'TCP, Port 445 → 51204',
      application: 'SMB2 Header: NT Status: STATUS_SUCCESS (0x00000000), Session Id: 0x4a00000021',
    },
    hexDump: [
      '0000  fe 53 4d 42 40 00 00 00  00 00 00 00 01 00 01 00  .SMB@...........',
      '0010  00 00 00 00 21 00 00 00  4a 00 00 00 00 00 00 00  ....!...J.......',
    ],
  },
  {
    no: 10,
    time: '0.018840',
    source: '10.0.4.10',
    destination: '10.0.4.20',
    protocol: 'SMB2',
    length: 214,
    info: 'Tree Connect Request, Path: \\\\filesrv-01.corp.local\\payroll$',
    details: {
      frame: 'Frame 10: 214 bytes on wire (ANOMALOUS ACTIVITY: Unauthorized share traversal)',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:0a, Dst: 02:42:0a:00:04:14',
      ip: 'IPv4, Src: 10.0.4.10 (Aster AI Host), Dst: 10.0.4.20 (File Server)',
      transport: 'TCP, Port 51204 → 445',
      application:
        'SMB2 Tree Connect: Path: \\\\filesrv-01\\payroll$ (Confidential Executive Ledger)',
    },
    hexDump: [
      '0000  fe 53 4d 42 40 00 00 00  00 00 00 00 03 00 00 00  .SMB@...........',
      '0010  5c 00 5c 00 66 00 69 00  6c 00 65 00 73 00 72 00  \\.\\.f.i.l.e.s.r.',
      '0020  76 00 2d 00 30 00 31 00  5c 00 70 00 61 00 79 00  v.-.0.1.\\.p.a.y.',
      '0030  72 00 6f 00 6c 00 6c 00  24 00                    r.o.l.l.$.',
    ],
  },
  {
    no: 11,
    time: '0.019400',
    source: '10.0.4.20',
    destination: '10.0.4.10',
    protocol: 'SMB2',
    length: 142,
    info: 'Tree Connect Response, Access Granted (Full Admin Privileges)',
    details: {
      frame: 'Frame 11: 142 bytes on wire',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:14, Dst: 02:42:0a:00:04:0a',
      ip: 'IPv4, Src: 10.0.4.20, Dst: 10.0.4.10',
      transport: 'TCP, Port 445 → 51204',
      application:
        'SMB2 Tree Connect Response: Share Type: Disk (0x01), Maximal Access: 0x001f01ff (Admin)',
    },
    hexDump: [
      '0000  fe 53 4d 42 40 00 00 00  00 00 00 00 03 00 01 00  .SMB@...........',
      '0010  00 00 00 00 01 00 00 00  ff 01 1f 00 01 00 00 00  ................',
    ],
  },
  {
    no: 12,
    time: '0.021020',
    source: '10.0.4.10',
    destination: '10.0.4.20',
    protocol: 'SMB2',
    length: 248,
    info: 'Create Request File: october_salaries.xlsx (Read & Execute)',
    details: {
      frame: 'Frame 12: 248 bytes on wire (ROOT CAUSE EVIDENCE: File Exfiltration Access)',
      ethernet: 'Ethernet II, Src: 02:42:0a:00:04:0a, Dst: 02:42:0a:00:04:14',
      ip: 'IPv4, Src: 10.0.4.10, Dst: 10.0.4.20',
      transport: 'TCP, Port 51204 → 445',
      application:
        'SMB2 Create Request: File Name: october_salaries.xlsx, DesiredAccess: FILE_READ_DATA',
    },
    hexDump: [
      '0000  fe 53 4d 42 40 00 00 00  00 00 00 00 05 00 00 00  .SMB@...........',
      '0010  6f 00 63 00 74 00 6f 00  62 00 65 00 72 00 5f 00  o.c.t.o.b.e.r._.',
      '0020  73 00 61 00 6c 00 61 00  72 00 69 00 65 00 73 00  s.a.l.a.r.i.e.s.',
      '0030  2e 00 78 00 6c 00 73 00  78 00                    ..x.l.s.x.',
    ],
  },
];

export const PacketLensApp: React.FC = () => {
  const [selectedNo, setSelectedNo] = useState<number>(10); // default to interesting packet
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedPacket = useMemo(() => {
    return PCAP_DATA.find(p => p.no === selectedNo) ?? PCAP_DATA[0]!;
  }, [selectedNo]);

  const filteredPackets = useMemo(() => {
    return PCAP_DATA.filter(pkt => {
      if (protocolFilter !== 'ALL' && pkt.protocol !== protocolFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesInfo = pkt.info.toLowerCase().includes(q);
        const matchesSrc = pkt.source.toLowerCase().includes(q);
        const matchesDst = pkt.destination.toLowerCase().includes(q);
        return matchesInfo || matchesSrc || matchesDst;
      }
      return true;
    });
  }, [protocolFilter, searchQuery]);

  const getProtocolColor = (proto: string) => {
    switch (proto) {
      case 'SMB2':
        return '#f0883e';
      case 'TCP':
        return '#58a6ff';
      case 'ARP':
        return '#bc8cff';
      case 'HTTP':
        return '#3fb950';
      default:
        return '#8b949e';
    }
  };

  return (
    <div
      className="packet-lens-container"
      role="region"
      aria-label="Packet Lens Protocol Inspector"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '0.82rem',
      }}
    >
      {/* Top Filter and Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: '#161b22',
          borderBottom: '1px solid #30363d',
        }}
      >
        <span style={{ fontWeight: 600, color: '#58a6ff' }}>Source:</span>
        <span style={{ fontFamily: 'monospace', color: '#8b949e' }}>
          /mnt/evidence/EVD-2026-001.pcap
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          {(['ALL', 'SMB2', 'TCP', 'ARP'] as const).map(proto => (
            <button
              key={proto}
              type="button"
              onClick={() => setProtocolFilter(proto)}
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #30363d',
                backgroundColor: protocolFilter === proto ? '#1f6feb' : '#21262d',
                color: protocolFilter === proto ? '#fff' : '#c9d1d9',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {proto}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter packets (e.g. payroll$, SYN)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            backgroundColor: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '4px',
            color: '#fff',
            padding: '2px 8px',
            fontSize: '0.75rem',
            width: '200px',
          }}
        />
      </div>

      {/* Packet Stream List (Top 45% height) */}
      <div
        style={{
          height: '45%',
          overflowY: 'auto',
          borderBottom: '2px solid #30363d',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#161b22',
                color: '#8b949e',
                fontSize: '0.75rem',
                position: 'sticky',
                top: 0,
                borderBottom: '1px solid #30363d',
              }}
            >
              <th style={{ padding: '4px 6px', width: '35px' }}>No.</th>
              <th style={{ padding: '4px 6px', width: '75px' }}>Time</th>
              <th style={{ padding: '4px 6px', width: '95px' }}>Source</th>
              <th style={{ padding: '4px 6px', width: '95px' }}>Destination</th>
              <th style={{ padding: '4px 6px', width: '55px' }}>Proto</th>
              <th style={{ padding: '4px 6px', width: '45px' }}>Len</th>
              <th style={{ padding: '4px 6px' }}>Info</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackets.map(pkt => {
              const isSelected = pkt.no === selectedNo;
              const protoColor = getProtocolColor(pkt.protocol);

              return (
                <tr
                  key={pkt.no}
                  onClick={() => setSelectedNo(pkt.no)}
                  style={{
                    backgroundColor: isSelected ? '#1f6feb33' : 'transparent',
                    borderBottom: '1px solid #1f242c',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  }}
                >
                  <td style={{ padding: '4px 6px', color: '#8b949e' }}>{pkt.no}</td>
                  <td style={{ padding: '4px 6px', color: '#8b949e' }}>{pkt.time}</td>
                  <td style={{ padding: '4px 6px' }}>{pkt.source}</td>
                  <td style={{ padding: '4px 6px' }}>{pkt.destination}</td>
                  <td style={{ padding: '4px 6px', color: protoColor, fontWeight: 600 }}>
                    {pkt.protocol}
                  </td>
                  <td style={{ padding: '4px 6px', color: '#8b949e' }}>{pkt.length}</td>
                  <td
                    style={{
                      padding: '4px 6px',
                      color: pkt.info.includes('payroll$') ? '#f85149' : '#e6edf3',
                      fontWeight: pkt.info.includes('payroll$') ? 600 : 400,
                    }}
                  >
                    {pkt.info}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dissected Details & Hex Dumps (Bottom 55% height) */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Layer Dissection Tree */}
        <div
          style={{
            flex: 1,
            padding: '8px 12px',
            overflowY: 'auto',
            borderRight: '1px solid #30363d',
            backgroundColor: '#0d1117',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#58a6ff',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            Packet Dissection [Frame {selectedPacket.no}]
          </div>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}
          >
            <div style={{ padding: '4px 6px', backgroundColor: '#161b22', borderRadius: '4px' }}>
              ▶ <strong>Physical:</strong> {selectedPacket.details.frame}
            </div>
            <div style={{ padding: '4px 6px', backgroundColor: '#161b22', borderRadius: '4px' }}>
              ▶ <strong>Data Link:</strong> {selectedPacket.details.ethernet}
            </div>
            <div style={{ padding: '4px 6px', backgroundColor: '#161b22', borderRadius: '4px' }}>
              ▶ <strong>Network:</strong> {selectedPacket.details.ip}
            </div>
            <div style={{ padding: '4px 6px', backgroundColor: '#161b22', borderRadius: '4px' }}>
              ▶ <strong>Transport:</strong> {selectedPacket.details.transport}
            </div>
            <div
              style={{
                padding: '6px 8px',
                backgroundColor: '#21262d',
                borderRadius: '4px',
                borderLeft: '3px solid #f0883e',
                color: '#f0883e',
                fontWeight: 600,
              }}
            >
              ★ <strong>Application:</strong> {selectedPacket.details.application}
            </div>
          </div>
        </div>

        {/* Hex and ASCII Dump */}
        <div
          style={{
            flex: 1,
            padding: '8px 12px',
            overflowY: 'auto',
            backgroundColor: '#090d13',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#8b949e',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            Hex / ASCII Payload Stream
          </div>
          {selectedPacket.hexDump.map((line, idx) => (
            <div key={idx} style={{ color: '#3fb950', lineHeight: '1.4' }}>
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info Callout */}
      <div
        style={{
          padding: '4px 12px',
          backgroundColor: '#161b22',
          borderTop: '1px solid #30363d',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#8b949e',
        }}
      >
        <span>
          Showing {filteredPackets.length} of {PCAP_DATA.length} synthetic frames | Capture format:{' '}
          <code>pcap 2.4</code>
        </span>
        <span style={{ color: '#f0883e' }}>
          Incident Finding: Frame #10 confirms unconstrained SMB2 Tree Connect to payroll$
        </span>
      </div>
    </div>
  );
};
