import React from 'react';
import styled from 'styled-components';

export interface SidebarItemProps {
  id: string;
  label: string;
  icon: string;
  onClick?: () => void;
  active?: boolean;
}

export interface SidebarProps {
  items: SidebarItemProps[];
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarContainer = styled.aside<{ collapsed?: boolean }>`
  width: ${props => props.collapsed ? '48px' : '220px'};
  height: 100%;
  background-color: var(--sidebar-bg, #1e1e1e);
  color: var(--sidebar-text, #fff);
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div<{ collapsed?: boolean }>`
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'space-between'};
  padding: ${props => props.collapsed ? '0' : '0 16px'};
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: var(--sidebar-text-secondary, rgba(255, 255, 255, 0.6));
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--sidebar-button-hover, rgba(255, 255, 255, 0.1));
    color: var(--sidebar-text, #fff);
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  padding: 8px 0;
`;

const SidebarItemContainer = styled.div<{ active?: boolean; collapsed?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${props => props.collapsed ? '12px 0' : '12px 16px'};
  cursor: pointer;
  background-color: ${props => props.active ? 'var(--sidebar-item-active-bg, rgba(255, 255, 255, 0.1))' : 'transparent'};
  color: ${props => props.active ? 'var(--sidebar-text, #fff)' : 'var(--sidebar-text-secondary, rgba(255, 255, 255, 0.6))'};
  border-left: ${props => props.active ? '3px solid var(--primary-color, #4a6cf7)' : '3px solid transparent'};
  transition: all 0.2s ease;
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  
  &:hover {
    background-color: var(--sidebar-item-hover-bg, rgba(255, 255, 255, 0.05));
    color: var(--sidebar-text, #fff);
  }
  
  .item-icon {
    font-size: 16px;
    min-width: 20px;
    text-align: center;
    margin-right: ${props => props.collapsed ? '0' : '12px'};
  }
  
  .item-label {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: ${props => props.collapsed ? 'none' : 'block'};
  }
`;

const SidebarItem: React.FC<SidebarItemProps & { collapsed?: boolean }> = ({
  id,
  label,
  icon,
  onClick,
  active = false,
  collapsed = false,
}) => {
  return (
    <SidebarItemContainer 
      active={active} 
      onClick={onClick}
      collapsed={collapsed}
    >
      <i className={`${icon} item-icon`}></i>
      <span className="item-label">{label}</span>
    </SidebarItemContainer>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  items,
  className,
  collapsed = false,
  onToggleCollapse,
}) => {
  return (
    <SidebarContainer className={className} collapsed={collapsed}>
      <SidebarHeader collapsed={collapsed}>
        {!collapsed && <span>Navigation</span>}
        <CollapseButton onClick={onToggleCollapse}>
          <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
        </CollapseButton>
      </SidebarHeader>
      
      <SidebarContent>
        {items.map(item => (
          <SidebarItem 
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            onClick={item.onClick}
            active={item.active}
            collapsed={collapsed}
          />
        ))}
      </SidebarContent>
    </SidebarContainer>
  );
};

export default Sidebar;
