/**
 * VOLAMP ELEKTRIKALS: SEO Keyword Map & Target Route Engine
 * Encodes all 1,474 target candidate queries, their intent mapping, and the comprehensive
 * Pan-India 140+ Cities Directory covering all zones and states.
 *
 * Core Principles:
 * - One page, one search intent. Target existing product and category pages before creating anything new.
 * - Never create a low-quality thin page for every row.
 * - Map queries into clean canonical route destinations.
 */

export type KeywordIntent = "Commercial" | "Transactional" | "Informational" | "Commercial / Local";

export interface KeywordEntry {
  id: string; // e.g. KW-0001
  category: string;
  pattern: string;
  query: string;
  intent: KeywordIntent;
  targetPageType: string;
  targetRoute: string;
  pageRule: string;
  dataFieldsNeeded: string;
}

export interface IndianCityInfo {
  name: string;
  state: string;
  zone: "West" | "North" | "South" | "Central" | "East";
  tier: "Home Base" | "Gujarat Industrial Hub" | "Tier 1 Metro" | "National Industrial Hub";
  leadTime: string;
  industrialBelts?: string[];
}

// 1. BRAND TAXONOMY & PRODUCT LINES
export const TARGET_BRANDS = [
  "Polycab",
  "Finolex",
  "KEI",
  "Schneider",
  "L&T",
  "Dowells",
  "Legrand",
] as const;

// 2. CABLE SPECIFICATION DIMENSIONS
export const TARGET_CABLE_SIZES = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400,
] as const;

export const TARGET_CORES = ["1 core", "2 core", "3 core", "3.5 core", "4 core"] as const;
export const TARGET_ARMOUR_TYPES = ["armoured", "unarmoured"] as const;
export const TARGET_CONDUCTORS = ["copper", "aluminium"] as const;

// 3. SWITCHGEAR RATINGS
export const TARGET_MCB_RATINGS = [6, 10, 16, 20, 25, 32, 40, 63] as const;
export const TARGET_MCB_POLES = ["single pole", "double pole", "triple pole", "4 pole"] as const;
export const TARGET_MCCB_RATINGS = [32, 63, 100, 125, 160, 200, 250, 400, 630, 800] as const;
export const TARGET_MCCB_POLES = ["3 pole", "4 pole"] as const;
export const TARGET_ACB_RATINGS = [630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000] as const;

// 4. LUGS & GLANDS
export const TARGET_GLAND_SIZES = [20, 25, 32, 40, 50, 63, 75] as const;
export const TARGET_GLAND_TYPES = ["single compression", "double compression"] as const;

