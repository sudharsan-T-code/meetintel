'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send, Sparkles, Clock, Trash2, ShieldCheck,
  User, Bot, Copy, Check
} from 'lucide-react';
import type { ChatMessage, ChatSource } from '@/types';
import { formatTimestamp, getConfidenceColor } from '@/lib/demo-data';

interface MeetingChatProps {
  meetingId: string;
  meetingTitle: string;
  onJumpToTimestamp?: (timestamp: number) => void;
}

export default function MeetingChat({
  meetingId,
  meetingTitle,
  onJumpToTimestamp,
}: MeetingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'What were the key decisions?',
    'Who owns the API migration?',
    'What risks were mentioned?',
    'What did the team agree to do next?',
    'When was the budget issue discussed?',
  ];

  // Load chat messages on mount or meetingId change
  useEffect(() => {
    let ignore = false;
    async function loadChat() {
      try {
        const res = await fetch(`/api/meetings/${meetingId}/chat`);
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.warn('Failed to load chat history:', err);
      }
    }
    loadChat();
    return () => {
      ignore = true;
    };
  }, [meetingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function handleSendMessage(textToSend?: string) {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    setInputValue('');
    setIsLoading(true);

    // Optimistic user message
    const msgTimestamp = new Date().toISOString();
    const tempId = `temp-${messages.length + 1}`;
    const tempUserMsg: ChatMessage = {
      id: tempId,
      meetingId,
      role: 'user',
      content: query,
      timestamp: msgTimestamp,
      type: 'fact',
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, data.message]);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClearChat() {
    try {
      await fetch(`/api/meetings/${meetingId}/chat`, { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  }

  function handleCopyContent(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 680,
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Meeting Intelligence Assistant
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Scoped strictly to: {meetingTitle}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 12,
              background: 'rgba(16,185,129,0.12)',
              color: 'var(--color-success)',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={13} /> Grounded in Transcript
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="btn"
              style={{
                padding: '6px 10px',
                fontSize: 11,
                color: 'var(--text-muted)',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
              }}
              title="Clear chat history"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Message History */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              margin: 'auto',
              maxWidth: 480,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-light)',
              }}
            >
              <Bot size={24} />
            </div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Ask anything about this meeting
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The AI assistant answers queries grounded strictly in transcript segments, decisions, actions, and speaker statements.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                gap: 6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  maxWidth: '85%',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: isUser ? 'var(--bg-elevated)' : 'var(--color-primary)',
                    color: isUser ? 'var(--text-primary)' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {isUser ? <User size={15} /> : <Bot size={15} />}
                </div>

                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser ? 'var(--color-primary)' : 'var(--bg-elevated)',
                    color: isUser ? '#fff' : 'var(--text-primary)',
                    fontSize: 13,
                    lineHeight: 1.6,
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>

                  {!isUser && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <button
                        onClick={() => handleCopyContent(msg.id, msg.content)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedId === msg.id ? 'var(--color-success)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                        }}
                      >
                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Grounded Source Citations */}
              {!isUser && msg.sources && msg.sources.length > 0 && (
                <div
                  style={{
                    marginLeft: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    maxWidth: '80%',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Grounded Citations ({msg.sources.length})
                  </span>
                  {msg.sources.map((src: ChatSource, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {src.speakerName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, color: getConfidenceColor(src.confidence || 'high'), fontWeight: 700 }}>
                            {(src.confidence || 'high').toUpperCase()}
                          </span>
                          {onJumpToTimestamp && (
                            <button
                              onClick={() => onJumpToTimestamp(src.timestamp)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-primary-light)',
                                cursor: 'pointer',
                                fontSize: 11,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                fontWeight: 600,
                              }}
                            >
                              <Clock size={11} /> {formatTimestamp(src.timestamp)}
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        &ldquo;{src.text}&rdquo;
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={15} />
            </div>
            <div
              style={{
                padding: '12px 18px',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: 13,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Sparkles size={14} className="animate-spin" color="var(--color-primary-light)" />
              Synthesizing response from transcript & intelligence models...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips row when messages exist */}
      {messages.length > 0 && (
        <div
          style={{
            padding: '6px 16px',
            background: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
          }}
        >
          {suggestedPrompts.slice(0, 3).map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              style={{
                padding: '4px 10px',
                borderRadius: 12,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: 11,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 12,
          background: 'var(--bg-surface)',
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Ask a question about decisions, topics, risks, or owners in this meeting..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
          }}
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isLoading}
          className="btn btn-primary"
          style={{ padding: '0 20px', gap: 6 }}
        >
          <Send size={15} />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
}
