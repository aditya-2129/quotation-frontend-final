"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { bopRateService } from '@/services/rates';
import ActionButtons from '@/components/shared/ActionButtons';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function BOPLibraryPage() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({ open: false, data: null });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, row: null });
  const [errorDetails, setErrorDetails] = useState({ open: false, message: '' });
  const limit = 25;

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await bopRateService.listRates(limit, (page - 1) * limit);
      setItems(res.documents);
      setTotal(res.total);
    } catch (error) {
      console.error("Failed to fetch library:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (data = null) => setModalState({ open: true, data });
  const closeModal = () => setModalState({ open: false, data: null });

   const handleDelete = (item) => {
      setDeleteConfirm({ open: true, row: item });
   };

   const commitDelete = async () => {
      const item = deleteConfirm.row;
      if (!item) return;
      try {
         await bopRateService.deleteRate(item.$id);
         fetchData();
      } catch (error) {
         setErrorDetails({ open: true, message: error.message || "Failed to excise component from procurement path." });
      } finally {
         setDeleteConfirm({ open: false, row: null });
      }
   };

  const filteredItems = items.filter(i => 
    i.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="BOP Registry"
      primaryAction={
        <button 
          onClick={() => openModal()}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-[13px] font-bold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Catalog Item
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
           <div className="relative w-full max-w-md">
              <input 
                 type="text" 
                 placeholder="Search registry (Item, Supplier...)" 
                 className="w-full h-11 pl-11 pr-4 rounded-lg bg-zinc-50 border border-zinc-200 text-sm focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="h-5 w-5 absolute left-3.5 top-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
           </div>
           <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 py-2 rounded-lg border border-zinc-100 bg-zinc-50">
              Procurement Entities: {total}
           </div>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                 <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                       <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Part Descriptor & Measurement</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">OEM / Supplier</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Acquisition Rate (₹)</th>
                       <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-200">
                    {isLoading ? [1,2,3,4,5].map(i => (
                       <tr key={i} className="animate-pulse">
                          <td className="px-6 py-5"><div className="h-4 w-48 bg-zinc-100 rounded" /></td>
                          <td className="px-6 py-5"><div className="h-4 w-20 bg-zinc-100 rounded mx-auto" /></td>
                          <td className="px-6 py-5 text-right"><div className="h-4 w-24 bg-zinc-100 rounded ml-auto" /></td>
                          <td className="px-6 py-5 text-right"><div className="h-8 w-8 bg-zinc-100 rounded ml-auto" /></td>
                       </tr>
                    )) : filteredItems.length === 0 ? (
                       <tr><td colSpan="4" className="px-6 py-20 text-center text-zinc-400 italic font-medium uppercase tracking-widest text-[11px]">No catalog items registered in this procurement path.</td></tr>
                    ) : filteredItems.map(item => (
                       <tr key={item.$id} className="group hover:bg-zinc-50/80 transition-colors">
                          <td className="px-6 py-5">
                             <div className="flex flex-col">
                                <span className="text-zinc-950 font-bold italic">{item.item_name}</span>
                                <span className="text-[11px] font-mono text-zinc-500 uppercase">Per {item.unit || 'Standard Unit'}</span>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                             <span className="inline-flex px-2 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-bold text-zinc-600 uppercase tracking-tight">
                                {item.supplier || 'General Market'}
                             </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <span className="text-sm font-mono font-bold text-emerald-700 italic">₹{parseFloat(item.rate).toFixed(2)}</span>
                          </td>
                           <td className="px-6 py-5 text-right">
                              <ActionButtons onEdit={() => openModal(item)} onDelete={() => handleDelete(item)} />
                           </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between mt-auto">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                 Index {Math.min(total, (page - 1) * limit + 1)} - {Math.min(total, page * limit)} of {total}
              </div>
              <div className="flex items-center gap-2">
                 <button 
                   disabled={page === 1}
                   onClick={() => setPage(p => p - 1)}
                   className="h-8 px-3 rounded-md border border-zinc-200 bg-white text-[11px] font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm uppercase tracking-tighter"
                 >Prev</button>
                 <div className="flex items-center gap-1 px-2 text-[11px] font-mono font-bold text-zinc-900">{page} / {Math.ceil(total / limit) || 1}</div>
                 <button 
                   disabled={page >= Math.ceil(total / limit)}
                   onClick={() => setPage(p => p + 1)}
                   className="h-8 px-3 rounded-md border border-zinc-200 bg-white text-[11px] font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm uppercase tracking-tighter"
                 >Next</button>
              </div>
           </div>
        </section>
      </div>

       {modalState.open && (
         <RateModal 
           data={modalState.data}
           onClose={closeModal}
           onSuccess={() => { fetchData(); closeModal(); }}
           onError={(msg) => setErrorDetails({ open: true, message: msg })}
         />
       )}

       <ConfirmationModal 
          isOpen={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, row: null })}
          onConfirm={commitDelete}
          title="Purge Catalog Item?"
          message={`Are you sure you want to permanently remove '${deleteConfirm.row?.item_name || 'this item'}' from the procurement registry?`}
          confirmText="PURGE ITEM"
          cancelText="KEEP ITEM"
          type="danger"
       />

       <ConfirmationModal 
          isOpen={errorDetails.open}
          onClose={() => setErrorDetails({ open: false, message: '' })}
          onConfirm={() => setErrorDetails({ open: false, message: '' })}
          title="REGISTRY ERROR"
          message={errorDetails.message}
          confirmText="CLOSE"
          type="danger"
       />
     </DashboardLayout>
  );
}

function RateModal({ data, onClose, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    name: data?.item_name || '',
    rate: data?.rate || 0,
    unit: data?.unit || 'pc',
    supplier: data?.supplier || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { item_name: formData.name, rate: parseFloat(formData.rate), unit: formData.unit, supplier: formData.supplier };
      if (data) await bopRateService.updateRate(data.$id, payload);
      else await bopRateService.createRate(payload);
       onSuccess();
     } catch (error) {
       console.error("Catalog Save Error:", error);
       onError(error.message || "Failed to commit catalog entry.");
       setIsSubmitting(false);
     }
   };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-xl border border-zinc-200 shadow-2xl overflow-hidden">
        <header className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
           <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
              {data ? 'Registry Sync' : 'New Procurement Catalog Entry'}
           </h2>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
           <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Item Descriptor Name *</label>
              <input required className="w-full h-10 px-4 rounded-lg bg-zinc-50 border border-zinc-200 font-bold outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Acquisition Rate (₹) *</label>
                 <input required type="number" step="0.01" className="w-full h-10 px-4 rounded-lg bg-zinc-50 border border-zinc-200 font-mono font-bold outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} />
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Unit</label>
                 <input placeholder="e.g. pc, mm" className="w-full h-10 px-4 rounded-lg bg-zinc-50 border border-zinc-200 font-bold outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
              </div>
           </div>
           <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">OEM / Certified Supplier</label>
              <input placeholder="Manufacturer Name" className="w-full h-10 px-4 rounded-lg bg-zinc-50 border border-zinc-200 font-bold outline-none focus:ring-2 focus:ring-zinc-950 focus:bg-white" value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} />
           </div>
           <div className="flex gap-3 pt-4 border-t border-zinc-100">
              <button type="button" onClick={onClose} className="flex-1 h-10 rounded-lg font-bold text-zinc-400 hover:text-zinc-950 transition-colors uppercase italic text-xs">Abort</button>
              <button type="submit" disabled={isSubmitting} className="flex-[2] h-10 rounded-lg bg-zinc-950 text-white font-bold shadow-lg disabled:opacity-50 transition-all uppercase italic text-xs">
                 {isSubmitting ? 'Syncing...' : 'Catalog Entry'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
