import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

const markdownComponents: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 text-brand-700 break-all"
    >
      {children}
    </a>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 pl-5 list-disc space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 pl-5 list-decimal space-y-1.5">{children}</ol>,
  li: ({ children }) => <li className="leading-snug">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="text-[13px] bg-slate-100/90 px-1 py-0.5 rounded">{children}</code>
  ),
};

interface ChatMarkdownProps {
  text: string;
}

const ChatMarkdown = memo(function ChatMarkdown({ text }: ChatMarkdownProps) {
  return (
    <div className="app-chat-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {text}
      </ReactMarkdown>
    </div>
  );
});

export default ChatMarkdown;
