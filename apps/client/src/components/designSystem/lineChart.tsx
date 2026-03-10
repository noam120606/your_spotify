import React, { useId } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { colors, fontSize } from './designConstants.stylex';

export interface LineChartProps<T> {
  data: T[];
  getX: (item: T) => string | number;
  getY: (item: T) => string | number;
  renderTooltip?: (props: TooltipProps<any, any>) => React.ReactNode;
  height?: number | string;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  yAxisDomain?: [number | 'dataMin' | 'auto', number | 'dataMax' | 'auto'];
  yAxisAllowDecimals?: boolean;
}

export function LineChart<T>({
  data,
  getX,
  getY,
  renderTooltip,
  height = '100%',
  hideXAxis = false,
  hideYAxis = false,
  strokeColor,
  strokeWidth = 3,
  yAxisDomain,
  yAxisAllowDecimals = true,
}: LineChartProps<T>) {
  const gradientId = useId();
  const activeColor = strokeColor || (colors.primary as unknown as string);

  return (
    <div {...stylex.props(styles.container)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={activeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={activeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          {!hideXAxis && (
            <XAxis
              dataKey={getX}
              tick={{ fontSize: fontSize.small as unknown as string, fill: colors.textSecondary as unknown as string }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
          )}
          {!hideYAxis && (
            <YAxis
              dataKey={getY}
              domain={yAxisDomain}
              allowDecimals={yAxisAllowDecimals}
              tick={{ fontSize: fontSize.small as unknown as string, fill: colors.textSecondary as unknown as string }}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
          )}
          {renderTooltip && (
            <Tooltip
              content={renderTooltip}
              cursor={{ stroke: colors.borderHover as unknown as string, strokeWidth: 1, strokeDasharray: '3 3' }}
            />
          )}
          <Area
            type="monotone"
            dataKey={getY}
            stroke={activeColor}
            strokeWidth={strokeWidth}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            activeDot={{
              r: 6,
              fill: activeColor,
              stroke: colors.background as unknown as string,
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = stylex.create({
  container: {
    width: '100%',
    minHeight: 100,
  },
});
