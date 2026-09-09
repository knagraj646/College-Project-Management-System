import express from "express";
import { Notification } from "../models/notification.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ErrorHandler } from "../middleware/error.js";
import * as notificationService from "../services/notificationService.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";

const router = express.Router();
/* router.get("/", isAuthenticated, getNotification);
router.put("/:id/read", isAuthenticated, markAsRead);
router.put("/read-all", isAuthenticated, markAllAsRead);
router.delete("/:id/delete", isAuthenticated, deleteNotification); */
export const getNotification = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const role = req.user.role;
  let query = {};
  if (role === "Admin") {
    query.type = { $in: ["request"] };
  } else {
    query.user = userId;
  }
  const notifications = await Notification.find(query).sort({ createdAt: -1 });
  const unreadOnly = notifications.filter((n) => !n.isRead);
  const readOnly = notifications.filter((n) => n.isRead);
  const highPriorityMessages = notifications.filter(
    (n) => n.priority === "high",
  );
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const thisWeekNotifications = notifications.filter((n) => {
    const created = new Date(n.createdAt);
    return created >= startOfWeek && created <= endOfWeek;
  });
  res.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    data: {
      notifications,
      unreadOnly: unreadOnly.length,
      readOnly: readOnly.length,
      highPriorityMessages: highPriorityMessages.length,

      thisWeekNotifications: thisWeekNotifications.length,
    },
  });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const notification = await notificationService.markAsRead(id, userId);
  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: { notification },
  });
});
/* export const markAllAsRead=asyncHandler(async(req,res,next)=>{
  
const userId=req.user._id;
await notificationService.markAllAsRead(userId);
res.status(200).json({
  success:true,
  message:"All notifications marked as read",

})
});
 */ export const markAllAsRead = asyncHandler(async (userId) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true },
  );
});
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const notification = await notificationService.deleteNotification(id, userId);
  if (!notification) {
    return next(new ErrorHandler("Notification not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});
