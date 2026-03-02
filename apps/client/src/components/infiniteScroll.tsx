import React, { useEffect, useRef } from 'react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  next: () => void;
  loader: React.ReactNode;
}

export function InfiniteScroll({ children, hasMore, next, loader }: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting && hasMore) {
          next();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerTarget.current);
      }
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
