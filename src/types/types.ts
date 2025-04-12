// Define common types for the application
// This file contains shared type definitions used across the application

// User related types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  error?: string;
}

// File system related types
export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: string;
  type?: string;
  extension?: string | null; // Added for test compatibility
}

// File operation types
export enum FileOperation {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  RENAME = 'rename',
  COPY = 'copy',
  MOVE = 'move'
}

// API related types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  files?: FileEntry[]; // Added for test compatibility
  content?: string; // Added for test compatibility
}

// Editor related types
export interface EditorState {
  currentFile?: string;
  openFiles: string[];
  editorTheme: 'light' | 'dark';
  fontSize: number;
}

// Project related types
export interface Project {
  id: string;
  name: string;
  path: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'other';
  created_at: string;
  updated_at: string;
}
