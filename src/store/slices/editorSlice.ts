// src/store/slices/editorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EditorState } from '../../types';

const initialState: EditorState = {
  currentFile: undefined,
  openFiles: [],
  editorTheme: 'dark',
  fontSize: 14
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCurrentFile: (state, action: PayloadAction<string>) => {
      state.currentFile = action.payload;
      if (!state.openFiles.includes(action.payload)) {
        state.openFiles.push(action.payload);
      }
    },
    openFile: (state, action: PayloadAction<string>) => {
      if (!state.openFiles.includes(action.payload)) {
        state.openFiles.push(action.payload);
      }
      state.currentFile = action.payload;
    },
    closeFile: (state, action: PayloadAction<string>) => {
      state.openFiles = state.openFiles.filter(file => file !== action.payload);
      if (state.currentFile === action.payload) {
        state.currentFile = state.openFiles.length > 0 ? state.openFiles[0] : undefined;
      }
    },
    setEditorTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.editorTheme = action.payload;
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    }
  }
});

export const { setCurrentFile, openFile, closeFile, setEditorTheme, setFontSize } = editorSlice.actions;

export default editorSlice.reducer;
