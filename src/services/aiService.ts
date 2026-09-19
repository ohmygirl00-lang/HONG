import { ComplimentRecord, AIAnalysisReport } from '../types';

export interface HealthCheckResult {
  ok: boolean;
  message: string;
  sample?: string;
}

export async function checkAiHealth(): Promise<HealthCheckResult> {
  try {
    const res = await fetch('/api/ai/health');
    if (!res.ok) {
      return { ok: false, message: `서버 통신 실패 (HTTP ${res.status})` };
    }
    const data = await res.json();
    return data;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `연결 요청 오류: ${errorMsg}` };
  }
}

export async function fetchAiComplimentSummary(
  studentName: string,
  compliments: ComplimentRecord[]
): Promise<string> {
  try {
    const res = await fetch('/api/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName,
        compliments: compliments.slice(0, 10).map((c) => ({
          from: c.fromStudentName,
          title: c.cardTitle,
          emoji: c.emoji,
        })),
      }),
    });

    if (!res.ok) {
      return `${studentName}야! 오늘 우리 친구들이 보낸 칭찬이 가득 모였어! 최고야, 삐리삐리!`;
    }

    const data = await res.json();
    return data.summary || `${studentName}야! 친구들이 보낸 따뜻한 칭찬에 마음이 포근해져! 삐리삐리!`;
  } catch {
    return `${studentName}야! 우리 반 친구들과 사이좋게 지내는 모습이 참 멋져! 삐리삐리!`;
  }
}

export async function fetchTeacherAnalysisReport(
  studentName: string,
  records: ComplimentRecord[],
  totalSent: number,
  totalReceived: number
): Promise<AIAnalysisReport['detailedAnalysis'] | null | any> {
  try {
    const res = await fetch('/api/ai/teacher-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName,
        totalSent,
        totalReceived,
        records: records.map((r) => ({
          cardTitle: r.cardTitle,
          from: r.fromStudentName,
          timestamp: r.timestamp,
        })),
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.report;
  } catch {
    return null;
  }
}
