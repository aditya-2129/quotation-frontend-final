"use client";

import React, { useState, useEffect } from 'react';
import { quotationService } from '@/services/quotations';
import { assetService } from '@/services/assets';

const QuotationPreviewModal = ({ isOpen, onClose, quotationId }) => {
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !quotationId) return;
    
    const fetchQuotation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await quotationService.getQuotation(quotationId);
        setQuote(data);
      } catch (err) {
        console.error("Failed to fetch quotation for preview:", err);
        setError("Failed to load quotation data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotation();
  }, [isOpen, quotationId]);

  if (!isOpen) return null;

  // Parse items and breakdown from JSON strings
  let items = [];
  let breakdown = {};
  let projectImage = null;

  if (quote) {
    try { items = JSON.parse(quote.items || '[]'); } catch (e) { items = []; }
    try { breakdown = JSON.parse(quote.detailed_breakdown || '{}'); } catch (e) { breakdown = {}; }
    try { projectImage = quote.project_image ? JSON.parse(quote.project_image) : null; } catch (e) { projectImage = null; }
  }

  const InfoField = ({ label, value, mono = false, highlight = false }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.12em] leading-none">{label}</span>
      <span className={`text-[13px] font-semibold ${highlight ? 'text-brand-primary' : 'text-zinc-800'} ${mono ? 'font-mono' : ''} leading-snug`}>
        {value || <span className="text-zinc-300 italic">—</span>}
      </span>
    </div>
  );

  const SectionHeader = ({ icon, title, count }) => (
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-100">
      <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
        {icon}
      </div>
      <h4 className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.15em]">{title}</h4>
      {count !== undefined && (
        <span className="ml-auto text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{count} item{count !== 1 ? 's' : ''}</span>
      )}
    </div>
  );

  const LedgerRow = ({ label, value, isBold = false }) => (
    <div className={`flex justify-between items-center py-1.5 ${isBold ? 'border-t border-zinc-700 pt-3 mt-2' : ''}`}>
      <span className={`text-[11px] ${isBold ? 'font-black text-zinc-300 uppercase tracking-wider' : 'font-bold text-zinc-500'}`}>{label}</span>
      <span className={`font-mono ${isBold ? 'text-lg font-black text-white' : 'text-[13px] font-bold text-zinc-400'}`}>
        ₹{parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-[95vw] max-w-[1400px] h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header Bar */}
        <header className="shrink-0 px-8 py-4 bg-zinc-950 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white text-[14px] font-black uppercase tracking-[0.2em]">
                {isLoading ? 'Loading...' : quote?.quotation_no || 'Quotation Preview'}
              </h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                {quote?.supplier_name || ''} • {quote?.status || ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
              quote?.status === 'Completed' ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30' :
              quote?.status === 'Pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
              'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}>
              {quote?.status || 'Draft'}
            </span>
            <button 
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-red-600 transition-all active:scale-90 border border-zinc-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg className="h-6 w-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">Fetching Quotation Data...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <span className="text-[11px] font-bold text-red-500">{error}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-zinc-50/50">
                
                {/* Section 1: Project Information */}
                <section className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                  <SectionHeader 
                    icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    title="Project Information"
                  />
                  <div className="grid grid-cols-4 gap-x-8 gap-y-5">
                    <InfoField label="Quotation ID" value={quote.quotation_no} mono highlight />
                    <InfoField label="Organization / Customer" value={quote.supplier_name} />
                    <InfoField label="Contact Person" value={quote.contact_person} />
                    <InfoField label="Contact Number" value={quote.contact_phone} mono />
                    <InfoField label="Contact Email" value={quote.contact_email} />
                    <InfoField label="Estimating Engineer" value={quote.quoting_engineer} />
                    <InfoField label="Quotation Version" value={quote.revision_no} mono />
                    <InfoField label="Status" value={quote.status} highlight />
                    <InfoField label="Date Received" value={quote.inquiry_date ? new Date(quote.inquiry_date).toLocaleDateString('en-GB') : ''} />
                    <InfoField label="Expected Delivery" value={quote.delivery_date ? new Date(quote.delivery_date).toLocaleDateString('en-GB') : ''} />
                    <InfoField label="Total Quantity" value={quote.quantity} mono />
                    <InfoField label="Production Mode" value={quote.production_mode} />
                  </div>

                  {/* Project Image */}
                  {projectImage && projectImage.$id && (
                    <div className="mt-6 pt-5 border-t border-zinc-100">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.12em] leading-none block mb-3">Project Model / Snapshot</span>
                      <div className="h-48 w-72 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm">
                        <img 
                          src={assetService.getFilePreview(projectImage.$id)} 
                          alt="Project Model" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* Section 2: BOM / Parts List */}
                {items.length > 0 && (
                  <section className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                    <SectionHeader 
                      icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
                      title="Bill of Materials"
                      count={items.length}
                    />
                    <div className="space-y-4">
                      {items.map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-zinc-100 bg-zinc-50/50 overflow-hidden">
                          {/* Item Header */}
                          <div className="px-5 py-3 bg-zinc-100/80 border-b border-zinc-200/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="h-6 w-6 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                              <span className="text-[12px] font-black text-zinc-700 uppercase tracking-wider">{item.part_name || `Part ${idx + 1}`}</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 font-mono">Qty: {item.qty || 1}</span>
                          </div>
                          
                          <div className="p-5 space-y-5">
                            {/* Material */}
                            {item.material && (
                              <div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Raw Material</span>
                                <div className="grid grid-cols-4 gap-4">
                                  <InfoField label="Material" value={item.material.name || item.material.material_name} />
                                  <InfoField label="Grade" value={item.material.grade} />
                                  <InfoField label="Rate / kg" value={`₹${parseFloat(item.material.base_rate || 0).toFixed(2)}`} mono />
                                  <InfoField label="Weight (kg)" value={parseFloat(item.material_weight || 0).toFixed(3)} mono />
                                </div>
                                {item.shape && (
                                  <div className="grid grid-cols-4 gap-4 mt-3">
                                    <InfoField label="Profile" value={item.shape === 'rect' ? 'Rectangular' : item.shape === 'round' ? 'Round Bar' : item.shape === 'hex' ? 'Hexagonal' : item.shape} />
                                    {item.dimensions && (
                                      <>
                                        {item.dimensions.l && <InfoField label="Length (mm)" value={item.dimensions.l} mono />}
                                        {item.dimensions.w && <InfoField label="Width (mm)" value={item.dimensions.w} mono />}
                                        {item.dimensions.t && <InfoField label="Thickness (mm)" value={item.dimensions.t} mono />}
                                        {item.dimensions.dia && <InfoField label="Diameter (mm)" value={item.dimensions.dia} mono />}
                                        {item.dimensions.af && <InfoField label="Across Flat (mm)" value={item.dimensions.af} mono />}
                                      </>
                                    )}
                                    <InfoField label="Wastage %" value={`${item.wastage || 0}%`} mono />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Machining Processes */}
                            {item.processes && item.processes.length > 0 && (
                              <div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Machining Operations</span>
                                <div className="overflow-hidden rounded-lg border border-zinc-200">
                                  <table className="w-full text-left text-[12px]">
                                    <thead className="bg-zinc-100">
                                      <tr>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Operation</th>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center">Setup (min)</th>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center">Qty / Time</th>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-right">Unit Rate</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                      {item.processes.map((proc, pIdx) => (
                                        <tr key={pIdx} className="bg-white">
                                          <td className="px-4 py-2.5">
                                            <div className="font-semibold text-zinc-700">{proc.process_name || '—'}</div>
                                            {proc.dim1 && proc.dim2 && (
                                              <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">
                                                {proc.dim1} × {proc.dim2}
                                              </div>
                                            )}
                                          </td>
                                          <td className="px-4 py-2.5 text-center font-mono text-zinc-600">{proc.unit === 'hr' ? (proc.setup_time || 0) : '—'}</td>
                                          <td className="px-4 py-2.5 text-center font-mono text-zinc-600">{proc.cycle_time || 0}</td>
                                          <td className="px-4 py-2.5 text-right font-mono font-bold text-zinc-700">₹{parseFloat(proc.rate || proc.hourly_rate || 0).toFixed(2)} / {proc.unit || 'hr'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Treatments */}
                            {item.treatments && item.treatments.length > 0 && (
                              <div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Surface Finishing / Treatments</span>
                                <div className="overflow-hidden rounded-lg border border-zinc-200">
                                  <table className="w-full text-left text-[12px]">
                                    <thead className="bg-zinc-100">
                                      <tr>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Treatment</th>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center">Per Unit</th>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-right">Cost</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                      {item.treatments.map((t, tIdx) => (
                                        <tr key={tIdx} className="bg-white">
                                          <td className="px-4 py-2.5 font-semibold text-zinc-700">{t.name || '—'}</td>
                                          <td className="px-4 py-2.5 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${t.per_unit !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                                              {t.per_unit !== false ? 'Yes' : 'No'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2.5 text-right font-mono font-bold text-zinc-700">₹{parseFloat(t.cost || 0).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Inspection */}
                            {item.inspection && (item.inspection.cmm || item.inspection.mtc) && (
                              <div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Quality Inspection</span>
                                <div className="grid grid-cols-4 gap-4">
                                  {item.inspection.cmm && <InfoField label="CMM Inspection" value={`₹${parseFloat(item.inspection.cmm_cost || 0).toFixed(2)}`} mono />}
                                  {item.inspection.mtc && <InfoField label="MTC / Certificate" value={`₹${parseFloat(item.inspection.mtc_cost || 0).toFixed(2)}`} mono />}
                                </div>
                              </div>
                            )}

                            {/* Bought Out Parts */}
                            {item.bought_out_items && item.bought_out_items.length > 0 && (
                              <div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Purchased / Bought Out Parts</span>
                                <div className="overflow-hidden rounded-lg border border-zinc-200">
                                  <table className="w-full text-left text-[12px]">
                                    <thead className="bg-zinc-100">
                                      <tr>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Item</th>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center">Qty</th>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-right">Rate</th>
                                        <th className="px-4 py-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-right">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                      {item.bought_out_items.map((b, bIdx) => (
                                        <tr key={bIdx} className="bg-white">
                                          <td className="px-4 py-2.5 font-semibold text-zinc-700">{b.item_name || '—'}</td>
                                          <td className="px-4 py-2.5 text-center font-mono text-zinc-600">{b.qty || 0}</td>
                                          <td className="px-4 py-2.5 text-right font-mono text-zinc-600">₹{parseFloat(b.rate || 0).toFixed(2)}</td>
                                          <td className="px-4 py-2.5 text-right font-mono font-bold text-zinc-700">₹{(parseFloat(b.rate || 0) * (b.qty || 1)).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Design Files */}
                            {item.design_files && item.design_files.length > 0 && (
                              <div>
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Attached Design Assets</span>
                                <div className="flex flex-wrap gap-2">
                                  {item.design_files.map((f, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 border border-zinc-200 text-[11px] font-semibold text-zinc-600">
                                      <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                      {f.name || f.filename || `File ${fIdx + 1}`}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 3: Commercial Adjustments */}
                <section className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                  <SectionHeader 
                    icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    title="Commercial Adjustments & Logistics"
                  />
                  <div className="grid grid-cols-4 gap-x-8 gap-y-5">
                    <InfoField label="Design Cost" value={`₹${parseFloat(quote.design_cost || 0).toFixed(2)}`} mono />
                    <InfoField label="Assembly Cost" value={`₹${parseFloat(quote.assembly_cost || 0).toFixed(2)}`} mono />
                    <InfoField label="Packaging Cost" value={`₹${parseFloat(quote.packaging_cost || 0).toFixed(2)}`} mono />
                    <InfoField label="Transportation Cost" value={`₹${parseFloat(quote.transportation_cost || 0).toFixed(2)}`} mono />
                  </div>
                </section>
              </div>

              {/* Right Sidebar: Pricing Breakdown */}
              <div className="w-[340px] shrink-0 bg-zinc-950 border-l border-zinc-800 p-6 overflow-y-auto flex flex-col">
                <div className="relative">
                  <div className="absolute -top-2 -right-2 opacity-5 grayscale brightness-150 pointer-events-none rotate-12">
                    <img src="/KE_Logo.png" alt="" className="h-32 w-32 object-contain" />
                  </div>
                  
                  <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 relative z-10">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(94,192,194,0.8)]" />
                    Price Breakdown
                  </h3>

                  <div className="space-y-3 relative z-10">
                    <LedgerRow label="Material" value={breakdown.materialCost} />
                    <LedgerRow label="Manufacturing" value={(parseFloat(breakdown.laborCost || 0)) + (parseFloat(breakdown.treatmentCost || 0))} />
                    <LedgerRow label="Purchased Items" value={breakdown.bopCost} />
                    <LedgerRow label="Design & Assembly" value={breakdown.engineeringCost} />
                    <LedgerRow label="Packing & Shipping" value={breakdown.commercialCost} />
                    
                    <div className="h-px bg-zinc-800 my-4" />
                    
                    <LedgerRow label="Manufacturing Cost" value={breakdown.subtotal || quote.subtotal} isBold />
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-800 relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Profit Margin</span>
                      <span className="text-white font-mono font-black text-[15px]">{quote.markup || 0}%</span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em]">Final Total</span>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">After Markup</span>
                      </div>
                      <span className="text-3xl font-mono font-black tracking-tighter text-white leading-none">
                        ₹{parseFloat(quote.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="h-1 w-full bg-brand-primary/10 rounded-full mt-5 overflow-hidden border border-zinc-900/50">
                        <div className="h-full bg-brand-primary shadow-[0_0_10px_rgba(94,192,194,0.5)] transition-all duration-500 ease-out" style={{ width: `${Math.min(quote.markup || 0, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Per Unit Pricing */}
                {quote.quantity > 1 && (
                  <div className="mt-8 pt-6 border-t border-zinc-800">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">Per Unit Analysis</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] font-bold text-zinc-400">Unit Price</span>
                      <span className="text-xl font-mono font-black text-brand-primary">
                        ₹{(parseFloat(quote.total_amount || 0) / (quote.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline mt-2">
                      <span className="text-[11px] font-bold text-zinc-500">Quantity</span>
                      <span className="text-[13px] font-mono font-bold text-zinc-400">{quote.quantity} units</span>
                    </div>
                  </div>
                )}

                {/* Metadata Footer */}
                <div className="mt-auto pt-6 border-t border-zinc-800">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Created</span>
                      <span className="text-[10px] font-mono text-zinc-500">{quote.$createdAt ? new Date(quote.$createdAt).toLocaleDateString('en-GB') : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Last Modified</span>
                      <span className="text-[10px] font-mono text-zinc-500">{quote.$updatedAt ? new Date(quote.$updatedAt).toLocaleDateString('en-GB') : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Record ID</span>
                      <span className="text-[10px] font-mono text-zinc-600 truncate max-w-[150px]">{quote.$id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationPreviewModal;
