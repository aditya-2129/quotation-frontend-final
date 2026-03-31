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
       'commercial': ['Design & Engineering', 'Logistics & Service']
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
             
             <div className="h-px bg-zinc-800 my-3" />
             
             <div className="flex justify-between items-center group/subtotal">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/subtotal:text-zinc-300 transition-colors block mb-0.5">Unit Manufacturing Cost</span>
                   <span className="text-[8px] text-zinc-600 font-bold uppercase italic">Direct Factory Cost / Unit</span>
                </div>
                <span className="text-lg font-mono font-black tracking-tighter italic">₹{(totals.unitSubtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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

             {/* Unit Final Price */}
             <div className="flex flex-col mb-6 p-3 bg-zinc-900/50 rounded-xl border border-zinc-900 shadow-inner">
                <div className="flex items-center justify-between mb-1.5">
                   <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none">Final Unit Rate</span>
                   <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest italic">Per Item</span>
                </div>
                <div className="flex items-baseline gap-1">
                   <span className="text-xl font-mono font-black tracking-tighter text-brand-primary leading-none">₹{(totals.unitFinal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
             </div>

               {/* Multiplier / Volume Bridge */}
               <div className="flex items-center justify-center my-6 relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                     <div className="w-full border-t border-zinc-900 border-dashed" />
                  </div>
                  <div className="relative flex items-center gap-2 px-4 bg-zinc-950">
                     <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full shadow-2xl ring-1 ring-zinc-800/50 group/qty">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-1">Quantity</span>
                        <div className="h-4 w-4 rounded-md bg-zinc-950 flex items-center justify-center">
                           <svg className="h-2.5 w-2.5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                        <span className="text-[13px] font-mono font-black text-white px-2 leading-none">{formData.quantity || 1}</span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Units</span>
                     </div>
                  </div>
               </div>

               {/* Project Wide Extras */}
               <div className="mb-6 space-y-2 p-3 bg-zinc-900/40 rounded-xl border border-zinc-900/50">
                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                     <span className="h-1 w-1 bg-zinc-600 rounded-full" />
                     Project Add-ons (Consolidated)
                  </div>
                  <LineItem label="Design & Engineering" value={totals.engineeringCost} />
                  <LineItem label="Logistics & Service" value={totals.commercialCost} />
               </div>

              {/* Grand Total */}
              <div className="flex flex-col relative group/total pb-2">
                 <div className="absolute -inset-4 bg-brand-primary/5 blur-3xl rounded-full opacity-0 group-hover/total:opacity-100 transition-opacity" />
                 
                 <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] leading-none">Grand Total Price</span>
                       <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1.5 italic">Consolidated Order Value</span>
                    </div>

                 </div>
                 <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-4xl font-mono font-black tracking-tighter text-white leading-none drop-shadow-2xl">₹{(totals.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                 </div>
                
                <div className="h-1.5 w-full bg-zinc-900 rounded-full mt-5 overflow-hidden border border-zinc-800 p-0.5 shadow-inner">
                   <div className="h-full bg-brand-primary shadow-[0_0_15px_rgba(94,192,194,0.6)] transition-all duration-700 ease-out rounded-full" style={{ width: `${Math.min((formData.markup / 30) * 100, 100)}%` }} />
                </div>
             </div>
          </div>
       </section>

    </div>
  );
};

export default ValuationLedger;
