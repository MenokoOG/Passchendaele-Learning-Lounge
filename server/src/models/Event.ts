// server/src/models/Event.ts
import mongoose, { Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  start: Date;
  end?: Date | null;
  allDay: boolean;
  owner?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const EventSchema = new mongoose.Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String },
  start: { type: Date, required: true },
  end: { type: Date, default: null },
  allDay: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: () => new Date() },
});

export const Event: Model<IEvent> = mongoose.model<IEvent>(
  "Event",
  EventSchema
);
