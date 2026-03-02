import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius } from './designSystem/designConstants.stylex';

// === HELPER FUNCTIONS ===
const headerVariants = {
  initial: (direction: number) => ({ x: direction > 0 ? 10 : -10, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 10 : -10, opacity: 0 }),
};

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

export interface CalendarIntervalPickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onApply: (start: Date | null, end: Date | null) => void;
}

export function CalendarIntervalPicker({ startDate, endDate, onApply }: CalendarIntervalPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date());

  // Year Selection State
  const [isYearSelection, setIsYearSelection] = useState(false);
  const [yearPage, setYearPage] = useState(() => Math.floor((startDate || new Date()).getFullYear() / 12) * 12);

  // Calendar State
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Header Transition State
  const [direction, setDirection] = useState(1);

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
    setDirection(-1);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePrevYearPage = () => {
    setDirection(-1);
    setYearPage(prev => prev - 12);
  };

  const handleNextYearPage = () => {
    setDirection(1);
    setYearPage(prev => prev + 12);
  };

  const handleYearClick = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setIsYearSelection(false);
  };

  const handleApply = () => {
    onApply(tempStart, tempEnd);
  };

  // Build Calendar Grid
  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  // Adjust so Monday is first day of week. (getDay() returns 0 for Sunday).
  const blankDays = firstDay === 0 ? 6 : firstDay - 1;

  return (
    <>
      <div {...stylex.props(styles.calendarHeader)}>
        <button {...stylex.props(styles.navButton)} onClick={isYearSelection ? handlePrevYearPage : handlePrevMonth}>
          <ChevronLeft size={20} />
        </button>
        <button {...stylex.props(styles.headerLabelButton)} onClick={() => setIsYearSelection(!isYearSelection)}>
          <div {...stylex.props(styles.headerLabelWrapper)}>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={isYearSelection ? `year-${yearPage}` : `month-${currentMonth.getTime()}`}
                custom={direction}
                variants={headerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Text weight="bold">
                  {isYearSelection
                    ? `${yearPage} - ${yearPage + 11}`
                    : currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
              </motion.div>
            </AnimatePresence>
          </div>
        </button>
        <button {...stylex.props(styles.navButton)} onClick={isYearSelection ? handleNextYearPage : handleNextMonth}>
          <ChevronRight size={20} />
        </button>
      </div>

      {isYearSelection ? (
        <div {...stylex.props(styles.yearsGrid)}>
          {Array.from({ length: 12 }).map((_, i) => {
            const year = yearPage + i;
            const isActive = currentMonth.getFullYear() === year;
            return (
              <button
                key={year}
                onClick={() => handleYearClick(year)}
                {...stylex.props(styles.yearButton, isActive && styles.yearButtonActive)}
              >
                <Text size="small" weight={isActive ? 'bold' : 'regular'} color={isActive ? 'background' : 'text'}>
                  {year}
                </Text>
              </button>
            );
          })}
        </div>
      ) : (
        <>
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
              let isHoverStart = false;
              let isHoverEnd = false;

              if (tempStart && tempEnd) {
                isBetween = isBeforeOrSame(tempStart, cellDate) && isBeforeOrSame(cellDate, tempEnd);
              } else if (tempStart && !tempEnd && hoverDate) {
                const previewStart = isBeforeOrSame(tempStart, hoverDate) ? tempStart : hoverDate;
                const previewEnd = isBeforeOrSame(tempStart, hoverDate) ? hoverDate : tempStart;
                isHoverPreview = isBeforeOrSame(previewStart, cellDate) && isBeforeOrSame(cellDate, previewEnd);
                if (isHoverPreview) {
                  isHoverStart = isSameDay(cellDate, previewStart);
                  isHoverEnd = isSameDay(cellDate, previewEnd);
                }
              }

              // A day is only truly standalone start if we have tempStart but no tempEnd, OR if tempStart and tempEnd are the identical day (and we're not previewing a different hoverDate).
              const isSingleSelectedDay = isStart && (!tempEnd || isSameDay(tempStart, tempEnd)) && !isHoverPreview;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoverDate(cellDate)}
                  {...stylex.props(
                    styles.dayCell,
                    styles.dayButton,
                    isSingleSelectedDay && styles.daySingleSelected,
                    isStart && !isSingleSelectedDay && (tempEnd ? (isBeforeOrSame(tempStart, tempEnd) ? styles.dayStart : styles.dayEnd) : (hoverDate ? (isBeforeOrSame(tempStart, hoverDate) ? styles.dayStart : styles.dayEnd) : styles.dayStart)),
                    isEnd && !isSingleSelectedDay && (isBeforeOrSame(tempStart!, tempEnd) ? styles.dayEnd : styles.dayStart),
                    isBetween && !isStart && !isEnd && styles.dayBetween,
                    isHoverPreview && !isStart && !isHoverStart && !isHoverEnd && styles.dayHoverPreview,
                    isHoverPreview && !isStart && isHoverStart && styles.dayHoverStart,
                    isHoverPreview && !isStart && isHoverEnd && styles.dayHoverEnd,
                    (isStart || isEnd || isBetween) && styles.daySelectedText
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div {...stylex.props(styles.footer)}>
        <button {...stylex.props(styles.applyButton)} onClick={handleApply}>
          <Text weight="bold" color="background">Apply</Text>
        </button>
      </div>
    </>
  );
}

const styles = stylex.create({
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
  headerLabelButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    ':hover': {
      backgroundColor: colors.surfaceHover,
    }
  },
  headerLabelWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '150px',
    whiteSpace: 'nowrap',
  },
  yearsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacing.sm,
    padding: `${spacing.sm} 0`,
    minHeight: '220px',
  },
  yearButton: {
    padding: spacing.sm,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      backgroundColor: colors.surfaceHover,
    }
  },
  yearButtonActive: {
    backgroundColor: colors.primary,
    ':hover': {
      backgroundColor: colors.primary,
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
  daySingleSelected: {
    backgroundColor: colors.primary,
    ':hover': {
      backgroundColor: colors.primary,
    }
  },
  daySelectedText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  dayBetween: {
    backgroundColor: colors.primary,
    borderRadius: 0,
    ':hover': {
      backgroundColor: colors.primary,
    }
  },
  dayHoverPreview: {
    backgroundColor: colors.border,
    borderRadius: 0,
    ':hover': {
      backgroundColor: colors.border,
    }
  },
  dayHoverStart: {
    backgroundColor: colors.border,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    ':hover': {
      backgroundColor: colors.border,
    }
  },
  dayHoverEnd: {
    backgroundColor: colors.border,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
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
