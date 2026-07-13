/**
 * ROICharts Component
 * 
 * Renders high-fidelity interactive ROI analytics charts using Recharts.
 * visualizes Recent Grads vs. Prime-Age peak earnings growth curves and integrates
 * interactive regional Cost-of-Living (COL) multipliers for real-world purchasing power adjustments.
 */

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { motion } from 'motion/react';
import { DollarSign, Landmark, TrendingUp, Info, RefreshCw } from 'lucide-react';

import { toTraditional } from '../utils/chineseLocalization';
import FrostedGlass from './FrostedGlass';

interface ROIChartsProps {
  language: 'zh' | 'zht' | 'en';
  isEntitled?: boolean;
  onUpgrade?: () => void;
}

interface CareerCurvePoint {
  year: string;
  yearZh: string;
  stem: number;
  business: number;
  healthcare: number;
  humanities: number;
  average: number;
}

export default function ROICharts({ language, isEntitled = true, onUpgrade }: ROIChartsProps) {
  const [selectedColRegion, setSelectedColRegion] = useState<'national' | 'high' | 'med' | 'low'>('national');
  const [activeField, setActiveField] = useState<'all' | 'stem' | 'business' | 'healthcare' | 'humanities'>('all');

  const t = (zh: string, en: string) => {
    if (language === 'zh') return zh;
    if (language === 'zht') return toTraditional(zh);
    return en;
  };

  // COL multipliers representing real disposable income/purchasing power adjustments
  // NYC/SF has higher nominal salaries but massive taxes & housing (multiplier < 1.0 for purchasing power)
  // Low COL areas increase the relative value/purchasing power of the dollar (multiplier > 1.0)
  const colMultipliers = {
    national: { nameZh: t('全美平均', 'National Average'), value: 1.0, icon: '🇺🇸' },
    high: { nameZh: t('超一线城市 (NYC/SF)', 'Metro High COL (NYC/SF)'), value: 0.78, icon: '🗽' },
    med: { nameZh: t('二线中高成本 (Seattle/Austin)', 'Medium COL (Austin/Seattle)'), value: 0.95, icon: '🌵' },
    low: { nameZh: t('低生活成本 (Houston/Indiana)', 'Low COL (Houston/Indiana)'), value: 1.18, icon: '🏡' }
  };

  // Base raw annual earnings curve data across various career phases (in USD)
  const baseCareerData: CareerCurvePoint[] = [
    { year: 'Yr 0 (Grad)', yearZh: '毕业起步', stem: 72000, business: 54000, healthcare: 62050, humanities: 38000, average: 56500 },
    { year: 'Yr 2 (Junior)', yearZh: '入行2年', stem: 88000, business: 65000, healthcare: 71000, humanities: 45000, average: 67250 },
    { year: 'Yr 5 (Mid-Level)', yearZh: '入行5年', stem: 110000, business: 82000, healthcare: 85000, humanities: 55000, average: 83000 },
    { year: 'Yr 10 (Peak Mid)', yearZh: '中段黄金期', stem: 135000, business: 105000, healthcare: 102000, humanities: 65000, average: 101750 },
    { year: 'Yr 15 (Senior)', yearZh: '资深资历期', stem: 148000, business: 122000, healthcare: 115000, humanities: 74000, average: 114750 },
    { year: 'Yr 20+ (Prime-Age)', yearZh: '黄金巅峰期', stem: 160000, business: 138000, healthcare: 125000, humanities: 81000, average: 126000 }
  ];

  // Dynamically compute adjusted earnings based on COL multiplier selection
  const adjustedData = useMemo(() => {
    const multiplier = colMultipliers[selectedColRegion].value;
    return baseCareerData.map(pt => ({
      ...pt,
      yearZh: language === 'zht' ? toTraditional(pt.yearZh) : pt.yearZh,
      stem: Math.round(pt.stem * multiplier),
      business: Math.round(pt.business * multiplier),
      healthcare: Math.round(pt.healthcare * multiplier),
      humanities: Math.round(pt.humanities * multiplier),
      average: Math.round(pt.average * multiplier)
    }));
  }, [selectedColRegion, language]);

  const currentMultiplier = colMultipliers[selectedColRegion].value;

  // Custom tooltips to present gorgeous, rich summaries of earnings at hovered data nodes
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-750 p-4 rounded-xl shadow-xl text-xs text-white space-y-2 select-none z-50">
          <p className="font-extrabold text-[11px] tracking-wider text-blue-400 uppercase border-b border-slate-700/50 pb-1.5 mb-1.5">
            {language !== 'en' ? payload[0].payload.yearZh : label}
          </p>
          
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              const val = entry.value;
              return (
                <div key={index} className="flex justify-between items-center gap-6">
                  <span className="flex items-center gap-1.5 text-slate-350">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}:
                  </span>
                  <span className="font-mono font-bold text-white">
                    ${val.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-450 border-t border-slate-700/50 pt-1.5 mt-1.5 italic text-slate-400">
            {t(`已应用地区购买力系数: ${currentMultiplier}x`, `Purchasing Power Coeff Applied: ${currentMultiplier}x`)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <FrostedGlass isEntitled={isEntitled} blurAmount="heavy" upgradeMessage="Upgrade to view full 40-year ROI projections" onUpgrade={onUpgrade}>
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden" id="roi-charts-panel">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none" />

      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-6">
        <div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            {t('毕业生黄金年龄段回报率与收入增长曲线', 'ROI Prime-Age Earnings & Growth Velocity Curves')}
          </h3>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            {t('对比入行起步（近期毕业生）到黄金成熟期（25-54岁）的购买力攀升，支持地区生活成本 (COL) 动态乘数折算。', 'Contrast immediate grad yields against peak mid-career prime-age curves with local cost adjustment toggles.')}
          </p>
        </div>

        {/* Dynamic overall comparison pill */}
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <div className="text-[11px] font-bold text-emerald-800">
            {t('最高增幅: STEM 科系 +122%', 'Highest Growth: STEM Fields +122%')}
          </div>
        </div>
      </div>

      {/* 2. Interactive Control Toggles Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Field Filters */}
        <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveField('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeField === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {t('展示全部', 'Show All')}
          </button>
          
          <button
            onClick={() => setActiveField('stem')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeField === 'stem' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            STEM
          </button>

          <button
            onClick={() => setActiveField('business')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeField === 'business' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {t('商科', 'Business')}
          </button>

          <button
            onClick={() => setActiveField('healthcare')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeField === 'healthcare' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {t('健康医疗', 'Healthcare')}
          </button>

          <button
            onClick={() => setActiveField('humanities')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeField === 'humanities' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {t('人文艺术', 'Humanities')}
          </button>
        </div>

        {/* COL Multipliers Toggles */}
        <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-200 justify-start md:justify-end">
          {Object.entries(colMultipliers).map(([key, region]) => {
            const isActive = selectedColRegion === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedColRegion(key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-white border-slate-300 shadow-sm text-slate-800 ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-850 hover:bg-white/30 border-transparent'
                }`}
              >
                <span>{region.icon}</span>
                <span>{region.nameZh}</span>
                <span className="text-[10px] text-slate-400">({region.value}x)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Recharts Area Chart Core */}
      <div className="w-full h-88 min-h-[350px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={adjustedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorStem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBusiness" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorHealthcare" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorHumanities" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            
            <XAxis
              dataKey={language !== 'en' ? 'yearZh' : 'year'}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-5}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: '10px' }}
            />

            {/* Overall averages reference line */}
            <ReferenceLine y={Math.round(100000 * currentMultiplier)} stroke="#64748b" strokeDasharray="3 3" />

            {/* Dynamic Rendering of Area Curves depending on Selected Filters */}
            {(activeField === 'all' || activeField === 'stem') && (
              <Area
                type="monotone"
                dataKey="stem"
                name={t('STEM 理工科', 'STEM Fields')}
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorStem)"
              />
            )}

            {(activeField === 'all' || activeField === 'business') && (
              <Area
                type="monotone"
                dataKey="business"
                name={t('商科及管理', 'Business & Management')}
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorBusiness)"
              />
            )}

            {(activeField === 'all' || activeField === 'healthcare') && (
              <Area
                type="monotone"
                dataKey="healthcare"
                name={t('健康医疗科学', 'Healthcare & Medicine')}
                stroke="#e11d48"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorHealthcare)"
              />
            )}

            {(activeField === 'all' || activeField === 'humanities') && (
              <Area
                type="monotone"
                dataKey="humanities"
                name={t('人文、社会及自由艺术', 'Humanities & Social Sci')}
                stroke="#d97706"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorHumanities)"
              />
            )}

            {activeField === 'all' && (
              <Area
                type="monotone"
                dataKey="average"
                name={t('全门类本科综合均值', 'Overall Averages')}
                stroke="#0d9488"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorAverage)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Interactive COL Explanatory note */}
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-500">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-800 block">
            {t('地区生活成本 (COL) 动态折算原理', 'Understanding purchasing power multiplier adjustments')}
          </strong>
          <p className="leading-relaxed">
            {t(
              '为了客观衡量实际购买力，本系统加入了地区成本折算。例如，超一线城市（纽约/旧金山）的名义年薪虽高，但由于极高税率、房租及日常开支，其实际购买力系数打折扣（0.78x）；而低生活成本区（休斯敦/印第安纳）则具有高消费乘数（1.18x），使同等工资拥有更强的可支配消费能级。',
              'While nominal salaries are high in cities like NYC or San Francisco, severe housing costs and state taxes reduce actual purchasing power (0.78x). Converses are true in low-cost states where dollar stretches further (1.18x multiplier), resulting in higher net disposable income.'
            )}
          </p>
        </div>
      </div>
    </div>
    </FrostedGlass>
  );
}
