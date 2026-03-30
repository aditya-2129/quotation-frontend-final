import React, { useState } from 'react';
import { assetService } from '@/services/assets';

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
     <section className={`bg-white rounded-xl border transition-all duration-300 ${activePhase === 'scope' ? 'border-zinc-300 shadow-md ring-1 ring-zinc-200' : 'border-zinc-200'}`}>
        <header 
          className={`h-[52px] px-5 border-b flex justify-between items-center group rounded-t-xl cursor-pointer transition-colors ${activePhase === 'scope' ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
          onClick={() => setActivePhase(activePhase === 'scope' ? '' : 'scope')}
        >
          <div className="flex items-center gap-3">
             <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black border transition-all duration-300 ${activePhase === 'scope' ? 'bg-brand-primary border-brand-primary text-zinc-950 shadow-lg shadow-brand-primary/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
             <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors ${activePhase === 'scope' ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-brand-primary'}`}>Project Information</h3>
          </div>
          <div className="flex items-center gap-4">
             <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-300 ${activePhase === 'scope' ? 'rotate-180 text-brand-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
       </header>
       <div className={`transition-all duration-300 ${activePhase === 'scope' ? 'max-h-[3000px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="p-3 grid grid-cols-4 gap-x-4 gap-y-2.5 items-start">
             {/* Row 1: Personnel & Reach */}
             <div className="relative z-50">
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-1.5 flex items-center gap-1">
                   Organization / Customer
                </label>
                 <div className="relative group">
                    <input 
                      type="text"
                      className="w-full h-8.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[12.5px] shadow-sm"
                      placeholder="Search or Type Customer..."
                      value={customerSearch || ""}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                         const val = e.target.value;
                         setCustomerSearch(val);
                         setFormData(prev => ({ ...prev, supplier_name: val, customer: null }));
                         setIsDropdownOpen(true);
                      }}
                    />
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {customerSearch && (
                           <button 
                             type="button"
                             onClick={() => {
                                setCustomerSearch("");
                                setFormData(prev => ({ ...prev, supplier_name: "", customer: null }));
                                setIsDropdownOpen(false);
                             }}
                             className="text-zinc-300 hover:text-zinc-500 transition-colors"
                           >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                           </button>
                        )}
                        <div className="text-zinc-400 group-focus-within:text-brand-primary transition-colors pointer-events-none">
                           <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2.5} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                     </div>
                   {isDropdownOpen && (
                      <>
                         <div className="fixed inset-0 z-[60]" onClick={() => setIsDropdownOpen(false)} />
                         <div className="absolute left-0 right-0 top-full mt-1.5 z-[70] bg-white border border-zinc-200 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                            <div className="sticky top-0 bg-zinc-50 p-2 px-3 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.15em] flex justify-between items-center z-10">
                               <span>Available Customer Records</span>
                               <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                            </div>
                            <div className="divide-y divide-zinc-50">
                               {(() => {
                                  const s = (customerSearch || "").toLowerCase();
                                  const filtered = libraries.customers.filter(c => 
                                     (c.name || "").toLowerCase().includes(s) || 
                                     (c.contact_person || "").toLowerCase().includes(s) ||
                                     (c.email || "").toLowerCase().includes(s) ||
                                     (c.phone || "").toLowerCase().includes(s)
                                  );

                                  if (filtered.length === 0) {
                                     return (
                                        <div className="p-8 text-center bg-zinc-50/20">
                                           <div className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                              <svg className="h-5 w-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                           </div>
                                           <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">No matching records</div>
                                           <button 
                                             onClick={() => setIsQuickAddOpen(true)}
                                             className="h-8 px-5 rounded-lg bg-brand-primary text-zinc-950 text-[10px] font-black uppercase transition-all shadow-lg shadow-brand-primary/25 hover:scale-105 active:scale-95"
                                           >
                                              + Add New Customer
                                           </button>
                                        </div>
                                     );
                                  }

                                  return filtered.map(c => (
                                     <button 
                                       key={c.$id}
                                       onClick={() => {
                                          setActiveQuote({...activeQuote, customer: c});
                                          setFormData(prev => ({
                                             ...prev, 
                                             supplier_name: c.name,
                                             contact_person: c.contact_person || prev.contact_person,
                                             contact_phone: c.phone || prev.contact_phone,
                                             contact_email: c.email || prev.contact_email
                                          }));
                                          setCustomerSearch(c.name);
                                          setIsDropdownOpen(false);
                                       }}
                                       className="w-full text-left px-4 py-3.5 hover:bg-zinc-50 transition-all group/item relative overflow-hidden"
                                     >
                                        <div className="flex items-center gap-3 relative z-10">
                                           <span className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-[12px] text-zinc-500 font-black group-hover/item:bg-brand-primary group-hover/item:text-zinc-950 transition-colors shadow-sm">{c.name.charAt(0)}</span>
                                           <div className="flex flex-col">
                                              <span className="text-[13px] font-bold text-zinc-900 group-hover/item:text-black transition-colors">{c.name}</span>
                                              {c.contact_person && (
                                                 <span className="text-[9px] font-medium text-zinc-400 group-hover/item:text-zinc-500">Contact: {c.contact_person}</span>
                                              )}
                                           </div>
                                           <div className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity">
                                              <svg className="h-4 w-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                           </div>
                                        </div>
                                     </button>
                                  ));
                               })()}
                            </div>
                         </div>
                      </>
                   )}
                </div>
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-1.5 flex items-center gap-1">
                   Contact Person Name
                   <span className="text-red-500 font-black">*</span>
                </label>
                   <input 
                     type="text"
                     required
                     className="w-full h-8.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[12.5px] shadow-sm"
                  placeholder="Personnel Name"
                  value={formData.contact_person || ""}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-1.5 flex items-center gap-1">
                   Contact Number
                   <span className="text-red-500 font-black">*</span>
                </label>
                <input 
                  type="tel"
                  required
                  maxLength="10"
                  className="w-full h-8.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[12.5px] shadow-sm font-mono"
                  placeholder="10-digit number..."
                  value={formData.contact_phone || ""}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value.replace(/\D/g, '')})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-1.5 flex items-center gap-1">
                   Contact Email
                   <span className="text-red-500 font-black">*</span>
                </label>
                <input 
                  type="email"
                  required
                  className="w-full h-8.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[12.5px] shadow-sm"
                  placeholder="engineering@client.com"
                  value={formData.contact_email || ""}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                />
             </div>

             {/* Row 2: Reference & Timeline */}
             <div>
                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-[0.12em] leading-none mb-1.5">Quotation ID</label>
                <div className="h-8.5 flex items-center px-4 bg-zinc-100/30 rounded-lg text-amber-700 font-mono text-[12.5px] font-semibold border border-amber-200/50 shadow-sm-inset transition-all tracking-tight">
                   {formData.quotation_no || 'GENERATING...'}
                </div>
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-1.5 flex items-center gap-1">
                   Quotation Version
                   <span className="text-red-500 font-black">*</span>
                </label>
                <div className="h-8.5 flex items-center px-4 bg-zinc-100/50 rounded-lg text-zinc-950 font-mono text-[12.5px] font-bold border border-zinc-200/50 shadow-sm transition-all tracking-tight cursor-not-allowed">
                   {formData.revision_no || 'Rev 1'}
                </div>
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-1.5 flex items-center gap-1">
                   Date Received
                   <span className="text-red-500 font-black">*</span>
                </label>
                <input 
                  type="date"
                  required
                  className="w-full h-8.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[12.5px] shadow-sm"
                  value={formData.inquiry_date || ""}
                  onChange={(e) => setFormData({...formData, inquiry_date: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-1.5 flex items-center gap-1">
                   Expected Delivery Date
                   <span className="text-red-500 font-black">*</span>
                </label>
                <input 
                  type="date"
                  required
                  className="w-full h-8.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[12.5px] shadow-sm"
                  value={formData.delivery_date || ""}
                  onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                />
             </div>

             {/* Row 3: Admin & Logistics */}
             <div>
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-1.5 flex items-center gap-1">
                   Project Incharge
                   <span className="text-red-500 font-black">*</span>
                </label>
                <input 
                   type="text"
                   required
                   className="w-full h-8.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[12.5px] shadow-sm"
                   placeholder="HOD / Lead Name"
                   value={formData.quoting_engineer || ""}
                   onChange={(e) => setFormData({...formData, quoting_engineer: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-1.5 flex items-center gap-1">
                   Quantity to Make (Total)
                   <span className="text-red-500 font-black">*</span>
                </label>
                <input 
                  type="number"
                  required
                  min="1"
                  className="w-full h-8.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-mono font-semibold text-black text-[13px] shadow-sm"
                  value={formData.quantity ?? 1}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                />
             </div>
             <div>
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-1.5 flex items-center gap-1">
                   Type of Project
                   <span className="text-red-500 font-black">*</span>
                </label>
                <select 
                  className="w-full h-8.5 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all font-semibold text-black text-[12.5px] shadow-sm appearance-none cursor-pointer"
                  value={formData.production_mode || "Batch"}
                  onChange={(e) => setFormData({...formData, production_mode: e.target.value})}
                >
                   <option value="Prototype">Prototype</option>
                   <option value="Batch">Batch / Lot</option>
                   <option value="Production">Mass Production</option>
                </select>
             </div>

             {/* Row 4: Project Snapshot / Model Image */}
             <div className="col-span-4 mt-4 pt-4 border-t border-zinc-100">
                <label className="block text-[9px] font-bold text-zinc-950 uppercase tracking-[0.12em] leading-none mb-3 flex items-center gap-1">
                   PROJECT MODEL / SNAPSHOT 
                   <span className="text-red-500 font-black">*</span>
                   <span className="ml-2 text-[8px] font-medium text-zinc-400 normal-case italic">(Clear technical image or 3D snapshot required)</span>
                </label>
                
                <div className="flex items-start gap-4">
                   <div className="relative group/upload h-28 w-44 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 flex flex-col items-center justify-center transition-all hover:bg-white hover:border-brand-primary/50 overflow-hidden shadow-sm-inset text-center">
                      {formData.project_image ? (
                         <div className="absolute inset-0 group/img">
                            <img 
                              src={formData.project_image.$id ? assetService.getFilePreview(formData.project_image.$id) : ""} 
                              alt="Project Model" 
                              className="h-full w-full object-cover transition-transform group-hover/img:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                               <button 
                                 type="button"
                                 onClick={() => setFormData({...formData, project_image: null})}
                                 className="h-8 w-8 rounded-full bg-white text-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-all active:scale-95"
                               >
                                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                            </div>
                         </div>
                      ) : (
                         <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2">
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={async (e) => {
                                 const file = e.target.files[0];
                                 if (!file) return;
                                 try {
                                    const uploaded = await assetService.uploadFile(file);
                                    setFormData({...formData, project_image: uploaded});
                                 } catch (err) {
                                    console.error("Upload failed:", err);
                                 }
                              }}
                            />
                            <div className="h-10 w-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover/upload:text-brand-primary group-hover/upload:border-brand-primary/20 transition-all shadow-sm mb-2">
                               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter group-hover/upload:text-brand-primary transition-colors">Select Model Image</span>
                         </label>
                      )}
                   </div>
                   
                   <div className="flex-1 space-y-3 py-2">
                      <div className="flex items-center gap-2">
                         <div className={`h-2 w-2 rounded-full ${formData.project_image ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-red-500 shadow-lg shadow-red-500/30'}`} />
                         <span className={`text-[10px] font-black uppercase tracking-widest ${formData.project_image ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formData.project_image ? 'Image Registered' : 'Image Missing (Required)'}
                         </span>
                      </div>
                      <p className="max-w-[400px] text-[11px] font-semibold text-zinc-400 italic leading-snug">
                         Please upload a clear high-resolution image of the 3D model or technical drawing. This image will appear in the final quotation document and serve as the project reference.
                      </p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
};

export default ScopeAndIdentity;
