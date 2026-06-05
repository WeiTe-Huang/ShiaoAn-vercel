import OpenAI from 'openai';
import { SYSTEM_INSTRUCTION, SCENE_PROMPT_INSTRUCTION } from '../constants';
import type { OpenAIChatMessage } from '../types';

export type { OpenAIChatMessage };

const CHAT_MODEL = 'gpt-4o';
const PROMPT_MODEL = 'gpt-4o-mini';
/** gpt-image-1 僅回傳 base64，不支援 style / response_format 等 DALL·E 參數 */
const IMAGE_MODEL = 'gpt-image-1';

const USE_PROXY = import.meta.env.VITE_OPENAI_PROXY === '1';

let client: OpenAI | null = null;

function formatApiError(error: unknown): string {
  if (error instanceof OpenAI.APIError) {
    switch (error.status) {
      case 401:
        return USE_PROXY
          ? 'OpenAI API 金鑰無效或未設定。本機請檢查 .env.local；已部署請在 Vercel/Netlify 後台設定 OPENAI_API_KEY 後重新部署。'
          : 'OpenAI API 金鑰未設定。請使用 npm run dev 本機開發，或部署至 Vercel/Netlify 並設定環境變數（純 GitHub Pages 無法使用對話 API）。';
      case 403:
        return '此 API 金鑰沒有使用權限，請至 OpenAI 後台確認專案與帳單狀態。';
      case 429:
        return '請求過於頻繁或額度不足，請稍後再試或檢查 OpenAI 帳戶餘額。';
      default:
        return `OpenAI 回傳錯誤（${error.status}）：${error.message}`;
    }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('failed to fetch') || msg.includes('network')) {
      return USE_PROXY
        ? '無法連線至 OpenAI。請確認已用 npm run dev 啟動，且網路可連到 api.openai.com。'
        : '無法連線至 OpenAI（瀏覽器可能被 CORS 阻擋）。請使用 npm run dev 啟動開發伺服器。';
    }
    if (msg.includes('缺少 openai')) {
      return error.message;
    }
  }

  return '系統暫時無法連線，請稍後再試。若有緊急狀況，請直接聯繫性平會。';
}

function getClient(): OpenAI {
  if (!USE_PROXY) {
    throw new Error(
      '目前環境無法連線 OpenAI。本機請在 .env.local 設定 OPENAI_API_KEY 後執行 npm run dev；線上請用 Vercel/Netlify 部署並設定 OPENAI_API_KEY（GitHub Pages 僅靜態託管，不支援 API 代理）。'
    );
  }

  if (!client) {
    client = new OpenAI({
      apiKey: 'local-proxy',
      baseURL: `${window.location.origin}/api/openai/v1`,
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

export function isOpenAIConfigured(): boolean {
  return USE_PROXY;
}

export async function sendChatMessage(
  message: string,
  history: OpenAIChatMessage[]
): Promise<string> {
  try {
    const response = await getClient().chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.6,
      max_tokens: 512,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...history,
        { role: 'user', content: message },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim();
    return text || '抱歉，我現在無法回應。請稍後再試。';
  } catch (error) {
    console.error('OpenAI Chat Error:', error);
    return formatApiError(error);
  }
}

/** 將使用者情境轉為安全、抽象的 DALL·E 提示詞 */
export async function buildSceneImagePrompt(situationDescription: string): Promise<string> {
  try {
    const response = await getClient().chat.completions.create({
      model: PROMPT_MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SCENE_PROMPT_INSTRUCTION },
        {
          role: 'user',
          content: `請根據以下情境描述，產出場景示意圖的英文繪圖提示詞（僅輸出提示詞本身）：\n\n${situationDescription}`,
        },
      ],
    });

    const prompt = response.choices[0]?.message?.content?.trim();
    if (!prompt) {
      throw new Error('無法產生場景描述，請稍後再試。');
    }
    return prompt;
  } catch (error) {
    throw new Error(formatApiError(error));
  }
}

/** 依修改意見更新繪圖提示詞 */
export async function reviseSceneImagePrompt(
  situationDescription: string,
  previousImagePrompt: string,
  revisionNotes: string
): Promise<string> {
  try {
    const response = await getClient().chat.completions.create({
      model: PROMPT_MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: SCENE_PROMPT_INSTRUCTION },
        {
          role: 'user',
          content: [
            '請根據以下資訊，產出「更新後」的英文繪圖提示詞（僅輸出提示詞本身）：',
            '',
            '【原始情境】',
            situationDescription,
            '',
            '【上一版繪圖提示詞】',
            previousImagePrompt,
            '',
            '【使用者希望調整的部分】',
            revisionNotes,
          ].join('\n'),
        },
      ],
    });

    const prompt = response.choices[0]?.message?.content?.trim();
    if (!prompt) {
      throw new Error('無法更新場景描述，請稍後再試。');
    }
    return prompt;
  } catch (error) {
    throw new Error(formatApiError(error));
  }
}

function imageResultToDisplayUrl(item: { url?: string; b64_json?: string } | undefined): string | null {
  if (!item) return null;
  if (item.url) return item.url;
  if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
  return null;
}

/** 生成場景示意圖，回傳可顯示的圖片 URL 或 data URL */
export async function generateSceneImage(imagePrompt: string): Promise<string> {
  try {
    const response = await getClient().images.generate({
      model: IMAGE_MODEL,
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'medium',
    });

    const displayUrl = imageResultToDisplayUrl(response.data?.[0]);
    if (!displayUrl) {
      throw new Error('無法生成圖片，請重試。');
    }
    return displayUrl;
  } catch (error) {
    throw new Error(formatApiError(error));
  }
}
