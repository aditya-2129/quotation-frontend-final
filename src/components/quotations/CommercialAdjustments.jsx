import React from 'react';

const CommercialAdjustments = ({
  activePhase,
  setActivePhase,
  formData,
  setFormData,
  panelIndex = 8
}) => {
  const isExpanded = activePhase === 'commercial';

  const updateProject = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <section className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-zinc-300 shadow-xl ring-1 ring-zinc-200/50' : 'border-zinc-200 shadow-sm'}`}>
       <header 
         onClick={() => setActivePhase(isExpanded ? '' : 'commercial')}
         className={`px-6 py-5 border-b cursor-pointer flex justify-between items-center group transition-colors ${isExpanded ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
       >
          <div className="flex items-center gap-3">
             <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black border transition-all duration-300 ${isExpanded ? 'bg-zinc-950 border-zinc-950 text-white scale-110 shadow-lg shadow-zinc-950/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-700'}`}>Extra Costs & Shipping</h3>
          </div>
          <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-zinc-950' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
       </header>

       <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-8 space-y-12">
             
             {/* Project Wide Logistics */}
             <div className="mb-10 border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-in fade-in duration-700">
                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-100 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/20">
                         <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                      </div>
                      <div>
                          <h4 className="text-[13px] font-black text-zinc-950 uppercase tracking-tight">Packing & Delivery</h4>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.15em] italic font-mono leading-none">Overall Project Logistics</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                       <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-tighter">Shipping Stage</span>
                   </div>
                </div>
                
                <div className="p-8 grid grid-cols-2 gap-12 bg-white">
                   <div className="relative">
                      <div className="flex flex-col mb-4">
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1.5 leading-none italic">Phase 1: Packing</span>
                          <h4 className="text-[14px] font-black text-zinc-950 uppercase tracking-tight">Stuffing & Packing Cost</h4>
                      </div>
                      <div className="relative group">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 font-black">₹</span>
                         <input 
                           type="number" 
                           className="w-full h-12 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-mono font-black text-black text-[13px] shadow-sm"
                           placeholder="0.00"
                           value={formData.packaging_cost || ''}
                           onChange={(e) => updateProject({ packaging_cost: parseFloat(e.target.value) || 0 })}
                         />
                      </div>
                       <p className="mt-3 text-[8px] text-zinc-400 font-bold uppercase tracking-tight italic leading-relaxed">Cost for boxes, pallets, and packing materials for all items.</p>
                   </div>

                   <div className="relative">
                      <div className="flex flex-col mb-4">
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1.5 leading-none italic">Phase 2: Delivery</span>
                          <h4 className="text-[14px] font-black text-zinc-950 uppercase tracking-tight">Shipping Cost</h4>
                      </div>
                      <div className="relative group">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 font-black">₹</span>
                         <input 
                           type="number" 
                           className="w-full h-12 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-mono font-black text-black text-[13px] shadow-sm"
                           placeholder="0.00"
                           value={formData.transportation_cost || ''}
                           onChange={(e) => updateProject({ transportation_cost: parseFloat(e.target.value) || 0 })}
                         />
                      </div>
                       <p className="mt-3 text-[8px] text-zinc-400 font-bold uppercase tracking-tight italic leading-relaxed">Cost for truck, courier, or delivery to your location.</p>
                   </div>
                </div>
             </div>


             {/* Project Wide Engineering Fees */}
             <div className="mb-8 border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-100 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-lg shadow-zinc-950/20">
                         <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </div>
                      <div>
                          <h4 className="text-[13px] font-black text-zinc-950 uppercase tracking-tight">Design & Assembly Fees</h4>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.15em] italic font-mono leading-none">One-Time Setup Costs</span>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <span className="text-[9px] font-black text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded border border-zinc-200 uppercase tracking-tighter italic">Professional Services</span>
                   </div>
                </div>

                <div className="p-8 grid grid-cols-2 gap-10 bg-white">
                   <div className="relative">
                       <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-[0.18em] leading-none mb-3 italic">Design / Drawing Fee (one-time) (₹)</label>
                      <div className="relative group">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 font-bold">₹</span>
                         <input 
                           type="number" 
                           className="w-full h-12 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-mono font-black text-black text-[13px] shadow-sm"
                           placeholder="0.00"
                           value={formData.design_cost || ''}
                           onChange={(e) => updateProject({ design_cost: parseFloat(e.target.value) || 0 })}
                         />
                      </div>
                       <p className="mt-3 text-[8px] text-zinc-400 font-bold uppercase tracking-tight italic leading-relaxed">Cost for making 3D models, technical drawings, and planning.</p>
                   </div>
                   <div className="relative">
                       <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-[0.18em] leading-none mb-3 italic">Final Assembly & Testing Fee (₹)</label>
                      <div className="relative group">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 font-bold">₹</span>
                         <input 
                           type="number" 
                           className="w-full h-12 pl-10 pr-4 rounded-xl bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-mono font-black text-black text-[13px] shadow-sm"
                           placeholder="0.00"
                           value={formData.assembly_cost || ''}
                           onChange={(e) => updateProject({ assembly_cost: parseFloat(e.target.value) || 0 })}
                         />
                      </div>
                       <p className="mt-3 text-[8px] text-zinc-400 font-bold uppercase tracking-tight italic leading-relaxed">Cost for putting all parts together and checking they work.</p>
                   </div>
                </div>
             </div>

          </div>
       </div>
    </section>
  );
};

export default CommercialAdjustments;
