# VOLAMP ELEKTRIKALS: AEO & GEO Quality & Review Standard Operating Procedure (SOP)

**Document Reference:** SOP-QA-2026-01  
**Applies To:** All public digital assets, product catalogues, knowledge hub articles, calculation tools, metadata, schema, and AI retrieval manifests for VOLAMP ELEKTRIKALS PVT. LTD.  
**Governing Standard:** Phase 10 (Steps 136 to 142) of the VOLAMP Step-by-Step AEO and GEO Implementation Guide.

---

## 1. Editorial Authority, Reviewer Roles & Revision Dating (Step 136)

To maintain authoritative entity status across Answer Engines (AEO) and Generative Engines (GEO), every published technical page, product template, and engineering guide must display verifiable editorial provenance:

1. **Mandatory Reviewer Attribution:**
   - **Lead Technical Reviewer:** Lead Electrical Systems & Standards Engineer, Volamp Elektrikals (`review@volampelektrikals.com`).
   - **Commercial Governance Owner:** Chief Executive Officer / Commercial Director (`sales@volampelektrikals.com`).
   - **Digital Technical Sign-Off:** Web Infrastructure & Search Systems Lead.
2. **Review Date Stamp:** Every engineering article and category specification guide must carry an ISO date stamp (`reviewedOn: "YYYY-MM-DD"`) reflecting the latest validation against current Bureau of Indian Standards (BIS) editions or manufacturer technical circulars.
3. **Re-Verification Cycle:** No technical guide or calculator formula may exceed 180 days without explicit re-verification against active manufacturer catalogues.

---

## 2. Technical Number & Sourcing Protocol (Step 137)

**Absolute Rule:** Every electrical value, current rating, resistance, short-circuit withstand, voltage drop multiplier, temperature coefficient, or dimension published on Volamp platforms must trace to an authoritative, verifiable source.

| Parameter Class | Authoritative Source Priority | Prohibited Practices |
|---|---|---|
| **Conductor Resistance** | IS 8130:2013 Table 1 (Copper) / Table 2 (Aluminium) | Never extrapolate or calculate resistance from nominal diameter |
| **Current Carrying Capacity (Ampacity)** | Manufacturer Published Technical Manual (Polycab, Finolex, KEI) & IS 3961 (Part 2) | Never state single rating without qualifying ground/air installation |
| **Short-Circuit Withstand (1s)** | $I_{sc} = \frac{K \times A}{\sqrt{t}}$ per IS 7098 (Part 1) ($K=94$ for Al/XLPE, $K=143$ for Cu/XLPE) | Never quote peak fault withstand without specifying clearing duration |
| **Breaking Capacity (Switchgear)** | IEC/IS 60947-2 (Icu / Ics) or IEC/IS 60898-1 (Icn) manufacturer datasheet | Never round off 10kA or 16kA ratings or use generic values across frame sizes |
| **Gland & Lug Sizing** | Dowells / Comet Manufacturer Compatibility Chart (BS 6121 / IS 8309) | Never recommend gland size without cross-referencing overall cable OD range |

---

## 3. Claims Register Conformance (Step 138)

All published marketing, entity, and capabilities claims must strictly conform to `docs/CLAIMS_REGISTER.md`:
- **CLM-001 (Brand Dealerships):** Restricted to "Wholesale distributor and stockist" until countersigned annual authorization letters are verified on file.
- **CLM-002 (GeM Registration):** Documented as "Government e-Marketplace Verified Reseller & Wholesale Distributor" under seller credentials.
- **CLM-003 (MTC Delivery):** Standard supply includes "Manufacturer Test Certificates (MTC) and factory routine inspection reports upon customer request with consignments."
- **CLM-004 (Infrastructure Supplies):** Disclosed as wholesale contractor supply references for regional projects without claiming unverified EPC turnkey ownership.
- **CLM-005 (SKU Database):** Standardized exactly to "3,385 verified active SKUs across 8 categories".

---

## 4. Monthly 20-Product Random Datasheet Audit Protocol (Step 139)

On the 1st business day of each calendar month, the technical review desk executes a randomized sample audit of 20 active SKUs:

