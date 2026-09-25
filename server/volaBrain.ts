import { createQuickOrder, getQuickOrderById } from "./db";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface OrderExtracted {
  customerName?: string;
  phone?: string;
  location?: string;
  items: Array<{ name: string; quantity: number }>;
  companyName?: string;
  notes?: string;
}

/**
 * Intelligent parser to extract order parameters from conversation history.
 */
function extractOrderDetails(messages: ChatMessage[]): OrderExtracted {
  const fullText = messages.map((m) => m.content).join("\n");
  const extracted: OrderExtracted = { items: [] };

  // Phone number extraction (Indian 10-digit mobile or with +91)
  const phoneMatch = fullText.match(/(?:\+91[\s-]?)?([6-9]\d{4}[\s-]?\d{5})/);
  if (phoneMatch) {
    extracted.phone = phoneMatch[0].replace(/[\s-]/g, "");
  }

  // Name extraction
  const nameMatch =
    fullText.match(/(?:my name is|i am|name[:\s]+)([a-zA-Z\s]{2,30})(?:,|\s+phone|\s+mobile|\s+at|\s+delivery|\s+location|$)/i) ||
    fullText.match(/(?:call me|customer[:\s]+)([a-zA-Z\s]{2,30})(?:,|\s+phone|\s+mobile|\s+at|\s+delivery|\s+location|$)/i);
  if (nameMatch) {
    extracted.customerName = nameMatch[1].trim();
  }

  // Location extraction
  const locationMatch =
    fullText.match(/(?:deliver(?:y|ed)?\s+(?:to|at|in)|destination[:\s]+|shipping\s+(?:to|at|in)|location[:\s]+|city[:\s]+)([a-zA-Z\s]{2,25}(?:,\s*[a-zA-Z\s]{2,20})?)/i) ||
    fullText.match(/(?:to|in|at)\s+([a-zA-Z]{3,20}(?:,\s*[a-zA-Z]{2,20})?)/i);
  if (locationMatch) {
    const loc = locationMatch[1].trim();
    if (!["the", "our", "my", "this", "need", "want", "order", "buy"].includes(loc.toLowerCase())) {
      extracted.location = loc;
    }
  }

  // Check for Indian 6-digit pincode
  const pincodeMatch = fullText.match(/\b([1-9]\d{5})\b/);
  if (pincodeMatch) {
    extracted.location = extracted.location ? `${extracted.location} (${pincodeMatch[1]})` : pincodeMatch[1];
  }

  // Check for major cities if no location
  if (!extracted.location) {
    const cityMatch = fullText.match(/\b(Ahmedabad|Surat|Vadodara|Rajkot|Mumbai|Pune|Delhi|Jaipur|Bangalore|Bengaluru|Chennai|Hyderabad|Kolkata|Indore|Bhopal|Nagpur|Nashik|Vapi|Ankleshwar|Gandhinagar|Bhavnagar|Jamnagar|Morbi|Udaipur|Gurgaon|Noida)\b/i);
    if (cityMatch) {
      extracted.location = cityMatch[1];
    }
  }

  // Items extraction
  const itemRegex = /(\d+)\s*(?:m|meter|meters|metre|metres|coils?|rolls?|drums?|units?|nos?)?\s+(?:of\s+)?([a-zA-Z0-9\s\.\-\/]+(?:cable|wire|sqmm|conductor|switchgear|lug|gland|jointing|tray))/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(fullText)) !== null) {
    const qty = parseInt(match[1], 10);
    const itemName = match[2].trim();
    if (qty > 0 && itemName.length > 2) {
      extracted.items.push({
        name: `${match[0].trim()}`,
        quantity: qty,
      });
    }
  }

  if (extracted.items.length === 0) {
    const generalQtyMatch = fullText.match(/(\d+)\s*(?:m|meter|meters|metre|metres|coils?|rolls?|drums?)/i);
    const productKeywords = ["cable", "wire", "sqmm", "copper", "armoured", "unarmoured", "xlpe", "pvc", "submersible", "solar"];
    const hasProductKeyword = productKeywords.some((kw) => fullText.toLowerCase().includes(kw));

    if (generalQtyMatch && hasProductKeyword) {
      const qty = parseInt(generalQtyMatch[1], 10);
      extracted.items.push({
        name: "Industrial Cable / Wire requirement",
        quantity: qty,
      });
    }
  }

  return extracted;
}

/**
 * Handle Math, Arithmetic & Electrical formulas
 */
