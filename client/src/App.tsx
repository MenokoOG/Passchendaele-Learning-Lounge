import React, { useState } from "react";
import LinkList from "./components/LinkList";
import RawList from "./components/RawList";

export default function App() {
  // bump to make RawList re-fetch after a scrape finishes
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-6">
      <header className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Passchendaele Scraper Console</h1>
        <p className="text-slate-300 mb-4">
          Fetch the public Battle of Passchendaele sources into the lounge.
          robots.txt is honoured; pages behind bot walls are listed as link-out
          only and never bypassed.
        </p>
      </header>

      <main className="max-w-4xl mx-auto mt-7">
        <section className="mb-6 text-slate-900 bg-white rounded">
          <LinkList onDone={() => setRefresh((n) => n + 1)} />
        </section>

        <section className="mb-6 text-slate-900 bg-white rounded">
          <RawList key={refresh} />
        </section>
      </main>
    </div>
  );
}
