import React from 'react';
import { AppTab } from '../types';
import { MessageCircle, FileText, BookOpen, ImageIcon } from 'lucide-react';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const NAV_ITEMS = [
  { id: AppTab.Chat, label: '諮詢', icon: MessageCircle },
  { id: AppTab.Scene, label: '場景', icon: ImageIcon },
  { id: AppTab.Cases, label: '案例', icon: BookOpen },
  { id: AppTab.Report, label: '通報', icon: FileText },
] as const;

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => (
  <nav className="app-tabbar" aria-label="主要導覽">
    <div className="app-tabbar-inner">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`app-tab ${isActive ? 'app-tab-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="app-tab-icon-wrap">
              <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
              {isActive && <span className="app-tab-indicator" aria-hidden />}
            </span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default Navigation;
