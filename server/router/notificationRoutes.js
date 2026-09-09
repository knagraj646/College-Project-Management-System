import express from "express";
import {
  deleteNotification,
  markAllAsRead,
  markAsRead,
  getNotification,
} from "../controllers/notificationController.js";

import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", isAuthenticated, getNotification);
router.put("/:id/read", isAuthenticated, markAsRead);
router.put("/read-all", isAuthenticated, markAllAsRead);
router.delete("/:id/delete", isAuthenticated, deleteNotification);

export default router;
