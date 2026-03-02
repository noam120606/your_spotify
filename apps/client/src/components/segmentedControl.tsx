import React, { createContext, useContext, ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import { motion } from 'motion/react';
import { colors, spacing, borderRadius, transitions } from './designSystem/designConstants.stylex';

interface SegmentedControlContextType {
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  layoutIdString: string;
}

const SegmentedControlContext = createContext<SegmentedControlContextType | undefined>(undefined);

export interface SegmentedControlRootProps {
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  children: ReactNode;
  id?: string;
}

function Root({ selectedIndex, onIndexChange, children, id = 'segmented-control' }: SegmentedControlRootProps) {
  return (
    <SegmentedControlContext.Provider value={{ selectedIndex, onIndexChange, layoutIdString: id }}>
      <div {...stylex.props(styles.segments)}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, { index });
          }
          return child;
        })}
      </div>
    </SegmentedControlContext.Provider>
  );
}

export interface SegmentedControlItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode | ((props: { selected: boolean }) => ReactNode);
  index?: number;
  ref?: React.Ref<HTMLButtonElement>;
}

function Item({ children, index, onClick, ref, ...props }: SegmentedControlItemProps) {
  const context = useContext(SegmentedControlContext);
  if (!context) {
    throw new Error('SegmentedControl.Item must be used within a SegmentedControl.Root');
  }

  const { selectedIndex, onIndexChange, layoutIdString } = context;
  const isSelected = selectedIndex === index;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (index !== undefined) {
      onIndexChange(index);
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      {...props}
      {...stylex.props(styles.segmentButton)}
      ref={ref}
      onClick={handleClick}
    >
      {isSelected && (
        <motion.div
          layoutId={`${layoutIdString}-bg`}
          {...stylex.props(styles.segmentActiveBg)}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      )}
      <div {...stylex.props(styles.segmentTextWrapper)}>
        {typeof children === 'function' ? children({ selected: isSelected }) : children}
      </div>
    </button>
  );
}

export const SegmentedControl = {
  Root,
  Item
};

const styles = stylex.create({
  segments: {
    display: 'flex',
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
    padding: '4px',
    gap: '4px',
  },
  segmentButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    transition: transitions.default,
    ':hover': {
      color: colors.text,
    }
  },
  segmentActiveBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.text,
    borderRadius: borderRadius.sm,
    zIndex: 1, // Behind text
  },
  segmentTextWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // Above bg
  }
});
