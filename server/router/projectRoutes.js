import express from "express";
import { downloadFile } from "../controllers/projectController.js";
import { getAllProjects } from "../controllers/adminController.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", isAuthenticated, isAuthorized("Admin"), getAllProjects);
router.get("/:projectId/files/:fileId/download", isAuthenticated, downloadFile);

export default router;
