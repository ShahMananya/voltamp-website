import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Download,
  FileCheck,
  FileText,
  Languages,
  Package,
  Phone,
  Printer,
  Search,
  ShieldCheck,
  Truck,
  AlertTriangle,
  Clock,
  ExternalLink
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";

type Language = "en" | "gu" | "hi";

interface Clause {
  number: number;
  title: string;
  content: string[];
  bullets?: string[];
}

interface PolicyVersion {
  lang: Language;
  label: string;
  nativeName: string;
  flag: string;
  companyName: string;
  title: string;
  policyNo: string;
  version: string;
  effectiveDate: string;
  clauses: Clause[];
  signoff: string;
}

const policyData: Record<Language, PolicyVersion> = {
  en: {
    lang: "en",
    label: "English",
    nativeName: "English Version",
    flag: "🇬🇧",
    companyName: "VOLAMP ELEKTRIKALS PRIVATE LIMITED",
    title: "SHIPMENT & DELIVERY POLICY",
    policyNo: "VEP/LOG/001",
    version: "1.0",
    effectiveDate: "2017/08/09",
    signoff: "For VOLAMP ELEKTRIKALS PRIVATE LIMITED",
    clauses: [
      {
        number: 1,
        title: "Purpose",
        content: [
          "This Shipment & Delivery Policy defines the standard procedures and responsibilities for dispatching and delivering material supplied by VOLAMP ELEKTRIKALS PRIVATE LIMITED. The objective is to ensure safe, timely, documented, and efficient movement of goods from our premises to the customer's designated delivery location."
        ]
      },
      {
        number: 2,
        title: "Order Processing",
        content: [
          "Orders will be processed only after receiving a valid Purchase Order / Sales Order and necessary commercial confirmation. Dispatch will be subject to product availability, production status, payment/credit terms, and other agreed conditions. Any special packing, transportation, or delivery requirements must be communicated before dispatch."
        ]
      },
      {
        number: 3,
        title: "Dispatch & Shipment",
        content: [
          "Material will normally be dispatched through company-approved transporters or logistics partners. The company will select the mode of transportation based on material type, destination, urgency, availability, and commercial considerations. Dispatch timelines are indicative and may vary depending on production, vehicle availability, holidays, weather, road conditions, or other circumstances beyond the company's reasonable control."
        ]
      },
      {
        number: 4,
        title: "Transportation Charges",
        content: [
          "Freight charges shall be as per the agreed quotation, Purchase Order, or commercial terms. Transportation charges will be borne by the customer when a vehicle is assigned by Volamp Elektrikals for transportation to the godown. Where freight is to be paid by the customer, the applicable freight amount shall be charged separately or recovered as agreed. Any additional transportation expenses arising from customer-specific requirements may be charged to the customer."
        ]
      },
      {
        number: 5,
        title: "Loading & Unloading",
        content: [
          "Loading of material at the company's dispatch location will be carried out as per standard company procedures. Unless specifically agreed in writing, unloading at the customer's premises shall be the customer's responsibility. Any special equipment, labour, crane, forklift, or other unloading arrangement required at the destination shall be arranged by the customer unless otherwise agreed."
        ]
      },
      {
        number: 6,
        title: "Packaging",
        content: [
          "Material will be packed using standard packaging suitable for normal transportation. Special packaging requirements must be informed and agreed before dispatch. Customers should inspect the packaging and material upon delivery."
        ]
      },
      {
        number: 7,
        title: "Transit Damage / Shortage",
        content: [
          "Any visible damage, shortage, or abnormal condition must be recorded on the LR/POD/delivery document at the time of delivery. The customer should immediately inform VOLAMP ELEKTRIKALS PRIVATE LIMITED with supporting photographs and delivery documents. Claims without proper delivery remarks or supporting evidence may be subject to verification before acceptance."
        ]
      },
      {
        number: 8,
        title: "Delivery & POD",
        content: [
          "Delivery shall be considered completed when the material is delivered to the agreed destination and acknowledged by the customer or authorized representative. A signed and stamped Proof of Delivery (POD) / delivery acknowledgement should be obtained wherever applicable. Customers are requested to provide the required delivery documents and site instructions in advance to avoid delivery delays."
        ]
      },
      {
        number: 9,
        title: "Delivery Delays",
        content: [
          "VOLAMP ELEKTRIKALS PRIVATE LIMITED will make reasonable efforts to meet committed delivery schedules. However, delivery may be delayed due to:",
          "In such cases, the company shall communicate the revised expected delivery timeline wherever reasonably possible. No next-day or fixed delivery commitment shall be considered applicable unless specifically confirmed in writing by the company."
        ],
        bullets: [
          "Heavy rain, floods, or other adverse weather",
          "Road closures or traffic restrictions",
          "Vehicle breakdowns",
          "Transporter-related delays",
          "Natural disasters",
          "Government restrictions",
          "Strikes or labour disruptions",
          "Unforeseen production or operational issues",
          "Force majeure events"
        ]
      },
      {
        number: 10,
        title: "Customer Responsibility",
        content: ["Customers are responsible for:"],
        bullets: [
          "Providing the correct delivery address and contact details.",
          "Ensuring that the delivery location is accessible to the vehicle.",
          "Providing necessary unloading facilities and manpower where applicable.",
          "Ensuring an authorized person is available to receive the material.",
          "Checking quantity and visible condition at the time of delivery.",
          "Providing timely delivery confirmation/POD."
        ]
      },
      {
        number: 11,
        title: "Delivery Rejection",
        content: [
          "Material should not be rejected at the destination without a valid reason and prior communication with the company. If delivery is rejected due to reasons attributable to the customer, additional transportation, detention, return freight, storage, or re-dispatch charges may be recovered from the customer."
        ]
      },
      {
        number: 12,
        title: "Detention & Waiting Charges",
        content: [
          "Where the vehicle is required to wait at the customer's premises beyond the reasonable unloading time due to reasons attributable to the customer, applicable detention/waiting charges may be charged."
        ]
      },
      {
        number: 13,
        title: "Return / Re-dispatch",
        content: [
          "Any request for return, replacement, or re-dispatch of material shall be subject to company approval and applicable commercial terms. Unauthorized returns may not be accepted."
        ]
      },
      {
        number: 14,
        title: "Documentation",
        content: [
          "Depending on the shipment, relevant documents may include:",
          "The customer shall be responsible for providing any additional documentation required specifically for its delivery location in advance."
        ],
        bullets: [
          "Tax Invoice",
          "Delivery Challan",
          "E-Way Bill, wherever applicable",
          "LR / Consignment Note",
          "Packing List",
          "Test Certificate / other agreed documents",
          "Proof of Delivery (POD)"
        ]
      },
      {
        number: 15,
        title: "Force Majeure",
        content: [
          "The company shall not be liable for delays or failure to perform shipment obligations caused by events beyond its reasonable control, including natural disasters, floods, fire, epidemics, government restrictions, transportation disruptions, strikes, riots, war, or other unforeseen circumstances."
        ]
      },
      {
        number: 16,
        title: "Policy Exceptions",
        content: [
          "Any deviation from this Shipment & Delivery Policy must be approved by the authorized management representative of VOLAMP ELEKTRIKALS PRIVATE LIMITED and documented in writing."
        ]
      },
      {
        number: 17,
        title: "Policy Review",
        content: [
          "This policy may be amended or revised by the management from time to time based on operational, commercial, legal, or customer requirements."
        ]
      }
    ]
  },
  gu: {
    lang: "gu",
    label: "ગુજરાતી",
    nativeName: "ગુજરાતી આવૃત્તિ",
    flag: "🇮🇳",
    companyName: "VOLAMP ELEKTRIKALS PRIVATE LIMITED",
    title: "શિપમેન્ટ અને ડિલિવરી પોલિસી",
    policyNo: "VEP/LOG/001",
    version: "1.0",
    effectiveDate: "2017/08/09",
    signoff: "For VOLAMP ELEKTRIKALS PRIVATE LIMITED",
    clauses: [
      {
        number: 1,
        title: "હેતુ",
        content: [
          "આ શિપમેન્ટ અને ડિલિવરી પોલિસીનો હેતુ કંપની દ્વારા ગ્રાહકોને મોકલવામાં આવતા માલની સુરક્ષિત, સમયસર અને યોગ્ય દસ્તાવેજીકરણ સાથે ડિલિવરી સુનિશ્ચિત કરવાનો છે."
        ]
      },
      {
        number: 2,
        title: "ઓર્ડર પ્રોસેસિંગ",
        content: [
          "માન્ય Purchase Order / Sales Order મળ્યા બાદ જ ઓર્ડર પ્રોસેસ કરવામાં આવશે. ડિસ્પેચ ઉત્પાદનની ઉપલબ્ધતા, પેમેન્ટ/ક્રેડિટ ટર્મ્સ અને અન્ય વ્યાવસાયિક શરતોને આધિન રહેશે. ખાસ પેકિંગ અથવા ડિલિવરીની જરૂરિયાત હોય તો ડિસ્પેચ પહેલાં જણાવવી જરૂરી છે."
        ]
      },
      {
        number: 3,
        title: "ડિસ્પેચ અને શિપમેન્ટ",
        content: [
          "માલ સામાન્ય રીતે કંપની દ્વારા મંજૂર ટ્રાન્સપોર્ટર અથવા લોજિસ્ટિક્સ પાર્ટનર મારફતે મોકલવામાં આવશે. ટ્રાન્સપોર્ટનો પ્રકાર માલ, ગંતવ્ય, તાત્કાલિકતા અને ઉપલબ્ધતા અનુસાર નક્કી કરવામાં આવશે. વરસાદ, ટ્રાફિક, રોડ કન્ડિશન, વાહનની ઉપલબ્ધતા અથવા અન્ય અનિવાર્ય કારણોસર ડિલિવરીમાં વિલંબ થઈ શકે છે."
        ]
      },
      {
        number: 4,
        title: "ટ્રાન્સપોર્ટેશન ચાર્જ",
        content: [
          "Freight/Transport charges મંજૂર quotation, Purchase Order અથવા agreed commercial terms મુજબ રહેશે. ગ્રાહક દ્વારા freight ભરવાનું હોય તો તે અલગથી વસૂલવામાં આવી શકે છે. ગ્રાહકની ખાસ જરૂરિયાતને કારણે થતા વધારાના ટ્રાન્સપોર્ટ ખર્ચ ગ્રાહક પાસેથી વસૂલવામાં આવી શકે છે."
        ]
      },
      {
        number: 5,
        title: "લોડિંગ અને અનલોડિંગ",
        content: [
          "કંપનીના સ્થળે માલનું loading કંપનીની સામાન્ય પ્રક્રિયા મુજબ કરવામાં આવશે. ખાસ લેખિત કરાર ન હોય તો ગ્રાહકના સ્થળે unloading ગ્રાહકની જવાબદારી રહેશે. Crane, forklift, labour અથવા અન્ય unloading facilityની જરૂર હોય તો ગ્રાહકે વ્યવસ્થા કરવાની રહેશે."
        ]
      },
      {
        number: 6,
        title: "પેકેજિંગ",
        content: [
          "માલને સામાન્ય ટ્રાન્સપોર્ટ માટે યોગ્ય standard packagingમાં મોકલવામાં આવશે. ખાસ packagingની જરૂરિયાત હોય તો ડિસ્પેચ પહેલાં લેખિતમાં જણાવવી જરૂરી છે."
        ]
      },
      {
        number: 7,
        title: "ટ્રાન્ઝિટ ડેમેજ / શોર્ટેજ",
        content: [
          "માલ મળતી વખતે કોઈ damage, shortage અથવા abnormal condition જણાય તો તે LR/PODમાં નોંધાવવી જરૂરી છે. ગ્રાહકે તરત જ કંપનીને જાણ કરી જરૂરી photographs અને delivery documents આપવા રહેશે. યોગ્ય delivery remarks અથવા supporting documents વગરના claims ચકાસણીને આધિન રહેશે."
        ]
      },
      {
        number: 8,
        title: "ડિલિવરી અને POD",
        content: [
          "માલ agreed delivery location પર પહોંચાડી ગ્રાહક અથવા તેના authorized representative દ્વારા સ્વીકારવામાં આવે ત્યારે delivery પૂર્ણ ગણાશે. જ્યાં લાગુ પડે ત્યાં signed/stamped POD મેળવવામાં આવશે. ડિલિવરીમાં વિલંબ ટાળવા માટે ગ્રાહકે સાચું address, contact details અને site instructions અગાઉથી આપવાના રહેશે."
        ]
      },
      {
        number: 9,
        title: "ડિલિવરીમાં વિલંબ",
        content: [
          "કંપની સમયસર ડિલિવરી કરવાનો સંપૂર્ણ પ્રયત્ન કરશે. પરંતુ નીચેના કારણોસર વિલંબ થઈ શકે છે:",
          "કંપની દ્વારા લેખિતમાં ખાસ પુષ્ટિ ન કરવામાં આવી હોય ત્યાં સુધી Next-Day અથવા Fixed Delivery Commitment માન્ય ગણાશે નહીં."
        ],
        bullets: [
          "ભારે વરસાદ / પૂર",
          "રોડ બંધ અથવા ટ્રાફિક પ્રતિબંધ",
          "વાહન breakdown",
          "ટ્રાન્સપોર્ટર સંબંધિત વિલંબ",
          "કુદરતી આપત્તિ",
          "સરકારી પ્રતિબંધ",
          "હડતાળ અથવા મજૂર સંબંધિત સમસ્યા",
          "ઉત્પાદન અથવા ઓપરેશનલ સમસ્યા",
          "Force Majeure પરિસ્થિતિ"
        ]
      },
      {
        number: 10,
        title: "ગ્રાહકની જવાબદારી",
        content: ["ગ્રાહકે નીચે મુજબની જવાબદારીઓ નિભાવવાની રહેશે:"],
        bullets: [
          "સાચું delivery address અને contact details આપવાના રહેશે.",
          "delivery location વાહન માટે accessible રાખવાની રહેશે.",
          "જરૂરી unloading facility અને manpowerની વ્યવસ્થા કરવાની રહેશે.",
          "માલ સ્વીકારવા authorized person ઉપલબ્ધ રાખવો પડશે.",
          "delivery સમયે quantity અને visible condition ચેક કરવી પડશે.",
          "જરૂરી POD/delivery acknowledgement આપવું પડશે."
        ]
      },
      {
        number: 11,
        title: "ડિલિવરી રિજેક્ટ",
        content: [
          "યોગ્ય કારણ વગર ગ્રાહકે માલ reject કરવો નહીં. ગ્રાહકને કારણે delivery reject થાય તો additional transportation, detention, return freight, storage અથવા re-dispatch charges ગ્રાહક પાસેથી વસૂલવામાં આવી શકે છે."
        ]
      },
      {
        number: 12,
        title: "Detention / Waiting Charges",
        content: [
          "ગ્રાહકના કારણે વાહનને unloading માટે જરૂરી સમય કરતાં વધુ રાહ જોવી પડે તો લાગુ પડતા detention/waiting charges ગ્રાહક પાસેથી વસૂલવામાં આવી શકે છે."
        ]
      },
      {
        number: 13,
        title: "Return / Re-dispatch",
        content: [
          "માલનું return, replacement અથવા re-dispatch કંપનીની મંજૂરી અને લાગુ commercial termsને આધિન રહેશે."
        ]
      },
      {
        number: 14,
        title: "દસ્તાવેજીકરણ",
        content: ["જરૂરિયાત મુજબ નીચેના documents આપવામાં આવી શકે છે:"],
        bullets: [
          "Tax Invoice",
          "Delivery Challan",
          "E-Way Bill",
          "LR / Consignment Note",
          "Packing List",
          "Test Certificate",
          "Proof of Delivery (POD)"
        ]
      },
      {
        number: 15,
        title: "Force Majeure",
        content: [
          "કુદરતી આપત્તિ, પૂર, આગ, સરકારી પ્રતિબંધ, transport disruption, strike, riot, war અથવા કંપનીના નિયંત્રણ બહારની અન્ય પરિસ્થિતિઓને કારણે થતા વિલંબ માટે કંપની જવાબદાર રહેશે નહીં."
        ]
      },
      {
        number: 16,
        title: "Policy Exception",
        content: [
          "આ પોલિસીમાં કોઈપણ ફેરફાર અથવા exception માત્ર કંપનીના authorized management representativeની લેખિત મંજૂરીથી જ માન્ય રહેશે."
        ]
      },
      {
        number: 17,
        title: "Policy Review",
        content: [
          "કંપની જરૂરિયાત મુજબ આ પોલિસીમાં સમયાંતરે ફેરફાર અથવા સુધારો કરી શકે છે."
        ]
      }
    ]
  },
  hi: {
    lang: "hi",
    label: "हिंदी",
    nativeName: "हिंदी संस्करण",
    flag: "🇮🇳",
    companyName: "VOLAMP ELEKTRIKALS PRIVATE LIMITED",
    title: "शिपमेंट एवं डिलीवरी पॉलिसी",
    policyNo: "VEP/LOG/001",
    version: "1.0",
    effectiveDate: "2017/08/09",
    signoff: "For VOLAMP ELEKTRIKALS PRIVATE LIMITED",
    clauses: [
      {
        number: 1,
        title: "उद्देश्य",
        content: [
          "इस शिपमेंट एवं डिलीवरी पॉलिसी का उद्देश्य कंपनी द्वारा ग्राहकों को भेजे जाने वाले माल की सुरक्षित, समय पर और उचित दस्तावेज़ीकरण के साथ डिलीवरी सुनिश्चित करना है।"
        ]
      },
      {
        number: 2,
        title: "ऑर्डर प्रोसेसिंग",
        content: [
          "वैध Purchase Order / Sales Order प्राप्त होने के बाद ही ऑर्डर प्रोसेस किया जाएगा। डिस्पैच उत्पाद की उपलब्धता, भुगतान/क्रेडिट शर्तों तथा अन्य व्यावसायिक शर्तों पर निर्भर रहेगा। विशेष पैकिंग या डिलीवरी की आवश्यकता होने पर डिस्पैच से पहले सूचित करना आवश्यक है।"
        ]
      },
      {
        number: 3,
        title: "डिस्पैच एवं शिपमेंट",
        content: [
          "माल सामान्यतः कंपनी द्वारा स्वीकृत ट्रांसपोर्टर या लॉजिस्टिक्स पार्टनर के माध्यम से भेजा जाएगा। ट्रांसपोर्ट का माध्यम माल, गंतव्य, आवश्यकता और उपलब्धता के अनुसार तय किया जाएगा। बारिश, ट्रैफिक, सड़क की स्थिति, वाहन की उपलब्धता या अन्य अनियंत्रित कारणों से डिलीवरी में देरी हो सकती है।"
        ]
      },
      {
        number: 4,
        title: "ट्रांसपोर्टेशन चार्ज",
        content: [
          "Freight/Transport charges स्वीकृत quotation, Purchase Order या agreed commercial terms के अनुसार होंगे। यदि freight ग्राहक द्वारा भुगतान किया जाना है, तो उसे अलग से charge किया जा सकता है। ग्राहक की विशेष आवश्यकता के कारण होने वाले अतिरिक्त transport charges ग्राहक से वसूल किए जा सकते हैं।"
        ]
      },
      {
        number: 5,
        title: "लोडिंग एवं अनलोडिंग",
        content: [
          "कंपनी के परिसर में loading कंपनी की सामान्य प्रक्रिया के अनुसार की जाएगी। जब तक लिखित रूप से अन्यथा तय न हो, ग्राहक के परिसर में unloading ग्राहक की जिम्मेदारी होगी। Crane, forklift, labour या अन्य unloading facility की आवश्यकता होने पर ग्राहक को इसकी व्यवस्था करनी होगी।"
        ]
      },
      {
        number: 6,
        title: "पैकेजिंग",
        content: [
          "माल को सामान्य परिवहन के लिए उपयुक्त standard packaging में भेजा जाएगा। विशेष packaging की आवश्यकता होने पर डिस्पैच से पहले लिखित रूप से सूचित करना आवश्यक है।"
        ]
      },
      {
        number: 7,
        title: "ट्रांजिट डैमेज / शॉर्टेज",
        content: [
          "डिलीवरी के समय किसी भी damage, shortage या abnormal condition को LR/POD में दर्ज करना आवश्यक है। ग्राहक को तुरंत कंपनी को सूचित करके photographs और संबंधित delivery documents उपलब्ध कराने होंगे। उचित delivery remarks या supporting documents के बिना किए गए claims verification के अधीन होंगे।"
        ]
      },
      {
        number: 8,
        title: "डिलीवरी एवं POD",
        content: [
          "माल agreed delivery location पर पहुंचाकर ग्राहक या उसके authorized representative द्वारा स्वीकार किए जाने पर delivery पूर्ण मानी जाएगी। जहां लागू हो, signed/stamped POD लिया जाएगा। डिलीवरी में देरी से बचने के लिए ग्राहक को सही address, contact details और site instructions पहले से उपलब्ध कराने होंगे।"
        ]
      },
      {
        number: 9,
        title: "डिलीवरी में देरी",
        content: [
          "कंपनी समय पर डिलीवरी करने का पूरा प्रयास करेगी। हालांकि निम्न कारणों से देरी हो सकती है:",
          "कंपनी द्वारा लिखित रूप से विशेष पुष्टि नहीं की गई हो तो Next-Day या Fixed Delivery Commitment मान्य नहीं होगा।"
        ],
        bullets: [
          "भारी बारिश / बाढ़",
          "सड़क बंद या ट्रैफिक प्रतिबंध",
          "वाहन breakdown",
          "ट्रांसपोर्टर से संबंधित देरी",
          "प्राकृतिक आपदा",
          "सरकारी प्रतिबंध",
          "हड़ताल या श्रमिक समस्या",
          "उत्पाद या operational समस्या",
          "Force Majeure परिस्थितियां"
        ]
      },
      {
        number: 10,
        title: "ग्राहक की जिम्मेदारी",
        content: ["ग्राहक को निम्न जिम्मेदारियों का पालन करना होगा:"],
        bullets: [
          "सही delivery address और contact details उपलब्ध कराने होंगे।",
          "delivery location को वाहन के लिए accessible रखना होगा।",
          "आवश्यक unloading facility और manpower की व्यवस्था करनी होगी।",
          "माल प्राप्त करने के लिए authorized person उपलब्ध रखना होगा।",
          "डिलीवरी के समय quantity और visible condition की जांच करनी होगी।",
          "आवश्यक POD/delivery acknowledgement उपलब्ध कराना होगा।"
        ]
      },
      {
        number: 11,
        title: "डिलीवरी रिजेक्शन",
        content: [
          "बिना उचित कारण के ग्राहक द्वारा माल reject नहीं किया जाना चाहिए। यदि ग्राहक के कारण delivery reject होती है, तो additional transportation, detention, return freight, storage या re-dispatch charges ग्राहक से वसूल किए जा सकते हैं।"
        ]
      },
      {
        number: 12,
        title: "Detention / Waiting Charges",
        content: [
          "यदि ग्राहक के कारण वाहन को unloading के लिए आवश्यक समय से अधिक प्रतीक्षा करनी पड़ती है, तो लागू detention/waiting charges ग्राहक से वसूल किए जा सकते हैं।"
        ]
      },
      {
        number: 13,
        title: "Return / Re-dispatch",
        content: [
          "माल का return, replacement या re-dispatch कंपनी की मंजूरी और लागू commercial terms के अधीन होगा।"
        ]
      },
      {
        number: 14,
        title: "दस्तावेज़",
        content: ["आवश्यकतानुसार निम्न documents उपलब्ध कराए जा सकते हैं:"],
        bullets: [
          "Tax Invoice",
          "Delivery Challan",
          "E-Way Bill",
          "LR / Consignment Note",
          "Packing List",
          "Test Certificate",
          "Proof of Delivery (POD)"
        ]
      },
      {
        number: 15,
        title: "Force Majeure",
        content: [
          "प्राकृतिक आपदा, बाढ़, आग, सरकारी प्रतिबंध, transport disruption, strike, riot, war या कंपनी के नियंत्रण से बाहर की अन्य परिस्थितियों के कारण होने वाली देरी के लिए कंपनी जिम्मेदार नहीं होगी।"
        ]
      },
      {
        number: 16,
        title: "Policy Exception",
        content: [
          "इस पॉलिसी में कोई भी बदलाव या exception केवल कंपनी के authorized management representative की लिखित मंजूरी से ही मान्य होगा।"
        ]
      },
      {
        number: 17,
        title: "Policy Review",
        content: [
          "कंपनी आवश्यकता के अनुसार इस पॉलिसी में समय-समय पर संशोधन या बदलाव कर सकती है।"
        ]
      }
    ]
  }
};

