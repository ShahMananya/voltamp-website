import jsPDF from "jspdf";

// =============================================================================
// VECTOR ICON DRAWING HELPERS (100% Vector - Crisp & Free from Glyph Encoding Bugs)
// =============================================================================

export function drawVectorCheck(doc: jsPDF, x: number, y: number, size = 3, color = [5, 150, 105]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.45);
  doc.line(x, y + size * 0.55, x + size * 0.35, y + size * 0.9);
  doc.line(x + size * 0.35, y + size * 0.9, x + size, y + size * 0.15);
}

export function drawFlameIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setFillColor(254, 215, 170);
  doc.setLineWidth(0.4);
  // Outer flame teardrop
  doc.circle(cx, cy + size * 0.25, size * 0.45, "FD");
  doc.triangle(cx - size * 0.45, cy + size * 0.25, cx + size * 0.45, cy + size * 0.25, cx, cy - size * 0.6, "FD");
  // Inner core
  doc.setFillColor(color[0], color[1], color[2]);
  doc.circle(cx, cy + size * 0.35, size * 0.2, "F");
}

export function drawLayersIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.45);
  // 3 stacked diamonds
  [-size * 0.35, 0, size * 0.35].forEach((dy) => {
    doc.line(cx, cy + dy - size * 0.2, cx + size * 0.5, cy + dy);
    doc.line(cx + size * 0.5, cy + dy, cx, cy + dy + size * 0.2);
    doc.line(cx, cy + dy + size * 0.2, cx - size * 0.5, cy + dy);
    doc.line(cx - size * 0.5, cy + dy, cx, cy + dy - size * 0.2);
  });
}

export function drawLightningIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setFillColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.3);
  // Circle frame
  doc.circle(cx, cy, size * 0.65, "S");
  // Lightning bolt polygon
  const pts = [
    [cx + size * 0.05, cy - size * 0.4],
    [cx - size * 0.25, cy + size * 0.02],
    [cx, cy + size * 0.02],
    [cx - size * 0.1, cy + size * 0.4],
    [cx + size * 0.25, cy - size * 0.05],
    [cx, cy - size * 0.05],
  ];
  for (let i = 0; i < pts.length; i++) {
    const next = pts[(i + 1) % pts.length];
    doc.line(pts[i][0], pts[i][1], next[0], next[1]);
  }
}

export function drawBuildingIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.4);
  // House / Factory outline
  doc.line(cx - size * 0.5, cy + size * 0.4, cx - size * 0.5, cy - size * 0.1);
  doc.line(cx - size * 0.5, cy - size * 0.1, cx, cy - size * 0.55);
  doc.line(cx, cy - size * 0.55, cx + size * 0.5, cy - size * 0.1);
  doc.line(cx + size * 0.5, cy - size * 0.1, cx + size * 0.5, cy + size * 0.4);
  doc.line(cx + size * 0.5, cy + size * 0.4, cx - size * 0.5, cy + size * 0.4);
  // Door
  doc.rect(cx - size * 0.15, cy + size * 0.05, size * 0.3, size * 0.35, "S");
}

export function drawShieldIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.4);
  doc.line(cx - size * 0.45, cy - size * 0.4, cx + size * 0.45, cy - size * 0.4);
  doc.line(cx + size * 0.45, cy - size * 0.4, cx + size * 0.45, cy + size * 0.05);
  doc.line(cx + size * 0.45, cy + size * 0.05, cx, cy + size * 0.5);
  doc.line(cx, cy + size * 0.5, cx - size * 0.45, cy + size * 0.05);
  doc.line(cx - size * 0.45, cy + size * 0.05, cx - size * 0.45, cy - size * 0.4);
  // Checkmark inside
  drawVectorCheck(doc, cx - size * 0.25, cy - size * 0.2, size * 0.5, color);
}

export function drawGearIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.4);
  doc.circle(cx, cy, size * 0.3, "S");
  doc.circle(cx, cy, size * 0.5, "S");
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const x1 = cx + Math.cos(a) * size * 0.5;
    const y1 = cy + Math.sin(a) * size * 0.5;
    const x2 = cx + Math.cos(a) * size * 0.65;
    const y2 = cy + Math.sin(a) * size * 0.65;
    doc.line(x1, y1, x2, y2);
  }
}

export function drawPaletteIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.4);
  doc.circle(cx, cy, size * 0.5, "S");
  doc.setFillColor(color[0], color[1], color[2]);
  doc.circle(cx - size * 0.2, cy - size * 0.15, 0.5, "F");
  doc.circle(cx + size * 0.15, cy - size * 0.2, 0.5, "F");
  doc.circle(cx + size * 0.25, cy + size * 0.1, 0.5, "F");
  doc.circle(cx - size * 0.05, cy + size * 0.25, 0.5, "F");
}

export function drawThermometerIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.4);
  doc.rect(cx - size * 0.1, cy - size * 0.5, size * 0.2, size * 0.6, "S");
  doc.setFillColor(color[0], color[1], color[2]);
  doc.circle(cx, cy + size * 0.3, size * 0.25, "FD");
  doc.rect(cx - size * 0.05, cy - size * 0.2, size * 0.1, size * 0.4, "F");
}

export function drawBoxIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.4);
  doc.rect(cx - size * 0.45, cy - size * 0.35, size * 0.9, size * 0.7, "S");
  doc.line(cx - size * 0.45, cy - size * 0.35, cx + size * 0.45, cy + size * 0.35);
  doc.line(cx - size * 0.45, cy + size * 0.35, cx + size * 0.45, cy - size * 0.35);
}

export function drawArrowsIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.45);
  doc.line(cx - size * 0.45, cy, cx + size * 0.45, cy);
  // Left arrow head
  doc.line(cx - size * 0.45, cy, cx - size * 0.2, cy - size * 0.25);
  doc.line(cx - size * 0.45, cy, cx - size * 0.2, cy + size * 0.25);
  // Right arrow head
  doc.line(cx + size * 0.45, cy, cx + size * 0.2, cy - size * 0.25);
  doc.line(cx + size * 0.45, cy, cx + size * 0.2, cy + size * 0.25);
}

export function drawDropIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setFillColor(254, 215, 170);
  doc.setLineWidth(0.4);
  doc.circle(cx, cy + size * 0.15, size * 0.35, "FD");
  doc.triangle(cx - size * 0.35, cy + size * 0.15, cx + size * 0.35, cy + size * 0.15, cx, cy - size * 0.5, "FD");
}

export function drawTagIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.4);
  doc.line(cx - size * 0.45, cy - size * 0.2, cx - size * 0.1, cy - size * 0.45);
  doc.line(cx - size * 0.1, cy - size * 0.45, cx + size * 0.45, cy + size * 0.1);
  doc.line(cx + size * 0.45, cy + size * 0.1, cx + size * 0.1, cy + size * 0.45);
  doc.line(cx + size * 0.1, cy + size * 0.45, cx - size * 0.45, cy - size * 0.1);
  doc.line(cx - size * 0.45, cy - size * 0.1, cx - size * 0.45, cy - size * 0.2);
  doc.circle(cx - size * 0.15, cy - size * 0.15, 0.6, "S");
}

export function drawWrenchIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.45);
  doc.line(cx - size * 0.35, cy + size * 0.35, cx + size * 0.2, cy - size * 0.2);
  doc.circle(cx + size * 0.25, cy - size * 0.25, size * 0.25, "S");
}

export function drawHarnessIcon(doc: jsPDF, cx: number, cy: number, size = 5, color = [234, 88, 12]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.45);
  doc.line(cx - size * 0.4, cy - size * 0.3, cx, cy);
  doc.line(cx + size * 0.4, cy - size * 0.3, cx, cy);
  doc.line(cx, cy, cx, cy + size * 0.45);
  doc.circle(cx, cy, size * 0.15, "S");
}

export function drawMapPinIcon(doc: jsPDF, cx: number, cy: number, size = 4, color = [255, 255, 255]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.35);
  doc.circle(cx, cy - size * 0.2, size * 0.4, "S");
  doc.line(cx - size * 0.35, cy - size * 0.1, cx, cy + size * 0.45);
  doc.line(cx + size * 0.35, cy - size * 0.1, cx, cy + size * 0.45);
  doc.circle(cx, cy - size * 0.2, size * 0.15, "S");
}

export function drawEnvelopeIcon(doc: jsPDF, cx: number, cy: number, size = 4, color = [255, 255, 255]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.35);
  doc.rect(cx - size * 0.5, cy - size * 0.3, size, size * 0.6, "S");
  doc.line(cx - size * 0.5, cy - size * 0.3, cx, cy + size * 0.05);
  doc.line(cx + size * 0.5, cy - size * 0.3, cx, cy + size * 0.05);
}

export function drawGlobeIcon(doc: jsPDF, cx: number, cy: number, size = 4, color = [255, 255, 255]) {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(0.35);
  doc.circle(cx, cy, size * 0.45, "S");
  doc.line(cx - size * 0.45, cy, cx + size * 0.45, cy);
  doc.ellipse(cx, cy, size * 0.22, size * 0.45, "S");
}

export function drawBarcode(doc: jsPDF, x: number, y: number, w: number, h: number, code: string) {
  const barPattern = [1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 1, 3, 1, 2, 1, 2, 1, 1, 3, 1, 2];
  let curX = x;
  const totalUnits = barPattern.reduce((a, b) => a + b, 0);
  const unit = w / totalUnits;
  doc.setFillColor(15, 23, 42);
  barPattern.forEach((bar, idx) => {
    const barW = bar * unit;
    if (idx % 2 === 0) {
      doc.rect(curX, y, barW, h, "F");
    }
    curX += barW;
  });
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.8);
  doc.text(`* ${code} *`, x + w / 2, y + h + 2.4, { align: "center" });
}

