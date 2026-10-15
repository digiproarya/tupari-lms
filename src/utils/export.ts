import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export Utility untuk TUPARI LMS
 * Mendukung export ke Excel dan PDF
 */

// ==================== EXCEL EXPORT ====================

export function exportToExcel(data: any[], filename: string, sheetName: string = 'Data') {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
    }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return { success: true };
  } catch (error) {
    console.error('Export Excel error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function exportMultipleSheets(sheets: { name: string; data: any[] }[], filename: string) {
  try {
    const wb = XLSX.utils.book_new();
    
    sheets.forEach(sheet => {
      const ws = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return { success: true };
  } catch (error) {
    console.error('Export Excel error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ==================== PDF EXPORT ====================

export function exportToPDF(
  title: string,
  headers: string[],
  data: any[][],
  filename: string,
  options?: {
    subtitle?: string;
    footer?: string;
    orientation?: 'portrait' | 'landscape';
  }
) {
  try {
    const { subtitle, footer, orientation = 'portrait' } = options || {};
    const doc = new jsPDF(orientation, 'mm', 'a4');
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);
    
    // Subtitle
    if (subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 14, 28);
    }
    
    // Date
    doc.setFontSize(10);
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, subtitle ? 34 : 28);
    
    // Table
    const startY = subtitle ? 40 : 34;
    (doc as any).autoTable({
      head: [headers],
      body: data,
      startY: startY,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });
    
    // Footer
    if (footer) {
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(footer, 14, doc.internal.pageSize.height - 10);
        doc.text(`Halaman ${i} dari ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
    }
    
    doc.save(`${filename}.pdf`);
    return { success: true };
  } catch (error) {
    console.error('Export PDF error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ==================== SPECIFIC EXPORTS ====================

export function exportStudentsToExcel(students: any[], filename: string = 'Data_Siswa') {
  const data = students.map(s => ({
    'NIS': s.nis,
    'NISN': s.nisn,
    'Nama': s.name,
    'Kelas': s.className || '-',
    'L/P': s.gender,
    'Tanggal Lahir': s.birthDate,
    'Nama Ortu': s.parentName,
    'No. HP Ortu': s.parentPhone,
    'Status': s.status === 'active' ? 'Aktif' : 'Nonaktif',
  }));
  
  return exportToExcel(data, filename, 'Siswa');
}

export function exportStudentsToPDF(students: any[], schoolName: string) {
  const headers = ['No', 'NIS', 'NISN', 'Nama', 'Kelas', 'L/P', 'Status'];
  const data = students.map((s, i) => [
    i + 1,
    s.nis,
    s.nisn,
    s.name,
    s.className || '-',
    s.gender,
    s.status === 'active' ? 'Aktif' : 'Nonaktif',
  ]);
  
  return exportToPDF(
    'Data Siswa',
    headers,
    data,
    'Data_Siswa',
    {
      subtitle: schoolName,
      footer: 'Dokumen ini dicetak otomatis dari TUPARI LMS',
    }
  );
}

export function exportGradesToExcel(grades: any[], filename: string = 'Rekap_Nilai') {
  const data = grades.map(g => ({
    'Siswa': g.studentName,
    'Kelas': g.className,
    'Mata Pelajaran': g.subjectName,
    'Jenis': g.type.toUpperCase(),
    'Nilai': g.score,
    'Nilai Maksimal': g.maxScore,
    'Bobot': `${g.weight}%`,
    'Status': g.score >= 75 ? 'Tuntas' : 'Belum Tuntas',
  }));
  
  return exportToExcel(data, filename, 'Nilai');
}

export function exportAttendanceToExcel(attendance: any[], filename: string = 'Rekap_Presensi') {
  const data = attendance.map(a => ({
    'Tanggal': a.date,
    'Siswa': a.studentName,
    'Kelas': a.className,
    'Status': a.status.charAt(0).toUpperCase() + a.status.slice(1),
    'Keterangan': a.note || '-',
  }));
  
  return exportToExcel(data, filename, 'Presensi');
}

export function exportAttendanceToPDF(attendance: any[], className: string, date: string) {
  const headers = ['No', 'Nama Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Keterangan'];
  const data = attendance.map((a, i) => [
    i + 1,
    a.studentName,
    a.status === 'hadir' ? '✓' : '',
    a.status === 'sakit' ? '✓' : '',
    a.status === 'izin' ? '✓' : '',
    a.status === 'alpa' ? '✓' : '',
    a.note || '-',
  ]);
  
  return exportToPDF(
    'Daftar Hadir',
    headers,
    data,
    `Presensi_${className}_${date}`,
    {
      subtitle: `Kelas: ${className} | Tanggal: ${date}`,
      footer: 'Dokumen ini dicetak otomatis dari TUPARI LMS',
    }
  );
}

// ==================== CSV EXPORT ====================

export function exportToCSV(data: any[], filename: string) {
  try {
    if (data.length === 0) {
      return { success: false, error: 'No data to export' };
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    return { success: true };
  } catch (error) {
    console.error('Export CSV error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
