import * as projectService from "../services/projectService.js";
import * as fileServices from "../services/fileService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ErrorHandler } from "../middleware/error.js";

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const user = req.user;
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }
  const userRole = (user.role || "").toLowerCase();
  const userId = user._id?.toString() || user.id;

  const hasAccess =
    userRole === "admin" ||
    project.student._id.toString() === userId ||
    project.supervisor._id.toString() === userId;
  if (!hasAccess) {
    return next(new ErrorHandler("Not authorized to download this file", 403));
  }
  const file = project.files.id(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }
  fileServices.streamDownload(file.fileUrl, res, file.originalName);
});
