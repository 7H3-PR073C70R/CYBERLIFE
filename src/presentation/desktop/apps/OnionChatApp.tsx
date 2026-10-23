/**
 * Cyberlife — OnionChat Application Component
 *
 * Classical Linux encrypted messaging client for the Orion OS security workstation.
 * - GPG signed end-to-end messaging stream
 * - Contact list with online indicators, roles, and unread badges
 * - Interactive suggested reply chips and custom message typing
 * - Simulated contact responses with typing delays
 * - One-click Secure VoIP audio call launcher
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_CHAT_THREADS,
  CONTACT_AUTO_RESPONSES,
  ChatThread,
  ChatMessage,
  audioSfx,
} from '@/simulation/cyber/chat';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { OsIcon } from '../icons/OsIcons';

export interface OnionChatAppProps {
  onStartCall?: (thread: ChatThread) => void;
}

export const OnionChatApp: React.FC<OnionChatAppProps> = ({ onStartCall }) => {
  const sim = useOptionalSimulation();
  const deliveredMessages = sim?.state.episode?.deliveredMessages;

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialContactParam = urlParams?.get('contact');

  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_CHAT_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    if (initialContactParam) {
      const match = INITIAL_CHAT_THREADS.find(t => t.contactId === initialContactParam);
      if (match) return match.id;
    }
    return INITIAL_CHAT_THREADS[0]?.id ?? '';
  });
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTypingRemote, setIsTypingRemote] = useState<boolean>(false);

  useEffect(() => {
    if (initialContactParam) {
      const match = threads.find(t => t.contactId === initialContactParam);
      if (match && activeThreadId !== match.id) {
        setActiveThreadId(match.id);
      }
    }
  }, [threads, initialContactParam]);

  useEffect(() => {
    if (!deliveredMessages || deliveredMessages.length === 0) return;

    setThreads(prevThreads => {
      const nextThreads = [...prevThreads];
      let updated = false;

      for (const epMsg of deliveredMessages) {
        const msgId = `ep-msg-${epMsg.id}`;
        const existingThreadIndex = nextThreads.findIndex(t => t.contactId === epMsg.contactId);

        if (existingThreadIndex >= 0) {
          const targetThread = nextThreads[existingThreadIndex]!;
          if (!targetThread.messages.some(m => m.id === msgId)) {
            const newChatMsg: ChatMessage = {
              id: msgId,
              senderId: epMsg.contactId,
              senderName: epMsg.contactName,
              senderRole: 'Onion Relay Contact',
              text: epMsg.text,
              timestamp: epMsg.timestampString || '10:20 AM',
              isEncrypted: true,
              isFromPlayer: false,
              gpgFingerprint: '0x3D8F 8891 CA22',
            };
            nextThreads[existingThreadIndex] = {
              ...targetThread,
              unreadCount: targetThread.unreadCount + 1,
              messages: [...targetThread.messages, newChatMsg],
            };
            updated = true;
          }
        } else {
          const newThread: ChatThread = {
            id: `thread-${epMsg.contactId}`,
            contactId: epMsg.contactId,
            contactName: epMsg.contactName,
            contactRole: 'Onion Relay Contact',
            contactOrg: 'Classified Onion Relay',
            contactAvatarColor: epMsg.contactId === 'unknown' ? '#ef4444' : '#10b981',
            isOnline: true,
            securityClearance: 'ONION // GPG VERIFIED',
            unreadCount: 1,
            canCall: false,
            callDialogue: [],
            messages: [
              {
                id: msgId,
                senderId: epMsg.contactId,
                senderName: epMsg.contactName,
                senderRole: 'Onion Relay Contact',
                text: epMsg.text,
                timestamp: epMsg.timestampString || '10:20 AM',
                isEncrypted: true,
                isFromPlayer: false,
                gpgFingerprint: '0x3D8F 8891 CA22',
              },
            ],
          };
          nextThreads.push(newThread);
          updated = true;
        }
      }

      return updated ? nextThreads : prevThreads;
    });
  }, [deliveredMessages]);

  const activeThread = threads.find(t => t.id === activeThreadId) ?? threads[0]!;

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    // Clear unread count for this thread
    setThreads(prev => prev.map(t => (t.id === threadId ? { ...t, unreadCount: 0 } : t)));
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'protector',
      senderName: 'Protector (You)',
      senderRole: 'Security Analyst',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: true,
      isFromPlayer: true,
      gpgFingerprint: '0x7F2A 4991 3BC0',
    };

    // Append player message
    setThreads(prev =>
      prev.map(t =>
        t.id === activeThread.id
          ? {
            ...t,
            messages: [...t.messages, newMsg],
          }
          : t
      )
    );

    setInputMessage('');
    audioSfx.playSpeechBlip();

    // Trigger simulated response from contact
    setIsTypingRemote(true);
    setTimeout(() => {
      const contactResponses = CONTACT_AUTO_RESPONSES[activeThread.contactId] ?? {};
      const replyText =
        contactResponses[trimmed] ??
        contactResponses['default'] ??
        'Message received and decrypted. Proceeding with investigation.';

      const contactReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        senderId: activeThread.contactId,
        senderName: activeThread.contactName,
        senderRole: activeThread.contactRole,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true,
        isFromPlayer: false,
        gpgFingerprint: '0x9E4B 22C1 88DA',
        suggestedReplies: [
          'Understood, checking the telemetry now.',
          'Will analyze the memory dump on Tor Browser.',
        ],
      };

      setThreads(prev =>
        prev.map(t =>
          t.id === activeThread.id
            ? {
              ...t,
              messages: [...t.messages, contactReply],
            }
            : t
        )
      );

      setIsTypingRemote(false);
      audioSfx.playMessagePing();
    }, 1400);
  };

  return (
    <div
      className="onion-chat-app"
      data-testid="onion-chat-app"
      style={{
        display: 'flex',
        height: '100%',
        backgroundColor: '#0c121d',
        color: '#f8fafc',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Left Sidebar: Contacts & Identity */}
      <div
        style={{
          width: '260px',
          borderRight: '1px solid #1e293b',
          backgroundColor: '#070c14',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* User GPG Identity Bar */}
        <div
          style={{
            padding: '12px',
            borderBottom: '1px solid #1e293b',
            backgroundColor: '#0a101b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#00ff66',
                boxShadow: '0 0 6px #00ff66',
              }}
            />
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>
              Protector
            </span>
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#00e5ff',
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: '4px',
            }}
          >
            PGP: 0x7F2A 4991 3BC0 // Onion v3
          </div>
        </div>

        {/* Contact List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, padding: '6px 8px' }}>
            ENCRYPTED CONTACTS ({threads.length})
          </div>

          {threads.map(thread => {
            const isSelected = thread.id === activeThread.id;
            const lastMsg = thread.messages[thread.messages.length - 1];

            return (
              <div
                key={thread.id}
                onClick={() => handleSelectThread(thread.id)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                  border: isSelected
                    ? '1px solid rgba(0, 229, 255, 0.35)'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: thread.contactAvatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#050a12',
                    fontWeight: 700,
                    fontSize: '12px',
                    flexShrink: 0,
                  }}
                >
                  {thread.contactName.slice(0, 2).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '12px' }}>
                      {thread.contactName}
                    </span>
                    {thread.unreadCount > 0 && (
                      <span
                        style={{
                          backgroundColor: '#00ff66',
                          color: '#050a12',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                        }}
                      >
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#94a3b8',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {lastMsg ? lastMsg.text : thread.contactRole}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat Pane */}
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0c1320' }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid #1e293b',
            backgroundColor: '#0a101b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#f8fafc' }}>
                {activeThread.contactName}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  backgroundColor: '#1e293b',
                  color: '#00e5ff',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontWeight: 600,
                }}
              >
                {activeThread.securityClearance}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {activeThread.contactRole} • {activeThread.contactOrg}
            </div>
          </div>

          {activeThread.canCall && (
            <button
              type="button"
              onClick={() => onStartCall?.(activeThread)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#065f46',
                border: '1px solid #10b981',
                borderRadius: '5px',
                padding: '6px 14px',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '11px',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
              }}
            >
              <OsIcon name="call" size={14} color="#ffffff" />
              <span>Call Secure Line</span>
            </button>
          )}
        </div>

        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {activeThread.messages.map(msg => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.isFromPlayer ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: '#64748b',
                  display: 'flex',
                  gap: '6px',
                  alignSelf: msg.isFromPlayer ? 'flex-end' : 'flex-start',
                }}
              >
                <span>{msg.senderName}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.isEncrypted && <span>🔒 PGP</span>}
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: msg.isFromPlayer ? '#0f3844' : '#141e2e',
                  border: msg.isFromPlayer ? '1px solid #00e5ff44' : '1px solid #1e293b',
                  color: '#f8fafc',
                  fontSize: '12px',
                  lineHeight: '1.45',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTypingRemote && (
            <div
              style={{
                alignSelf: 'flex-start',
                color: '#64748b',
                fontSize: '11px',
                fontStyle: 'italic',
              }}
            >
              {activeThread.contactName} is encrypting response...
            </div>
          )}
        </div>

        {/* Suggested Quick Replies */}
        {activeThread.messages.length > 0 &&
          activeThread.messages[activeThread.messages.length - 1]?.suggestedReplies &&
          activeThread.messages[activeThread.messages.length - 1]!.suggestedReplies!.length > 0 && (
            <div
              style={{
                padding: '6px 16px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                backgroundColor: '#0a101b',
                borderTop: '1px solid #1e293b',
              }}
            >
              <span style={{ fontSize: '10px', color: '#64748b', alignSelf: 'center' }}>
                SUGGESTED:
              </span>
              {activeThread.messages[activeThread.messages.length - 1]!.suggestedReplies!.map(
                reply => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => sendMessage(reply)}
                    style={{
                      backgroundColor: 'rgba(0, 229, 255, 0.1)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '12px',
                      padding: '4px 10px',
                      color: '#00e5ff',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {reply}
                  </button>
                )
              )}
            </div>
          )}

        {/* Message Input Box */}
        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage(inputMessage);
          }}
          style={{
            padding: '10px 16px',
            backgroundColor: '#070c14',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            gap: '8px',
          }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder={`Send GPG encrypted message to ${activeThread.contactName}...`}
            style={{
              flex: 1,
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '5px',
              padding: '8px 12px',
              color: '#f8fafc',
              fontSize: '12px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#00e5ff',
              border: 'none',
              borderRadius: '5px',
              color: '#050a12',
              padding: '8px 16px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
