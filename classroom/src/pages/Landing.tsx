// src/pages/Landing.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  IconArchive,
  IconArrowRight,
  IconBook,
  IconCheck,
  IconEye,
  IconGlobe,
} from "../components/Icons";

const TIMELINE: Array<{ date: string; label: string }> = [
  { date: "31 Jul", label: "Pilckem Ridge" },
  { date: "20 Sep", label: "Menin Road Ridge" },
  { date: "4 Oct", label: "Broodseinde" },
  { date: "12 Oct", label: "First Passchendaele" },
  { date: "6 Nov", label: "Village taken by the Canadian Corps" },
  { date: "10 Nov", label: "Offensive ends" },
];

const QUESTIONS: Array<{ q: string; a: string; to: string; cta: string }> = [
  {
    q: "Was the Belgian coast ever a realistic objective?",
    a: "The offensive was sold, in part, on reaching the Channel ports. Compare what planners wrote before with what historians conclude now.",
    to: "/lessons",
    cta: "Read the planning sources",
  },
  {
    q: "Why was the ground so wet?",
    a: "A low-lying, drained landscape, then weeks of bombardment and a wet August. Trench maps and aerial photographs tell part of it.",
    to: "/sources",
    cta: "Find the maps",
  },
  {
    q: "Who won?",
    a: "The Imperial War Museums frame the question directly. Several nations kept their own record of the same days.",
    to: "/sources",
    cta: "Compare the nations",
  },
];

