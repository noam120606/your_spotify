import { useState, useEffect } from "react";

import { api } from "../api/spotifyApi";
import { DateUtils } from "../utils/dateUtils";
import { TimesplitUtils } from "../utils/timesplitUtils";
import { useDateFormat } from "./useDateFormat";

export interface DifferentArtistsDataPoint {
  dateLabel: string;
  count: number;
}

export function useDifferentArtistsPer(startDate: Date | null, endDate: Date | null) {
  const [data, setData] = useState<DifferentArtistsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const dateFormatter = useDateFormat();

  useEffect(() => {
    let active = true;

    async function fetchData() {
      let start = startDate;
      const end = endDate || new Date();
      if (!start) {
        start = new Date(end);
        start.setDate(start.getDate() - 30);
      }

      setLoading(true);
      setError(false);

      const timeSplit = TimesplitUtils.getTimesplit(start, end);

      try {
        const res = await api.differentArtistsPer(start, end, timeSplit);
        if (!active) return;

        const countMap = new Map<string, number>();
        res.data.forEach((item) => {
          if (item._id) {
            const date = new Date(
              item._id.year,
              (item._id.month || 1) - 1,
              item._id.day || 1,
              item._id.hour || 0,
            );
            countMap.set(DateUtils.getMapKey(date, timeSplit), item.differents);
          }
        });

        const fullRange = DateUtils.generateDateRange(start, end, timeSplit);
        const formattedData = fullRange.map((date) => {
          const mapKey = DateUtils.getMapKey(date, timeSplit);
          const dateLabel = dateFormatter.formatByTimesplit(date, timeSplit);

          return {
            dateLabel,
            count: countMap.get(mapKey) || 0,
          };
        });

        setData(formattedData);
      } catch (e) {
        console.error("Failed to fetch different artists data", e);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [startDate, endDate, dateFormatter]);

  return { data, loading, error };
}
