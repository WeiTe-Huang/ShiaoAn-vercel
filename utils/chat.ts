import { ChatMessage, OpenAIChatMessage } from '../types';

export const MAX_HISTORY_TURNS = 20;

export function toOpenAIHistory(messages: ChatMessage[]): OpenAIChatMessage[] {
  return messages
    .filter((m) => m.id !== 'welcome')
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));
}

/** 從對話紀錄擷取使用者描述，供場景還原帶入 */
export function extractSituationFromChat(messages: ChatMessage[]): string {
  const userTexts = messages.filter((m) => m.role === 'user' && m.text.trim()).map((m) => m.text.trim());
  if (userTexts.length === 0) return '';
  if (userTexts.length === 1) return userTexts[0];
  return userTexts.slice(-3).join('\n\n');
}
