import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthModal } from "@/components/auth/AuthModal";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CirclePlus,
  FileText,
  Headphones,
  Loader2,
  LogOut,
  MapPin,
  MessageCircle,
  PackageSearch,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { WhatsAppInvoiceModal } from "@/components/invoice/WhatsAppInvoiceModal";

type ProfileForm = {
  fullName: string;
  mobile: string;
  companyName: string;
  gstin: string;
  address: string;
  state: string;
  city: string;
  pinCode: string;
  customerType: "individual" | "contractor" | "dealer" | "distributor" | "business";
  preferredCommunication: "email" | "phone" | "whatsapp";
  deliveryInstructions: string;
};

const emptyProfile: ProfileForm = {
  fullName: "",
  mobile: "",
  companyName: "",
  gstin: "",
  address: "",
  state: "",
  city: "",
  pinCode: "",
  customerType: "business",
  preferredCommunication: "email",
  deliveryInstructions: "",
};

const statusLabels: Record<string, string> = {
  requested: "Requested",
  under_review: "Under review",
  quoted: "Quoted",
  approved: "Approved",
  closed: "Closed",
  received: "Order received",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  dispatched: "Dispatched",
  in_transit: "In transit",
  delivered: "Delivered",
  completed: "Completed",
};

function SectionHeading({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: ReactNode }) {
  return (
    <div className="portal-section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <span className="portal-heading-icon">{icon}</span>
    </div>
  );
}

function PortalPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`portal-panel industrial-panel ${className}`}>{children}</section>;
}

function BadgeStatus({ label }: { label: string }) {
  return <span className="status-badge">{label}</span>;
}

function EmptyState({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <strong>{title}</strong>
      <p>{copy}</p>
    </div>
  );
}

