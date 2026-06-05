import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { ChatMessage } from '../types';
import { PRESET_QUESTIONS, BOT_AVATAR_URL } from '../constants';
import { sendChatMessage, isOpenAIConfigured } from '../services/openaiService';
import { toOpenAIHistory, extractSituationFromChat } from '../utils/chat';
import { Send, User, Loader2, ImageIcon } from 'lucide-react';
import ChatMarkdown from './ChatMarkdown';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: '你好，我是清華小安。我會在這裡陪著你，聽你說話。無論發生了什麼事，這裡都是安全的空間。你想先聊聊發生了什麼嗎？或者想詢問關於通報的流程呢？',
  timestamp: new Date(),
};

interface ChatViewProps {
  onCreateScene?: (description: string) => void;
}

const MessageBubble = memo(function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex items-end max-w-[88%] gap-2 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isUser ? 'bg-slate-300/80' : 'bg-white border border-slate-200/80 shadow-sm'
          }`}
          aria-hidden
        >
          {isUser ? (
            <User size={14} className="text-slate-600" />
          ) : (
            <img src={BOT_AVATAR_URL} alt="" className="w-6 h-6 object-contain" />
          )}
        </div>
        <div className={isUser ? 'app-bubble-user' : 'app-bubble-bot'}>
          {isUser ? (
            <span className="whitespace-pre-wrap break-words">{msg.text}</span>
          ) : (
            <ChatMarkdown text={msg.text} />
          )}
        </div>
      </div>
    </div>
  );
});

const ChatView: React.FC<ChatViewProps> = ({ onCreateScene }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isComposingRef = useRef(false);

  const showPresets = messages.length <= 1 && !isLoading;
  const canCreateScene = messages.some((m) => m.role === 'user') && onCreateScene;
  const apiReady = isOpenAIConfigured();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [inputText]);

  const handleSend = useCallback(
    async (text: string = inputText) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text: trimmed,
        timestamp: new Date(),
      };

      const historyForApi = toOpenAIHistory(messages);
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsLoading(true);

      try {
        const responseText = await sendChatMessage(trimmed, historyForApi);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'model',
            text: responseText,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, isLoading, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    if (e.nativeEvent.isComposing || isComposingRef.current) return;
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="app-chat">
      {!apiReady && (
        <div className="mx-3 mt-2 app-banner-warm text-xs shrink-0 leading-relaxed">
          <strong>尚未連線 OpenAI。</strong> 本機：在 <code className="text-amber-800">.env.local</code>{' '}
          設定 <code className="text-amber-800">OPENAI_API_KEY</code> 後執行{' '}
          <code className="text-amber-800">npm run dev</code>。已部署：請用 Vercel/Netlify 並在後台設定金鑰（
          <a
            href="https://github.com/WeiTe-Huang/ShiaoAn/blob/main/GITHUB.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-amber-900"
          >
            說明
          </a>
          ）。純 GitHub Pages 無法使用對話功能。
        </div>
      )}

      <div className="app-chat-messages" role="log" aria-live="polite" aria-label="對話紀錄">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start" aria-busy="true">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center shadow-sm">
                <img src={BOT_AVATAR_URL} alt="" className="w-6 h-6" />
              </div>
              <div className="app-bubble-bot flex gap-1.5 items-center py-3">
                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:75ms]" />
                <span className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce [animation-delay:150ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {canCreateScene && !isLoading && (
        <div className="px-3 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => onCreateScene!(extractSituationFromChat(messages))}
            className="app-btn-secondary !py-2.5 !text-xs"
          >
            <ImageIcon size={15} aria-hidden />
            帶入場景還原
          </button>
        </div>
      )}

      {showPresets && (
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {PRESET_QUESTIONS.map((q) => (
            <button key={q} type="button" onClick={() => handleSend(q)} className="app-chip shrink-0">
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="app-composer">
        <div className="app-composer-box">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
            }}
            onKeyDown={handleKeyDown}
            placeholder="輸入訊息…"
            disabled={isLoading}
            rows={1}
            aria-label="輸入訊息"
            className="app-composer-input"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
            aria-label="傳送"
            className="app-send-btn"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">Enter 傳送 · Shift+Enter 換行</p>
      </div>
    </div>
  );
};

export default ChatView;
