import { jsPDF } from "jspdf";

export interface QuickOrderItem {
  productId?: string;
  name: string;
  brand?: string;
  specification?: string;
  unitPrice?: number;
  quantity: number;
}

export interface QuickOrderPdfData {
  quickOrderId: string;
  customerName: string;
  companyName?: string;
  phone: string;
  email?: string;
  location?: string;
  gstin?: string;
  items: QuickOrderItem[];
  notes?: string;
  date?: Date;
}

export function generateQuickOrderPdf(data: QuickOrderPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 18;

  // Header Background Bar
  doc.setFillColor(11, 35, 58); // #0b233a
  doc.rect(margin, currentY, contentWidth, 22, "F");

  // Header Brand Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("VOLAMP ELEKTRIKALS PVT. LTD.", margin + 6, currentY + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(217, 227, 233);
  doc.text(
    "Global & Domestic B2B Electrical Supply · Manufacturing HQ: Ahmedabad, Gujarat, India",
    margin + 6,
    currentY + 16
  );

  currentY += 28;

  // Document Title & Quick Order ID Box
  doc.setDrawColor(218, 228, 235);
  doc.setFillColor(247, 249, 251);
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, "FD");

  doc.setTextColor(196, 107, 25); // #c46b19
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("OFFICIAL B2B INVOICE & ORDER SPECIFICATION", margin + 6, currentY + 7);

  doc.setFontSize(13);
  doc.setTextColor(16, 42, 64); // #102a40
  doc.text("QUICK ORDER & INVOICE REQUISITION", margin + 6, currentY + 14);

  // Quick Order ID badge
  const orderDate = data.date ?? new Date();
  const dateStr = orderDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = orderDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(29, 115, 183); // #1d73b7
  doc.text(`ID: ${data.quickOrderId}`, pageWidth - margin - 6, currentY + 8, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 128, 139);
  doc.text(`Date: ${dateStr} ${timeStr}`, pageWidth - margin - 6, currentY + 14, {
    align: "right",
  });

  currentY += 26;

  // Customer & Site Context Grid
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(218, 228, 235);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(196, 107, 25);
  doc.text("CUSTOMER & DELIVERY CONTEXT", margin + 6, currentY + 6);

  doc.setFontSize(8.5);
  doc.setTextColor(110, 128, 139);

  // Left Column
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 42, 64);
  doc.text("Customer / Contact:", margin + 6, currentY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerName || "—", margin + 42, currentY + 14);

  doc.setFont("helvetica", "bold");
  doc.text("Company:", margin + 6, currentY + 21);
  doc.setFont("helvetica", "normal");
  doc.text(data.companyName || "Direct Procurement", margin + 42, currentY + 21);

  doc.setFont("helvetica", "bold");
  doc.text("Delivery Location:", margin + 6, currentY + 28);
  doc.setFont("helvetica", "normal");
  doc.text(data.location || "Ahmedabad, Gujarat, India", margin + 42, currentY + 28);

  // Right Column
  const rightColX = margin + contentWidth / 2 + 6;
  doc.setFont("helvetica", "bold");
  doc.text("Mobile / WhatsApp:", rightColX, currentY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(data.phone || "—", rightColX + 36, currentY + 14);

  doc.setFont("helvetica", "bold");
  doc.text("GSTIN / Tax ID:", rightColX, currentY + 21);
  doc.setFont("helvetica", "normal");
  doc.text(data.gstin || "B2C / Not provided", rightColX + 36, currentY + 21);

  doc.setFont("helvetica", "bold");
  doc.text("Status:", rightColX, currentY + 28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(217, 120, 24); // #d97818
  doc.text("Pending Pricing & Quotation", rightColX + 36, currentY + 28);

  currentY += 40;

  // Products Table Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(16, 42, 64);
  doc.text("REQUISITION PRODUCT SPECIFICATION", margin, currentY);

  currentY += 4;

  // Table Columns Setup
  const colIndexW = 14;
  const colQtyW = 32;
  const colNameW = contentWidth - colIndexW - colQtyW;

  doc.setFillColor(11, 35, 58);
  doc.rect(margin, currentY, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("#", margin + 4, currentY + 5.5);
  doc.text("Product Name / Cable Specification", margin + colIndexW + 4, currentY + 5.5);
  doc.text("Quantity", margin + colIndexW + colNameW + colQtyW - 4, currentY + 5.5, {
    align: "right",
  });

  currentY += 8;

  // Table Rows (ONLY non-removed products)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  let totalQty = 0;
  data.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 9, "F");

    doc.setDrawColor(235, 240, 244);
    doc.line(margin, currentY + 9, margin + contentWidth, currentY + 9);

    doc.setTextColor(110, 128, 139);
    doc.text(String(index + 1), margin + 4, currentY + 6);

    doc.setTextColor(16, 42, 64);
    doc.setFont("helvetica", "bold");
    const itemLabel = item.productId
      ? `[${item.productId}] ${item.name}${item.brand ? ` · ${item.brand}` : ""}`
      : item.name;
    doc.text(itemLabel, margin + colIndexW + 4, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 42, 64);
    doc.text(String(item.quantity), margin + colIndexW + colNameW + colQtyW - 4, currentY + 6, {
      align: "right",
    });

    totalQty += Number(item.quantity) || 0;
    currentY += 9;
  });

  // Table Summary Row
  doc.setFillColor(242, 246, 249);
  doc.rect(margin, currentY, contentWidth, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(16, 42, 64);
  doc.text(`Total Line Items: ${data.items.length}`, margin + 6, currentY + 6);
  doc.text(`Total Units: ${totalQty}`, margin + colIndexW + colNameW + colQtyW - 4, currentY + 6, {
    align: "right",
  });

  currentY += 16;

  // Project Notes if available
  if (data.notes && data.notes.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(196, 107, 25);
    doc.text("ADDITIONAL PROJECT NOTES & SPECIFICATIONS:", margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 80, 95);
    const splitNotes = doc.splitTextToSize(data.notes.trim(), contentWidth);
    doc.text(splitNotes, margin, currentY);
    currentY += splitNotes.length * 4.5 + 6;
  }

  // Next Steps / Terms Box
  doc.setDrawColor(218, 228, 235);
  doc.setFillColor(252, 253, 254);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(29, 115, 183);
  doc.text("NEXT ACTIONS BY VOLAMP SUPPLY DESK:", margin + 5, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(90, 107, 120);
  doc.text(
    "1. An assigned commercial engineer reviews specification compatibility, live inventory and best factory rates.",
    margin + 5,
    currentY + 11
  );
  doc.text(
    "2. Official stamped commercial quotation with GST break-up & freight timeline is issued to your WhatsApp / Email.",
    margin + 5,
    currentY + 16
  );
  doc.text(
    "3. Order & Pay Later institutional bank credit program is available on qualifying volumes.",
    margin + 5,
    currentY + 21
  );

  // Bottom Footer
  const footerY = doc.internal.pageSize.getHeight() - 14;
  doc.setDrawColor(218, 228, 235);
  doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(130, 145, 155);
  doc.text(
    "VOLAMP ELEKTRIKALS PVT. LTD. · WhatsApp Invoicing & Sourcing Desk: +91 9512365582 · Web: volampelektrikals.com",
    margin,
    footerY
  );
  doc.text(
    `Requisition Ref: ${data.quickOrderId} · System Generated`,
    pageWidth - margin,
    footerY,
    { align: "right" }
  );

  return doc;
}

export function downloadQuickOrderPdf(data: QuickOrderPdfData) {
  const doc = generateQuickOrderPdf(data);
  const cleanId = data.quickOrderId.replace(/[^a-zA-Z0-9-_]/g, "");
  if (typeof window !== "undefined" && typeof doc.save === "function") {
    doc.save(`VOLAMP_Invoice_${cleanId}.pdf`);
  }
  return doc;
}
