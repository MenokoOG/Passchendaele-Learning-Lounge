// src/pages/Calendar.tsx
import React, { JSX, useEffect, useState } from "react";

/**
 * Calendar page with a small "Create event" form.
 * Uses apiListEvents() for initial fetch (if available) and apiCreateEvent() to create.
 *
 * Fallbacks to fetch('/api/events') and POST '/api/events' if ../api helpers are not present.
 */

type EventShape = {
  _id?: string;
  id?: string;
  title?: string;
  start?: string | number | Date;
  end?: string | number | Date;
  description?: string;
  allDay?: boolean;
  [k: string]: any;
};

export default function CalendarPage(): JSX.Element {
  const [events, setEvents] = useState<EventShape[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // create form state
  const [title, setTitle] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  // optional client API wrapper
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api: any = (globalThis as any).__APP_API__ || null;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      let r: any;
      if (api?.apiListEvents) {
        r = await api.apiListEvents();
      } else {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Failed to load events");
        r = await res.json();
      }
      const list: EventShape[] = Array.isArray(r)
        ? r
        : Array.isArray(r?.events)
        ? r.events
        : Array.isArray(r?.data)
        ? r.data
        : [];
      setEvents(list);
    } catch (err: any) {
      console.error("load events", err);
      setError(err?.message ?? "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // minimal validation
    if (!title.trim()) {
      setError("Title is required");
      setBusy(false);
      return;
    }
    const payload: any = {
      title: title.trim(),
      description: description.trim() || undefined,
    };
    if (start) payload.start = new Date(start).toISOString();
    if (end) payload.end = new Date(end).toISOString();

    try {
      let created: any;
      if (api?.apiCreateEvent) {
        created = await api.apiCreateEvent(payload);
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || "Create failed");
        }
        created = await res.json();
      }
      // refresh events
      await load();

      // clear form
      setTitle("");
      setStart("");
      setEnd("");
      setDescription("");
    } catch (err: any) {
      console.error("create event error", err);
      setError(err?.message ?? "Failed to create event");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-3">Calendar / Events</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <form
          onSubmit={handleCreate}
          className="card-surface border border-surface-border p-4 rounded space-y-3"
        >
          <h3 className="font-semibold">Create event</h3>

          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              className="w-full p-2 rounded border border-surface-border"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="E.g. Office hours — Algorithms"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Start</label>
            <input
              type="datetime-local"
              className="w-full p-2 rounded border border-surface-border"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">End</label>
            <input
              type="datetime-local"
              className="w-full p-2 rounded border border-surface-border"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full p-2 rounded border border-surface-border"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end">
            <button type="submit" className="btn-classroom" disabled={busy}>
              {busy ? "Creating…" : "Create event"}
            </button>
          </div>
        </form>

        <div className="lg:col-span-2">
          {loading && <div className="text-classroom-muted">Loading…</div>}

          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && events.length === 0 && (
            <div className="text-classroom-muted">No events found.</div>
          )}

          <div className="space-y-3">
            {events.map((ev) => {
              const key = ev._id ?? ev.id ?? `${ev.title}-${String(ev.start)}`;
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
        </div>
      </div>
    </div>
  );
}
