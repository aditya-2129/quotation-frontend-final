import React, { useState, useEffect } from 'react';
import { assetService } from '@/services/assets';

const BOPItemRow = ({ item, quantity, libraries, onUpdate, onRemove }) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [serverBOP, setServerBOP] = useState([]);

  const libRef = libraries.bop?.find(b => b.item_name === item.item_name);
  const unitLabel = libRef?.unit || item.unit || 'pcs';

  // Server-side BOP Search (handles large datasets)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
       if (search.trim().length >= 2) {
          try {
             const { bopRateService } = await import('@/services/rates');
             const res = await bopRateService.listRates(50, 0, search);
             setServerBOP(res.documents);
          } catch (err) {
             console.error("BOP search failed:", err);
          }
       } else {
          setServerBOP([]);
       }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const displayBOP = serverBOP.length > 0 ? serverBOP : (libraries.bop || []).filter(b => 
    (b.item_name || "").toLowerCase().includes(search.toLowerCase()) || 
    (b.supplier || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <tr className="group hover:bg-zinc-50/50 transition-colors border-b border-zinc-100 last:border-0">
      <td className="px-3 pt-3 pb-5 align-top">
        <div className="flex flex-col relative">
           <div className="relative group/search">
              <input 
                type="text"
                className={`h-8.5 w-full px-3 pr-8 rounded-lg bg-zinc-50 border border-zinc-200 text-[11.5px] font-black outline-none focus:bg-white focus:ring-2 focus:ring-brand-primary/50 transition-all shadow-sm ${!isOpen && item.item_name && item.item_name !== 'CUSTOM' ? 'text-zinc-950 font-black' : 'text-zinc-900 font-bold placeholder:text-zinc-300'}`}
                placeholder={item.item_name && item.item_name !== 'CUSTOM' ? item.item_name : "Search Library..."}
                value={!isOpen && item.item_name && item.item_name !== 'CUSTOM' ? item.item_name : search}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300">
                 <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
           </div>

           {isOpen && (
              <>
                 <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                 <div className="absolute left-0 right-0 top-full mt-1.5 z-[70] bg-white border border-zinc-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] max-h-56 overflow-y-auto animate-in slide-in-from-top-1 duration-200 ring-1 ring-black/5 divide-y divide-zinc-50 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                    <button 
                      onClick={() => { onUpdate({ item_name: 'CUSTOM', isManual: true, rate: 0, unit: 'pcs' }); setSearch(""); setIsOpen(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-zinc-50 transition-colors flex items-center gap-2 border-b border-dashed border-zinc-100"
                    >
                       <div className="h-5 w-5 rounded bg-zinc-100 flex items-center justify-center text-[14px] text-zinc-400 font-black">+</div>
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tight italic">-- Manual Direct Entry --</span>
                    </button>
                    
                    {displayBOP.length === 0 ? (
                       <div className="p-4 text-center">
                          <span className="text-[9px] font-bold text-zinc-400 uppercase italic">No items found</span>
                       </div>
                    ) : (
                       displayBOP.map(b => (
                          <button 
                             key={b.$id}
                             onClick={() => {
                                onUpdate({ item_name: b.item_name, isManual: false, rate: b.rate || 0, unit: b.unit || 'pcs' });
                                setSearch("");
                                setIsOpen(false);
                             }}
                             className="w-full px-3 py-2.5 text-left hover:bg-brand-primary/5 transition-colors group/item"
                          >
                             <div className="flex flex-col">
                                <span className="text-[11px] font-black text-zinc-900 group-hover/item:text-brand-primary transition-colors">{b.item_name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                   <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{b.supplier || 'Standard Supply'}</span>
                                   <div className="h-1 w-1 rounded-full bg-zinc-300" />
                                   <span className="text-[9px] font-black text-brand-primary italic">₹{b.rate}</span>
                                </div>
                             </div>
                          </button>
                       ))
                    )}
                 </div>
              </>
           )}

          {item.isManual && (
             <input 
               type="text"
               autoFocus
               className="mt-2 h-8 w-full px-3 rounded-lg bg-white border border-brand-primary/30 text-[11px] font-black outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono placeholder:text-zinc-300"
               placeholder="Specify custom item name..."
               value={item.item_name === 'CUSTOM' ? "" : item.item_name}
               onChange={(e) => onUpdate({ item_name: e.target.value })}
             />
          )}
           
          <div className="h-3.5 invisible" />
        </div>
      </td>
      {/* Qty Needed */}
      <td className="px-2 pt-3 pb-5 align-top">
        <div className="flex flex-col">
          <input 
            type="number" 
            step="0.01"
            disabled={!item.item_name || item.item_name === 'CUSTOM'}
            className={`h-8 w-full rounded-lg border text-center text-[11px] outline-none font-mono font-black transition-all ${(!item.item_name || item.item_name === 'CUSTOM') ? 'bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed' : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-brand-primary/20'}`}
            value={item.qty ?? 1}
            onChange={(e) => onUpdate({ qty: parseFloat(e.target.value) || 0 })}
          />
          <div className="h-3 flex items-center justify-center">
            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.15em] shrink-0">{unitLabel}</span>
          </div>
        </div>
      </td>
      {/* Buying Price */}
      <td className="px-2 pt-3 pb-5 align-top">
        <div className="flex flex-col">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold">₹</span>
            <input 
              type="number" 
              step="0.01"
              disabled={!item.item_name || item.item_name === 'CUSTOM'}
              className={`h-8 w-full pl-5 pr-2 rounded-lg border text-center text-[11px] outline-none font-mono font-black transition-all ${(!item.item_name || item.item_name === 'CUSTOM') ? 'bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed' : 'bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-brand-primary/20'}`}
              value={item.rate ?? 0}
              onChange={(e) => onUpdate({ rate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="h-3 flex items-center justify-center">
            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.15em] shrink-0">Per {unitLabel}</span>
          </div>
        </div>
      </td>
      <td className="px-3 pt-3 pb-5 text-right align-top">
        <div className="font-black text-zinc-950 font-mono text-[13px] leading-tight">
          ₹{(parseFloat(item.rate || 0) * (item.qty || 1) * quantity).toFixed(2)}
        </div>
        {quantity > 1 && (
          <div className="text-[8px] text-zinc-400 font-bold font-mono italic tracking-tighter mt-0.5">
             ₹{(parseFloat(item.rate || 0) * (item.qty || 1)).toFixed(2)} / unit
          </div>
        )}
      </td>
      <td className="px-2 pt-3 pb-5 text-center align-top">
        <button onClick={onRemove} className="h-7 w-7 text-zinc-200 hover:text-red-500 transition-colors rounded hover:bg-red-50 flex items-center justify-center mx-auto">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </td>
    </tr>
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
  const isExpanded = activePhase === 'bop';

  const addBOP = () => {
    setFormData(prev => ({
      ...prev,
      bought_out_items: [...(prev.bought_out_items || []), { id: Date.now(), item_name: '', rate: 0, qty: 1, unit: 'pcs' }]
    }));
  };

  const removeBOP = (id) => {
    setFormData(prev => ({
      ...prev,
      bought_out_items: (prev.bought_out_items || []).filter(i => i.id !== id)
    }));
  };

  const updateBOP = (id, updates) => {
    setFormData(prev => ({
      ...prev,
      bought_out_items: (prev.bought_out_items || []).map(i => i.id === id ? { ...i, ...updates } : i)
    }));
  };

  const totalCost = (formData.bought_out_items || []).reduce((acc, i) => acc + (parseFloat(i.rate || 0) * (i.qty || 1)), 0);

  return (
    <section className={`bg-white rounded-xl border transition-all duration-300 ${isExpanded ? 'border-zinc-300 shadow-xl ring-1 ring-zinc-200/50 overflow-visible' : 'border-zinc-200 shadow-sm overflow-hidden'}`}>
       <header 
         onClick={() => setActivePhase(isExpanded ? '' : 'bop')}
         className={`h-[52px] px-5 border-b cursor-pointer flex justify-between items-center group transition-colors ${isExpanded ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
       >
          <div className="flex items-center gap-3">
             <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black border transition-all duration-300 ${isExpanded ? 'bg-brand-primary border-brand-primary text-zinc-950 scale-110 shadow-lg shadow-brand-primary/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-brand-primary'}`}>Additional Purchased Items</h3>
          </div>
          <div className="flex items-center gap-4">
             <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border italic animate-in slide-in-from-right-2 duration-300 ${
               formData.bought_out_items?.length > 0
                 ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                 : 'text-brand-primary bg-brand-primary/10 border-brand-primary/10'
             }`}>
                {formData.bought_out_items?.length > 0
                  ? 'ITEMS ALLOCATED'
                  : 'BOP PENDING'}
             </span>
             <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-brand-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
       </header>
       <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-2.5 bg-zinc-50/10">
            <div className="border border-zinc-200 rounded-xl bg-white shadow-sm overflow-visible">
              <div className="px-4 py-2.5 bg-zinc-50/50 border-b border-zinc-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-lg bg-brand-primary text-zinc-950 flex items-center justify-center text-[10px] font-black shadow-lg shadow-brand-primary/20">
                     ALL
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black text-brand-primary uppercase tracking-tight">Project-Wide Consumables</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.1em] italic font-mono leading-none">Purchased items for entire unit</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={addBOP}
                  className="h-8 px-4 rounded-lg bg-brand-primary text-zinc-950 text-[10px] font-black uppercase tracking-tight hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/25 border border-brand-primary/20"
                >
                  ADD ITEM +
                </button>
              </div>

              {/* Table */}
              <div className="p-0 overflow-visible">
                <table className="w-full text-left text-sm border-collapse table-fixed">
                  <colgroup>
                    <col className="w-[38%]" />
                    <col className="w-[13%]" />
                    <col className="w-[15%]" />
                    <col className="w-[22%]" />
                    <col className="w-[12%]" />
                  </colgroup>
                  <thead className="bg-zinc-50/30 text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 italic">
                    <tr>
                       <th className="px-4 py-2.5 whitespace-nowrap">Item Description <span className="text-red-500 font-extrabold">*</span></th>
                       <th className="px-3 py-2.5 text-center whitespace-nowrap">Qty Needed <span className="text-red-500 font-extrabold">*</span></th>
                       <th className="px-3 py-2.5 text-center whitespace-nowrap">Buying Price <span className="text-red-500 font-extrabold">*</span></th>
                       <th className="px-4 py-2.5 text-right whitespace-nowrap">Total Cost (₹)</th>
                      <th className="px-2 py-2.5 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {!formData.bought_out_items || formData.bought_out_items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center">
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em] italic">No project-wide items added</span>
                        </td>
                      </tr>
                    ) : formData.bought_out_items.map(i => (
                      <BOPItemRow 
                        key={i.id} 
                        item={i} 
                        libraries={libraries}
                        quantity={1} // Whole unit context
                        onUpdate={(updates) => updateBOP(i.id, updates)}
                        onRemove={() => removeBOP(i.id)}
                      />
                    ))}
                  </tbody>
                  {formData.bought_out_items?.length > 0 && (
                    <tfoot>
                      <tr className="bg-zinc-50/20 border-t border-zinc-100">
                         <td colSpan="3" className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Total Purchased Cost</td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-black text-zinc-950 font-mono text-[13px] italic leading-tight">
                            ₹{totalCost.toFixed(2)}
                          </div>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
       </div>
    </section>
  );
};

export default BroughtOutParts;
