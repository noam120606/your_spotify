import { useState, useEffect } from "react";

import { api } from "../api/spotifyApi";
import { DateUtils } from "../utils/dateUtils";
import { Timesplit } from "../api/types";

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
            api.differentArtistsPer(start, end, Timesplit.all),
            api.differentArtistsPer(prevStart, prevEnd, Timesplit.all),
            api.timePer(start, end, Timesplit.all),
            api.timePer(prevStart, prevEnd, Timesplit.all),
          ]);

          console.log(currentSongsRes)

        if (!active) return;

        setData({
          differentArtists: currentArtistsRes.data[0]?.differents ?? 0,
          totalDurationMs: currentSongsRes.data[0]?.count ?? 0,
        });

        setPrevData({
          differentArtists: prevArtistsRes.data[0]?.differents ?? 0,
          totalDurationMs: prevSongsRes.data[0]?.count ?? 0,
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
