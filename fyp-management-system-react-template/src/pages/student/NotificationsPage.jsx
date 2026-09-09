import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BadgeCheck,
  Calendar,
  Clock5,
  MessageCircle,
  CheckCircle2,
  User,
  Clock,
  AlertCircle,
  ChevronDown,
  BellOff,
  Settings,
} from "lucide-react";
import {
  deleteNotification,
  getNotification,
  markAllAsRead,
  markAsRead,
} from "../../store/slices/notificationSlice";

const NotificationsPage = () => {
  const dispatch = useDispatch();

  // FIX: Provide a fallback empty array [] so .filter() never crashes if data is loading
  const notifications = useSelector((state) => state.notification.list) || [];
  const unreadCount =
    useSelector((state) => state.notification.unreadCount) || 0;
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  useEffect(() => {
    dispatch(getNotification());
  }, [dispatch]);

  const markAsReadHandler = (id) => {
    dispatch(markAsRead(id));
  };
  const markAllAsReadHandler = () => {
    dispatch(markAllAsRead());
  };
  const deleteNotificationHandler = (id) => {
    dispatch(deleteNotification(id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "feedback":
        return <MessageCircle className="w-6 h-6 text-blue-500" />;
      case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />;
      case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />;
      case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />;
      case "system":
        return <Settings className="w-6 h-6 text-gray-500" />;
      default:
        return (
          <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
            <User className="w-5 h-5 absolute" />
            <ChevronDown className="w-4 h-4 absolute top-4" />
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return `${diffDays} days ago`;
    }
  };

  const stats = [
    {
      title: "Total",
      value: safeNotifications.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      valueColor: "text-blue-900",
      Icon: User,
    },
    {
      title: "Unread",
      value: unreadCount,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      valueColor: "text-red-900",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: safeNotifications.filter((n) => n.priority === "high").length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: safeNotifications.filter((n) => {
        if (!n.createdAt && !n.date) return false;
        const notifDate = new Date(n.createdAt || n.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notifDate >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      valueColor: "text-green-900",
      Icon: CheckCircle2,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="card-title">Notifications</h1>
                <p className="card-subtitle">
                  Stay updated with your project and deadlines
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  className="btn-outline btn-small"
                  onClick={markAllAsReadHandler}
                >
                  Mark all as read ({unreadCount})
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((item, i) => {
              return (
                <div key={i} className={`${item.bg} rounded-lg p-4`}>
                  <div className="flex items-center">
                    <div className={`p-2 ${item.iconBg} rounded-lg`}>
                      <item.Icon className={`w-5 h-5 ${item.textColor}`} />
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${item.titleColor} `}>
                        {item.title}
                      </p>
                      <p className={`text-sm font-medium ${item.valueColor} `}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            {safeNotifications.map((notif) => {
              return (
                <div
                  key={notif._id || notif.id}
                  className={`border border-slate-200 rounded-lg p-4 transition-all duration-200 border-l-4 ${getPriorityColor(
                    notif.priority,
                  )} ${!notif.isRead ? "bg-blue-50" : "bg-white hover:bg-slate-50"}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-medium ${
                            notif.isRead ? "text-slate-600" : "text-slate-900"
                          }`}
                        >
                          {notif.title}
                          {!notif.isRead && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block" />
                          )}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500">
                            {formatDate(notif.createdAt || notif.date)}
                          </span>
                          <span
                            className={`badge capitalize ${
                              notif.priority === "high"
                                ? "badge-rejected"
                                : notif.priority === "medium"
                                  ? "badge-pending"
                                  : "badge-approved"
                            }`}
                          >
                            {notif.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed mb-3">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`badge capitalize ${
                            notif.type === "feedback"
                              ? "bg-blue-100 text-blue-600"
                              : notif.type === "deadline"
                                ? "bg-red-100 text-red-600"
                                : notif.type === "approval"
                                  ? "bg-green-100 text-green-600"
                                  : notif.type === "meeting"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {notif.type}
                        </span>
                        <div className="flex items-center space-x-2">
                          {!notif.isRead && (
                            <button
                              className="text-sm text-blue-600 hover:text-blue-500 "
                              onClick={() =>
                                markAsReadHandler(notif._id || notif.id)
                              }
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            className="text-sm text-red-600 hover:text-red-500 "
                            onClick={() =>
                              deleteNotificationHandler(notif._id || notif.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {safeNotifications.length === 0 && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-3 text-slate-600">
                <BellOff className="w-12 h-12" />
              </div>
              <p className="text-slate-500">No Notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
