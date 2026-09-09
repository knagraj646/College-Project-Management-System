import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  assignSupervisor as assignSupervisorThunk,
  getAllUsers,
} from "../../store/slices/adminSlice";
import { AlertTriangle, CheckCircle, Users } from "lucide-react";

const AssignSupervisor = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});
  const { users, projects } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!users || !users.length === 0) {
      dispatch(getAllUsers());
    }
  }, [dispatch]);

  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter(
      (u) => (u.role || "").toLowerCase() === "teacher",
    );
    return teacherUsers.map((t) => ({
      ...t,
      assignedCount: Array.isArray(t.assignedStudents)
        ? t.assignedStudents.length
        : 0,
      capacityLeft:
        (typeof t.maxStudents === "number" ? t.maxStudents : 0) -
        (Array.isArray(t.assignedStudents) ? t.assignedStudents.length : 0),
    }));
  }, [users]);

  const studentProjects = useMemo(() => {
    return (projects || [])
      .filter((p) => !!p.student?._id)
      .map((p) => ({
        projectId: p._id,
        title: p.title,
        status: p.status,
        supervisor: p.supervisor?.name || null,
        supervisorId: p.supervisor?._id || null,
        studentId: p.student?._id || "unknown",
        studentName: p.student?.name || "-",
        studentEmail: p.student?.email || "-",
        deadline: p.deadline
          ? new Date(p.deadline).toISOString().slice(0, 10)
          : "-",
        updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-",
        isApproved: p.status === "approved",
      }));
  }, [projects]);

  const filtered = studentProjects.filter((row) => {
    const matchesSearch =
      (row.studentName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (row.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const status = row.supervisor ? "assigned" : "not assigned";
    const matchesFilter = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const [pendingFor, setPendingFor] = useState([]);
  const handleSupervisorSelect = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({
      ...prev,
      [projectId]: supervisorId,
    }));
  };

  const handleAssign = async (studentId, projectStatus, projectId) => {
    const supervisorId = selectedSupervisor[projectId];
    if (!studentId || !supervisorId) {
      toast.error("Please select a supervisor first");
      return;
    }
    if (projectStatus === "rejected") {
      toast.error("Can not assign supervisor to a rejected project");
      return;
    }
    setPendingFor(projectId);
    const res = await dispatch(
      assignSupervisorThunk({
        studentId,
        supervisorId,
      }),
    );
    setPendingFor(null);
    if (assignSupervisorThunk.fulfilled.match(res)) {
      toast.success("Supervisor assigned successfully");
      setSelectedSupervisor((prev) => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
      dispatch(getAllUsers());
    } else {
      toast.error("Failed to assign supervisor");
    }
  };

  const dashboardCards = [
    {
      title: "Assigned Students",
      value: studentProjects.filter((r) => !!r.supervisor).length,
      icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Unassigned Students",
      value: studentProjects.filter((r) => !r.supervisor).length,
      icon: AlertTriangle,
      bg: "bg-red-100",
      color: "text-red-600",
    },
    {
      title: "Available Teachers",
      value: teachers.filter(
        (t) => (t.assignedCount ?? 0) < (t.maxStudents ?? 0),
      ).length,
      icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  // TABLE HEADER
  const headers = [
    "Student",
    "Project Title",
    "Supervisor",
    "Deadline",
    "Updated",
    "Assign Supervisor",
    "Actions",
  ];

  const Badge = ({ color, children }) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {children}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Assign Supervisor</h1>
            <p className="card-subtitle">
              Manage supervisor assignment for students and projects
            </p>
          </div>
        </div>
        {/* Filter */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search Students
              </label>
              <input
                type="text"
                placeholder="Search by project title or student name"
                className="input-field w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter Status
              </label>
              <select
                className="input-field w-full"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Students</option>
                <option value="assigned">Assigned Students</option>
                <option value="unassigned">Unassigned Students</option>
              </select>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Student Assignments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((h) => {
                    return (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filtered.map((row) => (
                  <tr key={row.projectId} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {row.studentName}
                        </div>
                        <div className="text-sm text-slate-500">
                          {row.studentEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{row.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {row.supervisor !== null ? (
                          <Badge
                            color={"bg-green-100 text-green-800"}
                            children={row.supervisor}
                          />
                        ) : (
                          <Badge
                            color={"bg-gray-100 text-gray-800"}
                            children={
                              row.status === "rejected"
                                ? "Rejected"
                                : "Not Assigned"
                            }
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{row.deadline}</td>
                    <td className="px-6 py-4">{row.updatedAt}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="input-field w-full"
                        value={selectedSupervisor[row.projectId] || ""}
                        disabled={
                          !row.supervisor ||
                          row.status === "rejected" ||
                          !row.isApproved
                        }
                        onChange={(e) =>
                          handleSupervisorSelect(row.projectId, e.target.value)
                        }
                      >
                        <option value="disabled">Select Supervisor</option>
                        {teachers
                          .filter((t) => t.capacityLeft > 0)
                          .map((t) => (
                            <option value={t._id} key={t._id}>
                              {t.name} ({t.capacityLeft} slots left)
                            </option>
                          ))}
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="btn-primary text-sm w-40"
                        onClick={() =>
                          handleAssign(row.studentId, row.status, row.projectId)
                        }
                        disabled={
                          pendingFor === row.projectId ||
                          !row.isApproved ||
                          row.status === "rejected" ||
                          !selectedSupervisor[row.projectId] ||
                          !row.supervisor
                        }
                      >
                        {pendingFor === row.projectId
                          ? "Assigning..."
                          : row.supervisor
                            ? "Assigned"
                            : row.status === "rejected"
                              ? "Rejected"
                              : !row.isApproved
                                ? "Not Approved"
                                : "Assign"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-8 text-center text-slate-500">
                No results found
              </div>
            )}
          </div>
        </div>
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center">
                  <div className={`p-3 ${card.bg} rounded-lg`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">
                      {card.title}
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AssignSupervisor;
