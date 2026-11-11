import React, { useState, useEffect } from 'react';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  NotificationItem,
  SecondaryButton,
  EmptyState,
  SkeletonLoader,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function GamerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    setError('');
    try {
      const data = await evoqService.getNotifications();
      const list = Array.isArray(data) ? data : data?.notifications || [];
      setNotifications(list);
    } catch (err) {
      setError('Failed to load notifications from the network.');
    } finally {
      setLoading(false);
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await evoqService.markNotificationRead(id);
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: n.readAt || new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await evoqService.markAllNotificationsRead();
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt || new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const isNotificationRead = (n) => Boolean(n.readAt || n.isRead);
  const safeList = Array.isArray(notifications) ? notifications : [];
  const displayed = filterUnread ? safeList.filter((n) => !isNotificationRead(n)) : safeList;
  const unreadCount = safeList.filter((n) => !isNotificationRead(n)).length;

  return (
    <GamerLayout
      title="Notifications & Alerts"
      actions={
        unreadCount > 0 ? (
          <SecondaryButton
            size="sm"
            icon="check"
            onClick={handleMarkAllRead}
          >
            Mark All Read ({unreadCount})
          </SecondaryButton>
        ) : null
      }
    >
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setFilterUnread(false)}
            className={`evoq-tab-item ${!filterUnread ? 'active' : ''}`}
          >
            All Dispatch ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterUnread(true)}
            className={`evoq-tab-item ${filterUnread ? 'active' : ''}`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {error && (
          <div className="evoq-alert evoq-alert-danger" role="alert">
            <Icon name="x" size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <SkeletonLoader type="text" count={4} height="70px" />
        ) : displayed.length === 0 ? (
          <EmptyState
            icon="bell"
            title={filterUnread ? 'No Unread Alerts' : 'No Notifications'}
            description="You are caught up on all tournament schedules, roster invites, and bracket updates."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {displayed.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>
    </GamerLayout>
  );
}
