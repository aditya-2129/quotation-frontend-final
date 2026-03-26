"use client";

import React from 'react';

const ValuationLedger = ({ totals, activeQuote, setActiveQuote, formData, setFormData, activePhase }) => {
  const isHighlight = (label) => {
    // Mapping phases to ledger item labels
    const activeMapping = {
       'material': 'Material Component',
       'machining': 'Operational Labor',
       'tooling': 'Tooling & Jigs',
       'technical': ['Special Treatments', 'Quality & Certification'],
       'bop': 'Brought Out Items',
       'commercial': ['Engineering & Design', 'Logistics & Commercial']
    };
    
    const target = activeMapping[activePhase];
    if (!target) return false;
    if (Array.isArray(target)) return target.includes(label);
    return target === label;
  };

  const LineItem = ({ label, value, colorClass = "text-zinc-500", highlightColor = "text-blue-400" }) => {
    const active = isHighlight(label);
    return (
       <div className={`flex justify-between items-center text-[13px] transition-all duration-300 ${active ? `${highlightColor} scale-[1.02] translate-x-1` : colorClass}`}>
          <span className={`transition-colors font-bold ${active ? highlightColor : 'text-zinc-500'}`}>{label}</span>
          <span className={`font-mono transition-all ${active ? `font-black border-b border-blue-500/30` : 'text-zinc-300'}`}>
             ₹{value.toFixed(2)}
          </span>
       </div>
    );
  };

  return (
    <div className="sticky top-24 space-y-6">
       <section className="bg-zinc-950 rounded-2xl p-6 text-white shadow-2xl shadow-zinc-200 relative overflow-hidden border border-zinc-900">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <svg className="h-24 w-24 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
          </div>
          
          <h3 className="relative z-10 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Live Valuation Ledger
          </h3>
          
          <div className="space-y-4 relative z-10">
             <LineItem label="Material Component" value={totals.materialCost} />
             <LineItem label="Operational Labor" value={totals.laborCost} />
             <LineItem label="Tooling & Jigs" value={totals.toolingCost} />
             <LineItem label="Special Treatments" value={totals.treatmentCost} />
             <LineItem label="Quality & Certification" value={totals.qualityCost} />
             <LineItem label="Brought Out Items" value={totals.bopCost} />
             <LineItem label="Engineering & Design" value={totals.engineeringCost} />
             <LineItem label="Logistics & Commercial" value={totals.commercialCost} />
             
             <div className="h-px bg-zinc-800 my-4" />
             
             <div className="flex justify-between items-center group/subtotal">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/subtotal:text-zinc-300 transition-colors">Production Subtotal</span>
                <span className="text-xl font-mono font-black tracking-tighter italic">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
             </div>
          </div>

          <div className="mt-10 pt-8 border-t border-zinc-900 relative z-10">
             <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Net Margin %</label>
                   <span className="text-[8px] text-zinc-600 font-bold uppercase mt-1">Industrial Markup</span>
                </div>
                <input 
                  type="number" 
                  className="w-16 h-10 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-[13px] font-black focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-white shadow-inner"
                  value={formData.markup ?? 0}
                  onChange={(e) => setFormData(prev => ({...prev, markup: parseFloat(e.target.value) || 0}))}
                />
             </div>
             <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none">Project Valuation</span>
                   <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Post-Markup</span>
                </div>
                <div className="flex items-baseline gap-1">
                   <span className="text-3xl font-mono font-black tracking-tighter text-white leading-none">₹{totals.finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-1 w-full bg-emerald-500/10 rounded-full mt-5 overflow-hidden border border-zinc-900/50">
                   <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500 ease-out" style={{ width: `${Math.min(formData.markup, 100)}%` }} />
                </div>
             </div>
          </div>
       </section>
    </div>
  );
};

export default ValuationLedger;
