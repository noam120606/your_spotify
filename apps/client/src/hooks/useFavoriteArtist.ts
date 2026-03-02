import { useState, useEffect } from 'react';
import { api } from '../api/spotifyApi';
import { Artist } from '../api/types';

export interface FavoriteArtistData {
  artist: Artist;
  count: number;
}

export function useFavoriteArtist(startDate: Date | null, endDate: Date | null) {
  const [data, setData] = useState<FavoriteArtistData | null>(null);
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
        const res = await api.getBestArtists(start, end, 1, 0);
        if (!active) return;
        
        if (res.data && res.data.length > 0) {
          const firstItem = res.data[0];
          if (firstItem) {
            setData({
              artist: firstItem.artist,
              count: firstItem.count,
            });
          }
        } else {
          setData(null);
        }
      } catch (e) {
        console.error("Failed to fetch favorite artist", e);
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
