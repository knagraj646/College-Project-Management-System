import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Deadline name/title is required"],
      trim: true,
      maxLength: [100, "Message can't be more than 100 character"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created By is required"],
    },
    Project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexing for better query performence

deadlineSchema.index({ dueDate: 1 });
deadlineSchema.index({ project: 1 });
deadlineSchema.index({ createdBy: 1 });

export const Deadline =
  mongoose.models.Deadline || mongoose.model("Deadline", deadlineSchema);
