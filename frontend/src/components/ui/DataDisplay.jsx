import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../Icons.jsx';
import { Badge, StatusIndicator, Avatar } from './Feedback.jsx';
import { PrimaryButton, SecondaryButton } from './Buttons.jsx';

export function StatCard({
  label,
  value,
  subtext,
  icon,
  lime = false,
  trend,
  className = '',
}) {
  return (
    <div className={`evoq-stat-card ${className}`.trim()}>
      <div className="evoq-stat-card-top">
        <span className="evoq-stat-label">{label}</span>
        {icon && (
          <span className="evoq-stat-icon">
            <Icon name={icon} size={16} color={lime ? '#C9FF52' : '#687064'} />
          </span>
        )}
      </div>
      <div className={`evoq-stat-value ${lime ? 'lime' : ''}`}>{value}</div>
      {(subtext || trend) && (
        <div className="evoq-stat-footer">
          {trend && <span className="evoq-stat-trend">{trend}</span>}
          {subtext && <span className="evoq-stat-subtext">{subtext}</span>}
        </div>
      )}
    </div>
  );
}

export function FilterPanel({
  children,
  onReset,
  totalResults,
  isFiltered = false,
  className = '',
}) {
  return (
    <div className={`evoq-filter-panel ${className}`.trim()}>
      <div className="evoq-filter-grid">{children}</div>
      {(isFiltered || totalResults !== undefined) && (
        <div className="evoq-filter-actions">
          {totalResults !== undefined && (
            <span className="evoq-filter-count">
              Found <strong>{totalResults}</strong> result{totalResults === 1 ? '' : 's'}
            </span>
          )}
          {isFiltered && onReset && (
            <button type="button" onClick={onReset} className="evoq-filter-reset-btn">
              <Icon name="x" size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyMessage = 'No records found',
  onRowClick,
  className = '',
}) {
  return (
    <div className={`evoq-table-wrap ${className}`.trim()}>
      <table className="evoq-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key || col.header}
                style={{ textAlign: col.align || 'left', width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px' }}>
                <span className="evoq-spinner" />
                <span style={{ marginLeft: '10px', color: 'var(--evoq-text-secondary)' }}>
                  Loading records...
                </span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '36px', color: 'var(--evoq-text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row[keyField] || rowIdx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col) => (
                  <td key={col.key || col.header} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function TournamentCard({
  tournament,
  linkPrefix = '/tournaments',
  className = '',
}) {
  const {
    id,
    slug,
    title,
    name,
    game,
    format,
    status,
    startDate,
    registrationDeadline,
    maxTeams,
    participantsCount,
    prizePool,
    bannerUrl,
    organizer,
  } = tournament;

  const displayTitle = title || name || 'Tournament Event';
  const targetLink = `${linkPrefix}/${slug || id}`;
  const gameTitle = game?.name || game?.title || 'Competitive Title';
  const organizerName = organizer?.displayName || organizer?.organizationName || organizer?.user?.username || 'EVOQ Partner';
  const dateStr = startDate
    ? new Date(startDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'TBD';

  return (
    <article className={`evoq-tournament-card ${className}`.trim()}>
      <div className="evoq-tourn-card-media">
        {bannerUrl ? (
          <img src={bannerUrl} alt={displayTitle} className="evoq-tourn-banner-img" />
        ) : (
          <div className="evoq-tourn-banner-placeholder">
            <Icon name="tournament" size={28} />
          </div>
        )}
        <div className="evoq-tourn-card-badge-row">
          <StatusIndicator status={status} />
          {format && <Badge variant="neutral">{format.replace(/_/g, ' ')}</Badge>}
        </div>
      </div>

      <div className="evoq-tourn-card-body">
        <span className="evoq-mono-label">{gameTitle}</span>
        <h3 className="evoq-tourn-card-title">
          <Link to={targetLink}>{displayTitle}</Link>
        </h3>

        <div className="evoq-tourn-meta-row">
          <div className="evoq-tourn-meta-item">
            <Icon name="calendar" size={13} />
            <span>{dateStr}</span>
          </div>
          <div className="evoq-tourn-meta-item">
            <Icon name="user" size={13} />
            <span>{organizerName}</span>
          </div>
          {maxTeams && (
            <div className="evoq-tourn-meta-item">
              <Icon name="teams" size={13} />
              <span>
                {participantsCount || 0}/{maxTeams} Slots
              </span>
            </div>
          )}
        </div>

        {prizePool && (
          <div className="evoq-tourn-prize-banner">
            <span className="evoq-prize-label">PRIZE POOL</span>
            <span className="evoq-prize-val">{prizePool}</span>
          </div>
        )}

        <div className="evoq-tourn-card-footer">
          <Link to={targetLink} className="evoq-btn evoq-btn-primary evoq-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            <span>View Details</span>
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function TeamCard({
  team,
  linkPrefix = '/teams',
  action,
  className = '',
}) {
  const { id, slug, name, logoUrl, tag, game, captain, memberCount, members } = team;
  const targetLink = `${linkPrefix}/${slug || id}`;
  const count = memberCount || (members ? members.length : 0);

  return (
    <div className={`evoq-team-card ${className}`.trim()}>
      <div className="evoq-team-card-header">
        <Avatar src={logoUrl} name={name} size="lg" />
        <div className="evoq-team-card-info">
          <div className="evoq-team-name-row">
            <h3 className="evoq-team-card-title">
              <Link to={targetLink}>{name}</Link>
            </h3>
            {tag && <Badge variant="neutral">[{tag}]</Badge>}
          </div>
          {game && <span className="evoq-mono-label">{game.name || game}</span>}
        </div>
      </div>

      <div className="evoq-team-card-meta">
        <div className="evoq-team-meta-col">
          <span className="evoq-meta-label">CAPTAIN</span>
          <span className="evoq-meta-val">{captain?.username || 'Team Lead'}</span>
        </div>
        <div className="evoq-team-meta-col">
          <span className="evoq-meta-label">ROSTER</span>
          <span className="evoq-meta-val">{count} Players</span>
        </div>
      </div>

      <div className="evoq-team-card-footer">
        {action || (
          <Link to={targetLink} className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            <span>Roster & Records</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export function PlayerCard({
  player,
  linkPrefix = '/players',
  action,
  className = '',
}) {
  const { id, slug, username, avatarUrl, bio, country, isVerified, currentTeam } = player;
  const targetLink = `${linkPrefix}/${slug || username || id}`;

  return (
    <div className={`evoq-player-card ${className}`.trim()}>
      <div className="evoq-player-card-header">
        <Avatar src={avatarUrl} name={username} size="lg" verified={isVerified} />
        <div className="evoq-player-card-info">
          <h3 className="evoq-player-username">
            <Link to={targetLink}>{username}</Link>
          </h3>
          {currentTeam && (
            <span className="evoq-player-team-tag">
              <Icon name="teams" size={12} /> {currentTeam.name}
            </span>
          )}
          {country && <span className="evoq-player-country">{country}</span>}
        </div>
      </div>

      {bio && <p className="evoq-player-bio">{bio}</p>}

      <div className="evoq-player-card-footer">
        {action || (
          <Link to={targetLink} className="evoq-btn evoq-btn-secondary evoq-btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            <span>Gamer Passport</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export function MatchCard({
  match,
  onViewCredentials,
  onSubmitResult,
  isOrganizer = false,
  className = '',
}) {
  const {
    id,
    roundName,
    scheduledAt,
    status,
    teamA,
    teamB,
    scoreA,
    scoreB,
    hasCredentials,
  } = match;

  const timeStr = scheduledAt
    ? new Date(scheduledAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'TBD';

  return (
    <div className={`evoq-match-card ${className}`.trim()}>
      <div className="evoq-match-card-top">
        <span className="evoq-mono-label">{roundName || 'MATCH ROUND'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusIndicator status={status} />
          <span className="evoq-match-time">{timeStr}</span>
        </div>
      </div>

      <div className="evoq-match-versus-grid">
        <div className="evoq-match-team evoq-match-team-a">
          <Avatar src={teamA?.logoUrl} name={teamA?.name || 'TBD'} size="sm" />
          <span className="evoq-match-team-name">{teamA?.name || 'Team 1'}</span>
          <span className="evoq-match-score">{scoreA ?? '-'}</span>
        </div>

        <div className="evoq-match-vs-divider">VS</div>

        <div className="evoq-match-team evoq-match-team-b">
          <span className="evoq-match-score">{scoreB ?? '-'}</span>
          <span className="evoq-match-team-name">{teamB?.name || 'Team 2'}</span>
          <Avatar src={teamB?.logoUrl} name={teamB?.name || 'TBD'} size="sm" />
        </div>
      </div>

      {(onViewCredentials || onSubmitResult || isOrganizer) && (
        <div className="evoq-match-card-actions">
          {hasCredentials && onViewCredentials && (
            <SecondaryButton
              size="sm"
              icon="shield"
              onClick={() => onViewCredentials(match)}
            >
              Room Credentials
            </SecondaryButton>
          )}
          {onSubmitResult && status !== 'COMPLETED' && (
            <PrimaryButton
              size="sm"
              icon="check"
              onClick={() => onSubmitResult(match)}
            >
              Report Result
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}

export function Card({
  children,
  title,
  subtitle,
  actions,
  badge,
  className = '',
  style = {},
  ...props
}) {
  return (
    <div className={`evoq-card ${className}`.trim()} style={style} {...props}>
      {(title || subtitle || actions || badge) && (
        <div className="evoq-card-header">
          <div className="evoq-card-header-text">
            {title && <h3 className="evoq-card-title">{title}</h3>}
            {subtitle && <p className="evoq-card-subtitle">{subtitle}</p>}
          </div>
          <div className="evoq-card-header-actions">
            {badge}
            {actions}
          </div>
        </div>
      )}
      <div className="evoq-card-body">{children}</div>
    </div>
  );
}

export const Table = DataTable;


