import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import {
  ArrowRight,
  Cable,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Facebook,
  FileText,
  Headphones,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Pause,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Volume2,
  VolumeX,
  Youtube,
  Zap,
} from "lucide-react";
import GlobeProjectsExperience from "@/components/footprint/GlobeProjectsExperience";
import { trpc } from "@/lib/trpc";

type TeamMemberItem = {
  id?: number;
  number: string;
  name: string;
  role: string;
  department?: string;
  imageUrl?: string | null;
  bio?: string;
  active?: boolean;
};

const fallbackTeamSlots: TeamMemberItem[] = [
  {
    id: 1,
    number: "01",
    name: "Roshni Shroff",
    role: "Sales Team",
    department: "Sales & Client Solutions",
    imageUrl: "/team/roshni-shroff.jpg",
    active: true,
  },
  {
    id: 2,
    number: "02",
    name: "Pooja Thakor",
    role: "Sales Team",
    department: "Sales & Client Solutions",
    imageUrl: "/team/pooja-thakor.jpg",
    active: true,
  },
  {
    id: 3,
    number: "03",
    name: "Pooja Patel",
    role: "Sales Team",
    department: "Sales & Client Solutions",
    imageUrl: "/team/pooja-patel.jpg",
    active: true,
  },
  {
    id: 4,
    number: "04",
    name: "Jinay Patel",
    role: "Sales Team · Switch Gears",
    department: "Switchgear Sourcing",
    imageUrl: "/team/jinay-patel.jpg",
    active: true,
  },
  {
    id: 5,
    number: "05",
    name: "Dhaval Rana",
    role: "Accounts Manager",
    department: "Finance & Accounts",
    imageUrl: "/team/dhaval-rana.jpg",
    active: true,
  },
  {
    id: 6,
    number: "06",
    name: "Montu Patil",
    role: "Operations Manager",
    department: "Logistics & Operations",
    imageUrl: "/team/montu-patil.jpg",
    active: true,
  },
];

function getCandidateUrls(basePath?: string | null): string[] {
  if (!basePath) return [];
  const clean = basePath.replace(/\.(jpe?g|png|webp)$/i, "");
  return [`${clean}.jpeg`, `${clean}.jpg`, `${clean}.png`, `${clean}.webp`];
}

function CeoPortrait({ ceo }: { ceo: { name: string; imageUrl?: string | null; initials?: string } }) {
  const candidates = getCandidateUrls(ceo.imageUrl);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const showPhoto = Boolean(candidates.length > 0 && !hasError && candidateIndex < candidates.length);

  if (showPhoto) {
    return (
      <div className="about-ceo-portrait has-image">
        <img
          src={candidates[candidateIndex]}
          alt={ceo.name}
          className="about-ceo-photo"
          onError={() => {
            if (candidateIndex + 1 < candidates.length) {
              setCandidateIndex((prev) => prev + 1);
            } else {
              setHasError(true);
            }
          }}
        />
        <div className="about-ceo-badge-floating">
          <div className="ceo-badge-pulse" />
          <div className="ceo-badge-text">
            <strong>{ceo.name}</strong>
            <span>Chief Executive Officer</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="about-ceo-portrait no-image">
      <span className="ceo-initials-fallback">{ceo.initials || "NP"}</span>
      <small>CEO PROFILE</small>
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMemberItem }) {
  const candidates = getCandidateUrls(member.imageUrl);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const showPhoto = Boolean(candidates.length > 0 && !hasError && candidateIndex < candidates.length);

  return (
    <article className="about-team-card">
      {showPhoto ? (
        <div className="about-team-avatar has-photo">
          <img
            src={candidates[candidateIndex]}
            alt={member.name}
            className="about-team-photo"
            onError={() => {
              if (candidateIndex + 1 < candidates.length) {
                setCandidateIndex((prev) => prev + 1);
              } else {
                setHasError(true);
              }
            }}
          />
        </div>
      ) : (
        <div className="about-team-avatar">{member.number}</div>
      )}
      <span>{member.name}</span>
      <small>{member.role}</small>
    </article>
  );
}

function BrandMark() {
  return (
    <div className="about-brand" aria-label="VOLAMP home">
      <img src="/volamp-logo.png" alt="VOLAMP Powering Growth" />
    </div>
  );
}

function getPreferredSpeechVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact Hindi voice
  const hindiVoice = voices.find((v) => v.lang === "hi-IN" || v.lang.startsWith("hi"));
  if (hindiVoice) return hindiVoice;

  // 2. Indian English voice (natural accent for Hindi/Hinglish text)
  const indianEngVoice = voices.find(
    (v) =>
      v.lang === "en-IN" ||
      v.name.toLowerCase().includes("india") ||
      v.name.toLowerCase().includes("ravi") ||
      v.name.toLowerCase().includes("neerja") ||
      v.name.toLowerCase().includes("heera") ||
      v.name.toLowerCase().includes("veena")
  );
  if (indianEngVoice) return indianEngVoice;

  // 3. Fallback
  return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
}

