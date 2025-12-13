// server/src/models/RawCourse.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRawCourse extends Document {
  title?: string;
  url?: string;
  fetchedAt?: string | Date;
  fetchedBy?: string;
  contentHtml?: string;
  text?: string;
  sections?: any[];
  metadata?: any;
}

const RawCourseSchema = new Schema<IRawCourse>({
  title: String,
  url: { type: String, index: true, sparse: true }, // unique-sparse index added below
  fetchedAt: { type: Date, default: Date.now },
  fetchedBy: String,
  contentHtml: String,
  text: String,
  sections: { type: Array, default: [] },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

// Durable unique index on url to avoid duplicates across processes.
// Sparse so documents without a url are allowed.
RawCourseSchema.index({ url: 1 }, { unique: true, sparse: true });

export const RawCourse =
  (mongoose.models.RawCourse as mongoose.Model<IRawCourse>) ||
  mongoose.model<IRawCourse>("RawCourse", RawCourseSchema);

export default RawCourse;
