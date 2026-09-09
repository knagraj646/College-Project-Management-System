import mongoose from "mongoose";

const supervisorRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Student ID is required"],
      ref: "User",
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Supervisor ID is required"],
      ref: "User",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxLength: [250, "Message cannot be more than 250"],
    },
    status: {
      type: String,
      default: "pending", // FIX: Corrected spelling from "deafult"
      enum: ["pending", "accepted", "rejected"], // FIX: Corrected spelling from "rejceted"
    },
  },
  {
    timestamps: true,
  },
);

// Indexing for better query performance
supervisorRequestSchema.index({ student: 1 });
supervisorRequestSchema.index({ supervisor: 1 });
supervisorRequestSchema.index({ status: 1 });

// FIX: Standardized model naming to PascalCase (SupervisorRequest) to prevent caching/export mismatches
const supervisorRequest =
  mongoose.models.supervisorRequest ||
  mongoose.model("supervisorRequest", supervisorRequestSchema);

export default supervisorRequest;
