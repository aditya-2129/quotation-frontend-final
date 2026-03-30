import React, { useState } from 'react';
import AssetPreviewModal from '../modals/AssetPreviewModal';
import { assetService } from '@/services/assets';

const BOMRegistry = ({ 
  formData, 
  setFormData, 
  activePhase,
  setActivePhase,
  panelIndex = 2,
  onError
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
          processes: [],
          bought_out_items: [],
          design_files: [],
          part_image: null,
          material: null,
          material_weight: 0
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
     
     if (targetItem?.part_image?.$id) {
        try {
           await assetService.deleteFile(targetItem.part_image.$id);
        } catch (err) {
           console.error("Image cleanup failed:", err);
        }
     }

    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const isExpanded = activePhase === 'bom';

  return (
    <section className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden shadow-sm ${isExpanded ? 'border-zinc-300 shadow-md ring-1 ring-zinc-200' : 'border-zinc-200'}`}>
      <header 
        onClick={() => setActivePhase(isExpanded ? '' : 'bom')}
        className={`h-[52px] px-5 border-b cursor-pointer flex justify-between items-center group transition-colors ${isExpanded ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'}`}
      >
        <div className="flex items-center gap-3">
           <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black border transition-all duration-300 ${isExpanded ? 'bg-brand-primary border-brand-primary text-zinc-950 shadow-lg shadow-brand-primary/20' : 'bg-white border-zinc-200 text-zinc-400'}`}>{panelIndex}</span>
           <h3 className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-brand-primary' : 'text-zinc-500 group-hover:text-brand-primary'}`}>Parts</h3>
        </div>
        <div className="flex items-center gap-4">
             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100/50 px-2.5 py-1 rounded border border-zinc-200/50 italic animate-in slide-in-from-right-2 duration-300">
                {formData.items.length} Components Configured
             </span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); addPart(); }}
                className="h-8 w-40 rounded-xl bg-brand-primary text-zinc-950 text-[10.5px] font-black uppercase tracking-tight shadow-xl shadow-brand-primary/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border border-brand-primary/20"
              >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              ADD PART +
            </button>
           <svg className={`h-4.5 w-4.5 text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-brand-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </header>
      
      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 italic">
                <th className="px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest w-16 text-center">No.</th>
                  <th className="px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest w-24">Part Image</th>
                  <th className="px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Component Name <span className="text-red-500 font-extrabold">*</span></th>
                  <th className="px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center whitespace-nowrap">Quantity To Make <span className="text-red-500 font-extrabold">*</span></th>
                  <th className="px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">Blueprints / Drawings</th>
                <th className="px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">Creation Date</th>
                <th className="px-3 py-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center w-24">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
               {formData.items.map((item, idx) => (
                  <tr 
                    key={item.id}
                    className="group transition-all duration-300 bg-white hover:bg-zinc-50"
                  >
                    <td className="px-3 py-2 text-center">
                       <span className="text-[10px] font-black font-mono text-zinc-400">
                          {String(idx + 1).padStart(2, '0')}
                       </span>
                    </td>
                    <td className="px-3 py-2">
                        <div className="flex justify-center">
                             <input 
                               type="file" 
                               id={`part-image-${item.id}`} 
                               className="hidden" 
                               accept="image/*"
                               onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;
                                  
                                  setIsUploading(true);
                                  try {
                                     const uploadedFile = await assetService.uploadFile(file);
                                     const localPreviewUrl = URL.createObjectURL(file);
                                     const newItems = [...formData.items];
                                     newItems[idx].part_image = { ...uploadedFile, localPreview: localPreviewUrl };
                                     setFormData({...formData, items: newItems});
                                  } catch (err) {
                                     console.error("Image upload failed:", err);
                                     if (onError) onError("Failed to upload part snapshot. " + err.message);
                                  } finally {
                                     setIsUploading(false);
                                     if (e.target) e.target.value = null;
                                  }
                               }}
                             />
                             {item.part_image ? (
                                <div className="relative group/img h-11 w-11 rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden shadow-sm-inset cursor-pointer" onClick={() => setPreviewFile(item.part_image)}>
                                   <img 
                                     src={item.part_image.localPreview || (item.part_image.$id ? assetService.getFilePreview(item.part_image.$id)?.toString() : "")} 
                                     alt="Part" 
                                     className="h-full w-full object-cover transition-transform group-hover/img:scale-110" 
                                     onError={(e) => {
                                        if (e.target.src.includes('preview')) {
                                           e.target.src = item.part_image.localPreview || assetService.getFileView(item.part_image.$id)?.toString();
                                        }
                                     }}
                                   />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                      <button 
                                        onClick={async (e) => {
                                           e.stopPropagation();
                                           if (item.part_image.$id) {
                                              try {
                                                 await assetService.deleteFile(item.part_image.$id);
                                              } catch (err) {
                                                 console.error("Deletion failed:", err);
                                              }
                                           }
                                           const newItems = [...formData.items];
                                           newItems[idx].part_image = null;
                                           setFormData({...formData, items: newItems});
                                        }}
                                        className="p-1 rounded bg-red-500 text-white shadow-lg"
                                      >
                                         <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                   </div>
                                </div>
                             ) : (
                                <label htmlFor={`part-image-${item.id}`} className="relative h-11 w-11 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-0.5 text-zinc-300 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 transition-all cursor-pointer group/upload overflow-hidden">
                                   {isUploading && (
                                      <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center">
                                         <div className="h-3 w-3 border-[1.5px] border-brand-primary border-t-transparent rounded-full animate-spin" />
                                      </div>
                                   )}
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span className="text-[6px] font-black uppercase tracking-tighter">PHOTO</span>
                                </label>
                             )}
                        </div>
                     </td>
                    <td className="px-3 py-2">
                       <div className="relative group/input max-w-sm">
                          <input 
                            className="bg-transparent border-b border-dashed border-zinc-200 hover:border-brand-primary focus:border-brand-primary focus:border-solid outline-none font-black text-[13px] py-0.5 w-full text-zinc-900 transition-all cursor-text"
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
                    <td className="px-3 py-2 text-center">
                       <input 
                         type="number"
                         min="1"
                         className="w-18 h-8 bg-zinc-50 border border-zinc-200 rounded-lg px-2 text-center text-[12px] font-black outline-none focus:ring-1 focus:ring-brand-primary transition-all font-mono shadow-sm"
                         value={item.qty ?? 1}
                         onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[idx].qty = parseInt(e.target.value) || 1;
                            setFormData({...formData, items: newItems});
                         }}
                       />
                    </td>
                    <td className="px-4 py-3">
                       <div className="flex items-center justify-start">
                          <input 
                            type="file" 
                            id={`drawing-${item.id}`} 
                            className="hidden" 
                            multiple
                            accept=".pdf"
                            disabled={isUploading}
                            onChange={async (e) => {
                               const selectedFiles = Array.from(e.target.files);
                               if (selectedFiles.length === 0) return;
                               
                               const pdfFiles = selectedFiles.filter(file => 
                                  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
                               );

                               if (pdfFiles.length === 0) {
                                  if (onError) onError("Only PDF files are allowed for blueprints.");
                                  e.target.value = '';
                                  return;
                               }

                               if (pdfFiles.length < selectedFiles.length && onError) {
                                  onError("Some files were skipped. Only PDF files are allowed.");
                               }
                               
                               setIsUploading(true);
                               try {
                                  const uploadedFiles = await Promise.all(
                                     pdfFiles.map(file => assetService.uploadFile(file))
                                  );
                                  const newItems = [...formData.items];
                                  newItems[idx].design_files = [...(newItems[idx].design_files || []), ...uploadedFiles];
                                  setFormData({...formData, items: newItems});
                               } catch (err) {
                                  console.error("Upload failed:", err);
                                  if (onError) onError("Failed to upload assets. Check connection or file registry status.");
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
                                        className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-950 hover:border-brand-primary transition-all shadow-sm group/file cursor-pointer active:scale-95"
                                      >
                                         <svg className="h-3 w-3 text-zinc-400 group-hover/file:text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
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
                                      <label htmlFor={`drawing-${item.id}`} className="h-7 w-7 flex items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 cursor-pointer hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-90" title="Add More">
                                         <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                      </label>
                                   )}
                                </div>
                             </div>
                          ) : (
                             <label htmlFor={`drawing-${item.id}`} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all group/upload shadow-sm-inset cursor-pointer ${isUploading ? 'bg-zinc-100 border-zinc-200 cursor-not-allowed' : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-white hover:text-brand-primary hover:border-brand-primary'}`}>
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
                    <td className="px-3 py-2">
                       <span className="text-[11px] font-bold text-zinc-600 whitespace-nowrap">
                          {new Date(item.id).toLocaleDateString()}
                       </span>
                    </td>
                    <td className="px-3 py-2 text-center text-zinc-300">
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
