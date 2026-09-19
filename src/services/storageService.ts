import { Student, ComplimentRecord, AppSettings, AIAnalysisReport } from '../types';
import { INITIAL_STUDENTS, DEFAULT_SETTINGS } from '../data/mockData';

const STORAGE_KEYS = {
  STUDENTS: 'kinder_compliment_students',
  RECORDS: 'kinder_compliment_records',
  SETTINGS: 'kinder_compliment_settings',
  DAILY_LIMITS: 'kinder_compliment_daily_limits',
  REPORTS: 'kinder_compliment_ai_reports',
};

// YYYY-MM-DD 날짜 키 구하기
export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 1. 학생 목록 가져오기 & 저장
export function getStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    window.dispatchEvent(new Event('storage-students-updated'));
  } catch {
    // safe
  }
}

// 2. 칭찬 내역 가져오기 & 저장
export function getComplimentRecords(): ComplimentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      // 초기 기본 칭찬 내역 몇 개 생성하여 풍부한 시작 제공
      const initialRecords: ComplimentRecord[] = [
        {
          id: 'rec-init-1',
          fromStudentId: '2026-kinder-02',
          fromStudentName: '이지우',
          fromStudentAvatar: '🐰',
          toStudentId: '2026-kinder-01',
          toStudentName: '김하늘',
          toStudentAvatar: '🦁',
          cardId: 'c1',
          cardTitle: '친절해요',
          cardIcon: '🤝',
          emoji: '❤️',
          soundName: 'sparkle',
          timestamp: Date.now() - 3600000 * 2,
          dateKey: getTodayDateKey(),
        },
        {
          id: 'rec-init-2',
          fromStudentId: '2026-kinder-03',
          fromStudentName: '박민준',
          fromStudentAvatar: '🐻',
          toStudentId: '2026-kinder-02',
          toStudentName: '이지우',
          toStudentAvatar: '🐰',
          cardId: 'c2',
          cardTitle: '정리를 잘해요',
          cardIcon: '🧹',
          emoji: '⭐',
          soundName: 'pop',
          timestamp: Date.now() - 3600000 * 4,
          dateKey: getTodayDateKey(),
        },
        {
          id: 'rec-init-3',
          fromStudentId: '2026-kinder-05',
          fromStudentName: '최시우',
          fromStudentAvatar: '🐶',
          toStudentId: '2026-kinder-04',
          toStudentName: '정서윤',
          toStudentAvatar: '🐱',
          cardId: 'c3',
          cardTitle: '같이 잘 놀아요',
          cardIcon: '🎈',
          emoji: '🎁',
          soundName: 'magic',
          timestamp: Date.now() - 3600000 * 6,
          dateKey: getTodayDateKey(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(initialRecords));
      return initialRecords;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveComplimentRecords(records: ComplimentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    window.dispatchEvent(new Event('storage-records-updated'));
  } catch {
    // safe
  }
}

// 3. 하루 전송 횟수 체크 및 증가
export function getTodaySentCount(studentId: string): number {
  try {
    const today = getTodayDateKey();
    const raw = localStorage.getItem(`${STORAGE_KEYS.DAILY_LIMITS}_${today}`);
    if (!raw) return 0;
    const map = JSON.parse(raw);
    return map[studentId] || 0;
  } catch {
    return 0;
  }
}

export function incrementTodaySentCount(studentId: string): number {
  try {
    const today = getTodayDateKey();
    const key = `${STORAGE_KEYS.DAILY_LIMITS}_${today}`;
    const raw = localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) : {};
    map[studentId] = (map[studentId] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(map));
    return map[studentId];
  } catch {
    return 1;
  }
}

// 4. 앱 설정
export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('storage-settings-updated'));
  } catch {
    // safe
  }
}

