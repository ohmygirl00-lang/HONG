import { Student, ComplimentOption, EmojiOption, AppSettings } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  { id: '2026-kinder-01', name: '김하늘', avatar: '🦁', classId: 'sunshine', points: 5 },
  { id: '2026-kinder-02', name: '이지우', avatar: '🐰', classId: 'sunshine', points: 7 },
  { id: '2026-kinder-03', name: '박민준', avatar: '🐻', classId: 'sunshine', points: 4 },
  { id: '2026-kinder-04', name: '정서윤', avatar: '🐱', classId: 'sunshine', points: 6 },
  { id: '2026-kinder-05', name: '최시우', avatar: '🐶', classId: 'sunshine', points: 8 },
  { id: '2026-kinder-06', name: '강도윤', avatar: '🐼', classId: 'sunshine', points: 3 },
  { id: '2026-kinder-07', name: '윤채원', avatar: '🦊', classId: 'sunshine', points: 5 },
  { id: '2026-kinder-08', name: '임예준', avatar: '🐸', classId: 'sunshine', points: 6 },
  { id: '2026-kinder-09', name: '한소율', avatar: '🐨', classId: 'sunshine', points: 4 },
  { id: '2026-kinder-10', name: '송은우', avatar: '🐯', classId: 'sunshine', points: 5 },
  { id: '2026-kinder-11', name: '조유나', avatar: '🦄', classId: 'sunshine', points: 7 },
  { id: '2026-kinder-12', name: '배준혁', avatar: '🐧', classId: 'sunshine', points: 5 },
];

export const COMPLIMENT_CARDS: ComplimentOption[] = [
  {
    id: 'c1',
    title: '친절해요',
    subText: '따뜻하게 말해주고 도와줬어요',
    icon: '🤝',
    category: 'kindness',
    color: 'from-amber-100 to-orange-200 border-amber-300 text-amber-900',
    soundName: 'sparkle',
  },
  {
    id: 'c2',
    title: '정리를 잘해요',
    subText: '놀잇감을 제자리에 쏙쏙 정리해요',
    icon: '🧹',
    category: 'tidiness',
    color: 'from-emerald-100 to-teal-200 border-emerald-300 text-emerald-900',
    soundName: 'pop',
  },
  {
    id: 'c3',
    title: '같이 잘 놀아요',
    subText: '함께 웃으며 사이좋게 놀았어요',
    icon: '🎈',
    category: 'play',
    color: 'from-sky-100 to-blue-200 border-sky-300 text-sky-900',
    soundName: 'magic',
  },
  {
    id: 'c4',
    title: '양보를 잘해요',
    subText: '친구에게 먼저 차례를 양보했어요',
    icon: '💖',
    category: 'sharing',
    color: 'from-rose-100 to-pink-200 border-rose-300 text-rose-900',
    soundName: 'sparkle',
  },
  {
    id: 'c5',
    title: '씩씩해요',
    subText: '어려운 일도 용기 내어 도전해요',
    icon: '🦁',
    category: 'courage',
    color: 'from-yellow-100 to-amber-200 border-yellow-300 text-yellow-900',
    soundName: 'cheer',
  },
  {
    id: 'c6',
    title: '귀 기울여 들어요',
    subText: '선생님과 친구의 말을 잘 들어요',
    icon: '👂',
    category: 'listening',
    color: 'from-purple-100 to-indigo-200 border-purple-300 text-purple-900',
    soundName: 'pop',
  },
];

export const EMOJI_OPTIONS: EmojiOption[] = [
  { id: 'e1', emoji: '❤️', label: '하트 뿅뿅', soundName: 'sparkle' },
  { id: 'e2', emoji: '⭐', label: '반짝이는 별', soundName: 'magic' },
  { id: 'e3', emoji: '🎁', label: '선물 상자', soundName: 'cheer' },
  { id: 'e4', emoji: '👑', label: '멋진 왕관', soundName: 'sparkle' },
  { id: 'e5', emoji: '🍭', label: '달콤한 사탕', soundName: 'pop' },
  { id: 'e6', emoji: '🌈', label: '무지개빛', soundName: 'magic' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  dailyLimit: 3,
  adminPinHash: '1234', // 기본 핀
  allowCustomMessage: true,
  schoolName: '행복유치원',
  className: '햇살반 (만 5세)',
};
