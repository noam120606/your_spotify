import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/home';
import { TopTracks } from './pages/topTracks';
import { TopArtists } from './pages/topArtists';
import { TopAlbums } from './pages/topAlbums';
import { Settings } from './pages/settings/settings';
import { Share } from './pages/share';
import { DesignSystem } from './pages/designSystem';
import { ProtectedRoute } from './components/protectedRoute';
import { Login } from './pages/login';
import { ArtistPage } from './pages/artist';
import { AlbumPage } from './pages/album';
import { TrackPage } from './pages/track';
import { Stats } from './pages/stats';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/design" element={<DesignSystem />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/tops/tracks" element={<TopTracks />} />
          <Route path="/tops/artists" element={<TopArtists />} />
          <Route path="/tops/albums" element={<TopAlbums />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
          <Route path="/album/:id" element={<AlbumPage />} />
          <Route path="/track/:id" element={<TrackPage />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/share" element={<Share />} />
        </Route>

        {/* Catch-all redirect to Home or Design */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
