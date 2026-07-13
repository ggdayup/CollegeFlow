/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, School, Sparkles, User, GraduationCap, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Student {
  workspaceId: string;
  email: string;
  name: string | null;
  inviteAccepted: boolean;
  profileComplete: boolean;
  gpa: number | null;
  satScore: number | null;
}

interface LoggedInSearchViewProps {
  language: 'zh' | 'zht' | 'en';
  user: any;
  impersonatedStudent: Student | null;
  setImpersonatedStudent: (student: Student | null) => void;
  onSearch: (query: string) => void;
}

const t = (zh: string, en: string, lang: 'zh' | 'zht' | 'en') => (lang === 'en' ? en : zh);

export default function LoggedInSearchView({
  language,
  user,
  impersonatedStudent,
  setImpersonatedStudent,
  onSearch,
}: LoggedInSearchViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [showImpersonationMenu, setShowImpersonationMenu] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCounselor = user?.userType === 'COUNSELOR' || user?.role === 'COUNSELOR';

  // Load connected students if the user is a counselor
  useEffect(() => {
    if (!isCounselor) return;

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await fetch('/api/counselor/students', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error('Failed to load students for impersonation', err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [isCounselor]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowImpersonationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleQuickTagClick = (tagValue: string) => {
    onSearch(tagValue);
  };

  const tr = (zh: string, en: string) => t(zh, en, language);

  const quickTags = [
    { label: tr('计算机科学', 'Computer Science'), value: '计算机' },
    { label: tr('哈佛大学', 'Harvard'), value: '哈佛' },
    { label: tr('斯坦福大学', 'Stanford'), value: '斯坦福' },
    { label: tr('金融与经济', 'Finance & Econ'), value: '经济' },
    { label: tr('人工智能', 'AI'), value: '人工智能' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 md:px-8 py-12 select-none">
      
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Counselor Simulation Bar */}
      {isCounselor && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 w-full max-w-lg z-30"
          ref={dropdownRef}
        >
          <div className="relative">
            <button
              onClick={() => setShowImpersonationMenu(!showImpersonationMenu)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/80 backdrop-blur-md hover:bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm text-sm font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${impersonatedStudent ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                  <User className="w-4 h-4" />
                </div>
                <span>
                  {impersonatedStudent 
                    ? tr(`🎯 正在模拟: ${impersonatedStudent.name || impersonatedStudent.email} (GPA: ${impersonatedStudent.gpa || 'N/A'}, SAT: ${impersonatedStudent.satScore || 'N/A'})`, `🎯 Simulating: ${impersonatedStudent.name || impersonatedStudent.email} (GPA: ${impersonatedStudent.gpa || 'N/A'}, SAT: ${impersonatedStudent.satScore || 'N/A'})`)
                    : tr('🎯 模拟学生上下文: 全局搜索 (无匹配推荐)', '🎯 Simulate Student Context: Global (No Matching)')
                  }
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showImpersonationMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showImpersonationMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-40 max-h-64 overflow-y-auto"
                >
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => {
                        setImpersonatedStudent(null);
                        setShowImpersonationMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 cursor-pointer"
                    >
                      <span>{tr('全局默认 (无模拟)', 'Global Default (No Impersonation)')}</span>
                      {!impersonatedStudent && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    {loadingStudents ? (
                      <div className="flex items-center justify-center py-4 text-slate-400 text-xs">
                        <div className="w-4 h-4 border-2 border-slate-350 border-t-transparent rounded-full animate-spin mr-2" />
                        Loading connected students...
                      </div>
                    ) : students.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-xs italic">
                        {tr('暂无绑定的学生', 'No students connected yet')}
                      </div>
                    ) : (
                      students.map((student) => (
                        <button
                          key={student.workspaceId}
                          onClick={() => {
                            setImpersonatedStudent(student);
                            setShowImpersonationMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-blue-50/50 hover:text-blue-700 text-slate-700 cursor-pointer transition-colors"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-slate-800">{student.name || student.email}</span>
                            <span className="text-[10px] text-slate-400">
                              {student.gpa ? `GPA: ${student.gpa}` : 'No GPA'} | {student.satScore ? `SAT: ${student.satScore}` : 'No SAT'}
                            </span>
                          </div>
                          {impersonatedStudent?.workspaceId === student.workspaceId && (
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Main Logo & Subhead */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 border border-blue-100 rounded-3xl mb-4 shadow-sm">
          <Sparkles className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
          CollegeFlow
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-3 max-w-md mx-auto">
          {tr('一站式美国本科院校与专业智能搜索决策系统', 'AI-Powered University and Career Selection Engine')}
        </p>
      </motion.div>

      {/* Search Input Bar */}
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSearchSubmit}
        className="w-full max-w-2xl bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 rounded-3xl shadow-md p-1.5 flex items-center transition-all duration-200 mb-6"
      >
        <div className="pl-4 pr-2 text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={tr('搜索大学（如哈佛、纽约大学）或专业（如计算机、金融）...', 'Search universities or majors (e.g., Computer Science, NYU)...')}
          className="flex-1 bg-transparent border-none py-3 text-slate-800 text-base placeholder-slate-400 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={!searchQuery.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-750 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl text-sm font-bold transition-all shadow-sm cursor-pointer shrink-0"
        >
          {tr('搜 索', 'Search')}
        </button>
      </motion.form>

      {/* Quick suggestions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-2 max-w-xl text-center"
      >
        <span className="text-xs font-semibold text-slate-400 mr-1">{tr('热门搜索:', 'Trending:')}</span>
        {quickTags.map((tag) => (
          <button
            key={tag.label}
            onClick={() => handleQuickTagClick(tag.value)}
            className="px-3 py-1.5 bg-slate-150 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-xl text-xs font-medium border border-transparent hover:border-blue-100 transition-all cursor-pointer"
          >
            {tag.label}
          </button>
        ))}
      </motion.div>

      {/* Premium Category Blocks */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl mt-16"
      >
        <div 
          onClick={() => handleQuickTagClick('STEM')}
          className="p-5 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{tr('STEM 专业透视', 'STEM Career Outlook')}</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {tr('深度追踪全美高薪理工科专业，涵盖AI、芯片设计等前沿人才流动。', 'Deep-dive tracking of highest paid tech careers in AI, semiconductors, and software.')}
          </p>
        </div>

        <div 
          onClick={() => handleQuickTagClick('哈佛')}
          className="p-5 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
            <School className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{tr('顶尖标杆院校', 'Prestige Universities')}</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {tr('包含常春藤盟校及顶级名校录取偏好与各学院专业结构地图。', 'IVY leagues and elite benchmark institutions admissions criteria and program layout.')}
          </p>
        </div>

        <div 
          onClick={() => handleQuickTagClick('ROI')}
          className="p-5 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl transition-all hover:shadow-md cursor-pointer group sm:col-span-2 lg:col-span-1"
        >
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{tr('学费投资回报比', 'High ROI Explorer')}</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {tr('科学分析全美主要高校性价比，合理规划学费投入与未来薪资回报。', 'Accurate cost-to-salary ROI mapping to plan your tuition investment against career outcomes.')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
