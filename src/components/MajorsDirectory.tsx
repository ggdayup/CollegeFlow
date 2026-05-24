import React, { useState, useMemo, useEffect } from 'react';
import { Major, BroadField, DetailedField, DemandLevel } from '../types';
import { majors, broadFields, detailedFields, highlightMajors } from '../data/majorsData';
import { universities } from '../data/universitiesData';
import { Search, Filter, HelpCircle, Layers, X, Info, Trophy, AlertTriangle, ArrowUpDown, Grid, List, TrendingUp, Star, School } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { calculateSubjectDemands, getDemandBadgeClass, getDemandLabel, subjectData } from '../utils/demands';
import { toTraditional } from '../utils/chineseLocalization';

interface MajorsDirectoryProps {
  selectedBroadFieldId: string | null;
  onSelectBroadField: (id: string | null) => void;
  selectedDetailedFieldId: string | null;
  onSelectDetailedField: (id: string | null) => void;
  language: 'zh' | 'zht' | 'en';
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export default function MajorsDirectory({
  selectedBroadFieldId,
  onSelectBroadField,
  selectedDetailedFieldId,
  onSelectDetailedField,
  language,
  searchQuery,
  onSearchQueryChange
}: MajorsDirectoryProps) {

  const getMajorName = (m: Major) => {
    if (language === 'en') return m.nameEn;
    if (language === 'zht') return m.nameZht || toTraditional(m.nameZh);
    return m.nameZh;
  };

  const getFieldName = (f: BroadField | DetailedField) => {
    if (language === 'en') return f.nameEn;
    if (language === 'zht') return f.nameZht || toTraditional(f.nameZh);
    return f.nameZh;
  };

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchScope, setSearchScope] = useState<'standard' | 'university'>('standard');
  
  // Custom Filters state
  const [spotlightFilter, setSpotlightFilter] = useState<'all' | 'highest' | 'lowest' | 'fast_growing' | 'favorites'>('all');
  
