import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["positive", "negative", "general"],
      default: "general",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxLength: [1000, "Feedback can't be more than 1000 character"],
    },
  },
  { timestamps: true },
);

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxLength: [200, "Title can't be more than 200 character"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxLength: [2000, "Description can't be more than 200 character"],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected", "completed"],
    },
    files: [
      {
        fileType: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    feedback: [feedbackSchema],
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexing for better query performence

projectSchema.index({ student: 1 });
projectSchema.index({ supervisor: 1 });
projectSchema.index({ status: 1 });

export const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
export default Project;
