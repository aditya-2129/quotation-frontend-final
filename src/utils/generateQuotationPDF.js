import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- COMPANY CONFIGURATION ---
const COMPANY = {
  NAME: 'KAIVALYA ENGINEERING',
  TAGLINE: 'Manufacturing & Supply of SPM, Precision Tools, Die & Components',
  ADDRESS_L1: 'Gat No 103, Jyotiba Nagar',
  ADDRESS_L2: 'Talawade, Pune - 411062',
  PHONE: '+91 99224 42211',
  EMAIL: 'sales@kaivalyaengineering.com',
  GSTIN: '27AABCK1234D1Z5',
  STATE: 'Maharashtra CODE:27'
};

const COLORS = {
  PRIMARY: [0, 102, 51],    // Brand Green
  TEXT_DARK: [24, 24, 27],  // Zinc 900
  TEXT_LIGHT: [82, 82, 91], // Zinc 600
  BG_LIGHT: [250, 250, 250],  // Almost White
  BORDER: [212, 212, 216]   // Zinc 300
};

/**
 * Converts a number into Indian Words format
 */
function numberToWords(num) {
    if (num === 0) return "Zero";
    const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "";
    let str = "";
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "Crore " : "";
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "Lakh " : "";
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "Thousand " : "";
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "Hundred " : "";
    str += (n[5] != 0) ? ((str != "") ? "and " : "") + (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) : "";
    return str.trim() + " Only";
}

/**
 * Loads image from URL (proxied for Appwrite)
 */
async function loadImage(src) {
  if (!src) throw new Error("No source");
  try {
    let fetchUrl = src;
    if (src.includes('appwrite') && src.includes('/files/')) {
      const parts = src.split('/files/');
      const fileId = parts[1]?.split('/')[0];
      if (fileId) fetchUrl = `/api/storage/${fileId}`;
    }
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const img = new Image();
        img.onload = () => resolve({ dataUrl, width: img.width, height: img.height });
        img.onerror = () => reject(new Error("Image decode failed"));
        img.src = dataUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("loadImage failed:", src, err);
    throw err;
  }
}

