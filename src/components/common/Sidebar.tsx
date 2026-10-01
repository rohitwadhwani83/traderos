import React from 'react';
import { LayoutDashboard, BookOpen, LineChart, Sparkles, Settings } from 'lucide-react';

export type NavigationTab = 'dashboard' | 'journal' | 'analyse' | 'insights' | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal' as NavigationTab, label: 'Journal', icon: BookOpen },
    { id: 'analyse' as NavigationTab, label: 'Analyse', icon: LineChart },
    { id: 'insights' as NavigationTab, label: 'Insights', icon: Sparkles },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-56 bg-[#0c101a] border-r border-slate-800/80 p-3 select-none flex-shrink-0 min-h-[calc(100vh-49px)]">
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#151c2c] text-indigo-400 border border-indigo-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800/60 px-3">
        <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Data-backed trading intelligence enabled.
          </p>
        </div>
      </div>
    </aside>
  );
};
