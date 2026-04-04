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
 * Loads an image from a URL and returns a base64 data URL + dimensions.
 */
async function loadImage(src) {
  if (!src) throw new Error("No source");
  
  try {
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

export async function generateSinglePagePDF(quote, projectImageUrl = null) {
  if (!quote) return;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  
  // Parse breakdown for contact person details
  let breakdown = {};
  try { breakdown = JSON.parse(quote.detailed_breakdown || '{}'); } catch (e) { breakdown = {}; }
  let items = [];
  try { items = JSON.parse(quote.items || '[]'); } catch (e) { items = []; }

  // 1. Header Box
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.rect(margin, margin, contentWidth, 25);
  const rightBlockWidth = 62;
  const rightLineX = pageWidth - margin - rightBlockWidth;
  doc.line(rightLineX, margin, rightLineX, margin + 25);
  
  try {
    const { dataUrl } = await loadImage('/KE_Logo.png');
    doc.addImage(dataUrl, 'PNG', margin + 2, margin + 3, 48, 18);
  } catch (e) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(COMPANY.NAME, margin + 5, margin + 15);
  }
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 102, 51);
  doc.text(`${COMPANY.ADDRESS_L1}`, margin + 55, margin + 8);
  doc.text(`${COMPANY.ADDRESS_L2}`, margin + 55, margin + 12.5);
  doc.text(`Mo. ${COMPANY.PHONE}`, margin + 55, margin + 17);
  doc.text(`Email: ${COMPANY.EMAIL}`, margin + 55, margin + 21.5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.text(".. Shri Swami Samarth ..", rightLineX + rightBlockWidth/2, margin + 5, { align: 'center' });
  doc.setFillColor(128, 0, 128);
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
  
  doc.setDrawColor(0);
  doc.rect(margin, margin + 25, contentWidth, 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(COMPANY.TAGLINE, pageWidth / 2, margin + 30, { align: 'center' });
  
  // 2. Customer Details Box
  const customerBoxY = margin + 32;
  doc.rect(margin, customerBoxY, contentWidth, 25);
  const quoteDetailsX = pageWidth - margin - 70;
  doc.line(quoteDetailsX, customerBoxY, quoteDetailsX, customerBoxY + 25);
  
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
  }
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`SR. NO.    : ${quote.quotation_no}`, quoteDetailsX + 4, customerBoxY + 6);
  doc.text(`DATE         : ${quote.inquiry_date ? new Date(quote.inquiry_date).toLocaleDateString('en-GB') : '-'}`, quoteDetailsX + 4, customerBoxY + 11);
  doc.text(`REF NO.     : ___________`, quoteDetailsX + 4, customerBoxY + 16);
  doc.text(`VALID FOR : 15 DAYS`, quoteDetailsX + 4, customerBoxY + 21);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(0, 51, 153);
  doc.text("For any queries regarding the quotation, feel free to contact the concerned person.", pageWidth / 2, customerBoxY + 29, { align: 'center' });
  
  // 3. Job Work Section
  let jobWorkTitleY = customerBoxY + 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("QUOTATION – JOB WORK", pageWidth / 2, jobWorkTitleY, { align: 'center' });
  
  let topTableLineY = jobWorkTitleY + 2;
  doc.line(margin, topTableLineY, pageWidth - margin, topTableLineY);

  const projectQty = Number(quote.quantity ?? 1);
  const finalGrandTotal = parseFloat(quote.total_amount || 0);
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
      startY: topTableLineY + 1,
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
  
  let y = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text("Note –", margin, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Grand Total (INR): ${finalGrandTotal.toFixed(2)}/-`, margin, y);
  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text(`(Rupees ${numberToWords(Math.floor(finalGrandTotal))})`, margin, y);
  
  // 4. Footer Space Borders
  let footerAreaTopY = topTableLineY + 1;
  let footerGridStartY = pageHeight - margin - 105;
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(margin, footerAreaTopY, margin, footerGridStartY); 
  doc.line(pageWidth - margin, footerAreaTopY, pageWidth - margin, footerGridStartY);
  doc.line(margin, footerGridStartY, pageWidth - margin, footerGridStartY);
  doc.line(margin, footerGridStartY + 1, pageWidth - margin, footerGridStartY + 1);

  // 5. T&C and Snapshot Image Box
  let yFooter = footerGridStartY + 2;
  const footerH = 60;
  doc.rect(margin, yFooter, contentWidth, footerH);
  const splitFooterX = pageWidth/2 + 20;
  doc.line(splitFooterX, yFooter, splitFooterX, yFooter + footerH);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text("Terms & Conditions", margin + 2, yFooter + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text("• E. & O.E.", margin + 2, yFooter + 10);
  doc.text("• Delivery Period: As mention on PO from the order date and advance.", margin + 2, yFooter + 14);
  doc.text("• Payment Terms: As mutually agreed and finalized with the company.", margin + 2, yFooter + 18);
  doc.text("• Taxes & Duties: GST @ 18% extra as applicable.", margin + 2, yFooter + 22);
  doc.text("• Freight: Charged extra at actuals.", margin + 2, yFooter + 26);
  
  doc.line(margin, yFooter + 29, splitFooterX, yFooter + 29);
  doc.setFont('helvetica', 'italic');
  doc.text("We look forward to your valuable order and assure you of our best", margin + 2, yFooter + 33);
  doc.text("quality and timely service.", margin + 2, yFooter + 37);
  doc.setFont('helvetica', 'bold');
  doc.text(`for ${COMPANY.NAME}`, margin + 2, yFooter + 42);
  doc.text("Authorized Signature", margin + 2, yFooter + 58);

  // Right Side: Project Snapshot
  if (projectImageUrl) {
      try {
        const { dataUrl, width, height } = await loadImage(projectImageUrl);
        const boxWidth = pageWidth - margin - splitFooterX - 4;
        const boxHeight = footerH - 4;
        let dWidth, dHeight;
        const imgRatio = width / height;
        const boxRatio = boxWidth / boxHeight;
        if (imgRatio > boxRatio) {
            dWidth = boxWidth;
            dHeight = boxWidth / imgRatio;
        } else {
            dHeight = boxHeight;
            dWidth = boxHeight * imgRatio;
        }
        const dX = splitFooterX + 2 + (boxWidth - dWidth) / 2;
        const dY = yFooter + 2 + (boxHeight - dHeight) / 2;
        doc.addImage(dataUrl, 'PNG', dX, dY, dWidth, dHeight, undefined, 'FAST');
      } catch (e) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(200);
          doc.text("[ Project Model Reference ]", splitFooterX + 5, yFooter + 30);
      }
  }

  // 6. Final Closing Banner
  let yClosing = yFooter + footerH + 2;
  doc.rect(margin, yClosing, contentWidth, 10);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.text(`We thank you for your valuable enquiry and trust this quotation subject to the Terms and conditions given above will find your \napproval. Your order will receive our prompt and careful attention.`, pageWidth / 2, yClosing + 4, { align: 'center', maxWidth: contentWidth - 4 });
  
  // 7. Contact Table
  let yTable = yClosing + 15;
  const incharge = breakdown.quoting_engineer_details || {};
  const inchargeName = incharge.name || quote.quoting_engineer || 'ESTIMATING ENGR';
  const inchargePhone = incharge.mobile || '9922442211';
  const inchargeEmail = incharge.email || 'sales@kaivalyaengineering.com';

  autoTable(doc, {
      startY: yTable,
      margin: { left: margin, right: margin },
      head: [['CONTACT PERSON NAME', 'CALL', 'EMAIL', 'DELIVERY']],
      body: [[inchargeName, inchargePhone, inchargeEmail, 'AS PER PO']],
      theme: 'grid',
      styles: { fontSize: 8, textColor: [0,0,0], cellPadding: 2, halign: 'center', lineColor: [0,0,0], lineWidth: 0.4 },
      headStyles: { fillColor: [230,230,230], fontStyle: 'bold', textColor: [0,0,0] }
  });

  const filename = `SinglePage_${quote.quotation_no || 'QTN'}.pdf`;
  doc.save(filename);
}
