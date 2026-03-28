import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";

import { colors, borderRadius, spacing } from "./designConstants.stylex";
import { Text } from "./text";

type Props = {
  progress: number;
  total: number;
  isPlaying?: boolean;
};

export function OptimisticProgressBar({ progress, total, isPlaying }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const internalProgressRef = useRef(progress);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Sync prop changes purely into ref when external progress updates natively.
  useEffect(() => {
    internalProgressRef.current = progress;
    if (barRef.current) {
      const percent = total > 0 ? (progress / total) * 100 : 0;
      barRef.current.style.width = `${percent}%`;
    }
    if (timeRef.current) {
      timeRef.current.textContent = formatTime(progress);
    }
  }, [progress, total]);

  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      let next = internalProgressRef.current + delta;
      if (next > total) next = total;
      internalProgressRef.current = next;

      if (barRef.current) {
        const percent = total > 0 ? (next / total) * 100 : 0;
        const clamped = Math.min(percent, 100);
        barRef.current.style.width = `${clamped}%`;
      }
      if (timeRef.current) {
        timeRef.current.textContent = formatTime(next);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, total]);

  return (
    <div {...stylex.props(styles.wrapper)}>
      <Text size="small" color="textSecondary" xstyle={styles.timeText}>
        <span ref={timeRef}>{formatTime(progress)}</span>
      </Text>
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.bar)} ref={barRef} />
      </div>
      <Text size="small" color="textSecondary" xstyle={styles.timeText}>
        {formatTime(total)}
      </Text>
    </div>
  );
}

const styles = stylex.create({
  wrapper: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
  },
  timeText: {
    fontVariantNumeric: "tabular-nums",
    minWidth: "36px",
    textAlign: "center",
  },
  container: {
    flex: 1,
    height: "4px",
    width: "100%",
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    backgroundColor: colors.primary,
  },
});
