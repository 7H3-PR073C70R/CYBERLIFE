/**
 * Cyberlife — Rev Lens Application (Ghidra-Inspired)
 *
 * Graphical static binary analysis and pseudocode decompiler viewer
 * for synthetic reverse engineering of /opt/tools/aster_agent_daemon.bin.
 */

import React, { useState } from 'react';

interface FunctionSymbol {
  name: string;
  address: string;
  sizeBytes: number;
  description: string;
  pseudocode: string;
}

const SYMBOLS: FunctionSymbol[] = [
  {
    name: 'main',
    address: '0x00401140',
    sizeBytes: 124,
    description: 'Entrypoint: initializes CLI daemon flags and loads config',
    pseudocode: `int main(int argc, char **argv) {
    daemon_init("/var/log/aster_daemon.log");
    config_t *cfg = load_config("/etc/security/aster.conf");
    
    // Initialize IPC listener
    int sock = bind_unix_socket("/var/run/aster.sock");
    printf("[+] Aster AI Assistant daemon listening on %s\\n", "/var/run/aster.sock");
    
    // Run main dispatch loop
    while (g_running) {
        request_t *req = accept_client_request(sock);
        dispatch_assistant_query(cfg, req);
    }
    return 0;
}`,
  },
  {
    name: 'authenticate_service',
    address: '0x00401220',
    sizeBytes: 256,
    description: 'Authenticates svc-aster against Cedarline domain controller',
    pseudocode: `bool authenticate_service(config_t *cfg, auth_context_t *ctx) {
    char token[256];
    read_env_secret("ASTER_SERVICE_KEY", token, sizeof(token));
    
    // Attempt Kerberos / NTLMSSP session setup
    ctx->username = "svc-aster";
    ctx->domain   = "CEDARLINE";
    ctx->session_id = smb2_generate_session_id();
    
    printf("[AUTH] Authenticated service principal: %s\\\\%s\\n", ctx->domain, ctx->username);
    return true;
}`,
  },
  {
    name: 'evaluate_policy_scope',
    address: '0x00401340',
    sizeBytes: 310,
    description: 'CRITICAL VULNERABILITY: Permissive wildcard fallback in IAM policy evaluation',
    pseudocode: `bool evaluate_policy_scope(auth_context_t *ctx, const char *requested_resource) {
    // Expected: verify resource is within docs:read or kb:search whitelist
    // BUG REPORTED IN CVE-2026-AST-01:
    // If resource starts with "\\\\\\\\filesrv-01\\\\", role check is bypassed if legacy flag is set!
    
    if (ctx->legacy_admin_override == 1) {
        // [VULNERABILITY DETECTED]
        // Aster daemon assumes full Administrator privileges on any internal SMB share!
        printf("[WARN] Bypassing IAM boundary check for %s (admin_override=1)\\n", requested_resource);
        return true; // Unrestricted access granted!
    }
    
    return check_rbac_whitelist(ctx->role, requested_resource);
}`,
  },
  {
    name: 'fetch_remote_share',
    address: '0x00401480',
    sizeBytes: 198,
    description: 'Connects to SMB tree and reads target file into cache',
    pseudocode: `ssize_t fetch_remote_share(auth_context_t *ctx, const char *share_path, const char *filename, uint8_t **out_buf) {
    if (!evaluate_policy_scope(ctx, share_path)) {
        printf("[-] Access denied to share: %s\\n", share_path);
        return -1;
    }
    
    smb_tree_t *tree = smb2_tree_connect(ctx->session_id, share_path);
    smb_file_t *file = smb2_open_file(tree, filename, O_RDONLY);
    
    ssize_t nbytes = smb2_read_all(file, out_buf);
    printf("[+] Read %zd bytes from %s\\\\%s\\n", nbytes, share_path, filename);
    return nbytes;
}`,
  },
];

