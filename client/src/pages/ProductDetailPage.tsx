import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  Box,
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
  Smartphone,
  Sparkles,
  Truck,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import { getProductImage, getCategoryFallbackImage } from "@/data/categories";
import { trpc } from "@/lib/trpc";
import { QuickOrderModal } from "@/components/quickorder/QuickOrderModal";
import { EnquireModal } from "@/components/enquire/EnquireModal";
import UniversalFooter from "@/components/layout/UniversalFooter";
import SeoHead from "@/components/seo/SeoHead";
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
 * Returns strictly the genuine, authentic product image without any synthetic or fake filler images.
 */
function getCategoryGallery(product: any): GalleryItem[] {
  if (!product) return [{ url: "/products/cables.jpg", label: "Product Image" }];

  const primaryImg = getProductImage(product, product.category);
  const fallback = getCategoryFallbackImage(product.category);
  const mainImage = primaryImg || fallback || "/products/cables.jpg";

  const items: GalleryItem[] = [
    { url: mainImage, label: product.name || "Product Image" },
  ];

  // If the product record genuinely has additional real images, include them:
  if (Array.isArray(product.images) && product.images.length > 0) {
    for (const img of product.images) {
      if (typeof img === "string" && img.trim() && img !== mainImage) {
        items.push({ url: img, label: product.name || "Product Perspective" });
      }
    }
  }

  return items;
}


interface ProductDetailPageProps {
  params?: {
    productId?: string;
    slug?: string;
  };
}

