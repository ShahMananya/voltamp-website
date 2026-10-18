import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { VOLAMP_JOB_ROLES } from "@shared/careersData";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, type Tool, type Message } from "./_core/llm";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { dispatchOtpEmail } from "./services/emailService";
import {
  approveEmployee,
  createLocalUser,
  createQuotation,
  createSupportTicket,
  generate6DigitOtp,
  getCustomerPortal,
  getEmployeeDashboardData,
  getUserByEmail,
  getUserById,
  saveOtp,
  updateUser,
  upsertCustomerProfile,
  verifyOtp,
  verifyPassword,
  hashPassword,
  generateSalt,
  createQuickOrder,
  getQuickOrders,
  getQuickOrderById,
  updateQuickOrderStatus,
  getFootprintOverview,
  getFootprintStates,
  getFootprintProjectsByState,
  getFootprintProjectById,
  getLeadershipData,
  updateCeoProfile,
  updateTeamMember,
  trackConsignmentOrder,
  subscribeNewsletter,
  createCollaborateSubmission,
  getCollaborateSubmissions,
  getCollaborateSubmissionById,
  createComplaintRecord,
  getComplaints,
  getComplaintByCaseId,
  createPressInquiryRecord,
  getPressInquiries,
  getPressInquiryById,
  createEnquiry,
  getEnquiries,
  getEnquiryByNumber,
  createCareerApplication,
  getCareerApplications,
  getCareerApplicationById,
} from "./db";
import {
  dispatchCollaborationEmails,
  dispatchGrievanceEmails,
  dispatchPressEmails,
} from "./services/emailService";
import { parseVoiceOrderText } from "./services/voiceOrderParser";
import { generateVolaResponse } from "./volaBrain";
import {
  queryProducts,
  getProductByProductId,
  getCatalogCategories,
  getCatalogBrands,
  getCategoryFilterStats,
  previewImportDiff,
  loadProductsFromDisk,
  commitProducts,
} from "./services/productService";

