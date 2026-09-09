import { asyncHandler } from "../middleware/asyncHandler.js";
import { ErrorHandler } from "../middleware/error.js";
import { Deadline } from "../models/deadline.js";
import { Project } from "../models/project.js";
import { getProjectById } from "../services/projectService.js";

export const createDeadline = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, dueDate } = req.body;

  if (!name || !dueDate) {
    return next(new ErrorHandler("Name and dueDate are not required ", 404));
  }
  const project = await getProjectById(id);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const deadlineData = {
    name,
    dueDate: new Date(dueDate),
    createdBy: req.user._id,
    project: project || null,
  };
  const deadline = await Deadline.create(deadlineData);
  await deadline.populate([
    { path: "createdBy", select: "name email" },
    { path: "project", select: "title student" },
  ]);
  if (project) {
    await Project.findByIdAndUpdate(
      project,
      { deadline: dueDate },
      { new: true, runValidators: true },
    );
  }

  return res.status(201).json({
    success: true,
    data: { deadline },
    message: "Deadline created successfully",
  });
});
