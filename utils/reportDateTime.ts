/** 將 datetime-local 或草稿字串拆成 date / time（HTML input 格式） */
export function splitReportDateTime(value: string): { date: string; time: string } {
  if (!value?.trim()) {
    return { date: '', time: '' };
  }

  const normalized = value.trim().replace(' ', 'T');
  const match = normalized.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);
  if (!match) {
    return { date: '', time: '' };
  }

  return {
    date: match[1],
    time: match[2] ?? '',
  };
}

/** 合併為儲存用字串（YYYY-MM-DDTHH:mm） */
export function joinReportDateTime(date: string, time: string): string {
  if (!date) return '';
  if (!time) return date;
  return `${date}T${time}`;
}

/** 通報信件／顯示用（繁中較易讀） */
export function formatReportDateTimeDisplay(value: string): string {
  const { date, time } = splitReportDateTime(value);
  if (!date) return '未提供';

  const [y, m, d] = date.split('-').map((part) => parseInt(part, 10));
  const dateLabel =
    Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)
      ? `${y}年${m}月${d}日`
      : date;

  return time ? `${dateLabel} ${time}` : dateLabel;
}