export default function ShippingPolicy() {
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeClause, setActiveClause] = useState<number | null>(null);

  const activePolicy = policyData[currentLang];

  const filteredClauses = useMemo(() => {
    if (!searchQuery.trim()) return activePolicy.clauses;
    const q = searchQuery.toLowerCase();
    return activePolicy.clauses.filter(
      (c) =>
        c.number.toString().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.content.some((text) => text.toLowerCase().includes(q)) ||
        c.bullets?.some((b) => b.toLowerCase().includes(q))
    );
  }, [activePolicy, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = (clauseNum: number) => {
    const url = `${window.location.origin}/shipping-policy#clause-${clauseNum}`;
    navigator.clipboard.writeText(url);
    toast.success("Clause link copied to clipboard", {
      description: `Link for Clause ${clauseNum}: ${activePolicy.clauses.find((c) => c.number === clauseNum)?.title}`
    });
  };

  return (
    <div className="policy-page">
      {/* Top Header */}
      <header className="policy-navbar">
        <div className="policy-nav-container">
          <div className="policy-nav-left">
            <Link href="/" className="policy-back-btn">
              <ArrowLeft className="size-4" />
              <span>Back to Marketplace</span>
            </Link>
            <div className="policy-nav-brand">
              <img src="/volamp-logo.png" alt="VOLAMP" className="policy-brand-img" />
              <span className="policy-brand-badge">LOGISTICS PORTAL</span>
            </div>
          </div>

          <div className="policy-nav-actions">
            {/* Policy Switcher */}
            <div className="policy-switcher-pills">
              <Link href="/shipping-policy" className="policy-switch-pill is-active">
                <Truck className="size-3.5" />
                <span>Shipping Policy</span>
              </Link>
              <Link href="/privacy-policy" className="policy-switch-pill">
                <FileText className="size-3.5" />
                <span>Privacy Policy</span>
              </Link>
              <Link href="/refund-policy" className="policy-switch-pill">
                <FileCheck className="size-3.5" />
                <span>Refund Policy</span>
              </Link>
            </div>

            {/* Language Switcher */}
            <div className="policy-lang-pills">
              <Languages className="size-3.5 policy-lang-icon" />
              {(["en", "gu", "hi"] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`policy-lang-pill ${currentLang === l ? "is-active" : ""}`}
                  onClick={() => setCurrentLang(l)}
                >
                  <span className="lang-flag">{policyData[l].flag}</span>
                  <span className="lang-name">{policyData[l].label}</span>
                </button>
              ))}
            </div>

            <button type="button" className="policy-action-btn" onClick={handlePrint} title="Print or save as PDF">
              <Printer className="size-4" />
              <span>Print Policy</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero / Document Metadata Banner */}
      <section className="policy-hero-banner">
        <div className="policy-container">
          <div className="policy-hero-card">
            <div className="policy-hero-top">
              <div className="policy-hero-identity">
                <div className="policy-doc-icon-box">
                  <Truck className="size-7" />
                </div>
                <div>
                  <span className="policy-org-eyebrow">{activePolicy.companyName}</span>
                  <h1 className="policy-main-title">{activePolicy.title}</h1>
                </div>
              </div>

              <div className="policy-status-pill">
                <span className="status-dot" />
                <span>OFFICIALLY ENFORCED</span>
              </div>
            </div>

            <div className="policy-meta-grid">
              <div className="policy-meta-item">
                <FileText className="size-4" />
                <div>
                  <small>POLICY NUMBER</small>
                  <strong>{activePolicy.policyNo}</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <FileCheck className="size-4" />
                <div>
                  <small>DOCUMENT VERSION</small>
                  <strong>Version {activePolicy.version}</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <Calendar className="size-4" />
                <div>
                  <small>EFFECTIVE DATE</small>
                  <strong>{activePolicy.effectiveDate}</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <ShieldCheck className="size-4" />
                <div>
                  <small>DEPARTMENT</small>
                  <strong>Logistics & Operations</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Logistics Summary Cards */}
      <section className="policy-summary-strip">
        <div className="policy-container">
          <div className="policy-summary-grid">
            <div className="policy-summary-card">
              <div className="summary-card-icon">
                <Truck className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>Approved Transporters</h4>
                <p>Material dispatched via vetted logistics partners based on urgency, destination and product type.</p>
              </div>
            </div>

            <div className="policy-summary-card">
              <div className="summary-card-icon">
                <FileCheck className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>Mandatory LR / POD</h4>
                <p>Visible damages or shortages must be recorded on LR/POD at time of delivery with photo proof.</p>
              </div>
            </div>

            <div className="policy-summary-card">
              <div className="summary-card-icon">
                <Package className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>Standard & Custom Packing</h4>
                <p>Industrial grade packing; any special crating or moisture-proof packing must be pre-arranged.</p>
              </div>
            </div>

            <div className="policy-summary-card">
              <div className="summary-card-icon">
                <Clock className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>Customer Unloading</h4>
                <p>Unloading arrangements (crane, forklift, labour) are the customer’s responsibility at destination.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="policy-body-section">
        <div className="policy-container policy-layout-split">
          {/* Sticky Table of Contents */}
          <aside className="policy-toc-sidebar">
            <div className="policy-toc-card">
              <div className="policy-toc-header">
                <h3>Table of Contents</h3>
                <span className="toc-count">{activePolicy.clauses.length} Clauses</span>
              </div>

              {/* Clause Search Input */}
              <div className="policy-search-box">
                <Search className="size-3.5 policy-search-icon" />
                <input
                  type="text"
                  placeholder="Filter clauses (e.g. damage, POD, delay)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="policy-search-input"
                />
                {searchQuery && (
                  <button type="button" className="policy-search-clear" onClick={() => setSearchQuery("")}>
                    ×
                  </button>
                )}
              </div>

              <nav className="policy-toc-nav" aria-label="Policy Clauses">
                {activePolicy.clauses.map((clause) => {
                  const isMatch = filteredClauses.some((fc) => fc.number === clause.number);
                  return (
                    <a
                      key={clause.number}
                      href={`#clause-${clause.number}`}
                      className={`policy-toc-link ${!isMatch ? "is-dimmed" : ""} ${activeClause === clause.number ? "is-active" : ""}`}
                      onClick={() => setActiveClause(clause.number)}
                    >
                      <span className="toc-num">{clause.number.toString().padStart(2, "0")}</span>
                      <span className="toc-title">{clause.title}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="policy-help-box">
                <div className="help-box-top">
                  <Phone className="size-4" />
                  <strong>Logistics Support Desk</strong>
                </div>
                <p>Have special delivery instructions, crane requirements, or need consignment tracking?</p>
                <a href="tel:+919512365582" className="help-phone-btn">
                  Call +91 9512365582
                </a>
              </div>
            </div>
          </aside>

          {/* Clauses Content */}
          <section className="policy-clauses-container">
            {filteredClauses.length === 0 ? (
              <div className="policy-empty-search">
                <AlertTriangle className="size-8 text-amber-500" />
                <h3>No matching clauses found</h3>
                <p>Try searching for words like &quot;freight&quot;, &quot;damage&quot;, &quot;unloading&quot;, or &quot;POD&quot;.</p>
                <button type="button" onClick={() => setSearchQuery("")} className="policy-reset-search-btn">
                  Clear Search Filter
                </button>
              </div>
            ) : (
              filteredClauses.map((clause) => (
                <article
                  key={clause.number}
                  id={`clause-${clause.number}`}
                  className={`policy-clause-card ${activeClause === clause.number ? "is-highlighted" : ""}`}
                >
                  <div className="clause-header">
                    <div className="clause-number-badge">
                      <span>{clause.number.toString().padStart(2, "0")}</span>
                    </div>
                    <h2 className="clause-title">{clause.title}</h2>

                    <button
                      type="button"
                      className="clause-copy-btn"
                      onClick={() => handleCopyLink(clause.number)}
                      title="Copy link to this clause"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>

                  <div className="clause-body">
                    {clause.content.map((p, idx) => (
                      <p key={idx} className="clause-paragraph">
                        {p}
                      </p>
                    ))}

                    {clause.bullets && clause.bullets.length > 0 && (
                      <ul className="clause-bullet-list">
                        {clause.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="clause-bullet-item">
                            <CheckCircle2 className="size-4 bullet-icon" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              ))
            )}

            {/* Official Sign-off Card */}
            <div className="policy-signoff-card">
              <div className="signoff-seal">
                <ShieldCheck className="size-8" />
              </div>
              <div className="signoff-text">
                <span className="signoff-for">OFFICIAL POLICY DECLARATION</span>
                <h3>{activePolicy.signoff}</h3>
                <p>
                  This document constitutes the official shipment, dispatch, and delivery terms of Volamp Elektrikals
                  Private Limited. All buyers, contractors, and distribution partners are governed by these operational
                  stipulations.
                </p>
                <div className="signoff-meta">
                  <span>Policy ID: {activePolicy.policyNo}</span>
                  <span>·</span>
                  <span>Version: {activePolicy.version}</span>
                  <span>·</span>
                  <span>Effective Date: {activePolicy.effectiveDate}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="policy-footer">
        <div className="policy-container policy-footer-inner">
          <div className="policy-footer-left">
            <strong>VOLAMP ELEKTRIKALS PRIVATE LIMITED</strong>
            <small>Ahmedabad, Gujarat, India · Global & Domestic Electrical Supply Network</small>
          </div>

          <div className="policy-footer-right">
            <Link href="/" className="footer-link">
              Marketplace
            </Link>
            <span className="footer-dot">·</span>
            <Link href="/about-volamp" className="footer-link">
              About Volamp
            </Link>
            <span className="footer-dot">·</span>
            <a href="https://wa.me/919512365582" target="_blank" rel="noreferrer" className="footer-link">
              WhatsApp Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
