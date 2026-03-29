import * as stylex from "@stylexjs/stylex";
import { X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { colors, spacing, borderRadius, transitions } from "./designConstants.stylex";
import { Text } from "./text";

export interface SelectOption {
  label: string;
  value: string;
  image?: string;
}

interface CommonProps {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  darken?: boolean;
}

interface UniqueSelectProps extends CommonProps {
  multiple?: false;
  value?: string;
  onChange?: (value: string) => void;
}

interface MultiSelectProps extends CommonProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export type SelectProps = UniqueSelectProps | MultiSelectProps;

export function Select(props: SelectProps) {
  const {
    options,
    placeholder = props.multiple ? "Select options" : "Select an option",
    error,
    darken,
    multiple,
    value,
    onChange,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleToggleOption(optionValue: string) {
    if (multiple) {
      const currentValue = (value as string[]) || [];
      if (currentValue.includes(optionValue)) {
        (onChange as (val: string[]) => void)(currentValue.filter((v) => v !== optionValue));
      } else {
        (onChange as (val: string[]) => void)([...currentValue, optionValue]);
      }
    } else {
      (onChange as (val: string) => void)(optionValue);
      setIsOpen(false);
    }
  }

  function handleRemoveOption(optionValue: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (multiple) {
      const currentValue = (value as string[]) || [];
      (onChange as (val: string[]) => void)(currentValue.filter((v) => v !== optionValue));
    }
  }

  const selectedOptions = multiple
    ? options.filter((opt) => ((value as string[]) || []).includes(opt.value))
    : options.filter((opt) => opt.value === value);

  return (
    <div ref={containerRef} {...stylex.props(styles.container)}>
      <div
        role="button"
        tabIndex={0}
        {...stylex.props(
          styles.trigger,
          darken && styles.darken,
          isOpen && styles.triggerOpen,
          error && styles.error,
        )}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
          }
        }}
      >
        <div {...stylex.props(styles.selectedContainer)}>
          {multiple ? (
            selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <div key={option.value} {...stylex.props(styles.tag)}>
                  <Text size="small" weight="medium">
                    {option.label}
                  </Text>
                  <button
                    type="button"
                    {...stylex.props(styles.removeButton)}
                    onClick={(e) => handleRemoveOption(option.value, e)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            ) : (
              <Text color="textSecondary" weight="medium">
                {placeholder}
              </Text>
            )
          ) : (
            <Text color={selectedOptions[0] ? "text" : "textSecondary"} weight="semiBold">
              {selectedOptions[0] ? selectedOptions[0].label : placeholder}
            </Text>
          )}
        </div>
        <ChevronDown size={18} {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)} />
      </div>

      {isOpen && (
        <div {...stylex.props(styles.dropdownMenu)}>
          {options.map((option) => {
            const isSelected = multiple
              ? ((value as string[]) || []).includes(option.value)
              : value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                {...stylex.props(styles.option, isSelected && styles.optionSelected)}
                onClick={() => handleToggleOption(option.value)}
              >
                {option.image && (
                  <img
                    src={option.image}
                    alt={option.label}
                    {...stylex.props(styles.optionImage)}
                  />
                )}
                {multiple && (
                  <div {...stylex.props(styles.checkbox, isSelected && styles.checkboxSelected)}>
                    {isSelected && <div {...stylex.props(styles.checkboxInner)} />}
                  </div>
                )}
                <Text color={isSelected ? "primary" : "text"} weight="medium">
                  {option.label}
                </Text>
              </button>
            );
          })}
          {options.length === 0 && (
            <div {...stylex.props(styles.emptyState)}>
              <Text color="textSecondary" size="small">
                No options available
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = stylex.create({
  container: {
    position: "relative",
    width: "100%",
  },
  trigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    minHeight: "42px",
    padding: `${spacing.xs} ${spacing.md}`,
    backgroundColor: colors.surface,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: borderRadius.md,
    cursor: "pointer",
    transition: transitions.default,
    boxSizing: "border-box",
    ":hover": {
      backgroundColor: colors.surfaceHover,
    },
    ":focus": {
      outline: "none",
      borderColor: colors.primary,
      backgroundColor: colors.background,
      boxShadow: `0 0 0 2px rgba(28, 215, 96, 0.2)`,
    },
  },
  triggerOpen: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  darken: {
    backgroundColor: colors.surfaceDark,
    ":hover": {
      backgroundColor: colors.surfaceDarker,
    },
  },
  error: {
    borderColor: colors.error,
  },
  selectedContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.xs,
    flex: 1,
    alignItems: "center",
  },
  tag: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surfaceDark,
    padding: `2px ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    color: colors.text,
  },
  removeButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    border: "none",
    color: colors.textSecondary,
    cursor: "pointer",
    padding: 0,
    ":hover": {
      color: colors.error,
    },
  },
  chevron: {
    color: colors.textSecondary,
    transition: "transform 0.2s ease",
    marginLeft: spacing.sm,
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    maxHeight: "240px",
    overflowY: "auto",
    zIndex: 10,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
    padding: spacing.xs,
    boxSizing: "border-box",
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
    padding: `${spacing.sm} ${spacing.sm}`,
    backgroundColor: "transparent",
    borderWidth: 0,
    cursor: "pointer",
    textAlign: "left",
    borderRadius: borderRadius.sm,
    transition: transitions.default,
    ":hover": {
      backgroundColor: colors.background,
    },
  },
  optionImage: {
    width: "32px",
    height: "32px",
    borderRadius: borderRadius.sm,
    objectFit: "cover",
    flexShrink: 0,
  },
  optionSelected: {
    backgroundColor: colors.background,
  },
  checkbox: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.border,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: transitions.default,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxInner: {
    width: "8px",
    height: "8px",
    borderRadius: "2px",
    backgroundColor: colors.background,
  },
  emptyState: {
    padding: spacing.md,
    textAlign: "center",
  },
});
