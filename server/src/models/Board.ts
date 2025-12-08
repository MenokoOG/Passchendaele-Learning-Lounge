// server/src/models/Board.ts
import mongoose, { Document, Model } from "mongoose";

export interface ITask {
  title: string;
  description?: string;
  assignee?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  dueDate?: Date | null;
}

export interface IColumn {
  name: string;
  tasks: ITask[];
}

export interface IBoard extends Document {
  title: string;
  owner?: mongoose.Types.ObjectId;
  columns: IColumn[];
  createdAt: Date;
}

const TaskSchema = new mongoose.Schema<ITask>({
  title: String,
  description: String,
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: { type: Date, default: () => new Date() },
  dueDate: Date,
});

const ColumnSchema = new mongoose.Schema<IColumn>({
  name: String,
  tasks: [TaskSchema],
});

const BoardSchema = new mongoose.Schema<IBoard>({
  title: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  columns: [ColumnSchema],
  createdAt: { type: Date, default: () => new Date() },
});

export const Board: Model<IBoard> = mongoose.model<IBoard>(
  "Board",
  BoardSchema
);
