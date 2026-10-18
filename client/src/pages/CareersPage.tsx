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
  Zap,
  HeartHandshake,
  BookOpen,
  DollarSign,
  UserCheck,
  Headphones,
  Target,
  Rocket,
  BarChart3,
  PackageCheck,
  Truck,
  FileSpreadsheet,
  UserPlus,
  TableProperties,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useUserLocation } from "@/contexts/LocationContext";

import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";

import {
  VOLAMP_JOB_ROLES,
  CAREERS_COMPANY_INFO,
  CAREER_DEPARTMENTS,
  CAREER_LOCATIONS,
  CAREER_EXPERIENCES,
  JobRole,
} from "@/data/careersData";

const FAQS = [
  {
    q: "What products and brands does Volamp Elektrikals distribute?",
    a: "Volamp Elektrikals Pvt. Ltd. is a PAN India electrical distribution leader supplying industry-gold standards including Polycab, Finolex, and KEI to dealers, electricians, contractors, builders, and large industrial buyers nationwide.",
  },
  {
    q: "Can fresh graduates or candidates with 0-2 years experience apply?",
    a: "Absolutely! We welcome fresh talent across roles such as Inside Sales Executive (Tele-sales), Customer Support Executive, Business Development Associates, and Junior Operations Coordinators with structured onboarding and mentorship.",
  },
  {
    q: "Where are the roles based?",
    a: "Most operational, warehouse, finance, CRM, and executive positions are based at our Ahmedabad, Gujarat headquarters and central warehouse facility. Field sales and Regional Sales Manager roles cover strategic PAN India territories.",
  },
  {
    q: "What is the typical hiring turnaround time at Volamp?",
    a: "Our recruitment desk reviews applications within 48 business hours. Shortlisted candidates are invited for an exploratory discussion, followed by a departmental interview. The entire cycle is completed transparently and promptly.",
  },
  {
    q: "What if my exact skill set is not listed in the 20 open positions?",
    a: "You can submit a 'General Application (Talent Pool)'. As our PAN India distribution footprint expands into new regions and hubs, pre-screened talent community profiles are reviewed first.",
  },
  {
    q: "How can I follow up on an application I submitted?",
    a: "Upon submission, you receive an official Application Reference ID. You can instantly message our HR desk on WhatsApp or call us directly with your ID for immediate tracking.",
  },
];

