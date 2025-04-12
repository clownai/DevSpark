// src/components/layout/Sidebar.tsx
import React from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchFiles, setCurrentDirectory, selectFile } from '../../store/slices/fileSystemSlice';
import { openFile } from '../../store/slices/editorSlice';
import Button from '../ui/Button';

const SidebarContainer = styled.div`
  width: 250px;
  height: 100%;
  background-color: #1e1e1e;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
`;

const SidebarHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
`;

const FileExplorer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const DirectoryItem = styled.div<{ isSelected: boolean }>`
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ isSelected }) => (isSelected ? '#2a2d2e' : 'transparent')};
  
  &:hover {
    background-color: #2a2d2e;
  }
`;

const FileItem = styled.div<{ isSelected: boolean }>`
  padding: 8px 16px 8px 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ isSelected }) => (isSelected ? '#2a2d2e' : 'transparent')};
  
  &:hover {
    background-color: #2a2d2e;
  }
`;

const FolderIcon = styled.span`
  color: #e9b44c;
`;

const FileIcon = styled.span`
  color: #9cdcfe;
`;

const SidebarFooter = styled.div`
  padding: 16px;
  border-top: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

interface SidebarProps {
  onCreateFile: () => void;
  onCreateFolder: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCreateFile, onCreateFolder }) => {
  const dispatch = useAppDispatch();
  const { currentDirectory, files, selectedFile } = useAppSelector(state => state.fileSystem);
  const { currentFile } = useAppSelector(state => state.editor);
  
  React.useEffect(() => {
    dispatch(fetchFiles(currentDirectory));
  }, [dispatch, currentDirectory]);
  
  const handleDirectoryClick = (directory: string) => {
    dispatch(setCurrentDirectory(directory));
  };
  
  const handleFileClick = (file: string) => {
    dispatch(selectFile(file));
    dispatch(openFile(file));
  };
  
  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarTitle>Explorer</SidebarTitle>
      </SidebarHeader>
      
      <FileExplorer>
        {files.map((file) => (
          file.isDirectory ? (
            <DirectoryItem 
              key={file.path}
              isSelected={selectedFile === file.path}
              onClick={() => handleDirectoryClick(file.path)}
            >
              <FolderIcon>📁</FolderIcon>
              {file.name}
            </DirectoryItem>
          ) : (
            <FileItem 
              key={file.path}
              isSelected={currentFile === file.path}
              onClick={() => handleFileClick(file.path)}
            >
              <FileIcon>📄</FileIcon>
              {file.name}
            </FileItem>
          )
        ))}
      </FileExplorer>
      
      <SidebarFooter>
        <Button 
          variant="secondary" 
          size="small" 
          fullWidth 
          onClick={onCreateFile}
          leftIcon={<span>+</span>}
        >
          New File
        </Button>
        <Button 
          variant="secondary" 
          size="small" 
          fullWidth 
          onClick={onCreateFolder}
          leftIcon={<span>+</span>}
        >
          New Folder
        </Button>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