const EXTRACTED_STRINGS = [
  {
    offset: '0x00401020',
    len: 32,
    value: '/api/v1/internal/assistant/query',
    section: '.rodata',
    type: 'URL',
  },
  { offset: '0x00401050', len: 9, value: 'svc-aster', section: '.rodata', type: 'Identity' },
  { offset: '0x00401080', len: 15, value: 'corporate-admin', section: '.rodata', type: 'Role' },
  {
    offset: '0x004010b0',
    len: 22,
    value: '\\\\filesrv-01\\payroll$',
    section: '.rodata',
    type: 'Share Path',
  },
  {
    offset: '0x004010e0',
    len: 21,
    value: 'october_salaries.xlsx',
    section: '.rodata',
    type: 'Filename',
  },
  {
    offset: '0x00401120',
    len: 44,
    value: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...',
    section: '.rodata',
    type: 'Auth Token',
  },
  {
    offset: '0x00401160',
    len: 39,
    value: 'Error: Insufficient privilege check bypassed',
    section: '.rodata',
    type: 'Log Message',
  },
  {
    offset: '0x004011a0',
    len: 27,
    value: '/var/log/aster_daemon.log',
    section: '.rodata',
    type: 'File Path',
  },
];

export const RevLensApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'decompile' | 'strings' | 'headers'>('decompile');
  const [selectedSymbol, setSelectedSymbol] = useState<FunctionSymbol>(SYMBOLS[2]!); // Default to vulnerable evaluate_policy_scope
  const [stringFilter, setStringFilter] = useState<string>('');

  const filteredStrings = EXTRACTED_STRINGS.filter(s => {
    if (!stringFilter.trim()) return true;
    const q = stringFilter.toLowerCase();
    return s.value.toLowerCase().includes(q) || s.type.toLowerCase().includes(q);
  });

  return (
    <div
      className="rev-lens-container"
      role="region"
      aria-label="Rev Lens Static Binary Analyzer"
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
      {/* Top Target Specs Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          backgroundColor: '#161b22',
          borderBottom: '1px solid #30363d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: '#bc8cff' }}>🔬 Target Binary:</span>
          <span style={{ fontFamily: 'monospace', color: '#e6edf3' }}>
            /opt/tools/aster_agent_daemon.bin
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              backgroundColor: '#21262d',
              padding: '2px 6px',
              borderRadius: '4px',
              color: '#8b949e',
            }}
          >
            ELF 64-bit LSB (x86-64)
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('decompile')}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'decompile' ? '#1f6feb' : '#21262d',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            Decompiler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('strings')}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'strings' ? '#1f6feb' : '#21262d',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            Strings (.rodata)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('headers')}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'headers' ? '#1f6feb' : '#21262d',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            Headers & ELF
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'decompile' && (
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Symbol Tree Sidebar */}
          <div
            style={{
              width: '240px',
              backgroundColor: '#161b22',
              borderRight: '1px solid #30363d',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#8b949e',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              Function Symbols
            </div>
            {SYMBOLS.map(sym => {
              const isSelected = selectedSymbol.name === sym.name;
              const isVulnerable = sym.name === 'evaluate_policy_scope';
              return (
                <button
                  key={sym.name}
                  type="button"
                  onClick={() => setSelectedSymbol(sym)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '6px 8px',
                    backgroundColor: isSelected ? '#1f6feb22' : 'transparent',
                    border: isSelected ? '1px solid #1f6feb' : '1px solid transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                    <span
                      style={{
                        color: isVulnerable ? '#f85149' : '#58a6ff',
                        fontFamily: 'monospace',
                      }}
                    >
                      {sym.name}()
                    </span>
                    {isVulnerable && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '0.65rem',
                          backgroundColor: '#f8514933',
                          color: '#f85149',
                          padding: '1px 4px',
                          borderRadius: '3px',
                        }}
                      >
                        FLAW
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#8b949e', fontFamily: 'monospace' }}>
                    {sym.address} ({sym.sizeBytes} B)
                  </span>
                </button>
              );
            })}

            <div
              style={{
                marginTop: 'auto',
                padding: '6px',
                backgroundColor: '#0d1117',
                borderRadius: '4px',
                border: '1px solid #21262d',
                fontSize: '0.7rem',
                color: '#8b949e',
              }}
            >
              <div style={{ color: '#bc8cff', fontWeight: 600 }}>Static Analysis</div>
              <div>Decompiled C pseudocode extracted from synthetic ELF binary.</div>
            </div>
          </div>

          {/* Code Viewer */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#090d13',
              padding: '10px 14px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid #21262d',
                paddingBottom: '6px',
                marginBottom: '8px',
              }}
            >
              <div>
                <span style={{ color: '#bc8cff', fontWeight: 600, fontSize: '0.85rem' }}>
                  {selectedSymbol.name}()
                </span>
                <span style={{ color: '#8b949e', marginLeft: '8px', fontSize: '0.75rem' }}>
                  at {selectedSymbol.address}
                </span>
              </div>
              <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>
                {selectedSymbol.description}
              </span>
            </div>

            <pre
              style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                lineHeight: '1.5',
                color: '#e6edf3',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedSymbol.pseudocode}
            </pre>
          </div>
        </div>
      )}

      {/* Strings View */}
      {activeTab === 'strings' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            padding: '10px',
          }}
        >
          <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search extracted strings..."
              value={stringFilter}
              onChange={e => setStringFilter(e.target.value)}
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '4px',
                color: '#fff',
                padding: '4px 8px',
                fontSize: '0.75rem',
                width: '260px',
              }}
            />
            <span style={{ color: '#8b949e', fontSize: '0.75rem', alignSelf: 'center' }}>
              Showing {filteredStrings.length} extracted literals
            </span>
          </div>

          <div
            style={{ flex: 1, overflowY: 'auto', border: '1px solid #30363d', borderRadius: '4px' }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#161b22', color: '#8b949e', fontSize: '0.75rem' }}>
                  <th style={{ padding: '6px' }}>Offset</th>
                  <th style={{ padding: '6px' }}>Length</th>
                  <th style={{ padding: '6px' }}>Section</th>
                  <th style={{ padding: '6px' }}>Category</th>
                  <th style={{ padding: '6px' }}>String Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredStrings.map(s => (
                  <tr
                    key={s.offset}
                    style={{
                      borderBottom: '1px solid #21262d',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}
                  >
                    <td style={{ padding: '6px', color: '#58a6ff' }}>{s.offset}</td>
                    <td style={{ padding: '6px', color: '#8b949e' }}>{s.len}</td>
                    <td style={{ padding: '6px', color: '#8b949e' }}>{s.section}</td>
                    <td style={{ padding: '6px', color: '#bc8cff' }}>{s.type}</td>
                    <td
                      style={{
                        padding: '6px',
                        color: s.value.includes('payroll$') ? '#f85149' : '#3fb950',
                        fontWeight: s.value.includes('payroll$') ? 600 : 400,
                      }}
                    >
                      {s.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ELF Headers View */}
      {activeTab === 'headers' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          <div
            style={{
              backgroundColor: '#161b22',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #30363d',
              marginBottom: '12px',
            }}
          >
            <div style={{ color: '#58a6ff', fontWeight: 600, marginBottom: '6px' }}>
              ELF File Header
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#c9d1d9',
                lineHeight: '1.6',
              }}
            >
              <div>Magic: 7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00</div>
              <div>Class: ELF64 (64-bit objects)</div>
              <div>Data: 2&apos;s complement, little endian</div>
              <div>Type: EXEC (Executable file)</div>
              <div>Machine: Advanced Micro Devices X86-64</div>
              <div>Entry point address: 0x00401140 (main)</div>
              <div>SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#161b22',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #30363d',
            }}
          >
            <div style={{ color: '#58a6ff', fontWeight: 600, marginBottom: '6px' }}>
              Section Headers
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#c9d1d9',
                lineHeight: '1.6',
              }}
            >
              <div>[01] .interp PROGBITS 0x00400238 (0x0000001c) R</div>
              <div>[02] .text PROGBITS 0x00401000 (0x00000840) AX (Executable Code)</div>
              <div>[03] .rodata PROGBITS 0x00402000 (0x00000420) A (Constants, Strings)</div>
              <div>[04] .data PROGBITS 0x00403000 (0x00000180) WA (Writable Global State)</div>
              <div>[05] .bss NOBITS 0x00403180 (0x00000080) WA (Uninitialized Memory)</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Status Bar */}
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
        <span>Loaded: 4 symbols, 8 literals | Disassembly engine: synthetic x86-64</span>
        <span style={{ color: '#f85149' }}>
          Finding: evaluate_policy_scope contains unsafe admin_override bypass
        </span>
      </div>
    </div>
  );
};
