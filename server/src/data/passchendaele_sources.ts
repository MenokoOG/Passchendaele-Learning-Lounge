// server/src/data/passchendaele_sources.ts
/**
 * Public source catalog for the Battle of Passchendaele (Third Battle of Ypres, 1917).
 *
 * Single source of truth: the scrape script, GET /api/scrape/sources, the console
 * UI and the Sources page all read from this list.
 *
 * Every entry is a public page on an institutional archive, museum, government
 * portal or open library. Scraped records keep the institution + original URL so
 * the lounge always credits and links back to where the material came from.
 */

export type Nation = "BE" | "UK" | "CA" | "AU" | "NZ" | "INT";

export type SourceKind =
  | "museum"
  | "archive"
  | "government"
  | "library"
  | "encyclopedia";

export interface PasschendaeleSource {
  /** stable slug, used for dedupe + attribution */
  id: string;
  title: string;
  url: string;
  institution: string;
  nation: Nation;
  kind: SourceKind;
  /** one line on what a learner will find there */
  blurb: string;
  /** reuse note shown with the lesson; always verify at the source */
  rights: string;
  /** false = listed for learners as a link-out only (robots.txt or a bot wall prevents ingestion) */
  scrape: boolean;
  /** why a source is link-out only */
  note?: string;
}

export const NATION_LABELS: Record<Nation, string> = {
  BE: "Belgium",
  UK: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  NZ: "New Zealand",
  INT: "International / open access",
};

const RIGHTS_INSTITUTIONAL =
  "© the holding institution. Linked and excerpted for private study; check the source page for reuse terms.";

