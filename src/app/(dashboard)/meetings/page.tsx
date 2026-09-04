'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, RefreshCw, Layers } from 'lucide-react';
import MeetingCard from './components/MeetingCard';
import CreateMeetingModal, { CreatedMeetingData } from './components/CreateMeetingModal';
import { demoMeetingsList } from '@/lib/demo-data';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<CreatedMeetingData[]>(
    demoMeetingsList as unknown as CreatedMeetingData[]
  );
  const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'completed' | 'failed' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  async function fetchMeetings() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/meetings');
      if (res.ok) {
        const data = await res.json();
        if (data.meetings && data.meetings.length > 0) {
          setMeetings(data.meetings);
        }
      }
    } catch (err) {
      console.warn('Could not fetch dynamic meetings, using baseline list:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleMeetingCreated(newMeeting: CreatedMeetingData) {
    setMeetings((prev) => [newMeeting, ...prev]);
  }

  // Filter meetings
  const filtered = meetings.filter((m) => {
    // Tab filter
    if (activeTab === 'completed' && m.status !== 'COMPLETED') return false;
    if (activeTab === 'failed' && m.status !== 'FAILED') return false;
    if (activeTab === 'scheduled' && m.status !== 'SCHEDULED' && m.status !== 'DRAFT') return false;
    if (
      activeTab === 'processing' &&
      !['UPLOADING', 'UPLOADED', 'EXTRACTING_AUDIO', 'TRANSCRIBING', 'DIARIZING', 'ANALYZING', 'GENERATING_INSIGHTS'].includes(
        m.status
      )
    ) {
      return false;
    }

    // Source filter
    if (sourceFilter !== 'all' && m.source?.toLowerCase() !== sourceFilter.toLowerCase()) {
      return false;
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title?.toLowerCase().includes(q);
      const matchTag = (m.tags || []).some((t: string) => t.toLowerCase().includes(q));
      const matchOrg = m.organizerName?.toLowerCase().includes(q);
      if (!matchTitle && !matchTag && !matchOrg) return false;
    }

    return true;
  });

  const countByTab = {
    all: meetings.length,
    completed: meetings.filter((m) => m.status === 'COMPLETED').length,
    processing: meetings.filter((m) =>
      ['UPLOADING', 'UPLOADED', 'EXTRACTING_AUDIO', 'TRANSCRIBING', 'DIARIZING', 'ANALYZING', 'GENERATING_INSIGHTS'].includes(
        m.status
      )
    ).length,
    scheduled: meetings.filter((m) => m.status === 'SCHEDULED' || m.status === 'DRAFT').length,
    failed: meetings.filter((m) => m.status === 'FAILED').length,
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Enterprise Meetings
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Ingested and transcribed meetings with acoustic diarization across your organization
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={fetchMeetings} className="btn btn-secondary" style={{ gap: 8 }}>
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ gap: 8 }}>
              <Plus size={16} /> New Meeting
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12, marginBottom: 20, overflowX: 'auto' }}>
          {(['all', 'completed', 'processing', 'scheduled', 'failed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn"
              style={{
                background: activeTab === tab ? 'var(--bg-elevated)' : 'transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: activeTab === tab ? '1px solid var(--border-default)' : '1px solid transparent',
                fontSize: 13,
                fontWeight: activeTab === tab ? 700 : 500,
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{tab}</span>
              <span
                style={{
                  fontSize: 11,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: activeTab === tab ? 'var(--color-primary-glow)' : 'var(--bg-base)',
                  color: activeTab === tab ? 'var(--color-primary-light)' : 'var(--text-tertiary)',
                  fontWeight: 700,
                }}
              >
                {countByTab[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Source Filter Bar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-muted)' }} />
            <input
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by meeting title, tags, or organizer..."
              style={{ paddingLeft: 40 }}
            />
          </div>

          <div style={{ position: 'relative', minWidth: 180 }}>
            <Filter size={14} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)', zIndex: 1 }} />
            <select
              className="input"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              style={{ paddingLeft: 38 }}
            >
              <option value="all">All Sources</option>
              <option value="upload">Direct Upload</option>
              <option value="google_meet">Google Meet</option>
              <option value="teams">Microsoft Teams</option>
              <option value="zoom">Zoom</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="stagger-children">
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '64px 20px',
              textAlign: 'center',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Layers size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              No meetings found
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 20px' }}>
              No meetings match your current filters. Create a new meeting to begin automated transcription.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ gap: 8 }}>
              <Plus size={16} /> Create Meeting
            </button>
          </div>
        ) : (
          filtered.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
        )}
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleMeetingCreated}
      />
    </div>
  );
}
