import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/protectedRoute";
import { Affinity } from "./pages/affinity";
import { AffinityResults } from "./pages/affinityResults";
import { AlbumPage } from "./pages/album";
import { ArtistPage } from "./pages/artist";
import { DesignSystem } from "./pages/designSystem";
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import { Settings } from "./pages/settings/settings";
import { Share } from "./pages/share";
import { Stats } from "./pages/stats";
import { TopAlbums } from "./pages/topAlbums";
import { TopArtists } from "./pages/topArtists";
import { TopTracks } from "./pages/topTracks";
import { TrackPage } from "./pages/track";

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
          <Route path="/affinity" element={<Affinity />} />
          <Route path="/affinity/results" element={<AffinityResults />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/share" element={<Share />} />
        </Route>

        {/* Catch-all redirect to Home or Design */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