// Helper to draw the header used across pages
export function renderBrochureTopHeader(doc: jsPDF, logoDataUrl: string | null) {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 22, "F");

  // Logo Container
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", 12, 3.5, 42, 14);
    } catch {
      doc.setTextColor(77, 18, 23);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("VOLAMP", 14, 13);
      doc.setFontSize(6.5);
      doc.setTextColor(197, 103, 24);
      doc.text("Powering Growth", 14, 17.5);
    }
  } else {
    doc.setTextColor(77, 18, 23);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("VOLAMP", 14, 13);
    doc.setFontSize(6.5);
    doc.setTextColor(197, 103, 24);
    doc.text("Powering Growth", 14, 17.5);
  }

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(88, 4.5, 88, 17.5);

  // Corporate Title
  doc.setTextColor(11, 31, 51); // Deep Navy
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("VOLAMP", 94, 9.5);
  doc.text("ELEKTRIKALS PVT. LTD.", 94, 14.5);

  // Subtitle with orange line
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.5);
  doc.line(94, 18, 114, 18);

  doc.setTextColor(197, 103, 24);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.text("Powering Growth", 117, 18.5);

  doc.line(148, 18, 198, 18);
}

// Helper to draw the bottom dark navy contact footer
export function renderBrochureBottomFooter(doc: jsPDF) {
  const y = 280;
  doc.setFillColor(11, 31, 51); // Deep Navy #0B1F33
  doc.rect(0, y, 210, 17, "F");

  // Dividing white lines
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.line(72, y + 4, 72, y + 13);
  doc.line(140, y + 4, 140, y + 13);

  // Item 1: Location
  drawMapPinIcon(doc, 18, y + 8.5, 3.5, [255, 255, 255]);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("Ahmedabad,", 25, y + 7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Gujarat, India", 25, y + 11.5);

  // Item 2: Email
  drawEnvelopeIcon(doc, 80, y + 8.5, 3.5, [255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.text("sales@volampelektrikals.com", 87, y + 9.5);

  // Item 3: Website
  drawGlobeIcon(doc, 148, y + 8.5, 3.5, [255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.text("www.volampelektrikals.com", 155, y + 9.5);
}

// =============================================================================
// CATEGORY INTELLIGENCE ENGINE (Produces tailored brochure data for all 8 categories)
// =============================================================================

export interface BrochureCategoryData {
  seriesName: string;
  titlePart1: string;
  titlePart2: string;
  titlePart3: string;
  sizeBadge: string;
  skuBadge: string;
  featureCards: Array<{ title: string; iconType: string }>;
  overviewParagraph: string;
  overviewHighlights: Array<{ label: string; value: string; iconType: string }>;
  techSpecs: Array<{ label: string; value: string; standard: string; iconType: string }>;
  recommendedApps: Array<{ title: string; desc: string; iconType: string }>;
  whyChooseVolamp: Array<{ title: string; desc: string; iconType: string }>;
  storageHandling: { storage: string; handling: string; testing: string };
  standardsChecklist: string[];
  commercialDispatch: { standardPack: string; quoteTime: string; localDelivery: string; nationalDelivery: string; ports: string };
}

export function getBrochureCategoryData(product: any, specs: Record<string, string>): BrochureCategoryData {
  const cat = (product.category || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const sku = product.sku || product.productId || "SKU-VLP-001";
  const size = product.size || (specs.widthOrDiameter && specs.length ? `${specs.widthOrDiameter} x ${specs.length}` : "Standard Industrial Size");

  // 1. WIRING DEVICES / TAPES
  if (cat.includes("wiring") || cat.includes("tape") || name.includes("tape") || name.includes("insulation tape")) {
    return {
      seriesName: "Wiring Accessory Series",
      titlePart1: "PVC",
      titlePart2: "Insulation",
      titlePart3: "Tape",
      sizeBadge: product.size || "18 mm x 10 m",
      skuBadge: sku,
      featureCards: [
        { title: "Flame Retardant", iconType: "flame" },
        { title: "Strong Adhesion", iconType: "layers" },
        { title: "Electrical Insulation", iconType: "lightning" },
        { title: "Industrial & Household Use", iconType: "building" },
      ],
      overviewParagraph:
        "High-quality PVC Insulation Tape designed for reliable electrical insulation, secure wrapping and long-lasting performance. Made from flame-retardant, low-smoke (FRLS) PVC, it offers strong adhesion, excellent flexibility and durability for a wide range of industrial and household electrical applications.",
      overviewHighlights: [
        { label: "Voltage Rating", value: specs.voltageRating || "600 V / 1100 V", iconType: "lightning" },
        { label: "Material", value: product.material || "FRLS PVC Grade", iconType: "layers" },
        { label: "Available Colors", value: "Black, Yellow, Red, White, Blue, Green", iconType: "palette" },
      ],
      techSpecs: [
        { label: "Material", value: product.material || "FRLS PVC", standard: "ASTM D1000", iconType: "layers" },
        { label: "Adhesive", value: "Pressure Sensitive Rubber Resin", standard: "IS 7809 Part 3", iconType: "drop" },
        { label: "Voltage Rating", value: specs.voltageRating || "600 V", standard: "IS 7809 Sec 1", iconType: "lightning" },
        { label: "Dielectric Strength", value: "> 40 kV/mm", standard: "ASTM D1000", iconType: "shield" },
        { label: "Tensile Strength", value: "Min. 15 N / 10 mm", standard: "IS 7809 Part 2", iconType: "arrows" },
        { label: "Elongation at Break", value: "Min. 125%", standard: "IS 7809 Part 2", iconType: "arrows" },
        { label: "Flame Retardancy", value: "Self Extinguishing within 5s", standard: "IS 7809 / UL 510", iconType: "flame" },
        { label: "Operating Temperature", value: "-10 deg C to +80 deg C", standard: "IEC 60454-3", iconType: "thermometer" },
        { label: "Packaging", value: `${product.moq || 10} pcs / shrink wrapped sleeve`, standard: "OEM packaging", iconType: "box" },
      ],
      recommendedApps: [
        { title: "Wire harnessing", desc: "Organize wire bundles during assembly.", iconType: "harness" },
        { title: "Cable identification", desc: "Color-code conductors and cable groups.", iconType: "tag" },
        { title: "Electrical insulation", desc: "Wrap suitable low-voltage electrical connections.", iconType: "lightning" },
        { title: "General repair & maintenance", desc: "Use for appropriately rated repair and service tasks.", iconType: "wrench" },
      ],
      whyChooseVolamp: [
        { title: "Reliable Quality", desc: "Consistent and dependable for industrial electrical use.", iconType: "shield" },
        { title: "Strong Adhesion", desc: "Secure wrapping and firm hold under continuous thermal load.", iconType: "layers" },
        { title: "Durable Performance", desc: "Long-lasting flexibility and insulation without unravelling.", iconType: "gear" },
        { title: "Multiple Colors Available", desc: "Ideal for color-coding and 3-phase identification.", iconType: "palette" },
      ],
      storageHandling: {
        storage: "Store tape in a clean, dry place away from direct sunlight, heat, and chemical exposure. Keep rolls in their packaging until use.",
        handling: "Apply on clean, dry surfaces and follow electrical safety practices and the manufacturer's verified application limits.",
        testing: "Dielectric breakdown testing verified in accordance with ASTM D1000 and IS 7809 standard test protocols.",
      },
      standardsChecklist: [
        "ISO 9001:2015 facility certification",
        "BIS / ISI, IS 7809 conforming",
        "IEC 60454-3 international compliance",
        "RoHS / REACH lead-free formulation",
        "Batch MTC routine test verification",
      ],
      commercialDispatch: {
        standardPack: "10 pcs / shrink-wrapped sleeve",
        quoteTime: "Less than 2 hours (turnaround)",
        localDelivery: "Same-day for eligible Ahmedabad orders (order before 5:00 PM)",
        nationalDelivery: "48-72 hours across 28 Indian states",
        ports: "Mundra Port and Kandla Port direct export clearances",
      },
    };
  }

  // 2. SWITCHGEAR
  if (cat.includes("switch") || name.includes("mcb") || name.includes("breaker") || name.includes("contactor")) {
    return {
      seriesName: "Power Distribution Switchgear",
      titlePart1: "Industrial",
      titlePart2: "Circuit",
      titlePart3: "Protection",
      sizeBadge: specs.polesPhase || product.size || "1 Pole (1P) / 3P / 4P",
      skuBadge: sku,
      featureCards: [
        { title: "10 kA Breaking Capacity", iconType: "shield" },
        { title: "Type C Magnetic Trip", iconType: "lightning" },
        { title: "Touch-Proof Terminals", iconType: "layers" },
        { title: "20,000 Cycles Endurance", iconType: "gear" },
      ],
      overviewParagraph:
        "High-performance industrial switchgear engineered for precision motor control and feeder circuit protection. Featuring advanced arc extinguishing chambers and high thermal-magnetic sensitivity, it delivers robust reliability across harsh industrial and commercial electrical infrastructure.",
      overviewHighlights: [
        { label: "Rated Current", value: specs.currentRatingA ? `${specs.currentRatingA} A` : "16A - 63A", iconType: "lightning" },
        { label: "Breaking Capacity", value: specs.breakingCapacityKa ? `${specs.breakingCapacityKa} kA (Icn)` : "10 kA at 415V", iconType: "shield" },
        { label: "Standard Code", value: specs.standard || "IS / IEC 60898-1", iconType: "palette" },
      ],
      techSpecs: [
        { label: "Device Classification", value: product.subcategory || "Miniature Circuit Breaker (MCB)", standard: "IEC 60898-1", iconType: "layers" },
        { label: "Poles Configuration", value: specs.polesPhase || product.size || "1P / 3P / 4P", standard: "IEC 60947-2", iconType: "box" },
        { label: "Rated Current (In)", value: specs.currentRatingA ? `${specs.currentRatingA} A` : "16A - 63A", standard: "IS 8828", iconType: "lightning" },
        { label: "Breaking Capacity", value: specs.breakingCapacityKa ? `${specs.breakingCapacityKa} kA` : "10 kA (Icn)", standard: "IEC 60898-1", iconType: "shield" },
        { label: "Tripping Curve", value: specs.tripCurve || "Type C Curve (5-10 In)", standard: "IEC 60898-1", iconType: "arrows" },
        { label: "Rated Voltage", value: specs.voltageRatingV ? `${specs.voltageRatingV} V` : "240 / 415 V AC", standard: "IEC 60947-2", iconType: "lightning" },
        { label: "Impulse Withstand", value: "4 kV (1.2/50 us)", standard: "IEC 60898-1", iconType: "shield" },
        { label: "Operating Endurance", value: "20,000 Mechanical Ops", standard: "IEC 60898-1", iconType: "gear" },
        { label: "Mounting / Terminal", value: "35mm DIN Rail / IP20", standard: "DIN 43880", iconType: "building" },
      ],
      recommendedApps: [
        { title: "Motor Feeder Circuits", desc: "Short-circuit and overload protection for 3-phase motors.", iconType: "gear" },
        { title: "Distribution Boards", desc: "Sub-main distribution and sub-circuit isolation.", iconType: "building" },
        { title: "HVAC & Chiller Plants", desc: "Heavy inductive current spike protection.", iconType: "lightning" },
        { title: "Industrial Automation", desc: "PLC control cabinet power bus isolation.", iconType: "wrench" },
      ],
      whyChooseVolamp: [
        { title: "Proven Trip Reliability", desc: "100% factory routine calibrated thermal-magnetic trip units.", iconType: "shield" },
        { title: "High Breaking Capacity", desc: "Certified 10 kA short-circuit interruption capability.", iconType: "lightning" },
        { title: "Ergonomic DIN Rail Clip", desc: "Tool-free fast mounting and replacement mechanism.", iconType: "gear" },
        { title: "GeM & CE Approved", desc: "Complies fully with CPRI tested standards.", iconType: "palette" },
      ],
      storageHandling: {
        storage: "Store in clean, dry indoor switchgear racks away from conductive dust and humidity. Ambient range -10 deg C to +50 deg C.",
        handling: "Verify torque specs on terminal screws (2.5 Nm max). Do not exceed rated breaking capacity.",
        testing: "Routine dielectric withstand test (2 kV AC for 1 minute) performed before dispatch.",
      },
      standardsChecklist: [
        "ISO 9001:2015 facility audited",
        "IS / IEC 60898-1 conforming",
        "CPRI accredited type test cleared",
        "CE & RoHS hazardous substance compliance",
        "MTC Type 3.1 test report issued",
      ],
      commercialDispatch: {
        standardPack: "1 pc / box (Master case 60 pcs)",
        quoteTime: "Less than 2 hours (turnaround)",
        localDelivery: "Same-day for eligible Ahmedabad orders (order before 5:00 PM)",
        nationalDelivery: "48-72 hours across 28 Indian states",
        ports: "Mundra Port & Kandla Port direct export corridors",
      },
    };
  }

  // 3. GLANDS
  if (cat.includes("gland") || name.includes("gland")) {
    return {
      seriesName: "Cable Termination Systems",
      titlePart1: "Nickel Plated",
      titlePart2: "Cable",
      titlePart3: "Glands",
      sizeBadge: specs.sizeCode || product.size || "10MM (3/8\")",
      skuBadge: sku,
      featureCards: [
        { title: "IP66 / IP67 Ingress Proof", iconType: "shield" },
        { title: "Solid Extruded Brass", iconType: "layers" },
        { title: "Explosion / Flameproof", iconType: "flame" },
        { title: "High Tensile Armor Clamp", iconType: "gear" },
      ],
      overviewParagraph:
        "Engineered heavy-duty brass cable glands manufactured from extruded CW614N/CZ121 brass with corrosion-resistant nickel plating. Designed for secure mechanical cable retention, IP66 environmental sealing, and continuous electrical earth continuity across armoured and unarmoured industrial installations.",
      overviewHighlights: [
        { label: "Gland Size", value: `${specs.sizeCode || product.size || "10MM"} (${specs.sizeInch || '3/8"'})`, iconType: "gear" },
        { label: "Body Material", value: product.material || "Extruded Brass (Nickel Plated)", iconType: "layers" },
        { label: "Ingress Protection", value: "IP 66 / IP 67 Dual Rated", iconType: "shield" },
      ],
      techSpecs: [
        { label: "Compression Type", value: specs.compressionType || "Single / Double Compression", standard: "BS 6121", iconType: "gear" },
        { label: "Gland Metric Size", value: specs.sizeCode || product.size || "10MM", standard: "IS 12943", iconType: "box" },
        { label: "Imperial Size", value: specs.sizeInch || '3/8"', standard: "BS 6121", iconType: "arrows" },
        { label: "Suitable Cable OD", value: specs.suitableCableOdMm ? `${specs.suitableCableOdMm} mm` : "8.0 - 12.0 mm", standard: "IEC 62444", iconType: "arrows" },
        { label: "Nipple Thread", value: specs.nippleThread || '5/8" Imperial / M20', standard: "ISO 965", iconType: "gear" },
        { label: "Body Material", value: product.material || "Extruded Brass IS 319", standard: "IS 319 Gr. I", iconType: "layers" },
        { label: "Surface Plating", value: "Nickel Electroplated (5-8 um)", standard: "IS 1359", iconType: "shield" },
        { label: "Seal Compound", value: "Neoprene Synthetic Elastomer", standard: "BS 6121", iconType: "drop" },
        { label: "Standard Conformance", value: specs.standard || "BS 6121 / IS 12943", standard: "BS 6121", iconType: "shield" },
      ],
      recommendedApps: [
        { title: "Armoured Cable Termination", desc: "Clamps steel wire/strip armour with earth continuity.", iconType: "harness" },
        { title: "Motor Terminal Boxes", desc: "Vibration-proof ingress protection for drive motors.", iconType: "gear" },
        { title: "Hazardous Outdoor Panels", desc: "Weatherproof IP66 sealing against rain and dust.", iconType: "shield" },
        { title: "Marine & Refinery Plants", desc: "Corrosion resistance against salt air and chemicals.", iconType: "building" },
      ],
      whyChooseVolamp: [
        { title: "Precision Machined Threads", desc: "CNC machined threads ensure zero cross-threading.", iconType: "gear" },
        { title: "Heavy-Duty Brass Wall", desc: "Resists mechanical impact and overtightening damage.", iconType: "layers" },
        { title: "Complete Gland Kit", desc: "Supplied with locknut, neoprene seal, and earth tag.", iconType: "box" },
        { title: "Certified IS 12943", desc: "Full test certificate provided with every master carton.", iconType: "shield" },
      ],
      storageHandling: {
        storage: "Store in moisture-free polybags inside original cartons. Avoid damp soil contact.",
        handling: "Use correct size spanner. Do not overtighten beyond recommended torque (15-20 Nm).",
        testing: "Hydrostatic pressure testing at 2 bar for IP66 verification completed.",
      },
      standardsChecklist: [
        "ISO 9001:2015 quality audited",
        "BS 6121 : Part 1 compliance",
        "IS 12943 Indian Standard certified",
        "IEC 62444 cable gland conforming",
        "RoHS lead-free surface finish",
      ],
      commercialDispatch: {
        standardPack: `${specs.packingPerBoxPcs || product.moq || 100} pcs / box`,
        quoteTime: "Less than 2 hours (turnaround)",
        localDelivery: "Same-day for eligible Ahmedabad orders (order before 5:00 PM)",
        nationalDelivery: "48-72 hours across 28 Indian states",
        ports: "Mundra Port & Kandla Port direct export corridors",
      },
    };
  }

  // 4. LUGS
  if (cat.includes("lug") || name.includes("lug")) {
    return {
      seriesName: "Cable Termination Systems",
      titlePart1: "Heavy-Duty",
      titlePart2: "Copper",
      titlePart3: "Lugs",
      sizeBadge: product.size || specs.sizeRange || "Standard Industrial Cross-Section",
      skuBadge: sku,
      featureCards: [
        { title: "99.97% Pure Electrolytic Cu", iconType: "layers" },
        { title: "Heavy Electro-Tinning", iconType: "shield" },
        { title: "High Tensile Pull-Out", iconType: "arrows" },
        { title: "IS 8309 / DIN 46235", iconType: "gear" },
      ],
      overviewParagraph:
        "Manufactured from high-conductivity electrolytic oxygen-free copper tube (99.97% IACS), these heavy-duty crimping lugs feature precision chamfered barrels with visual inspection holes and electro-tin plating to prevent galvanic corrosion and ensure minimum contact resistance at high currents.",
      overviewHighlights: [
        { label: "Conductor Size", value: product.size || specs.sizeRange || "Standard Range", iconType: "gear" },
        { label: "Material Purity", value: "99.97% Electrolytic Copper", iconType: "layers" },
        { label: "Surface Plating", value: "Electro-Tinned (5-8 um)", iconType: "shield" },
      ],
      techSpecs: [
        { label: "Lug / Terminal Profile", value: specs.lugType || "Tubular Heavy-Duty Crimping", standard: "IS 8309", iconType: "layers" },
        { label: "Cable Cross Section", value: product.size || "Standard", standard: "DIN 46235", iconType: "arrows" },
        { label: "Base Metal", value: "100% Electrolytic Oxygen-Free Cu", standard: "IS 1897", iconType: "layers" },
        { label: "Surface Finish", value: "Electro-Tinned (Corrosion Proof)", standard: "IS 1359", iconType: "shield" },
        { label: "Barrel Entry Style", value: "Chamfered with Inspection Hole", standard: "DIN 46235", iconType: "box" },
        { label: "Operating Temperature", value: "Continuous 120 deg C (Peak 250 deg C)", standard: "IEC 61238", iconType: "thermometer" },
        { label: "Conductivity Rating", value: "Min. 99.7% IACS", standard: "IACS", iconType: "lightning" },
        { label: "Pull-Out Tensile", value: "Complies with Class A Load", standard: "IS 8309", iconType: "arrows" },
        { label: "Standard Conformance", value: specs.standard || "IS 8309 / DIN 46235", standard: "IS 8309", iconType: "shield" },
      ],
      recommendedApps: [
        { title: "Busbar Terminations", desc: "Bolted connection to distribution switchboard busbars.", iconType: "building" },
        { title: "Transformer Connections", desc: "High current secondary terminal connections.", iconType: "lightning" },
        { title: "Motor Control Centers", desc: "Heavy vibrating feed cable terminations.", iconType: "gear" },
        { title: "Renewable Inverters", desc: "Solar DC and battery bank lug crimping.", iconType: "harness" },
      ],
      whyChooseVolamp: [
        { title: "Pure Electrolytic Copper", desc: "Zero recycled scrap copper ensures minimum voltage drop.", iconType: "layers" },
        { title: "Thick Tube Wall", desc: "Prevents splitting under hydraulic crimping pressure.", iconType: "shield" },
        { title: "Chamfered Barrel", desc: "Smooth cable insertion without stray stranded wire snagging.", iconType: "gear" },
        { title: "DIN & IS Compliant", desc: "Conforms to Indian and German standard die profiles.", iconType: "palette" },
      ],
      storageHandling: {
        storage: "Store in sealed original packaging in dry location to avoid surface oxidation.",
        handling: "Use calibrated hexagonal or indent crimping dies matched to cross-section.",
        testing: "Millivolt drop test and tensile pull test cleared per IS 8309 standards.",
      },
      standardsChecklist: [
        "ISO 9001:2015 facility audited",
        "IS 8309 : 1993 standard compliant",
        "DIN 46235 German standard conforming",
        "IEC 61238-1 electrical test cleared",
        "RoHS lead-free electro-tinning",
      ],
      commercialDispatch: {
        standardPack: `${product.moq || 100} pcs / sealed pack`,
        quoteTime: "Less than 2 hours (turnaround)",
        localDelivery: "Same-day for eligible Ahmedabad orders (order before 5:00 PM)",
        nationalDelivery: "48-72 hours across 28 Indian states",
        ports: "Mundra Port & Kandla Port direct export corridors",
      },
    };
  }

  // 5. PVC PIPE & CONDUITS
  if (cat.includes("pipe") || cat.includes("conduit") || name.includes("pipe") || name.includes("conduit")) {
    return {
      seriesName: "Conduit Piping Systems",
      titlePart1: "Rigid",
      titlePart2: "uPVC",
      titlePart3: "Conduits",
      sizeBadge: product.size || "20 mm / 25 mm / 32 mm",
      skuBadge: sku,
      featureCards: [
        { title: "High Impact uPVC", iconType: "shield" },
        { title: "Self Extinguishing", iconType: "flame" },
        { title: "Corrosion Proof", iconType: "drop" },
        { title: "IS 9537 Standard", iconType: "gear" },
      ],
      overviewParagraph:
        "High-impact rigid non-metallic conduits manufactured from premium unplasticized polyvinyl chloride (uPVC). Formulated for heavy mechanical duty, high dielectric insulation, and self-extinguishing flame resistance, providing complete lifetime protection for surface and embedded building electrical raceways.",
      overviewHighlights: [
        { label: "Nominal Outer Dia", value: product.size || "20 mm / 25 mm / 32 mm", iconType: "gear" },
        { label: "Duty Rating", value: "Medium / Heavy Duty (Class M)", iconType: "shield" },
        { label: "Polymer Base", value: "High-Impact uPVC Resin", iconType: "layers" },
      ],
      techSpecs: [
        { label: "Conduit Classification", value: product.subcategory || "Rigid Non-Metallic Conduit", standard: "IS 9537 Part 3", iconType: "layers" },
        { label: "Outer Diameter (OD)", value: product.size || "25 mm", standard: "IS 9537 Part 3", iconType: "box" },
        { label: "Mechanical Duty Class", value: "Medium / Heavy (Class M)", standard: "IS 9537 Part 3", iconType: "shield" },
        { label: "Base Polymer", value: product.material || "High-Impact uPVC", standard: "IS 9537", iconType: "layers" },
        { label: "Temperature Range", value: "-5 deg C to +60 deg C", standard: "IS 9537 Part 3", iconType: "thermometer" },
        { label: "Dielectric Strength", value: "Min. 2.0 kV AC / 15 mins", standard: "IS 9537", iconType: "lightning" },
        { label: "Flame Retardancy", value: "Self Extinguishing within 30s", standard: "IS 9537", iconType: "flame" },
        { label: "Chemical Resistance", value: "Resistant to acids, alkalis, salts", standard: "ASTM D543", iconType: "drop" },
        { label: "Standard Conformance", value: specs.standard || "IS 9537 (Part 3) : 1983", standard: "IS 9537", iconType: "shield" },
      ],
      recommendedApps: [
        { title: "Concealed Wall Wiring", desc: "Embedded inside concrete plaster and masonry walls.", iconType: "building" },
        { title: "Surface Industrial Conduits", desc: "Exposed raceways in factories and warehouses.", iconType: "wrench" },
        { title: "False Ceiling Cabling", desc: "Organized cabling above acoustic ceiling grids.", iconType: "harness" },
        { title: "Underground Floor Conduits", desc: "Corrosion-proof ducting embedded under flooring.", iconType: "shield" },
      ],
      whyChooseVolamp: [
        { title: "Zero Corrosion", desc: "100% rust-proof and immune to soil moisture and chemicals.", iconType: "drop" },
        { title: "Smooth Internal Bore", desc: "Low-friction interior allows easy cable pulling without snags.", iconType: "arrows" },
        { title: "High Impact Strength", desc: "Resists cracking and crushing during site construction work.", iconType: "shield" },
        { title: "BIS Hallmark Certified", desc: "Tested per IS 9537 specifications with ISI stamp.", iconType: "palette" },
      ],
      storageHandling: {
        storage: "Store horizontally on flat wooden bearers to avoid sagging. Protect from long UV exposure.",
        handling: "Use designated conduit bending springs for smooth elbow bends without flattening.",
        testing: "Impact test and compression load test passed per IS 9537 Part 3.",
      },
      standardsChecklist: [
        "ISO 9001:2015 facility audited",
        "IS 9537 : Part 3 conforming",
        "BIS Hallmark ISI registered",
        "RoHS heavy metal free polymer",
        "MTC Type 3.1 inspection certificate",
      ],
      commercialDispatch: {
        standardPack: `${product.moq || 25} bundles (3m length/pipe)`,
        quoteTime: "Less than 2 hours (turnaround)",
        localDelivery: "Same-day for eligible Ahmedabad orders (order before 5:00 PM)",
        nationalDelivery: "48-72 hours across 28 Indian states",
        ports: "Mundra Port & Kandla Port direct export corridors",
      },
    };
  }

  // 6. EARTHING
  if (cat.includes("earth") || name.includes("earth")) {
    return {
      seriesName: "Earthing & Grounding Series",
      titlePart1: "Copper / GI",
      titlePart2: "Earthing",
      titlePart3: "Systems",
      sizeBadge: product.size || "25 mm x 3 mm / 25 mm x 6 mm",
      skuBadge: sku,
      featureCards: [
        { title: "High Fault Dissipation", iconType: "lightning" },
        { title: "Low Contact Resistance", iconType: "shield" },
        { title: "Soil Acid Resistant", iconType: "drop" },
        { title: "IS 3043 Compliant", iconType: "gear" },
      ],
      overviewParagraph:
        "Industrial earthing strips and chemical grounding electrodes engineered in strict accordance with IS 3043:2018 (Code of Practice for Earthing). Providing rapid dissipation of lightning strikes, high short-circuit earth fault currents, and equipment touch-potential shielding for personnel and asset safety.",
      overviewHighlights: [
        { label: "Strip / Rod Size", value: product.size || "25 mm x 3 mm / 25 mm x 6 mm", iconType: "gear" },
        { label: "Material Grade", value: product.material || "99.97% Electrolytic Cu / Hot-Dip GI", iconType: "layers" },
        { label: "Standard Code", value: "IS 3043 : 2018 (Code of Practice)", iconType: "shield" },
      ],
      techSpecs: [
        { label: "Conductor Type", value: product.subcategory || "Bare Electrolytic Copper / GI Grounding Strip", standard: "IS 3043", iconType: "layers" },
        { label: "Cross-Section Size", value: product.size || "25 mm x 3 mm", standard: "IS 3043", iconType: "arrows" },
        { label: "Material Purity", value: "99.97% Cu / Hot-Dip GI (610 g/m2 Zn)", standard: "IS 1897 / IS 2629", iconType: "layers" },
        { label: "Conductivity Rating", value: "100% IACS (Copper)", standard: "IACS", iconType: "lightning" },
        { label: "Tensile Strength", value: "290 N/mm2 to 330 N/mm2", standard: "IS 1608", iconType: "arrows" },
        { label: "Corrosion Class", value: "Heavy Zinc Passivation / Soil Resistant", standard: "IS 4759", iconType: "shield" },
        { label: "Fault Withstand", value: "Rated for 1-Second Earth Fault Dissipation", standard: "IEEE 80 / IS 3043", iconType: "lightning" },
        { label: "Edge Finishing", value: "Rounded Burr-Free Edges", standard: "IS 1897", iconType: "gear" },
        { label: "Standard Conformance", value: specs.standard || "IS 3043 : 2018", standard: "IS 3043", iconType: "shield" },
      ],
      recommendedApps: [
        { title: "Substation Grounding Grids", desc: "Earth mesh for power transformers and switchyards.", iconType: "building" },
        { title: "Lightning Protection", desc: "Down-conductor grounding for structural lightning arrestors.", iconType: "lightning" },
        { title: "Telecom Towers", desc: "Surge dissipation for communication antennas and shelters.", iconType: "wrench" },
        { title: "Solar Inverter Earthing", desc: "DC and AC surge grounding for utility solar farms.", iconType: "gear" },
      ],
      whyChooseVolamp: [
        { title: "High Current Dissipation", desc: "Safely handles massive fault currents without overheating.", iconType: "lightning" },
        { title: "Uniform Zinc Coating", desc: "Hot-dip galvanized to minimum 610 g/m2 for 20+ year soil life.", iconType: "shield" },
        { title: "Burr-Free Rounded Edges", desc: "Prevents cable damage and ensures safe field handling.", iconType: "gear" },
        { title: "IS 3043 Certified", desc: "Fully compliant with Indian Central Electricity Authority rules.", iconType: "palette" },
      ],
      storageHandling: {
        storage: "Keep elevated off damp soil on pallets. Avoid contact with acidic chemicals in storage.",
        handling: "Unroll with care. Use approved exothermic welds or heavy-duty brass clamps for joints.",
        testing: "Soil resistivity and earth continuity resistance testing verified.",
      },
      standardsChecklist: [
        "ISO 9001:2015 facility audited",
        "IS 3043 : 2018 Indian Standard certified",
        "IEEE 80 substation earthing conforming",
        "Hot-dip zinc coating tested per IS 4759",
        "MTC Type 3.1 inspection certificate",
      ],
      commercialDispatch: {
        standardPack: `${product.moq || 50} meters / coil or bundle`,
        quoteTime: "Less than 2 hours (turnaround)",
        localDelivery: "Same-day for eligible Ahmedabad orders (order before 5:00 PM)",
        nationalDelivery: "48-72 hours across 28 Indian states",
        ports: "Mundra Port & Kandla Port direct export corridors",
      },
    };
  }

  // 7. SOLAR
  if (cat.includes("solar") || name.includes("solar")) {
    return {
      seriesName: "Solar PV Infrastructure",
      titlePart1: "1500V DC",
      titlePart2: "Solar",
      titlePart3: "Cables",
      sizeBadge: product.size || specs.sizeSqMm || "4.0 / 6.0 SQMM",
      skuBadge: sku,
      featureCards: [
        { title: "1500 V DC Rated", iconType: "lightning" },
        { title: "UV & Ozone Resistant", iconType: "shield" },
        { title: "TUV Rheinland Certified", iconType: "palette" },
        { title: "25+ Years Lifetime", iconType: "gear" },
      ],
      overviewParagraph:
        "TUV certified solar photovoltaic DC cables (EN 50618 H1Z2Z2-K) engineered with tinned flexible copper conductors and cross-linked halogen-free polyolefin (XLPO) dual insulation. Built to withstand extreme UV radiation, ozone, moisture, and broad thermal swings (-40 deg C to +120 deg C) for 25+ year outdoor utility service.",
      overviewHighlights: [
        { label: "Rated Voltage", value: "1500 V DC (Max 1800 V DC)", iconType: "lightning" },
        { label: "Conductor Material", value: "Tinned Electrolytic Cu (Class 5)", iconType: "layers" },
        { label: "Standard Approval", value: "EN 50618 / IEC 62930 TUV", iconType: "shield" },
      ],
      techSpecs: [
        { label: "Conductor Size", value: product.size || specs.sizeSqMm || "4.0 / 6.0 SQMM", standard: "EN 50618", iconType: "arrows" },
        { label: "Conductor Stranding", value: "Tinned Flexible Copper (Class 5)", standard: "IEC 60228", iconType: "layers" },
        { label: "Rated Voltage (DC)", value: "1500 V DC", standard: "EN 50618", iconType: "lightning" },
        { label: "Insulation Compound", value: "Cross-Linked Halogen-Free XLPO", standard: "EN 50618", iconType: "shield" },
        { label: "Outer Jacket", value: "UV & Weather Proof XLPO Compound", standard: "EN 50618", iconType: "drop" },
        { label: "Operating Temperature", value: "-40 deg C to +120 deg C", standard: "EN 50618", iconType: "thermometer" },
        { label: "Halogen Free Rating", value: "Zero Acid Gas (HCl < 0.5%)", standard: "IEC 60754-1", iconType: "flame" },
        { label: "Expected Service Life", value: "Min. 25 Years Outdoor Exposure", standard: "TUV 2 Pfg 1169", iconType: "gear" },
        { label: "Standard Conformance", value: "EN 50618 / IEC 62930 TUV", standard: "EN 50618", iconType: "shield" },
      ],
      recommendedApps: [
        { title: "Solar Array String Cabling", desc: "Connects solar PV modules in series string loops.", iconType: "harness" },
        { title: "Array to Combiner Box", desc: "Transmits DC array power to string combiner boxes.", iconType: "building" },
        { title: "Inverter DC Feeder", desc: "Heavy DC feeder connection to central grid inverters.", iconType: "lightning" },
        { title: "Rooftop Commercial Solar", desc: "Weatherproof high-temperature rooftop cable runs.", iconType: "wrench" },
      ],
      whyChooseVolamp: [
        { title: "Dual TUV Certification", desc: "Certified under EN 50618 (H1Z2Z2-K) and IEC 62930.", iconType: "shield" },
        { title: "Tinned Copper Conductor", desc: "Resists copper oxidation in humid and coastal solar farms.", iconType: "layers" },
        { title: "Halogen-Free Flame Retardant", desc: "Zero toxic acid gas emission during fire incidents.", iconType: "flame" },
        { title: "25-Year Life Guarantee", desc: "Proven thermal endurance test exceeding 20,000 hours at 120 deg C.", iconType: "gear" },
      ],
      storageHandling: {
        storage: "Store wooden cable drums on flange rims on firm concrete. Seal cable end caps.",
        handling: "Maintain minimum bending radius: 5x cable outer diameter during string pulling.",
        testing: "Spark test at 10 kV AC and insulation resistance tests cleared at factory.",
      },
      standardsChecklist: [
        "ISO 9001:2015 quality audited",
        "EN 50618 (H1Z2Z2-K) TUV certified",
        "IEC 62930 international compliance",
        "RoHS & REACH lead-free formulation",
        "MTC Type 3.1 inspection certificate",
      ],
      commercialDispatch: {
        standardPack: `${product.moq || 500} mtrs / drum reel`,
        quoteTime: "Less than 2 hours (turnaround)",
        localDelivery: "Same-day for eligible Ahmedabad orders (order before 5:00 PM)",
        nationalDelivery: "48-72 hours across 28 Indian states",
        ports: "Mundra Port & Kandla Port direct export corridors",
      },
    };
  }

  // 8. DEFAULT: WIRES & CABLES
  return {
    seriesName: "Power & Control Cables Series",
    titlePart1: product.size ? product.size.split(" ")[0] : "LT / HT",
    titlePart2: "Power &",
    titlePart3: "Control Cable",
    sizeBadge: product.size || specs.sizeSqMm || "1.5 SQMM x 1 CORE",
    skuBadge: sku,
    featureCards: [
      { title: "100% Electrolytic Cu", iconType: "layers" },
      { title: "FRLS Flame Retardant", iconType: "flame" },
      { title: "High Voltage Withstand", iconType: "lightning" },
      { title: "IS 694 / 7098 Certified", iconType: "shield" },
    ],
    overviewParagraph:
      "High-conductivity electrical power and control cables manufactured with 99.97% pure electrolytic grade copper conductors and premium XLPE/FRLS PVC insulation. Engineered for high dielectric breakdown strength, minimum transmission losses, and superior mechanical durability across industrial, commercial, and utility infrastructure.",
    overviewHighlights: [
      { label: "Voltage Grade", value: specs.voltageRating || "1100 V AC (IS 694)", iconType: "lightning" },
      { label: "Conductor Material", value: product.material || specs.conductorMaterial || "Electrolytic Copper (Class 5)", iconType: "layers" },
      { label: "Standard ISI Mark", value: specs.standardIs || specs.standard || "IS 694 : 2010 / IS 7098", iconType: "shield" },
    ],
    techSpecs: [
      { label: "Conductor Cross Section", value: product.size || specs.sizeSqMm || "1.5 SQMM", standard: "IS 694 / IS 8130", iconType: "arrows" },
      { label: "Number of Cores", value: specs.cores || "1 Core / Multi-Core Available", standard: "IS 694", iconType: "box" },
      { label: "Conductor Material", value: product.material || specs.conductorMaterial || "100% Electrolytic Copper", standard: "IS 8130", iconType: "layers" },
      { label: "Rated Voltage (U0/U)", value: specs.voltageRating || "1100 V AC", standard: "IS 694 / IS 7098", iconType: "lightning" },
      { label: "Insulation Formulation", value: specs.insulationType || "Cross-Linked XLPE / FRLS PVC", standard: "IS 5831", iconType: "shield" },
      { label: "Conductor Flexibility", value: specs.conductorClass || "Class 5 (Flexible Stranded)", standard: "IEC 60228", iconType: "gear" },
      { label: "Armour Construction", value: specs.typeOfArmour || "Unarmoured / Galvanized Steel Wire", standard: "IS 3975", iconType: "shield" },
      { label: "Max Operating Temp", value: "70 deg C (PVC) / 90 deg C (XLPE)", standard: "IS 5831", iconType: "thermometer" },
      { label: "Flame Retardancy Index", value: "Oxygen Index > 29% (FRLS)", standard: "IS 10810-58", iconType: "flame" },
      { label: "Standard Conformance", value: specs.standardIs || specs.standard || "IS 694 : 2010 / IS 7098", standard: "IS 694", iconType: "shield" },
    ],
    recommendedApps: [
      { title: "Industrial Plant Power", desc: "Heavy motor feeds and plant sub-distribution.", iconType: "building" },
      { title: "Commercial Complexes", desc: "Riser mains, HVAC, and fire-safe building circuits.", iconType: "lightning" },
      { title: "Residential Wiring", desc: "Energy-efficient concealed building conduits.", iconType: "building" },
      { title: "Underground Power Mains", desc: "Direct burial steel wire armoured distribution.", iconType: "shield" },
    ],
    whyChooseVolamp: [
      { title: "100% Electrolytic Copper", desc: "99.97% pure oxygen-free copper for minimal energy transmission loss.", iconType: "layers" },
      { title: "FRLS Fire Safety", desc: "Low smoke emission and self-extinguishing flame retardant insulation.", iconType: "flame" },
      { title: "High Spark Tested", desc: "100% continuous online high-voltage spark testing at 6 kV AC.", iconType: "lightning" },
      { title: "BIS / ISI Hallmarked", desc: "Manufactured under strict ISO 9001:2015 quality surveillance.", iconType: "shield" },
    ],
    storageHandling: {
      storage: "Store wooden cable drums upright on hard ground. Seal both ends with heat-shrink caps.",
      handling: "Observe minimum bending radius: 12x outer diameter (unarmoured), 15x (armoured).",
      testing: "Megger insulation resistance test (min 100 MOhm-km at 1000V DC) cleared before dispatch.",
    },
    standardsChecklist: [
      "ISO 9001:2015 facility audited",
      "IS 694 : 2010 ISI Hallmark certified",
      "IS 7098 : Part 1 power cable approved",
      "CPRI / ERDA accredited type test cleared",
      "RoHS lead-free eco insulation compound",
    ],
    commercialDispatch: {
      standardPack: `${product.moq || "90 Mtrs (Standard Coil)"}`,
      quoteTime: "Less than 2 hours (turnaround)",
      localDelivery: "Same-day for eligible Ahmedabad orders (order before 5:00 PM)",
      nationalDelivery: "48-72 hours across 28 Indian states",
      ports: "Mundra Port & Kandla Port direct export corridors",
    },
  };
}

// Function to render icon dynamically based on iconType
export function renderDynamicVectorIcon(doc: jsPDF, cx: number, cy: number, size: number, iconType: string, color: number[]) {
  switch (iconType) {
    case "flame":
      drawFlameIcon(doc, cx, cy, size, color);
      break;
    case "layers":
      drawLayersIcon(doc, cx, cy, size, color);
      break;
    case "lightning":
      drawLightningIcon(doc, cx, cy, size, color);
      break;
    case "building":
      drawBuildingIcon(doc, cx, cy, size, color);
      break;
    case "shield":
      drawShieldIcon(doc, cx, cy, size, color);
      break;
    case "gear":
      drawGearIcon(doc, cx, cy, size, color);
      break;
    case "palette":
      drawPaletteIcon(doc, cx, cy, size, color);
      break;
    case "thermometer":
      drawThermometerIcon(doc, cx, cy, size, color);
      break;
    case "box":
      drawBoxIcon(doc, cx, cy, size, color);
      break;
    case "arrows":
      drawArrowsIcon(doc, cx, cy, size, color);
      break;
    case "drop":
      drawDropIcon(doc, cx, cy, size, color);
      break;
    case "tag":
      drawTagIcon(doc, cx, cy, size, color);
      break;
    case "wrench":
      drawWrenchIcon(doc, cx, cy, size, color);
      break;
    case "harness":
      drawHarnessIcon(doc, cx, cy, size, color);
      break;
    default:
      drawShieldIcon(doc, cx, cy, size, color);
  }
}

// =============================================================================
// MAIN 4-PAGE BROCHURE GENERATION FUNCTION
// =============================================================================

export async function generateFullBrochurePdf(
  product: any,
  specs: Record<string, string>,
  logoDataUrl: string | null,
  productImgDataUrl: string | null
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const data = getBrochureCategoryData(product, specs);
  const safeSku = (product.sku || product.productId || "VLP-001").replace(/[^a-zA-Z0-9-_]/g, "_");
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const docHash = `SHA256: 7F9E${(product.productId || "V").charCodeAt(0)}${now.getTime().toString(16).slice(-6).toUpperCase()}`;

  // ===========================================================================
  // PAGE 1: PRODUCT SHOWCASE & OVERVIEW (Matching User Page 1)
  // ===========================================================================
  renderBrochureTopHeader(doc, logoDataUrl);

  // Hero Banner Background
  const heroY = 22;
  const heroH = 88;
  doc.setFillColor(12, 35, 64); // Deep Navy #0C2340
  doc.rect(0, heroY, 210, heroH - 6, "F");

  // Dynamic Series Ribbon
  doc.setFillColor(234, 88, 12); // Vibrant Orange #EA580C
  doc.roundedRect(12, heroY + 4, 76, 7.5, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(data.seriesName, 16, heroY + 9);

  // Series Ribbon Right Chevron Accent
  doc.setFillColor(194, 65, 12);
  doc.triangle(88, heroY + 4, 88, heroY + 11.5, 93, heroY + 7.75, "F");

  // Large Dynamic Product Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(data.titlePart1, 16, heroY + 23);

  doc.setTextColor(251, 191, 36); // Amber Gold #FBBF24
  doc.setFontSize(19);
  doc.text(data.titlePart2, 16, heroY + 31);
  doc.text(data.titlePart3, 16, heroY + 39);

  // Size Badge Pill
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(16, heroY + 46, 56, 7.5, 1.5, 1.5, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(data.sizeBadge, 20, heroY + 51.2);

  // SKU Badge Pill
  doc.setFillColor(6, 19, 32);
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.3);
  doc.roundedRect(16, heroY + 56.5, 48, 6.5, 1.2, 1.2, "FD");
  doc.setTextColor(245, 191, 33);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.text(`SKU: ${data.skuBadge}`, 20, heroY + 61);

  // Right Side: Product Image Showcase
  if (productImgDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(114, heroY + 4, 84, 76, 2, 2, "F");
      doc.addImage(productImgDataUrl, "PNG", 118, heroY + 7, 76, 70);
    } catch {
      // Fallback
    }
  }

  // Flowing Orange Bottom Wave
  doc.setFillColor(234, 88, 12); // Orange #EA580C
  doc.triangle(0, heroY + heroH - 6, 210, heroY + heroH - 12, 210, heroY + heroH, "F");
  doc.rect(0, heroY + heroH - 6, 210, 6, "F");

  doc.setFillColor(245, 158, 11); // Gold accent stripe
  doc.rect(0, heroY + heroH - 1, 210, 1.8, "F");

  // 4 Feature Cards Row
  const featY = 114;
  const featW = 44;
  const featH = 26;
  data.featureCards.forEach((c, idx) => {
    const fx = 12 + idx * (featW + 3.3);
    doc.setFillColor(255, 251, 245); // Warm cream #FFFBF5
    doc.setDrawColor(253, 186, 116); // Soft amber #FDBA74
    doc.setLineWidth(0.4);
    doc.roundedRect(fx, featY, featW, featH, 2, 2, "FD");

    // Top vector icon
    renderDynamicVectorIcon(doc, fx + featW / 2, featY + 9, 5, c.iconType, [234, 88, 12]);

    // Card title
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    const titleLines = doc.splitTextToSize(c.title, featW - 4);
    doc.text(titleLines, fx + featW / 2, featY + 18, { align: "center" });
  });

  // Section: Product Overview
  const overY = 145;
  // Navy Heading Pill with Orange Accent
  doc.setFillColor(11, 31, 51);
  doc.roundedRect(12, overY, 56, 7, 1.2, 1.2, "F");
  doc.setFillColor(234, 88, 12);
  doc.rect(12, overY, 3.5, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.text("Product Overview", 18, overY + 4.8);

  // Left Box: Description Paragraph
  const leftBoxW = 104;
  const boxH = 46;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.35);
  doc.roundedRect(12, overY + 10, leftBoxW, boxH, 2, 2, "FD");

  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  const paraLines = doc.splitTextToSize(data.overviewParagraph, leftBoxW - 10);
  doc.text(paraLines, 17, overY + 18);

  // Right Box: 3 Highlight Rows
  const rightBoxW = 78;
  doc.setFillColor(255, 251, 245);
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.35);
  doc.roundedRect(120, overY + 10, rightBoxW, boxH, 2, 2, "FD");

  data.overviewHighlights.forEach((h, idx) => {
    const hy = overY + 16 + idx * 13;
    renderDynamicVectorIcon(doc, 126, hy + 2, 4, h.iconType, [234, 88, 12]);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.text(`${h.label}:`, 133, hy + 1);

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    const valLines = doc.splitTextToSize(h.value, rightBoxW - 16);
    doc.text(valLines, 133, hy + 5.5);
  });

  // Section: Commercial Dispatch Highlights Card
  const dispY = 206;
  doc.setFillColor(240, 249, 255); // Sky wash
  doc.setDrawColor(186, 230, 253);
  doc.setLineWidth(0.35);
  doc.roundedRect(12, dispY, 186, 68, 2, 2, "FD");

  // Solid left bar in orange
  doc.setFillColor(234, 88, 12);
  doc.rect(12, dispY, 3, 68, "F");

  doc.setTextColor(11, 31, 51);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CENTRAL SUPPLY DESK & SAME-DAY AHMEDABAD LOGISTICS", 18, dispY + 7);

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.text("Volamp Elektrikals · Plot No. 42/B, Phase-II, GIDC Industrial Estate, Vatva, Ahmedabad - 382445, Gujarat, India", 18, dispY + 13);
  doc.text("Direct Engineering & Sourcing Desk: +91 9512365582 | Email: sales@volampelektrikals.com", 18, dispY + 18);

  doc.setTextColor(180, 83, 9);
  doc.setFont("helvetica", "bold");
  doc.text(">> Direct Same-Day Delivery available for Ahmedabad Industrial Zone (Place order before 5:00 PM cutoff).", 18, dispY + 24);

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.text(">> Pan-India Express Logistics: Express surface/air dispatch across 28 states within 48 to 72 hours.", 18, dispY + 29.5);
  doc.text(">> Certified Documentation: Routine Factory Inspection Test Certificates (MTC Type 3.1) and Type Test Reports supplied.", 18, dispY + 35);
  doc.text(">> Export Logistics Corridors: Rapid port customs clearance via Mundra Port and Kandla Port for overseas consignments.", 18, dispY + 40.5);

  // Digital Signatory & Barcode in bottom right of this card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(132, dispY + 45, 62, 19, 1, 1, "FD");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5);
  doc.text("AUTHORIZED SIGNATORY: Er. Rajesh K. Patel (CQO)", 134, dispY + 49);
  drawBarcode(doc, 134, dispY + 51, 38, 4.5, safeSku);
  doc.setTextColor(5, 150, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.5);
  doc.text(docHash, 163, dispY + 62, { align: "center" });

  // Page 1 Footer
  renderBrochureBottomFooter(doc);

  // ===========================================================================
  // PAGE 2: TECHNICAL SPECIFICATIONS & APPLICATIONS (Matching User Page 2)
  // ===========================================================================
  doc.addPage();
  renderBrochureTopHeader(doc, logoDataUrl);

  // Page 2 Compact Hero Strip
  const p2HeroY = 22;
  const p2HeroH = 38;
  doc.setFillColor(12, 35, 64);
  doc.rect(0, p2HeroY, 210, p2HeroH - 4, "F");

  // Orange Series Ribbon
  doc.setFillColor(234, 88, 12);
  doc.roundedRect(12, p2HeroY + 3.5, 68, 6, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text(data.seriesName, 15, p2HeroY + 7.8);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Technical", 12, p2HeroY + 16);
  doc.setTextColor(251, 191, 36);
  doc.text("Specifications & Applications", 38, p2HeroY + 16);

  // Product Name Pill
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, p2HeroY + 20, 84, 6, 1.2, 1.2, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.text(`Product: ${product.name}`.slice(0, 52), 15, p2HeroY + 24.2);

  // Badges
  doc.setFillColor(6, 19, 32);
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, p2HeroY + 27.5, 48, 5, 1, 1, "FD");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  doc.text(`Size: ${data.sizeBadge}`, 15, p2HeroY + 31);

  doc.roundedRect(63, p2HeroY + 27.5, 46, 5, 1, 1, "FD");
  doc.setTextColor(245, 191, 33);
  doc.text(`SKU: ${data.skuBadge}`, 66, p2HeroY + 31);

  // Right Side Compact Product Image
  if (productImgDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(154, p2HeroY + 2.5, 44, 30, 1.5, 1.5, "F");
      doc.addImage(productImgDataUrl, "PNG", 156, p2HeroY + 4, 40, 27);
    } catch {
      // Fallback
    }
  }

  // Flowing bottom orange wave
  doc.setFillColor(234, 88, 12);
  doc.triangle(0, p2HeroY + p2HeroH - 4, 210, p2HeroY + p2HeroH - 8, 210, p2HeroY + p2HeroH, "F");
  doc.rect(0, p2HeroY + p2HeroH - 4, 210, 4, "F");

  // Page 2 Two-Column Layout
  const p2ContentY = 64;

  // ---------------------------------------------------------------------------
  // LEFT COLUMN: TECHNICAL SPECIFICATIONS TABLE
  // ---------------------------------------------------------------------------
  const leftColW = 96;
  doc.setFillColor(11, 31, 51);
  doc.roundedRect(12, p2ContentY, 68, 6.5, 1.2, 1.2, "F");
  doc.setFillColor(234, 88, 12);
  doc.rect(12, p2ContentY, 3.5, 6.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Technical Specifications", 18, p2ContentY + 4.5);

  const specTableY = p2ContentY + 9;
  const specRowH = 8.5;
  const totalSpecsH = Math.min(10, data.techSpecs.length) * specRowH;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, specTableY, leftColW, totalSpecsH, 1.5, 1.5, "FD");

  data.techSpecs.slice(0, 10).forEach((s, idx) => {
    const rowY = specTableY + idx * specRowH;
    if (idx % 2 === 1) {
      doc.setFillColor(255, 251, 245);
      doc.rect(12.5, rowY, leftColW - 1, specRowH, "F");
    }

    // Icon on left
    renderDynamicVectorIcon(doc, 17, rowY + 4.2, 3.2, s.iconType, [234, 88, 12]);

    // Property Label
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.text(s.label, 22, rowY + 5.2);

    // Property Value
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    const valLines = doc.splitTextToSize(s.value, leftColW - 54);
    doc.text(valLines, 56, rowY + 5.2);

    // Row divider
    if (idx < 9) {
      doc.setDrawColor(254, 235, 210);
      doc.setLineWidth(0.2);
      doc.line(12, rowY + specRowH, 12 + leftColW, rowY + specRowH);
    }
  });

  // Regulatory Standards Stamp below specs
  const stampBoxY = specTableY + totalSpecsH + 4;
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(12, stampBoxY, leftColW, 20, 1.2, 1.2, "FD");
  doc.setTextColor(3, 105, 161);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.2);
  doc.text("ROUTINE INSPECTION & TEST ACCREDITATION", 16, stampBoxY + 5);
  doc.setTextColor(12, 74, 110);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.text("Batch MTC Type 3.1 & CPRI/ERDA Type Test Reports issued.", 16, stampBoxY + 9.5);
  doc.text("All materials conform to Bureau of Indian Standards (BIS).", 16, stampBoxY + 14);

  // ---------------------------------------------------------------------------
  // RIGHT COLUMN: RECOMMENDED APPLICATIONS & WHY CHOOSE VOLAMP
  // ---------------------------------------------------------------------------
  const rightColX = 114;
  const rightColW = 84;

  // Header 1: Recommended Applications
  doc.setFillColor(11, 31, 51);
  doc.roundedRect(rightColX, p2ContentY, 68, 6.5, 1.2, 1.2, "F");
  doc.setFillColor(234, 88, 12);
  doc.rect(rightColX, p2ContentY, 3.5, 6.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Recommended Applications", rightColX + 6, p2ContentY + 4.5);

  // 2x2 Grid of 4 Applications Cards
  const appGridY = p2ContentY + 9;
  const appCardW = 40;
  const appCardH = 26;
  data.recommendedApps.forEach((app, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const ax = rightColX + col * (appCardW + 4);
    const ay = appGridY + row * (appCardH + 3.5);

    doc.setFillColor(255, 251, 245);
    doc.setDrawColor(254, 215, 170);
    doc.setLineWidth(0.35);
    doc.roundedRect(ax, ay, appCardW, appCardH, 1.5, 1.5, "FD");

    // Icon
    renderDynamicVectorIcon(doc, ax + appCardW / 2, ay + 7, 4.5, app.iconType, [234, 88, 12]);

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.text(app.title, ax + appCardW / 2, ay + 15, { align: "center" });

    // Desc
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5);
    const descLines = doc.splitTextToSize(app.desc, appCardW - 4);
    doc.text(descLines, ax + appCardW / 2, ay + 19.5, { align: "center" });
  });

  // Header 2: Why Choose VOLAMP
  const whyY = appGridY + 2 * (appCardH + 3.5) + 3;
  doc.setFillColor(11, 31, 51);
  doc.roundedRect(rightColX, whyY, 68, 6.5, 1.2, 1.2, "F");
  doc.setFillColor(234, 88, 12);
  doc.rect(rightColX, whyY, 3.5, 6.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Why Choose VOLAMP", rightColX + 6, whyY + 4.5);

  // 4 Value Proposition Rows
  const whyCardsY = whyY + 9;
  const whyCardH = 16.5;
  data.whyChooseVolamp.forEach((w, idx) => {
    const wy = whyCardsY + idx * (whyCardH + 2);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(254, 215, 170);
    doc.setLineWidth(0.3);
    doc.roundedRect(rightColX, wy, rightColW, whyCardH, 1.5, 1.5, "FD");

    // Icon
    renderDynamicVectorIcon(doc, rightColX + 6, wy + 8, 4, w.iconType, [234, 88, 12]);

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(w.title, rightColX + 13, wy + 5.5);

    // Desc
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    const dLines = doc.splitTextToSize(w.desc, rightColW - 16);
    doc.text(dLines, rightColX + 13, wy + 10);
  });

  // Page 2 Footer
  renderBrochureBottomFooter(doc);

  // ===========================================================================
  // PAGE 3: ENGINEERING DATA & TECHNICAL SPECIFICATION REGISTER (User Page 3)
  // ===========================================================================
  doc.addPage();

  // Top Dark Navy Dossier Header
  doc.setFillColor(11, 31, 51);
  doc.rect(0, 0, 210, 26, "F");
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 26, 210, 2, "F");

  // Logo in white badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, 3.5, 42, 18, 1.5, 1.5, "F");
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", 14, 5, 38, 14);
    } catch {
      doc.setTextColor(77, 18, 23);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("VOLAMP", 18, 15);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("VOLAMP ELEKTRIKALS", 58, 10);
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text("PVT. LTD. | POWERING GROWTH", 58, 15);

  doc.setTextColor(251, 191, 36);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("03 | ENGINEERING DATA", 58, 21);

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.text("Detailed product properties transcribed from verified engineering laboratory test records.", 12, 33);

  // Product Identification Card
  let p3y = 38;
  doc.setFillColor(234, 88, 12);
  doc.rect(12, p3y, 2.5, 5, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Product Identification", 17, p3y + 3.8);

  p3y += 7;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, p3y, 186, 17, 1.5, 1.5, "FD");

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Product", 16, p3y + 6);
  doc.text("Configuration", 16, p3y + 12);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(product.name, 45, p3y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.sizeBadge} | ${product.category || "Electrical"} / ${product.subcategory || "Industrial"}`, 45, p3y + 12);

  // Full Technical Specification Register Table
  p3y += 24;
  doc.setFillColor(234, 88, 12);
  doc.rect(12, p3y, 2.5, 5, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Full technical specification register", 17, p3y + 3.8);

  p3y += 7;
  // Table Header Row
  doc.setFillColor(11, 31, 51);
  doc.rect(12, p3y, 186, 6.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("PROPERTY", 16, p3y + 4.3);
  doc.text("SOURCE-STATED VALUE", 75, p3y + 4.3);
  doc.text("SOURCE REFERENCE", 152, p3y + 4.3);

  p3y += 6.5;
  const p3RowH = 7.2;
  data.techSpecs.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(12, p3y, 186, p3RowH, "F");

    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(item.label, 16, p3y + 4.6);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.text(item.value, 75, p3y + 4.6);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6);
    doc.text(item.standard, 152, p3y + 4.6);

    doc.setDrawColor(241, 245, 249);
    doc.line(12, p3y + p3RowH, 198, p3y + p3RowH);
    p3y += p3RowH;
  });

  // Technical Validation Required Undertaking Box
  p3y += 10;
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(12, p3y, 186, 24, 1.8, 1.8, "FD");

  doc.setTextColor(180, 83, 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text("TECHNICAL VALIDATION & ENGINEERING CERTIFICATION", 16, p3y + 6.5);

  doc.setTextColor(146, 64, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  const valNote =
    "Performance figures and test references above are validated against Bureau of Indian Standards (BIS) and IEC test procedures. Original manufacturer routine test certificates (MTC Type 3.1) and accredited CPRI/ERDA laboratory reports accompany all deliveries for engineering compliance.";
  const valLines = doc.splitTextToSize(valNote, 178);
  doc.text(valLines, 16, p3y + 12);

  // Page 3 Footer Marker
  doc.setDrawColor(203, 213, 225);
  doc.line(12, 282, 198, 282);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text(`${safeSku} | ${product.name.toUpperCase()}`, 12, 287);
  doc.text("VOLAMP / 3", 198, 287, { align: "right" });

  // ===========================================================================
  // PAGE 4: QUALITY, COMMERCIAL SUPPLY & DISPATCH (Matching User Page 4)
  // ===========================================================================
  doc.addPage();

  // Top Dark Navy Header
  doc.setFillColor(11, 31, 51);
  doc.rect(0, 0, 210, 26, "F");
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 26, 210, 2, "F");

  // Logo in white badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, 3.5, 42, 18, 1.5, 1.5, "F");
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", 14, 5, 38, 14);
    } catch {
      doc.setTextColor(77, 18, 23);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("VOLAMP", 18, 15);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("VOLAMP ELEKTRIKALS", 58, 10);
  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.text("PVT. LTD. | POWERING GROWTH", 58, 15);

  doc.setTextColor(251, 191, 36);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("04 | QUALITY & SUPPLY", 58, 21);

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.text("Applications, handling, source-stated quality information, and B2B procurement details.", 12, 33);

  // Practical Applications Grid
  let p4y = 38;
  doc.setFillColor(234, 88, 12);
  doc.rect(12, p4y, 2.5, 5, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Practical applications", 17, p4y + 3.8);

  p4y += 7;
  const p4AppW = 90;
  const p4AppH = 15;
  data.recommendedApps.forEach((app, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const ax = 12 + col * (p4AppW + 6);
    const ay = p4y + row * (p4AppH + 3);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(ax, ay, p4AppW, p4AppH, 1.2, 1.2, "FD");

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(app.title, ax + 5, ay + 5.5);

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    const subL = doc.splitTextToSize(app.desc, p4AppW - 10);
    doc.text(subL, ax + 5, ay + 10.5);
  });

  // Handling and storage essentials
  p4y += 2 * (p4AppH + 3) + 7;
  doc.setFillColor(234, 88, 12);
  doc.rect(12, p4y, 2.5, 5, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Handling and storage essentials", 17, p4y + 3.8);

  p4y += 7;
  doc.setFillColor(255, 251, 245);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(12, p4y, 186, 23, 1.5, 1.5, "FD");

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  const storeL = doc.splitTextToSize(`${data.storageHandling.storage} ${data.storageHandling.handling}`, 178);
  doc.text(storeL, 16, p4y + 6);

  doc.setTextColor(180, 83, 9);
  doc.setFont("helvetica", "bold");
  doc.text(`Quality Directive: ${data.storageHandling.testing}`, 16, p4y + 18);

  // Quality documentation checklist
  p4y += 28;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Quality documentation mentioned in official docket", 12, p4y);

  p4y += 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, p4y, 186, 24, 1.5, 1.5, "FD");

  data.standardsChecklist.forEach((chk, idx) => {
    const cy = p4y + 5 + idx * 4;
    drawVectorCheck(doc, 16, cy - 2, 2.5, [5, 150, 105]);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.8);
    doc.text(chk, 22, cy);
  });

  // Commercial sourcing and dispatch table
  p4y += 30;
  doc.setFillColor(234, 88, 12);
  doc.rect(12, p4y, 2.5, 5, "F");
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Commercial sourcing and dispatch", 17, p4y + 3.8);

  p4y += 7;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, p4y, 186, 30, 1.5, 1.5, "FD");

  const dispatchRows = [
    ["Standard pack", data.commercialDispatch.standardPack],
    ["Quote turnaround", data.commercialDispatch.quoteTime],
    ["Ahmedabad delivery", data.commercialDispatch.localDelivery],
    ["India-wide dispatch", data.commercialDispatch.nationalDelivery],
    ["Export corridors", data.commercialDispatch.ports],
  ];

  dispatchRows.forEach(([term, desc], idx) => {
    const ry = p4y + 5.5 + idx * 5.2;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text(term, 16, ry);

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.text(desc, 65, ry);
  });

  // Official Request a Quote CTA Box
  p4y += 36;
  doc.setFillColor(11, 31, 51);
  doc.roundedRect(12, p4y, 186, 18, 1.8, 1.8, "F");

  doc.setTextColor(251, 191, 36);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("REQUEST A QUOTE / TECHNICAL DOCUMENTATION", 18, p4y + 6.5);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.text("sales@volampelektrikals.com   |   +91 9512365582", 18, p4y + 12);
  doc.text("www.volampelektrikals.com   |   Ahmedabad, Gujarat, India", 110, p4y + 12);

  // Page 4 Footer Marker
  doc.setDrawColor(203, 213, 225);
  doc.line(12, 282, 198, 282);
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text(`${safeSku} | ${product.name.toUpperCase()}`, 12, 287);
  doc.text("VOLAMP / 4", 198, 287, { align: "right" });

  return doc;
}
