import React, { useState, useEffect } from 'react';
import { Student, ComplimentRecord, AppSettings } from './types';
import {
  getStudents,
  getComplimentRecords,
  getAppSettings,
  saveStudents,
} from './services/storageService';
import { StudentLogin } from './components/StudentLogin';
import { ComplimentSendFlow } from './components/ComplimentSendFlow';
import { StudentMyBox } from './components/StudentMyBox';
import { ClassroomBoard } from './components/ClassroomBoard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { sound, speakText } from './utils/audio';

type AppView = 'login' | 'studentHome' | 'send' | 'mybox' | 'board' | 'teacher';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<ComplimentRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [view, setView] = useState<AppView>('login');

  // 데이터 동기화
  const reloadData = () => {
    const s = getStudents();
    const r = getComplimentRecords();
    const cfg = getAppSettings();
    setStudents(s);
    setRecords(r);
    setSettings(cfg);

    // 현재 선택된 학생 정보 갱신
    if (currentStudent) {
      const refreshed = s.find((st) => st.id === currentStudent.id);
      if (refreshed) setCurrentStudent(refreshed);
    }
  };

  useEffect(() => {
    reloadData();

    const handleRecordsUpdate = () => reloadData();
    const handleStudentsUpdate = () => reloadData();
    const handleSettingsUpdate = () => reloadData();

    window.addEventListener('storage-records-updated', handleRecordsUpdate);
    window.addEventListener('storage-students-updated', handleStudentsUpdate);
    window.addEventListener('storage-settings-updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('storage-records-updated', handleRecordsUpdate);
      window.removeEventListener('storage-students-updated', handleStudentsUpdate);
      window.removeEventListener('storage-settings-updated', handleSettingsUpdate);
    };
  }, []);

  // 학생 선택 시 학생 전용 홈 화면으로 이동
  const handleSelectStudent = (student: Student) => {
    setCurrentStudent(student);
    setView('studentHome');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 text-slate-800 p-3 sm:p-6 flex flex-col items-center justify-start select-none font-['Noto_Sans_KR']">
      {/* 1. 로그인 뷰 */}
      {view === 'login' && (
        <StudentLogin
          students={students}
          onSelectStudent={handleSelectStudent}
          onOpenTeacherMode={() => setView('teacher')}
          onOpenBoardMode={() => setView('board')}
          classNameTitle={settings.className}
        />
      )}

      {/* 2. 학생 홈 뷰 (칭찬 보내기 vs 내 칭찬함 선택 대형 버튼) */}
      {view === 'studentHome' && currentStudent && (
        <div id="student-home-view" className="w-full max-w-2xl mx-auto flex flex-col items-center">
          {/* 상단 학생 프로필 카드 */}
          <div className="w-full bg-white/95 rounded-3xl p-6 shadow-xl border-4 border-amber-300 text-center mb-6 relative">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setView('login');
              }}
              className="absolute top-4 left-4 text-xs sm:text-sm font-['Jua'] text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-300"
            >
              다른 친구로 바꾸기
            </button>

            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-100 to-yellow-100 border-4 border-amber-300 flex items-center justify-center text-5xl sm:text-6xl mx-auto shadow-inner mt-4 mb-2">
              {currentStudent.avatar}
            </div>
            <h1 className="text-3xl sm:text-4xl font-['Jua'] text-amber-950">
              {currentStudent.name} 안녕!
            </h1>
            <div className="inline-flex items-center gap-1.5 bg-yellow-100 border border-yellow-300 text-yellow-900 font-bold px-4 py-1 rounded-full text-base sm:text-lg mt-2">
              <span>⭐ 내 칭찬 점수:</span>
              <span className="font-['Jua'] text-xl">{currentStudent.points}점</span>
            </div>
          </div>

          {/* 대형 선택 카드 2개: [친구 칭찬하기] & [내 칭찬 보물함] */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* 1) 칭찬 보내기 카드 */}
            <button
              id="goto-send-compliment-button"
              type="button"
              onClick={() => {
                sound.playPop();
                speakText('친구에게 보낼 칭찬을 골라볼까요?');
                setView('send');
              }}
              className="group bg-gradient-to-br from-rose-400 via-pink-400 to-amber-400 hover:from-rose-500 hover:to-amber-500 text-white border-4 border-yellow-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform">
                💌
              </div>
              <h2 className="text-2xl sm:text-3xl font-['Jua'] drop-shadow-md">
                친구 칭찬하기
              </h2>
              <p className="text-white/90 text-sm font-medium mt-1">
                친구에게 예쁜 마음을 보내요! (+1점)
              </p>
            </button>

            {/* 2) 내 칭찬 보물함 카드 */}
            <button
              id="goto-my-box-button"
              type="button"
              onClick={() => {
                sound.playSparkle();
                setView('mybox');
              }}
              className="group bg-gradient-to-br from-indigo-400 via-purple-400 to-sky-400 hover:from-indigo-500 hover:to-sky-500 text-white border-4 border-purple-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h2 className="text-2xl sm:text-3xl font-['Jua'] drop-shadow-md">
                내 칭찬 보물함
              </h2>
              <p className="text-white/90 text-sm font-medium mt-1">
                AI 로봇 삐뽀가 읽어줘요!
              </p>
            </button>
          </div>
        </div>
      )}

      {/* 3. 칭찬 보내기 4단계 플로우 */}
      {view === 'send' && currentStudent && (
        <ComplimentSendFlow
          currentStudent={currentStudent}
          allStudents={students}
          dailyLimit={settings.dailyLimit}
          onGoBack={() => setView('studentHome')}
          onFinish={() => {
            reloadData();
            setView('studentHome');
          }}
        />
      )}

      {/* 4. 내 칭찬함 (AI 요약 로봇 + TTS) */}
      {view === 'mybox' && currentStudent && (
        <StudentMyBox
          student={currentStudent}
          onGoBack={() => setView('studentHome')}
          onOpenSendCompliment={() => setView('send')}
        />
      )}

      {/* 5. 전자칠판 전용 학급 대시보드 */}
      {view === 'board' && (
        <ClassroomBoard
          students={students}
          records={records}
          classNameTitle={settings.className}
          onGoBack={() => setView('login')}
        />
      )}

      {/* 6. 교사용 관리자 대시보드 */}
      {view === 'teacher' && (
        <TeacherDashboard
          students={students}
          records={records}
          settings={settings}
          onGoBack={() => setView('login')}
          onUpdateStudents={(updated) => setStudents(updated)}
          onUpdateSettings={(updated) => setSettings(updated)}
        />
      )}
    </main>
  );
}
