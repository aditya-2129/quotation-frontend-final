import React, { useState } from 'react';

export default function RejectionModal({ isOpen, onClose, onConfirm, quotationNo }) {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(reason);
        setReason(''); // Reset after submission
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden shadow-zinc-950/50 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 leading-tight">Reject Quotation</h3>
                        <p className="text-sm text-zinc-500 mt-0.5">{quotationNo ? `#${quotationNo}` : 'This quotation'}</p>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5">
                        <label htmlFor="rejection-reason" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-2">
                            Reason for Rejection <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="rejection-reason"
                            rows={4}
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Briefly explain why this quotation was rejected to help the user resolve the issue..."
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 bg-zinc-50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors custom-scrollbar resize-none"
                        ></textarea>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-xl transition-colors cursor-pointer"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={!reason.trim()}
                            className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95 cursor-pointer"
                        >
                            REJECT QUOTATION
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
