export interface GlobalPreferences {
  allowRegistrations: boolean;
  allowAffinity: boolean;
}

export enum Timesplit {
  all = "all",
  hour = "hour",
  day = "day",
  week = "week",
  month = "month",
  year = "year",
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface Artist {
  _id: string;
  external_urls: any;
  genres: string[];
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  type: string;
  uri: string;
}

export interface Album {
  _id: string;
  album_type: string;
  artists: string[];
  copyrights: any[];
  external_urls: any;
  genres: string[];
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: string;
  type: string;
  uri: string;
}

export type AlbumWithFullArtist = Album & { full_artists: Array<Artist> };

export interface Track {
  _id: string;
  album: string; 
  artists: string[]; 
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: object;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export type TrackWithAlbum = Omit<Track, "album"> & { album: Album };
export type TrackWithFullAlbum = Track & { full_album: Album };
export type TrackWithFullArtistAlbum = TrackWithFullAlbum & { full_artists: Array<Artist> };

export interface TrackInfo {
  _id: string;
  owner: string;
  id: string;
  played_at: string;
  durationMs: number;
  albumId: string;
  primaryArtistId: string;
  artists: string[];
}

export type TrackInfoWithFullArtistAlbum = TrackInfo & {
  track: Track & { full_album: Album; full_artists: Artist[] };
};

export interface DateId {
  year: number;
  month?: number;
  day?: number;
  hour?: number;
}

export interface SpotifyMe {
  country: string;
  display_name: string;
  email: string;
  href: string;
  id: string;
  images: SpotifyImage[];
  product: string;
  type: string;
  uri: string;
}

export enum CollaborativeMode {
  AVERAGE = "average",
  MINIMA = "minima",
}

export type DarkModeType = "light" | "dark" | "follow";
export interface User {
  username: string;
  admin: boolean;
  _id: string;
  id: string;
  expiresIn: number;
  accessToken: string;
  refreshToken: string;
  lastTimestamp: number;
  tracks: string[];
  settings: {
    historyLine: boolean;
    preferredStatsPeriod: string;
    nbElements: number;
    metricUsed: "number" | "duration";
    darkMode: DarkModeType;
    timezone: string | null | undefined;
    dateFormat: string;
    blacklistedArtists: string[] | undefined;
  };
  publicToken: string | null;
  firstListenedAt: string;
  isGuest: boolean;
}

export interface AdminAccount {
  id: string;
  username: string;
  admin: boolean;
  firstListenedAt: string;
}

export type ImporterStateStatus = "progress" | "success" | "failure" | "failure-removed";
export enum ImporterStateTypes { privacy = "privacy", fullPrivacy = "full-privacy" }
export interface BaseImporterState {
  _id: string;
  createdAt: string;
  user: string;
  type: string;
  current: number;
  total: number;
  status: ImporterStateStatus;
}
export interface PrivacyImporterState extends BaseImporterState {
  type: ImporterStateTypes.privacy;
  metadata: string[];
}
export interface FullPrivacyImporterState extends BaseImporterState {
  type: ImporterStateTypes.fullPrivacy;
  metadata: string[];
}
export type ImporterState = PrivacyImporterState | FullPrivacyImporterState;

export interface Playlist {
  id: string;
  name: string;
  images: SpotifyImage[] | null;
}

export type PlaylistContext = 
  | { type: "top"; nb: number; interval: { start: number; end: number } } 
  | { type: "affinity"; userIds: string[]; nb: number; interval: { start: number; end: number }; mode: CollaborativeMode } 
  | { type: "specific"; songIds: Array<string> } 
  | { type: "top-artist"; artistId: string; nb: number };

export interface SpotifyPlaybackState {
  is_playing: boolean;
  item: TrackWithAlbum;
  progress_ms: number;
}
