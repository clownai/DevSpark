// src/components/ui/Button.tsx
import React from 'react';
import styled from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const getButtonColors = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return {
        bg: '#4a6cf7',
        color: '#ffffff',
        hoverBg: '#3a5ce5',
        activeBg: '#2a4cd3',
      };
    case 'secondary':
      return {
        bg: '#f0f0f0',
        color: '#333333',
        hoverBg: '#e0e0e0',
        activeBg: '#d0d0d0',
      };
    case 'danger':
      return {
        bg: '#e53935',
        color: '#ffffff',
        hoverBg: '#d32f2f',
        activeBg: '#c62828',
      };
    case 'success':
      return {
        bg: '#43a047',
        color: '#ffffff',
        hoverBg: '#388e3c',
        activeBg: '#2e7d32',
      };
    case 'text':
      return {
        bg: 'transparent',
        color: '#4a6cf7',
        hoverBg: 'rgba(74, 108, 247, 0.1)',
        activeBg: 'rgba(74, 108, 247, 0.2)',
      };
    default:
      return {
        bg: '#4a6cf7',
        color: '#ffffff',
        hoverBg: '#3a5ce5',
        activeBg: '#2a4cd3',
      };
  }
};

const getButtonSize = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return {
        padding: '6px 12px',
        fontSize: '0.875rem',
      };
    case 'medium':
      return {
        padding: '8px 16px',
        fontSize: '1rem',
      };
    case 'large':
      return {
        padding: '12px 24px',
        fontSize: '1.125rem',
      };
    default:
      return {
        padding: '8px 16px',
        fontSize: '1rem',
      };
  }
};

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  outline: none;
  position: relative;
  
  ${({ variant = 'primary' }) => {
    const colors = getButtonColors(variant);
    return `
      background-color: ${colors.bg};
      color: ${colors.color};
      
      &:hover:not(:disabled) {
        background-color: ${colors.hoverBg};
      }
      
      &:active:not(:disabled) {
        background-color: ${colors.activeBg};
      }
    `;
  }}
  
  ${({ size = 'medium' }) => {
    const sizeStyles = getButtonSize(size);
    return `
      padding: ${sizeStyles.padding};
      font-size: ${sizeStyles.fontSize};
    `;
  }}
  
  ${({ fullWidth }) => fullWidth && `
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...rest
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {leftIcon && <span className="button-left-icon">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="button-right-icon">{rightIcon}</span>}
        </>
      )}
    </StyledButton>
  );
};

export default Button;
