// src/components/admin/reports/utils/exportUtils.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper function to convert table data to CSV format
export const tableToCSV = (table: HTMLTableElement) => {
  const rows = Array.from(table.querySelectorAll('tr'));
  
  return rows.map(row => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    return cells.map(cell => `"${cell.textContent?.replace(/"/g, '""') || ''}"`).join(',');
  }).join('\n');
};

// Helper function to download data as a file
export const downloadFile = (data: string, filename: string, type: string) => {
  const blob = new Blob([data], { type });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export table data to XLS format
export const exportToXLS = (table: HTMLTableElement, reportType: string) => {
  // Simple XLS format (actually HTML that Excel can open)
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${reportType === "coach performance" ? "Coach Performance" : "Sales Statistics"}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table, th, td {
          border: 1px solid black;
          border-collapse: collapse;
          padding: 5px;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      ${table.outerHTML}
    </body>
    </html>
  `;
  
  downloadFile(html, `${reportType.replace(/\s+/g, '_')}_report.xls`, 'application/vnd.ms-excel');
};

// Export table data to CSV format
export const exportToCSV = (table: HTMLTableElement, reportType: string) => {
  const csv = tableToCSV(table);
  downloadFile(csv, `${reportType.replace(/\s+/g, '_')}_report.csv`, 'text/csv');
};

// Export table data to PDF format
export const exportToPDF = (table: HTMLTableElement, reportType: string) => {
  try {
    console.log("Starting PDF export");
    
    // Create a new document
    const doc = new jsPDF();
    console.log("jsPDF instance created");
    
    // Add title
    doc.text(`${reportType} Report`, 14, 16);
    console.log("Title added");
    
    // Get headers and rows
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
    console.log("Headers:", headers);
    
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(row => 
      Array.from(row.querySelectorAll('td')).map(td => td.textContent)
    );
    console.log("Rows:", rows);
    
    // Add table to PDF
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      margin: { top: 20 },
      styles: { overflow: 'linebreak' },
      headStyles: { fillColor: [75, 75, 75] }
    });
    console.log("Table added to PDF");
    
    // Save the PDF
    doc.save(`${reportType.replace(/\s+/g, '_')}_report.pdf`);
    console.log("PDF saved");
  } catch (error) {
    console.error("Error generating PDF:", error);
   
  }
};