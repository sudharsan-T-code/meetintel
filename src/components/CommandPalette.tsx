'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BarChart3,
  ListChecks,
  GitBranch,
  Clock,
  Zap,
  Shield,
  Users,
  KeyRound,
  Lock,
  FileText,
  Settings,
  User,
  Bell,
  Sliders,
  Brain,
  Link2,
  Building2,
  X,
  ArrowRight,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'WORKSPACE' | 'INTELLIGENCE' | 'ADMINISTRATION' | 'SETTINGS';
  icon: React.ReactNode;
  href: string;
  keywords: string[];
  adminOnly?: boolean;
}

const COMMANDS: CommandItem[] = [
  // Workspace
  { id: 'dash', title: 'Open Dashboard', category: 'WORKSPACE', icon: <LayoutDashboard size={18} />, href: '/dashboard', keywords: ['home', 'overview', 'kpi'] },
  { id: 'mtgs', title: 'Open Meetings', category: 'WORKSPACE', icon: <Calendar size={18} />, href: '/meetings', keywords: ['calendar', 'calls', 'transcripts'] },
  { id: 'new-mtg', title: 'Create / Ingest Meeting', category: 'WORKSPACE', icon: <PlusCircle size={18} />, href: '/meetings/new', keywords: ['upload', 'new', 'audio', 'video'] },
  { id: 'actions', title: 'Open Action Items', category: 'WORKSPACE', icon: <ListChecks size={18} />, href: '/action-items', keywords: ['tasks', 'todo', 'assignee'] },
  { id: 'commits', title: 'Open Commitments', category: 'WORKSPACE', icon: <GitBranch size={18} />, href: '/commitments', keywords: ['promises', 'deliverables', 'tracking'] },
  { id: 'missed', title: 'Open Missed Meetings', category: 'WORKSPACE', icon: <Clock size={18} />, href: '/missed-meetings', keywords: ['what did i miss', 'recap', 'absent'] },
  { id: 'prod', title: 'Open My Productivity', category: 'WORKSPACE', icon: <Zap size={18} />, href: '/my-productivity', keywords: ['stats', 'focus', 'time', 'score'] },

  // Intelligence
  { id: 'analytics', title: 'Open Executive Analytics', category: 'INTELLIGENCE', icon: <BarChart3 size={18} />, href: '/analytics', keywords: ['trends', 'charts', 'cost', 'metrics'] },
  { id: 'search', title: 'Global Search', category: 'INTELLIGENCE', icon: <Search size={18} />, href: '/search', keywords: ['find', 'query', 'transcript', 'decisions'] },

  // Administration
  { id: 'admin-dash', title: 'Admin Overview', category: 'ADMINISTRATION', icon: <Shield size={18} />, href: '/admin', keywords: ['admin', 'governance', 'kpi'], adminOnly: true },
  { id: 'admin-users', title: 'Manage Users & Invitations', category: 'ADMINISTRATION', icon: <Users size={18} />, href: '/admin/users', keywords: ['members', 'directory', 'invite', 'role'], adminOnly: true },
  { id: 'admin-roles', title: 'Role & Permission Matrix', category: 'ADMINISTRATION', icon: <KeyRound size={18} />, href: '/admin/roles', keywords: ['rbac', 'access', 'privileges'], adminOnly: true },
  { id: 'admin-sec', title: 'Security Center', category: 'ADMINISTRATION', icon: <Lock size={18} />, href: '/admin/security', keywords: ['tokens', 'encryption', 'mfa', 'compliance'], adminOnly: true },
  { id: 'admin-audit', title: 'Audit Logs', category: 'ADMINISTRATION', icon: <FileText size={18} />, href: '/admin/audit-logs', keywords: ['events', 'history', 'compliance', 'immutable'], adminOnly: true },
  { id: 'admin-org', title: 'Organization Settings', category: 'ADMINISTRATION', icon: <Building2 size={18} />, href: '/admin/settings', keywords: ['retention', 'policies', 'workspace'], adminOnly: true },

  // Settings
  { id: 'set-prof', title: 'Profile Settings', category: 'SETTINGS', icon: <User size={18} />, href: '/settings/profile', keywords: ['account', 'name', 'timezone', 'avatar'] },
  { id: 'set-notif', title: 'Notification Preferences', category: 'SETTINGS', icon: <Bell size={18} />, href: '/settings/notifications', keywords: ['alerts', 'email', 'in-app'] },
  { id: 'set-mtg', title: 'Meeting Settings', category: 'SETTINGS', icon: <Sliders size={18} />, href: '/settings/meetings', keywords: ['duration', 'summary', 'diarization'] },
  { id: 'set-ai', title: 'AI Intelligence & Privacy', category: 'SETTINGS', icon: <Brain size={18} />, href: '/settings/ai', keywords: ['llm', 'openai', 'gemini', 'anthropic', 'provider'] },
  { id: 'set-int', title: 'Connected Integrations', category: 'SETTINGS', icon: <Link2 size={18} />, href: '/integrations', keywords: ['google', 'microsoft', 'zoom', 'teams', 'calendar'] },
];

export default function CommandPalette({ userRole = 'ADMIN' }: { userRole?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        setSelectedIndex(0);
      }, 50);
    }
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter((cmd) => {
    if (cmd.adminOnly && !isAdmin) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filteredCommands.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex].href);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: 16,
        paddingRight: 16,
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          backgroundColor: 'var(--bg-card, #131722)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
      >
        {/* Search Input Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            gap: 12,
          }}
        >
          <Search size={20} style={{ color: 'var(--color-primary-light, #6366f1)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, navigate, or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInInput}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary, #ffffff)',
              fontSize: 16,
              fontWeight: 500,
            }}
          />
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary, #94a3b8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Command Items List */}
        <div
          style={{
            overflowY: 'auto',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-tertiary, #94a3b8)' }}>
              No commands matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => handleSelect(cmd.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md, 8px)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--color-primary-glow, rgba(99, 102, 241, 0.15))' : 'transparent',
                    color: isSelected ? 'var(--color-primary-light, #818cf8)' : 'var(--text-primary, #f1f5f9)',
                    transition: 'background 0.1s ease',
                  }}
                >
                  <div
                    style={{
                      color: isSelected ? 'var(--color-primary-light, #818cf8)' : 'var(--text-secondary, #94a3b8)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {cmd.icon}
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400 }}>{cmd.title}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary, #64748b)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                      }}
                    >
                      {cmd.category}
                    </span>
                  </div>
                  {isSelected && <ArrowRight size={14} style={{ color: 'var(--color-primary-light, #818cf8)' }} />}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            fontSize: 12,
            color: 'var(--text-tertiary, #64748b)',
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <span><kbd style={{ padding: '2px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.1)' }}>↑↓</kbd> to navigate</span>
            <span><kbd style={{ padding: '2px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.1)' }}>Enter</kbd> to select</span>
            <span><kbd style={{ padding: '2px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.1)' }}>Esc</kbd> to close</span>
          </div>
          <div>
            <kbd style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.1)', fontWeight: 600 }}>Ctrl+K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
