import { ErrorHandler } from "../middleware/error.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userService.js";
import * as projectService from "../services/projectService.js";
import Project from "../models/project.js";
import supervisorRequest from "../models/supervisorRequest.js";
import * as notificationService from "../services/notificationService.js";

export const createStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, department } = req.body;
  if (!name || !email || !password || !department) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    role: "Student",
  });
  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: { user },
  });
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData.role;

  const user = await userServices.updateUser(id, updateData);
  if (!user) {
    return next(new ErrorHandler("Students not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Students update successfully",
    data: { user },
  });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);
  if (!user) {
    return next(new ErrorHandler("Student not found", 404));
  }
  if (user.role !== "Student") {
    return next(new ErrorHandler("User is not a student", 400));
  }
  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

export const createTeacher = asyncHandler(async (req, res, next) => {
  const { name, email, password, department, maxStudents, experties } =
    req.body;
  if (
    !name ||
    !email ||
    !password ||
    !department ||
    !maxStudents ||
    !experties
  ) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }
  const user = await userServices.createUser({
    name,
    email,
    password,
    department,
    maxStudents,
    experties: Array.isArray(experties)
      ? experties
      : typeof experties === "string" && experties.trim() !== ""
        ? experties.split(",").map((s) => s.trim())
        : [],
    role: "Teacher",
  });
  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: { user },
  });
});

export const updateTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };
  delete updateData.role;

  const user = await userServices.updateUser(id, updateData);
  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Teacher update successfully",
    data: { user },
  });
});

export const deleteTeacher = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userServices.getUserById(id);
  if (!user) {
    return next(new ErrorHandler("Teacher not found", 404));
  }
  if (user.role !== "Teacher") {
    return next(new ErrorHandler("User is not a Teacher", 400));
  }
  await userServices.deleteUser(id);
  res.status(200).json({
    success: true,
    message: "Teacher deleted successfully",
  });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await userServices.getAllUsers();
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: { users },
  });
});

export const getAllProjects = asyncHandler(async (req, res, next) => {
  const projects = await projectService.getAllProjects();
  res.json({
    success: true,
    message: "Project fetched successfully",
    data: { projects },
  });
});
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const [
    totalStudents,
    totalProjects,
    totalTeachers,
    pendingProjects,
    pendingRequests,
    completedProjects,
  ] = await Promise.all([
    User,
    countDocuments({ role: "Student" }),
    User.countDocuments({ role: "Teacher" }),
    Project.countDocuments({ status: "Pending" }),
    supervisorRequest.countDocuments({ status: "Pending" }),
    Project.countDocuments({ status: "Completed" }),
  ]);
  res.status.json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      totalStudents,
      totalProjects,
      totalTeachers,
      pendingProjects,
      pendingRequests,
      completedProjects,
    },
  });
});

export const assignSupervisor = asyncHandler(async (req, res, next) => {
  const { studentId, supervisorId } = req.body;
  if (!studentId || !supervisorId) {
    return next(new errorMiddleware("Missing studentId or supervisorId", 400));
  }
  const project = await Project.findOne({ student: studentId });
  if (!project) {
    return next(new errorMiddleware("Project not found", 404));
  }
  if (project.supervisor !== null) {
    return next(new errorMiddleware("Supervisor already assigned", 400));
  }

  if (project.status !== "approved") {
    return next(new errorMiddleware("Project not approved", 400));
  } else if (project.status === "pending" || project.status === "rejected") {
    return next(
      new errorMiddleware("Project is in pending state or rejected ", 400),
    );
  }
  const {} = await userServices.assignSupervisorDirectly(
    studentId,
    supervisorId,
  );
  project.supervisor = supervisor;
  await project.save();
  await notificationService.notifyUser(
    studentId,
    `Your project has been assigned to ${supervisor.name}    `,
    "approval",
    "/students/status",
    "low",
  );
  await notificationService.notifyUser(
    supervisorId,
    `The student ${student.name} has been assigned to you`,
    "general",
    "/teachers/status",
    "low",
  );
  res.status(200).json({
    success: true,
    data: { student, supervisor },
    message: "Supervisor assigned successfully",
  });
});
