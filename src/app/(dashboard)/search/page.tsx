'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  FileText,
  GitBranch,
  ListChecks,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { SearchEntityType, GlobalSearchResultItem } from '@/lib/db/search';

const TABS: { id: SearchEntityType; label: string; icon: React.ReactNode }[] = [
  { id: 'ALL', label: 'All Results', icon: <Search size={14} /> },
  { id: 'MEETINGS', label: 'Meetings', icon: <Calendar size={14} /> },
  { id: 'TRANSCRIPTS', label: 'Transcripts', icon: <FileText size={14} /> },
  { id: 'DECISIONS', label: 'Decisions', icon: <GitBranch size={14} /> },
  { id: 'ACTION_ITEMS', label: 'Action Items', icon: <ListChecks size={14} /> },
  { id: 'RISKS', label: 'Risks', icon: <AlertTriangle size={14} /> },
  { id: 'COMMITMENTS', label: 'Commitments', icon: <Clock size={14} /> },
  { id: 'TOPICS', label: 'Topics', icon: <Sparkles size={14} /> },
];

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SearchEntityType>('ALL');
  const [results, setResults] = useState<GlobalSearchResultItem[]>([]);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(async (qStr: string, typeVal: SearchEntityType, pNum: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: qStr,
        type: typeVal,
        page: String(pNum),
        limit: '15',
      });
      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setBreakdown(data.metrics?.breakdown || {});
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    performSearch(query, selectedType, page);
  }, [selectedType, page]);

  // Debounced search on query change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      performSearch(query, selectedType, 1);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleTabClick = (t: SearchEntityType) => {
    setSelectedType(t);
    setPage(1);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'MEETING': return <Calendar size={16} style={{ color: '#6366f1' }} />;
      case 'TRANSCRIPT': return <FileText size={16} style={{ color: '#94a3b8' }} />;
      case 'DECISION': return <GitBranch size={16} style={{ color: '#10b981' }} />;
      case 'ACTION_ITEM': return <ListChecks size={16} style={{ color: '#38bdf8' }} />;
      case 'RISK': return <AlertTriangle size={16} style={{ color: '#ef4444' }} />;
      case 'COMMITMENT': return <Clock size={16} style={{ color: '#a855f7' }} />;
      case 'TOPIC': return <Sparkles size={16} style={{ color: '#fbbf24' }} />;
      default: return <Search size={16} />;
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1080, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={26} style={{ color: 'var(--color-primary-light)' }} /> Enterprise Global Search
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Search across meetings, transcripts, decisions, action items, risks, and commitments with strict tenant authorization.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="card" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={20} style={{ position: 'absolute', left: 16, color: 'var(--color-primary-light)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, decisions, speakers, action items (e.g. AWS migration, Cloud, Rajesh, Architecture)..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 15,
              fontWeight: 500,
            }}
          />
        </div>
      </div>

      {/* Entity Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 24 }}>
        {TABS.map((tab) => {
          const isActive = selectedType === tab.id;
          let count = 0;
          if (tab.id === 'ALL') count = total;
          else if (tab.id === 'MEETINGS') count = breakdown.meetings || 0;
          else if (tab.id === 'TRANSCRIPTS') count = breakdown.transcripts || 0;
          else if (tab.id === 'DECISIONS') count = breakdown.decisions || 0;
          else if (tab.id === 'ACTION_ITEMS') count = breakdown.actionItems || 0;
          else if (tab.id === 'RISKS') count = breakdown.risks || 0;
          else if (tab.id === 'COMMITMENTS') count = breakdown.commitments || 0;
          else if (tab.id === 'TOPICS') count = breakdown.topics || 0;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {count > 0 && (
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', fontWeight: 700 }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
          {loading ? 'Searching repository...' : `Found ${total} authorized results`}
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 90, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }} className="skeleton" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Search size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No Matching Records Found</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Try searching for terms like &ldquo;Cloud&rdquo;, &ldquo;Migration&rdquo;, &ldquo;Security&rdquo;, or &ldquo;Architecture&rdquo;.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {results.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.url}
              className="card"
              style={{
                padding: '16px 20px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                transition: 'border-color 0.15s ease, transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                <div style={{ padding: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'fit-content' }}>
                  {getEntityIcon(item.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span className="badge badge-neutral" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {item.type.replace('_', ' ')}
                    </span>
                    {item.meetingTitle && (
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        in <strong>{item.meetingTitle}</strong>
                      </span>
                    )}
                    {item.date && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        • {new Date(item.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {item.snippet}
                  </p>
                </div>
              </div>

              <div style={{ alignSelf: 'center', color: 'var(--color-primary-light)' }}>
                <ArrowRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
            Previous
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', alignSelf: 'center' }}>
            Page {page} of {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
