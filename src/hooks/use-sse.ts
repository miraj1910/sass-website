"use client";

import { useEffect, useRef } from "react";

type EventHandler = (data: unknown) => void;

export function useSSE(handlers: Record<string, EventHandler>) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef(handlers);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    function connect() {
      if (eventSourceRef.current) return;

      const es = new EventSource("/api/realtime");
      eventSourceRef.current = es;

      es.addEventListener("connected", () => {
        /* connected */
      });

      es.onmessage = (event) => {
        const handler = handlersRef.current[event.type];
        if (handler) {
          try {
            handler(JSON.parse(event.data));
          } catch {
            handler(event.data);
          }
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        reconnectTimer.current = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);
}
