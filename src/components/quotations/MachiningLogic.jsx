import React from 'react';
import { assetService } from '@/services/assets';

const MachiningProcessRow = ({ process, quantity, libraries, onUpdate, onRemove, item }) => {
  const rate = process.rate || process.hourly_rate || 0;
  const unit = process.unit || 'hr';
  
  let batchValue = 0;
  if (unit === 'hr') {
    const totalMinutes = parseFloat(process.setup_time || 0) + (parseFloat(process.cycle_time || 0) * quantity);
    batchValue = (totalMinutes / 60) * rate;
  } else {
    // For sq_cm, per_hole, etc. cycle_time stores the quantity per part
    batchValue = (process.cycle_time || 0) * quantity * rate;
  }

  const isWireCut = process.process_name?.toLowerCase().includes('wire') && process.process_name?.toLowerCase().includes('cut') && unit === 'sq_cm';
  const isGrinding = process.process_name?.toLowerCase().includes('grind') && unit === 'sq_cm';

  return (
    <tr className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0">
      <td className="px-3 pt-3 pb-6 align-top">
        <div className="flex items-center gap-1">
          <select 
            className="h-8 flex-1 px-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-black outline-none focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all"
            value={process.process_name || ""}
            onChange={(e) => {
              const ref = libraries.labor.find(l => l.process_name === e.target.value);
              onUpdate({ 
                process_name: e.target.value, 
                rate: ref?.rate || ref?.hourly_rate || 0,
                unit: ref?.unit || 'hr'
              });
            }}
          >
            <option value="">Select Machine/Step...</option>
            {libraries.labor.map(l => <option key={l.$id} value={l.process_name}>{l.process_name} ({l.unit || 'hr'})</option>)}
          </select>
          {(isWireCut || isGrinding) && (
            <button 
              title="Sync dimensions from Raw Material"
              onClick={() => {
                const shape = item?.shape;
                const d = item?.dimensions || {};
                let d1 = 0;
                let d2 = 0;
                let area = 0;

                if (isWireCut) {
                  d2 = parseFloat(d.t || d.l || 0); // Height
                  if (shape === 'rect') d1 = 2 * (parseFloat(d.l || 0) + parseFloat(d.w || 0));
                  else if (shape === 'round') d1 = Math.PI * parseFloat(d.dia || 0);
                  else if (shape === 'hex') d1 = 6 * (parseFloat(d.af || 0) / Math.sqrt(3));
                  area = (d1 * d2) / 100;
                } else if (isGrinding) {
                  if (shape === 'rect') {
                    d1 = parseFloat(d.l || 0);
                    d2 = parseFloat(d.w || 0);
                    area = (d1 * d2) / 100;
                  } else if (shape === 'round') {
                    d1 = parseFloat(d.dia || 0);
                    d2 = parseFloat(d.l || 0);
                    area = (Math.PI * d1 * d2) / 100;
                  }
                }
                
                onUpdate({ 
                  dim1: d1.toFixed(2), 
                  dim2: d2.toFixed(2), 
                  cycle_time: area 
                });
              }}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          )}
        </div>
      </td>
      <td className="px-3 pt-3 pb-6 text-center align-top">
        {(isWireCut || isGrinding) ? (
          <div className="flex items-center gap-1 justify-center">
            <div className="relative group/dim1">
              <input 
                type="number" 
                step="0.01"
                placeholder={isWireCut ? "P" : (item?.shape === 'round' ? "D" : "L")}
                className="h-8 w-20 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-[11px] outline-none focus:bg-white font-mono font-black placeholder:text-zinc-300"
                value={process.dim1 ?? ""}
                onChange={(e) => {
                  const d1 = parseFloat(e.target.value) || 0;
                  const d2 = parseFloat(process.dim2) || 0;
                  const area = isWireCut ? (d1 * d2) / 100 : (item?.shape === 'round' ? (Math.PI * d1 * d2) / 100 : (d1 * d2) / 100);
                  onUpdate({ dim1: d1, cycle_time: area });
                }}
              />
              <span className="absolute -bottom-4 left-0 right-0 text-[6px] text-zinc-400 font-bold uppercase tracking-tighter transition-opacity whitespace-nowrap">
                {isWireCut ? 'PERIM' : (item?.shape === 'round' ? 'DIA' : 'LENGTH')}
              </span>
            </div>
            <span className="text-[10px] text-zinc-300 font-black">×</span>
            <div className="relative group/dim2">
              <input 
                type="number" 
                step="0.01"
                placeholder={isWireCut ? "H" : (item?.shape === 'round' ? "L" : "W")}
                className="h-8 w-20 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-[11px] outline-none focus:bg-white font-mono font-black placeholder:text-zinc-300"
                value={process.dim2 ?? ""}
                onChange={(e) => {
                  const d2 = parseFloat(e.target.value) || 0;
                  const d1 = parseFloat(process.dim1) || 0;
                  const area = isWireCut ? (d1 * d2) / 100 : (item?.shape === 'round' ? (Math.PI * d1 * d2) / 100 : (d1 * d2) / 100);
                  onUpdate({ dim2: d2, cycle_time: area });
                }}
              />
              <span className="absolute -bottom-4 left-0 right-0 text-[6px] text-zinc-400 font-bold uppercase tracking-tighter transition-opacity whitespace-nowrap">
                {isWireCut ? 'HEIGHT' : (item?.shape === 'round' ? 'LENGTH' : 'WIDTH')}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative group/input">
            <input 
              type="number" 
              step="0.01"
              className="h-8 w-24 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
              value={process.cycle_time ?? 0}
              onChange={(e) => onUpdate({ cycle_time: parseFloat(e.target.value) || 0 })}
            />
            <span className="absolute -bottom-4 left-0 right-0 text-[7px] text-zinc-400 font-bold uppercase tracking-tighter transition-opacity whitespace-nowrap">
              {unit === 'hr' ? 'MINS/PART' : unit.toUpperCase()}
            </span>
          </div>
        )}
      </td>
      <td className="px-3 pt-3 pb-6 text-center align-top">
        {unit === 'hr' ? (
          <div className="relative group/setup">
            <input 
              type="number" 
              step="0.01"
              className="h-8 w-22 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
              value={process.setup_time ?? 0}
              onChange={(e) => onUpdate({ setup_time: parseFloat(e.target.value) || 0 })}
            />
            <span className="absolute -bottom-4 left-0 right-0 text-[7px] text-zinc-400 font-bold uppercase tracking-tighter">SETUP MINS</span>
          </div>
        ) : (
          <span className="text-[10px] text-zinc-300 font-bold italic">N/A</span>
        )}
      </td>
      <td className="px-3 pt-3 pb-6 text-center align-top">
        <div className="relative group/rate inline-block">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">₹</span>
          <input 
            type="number" 
            step="0.01"
            className="h-8 w-26 pl-5 pr-2 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
            value={rate}
            onChange={(e) => onUpdate({ rate: parseFloat(e.target.value) || 0 })}
          />
          <span className="absolute -bottom-4 right-0 text-[7px] text-zinc-400 font-bold uppercase tracking-tighter transition-opacity whitespace-nowrap">
            RATE / {unit.toUpperCase()}
          </span>
        </div>
      </td>
      <td className="px-4 pt-3 pb-6 text-right align-top">
        <div className="font-black text-zinc-950 font-mono text-[12px]">
          ₹{batchValue.toFixed(2)}
        </div>
        {quantity > 1 && (
          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">
            ₹{(batchValue / quantity).toFixed(2)} / UNIT
          </div>
        )}
      </td>
      <td className="px-2 pt-3 pb-6 text-center align-top">
        <button onClick={onRemove} className="h-7 w-7 text-zinc-200 hover:text-red-500 transition-colors rounded hover:bg-red-50 flex items-center justify-center mx-auto">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </td>
    </tr>
  );
};

