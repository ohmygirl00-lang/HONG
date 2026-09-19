export interface Student {
  id: string; // e.g. "2026-kinder-01"
  name: string;
  avatar: string; // emoji or animal avatar
  classId: string; // e.g. "sunshine"
  points: number;
}

export interface ComplimentOption {
  id: string;
  title: string;
  subText: string;
  icon: string;
  category: 'kindness' | 'tidiness' | 'play' | 'sharing' | 'courage' | 'listening';
  color: string;
  soundName: string;
}

export interface EmojiOption {
  id: string;
  emoji: string;
  label: string;
  soundName: string;
}

export interface ComplimentRecord {
  id: string;
  fromStudentId: string;
  fromStudentName: string;
  fromStudentAvatar: string;
  toStudentId: string;
  toStudentName: string;
  toStudentAvatar: string;
  cardId: string;
  cardTitle: string;
  cardIcon: string;
  emoji: string;
  soundName: string;
  message?: string;
  timestamp: number;
  dateKey: string; // YYYY-MM-DD
}

export interface DailyLimitRecord {
  studentId: string;
  dateKey: string;
  sentCount: number;
}

export interface ClassInfo {
  id: string;
  name: string;
  teacherName: string;
  grade: string;
}

export interface AppSettings {
  dailyLimit: number;
  adminPinHash: string; // SHA-256 or simple hashed PIN
  allowCustomMessage: boolean;
  schoolName: string;
  className: string;
}

export interface AIAnalysisReport {
  studentId: string;
  studentName: string;
  totalReceived: number;
  totalSent: number;
  topStrengths: string[];
  summaryMessage: string;
  detailedAnalysis: string;
  lifeRecordDraft: string; // 생활기록부 문안 초안
  parentCounselingNote: string; // 학부모 상담용 참고 메모
  generatedAt: number;
}
