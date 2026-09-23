import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  Droplets,
  ExternalLink,
  Eye,
  Factory,
  GraduationCap,
  HeartPulse,
  Landmark,
  Layers,
  MapPin,
  MessageCircle,
  Plane,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { FootprintProject, FootprintState } from "./GlobeProjectsExperience";

const STATE_NAMES: Record<string, string> = {
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CG: "Chhattisgarh",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  PB: "Punjab",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TG: "Telangana",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UK: "Uttarakhand",
  WB: "West Bengal",
};

const OFFICIAL_STATE_PROJECT_COUNTS: Record<string, string> = {
  GJ: "100+",
  RJ: "50+",
  MP: "25",
  MH: "20",
  KA: "15",
  UP: "15",
  OD: "10",
  TN: "5",
  CG: "3",
  TG: "3",
  AS: "2",
  BR: "2",
  PB: "2",
  AP: "1",
  GA: "1",
  HR: "1",
  HP: "1",
  JH: "1",
  KL: "1",
  MN: "1",
  MZ: "1",
  WB: "1",
  AR: "0",
  ML: "0",
  NL: "0",
  SK: "0",
  TR: "0",
  UK: "0",
};

// Numerical rank for sorting states by volume
const STATE_SORT_WEIGHT: Record<string, number> = {
  GJ: 1000,
  RJ: 500,
  MP: 250,
  MH: 200,
  KA: 150,
  UP: 150,
  OD: 100,
  TN: 50,
  CG: 30,
  TG: 30,
  AS: 20,
  BR: 20,
  PB: 20,
  AP: 10,
  GA: 10,
  HR: 10,
  HP: 10,
  JH: 10,
  KL: 10,
  MN: 10,
  MZ: 10,
  WB: 10,
};

function getCategoryIcon(category: string, name: string) {
  const cat = category.toLowerCase();
  const n = name.toLowerCase();

  if (cat.includes("aviation") || n.includes("airport")) return Plane;
  if (cat.includes("nuclear") || cat.includes("defense") || n.includes("barc")) return ShieldAlert;
  if (cat.includes("solar") || cat.includes("renewable")) return Sun;
  if (cat.includes("water") || cat.includes("jal") || n.includes("wtp")) return Droplets;
  if (cat.includes("heritage") || cat.includes("temple") || n.includes("bridge") || n.includes("parikrama") || n.includes("sou") || n.includes("statue")) return Landmark;
  if (cat.includes("smart") || cat.includes("urban") || n.includes("tunnel") || n.includes("gift city")) return Building2;
  if (cat.includes("education") || n.includes("iit") || n.includes("university")) return GraduationCap;
  if (cat.includes("health") || n.includes("medical") || n.includes("hospital")) return HeartPulse;
  if (cat.includes("manufacturing") || cat.includes("industrial") || cat.includes("steel") || cat.includes("chemical") || n.includes("factory") || n.includes("voltas")) return Factory;
  return Zap;
}

interface ProjectTilesDirectoryProps {
  initialStateCode?: string;
  onSelectProject?: (project: FootprintProject) => void;
  featuredOnly?: boolean;
  limit?: number;
  showHeader?: boolean;
}

