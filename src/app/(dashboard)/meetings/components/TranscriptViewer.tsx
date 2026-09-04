'use client';

import { useState } from 'react';
import { Search, Volume2, Play, Pause, Filter } from 'lucide-react';
import { formatTimestamp } from '@/lib/demo-data';

interface TranscriptSegment {
  id: string;
  speakerId?: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence?: number;
  isImportant?: boolean;
}

interface Speaker {
  id: string;
  name: string;
  speakerLabel: string;
  role?: string;
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  speakers: Speaker[];
  recordingUrl?: string;
}

const SPEAKER_COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b',
  '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6',
];

export default function TranscriptViewer({ segments, speakers }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('all');
  const [activeTimestamp, setActiveTimestamp] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Filter segments
  const filtered = segments.filter((seg) => {
    const matchesSpeaker =
      selectedSpeaker === 'all' ||
      seg.speakerName === selectedSpeaker ||
      seg.speakerId === selectedSpeaker;

    const matchesSearch =
      !searchQuery ||
      seg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seg.speakerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSpeaker && matchesSearch;
  });

  const getSpeakerColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % SPEAKER_COLORS.length;
    return SPEAKER_COLORS[idx];
  };

  const handleSeek = (timestamp: number) => {
    setActiveTimestamp(timestamp);
    setIsPlaying(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Controls Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words in transcript..."
              style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
            />
          </div>

          <div style={{ position: 'relative', minWidth: 180 }}>
            <Filter
              size={14}
              style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)', zIndex: 1 }}
            />
            <select
              className="input"
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              style={{ paddingLeft: 34, height: 38, fontSize: 13 }}
            >
              <option value="all">All Speakers ({speakers.length || 'All'})</option>
              {speakers.map((spk) => (
                <option key={spk.id || spk.name} value={spk.name}>
                  {spk.name} {spk.role ? `(${spk.role})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {activeTimestamp !== null && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-glow)',
                border: '1px solid var(--border-subtle)',
                fontSize: 12,
                color: 'var(--color-primary-light)',
              }}
            >
              <Volume2 size={14} className="animate-pulse" />
              <span>Playback at {formatTimestamp(activeTimestamp)}</span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
            </div>
          )}

          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            Showing {filtered.length} of {segments.length} segments
          </span>
        </div>
      </div>

      {/* Segments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600 }}>No matching transcript segments found</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Try adjusting your search query or speaker filter.
            </p>
          </div>
        ) : (
          filtered.map((seg) => {
            const isCurrentActive =
              activeTimestamp !== null &&
              activeTimestamp >= seg.startTime &&
              activeTimestamp <= seg.endTime;

            const color = getSpeakerColor(seg.speakerName);

            return (
              <div
                key={seg.id}
                onClick={() => handleSeek(seg.startTime)}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  background: isCurrentActive ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)',
                  border: isCurrentActive
                    ? '1px solid var(--color-primary)'
                    : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: `${color}22`,
                        color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {seg.speakerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {seg.speakerName}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: isCurrentActive ? 'var(--color-primary-light)' : 'var(--text-tertiary)',
                      background: 'var(--bg-elevated)',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {formatTimestamp(seg.startTime)} - {formatTimestamp(seg.endTime)}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  {seg.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
