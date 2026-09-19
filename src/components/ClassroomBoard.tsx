import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Trophy,
  Sparkles,
  Heart,
  Volume2,
  TreeDeciduous,
  Clock,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, ComplimentRecord } from '../types';
import { sound, speakText } from '../utils/audio';

interface ClassroomBoardProps {
  students: Student[];
  records: ComplimentRecord[];
  onGoBack: () => void;
  classNameTitle: string;
}

export const ClassroomBoard: React.FC<ClassroomBoardProps> = ({
  students,
  records,
  onGoBack,
  classNameTitle,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalPoints = students.reduce((acc, s) => acc + s.points, 0);
  const totalCompliments = records.length;

  // 칭찬 나무 성장 레벨 계산 (만 5세 유아 시각화)
  // 0~10회: 새싹단계 (Seedling), 11~25회: 어린나무, 26~50회: 풍성한 열매나무, 51회 이상: 거대한 황금 칭찬나무
  const getTreeGrowth = () => {
    if (totalCompliments < 10) {
      return {
        level: 1,
        title: '🌱 칭찬 새싹 단계',
        desc: '우리 반에 칭찬 씨앗이 싹트고 있어요!',
        icon: '🌱',
        apples: totalCompliments,
        sizeClass: 'scale-90',
        bgColor: 'from-amber-50 to-emerald-50',
      };
    } else if (totalCompliments < 25) {
      return {
        level: 2,
        title: '🌿 무럭무럭 자라는 나무 단계',
        desc: '친구들의 따뜻한 칭찬 물을 먹고 잎사귀가 자라나요!',
        icon: '🌿',
        apples: totalCompliments,
        sizeClass: 'scale-100',
        bgColor: 'from-emerald-50 to-teal-100',
      };
    } else if (totalCompliments < 50) {
      return {
        level: 3,
        title: '🌳 탐스러운 열매 나무 단계',
        desc: '주렁주렁 빨간 칭찬 사과 열매가 가득 맺혔어요!',
        icon: '🌳',
        apples: totalCompliments,
        sizeClass: 'scale-110',
        bgColor: 'from-teal-50 to-emerald-100',
      };
    } else {
      return {
        level: 4,
        title: '✨ 반짝이는 황금 마법 나무',
        desc: '우리 반은 사랑과 칭찬이 넘치는 행복 천국이에요!',
        icon: '👑🌳',
        apples: totalCompliments,
        sizeClass: 'scale-125 animate-pulse',
        bgColor: 'from-yellow-100 to-amber-200',
      };
    }
  };

  const tree = getTreeGrowth();

  const handleCheerBoard = () => {
    sound.playCheer();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
    });
    speakText(`우리 ${classNameTitle} 친구들 모두 최고예요! 총 ${totalCompliments}개의 칭찬이 모였어요!`);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div id="classroom-board-view" className="w-full max-w-7xl mx-auto flex flex-col items-center">
      {/* 전자칠판 상단 바 */}
      <div className="w-full flex items-center justify-between bg-white/95 rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-emerald-300 mb-6">
        <button
          type="button"
          onClick={() => {
            sound.playPop();
            onGoBack();
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold transition-all text-sm sm:text-base cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-['Jua']">학생 화면으로</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-1 rounded-full text-emerald-800 text-sm font-bold border border-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>전자칠판 전용 학급 대시보드</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-['Jua'] text-emerald-950 mt-1">
            🌳 {classNameTitle} 칭찬 나무 현황판
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-300 transition-all cursor-pointer"
            title="전체화면 전환"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={handleCheerBoard}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer font-['Jua']"
          >
            <span>🎉 다 함께 축하하기!</span>
          </button>
        </div>
      </div>

      {/* 전자칠판 메인 2분할 뷰: 왼쪽(성장하는 칭찬 나무) / 오른쪽(우리반 칭찬 랭킹 & 최근 실시간 피드) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 왼쪽: 칭찬 나무 시각화 인터랙션 (7 cols) */}
        <div
          className={`lg:col-span-7 bg-gradient-to-b ${tree.bgColor} rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-emerald-400 flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[520px]`}
        >
          {/* 구름 및 햇살 장식 */}
          <div className="absolute top-4 left-6 text-4xl animate-bounce">☀️</div>
          <div className="absolute top-6 right-8 text-4xl opacity-80">☁️</div>

          <div className="z-10">
            <div className="inline-block bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border-2 border-emerald-300 shadow-md">
              <span className="font-['Jua'] text-2xl text-emerald-900">{tree.title}</span>
            </div>
            <p className="text-emerald-800 font-medium text-base sm:text-lg mt-2 font-['Gaegu'] text-2xl">
              {tree.desc}
            </p>
          </div>

          {/* 중앙 나무 그래픽 & 사과 열매들 */}
          <div className="relative my-8 flex items-center justify-center">
            {/* 나무 기둥 및 잎사귀 */}
            <div className={`transition-all duration-700 transform ${tree.sizeClass} flex flex-col items-center`}>
              <div className="text-8xl sm:text-9xl filter drop-shadow-2xl select-none">
                {totalCompliments < 10 ? '🌱' : totalCompliments < 25 ? '🌿' : '🌳'}
              </div>
            </div>

            {/* 나무 주변에 열린 사과 열매들 (총 칭찬 개수 시각화) */}
            <div className="absolute inset-0 flex flex-wrap items-center justify-center pointer-events-none gap-2 p-4">
              {Array.from({ length: Math.min(totalCompliments, 24) }).map((_, i) => (
                <span
                  key={i}
                  className="text-2xl sm:text-3xl animate-pulse"
                  style={{
                    animationDelay: `${(i % 5) * 0.2}s`,
                  }}
                >
                  🍎
                </span>
              ))}
            </div>
          </div>

          {/* 하단 점수 요약 바 */}
          <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-md border-2 border-emerald-200 flex items-center justify-around z-10">
            <div>
              <span className="text-xs text-slate-500 font-bold block">우리 반 총 칭찬</span>
              <span className="font-['Jua'] text-3xl text-emerald-700">
                {totalCompliments}통 💌
              </span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div>
              <span className="text-xs text-slate-500 font-bold block">모인 칭찬 별</span>
              <span className="font-['Jua'] text-3xl text-amber-600">
                {totalPoints}개 ⭐
              </span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div>
              <span className="text-xs text-slate-500 font-bold block">함께한 친구들</span>
              <span className="font-['Jua'] text-3xl text-indigo-700">
                {students.length}명 👧👦
              </span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 우리반 친구들 별 포인트 & 최근 칭찬 실시간 피드 (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 친구들 별 점수 그리드 */}
          <div className="bg-white/95 rounded-3xl p-6 shadow-xl border-4 border-amber-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Jua'] text-2xl text-amber-900 flex items-center gap-2">
                <span>⭐</span> 우리반 친구들 칭찬 별
              </h2>
              <span className="text-xs text-slate-500 font-bold">실시간 누적</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {[...students]
                .sort((a, b) => b.points - a.points)
                .map((student) => (
                  <div
                    key={student.id}
                    className="bg-amber-50/70 border border-amber-200 rounded-2xl p-2.5 flex flex-col items-center text-center"
                  >
                    <span className="text-2xl">{student.avatar}</span>
                    <span className="font-['Jua'] text-sm text-slate-800 mt-0.5">
                      {student.name}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-yellow-100 px-2 py-0.5 rounded-full mt-1">
                      ⭐ {student.points}점
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* 실시간 최근 칭찬 우체통 도착 피드 */}
          <div className="bg-white/95 rounded-3xl p-6 shadow-xl border-4 border-purple-200 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-['Jua'] text-2xl text-purple-900 flex items-center gap-2">
                <span>📬</span> 최근 도착한 칭찬 편지
              </h2>
              <span className="text-xs text-purple-600 font-bold">실시간</span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-72 pr-1">
              {records.slice(0, 6).map((rec) => (
                <div
                  key={rec.id}
                  className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{rec.cardIcon}</span>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-['Jua'] text-purple-950">
                        <span>{rec.fromStudentName}</span>
                        <span className="text-purple-400">➔</span>
                        <span>{rec.toStudentName}</span>
                      </div>
                      <span className="text-xs text-slate-600">"{rec.cardTitle}"</span>
                    </div>
                  </div>
                  <span className="text-2xl">{rec.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
