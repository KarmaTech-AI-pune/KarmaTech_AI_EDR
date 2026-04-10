import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, TenantOption } from '../services/billingApi';

// ─── KarmaTech company details (update these as needed) ───────────────────────
const COMPANY = {
  name: 'KarmaTech AI',
  email: 'info@karmatech-ai.com',
  phone: '+91-9850340276, 9850340276', 
  website: 'www.karmatech-ai.com',
  address: '44/102, Navasahyadri Society, Karvenagar, Pune, Maharashtra, India',
  gst: 'GSTIN: 27AAACK1234F1ZX',
};

const LOGO_PATH = '/KarmaTech_logo.png';
const GST_RATE = 0.18; // 18%

// Brand colour used for header strip and accents
const BRAND_R = 25;
const BRAND_G = 70;
const BRAND_B = 140; // dark navy-blue

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtINR(amount: number): string {
  // Use 'INR' instead of '₹' because jsPDF default fonts do not support the 
  // Rupee symbol and render it as a corrupted character (quote or box).
  return 'INR ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}
// ─── Image loader helper ─────────────────────────────────────────────────────
function loadImage(src: string): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      resolve({
         dataUrl: canvas.toDataURL('image/png'),
         width: img.naturalWidth,
         height: img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = src;
  });
}

// ─── Main generator ───────────────────────────────────────────────────────────
export async function generateInvoicePdf(invoice: Invoice, tenant: TenantOption): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();   // 210
  const pageH = doc.internal.pageSize.getHeight();  // 297

  // ── 1. Header background strip ──────────────────────────────────────────────
  doc.setFillColor(BRAND_R, BRAND_G, BRAND_B);
  doc.rect(0, 0, pageW, 42, 'F');

  // ── 2. Company logo (Scaled correctly) ──────────────────────────────────────
  try {
    const img = await loadImage(LOGO_PATH);
    const maxW = 40;
    const maxH = 20;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const renderW = img.width * ratio;
    const renderH = img.height * ratio;
    
    // Vertically center in a 20mm box starting at y=11
    const yOffset = 11 + (maxH - renderH) / 2;
    // Horizontally align starting at x=14
    const xOffset = 14;
    
    doc.addImage(img.dataUrl, 'PNG', xOffset, yOffset, renderW, renderH);
  } catch {
    // If logo fails, just render company name in white
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY.name, 14, 22);
  }

  // ── 3. "INVOICE" title on the right ─────────────────────────────────────────
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', pageW - 14, 20, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`# ${invoice.invoiceId || invoice.id}`, pageW - 14, 27, { align: 'right' });
  doc.text(`Date: ${fmtDate(invoice.createdAt || new Date().toISOString())}`, pageW - 14, 33, { align: 'right' });
  doc.text(`Due: ${fmtDate(invoice.dueDate)}`, pageW - 14, 39, { align: 'right' });

  // ── 4. FROM block (under header) ─────────────────────────────────────────────
  let y = 54;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BRAND_R, BRAND_G, BRAND_B);
  doc.text('FROM', 14, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.text(COMPANY.name, 14, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  
  // Handle long addresses gracefully
  const addressLines = doc.splitTextToSize(COMPANY.address, 85);
  doc.text(addressLines, 14, y);
  y += (4.5 * addressLines.length);

  doc.text(`Email: ${COMPANY.email}`, 14, y);
  y += 5;
  doc.text(`Phone: ${COMPANY.phone}`, 14, y);
  y += 5;
  doc.text(`Web: ${COMPANY.website}`, 14, y);
  y += 5;
  doc.text(COMPANY.gst, 14, y);

  // ── 5. BILLED TO block (right column, aligned to FROM) ───────────────────────
  const billedY = 54;
  const colX = pageW / 2 + 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(BRAND_R, BRAND_G, BRAND_B);
  doc.text('BILLED TO', colX, billedY);

  let by = billedY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(tenant.companyName || tenant.tenantName || tenant.name || '—', colX, by);

  by += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);

  if (tenant.tenantName && tenant.companyName) {
    doc.text(`Tenant: ${tenant.tenantName}`, colX, by);
    by += 5;
  }
  if (tenant.domain) {
    doc.text(`Domain: ${tenant.domain}`, colX, by);
    by += 5;
  }
  if (tenant.contactEmail) {
    doc.text(`Email: ${tenant.contactEmail}`, colX, by);
    by += 5;
  }
  if (tenant.contactPhone) {
    doc.text(`Phone: ${tenant.contactPhone}`, colX, by);
    by += 5;
  }
  if (tenant.status) {
    doc.text(`Status: ${tenant.status}`, colX, by);
    by += 5;
  }
  if (tenant.maxUsers !== undefined || tenant.maxProjects !== undefined) {
    const limits = [];
    if (tenant.maxUsers !== undefined) limits.push(`Users: ${tenant.maxUsers}`);
    if (tenant.maxProjects !== undefined) limits.push(`Projects: ${tenant.maxProjects}`);
    if (tenant.isIsolated) limits.push('Isolated');
    
    doc.text(`Limits: ${limits.join(' | ')}`, colX, by);
    by += 5;
  }

  // ── 6. Divider line ──────────────────────────────────────────────────────────
  const dividerY = Math.max(y, by) + 8;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, dividerY, pageW - 14, dividerY);

  // ── 7. Invoice status badge ──────────────────────────────────────────────────
  let statusCol: [number, number, number] = [120, 120, 120]; // default/Draft
  if (invoice.status === 'Paid') statusCol = [34, 139, 34];
  else if (invoice.status === 'Pending') statusCol = [230, 150, 0];
  else if (invoice.status === 'Overdue') statusCol = [200, 0, 0];

  const badgeY = dividerY + 7;
  doc.setFillColor(...statusCol);
  doc.roundedRect(pageW - 14 - 28, badgeY - 4.5, 28, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.status.toUpperCase(), pageW - 14 - 14, badgeY, { align: 'center' });

  // ── 8. Line items table ───────────────────────────────────────────────────────
  const planName = tenant.subscriptionPlanName || 'Software Subscription';
  const monthlyPrice = tenant.subscriptionMonthlyPrice ?? invoice.amount;
  const qty = 1;
  const lineTotal = monthlyPrice * qty;

  autoTable(doc, {
    startY: dividerY + 12,
    head: [['#', 'Description', 'Plan', 'Rate / Month', 'Qty', 'Amount']],
    body: [
      [
        '1',
        'Monthly Subscription Service',
        planName,
        fmtINR(monthlyPrice),
        String(qty),
        fmtINR(lineTotal),
      ],
    ],
    headStyles: {
      fillColor: [BRAND_R, BRAND_G, BRAND_B],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [40, 40, 40],
      halign: 'center',
    },
    columnStyles: {
      1: { halign: 'left' },   // Description
      2: { halign: 'left' },   // Plan
    },
    alternateRowStyles: { fillColor: [245, 248, 255] },
    margin: { left: 14, right: 14 },
    theme: 'grid',
  });

  // ── 9. Totals block ───────────────────────────────────────────────────────────
  // jspdf-autotable adds lastAutoTable to the doc instance at runtime
  const tableBottom: number = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  const gstAmount = lineTotal * GST_RATE;
  const grandTotal = lineTotal + gstAmount;

  const totalsX = pageW - 14;
  const labelX = pageW - 65;
  let ty = tableBottom;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('Subtotal:', labelX, ty);
  doc.text(fmtINR(lineTotal), totalsX, ty, { align: 'right' });

  ty += 6;
  doc.text(`GST (${(GST_RATE * 100).toFixed(0)}%):`, labelX, ty);
  doc.text(fmtINR(gstAmount), totalsX, ty, { align: 'right' });

  // Divider before total
  ty += 3;
  doc.setDrawColor(BRAND_R, BRAND_G, BRAND_B);
  doc.setLineWidth(0.4);
  doc.line(labelX, ty, pageW - 14, ty);

  ty += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND_R, BRAND_G, BRAND_B);
  doc.text('TOTAL DUE:', labelX, ty);
  doc.text(fmtINR(grandTotal), totalsX, ty, { align: 'right' });

  // ── 10. Paid date (if applicable) ────────────────────────────────────────────
  if (invoice.status === 'Paid' && invoice.paidDate) {
    ty += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(34, 139, 34);
    doc.text(`✓ Paid on ${fmtDate(invoice.paidDate)}`, totalsX, ty, { align: 'right' });
    if (invoice.paymentId) {
      ty += 5;
      doc.setTextColor(100, 100, 100);
      doc.text(`Payment ID: ${invoice.paymentId}`, totalsX, ty, { align: 'right' });
    }
  }

  // ── 11. Footer ────────────────────────────────────────────────────────────────
  const footerY = pageH - 18;
  doc.setFillColor(BRAND_R, BRAND_G, BRAND_B);
  doc.rect(0, footerY, pageW, 18, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Thank you for your business! Payments are processed securely.', pageW / 2, footerY + 7, { align: 'center' });
  doc.text(`${COMPANY.name}  |  ${COMPANY.email}  |  ${COMPANY.website}`, pageW / 2, footerY + 13, { align: 'center' });

  // ── 12. Save ──────────────────────────────────────────────────────────────────
  const filename = `Invoice-${invoice.invoiceId || invoice.id}-${tenant.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
