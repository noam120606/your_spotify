import { useState, useEffect } from "react";

import { api } from "../api/spotifyApi";
import { DateUtils } from "../utils/dateUtils";
import { TimesplitUtils } from "../utils/timesplitUtils";
import { useDateFormat } from "./useDateFormat";

export interface AlbumDateRatioDataPoint {
  dateLabel: string;
  averageYear: number;
}

export function useAlbumDateRatio(startDate: Date | null, endDate: Date | null) {
  const [data, setData] = useState<AlbumDateRatioDataPoint[]>([]);
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
        const res = await api.albumDateRatio(start, end, timeSplit);
        if (!active) return;

        const countMap = new Map<string, number>();
        res.data.forEach((item) => {
          if (item._id && item.count > 0) {
            const date = new Date(
              item._id.year,
              (item._id.month || 1) - 1,
              item._id.day || 1,
              item._id.hour || 0,
            );
            const averageYear = Number(item.totalYear.toFixed(1));
            countMap.set(DateUtils.getMapKey(date, timeSplit), averageYear);
          }
        });

        const fullRange = DateUtils.generateDateRange(start, end, timeSplit);
        const formattedData = fullRange
          .map((date) => {
            const mapKey = DateUtils.getMapKey(date, timeSplit);
            const dateLabel = dateFormatter.formatByTimesplit(date, timeSplit);

            const averageYear = countMap.get(mapKey);
            if (averageYear === undefined) return undefined;

            return {
              dateLabel,
              averageYear,
            };
          })
          .filter((e): e is AlbumDateRatioDataPoint => Boolean(e));

        setData(formattedData);
      } catch (e) {
        console.error("Failed to fetch album date ratio data", e);
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
