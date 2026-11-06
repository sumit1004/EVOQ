import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import { evoqService } from '../services/evoq.service.js';
import '../styles/platform.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setError(err.response?.data?.error?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await evoqService.markNotificationRead(id);
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: n.readAt || new Date().toISOString() } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await evoqService.markAllNotificationsRead();
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => ({
          ...n,
          isRead: true,
          readAt: n.readAt || new Date().toISOString(),
        }))
      );
      setSuccess('All notifications marked as read.');
    } catch (err) {
      setError('Failed to mark all as read.');
    }
  }

  const isNotificationRead = (n) => Boolean(n.readAt || n.isRead);
  const safeList = Array.isArray(notifications) ? notifications : [];
  const displayedNotifications = filterUnread
    ? safeList.filter((n) => !isNotificationRead(n))
    : safeList;

  const unreadCount = safeList.filter((n) => !isNotificationRead(n)).length;

  return (
    <>
      <Navbar />
      <div className="platform-page" style={{ maxWidth: '840px' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Notification Center</h1>
            <p className="page-subtitle">Tournament updates, match calls, team invitations, and achievement alerts.</p>
          </div>
          {unreadCount > 0 && (
            <button className="evoq-btn evoq-btn-secondary" onClick={handleMarkAllRead}>
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>

        {error && <div className="evoq-card status-danger" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
        {success && <div className="evoq-card status-success" style={{ marginBottom: 'var(--space-md)' }}>{success}</div>}

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
          <button
            className={`evoq-btn ${!filterUnread ? 'evoq-btn-primary' : 'evoq-btn-secondary'}`}
            onClick={() => setFilterUnread(false)}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            All ({notifications.length})
          </button>
          <button
            className={`evoq-btn ${filterUnread ? 'evoq-btn-primary' : 'evoq-btn-secondary'}`}
            onClick={() => setFilterUnread(true)}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Loading notifications...</div>
        ) : displayedNotifications.length === 0 ? (
          <div className="evoq-card empty-state">
            <p>{filterUnread ? 'No unread notifications.' : 'You have no notifications yet.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {displayedNotifications.map((n) => {
              const isRead = isNotificationRead(n);
              return (
                <div
                  key={n.id}
                  className="evoq-card"
                  style={{
                    padding: 'var(--space-md)',
                    backgroundColor: isRead ? 'var(--surface)' : 'var(--surface-raised)',
                    borderLeft: isRead ? '1px solid var(--border)' : '4px solid var(--primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 'var(--space-md)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: '4px' }}>
                      <span className="evoq-badge badge-primary">{n.type}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: isRead ? '600' : '700', marginBottom: '4px' }}>
                      {n.title}
                    </h3>
                    <p style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {n.message}
                    </p>
                  </div>

                  {!isRead && (
                    <button
                      className="evoq-btn evoq-btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      onClick={() => handleMarkRead(n.id)}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

