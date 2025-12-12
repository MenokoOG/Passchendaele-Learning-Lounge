import mongoose, { Document, Model } from "mongoose";

export interface ILesson extends Document {
  title: string;
  slug?: string;
  summary?: string;
  contentHtml?: string;
  owner?: mongoose.Types.ObjectId;
  published?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  [k: string]: any;
}

const LessonSchema = new mongoose.Schema<ILesson>(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, index: true, unique: true, sparse: true },
    summary: { type: String },
    contentHtml: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    published: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// ensure short index on slug (unique when present)
LessonSchema.index({ slug: 1 }, { unique: true, sparse: true });

export const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema);
