import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../Icons.jsx';
import { PrimaryButton, SecondaryButton } from './Buttons.jsx';

export function Badge({
  children,
  variant = 'lime', // 'lime' | 'neutral' | 'danger' | 'warning' | 'cyan'
  size = 'md', // 'sm' | 'md'
  icon,
  className = '',
}) {
  const sizeClass = size === 'sm' ? 'evoq-badge-sm' : '';
  const variantClass = `evoq-badge-${variant}`;

  return (
    <span className={`evoq-badge ${variantClass} ${sizeClass} ${className}`.trim()}>
      {icon && <Icon name={icon} size={12} />}
      <span>{children}</span>
    </span>
  );
}

export function StatusIndicator({
  status = 'pending',
  label,
  className = '',
}) {
  const s = String(status).toLowerCase();
  let color = '#A5AA9C';
  let displayLabel = label || status;

  if (['ongoing', 'live', 'approved', 'active', 'verified', 'connected'].includes(s)) {
    color = '#C9FF52';
  } else if (['upcoming', 'scheduled', 'draft', 'pending'].includes(s)) {
    color = '#F5A623';
  } else if (['completed', 'ended', 'archived'].includes(s)) {
    color = '#687064';
  } else if (['rejected', 'cancelled', 'disqualified', 'banned'].includes(s)) {
    color = '#FF4D4D';
  }

  return (
    <span className={`evoq-status-indicator ${className}`.trim()}>
      <span
        className="evoq-status-dot"
        style={{
          backgroundColor: color,
          boxShadow: color === '#C9FF52' ? '0 0 8px rgba(201, 255, 82, 0.6)' : 'none',
        }}
      />
      <span className="evoq-status-text" style={{ color }}>
        {displayLabel}
      </span>
    </span>
  );
}

export function Avatar({
  src,
  name = 'Player',
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  verified = false,
  className = '',
}) {
  const [imgError, setImgError] = useState(false);
  const initials = (name || 'G')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClass =
    size === 'xs'
      ? 'evoq-avatar-xs'
      : size === 'sm'
      ? 'evoq-avatar-sm'
      : size === 'lg'
      ? 'evoq-avatar-lg'
      : size === 'xl'
      ? 'evoq-avatar-xl'
      : 'evoq-avatar-md';

  return (
    <div className={`evoq-avatar-container ${sizeClass} ${className}`.trim()}>
      <div className="evoq-user-avatar">
        {src && !imgError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            className="evoq-avatar-img"
          />
        ) : (
          <span className="evoq-avatar-initials">{initials}</span>
        )}
      </div>
      {verified && (
        <span className="evoq-avatar-verified-badge" title="Verified Competitor">
          <Icon name="check" size={10} color="#080A08" />
        </span>
      )}
    </div>
  );
}

export function SkeletonLoader({
  type = 'text', // 'text' | 'card' | 'avatar' | 'table-row'
  count = 1,
  height,
  width,
  className = '',
}) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className={`evoq-skeleton-grid ${className}`.trim()}>
        {items.map((_, i) => (
          <div key={i} className="evoq-skeleton-card" style={{ height: height || '180px' }} />
        ))}
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div
        className={`evoq-skeleton-avatar ${className}`.trim()}
        style={{ width: width || '44px', height: height || '44px' }}
      />
    );
  }

  if (type === 'table-row') {
    return (
      <div className={`evoq-skeleton-table ${className}`.trim()}>
        {items.map((_, i) => (
          <div key={i} className="evoq-skeleton-row" />
        ))}
      </div>
    );
  }

  return (
    <div className={`evoq-skeleton-text-wrap ${className}`.trim()}>
      {items.map((_, i) => (
        <div
          key={i}
          className="evoq-skeleton-text"
          style={{ height: height || '16px', width: width || (i === count - 1 ? '70%' : '100%') }}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  icon = 'tournament',
  title = 'No Data Found',
  description = 'There are no active records in this view.',
  action,
  className = '',
}) {
  return (
    <div className={`evoq-empty-state ${className}`.trim()}>
      <div className="evoq-empty-icon-wrap">
        <Icon name={icon} size={32} />
      </div>
      <h4 className="evoq-empty-title">{title}</h4>
      {description && <p className="evoq-empty-desc">{description}</p>}
      {action && <div className="evoq-empty-action">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Failed to load information from the EVOQ network.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`evoq-error-state ${className}`.trim()} role="alert">
      <div className="evoq-error-icon-wrap">
        <Icon name="x" size={28} />
      </div>
      <h4 className="evoq-error-title">{title}</h4>
      {description && <p className="evoq-error-desc">{description}</p>}
      {onRetry && (
        <SecondaryButton onClick={onRetry} icon="arrow-right" size="sm">
          Try Again
        </SecondaryButton>
      )}
    </div>
  );
}

export function NotificationItem({
  notification,
  onMarkRead,
  className = '',
}) {
  const { id, title, message, createdAt, isRead, link, type } = notification;

  let iconName = 'bell';
  if (type === 'TOURNAMENT') iconName = 'trophy';
  else if (type === 'TEAM') iconName = 'teams';
  else if (type === 'MATCH') iconName = 'matches';
  else if (type === 'SYSTEM') iconName = 'shield';

  const timeFormatted = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const content = (
    <div className={`evoq-notif-item ${!isRead ? 'is-unread' : ''} ${className}`.trim()}>
      <div className="evoq-notif-icon">
        <Icon name={iconName} size={16} color={!isRead ? '#C9FF52' : '#A5AA9C'} />
      </div>
      <div className="evoq-notif-content">
        <div className="evoq-notif-header">
          <span className="evoq-notif-title">{title || 'Notification'}</span>
          <span className="evoq-notif-time">{timeFormatted}</span>
        </div>
        {message && <p className="evoq-notif-message">{message}</p>}
      </div>
      {!isRead && onMarkRead && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkRead(id);
          }}
          className="evoq-notif-mark-btn"
          title="Mark as read"
        >
          <span className="evoq-notif-unread-dot" />
        </button>
      )}
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="evoq-notif-link">
        {content}
      </Link>
    );
  }

  return content;
}

export function LoadingState({
  label = 'Loading from EVOQ Network...',
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) {
  const spinnerSize = size === 'sm' ? 18 : size === 'lg' ? 32 : 24;

  return (
    <div className={`evoq-loading-state ${className}`.trim()} role="status" aria-live="polite">
      <div className="evoq-spinner" style={{ width: spinnerSize, height: spinnerSize }} />
      {label && <p className="evoq-loading-label">{label}</p>}
    </div>
  );
}


