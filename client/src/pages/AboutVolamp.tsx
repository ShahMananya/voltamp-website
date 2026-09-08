import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Cable, Globe2, MapPin, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import Globe from "react-globe.gl";
import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";

type FootprintState = {
  name: string;
  code: string;
  lat: number;
  lng: number;
  territory: string;
  heritage: string;
  orders: number | null;
  note: string;
  variant: "craft" | "industry" | "desert" | "capital" | "river" | "east" | "tech" | "engineering" | "coast" | "backwater";
};

const footprintStates: FootprintState[] = [
  { name: "Gujarat", code: "GJ", lat: 22.25, lng: 71.19, territory: "West India", heritage: "Craft, enterprise and a practical engineering culture.", orders: null, note: "Verified order ledger will be connected here.", variant: "craft" },
  { name: "Maharashtra", code: "MH", lat: 19.75, lng: 75.71, territory: "West India", heritage: "A dense industrial and infrastructure corridor.", orders: null, note: "Verified order ledger will be connected here.", variant: "industry" },
  { name: "Rajasthan", code: "RJ", lat: 27.02, lng: 74.21, territory: "North-West India", heritage: "Scale, resilience and long-distance movement.", orders: null, note: "Verified order ledger will be connected here.", variant: "desert" },
  { name: "Delhi NCR", code: "DL", lat: 28.61, lng: 77.20, territory: "North India", heritage: "A national decision-making and project hub.", orders: null, note: "Verified order ledger will be connected here.", variant: "capital" },
  { name: "Uttar Pradesh", code: "UP", lat: 26.85, lng: 80.91, territory: "North India", heritage: "Large-scale public, industrial and built-environment demand.", orders: null, note: "Verified order ledger will be connected here.", variant: "river" },
  { name: "West Bengal", code: "WB", lat: 22.98, lng: 87.85, territory: "East India", heritage: "Port access, manufacturing and eastern trade routes.", orders: null, note: "Verified order ledger will be connected here.", variant: "east" },
  { name: "Telangana", code: "TG", lat: 17.12, lng: 79.20, territory: "South-Central India", heritage: "Technology, manufacturing and fast-moving infrastructure.", orders: null, note: "Verified order ledger will be connected here.", variant: "tech" },
  { name: "Karnataka", code: "KA", lat: 15.32, lng: 75.71, territory: "South India", heritage: "Engineering, technology and modern industrial systems.", orders: null, note: "Verified order ledger will be connected here.", variant: "engineering" },
  { name: "Tamil Nadu", code: "TN", lat: 11.12, lng: 78.65, territory: "South India", heritage: "A deep manufacturing and renewable-energy base.", orders: null, note: "Verified order ledger will be connected here.", variant: "coast" },
  { name: "Kerala", code: "KL", lat: 10.85, lng: 76.27, territory: "South-West India", heritage: "Trade, ports and a distinctive coastal supply network.", orders: null, note: "Verified order ledger will be connected here.", variant: "backwater" },
];

const teamSlots = Array.from({ length: 9 }, (_, index) => ({
  number: String(index + 1).padStart(2, "0"),
  name: `Team member ${String(index + 1).padStart(2, "0")}`,
  role: "Profile pending approval",
}));

function BrandMark() {
  return <div className="about-brand" aria-label="VOLAMP home"><img src="/manus-storage/volamp-logo-corrected_263c7f84.png" alt="VOLAMP Powering Growth" /></div>;
}

