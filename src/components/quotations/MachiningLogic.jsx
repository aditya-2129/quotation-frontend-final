import React from 'react';

const MachiningProcessRow = ({ process, quantity, libraries, onUpdate, onRemove }) => {
  const totalMinutes = parseFloat(process.setup_time || 0) + (parseFloat(process.cycle_time || 0) * quantity);
  const batchValue = (totalMinutes / 60) * (process.hourly_rate || 0);

  return (
    <tr className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0">
      <td className="px-6 py-3.5">
        <select 
          className="h-9 w-full px-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-black outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-all"
          value={process.process_name || ""}
          onChange={(e) => {
            const ref = libraries.labor.find(l => l.process_name === e.target.value);
            onUpdate({ process_name: e.target.value, hourly_rate: ref?.hourly_rate || 0 });
          }}
        >
          <option value="">Choose Machine/Process...</option>
          {libraries.labor.map(l => <option key={l.$id} value={l.process_name}>{l.process_name}</option>)}
        </select>
      </td>
      <td className="px-6 py-3.5 text-center">
        <input 
          type="number" 
          className="h-9 w-20 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
          value={process.cycle_time ?? 0}
          onChange={(e) => onUpdate({ cycle_time: parseFloat(e.target.value) || 0 })}
        />
      </td>
      <td className="px-6 py-3.5 text-center">
        <input 
          type="number" 
          className="h-9 w-20 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
          value={process.setup_time ?? 0}
          onChange={(e) => onUpdate({ setup_time: parseFloat(e.target.value) || 0 })}
        />
      </td>
      <td className="px-6 py-3.5 text-center">
        <div className="relative group/rate inline-block">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">₹</span>
          <input 
            type="number" 
            className="h-9 w-24 pl-5 pr-2 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
            value={process.hourly_rate ?? 0}
            onChange={(e) => onUpdate({ hourly_rate: parseFloat(e.target.value) || 0 })}
          />
          <span className="absolute -bottom-4 right-0 text-[7px] text-zinc-400 font-bold uppercase tracking-tighter opacity-0 group-focus-within/rate:opacity-100 transition-opacity">RATE / HR</span>
        </div>
      </td>
      <td className="px-6 py-3.5 text-right">
        <div className="font-black text-zinc-950 font-mono text-[12px]">
          ₹{batchValue.toFixed(2)}
        </div>
        {quantity > 1 && (
          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">
            ₹{(batchValue / quantity).toFixed(2)} / UNIT
          </div>
        )}
      </td>
      <td className="px-4 py-3.5 text-center">
        <button onClick={onRemove} className="h-7 w-7 text-zinc-200 hover:text-red-500 transition-colors rounded hover:bg-red-50 flex items-center justify-center">
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
    <div className="mb-8 last:mb-0 border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-[10px] font-black">
            {String(idx + 1).padStart(2, '0')}
          </div>
          <div>
            <h4 className="text-[13px] font-black text-zinc-950 uppercase tracking-tight">{item.part_name}</h4>
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest italic font-mono">SEQ REF: {item.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Production Batch</span>
              <span className="text-[11px] font-black text-zinc-950 font-mono tracking-tighter">{item.qty || 1} Units</span>
           </div>
           <button 
             onClick={addProcess}
             className="h-8 px-4 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-tight hover:bg-emerald-700 transition-all flex items-center gap-2"
           >
             ADD OPERATION +
           </button>
        </div>
      </div>
      
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-zinc-50/30 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 italic">
            <tr>
              <th className="px-6 py-3">Engineering Operation Type</th>
              <th className="px-6 py-3 text-center">Cycle Time (Min/Pc)</th>
              <th className="px-6 py-3 text-center">Setup Time (Mins)</th>
              <th className="px-6 py-3 text-center">Machine Rate (₹/Hr)</th>
              <th className="px-6 py-3 text-right">Batch Value</th>
              <th className="px-6 py-3 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {item.processes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em italic]">No machining steps defined for this component</span>
                </td>
              </tr>
            ) : item.processes.map(p => (
              <MachiningProcessRow 
                key={p.id} 
                process={p} 
                quantity={parseFloat(item.qty || 1)} 
                libraries={libraries}
                onUpdate={(updates) => updateProcess(p.id, updates)}
                onRemove={() => removeProcess(p.id)}
              />
            ))}
          </tbody>
          {item.processes.length > 0 && (
             <tfoot>
                <tr className="bg-zinc-50/20 border-t border-zinc-100">
                   <td colSpan="4" className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Part Machining Subtotal</td>
                   <td className="px-6 py-4 text-right">
                      <span className="text-[13px] font-black text-zinc-950 font-mono">
                         ₹{item.processes.reduce((acc, p) => {
                            const totalMinutes = parseFloat(p.setup_time || 0) + (parseFloat(p.cycle_time || 0) * (item.qty || 1));
                            return acc + ((totalMinutes / 60) * (p.hourly_rate || 0));
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
    <section className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-zinc-300 shadow-md ring-1 ring-zinc-200' : 'border-zinc-200 shadow-sm'}`}>
       <header 
         onClick={() => setActivePhase(isExpanded ? '' : 'machining')}
         className={`px-6 py-5 border-b cursor-pointer flex justify-between items-center group transition-colors ${isExpanded ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
       >
          <div className="flex items-center gap-3">
             <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black border transition-all duration-300 ${isExpanded ? 'bg-zinc-950 border-zinc-950 text-white translate-z-0 shadow-lg shadow-zinc-950/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-700'}`}>Operational Machining Sequence</h3>
          </div>
          <div className="flex items-center gap-4">
             {!isExpanded && (
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2.5 py-1 rounded border border-zinc-100 italic animate-in slide-in-from-right-2 duration-300">
                   Sequence Library Mapping Loaded
                </span>
             )}
             <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-zinc-950' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
       </header>
       <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-6 bg-zinc-50/10">
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
