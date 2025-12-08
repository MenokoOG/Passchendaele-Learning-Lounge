// server/src/models/User.ts
import mongoose, { Document } from "mongoose";

export type Role = "admin" | "instructor" | "student";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, index: true, unique: true },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "instructor", "student"],
      default: "student",
    },
  },
  { timestamps: true }
);

// Export model
export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