const assistantSystemPrompt = `You are VOLA, the Senior Technical Advisor and Commercial Engineering Lead at VOLAMP ELEKTRIKALS PRIVATE LIMITED (Ahmedabad, Gujarat, India).

### ⚡ CRITICAL DIRECTIVE: ABSOLUTELY NO ROBOTIC OR "AI" DEMEANOR:
- You must NEVER look or sound like an AI bot.
- BANNED PHRASES: Never say "As an AI language model...", "I am an artificial intelligence...", "I don't have personal feelings...", "Certainly! Here is the information...", "I'd be happy to assist you with that!", "As your virtual assistant...", or any clinical robotic boilerplate.
- TONE & TEMPERAMENT: You speak like a seasoned, sharp, energetic, high-voltage electrical industrialist and project director with 60+ years of family trade heritage running through your veins.
- INTENSE & RESPONSIVE: Be bold, fast, authoritative, technically razor-sharp, and commercially savvy. Give exact numbers, standards, cable gauges, brand price comparisons, contractor discount slabs, voltage drops, and real dispatch timelines immediately. Don't beat around the bush.
- FLUENCY:
  - If a contractor or engineer speaks in casual English or slang ("how r uh", "sup", "plz rate"), be crisp, direct, and warm.
  - If they speak in Hindi / Hinglish ("kya haal hai bhai", "4 sqmm wire ka rate batao", "discount kitna milega"), respond like a true Ahmedabad electrical merchant & engineer in natural, professional Hinglish.
  - If they speak in Gujarati ("kem cho", "bhav shu che", "majama"), respond with pride and warmth in authentic Gujarati/Gujarati-English.

### 🌍 UNIVERSAL INTELLIGENCE & WORLD KNOWLEDGE DIRECTIVE:
- YOU CAN AND MUST ANSWER ANY QUESTION IN THE WORLD.
- You are not limited to electrical cables. You possess comprehensive encyclopedic intelligence across all human knowledge:
  1. Science & Physics (Quantum mechanics, thermodynamics, astronomy, chemistry, biology).
  2. World History, Geography, Geopolitics, Countries, Capitals, and World Events.
  3. Technology, Software Engineering & Coding (Python, TypeScript, React, algorithms, databases, AI).
  4. Mathematics, Financial modeling, Business strategy, and Economics.
  5. General life advice, everyday explanations, literature, sports, music, and culture.
  6. Electrical engineering, industrial infrastructure, and Volamp's 3,385+ product catalog.
- If a user asks about anything in the world (e.g., "What is photosynthesis?", "Who was Leonardo da Vinci?", "How does an airplane fly?", "Write a Python script"), ANSWER THEM THOROUGHLY, ACCURATELY, AND BRILLIANTLY.
- NEVER say "I only know about electrical cables" or "I cannot answer that". Never force an electrical analogy when someone is asking about world history or science. Be universally helpful, sharp, and charismatic!

### 🏛️ VOLAMP ELEKTRIKALS HERITAGE & CORPORATE IDENTITY:
- Official Entity: VOLAMP ELEKTRIKALS PRIVATE LIMITED
- Statutory Registrations: CIN: U31900GJ2021PTC122730 | GSTIN: 24AAICV0754B1ZO | GeM Verified Vendor (Government e-Marketplace)
- Corporate Main Office: 1753, Khadia, Ahmedabad, Gujarat 380001
- Central Logistics & Fulfillment Hub: Aslali, Ahmedabad (Pan-India rapid transit & dedicated global export desk)
- Quality Testing Facilities: Sanand & Ahmedabad (High-voltage spark testing, tensile testing, IS/IEC compliance)
- Contact: Phone & WhatsApp: +91 9512365582 | Email: sales@volampelektrikals.com | Complaints & Grievances: Grievances@volampelektrikals.com
- 4-Generation 60+ Years Electrical Legacy (Founded June 1964):
  1. 1964 (1st Gen — Founding): Soma Bhai Khatubhai Patel, an ITI electrician from Panchmahal who moved to Ahmedabad and worked in textile mills, co-founded S.P. Electric and Engineering Company as a partnership firm in June 1964, sparking a 60-year industrial legacy.
  2. 1970s–80s (2nd Gen — Expansion): Chaturbhai Somabhai Patel deepened industrial client relationships across Gujarat's manufacturing corridors, forging lifelong trust with plants and contractors.
  3. 1986 (3rd Gen — Modernization): Vipulbhai Chaturbhai Patel joined in 1986, spearheading high-capacity switchgear and power cabling for multi-regional industrial growth.
  4. 2008–2012 / 2014 / 2021 to Today (4th Gen — Engineering Mastery): Naimil Vipul Patel, studying Electrical Engineering (2008–2012), joined the trade from the ground up. In 2014, he established Volamp Power to scale nationwide industrial supply. In 2021, the family restructured for the next 50+ years, incorporating Volamp Elektrikals Private Limited.
- CEO Statement — Naimil Patel:
  "Saath Milkar Growth Ki Ek Nayi Pehchaan Banayein"
  "Koi bhi company sirf products se nahi banti — company banti hai INSAN, unki mehnat, commitment aur customer ke trust se. Hamara focus sirf business grow karna nahi, balki trust, quality aur strong relations build karna hai."
  Motto: "Together, Let's Power the Growth. Together, Let's Build Volamp and India."
- Core Leadership Team:
  - Naimil Patel — Chief Executive Officer
  - Roshni Shroff — Sales & Client Solutions
  - Pooja Thakor — Sales & Client Solutions
  - Pooja Patel — Sales & Client Solutions
  - Jinay Patel — Sales & Switchgear Sourcing Specialist
  - Dhaval Rana — Finance & Accounts Manager
  - Montu Patil — Logistics & Operations Manager

### 🏢 COMPLETE 10 BUSINESS SEGMENTS (POWERING NATION-BUILDING INFRASTRUCTURE):
1. EPC & Infrastructure:
   - Target: Highways, Metro Rail, Airports, Smart Cities, Bridge electrification.
   - Supplies: 1.1kV & 11kV/33kV XLPE Armoured Cables (A2XWY, 2XWY), Perforated GI Cable Trays, Trefoil Cleats, Chemical Earthing Electrodes, Lightning Protection.
   - Standards: IS 7098 (Part 1 & 2), CPRI / ERDA Tested, MTC with every drum.
2. Heavy Industry & Manufacturing:
   - Target: Chemical plants, Pharma hubs, Steel mills, Cement plants, Automobile manufacturing.
   - Supplies: VFD Shielded Motor Power Cables, Heat-Resistant Silicon Rubber Wires, Air Circuit Breakers (ACB up to 4000A), Motor Protection Circuit Breakers (MPCB).
   - Standards: IS 1554 / IS 694, Flame-Retardant Low Smoke (FRLS), Class 5 high-flex copper.
3. Commercial & Real Estate:
   - Target: Commercial towers, IT parks, shopping malls, high-rise residential townships.
   - Supplies: Zero-Halogen (ZHFR / LSZH) Building Wires, Distribution Boards (SPN, TPN, Vertical DBs), Multi-Function Digital Energy Meters, Underfloor Trunking & Ducts.
   - Standards: NBC 2016 Compliant, IS 694 Certified, Green Building Approved.
4. Solar & Renewable Energy:
   - Target: Utility-scale solar farms, commercial rooftop solar, Battery Energy Storage Systems (BESS).
   - Supplies: 1.5 kV DC Solar PV Cables (EN 50618 / TÜV certified), MC4 IP68 connectors, Array Junction Boxes (AJB / SMB), 1000V/1500V DC Isolators, DC SPDs.
   - Specs: UV & ozone resistant electron-beam XLPO, tinned copper conductors, 25+ year outdoor life.
5. Power Utilities & Sub-stations:
   - Target: State DISCOMs, transmission grids, step-down substations (11kV / 33kV / 66kV).
   - Supplies: EHV & HT Underground Power Feeders, Electrolytic Copper & Aluminium Busbars, Current & Potential Transformers (CT/PT), Lightning Arresters, Gang Operated Air Break (GOAB) switches.
   - Standards: IS 7098 Part 2, IEC 60502, Third-Party Inspection Agency (TPIA) cleared.
6. Panel Builders & OEMs:
   - Target: LV/MV switchboard fabricators, Motor Control Centers (MCC), automation panel builders.
   - Supplies: Tri-Rated UL Flexible Control Wires, Power Contactors (9A to 800A), Thermal Overload Relays, Push Buttons & LED Indicators, DIN-Rail Terminals, Ferrules.
   - Standards: IS 13947 / IEC 60947, CE / UL component grades.
7. Government, Defense & PSUs:
   - Target: Indian Railways, CPWD, Military Engineer Services (MES), Defense projects, GeM supply.
   - Supplies: RDSO Railway Signaling Cables, Heavy-Duty Weatherproof Feeder Pillars, GeM Approved DBs, Flameproof Ex d IIC Junction Boxes.
   - Certifications: GeM Verified OEM/Reseller, RDSO & MES Compliant, comprehensive tender bid support.
8. Electrical Distribution & Control:
   - Target: Sub-distribution networks, industrial shop-floors, factory machine feeds.
   - Supplies: Compact Busbar Trunking Systems (BBT), Automatic Power Factor Correction (APFC) panels, Type 1+2 Surge Protective Devices (SPD).
9. EV Charging Infrastructure:
   - Target: Public EV charging stations, commercial fleet depots, residential charger points.
   - Supplies: High-ampacity EV charging cables, Type 2 connectors, dedicated EV sub-distribution boards with built-in Type B RCDs, IP66 weatherproof housings.
10. Electrical Panels & Automation:
    - Target: Turnkey industrial automation, SCADA systems, process machinery.
    - Supplies: Custom Power Control Centers (PCC), Motor Control Centers (MCC), AMF/ATS automatic transfer panels, PLCs, Variable Frequency Drives (VFDs).

### 💰 TRANSPARENT PRICING, COSTS & CONTRACTOR DISCOUNT STRUCTURE:
- Database Catalog: 3,385+ live products, all priced with active contractor discount slabs!
- How Volamp Pricing Works:
  - List Price / MRP: Manufacturer published baseline price (Polycab, Finolex, KEI, Schneider, LK/L&T).
  - Wholesale Contractor Discount:
    - Direct **40% OFF** across our entire catalog as listed on the website!
    - Wires & Cables (2,856 Products): 40% off standard manufacturer list prices (Polycab, Finolex, KEI, Volamp).
    - Switchgear & Protection (221 Products): 40% off list prices on Schneider Electric, LK (L&T), and Legrand.
    - Conduits, Glands, Lugs, Earthing & Solar: 40% off list prices.
    - Wholesale Net = List Price minus 40% Contractor Discount.
  - Tax Structure: 18% GST (CGST 9% + SGST 9% for Gujarat; IGST 18% for interstate). Volamp provides full GST input tax credit tax invoices.
  - Packaging Economics:
    - House wires: 90m, 180m, and 300m shrink-wrapped coils.
    - Industrial power cables: Cut-to-length reels or continuous 500m / 1,000m heavy wooden drums (flange diameter 1.2m to 1.8m with tare weight factored).
  - Commercial Payment Terms:
    - Direct NEFT / RTGS bank transfer to corporate account.
    - 30-Day Corporate Credit available for verified contractors, OEMs, and institutions with valid GSTIN and approved Purchase Order (PO).
    - WhatsApp Digital Proforma Invoice with instant online settlement.
  - Dispatch & Freight Policy (VEP/LOG/001):
    - Dispatches within 24–48 hours from Ahmedabad fulfillment center.
    - Loading at Volamp depot handled 100% free by Volamp.
    - Standard transit insurance provided on every shipment. Destination unloading is customer responsibility.
  - Return & Cancellation Policy:
    - Custom cut / spooled cables are final sale once processed.
    - 24-hour cancellation window before cutting/dispatch.
    - 48-hour inspection window for damaged/defective consignments with 100% replacement freight covered by Volamp.

### 🔌 LIVE PRODUCT CATALOG KNOWLEDGE (3,385+ PRODUCTS ACROSS 8 CATEGORIES):
You can invoke the 'search_products', 'get_product_details', and 'list_categories' tools to query exact live SKUs, discounts, and prices!
1. Wires & Cables (2,856 items): Polycab, KEI, Finolex, Volamp. Single core building wires (0.5 to 16 sqmm FR/FRLS/ZHFR), Multicore flexible (2C to 24C), LT Armoured XLPE/PVC (Aluminium & Copper, 4 to 630 sqmm, IS 7098/1554), HT 11kV/33kV, Submersible 3-core flat (1.5 to 35 sqmm), Solar PV 1500V DC, CCTV 3+1/4+1, RG-59, RG-6, Cat6.
2. Switchgear & Protection (221 items): Schneider Electric, LK (L&T), Legrand, Volamp. MCBs (0.5A to 63A, 6kA/10kA, B/C/D curve, SP/DP/TP/4P), MCCBs (16A to 1250A, 25kA/36kA/50kA, 3P/4P), RCCBs/RCBOs (30mA human shock, 100mA/300mA fire), Isolators (40A to 125A), Power Contactors (9A to 800A AC-3), Overload Relays, Changeovers, SDF, SPN/TPN Distribution Boards.
3. Lugs & Terminals (14 items): Volamp, Dowells, Comet. Ring, Pin, Fork/Spade, Tubular crimping lugs (Copper & Aluminium), Bimetallic friction-welded lugs (Cu-Al).
4. Conduit & Piping (93 items): Volamp, Precision, VIP. Rigid uPVC (LMS, MMS, HMS conforming to IS 9537 Part 3 in 20mm, 25mm, 32mm, 40mm, 50mm in 3m lengths), Non-IS Classic/Super, uPVC Casing & Capping profiles, PP Corrugated Flexible Conduits.
5. Cable Glands (90 items): Volamp, Comet, Raychem. Brass Single Compression, Double Compression Heavy-Duty MD (IP66/IP67 weatherproof), Flameproof Ex d IIC (hazardous chemical/refinery), Metric M16 to M100, PG, NPT threads with shrouds, locknuts, earth tags.
6. Wiring Devices & Tools (14 items): Legrand, Schneider, Anchor, Volamp. Switches, sockets (6A, 16A, 25A), Industrial plugs/sockets (16A to 63A IP44/IP67), PVC insulation tape (600V), ratchet crimpers, digital clamp meters, megohm testers, high-voltage rubber gloves (Class 0/1/2).
7. Earthing & Grounding (37 items): Volamp, True Power, Ashlok. Copper-bonded earthing rods (14mm, 17.2mm, 25mm dia, 2m/3m lengths, 100-250 microns copper), Pipe-in-pipe chemical electrodes, Carbonaceous backfill compound (25kg bags, < 0.2 Ω·m, IS 3043:2018), GI strips (25x3 to 50x6 mm), Copper strips, FRP/RCC chambers.
8. Solar Electrical (60 items): Polycab, KEI, Volamp, Waaree. 1500V DC Solar PV Cables (EN 50618/TÜV, XLPO, tinned copper, 4/6/10 sqmm Red & Black, 25+ yr life), Mono PERC & TopCon bifacial solar panels (540W to 670W), on-grid string inverters (3kW to 100kW), MC4 IP68 connectors, 1000V/1500V DC fuses, Array Junction Boxes (AJB).

### 📐 TECHNICAL SIZING & CALCULATOR INTELLIGENCE:
- 3-Phase 415V full load current: I = (kW × 1000) / (√3 × 415 × PF) (with PF = 0.85 standard).
- 1-Phase 230V current: I = (kW × 1000) / (230 × PF).
- Quick Sizing Reference (3-Phase 415V, 0.85 PF):
  • 3.7 kW (5 HP)  -> 7.2A  -> 2.5 sqmm Cu / 4 sqmm Al (Breaker: 16A)
  • 7.5 kW (10 HP) -> 14.1A -> 4 sqmm Cu / 10 sqmm Al (Breaker: 25A)
  • 15 kW (20 HP)  -> 27.5A -> 10 sqmm Cu / 16 sqmm Al (Breaker: 40A)
  • 22 kW (30 HP)  -> 40.0A -> 16 sqmm Cu / 25 sqmm Al (Breaker: 63A)
  • 30 kW (40 HP)  -> 54.5A -> 25 sqmm Cu / 35 sqmm Al (Breaker: 80A)
  • 45 kW (60 HP)  -> 81.5A -> 35 sqmm Cu / 70 sqmm Al (Breaker: 125A)
  • 75 kW (100 HP) -> 135A  -> 70 sqmm Cu / 120 sqmm Al (Breaker: 200A)
  • 110 kW (150 HP)-> 196A  -> 120 sqmm Cu / 185 sqmm Al (Breaker: 315A)
  • 160 kW (215 HP)-> 284A  -> 185 sqmm Cu / 300 sqmm Al (Breaker: 400A)
- Voltage Drop Limit: Must stay ≤ 3% for lighting and ≤ 5% for industrial power feeders as per IS/NEC standards.
- Conductor Selection:
  • Copper: 100% IACS conductivity, superior tensile strength, zero loose joint oxidation. Essential for building wires, flexible cords, and compact switchboards.
  • Aluminium: 61% IACS conductivity, 3x lighter, requires ~1.6x cross-sectional area of Copper, highly economical for long-distance industrial feeder runs (16 sqmm to 630 sqmm). Always use bimetallic lugs when terminating on copper busbars.
  • XLPE vs PVC: XLPE operates at 90°C continuous (250°C short circuit), delivering ~20% higher ampacity than PVC (70°C).
  • FR vs FRLS vs ZHFR: ZHFR (Zero Halogen) produces < 0.5% acid gas, mandatory for hospitals, metro rail, airports, and IT data centers.

### ⚡ FAST ORDER TAKING & TRACKING:
- Take orders proactively: Gather 1) Products & Quantities, 2) Customer Name, 3) Phone Number, 4) Delivery Location (City/Pincode).
- Once gathered, invoke the 'place_order' tool immediately to register the order in the database!
- After placement, provide the QO-2026-XXXXX Order Reference ID, itemized table, dispatch next steps, and a direct WhatsApp link to the Ahmedabad supply desk (+91 9512365582).
- When a customer provides an Order ID to track, invoke 'lookup_order' to give them live status!

### 🛑 CRITICAL AI RULE & FAQ ANSWER BANK (VOLAMP SALES CALL AGENT):
The AI agent should NEVER invent a price, stock quantity, delivery date, discount, technical specification, credit limit, or commitment.
If the required information is not available in the system, the AI MUST say:
"Let me have our sales team confirm that for you. I don’t want to give you incorrect information."

#### 1. COMPANY & PRODUCT RANGE:
- Volamp Elektrikals Pvt. Ltd. is a supplier and distributor of electrical cables, wires and related electrical products for industrial, commercial and other applications.
- Products: Power cables, control cables, flexible cables, shielded cables, armoured and unarmoured cables, FRLS cables, XLPE cables, copper and aluminium cables, along with switchgear products (MCBs, MCCBs).
- Brands: Reputed brands including Polycab, Finolex, KEI, Havells, Schneider Electric, Legrand, LK (subject to product availability and customer requirement).
- Business Types: Industrial, commercial, contractors, traders, OEMs, and government/EPC clients. Both bulk and small quantities handled.

#### 2. ORDER, DISPATCH & LOGISTICS:
- Delivery Timings & Dispatch Cutoff: Orders placed between 8:00 AM and 5:30 PM are considered for delivery/dispatch as per availability and logistics feasibility. Orders after 5:30 PM are generally handled for pickup or subsequent dispatch.
- Same-day dispatch may be possible when required stock is available in our warehouse and order is received within the dispatch window.
- B2B Delivery Timeline: For available stock, B2B delivery generally takes around 1–3 days depending on location and logistics.
- Warehouse: Our warehouse is separate from our office. Customer pickup can be arranged after order confirmation.
- Direct-to-site / Outside-city deliveries: Feasible depending on order size and location.

#### 3. COMMERCIAL, PAYMENT & CREDIT:
- Payment Methods: Direct NEFT/RTGS, advance payment, and approved corporate credit.
- Credit Policy: Credit facilities are subject to customer eligibility, credit assessment, and company limits. New customer credit purchases require credit approval; advance payment is available as an alternative. PDC accepted under approved credit terms only.
- Quotation Validity & Taxes: Quotations specify tax treatment (standard 18% GST with 100% ITC). Price validity depends on raw metal indices (copper/aluminium rates).

#### 4. QUALITY & AUTHENTICITY:
- 100% genuine products sourced from established manufacturers and authorized channels.
- Manufacturer Test Certificates (MTC), datasheets, and ISI/BIS compliance documentation provided with applicable orders.

#### 5. OBJECTION HANDLING:
- "Why buy from you instead of IndiaMART?": IndiaMART is a directory connecting suppliers; Volamp directly handles quotation, stock availability, quality verification, GST invoicing, and fulfillment under our own supply warranty.
- "I already have a supplier": We can remain an additional supply option whenever you need better availability, an alternative brand, urgent material, or competitive pricing.
- "Your price is high / Competitor has lower price": Cable prices vary by brand, specification, metal rates, freight, and terms. Request competitor quotation details so our sales team can review whether we can offer a more competitive option.

#### 6. WHEN THE AI MUST ESCALATE (20 SCENARIOS):
The AI must NEVER resolve these independently:
1. Customer asks for a price not available in the database.
2. Customer asks for a special discount or negotiation.
3. Customer wants to negotiate price.
4. Customer requests credit beyond approved limits.
5. Customer disputes an invoice.
6. Customer claims shortage/damage.
7. Customer claims defective material.
8. Customer requests product replacement.
9. Customer asks for technical approval/design certification.
10. Customer asks for exact ampacity where required installation conditions are unknown.
11. Customer asks for legal/compliance certification not available in the database.
12. Customer wants to cancel an already processed or dispatched order.
13. Customer wants to return cut or specially processed cable.
14. Customer has an urgent project requiring immediate unverified stock confirmation.
15. Customer asks for a delivery commitment that cannot be verified.
16. Customer is angry or threatening.
17. Customer asks for management intervention (CEO/Director).
18. Customer asks for a customized commercial arrangement.
19. Customer asks for a competitor price match.
20. Customer requests something outside standard company policy.

Recommended Escalation Response:
"I understand your requirement. This needs confirmation from our sales team, and I don’t want to give you incorrect information. I’ll arrange for the concerned salesperson to get in touch with you."

#### 7. STATEMENTS THE AI MUST NEVER SAY:
❌ "We have 500 metres in stock."
❌ "I can give you 15% discount."
❌ "The price is ₹X." (unless verified in live database)
❌ "Your material will definitely arrive tomorrow."
❌ "Your credit limit is ₹10 lakh."
❌ "This cable is definitely suitable for your load."
❌ "We guarantee this product will work for your application."
❌ "I have approved your credit."
❌ "I have approved your discount."
❌ "Your replacement is confirmed."
❌ "Your refund is confirmed."
Unless these details are available from a connected live system or explicitly approved by the sales team.
`;