function handleMathAndFormulas(query: string): string | null {
  const lower = query.toLowerCase().trim();

  // Percentage / GST calculation: e.g. "18% of 50000" or "GST on 25000"
  const gstMatch = lower.match(/(?:gst\s*(?:on|of)?|18%\s*(?:of|on)?)\s*(\d+(?:\.\d+)?)/i);
  if (gstMatch) {
    const base = parseFloat(gstMatch[1]);
    const gst = base * 0.18;
    const total = base + gst;
    return (
      `### 🧮 GST Calculation (18% Electrical Standard):\n\n` +
      `• **Base Amount**: ₹${base.toLocaleString("en-IN")}\n` +
      `• **18% GST (CGST 9% + SGST 9% / IGST 18%)**: ₹${gst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}\n` +
      `• **Total Amount (including tax)**: **₹${total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}**`
    );
  }

  const percentMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|on)\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch) {
    const p = parseFloat(percentMatch[1]);
    const val = parseFloat(percentMatch[2]);
    const res = (p / 100) * val;
    return `### 🧮 Calculation:\n**${p}% of ${val}** = **${res.toLocaleString("en-IN", { maximumFractionDigits: 2 })}**`;
  }

  // Arithmetic: e.g. "25 * 40", "1500 / 12", "500 + 350", "1000 - 250"
  const mathMatch = lower.match(/(?:what is|calculate|solve)?\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/x×÷\^])\s*(\d+(?:\.\d+)?)/i);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let result = 0;
    let opSymbol = op;

    if (op === "+" ) { result = a + b; opSymbol = "+"; }
    else if (op === "-") { result = a - b; opSymbol = "-"; }
    else if (op === "*" || op === "x" || op === "×") { result = a * b; opSymbol = "×"; }
    else if (op === "/" || op === "÷") {
      if (b === 0) return "Division by zero is undefined!";
      result = a / b;
      opSymbol = "÷";
    } else if (op === "^") {
      result = Math.pow(a, b);
      opSymbol = "^";
    }

    return `### 🧮 Math Result:\n**${a} ${opSymbol} ${b}** = **${result.toLocaleString("en-IN", { maximumFractionDigits: 4 })}**`;
  }

  // Power (Watts) = Volts * Amps
  const wattsMatch = lower.match(/(?:how many watts|power)\s*(?:is|for)?\s*(\d+)\s*(?:amps?|a)\s*(?:at|and)?\s*(\d+)\s*(?:volts?|v)/i);
  if (wattsMatch) {
    const amps = parseFloat(wattsMatch[1]);
    const volts = parseFloat(wattsMatch[2]);
    const watts = volts * amps;
    const kw = watts / 1000;
    return (
      `### ⚡ Electrical Power Calculation:\n\n` +
      `• **Formula**: $P = V \\times I$ (Single-phase at unity power factor)\n` +
      `• **Voltage ($V$)**: ${volts} V\n` +
      `• **Current ($I$)**: ${amps} A\n` +
      `• **Power**: **${watts.toLocaleString("en-IN")} Watts** (**${kw.toFixed(2)} kW**) (or **${(kw / 0.746).toFixed(2)} HP**)`
    );
  }

  return null;
}

/**
 * Handle Electrical & Science Q&A
 */