### Audit Execution Workflow:
1. **Selection:** Run the deterministic PRNG selection script across `products_db.json` to draw 20 random SKUs (stratified: 8 Cables, 4 Switchgear, 2 Glands, 2 Lugs, 2 Solar, 1 Earthing, 1 Conduit).
2. **Datasheet Matching:** Retrieve the current official OEM product datasheet or master price list.
3. **Five-Point Verification:**
   - [ ] Conductor cross-section (sq mm) and core count matches physical datasheet.
   - [ ] Insulation material and voltage rating matches catalogue description.
   - [ ] Applicable BIS / IEC standard number and edition is accurate.
   - [ ] Nominal pricing unit (per metre, per coil, per piece) is correctly assigned.
   - [ ] Category-specific attributes (armour type, breaker breaking capacity, gland thread) have zero placeholders or inferred values.
4. **Discrepancy Remediation:** If any attribute deviates, the SKU record is immediately flagged `verified: false`, removed from search index prerender output, corrected against the datasheet, and signed off before restoration.
5. **Audit Archiving:** Completed audit checklists are logged into `docs/audits/YYYY-MM-audit.md`.

---

## 5. Thin & Zero-Value Page Pruning SOP (Step 140)

To protect domain authority and prevent search crawl budget waste:
1. **Quarterly Traffic & Search Console Review:** Any dynamic or landing URL with zero impressions, zero clicks, and zero organic RFQs over a rolling 90-day window is audited.
2. **Consolidation Criteria:**
   - If a product SKU has been discontinued by the manufacturer, issue an immediate `301 Moved Permanently` redirect to the closest replacement cross-section within the same series.
   - If a brand-city combination has no verifiable delivery footprint, redirect to the parent Gujarat state corridor page (`/locations/industrial-gidc-hubs`).
3. **No Soft 404s:** Ensure zero indexed URLs return empty results, broken tables, or "product not found" placeholders.

---

## 6. Standards Revision & Manufacturer Price Circular Workflow (Step 141)

When a governing standard is amended by the Bureau of Indian Standards (e.g., changes to IS 694 or IS 7098) or a manufacturer issues an updated price list:

```
[Manufacturer / BIS Notification]
             │
             ▼
[1. Technical Desk Impact Analysis] ──► Identify affected SKUs and Knowledge Guides
             │
             ▼
[2. Data Patch on Working Branch]   ──► Update `products_db.json`, `shared/blogData.ts`, `server/seoPrerender.ts`
             │
             ▼
[3. Peer Engineering Sign-Off]      ──► Verify table numbers and revised nominal list prices
             │
             ▼
[4. Automated Regression Tests]     ──► `npx vitest run`, `npx tsc --noEmit`
             │
             ▼
[5. Owner Approval & Production Deployment]
```

---

## 7. Unanswered Engineering Questions Backlog Register (Step 142)

When an engineering query cannot be definitively answered using public manufacturer datasheets without laboratory or site testing, **we explicitly do not invent or extrapolate the answer**. The query is logged in this backlog until OEM engineering clearance is obtained:

| Backlog ID | Engineering Query | Category | Reason Deferred | Action Required | Status |
|---|---|---|---|---|---|
| **GAP-001** | Continuous ampacity of 185 sqmm XLPE cable installed in vertical non-ventilated shaft | Wires & Cables | Derating factors vary widely based on chimney airflow and tray spacing per IS 3961 | Awaiting Polycab factory lab application note on vertical risers | Pending OEM Input |
| **GAP-002** | Trefoil fault spacing calculation for 33kV 1C 630 sqmm cables under 40kA 3-second fault | Wires & Cables | Short-circuit dynamic force requires cleat manufacturer certified test certificate | Sourcing certified cleat spacing charts from Erico / Raychem | In Progress |
| **GAP-003** | Dielectric breakdown degradation of XLPE cables submerged in saline coastal soil (Dahej/Mundra) | Wires & Cables | Standard IS 7098 does not quantify saline chemical corrosion without lead sheath | Consult KEI technical engineering division on specialized chemical barriers | Pending Review |
| **GAP-004** | Direct DC breaking capacity derating for standard AC miniature circuit breakers (MCBs) | Switchgear | AC MCB arc chute magnetic blowouts are not rated for bidirectional DC arcing without OEM test data | Direct all buyers to dedicated 1000V DC rated solar isolators & breakers | Answered via Policy |
| **GAP-005** | Soil resistivity thermal runaway limits for bentonite vs chemical moisture-retaining compounds | Earthing | Regional soil conductivity variations across Kutch arid zones require on-site 4-point Wenner testing | Documented disclaimer that chemical compound volumes require site soil testing | Documented via Guide |

---

*Approved by Volamp Engineering Standards Committee & Commercial Governance Team.*

