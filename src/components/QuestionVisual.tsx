import React from 'react';
import type { QuestionIllustration } from '../types/game';

interface QuestionVisualProps {
  illustration: QuestionIllustration;
}

export const QuestionVisual: React.FC<QuestionVisualProps> = ({ illustration }) => {
  if (illustration.type === 'image_data') {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#061f2d] p-3 border border-[#61DDB5]/25">
        <img
          src={illustration.dataUrl}
          alt={illustration.caption || 'Hình minh họa câu hỏi'}
          referrerPolicy="no-referrer"
          className="max-h-48 w-auto rounded-lg object-contain"
        />
        {illustration.caption && (
          <p className="mt-2 text-xs text-[#FFF6DF]/80">{illustration.caption}</p>
        )}
      </div>
    );
  }

  if (illustration.type === 'counting') {
    const emojiMap: Record<string, string> = {
      apple: '🍎',
      star: '⭐',
      shell: '🐚',
      coin: '🪙',
      flower: '🌺',
    };
    const symbol = emojiMap[illustration.item] || '⭐';
    const renderItems = (count: number, crossed = false) =>
      Array.from({ length: Math.min(count, 20) }).map((_, i) => (
        <span
          key={i}
          className={`inline-flex items-center justify-center w-9 h-9 text-2xl rounded-lg bg-[#082B3D] border border-[#61DDB5]/30 ${
            crossed ? 'opacity-45 line-through' : ''
          }`}
        >
          {symbol}
        </span>
      ));

    return (
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl bg-[#061f2d] px-5 py-4 border border-[#61DDB5]/25">
        <div className="flex flex-wrap justify-center gap-1.5 max-w-[260px]">
          {renderItems(illustration.groupA)}
        </div>
        {illustration.groupB !== undefined && (
          <>
            <span className="font-display text-3xl font-bold text-[#FFD166]">
              {illustration.operator || '+'}
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-[260px]">
              {renderItems(illustration.groupB, illustration.operator === '-')}
            </div>
          </>
        )}
      </div>
    );
  }

  if (illustration.type === 'clock') {
    const hourAngle = ((illustration.hour % 12) + illustration.minute / 60) * 30;
    const minAngle = illustration.minute * 6;
    return (
      <div className="flex items-center justify-center rounded-xl bg-[#061f2d] p-4 border border-[#61DDB5]/25">
        <svg viewBox="0 0 140 140" className="w-36 h-36">
          <circle cx="70" cy="70" r="62" fill="#FFF6DF" stroke="#FFD166" strokeWidth="6" />
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, idx) => {
            const rad = ((idx * 30 - 90) * Math.PI) / 180;
            const x = 70 + Math.cos(rad) * 46;
            const y = 70 + Math.sin(rad) * 46 + 4;
            return (
              <text
                key={n}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#082B3D"
              >
                {n}
              </text>
            );
          })}
          {/* Hour hand */}
          <line
            x1="70"
            y1="70"
            x2={70 + Math.cos(((hourAngle - 90) * Math.PI) / 180) * 28}
            y2={70 + Math.sin(((hourAngle - 90) * Math.PI) / 180) * 28}
            stroke="#082B3D"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Minute hand */}
          <line
            x1="70"
            y1="70"
            x2={70 + Math.cos(((minAngle - 90) * Math.PI) / 180) * 42}
            y2={70 + Math.sin(((minAngle - 90) * Math.PI) / 180) * 42}
            stroke="#087E9A"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="70" cy="70" r="4.5" fill="#FF9F43" />
        </svg>
      </div>
    );
  }

  if (illustration.type === 'fraction') {
    const total = Math.max(2, illustration.denominator);
    const filled = Math.min(illustration.numerator, total);
    if (illustration.shape === 'bar') {
      return (
        <div className="flex items-center justify-center rounded-xl bg-[#061f2d] p-4 border border-[#61DDB5]/25">
          <div className="flex overflow-hidden rounded-lg border-2 border-[#FFD166]">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`w-11 h-12 border-r last:border-r-0 border-[#082B3D] ${
                  i < filled ? 'bg-[#61DDB5]' : 'bg-[#FFF6DF]/20'
                }`}
              />
            ))}
          </div>
        </div>
      );
    }

    const slices = Array.from({ length: total }).map((_, i) => {
      const startAngle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const endAngle = ((i + 1) / total) * Math.PI * 2 - Math.PI / 2;
      const x1 = 60 + Math.cos(startAngle) * 50;
      const y1 = 60 + Math.sin(startAngle) * 50;
      const x2 = 60 + Math.cos(endAngle) * 50;
      const y2 = 60 + Math.sin(endAngle) * 50;
      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
      const d = `M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
      return (
        <path
          key={i}
          d={d}
          fill={i < filled ? '#FFD166' : 'rgba(255,246,223,0.16)'}
          stroke="#082B3D"
          strokeWidth="2.5"
        />
      );
    });

    return (
      <div className="flex items-center justify-center rounded-xl bg-[#061f2d] p-4 border border-[#61DDB5]/25">
        <svg viewBox="0 0 120 120" className="w-32 h-32">
          {slices}
        </svg>
      </div>
    );
  }

  if (illustration.type === 'geometry') {
    return (
      <div className="flex items-center justify-center rounded-xl bg-[#061f2d] p-4 border border-[#61DDB5]/25">
        <svg viewBox="0 0 180 120" className="w-48 h-32">
          {illustration.shape === 'triangle' && (
            <polygon
              points="90,14 32,102 148,102"
              fill="#FF9F43"
              fillOpacity="0.85"
              stroke="#FFD166"
              strokeWidth="3"
            />
          )}
          {illustration.shape === 'square' && (
            <rect
              x="50"
              y="18"
              width="80"
              height="80"
              rx="4"
              fill="#61DDB5"
              fillOpacity="0.35"
              stroke="#61DDB5"
              strokeWidth="3"
            />
          )}
          {illustration.shape === 'rectangle' && (
            <rect
              x="22"
              y="28"
              width="136"
              height="64"
              rx="4"
              fill="#087E9A"
              fillOpacity="0.55"
              stroke="#FFD166"
              strokeWidth="3"
            />
          )}
          {illustration.shape === 'circle' && (
            <>
              <circle
                cx="90"
                cy="60"
                r="42"
                fill="#61DDB5"
                fillOpacity="0.28"
                stroke="#61DDB5"
                strokeWidth="3"
              />
              <line x1="90" y1="60" x2="132" y2="60" stroke="#FFD166" strokeWidth="2.5" />
              <circle cx="90" cy="60" r="3" fill="#FFD166" />
            </>
          )}
          {illustration.labels[0] && (
            <text
              x="90"
              y="116"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#FFD166"
            >
              {illustration.labels[0]}
            </text>
          )}
        </svg>
      </div>
    );
  }

  if (illustration.type === 'scale') {
    return (
      <div className="flex items-center justify-center rounded-xl bg-[#061f2d] px-5 py-4 border border-[#61DDB5]/25">
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="flex items-end justify-between w-full gap-3">
            <div className="flex-1 rounded-lg bg-[#082B3D] border border-[#FFD166]/60 px-3 py-2 text-center text-sm font-bold text-[#FFD166]">
              {illustration.leftText}
            </div>
            <div className="text-2xl font-bold text-[#61DDB5]">=</div>
            <div className="flex-1 rounded-lg bg-[#082B3D] border border-[#61DDB5]/60 px-3 py-2 text-center text-sm font-bold text-[#61DDB5]">
              {illustration.rightText}
            </div>
          </div>
          <div className="mt-2 h-1.5 w-3/4 rounded-full bg-[#FFD166]" />
          <div className="h-4 w-3 bg-[#FF9F43]" />
          <div className="h-2 w-16 rounded bg-[#FF9F43]" />
        </div>
      </div>
    );
  }

  return null;
};
