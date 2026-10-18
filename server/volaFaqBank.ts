/**
 * VOLAMP ELEKTRIKALS – AI SALES CALL AGENT
 * Official Customer FAQ & Answer Bank (Sections 1 to 39 & Q1 to Q150)
 * 
 * IMPORTANT AI RULE:
 * The AI agent should never invent a price, stock quantity, delivery date,
 * discount, technical specification, credit limit, or commitment.
 * If the required information is not available in the system, the AI should say:
 * "Let me have our sales team confirm that for you. I don’t want to give you incorrect information."
 */

export const ESCALATION_STANDARD_RESPONSE =
  "I understand your requirement. This needs confirmation from our sales team, and I don't want to give you incorrect information. I'll arrange for the concerned salesperson to get in touch with you.";

export const ESCALATION_SHORT_RESPONSE =
  "Let me have our sales team confirm that for you. I don't want to give you incorrect information.";

export interface FaqEntry {
  id: string;
  section: string;
  patterns: RegExp[];
  answer: string;
  isEscalation?: boolean;
}

export const FAQ_BANK: FaqEntry[] = [
  // 1. COMPANY & GENERAL INFORMATION
  {
    id: "Q1",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /what\s+does\s+volamp\s+(?:elektrikals\s+)?do/i,
      /tell\s+me\s+about\s+volamp\s+elektrikals/i,
      /what\s+is\s+volamp\s+elektrikals/i,
      /volamp\s+kya\s+karti\s+hai/i,
    ],
    answer:
      "Volamp Elektrikals Pvt. Ltd. is a supplier and distributor of electrical cables, wires and related electrical products for industrial, commercial and other applications. We deal in products from reputed brands and can assist with product selection, quotation, availability and delivery.",
  },
  {
    id: "Q2",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /what\s+products\s+do\s+you\s+deal\s+in/i,
      /which\s+products\s+do\s+you\s+have/i,
      /what\s+do\s+you\s+sell/i,
      /aap\s+kya\s+bechte\s+ho/i,
      /product\s+range/i,
    ],
    answer:
      "We deal in a wide range of electrical cables and wires, including power cables, control cables, flexible cables, shielded cables, armoured and unarmoured cables, FRLS cables, XLPE cables, copper and aluminium cables, along with switchgear products such as MCBs and MCCBs.",
  },
  {
    id: "Q3_Q4",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /which\s+brands\s+do\s+you\s+deal\s+in/i,
      /do\s+you\s+supply\s+branded\s+cables/i,
      /what\s+brands\s+do\s+you\s+have/i,
      /kon\s+kon\s+se\s+brand\s+hai/i,
    ],
    answer:
      "We deal with reputed brands including Polycab, Finolex, KEI and Havells, along with Schneider Electric and Legrand for switchgear, subject to product availability and customer requirement.",
  },
  {
    id: "Q5",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /are\s+you\s+a\s+manufacturer\s+or\s+distributor/i,
      /manufacturer\s+or\s+trader/i,
      /distributor\s+or\s+manufacturer/i,
      /kya\s+aap\s+manufacturer\s+ho/i,
    ],
    answer:
      "We primarily operate as an electrical products distributor and supplier.",
  },
  {
    id: "Q6",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /do\s+you\s+supply\s+to\s+businesses/i,
      /b2b\s+supply/i,
      /do\s+you\s+sell\s+to\s+contractors/i,
      /do\s+you\s+deal\s+with\s+companies/i,
    ],
    answer:
      "Yes. We supply to industrial, commercial, contractors, traders, OEMs and other business customers.",
  },
  {
    id: "Q7",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /can\s+you\s+supply\s+in\s+bulk/i,
      /bulk\s+orders?/i,
      /large\s+quantity\s+supply/i,
      /bulk\s+requirement/i,
    ],
    answer:
      "Yes. We handle bulk requirements. Please share the required cable type, size, quantity and preferred brand so our sales team can provide the appropriate quotation.",
  },
  {
    id: "Q8",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /do\s+you\s+supply\s+small\s+quantities/i,
      /small\s+order/i,
      /minimum\s+quantity/i,
      /chhoti\s+quantity\s+milegi/i,
    ],
    answer:
      "Yes, depending on the product and available stock. Please share your requirement and we can check availability.",
  },

  // 2. UNDERSTANDING CUSTOMER REQUIREMENT
  {
    id: "Q9_Q10",
    section: "2. UNDERSTANDING CUSTOMER REQUIREMENT",
    patterns: [
      /can\s+you\s+help\s+me\s+select\s+(?:a\s+)?cable/i,
      /i\s+don'?t\s+know\s+which\s+cable\s+i\s+need/i,
      /help\s+me\s+choose\s+a\s+cable/i,
      /which\s+cable\s+is\s+right\s+for\s+me/i,
    ],
    answer:
      "No problem, we can help! Please tell me where the cable will be used, the equipment or application, approximate load (kW/HP/Amperes) if available, required length, and whether you prefer copper or aluminium. Our technical and sales team will help identify the suitable cable.",
  },
  {
    id: "Q11",
    section: "2. UNDERSTANDING CUSTOMER REQUIREMENT",
    patterns: [
      /what\s+information\s+do\s+you\s+need\s+for\s+a\s+quotation/i,
      /details\s+needed\s+for\s+quote/i,
      /quotation\s+ke\s+liye\s+kya\s+chahiye/i,
    ],
    answer:
      "Usually we need the product or cable type, size (sq. mm), conductor material (copper or aluminium), number of cores, quantity/length, preferred brand, and delivery location. If you have a BOQ or enquiry sheet, you can also share that directly with us.",
  },
  {
    id: "Q12",
    section: "2. UNDERSTANDING CUSTOMER REQUIREMENT",
    patterns: [
      /can\s+i\s+send\s+(?:you\s+)?(?:my\s+)?boq/i,
      /share\s+boq/i,
      /boq\s+quotation/i,
      /enquiry\s+sheet/i,
    ],
    answer:
      "Yes. You can share your BOQ with our sales team for review and quotation. Please WhatsApp it to +91 9512365582 or email sales@volampelektrikals.com.",
  },
  {
    id: "Q13_Q14",
    section: "2. UNDERSTANDING CUSTOMER REQUIREMENT",
    patterns: [
      /can\s+i\s+send\s+a\s+photo\s+of\s+the\s+cable/i,
      /can\s+i\s+send\s+my\s+existing\s+cable\s+specification/i,
      /cable\s+photo/i,
      /datasheet\s+photo/i,
    ],
    answer:
      "Yes. A photo can help us identify the product, provided the markings and specifications are visible. You can also share the specification, datasheet, or cable marking, and our team will check the exact requirement.",
  },

  // 3. PRODUCT & TECHNICAL QUESTIONS
  {
    id: "Q26",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /difference\s+between\s+copper\s+and\s+alumin(?:i)?um/i,
      /copper\s+vs\s+alumin(?:i)?um/i,
      /cu\s+vs\s+al/i,
    ],
    answer:
      "Copper generally has higher conductivity and is more compact for the same current-carrying requirement, while aluminium is lighter and generally more economical. The appropriate choice depends on the application, load, installation conditions, and project design requirements.",
  },
  {
    id: "Q27",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /what\s+is\s+frls/i,
      /frls\s+meaning/i,
      /frls\s+full\s+form/i,
    ],
    answer:
      "FRLS means Flame Retardant Low Smoke. These cables are designed to reduce flame propagation and smoke generation under specified test conditions, enhancing safety in buildings and industrial facilities.",
  },
  {
    id: "Q28",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /what\s+is\s+xlpe/i,
      /xlpe\s+meaning/i,
      /xlpe\s+full\s+form/i,
    ],
    answer:
      "XLPE stands for Cross-Linked Polyethylene. It is commonly used as cable insulation because of its superior electrical, thermal (up to 90°C continuous operation), and mechanical properties.",
  },
  {
    id: "Q29",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /what\s+is\s+armoured\s+cable/i,
      /what\s+is\s+armored\s+cable/i,
      /armoured\s+meaning/i,
    ],
    answer:
      "An armoured cable has an additional mechanical protection layer (GI wire or strip armour), making it suitable for direct underground burial and industrial applications where mechanical protection is required.",
  },
  {
    id: "Q30",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /what\s+is\s+shielded\s+cable/i,
      /shielded\s+cable\s+meaning/i,
      /screened\s+cable/i,
    ],
    answer:
      "A shielded cable contains a conductive shielding layer designed to reduce electromagnetic interference (EMI) and protect signal integrity in sensitive instrumentation, control, and VFD motor applications.",
  },
  {
    id: "Q31",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /current[\s-]carrying\s+capacity\s+of\s+this\s+cable/i,
      /ampacity\s+of\s+this\s+cable/i,
      /how\s+many\s+amps\s+can\s+this\s+cable\s+take/i,
    ],
    answer:
      "The ampacity depends on the cable size, conductor material, insulation (PVC vs XLPE), installation method (in air, ground, or duct), ambient temperature, and other factors. Please provide the exact cable specification and installation conditions so our technical team can confirm the applicable rating.",
  },
  {
    id: "Q33",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /can\s+you\s+provide\s+a\s+datasheet/i,
      /need\s+datasheet/i,
      /technical\s+datasheet/i,
    ],
    answer:
      "Yes, subject to availability, we can provide the relevant manufacturer datasheet for the product.",
  },
  {
    id: "Q34",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /are\s+(?:the\s+)?cables\s+isi\s+marked/i,
      /isi\s+mark\s+cables/i,
      /bis\s+certified/i,
    ],
    answer:
      "This depends on the specific product. We deal in ISI-marked products from certified manufacturers and can confirm the applicable certification and marking for the exact product you require.",
  },
  {
    id: "Q35",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /do\s+you\s+provide\s+test\s+certificates/i,
      /manufacturer\s+test\s+certificate/i,
      /mtc\s+certificate/i,
    ],
    answer:
      "Test certificates (Manufacturer Test Certificate / MTC) can be provided where available from the manufacturer and applicable to the product/order.",
  },

  // 4. BRAND QUESTIONS
  {
    id: "Q40",
    section: "4. BRAND QUESTIONS",
    patterns: [
      /which\s+brand\s+is\s+best/i,
      /polycab\s+or\s+kei/i,
      /polycab\s+or\s+finolex/i,
      /best\s+cable\s+brand/i,
    ],
    answer:
      "The best brand depends on your application, technical specification, budget and project requirements. We can provide suitable options from reputed brands including Polycab, Finolex, KEI, and Havells based on your requirement.",
  },
  {
    id: "Q41_Q42",
    section: "4. BRAND QUESTIONS",
    patterns: [
      /can\s+i\s+choose\s+the\s+brand/i,
      /can\s+you\s+provide\s+an\s+alternative\s+brand/i,
      /alternative\s+brand/i,
    ],
    answer:
      "Yes. If you have a preferred brand, please tell us and we can check availability and pricing. If the requested brand is unavailable, we can check suitable alternatives based on your technical and commercial requirements.",
  },
  {
    id: "Q43",
    section: "4. BRAND QUESTIONS",
    patterns: [
      /why\s+is\s+your\s+price\s+different\s+from\s+another\s+supplier/i,
      /price\s+difference\s+reason/i,
    ],
    answer:
      "Cable prices can vary based on brand, specification, conductor material, quantity, copper/aluminium rates, market conditions, taxes, freight and commercial terms. Our team can check your exact requirement and provide the applicable quotation.",
  },

  // 5. PRICE & QUOTATION
  {
    id: "Q46",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /can\s+you\s+give\s+me\s+a\s+discount/i,
      /extra\s+discount/i,
      /discount\s+milega/i,
    ],
    answer:
      "We can check the applicable discount based on the product, quantity, brand and commercial terms. Let me have our sales team confirm the best possible offer.",
  },
  {
    id: "Q47_Q48_Q49",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /your\s+price\s+is\s+high/i,
      /price\s+too\s+high/i,
      /bhav\s+bahut\s+jyada\s+hai/i,
      /another\s+supplier\s+is\s+giving\s+me\s+a\s+lower\s+price/i,
      /cheaper\s+somewhere\s+else/i,
      /can\s+you\s+match\s+another\s+supplier'?s\s+price/i,
      /can\s+you\s+beat\s+this\s+price/i,
    ],
    answer:
      "I understand. Cable prices can vary based on brand, specification and market conditions. If you share the competitor's price or quotation along with the exact specification, brand, and quantity, our sales team can review whether we can offer a more competitive option.",
  },
  {
    id: "Q50",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /is\s+gst\s+included\s+in\s+your\s+price/i,
      /gst\s+extra\s+or\s+inclusive/i,
      /with\s+gst\s+or\s+without\s+gst/i,
    ],
    answer:
      "The quotation will specify whether the price is inclusive or exclusive of applicable taxes (standard statutory GST rate is 18%). Our sales team can confirm the exact tax treatment for your order.",
  },
  {
    id: "Q51",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /is\s+freight\s+included/i,
      /transport\s+charges\s+extra/i,
      /freight\s+extra/i,
    ],
    answer:
      "Freight terms depend on the order value, quantity, delivery location, and commercial terms. Our sales team will confirm the applicable freight arrangement in your quotation.",
  },
  {
    id: "Q52",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /how\s+long\s+is\s+the\s+quotation\s+valid/i,
      /quote\s+validity/i,
      /quotation\s+validity/i,
    ],
    answer:
      "Quotation validity depends on the product and raw metal market conditions (copper/aluminium index) and will be explicitly mentioned in the quotation.",
  },
  {
    id: "Q53",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /can\s+you\s+revise\s+the\s+quotation/i,
      /revise\s+quote/i,
      /change\s+quotation/i,
    ],
    answer:
      "Yes. Please tell us what needs to be revised—quantity, brand, specification or commercial terms—and our sales team can review it.",
  },

  // 6. STOCK & AVAILABILITY & 7. ORDER & DELIVERY
  {
    id: "Q57_Q61_Q62_Q65",
    section: "6. STOCK & 7. ORDER & DELIVERY",
    patterns: [
      /what\s+is\s+your\s+delivery\s+timing/i,
      /delivery\s+timing/i,
      /dispatch\s+timing/i,
      /how\s+quickly\s+can\s+you\s+deliver/i,
      /same[\s-]day\s+delivery/i,
      /urgent\s+material.*today/i,
    ],
    answer:
      "Orders placed between 8:00 AM and 5:30 PM are considered for delivery/dispatch as per availability and logistics feasibility. Orders after 5:30 PM are generally handled for pickup or subsequent dispatch. If the required material is available in our warehouse, same-day dispatch may be possible for eligible orders.",
  },
  {
    id: "Q63_Q64",
    section: "7. ORDER & DELIVERY",
    patterns: [
      /can\s+i\s+pick\s*up\s+the\s+material/i,
      /pickup\s+available/i,
      /where\s+is\s+your\s+warehouse/i,
      /godown\s+location/i,
    ],
    answer:
      "Yes, pickup can be arranged subject to order confirmation, stock availability and applicable warehouse procedures. Our warehouse is separate from our office; the sales team will provide the applicable warehouse/pickup address after confirming your order.",
  },
  {
    id: "Q66",
    section: "7. ORDER & DELIVERY",
    patterns: [
      /how\s+long\s+will\s+b2b\s+delivery\s+take/i,
      /b2b\s+delivery\s+time/i,
      /delivery\s+timeline/i,
      /kab\s+tak\s+deliver\s+hoga/i,
    ],
    answer:
      "For available stock, B2B delivery generally takes around 1–3 days, depending on the delivery location and logistics feasibility.",
  },
  {
    id: "Q67_Q68",
    section: "7. ORDER & DELIVERY",
    patterns: [
      /can\s+you\s+deliver\s+outside\s+the\s+city/i,
      /can\s+you\s+deliver\s+directly\s+to\s+my\s+(?:customer|site)/i,
      /direct\s+site\s+delivery/i,
      /deliver\s+to\s+other\s+state/i,
    ],
    answer:
      "Yes, we can evaluate deliveries outside the local area and direct-to-site delivery depending on the order size, location and logistics arrangements. Our sales team can confirm feasibility.",
  },
  {
    id: "Q69_Q70",
    section: "7. ORDER & DELIVERY",
    patterns: [
      /can\s+you\s+split\s+the\s+delivery/i,
      /can\s+you\s+deliver\s+in\s+multiple\s+lots/i,
      /part\s+delivery/i,
      /phased\s+delivery/i,
    ],
    answer:
      "Yes, split or multiple-lot delivery can be considered depending on product availability and agreed commercial terms. Our sales team can confirm.",
  },
  {
    id: "Q71_Q72",
    section: "7. ORDER & DELIVERY",
    patterns: [
      /my\s+material\s+has\s+not\s+arrived/i,
      /material\s+not\s+delivered/i,
      /can\s+i\s+get\s+(?:the\s+)?tracking\s+details/i,
      /tracking\s+number/i,
      /lr\s+copy/i,
    ],
    answer:
      "I'm sorry for any delay. Once dispatch information is generated, our team provides the relevant transport LR or tracking details. Let me arrange for your order status to be checked immediately by our logistics team.",
  },

  // 8. PAYMENT & CREDIT
  {
    id: "Q73_Q74_Q75_Q77",
    section: "8. PAYMENT & CREDIT",
    patterns: [
      /what\s+payment\s+methods\s+do\s+you\s+accept/i,
      /do\s+you\s+provide\s+credit/i,
      /can\s+i\s+place\s+an\s+order\s+on\s+credit/i,
      /new\s+customer.*credit/i,
      /udhar\s+milega/i,
      /credit\s+terms/i,
    ],
    answer:
      "Our available payment methods and terms depend on the customer and order (NEFT/RTGS, advance, or credit). Credit facilities may be available to eligible customers after the required credit assessment and approval. New customer credit purchases are subject to credit approval; alternatively, an advance payment arrangement is available.",
  },
  {
    id: "Q76_Q78",
    section: "8. PAYMENT & CREDIT",
    patterns: [
      /what\s+is\s+(?:the\s+)?credit\s+limit/i,
      /can\s+i\s+place\s+a\s+large\s+credit\s+order/i,
      /how\s+much\s+credit\s+can\s+i\s+get/i,
    ],
    answer:
      "The applicable credit limit depends on the customer's approved credit assessment and company policy. Our sales and accounts team can confirm your available limit upon reviewing your documents.",
  },
  {
    id: "Q82",
    section: "8. PAYMENT & CREDIT",
    patterns: [
      /do\s+you\s+accept\s+pdc/i,
      /post[\s-]dated\s+cheque/i,
    ],
    answer:
      "PDC arrangements may be applicable under approved credit terms and company policy. Our accounts team can confirm the exact requirement.",
  },

  // 9. CUSTOMER ONBOARDING / KYC
  {
    id: "Q83_Q84_Q85",
    section: "9. CUSTOMER ONBOARDING / KYC",
    patterns: [
      /what\s+documents\s+do\s+you\s+need\s+to\s+open\s+an\s+account/i,
      /why\s+do\s+you\s+need\s+kyc/i,
      /can\s+you\s+sell\s+to\s+a\s+new\s+company/i,
      /vendor\s+registration/i,
      /account\s+opening\s+documents/i,
    ],
    answer:
      "Yes, we onboard new customers subject to our standard verification process. KYC (GST certificate, PAN, company details) helps us verify business details and is part of our account and credit assessment process. Our team will provide the applicable onboarding checklist.",
  },

  // 10. ORDER CHANGES & CANCELLATION
  {
    id: "Q87_Q88_Q89_Q90_Q91",
    section: "10. ORDER CHANGES & CANCELLATION",
    patterns: [
      /can\s+i\s+change\s+the\s+quantity\s+after\s+placing\s+the\s+order/i,
      /can\s+i\s+change\s+the\s+brand\s+after\s+placing\s+the\s+order/i,
      /can\s+i\s+cancel\s+my\s+order/i,
      /i\s+ordered\s+the\s+wrong\s+cable\s+size/i,
      /can\s+cut\s+cable\s+be\s+returned/i,
      /order\s+cancel\s+karna\s+hai/i,
    ],
    answer:
      "Please inform us immediately! Changes or cancellation depend on whether the order has already been processed, cut, packed or dispatched. Specially cut or processed cables are generally not eligible for return once cut. Our sales team will check the live order status and advise on available options.",
  },

  // 11. QUALITY & AUTHENTICITY & 12. WARRANTY
  {
    id: "Q92_Q93",
    section: "11. QUALITY & AUTHENTICITY",
    patterns: [
      /are\s+your\s+products\s+genuine/i,
      /how\s+can\s+i\s+verify\s+the\s+cable/i,
      /original\s+product\s+hai\s+kya/i,
      /authentic\s+material/i,
    ],
    answer:
      "We source 100% genuine products directly from established manufacturers and authorized supply channels. Cable markings, packaging, manufacturer batch numbers, and applicable test certificates (MTC) can be verified with every consignment.",
  },
  {
    id: "Q94_Q95_Q96_Q97",
    section: "11. QUALITY & AUTHENTICITY",
    patterns: [
      /what\s+if\s+i\s+receive\s+damaged\s+material/i,
      /what\s+if\s+i\s+receive\s+the\s+wrong\s+material/i,
      /what\s+if\s+the\s+quantity\s+is\s+short/i,
      /what\s+if\s+the\s+cable\s+doesn'?t\s+work/i,
      /defective\s+material/i,
      /shortage\s+in\s+delivery/i,
    ],
    answer:
      "Please report any damage, discrepancy, or shortage immediately with invoice details, packing slip, and photographs/videos. Please do not use potentially defective material. Our team will verify dispatch records and coordinate an immediate inspection and resolution.",
  },
  {
    id: "Q98_Q99_Q100_Q101",
    section: "12. WARRANTY & REPLACEMENT",
    patterns: [
      /do\s+you\s+provide\s+warranty/i,
      /can\s+i\s+get\s+a\s+replacement/i,
      /who\s+handles\s+warranty\s+claims/i,
      /how\s+long\s+does\s+replacement\s+take/i,
    ],
    answer:
      "Warranty depends on the specific product and manufacturer's warranty terms. If there is a confirmed manufacturing defect, replacement may be considered according to manufacturer terms. Our team coordinates the warranty process directly with the manufacturer.",
  },

  // 13. COMPETITOR / PRICE OBJECTIONS
  {
    id: "Q107",
    section: "13. COMPETITOR / PRICE OBJECTIONS",
    patterns: [
      /why\s+should\s+i\s+buy\s+from\s+you\s+instead\s+of\s+indiamart/i,
      /indiamart\s+vs\s+volamp/i,
      /better\s+than\s+indiamart/i,
    ],
    answer:
      "IndiaMART is a directory that connects you to third-party listings, whereas Volamp directly handles product quotation, stock availability, quality verification, GST invoicing, and fulfillment under our own warranty and supply responsibility.",
  },
  {
    id: "Q102",
    section: "13. COMPETITOR / PRICE OBJECTIONS",
    patterns: [
      /why\s+should\s+i\s+buy\s+from\s+you(?!\s+instead)/i,
      /why\s+choose\s+volamp/i,
      /volamp\s+se\s+kyun\s+kharidein/i,
    ],
    answer:
      "We provide direct access to reputed electrical brands along with expert technical product selection, quotation support, real-time stock verification, and rapid delivery coordination. We evaluate your requirements and offer the most competitive commercial package.",
  },
  {
    id: "Q103_Q104",
    section: "13. COMPETITOR / PRICE OBJECTIONS",
    patterns: [
      /i\s+already\s+have\s+a\s+supplier/i,
      /i\s+don'?t\s+want\s+to\s+change\s+my\s+supplier/i,
      /already\s+buying\s+from\s+someone/i,
      /mera\s+regular\s+dealer\s+hai/i,
    ],
    answer:
      "That's absolutely fine. You don't have to change your existing supplier. We can simply remain an additional supply option whenever you need better availability, an alternative brand, urgent material, or competitive pricing.",
  },

  // 15. PROJECT / BULK REQUIREMENTS
  {
    id: "Q113_Q114_Q115_Q116_Q117",
    section: "15. PROJECT / BULK REQUIREMENTS",
    patterns: [
      /i\s+have\s+a\s+project\s+requirement/i,
      /i\s+need\s+cables\s+for\s+a\s+complete\s+project/i,
      /can\s+you\s+supply\s+the\s+complete\s+boq/i,
      /i\s+need\s+supply\s+in\s+phases/i,
      /can\s+you\s+hold\s+stock\s+for\s+my\s+project/i,
    ],
    answer:
      "Yes. Please share your BOQ or complete requirement. Our sales team can review the quantities, specifications, brands, delivery schedule, phased dispatches, and project stock-holding arrangements.",
  },

  // 16. SWITCHGEAR
  {
    id: "Q118_Q119_Q120_Q121_Q122",
    section: "16. SWITCHGEAR",
    patterns: [
      /do\s+you\s+supply\s+mcbs?/i,
      /do\s+you\s+supply\s+mccbs?/i,
      /which\s+switchgear\s+brands\s+do\s+you\s+have/i,
      /which\s+mcb\s+should\s+i\s+use/i,
      /which\s+mccb\s+should\s+i\s+use/i,
    ],
    answer:
      "Yes, MCBs and MCCBs are part of our switchgear range (Schneider Electric, Legrand, LK). Selection depends on load current, breaking capacity (e.g. 10kA, 16kA, 25kA, 36kA), number of poles (SP, DP, TP, FP), and application. Please provide the rating so we can confirm availability and pricing.",
  },

  // 17. CUSTOMER WHO IS ONLY ASKING FOR PRICE
  {
    id: "Q123_Q124_Q125",
    section: "17. CUSTOMER WHO IS ONLY ASKING FOR PRICE",
    patterns: [
      /just\s+give\s+me\s+the\s+price/i,
      /sirf\s+rate\s+batao/i,
      /i\s+don'?t\s+want\s+to\s+share\s+my\s+quantity/i,
      /just\s+whatsapp\s+me\s+the\s+price/i,
      /whatsapp\s+pe\s+bhejo/i,
    ],
    answer:
      "Certainly. To give you the exact commercial price, I just need the cable/product specification, approximate quantity, and preferred brand. You can also share your contact/WhatsApp number, and our sales team will send the official quotation directly.",
  },

  // 18. CUSTOMER NOT INTERESTED
  {
    id: "Q126_Q127_Q128_Q129",
    section: "18. CUSTOMER NOT INTERESTED",
    patterns: [
      /i'?m\s+not\s+interested/i,
      /not\s+interested/i,
      /nahi\s+chahiye/i,
      /i\s+don'?t\s+need\s+anything\s+right\s+now/i,
      /don'?t\s+call\s+me\s+again/i,
      /i'?m\s+busy\s+right\s+now/i,
    ],
    answer:
      "Understood. We won't take much of your time. If you have any requirement in the future for electrical cables, wires or switchgear, Volamp will be happy to assist. Have a wonderful day!",
  },

  // 19. CUSTOMER WANTS TO SPEAK TO A HUMAN
  {
    id: "Q130_Q131_Q132",
    section: "19. CUSTOMER WANTS TO SPEAK TO A HUMAN",
    patterns: [
      /can\s+i\s+speak\s+to\s+a\s+salesperson/i,
      /talk\s+to\s+a\s+human/i,
      /i\s+don'?t\s+want\s+to\s+talk\s+to\s+an\s+ai/i,
      /speak\s+to\s+the\s+manager/i,
      /human\s+agent/i,
      /real\s+person/i,
    ],
    answer:
      "Certainly. I'll arrange for a member of our sales team or manager to contact you directly. Please share your name and mobile number, or call us directly at +91 9512365582.",
  },

  // 20. FOLLOW-UP QUESTIONS
  {
    id: "Q133_Q134_Q135_Q136",
    section: "20. FOLLOW-UP QUESTIONS",
    patterns: [
      /why\s+haven'?t\s+you\s+sent\s+the\s+quotation/i,
      /i\s+sent\s+the\s+enquiry\s+yesterday.*any\s+update/i,
      /nobody\s+is\s+responding\s+to\s+me/i,
      /when\s+will\s+your\s+salesperson\s+call\s+me/i,
    ],
    answer:
      "I'm sorry for the inconvenience and delay. Let me escalate this immediately to our sales lead so they can check your enquiry status and arrange an urgent callback or update for you.",
  },

  // 21. BILLING & DOCUMENTATION
  {
    id: "Q137_Q138_Q139_Q140_Q141_Q142",
    section: "21. BILLING & DOCUMENTATION",
    patterns: [
      /can\s+you\s+provide\s+an?\s+invoice/i,
      /gst\s+invoice/i,
      /e[\s-]way\s+bill/i,
      /delivery\s+challan/i,
      /send\s+invoice\s+on\s+whatsapp/i,
      /duplicate\s+invoice/i,
    ],
    answer:
      "Yes. An official GST tax invoice, e-way bill, and delivery challan are provided as standard dispatch documentation. Our accounts team can also share PDF copies directly to your WhatsApp or registered email.",
  },

  // 22. PAYMENT FOLLOW-UP / RECEIVABLES
  {
    id: "Q143_Q144_Q145_Q146",
    section: "22. PAYMENT FOLLOW-UP / RECEIVABLES",
    patterns: [
      /i\s+have\s+already\s+made\s+the\s+payment/i,
      /why\s+is\s+my\s+payment\s+showing\s+as\s+pending/i,
      /i\s+need\s+more\s+time\s+to\s+make\s+payment/i,
      /payment\s+extension/i,
    ],
    answer:
      "Thank you. Please share your payment UTR / reference number, and our accounts team will verify and update your ledger. Payment extension requests will be passed to our accounts and sales desk for review under company credit terms.",
  },

  // 23. SPECIAL COMMERCIAL REQUESTS
  {
    id: "Q147_Q148_Q149_Q150",
    section: "23. SPECIAL COMMERCIAL REQUESTS",
    patterns: [
      /extra\s+discount\s+for\s+a\s+large\s+order/i,
      /special\s+project\s+price/i,
      /can\s+you\s+lock\s+the\s+price\s+for\s+my\s+project/i,
      /material\s+against\s+my\s+purchase\s+order/i,
    ],
    answer:
      "Yes, project-specific pricing, price-lock arrangements, and supply against approved Purchase Orders (POs) can be evaluated based on quantity, schedule, and commercial terms. Our sales desk will coordinate this.",
  },
];

