import { useState, useEffect } from 'react';
import { api } from '../api/spotifyApi';
import { Timesplit } from '../api/types';
import { DateUtils } from '../utils/dateUtils';

export interface AlbumDateRatioDataPoint {
  dateLabel: string;
  averageYear: number;
}

export function useAlbumDateRatio(startDate: Date | null, endDate: Date | null) {
  const [data, setData] = useState<AlbumDateRatioDataPoint[]>([]);
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
        const res = await api.albumDateRatio(start, end, timeSplit);
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
            
            const averageYear = Number(item.totalYear.toFixed(1));
            countMap.set(mapKey, averageYear);
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

          const averageYear = countMap.get(mapKey);
          if (averageYear === undefined) return null;

          return {
            dateLabel,
            averageYear
          };
        }).filter(Boolean) as AlbumDateRatioDataPoint[];

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
  }, [startDate, endDate]);

  return { data, loading, error };
}
