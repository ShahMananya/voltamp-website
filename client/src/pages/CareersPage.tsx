import React, { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  Briefcase,
  GraduationCap,
  Building2,
  Users,
  TrendingUp,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  PhoneCall,
  MessageCircle,
  Clock,
  Sparkles,
  HelpCircle,
  FileCheck2,
  ChevronDown,
  Layers,
  Send,
  ExternalLink,
  Award,
  Factory,
  Check,
  Search,
  MapPin,
  Filter,
  Calendar,
  X,
  Share2,
  Compass,
  Zap,
  HardHat,
  HeartHandshake,
  BookOpen,
  DollarSign,
  UserCheck,
  Headphones,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useUserLocation } from "@/contexts/LocationContext";

interface JobRole {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: string;
  experience: string;
  education: string;
  packageLpa: string;
  openingsCount: number;
  isFeatured?: boolean;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  tags: string[];
}

const FALLBACK_ROLES: JobRole[] = [
  {
    id: "ht-lt-cable-design-engineer",
    title: "Senior HT / LT Power Cable Design Engineer",
    department: "Engineering & R&D",
    location: "Ahmedabad HQ (Gujarat)",
    workMode: "Full-Time · On-Site",
    experience: "4 – 8 Years",
    education: "B.E. / B.Tech / M.Tech in Electrical or Polymer Engineering",
    packageLpa: "₹9.5 – 15.0 LPA",
    openingsCount: 2,
    isFeatured: true,
    overview:
      "Lead technical design and compound formulation for 1.1kV up to 33kV XLPE and PVC insulated power/control cables, ensuring compliance with IS 7098, IS 1554, and IEC 60502 standards.",
    responsibilities: [
      "Develop conductor stranding calculations, radial insulation thicknesses, screening, and armouring specifications.",
      "Formulate and optimize flame-retardant (FRLS, LSZH) and high-temperature PVC/XLPE compounds.",
      "Draft comprehensive Guaranteed Technical Particulars (GTP) and test documentation for CPRI, ERDA, and DISCOM vendor approvals.",
      "Collaborate with plant extrusion teams during pilot runs and prototype validation.",
    ],
    requirements: [
      "Proven track record in power cable design (up to 33kV HT / MV cables).",
      "Deep comprehension of IS 694, IS 1554 (Part 1), IS 7098 (Part 1 & 2), and IEC 60502 standards.",
      "Proficiency in AutoCAD for cable cross-sections and technical CAD modeling.",
      "Familiarity with raw material cost optimization and conductor weight indices.",
    ],
    tags: ["33kV HT / LT", "XLPE Compounding", "CPRI / ERDA", "GTP Preparation"],
  },
  {
    id: "qa-hv-test-lab-lead",
    title: "Quality Assurance & High-Voltage Test Lab Lead",
    department: "Quality & Testing",
    location: "Sanand / Ahmedabad Plant (Gujarat)",
    workMode: "Full-Time · On-Site",
    experience: "3 – 7 Years",
    education: "B.E. / B.Tech in Electrical Engineering or Diploma with QA Certification",
    packageLpa: "₹7.5 – 12.0 LPA",
    openingsCount: 1,
    isFeatured: true,
    overview:
      "Oversee the central High-Voltage test laboratory, type-testing protocols, and routine factory acceptance tests (FAT) ensuring 0-defect dispatches with Mill Test Certificates (MTC).",
    responsibilities: [
      "Conduct and supervise high-voltage withstand testing, spark testing, insulation resistance (IR), and partial discharge (PD) measurements.",
      "Inspect raw copper cathode, EC-grade aluminum wire rods, and polymer pellets for electrical conductivity and tensile elongation.",
      "Issue official Mill Test Certificates (MTC) for EPC contractors, railway authorities, and GeM supplies.",
      "Maintain lab instrument calibration compliant with ISO 9001 and ISO/IEC 17025 testing norms.",
    ],
    requirements: [
      "Hands-on experience running HV test sets, Kelvin double bridge, spark testers, and thermal aging ovens.",
      "Direct interaction experience with third-party inspection agencies (RITES, BV, SGS, DNV).",
      "Rigorous commitment to zero-compromise electrical safety standards.",
    ],
    tags: ["High Voltage Lab", "Partial Discharge", "NABL / ISO 17025", "MTC Certification"],
  },
  {
    id: "plant-extrusion-supervisor",
    title: "Plant Extrusion & Continuous Vulcanization Supervisor",
    department: "Manufacturing & Plant",
    location: "Ahmedabad Manufacturing Complex",
    workMode: "Full-Time · On-Site",
    experience: "3 – 6 Years",
    education: "Diploma or B.E. in Mechanical / Electrical / Polymer Technology",
    packageLpa: "₹6.0 – 9.5 LPA",
    openingsCount: 3,
    isFeatured: false,
    overview:
      "Drive shop-floor operations across continuous vulcanization (CCV) lines and triple-extrusion lines, optimizing line speed, wall concentricity, and raw material yield.",
    responsibilities: [
      "Supervise extrusion operations for insulation, bedding, steel wire/strip armouring, and final PVC/LSZH outer sheathing.",
      "Maintain strict wall thickness tolerances, eccentricity controls, and smooth jacket surface finish.",
      "Enforce preventive maintenance schedules, rapid tooling changeovers, and compound scrap minimization.",
      "Direct shift workforce in adherence to 5S methodology and plant safety protocols.",
    ],
    requirements: [
      "Hands-on supervisory background in cable extrusion and compounding plants.",
      "Thorough knowledge of temperature profiles and screw geometry for PVC, XLPE, and HDPE.",
      "Strong team leadership and practical problem-solving capability under shift schedules.",
    ],
    tags: ["CCV Extrusion", "Armouring Lines", "Shop Floor 5S", "Yield Optimization"],
  },
  {
    id: "b2b-epc-sales-manager",
    title: "B2B Infrastructure & EPC Project Sales Manager",
    department: "EPC & Project Sales",
    location: "Mumbai Regional Office (Western Hub)",
    workMode: "Full-Time · Hybrid / Field",
    experience: "5 – 10 Years",
    education: "B.Tech Electrical + MBA (Marketing or Supply Chain preferred)",
    packageLpa: "₹12.0 – 18.0 LPA + Performance Bonus",
    openingsCount: 2,
    isFeatured: true,
    overview:
      "Drive strategic institutional cable sales to infrastructure EPCs, metro railway packages, data centers, airports, and power transmission utilities across Western India.",
    responsibilities: [
      "Secure multi-crore annual rate contracts and project supply packages with Tier-1 EPC contractors (L&T, Tata Projects, Sterling & Wilson, KEC, Kalpataru).",
      "Lead vendor pre-qualification and consultant approvals with EIL, Mecon, NTPC, PGCIL, and state electricity boards.",
      "Coordinate with central Ahmedabad dispatch operations for production schedules, stage-wise inspections, and LC/BG commercial terms.",
      "Manage client relationships and ensure seamless post-dispatch technical documentation.",
    ],
    requirements: [
      "Proven track record in B2B electrical cables, switchgears, or electrical transmission equipment sales.",
      "Active professional network with EPC procurement heads, PMC consultants, and chief electrical engineers.",
      "Excellent commercial negotiation, proposal structuring, and presentation acumen.",
    ],
    tags: ["EPC Sales", "Metro Rail / Utilities", "Vendor Approval", "Rate Contracts"],
  },
  {
    id: "solar-renewable-sales-lead",
    title: "Solar & Renewable Energy Key Account Executive",
    department: "EPC & Project Sales",
    location: "Jaipur / Ahmedabad Corridor",
    workMode: "Full-Time · Field / Client Facing",
    experience: "2 – 5 Years",
    education: "B.E. in Electrical / Renewable Energy Engineering or B.Sc",
    packageLpa: "₹6.5 – 10.5 LPA + Incentives",
    openingsCount: 2,
    isFeatured: false,
    overview:
      "Accelerate the adoption of Volamp's 1500V DC Solar Photovoltaic cables and renewable balance-of-plant cabling with IPPs, utility solar developers, and rooftop EPCs.",
    responsibilities: [
      "Cultivate key relationships with solar developers, IPPs, and turnkey EPC contractors across Gujarat, Rajasthan, and Western India.",
      "Present technical value propositions of electron-beam cross-linked solar cables (EN 50618, TÜV 2 Pfg 1169 standards, UV & ozone resistance).",
      "Monitor national and state solar park tender bids to capture cable supply requirements early.",
    ],
    requirements: [
      "Experience selling into the solar EPC, wind balance-of-plant, or renewable contractor ecosystem.",
      "Solid technical understanding of DC cable sizing, voltage drop mitigation, and MC4 connector compatibility.",
      "Strong communication skills and proactive client engagement.",
    ],
    tags: ["Solar 1500V DC", "Renewable IPPs", "TÜV Rheinland", "Utility Solar"],
  },
  {
    id: "tendering-boq-estimation-engineer",
    title: "Tendering, BOQ & Cost Estimation Engineer",
    department: "Procurement & Supply Chain",
    location: "Ahmedabad Corporate HQ",
    workMode: "Full-Time · On-Site",
    experience: "2 – 5 Years",
    education: "B.E. / B.Tech in Electrical Engineering",
    packageLpa: "₹6.0 – 9.0 LPA",
    openingsCount: 2,
    isFeatured: false,
    overview:
      "Scrutinize technical tender specifications, prepare accurate Bill of Quantities (BOQ) costings linked to raw metal indices, and manage GeM and public e-procurement bids.",
    responsibilities: [
      "Analyze commercial and technical tender requirements from State DISCOMs, Railway Boards, GeM portal, and PSU utilities.",
      "Calculate conductor metal weights (Copper/Aluminum), compound volume, steel armouring wire, and machine hour costs per km.",
      "Apply IEEMA price variation clauses (PV formulas) and formulate competitive bid proposals within deadline.",
    ],
    requirements: [
      "Proven expertise in tender BOQ preparation and electrical cable cost estimation.",
      "Familiarity with GeM portal bids, e-procurement platforms, and IEEMA circular indices.",
      "Analytical rigor and sharp attention to technical detail.",
    ],
    tags: ["Tendering & BOQ", "IEEMA Formulas", "GeM Bids", "Cost Estimation"],
  },
  {
    id: "metal-procurement-specialist",
    title: "Metal Procurement & Raw Material Supply Chain Specialist",
    department: "Procurement & Supply Chain",
    location: "Ahmedabad Corporate HQ",
    workMode: "Full-Time · On-Site",
    experience: "3 – 6 Years",
    education: "B.Com / B.E. + Supply Chain Certification or MBA",
    packageLpa: "₹7.0 – 11.0 LPA",
    openingsCount: 1,
    isFeatured: false,
    overview:
      "Manage strategic procurement of primary raw metals (Electrolytic Copper cathode/wire rod, EC Grade Aluminum) and masterbatch polymers tied to MCX and LME indices.",
    responsibilities: [
      "Source high-purity copper rods and aluminum wire rods from primary smelters (Hindalco, Vedanta, NALCO).",
      "Track daily MCX and LME commodity trends to execute strategic forward hedging and physical metal bookings.",
      "Negotiate volume purchase contracts for polymer compounds (XLPE, PVC resin, plasticizers, masterbatches).",
      "Coordinate just-in-time delivery schedules to minimize holding costs while ensuring zero manufacturing downtime.",
    ],
    requirements: [
      "Direct experience procuring copper/aluminum or raw materials for cable or conductor manufacturing.",
      "Understanding of commodity futures, price hedging, and vendor contract management.",
    ],
    tags: ["MCX / LME Hedging", "Copper & Aluminum", "Polymer Sourcing", "Vendor Negotiation"],
  },
  {
    id: "get-electrical-batch-2026",
    title: "Graduate Engineer Trainee (GET) – Electrical (Batch 2026)",
    department: "Early Careers",
    location: "Ahmedabad HQ & Manufacturing Complex",
    workMode: "Full-Time · 12-Month Rotation",
    experience: "Fresh Graduate / 0 – 1 Year (Batch 2025/2026)",
    education: "B.E. / B.Tech in Electrical / Electronics Engineering (Min 65% aggregate)",
    packageLpa: "₹4.5 – 6.0 LPA + Medical Coverage",
    openingsCount: 6,
    isFeatured: true,
    overview:
      "An accelerated 1-year rotational leadership program designed to groom future engineering leaders across Cable Design, High-Voltage QA Labs, Plant Extrusion, and Technical Estimations.",
    responsibilities: [
      "Rotate through 4 quarterly modules: Cable Design & Standards, Plant Extrusion & CCV Lines, High-Voltage Testing & Lab Protocols, and Technical Sizing & Client BOQs.",
      "Work alongside Senior Technical Mentors on real infrastructure supply consignments.",
      "Deliver a capstone technical project focused on compound optimization, testing automation, or energy efficiency.",
      "Receive full-time absorption into R&D, Quality, or Plant Engineering upon successful program completion.",
    ],
    requirements: [
      "Strong academic grounding in power systems, electrical materials, and high-voltage fundamentals.",
      "Passion for hands-on industrial engineering and nation-building infrastructure.",
      "Proactive learner with excellent communication and team collaboration skills.",
    ],
    tags: ["Fast-Track GET", "12-Month Rotation", "Full Mentorship", "Batch 2026"],
  },
];

