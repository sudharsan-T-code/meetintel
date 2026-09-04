'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  ListChecks,
  GitBranch,
  Clock,
  Zap,
  BarChart3,
  Search,
  Shield,
  Users,
  KeyRound,
  Lock,
  FileText,
  User,
  Bell,
  Sliders,
  Brain,
  Link2,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Command,
} from 'lucide-react';
import { demoNotifications, demoUser } from '@/lib/demo-data';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const workspaceNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/meetings', label: 'Meetings', icon: <Calendar size={18} /> },
  { href: '/action-items', label: 'Action Items', icon: <ListChecks size={18} /> },
  { href: '/commitments', label: 'Commitments', icon: <GitBranch size={18} /> },
  { href: '/missed-meetings', label: 'Missed Meetings', icon: <Clock size={18} /> },
  { href: '/my-productivity', label: 'My Productivity', icon: <Zap size={18} /> },
];

const intelligenceNavItems: NavItem[] = [
  { href: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { href: '/search', label: 'Search', icon: <Search size={18} /> },
];

const administrationNavItems: NavItem[] = [
  { href: '/admin', label: 'Admin Overview', icon: <Shield size={18} /> },
  { href: '/admin/users', label: 'Users & Invites', icon: <Users size={18} /> },
  { href: '/admin/roles', label: 'Roles & RBAC', icon: <KeyRound size={18} /> },
  { href: '/admin/security', label: 'Security Center', icon: <Lock size={18} /> },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: <FileText size={18} /> },
];

const settingsNavItems: NavItem[] = [
  { href: '/settings/profile', label: 'Profile', icon: <User size={18} /> },
  { href: '/settings/notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { href: '/settings/meetings', label: 'Meeting Defaults', icon: <Sliders size={18} /> },
  { href: '/settings/ai', label: 'AI Intelligence', icon: <Brain size={18} /> },
  { href: '/integrations', label: 'Integrations', icon: <Link2 size={18} /> },
  { href: '/admin/settings', label: 'Organization', icon: <Building2 size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const unreadCount = demoNotifications.filter((n) => !n.isRead).length;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const triggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  };

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div style={{ marginBottom: 12 }}>
      {!collapsed && (
        <div
          style={{
            padding: '6px 16px',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text-tertiary, #64748b)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {title}
        </div>
      )}
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '10px 0' : '8px 16px',
              margin: '2px 8px',
              borderRadius: 'var(--radius-md, 8px)',
              color: active ? 'var(--color-primary-light, #818cf8)' : 'var(--text-secondary, #94a3b8)',
              background: active ? 'var(--color-primary-glow, rgba(99, 102, 241, 0.15))' : 'transparent',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              transition: 'all var(--transition-fast, 0.15s ease)',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            title={collapsed ? item.label : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </div>
            {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
            {!collapsed && item.badge && item.badge > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  background: 'var(--color-danger, #ef4444)',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full, 9999px)',
                }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside
      className="sidebar"
      style={{
        width: collapsed ? 72 : 250,
        transition: 'width var(--transition-normal, 0.25s ease)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        borderRight: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        backgroundColor: 'var(--bg-sidebar, #0c0f17)',
        userSelect: 'none',
      }}
    >
      {/* Logo Header */}
      <div
        style={{
          padding: '18px 16px',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md, 8px)',
            background: 'linear-gradient(135deg, var(--color-primary, #4f46e5), var(--color-accent, #06b6d4))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}
        >
          <Brain size={20} color="white" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--text-primary, #ffffff)' }}>
              MEETINTEL
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-tertiary, #64748b)', fontWeight: 600, letterSpacing: '0.06em' }}>
              ENTERPRISE SAAS
            </div>
          </div>
        )}
      </div>

      {/* Quick Command Palette Button */}
      <div style={{ padding: '8px 12px 4px 12px' }}>
        <button
          onClick={triggerCommandPalette}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: '6px 10px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: 6,
            color: 'var(--text-tertiary, #64748b)',
            fontSize: 12,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          title="Command Palette (Ctrl+K)"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Command size={14} />
            {!collapsed && <span>Commands...</span>}
          </span>
          {!collapsed && (
            <kbd style={{ fontSize: 10, padding: '2px 4px', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>
              Ctrl+K
            </kbd>
          )}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingTop: 8, paddingBottom: 12 }}>
        {renderNavGroup('Workspace', workspaceNavItems)}
        {renderNavGroup('Intelligence', intelligenceNavItems)}
        {renderNavGroup('Administration', administrationNavItems)}
        {renderNavGroup('Settings', settingsNavItems)}
      </nav>

      {/* Bottom Footer Actions */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          padding: '8px 4px',
        }}
      >
        <Link
          href="/notifications"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '8px 0' : '8px 16px',
            margin: '2px 8px',
            borderRadius: 'var(--radius-md, 8px)',
            color: 'var(--text-secondary, #94a3b8)',
            textDecoration: 'none',
            fontSize: 13,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--color-danger, #ef4444)',
                }}
              />
            )}
          </div>
          {!collapsed && <span>Notifications</span>}
          {!collapsed && unreadCount > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--radius-full, 9999px)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '8px 0' : '8px 16px',
            margin: '2px 8px',
            borderRadius: 'var(--radius-md, 8px)',
            color: 'var(--text-tertiary, #64748b)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            width: 'calc(100% - 16px)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>

      {/* Active User Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}
        >
          PS
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #ffffff)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {demoUser.name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary, #64748b)' }}>
              Enterprise Admin
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary, #64748b)',
              cursor: 'pointer',
              padding: 4,
            }}
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
