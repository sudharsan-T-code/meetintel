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
  Check,
  ChevronDown,
} from 'lucide-react';
import { demoNotifications } from '@/lib/demo-data';
import { useAuth } from '@/lib/auth/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  adminOnly?: boolean;
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
  { href: '/admin', label: 'Admin Overview', icon: <Shield size={18} />, adminOnly: true },
  { href: '/admin/users', label: 'Users & Invites', icon: <Users size={18} />, adminOnly: true },
  { href: '/admin/roles', label: 'Roles & RBAC', icon: <KeyRound size={18} />, adminOnly: true },
  { href: '/admin/security', label: 'Security Center', icon: <Lock size={18} />, adminOnly: true },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: <FileText size={18} />, adminOnly: true },
];

const settingsNavItems: NavItem[] = [
  { href: '/settings/profile', label: 'Profile', icon: <User size={18} /> },
  { href: '/settings/notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { href: '/settings/meetings', label: 'Meeting Defaults', icon: <Sliders size={18} /> },
  { href: '/settings/ai', label: 'AI Intelligence', icon: <Brain size={18} /> },
  { href: '/integrations', label: 'Integrations', icon: <Link2 size={18} /> },
  { href: '/admin/settings', label: 'Organization', icon: <Building2 size={18} />, adminOnly: true },
];

const PERSONA_OPTIONS = [
  {
    key: 'admin',
    name: 'Rajesh Kumar',
    roleLabel: 'Enterprise Admin',
    badge: 'ADMIN',
    department: 'Technology',
  },
  {
    key: 'manager',
    name: 'Priya Sharma',
    roleLabel: 'Senior Eng Manager',
    badge: 'MANAGER',
    department: 'Engineering',
  },
  {
    key: 'product',
    name: 'Sarah Chen',
    roleLabel: 'Principal PM',
    badge: 'MANAGER',
    department: 'Product',
  },
  {
    key: 'employee',
    name: 'Ananya Patel',
    roleLabel: 'Staff Engineer',
    badge: 'EMPLOYEE',
    department: 'Engineering',
  },
  {
    key: 'hr',
    name: 'Vikram Malhotra',
    roleLabel: 'HR Business Partner',
    badge: 'HR',
    department: 'People',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const { user, roleLabel, logout, switchPersona, checkMinimumRole } = useAuth();

  const unreadCount = demoNotifications.filter((n) => !n.isRead).length;
  const isAdmin = checkMinimumRole('ADMIN');

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const triggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  };

  const getInitials = (name?: string) => {
    if (!name) return 'ME';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const renderNavGroup = (title: string, items: NavItem[], isRestrictedGroup = false) => {
    // Hide administration entirely if strictly required, or render with lock indicators
    if (isRestrictedGroup && !isAdmin) {
      return (
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{title}</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  padding: '1px 5px',
                  borderRadius: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Lock size={9} /> Restricted
              </span>
            </div>
          )}
          {items.map((item) => {
            return (
              <div
                key={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: collapsed ? '10px 0' : '8px 16px',
                  margin: '2px 8px',
                  borderRadius: 'var(--radius-md, 8px)',
                  color: 'var(--text-disabled, rgba(148, 163, 184, 0.4))',
                  fontSize: 13,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                }}
                title={collapsed ? `${item.label} (Admin Required)` : 'Requires Enterprise Admin privileges'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {!collapsed && <Lock size={12} style={{ marginLeft: 'auto', opacity: 0.7 }} />}
              </div>
            );
          })}
        </div>
      );
    }

    return (
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
              {!collapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}
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
  };

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
        position: 'relative',
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
              ENTERPRISE AI
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-tertiary, #64748b)',
            cursor: 'pointer',
            padding: 4,
            display: collapsed ? 'none' : 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius-sm, 6px)',
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={16} />
        </button>
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
        {renderNavGroup('Administration', administrationNavItems, true)}
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
                color: 'var(--color-danger, #ef4444)',
                fontSize: 11,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--radius-full, 9999px)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </Link>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary, #64748b)',
              cursor: 'pointer',
            }}
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Interactive Persona Switcher Popover */}
      {personaMenuOpen && !collapsed && (
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            left: 12,
            right: 12,
            backgroundColor: '#131826',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
            padding: 8,
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-tertiary, #64748b)',
              padding: '6px 8px 8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Switch Role Persona</span>
            <span style={{ fontSize: 10, color: '#818cf8' }}>Demo</span>
          </div>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {PERSONA_OPTIONS.map((persona) => {
              const isSelected = user?.email?.toLowerCase() === `${persona.key === 'admin' ? 'admin' : persona.key === 'manager' ? 'priya.sharma' : persona.key === 'product' ? 'sarah.chen' : persona.key === 'employee' ? 'ananya.patel' : 'vikram.malhotra'}@cognizant.com`;
              return (
                <button
                  key={persona.key}
                  onClick={async () => {
                    await switchPersona(persona.key);
                    setPersonaMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 6,
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: 'none',
                    color: isSelected ? '#a5b4fc' : 'var(--text-secondary, #94a3b8)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    fontSize: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: isSelected ? '#ffffff' : 'inherit' }}>
                      {persona.name}
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.8 }}>{persona.roleLabel}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 5px',
                        borderRadius: 4,
                        background: persona.key === 'admin' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                        color: persona.key === 'admin' ? '#818cf8' : 'var(--text-tertiary, #94a3b8)',
                      }}
                    >
                      {persona.badge}
                    </span>
                    {isSelected && <Check size={14} color="#818cf8" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Active User Footer */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          justifyContent: collapsed ? 'center' : 'flex-start',
          position: 'relative',
        }}
      >
        <button
          onClick={() => !collapsed && setPersonaMenuOpen(!personaMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: collapsed ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flex: 1,
            minWidth: 0,
            textAlign: 'left',
          }}
          title={collapsed ? `${user?.name || 'User'} (${roleLabel})` : 'Click to switch persona'}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: isAdmin
                ? 'linear-gradient(135deg, #4f46e5, #06b6d4)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary, #ffffff)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{user?.name || 'Priya Sharma'}</span>
                <ChevronDown size={12} color="#64748b" />
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: isAdmin ? '#818cf8' : 'var(--text-tertiary, #64748b)',
                  fontWeight: isAdmin ? 600 : 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {roleLabel}
              </div>
            </div>
          )}
        </button>

        {!collapsed && (
          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary, #64748b)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
