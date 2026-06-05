import React from 'react';
import { AppTab } from '../types';
import { TAB_META } from '../constants/navigation';
import { BOT_AVATAR_URL } from '../constants';
import { Mail } from 'lucide-react';

interface HeaderProps {
  activeTab: AppTab;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const meta = TAB_META[activeTab];

  return (
    <header className="app-header">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 shadow-sm">
            <img src={BOT_AVATAR_URL} alt="" className="w-7 h-7 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-brand-600 tracking-wide uppercase">清華小安</p>
            <h1 className="app-large-title truncate">{meta.title}</h1>
            <p className="app-subtitle truncate">{meta.subtitle}</p>
          </div>
        </div>
        <a
          href="mailto:gencom@my.nthu.edu.tw"
          className="app-icon-btn shrink-0"
          aria-label="聯絡清大性平會"
        >
          <Mail size={18} aria-hidden />
        </a>
      </div>
    </header>
  );
};

export default Header;
