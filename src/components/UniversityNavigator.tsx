import React from 'react';
import { University, UniversitySchool, MajorLink } from '../data/universitiesData';
import { majors } from '../data/majorsData';
import { calculateSubjectDemands, getDemandBadgeClass, getDemandLabel } from '../utils/demands';
import { SubjectDemands } from '../types';
import CreditBento from './CreditBento';
import PrerequisiteFlow from './PrerequisiteFlow';
import SubjectRadarChart from './SubjectRadarChart';
import { useUniversityNavigator } from './useUniversityNavigator';
import { toTraditional } from '../utils/chineseLocalization';
import { 
  Search, 
  HelpCircle, 
  Info, 
  Compass, 
  Sparkles, 
  Award,
  ChevronRight,
  ChevronLeft,
  Filter,
  ExternalLink,
  BookOpen,
  ArrowRightLeft,
  DollarSign,
  Briefcase,
  TrendingUp,
  School,
  Star,
  Users,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UniversityNavigatorProps {
  language: 'zh' | 'zht' | 'en';
  onLinkNationalMajor?: (nationalId: string) => void;
}

const COUNTRY_ZH: Record<string, string> = {
  'Algeria': '阿尔及利亚',
  'Argentina': '阿根廷',
  'Australia': '澳大利亚',
  'Austria': '奥地利',
  'Austria–Hungary': '奥匈帝国',
  'Azerbaijan': '阿塞拜疆',
  'Belgium': '比利时',
  'Brazil': '巴西',
  'Canada': '加拿大',
  'Chile': '智利',
  'China': '中国',
  'Colombia': '哥伦比亚',
  'Costa Rica': '哥斯达黎加',
  'Cyprus': '塞浦路斯',
  'Czech Republic': '捷克',
  'Denmark': '丹麦',
  'Ecuador': '厄瓜多尔',
  'Egypt': '埃及',
  'Estonia': '爱沙尼亚',
  'Finland': '芬兰',
  'France': '法国',
  'Germany': '德国',
  'Greece': '希腊',
  'Hong Kong': '中国香港',
  'Hungary': '匈牙利',
  'India': '印度',
  'Indonesia': '印度尼西亚',
  'Ireland': '爱尔兰',
  'Israel': '以色列',
  'Italy': '意大利',
  'Japan': '日本',
  'Kazakhstan': '哈萨克斯坦',
  'Latvia': '拉脱维亚',
  'Lebanon': '黎巴嫩',
  'Lithuania': '立陶宛',
  'Malaysia': '马来西亚',
  'Mexico': '墨西哥',
  'Netherlands': '荷兰',
  'New Zealand': '新西兰',
  'Northern Cyprus': '北塞浦路斯',
  'Norway': '挪威',
  'Oman': '阿曼',
  'Pakistan': '巴基斯坦',
  'Palestine': '巴勒斯坦',
  "People's Republic of China": '中国',
  'Peru': '秘鲁',
  'Poland': '波兰',
  'Portugal': '葡萄牙',
  'Romania': '罗马尼亚',
  'Russia': '俄罗斯',
  'Saudi Arabia': '沙特阿拉伯',
  'Singapore': '新加坡',
  'South Africa': '南非',
  'South Korea': '韩国',
  'Soviet Union': '苏联',
  'Spain': '西班牙',
  'Sweden': '瑞典',
  'Switzerland': '瑞士',
  'Taiwan': '中国台湾',
  'Thailand': '泰国',
  'Turkey': '土耳其',
  'Ukraine': '乌克兰',
  'United Arab Emirates': '阿联酋',
  'United Kingdom': '英国',
  'United States': '美国',
  'United States of America': '美国',
  'Uzbekistan': '乌兹别克斯坦'
};

const US_STATE_ZH: Record<string, string> = {
  AL: '阿拉巴马州', AK: '阿拉斯加州', AZ: '亚利桑那州', AR: '阿肯色州', CA: '加利福尼亚州',
  CO: '科罗拉多州', CT: '康涅狄格州', DE: '特拉华州', FL: '佛罗里达州', GA: '佐治亚州',
  HI: '夏威夷州', ID: '爱达荷州', IL: '伊利诺伊州', IN: '印第安纳州', IA: '艾奥瓦州',
  KS: '堪萨斯州', KY: '肯塔基州', LA: '路易斯安那州', ME: '缅因州', MD: '马里兰州',
  MA: '马萨诸塞州', MI: '明尼苏达州', MN: '明尼苏达州', MS: '密西西比州', MO: '密苏里州',
  MT: '蒙大拿州', NE: '内布拉斯加州', NV: '内华达州', NH: '新罕布什尔州', NJ: '新泽西州',
  NM: '新墨西哥州', NY: '纽约州', NC: '北卡罗来纳州', ND: '北卡罗来纳州', OH: '俄亥俄州',
  OK: '俄跨拉荷马州', OR: '俄勒冈州', PA: '宾夕法尼亚州', RI: '罗得岛州', SC: '南卡罗来纳州',
  SD: '南达科他州', TN: '田纳西州', TX: '德克萨斯州', UT: '犹他州', VT: '佛蒙特州',
  VA: '弗吉尼亚州', WA: '华盛顿州', WV: '西弗吉尼亚州', WI: '威斯康星州', WY: '怀俄明州'
};

export default function UniversityNavigator({ language, onLinkNationalMajor }: UniversityNavigatorProps) {

  const getUniversityName = (u: any) => {
    if (!u) return '';
    if (language === 'en') return u.nameEn;
    if (language === 'zht') return u.nameZht || toTraditional(u.nameZh || u.nameEn);
    return u.nameZh || u.nameEn;
  };

  const getSchoolName = (s: any) => {
    if (!s) return '';
    if (language === 'en') return s.nameEn;
    if (language === 'zht') return s.nameZht || toTraditional(s.nameZh || s.nameEn);
    return s.nameZh || s.nameEn;
  };

  const getMajorName = (m: any) => {
    if (!m) return '';
    if (language === 'en') return m.nameEn;
    if (language === 'zht') return m.nameZht || toTraditional(m.nameZh || m.nameEn);
    return m.nameZh || m.nameEn;
  };

  const getFieldName = (f: any) => {
    if (!f) return '';
    if (language === 'en') return f.nameEn;
    if (language === 'zht') return f.nameZht || toTraditional(f.nameZh || f.nameEn);
    return f.nameZh || f.nameEn;
  };

  const {
    loading,
    activeUniId,
    setActiveUniId,
    activeUni,
    selectedSchoolId,
    setSelectedSchoolId,
    activeSchool,
    searchQuery,
    setSearchQuery,
    searchResults,
    activeCategoryTab,
    setActiveCategoryTab,
    showcaseNationalMajorId,
    setShowcaseNationalMajorId,
    showcaseMajorObj,
    uniSearchQuery,
    setUniSearchQuery,
    uniTypeFilter,
    setUniTypeFilter,
    uniCountryFilter,
    setUniCountryFilter,
    uniStateFilter,
    setUniStateFilter,
    uniSortBy,
    setUniSortBy,
    uniPage,
    setUniPage,
    totalPages,
    filteredUniversities,
    paginatedUniversities,
    landmarks,
    uniqueCountries,
    uniqueStates,
    handleOpenNationalShowcase,
    finalUnis,
    degreeLevelFilter,
    setDegreeLevelFilter
  } = useUniversityNavigator();

  // Helper to render compact demands indicators on major cards
  const renderMajorDemands = (nationalMajorId?: string) => {
    if (!nationalMajorId) return null;
    const standardMajor = majors.find(sm => sm.id === nationalMajorId);
    if (!standardMajor) return null;
    const demands = calculateSubjectDemands(standardMajor);
    return (
      <div className="grid grid-cols-5 gap-1 border-t border-slate-100 pt-2 mb-2 bg-slate-50/50 p-1 rounded-lg border border-slate-150">
        <div className="text-center">
          <div className="text-[8px] font-bold text-slate-400">{language === 'zh' ? '数' : 'M'}</div>
          <div className={`text-[9px] font-extrabold rounded-md mt-0.5 border ${getDemandBadgeClass(demands.math)}`}>
            {getDemandLabel(demands.math, language)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[8px] font-bold text-slate-400">{language === 'zh' ? '物' : 'P'}</div>
          <div className={`text-[9px] font-extrabold rounded-md mt-0.5 border ${getDemandBadgeClass(demands.physics)}`}>
            {getDemandLabel(demands.physics, language)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[8px] font-bold text-slate-400">{language === 'zh' ? '化' : 'C'}</div>
          <div className={`text-[9px] font-extrabold rounded-md mt-0.5 border ${getDemandBadgeClass(demands.chemistry)}`}>
            {getDemandLabel(demands.chemistry, language)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[8px] font-bold text-slate-400">{language === 'zh' ? '生' : 'B'}</div>
          <div className={`text-[9px] font-extrabold rounded-md mt-0.5 border ${getDemandBadgeClass(demands.biology)}`}>
            {getDemandLabel(demands.biology, language)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[8px] font-bold text-slate-400">{language === 'zh' ? '人' : 'H'}</div>
          <div className={`text-[9px] font-extrabold rounded-md mt-0.5 border ${getDemandBadgeClass(demands.humanities)}`}>
            {getDemandLabel(demands.humanities, language)}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" id="university-navigator-section-loading">
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
              <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
            </div>
            <div className="h-8 bg-blue-100/50 rounded-xl w-40" />
          </div>
          <div className="h-10 bg-slate-200 rounded-xl w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
            <div className="lg:col-span-4 bg-white border border-slate-200 p-4 rounded-2xl h-80" />
            <div className="lg:col-span-8 bg-white border border-slate-200 p-4 rounded-2xl h-80" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="university-navigator-section">
      
      {/* 1. Landmark & 1000-University Search Hub */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-5 shadow-sm" id="university-intelligence-directory-hub">
        
        {/* Title and Stats Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>{language === 'zh' ? '全球标杆大学本科生院导航中心' : 'Global University Academic & School Hub'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'zh' 
                ? '支持精准检索高水准标杆院校，直观透视其本科各大学院设置、招考机制及核心细分专业大类。' 
                : 'Browse elite institutions, investigate internal undergraduate colleges, entry patterns, and direct major pathways.'}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[11px] font-black font-mono text-blue-700 tracking-wider">
              {language === 'zh' 
                ? `${finalUnis.length} 所全球名校数据已衔接` 
                : `${finalUnis.length} ELITE UNIVERSITIES INTEGRATED`}
            </span>
          </div>
        </div>

        {/* 1a. Landmark Snapshots / Quick Shortcuts */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block font-mono">
            {language === 'zh' ? '🏫 标杆及代表性名校快捷直达 (BILINGUAL COMPASS)' : '🏫 Landmark & Representative Universities Compass'}
          </span>
          <div className="flex flex-wrap gap-2">
            {landmarks.map(uni => {
              const isSelected = uni.id === activeUniId;
              return (
                <button
                  key={uni.id}
                  onClick={() => {
                    setActiveUniId(uni.id);
                    setSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-102 ring-2 ring-blue-600/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <School className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{language === 'zh' ? uni.shortNameZh : uni.shortNameEn}</span>
                  <span className={`text-[9px] font-mono rounded px-1 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {uni.prestigeNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1b. Search + Directory Side-by-Side Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
          
          {/* Advanced Search & Filtering Box */}
          <div className="lg:col-span-4 bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'zh' ? '高级搜索与筛选' : 'Directory Controls'}</span>
              </div>

              {/* Text query Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={language === 'zh' ? "搜索大学名称 (中/EN)..." : "Search university names..."}
                  value={uniSearchQuery}
                  onChange={(e) => setUniSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-sans"
                />
              </div>

              {/* Type Category Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block uppercase font-mono">
                  {language === 'zh' ? '学府建制类别' : 'Institution Structure'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'all', labelZh: '全部建制', labelEn: 'All Types' },
                    { id: 'public', labelZh: '旗舰公立', labelEn: 'Public' },
                    { id: 'private', labelZh: '高端私立', labelEn: 'Private' },
                    { id: 'stem', labelZh: '工程理工', labelEn: '理工 STEM' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setUniTypeFilter(f.id)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border cursor-pointer transition-all ${
                        uniTypeFilter === f.id
                          ? 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-300/30 font-black'
                          : 'bg-slate-50/50 text-slate-600 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {language === 'zh' ? f.labelZh : f.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Geographic Country Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block uppercase font-mono">
                  {language === 'zh' ? '🌎 国家与地区分布' : '🌎 Country & Region'}
                </label>
                <select
                  value={uniCountryFilter}
                  onChange={(e) => {
                    setUniCountryFilter(e.target.value);
                    setUniStateFilter('all'); // Reset state filter when country changes
                  }}
                  className="w-full select-thin px-2.5 py-1.5 text-[11px] rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 transition-all font-mono"
                >
                  <option value="all">{language === 'zh' ? '🌎 全部国家 (All Countries)' : '🌎 All Countries'}</option>
                  {uniqueCountries.map(c => {
                    let flag = '📍';
                    if (c === 'United States' || c === 'United States of America') flag = '🇺🇸';
                    else if (c === 'China' || c === "People's Republic of China") flag = '🇨🇳';
                    else if (c === 'United Kingdom') flag = '🇬🇧';
                    else if (c === 'Singapore') flag = '🇸🇬';
                    else if (c === 'Canada') flag = '🇨🇦';
                    else if (c === 'Australia') flag = '🇦🇺';
                    else if (c === 'Hong Kong') flag = '🇭🇰';
                    else if (c === 'Japan') flag = '🇯🇵';
                    else if (c === 'Germany') flag = '🇩🇪';
                    else if (c === 'France') flag = '🇫🇷';
                    
                    const displayName = language === 'zh'
                      ? `${COUNTRY_ZH[c] || c} (${c})`
                      : c;
                    return (
                      <option key={c} value={c}>{flag} {displayName}</option>
                    );
                  })}
                </select>
              </div>

              {/* Region State Filter (Conditional for US) */}
              <AnimatePresence>
                {uniCountryFilter === 'United States' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="text-[10px] font-bold text-slate-500 block uppercase font-mono">
                      {language === 'zh' ? '🇺🇸 地理州域分布' : '🇺🇸 Regional State'}
                    </label>
                    <select
                      value={uniStateFilter}
                      onChange={(e) => setUniStateFilter(e.target.value)}
                      className="w-full select-thin px-2.5 py-1.5 text-[11px] rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 transition-all font-mono"
                    >
                      <option value="all">{language === 'zh' ? '🇺🇸 全部州域 (All States)' : '🇺🇸 All States'}</option>
                      {uniqueStates.map(st => {
                        const displayName = language === 'zh'
                          ? `${US_STATE_ZH[st] || st} (${st})`
                          : st;
                        return (
                          <option key={st} value={st}>📍 {displayName}</option>
                        );
                      })}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ranking & Sorting System */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase font-mono">
                  {language === 'zh' ? '📊 排序系统规则' : '📊 Ranking & Sorting'}
                </label>
                <select
                  value={uniSortBy}
                  onChange={(e) => setUniSortBy(e.target.value)}
                  className="w-full select-thin px-2.5 py-1.5 text-[11px] rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-blue-500 transition-all font-mono"
                >
                  <option value="nameEn">{language === 'zh' ? '🔤 字母顺序 (A-Z)' : '🔤 Alphabetical (A-Z)'}</option>
                  <option value="qsRank">{language === 'zh' ? '🏆 QS 世界排名优先' : '🏆 Best QS World Rank'}</option>
                  <option value="usNewsRank">{language === 'zh' ? '🏛️ US News 排名优先' : '🏛️ Best US News Rank'}</option>
                </select>
              </div>
            </div>

            {/* Micro Counter Indicator */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{language === 'zh' ? '检索条件匹配：' : 'Filtered Matches:'}</span>
              <span className="font-extrabold text-slate-700">{filteredUniversities.length} / {finalUnis.length}</span>
            </div>
          </div>

          {/* Directory Paginated Grid */}
          <div className="lg:col-span-8 flex flex-col justify-between min-h-[300px]">
            {paginatedUniversities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
                <Compass className="w-8 h-8 text-slate-300 animate-spin" />
                <h4 className="text-xs font-black text-slate-700">
                  {language === 'zh' ? '未找到符合匹配的大学' : 'No Universities Found'}
                </h4>
                <p className="text-[10px] text-slate-400 max-w-xs">
                  {language === 'zh' ? '请尝试修改关键字、建制分类或州域筛选。' : 'Try adjusting search terms, institutions type, or state region filters.'}
                </p>
                <button
                  onClick={() => {
                    setUniSearchQuery('');
                    setUniTypeFilter('all');
                    setUniCountryFilter('all');
                    setUniStateFilter('all');
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 transition-all text-[10px] font-bold text-slate-600 rounded bg-stone-100 border border-stone-200 cursor-pointer"
                >
                  {language === 'zh' ? '重置筛选条件' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {paginatedUniversities.map(uni => {
                  const isSelected = uni.id === activeUniId;
                  return (
                    <button
                      key={uni.id}
                      onClick={() => {
                        setActiveUniId(uni.id);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border text-slate-800 transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'bg-white/95 backdrop-blur-md border-blue-600 ring-2 ring-blue-600/20 shadow-lg scale-102'
                          : 'bg-white/70 backdrop-blur-sm border-slate-200/80 hover:border-slate-350 hover:bg-white/90 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 relative z-10 h-full">
                        <div className="space-y-1 my-auto">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-1.5 py-0.5 rounded-[3px] text-[8px] font-black tracking-wider uppercase font-mono ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {uni.badgeZh && language === 'zh' ? uni.badgeZh : uni.badgeEn}
                            </span>
                            <span className="text-slate-400 text-[9px] flex items-center gap-0.5 font-mono">
                              <MapPin className="w-2.5 h-2.5 block" />
                              {language === 'zh' ? uni.locationZh : uni.locationEn}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-xs text-slate-900 tracking-tight flex items-center gap-1 pt-0.5 line-clamp-1">
                            <School className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span>{getUniversityName(uni)}</span>
                          </h4>

                          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold">
                            <span className="text-amber-600">US News #{uni.usNewsRank}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-sky-600">QS #{uni.qsRank}</span>
                          </div>

                          <p className="text-[10px] text-slate-500 leading-snug line-clamp-1">
                            {language === 'zh' ? uni.taglineZh : uni.taglineEn}
                          </p>
                        </div>

                        {/* Glassmorphic badge showcasing rank */}
                        <div className={`w-7 h-7 rounded-lg items-center justify-center flex shrink-0 border ${
                          isSelected 
                            ? 'bg-amber-500/10 border-amber-300 text-amber-500 shadow-inner backdrop-blur-md' 
                            : 'bg-slate-500/5 backdrop-blur-md border-slate-200 text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 group-hover:border-amber-300/40 shadow-xs'
                        } transition-all font-mono text-[10px] font-black`}>
                          {uni.prestigeNumber}
                        </div>
                      </div>

                      {/* Accent bottom color bar depending on selected status */}
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all ${
                        isSelected 
                          ? 'bg-blue-600' 
                          : 'bg-transparent group-hover:bg-slate-300'
                      }`} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-3.5 mt-4 text-[11px] font-mono">
                <button
                  disabled={uniPage === 1}
                  onClick={() => setUniPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all flex items-center gap-0.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '上一页' : 'Prev'}</span>
                </button>
                <span className="text-slate-500 font-bold font-mono">
                  {language === 'zh' ? `第 ${uniPage} / ${totalPages} 页` : `Page ${uniPage} of ${totalPages}`}
                </span>
                <button
                  disabled={uniPage === totalPages}
                  onClick={() => setUniPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all flex items-center gap-0.5"
                >
                  <span>{language === 'zh' ? '下一页' : 'Next'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. Primary University Hero Header */}
      <div className={`bg-gradient-to-br ${activeUni.bgColor} border border-slate-800/20 p-6 sm:p-8 rounded-3xl relative overflow-hidden text-white shadow-xl`} id="active-collegiate-dashboard-card">
        
        {/* Dynamic Decorative Blobs according to University theme */}
        <div className="absolute top-0 right-0 w-[450px] h-[300px] bg-blue-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-lg shadow-sm font-mono flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                {activeUni.shortNameEn.toUpperCase()} ACADEMIC MAP
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 border border-white/20 text-sky-200 text-[10px] font-mono rounded-md">
                {activeUni.schools.length} Schools / Colleges
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {language === 'en'
                ? `${activeUni.shortNameEn} — Undergraduate Academic Explorer`
                : `${getUniversityName(activeUni)} · ${language === 'zht' ? '本科選專業地圖與聯動' : '本科选专业地图与联动'}`}
            </h2>
            
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
              {language === 'zh' ? activeUni.descriptionZh : activeUni.descriptionEn}
            </p>

            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-[11px] text-slate-300 max-w-xl">
              <strong className="text-amber-400 font-bold block mb-0.5">
                {language === 'zh' ? '📌 大类与选系特色制度要点：' : '📌 Crucial Academic Rule Highlight:'}
              </strong>
              {language === 'zh' ? activeUni.keyFactZh : activeUni.keyFactEn}
            </div>
          </div>

          {/* Quick Metrics Badge and Stats right-side */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col justify-between shrink-0 lg:w-72 min-h-[140px] space-y-3">
            <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest block border-b border-white/10 pb-1.5 font-mono">
              {language === 'zh' ? '🏆 权威名校双排榜年份对照' : '🏆 OFFICIAL DUAL RANKINGS'}
            </span>
            
            <div className="grid grid-cols-2 gap-3">
              {/* US NEWS */}
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-350 text-slate-300 font-mono uppercase block">
                  {language === 'zh' ? `US News (${activeUni.usNewsYear})` : `US News (${activeUni.usNewsYear})`}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-amber-400 text-xl font-black font-mono">#{activeUni.usNewsRank}</span>
                  <span className="text-[9px] text-slate-300 font-bold font-mono">
                    {activeUni.isGlobalRank 
                      ? (language === 'zh' ? '全球' : 'Global') 
                      : (language === 'zh' ? '全美' : 'U.S.')}
                  </span>
                </div>
              </div>

              {/* QS WORLD */}
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-350 text-slate-300 font-mono uppercase block">
                  {language === 'zh' ? `QS World (${activeUni.qsYear})` : `QS World (${activeUni.qsYear})`}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sky-300 text-xl font-black font-mono">#{activeUni.qsRank}</span>
                  <span className="text-[9px] text-slate-300 font-bold font-mono">
                    {language === 'zh' ? '全球' : 'World'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-300 border-t border-white/10 pt-2 leading-tight">
              {language === 'zh' 
                ? '支持点击底部具体的大学专业直接下钻，联动中位职业报酬。' 
                : 'Click any undergraduate program below to automatically pull salary indices.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main interactive directory container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: School Selector Pane representing 7 or 14 Schools */}
        <div className="col-span-1 lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            
            {/* Search Box on UMich Database */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'zh' ? `在 ${activeUni.shortNameZh} 所有院系内搜索...` : `Search inside ${activeUni.shortNameEn}...`}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
                >
                  ×
                </button>
              )}
            </div>

            {/* School selection scroll list */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              <div className="text-[10px] font-extrabold text-slate-450 text-slate-500 uppercase tracking-widest px-2.5 mb-2 flex items-center justify-between">
                <span>{language === 'zh' ? '选择专业学术生院' : 'Academic Divisions'}</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[9px] font-bold">
                  {activeUni.schools.length} Schools
                </span>
              </div>

              {activeUni.schools.map(school => {
                const isSelected = selectedSchoolId === school.id && !searchQuery;
                return (
                  <button
                    key={school.id}
                    onClick={() => {
                      setSelectedSchoolId(school.id);
                      setSearchQuery(''); // Clear search when user explicitly chooses a school
                      if (school.categories && school.categories.length > 0) {
                        setActiveCategoryTab(school.categories[0].id);
                      } else {
                        setActiveCategoryTab('');
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-705 text-slate-700 hover:text-slate-900 hover:border-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isSelected 
                            ? 'bg-amber-400 text-slate-950' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {school.code}
                        </span>
                        <span className={`text-[10px] font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          {school.tagZh && language === 'zh' ? school.tagZh : school.tagEn}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs line-clamp-1 tracking-tight">
                        {getSchoolName(school)}
                      </h4>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-amber-400 rotate-90' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Active School View Card & Search Result list */}
        <div className="col-span-1 lg:col-span-8">
          
          <AnimatePresence mode="wait">
            
            {/* Search results display if query is active */}
            {searchQuery ? (
              <motion.div
                key="uni-search-panel"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-600" />
                    <span>
                      {language === 'zh' ? '搜索结果' : 'Search Results'}
                    </span>
                    <span className="text-xs bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">
                      "{searchQuery}"
                    </span>
                  </h3>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-105 cursor-pointer"
                  >
                    {language === 'zh' ? '返回学院列表' : 'Back to Divisions'}
                  </button>
                </div>

                {searchResults === null || searchResults.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <Info className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="font-bold text-sm text-slate-700">
                      {language === 'zh' ? '未找到符合条件的专业或院系' : 'No academic tracks match your search'}
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {language === 'zh' 
                        ? `请尝试使用其他关键字（如 BBA, CS, AI, Math, 物理, 建筑 等）在 ${activeUni.shortNameZh} 全院内重选。` 
                        : `Try searching for BBA, CS, AI, Math, Physics, or Bioengineering in ${activeUni.shortNameEn}.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {searchResults.map(({ school, matchingMajors }) => (
                      <div key={school.id} className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-800 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                              {school.code}
                            </span>
                            <h4 className="font-extrabold text-xs text-slate-800">
                              {getSchoolName(school)}
                            </h4>
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedSchoolId(school.id);
                              setSearchQuery('');
                              if (school.categories && school.categories.length > 0) {
                                setActiveCategoryTab(school.categories[0].id);
                              } else {
                                setActiveCategoryTab('');
                              }
                            }}
                            className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>{language === 'zh' ? '进入生院面板' : 'Observe Division'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        {matchingMajors.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            {language === 'zh' ? '整个学部学院名称匹配此项关键字。' : 'The overall school registry matches the search query.'}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            {matchingMajors.map(m => (
                              <div key={m.id} className="bg-white border border-slate-200 p-3.5 rounded-xl flex flex-col justify-between shadow-xs">
                                <div>
                                  <h5 className="font-extrabold text-slate-800 text-sm leading-tight">
                                    {getMajorName(m)}
                                  </h5>
                                  <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 italic">
                                    {language === 'en' ? getMajorName(m) : m.nameEn}
                                  </p>

                                  {m.submajors && m.submajors.length > 0 && (
                                    <div className="mt-2.5 flex flex-wrap gap-1 leading-normal">
                                      {m.submajors.map((sm, sx) => (
                                        <span key={sx} className="text-[9px] font-bold bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                                          {sm}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {renderMajorDemands(m.nationalMajorId)}
                                </div>

                                {m.nationalMajorId && (
                                  <button
                                    onClick={() => handleOpenNationalShowcase(m.nationalMajorId!)}
                                    className="mt-4 w-full bg-blue-50 hover:bg-blue-105 text-blue-700 py-1.5 rounded-lg border border-blue-100 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <ArrowRightLeft className="w-3 h-3" />
                                    <span>{language === 'zh' ? '🧮 联动全美行业薪资 / 难度分析' : 'Link National Career Data'}</span>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              // Active University School Detailed Directory Display
              <motion.div
                key={activeSchool.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
              >
                
                {/* School Header Title Section */}
                <div className="border-b border-slate-100 pb-5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-3 py-1 bg-slate-900 border border-slate-850 text-white text-xs font-mono font-black rounded-lg uppercase shadow-inner">
                      {activeSchool.code}
                    </span>
                    
                    {activeSchool.tagEn && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold leading-none bg-amber-50 text-amber-800 border border-amber-200">
                        {language === 'zh' && activeSchool.tagZh ? activeSchool.tagZh : activeSchool.tagEn}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {getSchoolName(activeSchool)}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                      {language === 'en'
                        ? activeSchool.subtitleEn
                        : language === 'zht'
                          ? toTraditional(activeSchool.subtitleZh || activeSchool.subtitleEn)
                          : activeSchool.subtitleZh || activeSchool.subtitleEn}
                    </p>
                  </div>

                  <p className="text-slate-650 text-slate-700 text-xs leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {language === 'en'
                      ? activeSchool.descriptionEn
                      : language === 'zht'
                        ? toTraditional(activeSchool.descriptionZh || activeSchool.descriptionEn)
                        : activeSchool.descriptionZh || activeSchool.descriptionEn}
                  </p>
                </div>

                {/* Degree Level Selector (Dynamic Tab Bar) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-150">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
                    <span className="text-xs font-black text-slate-700 tracking-tight">
                      {language === 'en'
                        ? 'Select Degree Level'
                        : language === 'zht'
                          ? '選擇學位層級'
                          : '选择学位层级'}
                    </span>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0 shadow-inner">
                    {[
                      { id: 'BACHELOR', labelEn: "Bachelor's", labelZh: '本科' },
                      { id: 'MASTER', labelEn: "Master's", labelZh: '硕士' },
                      { id: 'DOCTORATE', labelEn: 'Doctorate', labelZh: '博士' },
                    ].map(tab => {
                      const isActive = degreeLevelFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setDegreeLevelFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {language === 'en'
                            ? tab.labelEn
                            : language === 'zht'
                              ? toTraditional(tab.labelZh)
                              : tab.labelZh}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subcategories or Simple Majors List with degree filtering */}
                {(() => {
                  const visibleCategories = activeSchool.categories?.filter(cat => cat.majors && cat.majors.length > 0) || [];
                  const hasMajors = activeSchool.categories 
                    ? visibleCategories.length > 0 
                    : (activeSchool.majors && activeSchool.majors.length > 0);

                  if (!hasMajors) {
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12 px-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-3"
                      >
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl shadow-inner">
                          🎓
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-800">
                            {language === 'en'
                              ? 'No Programs Found'
                              : language === 'zht'
                                ? '未找到學位項目'
                                : '未找到学位项目'}
                          </h4>
                          <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
                            {language === 'en'
                              ? `The ${activeSchool.nameEn} does not offer programs at this degree level.`
                              : language === 'zht'
                                ? `該學院（${getSchoolName(activeSchool)}）暫無此學位層級的項目開設。`
                                : `该学院（${getSchoolName(activeSchool)}）暂无此学位层级的项目开设。`}
                          </p>
                        </div>
                      </motion.div>
                    );
                  }

                  if (activeSchool.categories) {
                    return (
                      <div className="space-y-6">
                        {/* Inner Tabs for nested categories to avoid page overflow */}
                        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100/80 border border-slate-200 rounded-2xl">
                          {visibleCategories.map(cat => {
                            const isTabActive = activeCategoryTab === cat.id || 
                              (!visibleCategories.some(c => c.id === activeCategoryTab) && visibleCategories[0].id === cat.id);
                            return (
                              <button
                                key={cat.id}
                                onClick={() => setActiveCategoryTab(cat.id)}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                                  isTabActive
                                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-205 border-transparent'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                {getFieldName(cat)}
                              </button>
                            );
                          })}
                        </div>

                        {visibleCategories.map((cat, idx) => {
                          const isTabActive = activeCategoryTab === cat.id || 
                            (!visibleCategories.some(c => c.id === activeCategoryTab) && idx === 0);
                          if (!isTabActive) return null;
                          return (
                            <div key={cat.id} className="space-y-4">
                              <div className="bg-blue-50/25 border border-blue-100 rounded-2xl p-4">
                                <h4 className="font-extrabold text-sm text-slate-850 flex items-center gap-1.5 text-blue-900">
                                  <Compass className="w-4 h-4 text-blue-600" />
                                  {getFieldName(cat)}
                                </h4>
                                {cat.descriptionEn && (
                                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                                    {language === 'zh' && cat.descriptionZh ? cat.descriptionZh : cat.descriptionEn}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {cat.majors.map(m => (
                                  <div key={m.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs hover:border-slate-350 transition-colors flex flex-col justify-between">
                                    <div className="space-y-2.5">
                                      <div>
                                        <h5 className="font-extrabold text-slate-850 text-sm leading-tight">
                                          {getMajorName(m)}
                                        </h5>
                                        <p className="text-[10px] text-slate-400 font-semibold tracking-wider italic mt-0.5 line-clamp-1">
                                          {language === 'en' ? getMajorName(m) : m.nameEn}
                                        </p>
                                      </div>

                                      {m.submajors && m.submajors.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pb-1 flex-wrap">
                                          {m.submajors.map((sm, sx) => (
                                            <span key={sx} className="text-[9px] font-bold bg-slate-50 border border-slate-200 text-slate-550 px-1.5 py-0.5 rounded">
                                              {sm}
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      {(m.notesZh || m.notesEn) && (
                                        <div className="bg-amber-50/20 border border-amber-150 rounded-xl p-2.5 text-[10px] text-amber-805 flex items-start gap-1">
                                          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                          <p className="text-amber-850 font-medium leading-relaxed">
                                            {language === 'zh' && m.notesZh ? m.notesZh : m.notesEn}
                                          </p>
                                        </div>
                                      )}
                                      {renderMajorDemands(m.nationalMajorId)}
                                    </div>

                                    {m.nationalMajorId && (
                                      <button
                                        onClick={() => handleOpenNationalShowcase(m.nationalMajorId!)}
                                        className="mt-4 w-full bg-slate-50 hover:bg-slate-100 text-slate-705 py-2 rounded-xl border border-slate-200 text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                      >
                                        <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 font-bold" />
                                        <span>{language === 'zh' ? '🧮 联动全美行业薪资回报' : 'Link National Career Data'}</span>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-slate-700 font-extrabold leading-normal">
                          {language === 'en'
                            ? `The ${activeSchool.nameEn} administers ${activeSchool.majors?.length || 0} core degree tracks:`
                            : `${getSchoolName(activeSchool)} ${language === 'zht' ? '共有' : '共有'} ${activeSchool.majors?.length || 0} ${language === 'zht' ? '個專業項目分支建立映射：' : '个专业项目分支建立映射：'}`}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeSchool.majors?.map(m => (
                          <div key={m.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs hover:border-slate-350 transition-colors flex flex-col justify-between">
                            <div className="space-y-2.5">
                              <div>
                                <h5 className="font-extrabold text-slate-850 text-sm leading-tight">
                                  {getMajorName(m)}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-semibold tracking-wider italic mt-0.5 line-clamp-1">
                                  {language === 'en' ? getMajorName(m) : m.nameEn}
                                </p>
                              </div>

                              {m.submajors && m.submajors.length > 0 && (
                                <div className="flex flex-wrap gap-1 leading-normal pb-0.5 flex-wrap">
                                  {m.submajors.map((sm, sx) => (
                                    <span key={sx} className="text-[9px] font-bold bg-slate-50 border border-slate-200 text-slate-550 px-1.5 py-0.5 rounded">
                                      {sm}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {(m.notesZh || m.notesEn) && (
                                <div className="bg-amber-50/20 border border-amber-150 rounded-xl p-2.5 text-[10px] text-auto flex items-start gap-1">
                                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                  <p className="text-amber-850 font-medium leading-relaxed">
                                    {language === 'zh' && m.notesZh ? m.notesZh : m.notesEn}
                                  </p>
                                </div>
                              )}
                              {renderMajorDemands(m.nationalMajorId)}
                            </div>

                            {m.nationalMajorId && (
                              <button
                                onClick={() => handleOpenNationalShowcase(m.nationalMajorId!)}
                                className="mt-4 w-full bg-slate-50 hover:bg-slate-100 text-slate-705 py-2 rounded-xl border border-slate-205 text-[10px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 font-bold animate-pulse" />
                                <span>{language === 'zh' ? '🧮 联动全美行业薪资回报' : 'Link National Career Data'}</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Curriculum Bento & Prerequisite Flow Section */}
          <div className="border-t border-slate-200 pt-8 mt-8 space-y-8">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">
                {language === 'zh' ? '标杆专业学术图谱' : 'ACADEMIC BLUEPRINT'}
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {language === 'zh' ? '🎓 标杆本科专业课程结构与先修依赖流向' : '🎓 Curriculum Structure & Prerequisite Dependencies'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'zh'
                  ? `以下以当前选定的学部学系核心课程体系为例，展示学分分布饼图及多学期拖拽先修关系弧线图。`
                  : `Showing the core degree blueprint credit ratios and interactive prerequisite mapping details below.`}
              </p>
            </div>
            
            {/* Credit Bento Grid */}
            <CreditBento language={language} />

            {/* Prerequisite Flow Timeline */}
            <PrerequisiteFlow language={language} />
          </div>
        </div>
      </div>

      {/* Linked National Major Detailed Showcase Modal Overlay */}
      <AnimatePresence>
        {showcaseNationalMajorId && showcaseMajorObj && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="national-mapping-dialog-mask">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Blue Header Shield representing National Equivalency Mapping */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 pr-12 relative">
                
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 font-mono text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    {language === 'zh' ? '全美映射' : 'US MAPPER'}
                  </span>
                  <span className="text-[10px] text-sky-200 font-bold tracking-tight">Georgetown CEW Dataset</span>
                </div>

                <h4 className="text-base sm:text-lg font-black mt-2 leading-snug">
                  {getMajorName(showcaseMajorObj.major)}
                </h4>
                <p className="text-xs text-sky-100 opacity-80 mt-0.5 italic">
                  {language === 'en' ? showcaseMajorObj.major.nameZh : showcaseMajorObj.major.nameEn}
                </p>

                {/* Close Button top-right */}
                <button
                  onClick={() => setShowcaseNationalMajorId(null)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 hover:scale-105 cursor-pointer text-white w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono transition-all"
                >
                  ×
                </button>
              </div>

              {/* Modal Body Contents */}
              <div className="p-5 sm:p-6 space-y-5">
                
                {/* 1. Mapped Category Trace */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider mb-0.5">
                      {language === 'zh' ? '国民一级行业门类' : 'Broad Field Group'}
                    </span>
                    <strong className="text-slate-800 mt-1 block font-bold leading-snug">
                      {showcaseMajorObj.bf ? getFieldName(showcaseMajorObj.bf) : ''}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider mb-0.5">
                      {language === 'zh' ? '学门二级细分专业分类' : 'Detailed Academic Area'}
                    </span>
                    <strong className="text-slate-800 mt-1 block font-bold leading-snug">
                      {showcaseMajorObj.df ? getFieldName(showcaseMajorObj.df) : ''}
                    </strong>
                  </div>
                </div>

                {/* 2. Key Salary Metrics Grid */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">
                    {language === 'zh' ? '📊 本科生涯职业中位薪酬回报' : '📊 Prime Alumni Earnings Prospect'}
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-slate-200 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
                        {language === 'zh' ? '起步中位数 (22-26岁)' : 'Recent Graduate (22-26)'}
                      </span>
                      <div className="mt-2.5">
                        <strong className="text-slate-900 text-lg font-black tracking-tight font-mono">
                          {showcaseMajorObj.bf?.recentMedianEarningsEn || '-'}
                        </strong>
                        <span className="text-slate-400 text-[10px] ml-0.5">/year</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                      <span className="text-emerald-800 text-[10px] font-bold tracking-widest uppercase relative z-10">
                        {language === 'zh' ? '黄金年龄段 (25-54岁)' : 'Prime-Age Peak (25-54)'}
                      </span>
                      <div className="mt-2.5 relative z-10">
                        <strong className="text-emerald-700 text-lg font-black tracking-tight font-mono">
                          {showcaseMajorObj.bf?.primeMedianEarningsEn || '-'}
                        </strong>
                        <span className="text-emerald-550 text-emerald-500 text-[10px] ml-0.5">/year</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Core Academic Subject Demands Indicators */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">
                    {language === 'zh' ? '🧠 学科核心能力关联需求 (5D 雷达图谱)' : '🧠 Critical Subject Demands (5D Radar Chart)'}
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50/45 p-4 border border-slate-150 rounded-2xl">
                    {/* Left Column: Radar Chart */}
                    <div className="flex justify-center">
                      <SubjectRadarChart demands={showcaseMajorObj.demands} language={language} />
                    </div>

                    {/* Right Column: Progressive Bars */}
                    <div className="space-y-3">
                      {[
                        { key: 'math', labelEn: 'Mathematics', labelZh: '理学数学', color: 'bg-blue-600', val: showcaseMajorObj.demands.math },
                        { key: 'physics', labelEn: 'Physics', labelZh: '物理科学', color: 'bg-indigo-600', val: showcaseMajorObj.demands.physics },
                        { key: 'chemistry', labelEn: 'Chemistry', labelZh: '化学材料', color: 'bg-purple-600', val: showcaseMajorObj.demands.chemistry },
                        { key: 'biology', labelEn: 'Biology', labelZh: '生命生物', color: 'bg-teal-600', val: showcaseMajorObj.demands.biology },
                        { key: 'humanities', labelEn: 'Humanities', labelZh: '人文社科', color: 'bg-amber-500', val: showcaseMajorObj.demands.humanities }
                      ].map(sub => {
                        const numericVal = sub.val === 'H' ? 100 : sub.val === 'M' ? 66 : 33;
                        return (
                          <div key={sub.key} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700">
                                {language === 'zh' ? sub.labelZh : sub.labelEn}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-black border uppercase ${getDemandBadgeClass(sub.val)}`}>
                                {getDemandLabel(sub.val, language)}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`${sub.color} h-1.5 rounded-full transition-all duration-500`}
                                style={{ width: `${numericVal}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Unemployment & Market Trends */}
                {showcaseMajorObj.df && (
                  <div className="border-t border-slate-100 pt-4 px-1 grid grid-cols-2 gap-4 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-slate-450 text-[10px] block">{language === 'zh' ? '近期青年学术失业率' : 'Recent Unemployment'}</span>
                        <strong className="text-slate-800 font-extrabold">{showcaseMajorObj.df.unemploymentRecentPercent}%</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <span className="text-slate-450 text-[10px] block">{language === 'zh' ? '毕业生近年增减势' : 'Grad Supply Change'}</span>
                        <strong className={`font-extrabold ${showcaseMajorObj.df.degreeProductionChangePercent >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {showcaseMajorObj.df.degreeProductionChangePercent >= 0 ? '+' : ''}
                          {showcaseMajorObj.df.degreeProductionChangePercent}%
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>

              {/* Modal Footer Actions */}
              <div className="bg-slate-50 border-t border-slate-200 p-4.5 flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowcaseNationalMajorId(null)}
                  className="flex-1 text-center py-2.5 bg-slate-200 hover:bg-slate-250 hover:bg-slate-300 text-slate-705 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-250"
                >
                  {language === 'zh' ? '关闭对话框' : 'Close Details'}
                </button>

                {onLinkNationalMajor && (
                  <button
                    onClick={() => {
                      onLinkNationalMajor(showcaseNationalMajorId);
                      setShowcaseNationalMajorId(null);
                    }}
                    className="flex-1 text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer font-extrabold"
                  >
                    <span>{language === 'zh' ? '🎯 联动定位至主目录' : '🎯 Jump to National DB'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