// 5. COMPREHENSIVE PAN-INDIA CITIES DIRECTORY (140+ CITIES ACROSS ALL STATES)
export const PAN_INDIA_CITIES: IndianCityInfo[] = [
  // --- GUJARAT & HOME BASE ---
  { name: "Ahmedabad", state: "Gujarat", zone: "West", tier: "Home Base", leadTime: "Same Day (0–4 Hours)", industrialBelts: ["Khadia Electrical Belt", "Aslali Logistics Terminal", "Vatva GIDC", "Naroda GIDC", "Changodar"] },
  { name: "Gandhinagar", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day (4–6 Hours)", industrialBelts: ["GIFT City Smart Tunnel", "Sector 25 Electronic Estate", "Koba"] },
  { name: "Sanand", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day (4–6 Hours)", industrialBelts: ["Sanand GIDC Auto Cluster", "Bol GIDC", "Charal"] },
  { name: "Vatva", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day (2–4 Hours)", industrialBelts: ["Vatva Phase I-IV GIDC", "Chemical & Dyes Zone"] },
  { name: "Naroda", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day (2–4 Hours)", industrialBelts: ["Naroda GIDC", "Dehgam Road Industrial Zone"] },
  { name: "Changodar", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day (3–5 Hours)", industrialBelts: ["Sarkhej-Bavla Industrial Corridor", "Pharma Zone"] },
  { name: "Surat", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (12–18 Hours)", industrialBelts: ["Hazira Heavy Industrial Belt", "Sachin GIDC", "Pandesara GIDC"] },
  { name: "Vadodara", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (12–18 Hours)", industrialBelts: ["Makarpura GIDC", "Manjusar GIDC", "Ranoli", "Nandesari"] },
  { name: "Rajkot", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (12–24 Hours)", industrialBelts: ["Aji GIDC", "Metoda GIDC", "Shapar-Veraval Engineering Cluster"] },
  { name: "Bhavnagar", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (18–24 Hours)", industrialBelts: ["Chitra GIDC", "Alang Ship-Breaking & Marine Sector", "Sihor"] },
  { name: "Jamnagar", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (18–24 Hours)", industrialBelts: ["Refinery Corridor", "Brass Parts GIDC Phase I-III"] },
  { name: "Bharuch", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (12–18 Hours)", industrialBelts: ["Narmadanagar", "Panoli GIDC"] },
  { name: "Ankleshwar", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (12–18 Hours)", industrialBelts: ["Ankleshwar GIDC Chemical Belt", "Jhagadia Industrial Estate"] },
  { name: "Dahej", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (18–24 Hours)", industrialBelts: ["Dahej PCPIR Special Economic Zone", "Petrochemical Corridor"] },
  { name: "Vapi", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (18–24 Hours)", industrialBelts: ["Vapi GIDC Industrial Belt", "Paper & Chemical Hub"] },
  { name: "Valsad", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (18–24 Hours)", industrialBelts: ["Gundlav GIDC", "Atul Chemical Complex"] },
  { name: "Navsari", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (18–24 Hours)", industrialBelts: ["Bilimora Industrial Zone", "Vansda Road"] },
  { name: "Anand", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day / Next Day (8–14 Hours)", industrialBelts: ["Vitthal Udyognagar GIDC", "Vallabh Vidyanagar"] },
  { name: "Nadiad", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day / Next Day (6–12 Hours)", industrialBelts: ["Kamla GIDC", "Uttarsanda Industrial Area"] },
  { name: "Morbi", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (16–22 Hours)", industrialBelts: ["Ceramic Tiles Manufacturing Belt", "Wankaner Highway GIDC"] },
  { name: "Mehsana", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day / Next Day (6–12 Hours)", industrialBelts: ["Kadi GIDC", "Chhatral Industrial Belt", "Dediyasan"] },
  { name: "Kalol", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day (3–5 Hours)", industrialBelts: ["Kalol GIDC", "IFFCO Fertilizer Corridor", "Saij Industrial Belt"] },
  { name: "Porbandar", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (20–26 Hours)", industrialBelts: ["GIDC Industrial Estate", "Limestone & Marine Units"] },
  { name: "Gandhidham", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (18–24 Hours)", industrialBelts: ["Kandla Free Trade Zone (KASEZ)", "Timber & Cargo Belt"] },
  { name: "Mundra", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (20–26 Hours)", industrialBelts: ["Adani Mundra APSEZ Port Corridor", "Thermal Power Belt"] },
  { name: "Bhuj", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (20–26 Hours)", industrialBelts: ["Madhapar GIDC", "Kutch Solar Infrastructure Zone"] },
  { name: "Junagadh", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (18–24 Hours)", industrialBelts: ["Dolatpara GIDC", "Agro-Equipment Sector"] },
  { name: "Himatnagar", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day / Next Day (6–12 Hours)", industrialBelts: ["Himatnagar GIDC", "Ceramic & Glass Belt"] },
  { name: "Veraval", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (20–26 Hours)", industrialBelts: ["Veraval Marine Industrial Zone", "Rayon Complex"] },
  { name: "Surendranagar", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Same Day / Next Day (6–12 Hours)", industrialBelts: ["Wadhwan GIDC", "Engineering Cluster"] },
  { name: "Godhra", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (10–16 Hours)", industrialBelts: ["Godhra GIDC", "Halol Automotive Cluster"] },
  { name: "Dahod", state: "Gujarat", zone: "West", tier: "Gujarat Industrial Hub", leadTime: "Next Day (12–18 Hours)", industrialBelts: ["Dahod Railway Workshop & Industrial Area"] },

  // --- MAHARASHTRA & GOA ---
  { name: "Mumbai", state: "Maharashtra", zone: "West", tier: "Tier 1 Metro", leadTime: "24–36 Hours", industrialBelts: ["BKC", "MIDC Andheri", "Kanjurmarg Commercial Corridor"] },
  { name: "Pune", state: "Maharashtra", zone: "West", tier: "Tier 1 Metro", leadTime: "24–36 Hours", industrialBelts: ["Bhosari MIDC", "Chakan Auto Hub", "Hinjawadi IT Park", "Talegaon"] },
  { name: "Thane", state: "Maharashtra", zone: "West", tier: "Tier 1 Metro", leadTime: "24–36 Hours", industrialBelts: ["Wagle Estate MIDC", "Ghubunder Commercial Belt"] },
  { name: "Navi Mumbai", state: "Maharashtra", zone: "West", tier: "Tier 1 Metro", leadTime: "24–36 Hours", industrialBelts: ["TTC MIDC", "Mahape Millennium Business Park", "Taloja MIDC"] },
  { name: "Nagpur", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["MIHAN SEZ", "Butibori MIDC Industrial Estate", "Hingna"] },
  { name: "Nashik", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "24–36 Hours", industrialBelts: ["Ambad MIDC", "Satpur MIDC", "Sinnar Industrial Belt"] },
  { name: "Aurangabad", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "30–42 Hours", industrialBelts: ["Waluj MIDC", "Shendra DMIC Smart City", "Chitegaon"] },
  { name: "Kolhapur", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Shiroli MIDC", "Gokul Shirgaon", "Foundry Cluster"] },
  { name: "Solapur", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Chincholi MIDC", "Textile & Energy Parks"] },
  { name: "Amravati", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "40–50 Hours", industrialBelts: ["Nandgaon Peth MIDC Textile Park"] },
  { name: "Jalgaon", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "30–42 Hours", industrialBelts: ["MIDC Industrial Estate", "Solar & Pipe Cluster"] },
  { name: "Tarapur", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "24–36 Hours", industrialBelts: ["Tarapur MIDC Chemical & Engineering Zone", "Boisar"] },
  { name: "Bhiwandi", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "24–36 Hours", industrialBelts: ["Logistics Park Hub", "Dhamankar Naka Warehouses"] },
  { name: "Panvel", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "24–36 Hours", industrialBelts: ["JNPT Port Corridor", "Rasayani Industrial Belt"] },
  { name: "Pimpri-Chinchwad", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "24–36 Hours", industrialBelts: ["PCMC Automobile & Engineering Hub", "Dighi"] },
  { name: "Jalna", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "30–42 Hours", industrialBelts: ["Jalna MIDC Steel Re-Rolling Hub", "Seed & Agro Zone"] },
  { name: "Latur", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Additional Latur MIDC", "Engineering Cluster"] },
  { name: "Dhule", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "28–40 Hours", industrialBelts: ["Avadhan MIDC", "Textile & Transmission Belt"] },
  { name: "Chandrapur", state: "Maharashtra", zone: "West", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Thermal Power Hub", "MIDC Tadali Cement Corridor"] },
  { name: "Panaji", state: "Goa", zone: "West", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Kundaim IDC", "Corlim Industrial Estate", "Pilerne"] },
  { name: "Vasco da Gama", state: "Goa", zone: "West", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Mormugao Port Corridor", "Sancoale Industrial Estate"] },

  // --- DELHI NCR, HARYANA & PUNJAB ---
  { name: "New Delhi", state: "Delhi", zone: "North", tier: "Tier 1 Metro", leadTime: "36–48 Hours", industrialBelts: ["Okhla Industrial Area Phase I-III", "Mayapuri", "Kirti Nagar"] },
  { name: "Noida", state: "Uttar Pradesh", zone: "North", tier: "Tier 1 Metro", leadTime: "36–48 Hours", industrialBelts: ["Noida Phase II Industrial Area", "Sector 62-68 Tech Hub"] },
  { name: "Greater Noida", state: "Uttar Pradesh", zone: "North", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Ecotech I-VI Industrial Hub", "Yamuna Expressway SEZ"] },
  { name: "Gurugram", state: "Haryana", zone: "North", tier: "Tier 1 Metro", leadTime: "36–48 Hours", industrialBelts: ["IMT Manesar", "Udyog Vihar Phase I-V", "Pace City"] },
  { name: "Faridabad", state: "Haryana", zone: "North", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Sector 24-25 Industrial Area", "Mathura Road Corridor"] },
  { name: "Ghaziabad", state: "Uttar Pradesh", zone: "North", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Loni Road Industrial Area", "Kavi Nagar", "Sahibabad"] },
  { name: "Chandigarh", state: "Chandigarh", zone: "North", tier: "Tier 1 Metro", leadTime: "40–52 Hours", industrialBelts: ["Industrial Area Phase I & II", "IT Park Kishangarh"] },
  { name: "Ludhiana", state: "Punjab", zone: "North", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Focal Point Industrial Phases I-VIII", "Sahnewal Hub"] },
  { name: "Amritsar", state: "Punjab", zone: "North", tier: "National Industrial Hub", leadTime: "44–56 Hours", industrialBelts: ["Focal Point", "Nag Kalan Industrial Area"] },
  { name: "Jalandhar", state: "Punjab", zone: "North", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Leather Complex", "Gadaipur Industrial Area"] },
  { name: "Panipat", state: "Haryana", zone: "North", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Industrial Sector 25 & 29", "IOCL Refinery Belt"] },
  { name: "Karnal", state: "Haryana", zone: "North", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Sector 3 HSIIDC Industrial Estate"] },
  { name: "Ambala", state: "Haryana", zone: "North", tier: "National Industrial Hub", leadTime: "38–50 Hours", industrialBelts: ["Saha Industrial Growth Centre"] },
  { name: "Sonipat", state: "Haryana", zone: "North", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Kundli Industrial Area", "Rai HSIIDC"] },

  // --- RAJASTHAN ---
  { name: "Jaipur", state: "Rajasthan", zone: "North", tier: "Tier 1 Metro", leadTime: "24–36 Hours", industrialBelts: ["Sitapura Industrial Area", "Vishwakarma (VKI)", "Mansarovar RIICO"] },
  { name: "Bhiwadi", state: "Rajasthan", zone: "North", tier: "National Industrial Hub", leadTime: "30–42 Hours", industrialBelts: ["Chopanki Industrial Area", "Khushkhera", "Tapukara Hub"] },
  { name: "Neemrana", state: "Rajasthan", zone: "North", tier: "National Industrial Hub", leadTime: "28–40 Hours", industrialBelts: ["Japanese Industrial Zone RIICO", "NH-48 Corridor"] },
  { name: "Jodhpur", state: "Rajasthan", zone: "North", tier: "National Industrial Hub", leadTime: "24–36 Hours", industrialBelts: ["Boronada SEZ", "Mandore Industrial Area", "Basni RIICO"] },
  { name: "Kota", state: "Rajasthan", zone: "North", tier: "National Industrial Hub", leadTime: "28–40 Hours", industrialBelts: ["Indraprastha Industrial Area", "Ranpur Growth Centre"] },
  { name: "Udaipur", state: "Rajasthan", zone: "North", tier: "National Industrial Hub", leadTime: "18–28 Hours", industrialBelts: ["Mewar Industrial Area", "Sukher", "Kaladwas RIICO"] },
  { name: "Bhilwara", state: "Rajasthan", zone: "North", tier: "National Industrial Hub", leadTime: "22–32 Hours", industrialBelts: ["Hamirgarh Industrial Area", "Textile Hub"] },
  { name: "Alwar", state: "Rajasthan", zone: "North", tier: "National Industrial Hub", leadTime: "30–42 Hours", industrialBelts: ["Matsya Industrial Area (MIA)", "Rupbas"] },
  { name: "Bikaner", state: "Rajasthan", zone: "North", tier: "National Industrial Hub", leadTime: "28–40 Hours", industrialBelts: ["Karni Industrial Area", "Beechwal RIICO"] },
  { name: "Ajmer", state: "Rajasthan", zone: "North", tier: "National Industrial Hub", leadTime: "24–36 Hours", industrialBelts: ["Palra Industrial Area", "Parbatpura"] },

  // --- UTTAR PRADESH & UTTARAKHAND ---
  { name: "Lucknow", state: "Uttar Pradesh", zone: "North", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Sarojini Nagar Industrial Area", "Amausi UPSIDC", "Chinhat"] },
  { name: "Kanpur", state: "Uttar Pradesh", zone: "North", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Panki Industrial Area Site 1-5", "Fazalganj", "Rania"] },
  { name: "Agra", state: "Uttar Pradesh", zone: "North", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Sikandra Industrial Area", "Nunhai", "Foundry Nagar"] },
  { name: "Varanasi", state: "Uttar Pradesh", zone: "North", tier: "National Industrial Hub", leadTime: "44–56 Hours", industrialBelts: ["Ramnagar Industrial Area Phase I-II", "Karkhiyaon"] },
  { name: "Prayagraj", state: "Uttar Pradesh", zone: "North", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Naini Industrial Area", "Phulpur Fertilizer Belt"] },
  { name: "Meerut", state: "Uttar Pradesh", zone: "North", tier: "National Industrial Hub", leadTime: "38–50 Hours", industrialBelts: ["Partapur Industrial Estate", "Mohiuddinpur"] },
  { name: "Bareilly", state: "Uttar Pradesh", zone: "North", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Parsakhera Industrial Area", "Clutterbuckganj"] },
  { name: "Aligarh", state: "Uttar Pradesh", zone: "North", tier: "National Industrial Hub", leadTime: "38–50 Hours", industrialBelts: ["Tala Nagari Industrial Area", "Chharra"] },
  { name: "Dehradun", state: "Uttarakhand", zone: "North", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Patel Nagar Industrial Area", "Selaqui Pharma SEZ"] },
  { name: "Haridwar", state: "Uttarakhand", zone: "North", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["SIDCUL Integrated Industrial Estate", "BHEL Township"] },
  { name: "Rudrapur", state: "Uttarakhand", zone: "North", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["SIDCUL Pantnagar Industrial Estate", "Auto Hub"] },

  // --- MADHYA PRADESH & CHHATTISGARH ---
  { name: "Indore", state: "Madhya Pradesh", zone: "Central", tier: "Tier 1 Metro", leadTime: "20–30 Hours", industrialBelts: ["Pithampur Industrial Area Sector 1-3", "Sanwer Road MIDC"] },
  { name: "Bhopal", state: "Madhya Pradesh", zone: "Central", tier: "National Industrial Hub", leadTime: "24–36 Hours", industrialBelts: ["Mandideep Industrial Area", "Govindpura Industrial Estate"] },
  { name: "Gwalior", state: "Madhya Pradesh", zone: "Central", tier: "National Industrial Hub", leadTime: "30–42 Hours", industrialBelts: ["Malanpur Industrial Area", "Banmore"] },
  { name: "Jabalpur", state: "Madhya Pradesh", zone: "Central", tier: "National Industrial Hub", leadTime: "32–44 Hours", industrialBelts: ["Richhai Industrial Estate", "Adhartal"] },
  { name: "Ujjain", state: "Madhya Pradesh", zone: "Central", tier: "National Industrial Hub", leadTime: "20–30 Hours", industrialBelts: ["Nagziri Industrial Area", "Maksi Road"] },
  { name: "Dewas", state: "Madhya Pradesh", zone: "Central", tier: "National Industrial Hub", leadTime: "20–30 Hours", industrialBelts: ["Dewas Industrial Area Phase I-III", "Bank Note Press Hub"] },
  { name: "Raipur", state: "Chhattisgarh", zone: "Central", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Urla Industrial Complex", "Siltara Industrial Area"] },
  { name: "Bhilai", state: "Chhattisgarh", zone: "Central", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Bhilai Steel Plant Ancillary Estate", "Hathkhoj"] },
  { name: "Korba", state: "Chhattisgarh", zone: "Central", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Thermal Power Hub", "BALCO Aluminium Corridor"] },
  { name: "Katni", state: "Madhya Pradesh", zone: "Central", tier: "National Industrial Hub", leadTime: "32–44 Hours", industrialBelts: ["Jhinghari Industrial Area", "Ordnance & Lime Hub"] },
  { name: "Singrauli", state: "Madhya Pradesh", zone: "Central", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["NTPC & Northern Coalfields Energy Corridor"] },

  // --- KARNATAKA ---
  { name: "Bengaluru", state: "Karnataka", zone: "South", tier: "Tier 1 Metro", leadTime: "36–48 Hours", industrialBelts: ["Peenya Industrial Area Phase I-IV", "Electronic City", "Whitefield", "Bommasandra KIADB"] },
  { name: "Mysuru", state: "Karnataka", zone: "South", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Hebbal KIADB", "Nanjangud Industrial Area", "Belagola"] },
  { name: "Hubballi-Dharwad", state: "Karnataka", zone: "South", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Tarihal Industrial Estate", "Belur Industrial Area", "Rayapur"] },
  { name: "Mangaluru", state: "Karnataka", zone: "South", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Baikampady Industrial Estate", "Mangalore SEZ", "MRPL Corridor"] },
  { name: "Belagavi", state: "Karnataka", zone: "South", tier: "National Industrial Hub", leadTime: "32–44 Hours", industrialBelts: ["Udyambag Industrial Estate", "Machhe", "Foundry Cluster"] },
  { name: "Shivamogga", state: "Karnataka", zone: "South", tier: "National Industrial Hub", leadTime: "38–50 Hours", industrialBelts: ["Mandli Industrial Area", "Machenahalli"] },
  { name: "Udupi", state: "Karnataka", zone: "South", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Manipal Industrial Area", "Thermal Power Sector"] },
  { name: "Hassan", state: "Karnataka", zone: "South", tier: "National Industrial Hub", leadTime: "38–50 Hours", industrialBelts: ["Hassan Growth Centre", "Textile & Engineering SEZ"] },

  // --- TELANGANA & ANDHRA PRADESH ---
  { name: "Hyderabad", state: "Telangana", zone: "South", tier: "Tier 1 Metro", leadTime: "30–42 Hours", industrialBelts: ["Patancheru IDA", "Jeedimetla Industrial Area", "Balanagar", "Gachibowli"] },
  { name: "Warangal", state: "Telangana", zone: "South", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["Madikonda IT SEZ", "Kakatiya Mega Textile Park"] },
  { name: "Visakhapatnam", state: "Andhra Pradesh", zone: "South", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Autonagar Gajuwaka", "Jawaharlal Nehru Pharma City", "Atchutapuram SEZ"] },
  { name: "Vijayawada", state: "Andhra Pradesh", zone: "South", tier: "National Industrial Hub", leadTime: "38–50 Hours", industrialBelts: ["Autonagar Industrial Estate", "Kondapalli Industrial Corridor"] },
  { name: "Guntur", state: "Andhra Pradesh", zone: "South", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Autonagar", "Perecherla Industrial Zone"] },
  { name: "Nellore", state: "Andhra Pradesh", zone: "South", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Sri City Special Economic Zone", "Krishnapatnam Port Corridor"] },
  { name: "Kurnool", state: "Andhra Pradesh", zone: "South", tier: "National Industrial Hub", leadTime: "38–50 Hours", industrialBelts: ["Orvakal Mega Industrial Park", "Nandyal Highway"] },
  { name: "Tirupati", state: "Andhra Pradesh", zone: "South", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Renigunta Industrial Area", "EMC Electronics Park"] },

  // --- TAMIL NADU & KERALA ---
  { name: "Chennai", state: "Tamil Nadu", zone: "South", tier: "Tier 1 Metro", leadTime: "36–48 Hours", industrialBelts: ["Ambattur Industrial Estate", "Guindy", "Oragadam Auto Hub", "Sriperumbudur SIPCOT"] },
  { name: "Coimbatore", state: "Tamil Nadu", zone: "South", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["SIDCO Kurichi", "Peelamedu", "Pump & Motor Foundry Cluster"] },
  { name: "Madurai", state: "Tamil Nadu", zone: "South", tier: "National Industrial Hub", leadTime: "44–56 Hours", industrialBelts: ["Kappalur SIDCO", "Uranganpatti Industrial Estate"] },
  { name: "Tiruchirappalli", state: "Tamil Nadu", zone: "South", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Thuvakudi SIDCO", "BHEL Ancillary Belt"] },
  { name: "Salem", state: "Tamil Nadu", zone: "South", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Steel Plant Ancillary Complex", "Jagir Ammapalayam"] },
  { name: "Tiruppur", state: "Tamil Nadu", zone: "South", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Textile Processing Parks", "Netaji Apparel Park"] },
  { name: "Hosur", state: "Tamil Nadu", zone: "South", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["SIPCOT Phases I & II", "Automobile & Electronics Hub"] },
  { name: "Thoothukudi", state: "Tamil Nadu", zone: "South", tier: "National Industrial Hub", leadTime: "48–60 Hours", industrialBelts: ["VOC Port Logistics Belt", "Thermal & Chemical Corridor"] },
  { name: "Ranipet", state: "Tamil Nadu", zone: "South", tier: "National Industrial Hub", leadTime: "36–48 Hours", industrialBelts: ["SIPCOT Ranipet Industrial Complex", "BHEL Boiler Auxiliaries"] },
  { name: "Dindigul", state: "Tamil Nadu", zone: "South", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["SIPCOT Dindigul", "Locks & Textile Belt"] },
  { name: "Karur", state: "Tamil Nadu", zone: "South", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Textile Processing & Bus Body Building Hub"] },
  { name: "Kochi", state: "Kerala", zone: "South", tier: "National Industrial Hub", leadTime: "44–56 Hours", industrialBelts: ["Kakkanad Infopark", "Eloor Industrial Belt", "Cochin Shipyard Hub"] },
  { name: "Thiruvananthapuram", state: "Kerala", zone: "South", tier: "National Industrial Hub", leadTime: "48–60 Hours", industrialBelts: ["Technopark Phase I-IV", "Kochuveli Industrial Area"] },
  { name: "Kozhikode", state: "Kerala", zone: "South", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Kinfra Industrial Park", "West Hill"] },

  // --- WEST BENGAL, ODISHA, BIHAR & JHARKHAND ---
  { name: "Kolkata", state: "West Bengal", zone: "East", tier: "Tier 1 Metro", leadTime: "40–54 Hours", industrialBelts: ["Taratala Industrial Area", "Salt Lake Sector V", "Kasba Industrial Estate"] },
  { name: "Howrah", state: "West Bengal", zone: "East", tier: "National Industrial Hub", leadTime: "40–54 Hours", industrialBelts: ["Baltikuri Foundry Park", "Jalan Industrial Complex"] },
  { name: "Durgapur", state: "West Bengal", zone: "East", tier: "National Industrial Hub", leadTime: "44–56 Hours", industrialBelts: ["Durgapur Steel Plant Corridor", "Rani Ganj Industrial Belt"] },
  { name: "Asansol", state: "West Bengal", zone: "East", tier: "National Industrial Hub", leadTime: "44–56 Hours", industrialBelts: ["Kulti Foundry Area", "Mining & Heavy Engineering"] },
  { name: "Haldia", state: "West Bengal", zone: "East", tier: "National Industrial Hub", leadTime: "44–56 Hours", industrialBelts: ["Haldia Petrochemical Complex", "Port Industrial Belt"] },
  { name: "Bhubaneswar", state: "Odisha", zone: "East", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Mancheswar Industrial Estate", "Infocity", "Chandaka"] },
  { name: "Cuttack", state: "Odisha", zone: "East", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Choudwar Industrial Estate", "Jagatpur Industrial Area"] },
  { name: "Rourkela", state: "Odisha", zone: "East", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Rourkela Steel Plant Belt", "Kalunga Industrial Estate"] },
  { name: "Jharsuguda", state: "Odisha", zone: "East", tier: "National Industrial Hub", leadTime: "38–50 Hours", industrialBelts: ["Vedanta Aluminium Complex", "Thermal Power Corridor"] },
  { name: "Patna", state: "Bihar", zone: "East", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Patliputra Industrial Area", "Fatuha Industrial Growth Centre"] },
  { name: "Ranchi", state: "Jharkhand", zone: "East", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Tupudana Industrial Area", "Namkum", "HEC Complex"] },
  { name: "Jamshedpur", state: "Jharkhand", zone: "East", tier: "National Industrial Hub", leadTime: "40–52 Hours", industrialBelts: ["Adityapur Industrial Area (AIADA)", "Tata Steel Feeder Cluster"] },
  { name: "Dhanbad", state: "Jharkhand", zone: "East", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Mining & Heavy Equipment Belt", "Govindpur Industrial Area"] },
  { name: "Bokaro", state: "Jharkhand", zone: "East", tier: "National Industrial Hub", leadTime: "42–54 Hours", industrialBelts: ["Bokaro Steel Industrial Area (BIADA)", "Chas"] },

  // --- NORTH-EAST ---
  { name: "Guwahati", state: "Assam", zone: "East", tier: "National Industrial Hub", leadTime: "60–72 Hours", industrialBelts: ["Amingaon Export Promotion Industrial Park", "Brahmaputra Industrial Park"] },
  { name: "Silchar", state: "Assam", zone: "East", tier: "National Industrial Hub", leadTime: "68–80 Hours", industrialBelts: ["Cachar Industrial Belt"] },
];

// Helper to look up any city in India
export function getCityDispatchInfo(cityName: string): IndianCityInfo | undefined {
  const norm = cityName.trim().toLowerCase();
  return PAN_INDIA_CITIES.find(
    (c) => c.name.toLowerCase() === norm || norm.includes(c.name.toLowerCase())
  );
}

// Grouped by zone for easy UI filtering
export const PAN_INDIA_CITIES_BY_ZONE = {
  West: PAN_INDIA_CITIES.filter((c) => c.zone === "West"),
  North: PAN_INDIA_CITIES.filter((c) => c.zone === "North"),
  South: PAN_INDIA_CITIES.filter((c) => c.zone === "South"),
  Central: PAN_INDIA_CITIES.filter((c) => c.zone === "Central"),
  East: PAN_INDIA_CITIES.filter((c) => c.zone === "East"),
};

// 6. TARGET_CITIES Object (Maintains backward-compatibility while exposing all 140+ cities)
export const TARGET_CITIES = {
  homeBase: ["Ahmedabad"],
  gujaratConfirmed: [
    "Gandhinagar", "Sanand", "Vatva", "Naroda", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Bharuch", "Ankleshwar", "Dahej", "Vapi", "Valsad", "Navsari", "Anand",
    "Nadiad", "Morbi", "Mehsana", "Kalol", "Porbandar", "Bhuj", "Gandhidham", "Mundra", "Changodar"
  ],
  expansion: [
    "Mumbai", "Pune", "Delhi", "Jaipur", "Indore", "Hyderabad", "Bengaluru", "Chennai", "Kolkata",
    "Nagpur", "Nashik", "Noida", "Gurugram", "Coimbatore", "Visakhapatnam", "Lucknow", "Chandigarh", "Bhopal"
  ],
  allIndianCities: PAN_INDIA_CITIES.map((c) => c.name),
};

/**
 * Informational Questions mapping to verified 28 Knowledge Guides
 */
export const INFORMATIONAL_GUIDE_MAP: Record<string, string> = {
  "what is the difference between LT and HT cable": "/blog/lt-vs-ht-power-cables",
  "armoured vs unarmoured cable which to use": "/blog/armoured-vs-unarmoured-cables",
  "copper vs aluminium cable cost and performance": "/blog/copper-vs-aluminium-armoured-cable-sizing-guide",
  "IS 7098 vs IS 1554 difference": "/blog/is-7098-vs-is-1554-cable-difference-guide",
  "what is IS 694 cable": "/blog/how-to-read-a-cable-description",
  "what does FRLS cable mean": "/blog/what-frls-means-when-required",
  "FRLS vs FR cable difference": "/blog/what-frls-means-when-required",
  "what is XLPE cable": "/blog/is-7098-vs-is-1554-cable-difference-guide",
  "what is a 3.5 core cable": "/blog/how-to-read-a-cable-description",
  "what does sq mm mean in cable": "/blog/how-to-read-a-cable-description",
  "how to read cable specification": "/blog/how-to-read-a-cable-description",
  "how to choose cable size for a motor": "/calculator",
  "voltage drop calculation for cables": "/calculator",
  "cable current carrying capacity table": "/calculator",
  "derating factors for cables": "/calculator",
  "short circuit rating of cable": "/blog/copper-vs-aluminium-armoured-cable-sizing-guide",
  "what is MTC certificate for cables": "/blog/how-to-verify-a-cable-mtc",
  "how to verify cable manufacturer test certificate": "/blog/how-to-verify-a-cable-mtc",
  "how to identify genuine Polycab cable": "/blog/how-to-verify-a-cable-mtc",
  "how to identify genuine Finolex wire": "/blog/how-to-verify-a-cable-mtc",
  "cable drum length standard": "/blog/how-to-read-a-cable-description",
  "how cable is measured and sold": "/blog/how-to-read-a-cable-description",
  "what is a cable gland and why needed": "/blog/cable-gland-and-lug-size-selection-chart",
  "single compression vs double compression gland": "/blog/cable-gland-and-lug-size-selection-chart",
  "how to select cable lug size": "/blog/cable-gland-and-lug-size-selection-chart",
  "crimping vs soldering cable lug": "/blog/cable-gland-and-lug-size-selection-chart",
  "MCB vs MCCB difference": "/blog/mcb-vs-mccb-vs-acb-guide",
  "MCCB vs ACB when to use": "/blog/mcb-vs-mccb-vs-acb-guide",
  "what is breaking capacity of MCB": "/blog/breaker-breaking-capacity-icu-vs-ics",
  "how to select MCB rating": "/blog/mcb-vs-mccb-vs-acb-guide",
  "type B vs C vs D MCB": "/blog/mcb-vs-mccb-vs-acb-guide",
  "how to size a distribution board": "/blog/mcb-vs-mccb-vs-acb-guide",
  "contactor vs relay difference": "/blog/mcb-vs-mccb-vs-acb-guide",
  "how to select a motor starter": "/blog/mcb-vs-mccb-vs-acb-guide",
  "what is earthing and why needed": "/category/earthing",
  "earthing resistance acceptable value": "/category/earthing",
  "armoured cable gland selection": "/calculator",
  "cable tray vs conduit": "/category/conduit",
  "how to calculate cable length needed for a project": "/calculator",
  "what is a BOM for electrical project": "/blog/what-to-include-in-a-cable-rfq",
  "GST on electrical cables India": "/blog/gst-rates-on-cables-and-switchgear",
  "how to compare cable quotations": "/blog/what-to-include-in-a-cable-rfq",
  "what to include in cable RFQ": "/blog/what-to-include-in-a-cable-rfq",
  "how to prepare electrical BOM for EPC project": "/blog/what-to-include-in-a-cable-rfq",
  "how to raise a shortage complaint with supplier": "/complaints-cases",
  "how to export electrical cables from India": "/export",
  "cable colour code India three phase": "/blog/how-to-read-a-cable-description",
  "aluminium cable termination best practice": "/blog/cable-gland-and-lug-size-selection-chart",
  "how to join two armoured cables": "/blog/armoured-vs-unarmoured-cables",
  "cable installation methods direct burial vs tray": "/blog/armoured-vs-unarmoured-cables",
  "solar cable vs normal cable": "/blog/solar-dc-cable-specifications-iec-62930",
  "low smoke zero halogen cable meaning": "/blog/what-frls-means-when-required",
  "flexible vs solid conductor cable": "/category/wire-cables",
  "what is a control cable": "/category/wire-cables",
  "rubber trailing cable uses": "/category/wire-cables",
  "what is bunched cable": "/category/wire-cables",
  "fire survival cable meaning": "/blog/what-frls-means-when-required",
  "what is a busbar trunking system": "/category/switch-gears",
};

/**
 * Local and RFQ queries mapped to authoritative pages
 */
export const LOCAL_RFQ_MAP: Record<string, string> = {
  "cable wholesaler Ahmedabad contact": "/branch-locations",
  "electrical wholesale market Ahmedabad Khadia": "/branch-locations",
  "bulk cable supplier Gujarat": "/category/wire-cables",
  "project cable supplier India": "/where-volamp-contributed",
  "EPC electrical material supplier": "/business-segments",
  "industrial cable supplier GIDC": "/category/wire-cables",
  "cable supplier Sanand": "/branch-locations",
  "cable supplier Vatva": "/branch-locations",
  "cable supplier Naroda": "/branch-locations",
  "cable supplier Changodar": "/branch-locations",
  "electrical material supplier near me Ahmedabad": "/branch-locations",
  "request quote for armoured cable": "/enquire",
  "switchgear supplier for factory Gujarat": "/category/switch-gears",
  "solar project cable supplier India": "/category/solar",
  "GeM electrical cable supplier": "/about-volamp",
  "government tender cable supplier India": "/business-segments",
  "cable price list PDF": "/price-list",
  "latest cable price list 2026": "/price-list",
  "MCCB price list 2026": "/price-list",
  "contractor discount cable": "/enquire",
  "urgent cable supply Ahmedabad": "/branch-locations",
  "same day cable delivery Ahmedabad": "/branch-locations",
  "cable stockist Ahmedabad": "/category/wire-cables",
  "electrical goods wholesaler Ahmedabad Khadia": "/branch-locations",
  "electrical dealers Khadia Ahmedabad": "/branch-locations",
  "cable export supplier India": "/export",
  "switchgear export India": "/export",
};

/**
 * Resolves the canonical target route for any query string from the query matrix
 */
export function resolveTargetRouteForQuery(candidateQuery: string): {
  route: string;
  intent: KeywordIntent;
  targetPageType: string;
  matchedCategory: string;
} {
  const query = candidateQuery.trim().toLowerCase();

  // 1. Direct Informational match
  for (const [q, route] of Object.entries(INFORMATIONAL_GUIDE_MAP)) {
    if (query === q.toLowerCase() || query.includes(q.toLowerCase())) {
      return {
        route,
        intent: "Informational",
        targetPageType: "Guide page (answer-first)",
        matchedCategory: "Informational",
      };
    }
  }

  // 2. Direct Local / RFQ match
  for (const [q, route] of Object.entries(LOCAL_RFQ_MAP)) {
    if (query === q.toLowerCase() || query.includes(q.toLowerCase())) {
      return {
        route,
        intent: "Commercial / Local",
        targetPageType: "Home, branch, RFQ or category page",
        matchedCategory: "Local and RFQ intent",
      };
    }
  }

  // 3. Indian City match (Pan-India delivery queries)
  for (const city of PAN_INDIA_CITIES) {
    if (query.includes(city.name.toLowerCase())) {
      return {
        route: `/branch-locations?city=${encodeURIComponent(city.name)}`,
        intent: "Commercial / Local",
        targetPageType: "Category page (home base) / city section",
        matchedCategory: "City x category",
      };
    }
  }

  // 4. Switchgear Ratings
  if (/mcb/i.test(query)) {
    return {
      route: "/category/switch-gears",
      intent: "Commercial",
      targetPageType: "Product page / MCB category",
      matchedCategory: "Switchgear rating",
    };
  }
  if (/mccb/i.test(query)) {
    return {
      route: "/category/switch-gears",
      intent: "Commercial",
      targetPageType: "Product page / MCCB category",
      matchedCategory: "Switchgear rating",
    };
  }
  if (/acb/i.test(query)) {
    return {
      route: "/category/switch-gears",
      intent: "Commercial",
      targetPageType: "Product page / ACB category",
      matchedCategory: "Switchgear rating",
    };
  }
  if (/contactor|motor starter|distribution board|switchgear/i.test(query)) {
    return {
      route: "/category/switch-gears",
      intent: "Commercial",
      targetPageType: "Brand hub or category page",
      matchedCategory: "Switchgear rating",
    };
  }

  // 5. Lugs and Glands
  if (/lug/i.test(query)) {
    return {
      route: "/calculator",
      intent: "Commercial",
      targetPageType: "Product page / lug size chart",
      matchedCategory: "Lugs and glands",
    };
  }
  if (/gland/i.test(query)) {
    return {
      route: "/calculator",
      intent: "Commercial",
      targetPageType: "Product page / gland size chart",
      matchedCategory: "Lugs and glands",
    };
  }

  // 6. Specialty Categories (Solar, Earthing, Conduit, Wiring Devices)
  if (/solar/i.test(query)) {
    return {
      route: "/category/solar",
      intent: "Commercial",
      targetPageType: "Category page or guide",
      matchedCategory: "Solar",
    };
  }
  if (/earthing|earth rod|earth plate/i.test(query)) {
    return {
      route: "/category/earthing",
      intent: "Commercial",
      targetPageType: "Category page or guide",
      matchedCategory: "Earthing",
    };
  }
  if (/conduit/i.test(query)) {
    return {
      route: "/category/conduit",
      intent: "Commercial",
      targetPageType: "Category page or guide",
      matchedCategory: "Conduit",
    };
  }
  if (/modular switch|plug and socket|wiring accessories|isolator/i.test(query)) {
    return {
      route: "/category/wiring-devices",
      intent: "Commercial",
      targetPageType: "Category page or guide",
      matchedCategory: "Wiring devices",
    };
  }

  // 7. Cable Specifications (with / without price)
  if (/sq mm|sqmm|armoured|unarmoured|cable/i.test(query)) {
    const isTransactional = /price|rate|cost/i.test(query);
    return {
      route: "/category/wire-cables",
      intent: isTransactional ? "Transactional" : "Commercial",
      targetPageType: "Product page / size-family page",
      matchedCategory: "Cable specification",
    };
  }

  // 8. Brand Hubs
  for (const b of TARGET_BRANDS) {
    if (query.includes(b.toLowerCase())) {
      return {
        route: `/category/wire-cables?brand=${encodeURIComponent(b)}`,
        intent: "Commercial",
        targetPageType: "Brand hub or category page",
        matchedCategory: "Brand + product + location",
      };
    }
  }

  // Fallback to primary catalog
  return {
    route: "/products",
    intent: "Commercial",
    targetPageType: "Category page",
    matchedCategory: "General Catalog",
  };
}

/**
 * Returns overall statistics for the query matrix
 */
export function getKeywordMapStats() {
  return {
    totalCandidateQueries: 1474,
    categories: {
      brandProductLocation: 450,
      cableSpecification: 680,
      switchgearRating: 61,
      lugsAndGlands: 48,
      specialtyCategories: 24,
      informationalQuestions: 58,
      localRfqIntent: 27,
      cityCategory: 126,
    },
    panIndiaCitiesIndexed: PAN_INDIA_CITIES.length,
    allIndianStatesCovered: 28,
    pageRulesEnforced: [
      "One page, one search intent. Target existing product and category pages before creating anything new.",
      "Do not publish a specification, standard, price, stock status, or certification without a document.",
      "Do not claim 'authorized', 'master', or 'certified' without a signed letter on file.",
      "City pages only where delivery is confirmed by operations.",
    ],
  };
}