export default function AboutVolamp() {
  const { data: leadershipData } = trpc.leadership.get.useQuery();

  const [ceoMode, setCeoMode] = useState<"all" | "highlights">("all");
  const [activeParaIndex, setActiveParaIndex] = useState<number | null>(null);
  const [isCeoAutoPlaying, setIsCeoAutoPlaying] = useState<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);

  // Stepper interactive & animation state
  const [highlightedMilestoneId, setHighlightedMilestoneId] = useState<string | null>(null);
  const [activeStepperIndex, setActiveStepperIndex] = useState<number>(5);

  const handleStepperClick = (index: number, targetId: string) => {
    setActiveStepperIndex(index);
    setHighlightedMilestoneId(targetId);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => {
      setHighlightedMilestoneId((curr) => (curr === targetId ? null : curr));
    }, 2800);
  };

  // Warm up voices & cleanup on unmount
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopAudioTour = () => {
    isSpeakingRef.current = false;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsCeoAutoPlaying(false);
  };

  const playParagraphAudio = (index: number, messageList: string[], mottoText?: string) => {
    if (typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
      // Fallback to visual-only tour if speech not supported
      setIsCeoAutoPlaying(true);
      setActiveParaIndex(index);
      return;
    }

    window.speechSynthesis.cancel();

    let textToSpeak = "";
    if (index < messageList.length) {
      textToSpeak = messageList[index];
    } else if (index === messageList.length && mottoText) {
      textToSpeak = mottoText;
    } else {
      stopAudioTour();
      setActiveParaIndex(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voice = getPreferredSpeechVoice();
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setActiveParaIndex(index);
    };

    utterance.onend = () => {
      if (!isSpeakingRef.current) return;
      if (index + 1 <= messageList.length) {
        playParagraphAudio(index + 1, messageList, mottoText);
      } else {
        stopAudioTour();
        setActiveParaIndex(null);
      }
    };

    utterance.onerror = (err) => {
      console.warn("[Speech] Utterance error:", err);
      if (isSpeakingRef.current && index + 1 <= messageList.length) {
        setTimeout(() => {
          playParagraphAudio(index + 1, messageList, mottoText);
        }, 600);
      } else {
        stopAudioTour();
      }
    };

    isSpeakingRef.current = true;
    setIsCeoAutoPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const ceo = leadershipData?.ceo ?? {
    name: "Naimil Patel",
    role: "Chief Executive Officer · Volamp Elektrikals Private Limited",
    company: "Volamp Elektrikals Private Limited",
    headline: "Saath Milkar Growth Ki Ek Nayi Pehchaan Banayein",
    quote: "“Koi bhi company sirf products se nahi banti — company banti hai INSAN, unki mehnat, commitment aur customer ke trust se.”",
    message: [
      "Volamp Elektrikals Private Limited ke safar mein hamara focus sirf business grow karna nahi, balki trust, quality aur strong relations build karna hai.",
      "Mera maanna hai ki koi bhi company sirf products se nahi banti — company banti hai INSAN AUR unki mehnat, commitment aur customer ke trust se.",
      "Volamp mein hum continuously apne products, services aur working systems ko better banane ki koshish karte hain. Electrical aur switchgear industry mein badalti customer requirements ko samajhna aur unke liye reliable aur value-driven solutions provide karna hamari priority hoti hai.",
      "Hamare liye har customer sirf ek business opportunity nahi, balki ek long-term relationship hai. Isi approach ke saath hum quality, service aur commitment ko apne business ka strong foundation bana rahe hain.",
      "Main apni team par bhi poora bharosa rakhta hoon. Mujhe believe hai ki jab har individual apni responsibility ko ownership ke saath nibhata hai, tab organisation extraordinary results achieve kar sakti hai.",
      "Aane wale samay mein hum technology, better systems, innovation aur strong teamwork ke through Volamp ko aur stronger banane ke liye committed hain.",
      "Hamari comeback ki journey abhi shuru hui hai. Target sirf bada banna nahi, balki better banna hai — har din, har customer aur har opportunity ke saath.",
      "Main apne customers, dealers, suppliers, business partners aur poori Volamp team ka dil se thank you karta hoon, jo is journey ka important part hain. Chalo, milkar ek aisa Volamp banayein jiske saath log sirf business nahi, balki apna trust bhi jodna chahein.",
    ],
    motto: "Together, Let's Power the Growth. Together, Let's Build Volamp and India.",
    imageUrl: "/team/ceo.jpeg",
    initials: "NP",
  };

  const team = leadershipData?.team ?? fallbackTeamSlots;

  return (
    <div className="about-page">
      <header className="about-header">
        <div className="about-header-inner">
          <Link href="/">
            <BrandMark />
          </Link>
          <nav aria-label="About Volamp navigation">
            <a href="#story">Our story</a>
            <a href="#leadership">Leadership</a>
            <a href="#footprint">Global Presence & Footprint</a>
            <Link href="/collaborate" className="collaborate-nav-link">
              Collaborate with us <ArrowRight className="inline size-3 ml-0.5" />
            </Link>
          </nav>
          <div className="about-header-actions">
            <ThemeToggle />
            <Link className="about-header-cta" href="/">
              Marketplace <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="about-hero">
          <div className="about-container about-hero-grid">
            <div>
              <span className="about-eyebrow">ABOUT VOLAMP · POWERING GROWTH</span>
              <h1>
                The work behind the <em>connection.</em>
              </h1>
              <p>
                Volamp brings clearer electrical sourcing to the people responsible for keeping projects,
                plants and communities moving.
              </p>
              <div className="about-hero-actions">
                <a className="about-primary-cta" href="#story">
                  Read our story <ArrowRight className="size-4" />
                </a>
                <a className="about-secondary-cta" href="#footprint">
                  Explore 3D Footprint <MapPin className="size-4" />
                </a>
              </div>
            </div>
            <div className="about-hero-art">
              <div className="about-orbit about-orbit-one" />
              <div className="about-orbit about-orbit-two" />
              <div className="about-hero-core">
                <Cable />
                <span>VLP</span>
              </div>
              <span className="about-hero-coordinate">23° 01' N · 72° 34' E</span>
            </div>
          </div>
        </section>

        <section id="story" className="about-section about-story">
          <div className="about-container about-section-heading">
            <div>
              <span className="about-eyebrow">01 · OUR STORY & JOURNEY</span>
              <h2>
                Four Generations.
                <br />
                <em>One Electrical Legacy.</em>
              </h2>
            </div>
            <p>
              The story of Volamp Electricals is a story of entrepreneurship, resilience, and a
              four-generation commitment to the electrical industry.
            </p>
          </div>

          <div className="about-container about-timeline">
            {[
              {
                id: "milestone-1964",
                year: "1964",
                genTag: "1st Generation",
                era: "Founding",
                avatar: "SP",
                leader: "Soma Bhai Khatubhai Patel",
                chapterTitle: "Founding of S.P. Electric & Engineering Co.",
                detail:
                  "The journey began with Soma Bhai Khatubhai Patel, an ITI-trained electrician from Panchmahal, Gujarat, who moved to Ahmedabad driven by entrepreneurial ambition. After ventures in textile and flour mills, he entered the electrical trade through commission sales. In June 1964, he co-founded S.P. Electric and Engineering Company as a partnership firm — initiating a six-decade family legacy.",
                highlight: "June 1964 · Co-founded S.P. Electric & Engineering Co.",
              },
              {
                id: "milestone-2nd-gen",
                year: "1970s–80s",
                genTag: "2nd Generation",
                era: "Expansion",
                avatar: "CP",
                leader: "Chaturbhai Somabhai Patel",
                chapterTitle: "Strengthening the Industrial Foundation",
                detail:
                  "The business was subsequently carried forward by second-generation leader Chaturbhai Somabhai Patel, who built upon the foundation established by his father. Chaturbhai focused on deepening client relationships, expanding distribution across Gujarat's growing industrial corridors, and cementing the family's reputation for integrity and technical reliability.",
                highlight: "Deepened supply footprint across industrial Gujarat",
              },
              {
                id: "milestone-1986",
                year: "1986",
                genTag: "3rd Generation",
                era: "Modernization",
                avatar: "VP",
                leader: "Vipulbhai Chaturbhai Patel",
                chapterTitle: "Evolution & Next-Phase Growth",
                detail:
                  "In 1986, third-generation leader Vipulbhai Chaturbhai Patel entered the business. Under his stewardship, the enterprise adapted to rapid advancements in electrical infrastructure, diversified into modern switchgear and cable offerings, and laid the operational groundwork essential for the company's next major era of multi-regional expansion.",
                highlight: "Entered in 1986 · Diversified switchgear & cable lines",
              },
              {
                id: "milestone-2012",
                year: "2008–2012",
                genTag: "4th Generation",
                era: "Engineering",
                avatar: "NP",
                leader: "Naimil Vipul Patel",
                chapterTitle: "Engineering Discipline & Ground-Up Mastery",
                detail:
                  "Developing a keen interest in electrical cables from his school days, fourth-generation leader Naimil Vipul Patel began studying Electrical Engineering in 2008 while simultaneously working at his father's office. Learning the trade from the ground up, he formally entered the business in 2012 with engineering discipline, fresh perspective, and a structured, future-ready vision.",
                highlight: "Electrical Engineering · Structured future-ready vision",
              },
              {
                id: "milestone-2014",
                year: "2014",
                genTag: "4th Generation",
                era: "Capabilities",
                avatar: "NP",
                leader: "Naimil Vipul Patel",
                chapterTitle: "Establishing Volamp Power",
                detail:
                  "In 2014, Naimil established Volamp Power, creating a dedicated corporate entity to scale operations, expand supply capabilities, and service major industrial and commercial clients. Through Volamp Power, he built nationwide vendor relationships, broadened specialized cable offerings, and established modern logistics systems.",
                highlight: "Established Volamp Power · Scaled supply partnerships",
              },
              {
                id: "milestone-2021",
                year: "2021 → Today",
                genTag: "Future Ready",
                era: "New Chapter",
                avatar: "VE",
                leader: "Volamp Electricals Pvt Ltd",
                chapterTitle: "Restructuring for the Next 50+ Years",
                detail:
                  "In 2021, the family took a defining strategic step: restructuring the business with a vision for the next 50+ years, leading to the incorporation of Volamp Electricals Private Limited. Today, Naimil Vipul Patel represents the fourth generation, honoring a 1964 legacy while building a state-of-the-art electrical powerhouse for generations to come.",
                highlight: "Restructured for next 50+ years · 1964 to the Future",
              },
            ].map((item) => (
              <article
                id={item.id}
                className={`about-timeline-item ${highlightedMilestoneId === item.id ? "is-highlighted-card" : ""}`}
                key={item.year}
              >
                <div className="timeline-card-header">
                  <div className="timeline-gen-badge">
                    <span className="gen-numeral">{item.genTag}</span>
                    <span className="gen-dot">·</span>
                    <span className="gen-year">{item.year}</span>
                  </div>
                  <span className="timeline-era-chip">{item.era}</span>
                </div>

                <div className="timeline-leader-section">
                  <div className="timeline-leader-avatar">{item.avatar}</div>
                  <div className="timeline-leader-info">
                    <h3 className="timeline-leader-name">{item.leader}</h3>
                    <span className="timeline-chapter-title">{item.chapterTitle}</span>
                  </div>
                </div>

                <p className="timeline-narrative">{item.detail}</p>

                <div className="timeline-milestone-footer">
                  <div className="timeline-highlight-pill">
                    <Sparkles className="size-3.5" />
                    <span>{item.highlight}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* From 1964 to the Future: Legacy Callout Banner */}
          <div className="about-container">
            <div className="about-legacy-banner">
              <div className="legacy-banner-header">
                <span className="legacy-eyebrow">FROM 1964 TO THE FUTURE</span>
                <h3>Four Generations. 60+ Years of Legacy. One Vision for the Future.</h3>
                <p>
                  More than six decades later, the industry has transformed, technology has evolved, and
                  the way business is conducted has changed. But one thing has remained constant — the
                  entrepreneurial spirit of the Patel family and its commitment to the electrical industry.
                </p>
                <p className="legacy-subtext">
                  From Soma Bhai Khatubhai Patel to Chaturbhai Somabhai Patel, from Vipulbhai Chaturbhai Patel
                  to Naimil Vipul Patel, four generations have contributed to building and evolving this
                  journey. Volamp Electricals Private Limited is not merely carrying forward a family
                  business. It is building upon a legacy — with the vision, ambition, and structure to
                  create the next chapter for generations to come.
                </p>
              </div>

              {/* Animated & Interactive Electrical Legacy Stepper */}
              <div className="legacy-stepper-container">
                <div className="legacy-stepper-bar" role="navigation" aria-label="Volamp historical milestones">
                  {/* Glowing electrical power line & moving current pulse */}
                  <div className="stepper-track-rail">
                    <div className="stepper-track-pulse" />
                  </div>

                  {[
                    { year: "1964", label: "S.P. Electric", gen: "1st Gen", targetId: "milestone-1964" },
                    { year: "1986", label: "Evolution", gen: "3rd Gen", targetId: "milestone-1986" },
                    { year: "2012", label: "Groundwork", gen: "4th Gen", targetId: "milestone-2012" },
                    { year: "2014", label: "Volamp Power", gen: "Expansion", targetId: "milestone-2014" },
                    { year: "2021", label: "Volamp Pvt Ltd", gen: "Next 50+ Yrs", targetId: "milestone-2021" },
                    { year: "Today", label: "60+ Yrs Legacy", gen: "Future", targetId: "milestone-2021", isToday: true },
                  ].map((step, idx) => {
                    const isActive = activeStepperIndex === idx;
                    return (
                      <div key={step.year} className="stepper-step-group">
                        <button
                          type="button"
                          className={`stepper-node-btn ${step.isToday ? "is-today" : ""} ${isActive ? "is-active" : ""}`}
                          onClick={() => handleStepperClick(idx, step.targetId)}
                          title={`Click to view ${step.year} milestone in detail`}
                        >
                          <span className="stepper-dot">
                            <span className="stepper-dot-core" />
                            <span className="stepper-dot-ring" />
                          </span>
                          <span className="stepper-year-text">{step.year}</span>
                          <span className="stepper-gen-micro">{step.gen}</span>
                          {step.isToday && <Zap className="size-3.5 stepper-zap-icon" />}
                        </button>

                        {idx < 5 && (
                          <div
                            className="stepper-arrow-wrapper"
                            style={{ "--arrow-index": idx } as React.CSSProperties}
                          >
                            <span className="stepper-arrow-line" />
                            <ChevronRight className="stepper-arrow-chevron" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="stepper-interactive-hint">
                  <Sparkles className="size-3" />
                  <span>Interactive Timeline · Click any milestone to highlight that chapter</span>
                </div>
              </div>

              <div className="legacy-stats-row">
                <div className="legacy-stat-card">
                  <span className="stat-number">4</span>
                  <span className="stat-label">Generations</span>
                </div>
                <div className="legacy-stat-divider" />
                <div className="legacy-stat-card">
                  <span className="stat-number">60+</span>
                  <span className="stat-label">Years of Legacy</span>
                </div>
                <div className="legacy-stat-divider" />
                <div className="legacy-stat-card">
                  <span className="stat-number">1</span>
                  <span className="stat-label">Vision for the Future</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section about-goals">
          <div className="about-container">
            <div className="about-section-heading">
              <div>
                <span className="about-eyebrow">02 · OUR GOALS</span>
                <h2>
                  Make the supply chain
                  <br />
                  <em>feel more certain.</em>
                </h2>
              </div>
              <p>
                Our goal is not to make electrical sourcing louder. It is to make every next step more
                legible, better documented and easier to own.
              </p>
            </div>
            <div className="about-goal-grid">
              <article>
                <Target />
                <span>01</span>
                <h3>Clarity before commitment</h3>
                <p>
                  Help teams begin with the right category, a useful specification conversation and
                  transparent next actions.
                </p>
              </article>
              <article>
                <ShieldCheck />
                <span>02</span>
                <h3>Reliability in the handoff</h3>
                <p>
                  Build dependable follow-through from enquiry to quotation, dispatch and private customer
                  records.
                </p>
              </article>
              <article>
                <Users />
                <span>03</span>
                <h3>Growth with accountability</h3>
                <p>
                  Grow across India while preserving the human responsibility behind every project
                  conversation.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="leadership" className="about-section about-leadership">
          <div className="about-container">
            <div className="about-section-heading">
              <div>
                <span className="about-eyebrow">03 · LEADERSHIP</span>
                <h2>
                  People who stay
                  <br />
                  <em>close to the work.</em>
                </h2>
              </div>
              <p>
                Meet the leadership and committed team driving VOLAMP’s vision of dependable electrical
                distribution, trusted partnerships, and accountable execution across India.
              </p>
            </div>
            <div className="about-ceo-card">
              <CeoPortrait ceo={ceo} />
              <div className="about-ceo-content">
                <div className="about-ceo-header">
                  <div className="about-ceo-header-top">
                    <span className="about-eyebrow">
                      CEO MESSAGE
                      <span className="ceo-soundwave" aria-hidden="true" title="Executive Voice">
                        <span className="bar bar-1" />
                        <span className="bar bar-2" />
                        <span className="bar bar-3" />
                        <span className="bar bar-4" />
                      </span>
                    </span>

                    <div className="about-ceo-controls">
                      <button
                        type="button"
                        className={`ceo-mode-btn ${ceoMode === "all" && !isCeoAutoPlaying ? "is-active" : ""}`}
                        onClick={() => {
                          setCeoMode("all");
                          stopAudioTour();
                          setActiveParaIndex(null);
                        }}
                      >
                        Full Statement
                      </button>
                      <button
                        type="button"
                        className={`ceo-mode-btn ${ceoMode === "highlights" && !isCeoAutoPlaying ? "is-active" : ""}`}
                        onClick={() => {
                          setCeoMode("highlights");
                          stopAudioTour();
                          setActiveParaIndex(null);
                        }}
                      >
                        <Sparkles className="size-3" /> Key Pillars
                      </button>
                      <button
                        type="button"
                        className={`ceo-mode-btn ${isCeoAutoPlaying ? "is-playing" : ""}`}
                        onClick={() => {
                          if (isCeoAutoPlaying) {
                            stopAudioTour();
                          } else {
                            setCeoMode("all");
                            const startIndex =
                              activeParaIndex !== null &&
                              activeParaIndex < ((ceo as any).message?.length ?? 0)
                                ? activeParaIndex
                                : 0;
                            playParagraphAudio(
                              startIndex,
                              (ceo as any).message ?? [],
                              (ceo as any).motto
                            );
                          }
                        }}
                        title="Listen to CEO message with audio narration"
                      >
                        {isCeoAutoPlaying ? (
                          <>
                            <VolumeX className="size-3" /> Stop Audio Tour
                          </>
                        ) : (
                          <>
                            <Volume2 className="size-3" /> Listen to Audio Tour
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <h3>{ceo.name}</h3>
                  <p className="about-role">{ceo.role}</p>
                  {(ceo as any).headline && (
                    <h4 className="about-ceo-headline">{(ceo as any).headline}</h4>
                  )}
                </div>

                <div className="about-ceo-message-body">
                  {(ceo as any).message && (ceo as any).message.length > 0 ? (
                    (ceo as any).message.map((para: string, idx: number) => {
                      const isKeyHighlight = idx === 1 || idx === 6;
                      const isHighlighted =
                        activeParaIndex === idx ||
                        (ceoMode === "highlights" && isKeyHighlight);

                      return (
                        <p
                          key={idx}
                          className={`about-ceo-para ${isHighlighted ? "is-highlighted" : ""} ${
                            activeParaIndex === idx ? "is-active-tour" : ""
                          }`}
                          onClick={() => {
                            setActiveParaIndex(idx);
                            playParagraphAudio(
                              idx,
                              (ceo as any).message ?? [],
                              (ceo as any).motto
                            );
                          }}
                          title="Click to listen to this thought"
                        >
                          {isKeyHighlight && ceoMode === "highlights" && (
                            <span className="highlight-tag">Core Pillar ·</span>
                          )}
                          {para}
                        </p>
                      );
                    })
                  ) : (
                    <blockquote>{ceo.quote}</blockquote>
                  )}
                </div>

                {(ceo as any).motto && (
                  <div className="about-ceo-motto">
                    <Sparkles className="size-4 flex-shrink-0" />
                    <span>{(ceo as any).motto}</span>
                  </div>
                )}

                <div className="about-ceo-signoff">
                  <span className="about-signoff-regards">With Regards,</span>
                  <span className="about-signoff-org">VOLAMP ELEKTRIKALS PRIVATE LIMITED</span>
                  <div className="about-ceo-signature-block">
                    <svg viewBox="0 0 200 42" className="ceo-signature-svg" aria-label="Naimil Patel Signature">
                      <path
                        d="M 15 30 Q 25 6 40 24 Q 50 36 60 14 Q 70 26 85 20 Q 95 16 110 28 Q 130 12 150 24 Q 170 30 185 16"
                        fill="none"
                        stroke="url(#sigGold)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="sig-path"
                      />
                      <defs>
                        <linearGradient id="sigGold" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f2b84b" />
                          <stop offset="50%" stopColor="#fde29f" />
                          <stop offset="100%" stopColor="#d4952b" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <span className="about-signoff-author"><strong>Naimil Patel</strong> · Chief Executive Officer</span>
                </div>
              </div>
            </div>
            <div className="about-team-header">
              <div>
                <span className="about-eyebrow">MEET THE TEAM</span>
                <h3>
                  {team.length === 6
                    ? "Six"
                    : team.length === 9
                    ? "Nine"
                    : team.length === 1
                    ? "One"
                    : `${team.length}`}{" "}
                  people, one accountable handoff.
                </h3>
              </div>
            </div>
            <div className="about-team-grid">
              {team.map((member) => (
                <TeamMemberCard key={member.id ?? member.number} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 04: 3D Global Presence + India Projects Experience */}
        <section id="footprint" className="about-section about-footprint">
          <div className="about-container">
            <div className="about-section-heading">
              <div>
                <span className="about-eyebrow">04 · 3D GLOBAL PRESENCE & INDIA PROJECTS</span>
                <h2>
                  Powering Progress.
                  <br />
                  <em>Connecting Possibilities.</em>
                </h2>
              </div>
              <p>
                From our engineering origin in Ahmedabad to mission-critical infrastructure across 28
                Indian States & Union Territories and expanding international exports, explore Volamp’s nationwide footprint,
                regional project heritage, and verified customer partnerships.
              </p>
            </div>

            <GlobeProjectsExperience />
          </div>
        </section>
      </main>

      {/* Comprehensive Corporate Enterprise Footer */}
      <footer className="about-footer-enterprise">
        {/* Pre-footer project inquiry & support strip */}
        <div className="about-footer-prebar">
          <div className="about-container prebar-inner">
            <div className="prebar-text">
              <span className="prebar-eyebrow">ENGINEERING & PROJECT SUPPLY DESK</span>
              <h3>Powering High-Voltage Infrastructure Across India & Overseas.</h3>
              <p>Direct manufacturer supply, Mill Test Certificates (MTC), and specialized technical guidance from Ahmedabad HQ.</p>
            </div>
            <div className="prebar-actions">
              <a
                href="https://wa.me/919512365582?text=Hello%20Volamp%20team,%20I%20would%20like%20to%20request%20a%20project%20quote%20and%20cabling%20specifications."
                target="_blank"
                rel="noreferrer"
                className="prebar-btn-primary"
              >
                <MessageCircle className="size-4" /> Request Project Quote
              </a>
              <a href="tel:+919512365582" className="prebar-btn-secondary">
                <Phone className="size-4" /> +91 9512365582
              </a>
            </div>
          </div>
        </div>

        {/* Main 5-Column Corporate Navigation */}
        <div className="about-container about-footer-grid">
          {/* Column 1: Corporate Brand & Identity */}
          <div className="about-footer-col col-brand">
            <div className="about-footer-brand-box">
              <img src="/volamp-logo.png" alt="Volamp Elektrikals" className="about-footer-logo" />
            </div>
            <h4 className="about-footer-company-name">VOLAMP ELEKTRIKALS PRIVATE LIMITED</h4>
            <p className="about-footer-mission">
              Four generations of trusted electrical manufacturing and engineered supply chains powering landmark infrastructure, solar parks, industrial plants, and smart cities across India.
            </p>
            <div className="about-footer-socials">
              <a href="https://www.linkedin.com/company/volampelektrikals/" target="_blank" rel="noreferrer" aria-label="Volamp on LinkedIn">
                <Linkedin className="size-4" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61587485305483#" target="_blank" rel="noreferrer" aria-label="Volamp on Facebook">
                <Facebook className="size-4" />
              </a>
              <a href="https://www.instagram.com/volampp?stkn=dGtjZDA1enF5OWN6" target="_blank" rel="noreferrer" aria-label="Volamp on Instagram">
                <Instagram className="size-4" />
              </a>
              <a href="https://m.youtube.com/%40cablezone" target="_blank" rel="noreferrer" aria-label="Volamp on YouTube">
                <Youtube className="size-4" />
              </a>
            </div>
            <a href="https://gem.gov.in/" target="_blank" rel="noreferrer" className="about-footer-gem-badge" title="Government e-Marketplace Registered Vendor">
              <img src="/gem-marketplace-logo.png" alt="Government e Marketplace GeM" />
            </a>
          </div>

          {/* Column 2: Corporate Navigation */}
          <div className="about-footer-col">
            <span className="col-title">ABOUT VOLAMP</span>
            <a href="#top">Our Heritage & 4 Generations</a>
            <Link href="/business-segments">10 Business Segments</Link>
            <a href="#footprint">3D Interactive Map & Footprint</a>
            <a href="#legacy-timeline">Historic Timeline (1965–Present)</a>
            <a href="#team">Leadership & Management</a>
            <Link href="/careers">Careers & Openings</Link>
            <Link href="/collaborate" className="highlight-link">
              Collaborate with Us <ArrowRight className="size-3 inline ml-1" />
            </Link>
          </div>

          {/* Column 3: Product Solutions */}
          <div className="about-footer-col">
            <span className="col-title">PRODUCT SOLUTIONS</span>
            <Link href="/category/wire-cables">HT / LT Armoured Power Cables</Link>
            <Link href="/category/wire-cables">Solar & Photovoltaic Cables</Link>
            <Link href="/category/wire-cables">Industrial Rubber & Mining Cables</Link>
            <Link href="/category/wire-cables">Building Wires & FRLS Compounds</Link>
            <Link href="/category/wire-cables">Substation Control & Instrumentation</Link>
            <Link href="/calculator">Cable Sizing Calculator</Link>
          </div>

          {/* Column 4: Compliance & Governance */}
          <div className="about-footer-col">
            <span className="col-title">POLICIES & STANDARDS</span>
            <Link href="/shipping-policy">Shipping & Pan-India Delivery</Link>
            <Link href="/refund-policy">Return & Refund Policy</Link>
            <Link href="/privacy-policy">Privacy & Data Policy</Link>
            <a href="#footprint">IS / IEC / CE Quality Compliance</a>
            <a href="https://gem.gov.in/" target="_blank" rel="noreferrer">GeM Registered Supplier</a>
          </div>

          {/* Column 5: Supply Desk & Support */}
          <div className="about-footer-col col-contact">
            <span className="col-title">CENTRAL SUPPLY DESK</span>
            <div className="about-contact-item">
              <span className="contact-label">CORPORATE HEADQUARTERS</span>
              <strong>Ahmedabad, Gujarat, India</strong>
              <small>Serving 28 States & Global Export</small>
            </div>
            <div className="about-contact-item">
              <span className="contact-label">DIRECT PHONE & WHATSAPP</span>
              <a href="tel:+919512365582" className="contact-phone-link">
                <strong>+91 9512365582</strong>
              </a>
              <small>Monday – Saturday: 9:00 AM – 7:30 PM IST</small>
            </div>
            <div className="about-footer-quick-links">
              <Link href="/pay-invoice" className="quick-action-link">
                Pay an Invoice Online <ArrowRight className="size-3" />
              </Link>
              <Link href="/" className="quick-action-link">
                Return to Marketplace <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="about-footer-bottom-bar">
          <div className="about-container bottom-bar-inner">
            <span>© 2026 Volamp Elektrikals Private Limited. All rights reserved.</span>
            <span className="footer-tagline">
              Powering Progress. Connecting Possibilities. Built for clearer electrical sourcing across India.
            </span>
            <a href="#top" className="back-to-top-btn" title="Back to top">
              Top ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
