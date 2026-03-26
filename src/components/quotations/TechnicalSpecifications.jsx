import React from 'react';

const PartTechnicalBlock = ({ item, idx, onUpdate }) => {
  const updateHT = (updates) => {
    onUpdate({ heat_treatment: { ...item.heat_treatment, ...updates } });
  };

  const updateST = (updates) => {
    onUpdate({ surface_treatment: { ...item.surface_treatment, ...updates } });
  };

  const updateInspection = (updates) => {
    onUpdate({ inspection: { ...item.inspection, ...updates } });
  };

  return (
    <div className="mb-4 last:mb-0 border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Block Header */}
      <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-100 flex justify-between items-center group/header">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center text-[11px] font-black italic shadow-lg shadow-zinc-950/20 group-hover/header:scale-105 transition-transform duration-500">
             {String(idx + 1).padStart(2, '0')}
          </div>
          <div>
            <h4 className="text-[14px] font-black text-zinc-950 uppercase tracking-tight">{item.part_name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.1em] italic font-mono leading-none">Engineering Compliance Setup</span>
               <div className="h-1 w-1 rounded-full bg-zinc-200" />
               <span className="text-[9px] text-zinc-300 font-bold uppercase font-mono italic">Ref: {item.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Block Content: Vertical Stack */}
      <div className="p-6 space-y-6 bg-zinc-50/20">
         
         {/* 1. Machining Specifications Section */}
         <div className="space-y-3">
            <h5 className="text-[12px] font-black text-zinc-950 uppercase tracking-[0.15em] flex items-center gap-3">
               Machining Specifications
               <div className="h-[1px] flex-1 bg-zinc-200/50" />
            </h5>
            <div className="grid grid-cols-2 gap-3">
               <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-2.5">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Hardness Spec (HRC/HB)</span>
                  </div>
                  <div className="relative group/input">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-8 border-r border-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 italic">H</div>
                     <input 
                        type="text" 
                        className="w-full h-9 pl-13 pr-4 rounded-xl bg-zinc-50/30 border border-zinc-100 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 outline-none transition-all font-mono font-black text-[11px] text-zinc-900"
                        placeholder="e.g. 52-56"
                        value={item.hardness || ''}
                        onChange={(e) => onUpdate({ hardness: e.target.value })}
                     />
                  </div>
               </div>

               <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-2.5">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Surface Finish (Ra)</span>
                  </div>
                  <div className="relative group/input">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-8 border-r border-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 italic">Ra</div>
                     <input 
                        type="text" 
                        className="w-full h-9 pl-13 pr-4 rounded-xl bg-zinc-50/30 border border-zinc-100 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 outline-none transition-all font-mono font-black text-[11px] text-zinc-900"
                        placeholder="e.g. 0.8"
                        value={item.surface_finish || ''}
                        onChange={(e) => onUpdate({ surface_finish: e.target.value })}
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* 2. External Treatments & Processes (Dynamic Registry Style) */}
         <div className="space-y-3">
            <div className="flex justify-between items-end">
               <div className="space-y-3 flex-1">
                  <h5 className="text-[12px] font-black text-zinc-900 uppercase tracking-[0.15em] flex items-center gap-3">
                     External Treatments & Processes
                     <div className="h-[1px] flex-1 bg-zinc-200/50" />
                  </h5>
               </div>
               <button 
                  onClick={() => {
                     const newTreatments = [...(item.treatments || []), { id: Date.now(), category: '', type: '', cost: 0, per_unit: true }];
                     onUpdate({ treatments: newTreatments });
                  }}
                  className="ml-6 px-4 py-2 rounded-xl bg-zinc-950 text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-zinc-800 transition-all flex items-center gap-2"
               >
                  ADD PROCESS +
               </button>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
               <table className="w-full border-collapse">
                  <thead>
                     <tr className="bg-zinc-50 border-b border-zinc-200">
                        <th className="px-6 py-2.5 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest">Treatment Category</th>
                        <th className="px-6 py-2.5 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Specific Process</th>
                        <th className="px-6 py-2.5 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Rate (₹)</th>
                        <th className="px-6 py-2.5 text-right text-[9px] font-black text-zinc-400 uppercase tracking-widest">Batch Total (₹)</th>
                        <th className="w-12"></th>
                     </tr>
                  </thead>
                  <tbody>
                     {(item.treatments || []).map((t, index) => (
                        <tr key={index} className="border-b border-zinc-100 last:border-none group hover:bg-zinc-50/50 transition-colors">
                           <td className="px-6 py-3 w-[240px]">
                              <select 
                                 className="w-full h-9 px-4 rounded-xl bg-zinc-50/50 border border-zinc-100 text-[11px] font-black outline-none appearance-none focus:ring-1 focus:ring-zinc-950 transition-all"
                                 value={t.category}
                                 onChange={(e) => {
                                    const newTreatments = [...item.treatments];
                                    newTreatments[index].category = e.target.value;
                                    onUpdate({ treatments: newTreatments });
                                 }}
                              >
                                 <option value="">Select Category</option>
                                 <option value="HT">Heat Treatment</option>
                                 <option value="ST">Surface Treatment</option>
                                 <option value="NT">Nitriding</option>
                                 <option value="PT">Painting / Coating</option>
                              </select>
                           </td>
                           <td className="px-6 py-3">
                              <input 
                                 type="text" 
                                 className="w-full h-9 px-4 rounded-xl bg-white border border-zinc-100 text-[11px] font-black focus:ring-1 focus:ring-zinc-950 outline-none transition-all"
                                 placeholder="e.g. Case Hardening, Anodizing..."
                                 value={t.type}
                                 onChange={(e) => {
                                    const newTreatments = [...item.treatments];
                                    newTreatments[index].type = e.target.value;
                                    onUpdate({ treatments: newTreatments });
                                 }}
                              />
                           </td>
                           <td className="px-6 py-3 w-[140px]">
                              <div className="relative group/cost">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">₹</span>
                                 <input 
                                    type="number" 
                                    className="w-full h-9 pl-7 pr-3 rounded-xl bg-zinc-50 border border-zinc-100 text-[12px] font-black font-mono text-zinc-950 text-right outline-none focus:ring-1 focus:ring-zinc-950 transition-all"
                                    value={t.cost}
                                    onChange={(e) => {
                                       const newTreatments = [...item.treatments];
                                       newTreatments[index].cost = parseFloat(e.target.value) || 0;
                                       onUpdate({ treatments: newTreatments });
                                    }}
                                 />
                              </div>
                           </td>
                           <td className="px-6 py-3 w-[160px]">
                              <div className="text-right font-mono font-black text-[13px] text-zinc-900 pr-2">
                                 ₹{(t.cost * (item.qty || 1)).toFixed(2)}
                              </div>
                           </td>
                           <td className="pr-4 text-center">
                              <button 
                                 onClick={() => {
                                    const newTreatments = item.treatments.filter((_, i) => i !== index);
                                    onUpdate({ treatments: newTreatments });
                                 }}
                                 className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                              >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </button>
                           </td>
                        </tr>
                     ))}
                     {(item.treatments || []).length === 0 && (
                        <tr>
                           <td colSpan="5" className="px-6 py-8 text-center text-[10px] font-black text-zinc-300 uppercase italic tracking-widest">
                              No external treatments added. Click "ADD PROCESS +" to begin.
                           </td>
                        </tr>
                     )}
                  </tbody>
                  {(item.treatments || []).length > 0 && (
                     <tfoot>
                        <tr className="bg-zinc-50 border-t border-zinc-200">
                           <td colSpan="3" className="px-6 py-2 text-right">
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Sub-Total Treatment Value</span>
                           </td>
                           <td className="px-6 py-2 text-right">
                              <div className="font-mono font-black text-[14px] text-zinc-950 italic">
                                 ₹{(item.treatments || []).reduce((acc, t) => acc + (t.cost * (item.qty || 1)), 0).toFixed(2)}
                              </div>
                           </td>
                           <td></td>
                        </tr>
                     </tfoot>
                  )}
               </table>
            </div>
         </div>

         {/* 3. Quality Protocol (CMM/MTC) Section: Minimalist Refinement */}
         <div className="space-y-3">
            <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.15em] flex items-center gap-3">
               Quality Protocol
               <div className="h-[1px] flex-1 bg-zinc-200/50" />
            </h5>
            <div className="grid grid-cols-2 gap-3">
               {/* Minimal CMM Card */}
               <div className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${item.inspection?.cmm ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-zinc-100'}`}>
                  <div className="flex items-center gap-3">
                     <button 
                        onClick={() => updateInspection({ cmm: !item.inspection?.cmm })}
                        className={`relative h-5 w-9 rounded-full p-0.5 transition-all duration-500 shadow-inner ${item.inspection?.cmm ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                     >
                        <div className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all duration-300 transform ${item.inspection?.cmm ? 'translate-x-4' : 'translate-x-0'}`} />
                     </button>
                     <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${item.inspection?.cmm ? 'text-zinc-950' : 'text-zinc-400'}`}>CMM Report</span>
                  </div>
                  <div className={`relative transition-all duration-500 ${item.inspection?.cmm ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none'}`}>
                     <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-bold italic">₹</span>
                     <input 
                        type="number" 
                        className="w-20 h-7.5 pl-6 pr-3 rounded-lg bg-zinc-950 text-emerald-400 font-mono font-black text-[11px] outline-none text-right"
                        value={item.inspection?.cmm_cost || 0}
                        onChange={(e) => updateInspection({ cmm_cost: parseFloat(e.target.value) || 0 })}
                     />
                  </div>
               </div>

               {/* Minimal MTC Card */}
               <div className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${item.inspection?.mtc ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-zinc-100'}`}>
                  <div className="flex items-center gap-3">
                     <button 
                        onClick={() => updateInspection({ mtc: !item.inspection?.mtc })}
                        className={`relative h-5 w-9 rounded-full p-0.5 transition-all duration-500 shadow-inner ${item.inspection?.mtc ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                     >
                        <div className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all duration-300 transform ${item.inspection?.mtc ? 'translate-x-4' : 'translate-x-0'}`} />
                     </button>
                     <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${item.inspection?.mtc ? 'text-zinc-950' : 'text-zinc-400'}`}>MTC Certificate</span>
                  </div>
                  <div className={`relative transition-all duration-500 ${item.inspection?.mtc ? 'opacity-100 scale-100' : 'opacity-30 scale-95 pointer-events-none'}`}>
                     <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 font-bold italic">₹</span>
                     <input 
                        type="number" 
                        className="w-20 h-7.5 pl-6 pr-3 rounded-lg bg-zinc-950 text-emerald-400 font-mono font-black text-[11px] outline-none text-right"
                        value={item.inspection?.mtc_cost || 0}
                        onChange={(e) => updateInspection({ mtc_cost: parseFloat(e.target.value) || 0 })}
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>

      </div>
   );
};

const TechnicalSpecifications = ({
  activePhase,
  setActivePhase,
  formData,
  setFormData,
  libraries,
  panelIndex = 7
}) => {
  const isExpanded = activePhase === 'technical';

  const updateItem = (idx, updates) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], ...updates };
      return { ...prev, items: newItems };
    });
  };

  return (
    <section className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-zinc-300 shadow-xl ring-1 ring-zinc-200/50' : 'border-zinc-200 shadow-sm'}`}>
       <header 
         onClick={() => setActivePhase(isExpanded ? '' : 'technical')}
         className={`px-6 py-5 border-b cursor-pointer flex justify-between items-center group transition-colors ${isExpanded ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
       >
          <div className="flex items-center gap-3">
             <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black border transition-all duration-300 ${isExpanded ? 'bg-zinc-950 border-zinc-950 text-white scale-110 shadow-lg shadow-zinc-950/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-700'}`}>Technical & Quality Metadata</h3>
          </div>
          <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-zinc-950' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
       </header>

       <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-6 bg-zinc-50/10">
             {formData.items.map((item, idx) => (
                <PartTechnicalBlock 
                   key={item.id}
                   item={item}
                   idx={idx}
                   onUpdate={(updates) => updateItem(idx, updates)}
                />
             ))}
          </div>
       </div>
    </section>
  );
};

export default TechnicalSpecifications;
