export interface JobRole {
  id: string;
  no: number;
  title: string;
  department: "Sales & Business Development" | "Operations, Warehouse & Logistics" | "Purchase, Accounts & Finance" | "Business Analytics, CRM & Marketing" | "Human Resources";
  location: string;
  workMode: string;
  experience: string;
  education: string;
  packageLpa?: string;
  openingsCount: number;
  isFeatured?: boolean;
  aboutRole: string;
  overview?: string;
  responsibilities: string[];
  skillsRequired: string[];
  requirements?: string[];
  qualification: string;
  tags: string[];
}

export const CAREERS_COMPANY_INFO = {
  companyName: "Volamp Elektrikals Pvt. Ltd.",
  headline: "Careers at Volamp",
  about: "Volamp Elektrikals Pvt. Ltd. is a PAN India electrical distribution company. We supply trusted brands such as Polycab, Finolex and KEI to dealers, electricians, contractors, builders and industrial buyers across the country. Our growth comes from strong relationships, reliable service and a team that takes ownership.",
  whyJoinUs: [
    "Work with India's leading electrical brands in a fast-growing PAN India business",
    "Direct access to leadership and real responsibility from day one",
    "Clear growth path as we expand into new regions and teams",
    "A performance-driven culture that rewards effort and results",
  ],
};

export const CAREER_DEPARTMENTS = [
  "All Departments",
  "Sales & Business Development",
  "Operations, Warehouse & Logistics",
  "Purchase, Accounts & Finance",
  "Business Analytics, CRM & Marketing",
  "Human Resources",
] as const;

export const CAREER_LOCATIONS = [
  "All Locations",
  "Ahmedabad, Gujarat / Field",
  "Ahmedabad, Gujarat",
  "Ahmedabad, Gujarat (Warehouse)",
  "PAN India (Region-based)",
] as const;

export const CAREER_EXPERIENCES = [
  "All Experience",
  "Freshers / 0 to 2 years",
  "1 to 4 years",
  "2 to 5 years",
  "4 to 8 years",
  "6 to 12 years",
] as const;

