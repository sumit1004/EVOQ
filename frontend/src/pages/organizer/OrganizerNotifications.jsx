import React, { useState, useEffect } from 'react';
import OrganizerLayout from '../../layouts/OrganizerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  PrimaryButton,
  SecondaryButton,
  Tabs,
  Badge,
  EmptyState,
  SkeletonLoader,
  PageHeader,
  NotificationItem,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function OrganizerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
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
      setError('Failed to load operational alerts.');
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
  const unreadCount = safeList.filter((n) => !isNotificationRead(n)).length;
  const displayed =
    activeTab === 'unread' ? safeList.filter((n) => !isNotificationRead(n)) : safeList;

  const tabs = [
    { id: 'all', label: 'All Alerts', count: safeList.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
  ];

  return (
    <OrganizerLayout>
      <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <PageHeader
          badge="OPERATIONAL DISPATCH"
          title="OPERATIONS NOTIFICATIONS"
          subtitle="Real-time alerts, match room activity, registrations, and bracket updates."
          actions={
            unreadCount > 0 && (
              <SecondaryButton size="sm" onClick={handleMarkAllRead}>
                Mark All Read ({unreadCount})
              </SecondaryButton>
            )
          }
        />

        {error && (
          <div className="evoq-alert evoq-alert-danger" role="alert">
            <Icon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <SkeletonLoader height={80} />
            <SkeletonLoader height={80} />
            <SkeletonLoader height={80} />
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState
            icon="bell"
            title={activeTab === 'unread' ? 'No Unread Operational Alerts' : 'No Notifications'}
            description="Your tournament operations alert queue is currently clear."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {displayed.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={() => handleMarkRead(n.id)}
              />
            ))}
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
}