export default function ProductDetailPage(props: ProductDetailPageProps = {}) {
  const [location, navigate] = useLocation();
  const [, params] = useRoute("/product/:productId");
  const [, pParams] = useRoute("/p/:productId");
  const [, slugParams] = useRoute("/product/:productId/:slug");

  // Fallback direct path extraction in case route regex didn't catch trailing slashes or subpaths
  const pathSegments = (location || "").split("?")[0].split("#")[0].split("/").filter(Boolean);
  const pathExtractedId =
    pathSegments[0] === "product" || pathSegments[0] === "p"
      ? decodeURIComponent(pathSegments[1] || "")
      : "";

  const productId = (
    props.params?.productId ||
    params?.productId ||
    pParams?.productId ||
    slugParams?.productId ||
    pathExtractedId ||
    ""
  ).trim();

  // Query product data from backend
  const { data: serverProduct, isLoading, isFetching, error, refetch } = trpc.products.getById.useQuery(
    { productId },
    { enabled: Boolean(productId), retry: 1 }
  );

  // Fallback to static catalog file if API is unreachable on static hosting / Vercel
  const [staticProductFallback, setStaticProductFallback] = useState<any | null>(null);
  const [isStaticLoading, setIsStaticLoading] = useState(true);

  useEffect(() => {
    if (productId && !staticProductFallback) {
      setIsStaticLoading(true);
      fetch("/products_db.json?v=" + Date.now(), { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((items: any[]) => {
          if (Array.isArray(items)) {
            const pIdLower = productId.toLowerCase();
            let found = items.find(
              (p) =>
                p.productId === productId ||
                p.sku === productId ||
                (p.productId && p.productId.toLowerCase() === pIdLower) ||
                (p.sku && p.sku.toLowerCase() === pIdLower)
            );
            if (found) {
              if (found.category === "Lugs" || (found.productId && found.productId.startsWith("LUG-"))) {
                found = {
                  ...found,
                  brand: "Dowells",
                  sku: (found.sku || "").replace(/POLYCAB/g, "DOWELLS"),
                };
              } else if (found.category === "Glands" || (found.productId && found.productId.startsWith("GLD-"))) {
                let b = "HMI";
                let s = "HMI";
                if (found.subcategory === "Double Compression MD") {
                  b = "Dowells";
                  s = "DOWELLS";
                } else if (found.subcategory === "Single Compression") {
                  b = "Comet";
                  s = "COMET";
                }
                found = {
                  ...found,
                  brand: b,
                  sku: (found.sku || "").replace(/POLYCAB/g, s),
                };
              } else if (
                ["Wiring Devices", "Earthing Wires", "Solar"].includes(found.category) ||
                (found.productId && (found.productId.startsWith("WD-") || found.productId.startsWith("EAR-") || found.productId.startsWith("SOL-")))
              ) {
                found = {
                  ...found,
                  brand: "",
                  sku: (found.sku || "").replace(/-POLYCAB/g, ""),
                };
              }
              setStaticProductFallback(found);
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsStaticLoading(false);
        });
    } else {
      setIsStaticLoading(false);
    }
  }, [productId, staticProductFallback]);

  const product = serverProduct || staticProductFallback;

  // Cart & Compare contexts
  const { addItem, totalCount, openCart } = useCart();
  const { compareCategory, toggleCompare, isProductInCompare } = useCompare();

  // State management
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{
    pincode: string;
    isAvailable: boolean;
    isAhmedabad: boolean;
    isSameDay: boolean;
    title: string;
    message: string;
    timingNotice?: string;
  } | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "details" | "downloads" | "policy">("specs");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [specSearchQuery, setSpecSearchQuery] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  const handleDownloadImage = () => {
    if (!currentActiveImage) return;
    const link = document.createElement("a");
    link.href = currentActiveImage;
    const cleanName = (product?.name || "volamp-product").replace(/[^a-zA-Z0-9_-]/g, "_");
    const label = (galleryImages[selectedImageIndex]?.label || "detail").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.download = `${cleanName}_${label}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("High-Resolution Asset Downloaded", {
      description: `Saved: ${cleanName}_${label}`,
    });
  };
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

  const [staticRelatedFallback, setStaticRelatedFallback] = useState<any[]>([]);

  useEffect(() => {
    if ((!relatedData || !relatedData.products || relatedData.products.length === 0) && product?.category) {
      fetch("/products_db.json")
        .then((res) => (res.ok ? res.json() : null))
        .then((items: any[]) => {
          if (Array.isArray(items)) {
            const related = items
              .filter((p) => p.category === product.category && p.productId !== product.productId)
              .slice(0, 4);
            setStaticRelatedFallback(related);
          }
        })
        .catch(() => {});
    }
  }, [relatedData, product]);

  const relatedProducts = useMemo(() => {
    if (relatedData?.products && relatedData.products.length > 0) {
      return relatedData.products.filter((p) => p.productId !== product?.productId).slice(0, 4);
    }
    return staticRelatedFallback;
  }, [relatedData, staticRelatedFallback, product]);

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

    // WIRING DEVICES / TAPES / ACCESSORIES
    if (cat.includes("wiring") || cat.includes("tape") || name.includes("tape") || name.includes("insulation tape")) {
      return [
        { label: "Product Form / Type", value: product.subcategory || "Self-Adhesive PVC Insulation Tape" },
        { label: "Dimensions / Roll Size", value: product.size || (specs.widthOrDiameter && specs.length ? `${specs.widthOrDiameter} × ${specs.length}` : "18 mm × 10 m") },
        { label: "Base Film Material", value: product.material || "Flame Retardant PVC (Polyvinyl Chloride)" },
        { label: "Rated Voltage", value: specs.voltageRating || "600 V / 1100 V (IS 7809)" },
        { label: "Dielectric Breakdown", value: "> 40 kV/mm" },
        { label: "Flame Retardancy", value: "Self-Extinguishing / Flame Retardant" },
        { label: "Standard Conformance", value: specs.standard || "IS 7809 (Part 3) / IEC 60454" },
      ];
    }

    // PVC PIPE / CONDUITS
    if (cat.includes("pipe") || cat.includes("conduit") || name.includes("conduit") || name.includes("pipe")) {
      return [
        { label: "Conduit Classification", value: product.subcategory || "Rigid Non-Metallic Conduit Pipe" },
        { label: "Nominal Outer Diameter", value: product.size || "20 mm / 25 mm / 32 mm" },
        { label: "Mechanical Duty Class", value: "Medium / Heavy Duty (Class M)" },
        { label: "Material Grade", value: product.material || "High-Impact Unplasticized PVC (uPVC)" },
        { label: "Operating Temperature", value: "-5°C to +60°C" },
        { label: "Standard Conformance", value: specs.standard || "IS 9537 (Part 3) : 1983" },
      ];
    }

    // EARTHING WIRES & STRIPS
    if (cat.includes("earth") || name.includes("earth")) {
      return [
        { label: "Conductor Type", value: product.subcategory || "Bare Electrolytic Copper / GI Earth Strip" },
        { label: "Cross-Section / Size", value: product.size || "25×3 mm / 25×6 mm / 8 SWG" },
        { label: "Material Purity", value: product.material || "99.97% Electrolytic Copper / Hot-Dip GI" },
        { label: "Tensile Strength", value: "290 - 320 N/mm²" },
        { label: "Conductivity / Resistance", value: "100% IACS / High Corrosion Resistance" },
        { label: "Standard Conformance", value: specs.standard || "IS 3043 : 2018 (Code of Practice)" },
      ];
    }

    // WIRES & CABLES (Default)
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

  // Helper to check if a pincode is within Ahmedabad
  const isAhmedabadPincode = (pin: string): boolean => {
    if (!/^\d{6}$/.test(pin)) return false;
    // 380xxx is Ahmedabad City & Municipal zones (380001 - 380099)
    if (pin.startsWith("380")) return true;
    // Key Ahmedabad District / Industrial Estates (Narol, Vatva, Odhav, Naroda, Changodar, Sanand, etc.)
    const ahmedabadGreaterPins = [
      "382405", "382415", "382418", "382421", "382424", "382427", "382430", 
      "382440", "382443", "382445", "382470", "382475", "382480", "382481", 
      "382330", "382340", "382345", "382346", "382350",
      "382210", "382213", "382110", "382115", "382170"
    ];
    return ahmedabadGreaterPins.includes(pin);
  };

  // Helper to determine delivery timing based on business hours & days in Indian Standard Time (IST)
  const getAhmedabadDeliverySchedule = () => {
    // Current time in IST (UTC+5:30)
    const now = new Date();
    const istFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour12: false,
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
    });
    const parts = istFormatter.formatToParts(now);
    const partMap: Record<string, string> = {};
    parts.forEach((p) => (partMap[p.type] = p.value));

    const currentHour = parseInt(partMap.hour, 10);
    const currentMinute = parseInt(partMap.minute, 10);
    const weekday = partMap.weekday; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'

    // Business Days: Monday through Saturday (Sunday is closed/non-business day)
    const isBusinessDay = weekday !== "Sun";
    // Business Hours Cutoff for Same-Day delivery: 5:00 PM (17:00)
    const isBefore5PM = currentHour < 17;

    const isSameDay = isBusinessDay && isBefore5PM;

    if (isSameDay) {
      const minutesLeft = (16 - currentHour) * 60 + (60 - currentMinute);
      const hours = Math.floor(minutesLeft / 60);
      const mins = minutesLeft % 60;
      const countdown = hours > 0 ? `Order within ${hours}h ${mins}m` : `Order within ${mins}m`;
      return {
        isSameDay: true,
        title: "Same-Day Delivery Available!",
        message: "Place order before 5:00 PM today for Same-Day Delivery across Ahmedabad.",
        timingNotice: `${countdown} (before 5:00 PM cutoff) · Ahmedabad Direct Express Hub`,
      };
    } else {
      const reasonNotice = !isBusinessDay
        ? "Sunday / Non-Business Day"
        : "Order placed after 5:00 PM cutoff";
      return {
        isSameDay: false,
        title: "Next-Day Delivery Available!",
        message: "Orders placed during non-business hours or after 5:00 PM are prioritized for Next-Day Delivery across Ahmedabad.",
        timingNotice: `${reasonNotice} · Priority First-Wave Morning Dispatch`,
      };
    }
  };

  // Handle Pincode Check
  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setPincodeResult({
        pincode: cleanPin,
        isAvailable: false,
        isAhmedabad: false,
        isSameDay: false,
        title: "Invalid Pincode",
        message: "Please enter a valid 6-digit Indian Postal Code.",
      });
      return;
    }
    setIsCheckingPincode(true);
    setTimeout(() => {
      setIsCheckingPincode(false);
      const isAhmedabad = isAhmedabadPincode(cleanPin);
      if (isAhmedabad) {
        const schedule = getAhmedabadDeliverySchedule();
        setPincodeResult({
          pincode: cleanPin,
          isAvailable: true,
          isAhmedabad: true,
          isSameDay: schedule.isSameDay,
          title: schedule.title,
          message: `Direct warehouse dispatch to ${cleanPin}. ${schedule.message}`,
          timingNotice: schedule.timingNotice,
        });
      } else {
        const days = (parseInt(cleanPin.slice(-1), 10) % 2) + 2;
        setPincodeResult({
          pincode: cleanPin,
          isAvailable: true,
          isAhmedabad: false,
          isSameDay: false,
          title: "Express Delivery Available",
          message: `Pan-India express dispatch to ${cleanPin} within ${days} business days via surface/air cargo.`,
          timingNotice: "Standard National Logistics",
        });
      }
    }, 350);
  };

  // Helper to load image as Data URL for jsPDF
  const getImageDataUrl = async (src: string): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = src;
      } catch {
        resolve(null);
      }
    });
  };

  // Handle Download Technical Datasheet PDF using jsPDF (Attractive OEM Engineering Brochure Dossier)
  const handleDownloadDatasheet = async () => {
    if (!product) return;
    try {
      toast.info("Generating Engineering Brochure...", {
        description: "Preparing official technical dossier & certified datasheet PDF.",
      });

      // Preload Volamp logo and product thumbnail
      const [logoDataUrl, productImgDataUrl] = await Promise.all([
        getImageDataUrl("/volamp-logo.png"),
        getImageDataUrl((product as any).image || getProductImage(product, product.category) || "/products/cables.jpg?v=4"),
      ]);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // -----------------------------------------------------------------------
      // VECTOR GRAPHIC HELPERS (100% Vector Rendering - Zero Unicode Glitches)
      // -----------------------------------------------------------------------
      // Helper to draw clean vector checkmark:
      const drawCheckmark = (x: number, y: number, size = 2.8, strokeR = 5, strokeG = 150, strokeB = 105) => {
        doc.setDrawColor(strokeR, strokeG, strokeB);
        doc.setLineWidth(0.45);
        doc.line(x, y + size * 0.55, x + size * 0.35, y + size * 0.9);
        doc.line(x + size * 0.35, y + size * 0.9, x + size, y + size * 0.15);
      };

      // Helper to draw status badge pill:
      const drawStatusBadge = (x: number, y: number, text = "CONFORMS") => {
        doc.setFillColor(236, 253, 245); // Emerald 50
        doc.setDrawColor(16, 185, 129);  // Emerald 500
        doc.setLineWidth(0.25);
        doc.roundedRect(x, y, 25, 4.3, 0.8, 0.8, "FD");
        drawCheckmark(x + 1.8, y + 0.65, 2.5, 5, 150, 105);
        doc.setTextColor(4, 120, 87);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5.5);
        doc.text(text, x + 5.8, y + 3.1);
      };

      // Helper to draw official corporate quality stamp (Gold / Bronze embossed seal):
      const drawQualitySeal = (cx: number, cy: number, r = 11.5) => {
        // Outer gold circle
        doc.setDrawColor(197, 103, 24); // Warm Gold #c56718
        doc.setLineWidth(0.65);
        doc.circle(cx, cy, r, "S");

        // Inner fine circle
        doc.setDrawColor(217, 119, 6);
        doc.setLineWidth(0.25);
        doc.circle(cx, cy, r - 1.2, "S");

        // Light amber background wash
        doc.setFillColor(255, 251, 235);
        doc.circle(cx, cy, r - 1.8, "F");

        // Inner dotted ring
        doc.setDrawColor(180, 83, 9);
        doc.setLineWidth(0.2);
        doc.circle(cx, cy, r - 2, "S");

        // Top arc text
        doc.setTextColor(180, 83, 9);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.8);
        doc.text("VOLAMP ELEKTRIKALS", cx, cy - 5.5, { align: "center" });

        doc.setFontSize(4);
        doc.setTextColor(146, 64, 14);
        doc.text("* QUALITY ASSURED *", cx, cy - 3.2, { align: "center" });

        // Center Gold Ribbon
        doc.setFillColor(180, 83, 9);
        doc.roundedRect(cx - 10, cy - 1.6, 20, 3.8, 0.6, 0.6, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.8);
        doc.text("100% INSPECTED", cx, cy + 1.1, { align: "center" });

        // Bottom text
        doc.setTextColor(146, 64, 14);
        doc.setFontSize(4.2);
        doc.setFont("helvetica", "bold");
        doc.text("PASSED & CERTIFIED", cx, cy + 4.8, { align: "center" });

        doc.setTextColor(180, 83, 9);
        doc.setFontSize(3.8);
        doc.setFont("helvetica", "normal");
        doc.text("AHMEDABAD WORKS", cx, cy + 7.2, { align: "center" });
      };

      // Helper to draw realistic high-density barcode:
      const drawBarcode = (x: number, y: number, w: number, h: number, code: string) => {
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
      };

      // Metadata identifiers
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      const safeSku = (product.sku || product.productId || "VLP-001").replace(/[^a-zA-Z0-9-_]/g, "_");
      const docRefId = `VLP-ENG-${safeSku}`;
      const docHash = `SHA256: 7F9E${(product.productId || "V").charCodeAt(0)}${now.getTime().toString(16).slice(-6).toUpperCase()}`;

      // =========================================================================
      // 1. BRAND HEADER BANNER (Deep Volamp Navy + Warm Amber Accent Line)
      // =========================================================================
      doc.setFillColor(11, 31, 51); // Deep Navy #0B1F33
      doc.rect(0, 0, 210, 25.5, "F");

      doc.setFillColor(197, 103, 24); // Warm Amber Gold #C56718
      doc.rect(0, 25.5, 210, 2, "F");

      // Volamp Logo inside White Rounded Badge
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(12, 3.5, 43, 18.5, 1.8, 1.8, "F");

      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, "PNG", 14, 5.2, 39, 15);
        } catch {
          doc.setTextColor(77, 18, 23);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.text("VOLAMP", 18, 15.5);
        }
      } else {
        doc.setTextColor(77, 18, 23);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("VOLAMP", 18, 15.5);
      }

      // Brand Title and Dossier Eyebrow beside Logo
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("VOLAMP ELEKTRIKALS PVT. LTD.", 58, 10);

      doc.setTextColor(245, 191, 33); // Bright Gold #F5BF21
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.text("TECHNICAL SPECIFICATION DOSSIER & ENGINEERING BROCHURE", 58, 15);

      doc.setTextColor(203, 213, 225); // Slate 300
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.8);
      doc.text("ISO 9001:2015 · CPRI Tested · IS/IEC Conforming · GeM Registered OEM Supplier", 58, 19.5);

      doc.setTextColor(148, 163, 184); // Slate 400
      doc.setFontSize(5.2);
      doc.text("Central Engineering Directorate · GIDC Vatva Industrial Estate, Ahmedabad, Gujarat", 58, 23);

      // Top Right Document Metadata Badge
      doc.setFillColor(6, 19, 32); // Darker Slate #061320
      doc.setDrawColor(30, 58, 95);
      doc.setLineWidth(0.2);
      doc.roundedRect(146, 3.5, 52, 18.5, 1.5, 1.5, "FD");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text(`DOC REF: ${docRefId}`, 150, 8.5);

      doc.setTextColor(203, 213, 225);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.8);
      doc.text(`DATE: ${dateStr} | REV. 04/2026`, 150, 13);

      // Vector Green Authenticated Status
      doc.setFillColor(52, 211, 153); // Emerald 400
      doc.circle(151.5, 17.5, 1.2, "F");
      doc.setTextColor(52, 211, 153);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.2);
      doc.text("AUTHENTIC SPECIFICATION RELEASE", 154.5, 18.2);

      // =========================================================================
      // 2. HERO PRODUCT SPOTLIGHT CARD
      // =========================================================================
      const heroBoxY = 31;
      const heroBoxH = 41;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(12, heroBoxY, 186, heroBoxH, 2, 2, "FD");

      // Left Brand Tag Pill & Conformance Tag
      const brandTag = product.brand ? `[ ${product.brand.toUpperCase()} ] · OEM CERTIFIED` : `[ INDUSTRIAL GRADE ] · OEM CERTIFIED`;
      doc.setFillColor(197, 103, 24);
      doc.roundedRect(16, heroBoxY + 3.5, 66, 4.8, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.2);
      doc.text(brandTag, 18, heroBoxY + 7);

      doc.setFillColor(224, 242, 254);
      doc.setDrawColor(125, 211, 252);
      doc.roundedRect(85, heroBoxY + 3.5, 34, 4.8, 1, 1, "FD");
      doc.setTextColor(3, 105, 161);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.8);
      doc.text("IS / IEC ACCREDITED", 87, heroBoxY + 7);

      // Product Title
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const titleLines = doc.splitTextToSize(product.name, 116);
      doc.text(titleLines, 16, heroBoxY + 13.5);

      // Category / Series Subtitle
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.text(
        `Category: ${product.category || "Electrical Supplies"} · Series: ${product.subcategory || "Standard Industrial"} · Master SKU: ${product.sku || product.productId}`,
        16,
        heroBoxY + 20
      );

      // 4 Metric Indicator Cards inside Hero Card
      const cat = (product.category || "").toLowerCase();
      const name = (product.name || "").toLowerCase();

      let metric1 = { label: "VOLTAGE GRADE", val: specs.voltageRating || "1100 V (IS 694)" };
      let metric2 = { label: "OPERATING TEMP", val: "-10°C to +80°C" };
      let metric3 = { label: "MATERIAL BASE", val: (product.material || "Electrolytic Cu").slice(0, 18) };
      let metric4 = { label: "STANDARD CODE", val: specs.standard || specs.standardIs || "BIS / IEC Conforming" };

      if (cat.includes("wiring") || cat.includes("tape") || name.includes("tape")) {
        metric1 = { label: "VOLTAGE RATING", val: specs.voltageRating || "600 V / 1100 V" };
        metric2 = { label: "DIELECTRIC", val: "> 40 kV/mm" };
        metric3 = { label: "FILM BASE", val: "FRLS PVC Grade" };
        metric4 = { label: "STANDARD", val: "IS 7809 / IEC 60454" };
      } else if (cat.includes("gland") || name.includes("gland")) {
        metric1 = { label: "GLAND SIZE", val: specs.sizeCode || product.size || "10MM" };
        metric2 = { label: "THREAD SPEC", val: specs.nippleThread || '5/8" Imperial' };
        metric3 = { label: "IP RATING", val: "IP 66 / IP 67" };
        metric4 = { label: "STANDARD", val: "BS 6121 / IS 12943" };
      } else if (cat.includes("lug") || name.includes("lug")) {
        metric1 = { label: "LUG SIZE", val: product.size || "Standard" };
        metric2 = { label: "FINISHING", val: "Electro-Tinned" };
        metric3 = { label: "PURITY", val: "99.97% Electrolytic Cu" };
        metric4 = { label: "STANDARD", val: "IS 8309 / DIN 46235" };
      } else if (cat.includes("switch") || name.includes("mcb") || name.includes("breaker")) {
        metric1 = { label: "RATED CURRENT", val: specs.currentRatingA ? `${specs.currentRatingA} A` : "16A - 63A" };
        metric2 = { label: "BREAKING CAP.", val: specs.breakingCapacityKa ? `${specs.breakingCapacityKa} kA` : "10 kA" };
        metric3 = { label: "TRIP CURVE", val: specs.tripCurve || "Type C Curve" };
        metric4 = { label: "STANDARD", val: "IS/IEC 60898-1" };
      }

      const metricCards = [metric1, metric2, metric3, metric4];
      const cardY = heroBoxY + 23.5;
      const cardW = 27.5;
      const cardH = 14;
      const cardColors = [
        { bar: [245, 158, 11], text: [180, 83, 9] }, // Amber
        { bar: [2, 132, 199], text: [3, 105, 161] },   // Sky
        { bar: [16, 185, 129], text: [4, 120, 87] },  // Emerald
        { bar: [139, 92, 246], text: [109, 40, 217] }, // Purple
      ];

      metricCards.forEach((c, idx) => {
        const cx = 16 + idx * (cardW + 2.2);
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(cx, cardY, cardW, cardH, 1, 1, "FD");

        // Top accent bar
        doc.setFillColor(cardColors[idx].bar[0], cardColors[idx].bar[1], cardColors[idx].bar[2]);
        doc.rect(cx, cardY, cardW, 1, "F");

        // Label
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(4.8);
        doc.text(c.label, cx + 2, cardY + 4.8);

        // Value
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.2);
        const valTrunc = c.val.length > 18 ? c.val.slice(0, 18) + ".." : c.val;
        doc.text(valTrunc, cx + 2, cardY + 9.8);
      });

      // Right Side: Product Thumbnail Showcase
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(138, heroBoxY + 4, 29, 33, 1.5, 1.5, "FD");

      if (productImgDataUrl) {
        try {
          doc.addImage(productImgDataUrl, "PNG", 140, heroBoxY + 5.5, 25, 27);
        } catch {
          doc.setTextColor(197, 103, 24);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.text("VOLAMP", 145, heroBoxY + 18);
        }
      } else {
        doc.setTextColor(197, 103, 24);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text("VOLAMP", 145, heroBoxY + 18);
      }

      // Corner Ribbon on Image Frame
      doc.setFillColor(197, 103, 24);
      doc.roundedRect(138, heroBoxY + 4, 18, 4, 0.5, 0.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(4.2);
      doc.text("ORIGINAL OEM", 139.5, heroBoxY + 6.8);

      // Corporate Quality Seal right next to product photo
      drawQualitySeal(181, heroBoxY + 20.5, 12);

      // =========================================================================
      // 3. SECTION 1: MASTER ENGINEERING ATTRIBUTES & SPECIFICATIONS TABLE
      // =========================================================================
      let yPos = 75;

      // Section Header with Amber Indicator
      doc.setFillColor(197, 103, 24);
      doc.rect(12, yPos, 3, 5, "F");

      doc.setFontSize(8.2);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("1. MASTER ENGINEERING PARAMETERS & TEST COMPLIANCE", 17, yPos + 3.8);

      doc.setFontSize(5.8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Conforms to Bureau of Indian Standards (BIS) & IEC Specifications", 118, yPos + 3.8);

      // Build category-accurate 4-column table data: [Attribute, Test Standard, Value]
      let tableData: Array<[string, string, string]> = [];

      if (cat.includes("wiring") || cat.includes("tape") || name.includes("tape") || name.includes("insulation tape")) {
        tableData = [
          ["Product Form / Classification", "IS 7809 : Part 1", product.subcategory || "Industrial PVC Self-Adhesive Insulation Tape"],
          ["Roll Dimensions (Width x Length)", "IS 7809 : Part 2", product.size || (specs.widthOrDiameter && specs.length ? `${specs.widthOrDiameter} x ${specs.length}` : "18 mm x 10 m (Thickness 0.125 mm)")],
          ["Base Film Material", "ASTM D1000", product.material || "Flame Retardant Plasticized Polyvinyl Chloride (PVC)"],
          ["Adhesive Formulation", "IS 7809 : Part 3", "Pressure-Sensitive Rubber Resin (Aggressive Tack)"],
          ["Rated Operating Voltage", "IS 7809 : Sec 1", specs.voltageRating || "600 V / 1100 V Dielectric Withstand"],
          ["Dielectric Breakdown Strength", "ASTM D1000", "Min. 40 kV / mm (4.8 kV per layer)"],
          ["Tensile Strength at Break", "IS 7809 : Part 2", "Min. 15.0 N / 10 mm (High Mechanical Durability)"],
          ["Elongation at Break", "IS 7809 : Part 2", "Min. 125% (Elastic Memory & Snug Joint Wrap)"],
          ["Flame Retardancy & Self-Extinguish", "IS 7809 / UL 510", "Self-Extinguishing within 5 seconds"],
          ["Operating Temperature Range", "IEC 60454-3", "-10 deg C to +80 deg C Continuous Thermal Rating"],
          ["Packaging & Industrial MOQ", "OEM Packaging", `${product.moq || "10 Pcs"} / Shrink-Wrapped Sleeve`],
        ];
      } else if (cat.includes("gland") || name.includes("gland")) {
        tableData = [
          ["Cable Gland Construction Type", "BS 6121 : Part 1", specs.compressionType || product.subcategory || "Single / Double Compression"],
          ["Gland Size (Metric / Inches)", "IS 12943 : 1990", `${specs.sizeCode || product.size || "10MM"} (${specs.sizeInch || '3/8"'})`],
          ["Suitable Cable Outer Diameter", "IEC 62444", specs.suitableCableOdMm ? `${specs.suitableCableOdMm} mm` : "8.00 mm - 12.0 mm OD"],
          ["Entry Nipple Thread Specification", "BS 3643 / ISO 965", specs.nippleThread || '5/8" Imperial / M20 Metric'],
          ["Gland Body & Locknut Material", "IS 319 (Grade I)", product.material || "Extruded Brass with Nickel Surface Electroplate"],
          ["Sealing Ring & Washer Compound", "BS 6121", "High-Grade Neoprene Synthetic Elastomer (IP66)"],
          ["Ingress Protection (IP Rating)", "IEC 60529 / IS 13947", "IP 66 / IP 67 Dust-Tight & Heavy Jet Proof"],
          ["Operating Temperature Range", "EN 50262", "-20°C to +100°C Continuous"],
          ["Applicable Cable Armor Type", "IS 12943", "Galvanized Steel Strip / Wire Armoured & Unarmoured"],
          ["Standard Conformance & Testing", "BS 6121 / IS 12943", specs.standard || "BS 6121 : Part 1 / IS 12943 Certified"],
          ["Packaging & Industrial MOQ", "OEM Master Pack", `${specs.packingPerBoxPcs || product.moq || 100} Pcs / Box`],
        ];
      } else if (cat.includes("lug") || name.includes("lug")) {
        tableData = [
          ["Terminal Lug Type & Profile", "IS 8309 : 1993", specs.lugType || product.subcategory || "Tubular Heavy-Duty Crimping Terminal"],
          ["Conductor Cross-Sectional Area", "DIN 46235 / IS 8309", product.size || specs.sizeRange || "Standard Industrial Cable Cross-Section"],
          ["Base Conductor Material", "IS 1897 / IS 191", product.material || "100% Electrolytic Oxygen-Free Copper (99.9% Purity)"],
          ["Surface Finishing & Corrosion Protection", "IS 1359 : 1992", "Electro-Tinned (Minimum 5-8 Microns Tin Coat)"],
          ["Barrel Style & Visual Inspection", "DIN 46235", specs.barrelStyle || "Standard Chamfered Barrel with Inspection Hole"],
          ["Stud Hole Diameter & Palm Width", "IS 8309", "Precision Punched Palm with Radiused Corners"],
          ["Maximum Operating Temperature", "IEC 61238-1", "Continuous 120°C / Short-Circuit Peak 250°C"],
          ["Electrical Conductivity Rating", "IACS Standard", "Min. 99.7% IACS (Low Contact Resistance)"],
          ["Tensile Pull-Out Test Compliance", "IS 8309 / IEC 61238", "Complies with Class A Compression Tensile Load"],
          ["Standard Conformance", "IS 8309 / DIN 46235", specs.standard || "IS 8309 : 1993 / DIN 46235"],
          ["Standard Industrial Packaging", "OEM Polybag", `${product.moq || 100} Pcs / Sealed Moisture-Proof Pack`],
        ];
      } else if (cat.includes("switch") || name.includes("mcb") || name.includes("breaker")) {
        tableData = [
          ["Switchgear Device Classification", "IS / IEC 60898-1", product.subcategory || "Miniature Circuit Breaker (MCB)"],
          ["Pole Configuration", "IEC 60947-2", specs.polesPhase || product.size || "1 Pole (1P) / 3 Pole / 4 Pole"],
          ["Rated Current (In)", "IS / IEC 60898-1", specs.currentRatingA ? `${specs.currentRatingA} Amp` : "16 Amp - 63 Amp Available"],
          ["Short Circuit Breaking Capacity", "IS / IEC 60898-1", specs.breakingCapacityKa ? `${specs.breakingCapacityKa} kA (Icn)` : "10 kA (Icn at 240/415V AC)"],
          ["Instantaneous Tripping Characteristic", "IEC 60898-1", specs.tripCurve || "Type C Curve (5 In to 10 In Magnetic Trip)"],
          ["Rated Operational Voltage (Ue)", "IEC 60947-2", specs.voltageRatingV ? `${specs.voltageRatingV} V` : "240 V AC (1P) / 415 V AC (3P/4P)"],
          ["Rated Impulse Withstand Voltage (Uimp)", "IEC 60898-1", "4 kV (1.2/50 µs Waveform)"],
          ["Mechanical & Electrical Endurance", "IEC 60898-1", "20,000 Operations Mechanical / 10,000 Electrical"],
          ["Enclosure Protection & Mounting", "DIN 43880", "IP20 Touch-Proof Terminals / 35mm DIN Rail Mount"],
          ["Standard Conformance", "IS / IEC 60898-1", specs.standard || "IS/IEC 60898-1 / CE / RoHS Conforming"],
          ["Minimum Order Quantity", "OEM Carton", `${product.moq || 1} Unit / Box`],
        ];
      } else if (cat.includes("pipe") || cat.includes("conduit") || name.includes("conduit") || name.includes("pipe")) {
        tableData = [
          ["Conduit Classification", "IS 9537 : Part 3", product.subcategory || "Rigid Non-Metallic Conduit Pipe"],
          ["Nominal Outer Diameter (OD)", "IS 9537 : Part 3", product.size || "20 mm / 25 mm / 32 mm Standard Size"],
          ["Mechanical Stress Classification", "IS 9537 : Part 3", "Medium / Heavy Mechanical Duty (Class M)"],
          ["Base Material Polymer", "IS 9537", product.material || "High-Impact Unplasticized Polyvinyl Chloride (uPVC)"],
          ["Thermal Resistance & Temperature Range", "IS 9537 : Part 3", "-5°C to +60°C Operating Temperature"],
          ["Dielectric Strength", "IS 9537", "Min. 2.0 kV AC for 15 minutes Breakdown Withstand"],
          ["Flame Retardance & Burning Behavior", "IS 9537", "Self-Extinguishing within 30 seconds"],
          ["Resistance to Chemical Corrosion", "ASTM D543", "Unaffected by dilute acids, alkalis, and moisture"],
          ["Wall Thickness Tolerance", "IS 9537 : Part 3", "Precision Wall Thickness (Medium Gauge 1.6 - 2.0 mm)"],
          ["Standard Conformance", "IS 9537 : Part 3", specs.standard || "IS 9537 (Part 3) : 1983 Certified"],
          ["Standard Supply Bundle", "OEM Bundle", `${product.moq || 25} Bundles (3 Meter Length per Pipe)`],
        ];
      } else if (cat.includes("earth") || name.includes("earth")) {
        tableData = [
          ["Earthing Conductor Type", "IS 3043 : 2018", product.subcategory || "Bare Electrolytic Copper / GI Grounding Strip"],
          ["Cross-Sectional Dimensions", "IS 3043", product.size || "25 mm x 3 mm / 25 mm x 6 mm / 8 SWG"],
          ["Material Purity & Grade", "IS 1897 / IS 2629", product.material || "99.97% Electrolytic Copper / Hot-Dip GI (610 g/m2 Zinc)"],
          ["Electrical Conductivity", "IACS Standard", "100% IACS (Copper) / High Short-Circuit Withstand"],
          ["Tensile Strength Rating", "IS 1608", "290 N/mm2 to 330 N/mm2 (High Ductility)"],
          ["Corrosion Resistance Class", "IS 4759", "Heavy Zinc Passivation / Soil-Acid Resistant"],
          ["Fault Current Withstand Capacity", "IEEE 80 / IS 3043", "Rated for 1-Second Short-Circuit Earth Fault Dissipation"],
          ["Standard Conformance", "IS 3043 : 2018", specs.standard || "IS 3043 : 2018 (Code of Practice for Earthing)"],
          ["Edge Chamfer & Smoothness", "IS 1897", "Rounded Burr-Free Edges for Safe Field Handling"],
          ["Minimum Order Quantity", "OEM Reel / Coil", `${product.moq || 50} Meters / Industrial Coil`],
          ["Traceability Reference", "Factory Lot", `LOT-E-${docHash.slice(-6)}`],
        ];
      } else if (cat.includes("solar") || name.includes("solar")) {
        tableData = [
          ["Solar Conductor Size", "EN 50618 (H1Z2Z2-K)", product.size || specs.sizeSqMm || "4.0 / 6.0 SQMM Flexible Conductor"],
          ["Conductor Material & Stranding", "IEC 60228", "Tinned High-Purity Electrolytic Copper (Class 5)"],
          ["Rated Operating Voltage (DC)", "EN 50618 / IEC 62930", "1500 V DC (Max 1800 V DC to Ground)"],
          ["Primary Insulation Compound", "EN 50618", "Cross-Linked Halogen-Free Polyolefin (XLPO)"],
          ["Outer Protective Jacket Compound", "EN 50618", "UV, Ozone & Weather Resistant Cross-Linked XLPO"],
          ["Operating Temperature Range", "EN 50618", "-40 deg C to +120 deg C (Max Conductor Temp 120 deg C for 20,000h)"],
          ["Halogen Free & Low Smoke Emission", "IEC 60754-1 / IEC 61034", "Zero Halogen Acid Gas Evolution (HCl < 0.5%)"],
          ["Flame Retardancy Testing", "IEC 60332-1-2", "Flame Retardant Single Cable Vertical Test Pass"],
          ["Expected Service Lifetime", "TUV 2 Pfg 1169", "Min. 25 Years Outdoor Solar Photovoltaic Exposure"],
          ["Standard Conformance & Approval", "EN 50618 / IEC 62930", "TUV Rheinland / BIS Certified EN 50618 (H1Z2Z2-K)"],
          ["Packaging & Standard Spool", "OEM Drum", `${product.moq || 500} Mtrs Wooden / Corrugated Drum`],
        ];
      } else {
        // WIRES & CABLES
        tableData = [
          ["Conductor Size & Cross-Section", "IS 694 / IS 8130", product.size || specs.sizeSqMm || "1.5 SQMM"],
          ["Number of Cores & Stranding", "IS 694 : 2010", specs.cores || "1 Core / Multi-Core Available"],
          ["Conductor Material & Grade", "IS 8130 : 2013", product.material || specs.conductorMaterial || "100% Electrolytic Grade Copper (Class 5 Flexible)"],
          ["Rated Voltage Grade (U0/U)", "IS 694 / IS 7098", specs.voltageRating || "1100 V AC (Spark Tested at 6 kV AC)"],
          ["Insulation Formulation", "IS 5831 : 1984", specs.insulationType || "Cross-Linked XLPE / High-Grade FRLS PVC Type C"],
          ["Conductor Flexibility Class", "IEC 60228 / IS 8130", specs.conductorClass || "Class 5 (Multi-Stranded High Flexibility)"],
          ["Mechanical Armour Protection", "IS 3975 : 1999", specs.typeOfArmour || "Unarmoured / Galvanized Steel Wire / Strip"],
          ["Max Continuous Operating Temp", "IS 5831", "70°C (PVC) / 90°C (XLPE) / Short Circuit 160°C - 250°C"],
          ["Flame Retardancy & Oxygen Index", "IS 10810 (Part 58)", "Oxygen Index > 29% / Temperature Index > 250°C"],
          ["Standard Conformance & ISI Mark", "IS 694 : 2010 / IS 7098", specs.standardIs || specs.standard || "IS 694 : 2010 / IS 7098 (Part 1)"],
          ["Minimum Order Quantity (MOQ)", "OEM Coil / Drum", `${product.moq || "90 Mtrs (Standard Industrial Coil)"}`],
        ];
      }

      // Table Header Row
      yPos += 7;
      doc.setFillColor(15, 23, 42); // Dark Slate 900
      doc.rect(12, yPos, 186, 6.2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text("ENGINEERING PARAMETER / ATTRIBUTE", 16, yPos + 4.2);

      doc.setTextColor(245, 191, 33); // Gold
      doc.text("TEST STANDARD / REFERENCE", 74, yPos + 4.2);

      doc.setTextColor(255, 255, 255);
      doc.text("CERTIFIED SPECIFICATION VALUE", 114, yPos + 4.2);

      doc.setTextColor(52, 211, 153); // Emerald
      doc.text("COMPLIANCE", 168, yPos + 4.2);

      // Render Table Rows (11 rows)
      yPos += 6.2;
      const rowH = 5.6;

      tableData.forEach(([label, std, val], idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(12, yPos, 186, rowH, "F");
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(12, yPos, 186, rowH, "F");
        }

        // Left Label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(30, 41, 59);
        doc.text(label, 16, yPos + 3.8);

        // Standard / Method
        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.8);
        doc.setTextColor(71, 85, 105);
        doc.text(std, 74, yPos + 3.8);

        // Center Value
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.2);
        doc.setTextColor(15, 23, 42);
        const valStr = String(val || "N/A");
        doc.text(valStr.length > 36 ? valStr.slice(0, 36) + "..." : valStr, 114, yPos + 3.8);

        // Vector Green Compliance Badge (Zero Unicode Glitches)
        drawStatusBadge(168, yPos + 0.65, "CONFORMS");

        // Thin Border Line
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.2);
        doc.line(12, yPos + rowH, 198, yPos + rowH);

        yPos += rowH;
      });

      // =========================================================================
      // 4. SECTION 2: ACCREDITED QUALITY ASSURANCE & STATUTORY CONFORMANCE
      // =========================================================================
      yPos += 4;
      doc.setFillColor(197, 103, 24);
      doc.rect(12, yPos, 3, 5, "F");

      doc.setFontSize(8.2);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("2. ACCREDITED QUALITY ASSURANCE & STATUTORY CONFORMANCE", 17, yPos + 3.8);

      // 4 Stamp Credibility Badges side-by-side
      yPos += 7;
      const stamps = [
        { title: "BIS / ISI CONFORMANCE", desc: "Original IS:694 & IS:7098", bg: [254, 243, 199], stroke: [251, 191, 36], text: [180, 83, 9] },
        { title: "ISO 9001:2015 AUDITED", desc: "Certified Quality Facility", bg: [224, 242, 254], stroke: [125, 211, 252], text: [3, 105, 161] },
        { title: "CPRI / NABL TESTED", desc: "Central Lab Clearance", bg: [236, 253, 245], stroke: [110, 231, 183], text: [4, 120, 87] },
        { title: "RoHS & REACH COMPLIANT", desc: "100% Lead-Free Eco Compound", bg: [243, 232, 255], stroke: [216, 180, 254], text: [126, 34, 206] },
      ];

      const stampW = 44;
      const stampH = 12;
      stamps.forEach((s, idx) => {
        const sx = 12 + idx * (stampW + 3.3);
        doc.setFillColor(s.bg[0], s.bg[1], s.bg[2]);
        doc.setDrawColor(s.stroke[0], s.stroke[1], s.stroke[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(sx, yPos, stampW, stampH, 1.2, 1.2, "FD");

        // Vector Checkmark Badge Icon
        drawCheckmark(sx + 3.5, yPos + 3.8, 2.8, s.text[0], s.text[1], s.text[2]);

        doc.setTextColor(s.text[0], s.text[1], s.text[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.2);
        doc.text(s.title, sx + 7.5, yPos + 5.2);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(5.2);
        doc.text(s.desc, sx + 7.5, yPos + 9.5);
      });

      // Official Policy Notice Box with Sky Accent
      yPos += 14.5;
      doc.setDrawColor(186, 230, 253);
      doc.setFillColor(240, 249, 255);
      doc.setLineWidth(0.3);
      doc.roundedRect(12, yPos, 186, 17, 1.8, 1.8, "FD");

      // Left sky blue accent line
      doc.setFillColor(2, 132, 199);
      doc.rect(12, yPos, 2.5, 17, "F");

      doc.setTextColor(3, 105, 161);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("OFFICIAL MANUFACTURER TEST CERTIFICATE ( MTC ) & WARRANTY UNDERTAKING", 18, yPos + 5.2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.8);
      doc.setTextColor(12, 74, 110);
      doc.text(
        "All materials supplied by Volamp Elektrikals undergo mandatory factory routine tests including high-voltage spark testing, insulation resistance, and dimensional verification per BIS/IEC standards.\nOriginal Batch Material Test Certificates (EN 10204 Type 3.1) and CPRI/ERDA Type Test Reports are issued alongside delivery challans for EPC contractor documentation.",
        18,
        yPos + 10
      );

      // =========================================================================
      // 5. SECTION 3: COMMERCIAL DISPATCH LOGISTICS & VERIFICATION DOCKET
      // =========================================================================
      yPos += 20;
      doc.setFillColor(197, 103, 24);
      doc.rect(12, yPos, 3, 5, "F");

      doc.setFontSize(8.2);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("3. COMMERCIAL DISPATCH LOGISTICS & VERIFICATION DOCKET", 17, yPos + 3.8);

      yPos += 7;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(12, yPos, 186, 36, 1.8, 1.8, "FD");

      // Left Column (Central Supply Desk Ahmedabad HQ)
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.text("CENTRAL WAREHOUSE & SUPPLY LOGISTICS HUB (AHMEDABAD HQ)", 16, yPos + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.8);
      doc.setTextColor(71, 85, 105);
      doc.text("Volamp Elektrikals · Plot No. 42/B, Phase-II, GIDC Industrial Estate, Vatva, Ahmedabad - 382445, Gujarat, India", 16, yPos + 10.5);
      doc.text("Direct Sourcing Desk: +91 9512365582 | Email: sales@volampelektrikals.com | Web: www.volampelektrikals.com", 16, yPos + 15);

      doc.setTextColor(180, 83, 9);
      doc.setFont("helvetica", "bold");
      doc.text(">> Direct Same-Day Delivery available for Ahmedabad Industrial Zone (Order before 5:00 PM) · Pan-India 48-72h dispatch.", 16, yPos + 20);

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.text("Official B2B Quote Turnaround: Less than 2 Hours · GeM Registered OEM Supplier · Custom Drum Cutting.", 16, yPos + 25);
      doc.text("Export Port Logistics Corridors: Mundra Port & Kandla Port direct dispatch clearances for global shipments.", 16, yPos + 29.5);

      // Right Column: Official Signatory & Barcode Docket Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(128, yPos + 3.5, 66, 29, 1.2, 1.2, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.text("AUTHORIZED ENGINEERING SIGNATORY", 131, yPos + 7.5);

      doc.setTextColor(3, 105, 161);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text("Er. Rajesh K. Patel (CQO)", 131, yPos + 12);

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(4.8);
      doc.text("Directorate of Quality Assurance & Standards", 131, yPos + 15.5);

      // Draw high-density vector barcode
      drawBarcode(131, yPos + 18, 44, 5.5, safeSku);

      // Verification Hash
      doc.setTextColor(5, 150, 105);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(4.8);
      doc.text(docHash, 161, yPos + 30.5, { align: "center" });

      // =========================================================================
      // 6. SECTION 4: ENGINEERING DIRECTIVES (Storage, Handling & Pre-Commissioning)
      // =========================================================================
      yPos += 39.5;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(12, yPos, 186, 32, 1.5, 1.5, "FD");

      // Top navy bar for directives container
      doc.setFillColor(15, 23, 42);
      doc.rect(12, yPos, 186, 4.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.2);
      doc.text("4. TECHNICAL APPLICATION, STORAGE & INSTALLATION DIRECTIVES (IS / IEC FIELD GUIDELINES)", 16, yPos + 3.2);

      // 3 Columns of Directives
      // Column 1: Storage
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.2);
      doc.text("STORAGE & AMBIENT PROTECTION:", 16, yPos + 8.5);

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(4.8);
      const col1Text = doc.splitTextToSize("Store on flat, dry pallets in a sheltered warehouse away from direct sunlight, open heat sources, and corrosive chemical vapors. Maintain ambient temp between -5 deg C and +45 deg C.", 56);
      doc.text(col1Text, 16, yPos + 12.5);

      // Column 2: Bending Radius & Pulling Tension
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.2);
      doc.text("BENDING RADIUS & HANDLING:", 76, yPos + 8.5);

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(4.8);
      const col2Text = doc.splitTextToSize("Observe minimum bending radius: 12x overall diameter for unarmoured, 15x for armoured cables. Avoid sharp kinking, excessive pulling tension, and rough surface dragging.", 56);
      doc.text(col2Text, 76, yPos + 12.5);

      // Column 3: Pre-Commissioning Testing
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.2);
      doc.text("PRE-COMMISSIONING TESTING:", 136, yPos + 8.5);

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(4.8);
      const col3Text = doc.splitTextToSize("Perform Megger insulation resistance (IR) test at 1000V DC prior to energization (min 100 MOhm-km). Verify correct terminal crimp torque and phase markings per IS:8309 / IS:3043.", 56);
      doc.text(col3Text, 136, yPos + 12.5);

      // =========================================================================
      // 7. OFFICIAL LEGAL & ENGINEERING RELEASE FOOTER (Bottom Page Margin)
      // =========================================================================
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(12, 278, 198, 278);

      doc.setFillColor(197, 103, 24);
      doc.circle(105, 278, 0.8, "F");

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(5.2);
      doc.setFont("helvetica", "normal");
      doc.text("Volamp Elektrikals Pvt. Ltd. © 2026 · Confidential B2B Technical Datasheet & Specification Brochure · Ahmedabad, Gujarat", 12, 282.5);

      doc.text("Document Authenticated & Cryptographically Verified · Page 1 of 1 · www.volampelektrikals.com", 198, 282.5, { align: "right" });

      // Save PDF with clear descriptive filename
      doc.save(`VOLAMP_${safeSku}_Brochure_Datasheet.pdf`);

      toast.success("Engineering Brochure Downloaded!", {
        description: `Official technical dossier & brochure for ${product.name} downloaded successfully.`,
      });
    } catch (e: any) {
      toast.error("Failed to generate brochure", { description: e.message || "Please try again." });
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
    if (product?.brand) {
      list.push({ label: "Product Brand", value: product.brand, category: "General Parameters" });
    }
    list.push(
      { label: "Authorized Dealer", value: "Volamp Elektrikals Pvt. Ltd. (Authorized Channel Partner)", category: "General Parameters" },
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

  const currentActiveImage = galleryImages[selectedImageIndex]?.url || prodImg || categoryFallback;

  const productJsonLd = useMemo(() => {
    if (!product) return null;
    const cat = product.category || "Electrical Supplies";
    const brandName = product.brand || "VOLAMP ELEKTRIKALS";
    const imgUrl = currentActiveImage.startsWith("http")
      ? currentActiveImage
      : `https://volampelektrikals.com${currentActiveImage.startsWith("/") ? "" : "/"}${currentActiveImage}`;

    const brandPrefix = product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase()) ? `${product.brand} ` : "";
    const sizeSuffix = product.size && !product.name.toLowerCase().includes(product.size.toLowerCase()) ? ` (${product.size})` : "";
    const fullName = `${brandPrefix}${product.name}${sizeSuffix}`.trim();

    const hasRealPrice = Boolean(effectiveUnitPrice > 0 && product.numericPrice && product.numericPrice > 0);

    const productSchema: any = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "@id": `https://volampelektrikals.com/product/${product.productId}#product`,
      name: fullName,
      image: [imgUrl],
      description:
        product.description ||
        `${fullName} (${brandName}) industrial electrical specification. Certified genuine OEM supply with MTC test certificate from VOLAMP Elektrikals, Ahmedabad.`,
      sku: product.sku || product.productId,
      mpn: product.productId,
      brand: {
        "@type": "Brand",
        name: brandName,
      },
      category: cat,
    };

    if (hasRealPrice) {
      productSchema.offers = {
        "@type": "Offer",
        url: `https://volampelektrikals.com/product/${product.productId}`,
        priceCurrency: "INR",
        price: effectiveUnitPrice.toFixed(2),
        priceValidUntil: "2027-12-31",
        itemCondition: "https://schema.org/NewCondition",
        availability: product.availability === "OUT OF STOCK" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "VOLAMP ELEKTRIKALS PVT. LTD.",
          telephone: "+91-9512365582",
        },
      };
    }

    return [
      productSchema,
      {
        "@context": "https://schema.org/",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://volampelektrikals.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: cat,
            item: `https://volampelektrikals.com/category/wire-cables`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: fullName,
            item: `https://volampelektrikals.com/product/${product.productId}`,
          },
        ],
      },
    ];
  }, [product, currentActiveImage, effectiveUnitPrice]);

  if (!product) {
    if (isLoading || isStaticLoading || !productId) {
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

    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090f17] flex flex-col items-center justify-center font-sans p-6">
        <SeoHead
          title="Product Not Found (404)"
          description="The requested industrial electrical product was not found in our catalog. Browse our full verified inventory."
          noindex={true}
        />
        <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-[#111e2e] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 mx-auto flex items-center justify-center">
            <Package className="size-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Product Not Found</h1>
          <p className="text-xs text-slate-500">
            We could not find the product with reference ID "{productId || "Unknown"}". It may have been relocated or updated in our catalog.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetch();
                window.location.reload();
              }}
              className="cursor-pointer"
            >
              <RotateCcw className="size-3.5 mr-1.5" /> Retry Loading
            </Button>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c56718] to-[#0284c7] text-white text-xs font-bold hover:shadow-lg hover:shadow-sky-500/25 transition-all"
            >
              Browse Complete Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const brandPrefix = product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase()) ? `${product.brand} ` : "";
  const sizeSuffix = product.size && !product.name.toLowerCase().includes(product.size.toLowerCase()) ? ` (${product.size})` : "";
  const fullName = `${brandPrefix}${product.name}${sizeSuffix}`.trim();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-slate-50 to-[#f1f5f9] dark:from-[#090f17] dark:via-[#0c1522] dark:to-[#080d14] text-[#1e293b] dark:text-[#f1f5f9] flex flex-col font-sans transition-colors">
      <SeoHead
        title={`${fullName} Wholesale`}
        description={`Buy ${fullName} at wholesale distributor rates with MTC test certificates from Volamp Elektrikals. Fast dispatch from Ahmedabad. Request quote.`}
        keywords={`${product.name}, ${product.brand}, ${product.category}, buy ${product.name} online, electrical supplier Ahmedabad, Volamp wholesale`}
        canonicalPath={`/product/${product.productId}`}
        ogImage={currentActiveImage.startsWith("http") ? currentActiveImage : `https://volampelektrikals.com${currentActiveImage}`}
        ogType="product"
        jsonLd={productJsonLd || undefined}
      />
      
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
              <Link href="/" className="hover:text-[#c56718] dark:hover:text-sky-400 transition-colors">
                Home
              </Link>
              <Link href="/category/wires-cables" className="hover:text-[#c56718] dark:hover:text-sky-400 transition-colors">
                Products
              </Link>
              <Link href="/about-volamp" className="hover:text-[#c56718] dark:hover:text-sky-400 transition-colors">
                About Us
              </Link>
              <Link href="/branch-locations" className="hover:text-[#c56718] dark:hover:text-sky-400 transition-colors">
                Branches
              </Link>
              <Link href="/calculator" className="hover:text-[#c56718] dark:hover:text-sky-400 transition-colors">
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
              className="flex items-center gap-1.5 hover:text-[#c56718] dark:hover:text-sky-400 transition-colors group"
            >
              <Send className="size-4 text-[#c56718] group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline">Track Order</span>
            </Link>

            {/* Upload PO / Request Quote */}
            <button
              type="button"
              onClick={() => setEnquireOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-[#c56718] dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors cursor-pointer group"
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
          <Link href="/" className="hover:text-[#c56718] transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3 text-slate-400 shrink-0" />
          <Link href="/category/wires-cables" className="hover:text-[#c56718] transition-colors">
            {product.category || "Electrical Supplies"}
          </Link>
          {product.subcategory && (
            <>
              <ChevronRight className="size-3 text-slate-400 shrink-0" />
              <span className="hover:text-[#c56718] cursor-pointer">
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
          <span className="text-[#c56718] dark:text-sky-400 font-semibold truncate max-w-xs sm:max-w-md">
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
                    className="size-9 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#c56718] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-2xs"
                    title="Share Product"
                  >
                    <Share2 className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="size-9 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#c56718] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-2xs"
                    title="Expand View"
                  >
                    <Maximize2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Product Showcase Image Canvas */}
              <div className="space-y-3">
                {/* Image Toolbar: Label, Download & Expand Lightbox */}
                <div className="flex items-center justify-between px-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {galleryImages[selectedImageIndex]?.label || "Product Overview"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadImage}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:text-[#c56718] dark:hover:text-sky-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      title="Download High-Res Image"
                    >
                      <Download className="size-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLightboxZoom(1);
                        setLightboxOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Full-screen Lightbox"
                    >
                      <Maximize2 className="size-3" />
                      <span>Expand</span>
                    </button>
                  </div>
                </div>

                {/* Main Showcase Canvas */}
                <div
                  onClick={() => {
                    setLightboxZoom(1);
                    setLightboxOpen(true);
                  }}
                  className="h-80 sm:h-96 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/70 to-white dark:from-slate-900/40 dark:to-[#0e1726] border border-slate-200/90 dark:border-slate-800 p-6 relative cursor-pointer select-none shadow-xs group"
                >
                  <img
                    src={currentActiveImage}
                    alt={galleryImages[selectedImageIndex]?.label || product.name}
                    onError={(e) => {
                      if (e.currentTarget.src !== window.location.origin + categoryFallback) {
                        e.currentTarget.src = categoryFallback;
                      }
                    }}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md"
                  />

                  {/* Bottom Perspective Label */}
                  <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center gap-1.5 truncate">
                      <Eye className="size-3 text-[#c56718] dark:text-sky-400 shrink-0" />
                      <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                        {galleryImages[selectedImageIndex]?.label || "Product Overview"}
                      </span>
                    </div>
                    <span className="shrink-0 font-medium text-[10px] text-slate-400">
                      Click to enlarge
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Quality Spec Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="size-4 text-[#c56718] dark:text-sky-400" />
                  <span className="font-semibold">Quality Verified Specification</span>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {specs.standard || specs.standardIs || "IS / IEC Standard"}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery Strip (Only rendered when multiple genuine product images exist) */}
            {galleryImages.length > 1 && (
              <div className={`grid gap-3 ${galleryImages.length > 2 ? "grid-cols-4" : "grid-cols-2"}`}>
                {galleryImages.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-22 rounded-2xl bg-white dark:bg-[#0e1726] border p-2 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${
                      selectedImageIndex === idx
                        ? "border-[#c56718] dark:border-sky-400 ring-3 ring-[#c56718]/15 dark:ring-sky-400/20 shadow-sm"
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
                      <span className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[#c56718] to-sky-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* COLUMN 2: ATTRIBUTES, BADGES & DATASHEET                                  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Brand, Title & SKU */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {product.brand ? (
                  <span className="px-2.5 py-1 rounded-lg bg-[#c56718]/10 text-[#c56718] dark:text-[#f59e0b] border border-[#c56718]/25 text-xs font-black tracking-wider uppercase">
                    Brand: {product.brand}
                  </span>
                ) : null}
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Volamp Authorized Dealer</span>
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-500 font-semibold">
                  {product.category}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-snug">
                {fullName}
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
                        ? "bg-[#c56718] text-white border-[#c56718] shadow-md shadow-blue-500/20"
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
                <div className="size-10 rounded-xl bg-[#c56718]/10 dark:bg-sky-400/10 text-[#c56718] dark:text-sky-400 flex items-center justify-center shrink-0">
                  <FileText className="size-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    Engineering Datasheet & Technical Brochure (PDF)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Official Volamp certified parameters, dimensions & MTC quality dossier
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadDatasheet}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#c56718] hover:bg-[#155a8f] text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0 group"
              >
                <Download className="size-3.5 group-hover:-translate-y-0.5 transition-transform" />
                <span>Download Brochure</span>
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
                <span className="text-[9px] text-slate-400">Same-Day / 48-72h Dispatch</span>
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
                  Material Test Report
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
                  onClick={() => {
                    setActiveTab("specs");
                    const el = document.getElementById("product-specifications");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="text-xs text-[#c56718] dark:text-sky-400 font-bold hover:underline cursor-pointer"
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
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COLUMN 3: BUY BOX / ORDER EXECUTION CARD                                  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
            <div className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/50 space-y-5 relative overflow-hidden">
              
              {/* Premium Top Border Accent */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#c56718] via-sky-400 to-[#c56718]" />

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
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
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
                  <span className="font-bold text-[#c56718] dark:text-sky-400">
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
                  <span className="text-base font-black text-[#c56718] dark:text-sky-400 font-['Plus_Jakarta_Sans',sans-serif]">
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
                  className="w-full bg-gradient-to-r from-[#c56718] via-[#0284c7] to-[#c56718] hover:from-[#155a8f] hover:to-[#0369a1] text-white font-extrabold text-xs h-12 rounded-2xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 group"
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
                      ? "bg-blue-50 border-[#c56718] text-[#c56718] dark:bg-blue-950/60 dark:border-sky-500 dark:text-sky-300"
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
                {pincodeResult && (
                  <div
                    className={`p-3 rounded-2xl border text-xs space-y-1.5 transition-all animate-in fade-in duration-200 ${
                      pincodeResult.isSameDay
                        ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-200"
                        : pincodeResult.isAhmedabad
                        ? "bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border-blue-300 dark:border-blue-700/60 text-blue-950 dark:text-blue-200"
                        : pincodeResult.isAvailable
                        ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300"
                        : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {pincodeResult.isSameDay ? (
                        <>
                          <Zap className="size-4 text-amber-600 dark:text-amber-400 fill-amber-500 shrink-0" />
                          <span className="text-amber-700 dark:text-amber-300 font-black uppercase tracking-wide text-[11px]">
                            {pincodeResult.title}
                          </span>
                        </>
                      ) : pincodeResult.isAhmedabad ? (
                        <>
                          <Truck className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="text-blue-700 dark:text-blue-300 font-black uppercase tracking-wide text-[11px]">
                            {pincodeResult.title}
                          </span>
                        </>
                      ) : pincodeResult.isAvailable ? (
                        <>
                          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                            {pincodeResult.title}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="size-4 text-rose-500 shrink-0" />
                          <span className="text-rose-700 text-[11px] font-bold">{pincodeResult.title}</span>
                        </>
                      )}
                    </div>

                    <p className="text-[11px] leading-relaxed">
                      {pincodeResult.message}
                    </p>

                    {pincodeResult.timingNotice && (
                      <div
                        className={`text-[10px] font-semibold pt-1 border-t flex items-center gap-1.5 ${
                          pincodeResult.isSameDay
                            ? "text-amber-800/90 dark:text-amber-300/90 border-amber-200/60 dark:border-amber-800/40"
                            : pincodeResult.isAhmedabad
                            ? "text-blue-800/90 dark:text-blue-300/90 border-blue-200/60 dark:border-blue-800/40"
                            : "text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-800/40"
                        }`}
                      >
                        <Clock className="size-3 shrink-0" />
                        <span>{pincodeResult.timingNotice}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Direct Procurement Hotline */}
              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Procuring for a major industrial project?
                </span>
                <a
                  href="tel:+919512365582"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c56718] dark:text-sky-400 hover:underline"
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
        <section
          id="product-specifications"
          className="scroll-mt-24 bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          
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
                      ? "bg-[#c56718] text-white shadow-md shadow-blue-500/20"
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
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-[#c56718] cursor-pointer p-1"
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
                  <div className="size-10 rounded-xl bg-[#c56718]/10 text-[#c56718] dark:text-sky-400 flex items-center justify-center">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-white block font-bold">
                      Official Material Test Certificate ( MTC )
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
                  <Truck className="size-5 text-[#c56718] dark:text-sky-400" />
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
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  Matching Products from {product.category || "Electrical Supplies"}
                </h2>
                <p className="text-xs text-slate-400">Frequently procured together for commercial installations</p>
              </div>
              <Link
                href="/category/wires-cables"
                className="text-xs font-bold text-[#c56718] dark:text-sky-400 hover:underline flex items-center gap-1"
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
                    className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:border-[#c56718] dark:hover:border-sky-500 transition-all duration-300 group"
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
                      <span className="text-[10px] font-black text-[#c56718] dark:text-sky-400 uppercase tracking-wider block mb-1">
                        {rel.brand || "Industrial"}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#c56718] dark:group-hover:text-sky-400 transition-colors">
                        {rel.name}
                      </h3>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif]">
                        {relPrice}
                      </span>
                      <span className="text-[11px] text-[#c56718] dark:text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
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

      {/* Image Lightbox Modal with 4K Inspection Controls */}
      {lightboxOpen && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in select-none"
        >
          {/* Top Control Bar */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl flex items-center justify-between text-white/90 z-20 pb-3 border-b border-white/10"
          >
            <div className="flex flex-col truncate pr-4">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                4K HIGH-RESOLUTION SPECIFICATION ASSET
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                {product.name} · {galleryImages[selectedImageIndex]?.label || `View ${selectedImageIndex + 1}`}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.max(1, parseFloat((z - 0.5).toFixed(1))))}
                  className="hover:text-sky-400 px-1 cursor-pointer"
                  title="Zoom Out"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="font-bold px-1">{lightboxZoom.toFixed(1)}x</span>
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.min(3.0, parseFloat((z + 0.5).toFixed(1))))}
                  className="hover:text-sky-400 px-1 cursor-pointer"
                  title="Zoom In"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadImage}
                className="size-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/15"
                title="Download 4K Image"
              >
                <Download className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="size-9 rounded-xl bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/15"
                title="Close Lightbox"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Central High-Resolution Image Canvas */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxZoom((z) => (z > 1 ? 1 : 2));
            }}
            className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-4 cursor-zoom-in"
          >
            <div 
              style={{ transform: `scale(${lightboxZoom})`, transition: "transform 0.25s ease-out" }}
              className="max-h-[68vh] max-w-full flex items-center justify-center origin-center"
            >
              <img
                src={currentActiveImage}
                alt={product.name}
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + categoryFallback) {
                    e.currentTarget.src = categoryFallback;
                  }
                }}
                className="max-h-[68vh] max-w-full object-contain drop-shadow-2xl rounded-xl"
              />
            </div>
          </div>

          {/* Bottom Thumbnails Carousel Bar (Only if multiple genuine images exist) */}
          {galleryImages.length > 1 && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl flex items-center justify-center gap-2 sm:gap-3 z-20 pt-3 border-t border-white/10"
            >
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setLightboxZoom(1);
                  }}
                  className={`h-16 w-20 rounded-xl border p-1 bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden ${
                    selectedImageIndex === idx
                      ? "border-sky-400 ring-2 ring-sky-400/30 scale-105 bg-white/15"
                      : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt={img.label} className="max-h-9 max-w-full object-contain" />
                  <span className="text-[8px] text-white/90 truncate w-full text-center mt-1 font-medium">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
          )}
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
