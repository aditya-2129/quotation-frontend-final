import React from 'react';
import { assetService } from '@/services/assets';

const AssetPreviewModal = ({ isOpen, onClose, file }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  if (!isOpen || !file) return null;

  const getFileUrl = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    if (file.localPreview) {
      return file.localPreview;
    }
    // If it's an Appwrite file object (has $id)
    if (file.$id) {
       return assetService.getFileView(file.$id);
    }
    return file.url || ''; 
  };

  const fileUrl = getFileUrl(file);
  const downloadUrl = file.$id ? assetService.getFileDownload(file.$id) : fileUrl;
  const fileName = file.name || file.filename || 'Unknown File';
  const fileSize = file.size || file.sizeOriginal || 0;
  const fileType = file.type || file.mimeType || '';

  const isImage = fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|svg)$/i);
  const isPDF = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className={`relative bg-zinc-900 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 ring-1 ring-white/10 transition-all ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden'}`}>
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center shrink-0">
           <div className="flex items-center gap-4 min-w-0">
              <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-emerald-500 border border-white/5 shrink-0">
                 {isImage ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                 )}
              </div>
              <div className="min-w-0">
                 <h3 className="text-white text-[13px] font-black uppercase tracking-widest truncate">{fileName}</h3>
                 <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-tight">{(fileSize / 1024 / 1024).toFixed(2)} MB • Engineering Asset</p>
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <a 
                href={downloadUrl} 
                download={file.name}
                className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-white/5 active:scale-95 hidden md:flex"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                DOWNLOAD
              </a>
              <div className="w-px h-6 bg-white/5 mx-1 hidden md:block" />
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-white/5"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                 {isFullscreen ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 9L4 4m0 0l0 5m0-5l5 0m6 0l5 5m0-5l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0-5m11 0l5 5m0 0l-5 0m5 0l0-5" /></svg>
                 ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                 )}
              </button>
              <button 
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-red-500 transition-all border border-white/5"
              >
                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 bg-[#09090b] flex items-center justify-center relative overflow-hidden">
           {isImage ? (
              <div className="w-full h-full p-4 md:p-8 flex items-center justify-center">
                 <img 
                   src={fileUrl} 
                   alt={file.name}
                   className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none animate-in fade-in zoom-in-95 duration-500"
                 />
              </div>
           ) : isPDF ? (
              <iframe 
                src={`${fileUrl}#view=FitH`}
                className="w-full h-full border-0 bg-zinc-100"
                title={file.name}
              />
           ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-lg">
                 <div className="relative mb-8 group/icon">
                    <div className="absolute inset-0 bg-brand-primary/10 rounded-[32px] blur-2xl group-hover/icon:bg-brand-primary/20 transition-all duration-500" />
                    <div className="relative h-24 w-24 bg-zinc-800 rounded-[32px] flex items-center justify-center text-zinc-500 border border-white/10 shadow-2xl overflow-hidden">
                       <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-primary/30" />
                       <svg className="h-10 w-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 001-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                       </svg>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <h4 className="text-white text-[20px] font-black uppercase tracking-[0.2em]">Engineering Asset Registry</h4>
                    <div className="flex items-center justify-center gap-2">
                       <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-primary text-[10px] font-black uppercase tracking-widest">{fileName.split('.').pop() || 'CAD'} MODEL</span>
                    </div>
                    <p className="text-zinc-500 text-[13px] font-medium leading-relaxed max-w-sm mx-auto pt-2">
                       3D CAD and STP models require specialized local software for precise technical review and mesh verification.
                    </p>
                 </div>

                 <div className="mt-12 flex flex-col items-center gap-4">
                    <a 
                      href={downloadUrl} 
                      download={file.name}
                      className="group/btn relative h-14 px-12 rounded-2xl bg-brand-primary text-zinc-950 text-[12px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl hover:shadow-brand-primary/20 active:scale-95"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      SECURE DOWNLOAD
                      <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </a>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Signed Encryption Token Attached</span>
                 </div>
              </div>
           )}
        </div>
        
        {/* Footer Info */}
        {!isFullscreen && (
           <footer className="px-6 py-2 bg-zinc-950/50 border-t border-white/5 flex justify-center shrink-0">
              <span className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.3em]">Precision Assets Registry • Confidential Engineering Document</span>
           </footer>
        )}
      </div>
    </div>
  );
};

export default AssetPreviewModal;
