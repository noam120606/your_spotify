import { useState, useEffect } from "react";

import { api } from "../api/spotifyApi";
import { useAuthStore } from "../store/authStore";
import { DateUtils } from "../utils/dateUtils";
import { TimesplitUtils } from "../utils/timesplitUtils";
import { useDateFormat } from "./useDateFormat";

export interface ListenedToDataPoint {
  dateLabel: string;
  count: number;
}

export function useListenedTo(startDate: Date | null, endDate: Date | null) {
  const [data, setData] = useState<ListenedToDataPoint[]>([]);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [previousTotal, setPreviousTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const dateFormatter = useDateFormat();

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

      const timeSplit = TimesplitUtils.getTimesplit(start, end);

      const [prevStart, prevEnd] = DateUtils.getPreviousInterval(start, end);

      try {
        const metric = user?.settings?.metricUsed || "number";
        let currentRes, prevRes;

        if (metric === "duration") {
          [currentRes, prevRes] = await Promise.all([
            api.timePer(start, end, timeSplit),
            api.timePer(prevStart, prevEnd, timeSplit),
          ]);
        } else {
          [currentRes, prevRes] = await Promise.all([
            api.songsPer(start, end, timeSplit),
            api.songsPer(prevStart, prevEnd, timeSplit),
          ]);
        }

        if (!active) return;

        const currentData = currentRes.data;
        const prevData = prevRes.data;

        // Calculate totals
        const cTotal = currentData.reduce((acc, curr) => acc + curr.count, 0);
        const pTotal = prevData.reduce((acc, curr) => acc + curr.count, 0);
        setCurrentTotal(cTotal);
        setPreviousTotal(pTotal);

        const countMap = new Map<string, number>();
        currentData.forEach((item) => {
          if (item._id) {
            const date = new Date(
              item._id.year,
              (item._id.month || 1) - 1,
              item._id.day || 1,
              item._id.hour || 0,
            );
            countMap.set(DateUtils.getMapKey(date, timeSplit), item.count);
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
        console.error("Failed to fetch listened_to data", e);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [startDate, endDate, user?.settings?.metricUsed, dateFormatter]);

  return { data, currentTotal, previousTotal, loading };
}