export const VOLAMP_JOB_ROLES: JobRole[] = [
  // 1. Sales Executive
  {
    id: "sales-executive",
    no: 1,
    title: "Sales Executive",
    department: "Sales & Business Development",
    location: "Ahmedabad, Gujarat / Field",
    workMode: "Full-time",
    experience: "1 to 4 years",
    education: "Graduate in any stream",
    packageLpa: "Competitive + Sales Incentive",
    openingsCount: 4,
    isFeatured: true,
    aboutRole:
      "As a Sales Executive at Volamp, you will grow our business with dealers, electricians and contractors across your assigned territory. You will sell leading electrical brands such as Polycab, Finolex and KEI, build lasting relationships, and turn enquiries into repeat orders.",
    responsibilities: [
      "Visit and manage dealers, electricians, contractors and builders in your assigned territory",
      "Generate new leads and convert enquiries into quotations and confirmed orders",
      "Share product information, pricing and scheme details across cables, wires and switchgear",
      "Follow up on quotations, proforma invoices and pending orders until closure",
      "Record every lead, call and visit accurately in the CRM on the same day",
      "Coordinate with the operations and accounts teams for dispatch and payment follow-up",
      "Achieve monthly and quarterly sales targets",
    ],
    skillsRequired: [
      "Strong communication and negotiation skills",
      "Knowledge of electrical products, especially cables and wires, is a big plus",
      "Comfortable with field visits and customer meetings",
      "Basic working knowledge of CRM tools, Excel and WhatsApp Business",
      "Target-driven, self-motivated and well organised",
    ],
    qualification:
      "Graduate in any stream. Experience in electrical, building material or FMCG sales preferred.",
    tags: ["Dealer Network", "Contractor Sales", "Cables & Switchgear", "Field Visits"],
  },

  // 2. Business Development Associate
  {
    id: "business-development-associate",
    no: 2,
    title: "Business Development Associate",
    department: "Sales & Business Development",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 3 years",
    education: "Graduate (BBA / MBA preferred)",
    packageLpa: "Competitive + Target Bonus",
    openingsCount: 3,
    isFeatured: true,
    aboutRole:
      "The Business Development Associate opens new markets and new customer segments for Volamp. You will identify potential dealers, contractors, builders and industrial buyers, start the conversation, and hand over qualified opportunities to the sales team.",
    responsibilities: [
      "Research and identify new dealers, contractors, builders and industrial buyers",
      "Reach out through calls, emails, WhatsApp and LinkedIn to generate qualified leads",
      "Present Volamp's product range, brands and service strengths to prospects",
      "Prepare proposals, quotations and follow-up plans with the sales team",
      "Build and maintain a healthy pipeline of opportunities in the CRM",
      "Track competitor pricing, schemes and market trends and share insights",
      "Support onboarding of new customers, including documentation and credit forms",
    ],
    skillsRequired: [
      "Excellent written and spoken communication in English, Hindi and Gujarati",
      "Lead generation, prospecting and follow-up discipline",
      "Good with Excel, email and presentation tools",
      "Comfortable using a CRM system daily",
      "Curious, persistent and quick to learn about products and markets",
    ],
    qualification:
      "Graduate (BBA/MBA preferred). Prior experience in B2B sales or business development is an advantage.",
    tags: ["B2B Prospecting", "Market Expansion", "Client Onboarding", "CRM Pipeline"],
  },

  // 3. Regional Sales Manager
  {
    id: "regional-sales-manager",
    no: 3,
    title: "Regional Sales Manager",
    department: "Sales & Business Development",
    location: "PAN India (Region-based)",
    workMode: "Full-time",
    experience: "7 to 12 years",
    education: "Graduate or MBA",
    packageLpa: "Senior Leadership Band + Regional Revenue Incentive",
    openingsCount: 2,
    isFeatured: true,
    aboutRole:
      "The Regional Sales Manager leads Volamp's sales team and revenue in a region. You will set targets, coach the team, handle large accounts and make sure our PAN India growth plan is delivered, one region at a time.",
    responsibilities: [
      "Own regional sales targets, revenue growth and market share",
      "Lead, coach and review a team of sales executives and business development associates",
      "Plan territory coverage, beat plans and customer visit schedules",
      "Develop key dealers, large contractors and industrial customers personally",
      "Review CRM data weekly to track calls, visits, quotations and conversions",
      "Coordinate with purchase and operations for stock availability and timely delivery",
      "Work with accounts on credit limits and outstanding collections for the region",
      "Share regional performance reports and market feedback with management",
    ],
    skillsRequired: [
      "Proven team leadership and people management",
      "Strong understanding of electrical distribution, cables and wires",
      "Data-driven approach to sales review and forecasting",
      "Negotiation and key account handling",
      "Comfortable with CRM dashboards and Excel reporting",
    ],
    qualification:
      "Graduate or MBA. Minimum 7 years of sales experience, with at least 3 years in a team leadership role.",
    tags: ["Regional Leadership", "PAN India Distribution", "Team Coaching", "Revenue Targets"],
  },

  // 4. Key Account Manager (Builders & Industrial)
  {
    id: "key-account-manager-builders-industrial",
    no: 4,
    title: "Key Account Manager (Builders & Industrial)",
    department: "Sales & Business Development",
    location: "Ahmedabad, Gujarat / Travel as required",
    workMode: "Full-time",
    experience: "4 to 8 years",
    education: "Graduate (B.E. / Diploma in Electrical is a plus)",
    packageLpa: "Industry Benchmark + Project Bonuses",
    openingsCount: 2,
    isFeatured: true,
    aboutRole:
      "The Key Account Manager looks after Volamp's largest customers: builders, EPC contractors and industrial buyers. You will build long-term relationships, win project business, and make sure every order is delivered smoothly.",
    responsibilities: [
      "Manage a portfolio of builder, project and industrial accounts",
      "Understand project requirements and prepare accurate BOQ-based quotations",
      "Negotiate commercial terms, pricing and delivery schedules",
      "Coordinate with purchase, warehouse and dispatch teams for project supplies",
      "Ensure timely documentation, invoicing and payment follow-up",
      "Maintain regular contact with decision makers, site engineers and purchase teams",
      "Identify repeat and upsell opportunities across projects",
    ],
    skillsRequired: [
      "Strong relationship building and negotiation skills",
      "Ability to read BOQs and understand project timelines",
      "Good knowledge of cables, wires, panels and electrical materials",
      "Professional communication and presentation skills",
      "Strong follow-up and problem-solving ability",
    ],
    qualification:
      "Graduate (B.E./Diploma in Electrical is a plus). Experience in project or institutional sales preferred.",
    tags: ["Builders & EPC", "BOQ Quotations", "Institutional Sales", "Key Account Management"],
  },

  // 5. Technical Sales Engineer (Cables & Wires)
  {
    id: "technical-sales-engineer",
    no: 5,
    title: "Technical Sales Engineer (Cables & Wires)",
    department: "Sales & Business Development",
    location: "Ahmedabad, Gujarat / Field",
    workMode: "Full-time",
    experience: "2 to 5 years",
    education: "B.E. / B.Tech or Diploma in Electrical Engineering",
    packageLpa: "Competitive Technical Engineering Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole:
      "The Technical Sales Engineer helps customers choose the right cable or wire for the job. You will support sales with technical knowledge, guide electricians and contractors, and build trust with product expertise.",
    responsibilities: [
      "Advise customers on the right cable and wire type, size and specification for their application",
      "Support the sales team with technical discussions, product demos and site visits",
      "Prepare technical quotations and compare products and brands",
      "Share datasheets, certifications and compliance information on request",
      "Resolve product-related queries and coordinate with brand representatives",
      "Conduct product knowledge sessions for dealers and electricians",
    ],
    skillsRequired: [
      "Strong understanding of cables, wires, load calculations and electrical standards (IS/IEC)",
      "Ability to explain technical points in simple language",
      "Good communication and customer handling skills",
      "Comfortable with site visits and travel",
      "Working knowledge of Excel and CRM tools",
    ],
    qualification:
      "B.E./B.Tech or Diploma in Electrical Engineering. Experience with cable or electrical brands preferred.",
    tags: ["Cable Sizing", "IS/IEC Standards", "Datasheets & GTP", "Technical Pre-Sales"],
  },

  // 6. Inside Sales Executive (Tele-sales)
  {
    id: "inside-sales-executive-tele-sales",
    no: 6,
    title: "Inside Sales Executive (Tele-sales)",
    department: "Sales & Business Development",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "0 to 2 years",
    education: "Graduate or Higher Secondary with strong communication skills",
    packageLpa: "Competitive Fixed + Daily Call Performance Incentives",
    openingsCount: 3,
    isFeatured: false,
    aboutRole:
      "The Inside Sales Executive keeps Volamp in constant touch with dealers and electricians through calls and messages. You will follow up on leads, take repeat orders, and support the field sales team so no opportunity is missed.",
    responsibilities: [
      "Make outbound calls to dealers, electricians and contractors daily",
      "Follow up on enquiries, quotations and pending orders",
      "Take repeat orders and share price lists, schemes and stock updates",
      "Log all calls, outcomes and next steps in the CRM",
      "Schedule field visits and hand over hot leads to the sales team",
      "Reactivate inactive customers through regular outreach",
    ],
    skillsRequired: [
      "Clear, confident communication in Hindi, Gujarati and English",
      "Telephone etiquette and persuasive follow-up",
      "Basic computer skills, including Excel and CRM data entry",
      "Good listening skills and patience",
      "Ability to hit daily call and conversion targets",
    ],
    qualification:
      "Graduate or Higher Secondary with strong communication skills. Freshers are welcome to apply.",
    tags: ["Tele-Sales", "Customer Retention", "Outbound Inquiries", "Order Booking"],
  },

  // 7. Operations Manager
  {
    id: "operations-manager",
    no: 7,
    title: "Operations Manager",
    department: "Operations, Warehouse & Logistics",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "6 to 10 years",
    education: "Graduate or MBA (Operations / Supply Chain preferred)",
    packageLpa: "Senior Management Band",
    openingsCount: 1,
    isFeatured: true,
    aboutRole:
      "The Operations Manager runs the engine that turns orders into on-time deliveries. You will lead order processing, warehouse, dispatch and logistics teams, and build systems that keep Volamp fast, accurate and scalable across India.",
    responsibilities: [
      "Oversee the full order-to-delivery process, from sales order to delivery challan and dispatch",
      "Lead operations coordinators, warehouse and logistics staff",
      "Set and monitor KPIs for order turnaround, dispatch accuracy and delivery timelines",
      "Work with purchase to maintain the right stock levels and avoid stock-outs",
      "Manage transporter relationships, freight costs and delivery performance",
      "Improve processes and SOPs, and push for better use of CRM and digital tools",
      "Resolve escalations related to delivery, damages and shortages",
      "Report operational performance to management every week",
    ],
    skillsRequired: [
      "Strong leadership and process orientation",
      "Experience in distribution, warehousing or supply chain",
      "Good knowledge of ERP or CRM and reporting in Excel",
      "Problem-solving and decision-making under pressure",
      "Clear communication across sales, accounts and warehouse teams",
    ],
    qualification:
      "Graduate or MBA (Operations/Supply Chain preferred). Minimum 6 years of operations experience in distribution or trading.",
    tags: ["Order-to-Delivery", "Warehouse SOPs", "Freight Optimization", "Operations KPIs"],
  },

  // 8. Operations Coordinator
  {
    id: "operations-coordinator",
    no: 8,
    title: "Operations Coordinator",
    department: "Operations, Warehouse & Logistics",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 3 years",
    education: "Graduate (Commerce preferred)",
    packageLpa: "Competitive Operations Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole:
      "The Operations Coordinator is the link between sales, warehouse and accounts. You will make sure every approved order is processed correctly, dispatched on time, and documented properly.",
    responsibilities: [
      "Process sales orders, proforma invoices and delivery challans accurately",
      "Coordinate with the warehouse for stock confirmation, packing and dispatch",
      "Arrange transport and share dispatch details (LR number, vehicle, ETA) with customers and sales",
      "Track pending orders and follow up until delivery is complete",
      "Maintain dispatch records and keep CRM entries updated",
      "Handle customer queries on order status, shortages and returns",
    ],
    skillsRequired: [
      "Strong attention to detail and order accuracy",
      "Good coordination and follow-up skills",
      "Working knowledge of Excel, CRM and email",
      "Clear communication in Hindi, Gujarati and English",
      "Ability to handle multiple orders at the same time",
    ],
    qualification:
      "Graduate (Commerce preferred). Experience in order processing or dispatch coordination is an advantage.",
    tags: ["Order Processing", "Delivery Challans", "Transport Booking", "Dispatch Tracking"],
  },

  // 9. Warehouse In-charge
  {
    id: "warehouse-in-charge",
    no: 9,
    title: "Warehouse In-charge",
    department: "Operations, Warehouse & Logistics",
    location: "Ahmedabad, Gujarat (Warehouse)",
    workMode: "Full-time",
    experience: "4 to 8 years",
    education: "Graduate or Higher Secondary with relevant warehouse experience",
    packageLpa: "Competitive Warehouse Management Band",
    openingsCount: 2,
    isFeatured: true,
    aboutRole:
      "The Warehouse In-charge manages the physical heart of Volamp: our stock. You will make sure materials are received, stored, picked and dispatched accurately, safely and on time.",
    responsibilities: [
      "Supervise receiving, storage, picking, packing and dispatch of cables, wires and electrical goods",
      "Maintain accurate stock records and conduct regular physical stock verification",
      "Check incoming goods against purchase orders for quantity, brand and condition",
      "Organise the warehouse for easy access, safety and minimum damage",
      "Manage warehouse staff, loaders and daily workload",
      "Coordinate with operations for dispatch schedules and with purchase for replenishment",
      "Report damaged, slow-moving and short stock promptly",
    ],
    skillsRequired: [
      "Hands-on warehouse and inventory management experience",
      "Knowledge of cable drums, coils and handling of electrical materials",
      "Basic computer skills for stock entry and reports",
      "Team supervision and discipline",
      "Honesty, accuracy and a safety-first approach",
    ],
    qualification:
      "Graduate or Higher Secondary with relevant warehouse experience, preferably in electrical, hardware or building materials.",
    tags: ["Cable Drums & Coils", "Physical Audit", "Material Safety", "Team Supervision"],
  },

  // 10. Logistics & Dispatch Executive
  {
    id: "logistics-dispatch-executive",
    no: 10,
    title: "Logistics & Dispatch Executive",
    department: "Operations, Warehouse & Logistics",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 3 years",
    education: "Graduate or Higher Secondary",
    packageLpa: "Competitive Logistics Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole:
      "The Logistics & Dispatch Executive makes sure every shipment reaches the customer safely and on time, anywhere in India. You will manage transporters, vehicles and delivery documents.",
    responsibilities: [
      "Plan and arrange transport for daily dispatches, including part loads and full loads",
      "Coordinate with transporters, drivers and the warehouse for loading and timelines",
      "Prepare and verify dispatch documents: invoice, delivery challan, e-way bill and LR",
      "Track shipments and update sales and customers on delivery status",
      "Negotiate freight rates and monitor transporter performance",
      "Handle transit damage, shortage and delivery delay claims",
    ],
    skillsRequired: [
      "Knowledge of transport, freight and e-way bill processes",
      "Strong coordination and follow-up",
      "Good Excel and basic computer skills",
      "Communication skills for dealing with transporters and customers",
      "Ability to work under tight timelines",
    ],
    qualification:
      "Graduate or Higher Secondary. Experience in logistics, transport coordination or dispatch preferred.",
    tags: ["E-way Bills & LR", "Freight Negotiation", "Pan-India Freight", "Consignment Tracking"],
  },

  // 11. Inventory Controller
  {
    id: "inventory-controller",
    no: 11,
    title: "Inventory Controller",
    department: "Operations, Warehouse & Logistics",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "2 to 5 years",
    education: "Graduate (Commerce or Science)",
    packageLpa: "Competitive Inventory Band",
    openingsCount: 1,
    isFeatured: false,
    aboutRole:
      "The Inventory Controller keeps Volamp's stock numbers right. You will make sure what is on the system matches what is on the shelf, and give the purchase and sales teams a clear picture of availability.",
    responsibilities: [
      "Reconcile system stock with physical stock through cycle counts and audits",
      "Monitor fast-moving, slow-moving and dead stock and report weekly",
      "Maintain accurate stock records by brand, size and category",
      "Investigate and resolve stock mismatches, damages and shortages",
      "Support purchase with reorder level and stock availability reports",
      "Ensure goods receipts and dispatches are entered correctly and on time",
    ],
    skillsRequired: [
      "Strong analytical and Excel skills (pivot tables, VLOOKUP/XLOOKUP)",
      "High attention to detail and accuracy",
      "Experience with inventory or ERP software",
      "Understanding of stock valuation and movement analysis",
      "Integrity and a structured way of working",
    ],
    qualification:
      "Graduate (Commerce or Science). Experience in inventory control or stores management preferred.",
    tags: ["Cycle Counts", "Stock Reconciliation", "Aging & Dead Stock", "ERP Records"],
  },

  // 12. Purchase Manager
  {
    id: "purchase-manager",
    no: 12,
    title: "Purchase Manager",
    department: "Purchase, Accounts & Finance",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "6 to 10 years",
    education: "Graduate or MBA",
    packageLpa: "Senior Commercial Band",
    openingsCount: 1,
    isFeatured: true,
    aboutRole:
      "The Purchase Manager makes sure Volamp always has the right products, in the right quantity, at the right price. You will manage relationships with major brands and suppliers, and balance stock availability with working capital.",
    responsibilities: [
      "Plan and place purchase orders with brands and suppliers based on sales demand and stock levels",
      "Negotiate prices, schemes, credit terms and delivery timelines",
      "Maintain strong relationships with brand representatives and suppliers",
      "Monitor stock levels, lead times and market price movements, especially for copper and cable products",
      "Coordinate with warehouse and operations for goods receipt and quality checks",
      "Work with accounts on supplier invoices, payments and reconciliations",
      "Analyse purchase data to reduce costs and avoid dead stock",
    ],
    skillsRequired: [
      "Strong negotiation and vendor management skills",
      "Understanding of the electrical products market and pricing trends",
      "Good analytical skills and Excel reporting",
      "Planning and forecasting ability",
      "Integrity and strong decision-making",
    ],
    qualification:
      "Graduate or MBA. Minimum 6 years of purchase experience in distribution or trading, preferably in electrical products.",
    tags: ["Vendor Relations", "Copper/Cable Pricing", "Commercial Negotiation", "Working Capital"],
  },

  // 13. Accountant
  {
    id: "accountant",
    no: 13,
    title: "Accountant",
    department: "Purchase, Accounts & Finance",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "2 to 5 years",
    education: "B.Com / M.Com (CA Inter or equivalent is a plus)",
    packageLpa: "Competitive Accounting Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole:
      "The Accountant keeps Volamp's books accurate, compliant and up to date. You will handle day-to-day accounting, reconciliations and statutory work so management always has a clear financial picture.",
    responsibilities: [
      "Record sales, purchase, receipts, payments and journal entries accurately",
      "Prepare and verify invoices, credit notes and debit notes",
      "Perform bank, supplier and customer ledger reconciliations",
      "Support GST filing, TDS and other statutory compliance",
      "Prepare monthly MIS, trial balance and supporting schedules",
      "Assist auditors and the CA with documentation and queries",
      "Maintain proper records and vouchers",
    ],
    skillsRequired: [
      "Strong knowledge of accounting principles, GST and TDS",
      "Hands-on experience with Tally or similar accounting software",
      "Advanced Excel skills",
      "Accuracy, honesty and attention to detail",
      "Ability to meet month-end deadlines",
    ],
    qualification:
      "B.Com / M.Com (CA Inter or equivalent is a plus). Experience in a trading or distribution business preferred.",
    tags: ["Tally & Excel", "Bank Reconciliation", "GST & TDS", "Financial MIS"],
  },

  // 14. Accounts Receivable Associate
  {
    id: "accounts-receivable-associate",
    no: 14,
    title: "Accounts Receivable Associate",
    department: "Purchase, Accounts & Finance",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 4 years",
    education: "B.Com or equivalent",
    packageLpa: "Competitive Finance Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole:
      "The Accounts Receivable Associate protects Volamp's cash flow. You will track customer outstanding, follow up on payments, and work closely with the sales team to keep collections healthy.",
    responsibilities: [
      "Monitor customer outstanding, ageing and credit limits daily",
      "Follow up with dealers, contractors and builders on due and overdue payments",
      "Match receipts to invoices and update records promptly",
      "Share outstanding statements and payment reminders with customers and sales",
      "Coordinate with sales on collection plans and disputed invoices",
      "Flag high-risk accounts and recommend credit holds when needed",
      "Prepare weekly collection and ageing reports for management",
    ],
    skillsRequired: [
      "Good understanding of receivables, ageing analysis and credit control",
      "Polite but firm communication and follow-up skills",
      "Working knowledge of Tally or accounting software and Excel",
      "Accuracy and organisation",
      "Ability to build good relations while collecting payments",
    ],
    qualification:
      "B.Com or equivalent. Experience in collections, credit control or accounts receivable preferred.",
    tags: ["Credit Control", "Aging Analysis", "Payment Follow-up", "Customer Ledger"],
  },

  // 15. GST & Compliance Executive
  {
    id: "gst-compliance-executive",
    no: 15,
    title: "GST & Compliance Executive",
    department: "Purchase, Accounts & Finance",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "2 to 4 years",
    education: "B.Com / M.Com or equivalent (GST certification or CA/CS inter is an advantage)",
    packageLpa: "Competitive Taxation Band",
    openingsCount: 1,
    isFeatured: false,
    aboutRole:
      "The GST & Compliance Executive keeps Volamp fully compliant with tax and statutory requirements. You will manage filings, reconciliations and documentation so the business stays audit-ready.",
    responsibilities: [
      "Prepare and file GST returns (GSTR-1, GSTR-3B) and reconcile with books and GSTR-2B",
      "Generate and monitor e-invoices and e-way bills",
      "Handle TDS/TCS calculations, payments and return filing",
      "Resolve GST notices, mismatches and input tax credit issues with the CA",
      "Maintain statutory records and compliance calendars",
      "Support PAN India operations with state-wise GST requirements",
    ],
    skillsRequired: [
      "Strong working knowledge of GST law and portal filing",
      "Experience with Tally, GST software and Excel",
      "Attention to detail and deadline discipline",
      "Understanding of e-invoice and e-way bill rules",
      "Clear communication with auditors and consultants",
    ],
    qualification:
      "B.Com / M.Com or equivalent. GST certification or CA/CS inter is an advantage.",
    tags: ["GSTR-1 & 3B", "Input Tax Credit", "E-invoicing Portal", "Statutory Compliance"],
  },

  // 16. Business Analyst
  {
    id: "business-analyst",
    no: 16,
    title: "Business Analyst",
    department: "Business Analytics, CRM & Marketing",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "2 to 5 years",
    education: "Graduate in Commerce, Engineering, Statistics or MBA",
    packageLpa: "Competitive Analytics Band",
    openingsCount: 1,
    isFeatured: true,
    aboutRole:
      "The Business Analyst turns Volamp's data into decisions. You will analyse sales, CRM, purchase and operations data, build reports and dashboards, and help the leadership team see what is working and what needs attention.",
    responsibilities: [
      "Analyse sales, customer, product and team performance data from the CRM and accounting systems",
      "Build dashboards and regular reports for management, sales and operations",
      "Track KPIs such as calls, visits, quotations, conversion, order value and outstanding",
      "Identify trends, gaps and growth opportunities across regions, brands and customer segments",
      "Support target setting, forecasting and business planning",
      "Work with teams to improve processes and data quality",
      "Present insights in a clear, simple way to non-technical stakeholders",
    ],
    skillsRequired: [
      "Advanced Excel and Google Sheets skills",
      "Experience with CRM systems (Zoho CRM is a plus) and data extraction",
      "Knowledge of SQL, Power BI, Looker Studio or similar tools is an advantage",
      "Strong analytical and problem-solving ability",
      "Clear communication and presentation skills",
    ],
    qualification:
      "Graduate in Commerce, Engineering, Statistics or MBA. Experience in sales or business analytics preferred.",
    tags: ["Data Analytics", "Power BI / SQL", "Sales KPIs", "Business Dashboards"],
  },

  // 17. CRM Executive (Zoho CRM)
  {
    id: "crm-executive-zoho",
    no: 17,
    title: "CRM Executive (Zoho CRM)",
    department: "Business Analytics, CRM & Marketing",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 3 years",
    education: "Graduate in any stream",
    packageLpa: "Competitive Operations Band",
    openingsCount: 1,
    isFeatured: false,
    aboutRole:
      "The CRM Executive makes sure Volamp's CRM is accurate, active and useful for every team. You will manage data, support users and help keep the full lead-to-delivery process running smoothly.",
    responsibilities: [
      "Maintain clean and accurate lead, contact, quote and order data in the CRM",
      "Train and support sales and operations team members on correct CRM usage",
      "Monitor daily activity, follow-up tasks and pending actions, and report gaps",
      "Create and update records, fields, views and basic reports as required",
      "Support the flow from lead to quote, proforma invoice, sales order and delivery challan",
      "Work with the Business Analyst to improve reports and automation",
    ],
    skillsRequired: [
      "Hands-on experience with Zoho CRM or any CRM platform",
      "Strong Excel and data handling skills",
      "Process mindset and attention to detail",
      "Good communication and training ability",
      "Basic understanding of workflows and automation",
    ],
    qualification:
      "Graduate in any stream. Experience with CRM administration or data management is an advantage.",
    tags: ["Zoho CRM", "Lead-to-Order Flow", "Data Hygiene", "Workflow Automation"],
  },

  // 18. Customer Support Executive
  {
    id: "customer-support-executive",
    no: 18,
    title: "Customer Support Executive",
    department: "Business Analytics, CRM & Marketing",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "0 to 2 years",
    education: "Graduate or Higher Secondary with strong communication skills",
    packageLpa: "Competitive Support Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole:
      "The Customer Support Executive is the friendly voice of Volamp. You will help customers with order status, product information, delivery updates and complaints, and make sure every query is closed with care.",
    responsibilities: [
      "Respond to customer calls, WhatsApp messages and emails quickly and politely",
      "Share order, dispatch and delivery updates with customers",
      "Log complaints and queries, and follow up with internal teams until they are resolved",
      "Coordinate with sales, warehouse and accounts to solve customer issues",
      "Collect customer feedback and report common problems",
      "Maintain accurate records of all support interactions",
    ],
    skillsRequired: [
      "Excellent communication and listening skills in Hindi, Gujarati and English",
      "Patience, empathy and a problem-solving attitude",
      "Basic computer skills, including email and Excel",
      "Ability to multitask and stay calm under pressure",
      "Willingness to learn about electrical products",
    ],
    qualification:
      "Graduate or Higher Secondary. Freshers with strong communication skills are welcome.",
    tags: ["WhatsApp & Phone", "Customer Care", "Order Status Tracking", "Problem Resolution"],
  },

  // 19. Digital Marketing Executive
  {
    id: "digital-marketing-executive",
    no: 19,
    title: "Digital Marketing Executive",
    department: "Business Analytics, CRM & Marketing",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 3 years",
    education: "Graduate in Marketing, Mass Communication, IT or related field",
    packageLpa: "Competitive Marketing Band",
    openingsCount: 1,
    isFeatured: false,
    aboutRole:
      "The Digital Marketing Executive builds Volamp's brand and lead pipeline online. You will manage our website, social media and campaigns to reach dealers, electricians, contractors and builders across India.",
    responsibilities: [
      "Plan and run social media content on LinkedIn, Instagram, Facebook and YouTube",
      "Create email and WhatsApp campaigns for dealers and customers",
      "Manage website content, SEO and Google Business Profile",
      "Run and track paid campaigns on Google and Meta to generate leads",
      "Coordinate with brand partners for co-branded promotions and schemes",
      "Create creatives, banners and short videos with designers or tools",
      "Share campaign performance and lead quality reports with sales",
    ],
    skillsRequired: [
      "Knowledge of SEO, social media and paid advertising",
      "Content writing and basic design skills (Canva or similar)",
      "Familiarity with Google Analytics and campaign tracking",
      "Creativity and consistency",
      "Understanding of B2B marketing is an advantage",
    ],
    qualification:
      "Graduate in Marketing, Mass Communication, IT or related field. Digital marketing certification is a plus.",
    tags: ["SEO & Content", "Google & Meta Ads", "Social Media", "Lead Generation"],
  },

  // 20. HR Executive
  {
    id: "hr-executive",
    no: 20,
    title: "HR Executive",
    department: "Human Resources",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "2 to 5 years",
    education: "MBA / PGDM in HR or equivalent",
    packageLpa: "Competitive HR Management Band",
    openingsCount: 1,
    isFeatured: true,
    aboutRole:
      "The HR Executive builds the team behind Volamp's growth. You will manage hiring, onboarding, attendance, payroll inputs and employee engagement, and help create a culture where people want to stay and perform.",
    responsibilities: [
      "Manage end-to-end recruitment: job postings, sourcing, screening, interviews and offers",
      "Run onboarding, documentation and induction for new joiners",
      "Maintain employee records, attendance, leave and payroll inputs",
      "Support performance reviews, goal setting and training programmes",
      "Handle employee queries, grievances and engagement activities",
      "Ensure compliance with labour laws, PF, ESIC and company policies",
      "Maintain the careers page and hiring pipeline in coordination with department heads",
    ],
    skillsRequired: [
      "Strong recruitment and interviewing skills",
      "Knowledge of HR policies, payroll basics and labour compliance",
      "Excellent communication and interpersonal skills",
      "Good with Excel, HR tools and documentation",
      "Confidentiality, fairness and professionalism",
    ],
    qualification:
      "MBA/PGDM in HR or equivalent. Experience in HR within a trading or distribution company preferred.",
    tags: ["Talent Acquisition", "Onboarding & Payroll", "Statutory PF/ESIC", "Employee Engagement"],
  },
];