const DEPARTMENTS = [
  "All Departments",
  "Engineering & R&D",
  "Quality & Testing",
  "Manufacturing & Plant",
  "EPC & Project Sales",
  "Procurement & Supply Chain",
  "Early Careers",
];

const LOCATIONS = [
  "All Locations",
  "Ahmedabad HQ (Gujarat)",
  "Sanand / Ahmedabad Plant (Gujarat)",
  "Ahmedabad Manufacturing Complex",
  "Mumbai Regional Office (Western Hub)",
  "Jaipur / Ahmedabad Corridor",
];

const EXPERIENCES = ["All Experience", "Freshers / 0–1 Year", "2–5 Years", "5+ Years"];

const FAQS = [
  {
    q: "Can fresh engineering graduates apply for positions at Volamp?",
    a: "Yes! Our flagship Graduate Engineer Trainee (GET) Program for the 2025/2026 batch offers fresh electrical and electronics engineers an accelerated 12-month rotational program with direct mentorship from senior plant directors, competitive stipends, full medical insurance, and permanent placement into core technical departments.",
  },
  {
    q: "What is the typical hiring turnaround time at Volamp Elektrikals?",
    a: "Our Talent Acquisition Committee reviews every application within 48 business hours. Shortlisted candidates are invited to an initial virtual technical discussion, followed by a second-round plant/office walkthrough and leadership interview. The entire process typically completes within 7 to 10 business days.",
  },
  {
    q: "Does Volamp provide relocation assistance for candidates moving to Ahmedabad?",
    a: "Yes. For mid to senior engineering and leadership roles requiring relocation to our Ahmedabad Headquarters or Sanand Manufacturing Complex, we offer transit accommodation, moving cost subsidies, and local settlement guidance.",
  },
  {
    q: "What are the core technical competencies Volamp values most?",
    a: "We deeply value strong fundamentals in electrical engineering, familiarity with IS / IEC cable standards (such as IS 7098, IS 1554, and IEC 60502), a safety-first mindset on the manufacturing floor, and an entrepreneurial approach to solving infrastructure challenges.",
  },
  {
    q: "What if my domain (e.g. Finance, Legal, HR, Logistics) is not currently listed?",
    a: "We actively maintain a Talent Community database! You can select 'General Application (Talent Pool)' in our application form. When specialized corporate openings arise, our talent desk reviews pre-submitted profiles before opening public requisitions.",
  },
  {
    q: "How can I track the status of my submitted application?",
    a: "Upon submission, you receive a unique Application Tracking ID (e.g., VOL-HR-2026-XXXXX). You can reach out directly to our HR desk via WhatsApp or phone with this ID for an immediate status update from your assigned recruiter.",
  },
];

