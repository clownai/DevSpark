import React from 'react';
import styled from 'styled-components';
import { User } from '../../types';

export interface HeaderProps {
  user?: User;
  onLogout?: () => void;
  onThemeToggle?: () => void;
  isDarkTheme?: boolean;
  projectName?: string;
  className?: string;
}

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background-color: var(--header-bg, #2c2c2c);
  color: var(--header-text, #fff);
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  
  .logo-icon {
    margin-right: 8px;
    font-size: 20px;
  }
`;

const ProjectName = styled.div`
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  font-weight: 400;
  font-size: 14px;
  color: var(--header-text-secondary, rgba(255, 255, 255, 0.8));
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--header-text-secondary, rgba(255, 255, 255, 0.8));
  font-size: 16px;
  padding: 8px;
  margin-left: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--header-text, #fff);
    background-color: var(--header-button-hover, rgba(255, 255, 255, 0.1));
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
  
  .user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: var(--primary-color, #4a6cf7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: white;
  }
  
  .user-name {
    font-size: 14px;
    max-width: 120px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onThemeToggle,
  isDarkTheme = true,
  projectName,
  className,
}) => {
  // Get user initials for avatar
  const getUserInitials = (name?: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <HeaderContainer className={className}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Logo>
          <i className="fas fa-code logo-icon"></i>
          DevSpark
        </Logo>
        {projectName && <ProjectName>{projectName}</ProjectName>}
      </div>
      
      <Actions>
        <ActionButton onClick={onThemeToggle} title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}>
          <i className={`fas ${isDarkTheme ? 'fa-sun' : 'fa-moon'}`}></i>
        </ActionButton>
        
        <ActionButton title="Settings">
          <i className="fas fa-cog"></i>
        </ActionButton>
        
        {user && (
          <UserInfo>
            <div className="user-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name || user.email} />
              ) : (
                getUserInitials(user.name)
              )}
            </div>
            <span className="user-name">{user.name || user.email}</span>
            
            {onLogout && (
              <ActionButton onClick={onLogout} title="Logout">
                <i className="fas fa-sign-out-alt"></i>
              </ActionButton>
            )}
          </UserInfo>
        )}
      </Actions>
    </HeaderContainer>
  );
};

export default Header;
