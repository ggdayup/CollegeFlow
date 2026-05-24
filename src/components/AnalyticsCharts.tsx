import React, { useState, useMemo } from 'react';
import { DetailedField } from '../types';
import { detailedFields, getBroadFieldById } from '../data/majorsData';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, DollarSign, Briefcase, Award, CheckCircle } from 'lucide-react';
import { toTraditional } from '../utils/chineseLocalization';

interface AnalyticsChartsProps {
  onSelectField: (fieldId: string | null) => void;
  selectedFieldId: string | null;
  language: 'zh' | 'zht' | 'en';
}

export default function AnalyticsCharts({ onSelectField, selectedFieldId, language }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState<'earnings' | 'growth' | 'unemployment'>('earnings');
  const [hoveredBarId, setHoveredBarId] = useState<string | null>(null);

  const t = (zh: string, en: string) => {
    if (language === 'zh') return zh;
    if (language === 'zht') return toTraditional(zh);
    return en;
  };

  const localizedFields = useMemo(() => {
    if (language !== 'zht') return detailedFields;
    return detailedFields.map(f => ({
      ...f,
      nameZh: toTraditional(f.nameZh)
    }));
  }, [language]);

  // Sorting based on selection for earnings leaderboards
  const displayFields = [...localizedFields].sort((a, b) => {
    if (activeTab === 'earnings') {
      return b.primeMedianEarningsVal - a.primeMedianEarningsVal;
    } else if (activeTab === 'growth') {
      return b.degreeProductionChangePercent - a.degreeProductionChangePercent;
    } else {
      return b.unemploymentRecentPercent - a.unemploymentRecentPercent;
    }
  });

  // Helper for formatting large currency
  function formatCurrency(val: number) {
    if (language === 'zh') {
      return `$${(val / 1000).toFixed(0)}k  (约 ${(val * 7).toLocaleString('zh-CN', { maximumFractionDigits: 0 })} 元)`;
    }
    if (language === 'zht') {
      return `$${(val / 1000).toFixed(0)}k  (約 ${(val * 7).toLocaleString('zh-CN', { maximumFractionDigits: 0 })} 元)`;
    }
    return `$${val.toLocaleString('en-US')}`;
  }

  // Find max value respectively for percentages and values to scale charts
  const maxEarnings = Math.max(...localizedFields.map(f => f.primeMedianEarningsVal));
  const maxGrowth = Math.max(...localizedFields.map(f => Math.abs(f.degreeProductionChangePercent)));
  const maxUnemp = Math.max(...localizedFields.map(f => Math.max(f.unemploymentRecentPercent, f.unemploymentPrimePercent)));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 text-slate-800 shadow-xs" id="analytics-panel">
      {/* Chart Headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-5 font-sans">
        <div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            {t('交互式核心指标可视化', 'Interactive Analytics & Metrics Dashboard')}
          </h3>
          <p className="text-slate-550 text-slate-500 text-sm mt-1">
            {t(
              '点击柱状条可直接联动下方数据库，进行该专业大类的针对性筛选',
              'Click any bar to filter the bachelor majors database for that detailed field.'
            )}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-center border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'earnings'
                ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            {t('薪资领跑', 'Earnings')}
          </button>
          
          <button
            onClick={() => setActiveTab('growth')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'growth'
                ? 'bg-white text-amber-700 shadow-xs ring-1 ring-slate-250 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-600" />
            {t('热度趋势', 'Degree Growth')}
          </button>
          
          <button
            onClick={() => setActiveTab('unemployment')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'unemployment'
                ? 'bg-white text-purple-705 text-purple-700 shadow-xs ring-1 ring-slate-200/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4 text-purple-600" />
            {t('失业率对比', 'Unemployment')}
          </button>
        </div>
      </div>

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SVG Chart Core */}
        <div className="col-span-1 lg:col-span-8 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 px-1 border-b border-slate-200 pb-1.5 font-semibold">
            <span>{t('细分学科大类名称', 'Detailed Academic Field')}</span>
            <span>
              {activeTab === 'earnings' && t('黄金工作期中位数年薪', 'Prime-Age Median Year Earnings')}
              {activeTab === 'growth' && t('毕业生规模变动 (2009-2023)', 'Demand Growth Trend (2009–2023)')}
              {activeTab === 'unemployment' && t('失业率率对照 (近期 vs 黄金工作期)', 'Unemployment Comparison (Recent vs Prime-Age)')}
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {displayFields.map((field) => {
              const belongsBroadField = getBroadFieldById(field.broadFieldId);
              const isSelected = selectedFieldId === field.id;
              const isHovered = hoveredBarId === field.id;

              // Compute widths/scales
              let barPercentageVal = 0;
              let barColorClass = '';
              let trailText = '';

              if (activeTab === 'earnings') {
                barPercentageVal = (field.primeMedianEarningsVal / maxEarnings) * 100;
                barColorClass = isSelected 
                  ? 'bg-emerald-555 bg-emerald-500 shadow-xs' 
                  : 'bg-emerald-600/90 hover:bg-emerald-500';
                trailText = formatCurrency(field.primeMedianEarningsVal);
              } else if (activeTab === 'growth') {
                // Growth can be negative. Center is 0, lets scale based on absolute values
                barPercentageVal = (field.degreeProductionChangePercent / maxGrowth) * 100;
                barColorClass = field.degreeProductionChangePercent >= 0
                  ? isSelected ? 'bg-amber-500 shadow-xs' : 'bg-amber-600/90 hover:bg-amber-500'
                  : isSelected ? 'bg-rose-500 shadow-xs' : 'bg-rose-600/90 hover:bg-rose-500';
                trailText = `${field.degreeProductionChangePercent >= 0 ? '+' : ''}${field.degreeProductionChangePercent}%`;
              } else {
                // Unemployment compares recent vs prime-age
                barPercentageVal = (field.unemploymentRecentPercent / maxUnemp) * 100;
                barColorClass = isSelected 
                  ? 'bg-purple-500 shadow-xs' 
                  : 'bg-purple-600/90 hover:bg-purple-500';
                trailText = `${field.unemploymentRecentPercent}% v.s ${field.unemploymentPrimePercent}%`;
              }

              return (
                <div
                  key={field.id}
                  id={`field-bar-${field.id}`}
                  onClick={() => onSelectField(isSelected ? null : field.id)}
                  onMouseEnter={() => setHoveredBarId(field.id)}
                  onMouseLeave={() => setHoveredBarId(null)}
                  className={`group relative flex flex-col cursor-pointer p-2.5 rounded-xl transition-all duration-200 border ${
                    isSelected 
                      ? 'bg-blue-50/50 border-blue-200 shadow-xs' 
                      : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-150'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                        {belongsBroadField ? (language !== 'en' ? toTraditional(belongsBroadField.nameZh).substring(0, 8) : belongsBroadField.nameEn) : ''}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {language !== 'en' ? field.nameZh : field.nameEn}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600 inline shrink-0" />
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {trailText}
                    </span>
                  </div>

                  {/* Progressive Bar Visual */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative border border-slate-200">
                    {activeTab === 'growth' ? (
                      // Display dynamic scale centered at 0 or typical bounds
                      <div className="w-full h-full flex items-center relative">
                        {/* Center marker line representing 0% */}
                        <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-slate-300 z-10"></div>
                        {field.degreeProductionChangePercent >= 0 ? (
                          <div
                            className={`h-full rounded-r transition-all duration-500 ${barColorClass}`}
                            style={{
                              left: '30%',
                              width: `${(field.degreeProductionChangePercent / maxGrowth) * 70}%`,
                              position: 'absolute'
                            }}
                          ></div>
                        ) : (
                          <div
                            className={`h-full rounded-l transition-all duration-500 ${barColorClass}`}
                            style={{
                              right: '70%',
                              width: `${(Math.abs(field.degreeProductionChangePercent) / maxGrowth) * 30}%`,
                              position: 'absolute'
                            }}
                          ></div>
                        )}
                      </div>
                    ) : activeTab === 'unemployment' ? (
                      // Double indicator bar (Grouped layout inside one slider)
                      <div className="w-full h-full relative flex items-center">
                        {/* Recent Grads Unemp Bar */}
                        <div
                          className={`h-full transition-all duration-500 ${barColorClass}`}
                          style={{ width: `${barPercentageVal}%` }}
                        ></div>
                        {/* Prime-Age Unemp Point overlay */}
                        <div
                          className="absolute h-3 w-1.5 bg-blue-500 rounded shadow z-10 border border-white"
                          style={{ left: `${(field.unemploymentPrimePercent / maxUnemp) * 100}%` }}
                          title={`${t('黄金年龄失业率', 'Prime-age Unemployment')}: ${field.unemploymentPrimePercent}%`}
                        ></div>
                      </div>
                    ) : (
                      // Single Standard Bar
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
                        style={{ width: `${barPercentageVal}%` }}
                      ></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dashboard Insight Guide Card */}
        <div className="col-span-1 lg:col-span-4 self-stretch flex flex-col justify-between">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 h-full flex flex-col justify-between">
            <div>
              <div className="px-3 py-1 bg-white border border-slate-200 text-[10px] text-blue-600 rounded-full font-mono font-semibold uppercase tracking-wider inline-block mb-3 shadow-xs">
                {t('当前维度要点透视', 'Dynamic Insight Summary')}
              </div>

              {activeTab === 'earnings' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-base">
                    {t('💸 薪资高地特征', '💸 Earnings Ceiling')}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {t(
                      '工程学（Architecture & Engineering）及计算机、统计与数学类学科在黄金工作期名列前茅，中位数收入达到恐怖的 $105,000+。',
                      'Architecture & Engineering along with Computers, Statistics, & Math dominate prime-age earnings, crossing the threshold of $105,000+.'
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t(
                      '相比之下，教育学（Education）是唯二在黄金期未能突破六万元大关的细分方向。',
                      'Conversely, Education remains the only core subfield struggling to break the $60,000 boundary in prime-age work cycles.'
                    )}
                  </p>
                </div>
              )}

              {activeTab === 'growth' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-base">
                    {t('📈 选科意愿两极化', '📈 Dynamic Talent Shift')}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {t(
                      '市场正经历剧变！计算机、统计与数学的学位产出在 2009-2023 之间迎来了爆发式的 +159% 飙升，医疗健康（Health）也斩获了 +109% 的翻倍级增幅。',
                      'The student demand curve has changed. Computer and Mathematical sciences grew of +159% in degree outputs, with health services scaling a full +109% increase.'
                    )}
                  </p>
                  <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                    {t(
                      '⚠️ 人文与自由艺术 (-33%) 以及师范教育 (-14%) 出现严重萎缩，标志着实用技术方向对传统人文学科的剧烈挤占。',
                      '⚠️ Classic Humanities & Liberal Arts collapsed -33%, showing a massive migration from textual arts to technological pathways.'
                    )}
                  </p>
                </div>
              )}

              {activeTab === 'unemployment' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-base">
                    {t('💼 缓冲带与起跑线', '💼 Youth Grads Buffer Layer')}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {t(
                      '失业数据表明：刚毕业时（Recent Grads），纯艺术类（Arts）面临高达 8.9% 的失业压力。但步入黄金年龄（Prime-Age），该比率腰斩降至 4.7%。',
                      'The start lines vary. Young graduates of Fine Arts experience 8.9% initial unemployment. However, premium job cycles bring this down to a modest 4.7%.'
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-2 py-2 px-3 bg-white border border-slate-200 rounded-xl">
                    <span className="block h-2.5 w-2.5 bg-blue-500 rounded-full shrink-0"></span>
                    <span className="text-xs text-slate-600">
                      {t('蓝色圆点标记：黄金成熟期失业率', 'Blue Nodes: Prime-Age stable unemployment')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 mt-6">
              <div className="bg-white border border-slate-150 rounded-xl p-3 text-xs flex flex-col gap-1.5 text-slate-600">
                <span className="font-semibold text-slate-800">{t('📊 本次统计基准年龄定义：', '📊 Demographics Baseline:')}</span>
                <span>• {t('近期毕业生 (Recent Grads): 22–26岁', 'Recent College Grads: Ages 22–26')}</span>
                <span>• {t('黄金劳动年龄 (Prime-Age): 25–54岁', 'Prime-Age Workers: Ages 25–54')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
