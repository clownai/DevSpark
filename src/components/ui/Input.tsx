// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';
import styled from 'styled-components';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const InputLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{ hasError?: boolean; hasLeftIcon?: boolean; hasRightIcon?: boolean }>`
  padding: 10px 12px;
  font-size: 1rem;
  border: 1px solid ${({ hasError }) => (hasError ? '#e53935' : '#e0e0e0')};
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  width: 100%;
  
  ${({ hasLeftIcon }) => hasLeftIcon && 'padding-left: 36px;'}
  ${({ hasRightIcon }) => hasRightIcon && 'padding-right: 36px;'}
  
  &:focus {
    border-color: ${({ hasError }) => (hasError ? '#e53935' : '#4a6cf7')};
    box-shadow: 0 0 0 2px ${({ hasError }) => (hasError ? 'rgba(229, 57, 53, 0.2)' : 'rgba(74, 108, 247, 0.2)')};
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const IconContainer = styled.div<{ position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ position }) => (position === 'left' ? 'left: 12px;' : 'right: 12px;')}
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.div`
  color: #e53935;
  font-size: 0.75rem;
  margin-top: 4px;
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth, leftIcon, rightIcon, ...rest }, ref) => {
    return (
      <InputContainer fullWidth={fullWidth}>
        {label && <InputLabel>{label}</InputLabel>}
        <InputWrapper>
          {leftIcon && <IconContainer position="left">{leftIcon}</IconContainer>}
          <StyledInput
            ref={ref}
            hasError={!!error}
            hasLeftIcon={!!leftIcon}
            hasRightIcon={!!rightIcon}
            aria-invalid={!!error}
            {...rest}
          />
          {rightIcon && <IconContainer position="right">{rightIcon}</IconContainer>}
        </InputWrapper>
        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input;
