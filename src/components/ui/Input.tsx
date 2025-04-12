import React from 'react';
import styled from 'styled-components';

export interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  label?: string;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  icon?: React.ReactNode;
}

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  width: 100%;
`;

const InputLabel = styled.label`
  font-size: 14px;
  margin-bottom: 6px;
  color: var(--text-color, #333);
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{ hasError?: boolean; hasIcon?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  padding-left: ${props => props.hasIcon ? '36px' : '12px'};
  font-size: 14px;
  border: 1px solid ${props => props.hasError ? 'var(--error-color, #e53935)' : 'var(--border-color, #ddd)'};
  border-radius: 4px;
  background-color: var(--input-bg, #fff);
  color: var(--text-color, #333);
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? 'var(--error-color, #e53935)' : 'var(--primary-color, #4a6cf7)'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(229, 57, 53, 0.2)' : 'rgba(74, 108, 247, 0.2)'};
  }
  
  &:disabled {
    background-color: var(--disabled-bg, #f5f5f5);
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  &::placeholder {
    color: var(--placeholder-color, #aaa);
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--icon-color, #666);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.div`
  color: var(--error-color, #e53935);
  font-size: 12px;
  margin-top: 4px;
`;

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  name,
  id,
  label,
  error,
  className,
  autoFocus = false,
  icon,
  ...props
}) => {
  return (
    <InputContainer className={className}>
      {label && <InputLabel htmlFor={id || name}>{label}{required && <span style={{ color: 'var(--error-color, #e53935)' }}>*</span>}</InputLabel>}
      <InputWrapper>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <StyledInput
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          name={name}
          id={id || name}
          autoFocus={autoFocus}
          hasError={!!error}
          hasIcon={!!icon}
          {...props}
        />
      </InputWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;