export const PASSCHENDAELE_SOURCES: ReadonlyArray<PasschendaeleSource> = [
  // ---- Belgium -----------------------------------------------------------
  {
    id: "mmp-archives-database",
    title: "Passchendaele Archives Database",
    url: "https://archives.passchendaele.be/",
    institution: "Memorial Museum Passchendaele 1917",
    nation: "BE",
    kind: "archive",
    blurb:
      "Searchable unit war diaries, aerial photographs, maps and research on the Ypres salient.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: true,
  },
  {
    id: "mmp-archives-overview",
    title: "Passchendaele Archives — overview",
    url: "https://passchendaele.be/en/passchendaele-archives-2/",
    institution: "Memorial Museum Passchendaele 1917",
    nation: "BE",
    kind: "museum",
    blurb: "How the museum's archive is organised and what it holds.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: true,
  },
  {
    id: "mmp-library-photos-maps",
    title: "Library, photographs and maps",
    url: "https://passchendaele.be/en/passchendaele-archives-2/library-photographs-and-maps/",
    institution: "Memorial Museum Passchendaele 1917",
    nation: "BE",
    kind: "museum",
    blurb: "Reference library, period photographs and trench maps of the salient.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: true,
  },

  // ---- United Kingdom ----------------------------------------------------
  {
    id: "iwm-passchendaele",
    title: "Passchendaele — Imperial War Museums",
    url: "https://www.iwm.org.uk/history/first-world-war/passchendaele",
    institution: "Imperial War Museums",
    nation: "UK",
    kind: "museum",
    blurb:
      "IWM's history hub: photographs, artefacts and recorded veteran testimony from Flanders.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: true,
  },
  {
    id: "iwm-who-won",
    title: "Passchendaele: who won?",
    url: "https://www.iwm.org.uk/history/first-world-war/passchendaele/who-won",
    institution: "Imperial War Museums",
    nation: "UK",
    kind: "museum",
    blurb: "A short assessment of the outcome and why it is still argued over.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: true,
  },
  {
    id: "nam-passchendaele",
    title: "The Battle of Passchendaele — National Army Museum",
    url: "https://www.nam.ac.uk/explore/battle-passchendaele",
    institution: "National Army Museum",
    nation: "UK",
    kind: "museum",
    blurb: "Context, maps and the British Army's deployment and tactics.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: true,
  },

  // ---- Canada ------------------------------------------------------------
  {
    id: "lac-record-3615807",
    title: "Canadian Corps at Passchendaele — LAC record 3615807",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?IdNumber=3615807&app=FonAndCol",
    institution: "Library and Archives Canada",
    nation: "CA",
    kind: "archive",
    blurb: "Catalogue record from the Canadian War Records Office collections.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: false,
    note: "robots.txt disallows automated access; open the record at LAC.",
  },
  {
    id: "lac-record-3397045",
    title: "Canadian Corps at Passchendaele — LAC record 3397045",
    url: "https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Record?app=FonAndCol&IdNumber=3397045",
    institution: "Library and Archives Canada",
    nation: "CA",
    kind: "archive",
    blurb: "Catalogue record: photographs and operational files.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: false,
    note: "robots.txt disallows automated access; open the record at LAC.",
  },
  {
    id: "vac-publication",
    title: "Veterans Affairs Canada — Passchendaele publication",
    url: "https://publications.gc.ca/site/eng/9.831354/publication.html",
    institution: "Veterans Affairs Canada",
    nation: "CA",
    kind: "government",
    blurb: "Government of Canada learning resource on the capture of the ridge.",
    rights:
      "Government of Canada publication; see the publication page for reproduction terms.",
    scrape: false,
    note: "Site uses bot verification; open the publication directly.",
  },

  // ---- Australia / New Zealand ------------------------------------------
  {
    id: "awm-passchendaele-blog",
    title: "Battle of Passchendaele (Third Ypres) — Australian War Memorial",
    url: "https://www.awm.gov.au/blog/2007/04/11/battle-of-passchendaele-third-ypres",
    institution: "Australian War Memorial",
    nation: "AU",
    kind: "museum",
    blurb: "Overview with pointers to the Australian Official Photographs.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: true,
  },
  {
    id: "natlib-22599090",
    title: "National Library of New Zealand — record 22599090",
    url: "https://natlib.govt.nz/records/22599090",
    institution: "National Library of New Zealand",
    nation: "NZ",
    kind: "library",
    blurb: "Digitised diary / photographic record from the NZ Division.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: false,
    note: "Site blocks automated access; open the record directly.",
  },
  {
    id: "natlib-22647872",
    title: "National Library of New Zealand — record 22647872",
    url: "https://natlib.govt.nz/records/22647872",
    institution: "National Library of New Zealand",
    nation: "NZ",
    kind: "library",
    blurb: "Digitised record relating to the 1917 Flanders offensive.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: false,
    note: "Site blocks automated access; open the record directly.",
  },
  {
    id: "nzhistory-western-front-1917",
    title: "The Western Front in 1917 — NZHistory",
    url: "https://nzhistory.govt.nz/war/western-front-1917",
    institution: "NZ History (Ministry for Culture and Heritage)",
    nation: "NZ",
    kind: "government",
    blurb:
      "Timelines, casualty information and bibliography on the New Zealand Division's losses.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: false,
    note: "Site refuses automated requests (HTTP 403); open it directly.",
  },

  // ---- Open access / reference ------------------------------------------
  {
    id: "internet-archive-passchendaele",
    title: "Passchendaele (borrowable scan) — Internet Archive",
    url: "https://archive.org/details/passchendaeletra0000warn",
    institution: "Internet Archive",
    nation: "INT",
    kind: "library",
    blurb:
      "Scanned reference history with letters and tactical maps from 1917 (borrowable).",
    rights:
      "Controlled digital lending: the record page is ingested, the book itself is borrowed on archive.org.",
    scrape: true,
  },
  {
    id: "britannica-passchendaele",
    title: "Battle of Passchendaele — Britannica",
    url: "https://www.britannica.com/event/Battle-of-Passchendaele",
    institution: "Encyclopaedia Britannica",
    nation: "INT",
    kind: "encyclopedia",
    blurb: "Concise reference article: causes, phases and consequences.",
    rights:
      "© Encyclopaedia Britannica. Summarised and linked; read the full article at the source.",
    scrape: false,
    note: "Site refuses automated requests (HTTP 403); read it at Britannica.",
  },
  {
    id: "wikipedia-passchendaele",
    title: "Battle of Passchendaele — Wikipedia",
    url: "https://en.wikipedia.org/wiki/Battle_of_Passchendaele",
    institution: "Wikipedia",
    nation: "INT",
    kind: "encyclopedia",
    blurb: "Detailed phase-by-phase account with an extensive bibliography.",
    rights: "CC BY-SA 4.0 — attribute Wikipedia contributors and share alike.",
    scrape: true,
  },
  {
    id: "worldhistory-passchendaele",
    title: "Battle of Passchendaele — World History Encyclopedia",
    url: "https://www.worldhistory.org/article/2893/battle-of-passchendaele/",
    institution: "World History Encyclopedia",
    nation: "INT",
    kind: "encyclopedia",
    blurb: "Accessible overview with maps and image credits.",
    rights:
      "Text licensed CC BY-NC-SA 4.0 by World History Encyclopedia; attribute and share alike, non-commercial.",
    scrape: true,
  },
  {
    id: "ebsco-passchendaele",
    title: "Passchendaele — EBSCO Research Starters",
    url: "https://www.ebsco.com/research-starters/military-history-and-science/passchendaele",
    institution: "EBSCO Research Starters",
    nation: "INT",
    kind: "encyclopedia",
    blurb: "Short research-starter article with suggested reading.",
    rights: RIGHTS_INSTITUTIONAL,
    scrape: true,
  },
];

/** Look up the catalog entry for a URL (ignores trailing slash and hash). */
export function findSourceByUrl(url: string): PasschendaeleSource | null {
  const norm = (u: string) => u.trim().replace(/#.*$/, "").replace(/\/+$/, "");
  const target = norm(url);
  return PASSCHENDAELE_SOURCES.find((s) => norm(s.url) === target) ?? null;
}

/** Links in the shape POST /api/scrape expects. */
export function scrapeLinksFromCatalog() {
  return PASSCHENDAELE_SOURCES.filter((s) => s.scrape).map((s) => ({
    title: s.title,
    url: s.url,
  }));
}
