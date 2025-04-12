import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';
import { User } from '../../types';

export interface MainLayoutProps {
  children: ReactNode;
  user?: User;
  onLogout?: () => void;
  onThemeToggle?: () => void;
  isDarkTheme?: boolean;
  projectName?: string;
  sidebarItems?: Array<{
    id: string;
    label: string;
    icon: string;
    onClick?: () => void;
    active?: boolean;
  }>;
  className?: string;
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--app-bg, #f5f5f5);
  color: var(--text-color, #333);
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  overflow: auto;
  padding: 16px;
`;

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  user,
  onLogout,
  onThemeToggle,
  isDarkTheme = true,
  projectName,
  sidebarItems = [],
  className,
}) => {
  return (
    <LayoutContainer className={className}>
      <Header 
        user={user}
        onLogout={onLogout}
        onThemeToggle={onThemeToggle}
        isDarkTheme={isDarkTheme}
        projectName={projectName}
      />
      
      <ContentContainer>
        <Sidebar items={sidebarItems} />
        <MainContent>{children}</MainContent>
      </ContentContainer>
    </LayoutContainer>
  );
};

export default MainLayout;
