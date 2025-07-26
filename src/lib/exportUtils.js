import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

/**
 * Export an array of objects as a CSV file
 * @param {Array} data - Array of objects
 * @param {string} filename - Name of the file
 */
export function exportToCSV(data, filename = "export.csv") {
  // Replace any literal arrow with Unicode escape for CSV
  const safeData = data.map(row => {
    const newRow = { ...row };
    if (newRow.Account && typeof newRow.Account === 'string') {
      newRow.Account = newRow.Account.replace(/→|&rarr;|&#8594;/g, '\u2192');
    }
    return newRow;
  });
  const csv = Papa.unparse(safeData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export an array of objects as a PDF table
 * @param {Array} data - Array of objects
 * @param {string} filename - Name of the file
 * @param {string} title - Title for the PDF
 */
export function exportToPDF(data, filename = "export.pdf", title = "Exported Data") {
  // Replace any literal arrow with Unicode escape for PDF
  const safeData = data.map(row => {
    const newRow = { ...row };
    if (newRow.Account && typeof newRow.Account === 'string') {
      newRow.Account = newRow.Account.replace(/→|&rarr;|&#8594;/g, '\u2192');
    }
    return newRow;
  });
  // jsPDF default font supports Unicode arrows in most environments
  const doc = new jsPDF({ encoding: 'windows-1252' });
  doc.setFont('helvetica');
  const columns = Object.keys(safeData[0] || {});
  const rows = safeData.map(obj => columns.map(col => obj[col]));

  doc.text(title, 14, 16);
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 22,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [79, 209, 199] },
  });
  doc.save(filename);
}