export async function generateQuotationPDF(quote, projectImageUrl = null) {
  if (!quote) return;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20; // Increased margins for breathable cover
  const contentWidth = pageWidth - margin * 2;
  
  let items = [];
  let breakdown = {};
  try { items = JSON.parse(quote.items || '[]'); } catch (e) { items = []; }
  try { breakdown = JSON.parse(quote.detailed_breakdown || '{}'); } catch (e) { breakdown = {}; }

  // ---------------------------------------------------------
  // PAGE 1: COVER PAGE
  // ---------------------------------------------------------
  
  // 1. Sidebar Accent
  doc.setFillColor(...COLORS.PRIMARY);
  doc.rect(0, 0, 10, pageHeight, 'F');
  
  // 2. Logo
  try {
    const { dataUrl } = await loadImage('/KE_Logo.png');
    doc.addImage(dataUrl, 'PNG', 20, 15, 60, 22);
  } catch (e) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.PRIMARY);
    doc.text(COMPANY.NAME, 20, 25);
  }

  // 3. Document Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(38);
  doc.setTextColor(...COLORS.TEXT_DARK);
  doc.text("QUOTATION", 20, 65);
  doc.setLineWidth(1.5);
  doc.setDrawColor(...COLORS.PRIMARY);
  doc.line(20, 70, 70, 70);

  // 4. Project Identity Section
  let y = 85;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.TEXT_LIGHT);
  doc.text("PROJECT REFERENCE:", 20, y);
  
  y += 10;
  doc.setFontSize(26);
  doc.setTextColor(...COLORS.TEXT_DARK);
  const projTitle = (quote.project_name || "Manufacturing Project").toUpperCase();
  const wrappedTitle = doc.splitTextToSize(projTitle, contentWidth);
  doc.text(wrappedTitle, 20, y);
  
  y += (wrappedTitle.length * 10);
  
  // Small QTN Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.TEXT_DARK);
  doc.text(`REFERENCE: ${quote.quotation_no}`, 20, y);
  doc.text(`DATE: ${new Date().toLocaleDateString('en-GB')}`, contentWidth + 20, y, { align: 'right' });

  // 5. Technical Visual (MAXIMIZED)
  const snapshotBoxY = y + 10;
  const snapshotBoxH = pageHeight - snapshotBoxY - 70; // Allocating large central space

  if (projectImageUrl) {
      try {
        const { dataUrl, width, height } = await loadImage(projectImageUrl);
        const imgRatio = width / height;
        const boxRatio = contentWidth / snapshotBoxH;
        
        let dW, dH;
        if (imgRatio > boxRatio) {
            dW = contentWidth;
            dH = contentWidth / imgRatio;
        } else {
            dH = snapshotBoxH;
            dW = snapshotBoxH * imgRatio;
        }
        
        const dX = 20 + (contentWidth - dW) / 2;
        const dY = snapshotBoxY + (snapshotBoxH - dH) / 2;
        
        doc.addImage(dataUrl, 'PNG', dX, dY, dW, dH, undefined, 'FAST');
      } catch (e) {
          doc.setDrawColor(...COLORS.BORDER);
          doc.roundedRect(20, snapshotBoxY, contentWidth, snapshotBoxH, 2, 2, 'D');
          doc.setFontSize(12);
          doc.setTextColor(...COLORS.TEXT_LIGHT);
          doc.text("[ RELEVANT TECHNICAL PORTFOLIO IMAGE ]", pageWidth / 2, snapshotBoxY + (snapshotBoxH / 2), { align: 'center' });
      }
  }

  // 6. Client Footer Section
  const footerY = pageHeight - 45;
  doc.setLineWidth(0.5);
  doc.setDrawColor(...COLORS.BORDER);
  doc.line(20, footerY - 5, contentWidth + 20, footerY - 5);
  
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.TEXT_LIGHT);
  doc.setFont('helvetica', 'bold');
  doc.text("PREPARED FOR", 20, footerY);
  
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.TEXT_DARK);
  doc.text(`M/s ${quote.supplier_name || 'Client'}`, 20, footerY + 8);
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.TEXT_LIGHT);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.contact_person ? `Attn: ${quote.contact_person}` : "", 20, footerY + 14);

  // Bottom Branding Contact
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY.NAME, contentWidth + 20, footerY + 8, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.TEXT_LIGHT);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY.TAGLINE, contentWidth + 20, footerY + 13, { align: 'right' });

  // ---------------------------------------------------------
  // PAGE 2: SUMMARY & COMMERCIALS
  // ---------------------------------------------------------
  doc.addPage();
  const drawPageHeader = (pageNo, totalPages) => {
      doc.setFillColor(...COLORS.BG_LIGHT);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.PRIMARY);
      doc.text(COMPANY.NAME, 20, 12);
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.TEXT_LIGHT);
      doc.text(COMPANY.TAGLINE, 20, 17);
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.TEXT_DARK);
      doc.text(`QTN: ${quote.quotation_no}`, contentWidth + 20, 12, { align: 'right' });
      doc.text(`Page ${pageNo} of ${totalPages}`, contentWidth + 20, 17, { align: 'right' });
  };
  
  drawPageHeader(2, "X");

  let cY = 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.TEXT_DARK);
  doc.text("SECTION 01: COMMERCIAL OFFER", 20, cY);
  cY += 12;

  const projectQty = Number(quote.quantity ?? 1);
  const finalGrandTotal = parseFloat(quote.total_amount || 0);
  const unitRateFormatted = (finalGrandTotal / projectQty).toLocaleString('en-IN', {minimumFractionDigits: 2});
  const totalFormatted = finalGrandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2});

  autoTable(doc, {
    startY: cY,
    margin: { left: 20, right: margin },
    head: [['Ref.', 'Scope of Work / Description', 'Qty.', 'Unit Rate', 'Amount (INR)']],
    body: [[
      "1.0",
      `${quote.project_name || 'Industrial Project'}\n(Engineering, Manufacturing and Precision Finish as per Tech Model)`,
      `${projectQty} Set`,
      `Rs. ${unitRateFormatted}`,
      `Rs. ${totalFormatted}`
    ]],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 6, textColor: [39, 39, 42] },
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right', fontStyle: 'bold' } }
  });

  cY = doc.lastAutoTable.finalY + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`TOTAL PROJECT VALUE: Rs. ${totalFormatted}/-`, 20, cY);
  cY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...COLORS.TEXT_LIGHT);
  doc.text(`(Rupees ${numberToWords(Math.floor(finalGrandTotal))})`, 20, cY);

  cY += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.TEXT_DARK);
  doc.text("STANDARD BUSINESS TERMS", 20, cY);
  cY += 8;
  const terms = [
    "• Delivery: Within mutually agreed schedule from PO date.",
    "• Payment: Standard terms as finalized during commercial review.",
    "• Taxes: GST @ 18% extra as applicable on final invoice.",
    "• Freight: Charged as per actuals or as mentioned.",
    "• Jurisdiction: Subject to Pune courts only."
  ];
  terms.forEach(t => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(t, 20, cY);
    cY += 7;
  });

  // ---------------------------------------------------------
  // PAGE 3: TECHNICAL DATA
  // ---------------------------------------------------------
  doc.addPage();
  drawPageHeader(3, "X");
  
  cY = 40;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("SECTION 02: TECHNICAL PORTFOLIO", 20, cY);
  cY += 12;

  const techRows = items.map((item, i) => [
    i + 1,
    item.part_name || 'Component',
    item.material ? item.material.grade : '—',
    item.material_weight ? `${item.material_weight} kg` : '—',
    (item.processes || []).slice(0, 3).map(p => p.process_name).join(', ') || 'Standard'
  ]);

  autoTable(doc, {
    startY: cY,
    margin: { left: 20, right: margin },
    head: [['Sr.', 'Component', 'Material Grade', 'Weight', 'Primary Ops']],
    body: techRows,
    theme: 'grid',
    styles: { fontSize: 9.5, cellPadding: 4 },
    headStyles: { fillColor: COLORS.PRIMARY }
  });

  // Page Numbers Polish
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.TEXT_LIGHT);
    doc.text(`Page ${i} of ${totalPages}`, contentWidth + 20, 17, { align: 'right' });
    
    if (i === totalPages) {
       const sigY = doc.lastAutoTable.finalY + 30;
       doc.setFont('helvetica', 'bold');
       doc.setTextColor(...COLORS.TEXT_DARK);
       doc.text(`for ${COMPANY.NAME}`, contentWidth + 20, sigY, { align: 'right' });
       doc.setFont('helvetica', 'normal');
       doc.text("Authorized Signatory", contentWidth + 20, sigY + 20, { align: 'right' });
    }
  }

  const filename = `Full_Quotation_${quote.quotation_no}.pdf`;
  doc.save(filename);
}
