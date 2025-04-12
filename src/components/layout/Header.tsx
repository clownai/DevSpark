// src/components/layout/Header.tsx
import React from 'react';
import styled from 'styled-components';
import { useAppSelector, useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import Button from '../ui/Button';

const HeaderContainer = styled.header`
  height: 60px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #333;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #4a6cf7;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoIcon = styled.span`
  font-size: 1.8rem;
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #4a6cf7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
`;

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logoutUser());
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <HeaderContainer>
      <Logo>
        <LogoIcon>⚡</LogoIcon>
        DevSpark IDE
      </Logo>
      
      <NavActions>
        {isAuthenticated && user ? (
          <>
            <UserInfo>
              <Avatar>{user.name ? getInitials(user.name) : 'U'}</Avatar>
              <span>{user.name || user.email}</span>
            </UserInfo>
            <Button variant="text" size="small" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button variant="primary" size="small">
            Login
          </Button>
        )}
      </NavActions>
    </HeaderContainer>
  );
};

export default Header;