const WAYS_IN: Array<{
  name: string;
  tag: string;
  points: string[];
  to: string;
  cta: string;
  highlight?: boolean;
}> = [
  {
    name: "Visitor",
    tag: "No account",
    points: [
      "Browse every source and lesson",
      "Read in easy-reading mode",
      "Text-to-speech and palettes",
    ],
    to: "/sources",
    cta: "Start reading",
  },
  {
    name: "Student",
    tag: "Free account",
    points: [
      "Keep notes against any source",
      "Research sprints on a board",
      "Calendar and files",
    ],
    to: "/register",
    cta: "Create an account",
    highlight: true,
  },
  {
    name: "Instructor",
    tag: "Free, by invitation",
    points: [
      "Rewrite sources for plain reading",
      "Run source ingestion",
      "Publish lessons to a class",
    ],
    to: "/login",
    cta: "Sign in",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center section-gap">
        <div className="lg:col-span-7 enter">
          <span className="skew-tag">
            <span>Third Battle of Ypres &middot; 31 July &ndash; 10 November 1917</span>
          </span>

          <h1
            className="text-collage mt-6 text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.05] font-black"
            data-ghost="1917"
          >
            The ridge, the mud,
            <br />
            and the <span style={{ color: "var(--dark-red)" }}>record</span> they left.
          </h1>

          <p className="mt-6 text-lg max-w-[60ch] text-classroom-muted">
            A free reading room for the Battle of Passchendaele. Work through
            war diaries, photographs and museum histories from Belgium, Britain,
            Canada, Australia and New Zealand, set side by side, and built to be
            easy on every reader.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/sources" className="btn-classroom">
              Open the sources
              <IconArrowRight size={18} />
            </Link>
            <Link to="/lessons" className="btn-surface inline-flex items-center">
              Read a lesson
            </Link>
          </div>

          <p className="mt-6 text-sm mono text-classroom-muted">
            Sources are linked and credited. Always open the original.
          </p>
        </div>

        <div className="lg:col-span-5 enter enter-2" aria-hidden>
          <div className="hero-art">
            <div className="block-red" />
            <div className="block-ochre" />
            <div className="block-lead" />
            <div className="block-teal" />
            <div className="bar" />
            <div className="stamp">Ypres salient &middot; Flanders</div>
            <div className="year">1917</div>
          </div>
        </div>
      </section>

      {/* ---------------- Timeline strip ---------------- */}
      <section aria-label="Offensive timeline" className="section-gap">
        <ol
          className="grid grid-cols-2 md:grid-cols-6 border-t-[3px] border-[var(--dark-red)]"
        >
          {TIMELINE.map((t, i) => (
            <li
              key={t.date}
              className={`group p-4 border-b border-r border-surface-border ${
                i % 2 ? "md:translate-y-3" : ""
              }`}
            >
              <div className="mono text-sm font-medium" style={{ color: "var(--dark-red)" }}>
                {t.date}
              </div>
              <div className="font-bold mt-1 leading-snug">{t.label}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- Features: asymmetric ---------------- */}
      <section className="section-gap" aria-labelledby="features-h">
        <h2 id="features-h" className="text-3xl font-black mb-8">
          How the lounge works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <article className="md:col-span-7 card-surface geometric-frame p-6 enter">
            <IconArchive size={32} className="text-classroom" />
            <h3 className="text-xl font-black mt-4">Read the archives, not about them</h3>
            <p className="mt-2 text-classroom-muted">
              Pages are pulled from museum and archive sites with robots.txt
              honoured, then stored with the institution, country and reuse
              note attached. Every lesson links back to where it came from.
            </p>
            <Link to="/sources" className="inline-flex items-center gap-2 mt-4 font-bold text-classroom a11y-focus">
              <span className="reveal-text">See the catalogue</span>
              <IconArrowRight size={16} />
            </Link>
          </article>

          <article className="md:col-span-5 md:mt-12 card-surface p-6 enter enter-1">
            <IconGlobe size={32} className="text-classroom" />
            <h3 className="text-xl font-black mt-4">Five nations, one ridge</h3>
            <p className="mt-2 text-classroom-muted">
              British, Canadian, Australian and New Zealand institutions each
              keep their own account. Read them against each other.
            </p>
          </article>

          <article className="md:col-span-12 md:col-start-1 card-surface p-6 flex flex-col md:flex-row gap-6 md:items-center enter enter-2">
            <div className="shrink-0">
              <IconEye size={32} className="text-classroom" />
            </div>
            <div className="md:max-w-[28rem]">
              <h3 className="text-xl font-black">Built to be read by everyone</h3>
              <p className="mt-2 text-classroom-muted">
                Easy-reading mode, text-to-speech, font scaling and gentle or
                high-contrast palettes, for readers who are neurodivergent or
                have low vision.
              </p>
            </div>
            <Link to="/accessibility" className="btn-surface md:ml-auto inline-flex items-center">
              Set reader preferences
            </Link>
          </article>
        </div>
      </section>

      {/* ---------------- Open questions ---------------- */}
      <section className="section-gap" aria-labelledby="questions-h">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 id="questions-h" className="text-3xl font-black">
            Questions the sources argue over
          </h2>
          <span className="hidden sm:block mono text-sm text-classroom-muted">
            three places to start
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {QUESTIONS.map((x, i) => (
            <article
              key={x.q}
              className={`group card-surface p-6 ${
                i === 0 ? "md:col-span-5" : i === 1 ? "md:col-span-4 md:mt-8" : "md:col-span-3 md:-mt-4"
              }`}
            >
              <div className="mono text-sm" style={{ color: "var(--ochre)" }}>
                0{i + 1}
              </div>
              <h3 className="text-lg font-black mt-2 leading-snug">{x.q}</h3>
              <p className="mt-3 text-sm text-classroom-muted reveal-note">{x.a}</p>
              <Link
                to={x.to}
                className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-classroom a11y-focus"
              >
                <span className="reveal-text">{x.cta}</span>
                <IconArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- Three ways in ---------------- */}
      <section className="section-gap" aria-labelledby="ways-h">
        <h2 id="ways-h" className="text-3xl font-black">
          Three ways in
        </h2>
        <p className="mt-2 text-classroom-muted max-w-[60ch]">
          The lounge is free. Roles only decide what you can change.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {WAYS_IN.map((w) => (
            <article
              key={w.name}
              className={`p-6 flex flex-col ${
                w.highlight
                  ? "bg-[var(--black-bg)] text-white md:-my-4 md:py-10 border-b-[6px] border-[var(--ochre)]"
                  : "card-surface"
              }`}
              style={w.highlight ? { borderRadius: "var(--radius)" } : undefined}
            >
              <div
                className="mono text-xs uppercase tracking-widest"
                style={{ color: w.highlight ? "var(--ochre)" : "var(--text-muted)" }}
              >
                {w.tag}
              </div>
              <h3 className="text-2xl font-black mt-2">{w.name}</h3>
              <ul className="mt-4 space-y-2 flex-1">
                {w.points.map((p) => (
                  <li key={p} className="flex gap-2 items-start text-sm">
                    <IconCheck size={16} className="mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={w.to}
                className={`mt-6 text-center ${w.highlight ? "btn-classroom" : "btn-surface"} inline-flex items-center justify-center`}
              >
                {w.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section
        className="section-gap relative overflow-hidden p-8 md:p-14"
        style={{ background: "var(--dark-red)", color: "#fff" }}
        aria-labelledby="cta-h"
      >
        <div
          aria-hidden
          className="absolute -right-10 -top-10 w-48 h-48 rotate-12"
          style={{ background: "var(--ochre)" }}
        />
        <div className="relative max-w-[44rem]">
          <IconBook size={32} />
          <h2 id="cta-h" className="text-3xl md:text-4xl font-black mt-4">
            Start with one page of the record.
          </h2>
          <p className="mt-3 opacity-90">
            Pick a source, read it in the mode that suits you, and keep a note
            of what it does and does not tell you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/sources"
              className="inline-flex items-center gap-2 px-5 min-h-[44px] font-bold cursor-pointer transition-transform hover:-translate-y-0.5"
              style={{ background: "#fff", color: "var(--black-bg)", borderRadius: "var(--radius)" }}
            >
              Open the sources
              <IconArrowRight size={18} />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-5 min-h-[44px] font-bold border-2 border-white cursor-pointer transition-colors hover:bg-white hover:text-[var(--black-bg)]"
              style={{ borderRadius: "var(--radius)" }}
            >
              Create a free account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
