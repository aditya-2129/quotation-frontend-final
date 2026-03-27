"use client";

import React from 'react';

const ValuationLedger = ({ totals, activeQuote, setActiveQuote, formData, setFormData, activePhase }) => {
  const isHighlight = (label) => {
    // Mapping phases to ledger item labels
    const PHASE_NAMES = {
       'scope': 'Project Information',
       'bom': 'Parts List',
       'material': 'Material',
       'machining': 'Manufacturing',
       'bop': 'Purchased Items',
       'commercial': ['Design & Assembly', 'Packing & Shipping']
    };
    
    const target = PHASE_NAMES[activePhase];
    if (!target) return false;
    if (Array.isArray(target)) return target.includes(label);
    return target === label;
  };

  const LineItem = ({ label, value, colorClass = "text-zinc-500", highlightColor = "text-brand-primary" }) => {
    const active = isHighlight(label);
    return (
       <div className={`flex justify-between items-center text-[13px] transition-all duration-300 ${active ? `${highlightColor} scale-[1.02] translate-x-1` : colorClass}`}>
          <span className={`transition-colors font-bold ${active ? highlightColor : 'text-zinc-500'}`}>{label}</span>
          <span className={`font-mono transition-all ${active ? `font-black border-b border-brand-primary` : 'text-zinc-300'}`}>
             ₹{value.toFixed(2)}
          </span>
       </div>
    );
  };

  return (
    <div className="sticky top-24 space-y-3">
       <section className="bg-zinc-950 rounded-xl p-3.5 text-white shadow-2xl shadow-zinc-200 relative overflow-hidden border border-zinc-900">
          <div className="absolute -top-4 -right-4 opacity-5 grayscale brightness-150 pointer-events-none rotate-12">
             <img src="/KE_Logo.png" alt="" className="h-40 w-40 object-contain" />
          </div>
          
          <h3 className="relative z-10 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
             <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(94,192,194,0.8)]" />
             Price Breakdown
          </h3>
          
          <div className="space-y-2.5 relative z-10">
             <LineItem label="Material" value={totals.materialCost} />
             <LineItem label="Manufacturing" value={totals.laborCost + (totals.treatmentCost || 0)} />
             <LineItem label="Purchased Items" value={totals.bopCost} />
             <LineItem label="Design & Assembly" value={totals.engineeringCost} />
             <LineItem label="Packing & Shipping" value={totals.commercialCost} />
             
             <div className="h-px bg-zinc-800 my-3" />
             
             <div className="flex justify-between items-center group/subtotal">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/subtotal:text-zinc-300 transition-colors block mb-0.5">Manufacturing Cost</span>
                <span className="text-lg font-mono font-black tracking-tighter italic">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
             </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900 relative z-10">
             <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Profit Margin %</label>
                   <span className="text-[8px] text-zinc-600 font-bold uppercase mt-1 italic">Industrial Markup</span>
                </div>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-16 h-8.5 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-[13px] font-black focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none text-white shadow-inner"
                  value={formData.markup ?? 0}
                  onChange={(e) => setFormData(prev => ({...prev, markup: parseFloat(e.target.value) || 0}))}
                />
             </div>
             <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10.5px] font-black text-brand-primary uppercase tracking-[0.2em] leading-none">Final Total Price</span>
                   <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">After Markup</span>
                </div>
                <div className="flex items-baseline gap-1">
                   <span className="text-2xl font-mono font-black tracking-tighter text-white leading-none">₹{totals.finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-1 w-full bg-brand-primary/10 rounded-full mt-4 overflow-hidden border border-zinc-900/50">
                   <div className="h-full bg-brand-primary shadow-[0_0_10px_rgba(94,192,194,0.5)] transition-all duration-500 ease-out" style={{ width: `${Math.min(formData.markup, 100)}%` }} />
                </div>
             </div>
          </div>
       </section>

    </div>
  );
};

export default ValuationLedger;
