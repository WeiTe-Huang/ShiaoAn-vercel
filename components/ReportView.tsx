import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ReportFormData } from '../types';
import { loadReportDraft, saveReportDraft } from '../utils/storage';
import {
  splitReportDateTime,
  joinReportDateTime,
  formatReportDateTimeDisplay,
} from '../utils/reportDateTime';
import { Mail, Calendar, MapPin, User, FileText, Info } from 'lucide-react';

const EMPTY_FORM: ReportFormData = {
  victimName: '',
  perpetratorName: '',
  dateTime: '',
  location: '',
  description: '',
};

const STEPS = [
  { title: '事件發生', desc: '確保自身安全，紀錄發生時間與地點。' },
  { title: '尋求協助', desc: '找信任的教職員工填寫「知會單」或直接聯繫性平會。' },
  { title: '性平會聯繫', desc: '收到知會後，性平會將主動聯繫當事人提供資源。' },
  { title: '調查申請（可選）', desc: '若決定正式立案，填寫調查申請書。' },
];

function loadInitialForm(): ReportFormData {
  const draft = loadReportDraft<ReportFormData>() ?? EMPTY_FORM;
  const { date, time } = splitReportDateTime(draft.dateTime);
  return {
    ...draft,
    dateTime: joinReportDateTime(date, time),
  };
}

const ReportView: React.FC = () => {
  const [formData, setFormData] = useState<ReportFormData>(loadInitialForm);
  const { date: eventDate, time: eventTime } = splitReportDateTime(formData.dateTime);

  useEffect(() => {
    saveReportDraft(formData);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDatePartChange = useCallback((part: 'date' | 'time', value: string) => {
    setFormData((prev) => {
      const current = splitReportDateTime(prev.dateTime);
      const nextDate = part === 'date' ? value : current.date;
      const nextTime = part === 'time' ? value : current.time;
      return { ...prev, dateTime: joinReportDateTime(nextDate, nextTime) };
    });
  }, []);

  const mailtoLink = useMemo(() => {
    const subject = encodeURIComponent('【性平事件通報】來自清華小安協助整理');
    const body = encodeURIComponent(
      `收件者：清大性平會 (gencom@my.nthu.edu.tw)\n\n` +
        `您好，這是一封由性騷擾防治助理協助使用者整理的通報草稿。\n\n` +
        `【事件基本資料】\n` +
        `被行為人（可匿名或不詳）：${formData.victimName || '不詳/匿名'}\n` +
        `行為人基本資料：${formData.perpetratorName || '不詳'}\n` +
        `事件發生時間：${formatReportDateTimeDisplay(formData.dateTime)}\n` +
        `事件發生地點：${formData.location || '未提供'}\n\n` +
        `【事件概況描述】\n` +
        `${formData.description}\n\n` +
        `---\n此信件為自動生成，請確認內容無誤後寄出。`
    );
    return `mailto:gencom@my.nthu.edu.tw?subject=${subject}&body=${body}`;
  }, [formData]);

  return (
    <div className="app-screen-inner">
      <div className="app-banner-info">
        <Info size={18} className="shrink-0 text-brand-600 mt-0.5" aria-hidden />
        <p>資料僅暫存於本機。產生草稿後將開啟郵件 App，由您決定是否寄出。</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        <section>
          <p className="app-section-label">當事人資料</p>
          <div className="app-group">
            <div className="app-field">
              <label htmlFor="victimName" className="app-field-label">
                <User size={13} aria-hidden /> 被行為人（您）
              </label>
              <input
                id="victimName"
                type="text"
                name="victimName"
                value={formData.victimName}
                onChange={handleChange}
                placeholder="可填寫姓名或「匿名」"
                className="app-input"
              />
            </div>
            <div className="app-field">
              <label htmlFor="perpetratorName" className="app-field-label">
                <User size={13} aria-hidden /> 行為人（對方）
              </label>
              <input
                id="perpetratorName"
                type="text"
                name="perpetratorName"
                value={formData.perpetratorName}
                onChange={handleChange}
                placeholder="姓名、特徵或稱呼"
                className="app-input"
              />
            </div>
          </div>
        </section>

        <section>
          <p className="app-section-label">時間與地點</p>
          <div className="app-group">
            <div className="app-field">
              <span className="app-field-label" id="event-datetime-label">
                <Calendar size={13} aria-hidden /> 發生時間
              </span>
              <div
                className="app-datetime-fields"
                role="group"
                aria-labelledby="event-datetime-label"
              >
                <input
                  id="eventDate"
                  type="date"
                  name="eventDate"
                  value={eventDate}
                  onChange={(e) => handleDatePartChange('date', e.target.value)}
                  className="app-input-date"
                  autoComplete="off"
                />
                <input
                  id="eventTime"
                  type="time"
                  name="eventTime"
                  value={eventTime}
                  onChange={(e) => handleDatePartChange('time', e.target.value)}
                  className="app-input-time"
                  step={60}
                  autoComplete="off"
                />
              </div>
              <p className="app-datetime-hint">可先選日期，再選時間；僅日期亦可。</p>
            </div>
            <div className="app-field">
              <label htmlFor="location" className="app-field-label">
                <MapPin size={13} aria-hidden /> 發生地點
              </label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="如：圖書館、宿舍、實驗室"
                className="app-input"
              />
            </div>
          </div>
        </section>

        <section>
          <p className="app-section-label">事件描述</p>
          <div className="app-group">
            <div className="app-field">
              <label htmlFor="description" className="app-field-label">
                <FileText size={13} aria-hidden /> 事件概況
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="請簡述發生經過、對方的言語或行為，以及您的感受…"
                className="app-textarea"
              />
            </div>
          </div>
        </section>

        <a href={mailtoLink} className="app-btn-primary">
          <Mail size={18} aria-hidden />
          產生 Email 草稿
        </a>
      </form>

      <section>
        <p className="app-section-label">通報流程</p>
        <div className="app-group-inset p-4 space-y-0">
          {STEPS.map((step, index) => (
            <div key={step.title} className={`app-step ${index < STEPS.length - 1 ? 'pb-5' : ''}`}>
              <div className="app-step-line">
                <span className="app-step-dot" aria-hidden />
                {index < STEPS.length - 1 && <span className="app-step-connector" aria-hidden />}
              </div>
              <div className="min-w-0 pt-0.5">
                <h4 className="text-sm font-semibold text-slate-800">{step.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ReportView;
