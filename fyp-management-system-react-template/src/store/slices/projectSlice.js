import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// Fetch all projects for the Projects Page
export const fetchAllProjects = createAsyncThunk(
  "project/fetchAllProjects",
  async (_, thunkAPI) => {
    try {
      // Adjust this endpoint if your backend uses a different route (e.g., "/admin/projects")
      const res = await axiosInstance.get("/project");
      // Depending on your backend response structure, return the correct array
      return res.data.projects || res.data.data || res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch projects";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Download a specific project file
export const downloadProjectFile = createAsyncThunk(
  "project/downloadProjectFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/project/${projectId}/files/${fileId}/download`,
        { responseType: "blob" },
      );
      return { blob: res.data, projectId, fileId };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to download file";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const projectSlice = createSlice({
  name: "project",
  initialState: {
    list: [], // Matches state.project.list in ProjectsPage.jsx
    selected: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchAllProjects lifecycle
      .addCase(fetchAllProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload; // Saves backend array to Redux state
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default projectSlice.reducer;
