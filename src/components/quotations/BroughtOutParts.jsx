import React from 'react';

const BOPItemRow = ({ item, quantity, libraries, onUpdate, onRemove }) => {
  // Find unit from library or default to pcs
  const libRef = libraries.bop?.find(b => b.item_name === item.item_name);
  const unitLabel = libRef?.unit || item.unit || 'pcs';

  return (
    <tr className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0">
      <td className="px-6 py-4">
        <select 
          className="h-10 w-full px-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-black outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 transition-all font-mono"
          value={item.item_name || ""}
          onChange={(e) => {
             const ref = libraries.bop.find(b => b.item_name === e.target.value);
             onUpdate({ item_name: e.target.value, rate: ref?.rate || 0, unit: ref?.unit || 'pcs' });
          }}
        >
           <option value="">Search Parts to Buy...</option>
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
        <div className="flex flex-col items-center">
           <input 
             type="number" 
             className="h-10 w-24 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs outline-none focus:bg-white font-mono font-black"
             value={item.qty ?? 1}
             onChange={(e) => onUpdate({ qty: parseFloat(e.target.value) || 1 })}
           />
           <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1 italic">{unitLabel}</span>
        </div>
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
          <div className="absolute -bottom-4 right-0 text-[8px] text-zinc-400 font-black uppercase tracking-tighter italic">PER {unitLabel.toUpperCase()}</div>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="font-black text-zinc-950 font-mono text-[13px] leading-tight">
          ₹{(parseFloat(item.rate || 0) * (item.qty || 1) * quantity).toFixed(2)}
        </div>
        <div className="text-[9px] text-zinc-400 font-bold font-mono italic tracking-tighter opacity-80 mt-0.5 whitespace-nowrap">
           ₹{(parseFloat(item.rate || 0) * (item.qty || 1)).toFixed(2)} / UNIT
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
    const newBOP = [...(part.bought_out_items || []), { id: Date.now(), item_name: '', rate: 0, qty: 1, unit: 'pcs' }];
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
          <div className="h-8 w-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-[10px] font-black italic">
             {String(idx + 1).padStart(2, '0')}
          </div>
          <div>
            <h4 className="text-[13px] font-black text-zinc-950 uppercase tracking-tight">{part.part_name}</h4>
             <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.15em] italic font-mono leading-none">Buying List for this Part</span>
          </div>
        </div>
        <button 
          onClick={addBOP}
          className="h-8 px-5 rounded-lg bg-zinc-950 text-white text-[10px] font-black uppercase tracking-tight hover:bg-zinc-900 transition-all flex items-center gap-2"
        >
          Add Item +
        </button>
      </div>

      <div className="p-0">
        <table className="w-full text-left text-sm border-collapse table-fixed">
          <thead className="bg-zinc-50/30 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 italic">
            <tr>
               <th className="px-6 py-4 w-[40%]">Item Description <span className="text-red-500 font-extrabold">*</span></th>
               <th className="px-6 py-4 text-center w-[15%]">Qty Needed <span className="text-red-500 font-extrabold">*</span></th>
               <th className="px-6 py-4 text-center w-[20%]">Buying Price <span className="text-red-500 font-extrabold">*</span></th>
               <th className="px-6 py-4 text-right w-[20%]">Total Cost (₹)</th>
              <th className="px-6 py-3 text-center w-[5%]"></th>
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
                 <td colSpan="3" className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total Purchased Cost</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[14px] font-black text-zinc-950 font-mono leading-tight">
                      ₹{part.bought_out_items.reduce((acc, i) => acc + (parseFloat(i.rate || 0) * (i.qty || 1) * (part.qty || 1)), 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 font-mono italic tracking-tighter opacity-80 mt-1">
                      ₹{part.bought_out_items.reduce((acc, i) => acc + (parseFloat(i.rate || 0) * (i.qty || 1)), 0).toFixed(2)} / UNIT TOTAL
                    </span>
                  </div>
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
  panelIndex = 5
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
             <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black border transition-all duration-300 ${isExpanded ? 'bg-zinc-950 border-zinc-950 text-white scale-110 shadow-lg shadow-zinc-950/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-700'}`}>Additional Purchased Items</h3>
          </div>
          <div className="flex items-center gap-4">
             {formData.items.some(it => it.bought_out_items?.length > 0) && !isExpanded && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 uppercase tracking-tighter">Items Allocated</span>
             )}
             <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-zinc-950' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
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
