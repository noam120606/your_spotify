import { useState, useEffect } from "react";

import { api } from "../api/spotifyApi";
import { DateUtils } from "../utils/dateUtils";

export interface IntervalStats {
  differentArtists: number;
  totalDurationMs: number;
}

export function useIntervalStats(startDate: Date | null, endDate: Date | null) {
  const [data, setData] = useState<IntervalStats | null>(null);
  const [prevData, setPrevData] = useState<IntervalStats | null>(null);
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

      const [prevStart, prevEnd] = DateUtils.getPreviousInterval(start, end);

      try {
        const [currentArtistsRes, prevArtistsRes, currentSongsRes, prevSongsRes] =
          await Promise.all([
            api.getBestArtists(start, end, 1, 0),
            api.getBestArtists(prevStart, prevEnd, 1, 0),
            api.getBestSongs(start, end, 1, 0),
            api.getBestSongs(prevStart, prevEnd, 1, 0),
          ]);

        if (!active) return;

        setData({
          differentArtists: currentArtistsRes.data?.[0]?.differents || 0,
          totalDurationMs: currentSongsRes.data?.[0]?.total_duration_ms || 0,
        });

        setPrevData({
          differentArtists: prevArtistsRes.data?.[0]?.differents || 0,
          totalDurationMs: prevSongsRes.data?.[0]?.total_duration_ms || 0,
        });
      } catch (e) {
        console.error("Failed to fetch interval stats", e);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [startDate, endDate]);

  return { data, prevData, loading };
}
