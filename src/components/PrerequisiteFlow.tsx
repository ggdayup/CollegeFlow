/**
 * PrerequisiteFlow Component
 * 
 * Demonstrates a highly premium, interactive, and draggable semester course timeline.
 * Utilizes motion/react for draggable physics-bound timeline sliding and interactive SVG
 * arc curves mapping prerequisite connections dynamically on hover/click.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'motion/react';
import { Cpu, ArrowRight, Layers, Sparkles, MoveHorizontal } from 'lucide-react';
import { toTraditional } from '../utils/chineseLocalization';

interface CourseNode {
  id: string;
  code: string;
  nameZh: string;
  nameEn: string;
  semester: number; // 1, 2, 3, 4
  prereqs: string[]; // ids of prerequisite courses
  coreqs?: string[]; // ids of co-requisites
  color: string;
  credits: number;
}

interface PrerequisiteFlowProps {
  language: 'zh' | 'zht' | 'en';
}

export default function PrerequisiteFlow({ language }: PrerequisiteFlowProps) {
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // Create refs to calculate SVG connection coordinates
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const courseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const t = (zh: string, en: string) => {
    if (language === 'zh') return zh;
    if (language === 'zht') return toTraditional(zh);
    return en;
  };

  // Coordinate connections state
  const [connections, setConnections] = useState<Array<{
    fromId: string;
    toId: string;
    path: string;
    active: boolean;
  }>>([]);

  const rawCourses: CourseNode[] = [
    // Semester 1
    {
      id: 'cs101',
      code: 'CS 101',
      nameZh: '计算机导论',
      nameEn: 'Intro to CS',
      semester: 1,
      prereqs: [],
      color: '#3b82f6', // blue-500
      credits: 4
    },
    {
      id: 'math115',
      code: 'MATH 115',
      nameZh: '微积分 I',
      nameEn: 'Calculus I',
      semester: 1,
      prereqs: [],
      color: '#10b981', // emerald-500
      credits: 4
    },
    // Semester 2
    {
      id: 'cs203',
      code: 'CS 203',
      nameZh: '数据结构与分析',
      nameEn: 'Data Structures',
      semester: 2,
      prereqs: ['cs101'],
      color: '#3b82f6',
      credits: 4
    },
    {
      id: 'math116',
      code: 'MATH 116',
      nameZh: '微积分 II',
      nameEn: 'Calculus II',
      semester: 2,
      prereqs: ['math115'],
      color: '#10b981',
      credits: 4
    },
    // Semester 3
    {
      id: 'cs381',
      code: 'CS 381',
      nameZh: '算法设计与分析',
      nameEn: 'Algorithm Design',
      semester: 3,
      prereqs: ['cs203'],
      color: '#8b5cf6', // purple-500
      credits: 4
    },
    {
      id: 'stats250',
      code: 'STATS 250',
      nameZh: '概率统计基础',
      nameEn: 'Intro to Stats',
      semester: 3,
      prereqs: ['math116'],
      color: '#f59e0b', // amber-500
      credits: 3
    },
    // Semester 4
    {
      id: 'cs485',
      code: 'CS 485',
      nameZh: '分布式系统',
      nameEn: 'Distributed Systems',
      semester: 4,
      prereqs: ['cs381'],
      color: '#ec4899', // pink-500
      credits: 4
    },
    {
      id: 'cs423',
      code: 'CS 423',
      nameZh: '实用深度学习',
      nameEn: 'Practical Deep Learning',
      semester: 4,
      prereqs: ['cs381', 'stats250'],
      color: '#f43f5e', // rose-500
      credits: 4
    }
  ];

  const courses = useMemo(() => {
    if (language !== 'zht') return rawCourses;
    return rawCourses.map(c => ({
      ...c,
      nameZh: toTraditional(c.nameZh)
    }));
  }, [language]);

  // Function to calculate SVG arc paths between course blocks
  const updatePaths = () => {
    if (!timelineRef.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newConnections: Array<{
      fromId: string;
      toId: string;
      path: string;
      active: boolean;
    }> = [];

    courses.forEach(course => {
      course.prereqs.forEach(prereqId => {
        const fromEl = courseRefs.current[prereqId];
        const toEl = courseRefs.current[course.id];

        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();

          // Calculate center connection points relative to container SVG coordinate system
          const x1 = fromRect.right - containerRect.left;
          const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
          const x2 = toRect.left - containerRect.left;
          const y2 = toRect.top + toRect.height / 2 - containerRect.top;

          // Build a smooth cubic/quadratic bezier curve to prevent straight overlapping lines
          const dx = x2 - x1;
          const dy = y2 - y1;
          
          // Mid points
          const mx = x1 + dx / 2;
          const my = y1 + dy / 2 - (dx > 120 ? Math.min(dx / 5, 30) : 10); // curve upward slightly

          const path = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
          
          // Determine if this specific connection is active/highlighted
          const currentHighlight = hoveredCourse || activeCourse;
          const isFromHighlight = currentHighlight === prereqId;
          const isToHighlight = currentHighlight === course.id;
          
          const active = !!currentHighlight && (isFromHighlight || isToHighlight);

          newConnections.push({
            fromId: prereqId,
            toId: course.id,
            path,
            active
          });
        }
      });
    });

    setConnections(newConnections);
  };

  // Recalculate positions on drag/resize/scroll
  useEffect(() => {
    updatePaths();
    
    // Add event listener for window resize
    window.addEventListener('resize', updatePaths);
    return () => {
      window.removeEventListener('resize', updatePaths);
    };
  }, [hoveredCourse, activeCourse, dragActive]);

  // Trigger coordinate calculations frequently when dragging is active
  const handleDrag = () => {
    updatePaths();
  };

  const activeFocusCourse = courses.find(c => c.id === (hoveredCourse || activeCourse));

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden" ref={containerRef} id="prereq-flow-panel">
      <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[50px] pointer-events-none" />
      
      {/* 1. Header Information Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6 z-10">
        <div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            {t('学年先修课程路线图', 'Interactive Academic Path & Prerequisite Flow')}
          </h3>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            {t(
              '使用鼠标横向拖拽时间轴；鼠标移至具体课程上，即刻点亮其上下游前置与后续的依赖线弧。',
              'Drag the timeline horizontally to explore semesters. Hover/Click a course to reveal prerequisites.'
            )}
          </p>
        </div>

        {/* Swipe prompt banner */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-500 animate-pulse">
          <MoveHorizontal className="w-3.5 h-3.5" />
          <span>{t('横向滑动时间轴', 'Swipe / Drag Timeline')}</span>
        </div>
      </div>

      {/* 2. Drag Container Box with bounding limits */}
      <div className="relative overflow-hidden w-full h-80 rounded-2xl bg-slate-50/60 border border-slate-200/80 p-6 select-none cursor-grab active:cursor-grabbing">
        
        {/* Connection Curves SVG Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {connections.map((conn, idx) => (
            <React.Fragment key={idx}>
              {/* Backing structural curve */}
              <path
                d={conn.path}
                fill="transparent"
                stroke={conn.active ? '#3b82f6' : '#e2e8f0'}
                strokeWidth={conn.active ? 3 : 1.5}
                className="transition-all duration-300"
              />
              
              {/* Glowing Overlay Curve on interaction */}
              {conn.active && (
                <path
                  d={conn.path}
                  fill="transparent"
                  stroke="#60a5fa"
                  strokeWidth={4}
                  strokeLinecap="round"
                  filter="url(#glow)"
                  className="opacity-70 animate-pulse"
                />
              )}
            </React.Fragment>
          ))}
        </svg>

        {/* Timeline Slidable Grid Board */}
        <motion.div
          ref={timelineRef}
          drag="x"
          dragConstraints={{ left: -320, right: 0 }}
          onDrag={handleDrag}
          onDragStart={() => setDragActive(true)}
          onDragEnd={() => setDragActive(false)}
          className="absolute flex gap-12 h-full items-center pl-4 pr-16"
          style={{ width: '1200px' }}
        >
          {[1, 2, 3, 4].map((semIdx) => (
            <div key={semIdx} className="flex flex-col w-56 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-sm h-64 justify-between relative shrink-0">
              <div className="absolute -top-3 left-4 px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-black font-mono tracking-widest uppercase">
                SEM {semIdx}
              </div>
              
              <div className="flex flex-col gap-3 justify-center h-full pt-2">
                {courses
                  .filter(c => c.semester === semIdx)
                  .map((course) => {
                    const isHovered = hoveredCourse === course.id;
                    const isActive = activeCourse === course.id;
                    const isRelated = connections.some(
                      c => c.active && (c.fromId === course.id || c.toId === course.id)
                    );
                    
                    let bgClass = 'bg-white border-slate-200 text-slate-800 hover:border-slate-350 hover:shadow-xs';
                    if (isActive || isHovered) {
                      bgClass = 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100/50 scale-102';
                    } else if (isRelated) {
                      bgClass = 'bg-blue-50 border-blue-200 text-blue-900 ring-1 ring-blue-100';
                    }

                    return (
                      <div
                        key={course.id}
                        ref={el => { courseRefs.current[course.id] = el; }}
                        onMouseEnter={() => setHoveredCourse(course.id)}
                        onMouseLeave={() => setHoveredCourse(null)}
                        onClick={() => setActiveCourse(isActive ? null : course.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between h-20 ${bgClass}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black font-mono tracking-wider ${isActive || isHovered ? 'text-blue-100' : 'text-slate-400'}`}>
                            {course.code}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive || isHovered ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {course.credits} Cr
                          </span>
                        </div>
                        
                        <h4 className="text-xs font-bold truncate tracking-tight mt-1">
                          {language !== 'en' ? course.nameZh : course.nameEn}
                        </h4>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 3. Dynamic Sidebar details of selected/hovered nodes */}
      <AnimatePresence mode="wait">
        {activeFocusCourse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 bg-blue-50/40 border border-blue-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 shadow-xs mt-0.5">
                <Cpu className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600">{activeFocusCourse.code}</span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs font-bold text-slate-700">{activeFocusCourse.credits} {t('学分', 'Credits')}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                  {language !== 'en' ? activeFocusCourse.nameZh : activeFocusCourse.nameEn}
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeFocusCourse.prereqs.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t('前置要求', 'PREREQUISITES')}:</span>
                  <span className="font-bold text-slate-700">
                    {activeFocusCourse.prereqs.map(pId => courses.find(c => c.id === pId)?.code).join(', ')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('无先修要求（新生友好）', 'No Prerequisite requirements')}</span>
                </div>
              )}
              
              {courses.some(c => c.prereqs.includes(activeFocusCourse.id)) && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100">
                  <span>{t('开启后续', 'Unlocks')}:</span>
                  <span className="font-bold">
                    {courses.filter(c => c.prereqs.includes(activeFocusCourse.id)).map(c => c.code).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
