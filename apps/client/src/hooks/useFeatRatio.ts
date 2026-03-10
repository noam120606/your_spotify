import { useState, useEffect } from 'react';
import { api } from '../api/spotifyApi';
import { Timesplit } from '../api/types';
import { DateUtils } from '../utils/dateUtils';

export interface FeatRatioDataPoint {
  dateLabel: string;
  averageFeats: number;
}

export function useFeatRatio(startDate: Date | null, endDate: Date | null) {
  const [data, setData] = useState<FeatRatioDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let timeSplit = Timesplit.day;
      if (diffDays <= 2) {
        timeSplit = Timesplit.hour;
      } else if (diffDays > 31) {
        timeSplit = Timesplit.month;
      }

      try {
        const res = await api.featRatio(start, end, timeSplit);
        if (!active) return;

        const countMap = new Map<string, number>();
        res.data.forEach((item) => {
          if (item._id && item.count > 0) {
            const date = new Date(
              item._id.year,
              (item._id.month || 1) - 1,
              item._id.day || 1,
              item._id.hour || 0
            );

            let mapKey = '';
            if (timeSplit === Timesplit.hour) {
              mapKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
            } else if (timeSplit === Timesplit.day) {
              mapKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            } else {
              mapKey = `${date.getFullYear()}-${date.getMonth()}`;
            }
            
            // Limit to 2 decimal places
            const averageFeats = Number(item.average.toFixed(2));
            countMap.set(mapKey, averageFeats);
          }
        });

        const fullRange = DateUtils.generateDateRange(start, end, timeSplit);
        const formattedData = fullRange.map((date) => {
          let mapKey = '';
          let dateLabel = '';

          if (timeSplit === Timesplit.hour) {
            mapKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
            dateLabel = date.toLocaleTimeString([], { hour: '2-digit' });
          } else if (timeSplit === Timesplit.day) {
            mapKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          } else {
            mapKey = `${date.getFullYear()}-${date.getMonth()}`;
            dateLabel = date.toLocaleDateString([], { month: 'short', year: 'numeric' });
          }

          const averageFeats = countMap.get(mapKey);
          if (averageFeats === undefined) return null;

          return {
            dateLabel,
            averageFeats
          };
        }).filter(Boolean) as FeatRatioDataPoint[];

        setData(formattedData);
      } catch (e) {
        console.error("Failed to fetch feat ratio data", e);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [startDate, endDate]);

  return { data, loading, error };
}
