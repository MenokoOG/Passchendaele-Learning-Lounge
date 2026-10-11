// server/src/__tests__/routes/scrape_gate.test.ts
import request from "supertest";
import express from "express";
import scrapeRouter from "../../routes/scrape.js";
import ingestRouter from "../../routes/ingest.js";

// The real scraper pulls in puppeteer; the gate never reaches it.
jest.mock("../../utils/scraper.js", () => ({ __esModule: true, default: jest.fn() }));

/**
 * requireAuth rejects before any database call, so these run without MongoDB.
 */
const app = express();
app.use(express.json());
app.use("/api/scrape", scrapeRouter);
app.use("/api/ingest", ingestRouter);

describe("scrape and ingest gate", () => {
  it("keeps GET /api/scrape/sources public", async () => {
    const res = await request(app).get("/api/scrape/sources");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.sources)).toBe(true);
  });

  it("rejects POST /api/scrape without a token", async () => {
    const res = await request(app)
      .post("/api/scrape")
      .send({ links: [{ url: "http://127.0.0.1/" }], processNow: true });
    expect(res.status).toBe(401);
  });

  it("rejects POST /api/ingest without a token", async () => {
    const res = await request(app).post("/api/ingest").send({ text: "x" });
    expect(res.status).toBe(401);
  });

  it("rejects a malformed token", async () => {
    const res = await request(app)
      .post("/api/scrape")
      .set("Authorization", "Bearer not-a-jwt")
      .send({ links: [{ url: "http://127.0.0.1/" }] });
    expect(res.status).toBe(401);
  });
});
