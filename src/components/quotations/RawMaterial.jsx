import React, { useState, useEffect } from 'react';

const SHAPES = [
  { id: 'rect', name: 'Rect Bar / Plate', icon: 'M4 6h16v12H4z' },
  { id: 'round', name: 'Round Bar', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20z' },
  { id: 'hex', name: 'Hexagonal Bar', icon: 'M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z' },
];

const DimensionInput = ({ label, field, value, allowance, onChange }) => (
  <div className="flex-1 min-w-[120px]">
     <label className="text-[8px] font-black text-zinc-400 uppercase block mb-1.5 flex justify-between">
        <span>{label}</span>
        <span className="text-emerald-600">+ Allowance</span>
     </label>
     <div className="flex gap-1">
        <input 
          type="number" 
          placeholder="Size"
          className="w-[60%] h-9 bg-white border border-zinc-200 rounded-l-lg px-2 text-[12px] font-bold outline-none focus:ring-1 focus:ring-zinc-950 transition-all font-mono"
          value={value ?? ""}
          onChange={(e) => onChange(field, e.target.value)}
        />
        <input 
          type="number" 
          placeholder="+ mm"
          className="w-[40%] h-9 bg-emerald-50 border border-emerald-100 border-l-0 rounded-r-lg px-2 text-[11px] font-bold text-emerald-700 outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono placeholder:text-emerald-300"
          value={allowance ?? ""}
          onChange={(e) => onChange(field, e.target.value, true)}
        />
     </div>
  </div>
);

const MaterialConfigurationRow = ({ item, idx, libraries, onUpdate }) => {
  const [step, setStep] = useState(1); // 1: Material, 2: Shape, 3: Dimensions/Result
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Sync step with item state
  useEffect(() => {
    if (item.material && !item.shape) setStep(2);
    else if (item.material && item.shape) setStep(3);
    else setStep(1);
  }, [item.material, item.shape]);

  const getDensity = () => {
    if (!item.material) return 7.85;
    if (item.material.density) return parseFloat(item.material.density);
    const grade = item.material.grade.toLowerCase();
    if (grade.includes('al') || grade.includes('6061')) return 2.70;
    if (grade.includes('ms') || grade.includes('en') || grade.includes('ss')) return 7.85;
    if (grade.includes('brass') || grade.includes('copper')) return 8.50;
    return 7.85;
  };

  const calculateWeight = (updatedDims, updatedAllowances) => {
    const d = updatedDims || item.dimensions || {};
    const a = updatedAllowances || item.allowances || {};
    const density = getDensity();
    let vol = 0;

    const parse = (v) => parseFloat(v) || 0;

    const L = parse(d.l) + parse(a.l);
    const W = parse(d.w) + parse(a.w);
    const T = parse(d.t) + parse(a.t);
    const Dia = parse(d.dia) + parse(a.dia);
    const AF = parse(d.af) + parse(a.af);

    if (item.shape === 'rect') {
      vol = (L * W * T) / 1000;
    } else if (item.shape === 'round') {
      const r = Dia / 2;
      vol = (Math.PI * Math.pow(r, 2) * L) / 1000;
    } else if (item.shape === 'hex') {
      vol = (2.598 * Math.pow(AF, 2) * L) / 1000;
    }

    const weight = (vol * density) / 1000;
    onUpdate({ material_weight: weight });
  };

  const handleDimUpdate = (field, val, isAllowance = false) => {
    const parentKey = isAllowance ? 'allowances' : 'dimensions';
    const newSubData = { ...(item[parentKey] || {}), [field]: val }; // Keep as string while typing
    
    onUpdate({ [parentKey]: newSubData });
    
    // For calculation, use parsed values
    if (isAllowance) {
       calculateWeight(item.dimensions, newSubData);
    } else {
       calculateWeight(newSubData, item.allowances);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-visible mb-4 transition-all hover:border-zinc-300">
      <div className="flex items-stretch min-h-[80px]">
        {/* Step Indicator Sidebar */}
        <div className="w-16 bg-zinc-50 border-r border-zinc-100 flex flex-col items-center justify-center gap-1.5 py-4">
           <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter italic">Step</span>
           <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-500 ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-zinc-950 text-white'}`}>
              {step}
           </div>
           {step === 3 && (
              <svg className="h-3.5 w-3.5 text-emerald-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
           )}
        </div>

        {/* Dynamic Workspace */}
        <div className="flex-1 p-5 flex flex-wrap items-center gap-6">
           {/* Section 0: Part Profile */}
           <div className="w-48 border-r border-zinc-100 pr-6">
              <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest block mb-0.5">Component</span>
              <h4 className="text-[14px] font-black text-zinc-950 truncate">{item.part_name}</h4>
              <span className="text-[9px] font-bold text-zinc-400 font-mono italic">REF: {item.id}</span>
           </div>

            {/* Step 1: Material Selection */}
            <div className={`flex-1 min-w-[240px] transition-all duration-500 ${step > 1 && !isOpen ? 'opacity-80 scale-[0.99]' : ''}`}>
               <div className={`relative group ${isOpen ? 'z-[100]' : 'z-0'}`}>
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">01. Choose Engineering Grade</span>
                 <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        className={`w-full h-11 pl-4 pr-10 rounded-xl bg-zinc-50 border focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-bold text-black text-[12px] placeholder:font-normal ${isOpen ? 'border-zinc-950 ring-1 ring-zinc-950 bg-white' : 'border-zinc-200'} ${item.material?.isManual ? 'border-amber-500 bg-amber-50/30' : ''}`}
                        placeholder="e.g. Aluminum 6061, EN24..."
                        value={search || (item.material ? item.material.grade : "")}
                        onFocus={() => setIsOpen(true)}
                        onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
                      />
                      <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950 transition-colors"
                      >
                         <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </button>
                    </div>
                 </div>

                 {isOpen && (
                   <>
                     <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                     <div className="absolute left-0 right-0 top-full mt-2 z-[70] bg-white border border-zinc-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-300 ring-1 ring-black/5">
                        <div className="p-2 border-b border-zinc-50 bg-zinc-50/50">
                           <button 
                             onClick={() => { onUpdate({material: { grade: search || "Custom Grade", base_rate: 0, density: 7.85, isManual: true }}); setSearch(""); setIsOpen(false); }}
                             className="w-full py-2 px-3 flex items-center justify-between gap-2 bg-white border border-dashed border-zinc-300 rounded-lg hover:border-zinc-950 hover:bg-zinc-50 transition-all group/manual"
                           >
                              <div className="flex items-center gap-2">
                                 <div className="h-6 w-6 rounded bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover/manual:bg-zinc-950 group-hover/manual:text-white transition-colors">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                 </div>
                                 <span className="text-[10px] font-black uppercase text-zinc-400 group-hover/manual:text-zinc-950 transition-colors">Create Manual Entry</span>
                              </div>
                              {search && <span className="text-[10px] font-bold text-zinc-900 truncate max-w-[120px]">"{search}"</span>}
                           </button>
                        </div>
                        
                        {libraries.materials.filter(m => m.grade.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                           <div className="px-4 py-8 text-center">
                              <span className="text-[10px] font-bold text-zinc-300 uppercase italic">No library matches found</span>
                           </div>
                        ) : libraries.materials.filter(m => m.grade.toLowerCase().includes(search.toLowerCase())).map(m => (
                           <button 
                             key={m.$id}
                             onClick={() => { onUpdate({material: m}); setSearch(""); setIsOpen(false); }}
                             className="w-full text-left px-4 py-3 text-[11px] font-bold hover:bg-zinc-50 border-b border-zinc-100 last:border-0 flex justify-between items-center transition-colors group/item"
                           >
                              <div className="flex flex-col">
                                 <span className="text-zinc-950">{m.grade}</span>
                                 <span className="text-[9px] text-zinc-400 font-normal opacity-70 italic tracking-tight">{m.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="text-emerald-600 font-black">₹{m.base_rate} <span className="text-[8px] font-normal text-zinc-400">/ kg</span></span>
                                 <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                 </div>
                              </div>
                           </button>
                        ))}
                     </div>
                   </>
                 )}

                 {item.material?.isManual && (
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-50/50 border border-amber-100/50 animate-in fade-in slide-in-from-top-2 duration-500">
                       <div className="flex items-center gap-2 mb-2">
                          <div className="h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center">
                             <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" /></svg>
                          </div>
                          <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Manual Material Configuration</span>
                       </div>
                       <div className="flex flex-wrap gap-4">
                          <div className="flex-1 min-w-[200px]">
                             <label className="text-[8px] font-black text-amber-600 uppercase mb-1 block">Grade / Designation</label>
                             <input 
                                type="text"
                                className="w-full h-9 px-3 rounded-lg border border-amber-200 bg-white text-[12px] font-bold outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                                placeholder="e.g. CUSTOM GRADE X"
                                value={item.material.grade}
                                onChange={(e) => onUpdate({ material: { ...item.material, grade: e.target.value } })}
                             />
                          </div>
                          <div className="w-36">
                             <label className="text-[8px] font-black text-amber-600 uppercase mb-1 block">Parent Category</label>
                             <select 
                                className="w-full h-9 px-3 rounded-lg border border-amber-200 bg-white text-[11px] font-bold outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                                value={item.material.category || ""}
                                onChange={(e) => {
                                    const cat = e.target.value;
                                    let density = 7.85; // default Steel
                                    if (cat === 'SS') density = 8.00;
                                    if (cat === 'AL') density = 2.70;
                                    if (cat === 'CU') density = 8.96;
                                    if (cat === 'BR') density = 8.50;
                                    if (cat === 'PL') density = 1.40;
                                    if (cat === 'TI') density = 4.50;
                                    onUpdate({ material: { ...item.material, category: cat, density } });
                                    calculateWeight(item.dimensions, item.allowances);
                                }}
                             >
                                <option value="ST">Mild / Alloy Steel</option>
                                <option value="SS">Stainless Steel</option>
                                <option value="AL">Aluminum</option>
                                <option value="CU">Copper</option>
                                <option value="BR">Brass / Bronze</option>
                                <option value="TI">Titanium</option>
                                <option value="PL">Engineering Plastics</option>
                             </select>
                          </div>
                          <div className="w-24">
                             <label className="text-[8px] font-black text-amber-600 uppercase mb-1 block">Density</label>
                             <input 
                                type="number"
                                step="0.01"
                                className="w-full h-9 px-3 rounded-lg border border-amber-200 bg-white text-[12px] font-black outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                                value={item.material.density}
                                onChange={(e) => {
                                    const density = parseFloat(e.target.value) || 0;
                                    onUpdate({ material: { ...item.material, density } });
                                    calculateWeight(item.dimensions, item.allowances);
                                }}
                             />
                          </div>
                          <div className="w-28">
                             <label className="text-[8px] font-black text-amber-600 uppercase mb-1 block">Base Rate (₹/kg)</label>
                             <input 
                                type="number"
                                className="w-full h-9 px-3 rounded-lg border border-amber-200 bg-white text-[12px] font-black outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                                value={item.material.base_rate}
                                onChange={(e) => onUpdate({ material: { ...item.material, base_rate: parseFloat(e.target.value) || 0 } })}
                             />
                          </div>
                       </div>
                    </div>
                 )}
               </div>
            </div>

           {/* Step 2: Shape Selection */}
           {(item.material || step >= 2) && (
              <div className={`transition-all duration-500 animate-in fade-in slide-in-from-left-4 ${step > 2 ? 'opacity-80 scale-[0.99]' : ''}`}>
                 <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">02. Select Profile</span>
                 <div className="flex gap-2">
                    {SHAPES.map(s => (
                       <button 
                         key={s.id}
                         onClick={() => onUpdate({ shape: s.id })}
                         className={`flex flex-col items-center justify-center h-16 w-20 rounded-xl border-2 transition-all ${item.shape === s.id ? 'border-zinc-950 bg-zinc-950 text-white shadow-lg' : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}
                       >
                          <svg className="h-5 w-5 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} /></svg>
                          <span className="text-[8px] font-black uppercase text-center leading-tight">{s.name}</span>
                       </button>
                    ))}
                 </div>
              </div>
           )}

           {/* Step 3: Dimensions & Allowance */}
           {item.shape && (
              <div className="flex-1 flex gap-6 items-center animate-in fade-in slide-in-from-left-4">
                 <div className="flex-1 flex flex-wrap gap-4 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
                    <DimensionInput 
                      label="Length (mm)" 
                      field="l" 
                      value={item.dimensions?.l} 
                      allowance={item.allowances?.l} 
                      onChange={handleDimUpdate} 
                    />
                    
                    {item.shape === 'rect' && (
                       <>
                          <DimensionInput 
                            label="Width (mm)" 
                            field="w" 
                            value={item.dimensions?.w} 
                            allowance={item.allowances?.w} 
                            onChange={handleDimUpdate} 
                          />
                          <DimensionInput 
                            label="Thickness (mm)" 
                            field="t" 
                            value={item.dimensions?.t} 
                            allowance={item.allowances?.t} 
                            onChange={handleDimUpdate} 
                          />
                       </>
                    )}
                    {item.shape === 'round' && (
                       <DimensionInput 
                         label="Diameter (mm)" 
                         field="dia" 
                         value={item.dimensions?.dia} 
                         allowance={item.allowances?.dia} 
                         onChange={handleDimUpdate} 
                       />
                    )}
                    {item.shape === 'hex' && (
                       <DimensionInput 
                         label="Across Flat (mm)" 
                         field="af" 
                         value={item.dimensions?.af} 
                         allowance={item.allowances?.af} 
                         onChange={handleDimUpdate} 
                       />
                    )}
                 </div>

                 <div className="text-right border-l border-zinc-100 pl-6 pr-4 py-2 flex flex-col justify-center">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Valuation</span>
                    <div className="text-[18px] font-black text-zinc-950 leading-tight">
                       ₹{((item.material_weight || 0) * (item.material?.base_rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[11px] font-bold text-zinc-500 font-mono">{(item.material_weight || 0).toFixed(3)}kg</span>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

const RawMaterial = ({
  activePhase,
  setActivePhase,
  formData,
  setFormData,
  libraries,
  panelIndex = 3
}) => {
  const updateItem = (idx, updates) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], ...updates };
      return { ...prev, items: newItems };
    });
  };

  return (
    <section className={`bg-white rounded-2xl border transition-all duration-300 ${activePhase === 'material' ? 'border-zinc-300 shadow-xl ring-1 ring-zinc-200/50' : 'border-zinc-200 shadow-sm'}`}>
       <header 
         onClick={() => setActivePhase(activePhase === 'material' ? '' : 'material')}
         className={`px-6 py-5 border-b cursor-pointer flex justify-between items-center group rounded-t-2xl transition-colors ${activePhase === 'material' ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
       >
          <div className="flex items-center gap-3">
             <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black border transition-all duration-300 ${activePhase === 'material' ? 'bg-zinc-950 border-zinc-950 text-white shadow-lg shadow-zinc-950/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${activePhase === 'material' ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-700'}`}>BOM Raw Material Ledger</h3>
          </div>
          <div className="flex items-center gap-4">
             {activePhase !== 'material' && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100/50 italic animate-in fade-in zoom-in duration-300">
                   MATERIAL SETUP PENDING
                </span>
             )}
             <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-300 ${activePhase === 'material' ? 'rotate-180 text-zinc-950' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
       </header>
       <div className={`transition-all duration-500 ease-in-out ${activePhase === 'material' ? 'max-h-[3000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-6 bg-zinc-50/10">
             {formData.items.map((item, idx) => (
                <MaterialConfigurationRow 
                   key={item.id}
                   item={item}
                   idx={idx}
                   libraries={libraries}
                   onUpdate={(updates) => updateItem(idx, updates)}
                />
             ))}
          </div>
       </div>
    </section>
  );
};

export default RawMaterial;
