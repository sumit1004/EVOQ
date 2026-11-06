import { useState, useEffect } from 'react';
import GamerNavbar from '../../components/GamerNavbar.jsx';
import { evoqService } from '../../services/evoq.service.js';
import '../../styles/nebula.css';

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
      setError('Failed to load notifications.');
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
    <div className="nebula-shell">
      <GamerNavbar />
      <main className="nebula-container" style={{ maxWidth: '880px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="nebula-badge nebula-badge-violet" style={{ marginBottom: '0.4rem' }}>
              GAMER DISPATCH
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="nebula-btn nebula-btn-secondary nebula-btn-sm">
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>

        {error && <div className="nebula-alert nebula-alert-danger">{error}</div>}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setFilterUnread(false)}
            className={`nebula-btn nebula-btn-sm ${!filterUnread ? 'nebula-btn-primary' : 'nebula-btn-ghost'}`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterUnread(true)}
            className={`nebula-btn nebula-btn-sm ${filterUnread ? 'nebula-btn-primary' : 'nebula-btn-ghost'}`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {loading ? (
          <div className="nebula-empty-state">
            <div className="nebula-empty-icon">⏳</div>
            <p>Loading alerts...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="nebula-card nebula-empty-state">
            <div className="nebula-empty-icon">🔔</div>
            <p>{filterUnread ? 'No unread notifications.' : 'Your inbox is clear.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {displayed.map((n) => {
              const isRead = isNotificationRead(n);
              return (
                <div
                  key={n.id}
                  className="nebula-card"
                  style={{
                    padding: '1.25rem',
                    borderLeft: isRead ? '1px solid var(--nebula-border)' : '4px solid var(--nebula-violet)',
                    backgroundColor: isRead ? 'var(--nebula-surface-primary)' : 'var(--nebula-surface-elevated)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span className="nebula-badge nebula-badge-violet">{n.type}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--nebula-text-muted)' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: isRead ? 600 : 800, margin: '0 0 0.25rem 0' }}>
                      {n.title}
                    </h3>
                    <p style={{ color: 'var(--nebula-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                      {n.message}
                    </p>
                  </div>

                  {!isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="nebula-btn nebula-btn-ghost nebula-btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

