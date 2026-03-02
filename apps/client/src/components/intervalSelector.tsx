import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Settings } from 'lucide-react';
import { Popover } from './designSystem/popover';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius } from './designSystem/designConstants.stylex';
import { useIntervalStore } from '../store/intervalStore';
import { SegmentedControl } from './segmentedControl';
import { CalendarIntervalPicker } from './calendarIntervalPicker';

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export interface IntervalSelectorProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
}

export function IntervalSelector({ startDate, endDate, onChange }: IntervalSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleQuickSelect = (type: 'today' | 'week' | 'month') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date(today);
    endToday.setHours(23, 59, 59, 999);

    if (type === 'today') {
      onChange(today, endToday);
    } else if (type === 'week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      onChange(startOfWeek, endOfWeek);
    } else if (type === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      onChange(startOfMonth, endOfMonth);
    }
    setIsCalendarOpen(false);
  };

  const getActiveSegmentIndex = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date(today);
    endToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    if (startDate && endDate) {
      if (isSameDay(startDate, today) && isSameDay(endDate, endToday)) return 0;
      if (isSameDay(startDate, startOfWeek) && isSameDay(endDate, endOfWeek)) return 1;
      if (isSameDay(startDate, startOfMonth) && isSameDay(endDate, endOfMonth)) return 2;
    }
    return 3; // custom
  };

  return (
    <div {...stylex.props(styles.container)}>
      <SegmentedControl.Root
        id="interval-selector"
        selectedIndex={getActiveSegmentIndex()}
        onIndexChange={(index) => {
          if (index === 0) handleQuickSelect('today');
          else if (index === 1) handleQuickSelect('week');
          else if (index === 2) handleQuickSelect('month');
        }}
      >
        <SegmentedControl.Item>
          {({ selected }) => (
            <Text size="small" weight="semiBold" color={selected ? 'background' : 'textSecondary'}>Today</Text>
          )}
        </SegmentedControl.Item>
        <SegmentedControl.Item>
          {({ selected }) => (
            <Text size="small" weight="semiBold" color={selected ? 'background' : 'textSecondary'}>This Week</Text>
          )}
        </SegmentedControl.Item>
        <SegmentedControl.Item>
          {({ selected }) => (
            <Text size="small" weight="semiBold" color={selected ? 'background' : 'textSecondary'}>This Month</Text>
          )}
        </SegmentedControl.Item>
        <Popover.Root open={isCalendarOpen} onOpenChange={setIsCalendarOpen} placement="bottom-end">
          <Popover.Trigger>
            {(triggerProps: any) => (
              <SegmentedControl.Item {...triggerProps} index={3}>
                {({ selected }) => (
                  <div style={{ color: selected ? colors.background : colors.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Settings size={18} />
                  </div>
                )}
              </SegmentedControl.Item>
            )}
          </Popover.Trigger>

          <Popover.Content {...stylex.props(styles.popover)}>
            <CalendarIntervalPicker
              startDate={startDate}
              endDate={endDate}
              onApply={(start, end) => {
                onChange(start, end);
                setIsCalendarOpen(false);
              }}
            />
          </Popover.Content>
        </Popover.Root>
      </SegmentedControl.Root>
    </div>
  );
}

export function ConnectedIntervalSelector() {
  const { startDate, endDate, setInterval } = useIntervalStore();
  return <IntervalSelector startDate={startDate} endDate={endDate} onChange={setInterval} />;
}

const styles = stylex.create({
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  popover: {
    backgroundColor: colors.surface,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: '320px',
    zIndex: 100,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
});
