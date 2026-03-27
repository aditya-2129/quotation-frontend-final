import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRAND = { r: 94, g: 192, b: 194 }; // #5EC0C2
const DARK = { r: 24, g: 24, b: 27 };    // zinc-950
const GREY = { r: 113, g: 113, b: 122 }; // zinc-500
const LIGHT_GREY = { r: 228, g: 228, b: 231 }; // zinc-200

/**
 * Generates and downloads a professional quotation PDF.
 * @param {Object} quote - The quotation document from Appwrite.
 */
export async function generateQuotationPDF(quote) {
  if (!quote) return;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Parse data
  let items = [];
  let breakdown = {};
  try { items = JSON.parse(quote.items || '[]'); } catch (e) { items = []; }
  try { breakdown = JSON.parse(quote.detailed_breakdown || '{}'); } catch (e) { breakdown = {}; }

  // ─── Helper Functions ───────────────────────────────────────
  // Use "Rs." instead of ₹ because default jsPDF fonts don't support Unicode ₹
  const fmt = (v) => {
    const num = parseFloat(v || 0);
    return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const fmtNum = (v) => parseFloat(v || 0).toFixed(2);

  const addPageIfNeeded = (requiredSpace = 40) => {
    if (y + requiredSpace > pageHeight - 20) {
      drawFooter(doc, pageWidth, pageHeight);
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const drawSectionHeader = (title) => {
    addPageIfNeeded(20);
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 4, y + 5.5);
    y += 12;
  };

  const drawInfoRow = (label, value, x) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(GREY.r, GREY.g, GREY.b);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(DARK.r, DARK.g, DARK.b);
    const displayVal = String(value ?? '');
    doc.text(displayVal || '-', x, y + 4.5);
  };

  const drawFooter = (d, pw, ph) => {
    d.setDrawColor(LIGHT_GREY.r, LIGHT_GREY.g, LIGHT_GREY.b);
    d.line(margin, ph - 12, pw - margin, ph - 12);
    d.setFont('helvetica', 'normal');
    d.setFontSize(6.5);
    d.setTextColor(GREY.r, GREY.g, GREY.b);
    d.text(`Generated on ${new Date().toLocaleDateString('en-GB')}  |  ${quote.quotation_no || 'Quotation'}`, margin, ph - 8);
    d.text(`Page ${d.internal.getNumberOfPages()}`, pw - margin, ph - 8, { align: 'right' });
  };

  const tableBaseStyles = {
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [DARK.r, DARK.g, DARK.b], lineColor: [LIGHT_GREY.r, LIGHT_GREY.g, LIGHT_GREY.b], lineWidth: 0.15 },
    headStyles: { fillColor: [244, 244, 245], textColor: [GREY.r, GREY.g, GREY.b], fontStyle: 'bold', fontSize: 7 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    theme: 'grid',
    didDrawPage: () => { y = margin; }
  };

  // ─── HEADER BAND ────────────────────────────────────────────
  doc.setFillColor(DARK.r, DARK.g, DARK.b);
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Brand accent line
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 36, pageWidth, 1.5, 'F');

  // Try to load logo
  try {
    const logoImg = await loadImage('/KE_Logo.png');
    doc.addImage(logoImg, 'PNG', margin, 6, 24, 24);
  } catch (e) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text('KE', margin + 4, 22);
  }

  // Header text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('PROJECT QUOTATION', margin + 30, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.text(quote.quotation_no || 'N/A', margin + 30, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(quote.supplier_name || '', margin + 30, 29);

  doc.setFontSize(7.5);
  doc.setTextColor(160, 160, 168);
  const headerRight = `Status: ${quote.status || 'Draft'}  |  Rev: ${quote.revision_no || 'PART @1'}`;
  doc.text(headerRight, pageWidth - margin, 15, { align: 'right' });

  const dateStr = quote.$createdAt ? new Date(quote.$createdAt).toLocaleDateString('en-GB') : '-';
  doc.text(`Date: ${dateStr}`, pageWidth - margin, 21, { align: 'right' });

  y = 44;

  // ─── SECTION 1: PROJECT INFORMATION ─────────────────────────
  drawSectionHeader('Project Information');

  const col1 = margin + 2;
  const col2 = margin + contentWidth * 0.27;
  const col3 = margin + contentWidth * 0.54;
  const col4 = margin + contentWidth * 0.77;

  // Row 1
  drawInfoRow('Quotation ID', quote.quotation_no, col1);
  drawInfoRow('Organization / Customer', quote.supplier_name, col2);
  drawInfoRow('Contact Person', quote.contact_person, col3);
  drawInfoRow('Contact Number', quote.contact_phone, col4);
  y += 11;

  // Row 2
  drawInfoRow('Contact Email', quote.contact_email, col1);
  drawInfoRow('Estimating Engineer', quote.quoting_engineer, col2);
  drawInfoRow('Date Received', quote.inquiry_date ? new Date(quote.inquiry_date).toLocaleDateString('en-GB') : '-', col3);
  drawInfoRow('Expected Delivery', quote.delivery_date ? new Date(quote.delivery_date).toLocaleDateString('en-GB') : '-', col4);
  y += 11;

  // Row 3
  drawInfoRow('Total Quantity', String(quote.quantity || '-'), col1);
  drawInfoRow('Production Mode', quote.production_mode, col2);
  drawInfoRow('Quotation Version', quote.revision_no, col3);
  drawInfoRow('Status', quote.status, col4);
  y += 14;

  // Thin separator
  doc.setDrawColor(LIGHT_GREY.r, LIGHT_GREY.g, LIGHT_GREY.b);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);

  // ─── SECTION 2: BOM / PARTS ─────────────────────────────────
  if (items.length > 0) {
    items.forEach((item, idx) => {
      drawSectionHeader(`Part ${idx + 1}: ${item.part_name || 'Unnamed Part'}  (Qty: ${item.qty || 1})`);

      // Material info
      if (item.material) {
        addPageIfNeeded(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(GREY.r, GREY.g, GREY.b);
        doc.text('RAW MATERIAL', margin + 2, y);
        y += 5;

        drawInfoRow('Material', item.material.name || item.material.material_name, col1);
        drawInfoRow('Grade', item.material.grade, col2);
        drawInfoRow('Rate / kg', `Rs. ${fmtNum(item.material.base_rate)}`, col3);
        drawInfoRow('Weight (kg)', fmtNum(item.material_weight), col4);
        y += 11;

        if (item.shape) {
          const profileMap = { rect: 'Rectangular', round: 'Round Bar', hex: 'Hexagonal' };
          drawInfoRow('Profile', profileMap[item.shape] || item.shape, col1);
          if (item.dimensions) {
            const dimParts = [];
            if (item.dimensions.l) dimParts.push(`L:${item.dimensions.l}`);
            if (item.dimensions.w) dimParts.push(`W:${item.dimensions.w}`);
            if (item.dimensions.t) dimParts.push(`T:${item.dimensions.t}`);
            if (item.dimensions.dia) dimParts.push(`D:${item.dimensions.dia}`);
            if (item.dimensions.af) dimParts.push(`AF:${item.dimensions.af}`);
            drawInfoRow('Dimensions (mm)', dimParts.join('  |  '), col2);
          }
          drawInfoRow('Wastage', `${item.wastage || 0}%`, col4);
          y += 11;
        }
      }

      // Machining Processes Table
      if (item.processes && item.processes.length > 0) {
        addPageIfNeeded(20 + item.processes.length * 8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(GREY.r, GREY.g, GREY.b);
        doc.text('MACHINING OPERATIONS', margin + 2, y);
        y += 4;

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Operation', 'Setup (min)', 'Qty / Time', 'Unit Rate']],
          body: item.processes.map(p => [
            p.dim1 && p.dim2 ? `${p.process_name || '-'}\n(${p.dim1} x ${p.dim2})` : (p.process_name || '-'),
            p.unit === 'hr' ? String(p.setup_time || '0') : '-',
            String(p.cycle_time || '0'),
            `Rs. ${fmtNum(p.rate || p.hourly_rate)} / ${p.unit || 'hr'}`
          ]),
          columnStyles: { 3: { halign: 'right' } },
          ...tableBaseStyles
        });
        y = doc.lastAutoTable.finalY + 6;
      }

      // Treatments Table
      if (item.treatments && item.treatments.length > 0) {
        addPageIfNeeded(20 + item.treatments.length * 8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(GREY.r, GREY.g, GREY.b);
        doc.text('SURFACE FINISHING / TREATMENTS', margin + 2, y);
        y += 4;

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Treatment', 'Per Unit', 'Cost']],
          body: item.treatments.map(t => [
            t.name || '-',
            t.per_unit !== false ? 'Yes' : 'No',
            `Rs. ${fmtNum(t.cost)}`
          ]),
          columnStyles: { 2: { halign: 'right' } },
          ...tableBaseStyles
        });
        y = doc.lastAutoTable.finalY + 6;
      }

      // Inspection
      if (item.inspection && (item.inspection.cmm || item.inspection.mtc)) {
        addPageIfNeeded(18);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(GREY.r, GREY.g, GREY.b);
        doc.text('QUALITY INSPECTION', margin + 2, y);
        y += 5;
        if (item.inspection.cmm) {
          drawInfoRow('CMM Inspection', `Rs. ${fmtNum(item.inspection.cmm_cost)}`, col1);
        }
        if (item.inspection.mtc) {
          drawInfoRow('MTC / Certificate', `Rs. ${fmtNum(item.inspection.mtc_cost)}`, col2);
        }
        y += 11;
      }

      // Bought Out Parts Table
      if (item.bought_out_items && item.bought_out_items.length > 0) {
        addPageIfNeeded(20 + item.bought_out_items.length * 8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(GREY.r, GREY.g, GREY.b);
        doc.text('PURCHASED / BOUGHT OUT PARTS', margin + 2, y);
        y += 4;

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Item', 'Qty', 'Unit Rate', 'Total']],
          body: item.bought_out_items.map(b => [
            b.item_name || '-',
            String(b.qty || 0),
            `Rs. ${fmtNum(b.rate)}`,
            `Rs. ${fmtNum(parseFloat(b.rate || 0) * (b.qty || 1))}`
          ]),
          columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
          ...tableBaseStyles
        });
        y = doc.lastAutoTable.finalY + 6;
      }

      y += 2;
    });
  }

  // ─── SECTION 3: COMMERCIAL ADJUSTMENTS ──────────────────────
  drawSectionHeader('Commercial Adjustments & Logistics');

  drawInfoRow('Design Cost', fmt(quote.design_cost), col1);
  drawInfoRow('Assembly Cost', fmt(quote.assembly_cost), col2);
  drawInfoRow('Packaging Cost', fmt(quote.packaging_cost), col3);
  drawInfoRow('Transportation Cost', fmt(quote.transportation_cost), col4);
  y += 14;

  // ─── SECTION 4: PRICING BREAKDOWN ──────────────────────────
  drawSectionHeader('Pricing Summary');

  addPageIfNeeded(80);

  const summaryData = [
    ['Raw Material Cost', fmt(breakdown.materialCost)],
    ['Manufacturing', fmt((parseFloat(breakdown.laborCost || 0)) + (parseFloat(breakdown.treatmentCost || 0)))],
    ['Purchased Items (BOP)', fmt(breakdown.bopCost)],
    ['Design & Assembly', fmt(breakdown.engineeringCost)],
    ['Packing & Shipping', fmt(breakdown.commercialCost)],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Cost Component', 'Amount']],
    body: summaryData,
    styles: { fontSize: 9, cellPadding: 3.5, textColor: [DARK.r, DARK.g, DARK.b], lineColor: [LIGHT_GREY.r, LIGHT_GREY.g, LIGHT_GREY.b], lineWidth: 0.15 },
    headStyles: { fillColor: [DARK.r, DARK.g, DARK.b], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' }
    },
    theme: 'grid',
    didDrawPage: () => { y = margin; }
  });
  y = doc.lastAutoTable.finalY + 3;

  // Subtotal
  addPageIfNeeded(45);
  doc.setDrawColor(LIGHT_GREY.r, LIGHT_GREY.g, LIGHT_GREY.b);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(GREY.r, GREY.g, GREY.b);
  doc.text('Manufacturing Cost (Subtotal)', margin + 2, y);
  doc.setTextColor(DARK.r, DARK.g, DARK.b);
  doc.text(fmt(breakdown.subtotal || quote.subtotal), pageWidth - margin, y, { align: 'right' });
  y += 8;

  doc.setTextColor(GREY.r, GREY.g, GREY.b);
  doc.setFontSize(8);
  doc.text(`Profit Margin: ${quote.markup || 0}%`, margin + 2, y);
  y += 10;

  // ─── FINAL TOTAL BOX ───────────────────────────────────────
  doc.setFillColor(DARK.r, DARK.g, DARK.b);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');

  // Accent bar inside box
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(margin, y, 3, 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.text('FINAL QUOTATION TOTAL', margin + 8, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(fmt(quote.total_amount), pageWidth - margin - 6, y + 14, { align: 'right' });

  if (quote.quantity > 1) {
    doc.setFontSize(8);
    doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
    doc.text(`Unit Price: ${fmt(parseFloat(quote.total_amount || 0) / (quote.quantity || 1))}  |  Qty: ${quote.quantity}`, margin + 8, y + 15);
  }

  y += 26;

  // ─── FOOTER ON ALL PAGES ────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, pageWidth, pageHeight);
  }

  // Download
  const filename = `${quote.quotation_no || 'Quotation'}_${quote.supplier_name || 'Client'}.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  doc.save(filename);
}

/**
 * Loads an image from a URL and returns a base64 data URL.
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
}