export default function CareersPage() {
  const [, navigate] = useLocation();
  const { location: userLocation } = useUserLocation();
  const supportPhone = "9512365582";

  // tRPC query for open roles
  const openRolesQuery = trpc.careers.getOpenRoles.useQuery();
  const roles: JobRole[] = (openRolesQuery.data as JobRole[]) || FALLBACK_ROLES;

  // Filter state
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedExp, setSelectedExp] = useState("All Experience");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<JobRole | null>(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Application form state
  const [applicantRole, setApplicantRole] = useState<string>("");
  const [applicantDept, setApplicantDept] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [experienceYears, setExperienceYears] = useState("0-1 Years");
  const [highestQualification, setHighestQualification] = useState("B.E. / B.Tech");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("Immediate");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  // tRPC apply mutation
  const applyMutation = trpc.careers.submitApplication.useMutation({
    onSuccess: (data) => {
      setSubmittedAppId(data.applicationId);
      toast.success("Application Submitted Successfully!", {
        description: `Application reference: ${data.applicationId}. Our HR desk will review your profile.`,
      });
    },
    onError: (err) => {
      toast.error("Submission Failed", {
        description: err.message || "Please check your inputs and try again.",
      });
    },
  });

  // Filter logic
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchDept = selectedDept === "All Departments" || role.department === selectedDept;
      const matchLoc = selectedLocation === "All Locations" || role.location === selectedLocation;

      let matchExp = true;
      if (selectedExp === "Freshers / 0–1 Year") {
        matchExp = role.experience.toLowerCase().includes("fresh") || role.experience.includes("0 – 1");
      } else if (selectedExp === "2–5 Years") {
        matchExp = role.experience.includes("2") || role.experience.includes("3") || role.experience.includes("4");
      } else if (selectedExp === "5+ Years") {
        matchExp = role.experience.includes("5") || role.experience.includes("8") || role.experience.includes("10");
      }

      const matchSearch =
        !searchQuery.trim() ||
        role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        role.overview.toLowerCase().includes(searchQuery.toLowerCase());

      return matchDept && matchLoc && matchExp && matchSearch;
    });
  }, [roles, selectedDept, selectedLocation, selectedExp, searchQuery]);

  // Open apply modal for a specific role
  const handleOpenApply = (role?: JobRole) => {
    if (role) {
      setApplicantRole(role.title);
      setApplicantDept(role.department);
      if (role.experience.includes("0 – 1") || role.experience.toLowerCase().includes("fresh")) {
        setExperienceYears("Fresh Graduate (0-1 Yrs)");
      } else if (role.experience.includes("4 – 8")) {
        setExperienceYears("4-8 Years");
      } else if (role.experience.includes("3 – 7") || role.experience.includes("3 – 6")) {
        setExperienceYears("3-6 Years");
      } else if (role.experience.includes("5 – 10")) {
        setExperienceYears("6-10 Years");
      }
    } else {
      setApplicantRole("General Application (Talent Pool)");
      setApplicantDept("Corporate / Multiple");
    }
    setSubmittedAppId(null);
    setSelectedRoleDetail(null);
    setApplicationModalOpen(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.length < 7) {
      toast.error("Please enter a valid phone or WhatsApp number.");
      return;
    }
    if (!city.trim() || !state.trim()) {
      toast.error("Please enter your city and state.");
      return;
    }
    if (!applicantRole.trim()) {
      toast.error("Please specify the role you are applying for.");
      return;
    }

    applyMutation.mutate({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      city: city.trim(),
      state: state.trim(),
      roleApplied: applicantRole.trim(),
      department: applicantDept.trim() || "General",
      experienceYears: experienceYears.trim(),
      highestQualification: highestQualification.trim(),
      currentCompany: currentCompany.trim() || undefined,
      currentCtc: currentCtc.trim() || undefined,
      expectedCtc: expectedCtc.trim() || undefined,
      noticePeriod: noticePeriod.trim(),
      linkedInUrl: linkedInUrl.trim() || undefined,
      resumeUrl: resumeUrl.trim() || undefined,
      coverNote: coverNote.trim() || undefined,
    });
  };

  const handleResetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setCity("");
    setState("");
    setCurrentCompany("");
    setCurrentCtc("");
    setExpectedCtc("");
    setLinkedInUrl("");
    setResumeUrl("");
    setCoverNote("");
    setSubmittedAppId(null);
  };

  return (
    <div className="careers-page min-h-screen bg-[#f7f9fb] dark:bg-[#071b2d] text-[#142b40] dark:text-[#eaf1f5] transition-colors">
      {/* Top Utility Bar (Consistent with Home & Marketplace) */}
      <div className="bg-[#09233a] text-[#d9e3e9] text-xs py-2 border-b border-[#14395b]">
        <div className="market-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="size-3.5 text-[#f2b84b]" />
            <span className="font-semibold text-slate-200">
              VOLAMP Talent Acquisition Desk · Ahmedabad HQ & Pan-India Hubs
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a
              href={`tel:+91${supportPhone}`}
              className="text-slate-300 hover:text-[#f2b84b] transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="size-3 text-[#f2b84b]" />
              <span>HR Direct: +91 {supportPhone}</span>
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="mailto:careers@volampelektrikals.com"
              className="text-slate-300 hover:text-[#f2b84b] transition-colors flex items-center gap-1.5"
            >
              <Send className="size-3 text-[#f2b84b]" />
              <span>careers@volampelektrikals.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header (Clean White / Dark Blue with Standard Slate Borders) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0b2033]/95 backdrop-blur-md border-b border-[#dce4ea] dark:border-[#1e3d59] transition-colors shadow-sm">
        <div className="market-container flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1d73b7] hover:text-[#155d94] bg-[#eef5fa] dark:bg-[#13324d] dark:text-[#75b8e7] px-3 py-1.5 rounded-lg transition-colors mr-2"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Home</span>
            </Link>
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/volamp-logo.png"
                alt="Volamp Elektrikals"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#334858] dark:text-[#cbdbe6]">
            <Link href="/" className="hover:text-[#1d73b7] dark:hover:text-[#67b0e8] transition-colors">
              Marketplace
            </Link>
            <Link href="/about-volamp" className="hover:text-[#1d73b7] dark:hover:text-[#67b0e8] transition-colors">
              About Volamp
            </Link>
            <Link
              href="/business-segments"
              className="hover:text-[#1d73b7] dark:hover:text-[#67b0e8] transition-colors"
            >
              Business Segments
            </Link>
            <Link href="/collaborate" className="hover:text-[#1d73b7] dark:hover:text-[#67b0e8] transition-colors">
              Collaborate
            </Link>
            <span className="text-[#1d73b7] dark:text-[#67b0e8] font-bold border-b-2 border-[#1d73b7] dark:border-[#67b0e8] pb-1">
              Careers
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => handleOpenApply()}
              className="bg-[#1d73b7] hover:bg-[#155d94] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Send className="size-3.5" />
              <span>Submit CV</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/about-volamp")}
              className="hidden sm:flex text-xs font-semibold rounded-lg border-[#dce4ea] dark:border-[#2d4b68] hover:bg-[#f0f4f8] dark:hover:bg-[#13324d]"
            >
              <span>Our Heritage</span>
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section (Matching .segments-hero & .about-hero Gradient) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071b2d] via-[#0c2d4a] to-[#10385c] text-white py-16 sm:py-24 border-b border-[#1b436b]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="market-container relative z-10 max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#f2b84b] text-xs font-extrabold tracking-wider uppercase">
            <Sparkles className="size-3.5" />
            <span>WE ARE HIRING · 2026 INFRASTRUCTURE EXPANSION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] text-white tracking-tight leading-tight">
            Power Your Career With an <br />
            <span className="text-[#f2b84b]">Engineering Legacy</span> That Powers India.
          </h1>

          <p className="text-base sm:text-lg text-[#e2ecf2] max-w-3xl mx-auto leading-relaxed">
            Join 4 generations of electrical engineering leadership. From high-voltage underground transmission
            grids and metro rail networks to renewable solar farms, our team designs, compounds, and manufactures the
            critical cables energizing 28 states and 14+ export nations.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#open-roles"
              className="px-6 py-3.5 rounded-lg bg-[#1d73b7] hover:bg-[#155d94] text-white font-bold text-sm shadow-lg shadow-sky-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Explore Open Positions ({roles.length})</span>
              <ArrowRight className="size-4" />
            </a>
            <Button
              variant="outline"
              onClick={() => handleOpenApply()}
              className="px-6 py-3.5 rounded-lg border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all"
            >
              <FileCheck2 className="size-4 mr-2 text-[#f2b84b]" />
              <span>Join Talent Community / Submit CV</span>
            </Button>
          </div>

          {/* Metric Highlights Strip */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 mt-12 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#f2b84b] font-['Space_Grotesk'] block">
                60+ Years
              </span>
              <span className="text-xs text-[#c0d5e2] font-semibold">Engineering Heritage (Est. 1964)</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#f2b84b] font-['Space_Grotesk'] block">
                28 States
              </span>
              <span className="text-xs text-[#c0d5e2] font-semibold">Pan-India Dispatches & 14+ Export Nations</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#f2b84b] font-['Space_Grotesk'] block">
                100% In-House
              </span>
              <span className="text-xs text-[#c0d5e2] font-semibold">CPRI & ERDA Certified Test Laboratories</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#f2b84b] font-['Space_Grotesk'] block">
                4.8 / 5.0
              </span>
              <span className="text-xs text-[#c0d5e2] font-semibold">Team Growth & Job Security Index</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Build Your Career at Volamp (Values & Benefits - Crisp Slate & Navy) */}
      <section className="py-16 sm:py-20 market-container space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#1d73b7] dark:text-[#67b0e8] uppercase tracking-widest">
            THE VOLAMP WORK CULTURE
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-['Space_Grotesk'] text-[#102a40] dark:text-white">
            Why Electrical Engineers & Leaders Choose Volamp
          </h2>
          <p className="text-sm text-[#5a6b78] dark:text-slate-400">
            We provide the stability of a 60-year industrial foundation combined with the velocity of India's rapid
            infrastructure buildout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] shadow-sm hover:border-[#1d73b7] hover:shadow-md transition-all space-y-3">
            <div className="size-12 rounded-lg bg-[#eef5fa] dark:bg-[#15344f] flex items-center justify-center text-[#1d73b7] dark:text-[#75b8e7]">
              <Zap className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
              Nation-Building Impact
            </h3>
            <p className="text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 leading-relaxed">
              Every cable you design, test, or dispatch carries electricity to metro rails, solar parks, critical
              hospitals, and smart cities across India.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] shadow-sm hover:border-[#1d73b7] hover:shadow-md transition-all space-y-3">
            <div className="size-12 rounded-lg bg-sky-50 dark:bg-[#15344f] flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Factory className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
              World-Class Manufacturing Tech
            </h3>
            <p className="text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 leading-relaxed">
              Work with state-of-the-art continuous vulcanization (CCV) lines, triple extrusion heads, high-voltage partial
              discharge test sets, and specialized polymer formulations.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] shadow-sm hover:border-[#1d73b7] hover:shadow-md transition-all space-y-3">
            <div className="size-12 rounded-lg bg-emerald-50 dark:bg-[#15344f] flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
              Competitive CTC & Performance Bonuses
            </h3>
            <p className="text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 leading-relaxed">
              Above-industry fixed compensation, structured annual appraisals, performance milestone bonuses, and
              long-term wealth-building security.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] shadow-sm hover:border-[#1d73b7] hover:shadow-md transition-all space-y-3">
            <div className="size-12 rounded-lg bg-purple-50 dark:bg-[#15344f] flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
              Comprehensive Health & Safety
            </h3>
            <p className="text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 leading-relaxed">
              Group Mediclaim family insurance, personal accident coverage, routine wellness camps, and a zero-compromise
              plant safety mandate.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] shadow-sm hover:border-[#1d73b7] hover:shadow-md transition-all space-y-3">
            <div className="size-12 rounded-lg bg-amber-50 dark:bg-[#15344f] flex items-center justify-center text-[#d97818] dark:text-amber-400">
              <TrendingUp className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
              Accelerated Career Progression
            </h3>
            <p className="text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 leading-relaxed">
              Clear internal promotion ladders. Graduate Engineer Trainees (GET) consistently advance into Project Leads,
              Lab Heads, and Branch Directors.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] shadow-sm hover:border-[#1d73b7] hover:shadow-md transition-all space-y-3">
            <div className="size-12 rounded-lg bg-blue-50 dark:bg-[#15344f] flex items-center justify-center text-[#1d73b7] dark:text-[#75b8e7]">
              <BookOpen className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
              Continuous Technical Mentorship
            </h3>
            <p className="text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 leading-relaxed">
              Learn directly from senior cable technologists with decades of experience preparing CPRI type tests,
              DISCOM tender GTPs, and international IEC specifications.
            </p>
          </div>
        </div>
      </section>

      {/* Open Positions Section with Filters (Cool Slate-Muted Background) */}
      <section id="open-roles" className="py-16 bg-[#edf3f7] dark:bg-[#0b2033] border-y border-[#dce4ea] dark:border-[#1e3d59]">
        <div className="market-container space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#1d73b7] dark:text-[#67b0e8] uppercase tracking-widest">
                CURRENT OPPORTUNITIES
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-['Space_Grotesk'] text-[#102a40] dark:text-white">
                Explore Open Positions at Volamp
              </h2>
              <p className="text-sm text-[#5a6b78] dark:text-slate-400 mt-1">
                Showing {filteredRoles.length} of {roles.length} published positions across engineering, manufacturing,
                and business development.
              </p>
            </div>

            <Button
              onClick={() => handleOpenApply()}
              variant="outline"
              className="self-start md:self-auto rounded-lg border-[#1d73b7] text-[#1d73b7] dark:text-[#67b0e8] dark:border-[#67b0e8] font-bold hover:bg-[#1d73b7] hover:text-white transition-all text-xs"
            >
              <Send className="size-3.5 mr-1.5" />
              <span>Can't find your role? Submit General Application</span>
            </Button>
          </div>

          {/* Filter Bar (Crisp White with Slate Borders) */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="size-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Search role, keyword, or standard (e.g. XLPE, CPRI)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-lg border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338] text-xs h-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Department Dropdown */}
              <div>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338] text-xs text-[#142b40] dark:text-[#eaf1f5] font-medium outline-none focus:border-[#1d73b7]"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Dropdown */}
              <div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338] text-xs text-[#142b40] dark:text-[#eaf1f5] font-medium outline-none focus:border-[#1d73b7]"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Dropdown */}
              <div>
                <select
                  value={selectedExp}
                  onChange={(e) => setSelectedExp(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338] text-xs text-[#142b40] dark:text-[#eaf1f5] font-medium outline-none focus:border-[#1d73b7]"
                >
                  {EXPERIENCES.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#edf1f4] dark:border-[#1e3d59]">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="size-3" /> Quick Filter:
              </span>
              {DEPARTMENTS.map((dept) => {
                const isSelected = selectedDept === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      isSelected
                        ? "bg-[#1d73b7] text-white shadow-sm"
                        : "bg-[#eef5fa] dark:bg-[#13324d] text-[#1d73b7] dark:text-[#75b8e7] hover:bg-[#dbe9f4] dark:hover:bg-[#1a4060]"
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
              {(selectedDept !== "All Departments" ||
                selectedLocation !== "All Locations" ||
                selectedExp !== "All Experience" ||
                searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedDept("All Departments");
                    setSelectedLocation("All Locations");
                    setSelectedExp("All Experience");
                    setSearchQuery("");
                  }}
                  className="px-2 py-1 text-[11px] font-bold text-rose-500 hover:underline ml-auto"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* Job Cards Grid */}
          {filteredRoles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#102b42] rounded-xl border border-dashed border-[#dce4ea] dark:border-[#29465b] space-y-4">
              <Briefcase className="size-12 text-slate-400 mx-auto opacity-50" />
              <h3 className="text-lg font-bold text-[#102a40] dark:text-white">
                No matching open positions found
              </h3>
              <p className="text-xs text-[#5a6b78] dark:text-slate-400 max-w-md mx-auto">
                We couldn't find an open role matching your exact filter criteria. Try adjusting your filters or submit a
                spontaneous CV to our talent database.
              </p>
              <Button
                onClick={() => handleOpenApply()}
                className="bg-[#1d73b7] hover:bg-[#155d94] text-white text-xs font-bold rounded-lg"
              >
                Submit General Application
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] shadow-sm hover:border-[#1d73b7] hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#eef5fa] text-[#1d73b7] dark:bg-[#15344f] dark:text-[#75b8e7] border border-[#d0e3f2] dark:border-[#20496e]">
                        {role.department}
                      </span>
                      <div className="flex items-center gap-2">
                        {role.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d97818] text-white flex items-center gap-1">
                            <Sparkles className="size-2.5" /> PRIORITY
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-slate-400">
                          {role.openingsCount} {role.openingsCount === 1 ? "opening" : "openings"}
                        </span>
                      </div>
                    </div>

                    {/* Role Title */}
                    <div>
                      <h3 className="text-xl font-bold font-['Space_Grotesk'] text-[#102a40] dark:text-white group-hover:text-[#1d73b7] dark:group-hover:text-[#67b0e8] transition-colors">
                        {role.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5a6b78] dark:text-slate-300 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-[#1d73b7] dark:text-[#67b0e8]" />
                          {role.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5 text-slate-400" />
                          {role.workMode}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="size-3.5 text-slate-400" />
                          {role.experience}
                        </span>
                      </div>
                    </div>

                    {/* Overview snippet */}
                    <p className="text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 leading-relaxed line-clamp-2">
                      {role.overview}
                    </p>

                    {/* Package & Key requirement */}
                    <div className="p-3 rounded-lg bg-[#f7f9fb] dark:bg-[#0c2338] border border-[#e2e8f0] dark:border-[#1e3d59] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          INDICATIVE CTC PACKAGE
                        </span>
                        <span className="font-bold text-[#102a40] dark:text-white">{role.packageLpa}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          EDUCATION
                        </span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300 max-w-[150px] truncate block">
                          {role.education.split("/")[0]}
                        </span>
                      </div>
                    </div>

                    {/* Tech Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {role.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#eef5fa] dark:bg-[#15344f] text-[#2c5270] dark:text-slate-300 border border-[#dce4ea] dark:border-[#234c70]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-5 border-t border-[#edf1f4] dark:border-[#1e3d59] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRoleDetail(role)}
                      className="text-xs font-bold text-[#1d73b7] dark:text-[#67b0e8] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Full Job Spec</span>
                      <ArrowRight className="size-3.5" />
                    </button>

                    <Button
                      onClick={() => handleOpenApply(role)}
                      className="bg-[#1d73b7] hover:bg-[#155d94] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer"
                    >
                      <span>Apply for this Role</span>
                      <ArrowRight className="size-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Early Careers & GET Spotlight Banner (Matching .segments-hero Styling) */}
      <section className="py-14 market-container">
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#071b2d] via-[#0c2d4a] to-[#10385c] text-white shadow-xl border border-[#215782] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#f2b84b] text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="size-4" />
              <span>COLLEGE GRADUATES · 2026 BATCH</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] leading-tight">
              Graduate Engineer Trainee (GET) Program
            </h3>
            <p className="text-sm text-[#e2ecf2] leading-relaxed">
              Are you a graduating electrical or electronics engineer looking to master power transmission, cable design,
              high-voltage lab testing, and extrusion engineering? Our 12-month accelerated rotational program provides full
              mentorship, live project exposure, and permanent absorption into Volamp leadership.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#f2b84b] font-semibold pt-1">
              <span>✓ 4 Rotational Modules</span>
              <span>✓ Direct Executive Mentorship</span>
              <span>✓ Fixed CTC + Full Health Cover</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
            <Button
              onClick={() => {
                const getRole = roles.find((r) => r.id === "get-electrical-batch-2026");
                handleOpenApply(getRole);
              }}
              className="px-6 py-3.5 bg-[#f2b84b] hover:bg-[#e5a837] text-[#071b2d] font-extrabold text-sm rounded-lg shadow-lg shadow-amber-500/20"
            >
              <span>Apply for GET 2026 Batch</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
            <button
              onClick={() => {
                const getRole = roles.find((r) => r.id === "get-electrical-batch-2026");
                if (getRole) setSelectedRoleDetail(getRole);
              }}
              className="text-xs text-center font-bold text-slate-300 hover:text-white hover:underline py-2"
            >
              Review GET Syllabus & Details →
            </button>
          </div>
        </div>
      </section>

      {/* The 4-Step Hiring Process */}
      <section className="py-16 sm:py-20 market-container space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#1d73b7] dark:text-[#67b0e8] uppercase tracking-widest">
            CLEAR, RESPECTFUL & FAST
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-['Space_Grotesk'] text-[#102a40] dark:text-white">
            Our 4-Step Candidate Journey
          </h2>
          <p className="text-sm text-[#5a6b78] dark:text-slate-400">
            We value your time. Our hiring committee ensures transparent communication and zero prolonged waiting times.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] relative space-y-3 shadow-sm hover:border-[#1d73b7] transition-all">
            <span className="text-4xl font-extrabold text-[#1d73b7]/15 dark:text-sky-400/20 font-['Space_Grotesk'] absolute top-4 right-4">
              01
            </span>
            <div className="size-10 rounded-lg bg-[#eef5fa] dark:bg-[#15344f] flex items-center justify-center text-[#1d73b7] dark:text-[#75b8e7] font-bold text-sm">
              <FileCheck2 className="size-5" />
            </div>
            <h4 className="text-base font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
              Application & Review
            </h4>
            <p className="text-xs text-[#5a6b78] dark:text-slate-300 leading-relaxed">
              Submit your profile online. Our HR Talent desk reviews every CV within <strong>48 hours</strong> and assigns
              a dedicated hiring coordinator.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] relative space-y-3 shadow-sm hover:border-[#1d73b7] transition-all">
            <span className="text-4xl font-extrabold text-[#1d73b7]/15 dark:text-sky-400/20 font-['Space_Grotesk'] absolute top-4 right-4">
              02
            </span>
            <div className="size-10 rounded-lg bg-[#eef5fa] dark:bg-[#15344f] flex items-center justify-center text-[#1d73b7] dark:text-[#75b8e7] font-bold text-sm">
              <Headphones className="size-5" />
            </div>
            <h4 className="text-base font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
              Technical Discussion
            </h4>
            <p className="text-xs text-[#5a6b78] dark:text-slate-300 leading-relaxed">
              A 30–45 minute virtual or in-person technical conversation with our Chief Engineer or Department Head
              discussing your past projects.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] relative space-y-3 shadow-sm hover:border-[#1d73b7] transition-all">
            <span className="text-4xl font-extrabold text-[#1d73b7]/15 dark:text-sky-400/20 font-['Space_Grotesk'] absolute top-4 right-4">
              03
            </span>
            <div className="size-10 rounded-lg bg-emerald-50 dark:bg-[#15344f] flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Building2 className="size-5" />
            </div>
            <h4 className="text-base font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
              Plant / Office Walkthrough
            </h4>
            <p className="text-xs text-[#5a6b78] dark:text-slate-300 leading-relaxed">
              Visit our Ahmedabad headquarters or manufacturing plant. Meet the team, tour the testing lab, and discuss
              mutual culture fit.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] relative space-y-3 shadow-sm hover:border-[#1d73b7] transition-all">
            <span className="text-4xl font-extrabold text-[#1d73b7]/15 dark:text-sky-400/20 font-['Space_Grotesk'] absolute top-4 right-4">
              04
            </span>
            <div className="size-10 rounded-lg bg-purple-50 dark:bg-[#15344f] flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
              <Award className="size-5" />
            </div>
            <h4 className="text-base font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
              Fast-Track Offer
            </h4>
            <p className="text-xs text-[#5a6b78] dark:text-slate-300 leading-relaxed">
              Transparent compensation breakdown, formal offer letter rollout within <strong>48 hours</strong> of final
              round, and a structured onboarding roadmap.
            </p>
          </div>
        </div>
      </section>

      {/* Candidate FAQs Section (Crisp White / Slate Styling) */}
      <section className="py-16 bg-[#edf3f7] dark:bg-[#092033] border-t border-[#dce4ea] dark:border-[#1e3d59]">
        <div className="market-container max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#1d73b7] dark:text-[#67b0e8] uppercase tracking-widest">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#102a40] dark:text-white">
              Questions About Working at Volamp
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-[#dce4ea] dark:border-[#1e3d59] bg-white dark:bg-[#0c2338] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#102a40] dark:text-white hover:text-[#1d73b7] dark:hover:text-[#67b0e8] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-[#1d73b7] dark:text-[#67b0e8]" : "text-slate-400"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 leading-relaxed border-t border-[#edf1f4] dark:border-[#1e3d59] bg-[#f7f9fb] dark:bg-[#102b42]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Spontaneous Application CTA Banner */}
      <section className="py-14 market-container">
        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#102b42] border border-[#dce4ea] dark:border-[#29465b] text-center space-y-4 max-w-4xl mx-auto shadow-sm">
          <HeartHandshake className="size-10 text-[#1d73b7] dark:text-[#67b0e8] mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#102a40] dark:text-white">
            Don't see your specific expertise listed?
          </h3>
          <p className="text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            We are continuously building our leadership talent pipeline across Corporate Finance, Supply Chain Logistics,
            IT Systems, and International Export Operations. Join our Talent Community and get notified first.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => handleOpenApply()}
              className="bg-[#1d73b7] hover:bg-[#155d94] text-white text-sm font-bold px-6 py-3 rounded-lg shadow-md"
            >
              <span>Submit Spontaneous Application / CV</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Role Details Modal */}
      {selectedRoleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0e273c] rounded-2xl border border-[#dce4ea] dark:border-[#29465b] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedRoleDetail(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#eef5fa] text-[#1d73b7] dark:bg-[#15344f] dark:text-[#75b8e7] border border-[#d0e3f2] dark:border-[#20496e]">
                {selectedRoleDetail.department}
              </span>
              <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-[#102a40] dark:text-white">
                {selectedRoleDetail.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#5a6b78] dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-[#1d73b7] dark:text-[#67b0e8]" />
                  {selectedRoleDetail.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5 text-slate-400" />
                  {selectedRoleDetail.workMode}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="size-3.5 text-slate-400" />
                  {selectedRoleDetail.packageLpa}
                </span>
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ROLE OVERVIEW</h4>
              <p className="text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 leading-relaxed">
                {selectedRoleDetail.overview}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">KEY RESPONSIBILITIES</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300">
                {selectedRoleDetail.responsibilities.map((res, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                QUALIFICATIONS & TECHNICAL SKILLS
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300">
                {selectedRoleDetail.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-sky-500 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer action */}
            <div className="pt-4 border-t border-[#edf1f4] dark:border-[#1e3d59] flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setSelectedRoleDetail(null)}
                className="text-xs rounded-lg border-[#dce4ea]"
              >
                Close
              </Button>
              <Button
                onClick={() => handleOpenApply(selectedRoleDetail)}
                className="bg-[#1d73b7] hover:bg-[#155d94] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md flex items-center gap-1.5"
              >
                <span>Proceed to Application</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {applicationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0e273c] rounded-2xl border border-[#dce4ea] dark:border-[#29465b] max-w-xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                setApplicationModalOpen(false);
                setSubmittedAppId(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>

            {submittedAppId ? (
              // Success Screen
              <div className="text-center py-6 space-y-4">
                <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto">
                  <Check className="size-8 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    APPLICATION RECEIVED
                  </span>
                  <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-[#102a40] dark:text-white">
                    Thank You, {fullName}!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5a6b78] dark:text-slate-300 max-w-md mx-auto">
                    Your application for <strong>{applicantRole}</strong> has been logged with our central Talent
                    Acquisition Desk.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f7f9fb] dark:bg-[#133552] border border-[#dce4ea] dark:border-[#1e486d] space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">OFFICIAL APPLICATION ID</span>
                  <div className="text-xl font-mono font-bold text-[#1d73b7] dark:text-[#75b8e7]">
                    {submittedAppId}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Our Talent Desk reviews every application within 48 business hours.
                  </span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://wa.me/91${supportPhone}?text=${encodeURIComponent(
                      `Hello Volamp HR, I have submitted my job application (${submittedAppId}) for ${applicantRole}. Name: ${fullName}. Looking forward to connecting!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <MessageCircle className="size-4" />
                    <span>WhatsApp HR with Application ID</span>
                  </a>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleResetForm();
                      setApplicationModalOpen(false);
                    }}
                    className="text-xs rounded-lg border-[#dce4ea]"
                  >
                    Done & Return
                  </Button>
                </div>
              </div>
            ) : (
              // Form Screen
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div className="space-y-1 border-b border-[#edf1f4] dark:border-[#1e3d59] pb-4">
                  <span className="text-xs font-bold text-[#1d73b7] dark:text-[#67b0e8] uppercase tracking-widest">
                    VOLAMP TALENT APPLICATION
                  </span>
                  <h3 className="text-xl font-bold font-['Space_Grotesk'] text-[#102a40] dark:text-white">
                    Submit Your Application
                  </h3>
                  <p className="text-xs text-[#5a6b78] dark:text-slate-400">
                    Please provide accurate details. All submissions are treated in strict confidence.
                  </p>
                </div>

                {/* Role Applied Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                    Position Applied For *
                  </label>
                  <select
                    value={applicantRole}
                    onChange={(e) => {
                      setApplicantRole(e.target.value);
                      const matchingRole = roles.find((r) => r.title === e.target.value);
                      if (matchingRole) setApplicantDept(matchingRole.department);
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338] text-xs font-medium text-[#142b40] dark:text-[#eaf1f5]"
                    required
                  >
                    <option value="General Application (Talent Pool)">
                      General Application (Talent Pool)
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.title}>
                        {r.title} ({r.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      Full Name *
                    </label>
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="rahul.sharma@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338]"
                      required
                    />
                  </div>
                </div>

                {/* Phone & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      Mobile / WhatsApp *
                    </label>
                    <Input
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      Current City *
                    </label>
                    <Input
                      placeholder="e.g. Ahmedabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      State *
                    </label>
                    <Input
                      placeholder="e.g. Gujarat"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338]"
                      required
                    />
                  </div>
                </div>

                {/* Experience & Qualification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      Total Experience *
                    </label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338] text-xs font-medium text-[#142b40] dark:text-[#eaf1f5]"
                      required
                    >
                      <option value="Fresh Graduate (0-1 Yrs)">Fresh Graduate (0-1 Yrs)</option>
                      <option value="1-3 Years">1-3 Years</option>
                      <option value="3-6 Years">3-6 Years</option>
                      <option value="6-10 Years">6-10 Years</option>
                      <option value="10+ Years">10+ Years</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      Highest Qualification *
                    </label>
                    <select
                      value={highestQualification}
                      onChange={(e) => setHighestQualification(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338] text-xs font-medium text-[#142b40] dark:text-[#eaf1f5]"
                      required
                    >
                      <option value="B.E. / B.Tech (Electrical)">B.E. / B.Tech (Electrical)</option>
                      <option value="B.E. / B.Tech (Mechanical / Other)">B.E. / B.Tech (Mechanical / Other)</option>
                      <option value="M.E. / M.Tech">M.E. / M.Tech</option>
                      <option value="Diploma in Electrical / Mechanical">Diploma in Engineering</option>
                      <option value="MBA / Post Graduate">MBA / Post Graduate</option>
                      <option value="B.Sc / B.Com / Graduate">B.Sc / B.Com / Graduate</option>
                      <option value="Other Certification">Other Certification</option>
                    </select>
                  </div>
                </div>

                {/* Company & Notice Period */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      Current Company
                    </label>
                    <Input
                      placeholder="e.g. Current Employer"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      Expected CTC (LPA)
                    </label>
                    <Input
                      placeholder="e.g. ₹8.5 LPA"
                      value={expectedCtc}
                      onChange={(e) => setExpectedCtc(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      Notice Period *
                    </label>
                    <select
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338] text-xs font-medium text-[#142b40] dark:text-[#eaf1f5]"
                      required
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="60 Days">60 Days</option>
                      <option value="90 Days">90 Days</option>
                    </select>
                  </div>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      LinkedIn Profile URL
                    </label>
                    <Input
                      placeholder="https://linkedin.com/in/..."
                      value={linkedInUrl}
                      onChange={(e) => setLinkedInUrl(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                      Resume Link (Google Drive / Dropbox / Cloud CV)
                    </label>
                    <Input
                      placeholder="https://drive.google.com/..."
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338]"
                    />
                  </div>
                </div>

                {/* Cover Statement */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#142b40] dark:text-slate-200">
                    Brief Statement / Why Volamp? (Optional)
                  </label>
                  <Textarea
                    placeholder="Tell us briefly about your core technical accomplishments or why you want to build your career with Volamp..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    rows={2}
                    className="rounded-lg text-xs border-[#dce4ea] dark:border-[#29465b] bg-[#f7f9fb] dark:bg-[#0c2338]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 border-t border-[#edf1f4] dark:border-[#1e3d59] space-y-2">
                  <Button
                    type="submit"
                    disabled={applyMutation.isPending}
                    className="w-full py-3.5 bg-[#1d73b7] hover:bg-[#155d94] text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {applyMutation.isPending ? (
                      <>
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Application to Talent Desk...</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        <span>Submit Job Application</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    <span>Equal opportunity employer. Confidential HR processing.</span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer (Consistent with Collaborate & Blog) */}
      <footer className="site-footer bg-[#0d2233] text-white">
        <div className="market-container py-12 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-slate-800 text-xs">
          <div className="space-y-3">
            <img src="/volamp-logo.png" alt="VOLAMP Elektrikals" className="h-8 w-auto brightness-200" />
            <p className="text-slate-400 leading-relaxed">
              Volamp Elektrikals Private Limited. Powering India's energy, infrastructure, and industrial growth for 60+
              years.
            </p>
            <div className="text-slate-400 space-y-1">
              <div>Corporate HQ: Ahmedabad, Gujarat, India</div>
              <div>Direct HR: +91 {supportPhone}</div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-[#f2b84b] tracking-wider uppercase block mb-3">ABOUT VOLAMP</span>
            <div>
              <Link href="/about-volamp" className="text-slate-400 hover:text-white transition-colors">
                About Our Heritage
              </Link>
            </div>
            <div>
              <Link href="/business-segments" className="text-slate-400 hover:text-white transition-colors">
                10 Business Segments
              </Link>
            </div>
            <div>
              <Link href="/careers" className="text-[#f2b84b] font-semibold transition-colors">
                Careers & Openings
              </Link>
            </div>
            <div>
              <Link href="/collaborate" className="text-slate-400 hover:text-white transition-colors">
                Collaborate with Us
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-[#f2b84b] tracking-wider uppercase block mb-3">CAREER DISCIPLINES</span>
            <div className="text-slate-400">High-Voltage Cable Design & R&D</div>
            <div className="text-slate-400">Quality Assurance & Lab Testing</div>
            <div className="text-slate-400">Continuous Extrusion & Armouring</div>
            <div className="text-slate-400">B2B Infrastructure & EPC Sales</div>
            <div className="text-slate-400">Graduate Engineer Trainee (GET 2026)</div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-[#f2b84b] tracking-wider uppercase block mb-3">TALENT DESK</span>
            <p className="text-slate-400 leading-relaxed">
              Have specific questions regarding an opening or your application status? Reach our Talent Acquisition
              Desk directly.
            </p>
            <a
              href="mailto:careers@volampelektrikals.com"
              className="inline-block text-[#f2b84b] font-bold hover:underline"
            >
              careers@volampelektrikals.com
            </a>
            <div className="pt-2">
              <a
                href={`tel:+91${supportPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-[#f2b84b] font-bold text-xs"
              >
                <PhoneCall className="size-3" />
                <span>Call +91 {supportPhone}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="market-container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>Volamp Elektrikals © 2026. All rights reserved. Equal Opportunity Employer.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-[#f2b84b] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/shipping-policy" className="hover:text-[#f2b84b] transition-colors">
              Shipping & Supply
            </Link>
            <Link href="/" className="hover:text-[#f2b84b] transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
