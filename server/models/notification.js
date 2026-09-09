import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxLength: [500, "Message can't be more than 500 character"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: [
        "request",
        "approval",
        "system",
        "rejection",
        "deadline",
        "general",
        "meeting",
        "deadline",
      ],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["high", "low", "medium"],
      default: "low",
    },
  },
  {
    timestamps: true,
  },
);

// Indexing for better query performence

notificationSchema.index({ user: 1, isRead: 1 });

export const Notification =
  mongoose.models.Notificaion ||
  mongoose.model("Notificaion", notificationSchema);
