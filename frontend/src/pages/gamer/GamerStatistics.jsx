import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GamerLayout from '../../layouts/GamerLayout.jsx';
import { evoqService } from '../../services/evoq.service.js';
import {
  Badge,
  StatCard,
  EmptyState,
  SkeletonLoader,
  SectionHeader,
} from '../../components/ui/index.js';
import { Icon } from '../../components/Icons.jsx';

export default function GamerStatistics() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError('');
      try {
        const prof = await evoqService.getMyProfile();
        setProfile(prof);
      } catch (err) {
        setError('Failed to load performance statistics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = profile?.statistics || [];

  return (
    <GamerLayout
      title="Performance Statistics"
      actions={
        <Link to="/gamer/profile" className="evoq-btn evoq-btn-secondary evoq-btn-sm">
          <Icon name="user" size={14} />
          <span>Player Passport</span>
        </Link>
      }
    >
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--evoq-text-secondary)', fontSize: '0.92rem', margin: 0 }}>
          Aggregated win rates, match counts, and differentials computed directly from approved referee scores.
        </p>
      </div>

      {error && (
        <div className="evoq-alert evoq-alert-danger" role="alert">
          <Icon name="x" size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <SkeletonLoader type="card" count={2} height="180px" />
      ) : stats.length === 0 ? (
        <EmptyState
          icon="statistics"
          title="No Official Match Statistics Yet"
          description="Statistics are compiled as matches conclude in tournaments. Play your first competitive match to begin compiling your stats."
          action={
            <Link to="/gamer/tournaments" className="evoq-btn evoq-btn-primary evoq-btn-sm">
              Discover Open Tournaments
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {stats.map((st) => {
            const total = (st.matchesWon || 0) + (st.matchesLost || 0);
            const winRate = total > 0 ? Math.round((st.matchesWon / total) * 100) : 0;

            return (
              <div key={st.id} className="evoq-card">
                <div className="evoq-card-header">
                  <h3 className="evoq-card-title">
                    <Icon name="games" size={18} color="#C9FF52" />
                    <span>{st.game?.name || 'Competitive Title'}</span>
                  </h3>
                  <Badge variant="lime">{winRate}% WIN RATE</Badge>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '14px',
                  }}
                >
                  <StatCard
                    label="Matches Won"
                    value={st.matchesWon || 0}
                    icon="trophy"
                    lime
                  />
                  <StatCard
                    label="Matches Lost"
                    value={st.matchesLost || 0}
                    icon="x"
                  />
                  <StatCard
                    label="Total Fixtures"
                    value={total}
                    icon="matches"
                  />
                  <StatCard
                    label="Round Differential"
                    value={st.differential || 0}
                    icon="statistics"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GamerLayout>
  );
}
