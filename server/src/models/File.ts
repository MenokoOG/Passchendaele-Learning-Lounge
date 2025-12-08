// server/src/models/File.ts
import mongoose, { Document, Model } from "mongoose";

export interface IFileMeta extends Document {
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploader?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FileSchema = new mongoose.Schema<IFileMeta>({
  originalName: String,
  mimeType: String,
  size: Number,
  path: String,
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: () => new Date() },
});

export const FileMeta: Model<IFileMeta> = mongoose.model<IFileMeta>(
  "FileMeta",
  FileSchema
);
