import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthContext.jsx';
import { ThemeProvider } from '../features/theme/ThemeContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

// Core Public & Auth Pages
import Home from '../pages/Home.jsx';
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

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* ── Public Landing & Discovery ── */}
            <Route path="/" element={<Home />} />
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
                <ProtectedRoute>
                  <GamerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamer/profile"
              element={
                <ProtectedRoute>
                  <GamerProfileView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamer/profile/edit"
              element={
                <ProtectedRoute>
                  <GamerProfileEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamer/teams"
              element={
                <ProtectedRoute>
                  <GamerTeams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamer/tournaments"
              element={
                <ProtectedRoute>
                  <GamerTournaments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamer/tournaments/:slug"
              element={
                <ProtectedRoute>
                  <GamerTournamentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamer/matches"
              element={
                <ProtectedRoute>
                  <GamerMatches />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamer/achievements"
              element={
                <ProtectedRoute>
                  <GamerAchievements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamer/statistics"
              element={
                <ProtectedRoute>
                  <GamerStatistics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamer/notifications"
              element={
                <ProtectedRoute>
                  <GamerNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gamer/settings"
              element={
                <ProtectedRoute>
                  <GamerSettings />
                </ProtectedRoute>
              }
            />

            {/* ── ORGANIZER PORTAL (Base: /organizer) ── */}
            <Route path="/organizer/login" element={<OrganizerLogin />} />
            <Route path="/organizer/register" element={<OrganizerRegister />} />
            <Route
              path="/organizer/dashboard"
              element={
                <ProtectedRoute>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments"
              element={
                <ProtectedRoute>
                  <OrganizerTournamentsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/create"
              element={
                <ProtectedRoute>
                  <OrganizerTournamentWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id"
              element={
                <ProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id/registrations"
              element={
                <ProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id/competition"
              element={
                <ProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id/schedule"
              element={
                <ProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id/results"
              element={
                <ProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/tournaments/:id/standings"
              element={
                <ProtectedRoute>
                  <OrganizerTournamentWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/organization"
              element={
                <ProtectedRoute>
                  <OrganizerOrganization />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/organization/members"
              element={
                <ProtectedRoute>
                  <OrganizerStaff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events"
              element={
                <ProtectedRoute>
                  <OrganizerPortfolio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/notifications"
              element={
                <ProtectedRoute>
                  <OrganizerNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/settings"
              element={
                <ProtectedRoute>
                  <OrganizerSettings />
                </ProtectedRoute>
              }
            />

            {/* ── Backward Compatibility Redirects ── */}
            <Route path="/dashboard" element={<Navigate to="/gamer/dashboard" replace />} />
            <Route path="/dashboard/profile" element={<Navigate to="/gamer/profile/edit" replace />} />
            <Route path="/dashboard/teams" element={<Navigate to="/gamer/teams" replace />} />
            <Route path="/dashboard/organizations" element={<Navigate to="/organizer/organization" replace />} />
            <Route path="/dashboard/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
            <Route path="/dashboard/tournaments/new" element={<Navigate to="/organizer/tournaments/create" replace />} />
            <Route path="/dashboard/tournaments/:id/manage" element={<Navigate to="/organizer/tournaments/:id" replace />} />
            <Route path="/dashboard/notifications" element={<Navigate to="/gamer/notifications" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
