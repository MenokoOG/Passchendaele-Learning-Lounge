// server/src/models/ScrapeJob.ts
import mongoose from "mongoose";

export interface IScrapeJob extends mongoose.Document {
  url: string;
  title?: string;
  usePuppeteer?: boolean;
  crawl?: boolean;
  delayMs?: number;
  randomize?: boolean;
  maxPerSite?: number;
  status?: "pending" | "processing" | "done" | "failed";
  attempts?: number;
  lastError?: string | null;
  resultRawCourseId?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
  lockedUntil?: Date | null;
  [k: string]: any;
}

const ScrapeJobSchema = new mongoose.Schema<IScrapeJob>(
  {
    url: { type: String, required: true, index: true, unique: true },
    title: String,
    usePuppeteer: { type: Boolean, default: false },
    crawl: { type: Boolean, default: false },
    delayMs: { type: Number, default: 1000 },
    randomize: { type: Boolean, default: false },
    maxPerSite: { type: Number, default: 25 },
    status: { type: String, default: "pending", index: true },
    attempts: { type: Number, default: 0 },
    lastError: String,
    resultRawCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawCourse",
      default: null,
    },
    lockedUntil: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// allow re-inserting same url to update job rather than duplicate error
ScrapeJobSchema.index(
  { url: 1 },
  { unique: true, partialFilterExpression: { status: { $exists: true } } }
);

export const ScrapeJob =
  (mongoose.models &&
    (mongoose.models.ScrapeJob as mongoose.Model<IScrapeJob>)) ||
  mongoose.model<IScrapeJob>("ScrapeJob", ScrapeJobSchema);

export default ScrapeJob;
