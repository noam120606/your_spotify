import { ReactNode, useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";

interface UsePortalOptions {
  enabled?: boolean;
  hostId?: string;
}

const DEFAULT_HOST_ID = "portal-root";

function getOrCreateHost(hostId: string): HTMLElement {
  const existingHost = document.getElementById(hostId);
  if (existingHost) return existingHost;

  const host = document.createElement("div");
  host.id = hostId;
  document.body.appendChild(host);
  return host;
}

export function usePortal(content: ReactNode, options: UsePortalOptions = {}) {
  const { enabled = true, hostId = DEFAULT_HOST_ID } = options;
  const rootRef = useRef<Root | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined" || !enabled) return;

    const host = getOrCreateHost(hostId);
    const container = document.createElement("div");
    host.appendChild(container);

    containerRef.current = container;
    rootRef.current = createRoot(container);

    return () => {
      rootRef.current?.unmount();
      rootRef.current = null;

      container.remove();
      containerRef.current = null;

      if (host.childNodes.length === 0) {
        host.remove();
      }
    };
  }, [enabled, hostId]);

  useEffect(() => {
    if (!enabled) return;
    rootRef.current?.render(content);
  }, [content, enabled]);
}