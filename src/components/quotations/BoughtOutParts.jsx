import React from 'react';

const BOPItemRow = ({ item, quantity, libraries, onUpdate, onRemove }) => {
  return (
    <tr className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0">
      <td className="px-6 py-4">
        <select 
          className="h-10 w-full px-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-black outline-none focus:bg-white focus:ring-1 focus:ring-brand-primary transition-all font-mono"
          value={item.item_name || ""}
          onChange={(e) => {
             const ref = libraries.bop.find(b => b.item_name === e.target.value);
             onUpdate({ item_name: e.target.value, rate: ref?.rate || 0 });
          }}
        >
          <option value="">Select Item from Library...</option>
          {libraries.bop?.map(b => (
             <option key={b.$id} value={b.item_name}>{b.item_name} {b.supplier ? `(${b.supplier})` : ''}</option>
          ))}
          <option value="CUSTOM">-- Manual Entry --</option>
        </select>
        {item.item_name === 'CUSTOM' && (
           <input 
             type="text"
             className="mt-2 h-9 w-full px-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-bold outline-none focus:bg-white"
             placeholder="Enter Custom Part Description..."
             onChange={(e) => onUpdate({ item_name: e.target.value })}
           />
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <input 
          type="number" 
          className="h-10 w-24 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
          value={item.qty ?? 1}
          onChange={(e) => onUpdate({ qty: parseFloat(e.target.value) || 1 })}
        />
      </td>
      <td className="px-6 py-4 text-center">
        <div className="relative group/rate inline-block">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">₹</span>
          <input 
            type="number" 
            className="h-10 w-28 pl-6 pr-2 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
            value={item.rate ?? 0}
            onChange={(e) => onUpdate({ rate: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="font-black text-zinc-950 font-mono text-[13px]">
          ₹{(parseFloat(item.rate || 0) * (item.qty || 1) * quantity).toFixed(2)}
        </div>
        <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter italic">
          Batch Value Integration
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <button onClick={onRemove} className="h-8 w-8 text-zinc-200 hover:text-red-500 transition-colors rounded-md hover:bg-red-50 flex items-center justify-center">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </td>
    </tr>
  );
};

const PartBOPBlock = ({ part, idx, libraries, onUpdate }) => {
  const addBOP = () => {
    const newBOP = [...(part.bought_out_items || []), { id: Date.now(), item_name: '', rate: 0, qty: 1 }];
    onUpdate({ bought_out_items: newBOP });
  };

  const removeBOP = (id) => {
    const newBOP = part.bought_out_items.filter(i => i.id !== id);
    onUpdate({ bought_out_items: newBOP });
  };

  const updateBOP = (id, updates) => {
    const newBOP = part.bought_out_items.map(i => i.id === id ? { ...i, ...updates } : i);
    onUpdate({ bought_out_items: newBOP });
  };

  return (
    <div className="mb-8 last:mb-0 border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-6 py-4 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-brand-primary text-white flex items-center justify-center text-[10px] font-black italic shadow-lg shadow-brand-primary/20">
             {String(idx + 1).padStart(2, '0')}
          </div>
          <div>
            <h4 className="text-[13px] font-black text-brand-primary uppercase tracking-tight">{part.part_name}</h4>
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.15em] italic font-mono leading-none">External Procurement Registry</span>
          </div>
        </div>
        <button 
          onClick={addBOP}
          className="h-8 px-5 rounded-lg bg-brand-primary text-white text-[10px] font-black uppercase tracking-tight hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20"
        >
          Add Item +
        </button>
      </div>

      <div className="p-0">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-zinc-50/30 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 italic">
            <tr>
              <th className="px-6 py-4">Brought Out Material Descriptor <span className="text-red-500 font-extrabold">*</span></th>
              <th className="px-6 py-4 text-center">Qty / Part <span className="text-red-500 font-extrabold">*</span></th>
              <th className="px-6 py-4 text-center">Unit Cost (₹) <span className="text-red-500 font-extrabold">*</span></th>
              <th className="px-6 py-4 text-right">Batch Total (₹)</th>
              <th className="px-6 py-3 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {!part.bought_out_items || part.bought_out_items.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest italic">No externally procured items allocated to this engineered component.</span>
                </td>
              </tr>
            ) : part.bought_out_items.map(i => (
              <BOPItemRow 
                key={i.id} 
                item={i} 
                libraries={libraries}
                quantity={parseFloat(part.qty || 1)}
                onUpdate={(updates) => updateBOP(i.id, updates)}
                onRemove={() => removeBOP(i.id)}
              />
            ))}
          </tbody>
          {part.bought_out_items?.length > 0 && (
            <tfoot>
              <tr className="bg-zinc-50/20 border-t border-zinc-100">
                <td colSpan="3" className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Procurement Subtotal</td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[14px] font-black text-zinc-950 font-mono">
                    ₹{part.bought_out_items.reduce((acc, i) => acc + (parseFloat(i.rate || 0) * (i.qty || 1) * (part.qty || 1)), 0).toFixed(2)}
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

const BroughtOutParts = ({
  activePhase,
  setActivePhase,
  formData,
  setFormData,
  libraries,
  panelIndex = 7
}) => {
  const updateItem = (idx, updates) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], ...updates };
      return { ...prev, items: newItems };
    });
  };

  const isExpanded = activePhase === 'bop';

  return (
    <section className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-zinc-300 shadow-xl ring-1 ring-zinc-200/50' : 'border-zinc-200 shadow-sm'}`}>
       <header 
         onClick={() => setActivePhase(isExpanded ? '' : 'bop')}
         className={`px-6 py-5 border-b cursor-pointer flex justify-between items-center group transition-colors ${isExpanded ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
       >
          <div className="flex items-center gap-3">
             <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black border transition-all duration-300 ${isExpanded ? 'bg-brand-primary border-brand-primary text-zinc-950 scale-110 shadow-lg shadow-brand-primary/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-brand-primary'}`}>Purchased Components (BOP)</h3>
          </div>
          <div className="flex items-center gap-4">
             {!isExpanded && formData.items.some(it => (it.bought_out_items || []).length > 0) && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded italic animate-in slide-in-from-right-2 duration-300">
                   ITEMS ALLOCATED
                </span>
             )}
             <button 
                onClick={(e) => { e.stopPropagation(); addBOP(); }}
                className="h-9 px-5 rounded-xl bg-brand-primary text-zinc-950 text-[11px] font-black uppercase tracking-tight shadow-xl shadow-brand-primary/25 border border-brand-primary/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
             >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                ADD ITEM +
             </button>
             <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-brand-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
       </header>
       <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-6 bg-zinc-50/10">
             {formData.items.map((part, idx) => (
                <PartBOPBlock 
                   key={part.id}
                   part={part}
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

export default BroughtOutParts;
