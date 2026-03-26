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

  const costItems = [
    {
      id: 'packaging',
      label: 'Stuffing & Packing Cost',
      phase: 'Phase 1: Logistics',
      field: 'packaging_cost',
      notes: 'Cost for boxes, pallets, and packing materials.',
      icon: (
         <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
      )
    },
    {
      id: 'transportation',
      label: 'Shipping / Delivery Cost',
      phase: 'Phase 2: Logistics',
      field: 'transportation_cost',
      notes: 'Cost for truck, courier, or delivery.',
      icon: (
         <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
      )
    },
    {
      id: 'design',
      label: 'Design & Engineering Fee',
      phase: 'One-Time Setup',
      field: 'design_cost',
      notes: '3D modeling, technical drawings, and planning.',
      icon: (
         <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      )
    },
    {
      id: 'assembly',
      label: 'Final Assembly & Testing',
      phase: 'Quality Check',
      field: 'assembly_cost',
      notes: 'Fitting all parts and ensuring final functionality.',
      icon: (
         <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      )
    }
  ];

  return (
    <section className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-zinc-300 shadow-xl ring-1 ring-zinc-200/50' : 'border-zinc-200 shadow-sm'}`}>
       <header 
         onClick={() => setActivePhase(isExpanded ? '' : 'commercial')}
         className={`px-6 py-5 border-b cursor-pointer flex justify-between items-center group transition-colors ${isExpanded ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
       >
          <div className="flex items-center gap-3">
             <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black border transition-all duration-300 ${isExpanded ? 'bg-brand-primary border-brand-primary text-zinc-950 scale-110 shadow-lg shadow-brand-primary/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-brand-primary'}`}>Extra Costs & Shipping</h3>
          </div>
          <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-brand-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
       </header>

       <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-4">
             <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-zinc-50/50 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 italic">
                      <tr>
                         <th className="px-4 py-3 w-12 text-center">Ref</th>
                         <th className="px-4 py-3">Cost Category / Phase</th>
                         <th className="px-4 py-3">Description / Remarks</th>
                         <th className="px-4 py-3 text-right">Amount (₹)</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-50">
                      {costItems.map((item, idx) => (
                         <tr key={item.id} className="group hover:bg-zinc-50/30 transition-colors">
                            <td className="px-4 py-4 text-center">
                               <div className="h-8 w-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-brand-primary group-hover:text-zinc-950 group-hover:border-brand-primary transition-all shadow-sm">
                                  {item.icon}
                               </div>
                            </td>
                            <td className="px-4 py-4">
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter leading-none mb-1 italic opacity-70">{item.phase}</span>
                                  <span className="text-[13px] font-extrabold text-zinc-950 uppercase tracking-tight">{item.label}</span>
                               </div>
                            </td>
                            <td className="px-4 py-4">
                               <span className="text-[11px] font-semibold text-zinc-500 italic leading-relaxed">{item.notes}</span>
                            </td>
                            <td className="px-4 py-4 text-right">
                               <div className="relative group/input inline-block min-w-[160px]">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 font-black">₹</span>
                                  <input 
                                    type="number" 
                                    className="w-full h-10 pl-8 pr-3 rounded-lg bg-zinc-50 border border-zinc-200 text-right text-[14px] font-black font-mono outline-none focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all shadow-sm group-hover/input:border-brand-primary"
                                    placeholder="0.00"
                                    value={formData[item.field] || ''}
                                    onChange={(e) => updateProject({ [item.field]: parseFloat(e.target.value) || 0 })}
                                  />
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                   <tfoot className="bg-zinc-50/20 border-t border-zinc-100">
                      <tr>
                         <td colSpan="3" className="px-4 py-3.5 text-right">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Total Extra Costs</span>
                         </td>
                         <td className="px-4 py-3.5 text-right">
                            <span className="text-[16px] font-black text-zinc-950 font-mono tracking-tighter">
                               ₹{(
                                  (parseFloat(formData.packaging_cost) || 0) + 
                                  (parseFloat(formData.transportation_cost) || 0) + 
                                  (parseFloat(formData.design_cost) || 0) + 
                                  (parseFloat(formData.assembly_cost) || 0)
                               ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                         </td>
                      </tr>
                   </tfoot>
                </table>
             </div>
          </div>
       </div>
    </section>
  );
};

export default CommercialAdjustments;
