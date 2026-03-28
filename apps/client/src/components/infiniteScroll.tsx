import React, { useEffect, useRef } from "react";

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  next: () => void;
  loader: React.ReactNode;
}

export function InfiniteScroll({ children, hasMore, next, loader }: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentTarget = observerTarget.current;

    if (!currentTarget) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting && hasMore) {
          next();
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(currentTarget);

    return () => {
      observer.unobserve(currentTarget);
    };
  }, [hasMore, next]);

  return (
    <>
      {children}
      {hasMore && (
        <div ref={observerTarget} style={{ height: 20 }}>
          {loader}
        </div>
      )}
    </>
  );
}
