// server/src/models/Note.ts
import mongoose, { Document, Model } from "mongoose";

export interface INote extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new mongoose.Schema<INote>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "Untitled" },
  content: { type: String, default: "" },
  pinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

NoteSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Note: Model<INote> = mongoose.model<INote>("Note", NoteSchema);