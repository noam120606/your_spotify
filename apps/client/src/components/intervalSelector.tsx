import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius, transitions } from './designSystem/designConstants.stylex';
import { useIntervalStore } from '../store/intervalStore';

// === HELPER FUNCTIONS ===
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0 is Sunday
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

// Ensure d1 is strictly before or same as d2
function isBeforeOrSame(d1: Date, d2: Date) {
  return d1.getTime() <= d2.getTime();
}

// === INTERFACES ===
export interface IntervalSelectorProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
}

// === PURE COMPONENT ===
export function IntervalSelector({ startDate, endDate, onChange }: IntervalSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calendar State
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Sync temp state when opening popup
  const handleOpenCalendar = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setIsCalendarOpen(!isCalendarOpen);
  };

  const handleApply = () => {
    onChange(tempStart, tempEnd);
    setIsCalendarOpen(false);
  };

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
  };

  // Build Calendar Grid
  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  // Adjust so Monday is first day of week. (getDay() returns 0 for Sunday).
  const blankDays = firstDay === 0 ? 6 : firstDay - 1;

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (!tempStart || (tempStart && tempEnd)) {
      // Start a new selection
      setTempStart(clickedDate);
      setTempEnd(null);
    } else {
      // Complete the selection
      if (isBeforeOrSame(tempStart, clickedDate)) {
        setTempEnd(clickedDate);
      } else {
        // Reverse if clicked before start
        setTempEnd(tempStart);
        setTempStart(clickedDate);
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };


  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.segments)}>
        <button {...stylex.props(styles.segmentButton)} onClick={() => handleQuickSelect('today')}>
          <Text size="small" weight="semiBold">Today</Text>
        </button>
        <button {...stylex.props(styles.segmentButton)} onClick={() => handleQuickSelect('week')}>
          <Text size="small" weight="semiBold">This Week</Text>
        </button>
        <button {...stylex.props(styles.segmentButton)} onClick={() => handleQuickSelect('month')}>
          <Text size="small" weight="semiBold">This Month</Text>
        </button>
        <button {...stylex.props(styles.segmentButton, isCalendarOpen && styles.segmentButtonActive)} onClick={handleOpenCalendar}>
          <Settings size={18} />
        </button>
      </div>

      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            {...stylex.props(styles.popover)}
          >
            <div {...stylex.props(styles.calendarHeader)}>
              <button {...stylex.props(styles.navButton)} onClick={handlePrevMonth}>
                <ChevronLeft size={20} />
              </button>
              <Text weight="bold">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <button {...stylex.props(styles.navButton)} onClick={handleNextMonth}>
                <ChevronRight size={20} />
              </button>
            </div>

            <div {...stylex.props(styles.weekDaysGrid)}>
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <div key={d} {...stylex.props(styles.weekDayLabel)}><Text size="small" color="textSecondary">{d}</Text></div>
              ))}
            </div>

            <div {...stylex.props(styles.daysGrid)} onMouseLeave={() => setHoverDate(null)}>
              {Array.from({ length: blankDays }).map((_, i) => (
                <div key={`blank-${i}`} {...stylex.props(styles.dayCell)} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

                const isStart = tempStart && isSameDay(cellDate, tempStart);
                const isEnd = tempEnd && isSameDay(cellDate, tempEnd);

                let isBetween = false;
                let isHoverPreview = false;

                if (tempStart && tempEnd) {
                  isBetween = isBeforeOrSame(tempStart, cellDate) && isBeforeOrSame(cellDate, tempEnd);
                } else if (tempStart && !tempEnd && hoverDate) {
                  const previewStart = isBeforeOrSame(tempStart, hoverDate) ? tempStart : hoverDate;
                  const previewEnd = isBeforeOrSame(tempStart, hoverDate) ? hoverDate : tempStart;
                  isHoverPreview = isBeforeOrSame(previewStart, cellDate) && isBeforeOrSame(cellDate, previewEnd);
                }

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={() => setHoverDate(cellDate)}
                    {...stylex.props(
                      styles.dayCell,
                      styles.dayButton,
                      isStart && styles.dayStart,
                      isEnd && styles.dayEnd,
                      isBetween && !isStart && !isEnd && styles.dayBetween,
                      isHoverPreview && !isStart && styles.dayHoverPreview,
                      (isStart || isEnd) && styles.daySelectedText
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div {...stylex.props(styles.footer)}>
              <button {...stylex.props(styles.applyButton)} onClick={handleApply}>
                <Text weight="bold" color="background">Apply</Text>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// === CONNECTED COMPONENT ===
export function ConnectedIntervalSelector() {
  const { startDate, endDate, setInterval } = useIntervalStore();
  return <IntervalSelector startDate={startDate} endDate={endDate} onChange={setInterval} />;
}

const styles = stylex.create({
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  segments: {
    display: 'flex',
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    padding: '4px',
    gap: '4px',
  },
  segmentButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: borderRadius.sm,
    color: colors.textSecondary,
    cursor: 'pointer',
    transition: transitions.default,
    ':hover': {
      backgroundColor: colors.border,
      color: colors.text,
    }
  },
  segmentButtonActive: {
    backgroundColor: colors.text,
    color: colors.background,
    ':hover': {
      backgroundColor: colors.text,
      color: colors.background,
    }
  },
  popover: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
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
  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    ':hover': {
      backgroundColor: colors.surfaceHover,
      color: colors.text,
    }
  },
  weekDaysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: spacing.sm,
  },
  weekDayLabel: {
    display: 'flex',
    justifyContent: 'center',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px 0',
  },
  dayCell: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
  },
  dayButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.text,
    cursor: 'pointer',
    borderRadius: borderRadius.full,
    ':hover': {
      backgroundColor: colors.border,
    }
  },
  dayStart: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    ':hover': {
      backgroundColor: colors.primary,
    }
  },
  dayEnd: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    ':hover': {
      backgroundColor: colors.primary,
    }
  },
  daySelectedText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  dayBetween: {
    backgroundColor: colors.surfaceHover,
    borderRadius: 0,
    ':hover': {
      backgroundColor: colors.surfaceHover,
    }
  },
  dayHoverPreview: {
    backgroundColor: colors.border,
    borderRadius: 0,
    ':hover': {
      backgroundColor: colors.border,
    }
  },
  footer: {
    marginTop: spacing.md,
    display: 'flex',
    justifyContent: 'flex-end',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  applyButton: {
    backgroundColor: colors.text,
    border: 'none',
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.full,
    cursor: 'pointer',
    ':hover': {
      transform: 'scale(1.05)',
    }
  }
});