export default function AboutVolamp() {
  const [selectedState, setSelectedState] = useState<FootprintState>(footprintStates[0]);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [indiaFeatures, setIndiaFeatures] = useState<any[]>([]);
  const [stage, setStage] = useState<"world" | "india">("world");
  const [globeSize, setGlobeSize] = useState({ width: 640, height: 500 });
  const globeRef = useRef<any>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const resize = () => setGlobeSize({ width: Math.max(300, node.clientWidth), height: Math.max(360, Math.min(560, node.clientWidth * 0.78)) });
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch("/manus-storage/india_state_simplified_3808fbf8.geojson").then((response) => response.json()).then((payload) => setIndiaFeatures(payload.features ?? [])).catch(() => setIndiaFeatures([]));
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView({ lat: 8, lng: 30, altitude: 2.55 }, 0);
    const timer = window.setTimeout(() => {
      setStage("india");
      globe.pointOfView({ lat: 22, lng: 79, altitude: 1.15 }, 1500);
    }, 500);
    return () => window.clearTimeout(timer);
  }, []);

  const points = useMemo(() => footprintStates.map((state) => ({ ...state, size: state.name === selectedState.name ? 0.72 : 0.42 })), [selectedState]);
  const resolveState = (name: string): FootprintState => footprintStates.find((state) => state.name === name || state.name === name.replace(" NCT of Delhi", " NCR")) ?? { name, code: name.slice(0, 2).toUpperCase(), lat: 22, lng: 79, territory: "India footprint", heritage: "State-level cultural context will be added with approved regional guidance.", orders: null, note: "Verified order ledger will be connected here.", variant: "industry" };

  return <div className="about-page">
    <header className="about-header">
      <div className="about-header-inner">
        <Link href="/"><BrandMark /></Link>
        <nav aria-label="About Volamp navigation">
          <a href="#story">Our story</a>
          <a href="#leadership">Leadership</a>
          <a href="#footprint">India footprint</a>
        </nav>
        <div className="about-header-actions"><ThemeToggle /><Link className="about-header-cta" href="/">Marketplace <ArrowRight className="size-4" /></Link></div>
      </div>
    </header>

    <main>
      <section className="about-hero">
        <div className="about-container about-hero-grid">
          <div>
            <span className="about-eyebrow">ABOUT VOLAMP · POWERING GROWTH</span>
            <h1>The work behind the <em>connection.</em></h1>
            <p>Volamp brings clearer electrical sourcing to the people responsible for keeping projects, plants and communities moving.</p>
            <div className="about-hero-actions"><a className="about-primary-cta" href="#story">Read our story <ArrowRight className="size-4" /></a><a className="about-secondary-cta" href="#footprint">Explore our footprint <MapPin className="size-4" /></a></div>
          </div>
          <div className="about-hero-art"><div className="about-orbit about-orbit-one" /><div className="about-orbit about-orbit-two" /><div className="about-hero-core"><Cable /><span>VLP</span></div><span className="about-hero-coordinate">23° 01' N · 72° 34' E</span></div>
        </div>
      </section>

      <section id="story" className="about-section about-story">
        <div className="about-container about-section-heading"><div><span className="about-eyebrow">01 · COMPANY STORY</span><h2>Built patiently.<br /><em>Delivered clearly.</em></h2></div><p>Volamp’s public story carries a reported legacy from the 1960s, a revival in 2012, and a present legal entity incorporated in Ahmedabad in 2021.</p></div>
        <div className="about-container about-timeline"><div className="about-timeline-line" />{[{ year: "1960s", title: "A reported electrical legacy", detail: "The Volamp story begins in the era of India’s electrification, with a practical relationship to the materials that make progress possible." }, { year: "2012", title: "A focused revival", detail: "The business was revived around a simple gap: unavailable cables, late delivery and unclear specifications create expensive project friction." }, { year: "2021", title: "A present-day entity", detail: "Volamp Elektrikals Private Limited was incorporated in Ahmedabad, bringing a more accountable supply-partner model to the work." }, { year: "Today", title: "A clearer next step", detail: "We are building the systems, product knowledge and human follow-through needed to make electrical sourcing easier to act on." }].map((item) => <article className="about-timeline-item" key={item.year}><span>{item.year}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div></article>)}</div>
      </section>

      <section className="about-section about-goals"><div className="about-container"><div className="about-section-heading"><div><span className="about-eyebrow">02 · OUR GOALS</span><h2>Make the supply chain<br /><em>feel more certain.</em></h2></div><p>Our goal is not to make electrical sourcing louder. It is to make every next step more legible, better documented and easier to own.</p></div><div className="about-goal-grid"><article><Target /><span>01</span><h3>Clarity before commitment</h3><p>Help teams begin with the right category, a useful specification conversation and transparent next actions.</p></article><article><ShieldCheck /><span>02</span><h3>Reliability in the handoff</h3><p>Build dependable follow-through from enquiry to quotation, dispatch and private customer records.</p></article><article><Users /><span>03</span><h3>Growth with accountability</h3><p>Grow across India while preserving the human responsibility behind every project conversation.</p></article></div></div></section>

      <section id="leadership" className="about-section about-leadership"><div className="about-container"><div className="about-section-heading"><div><span className="about-eyebrow">03 · LEADERSHIP</span><h2>People who stay<br /><em>close to the work.</em></h2></div><p>The page is ready for approved portraits, biographies and team details. Until those assets are supplied, it deliberately avoids inventing identities or credentials.</p></div><div className="about-ceo-card"><div className="about-ceo-portrait"><span>NP</span><small>CEO PROFILE</small></div><div><span className="about-eyebrow">MEET THE CEO</span><h3>Naimil Patel</h3><p className="about-role">Chief Executive Officer · Volamp Elektrikals Private Limited</p><blockquote>“Our work is simple to describe and demanding to deliver: make it easier for the people building India to find the right electrical supply, understand the next step and receive the follow-through they were promised.”</blockquote><small className="about-draft-note">CEO message draft · confirm wording with Naimil Patel before publication.</small></div></div><div className="about-team-header"><div><span className="about-eyebrow">MEET THE TEAM</span><h3>Nine people, one accountable handoff.</h3></div><span className="about-team-note">Team names, roles and portraits are ready to be connected when provided.</span></div><div className="about-team-grid">{teamSlots.map((member) => <article key={member.number} className="about-team-card"><div className="about-team-avatar">{member.number}</div><span>{member.name}</span><small>{member.role}</small></article>)}</div></div></section>

      <section id="footprint" className="about-section about-footprint"><div className="about-container"><div className="about-section-heading"><div><span className="about-eyebrow">04 · INDIA FOOTPRINT</span><h2>From a world of possibility<br /><em>to a state-level view.</em></h2></div><p>The globe begins in a wide orbital view, then moves toward India. Select a marker or state to open the footprint panel; verified completed-order data can be connected without changing the interaction model.</p></div><div className="about-footprint-console"><div className="about-globe-panel"><div className="about-globe-status"><span><i className={stage === "india" ? "is-live" : ""} />{stage === "india" ? "INDIA VIEW" : "ORBITAL VIEW"}</span><span>{hoveredState ? `HOVER · ${hoveredState}` : "CLICK A STATE"}</span><span>WEBGL · 3D</span></div><div ref={viewportRef} className="about-globe-viewport"><Globe ref={globeRef} width={globeSize.width} height={globeSize.height} backgroundColor="rgba(0,0,0,0)" globeImageUrl="/manus-storage/earth-blue-marble_cb903e9b.jpg" bumpImageUrl="/manus-storage/earth-topology_640fce13.png" atmosphereColor="#4c91bd" atmosphereAltitude={0.16} polygonsData={indiaFeatures} polygonGeoJsonGeometry="geometry" polygonCapColor={(feature: object) => (feature as any).properties?.NAME_1 === selectedState.name ? "#f2b84bcc" : "#1d73b766"} polygonSideColor={() => "#0d263b"} polygonStrokeColor={() => "#8dd2f4"} polygonAltitude={(feature: object) => (feature as any).properties?.NAME_1 === selectedState.name ? 0.08 : 0.025} polygonLabel={(feature: object) => `<b>${(feature as any).properties?.NAME_1 ?? "India state"}</b><br/>Click for regional footprint`} onPolygonHover={(feature: object | null) => setHoveredState(feature ? (feature as any).properties?.NAME_1 ?? null : null)} onPolygonClick={(feature: object) => { const state = resolveState((feature as any).properties?.NAME_1 ?? "India state"); setSelectedState(state); globeRef.current?.pointOfView({ lat: state.lat, lng: state.lng, altitude: 0.72 }, 700); }} pointsData={points} pointLat="lat" pointLng="lng" pointColor={(point: object) => (point as FootprintState).name === selectedState.name ? "#f2b84b" : "#8dd2f4"} pointAltitude={(point: object) => (point as FootprintState).name === selectedState.name ? 0.11 : 0.06} pointRadius={(point: object) => (point as FootprintState & { size: number }).size} pointLabel={(point: object) => `<b>${(point as FootprintState).name}</b><br/>Click for regional footprint`} onPointClick={(point: object) => { setSelectedState(point as FootprintState); globeRef.current?.pointOfView({ lat: (point as FootprintState).lat, lng: (point as FootprintState).lng, altitude: 0.72 }, 700); }} enablePointerInteraction /></div><div className="about-globe-caption"><Globe2 className="size-4" /><span>Animated orbital context · India state markers · subtle cultural context</span></div></div><aside className="about-footprint-panel"><div className="about-footprint-panel-top"><span className="about-eyebrow">SELECTED REGION</span><span className="about-state-code">{selectedState.code}</span></div><h3>{selectedState.name}</h3><p className="about-state-territory">{selectedState.territory}</p><div className={`about-state-heritage-art is-${selectedState.variant}`}><span>{selectedState.code}</span><small>{selectedState.territory}</small></div><div className="about-state-story"><Sparkles className="size-4" /><span>{selectedState.heritage}</span></div><div className="about-order-status"><span>COMPLETED ORDERS</span><strong>{selectedState.orders === null ? "Awaiting verified feed" : selectedState.orders}</strong><p>{selectedState.note}</p></div><div className="about-state-list"><span className="about-eyebrow">STATE VIEW</span>{footprintStates.map((state) => <button key={state.code} className={selectedState.code === state.code ? "is-selected" : ""} onClick={() => { setSelectedState(state); globeRef.current?.pointOfView({ lat: state.lat, lng: state.lng, altitude: 0.72 }, 700); }}>{state.name}<ArrowRight className="size-3" /></button>)}</div></aside></div><div className="about-map-note"><MapPin className="size-4" /><span>Order counts are intentionally not fabricated. Connect the approved ledger or Google Sheet feed when the regional records are ready.</span></div></div></section>
    </main>

    <footer className="about-footer"><div className="about-container"><BrandMark /><div><span>VOLAMP ELEKTRIKALS PRIVATE LIMITED</span><small>Built for clearer electrical sourcing across India.</small></div><Link href="/">Return to marketplace <ArrowRight className="size-4" /></Link></div></footer>
  </div>;
}
