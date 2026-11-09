import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../features/auth/AuthContext.jsx';
import { ThemeProvider } from '../features/theme/ThemeContext.jsx';
import { GamerProtectedRoute, OrganizerProtectedRoute } from '../components/ProtectedRoute.jsx';

// Core Public & Auth Pages
import Landing from '../pages/Landing.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import VerifyEmail from '../pages/VerifyEmail.jsx';
import NotFound from '../pages/NotFound.jsx';

// Public Esports Network Profiles
import TournamentsList from '../pages/TournamentsList.jsx';
import TournamentDetail from '../pages/TournamentDetail.jsx';
import PublicPlayerProfile from '../pages/PublicPlayerProfile.jsx';
import PublicTeamProfile from '../pages/PublicTeamProfile.jsx';
import PublicOrganizationProfile from '../pages/PublicOrganizationProfile.jsx';
import PublicOrganizerProfile from '../pages/PublicOrganizerProfile.jsx';

// ── GAMER PORTAL PAGES ──
import GamerLogin from '../pages/gamer/GamerLogin.jsx';
import GamerRegister from '../pages/gamer/GamerRegister.jsx';
import GamerDashboard from '../pages/gamer/GamerDashboard.jsx';
import GamerProfileView from '../pages/gamer/GamerProfileView.jsx';
import GamerProfileEdit from '../pages/gamer/GamerProfileEdit.jsx';
import GamerTeams from '../pages/gamer/GamerTeams.jsx';
import GamerTournaments from '../pages/gamer/GamerTournaments.jsx';
import GamerTournamentDetail from '../pages/gamer/GamerTournamentDetail.jsx';
import GamerMatches from '../pages/gamer/GamerMatches.jsx';
import GamerAchievements from '../pages/gamer/GamerAchievements.jsx';
import GamerStatistics from '../pages/gamer/GamerStatistics.jsx';
import GamerNotifications from '../pages/gamer/GamerNotifications.jsx';
import GamerSettings from '../pages/gamer/GamerSettings.jsx';

// ── ORGANIZER PORTAL PAGES ──
import OrganizerLogin from '../pages/organizer/OrganizerLogin.jsx';
import OrganizerRegister from '../pages/organizer/OrganizerRegister.jsx';
import OrganizerDashboard from '../pages/organizer/OrganizerDashboard.jsx';
import OrganizerTournamentsList from '../pages/organizer/OrganizerTournamentsList.jsx';
import OrganizerTournamentWizard from '../pages/organizer/OrganizerTournamentWizard.jsx';
import OrganizerTournamentWorkspace from '../pages/organizer/OrganizerTournamentWorkspace.jsx';
import OrganizerOrganization from '../pages/organizer/OrganizerOrganization.jsx';
import OrganizerStaff from '../pages/organizer/OrganizerStaff.jsx';
import OrganizerPortfolio from '../pages/organizer/OrganizerPortfolio.jsx';
import OrganizerNotifications from '../pages/organizer/OrganizerNotifications.jsx';
import OrganizerSettings from '../pages/organizer/OrganizerSettings.jsx';

import '../styles/nebula.css';

function LegacyDashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="nebula-shell" style={{ minHeight: '100vh' }} />;
  }
  if (!user) {
    return <Navigate to="/gamer/login" replace />;
  }
  const target = user.accountType === 'ORGANIZER' ? '/organizer/dashboard' : '/gamer/dashboard';
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* ── Public Landing & Discovery ── */}
            <Route path="/" element={<Landing />} />
            <Route path="/tournaments" element={<TournamentsList />} />
            <Route path="/tournaments/:slug" element={<TournamentDetail />} />
            <Route path="/players/:slug" element={<PublicPlayerProfile />} />
            <Route path="/teams/:slug" element={<PublicTeamProfile />} />
            <Route path="/organizations/:slug" element={<PublicOrganizationProfile />} />
            <Route path="/organizers/:slug" element={<PublicOrganizerProfile />} />

            {/* Common Auth Utility Routes */}
            <Route path="/login" element={<Navigate to="/gamer/login" replace />} />
            <Route path="/register" element={<Navigate to="/gamer/register" replace />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* ── GAMER PORTAL (Base: /gamer) ── */}
            <Route path="/gamer/login" element={<GamerLogin />} />
            <Route path="/gamer/register" element={<GamerRegister />} />
            <Route
              path="/gamer/dashboard"
              element={
                <GamerProtectedRoute>
                  <GamerDashboard />
                </GamerProtectedRoute>
              }
            />
            <Route
              path="/gamer/profile"
              element={
                <GamerProtectedRoute>
                  <GamerProfileView />
                </GamerProtectedRoute>
              }
            />
            <Route
              path="/gamer/profile/edit"
              element={
                <GamerProtectedRoute>
                  <GamerProfileEdit />
                </GamerProtectedRoute>
              }
            />
            <Route
              path="/gamer/teams"
              element={
                <GamerProtectedRoute>
                  <GamerTeams />
                </GamerProtectedRoute>
              }
            />
            <Route
              path="/gamer/tournaments"
              element={
                <GamerProtectedRoute>
                  <GamerTournaments />
                </GamerProtectedRoute>
              }
            />
            <Route
              path="/gamer/tournaments/:slug"
              element={
                <GamerProtectedRoute>
                  <GamerTournamentDetail />
                </GamerProtectedRoute>
              }
            />
            <Route
              path="/gamer/matches"
              element={
                <GamerProtectedRoute>
                  <GamerMatches />
                </GamerProtectedRoute>
              }
            />
            <Route
              path="/gamer/achievements"
              element={
                <GamerProtectedRoute>
                  <GamerAchievements />
                </GamerProtectedRoute>
              }
            />
            <Route
              path="/gamer/statistics"
              element={
                <GamerProtectedRoute>
                  <GamerStatistics />
                </GamerProtectedRoute>
              }
            />
            <Route
              path="/gamer/notifications"
              element={
                <GamerProtectedRoute>
                  <GamerNotifications />
                </GamerProtectedRoute>
              }
            />
            <Route
              path="/gamer/settings"
              element={
                <GamerProtectedRoute>
                  <GamerSettings />
                </GamerProtectedRoute>
              }
            />

            {/* ── ORGANIZER PORTAL (Base: /organizer) ── */}
            <Route path="/organizer/login" element={<OrganizerLogin />} />
            <Route path="/organizer/register" element={<OrganizerRegister />} />
            <Route
              path="/organizer/dashboard"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerDashboard />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerTournamentsList />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/create"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerTournamentWizard />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id/registrations"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id/competition"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id/schedule"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id/results"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id/standings"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/organization"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerOrganization />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/organization/members"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerStaff />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/events"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerPortfolio />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/notifications"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerNotifications />
                </OrganizerProtectedRoute>
              }
            />
            <Route
              path="/organizer/settings"
              element={
                <OrganizerProtectedRoute>
                  <OrganizerSettings />
                </OrganizerProtectedRoute>
              }
            />

            {/* ── Backward Compatibility Redirects (Account-Type Aware) ── */}
            <Route path="/login" element={<Navigate to="/gamer/login" replace />} />
            <Route path="/register" element={<Navigate to="/gamer/register" replace />} />
            <Route path="/dashboard" element={<LegacyDashboardRedirect />} />
            <Route path="/dashboard/profile" element={<GamerProtectedRoute><Navigate to="/gamer/profile/edit" replace /></GamerProtectedRoute>} />
            <Route path="/dashboard/teams" element={<GamerProtectedRoute><Navigate to="/gamer/teams" replace /></GamerProtectedRoute>} />
            <Route path="/dashboard/organizations" element={<OrganizerProtectedRoute><Navigate to="/organizer/organization" replace /></OrganizerProtectedRoute>} />
            <Route path="/dashboard/organizer" element={<OrganizerProtectedRoute><Navigate to="/organizer/dashboard" replace /></OrganizerProtectedRoute>} />
            <Route path="/dashboard/tournaments/new" element={<OrganizerProtectedRoute><Navigate to="/organizer/tournaments/create" replace /></OrganizerProtectedRoute>} />
            <Route path="/dashboard/tournaments/:id/manage" element={<OrganizerProtectedRoute><Navigate to="/organizer/tournaments/:id" replace /></OrganizerProtectedRoute>} />
            <Route path="/dashboard/notifications" element={<LegacyDashboardRedirect />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
