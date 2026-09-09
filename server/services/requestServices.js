import ErrorHandler from "../middleware/error.js";
import supervisorRequest from "../models/supervisorRequest.js";

export const createRequest = async (requestData) => {
  const existingRequest = await supervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "pending",
  });
  if (existingRequest) {
    throw new ErrorHandler(
      "A request already exists for this student and supervisor.",
      400,
    );
  }
  const request = new supervisorRequest.create(requestData);
  return await request.save();
};
export const getAllRequests = async (filters) => {
  const requests = await supervisorRequest
    .find(filters)
    .populate("student", "name email")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });
  const total = await supervisorRequest.countDocuments(filters);
  return { requests, total };
};
export const acceptRequest = async (requestId, teacherId) => {
  const request = await supervisorRequest
    .findById(requestId)
    .populate("student", "name email supervisor project")
    .populate("supervisor", "name email assisgnStudent maxStudent");

  if (!request) return next(new ErrorHandler("Request not found", 404));
  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new Error("You are not authorized to accept this request", 403);
  }
  if (request.status !== "pending") {
    throw new Error("Request has alreday been accepted", 403);
  }

  request.status = "accepted";

  await request.save();
  return request;
};
export const rejectRequest = async (requestId, supervisorId) => {
  const request = await supervisorRequest
    .findById(requestId)
    .populate("student", "name email ")
    .populate("supervisor", "name email ");

  if (!request) throw new Error("Request not found", 404);
  if (request.supervisor._id.toString() !== supervisorId.toString()) {
    throw new Error("You are not authorized to reject this request", 403);
  }
  if (request.status !== "pending") {
    throw new Error("Request has alreday been processed", 403);
  }
  ((request.status = "rejected"), await request.save());
  return request;
};
