import React from 'react';
import { CASE_STUDIES } from '../data/caseStudies';
import { ShieldAlert } from 'lucide-react';

const CaseStudiesView: React.FC = () => (
  <div className="app-screen-inner">
    <div className="app-banner-warm">
      <ShieldAlert size={18} className="shrink-0 mt-0.5" aria-hidden />
      <div>
        <p className="font-semibold">重要聲明</p>
        <p className="mt-1 opacity-90 leading-relaxed">
          只要您感到不舒服，就有權利尋求協助與通報。您的主觀感受非常重要。
        </p>
      </div>
    </div>

    <p className="text-sm text-slate-500 px-1 leading-relaxed">
      共 {CASE_STUDIES.length} 則模擬情境，僅供理解類型與求助方向參考。
    </p>

    <div className="space-y-4">
      {CASE_STUDIES.map((item) => (
        <article key={item.id} className="app-case-card">
          <div className="app-case-header">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug pr-2">{item.title}</h3>
            <span className="app-badge shrink-0">{item.category}</span>
          </div>
          <div className="app-case-body">{item.description}</div>
        </article>
      ))}
    </div>
  </div>
);

export default CaseStudiesView;