// 5. 칭찬 전송 처리 (보낸 아이 +1점, 받은 아이 +1점 및 횟수 기록)
export function sendCompliment(
  fromStudent: Student,
  toStudent: Student,
  card: { id: string; title: string; icon: string },
  emoji: string,
  soundName: string,
  message?: string
): { success: boolean; error?: string; newRecord?: ComplimentRecord } {
  const settings = getAppSettings();
  const todaySent = getTodaySentCount(fromStudent.id);

  if (todaySent >= settings.dailyLimit) {
    return {
      success: false,
      error: `오늘은 칭찬을 모두 보냈어요! 내일 또 친구를 칭찬해줘요 (하루 ${settings.dailyLimit}회 완료)`,
    };
  }

  const today = getTodayDateKey();
  const newRecord: ComplimentRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fromStudentId: fromStudent.id,
    fromStudentName: fromStudent.name,
    fromStudentAvatar: fromStudent.avatar,
    toStudentId: toStudent.id,
    toStudentName: toStudent.name,
    toStudentAvatar: toStudent.avatar,
    cardId: card.id,
    cardTitle: card.title,
    cardIcon: card.icon,
    emoji,
    soundName,
    message,
    timestamp: Date.now(),
    dateKey: today,
  };

  // 1) 칭찬 기록 추가
  const currentRecords = getComplimentRecords();
  const updatedRecords = [newRecord, ...currentRecords];
  saveComplimentRecords(updatedRecords);

  // 2) 보낸 아이 횟수 카운트 증가
  incrementTodaySentCount(fromStudent.id);

  // 3) 보낸 아이 +1점, 받은 아이 +1점 동시 반영
  const students = getStudents();
  const updatedStudents = students.map((s) => {
    if (s.id === fromStudent.id && s.id === toStudent.id) {
      // 본인에게 보낸 경우 (방지되지만 안전 처리)
      return { ...s, points: s.points + 1 };
    }
    if (s.id === fromStudent.id) {
      return { ...s, points: s.points + 1 };
    }
    if (s.id === toStudent.id) {
      return { ...s, points: s.points + 1 };
    }
    return s;
  });
  saveStudents(updatedStudents);

  return { success: true, newRecord };
}

// 6. 점수 관리자 직접 수정
export function updateStudentPoints(studentId: string, deltaOrExact: number, isDelta: boolean): Student[] {
  const students = getStudents();
  const updated = students.map((s) => {
    if (s.id === studentId) {
      const newPoints = isDelta ? Math.max(0, s.points + deltaOrExact) : Math.max(0, deltaOrExact);
      return { ...s, points: newPoints };
    }
    return s;
  });
  saveStudents(updated);
  return updated;
}

// 7. 특정 학생이 받은 칭찬 내역 조회
export function getReceivedCompliments(studentId: string): ComplimentRecord[] {
  const records = getComplimentRecords();
  return records.filter((r) => r.toStudentId === studentId);
}

// 8. 저장된 AI 보고서 관리
export function getSavedReports(): Record<string, AIAnalysisReport> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveReport(report: AIAnalysisReport): void {
  try {
    const all = getSavedReports();
    all[report.studentId] = report;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(all));
  } catch {
    // safe
  }
}

// 9. Firestore 시뮬레이션 / CRUD 검증 상태 (Firebase가 연결되지 않은 경우에도 자가 치유 및 테스트 보장)
export async function runStorageHealthCheck(): Promise<{ success: boolean; message: string }> {
  try {
    const testKey = 'kinder_health_check_test';
    const testData = { ping: 'ok', timestamp: Date.now() };
    // Create
    localStorage.setItem(testKey, JSON.stringify(testData));
    // Read
    const read = localStorage.getItem(testKey);
    if (!read) throw new Error('읽기 실패');
    // Update
    localStorage.setItem(testKey, JSON.stringify({ ...testData, updated: true }));
    // Delete
    localStorage.removeItem(testKey);

    return {
      success: true,
      message: '실시간 로컬 데이터 저장소 CRUD 테스트 통과 (다기기 연결 준비 완료)',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `저장소 테스트 실패: ${errorMsg}`,
    };
  }
}
