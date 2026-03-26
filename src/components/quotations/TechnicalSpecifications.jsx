import React from 'react';

const PartTechnicalBlock = ({ item, idx, onUpdate }) => {
  const updateHT = (updates) => {
    onUpdate({ heat_treatment: { ...item.heat_treatment, ...updates } });
  };

  const updateST = (updates) => {
    onUpdate({ surface_treatment: { ...item.surface_treatment, ...updates } });
  };



  return (
    <div className="mb-4 last:mb-0 border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Block Header */}
      <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center group/header">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-zinc-950/20 transition-transform duration-500">
             {String(idx + 1).padStart(2, '0')}
          </div>
          <div>
            <h4 className="text-[13px] font-black text-zinc-950 uppercase tracking-tight">{item.part_name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.1em] italic font-mono leading-none">Engineering Compliance Setup</span>
               <div className="h-1 w-1 rounded-full bg-zinc-200" />
               <span className="text-[9px] text-zinc-300 font-bold uppercase font-mono italic">Ref: {item.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Production Batch</span>
              <span className="text-[11px] font-black text-zinc-950 font-mono tracking-tighter">{item.qty || 1} Units</span>
           </div>
           <button 
              onClick={() => {
                 const newTreatments = [...(item.treatments || []), { id: Date.now(), category: '', type: '', cost: 0, per_unit: true }];
                 onUpdate({ treatments: newTreatments });
              }}
              className="h-8 px-4 rounded-lg bg-zinc-950 text-white text-[10px] font-black uppercase tracking-tight hover:bg-zinc-800 transition-all flex items-center gap-2"
           >
              ADD PROCESS +
           </button>
        </div>
      </div>

      {/* Block Content: Vertical Stack */}
      <div className="p-6 space-y-6 bg-zinc-50/20">
         


          <div className="p-0 overflow-x-auto">
             <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-zinc-50/30 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 italic">
                   <tr>
                      <th className="px-6 py-3">Treatment Category <span className="text-red-500 font-extrabold">*</span></th>
                      <th className="px-6 py-3 text-center">Process Details <span className="text-red-500 font-extrabold">*</span></th>
                      <th className="px-6 py-3 text-center text-[10px]">Rate (₹) <span className="text-red-500 font-extrabold">*</span></th>
                      <th className="px-6 py-3 text-right">Processing Cost</th>
                      <th className="px-6 py-3 text-center w-10"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                   {(item.treatments || []).map((t, index) => (
                      <tr key={index} className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0">
                         <td className="px-6 py-3.5 w-[240px]">
                            <select 
                               className="w-full h-9 px-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-black outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-all"
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
                         <td className="px-6 py-3.5">
                            <input 
                               type="text" 
                               className="w-full h-9 px-4 rounded-lg bg-white border border-zinc-200 text-xs font-black focus:ring-1 focus:ring-zinc-950 outline-none transition-all"
                               placeholder="e.g. Case Hardening..."
                               value={t.type}
                               onChange={(e) => {
                                  const newTreatments = [...item.treatments];
                                  newTreatments[index].type = e.target.value;
                                  onUpdate({ treatments: newTreatments });
                               }}
                            />
                         </td>
                         <td className="px-6 py-3.5 w-[140px] text-center">
                            <div className="relative group/cost inline-block">
                               <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">₹</span>
                               <input 
                                  type="number" 
                                  className="h-9 w-24 pl-5 pr-2 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
                                  value={t.cost}
                                  onChange={(e) => {
                                     const newTreatments = [...item.treatments];
                                     newTreatments[index].cost = parseFloat(e.target.value) || 0;
                                     onUpdate({ treatments: newTreatments });
                                  }}
                               />
                            </div>
                         </td>
                         <td className="px-6 py-3.5 text-right w-[160px]">
                            <div className="font-black text-zinc-950 font-mono text-[12px]">
                               ₹{(t.cost * (item.qty || 1)).toFixed(2)}
                            </div>
                            {(item.qty || 1) > 1 && (
                               <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter opacity-80 mt-0.5">
                                  ₹{t.cost.toFixed(2)} / UNIT
                               </div>
                            )}
                         </td>
                         <td className="px-4 py-3.5 text-center">
                            <button 
                               onClick={() => {
                                  const newTreatments = item.treatments.filter((_, i) => i !== index);
                                  onUpdate({ treatments: newTreatments });
                               }}
                               className="h-7 w-7 text-zinc-200 hover:text-red-500 transition-colors rounded hover:bg-red-50 flex items-center justify-center"
                            >
                               <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                         </td>
                      </tr>
                   ))}
                   {(item.treatments || []).length === 0 && (
                      <tr>
                         <td colSpan="5" className="px-6 py-12 text-center">
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em] italic">No external treatments defined for this component</span>
                         </td>
                      </tr>
                   )}
                </tbody>
                {(item.treatments || []).length > 0 && (
                   <tfoot>
                      <tr className="bg-zinc-50/20 border-t border-zinc-100">
                         <td colSpan="3" className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total Finishing Cost</td>
                         <td className="px-6 py-4 text-right">
                            <span className="text-[13px] font-black text-zinc-950 font-mono italic">
                               ₹{(item.treatments || []).reduce((acc, t) => acc + (t.cost * (item.qty || 1)), 0).toFixed(2)}
                            </span>
                         </td>
                         <td></td>
                      </tr>
                   </tfoot>
                )}
             </table>
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
  panelIndex = 5
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
             <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-700'}`}>Surface Finishing & Coating</h3>
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
