import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownToLine,
  LayoutGrid,
  List,
  FileText,
  FileSpreadsheet,
  FileArchive,
  File,
} from "lucide-react";
// Make sure this path is correct for your project
import { getFiles, downloadTeacherFile } from "../../store/slices/teacherSlice";

const TeacherFiles = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const filesFromStore = useSelector((state) => state.teacher.files) || [];

  useEffect(() => {
    dispatch(getFiles());
  }, [dispatch]);

  const deriveTypeFormatName = (name) => {
    if (!name) return "other";
    const parts = name.split(".");
    return (parts[parts.length - 1] || "").toLowerCase();
  };

  const normalizeFile = (f) => {
    const type = deriveTypeFormatName(f.originalName) || f.fileType || "other";
    let category = "other";
    if (["pdf", "doc", "docx", "xls", "xlsx"].includes(type)) {
      category = "report";
    } else if (["jpg", "jpeg", "png", "gif"].includes(type)) {
      category = "image";
    } else if (["mp4", "mkv"].includes(type)) {
      category = "video";
    } else if (["mp3", "wav"].includes(type)) {
      category = "audio";
    }

    return {
      id: f._id,
      name: f.originalName,
      type: type.toUpperCase(),
      size: f.size || "-",
      student: f.studentName || "-",
      uploadDate: f.uploadedAt || f.createdAt || new Date().toISOString(),
      category,
      projectId: f.projectId || f.project?._id,
      fileId: f._id,
    };
  };

  const files = useMemo(
    () => (filesFromStore || []).map(normalizeFile),
    [filesFromStore],
  );

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-blue-500" />;
      case "ppt":
      case "pptx":
        return <FileSpreadsheet className="w-8 h-8 text-orange-500" />;
      case "zip":
      case "rar":
        return <FileArchive className="w-8 h-8 text-yellow-500" />;
      default:
        return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  // FIX: Properly memoized and structured filter logic
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchType = filterType === "all" || file.category === filterType;
      const matchSearch = (file.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [files, filterType, searchTerm]);

  const handleDownloadFile = async (file) => {
    // FIX: Corrected fileprojectId to file.projectId
    const res = await dispatch(
      downloadTeacherFile({ projectId: file.projectId, fileId: file.id }),
    ).then((res) => {
      const { blob } = res.payload;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name || "download");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  };

  const fileStats = [
    {
      label: "Total Files",
      count: files.length,
      bg: "bg-blue-50",
      text: "text-blue-600",
      value: "text-blue-700",
    },
    {
      label: "Reports",
      count: files.filter((f) => f.category === "report").length,
      bg: "bg-green-50",
      text: "text-green-600",
      value: "text-green-700",
    },
    {
      label: "Presentations",
      count: files.filter((f) => f.category === "presentation").length,
      bg: "bg-orange-50",
      text: "text-orange-600",
      value: "text-orange-700",
    },
    {
      label: "Code Files",
      count: files.filter((f) => f.category === "code").length,
      bg: "bg-purple-50",
      text: "text-purple-600",
      value: "text-purple-700",
    },
    {
      label: "Images",
      count: files.filter((f) => f.category === "image").length,
      bg: "bg-pink-50",
      text: "text-pink-600",
      value: "text-pink-700",
    },
  ];

  const tableHeadData = [
    "File Name",
    "Student",
    "Type",
    "Upload Date",
    "Actions",
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <div className="card-header">
            {/* FIX: justofy-between to justify-between */}
            <div className="flex justify-between items-center">
              <h1 className="card-title">Assigned Student Files</h1>
              <p className="card-subtitle">
                Manage files with and received from students
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <select
              className="input w-48"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Files</option>
              <option value="report">Reports</option>
              <option value="presentation">Presentation</option>
              <option value="code">Code</option>
              <option value="image">Images</option>
            </select>

            <input
              type="text"
              className="input w-56"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // FIX: Properly updating state
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FILE STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
          {fileStats.map((item, i) => {
            return (
              <div key={i} className={`${item.bg} p-4 rounded-lg`}>
                <p className={`text-sm ${item.text}`}>{item.label}</p>
                <p className={`text-2xl ${item.value} font-bold`}>
                  {item.count}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILES DISPLAY */}
      <div className="mt-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file) => (
              <div key={file.id} className="card">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="mb-3">{getFileIcon(file.type)}</div>
                  <h3
                    className="font-medium text-slate-800 mb-1 truncate w-full"
                    title={file.name}
                  >
                    {file.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-1">{file.student}</p>
                  <p className="text-xs text-slate-500 mb-1">{file.size}</p>
                  <p className="text-xs text-slate-500 mb-4">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2 w-full mt-auto">
                    <button
                      onClick={() => handleDownloadFile(file)}
                      // FIX: ArrowDownToLine and hover colors updated
                      className="rounded-lg text-white bg-blue-500 text-sm font-medium flex w-full items-center justify-center py-2.5 gap-2 hover:bg-blue-600 duration-300 transition-all"
                    >
                      <ArrowDownToLine size={18} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-x-auto">
            {" "}
            {/* FIX: overflow-x-auto */}
            <table className="min-w-full border-slate-200">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  {tableHeadData.map((t, index) => {
                    return (
                      <th
                        key={index}
                        className="py-3 px-4 text-left font-semibold"
                      >
                        {t}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => {
                  return (
                    <tr
                      key={file.id}
                      className="border-t hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <span className="font-medium">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{file.student}</td>
                      <td className="py-3 px-4">{file.type}</td>
                      <td className="py-3 px-4">
                        {/* FIX: uploadeDate to uploadDate */}
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className="btn-primary btn-small"
                          onClick={() => handleDownloadFile(file)}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherFiles;
