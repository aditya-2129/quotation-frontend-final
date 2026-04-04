"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { quotationService } from '@/services/quotations';
import { assetService } from '@/services/assets';
import { useRouter } from 'next/navigation';
import ActionButtons from '@/components/shared/ActionButtons';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import QuotationPreviewModal from '@/components/modals/QuotationPreviewModal';
import DownloadOptionsModal from '@/components/modals/DownloadOptionsModal';
import { generateQuotationPDF } from '@/utils/generateQuotationPDF';
import { generateMaterialListPDF } from '@/utils/generateMaterialListPDF';
import { generateSinglePagePDF } from '@/utils/generateSinglePagePDF';
import { generateProcessSheetPDF } from '@/utils/generateProcessSheetPDF';
import { generateBOPListPDF } from '@/utils/generateBOPListPDF';
import { useAuth } from '@/context/AuthContext';

export default function QuotationsPage() {
  const { isAdmin } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, row: null });
  const [errorDetails, setErrorDetails] = useState({ open: false, message: '' });
  const [previewId, setPreviewId] = useState(null);
  const [downloadModal, setDownloadModal] = useState({ open: false, quotation: null });
  const router = useRouter();
  const limit = 25;

  const fetchQuotations = async () => {
    try {
      setIsLoading(true);
      const response = await quotationService.listQuotations(limit, (page - 1) * limit);
      setQuotations(response.documents);
      setTotal(response.total);
    } catch (err) {
      console.error("Failed to fetch quotations:", err);
      setError("Unable to sync with central repository. Verify connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [page]);

  const handleDelete = (quote) => {
     setDeleteConfirm({ open: true, row: quote });
  };

  const handleDownloadTrigger = (quotation) => {
    setDownloadModal({ open: true, quotation });
  };

  const handleDownloadExecution = async (optionId) => {
    const quotation = downloadModal.quotation;
    if (!quotation) return;

    try {
      // For now, we still use the same PDF generator for all options,
      // but we can pass the optionId to it if needed in the future.
      const fullQuote = await quotationService.getQuotation(quotation.$id);
      
      let projectImageUrl = null;
      if (fullQuote.project_image) {
        try {
          const rawImg = fullQuote.project_image;
          const parsedImage = typeof rawImg === 'string' ? JSON.parse(rawImg) : rawImg;
          if (parsedImage && parsedImage.$id) {
            projectImageUrl = assetService.getFileView(parsedImage.$id)?.toString();
          }
        } catch (e) {
          console.warn("Failed to parse project image for PDF in Registry:", e);
        }
      }

      // Close modal before starting generation
      setDownloadModal({ open: false, quotation: null });

      // Note: We could customize based on optionId here
      console.log(`Downloading with option: ${optionId}`);
      if (optionId === 'material') {
        await generateMaterialListPDF(fullQuote);
      } else if (optionId === 'single') {
        await generateSinglePagePDF(fullQuote, projectImageUrl);
      } else if (optionId === 'process') {
        await generateProcessSheetPDF(fullQuote);
      } else if (optionId === 'bop') {
        await generateBOPListPDF(fullQuote);
      } else {
        await generateQuotationPDF(fullQuote, projectImageUrl);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      setErrorDetails({ open: true, message: "Failed to generate PDF. Please try again." });
    }
  };

  const commitDelete = async () => {
    const quote = deleteConfirm.row;
    if (!quote) return;

    try { 
       // For soft delete, we keep the assets for the audit trail.
       // Only the database status is changed so it doesn't appear in lists.
       await quotationService.deleteQuotation(quote.$id); 
       fetchQuotations(); 
    }
    catch (e) { 
       console.error("Cancel cycle failed:", e);
       setErrorDetails({ open: true, message: e.message || "Failed to update record status." });
    } finally {
       setDeleteConfirm({ open: false, row: null });
    }
  };

  return (
    <DashboardLayout 
      title="Project Quotations"
      primaryAction={
        <button 
          onClick={() => window.location.href = '/quotations/new'}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 text-[13px] font-bold text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-95 border border-brand-primary/20"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Project New Valuation
        </button>
      }
    >
      <div className="flex flex-col gap-6">

        {error && (
           <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
              {error}
           </div>
        )}

        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                   <th className="px-6 py-4 text-[10px] font-bold text-zinc-950 uppercase tracking-widest">Quote Vector / ID</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-zinc-950 uppercase tracking-widest">Client Name</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-zinc-950 uppercase tracking-widest">Project Incharge</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-zinc-950 uppercase tracking-widest text-center">Batch Date</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-zinc-950 uppercase tracking-widest text-center">Status</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-zinc-950 uppercase tracking-widest text-right">Valuation Total</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-zinc-950 uppercase tracking-widest text-right">Registry Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {isLoading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                       <td className="px-6 py-4"><div className="h-4 w-28 bg-zinc-100 rounded" /></td>
                       <td className="px-6 py-4"><div className="h-4 w-32 bg-zinc-100 rounded" /></td>
                       <td className="px-6 py-4"><div className="h-4 w-24 bg-zinc-100 rounded" /></td>
                       <td className="px-6 py-4 text-center"><div className="h-4 w-16 bg-zinc-100 rounded mx-auto" /></td>
                       <td className="px-6 py-4 text-center"><div className="h-6 w-16 bg-zinc-100 rounded-full mx-auto" /></td>
                       <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-zinc-100 rounded ml-auto" /></td>
                       <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-zinc-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-zinc-400 italic">
                       No valuations found in central repository.
                    </td>
                  </tr>
                ) : (
                  quotations.map((row) => (
                    <tr key={row.$id} className="group hover:bg-brand-primary/[0.04] even:bg-[#F8FBFC] transition-all duration-200">
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="text-brand-primary font-bold">{row.quotation_no || row.$id.substring(0,8)}</span>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">{row.part_number || 'No Part Ref'}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 font-medium">
                         <span className="truncate max-w-[150px] inline-block">{row.supplier_name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 font-medium">
                         <span className="truncate max-w-[120px] inline-block text-[13px]">{row.quoting_engineer || 'Unassigned'}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-[10px] font-bold font-mono text-zinc-500">
                         {new Date(row.$createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest leading-none ${
                          row.status === 'Completed' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 
                          row.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          row.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          row.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-200' :
                          'bg-zinc-50 text-zinc-500 border border-zinc-200'
                        }`}>
                          {row.status === 'Completed' ? 'Review' : (row.status || 'Draft')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-brand-primary">
                        ₹{parseFloat(row.total_amount || 0).toLocaleString()}
                      </td>
                       <td className="px-6 py-4 text-right">
                         <ActionButtons 
                            onPreview={() => setPreviewId(row.$id)}
                            onDownload={() => handleDownloadTrigger(row)}
                            downloadDisabled={!(row.status === 'Completed' || row.status === 'Approved')}
                            onEdit={() => router.push(`/quotations/edit/${row.$id}`)} 
                            editDisabled={row.status === 'Approved' && !isAdmin}
                            onDelete={() => handleDelete(row)} 
                            deleteDisabled={row.status === 'Approved' && !isAdmin}
                          />
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
             <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                Showing {Math.min(total, (page - 1) * limit + 1)} - {Math.min(total, page * limit)} of {total}
             </div>
             <div className="flex items-center gap-2">
                <button 
                   disabled={page === 1}
                   onClick={() => setPage(p => p - 1)}
                   className="h-8 px-3 rounded-md border border-zinc-200 bg-white text-[11px] font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                   Previous
                </button>
                <div className="flex items-center gap-1 px-2 text-[11px] font-bold text-zinc-900 mono">
                   {page} <span className="text-zinc-300 font-normal">/</span> {Math.ceil(total / limit) || 1}
                </div>
                <button 
                   disabled={page >= Math.ceil(total / limit)}
                   onClick={() => setPage(p => p + 1)}
                   className="h-8 px-3 rounded-md border border-zinc-200 bg-white text-[11px] font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                   Next
                </button>
             </div>
          </div>
        </section>
      </div>

      <ConfirmationModal 
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, row: null })}
        onConfirm={commitDelete}
        title="Cancel Valuation?"
        message={`This will mark ${deleteConfirm.row?.quotation_no || 'this record'} as 'Cancelled'. It will be removed from your active list but will remain in the database for audit history.`}
        confirmText="CANCEL VALUATION"
        cancelText="KEEP ACTIVE"
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

      <QuotationPreviewModal 
        isOpen={!!previewId}
        onClose={() => setPreviewId(null)}
        quotationId={previewId}
      />

      <DownloadOptionsModal 
        isOpen={downloadModal.open}
        onClose={() => setDownloadModal({ open: false, quotation: null })}
        onDownload={handleDownloadExecution}
        quotationNo={downloadModal.quotation?.quotation_no}
      />
    </DashboardLayout>
  );
}
