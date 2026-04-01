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
 * Loads an image from a URL and returns a base64 data URL + dimensions.
 * For Appwrite storage files, routes through /api/storage/[fileId] proxy
 * to avoid CORS issues entirely.
 */
async function loadImage(src) {
  if (!src) throw new Error("No source");
  
  try {
    // For Appwrite URLs, extract the fileId and use our server-side proxy
    let fetchUrl = src;
    if (src.includes('appwrite') && src.includes('/files/')) {
      const parts = src.split('/files/');
      const fileId = parts[1]?.split('/')[0];
      if (fileId) {
        fetchUrl = `/api/storage/${fileId}`;
      }
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const img = new Image();
        img.onload = () => {
          resolve({
            dataUrl,
            width: img.width,
            height: img.height
          });
        };
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
        const { dataUrl } = await loadImage('/KE_Logo.png');
        // KAIVALYA ENGINEERING logo is wide. Using a proportional bounding box.
        doc.addImage(dataUrl, 'PNG', margin + 2, margin + 3, 48, 18);
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
  
  const markupFactor = 1 + (quote.markup ?? 15)/100;
  const projectQty = Number(quote.quantity ?? 1);

  let calculatedSubtotal = 0;

  items.forEach((item) => {
      const qInSet = parseFloat(item.qty || 1);
      
      let itemBaseCost = 0;
      if (item.material && item.material_weight) {
          itemBaseCost += (item.material_weight * (item.material.base_rate || 0)) * qInSet;
      }
      
      const labor = (item.processes || []).reduce((acc, p) => {
          const rate = parseFloat(p.rate || p.hourly_rate || 0);
          const unit = p.unit || 'hr';
          if (unit === 'hr') {
            const time = (parseFloat(p.setup_time || 0)/projectQty) + (parseFloat(p.cycle_time || 0) * qInSet);
            return acc + (rate * (time / 60));
          }
          return acc + (parseFloat(p.cycle_time || 0) * qInSet * rate);
      }, 0);

      const treatments = (item.treatments || []).reduce((acc, t) => acc + (parseFloat(t.cost || 0) * (t.per_unit !== false ? qInSet : (1/projectQty))), 0);
      
      const unitRate = (itemBaseCost + labor + treatments) * markupFactor;
      const total = unitRate * projectQty;
      calculatedSubtotal += total;
  });

  const totalBopCost = breakdown.bopCost || 0;
  if (totalBopCost > 0) {
      calculatedSubtotal += (totalBopCost * markupFactor * projectQty);
  }

  calculatedSubtotal += (parseFloat(quote.design_cost || 0) + parseFloat(quote.assembly_cost || 0));
  calculatedSubtotal += (parseFloat(quote.packaging_cost || 0) + parseFloat(quote.transportation_cost || 0));

  const finalGrandTotal = calculatedSubtotal;

  // Create "one-liner" for Page 1
  const consolidatedUnitPrice = finalGrandTotal / projectQty;
  const projectParticular = `${quote.project_name || (items[0]?.part_name ?? 'Industrial Components')}\n(Complete set as per model provided, Precision finished & work suitable)\nJob Material: As required`;

  const mainTableData = [[
      "1.",
      projectParticular,
      `${projectQty}\nSet`,
      `Rs. ${consolidatedUnitPrice.toFixed(2)}`,
      `Rs. ${finalGrandTotal.toFixed(2)}`
  ]];
  
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
  
  y = doc.lastAutoTable.finalY + 8;
  
  // Note Section & Summary
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text("Note –", margin, y);
  
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const totalStr = `Grand Total (INR): ${finalGrandTotal.toFixed(2)}/-`;
  doc.text(totalStr, margin, y);
  
  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  const amtInt = Math.floor(finalGrandTotal);
  doc.text(`(Rupees ${numberToWords(amtInt)})`, margin, y);
  
  // Create footer space anchoring it to the bottom of the page
  let footerStartY = pageHeight - margin - 105;
  
  if (y > footerStartY - 5) {
      doc.addPage();
      await drawPage1Header();
      footerStartY = pageHeight - margin - 105;
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
  if (projectImageUrl) {
      try {
        const { dataUrl, width, height } = await loadImage(projectImageUrl);
        
        // Proportional Scaling Logic for Drawing Area
        const boxWidth = contentWidth - (splitFooterX - margin) - 4;
        const boxHeight = footerH - 4;
        
        let dWidth = 0;
        let dHeight = 0;
        const imgRatio = width / height;
        const boxRatio = boxWidth / boxHeight;

        if (imgRatio > boxRatio) {
            dWidth = boxWidth;
            dHeight = boxWidth / imgRatio;
        } else {
            dHeight = boxHeight;
            dWidth = boxHeight * imgRatio;
        }

        // Center within box
        const dX = splitFooterX + 2 + (boxWidth - dWidth) / 2;
        const dY = y + 2 + (boxHeight - dHeight) / 2;

        doc.addImage(dataUrl, 'PNG', dX, dY, dWidth, dHeight, undefined, 'FAST');
      } catch (e) {
          console.error("PDF SNAPSHOT ERROR:", e);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text("Drawing / Reference Model", splitFooterX + ((pageWidth - margin - splitFooterX)/2), y + Math.floor(footerH/2), { align: 'center' });
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
  y += 15; // Positioning from top of thank you rect area
  
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
  
  const materialCost = (breakdown.materialCost || 0) * projectQty;
  const machiningCost = (breakdown.laborCost || 0) * projectQty;
  const treatCost = (breakdown.treatmentCost || 0) * projectQty;
  const bomCost = (breakdown.bopCost || 0) * projectQty;
  const overheads = (parseFloat(quote.design_cost||0) + parseFloat(quote.assembly_cost||0) + parseFloat(quote.packaging_cost||0) + parseFloat(quote.transportation_cost||0));
  const markupReported = quote.markup ?? 15;
  const profitAmt = (materialCost + machiningCost + treatCost + bomCost) * (markupReported / 100);
  const profitStr = `${markupReported}% (Rs. ${profitAmt.toFixed(2)})`;
  
  const p2Data = [
      ["1", "Material Cost", "As req", "", materialCost.toFixed(2), ""],
      ["2", "Machining Cost", "", "", machiningCost.toFixed(2), ""],
      ["3", "Special Machining", "", "", "0.00", ""], 
      ["4", "Treatment", "", "", treatCost.toFixed(2), ""],
      ["5", "Purchased Items (BOP)", "", "See Sec 5", bomCost.toFixed(2), ""],
      ["6", "Miscellaneous Overheads", "", "", overheads.toFixed(2), ""],
      ["7", "Assembly", "", "", parseFloat(quote.assembly_cost||0).toFixed(2), ""],
      ["8", "Profit Margin", "", "", profitStr, ""],
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
      const qInSet = parseFloat(item.qty || 1);

      if (item.processes && item.processes.length > 0) {
          item.processes.forEach((p, idx) => {
             const rate = parseFloat(p.rate || p.hourly_rate || 0);
             const unit = p.unit || 'hr';
             let pCost = 0;
             if (unit === 'hr') {
               const time = (parseFloat(p.setup_time || 0)/projectQty) + (parseFloat(p.cycle_time || 0) * qInSet);
               pCost = rate * (time / 60);
             } else {
               pCost = parseFloat(p.cycle_time || 0) * qInSet * rate;
             }

             p3Data.push([
                 idx === 0 ? String(partIndex) : "",
                 idx === 0 ? item.part_name : "",
                 idx === 0 ? mat : "",
                 p.process_name || '-',
                 `Rs. ${pCost.toFixed(2)}`, 
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

  // BOP Section (Section 5)
  if (breakdown.bought_out_items && breakdown.bought_out_items.length > 0) {
      doc.addPage();
      y = margin;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("QUOTATION - PURCHASED COMPONENTS (BOP) DETAILS", pageWidth / 2, y, { align: 'center' });
      y += 3;
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      const bogData = breakdown.bought_out_items.map((b, bIdx) => [
          String(bIdx + 1),
          b.item_name || '—',
          b.unit || 'pcs',
          b.qty || 0,
          `Rs. ${parseFloat(b.rate || 0).toFixed(2)}`,
          `Rs. ${(parseFloat(b.rate || 0) * (b.qty || 1)).toFixed(2)}`
      ]);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text("Section 5: Additional Purchased Items", margin, y);
      y += 4;

      autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Sr. No.', 'Item Description', 'Unit', 'Qty', 'Rate', 'Total']],
          body: bogData,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 4, lineColor: [0,0,0], lineWidth: 0.2, textColor: [0,0,0] },
          headStyles: { fillColor: [245,245,245], fontStyle: 'bold' },
          foot: [['', 'TOTAL BOP COST', '', '', '', `Rs. ${parseFloat(bomCost).toFixed(2)}`]],
          footStyles: { fillColor: [245,245,245], fontStyle: 'bold', halign: 'right' }
      });
  }

  // Final Output Download
  const filename = `${quote.quotation_no || 'Quotation'}_${quote.supplier_name || 'Client'}.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  doc.save(filename);
}
