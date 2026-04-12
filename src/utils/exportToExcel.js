import * as XLSX from 'xlsx';

/**
 * Exports an array of quotation data to an Excel file.
 * @param {Array} data - Array of quotation objects
 * @param {string} fileName - Suggest filename
 */
export const exportQuotationsToExcel = (data, fileName = 'Approved_Quotations.xlsx') => {
  if (!data || data.length === 0) return;

  // Transform data for better spreadsheet readability
  const transformedData = data.map(q => ({
    'Quotation No': q.quotation_no || q.$id.substring(0, 8),
    'Customer': q.supplier_name || 'N/A',
    'Project Name': q.project_name || 'N/A',
    'Part Number': q.part_number || 'N/A',
    'Incharge': q.quoting_engineer || 'Unassigned',
    'Date Approved': new Date(q.$createdAt).toLocaleDateString('en-GB'),
    'Status': q.status,
    'Currency': 'INR',
    'Total Amount': q.total_amount || 0,
    'Unit Price': q.unit_price || 0,
    'Quantity': q.quantity || 1
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(transformedData);
  
  // Set column widths
  const wscols = [
    { wch: 15 }, // Quotation No
    { wch: 25 }, // Customer
    { wch: 25 }, // Project Name
    { wch: 20 }, // Part Number
    { wch: 15 }, // Incharge
    { wch: 15 }, // Date Approved
    { wch: 10 }, // Status
    { wch: 10 }, // Currency
    { wch: 15 }, // Total Amount
    { wch: 15 }, // Unit Price
    { wch: 10 }  // Quantity
  ];
  worksheet['!cols'] = wscols;

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Quotations');

  // Generate and download file
  XLSX.writeFile(workbook, fileName);
};