  // Load favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('favorited_majors');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id];
      localStorage.setItem('favorited_majors', JSON.stringify(updated));
      return updated;
    });
  };

  // Subject demands filter state
  const [demandsFilter, setDemandsFilter] = useState({
    math: 'all',
    physics: 'all',
    chemistry: 'all',
    biology: 'all',
    humanities: 'all'
  });
  
  // Sorting state for the primary listings
  const [sortOrder, setSortOrder] = useState<'name' | 'category'>('name');

  // Multi-level reset helper
  const handleResetFilters = () => {
    onSelectBroadField(null);
    onSelectDetailedField(null);
    onSearchQueryChange('');
    setSpotlightFilter('all');
    setDemandsFilter({
      math: 'all',
      physics: 'all',
      chemistry: 'all',
      biology: 'all',
      humanities: 'all'
    });
  };

  // Dynamic university majors database ingestion
  const [dbUniversities, setDbUniversities] = useState<any[]>([]);
  const [loadingUnis, setLoadingUnis] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/universities');
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setDbUniversities(data);
            setLoadingUnis(false);
          }
        } else {
          if (active) setLoadingUnis(false);
        }
      } catch (err) {
        console.error('Failed to fetch universities in MajorsDirectory:', err);
        if (active) setLoadingUnis(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const finalUnis = useMemo(() => {
    return dbUniversities.length > 0 ? dbUniversities : universities;
  }, [dbUniversities]);

  const allUniversityMajors = useMemo(() => {
    const list: any[] = [];
    finalUnis.forEach(uni => {
      uni.schools.forEach(school => {
        const majorsList: any[] = [];
        if (school.majors) {
          majorsList.push(...school.majors);
        }
        if (school.categories) {
          school.categories.forEach(cat => {
            if (cat.majors) {
              majorsList.push(...cat.majors);
            }
          });
        }

        majorsList.forEach(mLink => {
          if (!mLink.nationalMajorId) return;
          const standardMajor = majors.find(sm => sm.id === mLink.nationalMajorId);
          if (!standardMajor) return;

          list.push({
            id: `${uni.id}-${school.id}-${mLink.id}`,
            nameEn: mLink.nameEn,
            nameZh: mLink.nameZh || mLink.nameEn,
            nameZht: mLink.nameZht || toTraditional(mLink.nameZh || mLink.nameEn),
            uniId: uni.id,
            uniNameEn: uni.nameEn,
            uniNameZh: uni.nameZh || uni.nameEn,
            uniNameZht: uni.nameZht || toTraditional(uni.nameZh || uni.nameEn),
            schoolNameEn: school.nameEn,
            schoolNameZh: school.nameZh || school.nameEn,
            schoolNameZht: toTraditional(school.nameZh || school.nameEn),
            nationalMajorId: mLink.nationalMajorId,
            submajors: mLink.submajors,
            notesEn: mLink.notesEn,
            notesZh: mLink.notesZh,
            broadFieldId: standardMajor.broadFieldId,
            detailedFieldId: standardMajor.detailedFieldId,
            specialTag: standardMajor.specialTag || null,
            earningsValue: standardMajor.earningsValue || null,
            standardMajor,
            uniRankingQs: uni.qsRank,
            uniRankingUsNews: uni.usNewsRank,
            uniBgColor: uni.bgColor,
            uniPrimaryColor: uni.primaryColor
          });
        });
      });
    });
    return list;
  }, [finalUnis]);

  // Compute final filtered university majors
  const filteredUniversityMajors = useMemo(() => {
    return allUniversityMajors.filter(m => {
      // 1. Broad Field Filter
      if (selectedBroadFieldId && m.broadFieldId !== selectedBroadFieldId) return false;

      // 2. Detailed Field Filter
      if (selectedDetailedFieldId && m.detailedFieldId !== selectedDetailedFieldId) return false;

      // 3. Spotlight Highlights Filter
      if (spotlightFilter === 'highest' && m.specialTag !== 'highest') return false;
      if (spotlightFilter === 'lowest' && m.specialTag !== 'lowest') return false;
      if (spotlightFilter === 'favorites' && !favorites.includes(m.id) && !favorites.includes(m.nationalMajorId)) return false;

      if (spotlightFilter === 'fast_growing') {
        const detField = detailedFields.find(df => df.id === m.detailedFieldId);
        if (!detField || detField.degreeProductionChangePercent < 50) return false;
      }

      // 3.5. Academic Subject Demands Filters
      const demands = calculateSubjectDemands(m.standardMajor);
      if (demandsFilter.math !== 'all' && demands.math !== demandsFilter.math) return false;
      if (demandsFilter.physics !== 'all' && demands.physics !== demandsFilter.physics) return false;
      if (demandsFilter.chemistry !== 'all' && demands.chemistry !== demandsFilter.chemistry) return false;
      if (demandsFilter.biology !== 'all' && demands.biology !== demandsFilter.biology) return false;
      if (demandsFilter.humanities !== 'all' && demands.humanities !== demandsFilter.humanities) return false;

      // 4. Search text matches Bilingual Name, University name or School name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesEn = m.nameEn.toLowerCase().includes(q);
        const matchesZh = m.nameZh.toLowerCase().includes(q);
        const matchesZht = (m.nameZht || toTraditional(m.nameZh)).toLowerCase().includes(q);
        
        const matchesUniEn = m.uniNameEn.toLowerCase().includes(q);
        const matchesUniZh = m.uniNameZh.toLowerCase().includes(q);
        const matchesUniZht = (m.uniNameZht || toTraditional(m.uniNameZh)).toLowerCase().includes(q);
        
        const matchesSchoolEn = m.schoolNameEn.toLowerCase().includes(q);
        const matchesSchoolZh = m.schoolNameZh.toLowerCase().includes(q);
        
        const matchesSub = m.submajors?.some((sm: string) => sm.toLowerCase().includes(q)) || false;
        const matchesNotesEn = m.notesEn?.toLowerCase().includes(q) || false;
        const matchesNotesZh = m.notesZh?.toLowerCase().includes(q) || false;

        if (!matchesEn && !matchesZh && !matchesZht && 
            !matchesUniEn && !matchesUniZh && !matchesUniZht && 
            !matchesSchoolEn && !matchesSchoolZh &&
            !matchesSub && !matchesNotesEn && !matchesNotesZh) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'category') {
        return a.detailedFieldId.localeCompare(b.detailedFieldId);
      }
      return language === 'zh' || language === 'zht'
        ? a.nameZh.localeCompare(b.nameZh, 'zh-Hans-CN')
        : a.nameEn.localeCompare(b.nameEn);
    });
  }, [allUniversityMajors, selectedBroadFieldId, selectedDetailedFieldId, spotlightFilter, demandsFilter, searchQuery, sortOrder, language, favorites]);

  // Compute final filtered & searched majors list
  const filteredMajors = useMemo(() => {
    return majors.filter(m => {
      // 1. Broad Field Filter
      if (selectedBroadFieldId && m.broadFieldId !== selectedBroadFieldId) return false;

      // 2. Detailed Field Filter
      if (selectedDetailedFieldId && m.detailedFieldId !== selectedDetailedFieldId) return false;

      // 3. Spotlight Highlights Filter
      if (spotlightFilter === 'highest' && m.specialTag !== 'highest') return false;
      if (spotlightFilter === 'lowest' && m.specialTag !== 'lowest') return false;
      if (spotlightFilter === 'favorites' && !favorites.includes(m.id)) return false;
      
      if (spotlightFilter === 'fast_growing') {
        const detField = detailedFields.find(df => df.id === m.detailedFieldId);
        if (!detField || detField.degreeProductionChangePercent < 50) return false;
      }

      // 3.5. Academic Subject Demands Filters
      const demands = calculateSubjectDemands(m);
      if (demandsFilter.math !== 'all' && demands.math !== demandsFilter.math) return false;
      if (demandsFilter.physics !== 'all' && demands.physics !== demandsFilter.physics) return false;
      if (demandsFilter.chemistry !== 'all' && demands.chemistry !== demandsFilter.chemistry) return false;
      if (demandsFilter.biology !== 'all' && demands.biology !== demandsFilter.biology) return false;
      if (demandsFilter.humanities !== 'all' && demands.humanities !== demandsFilter.humanities) return false;

      // 4. Search text matches Bilingual Name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesEn = m.nameEn.toLowerCase().includes(q);
        const matchesZh = m.nameZh.toLowerCase().includes(q);
        const matchesZht = (m.nameZht || toTraditional(m.nameZh)).toLowerCase().includes(q);
        if (!matchesEn && !matchesZh && !matchesZht) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'category') {
        return a.detailedFieldId.localeCompare(b.detailedFieldId);
      }
      return language === 'zh' || language === 'zht'
        ? getMajorName(a).localeCompare(getMajorName(b), 'zh-Hans-CN')
        : a.nameEn.localeCompare(b.nameEn);
    });
  }, [selectedBroadFieldId, selectedDetailedFieldId, spotlightFilter, demandsFilter, searchQuery, sortOrder, language, favorites]);

  // Find the statistics metrics of the selected sets
  const activeBroadFieldObject = useMemo(() => {
    return broadFields.find(bf => bf.id === selectedBroadFieldId);
  }, [selectedBroadFieldId]);

  const activeDetailedFieldObject = useMemo(() => {
    return detailedFields.find(df => df.id === selectedDetailedFieldId);
  }, [selectedDetailedFieldId]);

  const activeFilteredMajors = searchScope === 'standard' ? filteredMajors : filteredUniversityMajors;
  const activeTotalCount = searchScope === 'standard' ? 152 : allUniversityMajors.length;

  return (
    <div className="space-y-6 font-sans" id="majors-directory-hub">
      {/* Search Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        
        {/* Search Scope Switcher Banner */}
        <div className="flex border border-slate-200 bg-slate-50 p-1 rounded-xl max-w-md gap-1">
          <button
            onClick={() => setSearchScope('standard')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              searchScope === 'standard'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'zh' ? '152个全美标准专业' : language === 'zht' ? '152個全美標準專業' : '152 Standard Majors'}</span>
          </button>
          <button
            onClick={() => setSearchScope('university')}
            className={`flex-1 py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              searchScope === 'university'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            <School className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'zh' ? `具体院校开设专业 (${allUniversityMajors.length})` : language === 'zht' ? `具體院校開設專業 (${allUniversityMajors.length})` : `University Specific Majors (${allUniversityMajors.length})`}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Main Search */}
          <div className="col-span-1 md:col-span-6 relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
              {searchScope === 'standard' 
                ? (language === 'zh' ? '在 152 个大学专业目录中进行模糊搜索' : language === 'zht' ? '在 152 個大學專業目錄中進行模糊搜索' : 'Search Across 152 Accredited Majors')
                : (language === 'zh' ? `在 ${allUniversityMajors.length} 个院校细分专业目录中进行模糊搜索` : language === 'zht' ? `在 ${allUniversityMajors.length} 個院校細分專業目錄中進行模糊搜索` : `Search Across ${allUniversityMajors.length} University Specific Majors`)
              }
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder={language === 'zh' 
                  ? (searchScope === 'standard' ? "输入专业中文或英文拼写 (例如：Computer, 会计...)" : "输入专业名称、大学、学系或课程细项 (例如：MIT, Physics, LSA...)")
                  : "Enter major name, university, or school program (e.g. CS, Harvard, Ross...)"
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button 
                  onClick={() => onSearchQueryChange('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="col-span-1 md:col-span-6">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
              {language === 'zh' ? '高亮专业筛查' : language === 'zht' ? '高亮專業篩查' : 'Spotlight & extreme Filters'}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSpotlightFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  spotlightFilter === 'all'
                    ? 'bg-slate-100 text-slate-800 border-slate-200 shadow-inner'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {searchScope === 'standard'
                  ? (language === 'zh' ? '全部 152 个专业' : language === 'zht' ? '全部 152 個專業' : 'All 152 Majors')
                  : (language === 'zh' ? `全部 ${allUniversityMajors.length} 个开设专业` : language === 'zht' ? `全部 ${allUniversityMajors.length} 個開設專業` : `All ${allUniversityMajors.length} Specific Majors`)
                }
              </button>

              <button
                onClick={() => setSpotlightFilter(prev => prev === 'highest' ? 'all' : 'highest')}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  spotlightFilter === 'highest'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs ring-1 ring-emerald-100'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:text-emerald-600'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                {language === 'zh' ? '最高薪高亮' : 'Highest Earners'}
              </button>

              <button
                onClick={() => setSpotlightFilter(prev => prev === 'lowest' ? 'all' : 'lowest')}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  spotlightFilter === 'lowest'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs ring-1 ring-rose-100'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:text-rose-600'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                {language === 'zh' ? '最低薪警示' : 'Lowest Earners'}
              </button>

              <button
                onClick={() => setSpotlightFilter(prev => prev === 'fast_growing' ? 'all' : 'fast_growing')}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  spotlightFilter === 'fast_growing'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs ring-1 ring-amber-100'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:text-amber-600'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                {language === 'zh' ? '超长线高增速 (产出增幅 >50%)' : 'High growth (>50%)'}
              </button>

              <button
                onClick={() => setSpotlightFilter(prev => prev === 'favorites' ? 'all' : 'favorites')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  spotlightFilter === 'favorites'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs ring-1 ring-amber-100'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50 hover:text-amber-600'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${spotlightFilter === 'favorites' ? 'fill-amber-500 text-amber-500' : 'text-amber-550 text-amber-500'}`} />
                <span>
                  {language === 'zh' ? `我的选择/收藏 (${favorites.length})` : `My Bookmarks (${favorites.length})`}
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* Dynamic Subject Demands Filters Panel */}
        <div className="border-t border-slate-100 mt-5 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              {language === 'zh' ? '五大学科能力需求关联检索 / 专属定位' : 'Academic Subject Strengths Filter / Bilingual Finder'}
            </h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold border border-blue-100">
              {language === 'zh' ? '支持多选组合定位' : 'Multi-Target Combined Filters'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {subjectData.map(subj => {
              const currentVal = demandsFilter[subj.id];
              return (
                <div key={subj.id} className="bg-slate-50/50 border border-slate-150 p-3 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      {language === 'en' ? subj.nameEn : (language === 'zht' ? toTraditional(subj.nameZh) : subj.nameZh)}
                    </span>
                    {currentVal !== 'all' && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase ${getDemandBadgeClass(currentVal as any)}`}>
                        {getDemandLabel(currentVal as any, language)}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {(['all', 'H', 'M', 'L'] as const).map(level => {
                      const isActive = currentVal === level;
                      let btnClass = "";
                      if (isActive) {
                        if (level === 'all') btnClass = "bg-slate-800 text-white border-slate-800 shadow-xs";
                        else if (level === 'H') btnClass = "bg-blue-600 text-white border-blue-600 shadow-xs";
                        else if (level === 'M') btnClass = "bg-amber-500 text-white border-amber-500 shadow-xs";
                        else btnClass = "bg-slate-500 text-white border-slate-500 shadow-xs";
                      } else {
                        btnClass = "bg-white hover:bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900";
                      }

                      return (
                        <button
                          key={level}
                          onClick={() => setDemandsFilter(prev => ({ ...prev, [subj.id]: level }))}
                          className={`py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer text-center ${btnClass}`}
                        >
                          {level === 'all' 
                            ? (language === 'en' ? 'All' : '不限')
                            : getDemandLabel(level, language)
                          }
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Active Category Summary Pills */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 mt-5 pt-4 gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">{language === 'en' ? 'Active Filtering Trace:' : '当前筛选链:'}</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 text-slate-600 rounded-lg font-medium">
                {activeBroadFieldObject ? getFieldName(activeBroadFieldObject) : (language === 'en' ? 'All Broad Industries' : '全行业')}
              </span>
              {activeDetailedFieldObject && (
                <>
                  <span className="text-slate-350 text-slate-300">/</span>
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg font-medium">
                    {getFieldName(activeDetailedFieldObject)}
                  </span>
                </>
              )}
              {spotlightFilter !== 'all' && (
                <>
                  <span className="text-slate-350 text-slate-300">/</span>
                  <span className="bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-lg font-mono font-semibold">
                    {spotlightFilter === 'highest' && (language === 'zh' ? '最高薪突出力' : 'TOP CEILING')}
                    {spotlightFilter === 'lowest' && (language === 'zh' ? '底部预警' : 'CAUTION BASE')}
                    {spotlightFilter === 'fast_growing' && (language === 'zh' ? '学生规模强劲扩招' : 'STUDENT SWELL')}
                    {spotlightFilter === 'favorites' && (language === 'zh' ? '已收藏备选专业' : 'MY BOOKMARKED TARGETS')}
                  </span>
                </>
              )}
              {/* Mathematics Demand Pill */}
              {demandsFilter.math !== 'all' && (
                <>
                  <span className="text-slate-350 text-slate-300">/</span>
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                    <span>{language === 'zh' ? '数学' : 'Math'}: {getDemandLabel(demandsFilter.math as DemandLevel, language)}</span>
                    <button onClick={() => setDemandsFilter(prev => ({ ...prev, math: 'all' }))} className="hover:text-blue-900 ml-1 font-bold cursor-pointer">×</button>
                  </span>
                </>
              )}
              {/* Physics Demand Pill */}
              {demandsFilter.physics !== 'all' && (
                <>
                  <span className="text-slate-350 text-slate-300">/</span>
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                    <span>{language === 'zh' ? '物理' : 'Phys'}: {getDemandLabel(demandsFilter.physics as DemandLevel, language)}</span>
                    <button onClick={() => setDemandsFilter(prev => ({ ...prev, physics: 'all' }))} className="hover:text-blue-900 ml-1 font-bold cursor-pointer">×</button>
                  </span>
                </>
              )}
              {/* Chemistry Demand Pill */}
              {demandsFilter.chemistry !== 'all' && (
                <>
                  <span className="text-slate-350 text-slate-300">/</span>
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                    <span>{language === 'zh' ? '化学' : 'Chem'}: {getDemandLabel(demandsFilter.chemistry as DemandLevel, language)}</span>
                    <button onClick={() => setDemandsFilter(prev => ({ ...prev, chemistry: 'all' }))} className="hover:text-blue-900 ml-1 font-bold cursor-pointer">×</button>
                  </span>
                </>
              )}
              {/* Biology Demand Pill */}
              {demandsFilter.biology !== 'all' && (
                <>
                  <span className="text-slate-350 text-slate-300">/</span>
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                    <span>{language === 'zh' ? '生物' : 'Bio'}: {getDemandLabel(demandsFilter.biology as DemandLevel, language)}</span>
                    <button onClick={() => setDemandsFilter(prev => ({ ...prev, biology: 'all' }))} className="hover:text-blue-900 ml-1 font-bold cursor-pointer">×</button>
                  </span>
                </>
              )}
              {/* Humanities Demand Pill */}
              {demandsFilter.humanities !== 'all' && (
                <>
                  <span className="text-slate-350 text-slate-300">/</span>
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                    <span>{language === 'zh' ? '人文' : 'Hum'}: {getDemandLabel(demandsFilter.humanities as DemandLevel, language)}</span>
                    <button onClick={() => setDemandsFilter(prev => ({ ...prev, humanities: 'all' }))} className="hover:text-blue-900 ml-1 font-bold cursor-pointer">×</button>
                  </span>
                </>
              )}
              {searchQuery && (
                <>
                  <span className="text-slate-350 text-slate-300">/</span>
                  <span className="bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-lg">
                    "{searchQuery}"
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Reset */}
            {(selectedBroadFieldId || selectedDetailedFieldId || spotlightFilter !== 'all' || searchQuery || demandsFilter.math !== 'all' || demandsFilter.physics !== 'all' || demandsFilter.chemistry !== 'all' || demandsFilter.biology !== 'all' || demandsFilter.humanities !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
                {language === 'zh' ? '清除全部重置' : 'Reset All Filters'}
              </button>
            )}

            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 border border-slate-200 rounded-lg shadow-inner">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 px-2.5 rounded-md text-xs transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-xs ring-1 ring-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
                title={language === 'zh' ? '网格视图' : 'Grid Layout'}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 px-2.5 rounded-md text-xs transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-xs ring-1 ring-slate-200/40' : 'text-slate-500 hover:text-slate-800'}`}
                title={language === 'zh' ? '表格列表视图' : 'Table List Layout'}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Central Display of Bookmarked Majors (我的已收藏专业集中展示区) */}
      <div className="pt-2">
        <AnimatePresence>
          {favorites.length > 0 ? (
            <motion.div
              key="favorites-shortlist-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
              className="bg-amber-50/15 border border-amber-200/80 rounded-2xl p-5 shadow-xs relative mb-6"
            >
              {/* Background amber glow badge */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100/70 border border-amber-200 text-amber-600 rounded-xl">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {language === 'zh' ? '🌟 已收藏的目标备选专业备忘库' : '🌟 My Bookmarked Target Majors Shortlist'}
                      <span className="bg-amber-500 text-white text-[11px] px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                        {favorites.length}
                      </span>
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {language === 'zh' ? '您规划并标星的目标学科已在此处集中横向展示，可在下方专业列表中点击星号随时增减：' : 'Self-selected target majors preserved here for direct cross-subject comparison.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(language === 'zh' ? '确定要清空您收藏的所有目标专业吗？' : 'Are you sure you want to clear your saved majors?')) {
                      setFavorites([]);
                      localStorage.setItem('favorited_majors', JSON.stringify([]));
                    }
                  }}
                  className="text-xs text-rose-650 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1.5 transition-colors font-bold cursor-pointer"
                >
                  {language === 'zh' ? '清空收藏库' : 'Clear All'}
                </button>
              </div>

              {/* Showcase Grid of Favorited Majors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
                {favorites.map(favId => {
                  const major = majors.find(m => m.id === favId);
                  if (!major) return null;
                  const df = detailedFields.find(f => f.id === major.detailedFieldId);
                  const bf = broadFields.find(f => f.id === major.broadFieldId);
                  const demands = calculateSubjectDemands(major);

                  return (
                    <motion.div
                      layout
                      key={favId}
                      className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-inner flex flex-col justify-between group hover:border-amber-450 transition-all duration-200"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[9px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded">
                            {bf ? getFieldName(bf).substring(0, 8) : ''}
                          </span>
                          
                          <button
                            onClick={() => toggleFavorite(favId)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-50 transition-all cursor-pointer"
                            title={language === 'zh' ? '移除收藏' : 'Remove Favorited'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="font-extrabold text-slate-800 text-sm leading-tight line-clamp-1">
                          {getMajorName(major)}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 mb-2 line-clamp-1 font-medium italic">
                          {language === 'en' ? major.nameZh : major.nameEn}
                        </p>

                        {/* Subject requirements indicator strip */}
                        <div className="grid grid-cols-5 gap-1 border-t border-slate-50 pt-2 mb-2 bg-slate-50/50 p-1 rounded-lg border border-slate-100">
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
                      </div>

                      <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-400 font-medium">
                          {language === 'zh' ? '成熟期中位年薪:' : 'Prime Median:'}
                        </span>
                        <span className="font-mono text-emerald-800">
                          {major.specialTag === 'highest' && major.earningsValue
                            ? `$${(major.earningsValue / 1000).toFixed(0)}k/年`
                            : major.specialTag === 'lowest' && major.earningsValue
                              ? `$${(major.earningsValue / 1000).toFixed(0)}k/年`
                              : df 
                                ? `$${(df.primeMedianEarningsVal / 1000).toFixed(0)}k/年`
                                : '-'
                          }
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-105 border border-dashed border-slate-200 py-4 px-6 rounded-2xl flex flex-col items-center justify-center text-center mb-6">
              <Star className="w-5 h-5 text-slate-300 mb-1.5" />
              <h4 className="text-slate-600 font-bold text-xs">
                {language === 'zh' ? '🌟 暂无收藏的目标计划专业' : '🌟 Bookmark Shortlist is empty'}
              </h4>
              <p className="text-slate-400 text-[11px] max-w-md mt-1 leading-relaxed">
                {language === 'zh' 
                  ? '下方专业卡片上点击星号 ⭐️ 按钮，即可将该学科加入此处进行单独集中横向展示与核心对比。' 
                  : 'Click the star ⭐️ button on any major card below to bookmark it here for detailed comparison.'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Directory Content Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-slate-500 text-sm">
            {language === 'zh' ? (
              <>
                已为您检索出 <strong className="text-slate-800 font-bold">{activeFilteredMajors.length}</strong> / {activeTotalCount} 个专业结果
              </>
            ) : language === 'zht' ? (
              <>
                已為您檢索出 <strong className="text-slate-800 font-bold">{activeFilteredMajors.length}</strong> / {activeTotalCount} 個專業結果
              </>
            ) : (
              <>
                Mapped <strong className="text-slate-800 font-bold">{activeFilteredMajors.length}</strong> out of {activeTotalCount} potential majors
              </>
            )}
          </div>

          {/* Sorters */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">{language === 'zh' ? '排序方式:' : 'Sort Order:'}</span>
            <button
              onClick={() => setSortOrder(prev => prev === 'name' ? 'category' : 'name')}
              className="text-slate-700 hover:text-slate-900 transition-colors font-semibold flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-450" />
              {sortOrder === 'name'
                ? (language === 'zh' ? '名称首字母' : language === 'zht' ? '名稱首字母' : 'Alphabetical Name')
                : (language === 'zh' ? '学科大分类' : language === 'zht' ? '學科大分類' : 'Detailed Class Category')
              }
            </button>
          </div>
        </div>

        {activeFilteredMajors.length === 0 ? (
          <div className="bg-white border border-slate-200 text-center rounded-2xl py-14 px-6 shadow-xs">
            <Info className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h4 className="text-slate-800 font-bold text-lg">
              {language === 'zh' ? '没有找到符合条件的大学专业' : language === 'zht' ? '沒有找到符合條件的大學專業' : 'No Academic Majors Match Your Search'}
            </h4>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 leading-relaxed">
              {language === 'zh' 
                ? '我们未能找到符合当前筛选条件的专业。您可以尝试清空搜索文本或点击上方的重置过滤器。' 
                : language === 'zht'
                  ? '我們未能找到符合當前篩選條件的專業。您可以嘗試清空搜索文本或點擊上方的重置過濾器。'
                  : 'Try adjusting your search query or subject demands settings.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {viewMode === 'grid' ? (
              <motion.div 
                layout 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {activeFilteredMajors.map((major, idx) => {
                  const isUni = searchScope === 'university';
                  const majorId = major.id;
                  const standardMajorObj = isUni ? (major as any).standardMajor : major;
                  
                  const df = detailedFields.find(f => f.id === standardMajorObj.detailedFieldId);
                  const bf = broadFields.find(f => f.id === standardMajorObj.broadFieldId);
                  const isHighestSpotlight = standardMajorObj.specialTag === 'highest';
                  const isLowestSpotlight = standardMajorObj.specialTag === 'lowest';
                  const demands = calculateSubjectDemands(standardMajorObj);
                  const isFavorite = favorites.includes(majorId);

                  const cardTitle = isUni 
                    ? (language === 'en' ? major.nameEn : (language === 'zht' ? major.nameZht : major.nameZh))
                    : getMajorName(major);
                  
                  const cardSubtitle = isUni
                    ? (language === 'en' ? major.standardMajor.nameEn : (language === 'zht' ? (major.standardMajor.nameZht || toTraditional(major.standardMajor.nameZh || '')) : major.standardMajor.nameZh))
                    : (language === 'en' ? major.nameZh : major.nameEn);

                  return (
                    <motion.div
                      key={major.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.015, 0.15) }}
                      className={`border p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 shadow-xs min-h-[195px] relative overflow-hidden ${
                        isHighestSpotlight 
                           ? 'bg-emerald-50/50 border-emerald-300'
                           : isLowestSpotlight
                             ? 'bg-rose-50/50 border-rose-300'
                             : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/45'
                      }`}
                    >
                      {/* Interactive glow effect */}
                      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none rounded-full blur-[80px]" />

                      <div>
                        {/* Upper Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-500 shrink-0">
                            {bf ? getFieldName(bf).substring(0, 8) : ''}
                          </span>
                          
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {isUni && (
                              <div className="flex items-center gap-0.5 shrink-0 max-w-[120px] overflow-hidden">
                                {(major as any).uniRankingQs && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 tracking-tight">
                                    QS #{(major as any).uniRankingQs}
                                  </span>
                                )}
                                {(major as any).uniRankingUsNews && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 tracking-tight">
                                    US #{(major as any).uniRankingUsNews}
                                  </span>
                                )}
                              </div>
                            )}

                            {isHighestSpotlight && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5 shadow-xs shrink-0">
                                <Trophy className="w-2.5 h-2.5 text-emerald-600" />
                                {language === 'zh' ? '最高薪' : 'Highest'}
                              </span>
                            )}

                            {isLowestSpotlight && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-0.5 shadow-xs shrink-0">
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                {language === 'zh' ? '起步低' : 'Lower'}
                              </span>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(major.id);
                              }}
                              className={`p-1 rounded-md border transition-all cursor-pointer shrink-0 ${
                                isFavorite 
                                  ? 'bg-amber-100/70 text-amber-500 border-amber-200 shadow-xs' 
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-350 hover:text-amber-500 border-slate-200'
                              }`}
                              title={language === 'zh' ? (isFavorite ? "取消收藏" : "收藏专业") : (isFavorite ? "Remove from targets" : "Add to targets")}
                            >
                              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Title Bilingual */}
                        <h5 className="text-slate-800 font-bold text-base leading-snug tracking-tight mb-0.5 line-clamp-1">
                          {cardTitle}
                        </h5>
                        <p className="text-slate-400 text-xs font-semibold tracking-wide mb-2 truncate">
                          {cardSubtitle}
                        </p>

                        {/* Specific University Row */}
                        {isUni && (
                          <div className="flex items-center gap-1.5 mb-2 bg-slate-50 border border-slate-150 p-2 rounded-xl">
                            <div 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: (major as any).uniPrimaryColor || '#2563eb' }}
                            />
                            <div className="text-[11px] font-bold text-slate-700 truncate">
                              {language === 'en' ? (major as any).uniNameEn : (language === 'zht' ? (major as any).uniNameZht : (major as any).uniNameZh)}
                              <span className="text-slate-300 font-medium mx-1">/</span>
                              <span className="text-slate-500 font-medium">
                                {language === 'en' ? (major as any).schoolNameEn : (language === 'zht' ? (major as any).schoolNameZht : (major as any).schoolNameZh)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Subject requirements indicator */}
                        <div className="mt-2 grid grid-cols-5 gap-1 border-t border-slate-100 pt-2">
                          <div className="text-center">
                            <div className="text-[9px] font-bold text-slate-400">{language === 'zh' ? '数学' : 'Math'}</div>
                            <div className={`text-[10px] font-extrabold rounded-lg py-0.5 mt-0.5 border ${getDemandBadgeClass(demands.math)}`}>
                              {getDemandLabel(demands.math, language)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[9px] font-bold text-slate-400">{language === 'zh' ? '物理' : 'Phys'}</div>
                            <div className={`text-[10px] font-extrabold rounded-lg py-0.5 mt-0.5 border ${getDemandBadgeClass(demands.physics)}`}>
                              {getDemandLabel(demands.physics, language)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[9px] font-bold text-slate-400">{language === 'zh' ? '化学' : 'Chem'}</div>
                            <div className={`text-[10px] font-extrabold rounded-lg py-0.5 mt-0.5 border ${getDemandBadgeClass(demands.chemistry)}`}>
                              {getDemandLabel(demands.chemistry, language)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[9px] font-bold text-slate-400">{language === 'zh' ? '生物' : 'Bio'}</div>
                            <div className={`text-[10px] font-extrabold rounded-lg py-0.5 mt-0.5 border ${getDemandBadgeClass(demands.biology)}`}>
                              {getDemandLabel(demands.biology, language)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[9px] font-bold text-slate-400">{language === 'zh' ? '人文' : 'Hum'}</div>
                            <div className={`text-[10px] font-extrabold rounded-lg py-0.5 mt-0.5 border ${getDemandBadgeClass(demands.humanities)}`}>
                              {getDemandLabel(demands.humanities, language)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="border-t border-slate-200 mt-3 pt-2.5 flex items-center justify-between text-xs">
                        <div className="text-slate-400 font-semibold font-medium truncate max-w-[150px]">
                          {language === 'zh' ? '归属大类:' : language === 'zht' ? '歸屬大類:' : 'Field:'}{' '}
                          <span className="text-slate-700 font-bold underline decoration-slate-300 underline-offset-2">
                            {df ? getFieldName(df) : ''}
                          </span>
                        </div>

                        {/* Redirection shortcut or statistic indicator */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {df && (
                            <span className="font-mono text-[10px] font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                              {standardMajorObj.specialTag === 'highest' && standardMajorObj.earningsValue
                                ? `$${(standardMajorObj.earningsValue / 1000).toFixed(0)}k/年`
                                : standardMajorObj.specialTag === 'lowest' && standardMajorObj.earningsValue
                                  ? `$${(standardMajorObj.earningsValue / 1000).toFixed(0)}k/年`
                                  : `$${(df.primeMedianEarningsVal / 1000).toFixed(0)}k/年`
                              }
                            </span>
                          )}

                          {isUni && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                localStorage.setItem('preferred_uni_id', (major as any).uniId);
                                localStorage.setItem('preferred_school_id', (major as any).id.split('-')[1]);
                                window.dispatchEvent(new Event('navigate_to_university'));
                              }}
                              className="text-[10px] font-extrabold text-blue-650 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer bg-blue-50/70 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200 shadow-2xs transition-all"
                            >
                              <span>{language === 'zh' ? '前往地图' : language === 'zht' ? '前往地圖' : 'Map'}</span>
                              <School className="w-2.5 h-2.5 text-blue-650" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              // Table List Layout
              <motion.div 
                layout
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs overflow-x-auto"
              >
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <th className="py-4 px-4 text-center w-12">⭐</th>
                      <th className="py-4 px-6">{language === 'zh' ? '学位专业名称' : language === 'zht' ? '學位專業名稱' : 'Degree Major Title'}</th>
                      <th className="py-4 px-6">{language === 'zh' ? '归属大类分类' : language === 'zht' ? '歸屬大類分類' : 'Detailed Field Segment'}</th>
                      <th className="py-4 px-6">{language === 'zh' ? '核心学科关联需求' : language === 'zht' ? '核心學科關聯需求' : 'Subject Demands'}</th>
                      <th className="py-4 px-6">{language === 'zh' ? '所属产业模块' : language === 'zht' ? '所屬產業模塊' : 'Industry Module'}</th>
                      <th className="py-4 px-6 text-right">{language === 'zh' ? '黄金年龄大类收入' : language === 'zht' ? '黃金年齡大類收入' : 'Prime-age Field Earnings'}</th>
                      <th className="py-4 px-6 text-right">{language === 'zh' ? '失业率' : language === 'zht' ? '失業率' : 'Unemployment'}</th>
                      {searchScope === 'university' && (
                        <th className="py-4 px-6 text-right">{language === 'zh' ? '院校地图' : language === 'zht' ? '院校地圖' : 'Map Detail'}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {activeFilteredMajors.map((major, idx) => {
                      const isUni = searchScope === 'university';
                      const majorId = major.id;
                      const standardMajorObj = isUni ? (major as any).standardMajor : major;
                      
                      const df = detailedFields.find(f => f.id === standardMajorObj.detailedFieldId);
                      const bf = broadFields.find(f => f.id === standardMajorObj.broadFieldId);
                      const isHighestSpotlight = standardMajorObj.specialTag === 'highest';
                      const isLowestSpotlight = standardMajorObj.specialTag === 'lowest';
                      const demands = calculateSubjectDemands(standardMajorObj);
                      const isFavorite = favorites.includes(majorId);

                      const rowTitle = isUni 
                        ? (language === 'en' ? major.nameEn : (language === 'zht' ? major.nameZht : major.nameZh))
                        : getMajorName(major);
                      
                      const rowSubtitle = isUni
                        ? (language === 'en' ? major.standardMajor.nameEn : (language === 'zht' ? (major.standardMajor.nameZht || toTraditional(major.standardMajor.nameZh || '')) : major.standardMajor.nameZh))
                        : (language === 'en' ? major.nameZh : major.nameEn);

                      return (
                        <tr 
                          key={major.id}
                          className="border-b border-slate-100 text-sm hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(major.id);
                              }}
                              className={`p-1 rounded transition-all cursor-pointer border ${
                                isFavorite 
                                  ? 'bg-amber-50 text-amber-500 border-amber-200 shadow-xs' 
                                  : 'bg-white hover:bg-slate-100 text-slate-350 hover:text-amber-500 border-slate-200'
                              }`}
                              title={language === 'zh' ? (isFavorite ? '取消收藏' : '添加收藏') : (isFavorite ? 'Remove bookmark' : 'Add bookmark')}
                            >
                              <Star className={`w-3 h-3 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                            </button>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex flex-col max-w-[280px]">
                              <div className="flex flex-wrap items-center gap-1.5 font-bold text-slate-800">
                                <span>{rowTitle}</span>
                                {isHighestSpotlight && (
                                  <span className="scale-90 bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-emerald-200 flex items-center gap-0.5 shrink-0 animate-pulse">
                                    <Trophy className="w-2 h-2" />
                                    {language === 'zh' ? '高薪' : language === 'zht' ? '高薪' : 'Highest'}
                                  </span>
                                )}
                                {isLowestSpotlight && (
                                  <span className="scale-90 bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-md text-[9px] font-bold border border-rose-200 flex items-center gap-0.5 shrink-0">
                                    <AlertTriangle className="w-2 h-2" />
                                    {language === 'zh' ? '起步低' : language === 'zht' ? '起步低' : 'Lower'}
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-400 text-xs font-semibold truncate">
                                {rowSubtitle}
                              </span>
                              
                              {/* University Indicator for Table */}
                              {isUni && (
                                <div className="text-[10px] text-blue-600 font-bold mt-1 flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: (major as any).uniPrimaryColor || '#2563eb' }} />
                                  <span className="truncate">
                                    {language === 'en' ? (major as any).uniNameEn : (language === 'zht' ? (major as any).uniNameZht : (major as any).uniNameZh)}
                                    {' '}-{' '}
                                    {language === 'en' ? (major as any).schoolNameEn : (language === 'zht' ? (major as any).schoolNameZht : (major as any).schoolNameZh)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-6 font-semibold text-slate-700">
                            {df ? getFieldName(df) : ''}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="flex items-center gap-0.5 bg-slate-50 border border-slate-150 px-1 py-0.5 rounded">
                                <span className="text-[9px] text-slate-400 font-bold">{language === 'zh' ? '数' : 'M'}</span>
                                <span className={`px-1 text-[9px] font-extrabold rounded border ${getDemandBadgeClass(demands.math)}`}>
                                  {getDemandLabel(demands.math, language)}
                                </span>
                              </span>
                              <span className="flex items-center gap-0.5 bg-slate-50 border border-slate-150 px-1 py-0.5 rounded">
                                <span className="text-[9px] text-slate-400 font-bold">{language === 'zh' ? '物' : 'P'}</span>
                                <span className={`px-1 text-[9px] font-extrabold rounded border ${getDemandBadgeClass(demands.physics)}`}>
                                  {getDemandLabel(demands.physics, language)}
                                </span>
                              </span>
                              <span className="flex items-center gap-0.5 bg-slate-50 border border-slate-150 px-1 py-0.5 rounded">
                                <span className="text-[9px] text-slate-400 font-bold">{language === 'zh' ? '化' : 'C'}</span>
                                <span className={`px-1 text-[9px] font-extrabold rounded border ${getDemandBadgeClass(demands.chemistry)}`}>
                                  {getDemandLabel(demands.chemistry, language)}
                                </span>
                              </span>
                              <span className="flex items-center gap-0.5 bg-slate-50 border border-slate-150 px-1 py-0.5 rounded">
                                <span className="text-[9px] text-slate-400 font-bold">{language === 'zh' ? '生' : 'B'}</span>
                                <span className={`px-1 text-[9px] font-extrabold rounded border ${getDemandBadgeClass(demands.biology)}`}>
                                  {getDemandLabel(demands.biology, language)}
                                </span>
                              </span>
                              <span className="flex items-center gap-0.5 bg-slate-50 border border-slate-150 px-1 py-0.5 rounded">
                                <span className="text-[9px] text-slate-400 font-bold">{language === 'zh' ? '人' : 'H'}</span>
                                <span className={`px-1 text-[9px] font-extrabold rounded border ${getDemandBadgeClass(demands.humanities)}`}>
                                  {getDemandLabel(demands.humanities, language)}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-6 text-slate-500 text-xs">
                            {bf ? getFieldName(bf) : ''}
                          </td>
                          <td className="py-3 px-6 text-right font-mono font-bold text-slate-700 whitespace-nowrap">
                            {standardMajorObj.specialTag === 'highest' && standardMajorObj.earningsValue
                              ? `$${standardMajorObj.earningsValue.toLocaleString()} /年`
                              : standardMajorObj.specialTag === 'lowest' && standardMajorObj.earningsValue
                                ? `$${standardMajorObj.earningsValue.toLocaleString()} /年`
                                : df 
                                  ? `$${df.primeMedianEarningsVal.toLocaleString()} /年` 
                                  : '-'
                            }
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-slate-600 whitespace-nowrap">
                            {df ? (
                              <div className="flex flex-col text-right">
                                <span className="text-slate-800 font-bold">{df.unemploymentRecentPercent}%</span>
                                <span className="text-[10px] text-slate-400 font-medium">{language === 'zh' ? '成熟期' : 'Prime-Age'}: {df.unemploymentPrimePercent}%</span>
                              </div>
                            ) : '-'}
                          </td>
                          {isUni && (
                            <td className="py-3 px-6 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  localStorage.setItem('preferred_uni_id', (major as any).uniId);
                                  localStorage.setItem('preferred_school_id', (major as any).id.split('-')[1]);
                                  window.dispatchEvent(new Event('navigate_to_university'));
                                }}
                                className="text-[10px] font-extrabold text-blue-650 hover:underline flex items-center justify-end gap-0.5 cursor-pointer bg-blue-50/70 hover:bg-blue-100/85 px-2 py-1 rounded-lg border border-blue-200 transition-all inline-flex ml-auto"
                              >
                                <span>{language === 'zh' ? '前往地图' : language === 'zht' ? '前往地圖' : 'Map'}</span>
                                <School className="w-2.5 h-2.5 text-blue-650" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
