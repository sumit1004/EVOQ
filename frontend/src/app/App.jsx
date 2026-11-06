import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

// Core Auth & Landing Pages
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import VerifyEmail from '../pages/VerifyEmail.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import NotFound from '../pages/NotFound.jsx';

// Phase 4–7 Platform Pages
import ProfileEdit from '../pages/ProfileEdit.jsx';
import PublicPlayerProfile from '../pages/PublicPlayerProfile.jsx';
import TeamsManager from '../pages/TeamsManager.jsx';
import PublicTeamProfile from '../pages/PublicTeamProfile.jsx';
import OrganizationsManager from '../pages/OrganizationsManager.jsx';
import PublicOrganizationProfile from '../pages/PublicOrganizationProfile.jsx';
import PublicOrganizerProfile from '../pages/PublicOrganizerProfile.jsx';
import TournamentsList from '../pages/TournamentsList.jsx';
import TournamentDetail from '../pages/TournamentDetail.jsx';
import TournamentWizard from '../pages/TournamentWizard.jsx';
import TournamentManager from '../pages/TournamentManager.jsx';
import OrganizerDashboard from '../pages/OrganizerDashboard.jsx';
import NotificationsPage from '../pages/NotificationsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Public Tournament & Network Profiles */}
          <Route path="/tournaments" element={<TournamentsList />} />
          <Route path="/tournaments/:slug" element={<TournamentDetail />} />
          <Route path="/players/:slug" element={<PublicPlayerProfile />} />
          <Route path="/teams/:slug" element={<PublicTeamProfile />} />
          <Route path="/organizations/:slug" element={<PublicOrganizationProfile />} />
          <Route path="/organizers/:slug" element={<PublicOrganizerProfile />} />

          {/* Protected Platform Dashboard & Operations */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/teams"
            element={
              <ProtectedRoute>
                <TeamsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/organizations"
            element={
              <ProtectedRoute>
                <OrganizationsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/organizer"
            element={
              <ProtectedRoute>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tournaments/new"
            element={
              <ProtectedRoute>
                <TournamentWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tournaments/:id/manage"
            element={
              <ProtectedRoute>
                <TournamentManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