const PartMachiningBlock = ({ item, idx, libraries, onUpdate }) => {
  const addProcess = () => {
    const newProcesses = [...(item.processes || []), { id: Date.now(), process_name: '', hourly_rate: 0, cycle_time: 0, setup_time: 0 }];
    onUpdate({ processes: newProcesses });
  };

  const removeProcess = (id) => {
    const newProcesses = item.processes.filter(p => p.id !== id);
    onUpdate({ processes: newProcesses });
  };

  const updateProcess = (id, updates) => {
    const newProcesses = item.processes.map(p => p.id === id ? { ...p, ...updates } : p);
    onUpdate({ processes: newProcesses });
  };

  return (
    <div className="mb-4 last:mb-0 border border-zinc-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {item.part_image ? (
            <div className="h-9 w-9 rounded border border-zinc-200 overflow-hidden bg-white shadow-sm flex-shrink-0">
               <img 
                  src={assetService.getFilePreview(item.part_image.$id)} 
                  alt="Part" 
                  className="h-full w-full object-cover"
               />
            </div>
          ) : (
            <div className="h-9 w-9 rounded-lg bg-brand-primary text-zinc-950 flex items-center justify-center text-[10px] font-black shadow-lg shadow-brand-primary/20">
              {String(idx + 1).padStart(2, '0')}
            </div>
          )}
          <div>
            <h4 className="text-[12px] font-black text-brand-primary uppercase tracking-tight">{item.part_name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.1em] italic font-mono leading-none">Manufacturing Steps</span>
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
             onClick={addProcess}
             className="h-8 px-4 rounded-lg bg-brand-primary text-zinc-950 text-[10px] font-black uppercase tracking-tight hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/25 border border-brand-primary/20"
           >
              ADD STEP +
           </button>
        </div>
      </div>
      
      {/* Machining Steps Table */}
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-zinc-50/30 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 italic">
            <tr>
               <th className="px-3 py-2 whitespace-nowrap">Machine / Step Name <span className="text-red-500 font-extrabold">*</span></th>
               <th className="px-3 py-2 text-center whitespace-nowrap">Qty / Time <span className="text-red-500 font-extrabold">*</span></th>
               <th className="px-3 py-2 text-center whitespace-nowrap">Setup (if Hr)</th>
               <th className="px-3 py-2 text-center whitespace-nowrap">Unit Rate (₹) <span className="text-red-500 font-extrabold">*</span></th>
               <th className="px-3 py-2 text-right">Step Cost</th>
              <th className="px-3 py-2 text-center w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 font-mono">
            {(item.processes || []).length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center">
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em] italic">No manufacturing steps defined</span>
                </td>
              </tr>
            ) : item.processes?.map(p => (
              <MachiningProcessRow 
                key={p.id} 
                process={p} 
                quantity={parseFloat(item.qty || 1)} 
                libraries={libraries}
                onUpdate={(updates) => updateProcess(p.id, updates)}
                onRemove={() => removeProcess(p.id)}
                item={item}
              />
            ))}
          </tbody>
          {(item.processes || []).length > 0 && (
             <tfoot>
                <tr className="bg-zinc-50/20 border-t border-zinc-100">
                    <td colSpan="4" className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Manufacturing Subtotal</td>
                   <td className="px-4 py-3 text-right">
                      <span className="text-[12px] font-black text-zinc-950 font-mono italic">
                         ₹{(item.processes || []).reduce((acc, p) => {
                            const rate = p.rate || p.hourly_rate || 0;
                            const unit = p.unit || 'hr';
                            if (unit === 'hr') {
                              const totalMinutes = parseFloat(p.setup_time || 0) + (parseFloat(p.cycle_time || 0) * (item.qty || 1));
                              return acc + ((totalMinutes / 60) * rate);
                            }
                            return acc + ((p.cycle_time || 0) * (item.qty || 1) * rate);
                         }, 0).toFixed(2)}
                      </span>
                   </td>
                   <td></td>
                </tr>
             </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

const MachiningLogic = ({
  activePhase,
  setActivePhase,
  formData,
  setFormData,
  libraries,
  panelIndex = 4
}) => {
  const updateItem = (idx, updates) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], ...updates };
      return { ...prev, items: newItems };
    });
  };

  const isExpanded = activePhase === 'machining';

  return (
    <section className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-zinc-300 shadow-md ring-1 ring-zinc-200' : 'border-zinc-200 shadow-sm'}`}>
       <header 
         onClick={() => setActivePhase(isExpanded ? '' : 'machining')}
         className={`h-[52px] px-5 border-b cursor-pointer flex justify-between items-center group transition-colors ${isExpanded ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
       >
          <div className="flex items-center gap-3">
             <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black border transition-all duration-300 ${isExpanded ? 'bg-brand-primary border-brand-primary text-zinc-950 translate-z-0 shadow-lg shadow-brand-primary/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-brand-primary'}`}>Manufacturing Steps</h3>
          </div>
          <div className="flex items-center gap-4">
             <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border italic animate-in slide-in-from-right-2 duration-300 ${
               formData.items.every(item => 
                 (item.processes || []).length > 0 && 
                 item.processes.every(p => p.process_name && p.process_name.trim() !== '')
               )
                 ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                 : 'text-brand-primary bg-brand-primary/10 border-brand-primary/10'
             }`}>
                {formData.items.every(item => 
                   (item.processes || []).length > 0 && 
                   item.processes.every(p => p.process_name && p.process_name.trim() !== '')
                )
                  ? 'MACHINING CONFIG COMPLETE'
                  : 'MACHINING STEPS PENDING'}
             </span>
             <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-brand-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
       </header>
       <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-2.5 bg-zinc-50/10">
             {formData.items.map((item, idx) => (
                <PartMachiningBlock 
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

export default MachiningLogic;
