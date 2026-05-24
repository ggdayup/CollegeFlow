/**
 * CreditBento Component
 * 
 * Renders a premium Glassmorphic Bento grid section visualizing major credit distributions.
 * Includes a responsive, animated interactive SVG donut chart with hover effects and detailed
 * card layouts showing credit category breakdowns.
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle, Percent, GraduationCap, HelpCircle } from 'lucide-react';
import { toTraditional } from '../utils/chineseLocalization';

interface CreditCategory {
  id: string;
  nameZh: string;
  nameEn: string;
  credits: number;
  color: string;
  hoverColor: string;
  descriptionZh: string;
  descriptionEn: string;
  coursesZh: string[];
  coursesEn: string[];
}

interface CreditBentoProps {
  language: 'zh' | 'zht' | 'en';
  totalCredits?: number;
  categories?: CreditCategory[];
}

export default function CreditBento({ language, totalCredits = 120, categories }: CreditBentoProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>('core');

  const t = (zh: string, en: string) => {
    if (language === 'zh') return zh;
    if (language === 'zht') return toTraditional(zh);
    return en;
  };

  // Realistic default categories representing a premium Bachelor of Science / Bachelor of Arts curriculum
  const defaultCategories: CreditCategory[] = [
    {
      id: 'core',
      nameZh: '专业必修课',
      nameEn: 'Core Major Requirements',
      credits: 60,
      color: '#2563eb', // blue-600
      hoverColor: '#3b82f6', // blue-500
      descriptionZh: '涵盖本专业的核心理论与实践课程，是专业学术水平的基石。',
      descriptionEn: 'Core academic theories, advanced methodologies, and specialized labs forming the degree baseline.',
      coursesZh: ['算法与数据结构', '系统设计与分析', '专业实践实习', '高级专题研讨'],
      coursesEn: ['Algorithms & Data Structures', 'Systems Design & Analysis', 'Professional Practicum', 'Advanced Seminar']
    },
    {
      id: 'gened',
      nameZh: '通识教育必修',
      nameEn: 'General Education',
      credits: 36,
      color: '#0d9488', // teal-600
      hoverColor: '#14b8a6', // teal-500
      descriptionZh: '跨学科综合素质培养，包括人文科学、社会科学及数理基础。',
      descriptionEn: 'Broad-based critical reasoning, writing foundational series, quantitative skills, and global cultures.',
      coursesZh: ['微积分与线性代数', '大学写作与修辞', '科技伦理学', '多元文化与历史'],
      coursesEn: ['Calculus & Linear Algebra', 'Expository Rhetoric & Composition', 'Ethics in Tech & Science', 'Global Cultures & History']
    },
    {
      id: 'electives',
      nameZh: '专业选修课',
      nameEn: 'Major Electives',
      credits: 18,
      color: '#d97706', // amber-600
      hoverColor: '#f59e0b', // amber-500
      descriptionZh: '支持个性化发展，学生可根据职业规划选择细分方向。',
      descriptionEn: 'Customizable specialization pathways aligning to personal research or industry career plans.',
      coursesZh: ['机器学习导论', '全栈 Web 开发', '分布式系统安全', '云原生计算'],
      coursesEn: ['Intro to Machine Learning', 'Full-Stack Web Engineering', 'Distributed Systems Security', 'Cloud-Native Computing']
    },
    {
      id: 'capstone',
      nameZh: '毕业设计与综合项目',
      nameEn: 'Capstone Project / Thesis',
      credits: 6,
      color: '#e11d48', // rose-600
      hoverColor: '#f43f5e', // rose-500
      descriptionZh: '毕业前的大型团队协作或独立学术研究，结合实际问题提供解决方案。',
      descriptionEn: 'Final year senior group design project or intensive research thesis solving an industry-relevant problem.',
      coursesZh: ['毕业学术论文', '企业级联合课题'],
      coursesEn: ['Senior Honors Thesis', 'Enterprise Industry Capstone']
    }
  ];

  const activeCategories = useMemo(() => {
    const raw = categories || defaultCategories;
    if (language !== 'zht') return raw;
    return raw.map(cat => ({
      ...cat,
      nameZh: toTraditional(cat.nameZh),
      descriptionZh: toTraditional(cat.descriptionZh),
      coursesZh: cat.coursesZh.map(toTraditional)
    }));
  }, [categories, language]);

  const currentCategoryObj = activeCategories.find(c => c.id === (activeCategory || 'core')) || activeCategories[0];

  // Calculate coordinates for SVG donut chart segments
  let accumulatedAngle = 0;
  const radius = 70;
  const strokeWidth = 24;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full font-sans" id="credit-bento-grid">
      
      {/* 1. Interactive SVG Donut Chart Bento Box (4 columns) */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-between shadow-xs relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/10 transition-all duration-350" />
        
        <div className="w-full flex items-center justify-between mb-4 z-10">
          <div>
            <h4 className="text-slate-900 font-extrabold text-base tracking-tight">
              {t('学分结构配比', 'Credit Ratio Anatomy')}
            </h4>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {t('总要求 120 学分', '120 Total Credits Required')}
            </p>
          </div>
          <div className="p-2 bg-blue-50/80 rounded-xl border border-blue-100 shadow-xs">
            <Percent className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* SVG Donut Container */}
        <div className="relative w-56 h-56 flex items-center justify-center select-none">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {activeCategories.map((category) => {
              const percentage = category.credits / totalCredits;
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedAngle * circumference;
              
              accumulatedAngle += percentage;
              
              const isHovered = hoveredSegment === category.id;
              const isActive = activeCategory === category.id;

              return (
                <circle
                  key={category.id}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={category.color}
                  strokeWidth={isActive ? strokeWidth + 4 : isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredSegment(category.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredSegment(null);
                  }}
                  onClick={() => {
                    setActiveCategory(category.id);
                  }}
                />
              );
            })}
          </svg>

          {/* Core Info Overlaid inside Donut Center */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={hoveredSegment || activeCategory || 'total'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center"
              >
                {(() => {
                  const displayId = hoveredSegment || activeCategory;
                  const selectedCat = activeCategories.find(c => c.id === displayId);
                  
                  if (selectedCat) {
                    return (
                      <>
                        <span className="text-[28px] font-black font-mono text-slate-800 leading-none">
                          {selectedCat.credits}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                          {language !== 'en' ? selectedCat.nameZh.substring(0, 6) : selectedCat.nameEn.substring(0, 10)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {((selectedCat.credits / totalCredits) * 100).toFixed(0)}%
                        </span>
                      </>
                    );
                  }

                  return (
                    <>
                      <span className="text-[32px] font-black font-mono text-slate-800 leading-none">
                        {totalCredits}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                        {t('总要求学分', 'TOTAL CREDITS')}
                      </span>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Legend pills underneath */}
        <div className="grid grid-cols-2 gap-2 w-full mt-4">
          {activeCategories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-50 border-slate-350 border-slate-300 ring-1 ring-slate-200'
                    : 'bg-transparent border-transparent hover:bg-slate-50/50'
                }`}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: category.color }} 
                />
                <div className="truncate">
                  <span className="text-slate-800 text-[11px] font-bold block truncate">
                    {language !== 'en' ? category.nameZh : category.nameEn}
                  </span>
                  <span className="text-slate-400 text-[9.5px] font-mono block">
                    {category.credits} Credits ({((category.credits / totalCredits) * 100).toFixed(0)}%)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Detailed Category Showcase Bento Box (7 columns) */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-teal-500/10 transition-all duration-350" />

        <div className="z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">
                {t('课程配比细节', 'CURRICULUM BREAKDOWN')}
              </span>
              <h4 className="text-slate-900 font-extrabold text-lg tracking-tight mt-0.5">
                {language !== 'en' ? currentCategoryObj.nameZh : currentCategoryObj.nameEn}
              </h4>
            </div>
            <div 
              className="px-3 py-1.5 rounded-xl text-white text-xs font-mono font-bold shadow-sm"
              style={{ backgroundColor: currentCategoryObj.color }}
            >
              {currentCategoryObj.credits} Credits
            </div>
          </div>

          <p className="text-slate-600 text-xs md:text-sm leading-relaxed border-l-2 pl-4 py-1" style={{ borderColor: currentCategoryObj.color }}>
            {language !== 'en' ? currentCategoryObj.descriptionZh : currentCategoryObj.descriptionEn}
          </p>

          {/* Interactive Core Courses Highlights Cards */}
          <div className="mt-6">
            <h5 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {t('代表性高频核心课程', 'Representative Foundation Courses')}
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(language !== 'en' ? currentCategoryObj.coursesZh : currentCategoryObj.coursesEn).map((course, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 3 }}
                  className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-slate-100/50 hover:border-slate-350 transition-colors group/card"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-800 text-xs font-bold block group-hover/card:text-blue-600 transition-colors">
                      {course}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      3 Credits | {t('学前研讨班', 'Undergraduate core')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Premium Metrics Card Overlay at the bottom */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 border border-slate-200 rounded-xl">
              <GraduationCap className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <span className="text-slate-800 text-xs font-bold block">
                {t('学士学位要求', 'Bachelor of Science Track')}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {t('满足全美 AACSB 或 ABET 专业质量认证标准', 'Standard 120 credit hour program, ABET / AACSB accredited.')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('如何转移学分？', 'Credit Transfer Guide')}</span>
          </div>
        </div>

      </div>
      
    </div>
  );
}
