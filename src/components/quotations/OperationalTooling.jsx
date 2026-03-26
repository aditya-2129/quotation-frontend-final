import React from 'react';

const ToolingResourceRow = ({ tooling, libraries, onUpdate, onRemove }) => {
  return (
    <tr className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0">
      <td className="px-6 py-3.5">
        <select 
          className="h-9 w-full px-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-black outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-all font-mono"
          value={tooling.item_name || ""}
          onChange={(e) => {
            const ref = libraries.tooling.find(i => i.item_name === e.target.value);
            onUpdate({ item_name: e.target.value, rate: ref?.rate || 0 });
          }}
        >
          <option value="">Choose Tooling/Consumable...</option>
          {libraries.tooling.map(i => <option key={i.$id} value={i.item_name}>{i.item_name}</option>)}
        </select>
      </td>
      <td className="px-6 py-3.5 text-center">
        <input 
          type="number" 
          className="h-9 w-20 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
          value={tooling.qty ?? 1}
          onChange={(e) => onUpdate({ qty: parseFloat(e.target.value) || 1 })}
        />
      </td>
      <td className="px-6 py-3.5 text-right font-mono text-[11px] text-zinc-500 italic">
        ₹{(tooling.rate || 0).toFixed(2)}
      </td>
      <td className="px-6 py-3.5 text-right font-black text-zinc-950 font-mono text-[12px]">
        ₹{(tooling.rate * (tooling.qty || 1)).toFixed(2)}
      </td>
      <td className="px-4 py-3.5 text-center">
        <button onClick={onRemove} className="h-7 w-7 text-zinc-200 hover:text-red-500 transition-colors rounded hover:bg-red-50 flex items-center justify-center">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </td>
    </tr>
  );
};

const PartToolingBlock = ({ item, idx, libraries, onUpdate }) => {
  const addTooling = () => {
    const newTooling = [...(item.tooling || []), { id: Date.now(), item_name: '', rate: 0, qty: 1 }];
    onUpdate({ tooling: newTooling });
  };

  const removeTooling = (id) => {
    const newTooling = item.tooling.filter(t => t.id !== id);
    onUpdate({ tooling: newTooling });
  };

  const updateTooling = (id, updates) => {
    const newTooling = item.tooling.map(t => t.id === id ? { ...t, ...updates } : t);
    onUpdate({ tooling: newTooling });
  };

  return (
    <div className="mb-8 last:mb-0 border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center transition-all">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-[10px] font-black italic">
             {String(idx + 1).padStart(2, '0')}
          </div>
          <div>
            <h4 className="text-[13px] font-black text-zinc-950 uppercase tracking-tight">{item.part_name}</h4>
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest italic font-mono">ASSET ID: {item.id}</span>
          </div>
        </div>
        <button 
          onClick={addTooling}
          className="h-8 px-4 rounded-lg bg-zinc-950 text-white text-[10px] font-black uppercase tracking-tight hover:bg-zinc-900 transition-all flex items-center gap-2 border border-zinc-800 shadow-xl shadow-zinc-950/20"
        >
          ADD RESOURCE +
        </button>
      </div>
      
      <div className="p-0">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-zinc-50/30 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 italic">
            <tr>
              <th className="px-6 py-3">Operational Resource / Tooling</th>
              <th className="px-6 py-3 text-center">Qty Required</th>
              <th className="px-6 py-3 text-right">Unit Rate (₹)</th>
              <th className="px-6 py-3 text-right">Batch Total (₹)</th>
              <th className="px-6 py-3 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {item.tooling.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">No specific tooling or jigs allocated to this part registry</span>
                </td>
              </tr>
            ) : item.tooling.map(t => (
              <ToolingResourceRow 
                key={t.id} 
                tooling={t} 
                libraries={libraries}
                onUpdate={(updates) => updateTooling(t.id, updates)}
                onRemove={() => removeTooling(t.id)}
              />
            ))}
          </tbody>
          {item.tooling.length > 0 && (
             <tfoot>
                <tr className="bg-zinc-50/20 border-t border-zinc-100 transition-colors hover:bg-zinc-50/40">
                   <td colSpan="3" className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Operational Resource Total</td>
                   <td className="px-6 py-4 text-right">
                      <span className="text-[13px] font-black text-zinc-950 font-mono tracking-tighter shadow-sm-inset bg-white px-2 py-0.5 rounded border border-zinc-100">
                         ₹{item.tooling.reduce((acc, t) => acc + (parseFloat(t.rate || 0) * (t.qty || 1)), 0).toFixed(2)}
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

const OperationalTooling = ({
  activePhase,
  setActivePhase,
  formData,
  setFormData,
  libraries,
  panelIndex = 5
}) => {
  const updateItem = (idx, updates) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], ...updates };
      return { ...prev, items: newItems };
    });
  };

  const isExpanded = activePhase === 'tooling';

  return (
    <section className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-zinc-300 shadow-xl ring-1 ring-zinc-200/50' : 'border-zinc-200 shadow-sm'}`}>
       <header 
         onClick={() => setActivePhase(isExpanded ? '' : 'tooling')}
         className={`px-6 py-5 border-b cursor-pointer flex justify-between items-center group transition-colors ${isExpanded ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
       >
          <div className="flex items-center gap-3">
             <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black border transition-all duration-300 ${isExpanded ? 'bg-zinc-950 border-zinc-950 text-white scale-110 shadow-lg shadow-zinc-950/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-700'}`}>Operational Tooling & Consumables</h3>
          </div>
          <div className="flex items-center gap-4">
             <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-zinc-950' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
       </header>
       <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-6 bg-zinc-50/10">
             {formData.items.map((item, idx) => (
                <PartToolingBlock 
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

export default OperationalTooling;
