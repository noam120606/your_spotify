import * as stylex from "@stylexjs/stylex";
import { motion, useAnimation } from "motion/react";
import { useState, useRef, useEffect } from "react";

import { Text } from "./designSystem/text";

export function MarqueeText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const observer = new ResizeObserver(() => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;

        if (textWidth > containerWidth) {
          setShouldScroll(true);
        } else {
          setShouldScroll(false);
        }
      }
    });

    observer.observe(containerRef.current);
    observer.observe(textRef.current);

    return () => observer.disconnect();
  }, [text]);

  useEffect(() => {
    let isPlaying = true;

    const runMarquee = async () => {
      if (!containerRef.current || !textRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;
      const distance = textWidth - containerWidth + 24;
      const duration = distance / 25; // 25px per sec

      while (isPlaying) {
        // Wait 1s at start position
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!isPlaying) break;

        // Scroll text
        await controls.start({
          x: -distance,
          transition: { duration, ease: "linear" },
        });
        if (!isPlaying) break;

        // Wait 1s at end position
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!isPlaying) break;

        // Fade out
        await controls.start({
          opacity: 0,
          transition: { duration: 0.3 },
        });
        if (!isPlaying) break;

        // Reset position instantly while transparent
        controls.set({ x: 0 });

        // Fade in
        await controls.start({
          opacity: 1,
          transition: { duration: 0.3 },
        });
      }
    };

    if (shouldScroll) {
      runMarquee();
    } else {
      controls.stop();
      controls.set({ x: 0, opacity: 1 });
    }

    return () => {
      isPlaying = false;
      controls.stop();
    };
  }, [shouldScroll, text, controls]);

  return (
    <div ref={containerRef} {...stylex.props(styles.marqueeContainer)}>
      <motion.div
        animate={controls}
        initial={{ x: 0, opacity: 1 }}
        {...stylex.props(styles.marqueeWrapper)}
      >
        <div ref={textRef} {...stylex.props(styles.marqueeItem)}>
          <Text weight="bold" size="medium" {...stylex.props(!shouldScroll && styles.truncateText)}>
            {text}
          </Text>
        </div>
      </motion.div>
    </div>
  );
}

const styles = stylex.create({
  marqueeContainer: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
    whiteSpace: "nowrap",
    maskImage: "linear-gradient(to right, black 85%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to right, black 85%, transparent 100%)",
  },
  marqueeWrapper: {
    display: "flex",
    whiteSpace: "nowrap",
    width: "max-content",
  },
  marqueeItem: {
    display: "inline-block",
  },
  truncateText: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
  },
});
