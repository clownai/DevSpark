// src/components/layout/MainLayout.tsx
import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  overflow: auto;
  background-color: #252526;
  color: #e0e0e0;
`;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [showCreateFileModal, setShowCreateFileModal] = React.useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = React.useState(false);
  
  const handleCreateFile = () => {
    setShowCreateFileModal(true);
  };
  
  const handleCreateFolder = () => {
    setShowCreateFolderModal(true);
  };
  
  return (
    <LayoutContainer>
      <Header />
      <ContentContainer>
        <Sidebar 
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
        />
        <MainContent>{children}</MainContent>
      </ContentContainer>
      
      {/* Modals would be implemented here */}
    </LayoutContainer>
  );
};

export default MainLayout;
