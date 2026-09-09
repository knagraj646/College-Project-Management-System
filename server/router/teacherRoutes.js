import express from "express";
import {
  getRequests,
  getTeacherDashboardStats,
  addFeedback,
  getAssignedStudents,
  acceptRequest,
  rejectRequest,
  downloadFile,
  getFiles, // Consolidated imports from teacherControllers
} from "../controllers/teacherControllers.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";

// CRITICAL FIX: Removed the import of frontend Redux code (teacherSlice.js).
// The backend must never import frontend React/Redux files.

const router = express.Router();

router.get(
  "/fetch-dashboard-stats",
  isAuthenticated,
  isAuthorized("Teacher"),
  getTeacherDashboardStats,
);

router.get("/requests", isAuthenticated, isAuthorized("Teacher"), getRequests);

router.put(
  "/requests/:requestId/accept",
  isAuthenticated,
  isAuthorized("Teacher"),
  acceptRequest,
);

router.put(
  "/requests/:requestId/reject",
  isAuthenticated,
  isAuthorized("Teacher"),
  rejectRequest,
);

router.post(
  "/feedback/:projectId",
  isAuthenticated,
  isAuthorized("Teacher"),
  addFeedback,
);

// FIX 1: Changed router.post to router.get to match your frontend Axios call
router.get(
  "/assignedStudents",
  isAuthenticated,
  isAuthorized("Teacher"),
  getAssignedStudents,
);

// FIX 2: Added the missing leading slash ("/") and changed to GET.
// Downloads are almost always GET requests. Update your frontend Axios call to use GET for this as well.
router.get(
  "/download/:projectId/:fileId",
  isAuthenticated,
  isAuthorized("Teacher"),
  downloadFile,
);

router.get("/files", isAuthenticated, isAuthorized("Teacher"), getFiles);

// FIX 3: Removed the duplicate router.get("/requests"...) that was here

export default router;
