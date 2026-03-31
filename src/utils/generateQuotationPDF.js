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

/**
 * Converts a number into Indian Words format (Rupees ... Only)
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
 * Loads an image from a URL and returns a base64 data URL.
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return reject("No source");
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

export async function generateQuotationPDF(quote, projectImageUrl = null) {
  if (!quote) return;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10; // 10mm margins for a tight industrial layout
  const contentWidth = pageWidth - margin * 2;
  
  // Parse data
  let items = [];
  let breakdown = {};
  try { items = JSON.parse(quote.items || '[]'); } catch (e) { items = []; }
  try { breakdown = JSON.parse(quote.detailed_breakdown || '{}'); } catch (e) { breakdown = {}; }

  // ─── PAGE 1 HEADER ──────────────────────────────────────────
  const drawPage1Header = async () => {
      // 1. Header Box
      doc.setDrawColor(0);
      doc.setLineWidth(0.4);
      doc.rect(margin, margin, contentWidth, 25); // Main Header Box
      
      // Vertical line separating Right Side (GST Block)
      const rightBlockWidth = 62;
      const rightLineX = pageWidth - margin - rightBlockWidth;
      doc.line(rightLineX, margin, rightLineX, margin + 25);
      
      // Inside Left Block
      // Try to Load Logo
      let logoWidth = 0;
      try {
        const logoImg = await loadImage('/KE_Logo.png');
        // KAIVALYA ENGINEERING logo is wide. Using a proportional bounding box.
        doc.addImage(logoImg, 'PNG', margin + 2, margin + 3, 48, 18);
        logoWidth = 48;
      } catch (e) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(COMPANY.NAME, margin + 5, margin + 15);
        logoWidth = doc.getTextWidth(COMPANY.NAME) + 5;
      }
      
      const textStartX = margin + logoWidth + 5;
      
      // Company Info (Address & Email) stacked to prevent overflow
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 102, 51); // Dark green
      doc.text(`${COMPANY.ADDRESS_L1}`, textStartX, margin + 8);
      doc.text(`${COMPANY.ADDRESS_L2}`, textStartX, margin + 12.5);
      doc.text(`Mo. ${COMPANY.PHONE}`, textStartX, margin + 17);
      doc.text(`Email: ${COMPANY.EMAIL}`, textStartX, margin + 21.5);
      
      // Inside Right Block (GST)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0);
      doc.text(".. Shri Swami Samarth ..", rightLineX + rightBlockWidth/2, margin + 5, { align: 'center' });
      
      // Purple "QUOTATION" Box
      doc.setFillColor(128, 0, 128); // Purple
      doc.rect(rightLineX + 2, margin + 7, rightBlockWidth - 4, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255);
      doc.text("QUOTATION", rightLineX + rightBlockWidth/2, margin + 12, { align: 'center', charSpace: 1 });
      
      doc.setTextColor(0, 102, 51);
      doc.setFontSize(9);
      doc.text(`GSTN : ${COMPANY.GSTIN}`, rightLineX + 2, margin + 19);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`STATE : ${COMPANY.STATE}`, rightLineX + 2, margin + 23);
      
      // Tagline box below header
      doc.setDrawColor(0);
      doc.setFillColor(255);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.rect(margin, margin + 25, contentWidth, 7);
      doc.text(COMPANY.TAGLINE, pageWidth / 2, margin + 30, { align: 'center' });
      
      // Customer details + Quote Details Box
      const customerBoxY = margin + 32;
      doc.rect(margin, customerBoxY, contentWidth, 25);
      
      // Inner Vertical Line
      const quoteDetailsX = pageWidth - margin - 70;
      doc.line(quoteDetailsX, customerBoxY, quoteDetailsX, customerBoxY + 25);
      
      // Left: Customer Info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("To", margin + 2, customerBoxY + 5);
      doc.text(`M/s ${quote.supplier_name || ''}`, margin + 10, customerBoxY + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      let cY = customerBoxY + 10;
      if (quote.contact_person) {
          const addressLines = doc.splitTextToSize(`Attn: ${quote.contact_person}`, quoteDetailsX - margin - 12);
          doc.text(addressLines, margin + 10, cY);
          cY += (addressLines.length * 4.5);
      }
      doc.text(`Email: ${quote.contact_email || '-'}`, margin + 10, cY);
      cY += 4.5;
      doc.text(`Phone: ${quote.contact_phone || '-'}`, margin + 10, cY);
      cY += 4.5;
      if (quote.project_name) {
         doc.setFont('helvetica', 'bold');
         doc.text(`Project: ${quote.project_name}`, margin + 10, cY);
         doc.setFont('helvetica', 'normal');
         cY += 4.5;
      }
      doc.text(`GSTIN/UIN : ___________`, margin + 10, cY);
      
      // Right: Quote Info
      doc.setFontSize(9);
      doc.text(`SR. NO.    : ${quote.quotation_no}`, quoteDetailsX + 4, customerBoxY + 6);
      doc.text(`DATE         : ${quote.inquiry_date ? new Date(quote.inquiry_date).toLocaleDateString('en-GB') : '-'}`, quoteDetailsX + 4, customerBoxY + 11);
      doc.text(`REF NO.     : ___________`, quoteDetailsX + 4, customerBoxY + 16);
      doc.text(`VALID FOR : 15 DAYS`, quoteDetailsX + 4, customerBoxY + 21);
      
      // Disclaimer Text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(0, 51, 153);
      doc.text("For any queries regarding the quotation, feel free to contact the concerned person.", pageWidth / 2, customerBoxY + 29, { align: 'center' });
  };

  // ─── EXECUTE PAGE 1 ───────────────────────────────────────────
  await drawPage1Header();
  
  let jobWorkTitleY = margin + 32 + 25 + 10; // Increased spacing to prevent overlap with disclaimer
  
  // Job Work title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("QUOTATION – JOB WORK", pageWidth / 2, jobWorkTitleY, { align: 'center' });
  
  let topTableLineY = jobWorkTitleY + 2;
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(margin, topTableLineY, pageWidth - margin, topTableLineY); // Top table line
  doc.setLineWidth(0.15);
  doc.line(margin, topTableLineY + 1, pageWidth - margin, topTableLineY + 1); // Double line effect

  let y = topTableLineY + 3;
  
  const mainTableData = items.map((item, idx) => {
      const partDesc = `${item.part_name}\n(Complete set as per model provided, Precision finished & work suitable)\nJob Material: ${item.material?.grade || 'As required'}`;
      
      const q = parseFloat(item.qty || 1);
      
      let pCost = 0;
      if (item.material && item.material_weight) pCost += (item.material_weight * (item.material.base_rate || 0));
      
      const labor = (item.processes || []).reduce((acc, p) => {
          const rate = parseFloat(p.rate || p.hourly_rate || 0);
          const unit = p.unit || 'hr';
          if (unit === 'hr') {
            const time = (parseFloat(p.setup_time || 0)/q) + parseFloat(p.cycle_time || 0);
            return acc + (rate * (time / 60));
          }
          return acc + (parseFloat(p.cycle_time || 0) * rate);
      }, 0);
      pCost += labor;

      const treatments = (item.treatments || []).reduce((acc, t) => acc + parseFloat(t.cost || 0)/(t.per_unit !== false ? 1 : q), 0);
      const bops = (item.bought_out_items || []).reduce((acc, b) => acc + (parseFloat(b.rate || 0) * (parseFloat(b.qty || 1))), 0);
      pCost += (treatments + bops);
      
      const unitPrice = pCost * (1 + (quote.markup || 15)/100);
      const total = unitPrice * q;
      
      return [
          idx + 1 + ".",
          partDesc,
          `${q}\nSet`,
          unitPrice.toFixed(2),
          total.toFixed(2)
      ];
  });

  // Project Extras as separate rows
  const engTotal = (parseFloat(quote.design_cost || 0) + parseFloat(quote.assembly_cost || 0));
  const logTotal = (parseFloat(quote.packaging_cost || 0) + parseFloat(quote.transportation_cost || 0));

  if (engTotal > 0) {
      mainTableData.push(["", "Design, Engineering & Assembly Fees (One-time)", "1 Lot", engTotal.toFixed(2), engTotal.toFixed(2)]);
  }
  if (logTotal > 0) {
      mainTableData.push(["", "Packing, Logistics & Shipping Costs (Consolidated)", "1 Lot", logTotal.toFixed(2), logTotal.toFixed(2)]);
  }
  
  autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Sr. No.', 'Particular', 'Qty.', 'Unit Price', 'Total Price (INR)']],
      body: mainTableData,
      theme: 'plain',
      styles: { fontSize: 9, textColor: [0,0,0], cellPadding: 2 },
      headStyles: { fontStyle: 'bold' },
      columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 'auto' },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'right', cellWidth: 25 },
          4: { halign: 'right', fontStyle: 'bold', cellWidth: 30 }
      },
      didDrawCell: function(data) {
          if (data.row.index === 0 && data.section === 'head') {
              doc.setDrawColor(0);
              doc.setLineWidth(0.4);
              doc.line(margin, data.cell.y + data.cell.height, pageWidth - margin, data.cell.y + data.cell.height);
          }
      }
  });
  
  y = doc.lastAutoTable.finalY + 15;
  
  // Note Section & Summary
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text("Note –", margin, y);
  
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const totalStr = `Grand Total (INR): ${breakdown.finalTotal ? breakdown.finalTotal.toFixed(2) : parseFloat(quote.total_amount).toFixed(2)}/-`;
  doc.text(totalStr, margin, y);
  
  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  const amtInt = Math.floor(breakdown.finalTotal || parseFloat(quote.total_amount));
  doc.text(`(Rupees ${numberToWords(amtInt)})`, margin, y);
  
  // Create footer space anchoring it to the bottom of the page
  let footerStartY = pageHeight - margin - 98;
  
  if (y > footerStartY - 10) {
      doc.addPage();
      await drawPage1Header();
      footerStartY = pageHeight - margin - 98;
  }
  
  
  y = footerStartY;
  
  // Fill the empty page gap structurally
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(margin, topTableLineY, margin, footerStartY); // Left outer border bounding main work area
  doc.line(pageWidth - margin, topTableLineY, pageWidth - margin, footerStartY); // Right outer border
  
  const footerH = 60;
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  
  doc.line(margin, y, pageWidth - margin, y);
  doc.line(margin, y + 1, pageWidth - margin, y + 1);
  
  y += 2;
  
  // Main Footer Rectangle
  doc.rect(margin, y, contentWidth, footerH);
  
  // Split Line
  const splitFooterX = pageWidth/2 + 20;
  doc.line(splitFooterX, y, splitFooterX, y + footerH);
  
  // Left: T&C
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text("Terms & Conditions", margin + 2, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text("• E. & O.E.", margin + 2, y + 10);
  doc.text("• Delivery Period: As mention on PO from the order date and advance.", margin + 2, y + 14);
  doc.text("• Payment Terms: As mutually agreed and finalized with the company.", margin + 2, y + 18);
  doc.text("• Taxes & Duties: GST @ 18% extra as applicable.", margin + 2, y + 22);
  doc.text("• Freight: Charged extra at actuals.", margin + 2, y + 26);
  
  // We look forward text
  doc.line(margin, y + 29, splitFooterX, y + 29); // Inner separator line
  doc.setFont('helvetica', 'italic');
  doc.text("We look forward to your valuable order and assure you of our best", margin + 2, y + 33);
  doc.text("quality and timely service.", margin + 2, y + 37);
  
  // Signature
  doc.setFont('helvetica', 'bold');
  doc.text(`for ${COMPANY.NAME}`, margin + 2, y + 42);
  doc.text("Authorized Signature", margin + 2, y + 58);
  
  // Right: Drawing Box
  // For the actual web app implementation, handling an image here is tricky unless passed from the UI
  // but if projectImageUrl is available, output it. Else leave blank for user stamp.
  if (projectImageUrl) {
      try {
        const drawImg = await loadImage(projectImageUrl);
        doc.addImage(drawImg, 'PNG', splitFooterX + 2, y + 2, contentWidth - (splitFooterX - margin) - 4, footerH - 4, undefined, 'FAST');
      } catch (e) {
          doc.text("Drawing / Reference Model", splitFooterX + 5, y + 30);
      }
  } else {
     doc.setFont('helvetica', 'normal');
     doc.setFontSize(8);
     doc.setTextColor(150);
     doc.text("[ Reference Drawing Area ]", splitFooterX + ((pageWidth - margin - splitFooterX)/2), y + Math.floor(footerH/2), { align: 'center' });
  }
  
  // Thank you closing bar
  y += footerH + 2;
  doc.setDrawColor(0);
  doc.rect(margin, y, contentWidth, 10);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.text(`We thank you for your valuable enquiry and trust this quotation subject to the Terms and conditions given above will find your \napproval. Your order will receive our prompt and careful attention.`, pageWidth / 2, y + 4, { align: 'center', maxWidth: contentWidth - 4 });
  
  // Final Footer Contact Row
  y += 12;
  
  // Use dynamically selected Project Incharge details if available, else fallback to company defaults
  const incharge = breakdown.quoting_engineer_details || {};
  const inchargeName = incharge.name || quote.quoting_engineer || 'ESTIMATING ENGR';
  const inchargePhone = incharge.mobile || COMPANY.PHONE;
  const inchargeEmail = incharge.email || COMPANY.EMAIL;

  autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['CONTACT PERSON NAME', 'CALL', 'EMAIL', 'DELIVERY']],
      body: [
          [inchargeName, inchargePhone, inchargeEmail, 'AS PER PO']
      ],
      theme: 'grid',
      styles: { fontSize: 8, textColor: [0,0,0], cellPadding: 2, halign: 'center', lineColor: [0,0,0], lineWidth: 0.4 },
      headStyles: { fillColor: [230,230,230], fontStyle: 'bold', textColor: [0,0,0] }
  });
  
  // ─── PAGE 2: MATERIAL & PROCESS DETAILS ───────────────────────
  doc.addPage();
  y = margin;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const title = `QUOTATION – MATERIAL AND PROCESS DETAILS${quote.project_name ? ` (${quote.project_name})` : ''}`;
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 3;
  
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`With reference to QUOTATION No. ${quote.quotation_no} following details`, margin, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text("Technical Details", margin, y);
  y += 2;
  
  const materialCost = breakdown.materialCost || 0;
  const machiningCost = breakdown.laborCost || 0;
  const treatCost = breakdown.treatmentCost || 0;
  const bomCost = breakdown.bopCost || 0;
  const overheads = (parseFloat(quote.design_cost||0) + parseFloat(quote.assembly_cost||0) + parseFloat(quote.packaging_cost||0) + parseFloat(quote.transportation_cost||0));
  const profitStr = `${quote.markup || 0}%`;
  
  const p2Data = [
      ["1", "Material Cost", "As req", "", materialCost.toFixed(2), ""],
      ["2", "Machining Cost", "", "", machiningCost.toFixed(2), ""],
      ["3", "Special Machining", "", "", "0.00", ""], 
      ["4", "Treatment", "", "", treatCost.toFixed(2), ""],
      ["5", "BOM", "", "", bomCost.toFixed(2), ""],
      ["6", "Miscellaneous Overheads", "", "", overheads.toFixed(2), ""],
      ["7", "Assembly", "", "", parseFloat(quote.assembly_cost||0).toFixed(2), ""],
      ["8", "Profit", "", "", profitStr, ""],
      ["9", "", "", "", "", ""]
  ];
  
  autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Sr. No.', 'Particular', 'Material', 'Detail', 'Cost', 'Remarks']],
      body: p2Data,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, lineColor: [0,0,0], lineWidth: 0.2, textColor: [0,0,0] },
      headStyles: { fillColor: [245,245,245], fontStyle: 'bold' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 15 } }
  });
  
  // ─── PAGE 3: TECHNICAL PROCESS DETAILS ────────────────────────
  doc.addPage();
  y = margin;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("QUOTATION - TECHNICAL PROCESS DETAILS", pageWidth / 2, y, { align: 'center' });
  y += 3;
  
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`With reference to QUOTATION No. ${quote.quotation_no} following details`, margin, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text("Technical Details", margin, y);
  y += 2;
  
  const p3Data = [];
  let partIndex = 1;
  items.forEach(item => {
      const mat = item.material ? item.material.grade : '—';
      if (item.processes && item.processes.length > 0) {
          item.processes.forEach((p, idx) => {
             p3Data.push([
                 idx === 0 ? String(partIndex) : "",
                 idx === 0 ? item.part_name : "",
                 idx === 0 ? mat : "",
                 p.process_name || '-',
                 `-`, 
                 `-`
             ]);
          });
      } else {
          p3Data.push([ String(partIndex), item.part_name, mat, "-", "-", "-" ]);
      }
      partIndex++;
  });
  
  while(p3Data.length < 5) p3Data.push(["", "", "", "", "", ""]);
  
  autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Sr. No.', 'Part Name', 'Material', 'Process', 'Cost', 'Remarks']],
      body: p3Data,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, lineColor: [0,0,0], lineWidth: 0.2, textColor: [0,0,0] },
      headStyles: { fillColor: [245,245,245], fontStyle: 'bold' },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 15 } }
  });

  // Final Output Download
  const filename = `${quote.quotation_no || 'Quotation'}_${quote.supplier_name || 'Client'}.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  doc.save(filename);
}
