import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { GoogleLoginForm, SetupUsernamePage } from "@/features/auth/components";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { PrivacySettingsPage } from "@/features/privacy/PrivacySettingsPage";
import { FriendsPage } from "@/features/friends/FriendsPage";
import { HomePage } from "@/features/feed/HomePage";
import { LivePage } from "@/features/live/LivePage";
import { AdminPage } from "@/features/admin/AdminPage";
import { SearchPage } from "@/features/search/SearchPage";
import { HashtagExplorePage, HashtagDetailPage } from "@/features/hashtags";
import { GroupListPage, GroupDetailPage, GroupSettingsPage } from "@/features/groups";
import { EventListPage, EventDetailPage, CreateEventPage } from "@/features/events";
import { VideosPage, WatchPage, PlaylistsPage, PlaylistDetailPage, HistoryPage } from "@/features/videos";
import { AnalyticsPage } from "@/features/analytics";
import { MessagingPage } from "@/features/messaging";
import { NotFoundPage } from "@/components/NotFoundPage";
import { AppLayout } from "@/components/layout/AppLayout";

function ProtectedRoute({ children, showRightSidebar = true }: { children: React.ReactNode; showRightSidebar?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.username) {
    return <Navigate to="/setup" replace />;
  }

  return <AppLayout showRightSidebar={showRightSidebar}>{children}</AppLayout>;
}

function SetupUsernameRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.username) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <GoogleLoginForm />
          </PublicRoute>
        }
      />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/feed" element={<Navigate to="/home" replace />} />
      <Route
        path="/setup"
        element={
          <SetupUsernameRoute>
            <SetupUsernamePage />
          </SetupUsernameRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <FriendsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/privacy"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <PrivacySettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/live"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <LivePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/live/:streamId"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <LivePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hashtags"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <HashtagExplorePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hashtags/:name"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <HashtagDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <GroupListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:slug"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <GroupDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:slug/settings"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <GroupSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <EventListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/create"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <CreateEventPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <EventDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <VideosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos/history"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos/playlists"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <PlaylistsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos/playlists/:playlistId"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <PlaylistDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/watch/:id"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <WatchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <MessagingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages/:conversationId"
        element={
          <ProtectedRoute showRightSidebar={false}>
            <MessagingPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
