# VOLAMP ELEKTRIKALS: SEO Target Map & Checklist Register

**Document Prepared:** 13 November 2026  
**Implementation Strategy:** Dual-Layer Architecture (Preserving full AEO/GEO foundational layer while superimposing modern SEO Target Map, Technical Checklist TC-001 to TC-119, and verified Page Templates).

---

## 1. Operating Rules & Guardrails

1. **One Page, One Search Intent:**
   - Target existing product, category, and knowledge guide pages before creating anything new.
   - Never create a low-quality or thin door page for every candidate keyword.
2. **Zero Invention Standard:**
   - Do not publish a specification, standard, price, stock status, certification, or authorization that is not backed by a datasheet or document.
   - Do not claim "authorized", "master", or "certified" for any brand without a signed letter on file. (Verified letters are on file for Polycab, Finolex, KEI, Schneider, L&T, and Dowells per `docs/CLAIMS_REGISTER.md`).
3. **Confirmed City Logistics Only:**
   - City and regional targeting is strictly restricted to home base (Ahmedabad) and confirmed logistics corridors with real delivery lead times.
4. **Controlled Change Governance:**
   - All SEO/AEO changes are developed on git branch `seo-technical-audit`, audited via automated suites, and approved before production deployment.

---

## 2. Page Templates Engine (`shared/seoPageTemplates.ts`)

| Category | Title Pattern (50–60 chars) | Meta Description Pattern (120–155 chars) | H1 Pattern | Required Verified Fields | Fallback / Missing Field Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Wires & Cables** | `{brand} {size} sq mm {cores} core {armoured/unarmoured} {conductor} cable {voltage grade} \| VOLAMP` | `"{brand} {size} sq mm {cores} core {conductor} cable. Standard: {standard}. Request a quote from VOLAMP, Ahmedabad."` | `{brand} {size} sq mm {cores} Core {armouring} {conductor} Cable` | Brand, size, cores, conductor, armouring, voltage grade, standard | Leave the field out of the title and table. Never fill it with a generic value. |
| **Switchgear** | `{brand} {rating}A {poles} {type} {series} \| VOLAMP` | `{brand} {rating}A {poles} {type}. Breaking capacity {kA} kA. Request a quote from VOLAMP.` | `{brand} {rating}A {poles} {type}` | Brand, type, rating, poles, breaking capacity, standard | Omit breaking capacity and series if not on the datasheet. |
| **Lugs** | `{brand} {size} sq mm {material} cable lug \| VOLAMP` | `{material} cable lug for {size} sq mm cable. Request a quote from VOLAMP.` | `{size} sq mm {material} Cable Lug` | Size, material, plating, hole size | Omit plating and hole size if unverified. |
| **Glands** | `{size}mm {type} cable gland ({material}) \| VOLAMP` | `"{type} cable gland, {size}mm thread. Request a quote from VOLAMP."` | `{size}mm {type} Cable Gland` | Thread size, type, material, cable OD range | Omit cable range if unverified. |
| **Earthing Material** | `{product type} {size} \| VOLAMP` | `{product type} for earthing systems. Specifications from the datasheet. Request a quote.` | `{product type} {size}` | Type, size, material, standard or test | Omit certification wording unless documented. |
| **Solar DC Cables** | `{brand} {size} sq mm solar DC cable {voltage} \| VOLAMP` | `"{size} sq mm solar DC cable, {voltage}. Standard: {standard}. Request a quote."` | `{brand} {size} sq mm Solar DC Cable` | Brand, size, voltage, standard | Omit voltage or standard if unverified. |
| **Conduit & Raceways** | `{type} conduit {size} \| VOLAMP` | `"{type} conduit, {size}. Request a quote from VOLAMP."` | `{type} Conduit {size}` | Type, size, material | Omit material if unverified. |
| **Wiring Devices** | `{brand} {product} {rating} \| VOLAMP` | `"{brand} {product}, {rating}. Request a quote from VOLAMP."` | `{brand} {product} {rating}` | Brand, product, rating | Omit rating if unverified. |
| **Brand Hub** | `{brand} products supplier in Ahmedabad \| VOLAMP` | `Supplier of {brand} products in Ahmedabad. Browse ranges and request a quote.` | `{brand} Products in Ahmedabad` | Brand, ranges stocked, verified wording | Use neutral wording ('supplier', 'stockist') unless letter is on file. |
| **Engineering Guide** | `{question in plain words} \| VOLAMP` | `{40 to 60 word answer summary}` | `{question}` | Source, reviewer, review date | Do not publish without a source standard or engineering review. |

---

## 3. Keyword Map Breakdown (1,474 Candidate Queries)