export default function ProjectTilesDirectory({
  initialStateCode,
  onSelectProject,
  featuredOnly = false,
  limit,
  showHeader = true,
}: ProjectTilesDirectoryProps) {
  const { data: allProjectsData } = trpc.footprint.stateProjects.useQuery({});
  const { data: dbStates } = trpc.footprint.states.useQuery();

  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState<string>(initialStateCode || "ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeModalProject, setActiveModalProject] = useState<FootprintProject | null>(null);

  const projects: FootprintProject[] = useMemo(() => {
    return (allProjectsData as unknown as FootprintProject[]) || [];
  }, [allProjectsData]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [projects]);

  // Group project count by state
  const stateProjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      const code = p.stateCode.toUpperCase();
      counts[code] = (counts[code] || 0) + 1;
    });
    return counts;
  }, [projects]);

  // Available states that have projects or official presences
  const activeStatesList = useMemo(() => {
    const presentCodes = Object.keys(stateProjectCounts);
    // Include all states that have projects or verified presence
    const allKnown = Array.from(new Set([...presentCodes, ...Object.keys(OFFICIAL_STATE_PROJECT_COUNTS)]));
    return allKnown.sort((a, b) => {
      const weightA = STATE_SORT_WEIGHT[a] ?? 0;
      const weightB = STATE_SORT_WEIGHT[b] ?? 0;
      if (weightA !== weightB) return weightB - weightA;
      return (STATE_NAMES[a] || a).localeCompare(STATE_NAMES[b] || b);
    });
  }, [stateProjectCounts]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let list = projects;

    if (selectedState !== "ALL") {
      list = list.filter((p) => p.stateCode.toUpperCase() === selectedState.toUpperCase());
    }

    if (selectedCategory !== "ALL") {
      list = list.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const stateFullName = STATE_NAMES[p.stateCode.toUpperCase()] || "";
        return (
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          stateFullName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.volampContribution.toLowerCase().includes(q)
        );
      });
    }

    if (featuredOnly) {
      // Show top landmark national projects
      const featuredKeywords = ["statue", "barc", "hero", "gift city", "bhilai", "goa", "begusarai", "guwahati", "nal-se-jal", "indore"];
      list = list.filter((p) =>
        featuredKeywords.some((k) => p.name.toLowerCase().includes(k))
      );
    }

    if (limit && limit > 0) {
      return list.slice(0, limit);
    }

    return list;
  }, [projects, selectedState, selectedCategory, search, featuredOnly, limit]);

  const handleOpenDetail = (proj: FootprintProject) => {
    if (onSelectProject) {
      onSelectProject(proj);
    } else {
      setActiveModalProject(proj);
    }
  };

  return (
    <section className="project-tiles-directory" id="project-directory">
      {showHeader && (
        <div className="tiles-section-head">
          <div className="tiles-head-meta">
            <span className="tiles-kicker">
              <Sparkles className="size-3.5 text-amber-500" /> PAN-INDIA LANDMARK PROJECTS
            </span>
            <h2 className="tiles-heading">
              Powering India's <em>Most Prestigious Infrastructure</em>
            </h2>
            <p className="tiles-subheading">
              From the world’s tallest monument and nuclear research corridors to international airports,
              smart city utility tunnels, and mega solar parks — explore Volamp’s verified real-world installations.
            </p>
          </div>

          <div className="tiles-stat-pills">
            <div className="tile-stat-chip">
              <strong>46+</strong>
              <span>Verified Landmark Sites</span>
            </div>
            <div className="tile-stat-chip">
              <strong>28</strong>
              <span>Indian States & UTs</span>
            </div>
            <div className="tile-stat-chip">
              <strong>100%</strong>
              <span>Zero-Fault Record</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="tiles-controls-bar">
        {/* Search input */}
        <div className="tiles-search-box">
          <Search className="size-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, city, state, or facility (e.g. Airport, Solar, Temple, WTP)..."
            aria-label="Search landmark projects"
          />
          {search && (
            <button onClick={() => setSearch("")} className="search-clear-btn" aria-label="Clear search">
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="tiles-category-row">
          <button
            className={`cat-filter-chip ${selectedCategory === "ALL" ? "is-active" : ""}`}
            onClick={() => setSelectedCategory("ALL")}
          >
            All Categories ({projects.length})
          </button>
          {categories.map((cat) => {
            const count = projects.filter((p) => p.category === cat).length;
            const Icon = getCategoryIcon(cat, "");
            return (
              <button
                key={cat}
                className={`cat-filter-chip ${selectedCategory === cat ? "is-active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <Icon className="size-3.5 mr-1 inline opacity-80" />
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* State Filter Pills */}
        <div className="tiles-states-row">
          <span className="states-row-label">Filter by State:</span>
          <div className="states-pills-carousel">
            <button
              className={`state-filter-pill ${selectedState === "ALL" ? "is-active" : ""}`}
              onClick={() => setSelectedState("ALL")}
            >
              All States ({projects.length})
            </button>
            {activeStatesList.map((code) => {
              const name = STATE_NAMES[code] || code;
              const officialCount = OFFICIAL_STATE_PROJECT_COUNTS[code] ?? (stateProjectCounts[code] || 0);
              return (
                <button
                  key={code}
                  className={`state-filter-pill ${selectedState === code ? "is-active" : ""}`}
                  onClick={() => setSelectedState(code)}
                >
                  <span className="state-pill-name">{name}</span>
                  <span className="state-pill-badge">{officialCount}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects Tiles Grid */}
      {filteredProjects.length > 0 ? (
        <div className="project-tiles-grid">
          {filteredProjects.map((proj) => {
            const Icon = getCategoryIcon(proj.category, proj.name);
            const stateName = STATE_NAMES[proj.stateCode.toUpperCase()] || proj.stateCode;

            return (
              <article key={proj.id} className="volamp-project-tile group" onClick={() => handleOpenDetail(proj)}>
                <div className="tile-ambient-glow" />

                {/* Top Row: Category + State Badge */}
                <div className="tile-header-row">
                  <div className="tile-category-tag">
                    <Icon className="size-3.5" />
                    <span>{proj.category}</span>
                  </div>
                  <div className="tile-state-tag" title={`Located in ${stateName}`}>
                    <span className="state-dot" />
                    <span>{stateName}</span>
                  </div>
                </div>

                {/* Project Title */}
                <h3 className="tile-title">
                  {proj.name}
                </h3>

                {/* City & Location */}
                <div className="tile-location-row">
                  <MapPin className="size-3.5 text-amber-500 shrink-0" />
                  <span>{proj.city}, {stateName}</span>
                  <span className="tile-year-tag">{proj.year}</span>
                </div>

                {/* Description */}
                <p className="tile-description">
                  {proj.shortDescription}
                </p>

                {/* Solution / Engineering Spec Highlight */}
                <div className="tile-spec-highlight">
                  <Zap className="size-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{proj.volampContribution.split(".")[0] || "Custom Industrial Distribution"}</span>
                </div>

                {/* Bottom Action Footer */}
                <div className="tile-footer-actions">
                  <button
                    className="tile-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetail(proj);
                    }}
                  >
                    <span>View Engineering Spec</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <a
                    className="tile-whatsapp-btn"
                    href={`https://wa.me/919512365582?text=Hello%20Volamp%20team,%20I%20am%20enquiring%20about%20your%20project:%20${encodeURIComponent(proj.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="Enquire on WhatsApp regarding this project"
                    aria-label={`Enquire about ${proj.name} on WhatsApp`}
                  >
                    <MessageCircle className="size-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="tiles-empty-state">
          <Compass className="size-10 text-slate-500 mb-2" />
          <h4>No matching projects found</h4>
          <p>Try clearing your search query or switching to another state/category.</p>
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearch("");
              setSelectedState("ALL");
              setSelectedCategory("ALL");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Project Detail Modal */}
      {activeModalProject && (
        <div className="modal-overlay" onClick={() => setActiveModalProject(null)}>
          <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="modal-badge">{activeModalProject.category}</span>
                  <span className="modal-state-badge">
                    {STATE_NAMES[activeModalProject.stateCode.toUpperCase()] || activeModalProject.stateCode}
                  </span>
                  <span className="modal-status-badge">{activeModalProject.status}</span>
                </div>
                <h3 className="modal-title">{activeModalProject.name}</h3>
                <div className="modal-meta">
                  <span><MapPin className="size-3.5 inline mr-1" /> {activeModalProject.city}</span>
                  <span>•</span>
                  <span>Year: {activeModalProject.year}</span>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModalProject(null)}
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4><Boxes className="size-4 text-amber-500 inline mr-1.5" /> Project Overview</h4>
                <p>{activeModalProject.overview}</p>
              </div>

              <div className="modal-section highlight-box">
                <h4><Zap className="size-4 text-amber-500 inline mr-1.5" /> VOLAMP Supply & Engineering Contribution</h4>
                <p>{activeModalProject.volampContribution}</p>
              </div>

              <div className="modal-section">
                <h4><Sparkles className="size-4 text-amber-500 inline mr-1.5" /> Project Heritage & Regional Significance</h4>
                <p>{activeModalProject.heritage}</p>
              </div>

              {activeModalProject.customerTestimonial && (
                <div className="modal-section testimonial-box">
                  <h4><ShieldCheck className="size-4 text-amber-500 inline mr-1.5" /> Customer Testimonial</h4>
                  <blockquote>"{activeModalProject.customerTestimonial}"</blockquote>
                  <div className="testimonial-footer">
                    <strong>{activeModalProject.customerName}</strong>
                    <span>{activeModalProject.customerCompany}</span>
                  </div>
                </div>
              )}

              {/* Technical Badges */}
              <div className="modal-badges-row">
                <span className="spec-badge"><CheckCircle2 className="size-3 inline mr-1" /> IS / IEC Certified</span>
                <span className="spec-badge"><CheckCircle2 className="size-3 inline mr-1" /> Flame-Retardant Low Smoke (FRLS)</span>
                <span className="spec-badge"><CheckCircle2 className="size-3 inline mr-1" /> Factory Acceptance Tested</span>
                <span className="spec-badge"><CheckCircle2 className="size-3 inline mr-1" /> Heavy-Gauge Copper / Aluminum</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-secondary-btn"
                onClick={() => setActiveModalProject(null)}
              >
                Close
              </button>
              <a
                className="modal-primary-btn"
                href={`https://wa.me/919512365582?text=Hi%20VOLAMP%20team,%20I%20am%20interested%20in%20learning%20more%20about%20your%20project:%20${encodeURIComponent(activeModalProject.name)}`}
                target="_blank"
                rel="noreferrer"
              >
                Enquire Regarding This Project <ArrowRight className="size-4 ml-1 inline" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
