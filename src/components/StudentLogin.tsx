import React from 'react';
import { Sparkles, Trophy, Award, BookOpen, Volume2, ShieldCheck } from 'lucide-react';
import { Student } from '../types';
import { sound, speakText } from '../utils/audio';

interface StudentLoginProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onOpenTeacherMode: () => void;
  onOpenBoardMode: () => void;
  classNameTitle: string;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  students,
  onSelectStudent,
  onOpenTeacherMode,
  onOpenBoardMode,
  classNameTitle,
}) => {
  const handleStudentClick = (student: Student) => {
    sound.playPop();
    speakText(`${student.name} 안녕! 칭찬우체통에 온 걸 환영해!`);
    onSelectStudent(student);
  };

  return (
    <div id="student-login-view" className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* 귀여운 상단 배너 헤더 */}
      <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-200 text-center mb-6 relative overflow-hidden">
        {/* 상단 장식 구름 & 별 */}
        <div className="absolute -top-6 -left-6 w-20 h-20 bg-amber-100 rounded-full blur-xl opacity-70"></div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pink-100 rounded-full blur-xl opacity-70"></div>

        <div className="flex items-center justify-between gap-4 mb-2">
          {/* 전자칠판 바로가기 버튼 */}
          <button
            id="open-board-button"
            type="button"
            onClick={() => {
              sound.playMagic();
              onOpenBoardMode();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold px-4 py-2.5 rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all text-sm sm:text-base border-2 border-emerald-300"
          >
            <Trophy className="w-5 h-5 text-yellow-200 animate-bounce" />
            <span className="font-['Jua']">전자칠판 현황판</span>
          </button>

          {/* 교사 관리자 모드 */}
          <button
            id="open-teacher-mode-button"
            type="button"
            onClick={() => {
              sound.playPop();
              onOpenTeacherMode();
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-2xl border border-slate-300 text-xs sm:text-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span className="font-['Jua']">선생님 전용</span>
          </button>
        </div>

        <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-1.5 rounded-full border border-amber-300 text-amber-800 text-sm font-semibold mb-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{classNameTitle}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-['Jua'] text-amber-900 tracking-wide drop-shadow-sm flex items-center justify-center gap-3">
          <span>📮</span> 우리반 칭찬우체통 <span>💌</span>
        </h1>
        <p className="text-amber-800/80 font-medium text-base sm:text-xl mt-2 flex items-center justify-center gap-2">
          <span>내 얼굴이나 이름을 콕! 터치해 주세요</span>
          <button
            type="button"
            onClick={() => speakText("내 얼굴이나 이름을 콕! 터치해 주세요!")}
            className="p-1 text-amber-600 hover:text-amber-800 hover:scale-110 transition-transform"
            title="음성으로 듣기"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </p>
      </div>

      {/* 만 5세 유아 직관적 대형 터치 학생 카드 그리드 */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {students.map((student, idx) => (
          <button
            key={student.id}
            id={`student-login-card-${student.id}`}
            type="button"
            onClick={() => handleStudentClick(student)}
            className="group relative bg-white hover:bg-gradient-to-b hover:from-amber-50 hover:to-orange-50 border-4 border-amber-200 hover:border-amber-400 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1.5 active:scale-95 flex flex-col items-center justify-center text-center overflow-hidden cursor-pointer"
          >
            {/* 번호 뱃지 */}
            <span className="absolute top-2.5 left-3 text-xs font-bold text-amber-700/60 bg-amber-100/80 px-2 py-0.5 rounded-full">
              {idx + 1}번
            </span>

            {/* 별 포인트 뱃지 */}
            <span className="absolute top-2.5 right-3 flex items-center gap-1 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
              <span className="text-yellow-500">⭐</span>
              <span>{student.points}점</span>
            </span>

            {/* 유아 동물 아바타 아이콘 */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-100 to-yellow-100 border-3 border-amber-300 flex items-center justify-center text-4xl sm:text-5xl shadow-inner mt-4 mb-3 group-hover:scale-110 transition-transform">
              {student.avatar}
            </div>

            {/* 학생 이름 */}
            <h2 className="text-xl sm:text-2xl font-['Jua'] text-slate-800 group-hover:text-amber-900 transition-colors">
              {student.name}
            </h2>

            <span className="mt-1 text-xs sm:text-sm text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-lg">
              {student.id}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center text-amber-900/70 text-sm font-medium flex items-center gap-2 bg-amber-100/60 px-5 py-2.5 rounded-full border border-amber-200">
        <Award className="w-4 h-4 text-amber-600" />
        <span>어느 태블릿에서 접속해도 내 이름만 터치하면 칭찬 점수가 그대로 이어져요!</span>
      </div>
    </div>
  );
};
