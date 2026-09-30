import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Flame,
  Globe,
  Heart,
  HelpCircle,
  Info,
  Layers,
  Lock,
  Maximize2,
  Minus,
  Package,
  Phone,
  Plus,
  RotateCcw,
  Scale,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import { getProductImage, getCategoryFallbackImage } from "@/data/categories";
import { trpc } from "@/lib/trpc";
import { QuickOrderModal } from "@/components/quickorder/QuickOrderModal";
import { EnquireModal } from "@/components/enquire/EnquireModal";
import UniversalFooter from "@/components/layout/UniversalFooter";
import { useCart } from "@/contexts/CartContext";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";
import jsPDF from "jspdf";

function parseSpecs(raw: any): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function formatProductPrice(prod: any): string {
  if (typeof prod?.numericPrice === "number" && prod.numericPrice > 0) {
    return `₹${prod.numericPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (prod?.discountedPrice && typeof prod.discountedPrice === "string") {
    const clean = prod.discountedPrice.replace(/[^0-9.]/g, "");
    const num = parseFloat(clean);
    if (!isNaN(num) && num > 0) {
      return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }
  if (prod?.price && typeof prod.price === "string") {
    const clean = prod.price.replace(/[^0-9.]/g, "");
    const num = parseFloat(clean);
    if (!isNaN(num) && num > 0) {
      return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }
  return "₹1,250.00";
}

function formatListPrice(rawPrice?: string | null): string | null {
  if (!rawPrice || typeof rawPrice !== "string") return null;
  const clean = rawPrice.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  if (!isNaN(num) && num > 0) {
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return null;
}

interface GalleryItem {
  url: string;
  label: string;
}

/**
 * Returns strictly category-appropriate gallery images.
 * Completely eliminates cross-contamination (e.g. tape or cables on a gland).
 */
function getCategoryGallery(product: any): GalleryItem[] {
  if (!product) return [{ url: "/products/cables.jpg", label: "Product View" }];

  const cat = (product.category || "").toLowerCase();
  const name = (product.name || "").toLowerCase();
  const primaryImg = getProductImage(product, product.category);
  const fallback = getCategoryFallbackImage(product.category);

  // 1. GLANDS: 4 photorealistic perspectives
  if (cat.includes("gland") || name.includes("gland")) {
    return [
      { url: primaryImg || "/products/cable-gland.jpg", label: "Assembled Gland" },
      { url: "/products/gland-exploded.jpg", label: "Component Exploded View" },
      { url: "/products/gland-schematic.jpg", label: "CAD Dimensions" },
      { url: "/products/gland-packaging.jpg", label: "Industrial Packaging Box" },
    ];
  }

  // 2. WIRES & CABLES
  if (cat.includes("cable") || cat.includes("wire") || name.includes("cable") || name.includes("wire")) {
    return [
      { url: primaryImg || "/products/cables.jpg", label: "Standard Product Coil" },
      { url: "/products/cables.jpg", label: "Conductor Structure" },
    ];
  }

  // 3. CABLE LUGS & TERMINALS
  if (cat.includes("lug") || name.includes("lug") || cat.includes("terminal")) {
    return [
      { url: primaryImg || "/products/cable-lugs.jpg", label: "Terminal Lug Profile" },
      { url: "/products/cable-lugs.jpg", label: "Barrel & Palm Chamfer" },
    ];
  }

  // 4. SWITCHGEAR
  if (cat.includes("switch") || name.includes("mcb") || name.includes("mccb") || cat.includes("breaker")) {
    return [
      { url: primaryImg || "/products/switchgear.jpg", label: "Modular Unit Front" },
      { url: "/products/switchgear.jpg", label: "Terminal & DIN Mount" },
    ];
  }

  // 5. SOLAR
  if (cat.includes("solar") || name.includes("solar") || name.includes("panel")) {
    return [
      { url: primaryImg || "/products/solar-panel.jpg", label: "PV Module Front" },
      { url: "/products/solar-panel.jpg", label: "Solar Cell Matrix" },
    ];
  }

  // 6. EARTHING
  if (cat.includes("earth") || name.includes("earth") || name.includes("rod")) {
    return [
      { url: primaryImg || "/products/earthing-rods.png", label: "Copper Bonded Electrode" },
      { url: "/products/earthing-rods.png", label: "Terminal Clamp Profile" },
    ];
  }

  // 7. PVC PIPES & CONDUITS
  if (cat.includes("pipe") || cat.includes("conduit") || name.includes("pipe") || name.includes("conduit")) {
    return [
      { url: primaryImg || "/products/pvc-pipe.jpg", label: "Conduit Profile" },
      { url: "/products/pvc-pipe.jpg", label: "Bundle View" },
    ];
  }

  // 8. WIRING DEVICES
  if (cat.includes("wiring") || cat.includes("device") || name.includes("tape")) {
    return [
      { url: primaryImg || "/products/wiring-devices.jpg", label: "Device Unit" },
    ];
  }

  // Default: Only return the primary image or category fallback (never cross-category!)
  return [
    { url: primaryImg || fallback, label: "Product View" },
  ];
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:productId");
  const [, pParams] = useRoute("/p/:productId");
  const [, slugParams] = useRoute("/product/:productId/:slug");
  const [, navigate] = useLocation();

  const productId = params?.productId || pParams?.productId || slugParams?.productId || "";

  // Query product data from backend
  const { data: product, isLoading, error } = trpc.products.getById.useQuery(
    { productId },
    { enabled: Boolean(productId) }
  );

  // Cart & Compare contexts
  const { addItem, totalCount, openCart } = useCart();
  const { compareCategory, toggleCompare, isProductInCompare } = useCompare();

  // State management
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "details" | "downloads" | "policy">("specs");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [specSearchQuery, setSpecSearchQuery] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Synchronize MOQ & initial packaging option once product is loaded
  useEffect(() => {
    if (product) {
      const moqNum = parseInt(String(product.moq).replace(/[^0-9]/g, ""), 10);
      const initialQty = moqNum && moqNum > 0 ? moqNum : 100;
      setQuantity(initialQty);
      setSelectedImageIndex(0);

      const cat = (product.category || "").toLowerCase();
      if (cat.includes("cable") || cat.includes("wire")) {
        setSelectedVariant("90 Mtrs");
      } else if (cat.includes("gland") || cat.includes("lug")) {
        setSelectedVariant(`1 Box (${initialQty} Pcs)`);
      } else if (cat.includes("switch")) {
        setSelectedVariant("1 Box (12 Pcs)");
      } else {
        setSelectedVariant(`Standard Pack (${initialQty})`);
      }
    }
  }, [product?.productId]);

  // Specs & Prices
  const specs = useMemo(() => parseSpecs(product?.specifications), [product]);
  
  const unitPriceNum = useMemo(() => {
    if (typeof product?.numericPrice === "number" && product.numericPrice > 0) {
      return product.numericPrice;
    }
    if (product?.price) {
      const clean = String(product.price).replace(/[^0-9.]/g, "");
      const num = parseFloat(clean);
      if (!isNaN(num)) return num;
    }
    return 95;
  }, [product]);

  // Flat contractor price (strictly 40% OFF MRP across all quantities)
  const effectiveUnitPrice = useMemo(() => {
    return unitPriceNum;
  }, [unitPriceNum]);

  const listPrice = formatListPrice(product?.price);
  const priceFormatted = formatProductPrice(product);

  const totalPrice = useMemo(() => {
    return effectiveUnitPrice * quantity;
  }, [effectiveUnitPrice, quantity]);

  const isCompared = product ? isProductInCompare(product.productId) : false;

  // Query related products from same category
  const { data: relatedData } = trpc.products.list.useQuery(
    {
      category: product?.category,
      limit: 4,
    },
    { enabled: Boolean(product?.category) }
  );

  const relatedProducts = useMemo(() => {
    return (relatedData?.products || []).filter((p) => p.productId !== product?.productId).slice(0, 4);
  }, [relatedData, product]);

  const prodImg = product ? getProductImage(product, product.category) : "/products/cables.jpg";
  const categoryFallback = product ? getCategoryFallbackImage(product.category) : "/products/cables.jpg";

  // Category-specific gallery items (zero cross-contamination)
  const galleryImages = useMemo(() => {
    return getCategoryGallery(product);
  }, [product, prodImg]);

  // Category-aware packaging options
  const packagingVariants = useMemo(() => {
    if (!product) return [];
    const cat = (product.category || "").toLowerCase();
    const name = (product.name || "").toLowerCase();
    const moqNum = parseInt(String(product.moq).replace(/[^0-9]/g, ""), 10) || 100;
    const unitClean = product.unit ? product.unit.replace("Per ", "") : "Units";

    // Wires & Cables
    if (cat.includes("cable") || cat.includes("wire") || name.includes("cable") || name.includes("wire")) {
      return [
        { id: "90 Mtrs", label: "90 Mtrs", sub: "Std Coil", qty: 90 },
        { id: "180 Mtrs", label: "180 Mtrs", sub: "Double Coil", qty: 180 },
        { id: "500 Mtrs", label: "500 Mtrs", sub: "Drum Reel", qty: 500 },
        { id: "1000 Mtrs", label: "1000 Mtrs", sub: "Project Reel", qty: 1000 },
      ];
    }

    // Glands & Lugs (sold per piece / box)
    if (cat.includes("gland") || cat.includes("lug") || name.includes("gland") || name.includes("lug")) {
      return [
        { id: `1 Box (${moqNum} Pcs)`, label: "1 Box", sub: `${moqNum} Pcs (MOQ)`, qty: moqNum },
        { id: `2 Boxes (${moqNum * 2} Pcs)`, label: "2 Boxes", sub: `${moqNum * 2} Pcs`, qty: moqNum * 2 },
        { id: `5 Boxes (${moqNum * 5} Pcs)`, label: "5 Boxes", sub: `${moqNum * 5} Pcs`, qty: moqNum * 5 },
        { id: "Master Carton", label: "Master Carton", sub: `${Math.max(1000, moqNum * 10)} Pcs`, qty: Math.max(1000, moqNum * 10) },
      ];
    }

    // Switchgear
    if (cat.includes("switch") || name.includes("mcb") || name.includes("breaker")) {
      return [
        { id: "1 Piece", label: "1 Piece", sub: "Sample", qty: 1 },
        { id: "1 Box (12 Pcs)", label: "1 Box", sub: "12 Pcs Pack", qty: 12 },
        { id: "Master Case (60 Pcs)", label: "Master Case", sub: "60 Pcs", qty: 60 },
        { id: "Project Lot (120 Pcs)", label: "Project Lot", sub: "120 Pcs", qty: 120 },
      ];
    }

    // Generic
    return [
      { id: `1 Lot (${moqNum} ${unitClean})`, label: "1 Pack", sub: `${moqNum} ${unitClean} (MOQ)`, qty: moqNum },
      { id: `2 Lots (${moqNum * 2} ${unitClean})`, label: "2 Packs", sub: `${moqNum * 2} ${unitClean}`, qty: moqNum * 2 },
      { id: `5 Lots (${moqNum * 5} ${unitClean})`, label: "5 Packs", sub: `${moqNum * 5} ${unitClean}`, qty: moqNum * 5 },
      { id: `Bulk Project Lot`, label: "Bulk Lot", sub: `${moqNum * 10} ${unitClean}`, qty: moqNum * 10 },
    ];
  }, [product]);

  // Category-specific Key Technical Attributes
  const keyAttributes = useMemo(() => {
    if (!product) return [];
    const cat = (product.category || "").toLowerCase();
    const name = (product.name || "").toLowerCase();

    // GLANDS
    if (cat.includes("gland") || name.includes("gland")) {
      return [
        { label: "Compression Type", value: specs.compressionType || product.subcategory || "Single Compression" },
        { label: "Gland Size (Metric)", value: specs.sizeCode || product.size || "10MM" },
        { label: "Size (Inches)", value: specs.sizeInch || '(3/8")' },
        { label: "Suitable Cable OD", value: specs.suitableCableOdMm ? `${specs.suitableCableOdMm} mm` : "8.00 - 12.0 mm" },
        { label: "Nipple Thread", value: specs.nippleThread || '5/8"' },
        { label: "Body Material", value: product.material || "Brass (Nickel Plated)" },
        { label: "Standard Conformance", value: specs.standard || "BS 6121 / IS 12943" },
      ];
    }

    // LUGS
    if (cat.includes("lug") || name.includes("lug")) {
      return [
        { label: "Lug / Terminal Type", value: specs.lugType || product.subcategory || "Tubular Crimping Lug" },
        { label: "Size / Cross-Section", value: product.size || specs.sizeRange || "Standard" },
        { label: "Conductor Material", value: product.material || "Copper (Electro-Tinned)" },
        { label: "Barrel Style", value: specs.barrelStyle || "Standard Barrel with Inspection Hole" },
        { label: "Standard Conformance", value: specs.standard || "IS 8309 / DIN 46235" },
      ];
    }

    // SWITCHGEAR
    if (cat.includes("switch") || name.includes("mcb") || name.includes("breaker")) {
      return [
        { label: "Poles / Configuration", value: specs.polesPhase || product.size || "1 Pole (1P)" },
        { label: "Rated Current (In)", value: specs.currentRatingA ? `${specs.currentRatingA} A` : "16 Amp" },
        { label: "Breaking Capacity", value: specs.breakingCapacityKa ? `${specs.breakingCapacityKa} kA` : "10 kA (Icn)" },
        { label: "Tripping Curve", value: specs.tripCurve || "Type C Curve" },
        { label: "Rated Voltage", value: specs.voltageRatingV ? `${specs.voltageRatingV} V` : "240/415 V AC" },
        { label: "Standard Conformance", value: specs.standard || "IEC 60898-1 / IS 8828" },
      ];
    }

    // SOLAR
    if (cat.includes("solar") || name.includes("solar") || name.includes("panel")) {
      return [
        { label: "Nominal Power Rating", value: specs.watt ? `${specs.watt} Wp` : product.size || "540 Wp" },
        { label: "Module Efficiency", value: specs.efficiency || "> 21.5%" },
        { label: "Cell Configuration", value: product.subcategory || "Half-Cut Mono PERC / TOPCon" },
        { label: "Operating Current (Imp)", value: specs.current40CAmp ? `${specs.current40CAmp} A` : "13.2 A" },
        { label: "Standard Conformance", value: specs.standard || "IEC 61215 / IEC 61730" },
      ];
    }

    // WIRES & CABLES
    return [
      { label: "Conductor Size", value: product.size || specs.sizeSqMm || "1.5 SQMM" },
      { label: "No. of Cores", value: specs.cores || "1 Core" },
      { label: "Conductor Class", value: specs.conductorClass || "Class 5 (Flexible Stranded)" },
      { label: "Conductor Material", value: product.material || specs.conductorMaterial || "Electrolytic Copper" },
      { label: "Insulation Type", value: specs.insulationType || "FRLS / PVC Type C" },
      { label: "Voltage Grade", value: specs.voltageRating || "1100 V (IS 694)" },
      { label: "Standard Conformance", value: specs.standardIs || "IS 694 : 2010" },
    ];
  }, [product, specs]);

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!product) return;
    const unitLabel = product.unit ? product.unit.replace("Per ", "") : "Units";
    addItem({
      id: product.productId,
      name: product.name,
      category: product.category,
      sku: product.sku || product.productId,
      detail: `${selectedVariant || unitLabel} · ${product.size || product.subcategory || ""}`,
      price: effectiveUnitPrice,
      unit: unitLabel,
      quantity,
      image: galleryImages[0]?.url || prodImg,
    });
    toast.success("Added to Cart Successfully", {
      description: `${quantity} ${unitLabel} of ${product.name} ready in your cart.`,
    });
  };

  // Handle Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || "VOLAMP Industrial Product",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product Link Copied!", {
        description: "Direct link copied to clipboard.",
      });
    }
  };

  // Copy attribute to clipboard
  const handleCopySpec = (key: string, value: string) => {
    navigator.clipboard.writeText(`${key}: ${value}`);
    setCopiedKey(key);
    toast.success(`Copied ${key}`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Handle Pincode Check
  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setPincodeStatus("Please enter a valid 6-digit Indian Postal Code.");
      return;
    }
    setIsCheckingPincode(true);
    setTimeout(() => {
      setIsCheckingPincode(false);
      const days = (parseInt(pincode.slice(-1), 10) % 2) + 2;
      setPincodeStatus(`Available! Pan-India express dispatch to ${pincode} within ${days} business days.`);
    }, 400);
  };

  // Handle Download Technical Datasheet PDF using jsPDF
  const handleDownloadDatasheet = () => {
    if (!product) return;
    try {
      const doc = new jsPDF();

      // Top Header Banner
      doc.setFillColor(29, 115, 183);
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("VOLAMP ELEKTRIKALS · TECHNICAL DATASHEET", 14, 16);

      // Company Info Subheader
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("Government & Industrial Certified Electrical Distributor · ISO 9001:2015 · IS/IEC Conforming", 14, 32);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 150, 32);

      // Product Title Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 38, 182, 28, 2, 2, "FD");

      doc.setTextColor(29, 115, 183);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(product.brand?.toUpperCase() || "VOLAMP INDUSTRIAL SPECIFICATION", 18, 46);

      doc.setTextColor(17, 30, 46);
      doc.setFontSize(12);
      const titleLines = doc.splitTextToSize(product.name, 174);
      doc.text(titleLines, 18, 54);

      // Master Parameters Table
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("1. MASTER TECHNICAL ATTRIBUTES", 14, 76);

      // Category-aware PDF table
      const cat = (product.category || "").toLowerCase();
      let tableData: string[][] = [
        ["Product Reference ID", product.productId],
        ["Master SKU Code", product.sku || "N/A"],
        ["Product Category", product.category || "Electrical Supplies"],
        ["Subcategory / Series", product.subcategory || "Standard Series"],
      ];

      if (cat.includes("gland")) {
        tableData.push(
          ["Compression Type", specs.compressionType || "Single Compression"],
          ["Gland Size", specs.sizeCode || product.size || "10MM"],
          ["Size (Inches)", specs.sizeInch || '(3/8")'],
          ["Suitable Cable OD", specs.suitableCableOdMm ? `${specs.suitableCableOdMm} mm` : "8.00 - 12.0 mm"],
          ["Nipple Thread", specs.nippleThread || '5/8"'],
          ["Body Material", product.material || "Brass (Nickel Plated)"],
          ["Packing Per Box", `${specs.packingPerBoxPcs || product.moq || 168} Pcs / Box`],
          ["Standard Conformance", specs.standard || "BS 6121 / IS 12943"]
        );
      } else if (cat.includes("lug")) {
        tableData.push(
          ["Lug / Terminal Type", specs.lugType || "Tubular Crimping Lug"],
          ["Size / Cross-Section", product.size || specs.sizeRange || "Standard"],
          ["Material", product.material || "Electro-Tinned Copper"],
          ["Barrel Style", specs.barrelStyle || "Standard Barrel"],
          ["Standard Conformance", specs.standard || "IS 8309 / DIN 46235"]
        );
      } else if (cat.includes("switch")) {
        tableData.push(
          ["Poles Configuration", specs.polesPhase || product.size || "1 Pole (1P)"],
          ["Rated Current", specs.currentRatingA ? `${specs.currentRatingA} A` : "16 Amp"],
          ["Breaking Capacity", specs.breakingCapacityKa ? `${specs.breakingCapacityKa} kA` : "10 kA"],
          ["Tripping Curve", specs.tripCurve || "Type C Curve"],
          ["Rated Voltage", specs.voltageRatingV ? `${specs.voltageRatingV} V` : "240/415 V AC"],
          ["Standard Conformance", specs.standard || "IEC 60898-1 / IS 8828"]
        );
      } else {
        tableData.push(
          ["Conductor Size", product.size || specs.sizeSqMm || "Standard"],
          ["Conductor Material", product.material || specs.conductorMaterial || "Electrolytic Grade Copper"],
          ["Voltage Grade / Rating", specs.voltageRating || "1100 V (IS 694)"],
          ["Insulation Compound", specs.insulationType || "FRLS / PVC Type C"],
          ["Conductor Class", specs.conductorClass || "Class 5 (Flexible Stranded)"],
          ["Core Configuration", specs.cores || "1 Core"],
          ["Armour Construction", specs.typeOfArmour || "Unarmoured"],
          ["Standard Conformance", specs.standardIs || "IS 694 : 2010"]
        );
      }

      tableData.push(["Minimum Order Quantity", String(product.moq || "100 Units")]);

      let yPos = 84;
      doc.setFontSize(9);

      tableData.forEach(([label, val], idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, yPos - 4.5, 182, 7.5, "F");
        }
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(label, 18, yPos);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(String(val || "N/A"), 88, yPos);

        doc.setDrawColor(241, 245, 249);
        doc.line(14, yPos + 3, 196, yPos + 3);

        yPos += 7.5;
      });

      // Quality & Mill Test Notice
      yPos += 8;
      doc.setDrawColor(186, 230, 253);
      doc.setFillColor(240, 249, 255);
      doc.roundedRect(14, yPos, 182, 22, 2, 2, "FD");

      doc.setTextColor(3, 105, 161);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("OFFICIAL MILL TEST CERTIFICATE (MTC) & DISPATCH POLICY", 18, yPos + 6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(12, 74, 110);
      doc.text(
        "All materials supplied by Volamp Elektrikals conform to Bureau of Indian Standards (BIS) and IEC guidelines.\nFactory Inspection Routine Test Certificates are issued alongside delivery challan for contractor documentation.",
        18,
        yPos + 12
      );

      // Footer
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text("Volamp Elektrikals · GIDC Estate, Vatva, Ahmedabad, Gujarat · sales@volampelektrikals.com · +91 9512365582", 14, 285);

      doc.save(`VOLAMP_${product.productId}_Datasheet.pdf`);
      toast.success("Datasheet Downloaded", {
        description: `Official technical PDF for ${product.name} downloaded.`,
      });
    } catch (e: any) {
      toast.error("Failed to generate datasheet", { description: e.message });
    }
  };

  // Full technical specifications docket
  const allSpecPairs = useMemo(() => {
    const list: Array<{ label: string; value: string; category: string }> = [];

    // Add key attributes first
    keyAttributes.forEach((item) => {
      list.push({ label: item.label, value: item.value, category: "Core Parameters" });
    });

    // Add any remaining fields from raw specifications
    Object.entries(specs).forEach(([k, v]) => {
      if (!v) return;
      // Convert camelCase key to Human Title Case
      const formattedKey = k
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      const alreadyExists = list.some((item) => item.label.toLowerCase() === formattedKey.toLowerCase());
      if (!alreadyExists) {
        list.push({
          label: formattedKey,
          value: String(v),
          category: "Technical Specifications",
        });
      }
    });

    // General product fields
    list.push(
      { label: "Product Brand", value: product?.brand || "VOLAMP", category: "General Parameters" },
      { label: "Product Category", value: product?.category || "Electrical Supplies", category: "General Parameters" },
      { label: "Procurement Unit", value: product?.unit || "Per Piece", category: "General Parameters" },
      { label: "Minimum Order Quantity", value: String(product?.moq || "100 Units"), category: "General Parameters" },
      { label: "Warranty Period", value: "12 Months Comprehensive OEM Replacement Guarantee", category: "General Parameters" },
      { label: "Stock & Dispatch Availability", value: product?.availability || "In Stock · Ready to Dispatch", category: "General Parameters" }
    );

    if (!specSearchQuery.trim()) return list;
    const q = specSearchQuery.toLowerCase();
    return list.filter((item) => item.label.toLowerCase().includes(q) || item.value.toLowerCase().includes(q));
  }, [keyAttributes, specs, product, specSearchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090f17] flex flex-col font-sans">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 flex-1 w-full animate-pulse space-y-8">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 h-[480px] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="lg:col-span-4 space-y-4">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
            </div>
            <div className="lg:col-span-3 h-[420px] bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090f17] flex flex-col items-center justify-center font-sans p-6">
        <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-[#111e2e] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 mx-auto flex items-center justify-center">
            <Package className="size-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Product Not Found</h1>
          <p className="text-xs text-slate-500">
            We could not find the product with reference ID "{productId}". It may have been relocated or updated in our catalog.
          </p>
          <div className="pt-2">
            <Link
              href="/category/wires-cables"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1d73b7] to-[#0284c7] text-white text-xs font-bold hover:shadow-lg hover:shadow-sky-500/25 transition-all"
            >
              Browse Complete Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentActiveImage = galleryImages[selectedImageIndex]?.url || prodImg || categoryFallback;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-slate-50 to-[#f1f5f9] dark:from-[#090f17] dark:via-[#0c1522] dark:to-[#080d14] text-[#1e293b] dark:text-[#f1f5f9] flex flex-col font-sans transition-colors">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0c1522]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Direct Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/volamp-logo.png"
                alt="VOLAMP Elektrikals"
                className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors">
                Home
              </Link>
              <Link href="/category/wires-cables" className="hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors">
                Products
              </Link>
              <Link href="/about-volamp" className="hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors">
                About Us
              </Link>
              <Link href="/branch-locations" className="hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors">
                Branches
              </Link>
              <Link href="/calculator" className="hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors">
                Calculator
              </Link>
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <ThemeToggle />

            {/* Track Order */}
            <Link
              href="/track"
              className="flex items-center gap-1.5 hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors group"
            >
              <Send className="size-4 text-[#1d73b7] group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline">Track Order</span>
            </Link>

            {/* Upload PO / Request Quote */}
            <button
              type="button"
              onClick={() => setEnquireOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-[#1d73b7] dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors cursor-pointer group"
            >
              <FileText className="size-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>Upload PO</span>
            </button>

            {/* Quick Order */}
            <button
              type="button"
              onClick={() => setQuickOrderOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer group"
            >
              <Zap className="size-4 group-hover:scale-110 transition-transform" />
              <span>Quick Order</span>
            </button>

            {/* Cart with Counter */}
            <button
              type="button"
              onClick={openCart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-all cursor-pointer relative shadow-sm"
            >
              <div className="relative">
                <ShoppingCart className="size-4" />
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 size-4 bg-[#c56718] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. REFINED BREADCRUMB BAR */}
      <section className="bg-white/50 dark:bg-[#0c1522]/50 border-b border-slate-200/60 dark:border-slate-800/60 py-3">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#1d73b7] transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3 text-slate-400 shrink-0" />
          <Link href="/category/wires-cables" className="hover:text-[#1d73b7] transition-colors">
            {product.category || "Electrical Supplies"}
          </Link>
          {product.subcategory && (
            <>
              <ChevronRight className="size-3 text-slate-400 shrink-0" />
              <span className="hover:text-[#1d73b7] cursor-pointer">
                {product.subcategory}
              </span>
            </>
          )}
          {product.brand && (
            <>
              <ChevronRight className="size-3 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {product.brand}
              </span>
            </>
          )}
          <ChevronRight className="size-3 text-slate-400 shrink-0" />
          <span className="text-[#1d73b7] dark:text-sky-400 font-semibold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </div>
      </section>

      {/* 3. HERO PRODUCT WORKSPACE (Enhanced 3-Column Visual Layout) */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* COLUMN 1: PRODUCT IMAGERY & SUB-PHOTOS (Category-Accurate & Safe)         */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 relative group shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              
              {/* Subtle Ambient Radial Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-sky-400/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Floating Top Bar (Genuine Badge + Actions) */}
              <div className="flex items-center justify-between relative z-10 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold tracking-wide">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  100% Genuine · OEM Certified
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWishlisted(!isWishlisted);
                      toast.success(isWishlisted ? "Removed from Wishlist" : "Saved to Project Wishlist");
                    }}
                    className={`size-9 rounded-full flex items-center justify-center border transition-all cursor-pointer backdrop-blur-md ${
                      isWishlisted
                        ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/25"
                        : "bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-300"
                    }`}
                    title="Wishlist"
                  >
                    <Heart className={`size-4 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="size-9 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#1d73b7] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-2xs"
                    title="Share Product"
                  >
                    <Share2 className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="size-9 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#1d73b7] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-2xs"
                    title="Expand View"
                  >
                    <Maximize2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Main Showcase Image Container with Fallback Protection */}
              <div 
                onClick={() => setLightboxOpen(true)}
                className="h-80 sm:h-96 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/30 dark:to-[#0e1726] border border-slate-100/80 dark:border-slate-800/50 p-6 relative cursor-zoom-in group/zoom"
              >
                <img
                  src={currentActiveImage}
                  alt={galleryImages[selectedImageIndex]?.label || product.name}
                  onError={(e) => {
                    if (e.currentTarget.src !== window.location.origin + categoryFallback) {
                      e.currentTarget.src = categoryFallback;
                    }
                  }}
                  className="max-h-full max-w-full object-contain group-hover/zoom:scale-108 transition-transform duration-500 filter drop-shadow-md"
                />
                
                {/* Click to Enlarge Overlay Pill */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1.5 opacity-0 group-hover/zoom:opacity-100 transition-opacity">
                  <Eye className="size-3" />
                  <span>Click to expand high-res</span>
                </div>
              </div>

              {/* Verified Quality Spec Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="size-4 text-[#1d73b7] dark:text-sky-400" />
                  <span className="font-semibold">Quality Verified Specification</span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {specs.standard || specs.standardIs || "IS / IEC Standard"}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery Strip (Category-Accurate sub photos) */}
            <div className={`grid gap-3 ${galleryImages.length > 2 ? "grid-cols-4" : galleryImages.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {galleryImages.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`h-22 rounded-2xl bg-white dark:bg-[#0e1726] border p-2 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${
                    selectedImageIndex === idx
                      ? "border-[#1d73b7] dark:border-sky-400 ring-3 ring-[#1d73b7]/15 dark:ring-sky-400/20 shadow-sm"
                      : "border-slate-200/90 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                  title={item.label}
                >
                  <img 
                    src={item.url} 
                    alt={item.label} 
                    onError={(e) => {
                      if (e.currentTarget.src !== window.location.origin + categoryFallback) {
                        e.currentTarget.src = categoryFallback;
                      }
                    }}
                    className="max-h-12 max-w-full object-contain group-hover:scale-105 transition-transform" 
                  />
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-full mt-1.5 text-center">
                    {item.label}
                  </span>
                  {selectedImageIndex === idx && (
                    <span className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[#1d73b7] to-sky-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COLUMN 2: ATTRIBUTES, BADGES & DATASHEET                                  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Brand, Title & SKU */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600/10 to-sky-600/10 text-[#1d73b7] dark:text-sky-400 border border-blue-500/20 text-xs font-black tracking-wider uppercase">
                  {product.brand || "VOLAMP AUTHORIZED"}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-500 font-semibold">
                  {product.category}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight leading-snug">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                <span>SKU: <strong className="text-slate-700 dark:text-slate-200">{product.sku}</strong></span>
                <span>•</span>
                <span>ID: <strong className="text-slate-700 dark:text-slate-200">{product.productId}</strong></span>
              </div>
            </div>

            {/* Quick Feature Badges Bar */}
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-500" />
                {specs.standard || specs.standardIs || "IS / IEC Certified"}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <Zap className="size-3 text-amber-500" />
                {product.material || "Industrial Grade"}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <Package className="size-3 text-sky-500" />
                MOQ: {product.moq || "100 Units"}
              </span>
            </div>

            {/* Category-Aware Packaging & Lot Selector */}
            <div className="space-y-2 p-4 rounded-2xl bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Select Procurement Packaging / Lot:
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Standard Industrial Lots</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {packagingVariants.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedVariant(item.id);
                      setQuantity(item.qty);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center relative ${
                      selectedVariant === item.id || quantity === item.qty
                        ? "bg-[#1d73b7] text-white border-[#1d73b7] shadow-md shadow-blue-500/20"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    <span className="block text-xs font-black">{item.label}</span>
                    <span className={`block text-[9px] ${selectedVariant === item.id || quantity === item.qty ? "text-blue-100" : "text-slate-400"}`}>
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Download Datasheet Banner Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/5 via-blue-500/5 to-transparent border border-sky-500/20 dark:border-sky-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#1d73b7]/10 dark:bg-sky-400/10 text-[#1d73b7] dark:text-sky-400 flex items-center justify-center shrink-0">
                  <FileText className="size-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    Engineering Datasheet (PDF)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Official technical parameters & dimension drawing specifications
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadDatasheet}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1d73b7] hover:bg-[#155a8f] text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0 group"
              >
                <Download className="size-3.5 group-hover:-translate-y-0.5 transition-transform" />
                <span>Download</span>
              </button>
            </div>

            {/* 4 Feature / Guarantee Duotone Micro-Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 text-center flex flex-col items-center justify-center gap-1.5 hover:border-sky-300 dark:hover:border-sky-700 transition-colors shadow-2xs group">
                <div className="size-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  Pan-India Transit
                </span>
                <span className="text-[9px] text-slate-400">24-48h Dispatch</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 text-center flex flex-col items-center justify-center gap-1.5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-2xs group">
                <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RotateCcw className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  30 Days Guarantee
                </span>
                <span className="text-[9px] text-slate-400">Transit Insured</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 text-center flex flex-col items-center justify-center gap-1.5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors shadow-2xs group">
                <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileCheck className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  Mill Test Report
                </span>
                <span className="text-[9px] text-slate-400">Official MTC</span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 text-center flex flex-col items-center justify-center gap-1.5 hover:border-amber-300 dark:hover:border-amber-700 transition-colors shadow-2xs group">
                <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  Brand Warranty
                </span>
                <span className="text-[9px] text-slate-400">Official OEM</span>
              </div>
            </div>

            {/* Key Technical Attributes Quick Preview (Category-Accurate) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Key Technical Attributes
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className="text-xs text-[#1d73b7] dark:text-sky-400 font-bold hover:underline"
                >
                  View All Specs →
                </button>
              </div>

              <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 text-xs overflow-hidden bg-white dark:bg-[#0e1726] shadow-2xs">
                {keyAttributes.map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <span className="text-slate-500 font-medium">{row.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Report an Issue Link */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setEnquireOpen(true)}
                  className="text-[11px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  <HelpCircle className="size-3" />
                  <span>Report data discrepancy / request clarification</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COLUMN 3: BUY BOX / ORDER EXECUTION CARD                                  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
            <div className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/50 space-y-5 relative overflow-hidden">
              
              {/* Premium Top Border Accent */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1d73b7] via-sky-400 to-[#c56718]" />

              {/* Price Hero Section */}
              <div className="space-y-1.5 pt-1">
                {listPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 line-through">
                      MRP: {listPrice}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {product.discount || "Wholesale Tier"}
                    </span>
                  </div>
                )}
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                    {effectiveUnitPrice !== unitPriceNum ? `₹${effectiveUnitPrice.toFixed(2)}` : priceFormatted}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    /{product.unit ? product.unit.replace("Per ", "") : "Pc"}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {product.availability || "In Stock · Ready to Dispatch"}
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 font-medium">
                  *Excl. 18% GST & Freight (Input Tax Credit invoice provided)
                </p>
              </div>

              {/* Contractor Pricing Indicator */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Contractor Wholesale Rate:
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {product.discount || "40% OFF"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Standard Contractor Price</span>
                  <span className="font-bold text-[#1d73b7] dark:text-sky-400">
                    ₹{unitPriceNum.toFixed(2)} / {product.unit ? product.unit.replace("Per ", "") : "unit"}
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Quick Lot Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Order Quantity ({product.unit ? product.unit.replace("Per ", "") : "Units"}):
                  </span>
                  <span className="text-[10px] text-slate-400">
                    MOQ: {product.moq || 100}
                  </span>
                </div>

                <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      const step = parseInt(String(product.moq).replace(/[^0-9]/g, ""), 10) || 10;
                      setQuantity(Math.max(step, quantity - (step > 50 ? step : 10)));
                    }}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="number"
                    min={parseInt(String(product.moq).replace(/[^0-9]/g, ""), 10) || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full text-center text-sm font-black text-slate-900 dark:text-white bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const step = parseInt(String(product.moq).replace(/[^0-9]/g, ""), 10) || 10;
                      setQuantity(quantity + (step > 50 ? step : 10));
                    }}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {/* Quick Presets matching packagingVariants */}
                <div className="flex items-center gap-1.5 pt-1">
                  {packagingVariants.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(item.id);
                        setQuantity(item.qty);
                      }}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        quantity === item.qty
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent"
                          : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Estimated Total Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 border border-blue-500/20 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    Estimated Subtotal:
                  </span>
                  <span className="text-base font-black text-[#1d73b7] dark:text-sky-400 font-['Space_Grotesk']">
                    ₹{totalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Effective rate: ₹{effectiveUnitPrice.toFixed(2)}/unit</span>
                  <span>{quantity} {product.unit ? product.unit.replace("Per ", "") : "Units"}</span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-[#1d73b7] via-[#0284c7] to-[#1d73b7] hover:from-[#155a8f] hover:to-[#0369a1] text-white font-extrabold text-xs h-12 rounded-2xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <ShoppingCart className="size-4 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Add {quantity} {product.unit ? product.unit.replace("Per ", "") : "Units"} to Cart</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setQuickOrderOpen(true)}
                  className="w-full border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold text-xs h-11 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="size-4 text-[#c56718]" />
                  <span>Instant Quick Order / Request RFQ</span>
                </Button>

                {/* Compare Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompare({
                      productId: product.productId,
                      name: product.name,
                      category: product.category || "Electrical Supplies",
                      subcategory: product.subcategory || undefined,
                      brand: product.brand || undefined,
                      sku: product.sku || undefined,
                      price: product.price || undefined,
                      numericPrice: product.numericPrice || undefined,
                      discount: product.discount || undefined,
                      availability: product.availability || undefined,
                      size: product.size || undefined,
                      material: product.material || undefined,
                      unit: product.unit || undefined,
                      image: galleryImages[0]?.url || prodImg,
                      specifications: product.specifications || undefined,
                    });
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isCompared
                      ? "bg-blue-50 border-[#1d73b7] text-[#1d73b7] dark:bg-blue-950/60 dark:border-sky-500 dark:text-sky-300"
                      : "border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-400"
                  }`}
                >
                  <Scale className="size-3.5" />
                  <span>{isCompared ? "✓ Product in Compare List" : "Add to Comparison Matrix"}</span>
                </button>
              </div>

              {/* Pincode Delivery Availability */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Check Delivery Availability
                </span>
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN code"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                  <Button type="submit" size="sm" variant="outline" disabled={isCheckingPincode} className="text-xs font-bold h-9 rounded-xl px-4 cursor-pointer">
                    {isCheckingPincode ? "Checking..." : "Check"}
                  </Button>
                </form>
                {pincodeStatus && (
                  <p className={`text-[11px] leading-tight font-medium ${pincodeStatus.startsWith("Available") ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                    {pincodeStatus}
                  </p>
                )}
              </div>

              {/* Direct Procurement Hotline */}
              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Procuring for a major industrial project?
                </span>
                <a
                  href="tel:+919512365582"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1d73b7] dark:text-sky-400 hover:underline"
                >
                  <Phone className="size-3.5" />
                  <span>Direct Desk: +91 9512365582</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: EXPANDED TABBED ENGINEERING SPECIFICATIONS DOCKET        */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Tab Navigation Pill Bar */}
          <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-4 overflow-x-auto">
            {[
              { id: "specs", label: "Master Specifications", icon: Layers },
              { id: "details", label: "Engineering & Applications", icon: Sparkles },
              { id: "downloads", label: "Datasheets & Certificates", icon: FileText },
              { id: "policy", label: "Dispatch & Return Guarantee", icon: Truck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#1d73b7] text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: PRODUCT SPECIFICATION TABLE WITH SEARCH */}
          {activeTab === "specs" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Specification Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <span className="text-xs text-slate-500">
                  Showing <strong>{allSpecPairs.length}</strong> verified technical parameters for this reference.
                </span>

                <div className="relative max-w-xs w-full">
                  <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search parameters (e.g. Size, Thread, Material)..."
                    value={specSearchQuery}
                    onChange={(e) => setSpecSearchQuery(e.target.value)}
                    className="h-8 text-xs pl-8 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                  {specSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setSpecSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Master Table */}
              <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {allSpecPairs.map((item, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-1 sm:grid-cols-12 p-3.5 transition-colors group ${
                      idx % 2 === 0
                        ? "bg-slate-50/60 dark:bg-slate-900/30"
                        : "bg-white dark:bg-[#0e1726]"
                    }`}
                  >
                    <div className="sm:col-span-5 flex items-center justify-between pr-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        {item.category}
                      </span>
                    </div>

                    <div className="sm:col-span-7 flex items-center justify-between mt-1 sm:mt-0">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySpec(item.label, item.value)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-[#1d73b7] cursor-pointer p-1"
                        title="Copy attribute"
                      >
                        {copiedKey === item.label ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT DETAILS & APPLICATIONS */}
          {activeTab === "details" && (
            <div className="space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Industrial Engineering Summary
                </h4>
                <p>
                  {product.description ||
                    `${product.name} is manufactured conforming strictly to industrial quality standards, engineered for high-demand industrial electrical installations, continuous circuitry, commercial distribution boards, and heavy infrastructure projects.`}
                </p>
              </div>

              {/* 4 Feature Visual Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1726] flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">Certified Manufacturing Precision</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      CNC machined and batch inspected to guarantee strict tolerance adherence, preventing thread stripping or moisture ingress.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1726] flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Zap className="size-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">High Environmental Durability</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Surface-treated materials provide corrosion resistance against humid, saline, and industrial chemical atmospheres.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1726] flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileCheck className="size-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">Standardized Interoperability</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Complies with standard national threads and termination profiles for direct compatibility with junction boxes and panels.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1726] flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Globe className="size-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">Industrial Project Approvals</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Approved across EPC contractor vendor lists, power generation plants, manufacturing facilities, and commercial towers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS & CERTIFICATIONS */}
          {activeTab === "downloads" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1726] flex items-center justify-between hover:border-sky-300 dark:hover:border-sky-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#1d73b7]/10 text-[#1d73b7] dark:text-sky-400 flex items-center justify-center">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-white block font-bold">
                      Official Mill Test Certificate (MTC)
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      Standard factory material inspection and batch quality certificate
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleDownloadDatasheet} className="text-xs font-bold rounded-xl cursor-pointer">
                  Download MTC
                </Button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1726] flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="size-5" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-white block font-bold">
                      Technical Compliance & Dimension Docket
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      Dimension parameters, thread pitch standards, and packaging weights
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleDownloadDatasheet} className="text-xs font-bold rounded-xl cursor-pointer">
                  Download Docket
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERY & RETURNS */}
          {activeTab === "policy" && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
                  <Truck className="size-5 text-[#1d73b7] dark:text-sky-400" />
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs">Pan-India Express Dispatch</h5>
                  <p className="text-[11px] text-slate-500">
                    Orders received before 3:00 PM are processed same-day with dedicated direct logistics corridors covering 28 states and major industrial zones.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
                  <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs">100% Transit Insurance</h5>
                  <p className="text-[11px] text-slate-500">
                    All deliveries are insured from warehouse dispatch to on-site handover. Report physical container damage within 48 hours for immediate replacement.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
                  <RotateCcw className="size-5 text-purple-600 dark:text-purple-400" />
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs">30-Day Defect Guarantee</h5>
                  <p className="text-[11px] text-slate-500">
                    Full replacement guarantee against any manufacturing defect in accordance with brand warranty policies and IS quality assurance clauses.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* RELATED PRODUCTS SECTION                                                  */}
        {/* ========================================================================= */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight">
                  Matching Products from {product.category || "Electrical Supplies"}
                </h2>
                <p className="text-xs text-slate-400">Frequently procured together for commercial installations</p>
              </div>
              <Link
                href="/category/wires-cables"
                className="text-xs font-bold text-[#1d73b7] dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => {
                const relImg = getProductImage(rel, rel.category);
                const relPrice = formatProductPrice(rel);
                const relFallback = getCategoryFallbackImage(rel.category);
                return (
                  <Link
                    key={rel.productId}
                    href={`/product/${rel.productId}`}
                    className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:border-[#1d73b7] dark:hover:border-sky-500 transition-all duration-300 group"
                  >
                    <div>
                      <div className="h-36 w-full flex items-center justify-center p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 mb-3 overflow-hidden">
                        <img
                          src={relImg}
                          alt={rel.name}
                          onError={(e) => {
                            if (e.currentTarget.src !== window.location.origin + relFallback) {
                              e.currentTarget.src = relFallback;
                            }
                          }}
                          className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[10px] font-black text-[#1d73b7] dark:text-sky-400 uppercase tracking-wider block mb-1">
                        {rel.brand || "VOLAMP"}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#1d73b7] dark:group-hover:text-sky-400 transition-colors">
                        {rel.name}
                      </h3>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                        {relPrice}
                      </span>
                      <span className="text-[11px] text-[#1d73b7] dark:text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Details →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Universal Footer */}
      <UniversalFooter />

      {/* Image Lightbox Modal */}
      {lightboxOpen && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center"
          >
            <img
              src={currentActiveImage}
              alt={product.name}
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + categoryFallback) {
                  e.currentTarget.src = categoryFallback;
                }
              }}
              className="max-h-[75vh] max-w-full object-contain drop-shadow-2xl rounded-2xl"
            />
            <p className="text-white/80 text-xs font-bold mt-4 text-center">
              {product.name} · {galleryImages[selectedImageIndex]?.label || `View ${selectedImageIndex + 1} of ${galleryImages.length}`}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <QuickOrderModal
        isOpen={quickOrderOpen}
        onClose={() => setQuickOrderOpen(false)}
        initialProduct={product}
      />

      <EnquireModal
        isOpen={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        initialProduct={product.name}
        initialCategory={product.category}
      />
    </div>
  );
}
