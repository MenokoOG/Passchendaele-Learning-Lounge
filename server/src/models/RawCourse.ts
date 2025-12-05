// server/src/models/RawCourse.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRawCourse extends Document {
  title?: string;
  url?: string;
  fetchedAt?: string;
  fetchedBy?: string;
  contentHtml?: string;
  text?: string;
  sections?: any[];
  metadata?: any;
}

const RawCourseSchema = new Schema<IRawCourse>({
  title: String,
  url: String,
  fetchedAt: { type: Date, default: Date.now },
  fetchedBy: String,
  contentHtml: String,
  text: String,
  sections: { type: Array, default: [] },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

export const RawCourse =
  mongoose.models.RawCourse ||
  mongoose.model<IRawCourse>("RawCourse", RawCourseSchema);
export default RawCourse;