export default function CareersPage() {
  const [, navigate] = useLocation();
  const { location: userLocation } = useUserLocation();
  const supportPhone = "9512365582";

  // tRPC query for open roles
  const openRolesQuery = trpc.careers.getOpenRoles.useQuery();
  const roles: JobRole[] = (openRolesQuery.data as unknown as JobRole[]) || VOLAMP_JOB_ROLES;

  // Filter state
  const [selectedDept, setSelectedDept] = useState<string>("All Departments");
  const [selectedLocation, setSelectedLocation] = useState<string>("All Locations");
  const [selectedExp, setSelectedExp] = useState<string>("All Experience");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

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
  const [experienceYears, setExperienceYears] = useState("1-3 Years");
  const [highestQualification, setHighestQualification] = useState("Graduate");
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
      if (selectedExp === "Freshers / 0 to 2 years") {
        matchExp =
          role.experience.includes("0 to 2") ||
          role.experience.toLowerCase().includes("fresh") ||
          role.experience.includes("0 – 2") ||
          role.experience.includes("1 to 3");
      } else if (selectedExp === "1 to 4 years") {
        matchExp =
          role.experience.includes("1 to 4") ||
          role.experience.includes("1 to 3") ||
          role.experience.includes("2 to 4") ||
          role.experience.includes("2 to 5");
      } else if (selectedExp === "2 to 5 years") {
        matchExp =
          role.experience.includes("2 to 5") ||
          role.experience.includes("2 to 4") ||
          role.experience.includes("1 to 4");
      } else if (selectedExp === "4 to 8 years") {
        matchExp =
          role.experience.includes("4 to 8") ||
          role.experience.includes("6 to 10") ||
          role.experience.includes("7 to 12");
      } else if (selectedExp === "6 to 12 years") {
        matchExp =
          role.experience.includes("6 to 10") ||
          role.experience.includes("7 to 12") ||
          role.experience.includes("4 to 8");
      }

      const searchLower = searchQuery.toLowerCase().trim();
      const matchSearch =
        !searchLower ||
        role.title.toLowerCase().includes(searchLower) ||
        role.department.toLowerCase().includes(searchLower) ||
        role.location.toLowerCase().includes(searchLower) ||
        role.experience.toLowerCase().includes(searchLower) ||
        (role.aboutRole && role.aboutRole.toLowerCase().includes(searchLower)) ||
        (role.overview && role.overview.toLowerCase().includes(searchLower)) ||
        (role.qualification && role.qualification.toLowerCase().includes(searchLower)) ||
        (role.skillsRequired && role.skillsRequired.some((s) => s.toLowerCase().includes(searchLower))) ||
        (role.responsibilities && role.responsibilities.some((r) => r.toLowerCase().includes(searchLower))) ||
        (role.tags && role.tags.some((t) => t.toLowerCase().includes(searchLower)));

      return matchDept && matchLoc && matchExp && matchSearch;
    });
  }, [roles, selectedDept, selectedLocation, selectedExp, searchQuery]);

  // Open apply modal for a specific role
  const handleOpenApply = (role?: JobRole) => {
    if (role) {
      setApplicantRole(`${role.no ? `#${role.no} ` : ""}${role.title}`);
      setApplicantDept(role.department);
      if (role.experience.includes("0 to 2") || role.experience.toLowerCase().includes("fresh")) {
        setExperienceYears("Fresh Graduate (0-1 Yrs)");
      } else if (role.experience.includes("1 to 4") || role.experience.includes("1 to 3")) {
        setExperienceYears("1-3 Years");
      } else if (role.experience.includes("2 to 5") || role.experience.includes("4 to 8")) {
        setExperienceYears("3-6 Years");
      } else if (role.experience.includes("6 to 10") || role.experience.includes("7 to 12")) {
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
    <div className="volamp-marketplace careers-page min-h-screen bg-[#faf7f3] text-[#3d2b2d] transition-colors">
      {/* Universal Header */}
      <UniversalHeader currentPage="careers" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf8f5] to-[#faf7f3] text-[#3d2b2d] py-14 sm:py-20 border-b border-[#ebd7c7]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4d1217_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="market-container relative z-10 max-w-5xl text-center space-y-6">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center justify-center bg-white px-3.5 py-1.5 rounded-xl border border-[#ebd7c7] shadow-xs">
              <img src="/volamp-logo.png" alt="VOLAMP Elektrikals" className="h-7 sm:h-8 w-auto object-contain" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7ede6] border border-[#ebd4c2] text-[#c56718] text-xs font-extrabold tracking-wider uppercase shadow-xs">
              <Sparkles className="size-3.5 text-[#ef7d19]" />
              <span>CAREERS AT VOLAMP · 20 OPEN POSITIONS</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217] tracking-tight leading-tight">
              Grow Your Career With <br />
              <span className="text-[#c56718]">Volamp Elektrikals</span> Pvt. Ltd.
            </h1>
            <p className="text-base sm:text-lg text-[#5d4a4b] max-w-3xl mx-auto leading-relaxed">
              {CAREERS_COMPANY_INFO.about}
            </p>
          </div>

          {/* Trusted Brand Partnerships Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#5d4a4b]">
            <span className="text-[#c56718] font-bold uppercase tracking-wider text-[11px]">Authorized Distribution:</span>
            <span className="px-3 py-1 bg-white border border-[#ebd7c7] rounded-full text-[#4d1217] font-bold shadow-2xs">Polycab</span>
            <span className="px-3 py-1 bg-white border border-[#ebd7c7] rounded-full text-[#4d1217] font-bold shadow-2xs">Finolex</span>
            <span className="px-3 py-1 bg-white border border-[#ebd7c7] rounded-full text-[#4d1217] font-bold shadow-2xs">KEI</span>
            <span className="text-stone-400">|</span>
            <span className="text-[#5d4a4b]">Serving Dealers, Electricians, Contractors, Builders & Industrial Buyers PAN India</span>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#open-positions-glance"
              className="px-6 py-3.5 rounded-lg bg-[#c56718] hover:bg-[#b45309] text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>View Open Positions (20 Roles)</span>
              <ArrowRight className="size-4" />
            </a>
            <Button
              variant="outline"
              onClick={() => handleOpenApply()}
              className="px-6 py-3.5 rounded-lg border-[#ebd7c7] bg-white text-[#4d1217] hover:bg-[#f7ede6] font-semibold text-sm transition-all shadow-xs cursor-pointer"
            >
              <FileCheck2 className="size-4 mr-2 text-[#c56718]" />
              <span>Submit General Application / CV</span>
            </Button>
          </div>

          {/* Why Join Us - 4 Core Pillars */}
          <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-[#ebd7c7] mt-10 text-left">
            <div className="p-5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs hover:border-[#c56718] transition-all space-y-2">
              <div className="size-10 rounded-lg bg-[#f7ede6] flex items-center justify-center text-[#c56718]">
                <Award className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
                India's Leading Brands
              </h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Work with India's leading electrical brands in a fast-growing PAN India business.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs hover:border-[#c56718] transition-all space-y-2">
              <div className="size-10 rounded-lg bg-[#f7ede6] flex items-center justify-center text-[#c56718]">
                <Users className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
                Direct Leadership Access
              </h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Direct access to leadership and real responsibility from day one.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs hover:border-[#c56718] transition-all space-y-2">
              <div className="size-10 rounded-lg bg-[#f7ede6] flex items-center justify-center text-[#c56718]">
                <TrendingUp className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
                Clear Growth Path
              </h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Clear growth path as we expand into new regions, territories and teams.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs hover:border-[#c56718] transition-all space-y-2">
              <div className="size-10 rounded-lg bg-[#f7ede6] flex items-center justify-center text-[#c56718]">
                <Rocket className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
                Performance Culture
              </h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                A performance-driven culture that rewards effort, ownership and measurable results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions at a Glance Section (Interactive Table) */}
      <section id="open-positions-glance" className="py-14 market-container space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7ede6] text-[#c25e0a] text-xs font-bold uppercase tracking-wider border border-[#ebd4c2] mb-2">
              <TableProperties className="size-3.5 text-[#c56718]" />
              <span>OFFICIAL REQUISITIONS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217]">
              Open Positions at a Glance
            </h2>
            <p className="text-xs sm:text-sm text-[#5d4a4b] mt-1">
              Complete index of 20 positions across 5 core business departments at Volamp Elektrikals Pvt. Ltd.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className={`text-xs font-bold rounded-lg cursor-pointer ${
                viewMode === "cards" ? "bg-[#c56718] text-white hover:bg-[#b45309]" : "border-[#ebd7c7] text-[#4d1217]"
              }`}
            >
              <LayoutGrid className="size-3.5 mr-1.5" />
              <span>Cards View</span>
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`text-xs font-bold rounded-lg cursor-pointer ${
                viewMode === "table" ? "bg-[#c56718] text-white hover:bg-[#b45309]" : "border-[#ebd7c7] text-[#4d1217]"
              }`}
            >
              <TableProperties className="size-3.5 mr-1.5" />
              <span>Table View</span>
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-xl bg-white border border-[#ebd7c7] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="size-4 absolute left-3 top-3 text-[#5d4a4b]" />
              <Input
                placeholder="Search position, skill, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-lg border-[#ebd7c7] bg-[#fdfbf9] text-xs h-10 text-[#3d2b2d] placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-stone-400 hover:text-[#4d1217]"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Department */}
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#ebd7c7] bg-[#fdfbf9] text-xs text-[#3d2b2d] font-medium outline-none focus:border-[#c56718]"
              >
                {CAREER_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#ebd7c7] bg-[#fdfbf9] text-xs text-[#3d2b2d] font-medium outline-none focus:border-[#c56718]"
              >
                {CAREER_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <select
                value={selectedExp}
                onChange={(e) => setSelectedExp(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#ebd7c7] bg-[#fdfbf9] text-xs text-[#3d2b2d] font-medium outline-none focus:border-[#c56718]"
              >
                {CAREER_EXPERIENCES.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Department Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#ebd7c7]">
            <span className="text-[11px] font-bold text-[#5d4a4b] mr-1 flex items-center gap-1">
              <Filter className="size-3 text-[#c56718]" /> Department:
            </span>
            {CAREER_DEPARTMENTS.map((dept) => {
              const isSelected = selectedDept === dept;
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#c56718] text-white shadow-xs"
                      : "bg-[#f7ede6] text-[#5d4a4b] hover:bg-[#ebd4c2] border border-[#ebd4c2]"
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
                className="px-2 py-1 text-[11px] font-bold text-[#c56718] hover:underline ml-auto cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Table View (Open Positions at a Glance) */}
        {viewMode === "table" && (
          <div className="bg-white rounded-xl border border-[#ebd7c7] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7ede6] border-b border-[#ebd7c7] text-[#4d1217]">
                    <th className="py-3 px-4 font-bold text-center w-14">No.</th>
                    <th className="py-3 px-4 font-bold">Position</th>
                    <th className="py-3 px-4 font-bold">Department</th>
                    <th className="py-3 px-4 font-bold">Experience</th>
                    <th className="py-3 px-4 font-bold">Location</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e3d8]">
                  {filteredRoles.map((role) => (
                    <tr key={role.id} className="hover:bg-[#fbf8f5] transition-colors group">
                      <td className="py-3.5 px-4 font-bold text-[#c56718] text-center">
                        <span className="inline-flex items-center justify-center size-6 rounded-full bg-[#f7ede6] text-xs">
                          {role.no}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#4d1217]">
                        <div className="flex flex-col">
                          <span className="text-sm group-hover:text-[#c56718] transition-colors">{role.title}</span>
                          <span className="text-[11px] text-[#5d4a4b] font-normal">{role.workMode}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#f7ede6] text-[#c56718] border border-[#ebd4c2]">
                          {role.department}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#5d4a4b]">{role.experience}</td>
                      <td className="py-3.5 px-4 text-[#5d4a4b]">{role.location}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRoleDetail(role)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#c56718] hover:bg-[#f7ede6] rounded-md transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenApply(role)}
                          className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold px-3 py-1 rounded-md shadow-2xs cursor-pointer"
                        >
                          Apply
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cards View */}
        {viewMode === "cards" && (
          <div>
            {filteredRoles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-[#ebd7c7] space-y-4">
                <Briefcase className="size-12 text-[#ebd4c2] mx-auto" />
                <h3 className="text-lg font-bold text-[#4d1217]">
                  No matching open positions found
                </h3>
                <p className="text-xs text-[#5d4a4b] max-w-md mx-auto">
                  Try adjusting your department or experience filters, or submit your CV to our talent database.
                </p>
                <Button
                  onClick={() => handleOpenApply()}
                  className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Submit General Application
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    className="p-6 rounded-xl bg-white border border-[#ebd7c7] shadow-xs hover:border-[#c56718] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Badge bar */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="size-6 rounded-full bg-[#c56718] text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                            {role.no}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#f7ede6] text-[#c56718] border border-[#ebd4c2]">
                            {role.department}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#5d4a4b]">
                          {role.workMode}
                        </span>
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217] group-hover:text-[#c56718] transition-colors">
                          {role.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#5d4a4b] mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5 text-[#c56718]" />
                            {role.location}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5 text-[#5d4a4b]" />
                            {role.experience}
                          </span>
                        </div>
                      </div>

                      {/* About Role snippet */}
                      <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed line-clamp-2">
                        {role.aboutRole || role.overview}
                      </p>

                      {/* Key Responsibilities Snippet */}
                      {role.responsibilities && role.responsibilities.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-[#c25e0a] uppercase tracking-wider block">
                            KEY RESPONSIBILITIES:
                          </span>
                          <ul className="space-y-1 text-xs text-[#5d4a4b]">
                            {role.responsibilities.slice(0, 2).map((resp, i) => (
                              <li key={i} className="flex items-start gap-1.5 line-clamp-1">
                                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Qualification info strip */}
                      <div className="p-3 rounded-lg bg-[#f7ede6] border border-[#ebd4c2] text-xs">
                        <span className="text-[10px] font-bold text-[#5d4a4b] uppercase tracking-wider block">
                          QUALIFICATION & BACKGROUND:
                        </span>
                        <span className="font-semibold text-[#4d1217] text-xs block truncate mt-0.5">
                          {role.qualification}
                        </span>
                      </div>

                      {/* Tags */}
                      {role.tags && role.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {role.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#fdfbf9] text-[#5d4a4b] border border-[#ebd7c7]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-5 mt-5 border-t border-[#ebd7c7] flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRoleDetail(role)}
                        className="text-xs font-bold text-[#c56718] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Full Job Spec</span>
                        <ArrowRight className="size-3.5" />
                      </button>

                      <Button
                        onClick={() => handleOpenApply(role)}
                        className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs cursor-pointer"
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
        )}
      </section>

      {/* The 4-Step Hiring Process */}
      <section className="py-16 sm:py-20 market-container space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#c25e0a] uppercase tracking-widest">
            CLEAR, RESPECTFUL & FAST
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217]">
            Our 4-Step Candidate Journey
          </h2>
          <p className="text-sm text-[#5d4a4b]">
            We value your time. Our hiring committee ensures transparent communication and zero prolonged waiting times.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white border border-[#ebd7c7] relative space-y-3 shadow-xs hover:border-[#c56718] transition-all">
            <span className="text-4xl font-extrabold text-[#c56718]/15 font-['Plus_Jakarta_Sans',sans-serif] absolute top-4 right-4">
              01
            </span>
            <div className="size-10 rounded-lg bg-[#f7ede6] flex items-center justify-center text-[#c56718] font-bold text-sm">
              <FileCheck2 className="size-5" />
            </div>
            <h4 className="text-base font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
              Application & Review
            </h4>
            <p className="text-xs text-[#5d4a4b] leading-relaxed">
              Submit your profile online. Our HR Talent desk reviews every CV within <strong>48 hours</strong> and assigns
              a dedicated hiring coordinator.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#ebd7c7] relative space-y-3 shadow-xs hover:border-[#c56718] transition-all">
            <span className="text-4xl font-extrabold text-[#c56718]/15 font-['Plus_Jakarta_Sans',sans-serif] absolute top-4 right-4">
              02
            </span>
            <div className="size-10 rounded-lg bg-[#f7ede6] flex items-center justify-center text-[#c56718] font-bold text-sm">
              <Headphones className="size-5" />
            </div>
            <h4 className="text-base font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
              Initial Discussion
            </h4>
            <p className="text-xs text-[#5d4a4b] leading-relaxed">
              A 20–30 minute conversation discussing your core experience, commercial or technical strengths, and territory familiarity.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#ebd7c7] relative space-y-3 shadow-xs hover:border-[#c56718] transition-all">
            <span className="text-4xl font-extrabold text-[#c56718]/15 font-['Plus_Jakarta_Sans',sans-serif] absolute top-4 right-4">
              03
            </span>
            <div className="size-10 rounded-lg bg-[#f7ede6] flex items-center justify-center text-[#c56718] font-bold text-sm">
              <Building2 className="size-5" />
            </div>
            <h4 className="text-base font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
              Department Walkthrough
            </h4>
            <p className="text-xs text-[#5d4a4b] leading-relaxed">
              Visit our Ahmedabad headquarters, meet the leadership team, and understand the workflow systems and market opportunities.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#ebd7c7] relative space-y-3 shadow-xs hover:border-[#c56718] transition-all">
            <span className="text-4xl font-extrabold text-[#c56718]/15 font-['Plus_Jakarta_Sans',sans-serif] absolute top-4 right-4">
              04
            </span>
            <div className="size-10 rounded-lg bg-[#f7ede6] flex items-center justify-center text-[#c56718] font-bold text-sm">
              <Award className="size-5" />
            </div>
            <h4 className="text-base font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
              Fast-Track Offer
            </h4>
            <p className="text-xs text-[#5d4a4b] leading-relaxed">
              Transparent compensation breakdown, formal offer letter rollout within <strong>48 hours</strong>, and a structured onboarding roadmap.
            </p>
          </div>
        </div>
      </section>

      {/* Candidate FAQs Section */}
      <section className="py-16 bg-[#fbf8f5] border-t border-[#ebd7c7]">
        <div className="market-container max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#c25e0a] uppercase tracking-widest">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217]">
              Questions About Working at Volamp
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-[#ebd7c7] bg-white overflow-hidden transition-colors shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#4d1217] hover:text-[#c56718] cursor-pointer transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-4 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-[#c56718]" : "text-stone-400"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-[#5d4a4b] leading-relaxed border-t border-[#ebd7c7] bg-[#fdfbf9]">
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
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#ebd7c7] text-center space-y-4 max-w-4xl mx-auto shadow-xs">
          <HeartHandshake className="size-10 text-[#c56718] mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217]">
            Don't see your specific expertise listed?
          </h3>
          <p className="text-xs sm:text-sm text-[#5d4a4b] max-w-xl mx-auto leading-relaxed">
            We are continuously building our talent pool across Sales, Supply Chain, Logistics, Accounts, CRM and Operations. Join our Talent Community and get notified first as new territory positions open.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => handleOpenApply()}
              className="bg-[#c56718] hover:bg-[#b45309] text-white text-sm font-bold px-6 py-3 rounded-lg shadow-md cursor-pointer transition-all"
            >
              <span>Submit Spontaneous Application / CV</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Role Details Modal */}
      {selectedRoleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#ebd7c7] max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative text-[#3d2b2d]">
            <button
              onClick={() => setSelectedRoleDetail(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#f7ede6] text-stone-400 hover:text-[#4d1217] cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="size-6 rounded-full bg-[#c56718] text-white text-xs font-bold flex items-center justify-center">
                  #{selectedRoleDetail.no}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#f7ede6] text-[#c56718] border border-[#ebd4c2]">
                  {selectedRoleDetail.department}
                </span>
              </div>
              <h3 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217]">
                {selectedRoleDetail.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#5d4a4b] bg-[#fbf8f5] p-3 rounded-lg border border-[#ebd7c7]">
                <span className="flex items-center gap-1 font-semibold text-[#4d1217]">
                  <Clock className="size-3.5 text-[#c56718]" />
                  Type: {selectedRoleDetail.workMode}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-semibold text-[#4d1217]">
                  <Briefcase className="size-3.5 text-[#c56718]" />
                  Experience: {selectedRoleDetail.experience}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-semibold text-[#4d1217]">
                  <MapPin className="size-3.5 text-[#c56718]" />
                  Location: {selectedRoleDetail.location}
                </span>
              </div>
            </div>

            {/* About Role */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#c25e0a] uppercase tracking-wider">ABOUT THE ROLE</h4>
              <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed">
                {selectedRoleDetail.aboutRole || selectedRoleDetail.overview}
              </p>
            </div>

            {/* Responsibilities */}
            {selectedRoleDetail.responsibilities && selectedRoleDetail.responsibilities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#c25e0a] uppercase tracking-wider">KEY RESPONSIBILITIES</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[#5d4a4b]">
                  {selectedRoleDetail.responsibilities.map((res, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills Required */}
            {selectedRoleDetail.skillsRequired && selectedRoleDetail.skillsRequired.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#c25e0a] uppercase tracking-wider">
                  SKILLS REQUIRED
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[#5d4a4b]">
                  {selectedRoleDetail.skillsRequired.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-[#c56718] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualification */}
            {selectedRoleDetail.qualification && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#c25e0a] uppercase tracking-wider">
                  QUALIFICATION
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#4d1217] bg-[#f7ede6] p-3 rounded-lg border border-[#ebd4c2]">
                  {selectedRoleDetail.qualification}
                </p>
              </div>
            )}

            {/* Footer action */}
            <div className="pt-4 border-t border-[#ebd7c7] flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setSelectedRoleDetail(null)}
                className="text-xs rounded-lg border-[#ebd7c7] text-[#5d4a4b] hover:bg-[#f7ede6] cursor-pointer"
              >
                Close
              </Button>
              <Button
                onClick={() => handleOpenApply(selectedRoleDetail)}
                className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-[#ebd7c7] max-w-xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl relative text-[#3d2b2d]">
            <button
              onClick={() => {
                setApplicationModalOpen(false);
                setSubmittedAppId(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#f7ede6] text-stone-400 hover:text-[#4d1217] cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {submittedAppId ? (
              // Success Screen
              <div className="text-center py-6 space-y-4">
                <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto">
                  <Check className="size-8 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                    APPLICATION RECEIVED
                  </span>
                  <h3 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217]">
                    Thank You, {fullName}!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5d4a4b] max-w-md mx-auto">
                    Your application for <strong>{applicantRole}</strong> has been logged with our central Talent
                    Acquisition Desk at Volamp Elektrikals Pvt. Ltd.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f7ede6] border border-[#ebd4c2] space-y-1">
                  <span className="text-[11px] font-bold text-[#5d4a4b] uppercase">OFFICIAL APPLICATION ID</span>
                  <div className="text-xl font-mono font-bold text-[#c56718]">
                    {submittedAppId}
                  </div>
                  <span className="text-[11px] text-[#5d4a4b] block">
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
                    className="px-5 py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
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
                    className="text-xs rounded-lg border-[#ebd7c7] text-[#5d4a4b] hover:bg-[#f7ede6] cursor-pointer"
                  >
                    Done & Return
                  </Button>
                </div>
              </div>
            ) : (
              // Form Screen
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div className="space-y-1 border-b border-[#ebd7c7] pb-4">
                  <span className="text-xs font-bold text-[#c25e0a] uppercase tracking-widest">
                    VOLAMP TALENT APPLICATION
                  </span>
                  <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217]">
                    Submit Your Application
                  </h3>
                  <p className="text-xs text-[#5d4a4b]">
                    Please provide accurate details. All submissions are treated in strict confidence.
                  </p>
                </div>

                {/* Role Applied Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4d1217]">
                    Position Applied For *
                  </label>
                  <select
                    value={applicantRole}
                    onChange={(e) => {
                      setApplicantRole(e.target.value);
                      const matchingRole = roles.find((r) => `${r.no ? `#${r.no} ` : ""}${r.title}` === e.target.value || r.title === e.target.value);
                      if (matchingRole) setApplicantDept(matchingRole.department);
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-[#ebd7c7] bg-[#fdfbf9] text-xs font-medium text-[#3d2b2d] outline-none focus:border-[#c56718]"
                    required
                  >
                    <option value="General Application (Talent Pool)">
                      General Application (Talent Pool)
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={`${r.no ? `#${r.no} ` : ""}${r.title}`}>
                        #{r.no} {r.title} ({r.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      Full Name *
                    </label>
                    <Input
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#ebd7c7] bg-[#fdfbf9] text-[#3d2b2d]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="rahul.sharma@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#ebd7c7] bg-[#fdfbf9] text-[#3d2b2d]"
                      required
                    />
                  </div>
                </div>

                {/* Phone & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      Mobile / WhatsApp *
                    </label>
                    <Input
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#ebd7c7] bg-[#fdfbf9] text-[#3d2b2d]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      Current City *
                    </label>
                    <Input
                      placeholder="e.g. Ahmedabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#ebd7c7] bg-[#fdfbf9] text-[#3d2b2d]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      State *
                    </label>
                    <Input
                      placeholder="e.g. Gujarat"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#ebd7c7] bg-[#fdfbf9] text-[#3d2b2d]"
                      required
                    />
                  </div>
                </div>

                {/* Experience & Qualification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      Total Experience *
                    </label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#ebd7c7] bg-[#fdfbf9] text-xs font-medium text-[#3d2b2d] outline-none focus:border-[#c56718]"
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
                    <label className="text-xs font-semibold text-[#4d1217]">
                      Highest Qualification *
                    </label>
                    <select
                      value={highestQualification}
                      onChange={(e) => setHighestQualification(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#ebd7c7] bg-[#fdfbf9] text-xs font-medium text-[#3d2b2d] outline-none focus:border-[#c56718]"
                      required
                    >
                      <option value="Graduate (Any Stream)">Graduate (Any Stream)</option>
                      <option value="B.Com / M.Com">B.Com / M.Com</option>
                      <option value="BBA / MBA">BBA / MBA</option>
                      <option value="B.E. / B.Tech / Diploma (Electrical)">B.E. / B.Tech / Diploma (Electrical)</option>
                      <option value="Higher Secondary (12th)">Higher Secondary (12th)</option>
                      <option value="Post Graduate / CA / CS Inter">Post Graduate / CA / CS Inter</option>
                      <option value="Other Certification">Other Certification</option>
                    </select>
                  </div>
                </div>

                {/* Company & Notice Period */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      Current Company
                    </label>
                    <Input
                      placeholder="e.g. Current Employer"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#ebd7c7] bg-[#fdfbf9] text-[#3d2b2d]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      Expected CTC
                    </label>
                    <Input
                      placeholder="e.g. As per company norms"
                      value={expectedCtc}
                      onChange={(e) => setExpectedCtc(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#ebd7c7] bg-[#fdfbf9] text-[#3d2b2d]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      Notice Period *
                    </label>
                    <select
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#ebd7c7] bg-[#fdfbf9] text-xs font-medium text-[#3d2b2d] outline-none focus:border-[#c56718]"
                      required
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="15 Days">15 Days</option>
                      <option value="30 Days">30 Days</option>
                      <option value="60 Days">60 Days</option>
                    </select>
                  </div>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      LinkedIn Profile URL
                    </label>
                    <Input
                      placeholder="https://linkedin.com/in/..."
                      value={linkedInUrl}
                      onChange={(e) => setLinkedInUrl(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#ebd7c7] bg-[#fdfbf9] text-[#3d2b2d]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#4d1217]">
                      Resume Link (Google Drive / Cloud CV)
                    </label>
                    <Input
                      placeholder="https://drive.google.com/..."
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      className="rounded-lg text-xs h-10 border-[#ebd7c7] bg-[#fdfbf9] text-[#3d2b2d]"
                    />
                  </div>
                </div>

                {/* Cover Statement */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4d1217]">
                    Brief Statement / Why Volamp? (Optional)
                  </label>
                  <Textarea
                    placeholder="Tell us briefly about your experience with electrical products, dealer networks, or operations..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    rows={2}
                    className="rounded-lg text-xs border-[#ebd7c7] bg-[#fdfbf9] text-[#3d2b2d]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 border-t border-[#ebd7c7] space-y-2">
                  <Button
                    type="submit"
                    disabled={applyMutation.isPending}
                    className="w-full py-3.5 bg-[#c56718] hover:bg-[#b45309] text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
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

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5d4a4b]">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    <span>Equal opportunity employer. Confidential HR processing.</span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
