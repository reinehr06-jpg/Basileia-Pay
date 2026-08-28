'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

const MOCK_HOURLY_SCORE = [
  { hour: '00:00', score: 22, tx: 120, blocks: 2 },
  { hour: '02:00', score: 25, tx: 90, blocks: 1 },
  { hour: '04:00', score: 18, tx: 70, blocks: 0 },
  { hour: '06:00', score: 30, tx: 110, blocks: 4 },
  { hour: '08:00', score: 24, tx: 250, blocks: 2 },
  { hour: '10:00', score: 38, tx: 450, blocks: 8 },
  { hour: '12:00', score: 28, tx: 510, blocks: 5 },
  { hour: '14:00', score: 45, tx: 380, blocks: 12 },
  { hour: '16:00', score: 32, tx: 420, blocks: 6 },
  { hour: '18:00', score: 21, tx: 490, blocks: 3 },
  { hour: '20:00', score: 26, tx: 530, blocks: 4 },
  { hour: '22:00', score: 23, tx: 310, blocks: 1 },
];

export function TrustScoreChart() {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');

  return (
    <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50 space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Score Médio de Risco
          </h4>
          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
            Evolução do índice antifraude e decisões automatizadas.
          </span>
        </div>

        <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-xl">
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                range === r ? 'bg-white text-brand shadow-sm' : 'text-slate-500 hover:bg-white/40'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-60 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_HOURLY_SCORE} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7B16D9" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#7B16D9" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5EF/50" />
            <XAxis dataKey="hour" stroke="#94A3B8" fontSize={9} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={9} tickLine={false} />
            
            {/* Background color bands */}
            <ReferenceArea y1={0} y2={40} fill="#10B981" fillOpacity={0.03} />
            <ReferenceArea y1={40} y2={70} fill="#F59E0B" fillOpacity={0.03} />
            <ReferenceArea y1={70} y2={100} fill="#EF4444" fillOpacity={0.03} />

            {/* Block threshold line */}
            <ReferenceLine y={80} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: 'BLOQUEIO AUTOMÁTICO (80)', fill: '#EF4444', fontSize: 8, fontWeight: 'bold', position: 'top' }} />
            <ReferenceLine y={60} stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" label={{ value: 'REVISÃO MANUAL (60)', fill: '#F59E0B', fontSize: 8, fontWeight: 'bold', position: 'top' }} />

            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-2xl text-[10.5px] font-bold space-y-1.5 text-left">
                      <span className="text-slate-400 block font-medium">Horário: {data.hour}</span>
                      <div className="flex items-center justify-between gap-4">
                        <span>Score Médio:</span>
                        <span className="font-black text-brand-soft">{data.score}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Transações:</span>
                        <span>{data.tx}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Bloqueios:</span>
                        <span className="text-red-400">{data.blocks}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="score" stroke="#7B16D9" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
