import React from 'react';
import { motion } from 'motion/react';
import { CORRIDORS } from '../utils/exportUtils';
import { ExchangeRates } from '../types';
import { ExternalLink, Globe, MessageCircle, RefreshCw } from 'lucide-react';

interface LiveRatesProps {
  rates: ExchangeRates;
  rateSource: string;
  isFetching: boolean;
  onRefresh: () => void;
  onShareComparison: () => void;
  isOnline?: boolean;
}

const formatRate = (value: number | null | undefined, decimals = 2) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(decimals) : '--';

const formatDate = (value?: string | null) => value
  ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  : 'Timestamp unavailable';

export default function LiveRates({ rates, rateSource, isFetching, onRefresh, onShareComparison, isOnline = true }: LiveRatesProps) {
  const competitor = rates.competitor;
  const westernUnion = rates.westernUnion;
  const bdtPk = competitor?.rates?.BDT?.tt;
  const bdtWu = westernUnion?.rates?.BDT?.tt;
  const bdtDifference = typeof bdtPk === 'number' && typeof bdtWu === 'number' ? bdtWu - bdtPk : null;
  const betterRate = bdtDifference === null ? 'Waiting for both quotes' : bdtDifference > 0 ? 'Western Union reference' : bdtDifference < 0 ? 'PK Exchange' : 'Same rate';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0F1B33] text-white rounded-lg p-5 border border-white/10 shadow-ops-panel select-none"
    >
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#C9A227]" />
          <span className="ops-eyebrow text-[#C9A227]">FX CORRIDOR BENCHMARKS</span>
          <span className="bg-[#1C2A4A] text-[#8891A3] font-mono text-[9px] px-2 py-0.5 rounded border border-white/5 font-bold">1 OMR =</span>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onRefresh} disabled={isFetching} className={`p-1.5 bg-[#1C2A4A] hover:bg-white/10 rounded text-[#C9A227] transition-colors border border-white/10 cursor-pointer flex items-center justify-center ${isFetching ? 'animate-spin opacity-50' : ''}`} title="Refresh exchange rates" aria-label="Refresh exchange rates">
          <RefreshCw className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1C2A4A]/60 rounded border border-white/5 mb-3 font-mono text-[10px]">
        <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#4ADE94] animate-pulse' : 'bg-[#C9A227]'}`} /><span className="text-[#8891A3] font-bold">LIVE FEEDS:</span><span className="text-slate-200">{rateSource}</span></div>
        <span className="text-[#8891A3] text-[9px]">AUTO REFRESH · 10 MIN</span>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 gap-2.5">
        {CORRIDORS.map((c) => {
          const val = rates[c.id];
          const sourceUpdatedAt = rates[`${c.id}UpdatedAt`];
          const formattedSourceUpdatedAt = formatDate(sourceUpdatedAt ? String(sourceUpdatedAt) : null);
          return <motion.div key={c.id} whileHover={{ y: -2 }} title={`Al Jadeed last updated: ${formattedSourceUpdatedAt}`} className="flex flex-col items-center justify-center p-3 bg-[#1C2A4A] hover:bg-[#1C2A4A]/80 rounded border border-white/5 hover:border-[#C9A227]/30 transition-all text-center"><span className="text-xl">{c.flag}</span><span className="ops-eyebrow text-[#8891A3] text-[9px] mt-1">{c.code}</span><span className="text-base font-mono font-extrabold text-[#C9A227] mt-0.5">{formatRate(typeof val === 'number' ? val : null)}</span><span className="mt-1 text-[8px] leading-tight text-[#8891A3] font-mono">Al Jadeed update<span className="block text-[#B7BFCE]">{formattedSourceUpdatedAt}</span></span></motion.div>;
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3"><div><span className="ops-eyebrow text-[#C9A227]">COMPETITOR BENCHMARK</span><h3 className="text-sm font-bold text-white mt-1">PK Exchange Oman · Remittance &amp; Forex</h3></div>{competitor?.sourceUrl && <a href={competitor.sourceUrl} target="_blank" rel="noreferrer" className="text-[#B7BFCE] hover:text-white" title="Open PK Exchange rates source"><ExternalLink className="w-4 h-4" /></a>}</div>
        <div className="overflow-x-auto rounded border border-white/10"><table className="w-full min-w-[620px] text-[10px] font-mono"><thead className="bg-[#253353] text-[#B7BFCE] uppercase tracking-wider"><tr><th className="text-left px-3 py-2">Currency</th><th className="text-right px-3 py-2">TT</th><th className="text-right px-3 py-2">Cash Pay</th><th className="text-right px-3 py-2">Buy</th><th className="text-right px-3 py-2">Sell</th></tr></thead><tbody>{CORRIDORS.map((c) => { const row = competitor?.rates?.[c.code]; return <tr key={c.code} className="border-t border-white/5"><td className="px-3 py-2 text-slate-200">{c.flag} {c.code}</td><td className="text-right px-3 py-2 text-[#C9A227]">{formatRate(row?.tt)}</td><td className="text-right px-3 py-2">{formatRate(row?.cashPay)}</td><td className="text-right px-3 py-2">{formatRate(row?.buy)}</td><td className="text-right px-3 py-2">{formatRate(row?.sell)}</td></tr>; })}</tbody></table></div>
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-[9px] text-[#8891A3] font-mono"><span>Source date: {competitor?.publishedDate || 'Not available'}</span><span>Fetched: {formatDate(competitor?.fetchedAt)}</span></div>
      </div>

      <div className="mt-4 rounded border border-dashed border-[#C9A227]/30 bg-[#C9A227]/5 px-3 py-3">
        <div className="flex items-center justify-between gap-3"><div><span className="ops-eyebrow text-[#C9A227]">WESTERN UNION / PK REMIT</span><p className="text-[11px] text-slate-200 mt-1">{westernUnion?.status === 'reference' ? 'Reference quote from your PK Remit screenshot' : westernUnion?.status === 'available' ? 'Live rate available' : 'Separate rate not published'}</p></div>{westernUnion?.sourceUrl && <a href={westernUnion.sourceUrl} target="_blank" rel="noreferrer" className="text-[#B7BFCE] hover:text-white" title="Open PK Remit source"><ExternalLink className="w-4 h-4" /></a>}</div>
        <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded bg-[#1C2A4A] px-3 py-2"><span className="text-[9px] text-[#8891A3] uppercase">BDT rate</span><strong className="block text-[#C9A227] font-mono text-sm">{formatRate(bdtWu, 7)}</strong></div><div className="rounded bg-[#1C2A4A] px-3 py-2"><span className="text-[9px] text-[#8891A3] uppercase">Fee + VAT</span><strong className="block text-white font-mono text-sm">{westernUnion?.fee !== undefined ? `${westernUnion.fee} + ${westernUnion.vat ?? 0}` : '--'} OMR</strong></div></div>
        <p className="text-[9px] leading-relaxed text-[#8891A3] mt-2">{westernUnion?.note || 'Western Union pricing varies by sending country, destination, amount, fee, and channel.'}</p>
      </div>

      <div className="mt-4 rounded border border-[#55e6b0]/30 bg-[#55e6b0]/5 px-3 py-3">
        <div className="flex items-center justify-between gap-3"><div><span className="ops-eyebrow text-[#55e6b0]">RATE COMPARISON · BDT</span><p className="text-[11px] text-slate-200 mt-1">Better rate: <strong className="text-[#55e6b0]">{betterRate}</strong></p></div><button onClick={onShareComparison} className="inline-flex items-center gap-1.5 rounded bg-[#25D366] hover:bg-[#1ebe5d] text-white px-3 py-2 text-[10px] font-bold transition-colors cursor-pointer"><MessageCircle className="w-3.5 h-3.5" /> Share on WhatsApp</button></div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono"><div><span className="block text-[9px] text-[#8891A3]">PK Exchange</span><strong className="text-sm text-white">{formatRate(bdtPk, 7)}</strong></div><div><span className="block text-[9px] text-[#8891A3]">Western Union</span><strong className="text-sm text-white">{formatRate(bdtWu, 7)}</strong></div><div><span className="block text-[9px] text-[#8891A3]">Difference</span><strong className={`text-sm ${bdtDifference && bdtDifference > 0 ? 'text-[#55e6b0]' : 'text-white'}`}>{bdtDifference === null ? '--' : `+${formatRate(bdtDifference, 7)}`}</strong></div></div>
        <p className="text-[9px] text-[#8891A3] mt-2">Comparison is for 1 OMR to BDT. Western Union value is the manual reference quote shown in your screenshot, not an automatic API feed.</p>
      </div>
    </motion.div>
  );
}
