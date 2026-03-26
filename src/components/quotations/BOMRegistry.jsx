import React, { useState } from 'react';
import AssetPreviewModal from '../modals/AssetPreviewModal';
import { assetService } from '@/services/assets';

const BOMRegistry = ({ 
  formData, 
  setFormData, 
  activePhase,
  setActivePhase,
  panelIndex = 2
}) => {
  const [previewFile, setPreviewFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const addPart = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          part_name: `Part ${String(prev.items.length + 1).padStart(2, '0')}`,
          qty: 1, // Default quantity
          material: null,
          material_weight: 0,
          wastage: 3,
          hardness: '',
          tolerance: '',
          surface_finish: '',
          heat_treatment: { required: false, type: '', cost: 0 },
          surface_treatment: { required: false, type: '', cost: 0 },
          inspection: { cmm: false, mtc: false, cost: 0 },
          processes: [],
          tooling: [],
          bought_out_items: [],
          design_files: []
        }
      ]
    }));
  };

  const removePart = async (index, e) => {
    e.stopPropagation();
    if (formData.items.length <= 1) return;
    
    // Purge drawing assets from storage
    const targetItem = formData.items[index];
    if (targetItem?.design_files?.length > 0) {
       await Promise.all((targetItem.design_files || []).map(async (file) => {
          if (file.$id) {
             try {
                await assetService.deleteFile(file.$id);
             } catch (err) {
                console.error("Cleanup failed:", err);
             }
          }
       }));
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const isExpanded = activePhase === 'bom';

  return (
    <section className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${isExpanded ? 'border-zinc-300 shadow-md ring-1 ring-zinc-200' : 'border-zinc-200'}`}>
      <header 
        onClick={() => setActivePhase(isExpanded ? '' : 'bom')}
        className={`px-6 py-5 border-b cursor-pointer flex justify-between items-center group transition-colors ${isExpanded ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
      >
        <div className="flex items-center gap-3">
           <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black border transition-all duration-300 ${isExpanded ? 'bg-zinc-950 border-zinc-950 text-white shadow-lg shadow-zinc-950/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
           <h3 className={`text-[13px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-700'}`}>Parts</h3>
        </div>
        <div className="flex items-center gap-4">
           {!isExpanded && (
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100/50 px-2.5 py-1 rounded border border-zinc-200/50 italic animate-in slide-in-from-right-2 duration-300">
                 {formData.items.length} Components Configured
              </span>
           )}
           <button 
             type="button"
             onClick={(e) => { e.stopPropagation(); addPart(); }}
             className="h-9 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-black uppercase tracking-tight transition-all active:scale-95 flex items-center gap-2 shadow-xl shadow-emerald-700/20"
           >
             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
             ADD PART +
           </button>
           <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-zinc-950' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </header>
      
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 italic">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest w-16 text-center">No.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Component Name <span className="text-red-500 font-extrabold">*</span></th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center whitespace-nowrap">Quantity To Make <span className="text-red-500 font-extrabold">*</span></th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">Blueprints / Drawings</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">Creation Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center w-24">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
               {formData.items.map((item, idx) => (
                  <tr 
                    key={item.id}
                    className="group transition-all duration-300 bg-white hover:bg-zinc-50"
                  >
                    <td className="px-6 py-5 text-center">
                       <span className="text-[10px] font-black font-mono text-zinc-400">
                          {String(idx + 1).padStart(2, '0')}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="relative group/input max-w-sm">
                          <input 
                            className="bg-transparent border-b border-dashed border-zinc-200 hover:border-zinc-950 focus:border-zinc-950 focus:border-solid outline-none font-black text-[14px] py-0.5 w-full text-zinc-900 transition-all cursor-text"
                            placeholder="Enter Name (e.g. Shaft, Plate)..."
                            value={item.part_name}
                            onChange={(e) => {
                               const newItems = [...formData.items];
                               newItems[idx].part_name = e.target.value;
                               setFormData({...formData, items: newItems});
                            }}
                          />
                          <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none">
                             <svg className="h-3 w-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <input 
                         type="number"
                         min="1"
                         className="w-20 h-9 bg-zinc-50 border border-zinc-200 rounded-lg px-2 text-center text-[13px] font-black outline-none focus:ring-1 focus:ring-zinc-950 transition-all font-mono shadow-sm"
                         value={item.qty ?? 1}
                         onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].qty = parseInt(e.target.value) || 1;
                            setFormData({...formData, items: newItems});
                         }}
                       />
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center justify-start">
                          <input 
                            type="file" 
                            id={`drawing-${item.id}`} 
                            className="hidden" 
                            multiple
                            disabled={isUploading}
                            onChange={async (e) => {
                               const files = Array.from(e.target.files);
                               if (files.length === 0) return;
                               
                               setIsUploading(true);
                               try {
                                  const uploadedFiles = await Promise.all(
                                     files.map(file => assetService.uploadFile(file))
                                  );
                                  const newItems = [...formData.items];
                                  newItems[idx].design_files = [...(newItems[idx].design_files || []), ...uploadedFiles];
                                  setFormData({...formData, items: newItems});
                               } catch (err) {
                                  console.error("Upload failed:", err);
                                  alert("Failed to upload assets. Check connection.");
                               } finally {
                                  setIsUploading(false);
                               }
                            }}
                          />
                          {item.design_files?.length > 0 ? (
                             <div className="flex flex-col items-start gap-1.5 w-full">
                                <div className="flex flex-wrap justify-start gap-1.5 max-w-[400px] animate-in fade-in slide-in-from-top-1 duration-300">
                                   {item.design_files.map((file, fIdx) => (
                                      <div 
                                        key={fIdx} 
                                        onClick={() => setPreviewFile(file)}
                                        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 hover:border-zinc-900 transition-all shadow-sm group/file cursor-pointer active:scale-95"
                                      >
                                         <svg className="h-3 w-3 text-zinc-400 group-hover/file:text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                         <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[120px]">{file.name}</span>
                                         <button 
                                           onClick={async (e) => {
                                              e.stopPropagation();
                                              const fileToRemove = item.design_files[fIdx];
                                              if (fileToRemove.$id) {
                                                 try {
                                                    await assetService.deleteFile(fileToRemove.$id);
                                                 } catch (err) {
                                                    console.error("Deletion failed:", err);
                                                 }
                                              }
                                              const newItems = [...formData.items];
                                              newItems[idx].design_files = newItems[idx].design_files.filter((_, i) => i !== fIdx);
                                              setFormData({...formData, items: newItems});
                                           }}
                                           className="text-zinc-300 hover:text-red-500 transition-colors ml-0.5"
                                         >
                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                         </button>
                                      </div>
                                   ))}
                                   {isUploading ? (
                                      <div className="h-7 px-3 flex items-center gap-2 rounded-lg bg-zinc-50 border border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-widest animate-pulse">
                                         <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                         Uploading...
                                      </div>
                                   ) : (
                                      <label htmlFor={`drawing-${item.id}`} className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-100/50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-700 hover:text-white transition-all shadow-sm active:scale-90" title="Add More">
                                         <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                      </label>
                                   )}
                                </div>
                             </div>
                          ) : (
                             <label htmlFor={`drawing-${item.id}`} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all group/upload shadow-sm-inset cursor-pointer ${isUploading ? 'bg-zinc-100 border-zinc-200 cursor-not-allowed' : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-white hover:text-zinc-950 hover:border-zinc-950'}`}>
                                {isUploading ? (
                                   <svg className="animate-spin h-3.5 w-3.5 text-zinc-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                ) : (
                                   <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                )}
                                 <span className="text-[10px] font-black uppercase tracking-tight">{isUploading ? 'Uploading...' : 'Upload Blueprints'}</span>
                             </label>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[11px] font-bold text-zinc-600 whitespace-nowrap">
                          {new Date(item.id).toLocaleDateString()}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center text-zinc-300">
                       {formData.items.length > 1 ? (
                          <button 
                            onClick={(e) => removePart(idx, e)}
                            className="p-2 rounded-lg transition-all text-zinc-300 hover:text-red-500 hover:bg-red-50"
                          >
                             <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       ) : (
                          <span className="text-[9px] font-black uppercase tracking-tight opacity-30">LOCKED</span>
                       )}
                    </td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
      <AssetPreviewModal 
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />
    </section>
  );
};

export default BOMRegistry;