const aiTools: Tool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search the Volamp live catalog of 3,385+ electrical products by keyword, category, brand, size, or conductor material to retrieve live SKUs, prices, discounts, and specs.",
      parameters: {
        type: "object",
        properties: {
          search: {
            type: "string",
            description: "Keyword search string (e.g. '4 sqmm copper', 'polycab frls', 'schneider mccb', 'double compression 25mm')",
          },
          category: {
            type: "string",
            description: "Optional product category: 'Wires & Cables', 'Switchgear', 'Lugs', 'Conduit', 'Glands', 'Wiring Devices', 'Earthing Wires', 'Solar'",
          },
          brand: {
            type: "string",
            description: "Optional brand filter: 'Polycab', 'Kei', 'Finnolex', 'SCHNIEDER', 'LK', 'LEGRAND', 'Volamp'",
          },
          limit: {
            type: "number",
            description: "Maximum number of items to return (default 5, max 10)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description:
        "Fetch detailed technical specifications, pricing, stock, and SKU for a specific Volamp product by Product ID or SKU.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "Product ID (e.g. 'CAB-000001') or SKU (e.g. 'SKU-CAB-000001-POLYCAB')",
          },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_categories",
      description:
        "Get a summary of all 8 product categories on Volamp with live item counts, subcategories, and available brands.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "place_order",
      description:
        "Place and register a customer order or quotation with Volamp Elektrikals once customer name, phone, delivery location, and items with quantities are provided.",
      parameters: {
        type: "object",
        properties: {
          customerName: {
            type: "string",
            description: "Customer's full name",
          },
          phone: {
            type: "string",
            description: "Customer's 10-digit phone number or mobile number",
          },
          location: {
            type: "string",
            description: "Delivery destination city, state, or pincode",
          },
          items: {
            type: "array",
            description: "List of items, cables, or products with quantities",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description:
                    "Cable, wire, or product description (e.g. '4 sqmm 3-Core Copper Armoured Cable')",
                },
                quantity: {
                  type: "number",
                  description:
                    "Quantity (number of meters, coils, rolls, or units)",
                },
              },
              required: ["name", "quantity"],
            },
          },
          companyName: {
            type: "string",
            description: "Optional company or business name",
          },
          email: {
            type: "string",
            description: "Optional customer email address",
          },
          notes: {
            type: "string",
            description:
              "Optional additional notes, special cutting requests, or payment preference",
          },
        },
        required: ["customerName", "phone", "location", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_order",
      description:
        "Lookup the status and details of an existing Volamp order by its Order ID (e.g. QO-2026-12345).",
      parameters: {
        type: "object",
        properties: {
          quickOrderId: {
            type: "string",
            description: "The order reference ID, e.g. QO-2026-12345",
          },
        },
        required: ["quickOrderId"],
      },
    },
  },
];

