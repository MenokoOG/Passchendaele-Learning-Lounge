// src/pages/Sources.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listRaw, listSources } from "../api/api";
import { IconExternal, IconArrowRight } from "../components/Icons";

type Source = {
  id: string;
  title: string;
  url: string;
  institution: string;
  nation: string;
  kind: string;
  blurb: string;
  rights: string;
  scrape: boolean;
  note?: string;
};

const norm = (u: string) => u.replace(/#.*$/, "").replace(/\/+$/, "");

export default function SourcesPage() {
  const [nations, setNations] = useState<Record<string, string>>({});
  const [sources, setSources] = useState<Source[]>([]);
  const [rawByUrl, setRawByUrl] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cat, raw] = await Promise.all([listSources(), listRaw()]);
        if (!alive) return;
        setNations(cat.nations || {});
        setSources(cat.sources || []);
        const map: Record<string, string> = {};
        (Array.isArray(raw) ? raw : []).forEach((r: any) => {
          if (r?.url && r?._id) map[norm(r.url)] = r._id;
        });
        setRawByUrl(map);
      } catch (e: any) {
        if (alive) setError(e?.message || "Could not load the source catalogue.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const out: Record<string, Source[]> = {};
    sources
      .filter((s) => filter === "ALL" || s.nation === filter)
      .forEach((s) => (out[s.nation] ||= []).push(s));
    return out;
  }, [sources, filter]);

  return (
    <div className="enter">
      <span className="skew-tag">
        <span>Source catalogue</span>
      </span>
      <h2 className="text-3xl md:text-4xl font-black mt-4">
        Where the record is kept
      </h2>
      <p className="mt-3 max-w-[64ch] text-classroom-muted">
        Public archives, museums and libraries that hold material on the Battle
        of Passchendaele. Sources marked <strong>In the lounge</strong> have been
        ingested and can be read here; the rest open at the institution.
        Copyright stays with each holder.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by nation">
        {["ALL", ...Object.keys(nations)].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            aria-pressed={filter === k}
            className={`px-3 text-sm cursor-pointer transition-colors border-2 ${
              filter === k
                ? "bg-[var(--black-bg)] text-white border-[var(--black-bg)]"
                : "border-[var(--lead-grey)] hover:border-[var(--dark-red)]"
            }`}
            style={{ borderRadius: "var(--radius)", minHeight: 40 }}
          >
            {k === "ALL" ? "All nations" : nations[k]}
          </button>
        ))}
      </div>

      {loading && <p className="mt-8 text-classroom-muted">Loading the catalogue…</p>}
      {error && (
        <p className="mt-8 p-3 border-l-4 border-[var(--error)]" role="alert">
          {error}
        </p>
      )}

      {Object.entries(grouped).map(([code, list]) => (
        <section key={code} className="mt-10" aria-labelledby={`nation-${code}`}>
          <h3
            id={`nation-${code}`}
            className="text-xl font-black pb-2 border-b-[3px] border-[var(--dark-red)] flex items-baseline gap-3"
          >
            {nations[code] || code}
            <span className="mono text-sm font-normal text-classroom-muted">
              {list.length} {list.length === 1 ? "source" : "sources"}
            </span>
          </h3>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {list.map((s, i) => {
              const rawId = rawByUrl[norm(s.url)];
              return (
                <article
                  key={s.id}
                  className={`group card-surface p-5 flex flex-col ${
                    i % 3 === 0 ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mono text-xs uppercase tracking-wider text-classroom-muted">
                        {s.institution} &middot; {s.kind}
                      </div>
                      <h4 className="text-lg font-black mt-1 leading-snug">{s.title}</h4>
                    </div>
                    {rawId ? (
                      <span
                        className="shrink-0 skew-tag"
                        style={{ background: "var(--olive)" }}
                      >
                        <span>In the lounge</span>
                      </span>
                    ) : (
                      <span
                        className="shrink-0 skew-tag"
                        style={{ background: "var(--lead-grey)" }}
                      >
                        <span>Link-out</span>
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-classroom-muted">{s.blurb}</p>
                  {s.note && !rawId && (
                    <p className="mt-2 text-xs mono text-classroom-muted">{s.note}</p>
                  )}
                  <p className="mt-2 text-xs text-classroom-muted reveal-note">{s.rights}</p>

                  <div className="mt-4 flex flex-wrap gap-4 items-center">
                    {rawId && (
                      <Link
                        to={`/lesson/${rawId}`}
                        className="inline-flex items-center gap-2 font-bold text-classroom a11y-focus"
                      >
                        <span className="reveal-text">Read here</span>
                        <IconArrowRight size={16} />
                      </Link>
                    )}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium a11y-focus cursor-pointer"
                    >
                      <span className="reveal-text">Open at source</span>
                      <IconExternal size={14} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
