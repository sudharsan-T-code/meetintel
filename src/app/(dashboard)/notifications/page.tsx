'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell, CheckCheck, Check, AlertTriangle, ListChecks, Calendar,
  RefreshCw, ArrowUpRight, MessageSquare, Shield, Sparkles
} from 'lucide-react';
import { NotificationItem } from '@/lib/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const url = filterUnread ? '/api/notifications?unread=true' : '/api/notifications';
      const res = await fetch(url);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterUnread]);

  async function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    } catch (e) {
      console.error(e);
    }
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'action_assigned':
        return <ListChecks size={18} color="var(--color-primary-light)" />;
      case 'risk_detected':
        return <AlertTriangle size={18} color="#f87171" />;
      case 'meeting_ready':
        return <Sparkles size={18} color="#4ade80" />;
      case 'sync_success':
        return <RefreshCw size={18} color="#60a5fa" />;
      default:
        return <Bell size={18} color="var(--text-secondary)" />;
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}>
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
            Real-time alerts for action assignments, critical meeting risks, intelligence readiness, and calendar sync.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={filterUnread ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 13 }}
          >
            {filterUnread ? 'Showing Unread' : 'Filter Unread'}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Bell size={36} color="var(--color-primary-light)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>All Caught Up!</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              You have no new unread notifications.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: notif.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0, marginRight: 16 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                    {getTypeIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <h4 style={{
                        fontSize: 14,
                        fontWeight: notif.isRead ? 600 : 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--color-primary-light)',
                        }} />
                      )}
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 8px' }}>
                      {notif.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--text-tertiary)' }}>
                      <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--color-primary-light)',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          View Details <ArrowUpRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-tertiary)',
                      padding: '4px 8px',
                      fontSize: 11,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    title="Mark as Read"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
