import { useState, useEffect } from 'react';
import { api } from '../api/spotifyApi';
import { Track, Artist, Album } from '../api/types';

export interface FavoriteTrackData {
  track: Track;
  artist: Artist;
  album: Album;
  count: number;
}

export function useFavoriteTrack(startDate: Date | null, endDate: Date | null) {
  const [data, setData] = useState<FavoriteTrackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);

      const end = endDate || new Date();
      let start = startDate;
      if (!start) {
        start = new Date(end);
        start.setDate(start.getDate() - 30);
      }

      try {
        const res = await api.getBestSongs(start, end, 1, 0);
        if (!active) return;
        
        if (res.data && res.data.length > 0) {
          const firstItem = res.data[0];
          if (firstItem) {
            setData({
              track: firstItem.track,
              artist: firstItem.artist,
              album: firstItem.album,
              count: firstItem.count,
            });
          }
        } else {
          setData(null);
        }
      } catch (e) {
        console.error("Failed to fetch favorite track", e);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [startDate, endDate]);

  return { data, loading };
}
