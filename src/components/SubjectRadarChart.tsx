import React from 'react';
import { SubjectDemands } from '../types';
import { getDemandLabel } from '../utils/demands';

import { toTraditional } from '../utils/chineseLocalization';

interface SubjectRadarChartProps {
  demands: SubjectDemands;
  language: 'zh' | 'zht' | 'en';
}

export default function SubjectRadarChart({ demands, language }: SubjectRadarChartProps) {
  const valueMap = { L: 1, M: 2, H: 3 };

  const t = (zh: string, en: string) => {
    if (language === 'zh') return zh;
    if (language === 'zht') return toTraditional(zh);
    return en;
  };
  
  const subjects = [
    { key: 'math', labelEn: 'Math', labelZh: t('数学', 'Math'), val: valueMap[demands.math] },
    { key: 'physics', labelEn: 'Physics', labelZh: t('物理', 'Physics'), val: valueMap[demands.physics] },
    { key: 'chemistry', labelEn: 'Chemistry', labelZh: t('化学', 'Chemistry'), val: valueMap[demands.chemistry] },
    { key: 'biology', labelEn: 'Biology', labelZh: t('生物', 'Biology'), val: valueMap[demands.biology] },
    { key: 'humanities', labelEn: 'Humanities', labelZh: t('人文', 'Humanities'), val: valueMap[demands.humanities] },
  ];

  const size = 220;
  const center = size / 2;
  const maxVal = 3;
  const rScale = (val: number) => (val / maxVal) * 80;

  const points = subjects.map((sub, i) => {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = center + rScale(sub.val) * Math.cos(angle);
    const y = center + rScale(sub.val) * Math.sin(angle);
    return { x, y, labelX: center + 98 * Math.cos(angle), labelY: center + 98 * Math.sin(angle), ...sub };
  });

  const pathData = points.map(p => `${p.x},${p.y}`).join(' ');

  const gridLevels = [1, 2, 3];
  const gridPolygons = gridLevels.map(level => {
    return subjects.map((_, i) => {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = center + rScale(level) * Math.cos(angle);
      const y = center + rScale(level) * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 backdrop-blur-md border border-slate-150 rounded-2xl shadow-inner relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-400/10 rounded-full blur-xl pointer-events-none" />
      
      <svg width={size} height={size} className="overflow-visible select-none drop-shadow-sm">
        {subjects.map((_, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x2 = center + rScale(3) * Math.cos(angle);
          const y2 = center + rScale(3) * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#e2e8f0"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          );
        })}

        {gridPolygons.map((polygon, i) => (
          <polygon
            key={i}
            points={polygon}
            fill="none"
            stroke={i === 2 ? '#cbd5e1' : '#e2e8f0'}
            strokeWidth={i === 2 ? '1.5' : '1'}
          />
        ))}

        <circle cx={center} cy={center} r={rScale(1)} fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
        <circle cx={center} cy={center} r={rScale(2)} fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
        <circle cx={center} cy={center} r={rScale(3)} fill="none" stroke="#f1f5f9" strokeWidth="0.5" />

        <polygon
          points={pathData}
          fill="url(#radarGradient)"
          fillOpacity="0.45"
          stroke="#4f46e5"
          strokeWidth="2.5"
          className="transition-all duration-300 hover:fill-opacity-60"
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill="#4f46e5"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="transition-all duration-200 hover:scale-135"
          />
        ))}

        {points.map((p, i) => {
          const isLeft = p.labelX < center - 10;
          const isRight = p.labelX > center + 10;
          const textAnchor = isLeft ? 'end' : isRight ? 'start' : 'middle';
          const dy = p.labelY < center - 40 ? '-2' : p.labelY > center + 40 ? '10' : '4';

          return (
            <g key={i} className="font-sans">
              <text
                x={p.labelX}
                y={p.labelY}
                dy={dy}
                textAnchor={textAnchor}
                className="fill-slate-700 font-extrabold text-[11px] tracking-tight"
              >
                {language !== 'en' ? p.labelZh : p.labelEn}
              </text>
              <text
                x={p.labelX}
                y={p.labelY + 12}
                dy={dy}
                textAnchor={textAnchor}
                className="fill-slate-400 font-extrabold text-[9px] font-mono uppercase"
              >
                {getDemandLabel(demands[p.key as keyof SubjectDemands], language)}
              </text>
            </g>
          );
        })}

        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.75" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