export default function CustomerPortal() {
  const [, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<"customer" | "employee">("customer");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const portal = trpc.customer.portal.useQuery(undefined, { enabled: Boolean(user) });
  const utils = trpc.useUtils();

  const saveProfile = trpc.customer.saveProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile saved");
      portal.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const openTicket = trpc.customer.openSupportTicket.useMutation({
    onSuccess: () => {
      toast.success("Support ticket opened");
      setSupportSubject("");
      setSupportMessage("");
      portal.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const toggleMfaMutation = trpc.auth.toggleCustomerMfa.useMutation({
    onSuccess: (data) => {
      toast.success(data.mfaEnabled ? "MFA Enabled" : "MFA Disabled", {
        description: data.mfaEnabled
          ? "A 6-digit OTP will be required on your next login."
          : "Standard password login restored.",
      });
      utils.auth.me.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleLogout = async () => {
    await logout();
    toast.info("Logged out successfully");
    setLocation("/");
  };

  const profile = portal.data?.profile;
  const quotations = portal.data?.quotations ?? [];
  const orders = portal.data?.orders ?? [];
  const documents = portal.data?.documents ?? [];
  const tickets = portal.data?.tickets ?? [];
  const latestQuote = quotations[0];
  const latestOrder = orders[0];

  const nextAction = useMemo(
    () =>
      latestQuote
        ? {
            label: "Quotation in motion",
            detail: `${latestQuote.reference} · ${statusLabels[latestQuote.status] || latestQuote.status}`,
            action: "Review quotation status",
          }
        : latestOrder
        ? {
            label: "Delivery in motion",
            detail: `${latestOrder.orderNumber} · ${statusLabels[latestOrder.status] || latestOrder.status}`,
            action: "Review order tracking",
          }
        : {
            label: "Start a project request",
            detail: "Tell the supply desk what cable category and quantity you need.",
            action: "Request a quotation",
          },
    [latestQuote, latestOrder]
  );

  useEffect(() => {
    if (portal.data?.profile) {
      const saved = portal.data.profile;
      setProfileForm({
        ...emptyProfile,
        fullName: saved.fullName ?? "",
        mobile: saved.mobile ?? "",
        companyName: saved.companyName ?? "",
        gstin: saved.gstin ?? "",
        address: saved.address ?? "",
        state: saved.state ?? "",
        city: saved.city ?? "",
        pinCode: saved.pinCode ?? "",
        customerType: saved.customerType,
        preferredCommunication: saved.preferredCommunication,
        deliveryInstructions: saved.deliveryInstructions ?? "",
      });
    }
  }, [portal.data?.profile]);

  if (loading)
    return (
      <div className="portal-shell industrial-portal portal-loading">
        <Loader2 className="animate-spin text-orange" />
      </div>
    );

  if (!user)
    return (
      <div className="portal-shell industrial-portal">
        <div className="portal-login">
          <Link href="/" className="back-link">
            <ArrowLeft className="size-4" /> Back to VOLAMP
          </Link>
          <div className="portal-login-layout">
            <div>
              <div className="portal-logo">
                <UserRound />
              </div>
              <p className="eyebrow">Customer operations / private access</p>
              <h1>
                A clearer workspace
                <br />
                <span>for every project.</span>
              </h1>
              <p>
                Sign in to access your own quotations, orders, documents, support tickets, and delivery details.
              </p>
              <div className="portal-access-actions">
                <Button
                  onClick={() => {
                    setAuthModalType("customer");
                    setAuthModalOpen(true);
                  }}
                  className="primary-cta"
                >
                  Customer login <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button
                  onClick={() => {
                    setAuthModalType("customer");
                    setAuthModalOpen(true);
                  }}
                  variant="outline"
                  className="secondary-portal-cta"
                >
                  Create customer account <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>

            <div className="portal-login-note">
              <span>VOLAMP / CUSTOMER SYSTEM</span>
              <strong>Your information stays tied to your account.</strong>
              <p>
                Customer login and first-time registration use one secure sign-in flow. Employee access is managed
                through official @volampelektrikals.com credentials.
              </p>
              <div className="employee-entry">
                <div>
                  <span>EMPLOYEE ACCESS</span>
                  <strong>For the Volamp team</strong>
                  <small>Employee login and registration with Multi-Factor Authentication.</small>
                </div>
                <Button
                  onClick={() => {
                    setAuthModalType("employee");
                    setAuthModalOpen(true);
                  }}
                  variant="outline"
                  className="employee-portal-cta"
                >
                  Employee login / signup <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialAccountType={authModalType}
        />
      </div>
    );

  const update = (key: keyof ProfileForm, value: string) =>
    setProfileForm((current) => ({ ...current, [key]: value }));
  const profileReady = Boolean(profileForm.fullName.trim());

  return (
    <div className="portal-shell industrial-portal">
      <div className="portal-container">
        <div className="portal-topbar">
          <Link href="/" className="back-link">
            <ArrowLeft className="size-4" /> Back to VOLAMP
          </Link>
          <div className="portal-identity">
            <ThemeToggle />
            <span className="portal-avatar">
              {(user.name || user.email || "V").charAt(0).toUpperCase()}
            </span>
            <span>{user.name || user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1 ml-2"
            >
              <LogOut className="size-3.5" /> Logout
            </Button>
          </div>
        </div>

        <header className="portal-hero portal-hero-industrial">
          <div>
            <p className="eyebrow text-sun">Customer workboard / private access</p>
            <h1>
              Keep the work
              <br />
              <span>moving.</span>
            </h1>
            <p>
              Your project requests, delivery visibility, documents and support — organized around the next useful action.
            </p>
          </div>
          <div className="portal-hero-aside">
            <span>ACCOUNT STATUS</span>
            <strong>ACTIVE</strong>
            <small>Private customer record</small>
          </div>
        </header>

        <section className="portal-workboard">
          <div className="workboard-intro">
            <div>
              <p className="eyebrow">PROJECT WORKBOARD</p>
              <h2>{profileForm.companyName || "Your supply desk"}</h2>
              <p>One view for the requirement, the commercial step and the delivery step.</p>
            </div>
            <Link href="/#quote" className="primary-cta">
              <CirclePlus className="mr-2 size-4" /> Start a request
            </Link>
          </div>
          <div className="workboard-grid">
            <div className="next-action-card">
              <span className="workboard-label">NEXT USEFUL ACTION</span>
              <h3>{nextAction.label}</h3>
              <p>{nextAction.detail}</p>
              <button
                onClick={() =>
                  toast.info(nextAction.action, {
                    description: "This workspace is ready for the next connected workflow.",
                  })
                }
              >
                {nextAction.action} <ArrowRight className="size-4" />
              </button>
            </div>
            <div className="workboard-metric">
              <span>QUOTATIONS</span>
              <strong>{quotations.length}</strong>
              <small>Private requests</small>
            </div>
            <div className="workboard-metric">
              <span>ORDERS</span>
              <strong>{orders.length}</strong>
              <small>Delivery records</small>
            </div>
            <div className="workboard-metric">
              <span>FILES</span>
              <strong>{documents.length}</strong>
              <small>Invoices and documents</small>
            </div>
          </div>
        </section>

        <main className="portal-workspace">
          <div className="portal-two-column">
            <PortalPanel>
              <SectionHeading eyebrow="01 / COMMERCIAL" title="Quotation status" icon={<FileText />} />
              {portal.isLoading ? (
                <Loader2 className="animate-spin text-orange" />
              ) : quotations.length ? (
                <div className="stack-list">
                  {quotations.map((quote) => (
                    <div className="portal-list-row" key={quote.id}>
                      <div>
                        <strong>{quote.reference}</strong>
                        <span>
                          {quote.productName} · {quote.quantity.toLocaleString("en-IN")} units
                        </span>
                      </div>
                      <BadgeStatus label={statusLabels[quote.status] || quote.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FileText />}
                  title="No quotation requests"
                  copy="Start a project request and the commercial trail will appear here."
                />
              )}
              <Link href="/#quote" className="panel-action-link">
                Start a quotation <ArrowRight className="size-4" />
              </Link>
            </PortalPanel>

            <PortalPanel>
              <SectionHeading eyebrow="02 / LOGISTICS" title="Delivery visibility" icon={<PackageSearch />} />
              {orders.length ? (
                <div className="stack-list">
                  {orders.map((order) => (
                    <div className="portal-list-row" key={order.id}>
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <span>{order.trackingNumber || "Tracking will appear after dispatch"}</span>
                      </div>
                      <BadgeStatus label={statusLabels[order.status] || order.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<PackageSearch />}
                  title="No active deliveries"
                  copy="Confirmed orders and tracking details will appear in this lane."
                />
              )}
              <span className="panel-footnote">Status updates are scoped to your account.</span>
            </PortalPanel>
          </div>

          <PortalPanel>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <SectionHeading eyebrow="03 / DOCUMENT CONTROL" title="Invoices & files" icon={<FileText />} />
              <Button
                size="sm"
                onClick={() => setInvoiceModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
              >
                <MessageCircle className="size-3.5" /> Request Invoice on WhatsApp (+91 9512365582)
              </Button>
            </div>
            {documents.length ? (
              <div className="stack-list">
                {documents.map((document) => (
                  <a className="portal-list-row" href={document.fileUrl} key={document.id}>
                    <div>
                      <strong>{document.title}</strong>
                      <span>{document.kind}</span>
                    </div>
                    <ArrowRight className="size-4 text-orange" />
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileText />}
                title="No documents yet"
                copy="Authorized invoices and project files will appear here."
              />
            )}
            <div className="mt-4 pt-3 border-t border-[#e2ecf2] dark:border-[#2b4c68] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6e808b] dark:text-[#b6c8d3]">
              <span>Need an instant Tax Invoice or Proforma for your account?</span>
              <button
                type="button"
                onClick={() => setInvoiceModalOpen(true)}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MessageCircle className="size-3.5" /> Open WhatsApp Billing Desk (+91 9512365582)
              </button>
            </div>
          </PortalPanel>

          <PortalPanel className="profile-panel">
            <SectionHeading eyebrow="04 / ACCOUNT SETTINGS" title="Profile & delivery" icon={<MapPin />} />
            <p className="portal-panel-intro">
              Keep your company, contact and delivery details ready for faster quotation follow-up.
            </p>
            <div className="portal-form-grid">
              <div>
                <Label htmlFor="portal-fullName">Full name</Label>
                <Input
                  id="portal-fullName"
                  value={profileForm.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label htmlFor="portal-mobile">Mobile</Label>
                <Input
                  id="portal-mobile"
                  value={profileForm.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                  placeholder="+91 ..."
                />
              </div>
              <div>
                <Label htmlFor="portal-company">Company</Label>
                <Input
                  id="portal-company"
                  value={profileForm.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="portal-gstin">GSTIN</Label>
                <Input
                  id="portal-gstin"
                  value={profileForm.gstin}
                  onChange={(e) => update("gstin", e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="full-row">
                <Label htmlFor="portal-address">Address</Label>
                <Input
                  id="portal-address"
                  value={profileForm.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Delivery address"
                />
              </div>
              <div>
                <Label htmlFor="portal-city">City</Label>
                <Input
                  id="portal-city"
                  value={profileForm.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Ahmedabad"
                />
              </div>
              <div>
                <Label htmlFor="portal-state">State</Label>
                <Input
                  id="portal-state"
                  value={profileForm.state}
                  onChange={(e) => update("state", e.target.value)}
                  placeholder="Gujarat"
                />
              </div>
              <div>
                <Label htmlFor="portal-pin">PIN code</Label>
                <Input
                  id="portal-pin"
                  value={profileForm.pinCode}
                  onChange={(e) => update("pinCode", e.target.value)}
                  placeholder="380001"
                />
              </div>
              <div>
                <Label htmlFor="portal-delivery">Delivery note</Label>
                <Input
                  id="portal-delivery"
                  value={profileForm.deliveryInstructions}
                  onChange={(e) => update("deliveryInstructions", e.target.value)}
                  placeholder="Optional instruction"
                />
              </div>
            </div>
            <div className="portal-panel-action">
              <Button
                disabled={!profileReady || saveProfile.isPending}
                onClick={() => saveProfile.mutate(profileForm)}
                className="primary-cta"
              >
                <Save className="mr-2 size-4" />{" "}
                {saveProfile.isPending ? "Saving..." : profile ? "Save changes" : "Save profile"}
              </Button>
              {profile && (
                <span className="profile-confirmation">
                  <Check className="size-3" /> Profile active
                </span>
              )}
            </div>
          </PortalPanel>

          {/* Panel 05: Human Support */}
          <PortalPanel className="support-panel">
            <SectionHeading eyebrow="05 / HUMAN ESCALATION" title="Support desk" icon={<Headphones />} />
            <p className="portal-panel-intro">
              Vola can help with approved questions. Use this desk when a person needs to review a technical, delivery, or account-specific detail.
            </p>
            {tickets.length ? (
              <div className="stack-list">
                {tickets.map((ticket) => (
                  <div className="portal-list-row" key={ticket.id}>
                    <div>
                      <strong>{ticket.subject}</strong>
                      <span>{ticket.lastMessage || "Our team has your note."}</span>
                    </div>
                    <BadgeStatus label={ticket.status.replace("_", " ")} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Headphones />}
                title="No support tickets"
                copy="Open a note below and the human support team can take it from here."
              />
            )}
            <div className="support-form">
              <Input
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder="Subject"
                aria-label="Support subject"
              />
              <Input
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="How can we help?"
                aria-label="Support message"
              />
              <Button
                disabled={!supportSubject.trim() || !supportMessage.trim() || openTicket.isPending}
                onClick={() => openTicket.mutate({ subject: supportSubject, message: supportMessage })}
                className="primary-cta"
              >
                {openTicket.isPending ? "Opening..." : "Open support ticket"} <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </PortalPanel>

          {/* Panel 06: Multi-Factor Authentication (MFA) Settings */}
          <PortalPanel className="security-panel">
            <SectionHeading
              eyebrow="06 / ACCOUNT SECURITY"
              title="Multi-Factor Authentication (MFA)"
              icon={<ShieldCheck />}
            />
            <p className="portal-panel-intro">
              Add an additional layer of protection to your customer account. When enabled, signing in requires a 6-digit one-time verification code (OTP) in addition to your password.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#f8fafc] dark:bg-[#173b56] border border-[#e2ecf2] dark:border-[#2b4c68] gap-3">
              <div>
                <strong className="block text-xs font-bold">Two-Step Verification</strong>
                <span className="text-[11px] text-[#6e808b] dark:text-[#b6c8d3]">
                  Status:{" "}
                  {user.mfaEnabled ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Enabled (6-digit OTP required on login)
                    </span>
                  ) : (
                    <span className="text-gray-500">Disabled (Standard password login)</span>
                  )}
                </span>
              </div>
              <Button
                size="sm"
                variant={user.mfaEnabled ? "outline" : "default"}
                disabled={toggleMfaMutation.isPending}
                onClick={() => toggleMfaMutation.mutate({ enabled: !user.mfaEnabled })}
                className={
                  user.mfaEnabled
                    ? "text-xs border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 self-start sm:self-center"
                    : "text-xs bg-[#1d73b7] hover:bg-[#155a90] text-white self-start sm:self-center"
                }
              >
                {toggleMfaMutation.isPending
                  ? "Updating..."
                  : user.mfaEnabled
                  ? "Disable MFA"
                  : "Enable MFA (Recommended)"}
              </Button>
            </div>
          </PortalPanel>
        </main>

        <div className="portal-footer-note">
          <span>VOLAMP / CUSTOMER SYSTEM</span>
          <span>Your private records are scoped to your account.</span>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialAccountType={authModalType}
      />
      <WhatsAppInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        defaultCustomer={profileForm.fullName || user?.name || ""}
        defaultCompany={profileForm.companyName || ""}
      />
    </div>
  );
}