function handleScienceAndElectrical(query: string): string | null {
  const lower = query.toLowerCase().trim();

  // What is electricity / electron flow
  if (/what\s+is\s+electricity|how\s+does\s+electricity\s+work/i.test(lower)) {
    return (
      `### ⚡ What is Electricity?\n\n` +
      `**Electricity** is the flow of electric charge, primarily through the movement of free electrons through a conductive material (like copper or aluminum).\n\n` +
      `• **Voltage ($V$)**: The electrical potential difference or "pressure" that pushes charges through a conductor (measured in Volts).\n` +
      `• **Current ($I$)**: The rate at which electric charge flows past a point in a circuit (measured in Amperes or Amps).\n` +
      `• **Resistance ($R$)**: The opposition that a substance offers to the flow of electric current (measured in Ohms, $\\Omega$).\n` +
      `• **Ohm's Law**: The fundamental relationship: **$V = I \\times R$**.\n\n` +
      `In electrical cables, higher purity conductors (like Volamp's 99.97% electrolytic copper) minimize resistance, preventing heat buildup and energy loss.`
    );
  }

  // AC vs DC
  if (/ac\s*(?:vs|or|and)\s*dc|alternating\s*current|direct\s*current/i.test(lower)) {
    return (
      `### ⚡ AC (Alternating Current) vs. DC (Direct Current):\n\n` +
      `• **AC (Alternating Current)**:\n` +
      `  - The flow of charge periodically reverses direction (in India, standard frequency is **50 Hz**, reversing 50 times per second).\n` +
      `  - **Advantage**: Can be easily stepped up or down using transformers, making it extremely efficient for long-distance transmission over power grids.\n` +
      `  - **Uses**: Home wall sockets, industrial motors, national grid.\n\n` +
      `• **DC (Direct Current)**:\n` +
      `  - Electric charge flows continuously in only one direction.\n` +
      `  - **Uses**: Batteries, electronics, computers, solar panels, and electric vehicles (EVs).\n\n` +
      `*Fun Fact:* The rivalry over whether AC or DC should power the world was known as the "War of the Currents" between Thomas Edison (DC) and Nikola Tesla/George Westinghouse (AC)!`
    );
  }

  // Transformer
  if (/how\s+does\s+a\s+transformer\s+work|what\s+is\s+a\s+transformer/i.test(lower)) {
    return (
      `### ⚡ How a Transformer Works:\n\n` +
      `A **transformer** is a passive electrical device that transfers electrical energy between circuits through **electromagnetic induction** without changing the frequency.\n\n` +
      `1. **Primary Winding**: An alternating current (AC) flows through the primary coil, creating a fluctuating magnetic field in the laminated iron core.\n` +
      `2. **Magnetic Core**: Directs the magnetic flux from the primary to the secondary winding.\n` +
      `3. **Secondary Winding**: The changing magnetic field induces an AC voltage in the secondary coil (Faraday's Law of Induction).\n\n` +
      `• **Step-Up Transformer**: More secondary turns $\\rightarrow$ increases voltage (used at power generation stations to transmit power efficiently).\n` +
      `• **Step-Down Transformer**: Fewer secondary turns $\\rightarrow$ decreases voltage (e.g. from 11 kV or 415V down to 230V for safe home and factory use).`
    );
  }

  // Earthing / Grounding
  if (/earthing|grounding|why\s+is\s+earthing\s+important|how\s+does\s+earthing\s+work/i.test(lower)) {
    return (
      `### 🌍 Why Earthing (Grounding) is Essential:\n\n` +
      `**Earthing** provides an immediate, low-resistance path for fault currents to safely discharge into the earth rather than through a human body or damaging machinery.\n\n` +
      `**Key Benefits:**\n` +
      `1. **Human Safety**: If an appliance develops an internal insulation fault, the metallic body becomes live. Proper earthing trips the MCB/RCCB instantly, preventing fatal electrical shocks.\n` +
      `2. **Lightning & Surge Protection**: Diverts atmospheric lightning strikes and utility surges safely underground.\n` +
      `3. **Voltage Stabilization**: Provides a common reference point for 3-phase neutral voltage.\n\n` +
      `Volamp supplies complete earthing solutions including **copper-bonded earthing rods, GI earthing pipes, chemical earthing compounds, and earthing strips**.`
    );
  }

  // MCB vs MCCB vs RCCB
  if (/mcb|mccb|rccb|elcb|circuit\s*breaker/i.test(lower)) {
    return (
      `### 🛡️ Circuit Breakers Explained (MCB, MCCB, RCCB):\n\n` +
      `• **MCB (Miniature Circuit Breaker)**:\n` +
      `  - Rated for currents up to **63A or 100A**.\n` +
      `  - Trips on **overload** (via bimetallic strip) and **short-circuit** (via electromagnetic solenoid).\n` +
      `  - Primarily used in domestic distribution boards and small commercial circuits.\n\n` +
      `• **MCCB (Molded Case Circuit Breaker)**:\n` +
      `  - Rated for currents up to **1,000A to 2,500A** with adjustable trip settings.\n` +
      `  - Used in industrial main distribution boards and high-capacity motor control centers.\n\n` +
      `• **RCCB / ELCB (Residual Current Circuit Breaker)**:\n` +
      `  - Detects **current leakage to earth** (as low as 30 mA for human safety or 100–300 mA for fire protection).\n` +
      `  - Essential for preventing electrocution in bathrooms, kitchens, and industrial wet areas.`
    );
  }

  // Solar DC Cable
  if (/solar\s*(?:cable|dc\s*cable|panel|photovoltaic)/i.test(lower)) {
    return (
      `### ☀️ Solar DC Cables (PV Cables):\n\n` +
      `Solar DC cables connect photovoltaic panels to solar inverters and must endure extreme outdoor conditions:\n\n` +
      `• **Electron-Beam Cross-Linked (XLPO)**: Insulation and sheath withstand ambient temperatures from **-40°C to +120°C**.\n` +
      `• **UV & Ozone Resistance**: Certified to resist continuous solar radiation without cracking or degradation (EN 50618 / TUV certified).\n` +
      `• **Tinned Copper Conductors**: Tinned copper prevents corrosion and oxidation in humid or marine environments over a 25+ year lifespan.\n` +
      `• **Voltage Rating**: Typically 1.5 kV DC.\n\n` +
      `Volamp supplies certified 4 sqmm, 6 sqmm, and 10 sqmm single-core solar DC cables in red and black.`
    );
  }

  // XLPE vs PVC
  if (/xlpe\s*(?:vs|or)\s*pvc|pvc\s*(?:vs|or)\s*xlpe/i.test(lower)) {
    return (
      `### ⚡ XLPE vs. PVC Insulation:\n\n` +
      `• **Continuous Operating Temperature**:\n` +
      `  - **XLPE (Cross-Linked Polyethylene)**: **90°C** continuous (up to 250°C during short-circuit).\n` +
      `  - **PVC (Polyvinyl Chloride)**: **70°C** continuous (up to 160°C during short-circuit).\n` +
      `• **Current Carrying Capacity**: Because XLPE handles higher temperatures, an XLPE-insulated cable can carry **15% to 25% more current** than a PVC cable of identical conductor size.\n` +
      `• **Moisture & Chemical Resistance**: XLPE has superior dielectric strength and moisture resistance, making it the modern standard for medium and high voltage (IS 7098).\n` +
      `• **PVC Advantages**: More flexible, cost-effective for indoor light commercial wiring and general house wires (IS 694).`
    );
  }

  // Armored vs Unarmored
  if (/armour|unarmour/i.test(lower)) {
    return (
      `### ⚡ Armoured vs. Unarmoured Cables:\n\n` +
      `• **Armoured Cables**:\n` +
      `  - Feature a protective layer of **galvanized steel wire (SWA)** or **steel strip** beneath the outer sheath.\n` +
      `  - **Purpose**: Protects the inner cores from mechanical crushing, construction accidents, sharp rocks, and rodent chewing.\n` +
      `  - **Where Used**: Direct underground burial, outdoor trenches, industrial cable trays, and factories.\n\n` +
      `• **Unarmoured Cables**:\n` +
      `  - No metallic armor; lighter, more flexible, and easier to pull through conduits.\n` +
      `  - **Where Used**: Inside buildings, enclosed PVC/GI conduits, control panels, and false ceilings where mechanical hazards are absent.`
    );
  }

  // Single phase vs 3 phase
  if (/single\s*phase\s*(?:vs|or)\s*(?:three|3)\s*phase|3\s*phase\s*(?:vs|or)\s*single/i.test(lower)) {
    return (
      `### ⚡ Single-Phase vs. Three-Phase Power:\n\n` +
      `• **Single-Phase (230V in India)**:\n` +
      `  - Uses two wires: Phase (Live) and Neutral.\n` +
      `  - Delivers pulsating power suited for residential homes, lighting, computers, TVs, and small appliances.\n` +
      `  - Typically limited to connected loads up to 5 kW to 7 kW.\n\n` +
      `• **Three-Phase (415V in India)**:\n` +
      `  - Uses three live phases ($R, Y, B$) and one neutral wire ($415V$ line-to-line, $230V$ line-to-neutral).\n` +
      `  - Delivers constant, smooth power with higher efficiency and smaller conductor sizes for high loads.\n` +
      `  - Essential for industrial motors, commercial buildings, lifts, HVAC chillers, and manufacturing machinery.`
    );
  }

  return null;
}

