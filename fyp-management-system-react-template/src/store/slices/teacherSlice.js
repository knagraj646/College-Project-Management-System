import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios.js";
import { toast } from "react-toastify";

export const getTeacherDashboardStats = createAsyncThunk(
  "getTeacherDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/fetch-dashboard-stats");
      return res.data.data?.dashboardStats || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const getTeacherRequests = createAsyncThunk(
  "getTeacherRequests",
  async (supervisorId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/requests?supervisor=${supervisorId}`,
      );
      return res.data.data?.requests || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch requests");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const acceptRequests = createAsyncThunk(
  "acceptRequests",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/teacher/requests/${requestId}/accept`,
      );
      toast.success(res.data.message || "Request accepted successfully");
      return res.data.data?.request || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to accept requests");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const rejectRequest = createAsyncThunk(
  "rejectRequests",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/teacher/requests/${requestId}/reject`,
      );
      toast.success(res.data.message || "Request rejected successfully");
      return res.data.data?.request || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to reject requests");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const markComplete = createAsyncThunk(
  "markComplete",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/mark-complete/${projectId}`, // ✅ FIXED: projectIdt → projectId
      );
      toast.success(res.data.message || "Marked Completed");
      return { projectId };
    } catch (error) {
      toast.error(error.response.data.message || "Failed to mark complete");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const downloadTeacherFile = createAsyncThunk(
  "downloadTeacherFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/download/${projectId}/${fileId}`,
        {
          responseType: "blob",
        },
      );
      return { blob: res.data, projectId, fileId };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download file");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getFiles = createAsyncThunk(
  "getTeacherFiles",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/teacher/files`); // ✅ FIXED: /teacher/fies → /teacher/files
      return res.data?.data?.files || "Failed to fetch teacher files";
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download file");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const addFeedback = createAsyncThunk(
  "addFeedback",
  async ({ projectId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/feedback/${projectId}`, // ✅ FIXED: projectIdt → projectId
        payload,
      );
      toast.success(res.data.message || "Feedback posted");
      return {
        projectId,
        feedback: res.data.data?.feedback || res.data.data || res.data,
      };
    } catch (error) {
      toast.error(error.response.data.message || "Failed to post feedback");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const getAssignedStudents = createAsyncThunk(
  "getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      // FIX: Changed "/assigned-Students" to "/assignedStudents"
      const res = await axiosInstance.get(`/teacher/assignedStudents`);

      return res.data.data?.students || res.data.data || res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch assigned students",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    files: [],
    pendingRequests: [],
    dashboardStats: null,
    loading: false,
    error: null,
    list: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAssignedStudents.fulfilled, (state, action) => {
      state.loading = false;
      state.assignedStudents = action.payload?.students || action.payload || [];
    });
    builder.addCase(getAssignedStudents.pending, (state, action) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAssignedStudents.rejected, (state, action) => {
      state.error = action.payload || "Failed to fetch assigned students";
      state.loading = false;
    });
    builder.addCase(addFeedback.fulfilled, (state, action) => {
      const { projectId, feedback } = action.payload;
      state.assignedStudents = state.assignedStudents.map((s) =>
        s.projectId === projectId ? { ...s, feedback } : s,
      );
    });
    builder.addCase(markComplete.fulfilled, (state, action) => {
      const { projectId } = action.payload;
      state.assignedStudents = state.assignedStudents.map((s) => {
        if (s.project._id === projectId) {
          return {
            ...s,
            project: {
              ...s.project,
              status: "Completed",
            },
          };
        }
        return s;
      });
    });
    builder.addCase(getFiles.fulfilled, (state, action) => {
      state.dashboardStats = action.payload?.files || action.payload || [];
    });
    builder.addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
      state.dashboardStats = action.payload;
    });
    builder.addCase(getTeacherRequests.fulfilled, (state, action) => {
      // ✅ FIXED: getTeacherRequest → getTeacherRequests
      state.list = action.payload?.requests || action.payload;
    });
    builder.addCase(acceptRequests.fulfilled, (state, action) => {
      // ✅ FIXED: acceptRequest → acceptRequests
      const updatedRequest = action.payload;
      state.list = state.list.map((request) =>
        request._id === updatedRequest._id ? updatedRequest : request,
      );
    });
    builder.addCase(rejectRequest.fulfilled, (state, action) => {
      const rejectedRequest = action.payload;
      state.list = state.list.filter((request) =>
        request._id !== rejectedRequest._id ? rejectedRequest : request,
      );
    });
  },
});

export default teacherSlice.reducer;
