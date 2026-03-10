import React from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
  Cell
} from 'recharts';
import { colors, fontSize } from './designConstants.stylex';

export interface BarChartProps<T> {
  data: T[];
  getX: (item: T) => string | number;
  getY: (item: T) => string | number;
  renderTooltip?: (props: TooltipProps<any, any>) => React.ReactNode;
  height?: number | string;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  fillColor?: string;
  radius?: number | [number, number, number, number];
}

export function BarChart<T>({
  data,
  getX,
  getY,
  renderTooltip,
  height = '100%',
  hideXAxis = false,
  hideYAxis = false,
  fillColor,
  radius = [4, 4, 0, 0]
}: BarChartProps<T>) {
  const activeColor = fillColor || (colors.primary as unknown as string);

  return (
    <div {...stylex.props(styles.container)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              tick={{ fontSize: fontSize.small as unknown as string, fill: colors.textSecondary as unknown as string }}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
          )}
          {renderTooltip && (
            <Tooltip
              content={renderTooltip}
              cursor={{ fill: colors.surfaceHover as unknown as string, opacity: 0.5 }}
            />
          )}
          <Bar
            dataKey={getY}
            radius={radius}
            fill={activeColor}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={activeColor} />
            ))}
          </Bar>
        </RechartsBarChart>
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
