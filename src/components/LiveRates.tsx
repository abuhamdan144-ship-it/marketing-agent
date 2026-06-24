import React from 'react';
import { CORRIDORS } from '../utils/exportUtils';
import { ExchangeRates } from '../types';

interface LiveRatesProps {
  rates: ExchangeRates;
  rateSource: string;
  isFetching: boolean;
  onRefresh: () => void;
}

export default function LiveRates({ rates, rateSource, isFetching, onRefresh }: LiveRatesProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          🌐 Live Exchange Rates
          <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-100">
            OMR to Corridors
          </span>
        </h3>
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className={`p-2 bg-slate-50 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-all active:scale-95 border border-slate-100 cursor-pointer flex items-center justify-center ${
            isFetching ? 'animate-spin opacity-50' : ''
          }`}
          title="Refresh Exchange Rates"
        >
          🔄
        </button>
      </div>

      <div className="flex items-center gap-2.5 px-3 py-2 bg-emerald-50/50 rounded-xl border border-emerald-100 mb-4 text-xs font-medium text-emerald-800">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        <span className="font-semibold text-emerald-700">Rates Feed:</span>
        <span className="font-mono text-[11px] flex-1 text-slate-600">{rateSource}</span>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 gap-3">
        {CORRIDORS.map((c) => {
          const val = rates[c.id];
          const displayVal = val && typeof val === 'number' ? val.toFixed(2) : '--';
          return (
            <div
              key={c.id}
              className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-indigo-50/30 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all duration-200 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {c.flag}
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {c.code}
              </span>
              <span className="text-base font-extrabold text-indigo-900 mt-0.5 font-mono">
                {displayVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
