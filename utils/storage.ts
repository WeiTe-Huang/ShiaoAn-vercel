const REPORT_DRAFT_KEY = 'nthu-guardian-report-draft';

export function loadReportDraft<T>(): T | null {
  try {
    const raw = localStorage.getItem(REPORT_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveReportDraft<T>(data: T): void {
  try {
    localStorage.setItem(REPORT_DRAFT_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}
