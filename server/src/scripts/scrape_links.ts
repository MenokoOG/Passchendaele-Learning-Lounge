import axios from "axios";

const LINKS = [
  {
    title: "Overview (Google for Education)",
    url: "https://developers.google.com/edu",
  },
  {
    title: "Python (Google: Python Education)",
    url: "https://developers.google.com/edu/python",
  },
  {
    title: "Python Set Up",
    url: "https://developers.google.com/edu/python/set-up",
  },
  {
    title: "Python Intro",
    url: "https://developers.google.com/edu/python/introduction",
  },
  { title: "Strings", url: "https://developers.google.com/edu/python/strings" },
  { title: "Lists", url: "https://developers.google.com/edu/python/lists" },
  { title: "Sorting", url: "https://developers.google.com/edu/python/sorting" },
  {
    title: "Dicts and Files",
    url: "https://developers.google.com/edu/python/dict-files",
  },
  {
    title: "Regular Expressions",
    url: "https://developers.google.com/edu/python/regular-expressions",
  },
  {
    title: "Utilities",
    url: "https://developers.google.com/edu/python/utilities",
  },
  {
    title: "Lecture 1.1 — Introduction, strings (YouTube)",
    url: "http://www.youtube.com/watch?v=tKTZoB2Vjuk",
  },
  {
    title: "Lecture 1.2 — Lists and sorting (YouTube)",
    url: "http://www.youtube.com/watch?v=EPYupizJYQI",
  },
  {
    title: "Lecture 1.3 — Dicts and files (YouTube)",
    url: "http://www.youtube.com/watch?v=haycL41dAhg",
  },
  {
    title: "Lecture 2.1 — Regular expr (YouTube)",
    url: "http://www.youtube.com/watch?v=kWyoYtvJpe4",
  },
  {
    title: "Lecture 2.2 — Utilities (YouTube)",
    url: "http://www.youtube.com/watch?v=uKZ8GBKmeDM",
  },
  {
    title: "Lecture 2.3 — Utilities urllib (YouTube)",
    url: "http://www.youtube.com/watch?v=Nn2KQmVF5Og",
  },
  {
    title: "Lecture 2.4 — Conclusions (YouTube)",
    url: "http://www.youtube.com/watch?v=IcteAbMC1Ok",
  },
  {
    title: "Basic Exercises",
    url: "https://developers.google.com/edu/python/exercises/basic",
  },
  {
    title: "Baby Names Exercise",
    url: "https://developers.google.com/edu/python/exercises/baby-names",
  },
  {
    title: "Copy Special Exercise",
    url: "https://developers.google.com/edu/python/exercises/copy-special",
  },
  {
    title: "Log Puzzle Exercise",
    url: "https://developers.google.com/edu/python/exercises/log-puzzle",
  },
];

(async () => {
  try {
    const host = process.env.SERVER_HOST || "http://localhost:4000";
    const resp = await axios.post(
      `${host}/api/scrape`,
      { links: LINKS, usePuppeteer: true },
      { timeout: 600000 }
    );
    console.log("Scrape results:", JSON.stringify(resp.data, null, 2));
  } catch (err: any) {
    console.error("Error scraping:", err.message || err);
  }
})();