/**
 * Patterns that MUST trigger the recommended escalation response:
 * "I understand your requirement. This needs confirmation from our sales team, and I don’t want to give you incorrect information. I’ll arrange for the concerned salesperson to get in touch with you."
 */
const ESCALATION_TRIGGERS: RegExp[] = [
  /\b(?:match\s*(?:their|competitor|another|the)?\s*price|price\s*match|beat\s*(?:this|their|competitor)?\s*price|lower\s*(?:than\s*their\s*price|rate|offer))\b/i,
  /\b(?:negotiate\s*price|bargain|extra\s*discount|give\s*me\s*a\s*lower\s*rate)\b/i,
  /\b(?:credit\s*beyond|increase\s*my\s*credit\s*limit|more\s*credit)\b/i,
  /\b(?:dispute\s*invoice|wrong\s*amount\s*on\s*bill|overcharged)\b/i,
  /\b(?:shortage|short\s*quantity|missing\s*drums?|damaged\s*material|cable\s*damaged|broken\s*reel)\b/i,
  /\b(?:defective\s*material|cable\s*(?:not\s*working|failed\s*spark|burnt|sparked))\b/i,
  /\b(?:product\s*replacement|exchange\s*cable|replace\s*material)\b/i,
  /\b(?:design\s*approval|certify\s*my\s*electrical\s*design|legal\s*guarantee)\b/i,
  /\b(?:cancel\s*processed\s*order|cancel\s*dispatched\s*order)\b/i,
  /\b(?:return\s*cut\s*cable|return\s*specially\s*cut)\b/i,
  /\b(?:urgent\s*project\s*stopped|immediate\s*stock\s*guarantee|swear\s*it\s*arrives\s*today)\b/i,
  /\b(?:cheating|fraud|police|court|sue\s*you|worst\s*company|threaten)\b/i,
  /\b(?:management\s*intervention|connect\s*to\s*director|connect\s*to\s*naimil|speak\s*to\s*ceo)\b/i,
  /\b(?:customized\s*credit\s*agreement|special\s*60\s*days\s*credit)\b/i,
];

/**
 * Check if the query matches an FAQ or Escalation trigger.
 */
export function matchVolaFaq(query: string): { matched: boolean; response: string; isEscalation?: boolean } | null {
  const trimmed = query.trim();

  // 1. Check Escalation Triggers first
  for (const trigger of ESCALATION_TRIGGERS) {
    if (trigger.test(trimmed)) {
      return {
        matched: true,
        response: ESCALATION_STANDARD_RESPONSE,
        isEscalation: true,
      };
    }
  }

  // 2. Check FAQ bank
  for (const item of FAQ_BANK) {
    for (const pat of item.patterns) {
      if (pat.test(trimmed)) {
        return {
          matched: true,
          response: item.answer,
          isEscalation: item.isEscalation,
        };
      }
    }
  }

  return null;
}
