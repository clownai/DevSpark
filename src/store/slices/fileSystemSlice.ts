// src/store/slices/fileSystemSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { FileEntry } from '../../types';

interface FileSystemState {
  currentDirectory: string;
  files: FileEntry[];
  selectedFile: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FileSystemState = {
  currentDirectory: '/',
  files: [],
  selectedFile: null,
  isLoading: false,
  error: null
};

// Async thunks for file system operations
export const fetchFiles = createAsyncThunk(
  'fileSystem/fetchFiles',
  async (directory: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(directory)}`);
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to fetch files');
      }
      
      return { directory, files: data.files as FileEntry[] };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch files');
    }
  }
);

export const createFile = createAsyncThunk(
  'fileSystem/createFile',
  async ({ path, content }: { path: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(path)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to create file');
      }
      
      return path;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create file');
    }
  }
);

export const deleteFile = createAsyncThunk(
  'fileSystem/deleteFile',
  async (path: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return rejectWithValue(data.message || 'Failed to delete file');
      }
      
      return path;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete file');
    }
  }
);

export const fileSystemSlice = createSlice({
  name: 'fileSystem',
  initialState,
  reducers: {
    setCurrentDirectory: (state, action: PayloadAction<string>) => {
      state.currentDirectory = action.payload;
    },
    selectFile: (state, action: PayloadAction<string>) => {
      state.selectedFile = action.payload;
    },
    clearSelectedFile: (state) => {
      state.selectedFile = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchFiles
      .addCase(fetchFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDirectory = action.payload.directory;
        state.files = action.payload.files;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // createFile
      .addCase(createFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFile.fulfilled, (state) => {
        state.isLoading = false;
        // We'll refetch the directory to get the updated file list
      })
      .addCase(createFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // deleteFile
      .addCase(deleteFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.selectedFile === action.payload) {
          state.selectedFile = null;
        }
        // We'll refetch the directory to get the updated file list
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCurrentDirectory, selectFile, clearSelectedFile, clearError } = fileSystemSlice.actions;

export default fileSystemSlice.reducer;
