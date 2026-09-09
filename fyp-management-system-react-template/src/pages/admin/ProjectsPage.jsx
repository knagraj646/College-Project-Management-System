import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Search,
  Folder,
  Calendar,
  User,
  ChevronRight,
  Filter,
} from "lucide-react";
// Import your fetch action here (adjust the path/name as needed for your project slice)
import { fetchAllProjects } from "../../store/slices/projectSlice";

const ProjectsPage = () => {
  const dispatch = useDispatch();

  // Replace state.project.list with state.admin.projects if this is for the admin view
  const projects = useSelector((state) => state.project?.list);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Safe array check to prevent .filter() and .map() crashes
  const safeProjects = Array.isArray(projects) ? projects : [];

  /*   Uncomment if you need to fetch projects on mount */
  useEffect(() => {
    dispatch(fetchAllProjects());
  }, [dispatch]);

  const filteredProjects = useMemo(() => {
    return safeProjects.filter((project) => {
      const matchesSearch =
        (project?.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (project?.student?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (project?.status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [safeProjects, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "approved" || s === "completed")
      return "badge-approved bg-green-100 text-green-800";
    if (s === "rejected") return "badge-rejected bg-red-100 text-red-800";
    return "badge-pending bg-yellow-100 text-yellow-800";
  };

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Projects Directory</h1>
          <p className="text-blue-100">
            Browse, search, and manage all student projects in the system.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white shadow-sm rounded-lg">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project title or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full md:w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <Folder className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No projects found.</p>
            <p className="text-slate-400 text-sm mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, i) => (
              <div
                key={project._id || i}
                className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getStatusBadge(project.status)}`}
                  >
                    {project.status || "Pending"}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                  {project.title || "Untitled Project"}
                </h3>

                <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-grow">
                  {project.description || "No description provided."}
                </p>

                <div className="pt-4 border-t border-slate-100 mt-auto space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium mr-1">Student:</span>
                    {project.student?.name || "Unassigned"}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <User className="w-4 h-4 mr-2 text-purple-500" />
                    <span className="font-medium mr-1">Supervisor:</span>
                    {project.supervisor?.name || "Unassigned"}
                  </div>
                </div>

                <button className="mt-5 w-full btn-outline flex items-center justify-center text-sm">
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectsPage;
