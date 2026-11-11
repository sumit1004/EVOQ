import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '../Icons.jsx';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { evoqService } from '../../services/evoq.service.js';
import { Avatar } from './Feedback.jsx';

export function PageContainer({
  children,
  maxWidth = '1440px',
  className = '',
  style = {},
}) {
  return (
    <div
      className={`evoq-page-container ${className}`.trim()}
      style={{ maxWidth, ...style }}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeVariant = 'lime',
  breadcrumbs,
  actions,
  className = '',
}) {
  return (
    <header className={`evoq-page-header ${className}`.trim()}>
      <div className="evoq-page-header-text">
        {breadcrumbs && (
          <nav className="evoq-breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.label || idx} className="evoq-breadcrumb-item">
                {crumb.link ? (
                  <Link to={crumb.link}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <span className="evoq-breadcrumb-sep">/</span>}
              </span>
            ))}
          </nav>
        )}
        <div className="evoq-page-title-row">
          <h1 className="evoq-display-title">{title}</h1>
          {badge && (
            <span className={`evoq-badge evoq-badge-${badgeVariant}`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="evoq-page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="evoq-page-header-actions">{actions}</div>}
    </header>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className = '',
}) {
  return (
    <div className={`evoq-section-header ${className}`.trim()}>
      <div>
        <h2 className="evoq-section-title">{title}</h2>
        {subtitle && <p className="evoq-section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="evoq-section-action">{action}</div>}
    </div>
  );
}

export function DashboardHeader({
  title,
  role = 'GAMER',
  actions,
  className = '',
}) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      evoqService
        .getNotifications()
        .then((res) => {
          if (res?.unreadCount !== undefined) {
            setUnreadCount(res.unreadCount);
          } else if (Array.isArray(res)) {
            setUnreadCount(res.filter((n) => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const notificationsLink = role === 'ORGANIZER' ? '/organizer/notifications' : '/gamer/notifications';
  const profileLink = role === 'ORGANIZER' ? '/organizer/settings' : '/gamer/profile';
  const isOps = role === 'ORGANIZER';

  return (
    <header className={`evoq-dash-header ${className}`.trim()}>
      <div className="evoq-header-left">
        <Link to={isOps ? '/organizer/dashboard' : '/gamer/dashboard'} className="evoq-header-brand">
          <span className="evoq-header-logo-text">EVOQ</span>
          <span className={isOps ? 'evoq-badge-ops' : 'evoq-badge-lime'}>{role}</span>
        </Link>
        {title && <span className="evoq-header-title-divider">/</span>}
        {title && <span className="evoq-header-page-title">{title}</span>}
      </div>

      <div className="evoq-header-right">
        {actions}

        {/* Notifications Icon Button with Counter */}
        <Link
          to={notificationsLink}
          className="evoq-icon-btn"
          aria-label="View notifications"
          title="Notifications"
          style={{ position: 'relative' }}
        >
          <Icon name="bell" size={18} color={unreadCount > 0 ? (isOps ? '#22D3EE' : '#C9FF52') : 'currentColor'} />
          {unreadCount > 0 && (
            <span className={`evoq-badge-counter ${isOps ? 'evoq-badge-counter-cyan' : ''}`}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Avatar Pill */}
        {user && (
          <Link
            to={profileLink}
            className="evoq-user-pill"
            title="Account Profile"
          >
            <Avatar src={user.avatarUrl || user.avatar} name={user.username || user.organizationName} size="xs" />
            <span className="evoq-user-pill-name">{user.username || user.organizationName}</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export function DashboardSidebar({
  role = 'GAMER',
  navLinks = [],
  className = '',
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isOps = role === 'ORGANIZER';

  const handleLogout = async () => {
    try {
      await logout();
      navigate(isOps ? '/organizer/login' : '/gamer/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className={`evoq-sidebar ${isOps ? 'is-ops' : ''} ${className}`.trim()} aria-label="Portal Navigation">
      <div className="evoq-sidebar-header">
        <Link to="/" className="evoq-logo-link">
          <span className="evoq-logo-text">EVOQ</span>
          <span className="evoq-logo-dot" />
        </Link>
        <span className={isOps ? 'evoq-badge-ops' : 'evoq-badge-lime'}>
          {role}
        </span>
      </div>

      {user && (
        <div className="evoq-sidebar-user-block">
          <Avatar
            src={user.avatarUrl || user.avatar}
            name={user.username || user.organizationName}
            size="md"
            verified={user.isVerified || user.emailVerified}
          />
          <div className="evoq-sidebar-user-details">
            <div className="evoq-sidebar-name">
              {user.username || user.organizationName}
            </div>
            <div className="evoq-sidebar-role-tag">
              <span className={`evoq-tier-dot ${isOps ? 'evoq-tier-dot-cyan' : ''}`} />
              <span>{isOps ? 'Operations Staff' : 'Verified Competitor'}</span>
            </div>
          </div>
        </div>
      )}

      <nav className="evoq-sidebar-nav">
        <div className="evoq-sidebar-group-title">
          {isOps ? 'OPERATIONS SUITE' : 'MAIN MENU'}
        </div>
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.exact}
            className={({ isActive }) =>
              `evoq-sidebar-link ${isActive ? 'active' : ''} ${
                link.isSpecial ? 'is-special' : ''
              }`
            }
          >
            {link.icon && (
              <span className="evoq-sidebar-icon">
                <Icon name={link.icon} size={18} />
              </span>
            )}
            <span>{link.label}</span>
            {link.badge !== undefined && (
              <span className="evoq-sidebar-link-badge">{link.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Quick Action CTA */}
      <div className="evoq-sidebar-cta">
        {isOps ? (
          <Link
            to="/organizer/tournaments/create"
            className="evoq-btn evoq-btn-ops evoq-btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Icon name="plus" size={14} />
            <span>New Tournament</span>
          </Link>
        ) : (
          <Link
            to="/tournaments"
            className="evoq-btn evoq-btn-secondary evoq-btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Icon name="tournament" size={14} />
            <span>Browse Events</span>
          </Link>
        )}
      </div>

      <div className="evoq-sidebar-footer">
        <button
          type="button"
          onClick={handleLogout}
          className="evoq-sidebar-logout-btn"
        >
          <Icon name="logout" size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export const Header = DashboardHeader;
export const Sidebar = DashboardSidebar;
