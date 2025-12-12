// src/pages/Calendar.tsx  (replace)
import React, { JSX, useEffect, useState } from "react";
import { apiListEvents, apiCreateEvent } from "../api";

type EventShape = {
  _id?: string;
  title?: string;
  start?: string | number | Date;
  end?: string | number | Date;
  description?: string;
  allDay?: boolean;
};

export default function CalendarPage(): JSX.Element {
  const [events, setEvents] = useState<EventShape[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // new form state
  const [title, setTitle] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [description, setDescription] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await apiListEvents();
      const list: EventShape[] = Array.isArray(r)
        ? r
        : Array.isArray(r?.events)
        ? r.events
        : Array.isArray(r?.data)
        ? r.data
        : [];
      setEvents(list);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        err?.message ??
        "Failed to load events";
      setError(String(msg));
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

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !start) return alert("Title and start are required");
    setBusy(true);
    try {
      const payload = {
        title,
        start: new Date(start).toISOString(),
        end: end ? new Date(end).toISOString() : undefined,
        description,
        allDay,
      };
      await apiCreateEvent(payload);
      setTitle("");
      setStart("");
      setEnd("");
      setDescription("");
      setAllDay(false);
      await load();
    } catch (err: any) {
      console.error("create event failed", err);
      alert(err?.response?.data?.error ?? err?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Calendar / Events</h2>

      {/* Create event form */}
      <div className="card-surface border border-surface-border p-4 rounded mb-6">
        <h3 className="font-semibold mb-2">Create event</h3>
        <form
          onSubmit={onCreate}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 rounded border border-surface-border"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Start</label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              className="w-full p-2 rounded border border-surface-border"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">End</label>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full p-2 rounded border border-surface-border"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded border border-surface-border"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="form-checkbox"
              />{" "}
              All day
            </label>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="btn-classroom" disabled={busy}>
              {busy ? "Creating..." : "Create event"}
            </button>
          </div>
        </form>
      </div>

      {loading && <div className="text-classroom-muted">Loading…</div>}
      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      {!loading && !error && events.length === 0 && (
        <div className="text-classroom-muted">No events found.</div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="space-y-3">
          {events.map((ev) => {
            const key = ev._id ?? `${ev.title}-${fmt(ev.start)}`;
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