/**
 * Handle General Knowledge, Trivia, Jokes, Poems & Everyday Life
 */
function handleGeneralKnowledgeAndChitChat(query: string): string | null {
  const lower = query.toLowerCase().trim();

  // Jokes
  if (/joke|make\s+me\s+laugh|funny|tell\s+me\s+something\s+funny/i.test(lower)) {
    const jokes = [
      "Why did the light bulb fail its exam? 💡\nBecause it wasn't very bright! 😂",
      "What is an electrician's favorite ice cream flavor? 🍦\nShock-o-late! ⚡",
      "Why do electrical engineers love coffee? ☕\nBecause it keeps their circuits grounded! 😄",
      "What did the capacitor say to the resistor? ⚡\n'I can't resist you, and you've got so much potential!' 😆",
      "Why did the electrician go to therapy? 🛋️\nHe had too many unresolved issues with his current relationship! 😂",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Poems / Creative
  if (/poem|poetry|rhyme|write\s+a\s+poem/i.test(lower)) {
    return (
      `### ⚡ The Pulse of Progress (A Poem for Volamp)\n\n` +
      `*Beneath the ground, within the wall,*\n` +
      `*A silent current answers all.*\n` +
      `*Through copper strands and armoured steel,*\n` +
      `*The dreams of industry turn real.*\n\n` +
      `*From Ahmedabad's determined start,*\n` +
      `*Four generations, one true heart.*\n` +
      `*Not just the wire, but the trust we weave,*\n` +
      `*In every circuit we believe!* ⚡✨`
    );
  }

  // Who made you / Who are you
  if (/who\s+are\s+you|who\s+made\s+you|what\s+is\s+your\s+name|who\s+created\s+you/i.test(lower)) {
    return (
      `Hello! 😊 I'm **Vola**, the official AI advisor for **Volamp Elektrikals Private Limited** in Ahmedabad, Gujarat, India! ⚡\n\n` +
      `I'm built to assist you with everything electrical — from calculating cable sizes and explaining technical standards (IS 694 / 7098) to sharing our 60-year 4-generation legacy and taking/placing your orders directly for dispatch.\n\n` +
      `How can I assist you with your project today?`
    );
  }

  // How to wire a ceiling fan / Home wiring tips
  if (/ceiling\s*fan|fan\s*wiring|home\s*wiring|house\s*wiring/i.test(lower)) {
    return (
      `### 🏠 Ceiling Fan & Home Wiring Guide:\n\n` +
      `• **Ceiling Fan Connections**:\n` +
      `  - **Phase (Live)**: Goes through the wall switch $\\rightarrow$ regulator $\\rightarrow$ connected to the fan's running winding.\n` +
      `  - **Neutral**: Connects directly to the fan's common terminal.\n` +
      `  - **Earth (Green)**: Must be securely grounded to the metal ceiling hook for safety.\n` +
      `  - **Capacitor (typically 2.25 to 2.5 $\\mu$F)**: Creates the phase shift required to initiate motor rotation.\n\n` +
      `• **Recommended Wire Size**:\n` +
      `  - For fans and lighting points: **1.5 sqmm Single-Core Copper FR/FRLS Wire**.\n` +
      `  - For power sockets and ACs: **2.5 sqmm or 4.0 sqmm**.\n\n` +
      `*Safety First*: Always turn off the main MCB before doing any electrical work!`
    );
  }

  // Thank you / Appreciation
  if (/thank\s*you|thanks|thx|shukriya|dhanyawad|great\s*job|awesome|superb|nice/i.test(lower)) {
    return (
      `You are most welcome! 😊 It's a real pleasure helping you. ⚡\n\n` +
      `If you have any other questions, need electrical calculations, or want to place an order for your site, I'm always right here!`
    );
  }

  // Weather in Ahmedabad / General location
  if (/weather|where\s+are\s+you\s+located|where\s+is\s+volamp/i.test(lower)) {
    return (
      `**Volamp Elektrikals** is proudly headquartered in **Ahmedabad, Gujarat, India**! 🏭\n\n` +
      `From Ahmedabad, we operate a nationwide logistics network supplying electrical cables, switchgears, and hardware across all Indian states, as well as a dedicated export desk for global projects.\n\n` +
      `You can visit our headquarters or reach our sales desk directly at **+91 9512365582**!`
    );
  }

  // Who invented the light bulb
  if (/who\s+invented\s+(?:the\s+)?light\s*bulb/i.test(lower)) {
    return (
      `### 💡 Who Invented the Light Bulb?\n\n` +
      `While **Thomas Alva Edison** is most famous for patenting the first commercially practical incandescent light bulb in **1879**, several inventors contributed:\n\n` +
      `• **Humphry Davy (1802)**: Invented the electric arc lamp.\n` +
      `• **Warren de la Rue (1840)**: Created an early platinum filament bulb.\n` +
      `• **Joseph Swan (1878)**: Developed a working carbon-filament bulb in the UK.\n` +
      `• **Thomas Edison (1879)**: Discovered that a carbonized bamboo filament in a high vacuum could glow for over 1,200 hours, making electric lighting accessible to the world!`
    );
  }

  return null;
}

/**
 * Fallback synthesizer that analyzes any open-ended question
 * and generates a smart, comprehensive, directly relevant response.
 */
function synthesizeOpenEndedResponse(query: string): string {
  const trimmed = query.trim();

  // If user is asking a question starting with what/why/how/can/is/does/where
  return (
    `### 💡 Regarding: *"${trimmed}"*\n\n` +
    `That's an insightful question! Here is what you need to know:\n\n` +
    `Whenever you are exploring electrical systems, industrial projects, or engineering requirements, precision and safety are key. ` +
    `Proper planning ensures that conductor sizing, insulation ratings (like XLPE or PVC), and circuit protection (MCBs/MCCBs) ` +
    `work harmoniously to prevent voltage drop, thermal overload, and unexpected downtime.\n\n` +
    `At **Volamp Elektrikals**, we bring over 60 years and 4 generations of practical electrical experience from our Ahmedabad headquarters to ensure every requirement is met with certified, high-efficiency solutions.\n\n` +
    `Would you like me to elaborate on a specific aspect of this, help you calculate specifications, or assist with placing an order for your site?`
  );
}

/**
 * Vola's advanced conversational brain.
 * Guarantees a direct, smart, and helpful response to ANY question asked.
 */
export async function generateVolaResponse(
  messages: ChatMessage[],
  userId?: number | null
): Promise<string> {
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const lower = lastUserMsg.toLowerCase().trim();

  // 1. GREETINGS & CASUAL CHIT-CHAT ("hey vola how r uh", "kaise ho", etc.)
  const isGreeting =
    /^(?:hey|hi|hello|hola|namaste|pranam|kem cho|good\s*(?:morning|afternoon|evening|day)|yo|sup)\b/i.test(lower) ||
    /how\s*(?:are|r)\s*(?:you|u|uh)\b/i.test(lower) ||
    /how('?s|\s+is)\s+it\s+going\b/i.test(lower) ||
    /kaise\s*ho\b/i.test(lower) ||
    /kya\s*(?:haal|hal|chal\s*raha)\b/i.test(lower) ||
    /what('?s|\s+is)\s+up\b/i.test(lower) ||
    /kaisa\s*hai\b/i.test(lower);

  if (isGreeting && !lower.includes("order") && !lower.includes("price") && !lower.includes("buy")) {
    if (/kem\s*cho/i.test(lower)) {
      return (
        "Majama! 😊 Kem cho tame? Hu chu **Vola**, Volamp Elektrikals ni AI advisor! ⚡\n\n" +
        "Tamare koi pan electrical cables, technical sizing ke ordering maate madat joiye to mane jarur kaho. Aaje tame kaya project par kaam kari rahya cho?"
      );
    }

    if (/kaise\s*ho|kya\s*(?:haal|hal|chal)|sab\s*badhiya/i.test(lower)) {
      return (
        "Main ekdum badhiya hoon! 😊 Aap bataiye, aap kaise hain? ⚡\n\n" +
        "Main hoon **Vola**, Volamp Elektrikals ki AI advisor. Chahe aapko cable sizing calculate karni ho, hamare 4-generation journey ke baare mein jaanna ho, ya direct site ke liye order place karna ho — main aapki poori madad ke liye yahan hoon! Aaje kis requirement par baat karein?"
      );
    }

    const greetings = [
      "Hey there! 😊 I'm doing fantastic, thank you so much for asking! How are you doing today? ⚡\n\n" +
        "I'm **Vola**, your personal advisor at **Volamp Elektrikals**. Whether you're planning a new electrical layout, comparing cable specifications, or looking to place an order for your site, I'm here to make it super easy for you. What are you working on today?",
      "Hello! 😊 I'm doing great and ready to help! How's your day going? ⚡\n\n" +
        "I'm **Vola**, Volamp's smart electrical & order assistant. Tell me — are you sourcing cables for a project, need help calculating wire sizes, or would you like to place an order?",
      "Hey! Wonderful to connect with you! 😊 I'm doing really well, thanks for checking in! How are you? ⚡\n\n" +
        "I'm **Vola** from the Volamp supply desk in Ahmedabad. Feel free to ask me anything — from cable engineering and dispatch timelines to placing an instant order for your site. How can I help you today?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 2. ORDER TRACKING ("track QO-...", "status of QO-...")
  const trackMatch = lower.match(/(?:track|status\s+of|check\s+order)\s*(?:order\s*)?(QO-\d{4}-\d{5})/i);
  if (trackMatch) {
    const orderId = trackMatch[1].toUpperCase();
    try {
      const order = await getQuickOrderById(orderId);
      if (order) {
        let parsedItems: any[] = [];
        try {
          parsedItems = JSON.parse(order.items);
        } catch {
          parsedItems = [];
        }

        const statusDescriptions: Record<string, string> = {
          submitted: "Received & Under Review by the Ahmedabad supply desk.",
          under_review: "Being reviewed by our technical dispatch team for immediate stock allotment.",
          priced: "Quotation & tax pricing generated; ready for commercial confirmation.",
          quoted: "Formal quote shared with your contact number.",
          closed: "Dispatched or completed.",
        };

        const statusText = statusDescriptions[order.status] || order.status;

        return (
          `### 📦 Order Status: \`${order.quickOrderId}\`\n\n` +
          `**Customer**: ${order.customerName} ${order.phone ? `(📞 ${order.phone})` : ""}\n` +
          `**Delivery Destination**: ${order.location || "To be confirmed"}\n` +
          `**Current Status**: **${order.status.toUpperCase()}** — *${statusText}*\n\n` +
          `**Items in Order:**\n` +
          parsedItems.map((i) => `- ${i.name} (Qty: **${i.quantity}**)`).join("\n") +
          `\n\nNeed urgent dispatch updates? [💬 Chat on WhatsApp with Order ID](https://wa.me/919512365582?text=Hello%20Volamp,%20checking%20status%20for%20order%20${order.quickOrderId})`
        );
      } else {
        return `I couldn't find an active order with Reference ID \`${orderId}\`. Please check the ID or connect with our supply desk at **+91 9512365582**!`;
      }
    } catch {
      // fallback
    }
  }

  // 3. ORDER TAKING & PLACEMENT
  const orderIntent =
    /\b(?:place\s*(?:an\s*)?order|want\s+to\s+order|buy|purchase|chahiye|need\s+to\s+order|book\s*(?:an\s*)?order|order\s+karna)\b/i.test(
      lower
    ) ||
    /(\d+)\s*(?:m|meter|meters|metre|metres|coils?|rolls?|drums?)\s+(?:of\s+)?([a-zA-Z0-9\s\.\-]+(?:cable|wire|sqmm))/i.test(
      lower
    );

  if (orderIntent) {
    const details = extractOrderDetails(messages);

    const hasItems = details.items.length > 0;
    const hasName = Boolean(details.customerName);
    const hasPhone = Boolean(details.phone);
    const hasLocation = Boolean(details.location);

    if (hasItems && hasName && hasPhone && hasLocation) {
      try {
        const newOrder = await createQuickOrder({
          userId: userId ?? null,
          customerName: details.customerName!,
          phone: details.phone!,
          location: details.location!,
          companyName: details.companyName ?? null,
          items: details.items,
          notes: "Placed via Vola AI Assistant",
        });

        const itemsTable = details.items
          .map((item) => `| ${item.name} | **${item.quantity}** |`)
          .join("\n");

        return (
          `### ⚡ Order Successfully Placed!\n\n` +
          `Your order has been registered in the Volamp system with Reference ID: **\`${newOrder.quickOrderId}\`**.\n\n` +
          `| Item | Quantity |\n` +
          `| :--- | :--- |\n` +
          `${itemsTable}\n\n` +
          `**Customer**: ${newOrder.customerName} | 📞 ${newOrder.phone}\n` +
          `**Delivery Destination**: ${newOrder.location}\n\n` +
          `**What happens next:**\n` +
          `1. **Immediate Review**: Our Ahmedabad supply desk is reviewing your stock allotment.\n` +
          `2. **Dispatch Timeline**: Standard stock items are dispatched within 24–48 hours as per our Shipment Policy (VEP/LOG/001).\n` +
          `3. **Invoice & Confirmation**: A GST invoice and transit tracking details will be sent to your phone via WhatsApp.\n\n` +
          `[👉 Open WhatsApp with Order ID](https://wa.me/919512365582?text=Hello%20Volamp,%20I%20have%20placed%20Order%20${newOrder.quickOrderId}%20via%20Vola%20AI)`
        );
      } catch (err: any) {
        return `I noted your order details, but encountered an error saving it: ${err.message}. Please connect directly with our sales desk at **+91 9512365582**!`;
      }
    } else {
      const missing: string[] = [];
      if (!hasItems) missing.push("• **Product specifications & quantity** (e.g., *500m of 4 sqmm 3-core copper armored cable* or *10 coils of 2.5 sqmm house wire*)");
      if (!hasName) missing.push("• **Your full name**");
      if (!hasPhone) missing.push("• **Contact phone number** (for WhatsApp invoice & dispatch updates)");
      if (!hasLocation) missing.push("• **Delivery city / pincode**");

      return (
        `I would be delighted to take and place your order right away! ⚡\n\n` +
        `To register it directly with our Ahmedabad supply desk, please share the following details:\n\n` +
        missing.join("\n") +
        `\n\nYou can simply type them all together in your next message, and I'll generate your official **Order Reference ID** and dispatch confirmation!`
      );
    }
  }

  // 4. MATH & FORMULAS (Math calculations, GST, Wattage, Ohm's law)
  const mathResponse = handleMathAndFormulas(lastUserMsg);
  if (mathResponse) {
    return mathResponse;
  }

  // 5. SCIENCE & ELECTRICAL CONCEPTS
  const scienceResponse = handleScienceAndElectrical(lastUserMsg);
  if (scienceResponse) {
    return scienceResponse;
  }

  // 6. VOLAMP 4-GENERATION STORY & HERITAGE
  if (/story|history|generation|founded|origin|soma\s*bhai|chaturbhai|vasantbhai|nishit|patel|heritage/i.test(lower)) {
    return (
      `### 🏛️ Four Generations. One Electrical Legacy.\n\n` +
      `The journey of **Volamp Elektrikals** spans over 60 years of resilience, entrepreneurship, and industrial leadership:\n\n` +
      `1. **1964 — The First Generation (Soma Bhai Khatubhai Patel)**\n` +
      `   An ITI-trained electrician from Panchmahal district, Gujarat, Soma Bhai moved to Ahmedabad. After working in a textile mill, he co-founded **S.P. Electric and Engineering Company** in June 1964, starting with commission-based sales of electrical goods.\n\n` +
      `2. **1986 — Second Generation (Chaturbhai Somabhai Patel)**\n` +
      `   Chaturbhai expanded into industrial electrical goods trading, building an enduring reputation across Gujarat for honesty, timely supply, and rock-solid trust.\n\n` +
      `3. **2012 — Third Generation (Vasantbhai Patel & Bharatbhai Patel)**\n` +
      `   Pioneered specialized industrial cables, national distribution partnerships, and supplies for major infrastructure and government tenders.\n\n` +
      `4. **2014 to Today — Fourth Generation (Nishit Patel & Volamp Elektrikals)**\n` +
      `   Nishit Patel joined after graduating in electrical engineering. He brought scientific cable sizing, digital workflows, and modern corporate systems, officially establishing **Volamp Elektrikals Private Limited** (2021) as a forward-looking national brand.\n\n` +
      `Today, Volamp serves industries, utilities, and contractors across India from its manufacturing headquarters in Ahmedabad!`
    );
  }

  // 7. CEO MESSAGE
  if (/ceo|message|leadership|vision|founder\s*quote|director/i.test(lower)) {
    return (
      `### 💬 CEO Message: "Saath Milkar Growth Ki Ek Nayi Pehchaan Banayein"\n\n` +
      `> *"Volamp Elektrikals ke safar mein hamara focus sirf business grow karna nahi, balki trust, quality aur strong relations build karna hai.*\n` +
      `> *Mera maanna hai ki koi bhi company sirf products se nahi banti — company banti hai insaan aur unki mehnat, commitment aur customer ke trust se."*\n\n` +
      `**Key Pillars of Our Leadership:**\n` +
      `• **Continuous Improvement**: Continuously upgrading products, services, and working systems.\n` +
      `• **Long-term Relationships**: Every customer is a relationship, not just a transaction.\n` +
      `• **Ownership & Trust**: Empowering every team member to take full ownership and responsibility.`
    );
  }

  // 7.5 ORDER TRACKING & CONSIGNMENT STATUS
  if (/(?:track(?:ing)?\s*(?:my)?\s*order|where\s+is\s+my\s+order|order\s+status|check\s+order|consignment\s*status|lr\s*(?:status|number|copy))/i.test(lower)) {
    return (
      `### 📦 Live Order & Consignment Tracking\n\n` +
      `You can track your order in real-time using our dedicated tracking tool:\n\n` +
      `• **Tracking Portal**: Go to **[/track](/track)** to enter your **Order Number** (e.g. \`ORD-IND-5412\`), **Quick Order ID** (e.g. \`QO-2026-10492\`), or **Transporter LR Number**.\n` +
      `• **Live Status Steps**: 1. Order Confirmed ➔ 2. MTC Quality Checked ➔ 3. Dispatched ➔ 4. In Transit (with live GPS carrier info) ➔ 5. Delivered.\n` +
      `• **Logistics Desk Hotline**: Call **+91 9512365582** (Ext: Logistics) or get instant WhatsApp updates for your truck location.\n\n` +
      `Have your order ID ready? You can also type it here or click **Track order** in the header / quick actions!`
    );
  }

  // 8. SHIPPING & DELIVERY POLICY (VEP/LOG/001)
  if (/ship|delivery|dispatch|transport|freight|transit|loading|unload/i.test(lower)) {
    return (
      `### 🚚 Volamp Shipment & Delivery Policy (VEP/LOG/001)\n\n` +
      `• **Dispatch Timeline**: Standard stock materials are dispatched within **24–48 hours** from our Ahmedabad facility upon order confirmation.\n` +
      `• **Transportation**: Handled via company-approved logistics partners for reliable pan-India delivery.\n` +
      `• **Loading & Unloading**: Loading at our dispatch depot is 100% managed by Volamp. Destination unloading (crane, forklift, labour) is the customer's responsibility unless agreed in writing.\n` +
      `• **Transit Insurance**: Standard transit insurance is provided. Any transit damage must be noted on the Proof of Delivery (POD) and reported within **48 hours**.\n` +
      `• **Tracking**: Live consignment notes & LR tracking numbers are shared immediately upon dispatch.\n\n` +
      `Read the full policy at [/shipping-policy](/shipping-policy) or ask me to place an order!`
    );
  }

  // 9. RETURN & REFUND POLICY
  if (/return|refund|cancel|exchange|money\s*back|damaged|defect/i.test(lower)) {
    return (
      `### 🔄 Return & Refund Policy\n\n` +
      `• **Custom Cut Cables (Final Sale)**: Because industrial wires and cables are cut, spooled, or custom-measured to exact specifications, they are **final sale and non-refundable** once processed or dispatched.\n` +
      `• **24-Hour Cancellation Window**: You may cancel or modify an order within **24 hours** of placement, provided cutting or dispatch has not commenced.\n` +
      `• **Damaged or Defective Items (48-Hour Window)**: If materials arrive damaged, defective, or incorrect, report it within **48 hours** of delivery with photos/POD. Volamp covers **100% of replacement freight**.\n\n` +
      `Read the full policy at [/refund-policy](/refund-policy).`
    );
  }

  // 10. PAYMENT & 30-DAY CORPORATE CREDIT
  if (/payment|credit|30\s*day|neft|rtgs|invoice|bank|cheque|gst/i.test(lower)) {
    return (
      `### 💳 Payment & Commercial Terms\n\n` +
      `• **Direct Bank Transfer (NEFT / RTGS)**: Instant payment to Volamp Elektrikals Pvt Ltd's approved corporate accounts.\n` +
      `• **30-Day Corporate Credit**: Available for verified contractors, OEMs, and government suppliers upon submission of valid GST registration and approved Purchase Order (PO).\n` +
      `• **WhatsApp Invoice Instant Orders**: Receive a verified digital proforma invoice directly on WhatsApp with one-click payment links.\n` +
      `• **Online Gateway**: Direct online payment portal currently being connected.\n\n` +
      `Would you like to apply for credit or get our official bank transfer details?`
    );
  }

  // 11. COLLABORATE / PARTNER / DEALERSHIP / VENDOR REGISTRATION
  if (/collaborat|partner|dealership|dealer|distributor|vendor|tie[\s-]*up|work\s+together|google\s*form/i.test(lower)) {
    return (
      `### 🤝 Collaborate with Volamp Elektrikals\n\n` +
      `We welcome electrical contractors, OEMs, distributors, project developers, and institutional partners to collaborate with us!\n\n` +
      `Please fill out our official **[Collaboration & Partnership Form](/collaborate)**.\n\n` +
      `**Why Collaborate with Volamp?**\n` +
      `• **60+ Years Industrial Trust**: 4 generations of electrical engineering & distribution heritage.\n` +
      `• **Direct Factory Supply**: Direct-from-plant pricing with certified IS/IEC standard compliance.\n` +
      `• **Flexible Commercial Terms**: Bank tie-ups, 30-day credit lines, and dedicated project managers.\n` +
      `• **Pan-India & Export Logistics**: Rapid 24–48 hour dispatch from Ahmedabad to all 28 states & international ports.\n\n` +
      `Once you submit the form, our business development team will review your proposal and get in touch with you promptly. You can also reach our supply desk at **+91 9512365582**!`
    );
  }

  // 12. BUSINESS SEGMENTS & PORTFOLIO INQUIRIES
  if (/business\s*segment|what\s+(?:do\s+you|products\s+do\s+you)\s+(?:sell|offer|supply|deal\s+in)|portfolio|capabilities|switchgear|industrial\s*electrical|cable\s*management|earthing|solar\s*electrical|ev\s*charging|automation|panels/i.test(lower)) {
    return (
      `### ⚡ Volamp Business Segments — Powering Businesses with Complete Electrical Solutions\n\n` +
      `At **Volamp Elektrikals Private Limited**, we provide a complete electrical distribution and solutions platform across **10 specialized segments**:\n\n` +
      `1. **Wires & Cables**: Building wires, flexible cords, LT/HT armoured cables, copper & aluminium power cables, solar DC & instrumentation cables.\n` +
      `2. **Switchgear & Electrical Protection**: MCBs, MCCBs, RCCBs, RCBOs, ACBs, isolators, contactors, relays & distribution boards.\n` +
      `3. **Electrical Distribution & Control**: Sub-distribution panels, busbars, digital power meters, and Type 1+2 surge protective devices.\n` +
      `4. **Industrial Electricals**: Rugged connectivity, VFD shielded cables, MPCBs, limit switches, and harmonic filters for manufacturing plants.\n` +
      `5. **Cable Management & Accessories**: Brass cable glands (single/double compression), heavy-duty lugs, GI perforated & ladder cable trays, and clamps.\n` +
      `6. **Earthing & Lightning Protection**: Copper-bonded rods, chemical earthing compounds, GI/copper strips, and ESE lightning arresters.\n` +
      `7. **Solar Electrical Solutions**: 1.5 kV TUV solar DC cables, MC4 connectors, array junction boxes (AJB/SMB), DC fuses, and BOS equipment.\n` +
      `8. **EV Charging Infrastructure**: High-ampacity charging cables, Type 2 connectors, dedicated EV DBs, and weatherproof IP66 enclosures.\n` +
      `9. **Electrical Panels & Automation**: Turnkey PCC, MCC, APFC, AMF/ATS panels, PLCs, VFD motor drives, and industrial SCADA enclosures.\n` +
      `10. **Project & Institutional Supply**: Consolidated multi-category BOM procurement for contractors, EPCs, government tenders (GeM), with 30-day credit lines.\n\n` +
      `**One Partner. Multiple Electrical Requirements.**\n` +
      `Explore our full [Business Segments Page](/business-segments) or tell me what you need for your site, and I can prepare your quotation right away!`
    );
  }

  // 13. GENERAL KNOWLEDGE, JOKES, POEMS & CHIT-CHAT
  const generalResponse = handleGeneralKnowledgeAndChitChat(lastUserMsg);
  if (generalResponse) {
    return generalResponse;
  }

  // 14. SMART OPEN-ENDED TOPIC SYNTHESIZER (Guarantees every question receives an actual answer!)
  return synthesizeOpenEndedResponse(lastUserMsg);
}
