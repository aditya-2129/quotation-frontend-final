import React from 'react';

const ScopeAndIdentity = ({ 
  formData, 
  setFormData, 
  activeQuote, 
  setActiveQuote, 
  libraries, 
  activePhase, 
  setActivePhase, 
  setIsQuickAddOpen,
  customerSearch,
  setCustomerSearch,
  isDropdownOpen,
  setIsDropdownOpen,
  selectedItemIndex,
  setSelectedItemIndex,
  panelIndex = 1
}) => {
  return (
     <section className={`bg-white rounded-2xl border transition-all duration-300 ${activePhase === 'scope' ? 'border-zinc-300 shadow-md ring-1 ring-zinc-200' : 'border-zinc-200'}`}>
       <header 
         className={`px-6 py-5 border-b flex justify-between items-center group rounded-t-2xl cursor-pointer transition-colors ${activePhase === 'scope' ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
         onClick={() => setActivePhase(activePhase === 'scope' ? '' : 'scope')}
       >
          <div className="flex items-center gap-3">
             <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black border transition-all duration-300 ${activePhase === 'scope' ? 'bg-zinc-950 border-zinc-950 text-white shadow-lg shadow-zinc-950/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${activePhase === 'scope' ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-700'}`}>Scope & Identity</h3>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={(e) => { e.stopPropagation(); setIsQuickAddOpen(true); }}
               className="h-9 px-5 rounded-xl bg-zinc-950 text-white text-[11px] font-black uppercase tracking-tight shadow-xl shadow-zinc-950/20 transition-all hover:bg-zinc-900 active:scale-95 flex items-center justify-center border border-zinc-800"
             >
               NEW CLIENT +
             </button>
             <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-300 ${activePhase === 'scope' ? 'rotate-180 text-zinc-950' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
       </header>
       <div className={`transition-all duration-300 ${activePhase === 'scope' ? 'max-h-[3000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-5 grid grid-cols-4 gap-x-6 gap-y-4 items-start">
             {/* Row 1: Personnel & Reach */}
             <div className="relative z-50">
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Organization Registry</label>
                <div className="relative group">
                   <input 
                     type="text"
                     className="w-full h-9.5 pl-4 pr-10 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[13px] placeholder:text-zinc-400 placeholder:font-normal shadow-sm"
                     placeholder="Search Registry..."
                     value={customerSearch || ""}
                     onFocus={() => setIsDropdownOpen(true)}
                     onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setIsDropdownOpen(true);
                     }}
                   />
                   <div className="absolute right-3 top-3 text-zinc-400 group-focus-within:text-zinc-950 transition-colors pointer-events-none">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   </div>

                   {isDropdownOpen && (
                      <>
                         <div className="fixed inset-0 z-[60]" onClick={() => setIsDropdownOpen(false)} />
                         <div className="absolute left-0 right-0 top-12 z-[70] mt-1 bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-1 px-2 border-b border-zinc-50 bg-zinc-50/50 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Matching Registry Records</div>
                            {libraries.customers
                               .filter(c => c.name.toLowerCase().includes((customerSearch || "").toLowerCase()))
                               .length === 0 ? (
                                  <div className="p-6 text-center">
                                     <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">No Match Found</div>
                                     <button 
                                       onClick={() => setIsQuickAddOpen(true)}
                                       className="h-8 px-4 rounded bg-zinc-950 text-white text-[11px] font-black uppercase transition-all shadow-lg active:scale-95"
                                     >
                                        REGISTER NEW CLIENT
                                     </button>
                                  </div>
                               ) : (
                                  libraries.customers
                                     .filter(c => c.name.toLowerCase().includes((customerSearch || "").toLowerCase()))
                                     .map(c => (
                                        <button 
                                          key={c.$id}
                                          onClick={() => {
                                             setActiveQuote({...activeQuote, customer: c});
                                             setFormData({
                                                ...formData, 
                                                supplier_name: c.name,
                                                contact_person: c.contact_person || formData.contact_person,
                                                contact_phone: c.phone || formData.contact_phone,
                                                contact_email: c.email || formData.contact_email
                                             });
                                             setCustomerSearch(c.name);
                                             setIsDropdownOpen(false);
                                          }}
                                          className="w-full text-left px-4 py-3 text-[13px] font-semibold text-zinc-900 hover:bg-zinc-50 hover:text-black transition-colors border-b border-zinc-50 last:border-0"
                                        >
                                           <div className="flex items-center gap-3">
                                              <span className="h-6 w-6 rounded bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-500 font-bold">{c.name.charAt(0)}</span>
                                              {c.name}
                                           </div>
                                        </button>
                                     ))
                               )
                            }
                         </div>
                      </>
                   )}
                </div>
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Contact Person</label>
                   <input 
                     type="text"
                     className="w-full h-9.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[13px] shadow-sm"
                  placeholder="Personnel Name"
                  value={formData.contact_person || ""}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Contact Number</label>
                <input 
                  type="text"
                  className="w-full h-9.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[13px] shadow-sm font-mono"
                  placeholder="+91..."
                  value={formData.contact_phone || ""}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Email Address</label>
                <input 
                  type="email"
                  className="w-full h-9.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[13px] shadow-sm"
                  placeholder="engineering@client.com"
                  value={formData.contact_email || ""}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                />
             </div>

             {/* Row 2: Management & Reference */}
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Quoting Engineer</label>
                   <input 
                     type="text"
                     className="w-full h-9.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[13px] shadow-sm"
                  placeholder="Engineer Name"
                  value={formData.quoting_engineer || ""}
                  onChange={(e) => setFormData({...formData, quoting_engineer: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Revision Number</label>
                <input 
                  type="text"
                  className="w-full h-9.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[13px] shadow-sm font-mono"
                  placeholder="Rev 00"
                  value={formData.revision_no || ""}
                  onChange={(e) => setFormData({...formData, revision_no: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Quotation ID</label>
                <div className="h-9.5 flex items-center px-4 bg-zinc-100/30 rounded-lg text-amber-700 font-mono text-[13px] font-semibold border border-amber-200/50 shadow-sm-inset transition-all tracking-tight">
                   {formData.quotation_no || 'GENERATING...'}
                </div>
             </div>

             {/* Row 3: Logistics & Timing */}
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Inquiry Date</label>
                <input 
                  type="date"
                  className="w-full h-9.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[13px] shadow-sm"
                  value={formData.inquiry_date || ""}
                  onChange={(e) => setFormData({...formData, inquiry_date: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Target Delivery Date</label>
                <input 
                  type="date"
                  className="w-full h-9.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[13px] shadow-sm"
                  value={formData.delivery_date || ""}
                  onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Global Quantity</label>
                <input 
                  type="number"
                  className="w-full h-9.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-mono font-semibold text-black text-[13px] shadow-sm"
                  value={formData.quantity ?? 0}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Production Mode</label>
                <select 
                  className="w-full h-9.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[13px] shadow-sm appearance-none cursor-pointer"
                  value={formData.production_mode || "Batch"}
                  onChange={(e) => setFormData({...formData, production_mode: e.target.value})}
                >
                   <option value="Prototype">Prototype</option>
                   <option value="Batch">Batch / Lot</option>
                   <option value="Production">Mass Production</option>
                </select>
             </div>
          </div>
       </div>
    </section>
  );
};

export default ScopeAndIdentity;