const profileInput = z.object({
  fullName: z.string().trim().min(2).max(160),
  mobile: z.string().trim().max(32).optional(),
  companyName: z.string().trim().max(180).optional(),
  gstin: z.string().trim().max(32).optional(),
  address: z.string().trim().max(2000).optional(),
  state: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  pinCode: z.string().trim().max(12).optional(),
  customerType: z.enum(["individual", "contractor", "dealer", "distributor", "business"]),
  preferredCommunication: z.enum(["email", "phone", "whatsapp"]),
  deliveryInstructions: z.string().trim().max(2000).optional(),
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email(),
          password: z.string().min(1, "Password is required"),
          rememberMe: z.boolean().optional(),
          expectedAccountType: z.enum(["customer", "employee"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const user = await getUserByEmail(normalizedEmail);

        if (!user || !user.passwordHash || !user.passwordSalt) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email address or password.",
          });
        }

        const validPassword = verifyPassword(input.password, user.passwordHash, user.passwordSalt);
        if (!validPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email address or password.",
          });
        }

        // Account type check if specified from tab
        if (input.expectedAccountType && user.accountType !== input.expectedAccountType) {
          if (input.expectedAccountType === "employee") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "This account is registered as a Customer. Please use Customer Login.",
            });
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "This is an official Employee account. Please use Employee Login.",
            });
          }
        }

        // Check employee approval status
        if (user.accountType === "employee") {
          if (user.employeeStatus === "pending_approval") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Your employee account is pending administrator approval.",
            });
          }
          if (user.employeeStatus === "rejected") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Your employee registration was not approved.",
            });
          }
        }

        // MFA Enforcement:
        // Employees: strictly required.
        // Customers: required if mfaEnabled is set on the account.
        const isMfaRequired = user.accountType === "employee" || Boolean(user.mfaEnabled);

        if (isMfaRequired) {
          const otp = generate6DigitOtp();
          saveOtp(user.email ?? normalizedEmail, otp, "mfa", 5 * 60 * 1000);
          await dispatchOtpEmail(user.email ?? normalizedEmail, otp, "mfa");
          const mfaPendingToken = await sdk.createMfaPendingToken(
            user.email ?? normalizedEmail,
            user.accountType
          );

          // Return MFA challenge without issuing session cookie
          return {
            mfaRequired: true as const,
            mfaPendingToken,
            email: user.email,
            accountType: user.accountType,
          };
        }

        // Direct session issuance for customers with MFA disabled
        const expiresInMs = input.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const sessionToken = await sdk.createSessionToken(user.openId, {
          expiresInMs,
          name: user.name || user.email || "",
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: expiresInMs });
        await updateUser(user.id, { lastSignedIn: new Date() });

        return {
          mfaRequired: false as const,
          user,
        };
      }),

    verifyMfaOtp: publicProcedure
      .input(
        z.object({
          mfaPendingToken: z.string(),
          code: z.string().trim().length(6, "Verification code must be 6 digits"),
          rememberMe: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const payload = await sdk.verifyMfaPendingToken(input.mfaPendingToken);
        if (!payload) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "MFA challenge expired or invalid. Please log in again.",
          });
        }

        const valid = verifyOtp(payload.email, input.code, "mfa");
        if (!valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification code. Please check and try again.",
          });
        }

        const user = await getUserByEmail(payload.email);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User account not found.",
          });
        }

        const expiresInMs = input.rememberMe ? 30 * 24 * 60 * 60 * 1000 : ONE_YEAR_MS;
        const sessionToken = await sdk.createSessionToken(user.openId, {
          expiresInMs,
          name: user.name || user.email || "",
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: expiresInMs });
        await updateUser(user.id, { lastSignedIn: new Date() });

        return {
          success: true as const,
          user,
        };
      }),

    resendMfaOtp: publicProcedure
      .input(z.object({ mfaPendingToken: z.string() }))
      .mutation(async ({ input }) => {
        const payload = await sdk.verifyMfaPendingToken(input.mfaPendingToken);
        if (!payload) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "MFA session expired. Please start login again.",
          });
        }
        const otp = generate6DigitOtp();
        saveOtp(payload.email, otp, "mfa", 5 * 60 * 1000);
        await dispatchOtpEmail(payload.email, otp, "mfa");
        return { success: true as const };
      }),

    registerEmployee: publicProcedure
      .input(
        z.object({
          name: z.string().trim().min(2, "Name must be at least 2 characters"),
          email: z.string().trim().email("Please enter a valid email address"),
          password: z.string().min(6, "Password must be at least 6 characters"),
        })
      )
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();

        // STRICT BACKEND ENFORCEMENT:
        // Must end with @volampelektrikals.com
        if (!normalizedEmail.endsWith("@volampelektrikals.com")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Employee registration requires an official VOLAMP email address ending in @volampelektrikals.com.",
          });
        }

        const existing = await getUserByEmail(normalizedEmail);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this official email already exists.",
          });
        }

        const newUser = await createLocalUser({
          name: input.name,
          email: normalizedEmail,
          password: input.password,
          accountType: "employee",
          employeeStatus: "pending_approval",
          mfaEnabled: true,
          emailVerified: false,
        });

        const otp = generate6DigitOtp();
        saveOtp(normalizedEmail, otp, "email_verification", 15 * 60 * 1000);
        await dispatchOtpEmail(normalizedEmail, otp, "registration");

        return {
          success: true as const,
          email: newUser.email,
        };
      }),

    registerCustomer: publicProcedure
      .input(
        z.object({
          name: z.string().trim().min(2, "Name must be at least 2 characters"),
          email: z.string().trim().email("Please enter a valid email address"),
          password: z.string().min(6, "Password must be at least 6 characters"),
        })
      )
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();

        const existing = await getUserByEmail(normalizedEmail);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this email already exists.",
          });
        }

        const newUser = await createLocalUser({
          name: input.name,
          email: normalizedEmail,
          password: input.password,
          accountType: "customer",
          employeeStatus: "approved",
          mfaEnabled: false,
          emailVerified: false,
        });

        const otp = generate6DigitOtp();
        saveOtp(normalizedEmail, otp, "email_verification", 15 * 60 * 1000);
        await dispatchOtpEmail(normalizedEmail, otp, "registration");

        return {
          success: true as const,
          email: newUser.email,
        };
      }),

    resendEmailVerificationOtp: publicProcedure
      .input(z.object({ email: z.string().trim().email() }))
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const user = await getUserByEmail(normalizedEmail);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Account not found for this email address.",
          });
        }
        if (user.emailVerified) {
          return {
            success: true as const,
            alreadyVerified: true as const,
          };
        }
        const otp = generate6DigitOtp();
        saveOtp(normalizedEmail, otp, "email_verification", 15 * 60 * 1000);
        await dispatchOtpEmail(normalizedEmail, otp, "registration");
        return {
          success: true as const,
          alreadyVerified: false as const,
        };
      }),

    verifyEmailOtp: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email(),
          code: z.string().trim().length(6, "Verification code must be 6 digits"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const valid = verifyOtp(normalizedEmail, input.code, "email_verification");
        if (!valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification code.",
          });
        }

        const user = await getUserByEmail(normalizedEmail);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User account not found.",
          });
        }

        await updateUser(user.id, { emailVerified: true });

        if (user.accountType === "employee") {
          return {
            success: true as const,
            accountType: "employee" as const,
            status: "pending_approval" as const,
            message:
              "Your official email has been verified. Your account is now pending administrator approval before access to the employee portal is granted.",
          };
        }

        // For customer, immediately activate session
        const sessionToken = await sdk.createSessionToken(user.openId, {
          expiresInMs: ONE_YEAR_MS,
          name: user.name || user.email || "",
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true as const,
          accountType: "customer" as const,
          status: "active" as const,
          user,
        };
      }),

    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().trim().email() }))
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const user = await getUserByEmail(normalizedEmail);
        if (!user) {
          // Prevent email enumeration while still reporting success
          return { success: true as const };
        }
        const otp = generate6DigitOtp();
        saveOtp(normalizedEmail, otp, "password_reset", 15 * 60 * 1000);
        await dispatchOtpEmail(normalizedEmail, otp, "password_reset");
        return { success: true as const };
      }),

    resetPassword: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email(),
          code: z.string().trim().length(6, "Code must be 6 digits"),
          newPassword: z.string().min(6, "Password must be at least 6 characters"),
        })
      )
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const valid = verifyOtp(normalizedEmail, input.code, "password_reset");
        if (!valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired password reset code.",
          });
        }
        const user = await getUserByEmail(normalizedEmail);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
        }
        const salt = generateSalt();
        const hash = hashPassword(input.newPassword, salt);
        await updateUser(user.id, { passwordHash: hash, passwordSalt: salt });
        return { success: true as const, message: "Password updated successfully." };
      }),

    toggleCustomerMfa: protectedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.accountType === "employee") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "MFA is mandatory for all employee accounts and cannot be disabled.",
          });
        }
        await updateUser(ctx.user.id, { mfaEnabled: input.enabled });
        return { success: true as const, mfaEnabled: input.enabled };
      }),
  }),

  employee: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access restricted to VOLAMP employees.",
        });
      }
      return getEmployeeDashboardData();
    }),

    approveEmployee: protectedProcedure
      .input(z.object({ userId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.accountType !== "employee" || ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only administrator employees can approve employee registrations.",
          });
        }
        const approved = await approveEmployee(input.userId);
        if (!approved) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
        }
        return { success: true as const };
      }),
  }),

  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z
            .array(
              z.object({
                role: z.enum(["system", "user", "assistant"]),
                content: z.string().min(1).max(4000),
              })
            )
            .min(1)
            .max(20),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const conversationMessages: Message[] = [
            { role: "system", content: assistantSystemPrompt },
            ...input.messages.filter((message) => message.role !== "system"),
          ];

          let response = await invokeLLM({
            messages: conversationMessages,
            tools: aiTools,
            toolChoice: "auto",
          });

          const choice = response.choices?.[0];
          const toolCalls = choice?.message?.tool_calls;

          if (toolCalls && toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              if (toolCall.function.name === "place_order") {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  const order = await createQuickOrder({
                    userId: ctx.user?.id ?? null,
                    customerName: args.customerName,
                    companyName: args.companyName ?? null,
                    phone: args.phone,
                    email: args.email || null,
                    location: args.location ?? null,
                    items: Array.isArray(args.items)
                      ? args.items.map((i: any) => ({
                          name: String(i.name || "Electrical Cable"),
                          quantity: Math.max(1, Number(i.quantity) || 1),
                        }))
                      : [{ name: "Electrical Cable", quantity: 1 }],
                    notes: args.notes ?? null,
                  });

                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });

                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "place_order",
                    content: JSON.stringify({
                      success: true,
                      quickOrderId: order.quickOrderId,
                      customerName: order.customerName,
                      items: order.items,
                      location: order.location,
                      status: order.status,
                      instruction: `Order successfully recorded into Volamp system with Reference ID: ${order.quickOrderId}. Confirm this order to the customer with an itemized table, the Order Reference ID, delivery destination, next steps, and a link to WhatsApp (+91 9512365582).`,
                    }),
                  });
                } catch (err: any) {
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "place_order",
                    content: JSON.stringify({
                      success: false,
                      error: err.message || "Failed to register order.",
                    }),
                  });
                }
              } else if (toolCall.function.name === "lookup_order") {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  const order = await getQuickOrderById(args.quickOrderId);
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "lookup_order",
                    content: JSON.stringify(
                      order
                        ? {
                            found: true,
                            quickOrderId: order.quickOrderId,
                            status: order.status,
                            customerName: order.customerName,
                            items: order.items,
                            createdAt: order.createdAt,
                          }
                        : {
                            found: false,
                            message: `Order ${args.quickOrderId} not found in the Volamp system.`,
                          }
                    ),
                  });
                } catch (err: any) {
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "lookup_order",
                    content: JSON.stringify({ found: false, error: err.message }),
                  });
                }
              } else if (toolCall.function.name === "search_products") {
                try {
                  const args = JSON.parse(toolCall.function.arguments || "{}");
                  const result = queryProducts({
                    search: args.search,
                    category: args.category,
                    brand: args.brand,
                    limit: Math.min(10, Math.max(1, args.limit || 5)),
                  });
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "search_products",
                    content: JSON.stringify({
                      totalMatches: result.total,
                      products: result.products.map((p) => ({
                        productId: p.productId,
                        sku: p.sku,
                        name: p.name,
                        brand: p.brand,
                        category: p.category,
                        subcategory: p.subcategory,
                        size: p.size,
                        material: p.material,
                        unit: p.unit,
                        price: p.price,
                        discount: p.discount,
                        discountedPrice: p.discountedPrice,
                        availability: p.availability,
                        moq: p.moq,
                        specifications: p.specifications,
                      })),
                    }),
                  });
                } catch (err: any) {
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "search_products",
                    content: JSON.stringify({ error: err.message, totalMatches: 0, products: [] }),
                  });
                }
              } else if (toolCall.function.name === "get_product_details") {
                try {
                  const args = JSON.parse(toolCall.function.arguments || "{}");
                  const prod = getProductByProductId(args.productId);
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "get_product_details",
                    content: JSON.stringify(
                      prod ? { found: true, product: prod } : { found: false, error: "Product not found" }
                    ),
                  });
                } catch (err: any) {
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "get_product_details",
                    content: JSON.stringify({ found: false, error: err.message }),
                  });
                }
              } else if (toolCall.function.name === "list_categories") {
                try {
                  const categories = getCatalogCategories();
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "list_categories",
                    content: JSON.stringify({ categories }),
                  });
                } catch (err: any) {
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "list_categories",
                    content: JSON.stringify({ error: err.message, categories: [] }),
                  });
                }
              }
            }

            // Follow-up LLM call to generate natural language response after tool execution
            response = await invokeLLM({
              messages: conversationMessages,
            });
          }

          const content = response.choices?.[0]?.message?.content;
          if (typeof content === "string") return content;
          if (Array.isArray(content))
            return content
              .map((part) => ("text" in part ? part.text : ""))
              .join("")
              .trim();
        } catch {
          // If external LLM is unconfigured, offline, or errors, use Vola's smart local engine
        }

        return generateVolaResponse(input.messages, ctx.user?.id);
      }),
  }),

  customer: router({
    portal: protectedProcedure.query(({ ctx }) => getCustomerPortal(ctx.user.id)),
    saveProfile: protectedProcedure
      .input(profileInput)
      .mutation(({ ctx, input }) => upsertCustomerProfile(ctx.user.id, input)),
    requestQuotation: protectedProcedure
      .input(
        z.object({
          productName: z.string().trim().min(2).max(180),
          quantity: z.number().int().positive().max(1000000),
          estimatedTotal: z.number().int().nonnegative().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createQuotation(ctx.user.id, input.productName, input.quantity, input.estimatedTotal)
      ),
    openSupportTicket: protectedProcedure
      .input(
        z.object({
          subject: z.string().trim().min(3).max(180),
          message: z.string().trim().min(3).max(4000),
        })
      )
      .mutation(({ ctx, input }) =>
        createSupportTicket(ctx.user.id, input.subject, input.message)
      ),
  }),

  quickOrder: router({
    submit: publicProcedure
      .input(
        z.object({
          quickOrderId: z.string().trim().max(50).optional(),
          customerName: z.string().trim().min(2, "Customer name is required"),
          companyName: z.string().trim().max(180).optional(),
          phone: z.string().trim().min(5, "Valid phone number is required"),
          email: z.string().trim().email().optional().or(z.literal("")),
          location: z.string().trim().max(200).optional(),
          items: z
            .array(
              z.object({
                productId: z.string().optional(),
                name: z.string().trim().min(1, "Product name is required"),
                brand: z.string().optional(),
                category: z.string().optional(),
                specification: z.string().optional(),
                unit: z.string().optional(),
                unitPrice: z.number().optional(),
                discount: z.number().optional(),
                tax: z.number().optional(),
                finalPrice: z.number().optional(),
                quantity: z.number().int().min(1, "Quantity must be at least 1"),
              })
            )
            .min(1, "At least one valid product is required"),
          notes: z.string().trim().max(2000).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const validItems = input.items.filter(
          (item) => item.name.trim().length > 0 && item.quantity >= 1
        );
        if (validItems.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Quick Order must contain at least one valid product.",
          });
        }
        const order = await createQuickOrder({
          userId: ctx.user?.id ?? null,
          quickOrderId: input.quickOrderId,
          customerName: input.customerName,
          companyName: input.companyName,
          phone: input.phone,
          email: input.email || null,
          location: input.location,
          items: validItems,
          notes: input.notes,
        });
        return {
          success: true as const,
          quickOrderId: order.quickOrderId,
          order,
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType === "employee") {
        return getQuickOrders();
      }
      return getQuickOrders(ctx.user.id);
    }),

    getById: publicProcedure
      .input(z.object({ quickOrderId: z.string() }))
      .query(async ({ input }) => {
        const order = await getQuickOrderById(input.quickOrderId);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quick Order not found.",
          });
        }
        return order;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          quickOrderId: z.string(),
          status: z.enum(["submitted", "under_review", "priced", "quoted", "closed"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.accountType !== "employee") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only VOLAMP employees can update Quick Order status.",
          });
        }
        const updated = await updateQuickOrderStatus(input.quickOrderId, input.status);
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quick Order not found.",
          });
        }
        return { success: true as const, order: updated };
      }),

    parseVoice: publicProcedure
      .input(
        z.object({
          transcript: z.string().trim().min(1, "Please provide voice transcript"),
          language: z.enum(["en-IN", "hi-IN", "gu-IN", "auto"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return parseVoiceOrderText(input.transcript, input.language);
      }),
  }),

  tracking: router({
    byQuery: publicProcedure
      .input(z.object({ query: z.string().trim().min(1, "Order or tracking number is required") }))
      .query(async ({ input }) => {
        return trackConsignmentOrder(input.query);
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email("Please enter a valid email address"),
          phone: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return subscribeNewsletter(input.email, input.phone);
      }),
  }),

  collaborate: router({
    submit: publicProcedure
      .input(
        z.object({
          companyName: z.string().trim().min(2, "Company / Organization name is required"),
          contactName: z.string().trim().min(2, "Your name is required"),
          designation: z.string().trim().min(2, "Designation is required"),
          businessType: z.string().trim().min(1, "Please select your business type"),
          collaborationTypes: z.array(z.string()).min(1, "Please select at least one collaboration type"),
          opportunityDetails: z.string().trim().min(5, "Please share the opportunity you see for Volamp"),
          partnershipStrengths: z.array(z.string()).min(1, "Please select at least one capability you bring"),
          expectedBusinessPotential: z.string().trim().min(1, "Please select expected business potential"),
          expectedTimeline: z.string().trim().min(1, "Please select expected timeline"),
          mobile: z.string().trim().min(7, "Please enter a valid mobile / WhatsApp number"),
          email: z.string().trim().email("Please enter a valid email address"),
          cityCountry: z.string().trim().min(2, "City / Country is required"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const submission = await createCollaborateSubmission(input);

        // Dispatch notification to collab@volampelektrikals.com AND ticket confirmation to user
        dispatchCollaborationEmails({
          applicationId: submission.applicationId,
          companyName: input.companyName,
          contactName: input.contactName,
          designation: input.designation,
          businessType: input.businessType,
          collaborationTypes: input.collaborationTypes,
          opportunityDetails: input.opportunityDetails,
          partnershipStrengths: input.partnershipStrengths,
          expectedBusinessPotential: input.expectedBusinessPotential,
          expectedTimeline: input.expectedTimeline,
          mobile: input.mobile,
          email: input.email,
          cityCountry: input.cityCountry,
          notes: input.notes,
        }).catch((err) => {
          console.error("[COLLABORATE EMAIL ERROR]:", err);
        });

        return {
          success: true as const,
          applicationId: submission.applicationId,
          submission,
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can view collaboration applications.",
        });
      }
      return getCollaborateSubmissions();
    }),

    getById: publicProcedure
      .input(z.object({ applicationId: z.string() }))
      .query(async ({ input }) => {
        const sub = await getCollaborateSubmissionById(input.applicationId);
        if (!sub) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Collaboration application not found.",
          });
        }
        return sub;
      }),
  }),

  complaints: router({
    submit: publicProcedure
      .input(
        z.object({
          fullName: z.string().trim().min(2, "Your full name is required"),
          companyName: z.string().trim().optional(),
          email: z.string().trim().email("Please enter a valid email address for receiving case updates"),
          phone: z.string().trim().min(7, "Please enter a valid mobile or WhatsApp number"),
          caseType: z.string().trim().min(2, "Please select the nature of discrepancy"),
          orderRef: z.string().trim().optional(),
          urgency: z.string().trim().default("standard"),
          details: z.string().trim().min(5, "Please explain the issue or discrepancy"),
        })
      )
      .mutation(async ({ input }) => {
        const record = await createComplaintRecord(input);

        // Drop case to Grievances@volampelektrikals.com AND send ticket confirmation to complainant
        dispatchGrievanceEmails({
          caseId: record.caseId,
          fullName: record.fullName,
          companyName: record.companyName,
          email: record.email,
          phone: record.phone,
          caseType: record.caseType,
          orderRef: record.orderRef,
          urgency: record.urgency,
          details: record.details,
        }).catch((err) => {
          console.error("[GRIEVANCE EMAIL ERROR]:", err);
        });

        return {
          success: true as const,
          caseId: record.caseId,
          complaint: record,
        };
      }),

    getByCaseId: publicProcedure
      .input(z.object({ caseId: z.string() }))
      .query(async ({ input }) => {
        const item = await getComplaintByCaseId(input.caseId);
        if (!item) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Case not found.",
          });
        }
        return item;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can view complaint dossiers.",
        });
      }
      return getComplaints();
    }),
  }),

  press: router({
    submit: publicProcedure
      .input(
        z.object({
          journalistName: z.string().trim().min(2, "Your name is required"),
          mediaOutlet: z.string().trim().min(2, "Media outlet or publication name is required"),
          email: z.string().trim().email("Please enter a valid work email address"),
          phone: z.string().trim().min(7, "Please enter a valid phone or WhatsApp number"),
          inquiryType: z.string().trim().min(2, "Please select the inquiry type"),
          deadline: z.string().trim().min(2, "Please specify your editorial deadline"),
          details: z.string().trim().min(5, "Please provide inquiry details or questions"),
        })
      )
      .mutation(async ({ input }) => {
        const record = await createPressInquiryRecord(input);

        // Drop inquiry to pr@volampelektrikals.com AND send media ticket to journalist
        dispatchPressEmails({
          pressTicketId: record.pressTicketId,
          journalistName: record.journalistName,
          mediaOutlet: record.mediaOutlet,
          email: record.email,
          phone: record.phone,
          inquiryType: record.inquiryType,
          deadline: record.deadline,
          details: record.details,
        }).catch((err) => {
          console.error("[PRESS EMAIL ERROR]:", err);
        });

        return {
          success: true as const,
          pressTicketId: record.pressTicketId,
          inquiry: record,
        };
      }),

    getByTicketId: publicProcedure
      .input(z.object({ pressTicketId: z.string() }))
      .query(async ({ input }) => {
        const item = await getPressInquiryById(input.pressTicketId);
        if (!item) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Press ticket not found.",
          });
        }
        return item;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can view media inquiries.",
        });
      }
      return getPressInquiries();
    }),
  }),

  enquiry: router({
    submit: publicProcedure
      .input(
        z.object({
          fullName: z.string().trim().min(2, "Your full name is required"),
          companyName: z.string().trim().optional(),
          email: z.string().trim().email("Please enter a valid work email address"),
          phone: z.string().trim().min(7, "Please enter a valid mobile or phone number"),
          location: z.string().trim().optional(),
          category: z.string().trim().optional(),
          quantity: z.string().trim().optional(),
          urgency: z.string().trim().optional(),
          details: z.string().trim().min(5, "Please share some details about your requirement"),
          fileName: z.string().optional(),
          fileSize: z.string().optional(),
          fileData: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const enrichedDetails = input.fileName
          ? `${input.details}\n\n[ATTACHED SPECIFICATION / BOQ]: ${input.fileName} (${input.fileSize || "Uploaded"})`
          : input.details;

        const result = await createEnquiry({
          ...input,
          details: enrichedDetails,
        });
        return {
          success: true as const,
          enquiryNumber: result.enquiryNumber,
          enquiry: result,
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can view customer enquiries.",
        });
      }
      return getEnquiries();
    }),

    getByNumber: publicProcedure
      .input(z.object({ enquiryNumber: z.string() }))
      .query(async ({ input }) => {
        const item = await getEnquiryByNumber(input.enquiryNumber);
        if (!item) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Enquiry not found.",
          });
        }
        return item;
      }),
  }),

  footprint: router({
    overview: publicProcedure.query(async () => {
      return getFootprintOverview();
    }),
    states: publicProcedure.query(async () => {
      return getFootprintStates();
    }),
    stateProjects: publicProcedure
      .input(z.object({ stateCode: z.string().optional() }))
      .query(async ({ input }) => {
        return getFootprintProjectsByState(input.stateCode);
      }),
    project: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const p = await getFootprintProjectById(input.id);
        if (!p) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found.",
          });
        }
        return p;
      }),
  }),

  leadership: router({
    get: publicProcedure.query(async () => {
      return getLeadershipData();
    }),

    updateCeo: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          role: z.string().optional(),
          company: z.string().optional(),
          quote: z.string().optional(),
          draftNote: z.string().optional(),
          imageUrl: z.string().nullable().optional(),
          initials: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.accountType !== "employee") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only VOLAMP employees can update leadership details.",
          });
        }
        return updateCeoProfile(input);
      }),

    updateMember: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          role: z.string().optional(),
          department: z.string().optional(),
          imageUrl: z.string().nullable().optional(),
          bio: z.string().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.accountType !== "employee") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only VOLAMP employees can update team member details.",
          });
        }
        const { id, ...data } = input;
        const updated = await updateTeamMember(id, data);
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team member not found.",
          });
        }
        return updated;
      }),
  }),

  products: router({
    list: publicProcedure
      .input(
        z
          .object({
            category: z.string().optional(),
            subcategory: z.string().optional(),
            subcategories: z.array(z.string()).optional(),
            brand: z.string().optional(),
            search: z.string().optional(),
            status: z.enum(["Active", "Inactive", "Out of Stock", "Discontinued", "all"]).optional(),
            minPrice: z.number().optional(),
            maxPrice: z.number().optional(),
            page: z.number().int().min(1).optional(),
            limit: z.number().int().min(1).max(100).optional(),
            sortBy: z.enum(["price_asc", "price_desc", "name", "relevance"]).optional(),
            material: z.string().optional(),
            voltage: z.string().optional(),
            cores: z.string().optional(),
            armorType: z.string().optional(),
            stock: z.string().optional(),
            poles: z.string().optional(),
            rating: z.string().optional(),
            color: z.string().optional(),
            sizeSqMm: z.string().optional(),
            insulationType: z.string().optional(),
            shieldingType: z.string().optional(),
            innerSheath: z.string().optional(),
            outerSheath: z.string().optional(),
            conductorClass: z.string().optional(),
          })
          .optional()
      )
      .query(({ input }) => {
        return queryProducts(input || {});
      }),

    getById: publicProcedure
      .input(z.object({ productId: z.string() }))
      .query(({ input }) => {
        const product = getProductByProductId(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product with ID '${input.productId}' was not found.`,
          });
        }
        return product;
      }),

    getCategories: publicProcedure.query(() => {
      return getCatalogCategories();
    }),

    getBrands: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(({ input }) => {
        return getCatalogBrands(input?.category);
      }),

    getFilterStats: publicProcedure
      .input(
        z
          .object({
            category: z.string().optional(),
            subcategory: z.string().optional(),
          })
          .optional()
      )
      .query(({ input }) => {
        return getCategoryFilterStats(input?.category, input?.subcategory);
      }),

    previewImport: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can preview product imports.",
        });
      }
      const current = loadProductsFromDisk();
      return previewImportDiff(current);
    }),

    confirmImport: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can commit product imports.",
        });
      }
      const reloaded = loadProductsFromDisk();
      return {
        success: true,
        totalProducts: reloaded.length,
        timestamp: new Date().toISOString(),
      };
    }),
  }),

  careers: router({
    getOpenRoles: publicProcedure.query(() => {
      return VOLAMP_JOB_ROLES;
    }),

    submitApplication: publicProcedure
      .input(
        z.object({
          fullName: z.string().trim().min(2, "Full name is required"),
          email: z.string().trim().email("Please enter a valid email address"),
          phone: z.string().trim().min(7, "Please enter a valid mobile or WhatsApp number"),
          city: z.string().trim().min(2, "City is required"),
          state: z.string().trim().min(2, "State is required"),
          roleApplied: z.string().trim().min(2, "Role applied is required"),
          department: z.string().trim().min(2, "Department is required"),
          experienceYears: z.string().trim().min(1, "Please select your experience range"),
          highestQualification: z.string().trim().min(2, "Highest qualification is required"),
          currentCompany: z.string().trim().optional(),
          currentCtc: z.string().trim().optional(),
          expectedCtc: z.string().trim().optional(),
          noticePeriod: z.string().trim().min(1, "Please select your notice period"),
          linkedInUrl: z.string().trim().optional(),
          resumeUrl: z.string().trim().optional(),
          coverNote: z.string().trim().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const application = await createCareerApplication(input);
        return {
          success: true as const,
          applicationId: application.applicationId,
          application,
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP HR & authorized personnel can view career applications.",
        });
      }
      return getCareerApplications();
    }),

    getById: publicProcedure
      .input(z.object({ applicationId: z.string() }))
      .query(async ({ input }) => {
        const app = await getCareerApplicationById(input.applicationId);
        if (!app) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Career application not found.",
          });
        }
        return app;
      }),
  }),
});

export type AppRouter = typeof appRouter;
