import express from "express";
import {
  createStudent,
  createTeacher,
  deleteStudent,
  deleteTeacher,
  updateStudent,
  updateTeacher,
  getAllProjects,
  getDashboardStats,
  assignSupervisor,
} from "../controllers/adminController.js";
import multer from "multer";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/adminController.js";
//import { getAllProjects } from "../services/projectServices.js";

const router = express.Router();

router.post(
  "/create-student",
  isAuthenticated,
  isAuthorized("Admin"),
  createStudent,
);

router.put(
  "/update-student/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateStudent,
);

router.delete(
  "/delete-student/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteStudent,
);

router.post(
  "/create-teacher",
  isAuthenticated,
  isAuthorized("Admin"),
  createTeacher,
);

router.put(
  "/update-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateTeacher,
);

router.delete(
  "/delete-teacher/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteTeacher,
);
router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Admin"),
  getDashboardStats,
);
router.get("/projects", isAuthenticated, isAuthorized("Admin"), getAllProjects);
router.get("/users", isAuthenticated, isAuthorized("Admin"), getAllUsers);
router.post(
  "/assign-supervisor",
  isAuthenticated,
  isAuthorized("Admin"),
  assignSupervisor,
);
export default router;
