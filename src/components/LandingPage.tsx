import { toTraditional } from '../utils/chineseLocalization';
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  School,
  Trophy,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  X,
  Cpu,
  Compass,
  BookOpen,
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  language: 'zh' | 'zht' | 'en';
  isLoggedIn: boolean;
  onTriggerAuth: () => void;
  onSearch: (query: string) => void;
  onNavigateToDashboard: (view: 'national' | 'benchmark') => void;
  onTriggerMajorLink: (majorId: string) => void;
}

interface SuggestionTag {
  label: string;
  value: string;
}

export default function LandingPage({
  language,
  isLoggedIn,
  onTriggerAuth,
  onSearch,
  onNavigateToDashboard,
  onTriggerMajorLink,
}: LandingPageProps) {
  const t = (zh: string, en: string) => {
    if (language === 'zh') return zh;
    if (language === 'zht') return toTraditional(zh);
    return en;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestionTagGroups: { label: string; tags: SuggestionTag[] }[] = [
    {
      label: t('你想去哪个国家', 'Country'),
      tags: [
        { label: t('美', 'US'), value: t('美国', 'United States') },
        { label: t('加', 'CA'), value: t('加拿大', 'Canada') },
        { label: t('英', 'UK'), value: t('英国', 'United Kingdom') },
        { label: t('澳', 'AU'), value: t('澳洲', 'Australia') },
      ],
    },
    {
      label: t('你想学什么专业', 'Major'),
      tags: [
        { label: t('计算机', 'CS'), value: t('计算机', 'Computer Science') },
        { label: t('经济', 'Economics'), value: t('经济', 'Economics') },
      ],
    },
    {
      label: t('你想去哪个学校', 'University'),
      tags: [
        { label: t('哈佛', 'Harvard'), value: t('哈佛', 'Harvard') },
        { label: t('斯坦福', 'Stanford'), value: t('斯坦福', 'Stanford') },
      ],
    },
  ];

  const salaryExplorerTag: SuggestionTag = {
    label: t('我想看看这个专业赚多少钱', 'Salary Explorer'),
    value: t('薪资探索', 'Salary Explorer'),
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleTagClick = (tagValue: string) => {
    if (inputFocused && searchQuery.trim()) {
      setSearchQuery((prev) => prev.trim() + ' ' + tagValue);
      inputRef.current?.focus();
    } else {
      onSearch(tagValue);
    }
  };

  useEffect(() => {
    if (searchQuery && !inputFocused) {
      onSearch(searchQuery);
    }
  }, []);

  const handleStatCardClick = (target: 'national' | 'benchmark' | 'roi' | 'course') => {
    if (!isLoggedIn) {
      onTriggerAuth();
      return;
    }
    if (target === 'national' || target === 'benchmark') {
      onNavigateToDashboard(target);
    }
    const elementId = target === 'national'
      ? 'broad-fields-heading'
      : target === 'benchmark'
        ? 'university-navigator-heading'
        : target === 'roi'
          ? 'roi-charts-heading'
          : 'prerequisite-flow-heading';

    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleUpgradeClick = (planName: string) => {
    if (!isLoggedIn) {
      onTriggerAuth();
      return;
    }
    setSelectedPlan(planName);
    setShowPricingModal(true);
  };

  return (
    <div className="relative overflow-hidden bg-slate-50">

      {/* Google-Simple 100vh Hero */}
      <header className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight">
            CollegeFlow
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            {t('高校毕业生薪资与行业人才供求透视', 'College Major ROI & Career Intelligence')}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSearchSubmit}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="w-full max-w-2xl mb-6"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setTimeout(() => setInputFocused(false), 200)}
              className="block w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-full text-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg hover:shadow-xl transition-all"
              placeholder={t('搜索大学、专业或职业方向...', 'Search university, major, or career path...')}
            />
          </div>
        </motion.form>

        {/* Suggestion Tags */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="max-w-2xl w-full space-y-3"
        >
          {suggestionTagGroups.map((group) => (
            <div key={group.label} className="flex items-center gap-2 text-sm">
              <span className="text-xs text-slate-400 shrink-0 w-24 text-right">{group.label}</span>
              <div className="flex gap-2 flex-wrap">
                {group.tags.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => handleTagClick(tag.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {/* Salary Explorer */}
          <div className="flex items-center gap-2 text-sm justify-center pt-1">
            <button
              onClick={() => handleTagClick(salaryExplorerTag.value)}
              className="px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700 hover:border-amber-400 hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <DollarSign className="w-3 h-3" />
              {salaryExplorerTag.label}
            </button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute bottom-8 flex flex-col items-center gap-1 text-slate-300"
        >
          <span className="text-xs">{t('向下探索更多', 'Explore more below')}</span>
          <ArrowRight className="w-4 h-4 rotate-90" />
        </motion.div>
      </header>

      {/* Product Bento Showcase — below fold, unchanged */}
      <section className="py-20 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-900 mb-4">
              {t('核心智能分析看板', 'Core Intelligence Tools')}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
              {t('全维度交叉互联的统计图表，助您打通“学术路径 ➔ 院校选择 ➔ 课程规划 ➔ 职场薪资回报”的完整链路。', 'Explore multidimensional data to align academic pursuits with real-world market demands.')}
            </p>
          </div>

          {/* Interactive 4-block Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Block 1 (Large 2-span): National Career Outlook */}
            <div 
              onClick={() => handleStatCardClick('national')}
              className="border border-slate-200 hover:border-blue-400 rounded-2xl md:col-span-2 p-8 h-96 relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md bg-slate-50/50"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-700" />
                  <h3 className="text-xl font-bold font-outfit text-slate-900">
                    {t('全美专业近况透视', 'National Career Outlook')}
                  </h3>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md">
                  {t('多维度热力筛选及起薪对比，直观展示 8 大门类、16 大细分方向的 152 个专业的近期毕业生及黄金成熟期薪资中位数。', 'Real-time heatmaps and trend lines tracking demand shifts and median earnings across 152 bachelor majors.')}
                </p>
              </div>
              
              {/* Inner Decorative Representation of charts */}
              <div className="absolute right-0 bottom-0 w-2/3 h-1/2 rounded-tl-2xl border-t border-l border-slate-200/80 bg-white shadow-inner overflow-hidden flex items-end justify-center p-4">
                <div className="w-full h-full bg-slate-50 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-[10px] font-bold text-slate-400">
                    <span>{t('学科方向', 'FIELD')}</span>
                    <span>{t('起薪/成熟期', 'SALARY')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">CS & Math</span>
                    <span className="font-mono text-emerald-600 font-bold">$78k / $124k</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Petroleum Eng</span>
                    <span className="font-mono text-emerald-600 font-bold">$97k / $146k</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Business Comms</span>
                    <span className="font-mono text-blue-600 font-bold">$54k / $94k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 2 (Small 1-span): Benchmark Universities Map */}
            <div 
              onClick={() => handleStatCardClick('benchmark')}
              className="border border-slate-200 hover:border-blue-400 rounded-2xl p-8 h-96 relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md bg-white"
            >
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <School className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xl font-bold font-outfit text-slate-900">
                    {t('标杆名校专业地图', 'Benchmark Universities')}
                  </h3>
                </div>
                <p className="text-slate-500 text-xs mb-6">
                  {t('以 UMich (密歇根大学安娜堡分校) 和 Rice (莱斯大学) 为标杆，绘制高校内设学术部门与毕业生流向关系网。', 'Map departments, admissions stats, and specific graduate placement metrics at elite institutions.')}
                </p>
                <div className="flex-grow rounded-xl border border-slate-150 bg-slate-50/70 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-blue-600 bg-white shadow-sm flex items-center justify-center z-10">
                    <School className="w-5 h-5 text-blue-600" />
                  </div>
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line stroke="#cbd5e1" strokeDasharray="3" strokeWidth="1.5" x1="50%" x2="20%" y1="50%" y2="20%" />
                    <line stroke="#cbd5e1" strokeDasharray="3" strokeWidth="1.5" x1="50%" x2="80%" y1="50%" y2="25%" />
                    <line stroke="#cbd5e1" strokeDasharray="3" strokeWidth="1.5" x1="50%" x2="30%" y1="50%" y2="80%" />
                  </svg>
                  <span className="absolute top-2 left-2 bg-white px-2 py-0.5 border border-slate-200 text-[9px] rounded-md font-bold text-slate-500">UMICH</span>
                  <span className="absolute bottom-2 right-2 bg-white px-2 py-0.5 border border-slate-200 text-[9px] rounded-md font-bold text-slate-500">RICE</span>
                </div>
              </div>
            </div>

            {/* Block 3 (Small 1-span): Salary Lifecycle ROI */}
            <div 
              onClick={() => handleStatCardClick('roi')}
              className="border border-slate-200 rounded-2xl p-8 h-96 relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md bg-slate-950 text-white"
            >
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xl font-bold font-outfit text-white">
                    {t('专业 ROI 回报曲线', 'Salary Lifecycle ROI')}
                  </h3>
                </div>
                <p className="text-slate-400 text-xs mb-6">
                  {t('40年职场生命周期的收入折线，支持生活成本(Cost-of-Living)调整，量化大学投资学费的黄金回收期。', 'Project 40-year occupational lifecycles with local Cost-of-Living adjustments.')}
                </p>
                <div className="flex-grow flex items-end justify-between px-2 pb-4 border-b border-slate-800 relative">
                  <div className="w-6 bg-slate-800 rounded-t-xs h-1/4" />
                  <div className="w-6 bg-slate-700 rounded-t-xs h-1/3" />
                  <div className="w-6 bg-blue-700 rounded-t-xs h-1/2" />
                  <div className="w-6 bg-blue-600 rounded-t-xs h-2/3" />
                  <div className="w-6 bg-emerald-500 rounded-t-xs h-5/6 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[9px] font-bold py-0.5 px-1.5 rounded">$146k</span>
                  </div>
                  
                  {/* Decorative ROI Curve line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M 0 85 Q 20 70, 45 55 T 85 20 T 100 15" fill="none" stroke="#f59e0b" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Block 4 (Large 2-span): Course Draggable Bento */}
            <div 
              onClick={() => handleStatCardClick('course')}
              className="border border-slate-200 hover:border-amber-400 rounded-2xl md:col-span-2 p-8 h-96 relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md bg-slate-50/50"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xl font-bold font-outfit text-slate-900">
                    {t('专业核心主修课程流', 'Prerequisite Course Flow')}
                  </h3>
                </div>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md">
                  {t('节点化展示专业毕业必修课程序列及学分要求。支持卡片拖拽与连线动态渲染，清晰梳理核心先修课与毕业阻碍。', 'Explore interactive graduation prerequisites, course credits, and draggable bento blocks.')}
                </p>
              </div>

              {/* Decorative course flowchart representations */}
              <div className="absolute right-6 bottom-6 w-3/4 h-1/2 flex gap-4">
                <div className="flex-1 bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col gap-2 transform -translate-y-3">
                  <div className="h-6 bg-slate-100 rounded flex items-center px-2 text-[9px] font-bold text-slate-400 uppercase">{t('核心基础', 'Requirements')}</div>
                  <div className="h-9 border border-blue-100 bg-blue-50/50 rounded-lg flex items-center px-3 text-xs text-blue-800 font-bold">CS 101</div>
                  <div className="h-9 border border-blue-100 bg-blue-50/50 rounded-lg flex items-center px-3 text-xs text-blue-800 font-bold">Data Structures</div>
                </div>
                <div className="flex-1 bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col gap-2 transform translate-y-3">
                  <div className="h-6 bg-slate-100 rounded flex items-center px-2 text-[9px] font-bold text-slate-400 uppercase">{t('进阶选修', 'Electives')}</div>
                  <div className="h-9 border border-amber-100 bg-amber-50/50 rounded-lg flex items-center px-3 text-xs text-amber-800 font-bold">Machine Learning</div>
                  <div className="h-9 border border-dashed border-slate-200 bg-slate-50 rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">Drop Here</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Insights Panel */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 mb-12 border-l-4 border-blue-700 pl-4">
            {t('毕业生职场洞察与预警', 'Market Intelligence Insights')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Insight 1: Peak Earners */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Trophy className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold font-outfit text-slate-900 mb-2">
                {t('薪资之冠 (Peak Earners)', 'Peak Earners')}
              </h4>
              <p className="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed">
                {t('石油工程、药学及数理计算机展现了无与伦比的投资回报率。石油工程在黄金成熟期以 $146,000 中位数年薪冠绝本科。', 'Top-tier major ROI analysis reveals massive long-term yields in petroleum engineering and quantitative STEM disciplines.')}
              </p>
              <button 
                onClick={() => handleStatCardClick('roi')}
                className="text-blue-700 font-semibold text-xs sm:text-sm hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{t('查看回报折线', 'View ROI Chart')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Insight 2: Caution Zones */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 hover:border-red-200 transition-colors">
              <div className="w-12 h-12 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold font-outfit text-slate-900 mb-2">
                {t('收入预警 (Caution Zones)', 'Income Warnings')}
              </h4>
              <p className="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed">
                {t('学前教育和咨询心理学起薪偏低且面临成熟期瓶颈，中位数仅为 $51,000 左右，建议搭配高增长性副修。', 'Data-driven warnings for saturated markets. Avoid high-debt, low-yield traditional disciplines without double-majors.')}
              </p>
              <button 
                onClick={() => handleStatCardClick('national')}
                className="text-blue-700 font-semibold text-xs sm:text-sm hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{t('筛选低回报学科', 'Filter Caution Fields')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Insight 3: Talent shifts */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 hover:border-amber-300 transition-colors">
              <div className="w-12 h-12 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold font-outfit text-slate-900 mb-2">
                {t('人才供给转移 (Talent Shifts)', 'Talent Shifts')}
              </h4>
              <p className="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed">
                {t('学位产出数据揭示了剧烈的供给转移：计算与数理部门产出在14年间暴增 +159%，而古典人文艺术类招生规模萎缩 -33%。', 'Detailing massive student demand shifts with computer engineering output growing +159% while humanities receded by -33%.')}
              </p>
              <button 
                onClick={() => handleStatCardClick('national')}
                className="text-blue-700 font-semibold text-xs sm:text-sm hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{t('查看供求趋势', 'See Ingestion Trends')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing / Plan Table (SaaS Features) */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-slate-200/60">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-slate-900 mb-4">
              {t('数据订阅服务方案', 'Data Access Plans')}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              {t('选择契合您规划需求的数据颗粒度，开启精细决策。', 'Choose the level of granularity required for your academic planning.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">

            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col h-full hover:border-slate-350 transition-all hover:shadow-md">
              <h3 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900">
                {t('标准免费版', 'Free')}
              </h3>
              <div className="text-4xl font-black font-outfit text-slate-900 my-6">
                $0<span className="text-base sm:text-lg font-medium text-slate-400">/mo</span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mb-8 border-b border-slate-100 pb-6">
                {t('适合学生探索基础数据', 'For students exploring college options.')}
              </p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t('1 次学校对比', '1 school comparison')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t('Top 50 美国院校基础数据', 'Top 50 US baseline data')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t('薪资与录取率概览', 'Salary & admissions overview')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400 text-xs sm:text-sm">
                  <X className="w-4 h-4 text-slate-350 shrink-0 mt-0.5" />
                  <span>{t('PDF 报告生成', 'PDF report generation')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400 text-xs sm:text-sm">
                  <X className="w-4 h-4 text-slate-350 shrink-0 mt-0.5" />
                  <span>{t('完整 ROI 分析', 'Full ROI analysis')}</span>
                </li>
              </ul>
              <button
                onClick={() => handleUpgradeClick(t('免费版', 'Free'))}
                className="w-full py-3 px-4 rounded-xl font-bold border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {t('开始使用', 'Get Started Free')}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-blue-950 rounded-2xl p-8 border border-blue-900 shadow-xl flex flex-col h-full transform md:-translate-y-4 relative group hover:shadow-2xl transition-all">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-blue-950 text-[10px] font-bold uppercase tracking-widest py-1 px-3.5 rounded-full shadow-md">
                {t('最受欢迎', 'Most Popular')}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-outfit text-white">
                {t('专业版', 'Pro')}
              </h3>
              <div className="text-4xl font-black font-outfit text-white my-6">
                $19<span className="text-base sm:text-lg font-medium text-blue-300">/mo</span>
              </div>
              <p className="text-blue-200 text-xs sm:text-sm mb-8 border-b border-blue-900 pb-6">
                {t('无限对比，完整数据，品牌报告', 'Unlimited comparisons with full data & reports.')}
              </p>

              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-white text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('无限学校与专业对比', 'Unlimited school & major comparisons')}</span>
                </li>
                <li className="flex items-start gap-3 text-white text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('完整薪资、录取、成本数据', 'Full salary, admissions & cost data')}</span>
                </li>
                <li className="flex items-start gap-3 text-white text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('40年 ROI 分析与课程流', '40-year ROI & prerequisite flow')}</span>
                </li>
                <li className="flex items-start gap-3 text-white text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('品牌化 PDF 报告', 'Branded PDF reports')}</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgradeClick(t('专业版', 'Pro'))}
                className="w-full py-3 px-4 rounded-xl font-bold bg-amber-500 text-blue-950 hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer"
              >
                {t('升级到 Pro', 'Upgrade to Pro')}
              </button>
            </div>

            {/* Counselor Plan */}
            <div className="bg-white rounded-2xl p-8 border border-purple-200 shadow-sm flex flex-col h-full hover:border-purple-350 transition-all hover:shadow-md">
              <h3 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900">
                {t('顾问版', 'Counselor')}
              </h3>
              <div className="text-4xl font-black font-outfit text-slate-900 my-6">
                $49<span className="text-base sm:text-lg font-medium text-slate-400">/mo</span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mb-8 border-b border-slate-100 pb-6">
                {t('为升学顾问打造的家庭会议工具', 'Built for counselors running family meetings.')}
              </p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>{t('最多 50 名学生管理', 'Up to 50 students')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>{t('学生邀请与进度追踪', 'Student invites & progress tracking')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>{t('品牌化对比报告', 'Branded comparison reports')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>{t('Pro 版全部功能', 'All Pro features included')}</span>
                </li>
              </ul>
              <button
                onClick={() => handleUpgradeClick(t('顾问版', 'Counselor'))}
                className="w-full py-3 px-4 rounded-xl font-bold bg-purple-700 hover:bg-purple-600 text-white transition-colors cursor-pointer"
              >
                {t('升级到 Counselor', 'Upgrade to Counselor')}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Sleek Custom Modals for pricing subscription simulation */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-4 mt-2">
              <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-7 h-7 text-blue-600 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900 font-outfit">
                {t('订阅测试中', 'Subscription Simulation')}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed">
                {t(`您选择了：[${selectedPlan}]。当前系统正在处于本地架构集成阶段，稍后我们在 #36 与 #43 任务中，会正式接入后端支付接口与账户身份体系！`, `You have selected [${selectedPlan}]! Subscription database schemas are currently mapped. Actual stripe billing will be bound in steps #36 & #43.`)}
              </p>
              
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-left text-xs text-slate-500 space-y-1">
                <p>💡 <strong>State Hook Placeholder</strong>: <code>selectedPlan = "{selectedPlan}"</code></p>
                <p>📋 <strong>Task Reference</strong>: Plane Issue ID #9e9219e4-6283</p>
              </div>

              <button 
                onClick={() => setShowPricingModal(false)}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                {t('好的', 'Understood')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
