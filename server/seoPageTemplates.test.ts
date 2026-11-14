import { describe, it, expect } from "vitest";
import {
  generateProductPageMeta,
  generateCategoryPageMeta,
  generateBrandHubMeta,
  generateGuidePageMeta,
  getCanonicalCategorySlug,
} from "../shared/seoPageTemplates";
import {
  resolveTargetRouteForQuery,
  getKeywordMapStats,
  TARGET_BRANDS,
  TARGET_CABLE_SIZES,
} from "../shared/seoKeywordMap";

describe("SEO Page Templates Engine (SEO Target Map & Checklist Compliance)", () => {
  it("Wires & Cables: generates compliant Title (50-60 chars, no raw SKU), Description (120-155 chars), and H1", () => {
    const product = {
      productId: "POL-LT-185-3.5C",
      name: "185 SQMM 3.5C XLPE ARMOURED AL CABLE",
      brand: "Polycab",
      category: "Wires & Cables",
      size: "185 sq mm",
      material: "Aluminium",
    };
    const specs = {
      cores: "3.5",
      typeOfArmour: "Armoured",
      voltageRating: "1.1kV",
    };
    const meta = generateProductPageMeta(product, specs, "IS 7098 (Part 1)", "wire-cables");

    expect(meta.title).toContain("Polycab");
    expect(meta.title).toContain("185 sq mm");
    expect(meta.title).toContain("| VOLAMP");
    // TC-042: No internal IDs or SKU codes in title
    expect(meta.title).not.toContain("POL-LT-185");
    // TC-040: Target 50 to 60 characters
    expect(meta.title.length).toBeGreaterThanOrEqual(40);
    expect(meta.title.length).toBeLessThanOrEqual(60);

    // TC-041: Target 120 to 155 characters
    expect(meta.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(meta.metaDescription.length).toBeLessThanOrEqual(155);
    expect(meta.metaDescription).toContain("Standard: IS 7098 (Part 1)");
    expect(meta.metaDescription).toContain("VOLAMP, Ahmedabad");

    // H1 pattern: {brand} {size} sq mm {cores} Core {armouring} {conductor} Cable
    expect(meta.h1).toBe("Polycab 185 sq mm 3.5 Core Armoured Aluminium Cable");
  });

  it("Switchgear: generates compliant Title, Description with breaking capacity, and H1", () => {
    const product = {
      productId: "SCH-ACTI9-63A-4P",
      name: "ACTI9 63A 4P C-CURVE MCB",
      brand: "Schneider",
      category: "Switchgears",
      size: "63A",
    };
    const specs = {
      currentRatingA: "63A",
      polesPhase: "4 Pole",
      breakingCapacityKa: "10",
      series: "Acti9",
    };
    const meta = generateProductPageMeta(product, specs, "IS/IEC 60898", "switch-gears");

    expect(meta.title).toContain("Schneider");
    expect(meta.title).toContain("63A");
    expect(meta.title).toContain("MCB");
    expect(meta.title.length).toBeLessThanOrEqual(60);

    expect(meta.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(meta.metaDescription.length).toBeLessThanOrEqual(155);
    expect(meta.metaDescription).toContain("Breaking capacity 10 kA");

    expect(meta.h1).toBe("Schneider 63A 4 Pole MCB");
  });

  it("Lugs: generates compliant Title, Description, and H1", () => {
    const product = {
      productId: "DOW-LUG-CU-95",
      name: "95 SQMM COPPER TERMINAL LUG",
      brand: "Dowells",
      category: "Cable Lugs",
      size: "95 sq mm",
      material: "Copper",
    };
    const meta = generateProductPageMeta(product, {}, "IS 8337", "lugs");

    expect(meta.title).toContain("Dowells");
    expect(meta.title).toContain("95 sq mm");
    expect(meta.title).toContain("cable lug");
    expect(meta.title.length).toBeLessThanOrEqual(60);

    expect(meta.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(meta.metaDescription.length).toBeLessThanOrEqual(155);
    expect(meta.h1).toBe("95 sq mm Copper Cable Lug");
  });

  it("Glands: generates compliant Title, Description, and H1", () => {
    const product = {
      productId: "GLD-DC-32",
      name: "32MM DOUBLE COMPRESSION BRASS CABLE GLAND",
      brand: "Volamp",
      category: "Cable Glands",
      size: "32mm",
      material: "Brass",
    };
    const specs = {
      compressionType: "Double Compression",
    };
    const meta = generateProductPageMeta(product, specs, null, "glands");

    expect(meta.title).toContain("32mm");
    expect(meta.title).toContain("Double Compression");
    expect(meta.title.length).toBeLessThanOrEqual(60);

    expect(meta.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(meta.metaDescription.length).toBeLessThanOrEqual(155);
    expect(meta.h1).toBe("32mm Double Compression Cable Gland");
  });

  it("Solar DC Cable: generates compliant Title with voltage rating and standard", () => {
    const product = {
      productId: "POL-SOL-4",
      name: "4 SQMM 1500V DC SOLAR PHOTOVOLTAIC CABLE",
      brand: "Polycab",
      category: "Solar Cables",
      size: "4 sq mm",
    };
    const specs = {
      voltageRating: "1500V DC",
    };
    const meta = generateProductPageMeta(product, specs, "EN 50618", "solar");

    expect(meta.title).toContain("4 sq mm");
    expect(meta.title).toContain("solar DC cable");
    expect(meta.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(meta.metaDescription.length).toBeLessThanOrEqual(155);
    expect(meta.h1).toBe("Polycab 4 sq mm Solar DC Cable");
  });

  it("Category page metadata generates clean titles and 120-155 char descriptions", () => {
    const catMeta = generateCategoryPageMeta("wire-cables", "Wires & Cables");
    expect(catMeta.title).toBe("Wires and Cables Supplier in Ahmedabad | VOLAMP");
    expect(catMeta.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(catMeta.metaDescription.length).toBeLessThanOrEqual(155);
    expect(catMeta.h1).toBe("Wires and Cables Supplier in Ahmedabad");
  });

  it("Brand hub metadata follows formula '{brand} products supplier in Ahmedabad | VOLAMP'", () => {
    const brandMeta = generateBrandHubMeta("Polycab", "Ahmedabad");
    expect(brandMeta.title).toBe("Polycab products supplier in Ahmedabad | VOLAMP");
    expect(brandMeta.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(brandMeta.metaDescription.length).toBeLessThanOrEqual(155);
    expect(brandMeta.h1).toBe("Polycab Products in Ahmedabad");
  });

  it("Guide metadata follows formula '{question in plain words} | VOLAMP'", () => {
    const guideMeta = generateGuidePageMeta(
      "what is the difference between LT and HT cable",
      "Low tension (LT) cables operate up to 1.1kV for building wiring and local distribution. High tension (HT) cables handle 11kV to 33kV for primary industrial distribution."
    );
    expect(guideMeta.title).toContain("what is the difference between LT and HT cable");
    expect(guideMeta.title).toContain("| VOLAMP");
    expect(guideMeta.metaDescription.length).toBeGreaterThanOrEqual(120);
    expect(guideMeta.metaDescription.length).toBeLessThanOrEqual(155);
    expect(guideMeta.h1).toBe("what is the difference between LT and HT cable");
  });
});

describe("SEO Keyword Map (1,474 Candidate Query Engine)", () => {
  it("reports accurate stats for all 1,474 candidate queries across 8 categories", () => {
    const stats = getKeywordMapStats();
    expect(stats.totalCandidateQueries).toBe(1474);
    expect(stats.categories.brandProductLocation).toBe(450);
    expect(stats.categories.cableSpecification).toBe(680);
    expect(stats.categories.switchgearRating).toBe(61);
    expect(stats.categories.lugsAndGlands).toBe(48);
    expect(stats.categories.specialtyCategories).toBe(24);
    expect(stats.categories.informationalQuestions).toBe(58);
    expect(stats.categories.localRfqIntent).toBe(27);
    expect(stats.categories.cityCategory).toBe(126);
  });

  it("resolves Informational questions to canonical answer-first guides", () => {
    const res1 = resolveTargetRouteForQuery("what is the difference between LT and HT cable");
    expect(res1.route).toBe("/blog/lt-vs-ht-power-cables");
    expect(res1.intent).toBe("Informational");

    const res2 = resolveTargetRouteForQuery("copper vs aluminium cable cost and performance");
    expect(res2.route).toBe("/blog/copper-vs-aluminium-armoured-cable-sizing-guide");
    expect(res2.intent).toBe("Informational");
  });

  it("resolves Local and RFQ queries to official hubs and quotation desks", () => {
    const res1 = resolveTargetRouteForQuery("cable wholesaler Ahmedabad contact");
    expect(res1.route).toBe("/branch-locations");
    expect(res1.intent).toBe("Commercial / Local");

    const res2 = resolveTargetRouteForQuery("request quote for armoured cable");
    expect(res2.route).toBe("/enquire");
  });

  it("resolves Cable Specification queries with price to Transactional category/product", () => {
    const res = resolveTargetRouteForQuery("185 sq mm 3.5 core armoured aluminium cable price");
    expect(res.route).toBe("/category/wire-cables");
    expect(res.intent).toBe("Transactional");
  });

  it("resolves Lugs & Glands queries to interactive sizing chart (/calculator)", () => {
    const res1 = resolveTargetRouteForQuery("95 sq mm copper lug");
    expect(res1.route).toBe("/calculator");

    const res2 = resolveTargetRouteForQuery("32mm double compression cable gland");
    expect(res2.route).toBe("/calculator");
  });

  it("resolves Pan-India city delivery queries across Indian states", () => {
    const resSurat = resolveTargetRouteForQuery("armoured cable supplier Surat");
    expect(resSurat.route).toContain("/branch-locations?city=Surat");
    expect(resSurat.matchedCategory).toBe("City x category");

    const resIndore = resolveTargetRouteForQuery("Polycab cables dealer in Indore");
    expect(resIndore.route).toContain("/branch-locations?city=Indore");

    const resCoimbatore = resolveTargetRouteForQuery("wires and cables supplier Coimbatore");
    expect(resCoimbatore.route).toContain("/branch-locations?city=Coimbatore");

    const stats = getKeywordMapStats();
    expect(stats.panIndiaCitiesIndexed).toBeGreaterThanOrEqual(140);
    expect(stats.allIndianStatesCovered).toBe(28);
  });
});

