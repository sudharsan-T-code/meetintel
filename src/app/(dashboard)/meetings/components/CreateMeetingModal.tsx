'use client';

import { useState } from 'react';
import { X, Upload, Calendar, Clock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export interface CreatedMeetingData {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: string | Date;
  durationSeconds?: number;
  duration?: number;
  participantCount: number;
  status: string;
  source: string;
  organizerName?: string;
  tags?: string[];
}

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newMeeting: CreatedMeetingData) => void;
}

export default function CreateMeetingModal({ isOpen, onClose, onCreated }: CreateMeetingModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState(new Date().toISOString().slice(0, 16));
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [participantCount, setParticipantCount] = useState(5);
  const [source, setSource] = useState<'UPLOAD' | 'GOOGLE_MEET' | 'ZOOM' | 'TEAMS'>('UPLOAD');
  const [tags, setTags] = useState('Engineering, Architecture, Q4 Roadmap');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useDemoRecording, setUseDemoRecording] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create meeting record
      const meetingPayload = {
        title: title || 'Executive Engineering Sync',
        description: description || 'Cross-functional alignment on cloud migration and product roadmap.',
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationSeconds: durationMinutes * 60,
        participantCount: Number(participantCount) || 1,
        source,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create meeting');
      }

      const createdMeeting = data.meeting;

      // 2. Attach recording (upload file or attach demo recording)
      const formData = new FormData();
      if (selectedFile && !useDemoRecording) {
        formData.append('file', selectedFile);
      } else {
        formData.append('isDemo', 'true');
      }

      const uploadRes = await fetch(`/api/meetings/${createdMeeting.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Failed to upload recording');
      }

      onCreated(uploadData.meeting || createdMeeting);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Meeting creation failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 32,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
              Create & Ingest Meeting
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Register a new session and attach recording for automated transcription
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: 8, borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Meeting Title *
            </label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Executive Engineering & Roadmap Review"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Description
            </label>
            <textarea
              className="input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional meeting agenda or key objectives..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Scheduled Date & Time *
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
                <input
                  type="datetime-local"
                  className="input"
                  style={{ paddingLeft: 36 }}
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Estimated Duration (mins)
              </label>
              <div style={{ position: 'relative' }}>
                <Clock size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  min="5"
                  max="480"
                  className="input"
                  style={{ paddingLeft: 36 }}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Source Platform
              </label>
              <select
                className="input"
                value={source}
                onChange={(e) => setSource(e.target.value as 'UPLOAD' | 'GOOGLE_MEET' | 'ZOOM' | 'TEAMS')}
              >
                <option value="UPLOAD">Direct Audio/Video Upload</option>
                <option value="GOOGLE_MEET">Google Meet</option>
                <option value="ZOOM">Zoom</option>
                <option value="TEAMS">Microsoft Teams</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Participant Count
              </label>
              <input
                type="number"
                min="1"
                max="500"
                className="input"
                value={participantCount}
                onChange={(e) => setParticipantCount(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Architecture, SOC2, Cloud"
            />
          </div>

          {/* Recording Ingestion Section */}
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Recording Audio / Video
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setUseDemoRecording(true)}
                  className={`badge ${useDemoRecording ? 'badge-primary' : 'badge-neutral'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  <Sparkles size={10} style={{ marginRight: 4 }} /> Use Demo Asset
                </button>
                <button
                  type="button"
                  onClick={() => setUseDemoRecording(false)}
                  className={`badge ${!useDemoRecording ? 'badge-primary' : 'badge-neutral'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  <Upload size={10} style={{ marginRight: 4 }} /> Custom File
                </button>
              </div>
            </div>

            {useDemoRecording ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>Preloaded 1h 45m multi-speaker enterprise session recording attached.</span>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.webm"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="input"
                  style={{ fontSize: 12 }}
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Supported formats: MP3, WAV, M4A, MP4, WebM (Max 500MB)
                </p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, marginRight: 8 }} />
                  Creating...
                </>
              ) : (
                'Create & Ingest'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
