"use client";

import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { THEME } from '@/constants/ui';
import { toast } from 'react-hot-toast';
import { approvedQuotationService } from '@/services/quotations-approved';
import { assetService } from '@/services/assets';
import QuotationPreviewModal from '@/components/modals/QuotationPreviewModal';
import DownloadOptionsModal from '@/components/modals/DownloadOptionsModal';
import PdfPreviewModal from '@/components/modals/PdfPreviewModal';
import Pagination from '@/components/ui/Pagination';
import { generateQuotationPDF } from '@/utils/generateQuotationPDF';
import { generateMaterialListPDF } from '@/utils/generateMaterialListPDF';
import { generateSinglePagePDF } from '@/utils/generateSinglePagePDF';
import { generateProcessSheetPDF } from '@/utils/generateProcessSheetPDF';
import { generateBOPListPDF } from '@/utils/generateBOPListPDF';
import { useApprovedQuotations } from '@/features/quotations/api/useApprovedQuotations';
import { useUsers } from '@/features/admin/api/useUsers';
import { Search, Filter, X, Calendar } from 'lucide-react';

export default function ApprovedQuotationsPage() {
  const [page, setPage] = useState(1);
  const limit = 25;
  const [filters, setFilters] = useState({ search: '', engineer: 'All', timePeriod: 'All Time' });

  const { data: usersData } = useUsers();
  const engineers = usersData?.documents || [];

  const { data, isLoading } = useApprovedQuotations(limit, (page - 1) * limit, filters);

  const handleEngineerChange = (e) => {
    setFilters(prev => ({ ...prev, engineer: e.target.value }));
    setPage(1); // Reset to page 1 on server-side filter change
  };

  const handleTimePeriodChange = (e) => {
    setFilters(prev => ({ ...prev, timePeriod: e.target.value }));
    setPage(1);
  };

  const [previewId, setPreviewId] = useState(null);
  const [downloadModal, setDownloadModal] = useState({ open: false, quotation: null });
  const [pdfPreview, setPdfPreview] = useState({ open: false, doc: null, title: '', filename: '' });

  const quotations = data?.documents || [];
  const total = data?.total || 0;

  const filteredQuotations = quotations.filter(q => {
    if (!filters.search) return true;
    const term = filters.search.toLowerCase();
    return (
      (q.quotation_no || '').toLowerCase().includes(term) ||
      (q.supplier_name || '').toLowerCase().includes(term) ||
      (q.part_number || '').toLowerCase().includes(term)
    );
  });

  const handleDownloadExecution = async (optionId) => {
    const quotation = downloadModal.quotation;
    if (!quotation) return;

    try {
      const fullQuote = await approvedQuotationService.getQuotation(quotation.$id);
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

  return (
    <DashboardLayout title="Approved Quotations">
      <div className="flex flex-col gap-6">

        {/* Filters Section */}
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Search Quotations</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search ID, Client, or Part..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full h-10 pl-9 pr-8 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
              />
              {filters.search && (
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 transition"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 md:max-w-[250px] flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Project Incharge</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <select 
                value={filters.engineer}
                onChange={handleEngineerChange}
                className="w-full h-10 pl-9 pr-8 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Incharges</option>
                {engineers.map(u => (
                  <option key={u.$id} value={u.name}>{u.name}</option>
                ))}
              </select>
              {/* Custom dropdown arrow to replace default browser arrow */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="flex-1 md:max-w-[200px] flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Time Period</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <select 
                value={filters.timePeriod}
                onChange={handleTimePeriodChange}
                className="w-full h-10 pl-9 pr-8 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="All Time">All Time</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="This Year">This Year</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </section>

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
                   <th className="px-6 py-4 font-bold text-zinc-950 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {isLoading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                       <td colSpan="7" className="h-16 px-6 bg-zinc-50/10" />
                    </tr>
                  ))
                ) : filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-zinc-400 italic" style={{ fontSize: THEME.FONT_SIZE.SMALL }}>
                       No approved quotations found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((row) => (
                    <tr key={row.$id} className="group hover:bg-emerald-50/40 even:bg-[#F8FBFC] transition-all duration-200">
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
                        <span className="inline-flex rounded-full px-2.5 py-1 font-bold uppercase tracking-widest leading-none border bg-emerald-50 text-emerald-600 border-emerald-200" style={{ fontSize: '9px' }}>
                          Approved
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-brand-primary" style={{ fontSize: THEME.FONT_SIZE.BASE }}>
                        ₹{parseFloat(row.total_amount || 0).toLocaleString()}
                      </td>
                       <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-1.5">
                           {/* Preview */}
                           <button 
                              onClick={() => setPreviewId(row.$id)} 
                              className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm"
                              title="Preview"
                           >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                           </button>
                           {/* Download */}
                           <button 
                              onClick={() => setDownloadModal({ open: true, quotation: row })}
                              className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
                              title="Download PDF"
                           >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                           </button>
                         </div>
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
