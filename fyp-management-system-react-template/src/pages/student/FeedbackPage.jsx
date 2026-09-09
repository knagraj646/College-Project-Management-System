import { AlertTriangle, BadgeCheck, MessageCircle } from "lucide-react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// ADDED: Import the missing actions. Adjust the path if your slice is named differently.
import { fetchProject, getFeedback } from "../../store/slices/studentSlice";

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const { project, feedback } = useSelector((state) => state.student);

  // FIX: Ensure feedback is always an array so .filter() and .map() never crash
  const safeFeedback = Array.isArray(feedback) ? feedback : [];

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  useEffect(() => {
    if (project?._id) {
      dispatch(getFeedback(project._id));
    }
  }, [dispatch, project]);

  const getFeedbackIcon = (type) => {
    if (type === "positive") {
      return <BadgeCheck className="w-6 h-6 text-green-500" />;
    }
    if (type === "negative") {
      return <AlertTriangle className="w-6 h-6 text-red-500" />;
    }
    return <MessageCircle className="w-6 h-6 text-yellow-500" />;
  };

  const feedbackStats = [
    {
      type: "general",
      title: "Total Feedback",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-800",
      valueColor: "text-blue-900",
      getCount: (fb) => fb.length,
    },
    {
      type: "positive",
      title: "Positive",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-800",
      valueColor: "text-green-900",
      getCount: (fb) => fb.filter((f) => f.type === "positive").length,
    },
    {
      type: "negative",
      title: "Needs Revision",
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      getCount: (fb) => fb.filter((f) => f.type === "negative").length,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Feedback header */}
        <div className="card">
          {/* FIX: Corrected clasName to className */}
          <div className="card-header">
            <h1 className="card-title">Supervisor Feedback</h1>
            <p className="card-subtitle">View feedback from your supervisor</p>
          </div>
        </div>

        {/* Feedback Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {feedbackStats.map((item, i) => {
            return (
              <div key={i} className={`${item.bg} rounded-lg p-4`}>
                <div className="flex items-center">
                  {/* FIX: Removed stray closing bracket } inside the template string */}
                  <div className={`p-2 ${item.iconBg} rounded-lg`}>
                    {getFeedbackIcon(item.type)}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${item.textColor} `}>
                      {item.title}
                    </p>
                    <p className={`text-sm font-medium ${item.valueColor} `}>
                      {item.getCount(safeFeedback)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {safeFeedback.length > 0 ? (
            safeFeedback.map((f, i) => {
              return (
                <div
                  key={i}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  {/* FIX: Corrected clasName to className */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getFeedbackIcon(f.type)}
                      <h3 className="font-medium text-slate-800">
                        {f.title || "Feedback"}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right mt-2 md:mt-0">
                    <p className="text-sm text-slate-600">
                      {f.createdAt
                        ? new Date(f.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                    <p>{f.supervisorName || "Supervisor"}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="badge badge-approved">Read</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No feedback received yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FeedbackPage;
