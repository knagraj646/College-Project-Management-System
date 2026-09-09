import { ErrorHandler } from "../middleware/error.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userService.js";
import * as projectService from "../services/projectService.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationServices from "../services/notificationService.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";
import * as fileServices from "../services/fileService.js";

export const getStudentProject = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await projectService.getProjectByStudent(studentId);

  if (!project) {
    return res.status(200).json({
      success: true,
      data: { project: null },
      message: "No project found for this student",
    });
  }
  res.status(200).json({
    success: true,
    data: { project },
  });
});

export const submitProposal = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const { title, description } = req.body;

  const exitstingProject = await projectService.getProjectByStudent(studentId);
  if (exitstingProject && exitstingProject.status !== "rejected") {
    return next(
      new ErrorHandler("A project already exists for this student", 400),
    );
  }
  if (exitstingProject && exitstingProject.status === "rejected") {
    await Project.findByIdAndDelete(exitstingProject._id);
  }
  const projectData = {
    student: studentId,
    title,
    description,
  };
  const project = await projectService.createProject(projectData);
  await User.findByIdAndUpdate(studentId, { project: project._id });
  res.status(201).json({
    success: true,
    data: { project },
    message: "Project proposal submitted successfully",
  });
});

export const uploadFiles = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectByStudent(projectId);
  if (!project || project.student._id.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Project not found or access denied", 404));
  }
  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No files uploaded", 400));
  }
  const updatedProject = await projectService.addFilesToProject(
    projectId,
    req.files,
  );
  res.status(200).json({
    success: true,
    data: { project: updatedProject },
    message: "Files uploaded successfully",
  });
});
export const getAvailableSupervisors = asyncHandler(async (req, res, next) => {
  const supervisor = await User.find({ role: Teacher })
    .select("name email department experties")
    .lean();
  res.status(200).json({
    success: true,
    data: { supervisor },
    message: "Available supervisors fetched successfully",
  });
});

export const getSupervisor = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const student = await User.findById(studentId).populate(
    "supervisor",
    "name email department experties",
  );
  if (!student.supervisor) {
    return res.json({
      success: true,
      data: { supervisor: null },
      message: "No supervisor assigned yet",
    });
  }
  res.status(200).json({
    success: true,
    data: { supervisor: student.supervisor },
    message: "Supervisor fetched successfully",
  });
});

export const requestSupervisor = asyncHandler(async (req, res, next) => {
  const { teacherId, message } = req.body;
  const studentId = req.user._id;
  const student = await User.findById(studentId);
  if (student.supervisor) {
    return next(
      new ErrorHandler("You already have a supervisor assigned.", 400),
    );
  }
  const supervisor = await User.findById(teacherId);
  if (!supervisor || supervisor.role !== "Teacher") {
    return next(new ErrorHandler("Invalid supervisor.", 400));
  }
  if (supervisor.maxStudents === supervisor.assignedStudents.length) {
    return next(
      new ErrorHandler(
        "Supervisor has reached the maximum number of students.",
        400,
      ),
    );
  }
  const requestData = {
    student: studentId,
    supervisor: teacherId,
    message: message,
  };
  const request = await requestServices.createRequest(requestData);
  await notificationServices.notifyUser(
    teacherId,
    `${student.name} has requested ${supervisor.name} to be their supervisor.`,
    "request",
    "/teacher/requests",
    "medium",
  );
  res.status(201).json({
    success: true,
    data: { request },
    message: "Supervisor request submitted successfully",
  });
});

export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;

  const project = await Project.findOne({ student: studentId })
    .sort({ created: -1 })
    .populate("supervisor", "name")
    .lean();
  const now = new Date();
  const upcomingDeadlines = await Project.find({
    student: studentId,
    deadline: { $gte: now },
  })
    .select("tilte description")
    .sort({ deadline: 1 })
    .limit(3)
    .lean();

  const topNotfications = await Notification.find({ user: studentId })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();
  const feedbackNotfications =
    project?.feedback && project?.feedback.length > 0
      ? project.feedback
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2)
      : [];
  const supervisorName = project?.supervisor?.name || null;
  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      project,
      upcomingDeadlines,
      topNotfications,
      feedbackNotfications,
      supervisorName,
    },
  });
});

export const getFeedback = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);
  if (!project || project.student._id.toString() !== studentId.toString()) {
    return next(
      new ErrorHandler("Not authorized to view feedback for this project", 403),
    );
  }
  const sortedFeedback = project.feedback
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((f) => ({
      _id: f._id,
      title: f.title,
      message: f.message,
      type: f.type,
      createdAt: f.createdAt,
      supervisorName: f.supervisorId?.name,
      supervisorEmail: f.supervisorId?.email,
    }));
  res.status(200).json({
    success: true,
    data: { feedback: sortedFeedback },
  });
});

export const downloadFile = asyncHandler(async (req, res, next) => {
  const { projectId, fileId } = req.params;
  const studentId = req.user._id;
  const project = await projectService.getProjectById(projectId);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }
  if (project.student._id.toString() !== studentId.toString()) {
    return next(new ErrorHandler("Not authorized to download this file", 403));
  }
  const file = project.files.id(fileId);
  if (!file) {
    return next(new ErrorHandler("File not found", 404));
  }
  fileServices.streamDownload(file.fileUrl, file.originalName);
});
