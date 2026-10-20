/**
 * Cyberlife — Tor Browser Application Component
 *
 * Authentic simulated underground web browser for the .onion ecosystem.
 * - Mullvad/Tor Browser styling with circuit guard/relay/exit visualization
 * - Interactive address bar and bookmarks toolbar
 * - CipherMarket escrow marketplace with in-game currency purchases delivered to VFS
 * - DeepLeaks whistleblower document viewer with cryptographic verification
 * - 0xBoard underground community forum with discussion threads and replies
 * - 100% simulated in-game sandbox. Zero external network calls.
 */

import React, { useState, useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import {
  DEFAULT_TOR_CIRCUIT,
  ONION_DIRECTORY,
  CIPHER_MARKET_LISTINGS,
  DEEP_LEAKS_POSTS,
  FORUM_THREADS,
  TorCircuit,
  MarketListing,
  LeakPost,
  ForumThread,
} from '@/simulation/cyber/darkweb';
import { virtualFilesystem } from '@/simulation/cyber/filesystem';
import { audioSfx } from '@/simulation/cyber/chat';
import { OsIcon } from '../icons/OsIcons';

export const TorBrowserApp: React.FC = () => {
  const sim = useOptionalSimulation();

  // Navigation state
  const [currentUrl, setCurrentUrl] = useState<string>('wiki.onion');
  const [addressInput, setAddressInput] = useState<string>('wiki.onion');
  const [history, setHistory] = useState<string[]>(['wiki.onion']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Circuit inspector modal state
  const [showCircuitModal, setShowCircuitModal] = useState<boolean>(false);
  const [circuit, setCircuit] = useState<TorCircuit>(DEFAULT_TOR_CIRCUIT);
  const [isRotatingCircuit, setIsRotatingCircuit] = useState<boolean>(false);

  // Market state
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [marketSearch, setMarketSearch] = useState<string>('');
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  // Leaks state
  const [activeLeakId, setActiveLeakId] = useState<string>(DEEP_LEAKS_POSTS[0]?.id ?? '');
  const [leakSearch, setLeakSearch] = useState<string>('');
  const [downloadedLeakIds, setDownloadedLeakIds] = useState<Set<string>>(new Set());

  // Forum state
  const [activeThreadId, setActiveThreadId] = useState<string>(FORUM_THREADS[0]?.id ?? '');
  const [forumThreads, setForumThreads] = useState<ForumThread[]>(FORUM_THREADS);
  const [replyInput, setReplyInput] = useState<string>('');

  // Fallback player balance if not running in full simulation context
  const [localBalance, setLocalBalance] = useState<number>(15000);

  const playerMoney = sim ? Math.floor(sim.state.player.moneyKobo / 100) : localBalance;

  // Navigate to an address
  const navigateTo = (url: string) => {
    let cleanUrl = url.trim().toLowerCase();
    if (cleanUrl.startsWith('https://')) cleanUrl = cleanUrl.slice(8);
    if (cleanUrl.startsWith('http://')) cleanUrl = cleanUrl.slice(7);
    if (!cleanUrl.includes('.')) cleanUrl = `${cleanUrl}.onion`;

    setCurrentUrl(cleanUrl);
    setAddressInput(cleanUrl);

    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, cleanUrl];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const prevUrl = history[historyIndex - 1]!;
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(prevUrl);
      setAddressInput(prevUrl);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const nextUrl = history[historyIndex + 1]!;
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(nextUrl);
      setAddressInput(nextUrl);
    }
  };

  // Rotate Tor Circuit (New Identity)
  const handleRotateCircuit = () => {
    setIsRotatingCircuit(true);
    setTimeout(() => {
      setCircuit({
        ...circuit,
        id: `circuit-${Math.floor(10000 + Math.random() * 89999)}`,
        latencyMs: Math.floor(120 + Math.random() * 90),
        relay: {
          type: 'Middle Relay',
          ip: `185.${Math.floor(50 + Math.random() * 100)}.${Math.floor(10 + Math.random() * 80)}.${Math.floor(2 + Math.random() * 200)}`,
          hostname: `relay-${Math.random().toString(36).substring(2, 7)}.tor-network.de`,
          country: 'Germany',
          flag: '🇩🇪',
          bandwidth: `${Math.floor(90 + Math.random() * 60)} MB/s`,
        },
      });
      setIsRotatingCircuit(false);
      audioSfx.playConnect();
    }, 800);
  };

  // Buy Item from CipherMarket
  const handlePurchaseListing = (listing: MarketListing) => {
    if (purchasedIds.has(listing.id)) return;

    if (playerMoney < listing.price) {
      setPurchaseStatus(
        `Insufficient funds. You have ₦${playerMoney.toLocaleString()} but listing requires ₦${listing.price.toLocaleString()}.`
      );
      return;
    }

    // Deduct currency
    if (sim) {
      sim.dispatch({
        type: 'DebitMoney',
        amountKobo: listing.price * 100,
        reason: `CipherMarket: ${listing.title}`,
      });
    } else {
      setLocalBalance(prev => prev - listing.price);
    }

    // Write file to Virtual Filesystem
    const writeResult = virtualFilesystem.writeFile(
      listing.vfsTargetPath,
      listing.deliveredContent
    );
    if (!writeResult.success) {
      setPurchaseStatus(`VFS Delivery Error: ${writeResult.error}`);
      return;
    }

    setPurchasedIds(prev => new Set(prev).add(listing.id));
    audioSfx.playMessagePing();
    setPurchaseStatus(
      `✓ Escrow Cleared! ₦${listing.price.toLocaleString()} transferred. Delivered to ${listing.vfsTargetPath}. You can inspect it in Terminal via 'cat ${listing.vfsTargetPath}'.`
    );
  };

  // Download leak file to VFS
  const handleDownloadLeak = (leak: LeakPost) => {
    const targetPath = `/home/analyst/downloads/${leak.id}.txt`;
    const content = `# DeepLeaks Incident Archive: ${leak.title}
# Classification: ${leak.classification} // Target: ${leak.targetOrg}
# Verified SHA256: ${leak.sha256}

${leak.rawSnippet}`;

    const res = virtualFilesystem.writeFile(targetPath, content);
    if (res.success) {
      setDownloadedLeakIds(prev => new Set(prev).add(leak.id));
      audioSfx.playMessagePing();
    }
  };

  // Post Reply to 0xBoard thread
  const handlePostReply = (threadId: string) => {
    if (!replyInput.trim()) return;

    setForumThreads(prev =>
      prev.map(t => {
        if (t.id !== threadId) return t;
        const newPost = {
          id: `post-${Date.now()}`,
          author: '0xAde (You)',
          role: 'Analyst / Contributor',
          time: 'Just now',
          content: replyInput.trim(),
          upvotes: 1,
        };
        return {
          ...t,
          repliesCount: t.repliesCount + 1,
          lastActive: 'Just now',
          posts: [...t.posts, newPost],
        };
      })
    );

    setReplyInput('');
    audioSfx.playSpeechBlip();
  };

  // Filtered market listings
  const filteredListings = useMemo(() => {
    return CIPHER_MARKET_LISTINGS.filter(item => {
      const matchesFilter = marketFilter === 'all' || item.category === marketFilter;
      const matchesSearch =
        marketSearch === '' ||
        item.title.toLowerCase().includes(marketSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(marketSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [marketFilter, marketSearch]);

  const activeLeak = useMemo(() => {
    return DEEP_LEAKS_POSTS.find((l: LeakPost) => l.id === activeLeakId) ?? DEEP_LEAKS_POSTS[0];
  }, [activeLeakId]);

  const activeThread = useMemo(() => {
    return forumThreads.find(t => t.id === activeThreadId) ?? forumThreads[0];
  }, [forumThreads, activeThreadId]);

  return (
    <div
      className="tor-browser-window"
      data-testid="tor-browser-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0c0a14',
        color: '#e2e8f0',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '13px',
      }}
    >
      {/* Tor Browser Chrome / Top Bar */}
      <div
        className="tor-browser-toolbar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#160d26',
          borderBottom: '1px solid #2e1a4f',
          padding: '6px 8px 4px',
          gap: '6px',
        }}
      >
        {/* Navigation row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={goBack}
            disabled={historyIndex <= 0}
            style={{
              padding: '4px 8px',
              backgroundColor: historyIndex > 0 ? '#261444' : '#1b122c',
              border: '1px solid #3d206d',
              borderRadius: '4px',
              color: historyIndex > 0 ? '#e2e8f0' : '#64748b',
              cursor: historyIndex > 0 ? 'pointer' : 'default',
            }}
            title="Back"
          >
            ←
          </button>
          <button
            type="button"
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            style={{
              padding: '4px 8px',
              backgroundColor: historyIndex < history.length - 1 ? '#261444' : '#1b122c',
              border: '1px solid #3d206d',
              borderRadius: '4px',
              color: historyIndex < history.length - 1 ? '#e2e8f0' : '#64748b',
              cursor: historyIndex < history.length - 1 ? 'pointer' : 'default',
            }}
            title="Forward"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => navigateTo(currentUrl)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#261444',
              border: '1px solid #3d206d',
              borderRadius: '4px',
              color: '#e2e8f0',
              cursor: 'pointer',
            }}
            title="Reload"
          >
            ↻
          </button>
          <button
            type="button"
            onClick={() => navigateTo('wiki.onion')}
            style={{
              padding: '4px 8px',
              backgroundColor: '#261444',
              border: '1px solid #3d206d',
              borderRadius: '4px',
              color: '#a855f7',
              cursor: 'pointer',
            }}
            title="Home"
          >
            🏠
          </button>

          {/* Address Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              navigateTo(addressInput);
            }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#090510',
              border: '1px solid #581c87',
              borderRadius: '6px',
              padding: '2px 8px',
              gap: '6px',
            }}
          >
            <span
              style={{
                color: '#00e676',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              🔒 <span style={{ color: '#a855f7', fontWeight: 600 }}>onion://</span>
            </span>
            <input
              type="text"
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
              placeholder="Search or enter .onion address..."
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#a855f7',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              Go
            </button>
          </form>

          {/* Tor Circuit Button */}
          <button
            type="button"
            onClick={() => setShowCircuitModal(!showCircuitModal)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: showCircuitModal ? '#581c87' : '#261444',
              border: '1px solid #7e22ce',
              borderRadius: '4px',
              padding: '4px 10px',
              color: '#e9d5ff',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
            }}
            title="Inspect Tor Multi-Hop Circuit"
          >
            <OsIcon name="tor" size={14} color="#c084fc" />
            <span>Circuit ({circuit.latencyMs}ms)</span>
          </button>
        </div>

        {/* Bookmarks toolbar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
          <span style={{ color: '#6b7280', fontSize: '10px' }}>BOOKMARKS:</span>
          {ONION_DIRECTORY.map(site => (
            <button
              key={site.address}
              type="button"
              onClick={() => navigateTo(site.address)}
              style={{
                backgroundColor: currentUrl === site.address ? '#3b1c66' : 'transparent',
                border: 'none',
                color: currentUrl === site.address ? '#f3e8ff' : '#c084fc',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🧅</span>
              <span>{site.title.split('—')[0]?.split('//')[0]?.trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tor Multi-Hop Circuit Inspector Modal */}
      {showCircuitModal && (
        <div
          className="tor-circuit-modal"
          style={{
            backgroundColor: '#130924',
            borderBottom: '2px solid #7e22ce',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <OsIcon name="tor" size={16} color="#c084fc" />
              <span style={{ fontWeight: 700, color: '#f3e8ff' }}>
                Tor Circuit for {currentUrl}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: '#00e676',
                  backgroundColor: 'rgba(0,230,118,0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                ● Encrypted & Anonymous
              </span>
            </div>
            <button
              type="button"
              onClick={handleRotateCircuit}
              disabled={isRotatingCircuit}
              style={{
                backgroundColor: '#3b1c66',
                border: '1px solid #7e22ce',
                color: '#f3e8ff',
                borderRadius: '4px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              {isRotatingCircuit ? 'Rebuilding Circuit...' : '🔄 New Identity (Rotate)'}
            </button>
          </div>

          {/* 3-hop circuit visual diagram */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            {/* Guard Node */}
            <div
              style={{
                flex: 1,
                backgroundColor: '#1e1136',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #4c1d95',
              }}
            >
              <div style={{ fontSize: '10px', color: '#9333ea', fontWeight: 700 }}>
                GUARD NODE (ENTRY)
              </div>
              <div
                style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}
              >
                {circuit.guard.flag} {circuit.guard.country}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#cbd5e1',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {circuit.guard.ip}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>
                BW: {circuit.guard.bandwidth}
              </div>
            </div>

            <div style={{ color: '#a855f7', fontWeight: 700 }}>➔</div>

            {/* Middle Relay */}
            <div
              style={{
                flex: 1,
                backgroundColor: '#1e1136',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #4c1d95',
              }}
            >
              <div style={{ fontSize: '10px', color: '#9333ea', fontWeight: 700 }}>
                MIDDLE RELAY
              </div>
              <div
                style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}
              >
                {circuit.relay.flag} {circuit.relay.country}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#cbd5e1',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {circuit.relay.ip}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>
                BW: {circuit.relay.bandwidth}
              </div>
            </div>

            <div style={{ color: '#a855f7', fontWeight: 700 }}>➔</div>

            {/* Exit / Rendezvous */}
            <div
              style={{
                flex: 1,
                backgroundColor: '#1e1136',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #4c1d95',
              }}
            >
              <div style={{ fontSize: '10px', color: '#9333ea', fontWeight: 700 }}>
                EXIT / RENDEZVOUS
              </div>
              <div
                style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}
              >
                {circuit.exit.flag} {circuit.exit.country}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#cbd5e1',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {circuit.exit.hostname}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>
                Latency: {circuit.latencyMs}ms
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* SITE 1: wiki.onion */}
        {currentUrl === 'wiki.onion' && (
          <div
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#190e2d',
                border: '1px solid #4c1d95',
                borderRadius: '8px',
                padding: '16px 20px',
              }}
            >
              <h1 style={{ fontSize: '1.4rem', color: '#f3e8ff', margin: 0, fontWeight: 700 }}>
                🧅 The Hidden Wiki // Lagos Underground Mirror
              </h1>
              <p style={{ color: '#c084fc', marginTop: '4px', marginBottom: 0, fontSize: '12px' }}>
                Verified decentralized directory of underground security exchanges, leaks, and
                communication services.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '12px',
              }}
            >
              {ONION_DIRECTORY.filter(s => s.address !== 'wiki.onion').map(site => (
                <div
                  key={site.address}
                  onClick={() => navigateTo(site.address)}
                  style={{
                    backgroundColor: '#120b20',
                    border: '1px solid #2e1a4f',
                    borderRadius: '6px',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#7e22ce')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2e1a4f')}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#a855f7',
                        fontWeight: 600,
                      }}
                    >
                      {site.address}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#3b1c66',
                        color: '#f3e8ff',
                        padding: '2px 6px',
                        borderRadius: '3px',
                      }}
                    >
                      {site.badge}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '14px' }}>
                    {site.title}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>{site.tagline}</div>
                  <div style={{ color: '#a855f7', fontSize: '11px', marginTop: '4px' }}>
                    ➔ Connect to Onion Service
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: '#0f0918',
                border: '1px solid #261444',
                borderRadius: '6px',
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
                SECURITY NOTICE FOR ANALYSTS
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0' }}>
                All transactions on CipherMarket are backed by synthetic multi-sig escrow contracts.
                Downloaded artifacts are immediately saved to <code>/home/analyst/downloads</code>{' '}
                in your virtual sandbox.
              </p>
            </div>
          </div>
        )}

        {/* SITE 2: ciphermarket.onion */}
        {currentUrl === 'ciphermarket.onion' && (
          <div
            style={{
              maxWidth: '950px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Header banner */}
            <div
              style={{
                backgroundColor: '#1b0d33',
                border: '1px solid #6b21a8',
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h1 style={{ fontSize: '1.4rem', color: '#f3e8ff', margin: 0, fontWeight: 700 }}>
                  🛒 CipherMarket // Underground Security Exchange
                </h1>
                <div style={{ color: '#c084fc', fontSize: '12px', marginTop: '2px' }}>
                  Decentralized escrow marketplace • Zero logs • Automatic PGP signing
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#0f071d',
                  border: '1px solid #7e22ce',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
                  AVAILABLE BALANCE
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#00e676',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  ₦{playerMoney.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Notification alert banner */}
            {purchaseStatus && (
              <div
                style={{
                  backgroundColor: '#14291e',
                  border: '1px solid #00e676',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{purchaseStatus}</span>
                <button
                  type="button"
                  onClick={() => setPurchaseStatus(null)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#a7f3d0',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Search and Category Filter Toolbar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search market listings (wordlists, exploits, maps)..."
                value={marketSearch}
                onChange={e => setMarketSearch(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: '#130a21',
                  border: '1px solid #3b1c66',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                {['all', 'wordlist', 'intel', 'exploit', 'tool'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMarketFilter(cat)}
                    style={{
                      backgroundColor: marketFilter === cat ? '#581c87' : '#1b0f2e',
                      border: '1px solid #4c1d95',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      color: marketFilter === cat ? '#f3e8ff' : '#c084fc',
                      cursor: 'pointer',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Listings Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))',
                gap: '12px',
              }}
            >
              {filteredListings.map(listing => {
                const isPurchased = purchasedIds.has(listing.id);

                return (
                  <div
                    key={listing.id}
                    style={{
                      backgroundColor: '#140c22',
                      border: isPurchased ? '1px solid #00e676' : '1px solid #311854',
                      borderRadius: '6px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 5px',
                            borderRadius: '3px',
                            backgroundColor: '#2e1850',
                            color: '#a855f7',
                            textTransform: 'uppercase',
                          }}
                        >
                          {listing.category}
                        </span>
                        <h3
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#f8fafc',
                            margin: '4px 0 0',
                          }}
                        >
                          {listing.title}
                        </h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: '#00e676',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          ₦{listing.price.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                          ★ {listing.rating} ({listing.salesCount} sold)
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>
                      {listing.description}
                    </p>

                    <div
                      style={{
                        backgroundColor: '#0d0717',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                      }}
                    >
                      <span style={{ color: '#64748b' }}>FEATURES: </span>
                      <span style={{ color: '#cbd5e1' }}>{listing.features.join(' • ')}</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '4px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#6b7280',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        Vendor: {listing.vendor} // File: {listing.filename}
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePurchaseListing(listing)}
                        disabled={isPurchased}
                        style={{
                          backgroundColor: isPurchased ? '#065f46' : '#7e22ce',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#ffffff',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: isPurchased ? 'default' : 'pointer',
                        }}
                      >
                        {isPurchased
                          ? '✓ In VFS Downloads'
                          : `Purchase (₦${listing.price.toLocaleString()})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SITE 3: deepleaks.onion */}
        {currentUrl === 'deepleaks.onion' && (
          <div
            style={{
              maxWidth: '950px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#190a23',
                border: '1px solid #701a75',
                borderRadius: '8px',
                padding: '16px 20px',
              }}
            >
              <h1 style={{ fontSize: '1.4rem', color: '#fdf4ff', margin: 0, fontWeight: 700 }}>
                📄 DeepLeaks // Whistleblower Vault & Telemetry Dump
              </h1>
              <p style={{ color: '#f0abfc', marginTop: '4px', marginBottom: 0, fontSize: '12px' }}>
                Cryptographically signed whistleblower pastebin. Raw unredacted logs, corporate
                incident notes, and configuration dumps.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '14px' }}>
              {/* Leaks list sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Filter leaks..."
                  value={leakSearch}
                  onChange={e => setLeakSearch(e.target.value)}
                  style={{
                    backgroundColor: '#130a21',
                    border: '1px solid #3b1c66',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    color: '#f8fafc',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                />
                {DEEP_LEAKS_POSTS.filter(
                  (l: LeakPost) =>
                    leakSearch === '' ||
                    l.title.toLowerCase().includes(leakSearch.toLowerCase()) ||
                    l.targetOrg.toLowerCase().includes(leakSearch.toLowerCase())
                ).map((leak: LeakPost) => (
                  <div
                    key={leak.id}
                    onClick={() => setActiveLeakId(leak.id)}
                    style={{
                      backgroundColor: activeLeakId === leak.id ? '#3b0764' : '#140c22',
                      border: activeLeakId === leak.id ? '1px solid #c084fc' : '1px solid #2e1850',
                      borderRadius: '5px',
                      padding: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#e879f9', fontWeight: 700 }}>
                      {leak.classification} // {leak.targetOrg}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#f8fafc',
                        marginTop: '2px',
                      }}
                    >
                      {leak.title}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                      {leak.leakDate} • {leak.fileSizeBytes}
                    </div>
                  </div>
                ))}
              </div>

              {/* Leak document viewer */}
              {activeLeak && (
                <div
                  style={{
                    backgroundColor: '#0c0617',
                    border: '1px solid #3b1c66',
                    borderRadius: '6px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          backgroundColor: '#701a75',
                          color: '#fdf4ff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '3px',
                        }}
                      >
                        {activeLeak.classification}
                      </span>
                      <h2 style={{ fontSize: '1.1rem', color: '#f8fafc', margin: '6px 0 2px' }}>
                        {activeLeak.title}
                      </h2>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Source: {activeLeak.source} • Released: {activeLeak.leakDate}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadLeak(activeLeak)}
                      style={{
                        backgroundColor: downloadedLeakIds.has(activeLeak.id)
                          ? '#065f46'
                          : '#9333ea',
                        border: 'none',
                        color: '#f8fafc',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {downloadedLeakIds.has(activeLeak.id)
                        ? '✓ Saved to /downloads'
                        : '📥 Download to VFS'}
                    </button>
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: '#6b7280',
                      fontFamily: "'JetBrains Mono', monospace",
                      backgroundColor: '#130a21',
                      padding: '6px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    SHA256: {activeLeak.sha256}
                  </div>

                  <pre
                    style={{
                      backgroundColor: '#07030d',
                      border: '1px solid #22123d',
                      borderRadius: '4px',
                      padding: '12px',
                      color: '#00e5ff',
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: 'pre-wrap',
                      overflowX: 'auto',
                      maxHeight: '400px',
                      margin: 0,
                    }}
                  >
                    {activeLeak.rawSnippet}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SITE 4: 0xboard.onion */}
        {currentUrl === '0xboard.onion' && (
          <div
            style={{
              maxWidth: '950px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: '#120b20',
                border: '1px solid #4c1d95',
                borderRadius: '8px',
                padding: '16px 20px',
              }}
            >
              <h1 style={{ fontSize: '1.4rem', color: '#f3e8ff', margin: 0, fontWeight: 700 }}>
                💬 0xBoard // Underground Hacker Community
              </h1>
              <p style={{ color: '#c084fc', marginTop: '4px', marginBottom: 0, fontSize: '12px' }}>
                Tor-routed discussion board for vulnerability discovery, reverse engineering, and
                threat evasion.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '14px' }}>
              {/* Thread list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', padding: '4px 0' }}
                >
                  ACTIVE THREADS
                </div>
                {forumThreads.map(thread => (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    style={{
                      backgroundColor: activeThreadId === thread.id ? '#2e1065' : '#140c22',
                      border:
                        activeThreadId === thread.id ? '1px solid #a855f7' : '1px solid #2e1850',
                      borderRadius: '5px',
                      padding: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}
                    >
                      <span style={{ color: '#a855f7', fontWeight: 700 }}>{thread.category}</span>
                      {thread.pinned && <span style={{ color: '#f59e0b' }}>📌 PINNED</span>}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#f8fafc',
                        marginTop: '2px',
                      }}
                    >
                      {thread.title}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                      {thread.repliesCount} replies • Last: {thread.lastActive}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active thread messages */}
              {activeThread && (
                <div
                  style={{
                    backgroundColor: '#0c0617',
                    border: '1px solid #3b1c66',
                    borderRadius: '6px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#c084fc',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      {activeThread.category}
                    </span>
                    <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', margin: '4px 0 2px' }}>
                      {activeThread.title}
                    </h2>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Thread started by {activeThread.author}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeThread.posts.map(post => (
                      <div
                        key={post.id}
                        style={{
                          backgroundColor: '#140c22',
                          border: '1px solid #281446',
                          borderRadius: '4px',
                          padding: '10px 12px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 600, color: '#a855f7', fontSize: '12px' }}>
                              {post.author}
                            </span>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>
                              [{post.role}]
                            </span>
                          </div>
                          <span style={{ fontSize: '10px', color: '#6b7280' }}>{post.time}</span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#e2e8f0',
                            lineHeight: '1.4',
                          }}
                        >
                          {post.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      placeholder="Post encrypted anonymous reply..."
                      value={replyInput}
                      onChange={e => setReplyInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handlePostReply(activeThread.id);
                        }
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#130a21',
                        border: '1px solid #4c1d95',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        color: '#f8fafc',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handlePostReply(activeThread.id)}
                      style={{
                        backgroundColor: '#7e22ce',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '4px',
                        padding: '6px 14px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback for Unknown Onion Address */}
        {!['wiki.onion', 'ciphermarket.onion', 'deepleaks.onion', '0xboard.onion'].includes(
          currentUrl
        ) && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              maxWidth: '500px',
              margin: '0 auto',
            }}
          >
            <div style={{ fontSize: '48px' }}>🧅</div>
            <h2 style={{ color: '#f8fafc', margin: '12px 0 6px' }}>Onion Service Not Reachable</h2>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>
              The descriptor for <code>{currentUrl}</code> could not be fetched from the Tor
              distributed hash table (DHT).
            </p>
            <button
              type="button"
              onClick={() => navigateTo('wiki.onion')}
              style={{
                marginTop: '12px',
                backgroundColor: '#7e22ce',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Return to The Hidden Wiki
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
