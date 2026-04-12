"use client";

import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { THEME } from '@/constants/ui';
import { toast } from 'react-hot-toast';
import { quotationService } from '@/services/quotations-draft';
import { assetService } from '@/services/assets';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Database, ShieldAlert, Download } from 'lucide-react';
import ActionButtons from '@/components/ui/ActionButtons';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import QuotationPreviewModal from '@/components/modals/QuotationPreviewModal';
import DownloadOptionsModal from '@/components/modals/DownloadOptionsModal';
import PdfPreviewModal from '@/components/modals/PdfPreviewModal';
import Pagination from '@/components/ui/Pagination';
import { generateQuotationPDF } from '@/utils/generateQuotationPDF';
import { generateMaterialListPDF } from '@/utils/generateMaterialListPDF';
import { generateSinglePagePDF } from '@/utils/generateSinglePagePDF';
import { generateProcessSheetPDF } from '@/utils/generateProcessSheetPDF';
import { generateBOPListPDF } from '@/utils/generateBOPListPDF';
import { useAuth } from '@/context/AuthContext';
import { useQuotations, useDeleteQuotation } from '@/features/quotations/api/useQuotations';

export default function QuotationsPage() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isLoading } = useQuotations(limit, (page - 1) * limit);
  const deleteQuotation = useDeleteQuotation();

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, row: null });
  const [previewId, setPreviewId] = useState(null);
  const [downloadModal, setDownloadModal] = useState({ open: false, quotation: null });
  const [pdfPreview, setPdfPreview] = useState({ open: false, doc: null, title: '', filename: '' });
  const router = useRouter();

  const quotations = data?.documents || [];
  const total = data?.total || 0;

  const handleDownloadExecution = async (optionId) => {
    const quotation = downloadModal.quotation;
    if (!quotation) return;

    try {
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
          console.warn("Failed to parse project image:", e);
        }
      }

      setDownloadModal({ open: false, quotation: null });

      let doc;
      let title = "PDF Preview";
      let filename = "document.pdf";

      if (optionId === 'material') {
        doc = await generateMaterialListPDF(fullQuote, { save: false });
        title = "Material List";
        filename = `MaterialList_${fullQuote.quotation_no}.pdf`;
      } else if (optionId === 'single') {
        doc = await generateSinglePagePDF(fullQuote, projectImageUrl, { save: false });
        title = "Single Page Quotation";
        filename = `SinglePage_${fullQuote.quotation_no}.pdf`;
      } else if (optionId === 'process') {
        doc = await generateProcessSheetPDF(fullQuote, { save: false });
        title = "Manufacturing Process Sheet";
        filename = `ProcessSheet_${fullQuote.quotation_no}.pdf`;
      } else if (optionId === 'bop') {
        doc = await generateBOPListPDF(fullQuote, { save: false });
        title = "BOP Procurement List";
        filename = `BOP_List_${fullQuote.quotation_no}.pdf`;
      } else {
        doc = await generateQuotationPDF(fullQuote, projectImageUrl, { save: false });
        title = "Full Technical Quotation";
        filename = `Full_Quotation_${fullQuote.quotation_no}.pdf`;
      }

      setPdfPreview({ open: true, doc, title, filename });
    } catch (err) {
      toast.error("Export failed.");
    }
  };

  const commitDelete = async () => {
    if (!deleteConfirm.row) return;
    try { 
       await deleteQuotation.mutateAsync(deleteConfirm.row.$id); 
       toast.success("Valuation Cancelled.");
       setDeleteConfirm({ open: false, row: null });
    } catch (e) { 
       toast.error("Operation failed.");
    }
  };

  return (
    <DashboardLayout 
      title="Project Quotations"
      primaryAction={
        <button 
          onClick={() => router.push('/quotations-draft/new')}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 border border-brand-primary/20"
          style={{ fontSize: THEME.FONT_SIZE.BASE, fontWeight: 'bold' }}
        >
          <Plus className="h-4 w-4" />
          Create New Quotation
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr style={{ fontSize: THEME.FONT_SIZE.TINY }}>
                   <th className="px-6 py-4 font-bold text-zinc-950 uppercase tracking-widest">Quote Vector / ID</th>
                   <th className="px-6 py-4 font-bold text-zinc-950 uppercase tracking-widest">Client Name</th>
                   <th className="px-6 py-4 font-bold text-zinc-950 uppercase tracking-widest">Project Incharge</th>
                   <th className="px-6 py-4 font-bold text-zinc-950 uppercase tracking-widest text-center">Batch Date</th>
                   <th className="px-6 py-4 font-bold text-zinc-950 uppercase tracking-widest text-center">Status</th>
                   <th className="px-6 py-4 font-bold text-zinc-950 uppercase tracking-widest text-right">Valuation Total</th>
                   <th className="px-6 py-4 font-bold text-zinc-950 uppercase tracking-widest text-right">Registry Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {isLoading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                       <td colSpan="7" className="h-16 px-6 bg-zinc-50/10" />
                    </tr>
                  ))
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-zinc-400 italic" style={{ fontSize: THEME.FONT_SIZE.SMALL }}>
                       No valuations found in central repository.
                    </td>
                  </tr>
                ) : (
                  quotations.map((row) => (
                    <tr key={row.$id} className="group hover:bg-brand-primary/[0.04] even:bg-[#F8FBFC] transition-all duration-200">
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="text-brand-primary font-bold" style={{ fontSize: THEME.FONT_SIZE.BASE }}>{row.quotation_no || row.$id.substring(0,8)}</span>
                            <span className="font-mono text-zinc-400 uppercase tracking-tighter" style={{ fontSize: '10px' }}>{row.part_number || 'No Part Ref'}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 font-medium">
                         <span className="truncate max-w-[150px] inline-block" style={{ fontSize: THEME.FONT_SIZE.SMALL }}>{row.supplier_name || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 font-medium">
                         <span className="truncate max-w-[120px] inline-block" style={{ fontSize: THEME.FONT_SIZE.SMALL }}>{row.quoting_engineer || 'Unassigned'}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold font-mono text-zinc-500" style={{ fontSize: '10px' }}>
                         {new Date(row.$createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-1 font-bold uppercase tracking-widest leading-none border ${
                          row.status === 'Completed' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                          row.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          row.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                          'bg-zinc-50 text-zinc-500 border-zinc-200'
                        }`} style={{ fontSize: '9px' }}>
                          {row.status === 'Completed' ? 'Review' : (row.status || 'Draft')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-brand-primary" style={{ fontSize: THEME.FONT_SIZE.BASE }}>
                        ₹{parseFloat(row.total_amount || 0).toLocaleString()}
                      </td>
                       <td className="px-6 py-4 text-right">
                         <ActionButtons 
                            onPreview={() => setPreviewId(row.$id)}
                            onDownload={() => setDownloadModal({ open: true, quotation: row })}
                            downloadDisabled={!(row.status === 'Completed' || row.status === 'Approved')}
                            onEdit={() => router.push(`/quotations-draft/edit?id=${row.$id}`)} 
                            editDisabled={row.status === 'Approved' && !isAdmin}
                            onDelete={() => setDeleteConfirm({ open: true, row: row })} 
                            deleteDisabled={row.status === 'Approved' && !isAdmin}
                          />
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination total={total} page={page} limit={limit} onPageChange={setPage} label="Showing" />
        </section>
      </div>

      <ConfirmationModal 
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, row: null })}
        onConfirm={commitDelete}
        title="Cancel Valuation?"
        message={`This will mark ${deleteConfirm.row?.quotation_no || 'this record'} as 'Cancelled'.`}
        confirmText="CANCEL VALUATION"
        cancelText="KEEP ACTIVE"
        type="danger"
        isLoading={deleteQuotation.isPending}
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

      <PdfPreviewModal 
        isOpen={pdfPreview.open}
        onClose={() => setPdfPreview({ ...pdfPreview, open: false })}
        pdfDoc={pdfPreview.doc}
        title={pdfPreview.title}
        filename={pdfPreview.filename}
      />
    </DashboardLayout>
  );
}