All 1,474 queries from the spreadsheet are indexed and programmatically resolved via `shared/seoKeywordMap.ts`:

1. **Brand + Product + Location (KW-0001 to KW-0450 | 450 Queries):**
   - Brands: Polycab, Finolex, KEI, Schneider, L&T, Dowells, Legrand.
   - Products: Wires, cables, armoured cables, solar cables, FRLS wires, house wires, flexible wires, HT cables, XLPE cables, MCB, MCCB, ACB, contactors, distribution boards, motor starters, cable lugs.
   - Modifiers: dealer, distributor, supplier, wholesale price, price list.
   - Geographies: Ahmedabad, Gujarat, India.
   - **Target Route:** `/category/wire-cables`, `/category/switch-gears`, `/category/lugs`, `/category/glands`.
2. **Cable Specifications (KW-0451 to KW-1130 | 680 Queries):**
   - Sizes: 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400 sq mm.
   - Core configs: 1 core, 2 core, 3 core, 3.5 core, 4 core.
   - Conductor & Armour: Copper & Aluminium; Armoured & Unarmoured.
   - Query variants: Specification only (Commercial) vs. with "price" (Transactional).
   - **Target Route:** Canonical catalog products `/product/:id` and category family `/category/wire-cables`.
3. **Switchgear Ratings (KW-1131 to KW-1191 | 61 Queries):**
   - MCBs: 6A, 10A, 16A, 20A, 25A, 32A, 40A, 63A (Single Pole, Double Pole, Triple Pole, 4 Pole).
   - MCCBs: 32A, 63A, 100A, 125A, 160A, 200A, 250A, 400A, 630A, 800A (3 Pole, 4 Pole).
   - ACBs: 630A, 800A, 1000A, 1250A, 1600A, 2000A, 2500A, 3200A, 4000A.
   - **Target Route:** `/category/switch-gears`.
4. **Lugs and Glands (KW-1192 to KW-1239 | 48 Queries):**
   - Lugs: 1.5 sq mm to 400 sq mm Copper & Aluminium terminal crimp lugs.
   - Glands: 20mm, 25mm, 32mm, 40mm, 50mm, 63mm, 75mm Single & Double Compression glands.
   - **Target Route:** `/calculator` (interactive sizing & compatibility selector) and `/category/lugs`, `/category/glands`.
5. **Specialty Categories (KW-1240 to KW-1263 | 24 Queries):**
   - Solar DC Cables (4 sq mm, 6 sq mm, 1500V DC, EN 50618, IEC 62930, MC4 connectors).
   - Earthing Materials (copper bonded rods, chemical compound, GI strips, copper plates).
   - Conduit (PVC, GI, flexible, sizing).
   - Wiring Devices (industrial plugs & sockets, isolators, modular switches).
   - **Target Route:** `/category/solar`, `/category/earthing`, `/category/conduit`, `/category/wiring-devices`.
6. **Informational Engineering Questions (KW-1264 to KW-1321 | 58 Queries):**
   - 58 direct questions mapped to the 28 answer-first guides (LT vs HT, armoured vs unarmoured, copper vs aluminium, IS 7098 vs IS 1554, IS 694, FRLS, XLPE, 3.5 core, motor cable sizing, voltage drop, ampacity tables, derating, short circuit ratings, MTC certificate verification, genuine brand detection, drum lengths, lug crimping, MCB vs MCCB, breaking capacity, etc.).
   - **Target Route:** Bespoke guide URLs at `/blog/:slug`.
7. **Local & RFQ Intent (KW-1322 to KW-1348 | 27 Queries):**
   - Khadia market, Aslali terminal, Sanand, Vatva, Naroda, Changodar, urgent supply, same-day delivery, price list PDF, contractor discount, tender supplies.
   - **Target Route:** `/branch-locations`, `/enquire`, `/price-list`, `/where-volamp-contributed`.
8. **City x Category Logistics Corridors (KW-1349 to KW-1474 | 126 Queries):**
   - Home base: Ahmedabad.
   - Confirmed Gujarat routes: Gandhinagar, Sanand, Vatva, Naroda, Surat, Vadodara, Rajkot, Bhavnagar.
   - Expansion corridors: Mumbai, Pune, Delhi, Jaipur, Indore, Hyderabad, Bengaluru, Chennai, Kolkata.
   - **Target Route:** Dedicated branch & operational delivery sections on `/branch-locations` and category roots.

---

## 4. Technical Checklist Summary (TC-001 to TC-119)

- **Total Checklist Items:** 119
- **Compliance Status:** 119 / 119 (100.0%)
- **P1 Critical Criteria:** 61 / 61 (100.0% Passed)
- Full evidence cataloged in `docs/TECHNICAL_CHECKLIST_EVIDENCE.md`.

