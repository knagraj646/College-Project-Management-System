import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Archive, File, FileCode, FilePlus, FileText } from "lucide-react";

import { downloadFile, fetchProject } from "../../store/slices/studentSlice";

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, files } = useSelector((state) => state.student);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);
  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [dispatch]);
  const handleFilePick = (e) => {
    const list = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };
  const handleUpload = (e) => {
    let activeProject = project;
    if (!activeProject) {
      const action = dispatch(fetchProject());
      if (fetchProject.fulfilled.match(action)) {
        activeProject = action.payload?.project || action.payload;
      }
    }
    if (selectedFiles.length === 0) return;
    dispatch(UploadFiles({ project: project?._id, files: selectedFiles }));
    setSelectedFiles([]);
  };
  const removeSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };
  const getFileIcon = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    const Icon = ({ className }) => <File className={className} />;
    const color =
      extension == "pdf"
        ? "text-red-500"
        : ["doc", "docx"].includes(extension)
          ? "text-blue-500"
          : ["ppt", "pptx"].includes(extension)
            ? "text-yellow-500"
            : "text-green-500";

    return <Icon className={`w-8 h-8 ${color}`} />;
  };

  const handleDownloadFile = async (file) => {
    const res = await dispatch(
      downloadFile({ projectId: project._id, fileId: file._id }),
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

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Upload Project Files </h1>
            <p className="card-subtitle">
              Upload your project documents including report ,presentation and
              code files.
            </p>
          </div>
          {/* Upload section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="mb-4">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                Report
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Upload your project report (PDF,DOC)
              </p>
              <label className="btn-outline cursor-pointer">
                Choose File
                <input
                  type="file"
                  ref={reportRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFilePick}
                  multiple
                />
              </label>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="mb-4">
                <Archive className="w-12 h-12 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                Presentation
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Upload your presentation (PPT,PPTX,PDF)
              </p>
              <label className="btn-outline cursor-pointer">
                Choose File
                <input
                  type="file"
                  ref={presRef}
                  className="hidden"
                  accept=".pdf,.pptx,.ppt"
                  onChange={handleFilePick}
                  multiple
                />
              </label>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="mb-4">
                <FileCode className="w-12 h-12 text-slate-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                Code Files
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Upload your source code (ZIP,RAR)
              </p>
              <label className="btn-outline cursor-pointer">
                Choose File
                <input
                  type="file"
                  ref={codeRef}
                  className="hidden"
                  accept=".zip,.rar,.tar"
                  onChange={handleFilePick}
                  multiple
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button onClick={handleUpload} className="btn-primary">
              Upload Selected Files
            </button>
          </div>
        </div>
        {/* Selected files preview */}

        {selectedFiles.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Ready to Upload</h2>
            </div>
            <div className="space-y-3">
              {selectedFiles.map((file) => {
                return (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getFileIcon(file.name)}
                      <div>
                        <p className="font-medium text-slate-800">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>
                            {(file.size / (1024 * 1024)).toFixed(1)}MB
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn-danger btn-small"
                      onClick={() => removeSelected(file.name)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Uploaded files list */}

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Uploaded Files</h2>
            <p className="card-subtitle ">Manage your uploaded project files</p>
          </div>
          {(files || []).length === 0 ? (
            <div className="text-center py-4">
              <FilePlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file._id || file.fileUrl}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {" "}
                    {getFileIcon(file.originalName)}
                    <div>
                      <p className="font-medium text-slate-800">
                        {file.originalName}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 ">
                        <span>{file.fileType || "File"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-outline btn-small onClick={() => handleDownloadFile(file)}">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadFiles;
