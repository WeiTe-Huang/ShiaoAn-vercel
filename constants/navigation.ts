import { AppTab } from '../types';

export const TAB_META: Record<
  AppTab,
  { title: string; subtitle: string }
> = {
  [AppTab.Chat]: {
    title: '諮詢助理',
    subtitle: '保密對話 · 隨時傾聽',
  },
  [AppTab.Scene]: {
    title: '場景還原',
    subtitle: '整理記憶 · 示意圖',
  },
  [AppTab.Cases]: {
    title: '案例參考',
    subtitle: '常見情境 · 求助方向',
  },
  [AppTab.Report]: {
    title: '通報協助',
    subtitle: '整理紀錄 · Email 草稿',
  },
};
