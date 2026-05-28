/**
 * Sidebar with dynamic navigation from ConfigProvider, collapse/expand toggle,
 * role badge, and tenant context display.
 * Navy-purple accent palette. No theme toggle.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import type { NavigationItem } from '@/types/config';
import {
  GraduationCap,
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  MessageSquare,
  UserPlus,
  Users,
  BookOpen,
  FileText,
  Briefcase,
  ClipboardCheck,
  CreditCard,
  HelpCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  LineChart,
  Receipt,
  Home,
  Clock,
  Bus,
  Bell,
  FolderOpen,
  Workflow,
  Shield,
  CheckSquare,
  Calendar,
  type LucideIcon,
} from 'lucide-react';

// ---------- Icon Lookup Map ----------

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  Calendar,
  MessageSquare,
  UserPlus,
  Users,
  BookOpen,
  FileText,
  Briefcase,
  ClipboardCheck,
  CheckSquare,
  CreditCard,
  HelpCircle,
  Settings,
  GraduationCap,
  Building2,
  LineChart,
  Receipt,
  Home,
  Clock,
  Bus,
  Bell,
  FolderOpen,
  Workflow,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
};

// ---------- Role Badge Colors ----------

// (Role badge removed from sidebar - user info now in top bar)

// ---------- Types ----------

export interface SidebarProps {
  navigationItems?: readonly NavigationItem[];
  tenantName?: string;
  userRole?: string;
  activeItemId?: string;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
  userName?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

// ---------- Helper: Resolve Icon ----------

function resolveIcon(iconName: string): React.ReactNode {
  const IconComponent = ICON_MAP[iconName];
  if (IconComponent) {
    return <IconComponent className="h-[18px] w-[18px]" />;
  }
  // Fallback to a generic icon
  return <FileText className="h-[18px] w-[18px]" />;
}

// ---------- Sidebar ----------

function Sidebar({
  navigationItems = [],
  tenantName = '',
  userRole: _userRole = '',
  activeItemId,
  onNavigate,
  onLogout: _onLogout,
  userName: _userName,
  collapsed = false,
  onCollapsedChange,
}: SidebarProps) {
  const location = useLocation();
  void location; // used for potential future routing checks
  const width = collapsed ? 'w-16' : 'w-60';

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-[#ECEDF3] bg-white transition-all duration-200',
        width
      )}
    >
      {/* Header - School name only */}
      <div className={cn('flex flex-col border-b border-[#ECEDF3] px-4 py-3', collapsed && 'items-center px-2 py-2')}>
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#363473]">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-[13px] font-bold text-[#1B1D3A] leading-tight truncate">
                {tenantName || 'School'}
              </h1>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Main navigation">
        <ul role="list" className="space-y-1">
          {(() => {
            let lastGroup = '';
            return navigationItems.map((item) => {
              const isActive = item.id === activeItemId;
              const showGroupHeader = !collapsed && item.group && item.group !== lastGroup;
              if (item.group) lastGroup = item.group;
              return (
                <React.Fragment key={item.id}>
                  {showGroupHeader && (
                    <li className="pt-4 pb-1 px-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A0A3BD]">{item.group}</span>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={() => item.path && onNavigate(item.path)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-all',
                        collapsed && 'justify-center px-0',
                        isActive
                          ? 'bg-[#363473] text-white shadow-sm'
                          : 'text-[#6E7191] hover:bg-[#F0F0F8] hover:text-[#363473]'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span
                        className={cn(
                          '[&>svg]:h-[18px] [&>svg]:w-[18px]',
                          isActive ? 'text-white' : 'text-[#A0A3BD] group-hover:text-[#363473]'
                        )}
                      >
                        {resolveIcon(item.icon)}
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  </li>
                </React.Fragment>
              );
            });
          })()}
        </ul>
      </nav>

      {/* Footer spacer */}
      <div className="border-t border-[#ECEDF3] px-3 py-2" />

      {/* Collapse Toggle */}
      {onCollapsedChange && (
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className="absolute right-0 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[#ECEDF3] bg-white shadow-sm hover:bg-[#F5F6FA] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-[#6E7191]" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-[#6E7191]" />
          )}
        </button>
      )}
    </aside>
  );
}

export { Sidebar };
