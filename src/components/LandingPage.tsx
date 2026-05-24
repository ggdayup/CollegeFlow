import { toTraditional } from '../utils/chineseLocalization';
import React, { useState } from 'react';
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
  HelpCircle,
  HelpCircle as QuestionIcon
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

export default function LandingPage({
  language,
  isLoggedIn,
  onTriggerAuth,
  onSearch,
  onNavigateToDashboard,
  onTriggerMajorLink
}: LandingPageProps) {
  const t = (zh: string, en: string) => {
    if (language === 'zh') return zh;
    if (language === 'zht') return toTraditional(zh);
    return en;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onTriggerAuth();
      return;
    }
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      // Smooth scroll to step 2 majors directory
      const el = document.getElementById('majors-directory-heading');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

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
      
      {/* Background Decorative Blob Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10 opacity-60">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-700" />
        <div className="absolute top-96 left-1/3 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }} />
      </div>

      {/* Hero Section */}
      <header className="relative pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          {/* Animated Promo Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs sm:text-sm font-semibold mb-8 shadow-xs"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span>
              {t('已更新：2026 全美毕业生起薪与职场回报数据库', 'Updated: 2026 Grad Outcome & Lifetime Yield Index')}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black font-outfit tracking-tight text-slate-900 mb-6 leading-tight"
          >
            {t('高校毕业生薪资与行业人才供求透视', 'Unlock College Major Lifetime ROI & Salaries')}
            <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent text-3xl sm:text-4xl lg:text-5xl mt-2 block font-extrabold tracking-normal">
              {t('MajorAnalytics 智能学术与职场分析系统', 'Careers Selection & Industry Dynamics Engine')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
          >
            {t('基于全球毕业生追踪报告与多层级权威模型，为新一代学者、高中升学者及高校规划者提供高保真的投资回报（ROI）与课程学分拓扑透视。', 'High-fidelity analytics for the modern student and academic planner. Make data-driven decisions about your educational future with precision.')}
          </motion.p>

          {/* Interactive Search Bar Form */}
          <motion.form 
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-16 relative"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-28 py-4 sm:py-5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-lg shadow-md hover:shadow-lg transition-all"
              placeholder={t('搜索大学专业、标杆院校或职业方向...', 'Search major, university, or career path...')}
            />
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button 
                type="submit"
                className="bg-blue-700 text-white px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
              >
                {t('立即探索', 'Explore')}
              </button>
            </div>
          </motion.form>

          {/* Bento Stat Summary Cards Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left"
          >
            {/* Stat Card 1 */}
            <div 
              onClick={() => handleStatCardClick('national')}
              className="bg-white border border-slate-200 hover:border-blue-400/80 p-6 flex flex-col justify-between h-36 rounded-2xl shadow-xs relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-60 -z-10" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('数据库容量', 'Database')}</p>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-3xl font-extrabold font-outfit text-blue-800">152</span>
                <span className="text-slate-500 text-xs font-semibold">{t('本科专业', 'Majors')}</span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div 
              onClick={() => handleStatCardClick('benchmark')}
              className="bg-white border border-slate-200 hover:border-blue-400/80 p-6 flex flex-col justify-between h-36 rounded-2xl shadow-xs relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-60 -z-10" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('标杆名校', 'Coverage')}</p>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-3xl font-extrabold font-outfit text-slate-900">200+</span>
                <span className="text-slate-500 text-xs font-semibold">{t('美/全球名校', 'Elite Univs')}</span>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div 
              onClick={() => handleStatCardClick('national')}
              className="bg-white border border-slate-200 hover:border-emerald-400 p-6 flex flex-col justify-between h-36 rounded-2xl shadow-xs relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-60 -z-10" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('增长最剧烈', 'STEM Trend')}</p>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-3xl font-extrabold font-outfit text-emerald-600">+159%</span>
                <span className="text-slate-500 text-xs font-semibold">{t('CS & 数理', 'CS Growth')}</span>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div 
              onClick={() => handleStatCardClick('roi')}
              className="bg-blue-900 border-none text-white p-6 flex flex-col justify-between h-36 rounded-2xl shadow-md relative overflow-hidden group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out -z-10" />
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200">{t('起步天花板', 'Benchmark')}</p>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-3xl font-extrabold font-outfit text-white">$146k</span>
                <span className="text-blue-200 text-xs font-semibold">{t('石油工程', 'Peak Sal')}</span>
              </div>
            </div>
          </motion.div>

        </div>
      </header>

      {/* Product Bento Showcase */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
            
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col h-full hover:border-slate-350 transition-all hover:shadow-md">
              <h3 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900">
                {t('标准免费版', 'Standard Free')}
              </h3>
              <div className="text-4xl font-black font-outfit text-slate-900 my-6">
                $0<span className="text-base sm:text-lg font-medium text-slate-400">/mo</span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mb-8 border-b border-slate-100 pb-6">
                {t('提供大学基础学费与起薪门槛的初级概览，适合自主择业摸底。', 'Basic access for high school students starting their search.')}
              </p>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t('20 大热门专业起薪概览', 'Top 20 Majors Overview')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-600 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{t('全美州立院校基础档案数据', 'State University Baseline Data')}</span>
                </li>
                <li className="flex items-start gap-3 text-slate-400 text-xs sm:text-sm line-through">
                  <X className="w-4 h-4 text-slate-350 shrink-0 mt-0.5" />
                  <span>{t('152个学科完整收益及课程流', 'All 152 majors & Prerequisite flow')}</span>
                </li>
              </ul>
              <button 
                onClick={() => handleUpgradeClick(t('免费版', 'Free Standard'))}
                className="w-full py-3 px-4 rounded-xl font-bold border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {t('开启免费使用', 'Start Free')}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-blue-950 rounded-2xl p-8 border border-blue-900 shadow-xl flex flex-col h-full transform md:-translate-y-4 relative group hover:shadow-2xl transition-all">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-blue-950 text-[10px] font-bold uppercase tracking-widest py-1 px-3.5 rounded-full shadow-md">
                {t('最受欢迎', 'Most Popular')}
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold font-outfit text-white">
                {t('专业无限版', 'Pro Unlimited')}
              </h3>
              <div className="text-4xl font-black font-outfit text-white my-6">
                $19<span className="text-base sm:text-lg font-medium text-blue-300">/mo</span>
              </div>
              <p className="text-blue-200 text-xs sm:text-sm mb-8 border-b border-blue-900 pb-6">
                {t('解锁完整的多维排名净化档案、课程拓扑构建器，支持多维报表导出。', 'Comprehensive analytics for serious planners and counselors.')}
              </p>
              
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3 text-white text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('解锁全部 152 个专业的统计数据', 'All 152 Majors Data Unlocked')}</span>
                </li>
                <li className="flex items-start gap-3 text-white text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('标杆院校 (UMich / Rice) 深度网络地图', 'UMich/Rice Network Maps')}</span>
                </li>
                <li className="flex items-start gap-3 text-white text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('连线交互式课程学分拓扑图', 'Course Topology Builder')}</span>
                </li>
                <li className="flex items-start gap-3 text-white text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('支持导出 PDF 研判报告与 CSV 格式', 'Export CSV & PDF Reports')}</span>
                </li>
              </ul>
              
              <button 
                onClick={() => handleUpgradeClick(t('专业版', 'Pro Unlimited'))}
                className="w-full py-3 px-4 rounded-xl font-bold bg-amber-500 text-blue-950 hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer"
              >
                {t('立即升级 / Upgrade Now', 'Upgrade Now')}
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
