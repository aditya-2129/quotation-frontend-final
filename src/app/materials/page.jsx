"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { materialService } from '@/services/materials';
import ActionButtons from '@/components/shared/ActionButtons';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import Pagination from '@/components/shared/Pagination';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, row: null });
  const [errorDetails, setErrorDetails] = useState({ open: false, message: '' });
  const limit = 25;

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await materialService.listMaterials(limit, (page - 1) * limit, searchQuery);
      setMaterials(response.documents);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch materials library:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [page]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchMaterials();
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const openAddModal = () => {
    setSelectedMaterial(null);
    setIsModalOpen(true);
  };

  const openEditModal = (material) => {
    setSelectedMaterial(material);
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setSelectedMaterial(null);
  };

   const handleDelete = (material) => {
      setDeleteConfirm({ open: true, row: material });
   };

   const commitDelete = async () => {
      const material = deleteConfirm.row;
      if (!material) return;
      try {
         await materialService.deleteMaterial(material.$id);
         fetchMaterials();
      } catch (error) {
         setErrorDetails({ open: true, message: error.message || "Failed to excise material from library." });
      } finally {
         setDeleteConfirm({ open: false, row: null });
      }
   };

  const filteredMaterials = materials;

  return (
    <DashboardLayout 
      title="Materials Inventory"
      primaryAction={
        <button 
           onClick={openAddModal}
           className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-[13px] font-bold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Material
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
           <div className="relative w-full max-w-md">
              <input 
                 type="text" 
                 placeholder="Search registry (Name, Grade, Shape...)" 
                 className="w-full h-11 pl-11 pr-4 rounded-lg bg-zinc-50 border border-zinc-200 text-sm focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="h-5 w-5 absolute left-3.5 top-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
           </div>
           <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 h-11 rounded-lg border border-zinc-200 bg-zinc-50 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                 <span className="h-2 w-2 rounded-full bg-zinc-400" />
                 Total Records: {total}
              </div>
           </div>
        </div>

        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Material Grade</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Category Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Form Factor</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Density</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Base Rate (per kg)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {isLoading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 w-48 bg-zinc-100 rounded" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-20 bg-zinc-100 rounded mx-auto" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-16 bg-zinc-100 rounded mx-auto" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-24 bg-zinc-100 rounded ml-auto" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-16 bg-zinc-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
                             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                             </svg>
                          </div>
                          <span className="text-sm text-zinc-500 font-medium">No materials matching your trajectory.</span>
                       </div>
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((m) => (
                    <tr key={m.$id} className="group hover:bg-brand-primary/[0.04] even:bg-[#F8FBFC] transition-all duration-200">
                      <td className="px-6 py-4 font-black text-zinc-950 uppercase tracking-tight">{m.grade || '—'}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase italic tracking-widest">{m.name}</td>
                      <td className="px-6 py-4 text-center">
                         <span className="inline-flex px-2 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-bold text-zinc-600 uppercase tracking-tight">
                            {m.shape?.replace('_', ' ')}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-mono font-medium text-zinc-600">{parseFloat(m.density).toFixed(3)} <span className="text-[10px] text-zinc-400 font-sans uppercase">g/cm³</span></span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-mono font-bold text-emerald-700">₹{parseFloat(m.base_rate).toFixed(2)}</span>
                      </td>
                       <td className="px-6 py-4 text-right">
                         <ActionButtons onEdit={() => openEditModal(m)} onDelete={() => handleDelete(m)} />
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination total={total} page={page} limit={limit} onPageChange={setPage} label="Index" />
        </section>
      </div>

       {isModalOpen && (
         <MaterialModal 
           material={selectedMaterial} 
           onClose={closeAndResetModal} 
           onSuccess={() => {
             closeAndResetModal();
             fetchMaterials();
           }} 
           onError={(msg) => setErrorDetails({ open: true, message: msg })}
         />
       )}

       <ConfirmationModal 
          isOpen={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, row: null })}
          onConfirm={commitDelete}
          title="Excise Material?"
          message={`Are you sure you want to permanently remove '${deleteConfirm.row?.name || 'this material'}' from the master library? This will impact all future quotations using this material.`}
          confirmText="DELETE MATERIAL"
          cancelText="KEEP MATERIAL"
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

function MaterialModal({ onClose, onSuccess, onError, material }) {
  const [formData, setFormData] = useState({
    name: material?.name || '',
    grade: material?.grade || '',
    density: material?.density || 0,
    base_rate: material?.base_rate || 0,
    shape: material?.shape || 'round_bar'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shapes = [
    { id: 'round_bar', label: 'Round Bar' },
    { id: 'square_bar', label: 'Square Bar' },
    { id: 'rectangular_bar', label: 'Rectangular Bar' },
    { id: 'plate_sheet', label: 'Plate / Sheet' },
    { id: 'hollow_tube', label: 'Hollow Tube' },
    { id: 'hex_bar', label: 'Hex Bar' },
    { id: 'forged_block', label: 'Forged Block' },
    { id: 'casting', label: 'Casting' },
    { id: 'extruded_section', label: 'Extruded Section' }
  ];
  
  const DENSITY_MAP = {
    'STEEL': 7.850,
    'MS': 7.850,
    'MILD STEEL': 7.850,
    'ALLOY STEEL': 7.850,
    'EN8': 7.850,
    'EN9': 7.850,
    'EN19': 7.850,
    'EN24': 7.850,
    'STAINLESS STEEL': 8.000,
    'SS': 8.000,
    'SS304': 8.000,
    'SS316': 8.000,
    'ALUMINIUM': 2.700,
    'AL': 2.700,
    'COPPER': 8.960,
    'BRASS': 8.500,
    'TITANIUM': 4.500,
    'PLASTIC': 1.050,
    'ABS': 1.050,
    'ACRYLIC': 1.180,
    'NYLON': 1.150,
    'CAST IRON': 7.200,
    'CI': 7.200
  };

  useEffect(() => {
    // Only auto-update if density is currently 0 or near 0 to avoid overwriting manual corrections
    if (parseFloat(formData.density) > 0 && parseFloat(formData.density) !== 7.85 && parseFloat(formData.density) !== 2.7) return; 

    const searchStr = formData.name.toUpperCase().trim();
    const searchGradeStr = formData.grade.toUpperCase().trim();

    // Check mapping
    for (const key in DENSITY_MAP) {
      if (searchStr.includes(key) || searchGradeStr.includes(key)) {
        setFormData(prev => ({ ...prev, density: DENSITY_MAP[key] }));
        break;
      }
    }
  }, [formData.name, formData.grade]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Ensure numeric values are numbers
      const submissionData = {
        ...formData,
        density: parseFloat(formData.density),
        base_rate: parseFloat(formData.base_rate)
      };

      if (material) {
        await materialService.updateMaterial(material.$id, submissionData);
      } else {
        await materialService.createMaterial(submissionData);
      }
       onSuccess();
     } catch (error) {
       onError(error.message || "Failed to update material record.");
       setIsSubmitting(false);
     }
   };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/20 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
           <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
              {material ? 'Material Specification Update' : 'New Material Inventory Entry'}
           </h2>
           <p className="text-sm text-zinc-500 mt-1.5 font-medium leading-relaxed">
              Configure precise physical properties and market rates for the global registry.
           </p>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                 <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Material Grade / Specification *</label>
                 <input 
                    required
                    placeholder="e.g. 6061-T6, EN8, SS304"
                    className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 font-black focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all placeholder:font-normal"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                 />
              </div>
              <div className="col-span-2">
                 <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Category Name (Material Group) *</label>
                 <input 
                    required
                    placeholder="e.g. Aluminium, Alloy Steel, Stainless Steel"
                    className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 font-bold text-zinc-500 italic focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all placeholder:font-normal"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                 />
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Form Factor (Shape) *</label>
                 <select 
                    required
                    className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all"
                    value={formData.shape}
                    onChange={(e) => setFormData({...formData, shape: e.target.value})}
                 >
                    {shapes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                 </select>
              </div>
              <div>
                 <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Density (g/cm³) *</label>
                    {(formData.name || formData.grade) && parseFloat(formData.density) === 0 && (
                       <a 
                          href={`https://www.google.com/search?q=${encodeURIComponent(formData.grade || formData.name)} material density g/cm3`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
                       >
                          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          Find Density
                       </a>
                    )}
                 </div>
                 <input 
                    required
                    type="number"
                    step="0.001"
                    className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 font-mono focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all"
                    value={formData.density}
                    onChange={(e) => setFormData({...formData, density: e.target.value})}
                 />
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Base Rate (₹/kg) *</label>
                 <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full h-11 px-4 rounded-lg bg-zinc-50 border border-zinc-200 font-mono focus:ring-2 focus:ring-zinc-950 focus:bg-white outline-none transition-all"
                    value={formData.base_rate}
                    onChange={(e) => setFormData({...formData, base_rate: e.target.value})}
                 />
              </div>
           </div>

           <div className="flex gap-4 pt-6 border-t border-zinc-100">
              <button 
                 type="button" 
                 onClick={onClose}
                 className="flex-1 h-12 rounded-xl font-bold text-zinc-400 hover:text-zinc-950 transition-colors"
              >
                 Abort
              </button>
              <button 
                 type="submit"
                 disabled={isSubmitting}
                 className="flex-[2] h-12 rounded-xl bg-zinc-950 text-white font-bold shadow-xl hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                 {isSubmitting ? 'Syncing...' : (material ? 'Commit Changes' : 'Update Registry')}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
