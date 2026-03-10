import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Settings } from 'lucide-react';
import { AnchoredFloating } from './designSystem/anchoredFloating';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius } from './designSystem/designConstants.stylex';
import { useIntervalStore } from '../store/intervalStore';
import { SegmentedControl } from './segmentedControl';
import { CalendarIntervalPicker } from './calendarIntervalPicker';
import { startOfWeek, endOfWeek, endOfDay, startOfDay, startOfMonth, endOfMonth } from 'date-fns'

export interface IntervalSelectorProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
}

export function IntervalSelector({ startDate, endDate, onChange }: IntervalSelectorProps) {
  const [index, setIndex] = useState(0)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleQuickSelect = (type: 'today' | 'week' | 'month') => {
    const now = new Date()
    if (type === 'today') {
      onChange(startOfDay(now), endOfDay(now));
      setIndex(0)
    } else if (type === 'week') {
      onChange(startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }))
      setIndex(1)
    } else if (type === 'month') {
      onChange(startOfMonth(now), endOfMonth(now));
      setIndex(2)
    }
    setIsCalendarOpen(false);
  };

  return (
    <div {...stylex.props(styles.container)}>
      <SegmentedControl.Root
        id="interval-selector"
        selectedIndex={index}
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
        <AnchoredFloating
          open={isCalendarOpen}
          onOpenChange={setIsCalendarOpen}
          placement="bottom-end"
          renderAnchor={(triggerProps) => (
            <SegmentedControl.Item {...triggerProps} index={3}>
              {({ selected }) => (
                <div style={{ color: selected ? colors.background : colors.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Settings size={18} />
                </div>
              )}
            </SegmentedControl.Item>
          )}
        >
          <div {...stylex.props(styles.popover)}>
            <CalendarIntervalPicker
              startDate={startDate}
              endDate={endDate}
              onApply={(start, end) => {
                onChange(start, end);
                setIsCalendarOpen(false);
                setIndex(3)
              }}
            />
          </div>
        </AnchoredFloating>
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
