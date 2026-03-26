import React from 'react';
import { assetService } from '@/services/assets';

const AssetPreviewModal = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  const getFileUrl = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    // If it's an Appwrite file object (has $id)
    if (file.$id) {
       return assetService.getFileView(file.$id);
    }
    return file.url || ''; 
  };

  const fileUrl = getFileUrl(file);
  const fileName = file.name || file.filename || 'Unknown File';
  const fileSize = file.size || 0;
  const fileType = file.type || file.mimeType || '';

  const isImage = fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|svg)$/i);
  const isPDF = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative bg-zinc-900 w-full max-w-5xl aspect-[16/10] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-zinc-800 rounded-xl flex items-center justify-center text-emerald-500 border border-white/5">
                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <div className="min-w-0">
                 <h3 className="text-white text-[14px] font-black uppercase tracking-widest truncate max-w-sm">{fileName}</h3>
                 <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-tight">{(fileSize / 1024 / 1024).toFixed(2)} MB • Engineering Reference</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <a 
                href={fileUrl} 
                download={file.name}
                className="h-10 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-white/5 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                DOWNLOAD
              </a>
              <button 
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-red-500 transition-all active:scale-90 border border-white/5"
              >
                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-800/20 p-8 flex items-center justify-center relative">
           {isImage ? (
              <img 
                src={fileUrl} 
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded shadow-2xl ring-1 ring-white/10 select-none animate-in fade-in zoom-in-95 duration-500"
              />
           ) : isPDF ? (
              <iframe 
                src={`${fileUrl}#toolbar=0`}
                className="w-full h-full rounded border-0 shadow-2xl bg-white"
                title={file.name}
              />
           ) : (
              <div className="flex flex-col items-center justify-center text-center max-w-md">
                 <div className="h-20 w-20 bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-500 mb-6 border border-white/5">
                    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <h4 className="text-white text-[18px] font-black uppercase tracking-widest mb-2">Native Preview Unavailable</h4>
                 <p className="text-zinc-500 text-[13px] font-medium leading-relaxed mb-8">This file type is not supported for in-browser rendering. Please download the file to view it in its original application.</p>
                 <a 
                   href={fileUrl} 
                   download={file.name}
                   className="h-12 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-3"
                 >
                   <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   Secure Download
                 </a>
              </div>
           )}
        </div>
        
        {/* Footer Info */}
        <footer className="px-6 py-3 bg-zinc-950/50 border-t border-white/5 flex justify-center">
           <span className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em]">Precision Assets Registry • Confidential Engineering Document</span>
        </footer>
      </div>
    </div>
  );
};

export default AssetPreviewModal;
