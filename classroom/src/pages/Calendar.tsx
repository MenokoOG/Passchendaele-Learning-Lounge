// src/pages/Calendar.tsx
import React, { useEffect, useState } from "react";
import { apiListEvents } from "../api";

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await apiListEvents();
        setEvents(Array.isArray(r) ? r : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Calendar / Events</h2>
      {events.length === 0 ? (
        <div className="text-classroom-muted">No events found.</div>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => (
            <div
              key={ev._id || ev.id}
              className="card-surface border border-surface-border p-3 rounded"
            >
              <div className="font-medium">{ev.title}</div>
              <div className="text-sm text-classroom-muted">
                {ev.start} — {ev.end}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
