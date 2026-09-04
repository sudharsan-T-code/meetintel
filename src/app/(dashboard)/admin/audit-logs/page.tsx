'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Shield,
  RefreshCw,
  Eye,
  X,
  Database,
  ArrowRight,
} from 'lucide-react';

interface AuditLog {
  id: string;
  userName: string;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId: string;
  details?: any;
  ipAddress?: string;
  timestamp: string;
}

const COMMON_ACTIONS = [
  'ALL',
  'meeting_accessed',
  'transcript_downloaded',
  'action_changed',
  'role_changed',
  'user_invited',
  'invitation_revoked',
  'user_status_changed',
  'user_removed',
  'settings_changed',
  'security_audit_viewed',
  'ai_analysis_completed',
  'integration_connected',
];

const COMMON_RESOURCES = [
  'ALL',
  'Meeting',
  'Transcript',
  'ActionItem',
  'User',
  'Invitation',
  'OrganizationSettings',
  'SecurityCenter',
  'Integration',
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('ALL');
  const [resource, setResource] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: '15',
      });
      if (search) q.set('search', search);
      if (actor) q.set('actor', actor);
      if (action !== 'ALL') q.set('action', action);
      if (resource !== 'ALL') q.set('resource', resource);
      if (startDate) q.set('startDate', startDate);
      if (endDate) q.set('endDate', endDate);

      const res = await fetch(`/api/admin/audit-logs?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit records.');
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalLogs(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, action, resource]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setActor('');
    setAction('ALL');
    setResource('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
    fetchLogs();
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1280, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
              Compliance Audit Center
            </h1>
            <span className="badge badge-info" style={{ fontSize: 11, fontWeight: 700 }}>
              Immutable Log
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Tamper-evident, chronological compliance stream of workspace interactions, access, and governance operations.
          </p>
        </div>

        <button onClick={fetchLogs} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {/* Multi-Filter Bar */}
      <div className="card" style={{ padding: 18, marginBottom: 24 }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search action or resource..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ flex: '1 1 180px' }}>
              <input
                type="text"
                placeholder="Filter by Actor name..."
                value={actor}
                onChange={(e) => setActor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ minWidth: 160 }}>
              <select
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 13,
                }}
              >
                {COMMON_ACTIONS.map((a) => (
                  <option key={a} value={a}>{a === 'ALL' ? 'All Actions' : a}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 150 }}>
              <select
                value={resource}
                onChange={(e) => {
                  setResource(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 13,
                }}
              >
                {COMMON_RESOURCES.map((r) => (
                  <option key={r} value={r}>{r === 'ALL' ? 'All Resources' : r}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Date Range:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 12,
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '6px 10px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-primary)',
                  fontSize: 12,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={handleResetFilters} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                Reset
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Showing {logs.length} of {totalLogs} events</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>TIMESTAMP</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>ACTOR</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>ACTION</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>RESOURCE</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>IP ADDRESS</th>
                <th style={{ textAlign: 'right', padding: '10px 16px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 11 }}>INSPECT</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ color: 'var(--text-primary)', fontSize: 12 }}>
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {log.userName}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{log.resource}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: 11 }}>
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Eye size={12} /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border-subtle)' }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
              Previous
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', alignSelf: 'center' }}>
              Page {page} of {totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: 540, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Audit Event Details</h2>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Log Event ID</div>
                <div style={{ fontSize: 13, fontFamily: 'monospace' }}>{selectedLog.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Actor</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedLog.userName} ({selectedLog.userId || 'System Service'})</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Action & Resource</div>
                <div style={{ fontSize: 13 }}>{selectedLog.action} on <strong>{selectedLog.resource}</strong> ({selectedLog.resourceId})</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Timestamp & IP</div>
                <div style={{ fontSize: 13 }}>{new Date(selectedLog.timestamp).toISOString()} • {selectedLog.ipAddress || '127.0.0.1'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Event Payload Details</div>
                <pre style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 6, fontSize: 12, overflowX: 'auto', color: 'var(--text-secondary)' }}>
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedLog(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
