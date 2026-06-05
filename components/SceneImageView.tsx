import React, { useState, useCallback } from 'react';
import {
  buildSceneImagePrompt,
  generateSceneImage,
  reviseSceneImagePrompt,
} from '../services/openaiService';
import {
  Loader2,
  Check,
  Pencil,
  Download,
  RotateCcw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

type SceneStep = 'describe' | 'generating' | 'review' | 'revise' | 'confirmed';

interface SceneImageViewProps {
  initialDescription?: string;
  onDescriptionConsumed?: () => void;
}

const SceneImageView: React.FC<SceneImageViewProps> = ({
  initialDescription = '',
  onDescriptionConsumed,
}) => {
  const [step, setStep] = useState<SceneStep>('describe');
  const [situation, setSituation] = useState(initialDescription);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [revisionCount, setRevisionCount] = useState(0);

  React.useEffect(() => {
    if (initialDescription) {
      setSituation(initialDescription);
      onDescriptionConsumed?.();
    }
  }, [initialDescription, onDescriptionConsumed]);

  const runGenerate = useCallback(
    async (mode: 'initial' | 'revise') => {
      if (!situation.trim()) return;
      setStep('generating');
      setError(null);

      try {
        const prompt =
          mode === 'revise'
            ? await reviseSceneImagePrompt(situation, imagePrompt, revisionNotes)
            : await buildSceneImagePrompt(situation);

        setImagePrompt(prompt);
        setImageUrl(await generateSceneImage(prompt));
        if (mode === 'revise') {
          setRevisionCount((c) => c + 1);
          setRevisionNotes('');
        }
        setStep('review');
      } catch (e) {
        setError(e instanceof Error ? e.message : '生成失敗，請稍後再試。');
        setStep(mode === 'revise' ? 'revise' : 'describe');
      }
    },
    [situation, imagePrompt, revisionNotes]
  );

  const handleReset = () => {
    setStep('describe');
    setImagePrompt('');
    setImageUrl(null);
    setRevisionNotes('');
    setError(null);
    setRevisionCount(0);
  };

  return (
    <div className="app-screen-inner">
      <div className="app-banner-warm">
        <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden />
        <p>示意圖僅供個人整理參考；若觸及內容安全規範可能無法生成。</p>
      </div>

      {step === 'describe' && (
        <section className="space-y-4">
          <p className="app-section-label">描述情境</p>
          <div className="app-group">
            <div className="app-field !py-4">
              <textarea
                id="situation"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="例如：晚上十點左右，我獨自走在圖書館通往宿舍的林蔭道……"
                rows={6}
                className="app-textarea min-h-[140px]"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 text-center px-2" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => runGenerate('initial')}
            disabled={!situation.trim()}
            className="app-btn-primary"
          >
            <Sparkles size={18} aria-hidden />
            生成場景示意圖
          </button>
        </section>
      )}

      {step === 'generating' && (
        <div className="app-group flex flex-col items-center gap-3 py-16 text-slate-500" role="status">
          <Loader2 size={36} className="animate-spin text-brand-600" aria-hidden />
          <p className="text-sm">分析情境並繪製中，約 15–30 秒…</p>
        </div>
      )}

      {step === 'review' && imageUrl && (
        <section className="space-y-4 animate-fade-in">
          <p className="text-sm font-medium text-slate-700 px-1">
            請確認是否符合記憶中的場景
            {revisionCount > 0 && (
              <span className="text-slate-400 font-normal"> · 已修改 {revisionCount} 次</span>
            )}
          </p>
          <div className="app-group overflow-hidden p-1">
            <img src={imageUrl} alt="情境場景示意圖" className="w-full h-auto rounded-xl" />
          </div>
          <details className="text-xs text-slate-500 px-1">
            <summary className="py-1">繪圖描述（進階）</summary>
            <p className="mt-2 p-3 rounded-xl bg-slate-100 text-slate-600 leading-relaxed">{imagePrompt}</p>
          </details>
          <button type="button" onClick={() => setStep('confirmed')} className="app-btn-primary">
            <Check size={18} aria-hidden />
            確認，符合情境
          </button>
          <button type="button" onClick={() => setStep('revise')} className="app-btn-secondary">
            <Pencil size={18} aria-hidden />
            需要修改
          </button>
        </section>
      )}

      {step === 'revise' && (
        <section className="space-y-4">
          {imageUrl && (
            <div className="app-group p-1">
              <img src={imageUrl} alt="" className="w-full max-h-40 object-cover rounded-xl opacity-95" />
            </div>
          )}
          <p className="app-section-label">修改意見</p>
          <div className="app-group">
            <div className="app-field !py-4">
              <textarea
                id="revision"
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="例如：光線再暗一些、改為室內走廊……"
                rows={4}
                className="app-textarea"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 text-center" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => runGenerate('revise')}
            disabled={!revisionNotes.trim()}
            className="app-btn-primary"
          >
            <Sparkles size={18} aria-hidden />
            重新生成
          </button>
          <button type="button" onClick={() => setStep('review')} className="app-btn-ghost w-full">
            返回預覽
          </button>
        </section>
      )}

      {step === 'confirmed' && imageUrl && (
        <section className="space-y-4">
          <div className="app-banner-info !py-3">
            <Check size={18} className="shrink-0" aria-hidden />
            <span className="font-semibold">已確認場景示意圖</span>
          </div>
          <div className="app-group p-1">
            <img src={imageUrl} alt="已確認的示意圖" className="w-full rounded-xl" />
          </div>
          <a
            href={imageUrl}
            download="nthu-guardian-scene.png"
            target="_blank"
            rel="noopener noreferrer"
            className="app-btn-secondary"
          >
            <Download size={18} aria-hidden />
            下載示意圖
          </a>
          <button type="button" onClick={handleReset} className="app-btn-ghost w-full">
            <RotateCcw size={16} aria-hidden />
            重新描述新情境
          </button>
        </section>
      )}
    </div>
  );
};

export default SceneImageView;
