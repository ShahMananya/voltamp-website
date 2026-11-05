const fs = require("fs");
const path = require("path");

// 1. Align Dispatch Time strings
// Home.tsx
const homePath = path.resolve(__dirname, "../client/src/pages/Home.tsx");
let homeContent = fs.readFileSync(homePath, "utf8").replace(/\r\n/g, "\n");
homeContent = homeContent.replace(
  '24-48h dispatch across India.',
  '48-72h dispatch across India.'
);

// Add visible FAQ section to Home.tsx right above </main>
const visibleFaqSection = `      {/* 11. Frequently Asked Questions (Matches FAQ Schema exactly for Google Search & AEO) */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800" id="faq">
        <div className="market-container max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-[#c56718] dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Essential B2B Procurement & Distribution Facts
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Clear, verifiable answers regarding our Ahmedabad facilities, authorized brand distributorships, dispatch SLAs, and compliance.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Where is Volamp Elektrikals located in Ahmedabad?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Volamp Elektrikals corporate head office is located at 1753, Dhobi's Pole, Chinubhai Road, Khadia, Ahmedabad, Gujarat 380001 in the historic Gandhi Road electrical trading hub. Its central logistics &amp; fulfillment terminal is situated at Aslali Highway, Ahmedabad.
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                What brands and cables does Volamp distribute in Gujarat?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Volamp Elektrikals is an authorized wholesale distributor and supplier of Polycab India, Finolex Cables, KEI Industries, Schneider Electric, Larsen &amp; Toubro (L&amp;T / Lauritz Knudsen), Dowells, and Legrand. Products include LT/HT XLPE armoured cables, 1500V solar DC cables, copper flexible wires, switchgear (ACB/MCCB/MCB), and chemical earthing rods.
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                What is the dispatch turnaround time for industrial electrical orders?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Orders within Ahmedabad and major Gujarat GIDC manufacturing zones (Sanand, Changodar, Vatva, Naroda, Ankleshwar, Dahej) benefit from same-day to 24-hour dispatch from the Aslali central warehouse. Pan-India shipments arrive within 48 to 72 hours with transit insurance.
              </p>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                How do I register a dispute, shortage, or transit complaint with Volamp?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Customers can register formal cases online at <a href="/complaints-cases" className="text-[#c56718] font-semibold hover:underline">volampelektrikals.com/complaints-cases</a> or email the Grievance &amp; Escalation Cell directly at <a href="mailto:Grievances@volampelektrikals.com" className="text-[#c56718] font-semibold hover:underline">Grievances@volampelektrikals.com</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>`;

if (!homeContent.includes('id="faq"')) {
  homeContent = homeContent.replace('    </main>', visibleFaqSection);
  console.log("Added visible FAQ section matching schema to Home.tsx");
}
fs.writeFileSync(homePath, homeContent, "utf8");

// ProductDetailPage.tsx dispatch string alignment
const prodDetailPath = path.resolve(__dirname, "../client/src/pages/ProductDetailPage.tsx");
let prodDetailContent = fs.readFileSync(prodDetailPath, "utf8").replace(/\r\n/g, "\n");
prodDetailContent = prodDetailContent.replace(
  'doc.text("28 States · 24-48h Dispatch", 147, yPos + 12.5);',
  'doc.text("28 States · 48-72h Dispatch", 147, yPos + 12.5);'
);
prodDetailContent = prodDetailContent.replace(
  '<span className="text-[9px] text-slate-400">24-48h Dispatch</span>',
  '<span className="text-[9px] text-slate-400">Same-Day / 48-72h Dispatch</span>'
);
fs.writeFileSync(prodDetailPath, prodDetailContent, "utf8");
console.log("Updated ProductDetailPage.tsx dispatch strings");

// 2. Align SocialMediaLinks.tsx URLs to clean canonical URLs
const socialPath = path.resolve(__dirname, "../client/src/components/layout/SocialMediaLinks.tsx");
let socialContent = fs.readFileSync(socialPath, "utf8").replace(/\r\n/g, "\n");
socialContent = socialContent.replace(
  'href: "https://www.facebook.com/profile.php?id=61587485305483#",',
  'href: "https://www.facebook.com/profile.php?id=61587485305483",'
);
socialContent = socialContent.replace(
  'href: "https://www.instagram.com/volampp?stkn=dGtjZDA1enF5OWN6",',
  'href: "https://www.instagram.com/volampp",'
);
socialContent = socialContent.replace(
  'href: "https://m.youtube.com/%40cablezone",',
  'href: "https://www.youtube.com/@cablezone",'
);
socialContent = socialContent.replace(
  'href: "https://x.com/VolampL?t=vkBQW9lpw2gNbC5lDqYUCg&s=09",',
  'href: "https://x.com/volampelektrik",'
);
socialContent = socialContent.replace(
  'title: "VOLAMP on X (@VolampL)",',
  'title: "VOLAMP on X (@volampelektrik)",'
);
socialContent = socialContent.replace(
  'href: "https://in.pinterest.com/volammp2021/",',
  'href: "https://www.pinterest.com/volampelektrikals/",'
);
socialContent = socialContent.replace(
  'title: "VOLAMP on Pinterest (@volammp2021)",',
  'title: "VOLAMP on Pinterest (@volampelektrikals)",'
);
fs.writeFileSync(socialPath, socialContent, "utf8");
console.log("Aligned SocialMediaLinks.tsx to official canonical profiles");

// 3. Align server/db.ts and server/volaBrain.ts dispatch strings
const dbPath = path.resolve(__dirname, "../server/db.ts");
let dbContent = fs.readFileSync(dbPath, "utf8").replace(/\r\n/g, "\n");
dbContent = dbContent.replace(
  'time: "Expected 24-48h post dispatch",',
  'time: "Expected 48-72h post dispatch (24h in Gujarat GIDC)",'
);
fs.writeFileSync(dbPath, dbContent, "utf8");

const brainPath = path.resolve(__dirname, "../server/volaBrain.ts");
let brainContent = fs.readFileSync(brainPath, "utf8").replace(/\r\n/g, "\n");
brainContent = brainContent.replace(
  '(24–48h Dispatch under Policy VEP/LOG/001)',
  '(Same-day to 24h Gujarat GIDC / 48–72h Pan-India Dispatch under Policy VEP/LOG/001)'
);
fs.writeFileSync(brainPath, brainContent, "utf8");
console.log("Aligned server dispatch records");

console.log("All launch verification fixes applied successfully.");
