// src/pages/Calendar.tsx
import React, { JSX, useEffect, useState } from "react";
import { apiListEvents } from "../api";

type EventShape = {
  _id?: string;
  id?: string;
  title?: string;
  start?: string | number | Date;
  end?: string | number | Date;
  description?: string;
  [k: string]: any;
};

export default function CalendarPage(): JSX.Element {
  const [events, setEvents] = useState<EventShape[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await apiListEvents();
        // server may return array or { events: [...] } or { data: [...] }
        const list: EventShape[] = Array.isArray(r)
          ? r
          : Array.isArray(r?.events)
          ? r.events
          : Array.isArray(r?.data)
          ? r.data
          : [];
        if (mounted) setEvents(list);
      } catch (err: any) {
        console.error("apiListEvents failed", err);
        const msg =
          err?.response?.data?.error ??
          err?.response?.data?.message ??
          err?.message ??
          "Failed to load events";
        if (mounted) setError(String(msg));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function fmt(dt?: string | number | Date) {
    if (!dt) return "—";
    try {
      const d = typeof dt === "number" ? new Date(dt) : new Date(String(dt));
      if (isNaN(d.getTime())) return String(dt);
      return d.toLocaleString();
    } catch {
      return String(dt);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Calendar / Events</h2>

      {loading && <div className="text-classroom-muted">Loading…</div>}

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      {!loading && !error && events.length === 0 && (
        <div className="text-classroom-muted">No events found.</div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="space-y-3">
          {events.map((ev) => {
            const key = ev._id ?? ev.id ?? `${ev.title}-${fmt(ev.start)}`;
            return (
              <div
                key={key}
                className="card-surface border border-surface-border p-3 rounded"
              >
                <div className="font-medium text-lg">
                  {ev.title ?? "Untitled"}
                </div>
                <div className="text-sm text-classroom-muted mt-1">
                  {fmt(ev.start)} {ev.end ? ` — ${fmt(ev.end)}` : ""}
                </div>
                {ev.description ? (
                  <div className="mt-2 text-sm">{ev.description}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
