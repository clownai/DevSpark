import React from 'react';
import styled from 'styled-components';

export interface ButtonProps {
  primary?: boolean;
  size?: 'small' | 'medium' | 'large';
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  className?: string;
}

const StyledButton = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  border: 0;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.2s ease-in-out;
  
  /* Size variations */
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return '12px';
      case 'large':
        return '16px';
      default:
        return '14px';
    }
  }};
  
  padding: ${props => {
    switch (props.size) {
      case 'small':
        return '6px 12px';
      case 'large':
        return '12px 24px';
      default:
        return '8px 16px';
    }
  }};
  
  /* Primary/Secondary variations */
  background-color: ${props => props.primary ? 'var(--primary-color, #4a6cf7)' : 'var(--secondary-bg, #f5f5f5)'};
  color: ${props => props.primary ? 'white' : 'var(--text-color, #333)'};
  
  &:hover {
    background-color: ${props => props.primary 
      ? 'var(--primary-hover, #3a5ce7)' 
      : 'var(--secondary-hover, #e5e5e5)'};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  /* Icon styling */
  .button-icon {
    margin-right: ${props => props.label ? '8px' : '0'};
  }
`;

const Button: React.FC<ButtonProps> = ({
  primary = false,
  size = 'medium',
  label,
  onClick,
  disabled = false,
  type = 'button',
  icon,
  className,
  ...props
}) => {
  return (
    <StyledButton
      type={type}
      primary={primary}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
      label={label}
      {...props}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {label}
    </StyledButton>
  );
};

export default Button;
