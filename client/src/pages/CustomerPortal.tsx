import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, FileText, Headphones, Loader2, MapPin, PackageSearch, Save, UserRound } from "lucide-react";

type ProfileForm = { fullName: string; mobile: string; companyName: string; gstin: string; address: string; state: string; city: string; pinCode: string; customerType: "individual" | "contractor" | "dealer" | "distributor" | "business"; preferredCommunication: "email" | "phone" | "whatsapp"; deliveryInstructions: string };

const emptyProfile: ProfileForm = { fullName: "", mobile: "", companyName: "", gstin: "", address: "", state: "", city: "", pinCode: "", customerType: "business", preferredCommunication: "email", deliveryInstructions: "" };
const statusLabels: Record<string, string> = { requested: "Requested", under_review: "Under review", quoted: "Quoted", approved: "Approved", closed: "Closed", received: "Order received", confirmed: "Confirmed", processing: "Processing", packed: "Packed", dispatched: "Dispatched", in_transit: "In transit", delivered: "Delivered", completed: "Completed" };

function SectionHeading({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: ReactNode }) {
  return <div className="portal-section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><span className="portal-heading-icon">{icon}</span></div>;
}

function PortalPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`portal-panel industrial-panel ${className}`}>{children}</section>;
}

export default function CustomerPortal() {
  const { user, loading } = useAuth();
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const portal = trpc.customer.portal.useQuery(undefined, { enabled: Boolean(user) });
  const saveProfile = trpc.customer.saveProfile.useMutation({ onSuccess: () => { toast.success("Profile saved"); portal.refetch(); }, onError: (error) => toast.error(error.message) });
  const openTicket = trpc.customer.openSupportTicket.useMutation({ onSuccess: () => { toast.success("Support ticket opened"); setSupportSubject(""); setSupportMessage(""); portal.refetch(); }, onError: (error) => toast.error(error.message) });

  useEffect(() => {
    if (portal.data?.profile) {
      const saved = portal.data.profile;
      setProfileForm({ ...emptyProfile, fullName: saved.fullName ?? "", mobile: saved.mobile ?? "", companyName: saved.companyName ?? "", gstin: saved.gstin ?? "", address: saved.address ?? "", state: saved.state ?? "", city: saved.city ?? "", pinCode: saved.pinCode ?? "", customerType: saved.customerType, preferredCommunication: saved.preferredCommunication, deliveryInstructions: saved.deliveryInstructions ?? "" });
    }
  }, [portal.data?.profile]);

  if (loading) return <div className="portal-shell industrial-portal portal-loading"><Loader2 className="animate-spin text-orange" /></div>;
  if (!user) return <div className="portal-shell industrial-portal"><div className="portal-login"><Link href="/" className="back-link"><ArrowLeft className="size-4" /> Back to VOLAMP</Link><div className="portal-login-layout"><div><div className="portal-logo"><UserRound /></div><p className="eyebrow">Customer operations / private access</p><h1>A clearer workspace<br /><span>for every project.</span></h1><p>Sign in to access your own quotations, orders, documents, support tickets, and delivery details.</p><Button onClick={startLogin} className="mt-7 primary-cta">Sign in or create account <ArrowRight className="ml-2 size-4" /></Button></div><div className="portal-login-note"><span>VOLAMP / CUSTOMER SYSTEM</span><strong>Your information stays tied to your account.</strong><p>Private records, human follow-up and a clearer path from requirement to delivery.</p></div></div></div></div>;

  const profile = portal.data?.profile;
  const update = (key: keyof ProfileForm, value: string) => setProfileForm((current) => ({ ...current, [key]: value }));
  const profileReady = Boolean(profileForm.fullName.trim());

  return <div className="portal-shell industrial-portal"><div className="portal-container"><div className="portal-topbar"><Link href="/" className="back-link"><ArrowLeft className="size-4" /> Back to VOLAMP</Link><div className="portal-identity"><span className="portal-avatar">{(user.name || user.email || "V").charAt(0).toUpperCase()}</span><span>{user.name || user.email}</span></div></div><header className="portal-hero portal-hero-industrial"><div><p className="eyebrow text-sun">Customer operations / private access</p><h1>Welcome back,<br /><span>{user.name?.split(" ")[0] || "customer"}.</span></h1><p>A structured workspace for requirements, commercial status, documents, delivery, and human support.</p></div><div className="portal-hero-aside"><span>ACCOUNT STATUS</span><strong>ACTIVE</strong><small>Private customer record</small></div></header>

    <div className="portal-overview"><div><span>WORKSPACE</span><strong>Project supply desk</strong></div><div><span>RECORDS</span><strong>{portal.data?.quotations.length ?? 0} quotations · {portal.data?.orders.length ?? 0} orders</strong></div><div><span>SUPPORT</span><strong>Human escalation available</strong></div></div>

    <main className="portal-workspace"><PortalPanel className="profile-panel"><SectionHeading eyebrow="01 / YOUR RECORD" title="Profile & delivery" icon={<MapPin />} /><p className="portal-panel-intro">Keep your company, contact and delivery details ready for faster quotation follow-up.</p><div className="portal-form-grid"><div><Label htmlFor="portal-fullName">Full name</Label><Input id="portal-fullName" value={profileForm.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" /></div><div><Label htmlFor="portal-mobile">Mobile</Label><Input id="portal-mobile" value={profileForm.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="+91 ..." /></div><div><Label htmlFor="portal-company">Company</Label><Input id="portal-company" value={profileForm.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Company name" /></div><div><Label htmlFor="portal-gstin">GSTIN</Label><Input id="portal-gstin" value={profileForm.gstin} onChange={(e) => update("gstin", e.target.value)} placeholder="Optional" /></div><div className="full-row"><Label htmlFor="portal-address">Address</Label><Input id="portal-address" value={profileForm.address} onChange={(e) => update("address", e.target.value)} placeholder="Delivery address" /></div><div><Label htmlFor="portal-city">City</Label><Input id="portal-city" value={profileForm.city} onChange={(e) => update("city", e.target.value)} placeholder="Ahmedabad" /></div><div><Label htmlFor="portal-state">State</Label><Input id="portal-state" value={profileForm.state} onChange={(e) => update("state", e.target.value)} placeholder="Gujarat" /></div><div><Label htmlFor="portal-pin">PIN code</Label><Input id="portal-pin" value={profileForm.pinCode} onChange={(e) => update("pinCode", e.target.value)} placeholder="380001" /></div><div><Label htmlFor="portal-delivery">Delivery note</Label><Input id="portal-delivery" value={profileForm.deliveryInstructions} onChange={(e) => update("deliveryInstructions", e.target.value)} placeholder="Optional instruction" /></div></div><div className="portal-panel-action"><Button disabled={!profileReady || saveProfile.isPending} onClick={() => saveProfile.mutate(profileForm)} className="primary-cta"><Save className="mr-2 size-4" /> {saveProfile.isPending ? "Saving..." : profile ? "Save changes" : "Save profile"}</Button>{profile && <span className="profile-confirmation"><Check className="size-3" /> Profile active</span>}</div></PortalPanel>

      <div className="portal-two-column"><PortalPanel><SectionHeading eyebrow="02 / COMMERCIAL" title="Quotations" icon={<FileText />} />{portal.isLoading ? <Loader2 className="animate-spin text-orange" /> : portal.data?.quotations.length ? <div className="stack-list">{portal.data.quotations.map((quote) => <div className="portal-list-row" key={quote.id}><div><strong>{quote.reference}</strong><span>{quote.productName} · {quote.quantity.toLocaleString("en-IN")} units</span></div><BadgeStatus label={statusLabels[quote.status] || quote.status} /></div>)}</div> : <EmptyState icon={<FileText />} title="No quotations yet" copy="Your requests will appear here once you start a project." />}</PortalPanel><PortalPanel><SectionHeading eyebrow="03 / LOGISTICS" title="Orders & tracking" icon={<PackageSearch />} />{portal.data?.orders.length ? <div className="stack-list">{portal.data.orders.map((order) => <div className="portal-list-row" key={order.id}><div><strong>{order.orderNumber}</strong><span>{order.trackingNumber || "Tracking will appear after dispatch"}</span></div><BadgeStatus label={statusLabels[order.status] || order.status} /></div>)}</div> : <EmptyState icon={<PackageSearch />} title="No orders yet" copy="Confirmed order status and tracking will appear here." />}</PortalPanel></div>

      <PortalPanel><SectionHeading eyebrow="04 / DOCUMENT CONTROL" title="Invoices & files" icon={<FileText />} />{portal.data?.documents.length ? <div className="stack-list">{portal.data.documents.map((document) => <a className="portal-list-row" href={document.fileUrl} key={document.id}><div><strong>{document.title}</strong><span>{document.kind}</span></div><ArrowRight className="size-4 text-orange" /></a>)}</div> : <EmptyState icon={<FileText />} title="No documents yet" copy="Authorized invoices and project files will appear here." />}</PortalPanel>

      <PortalPanel className="support-panel"><SectionHeading eyebrow="05 / HUMAN ESCALATION" title="Support desk" icon={<Headphones />} /><p className="portal-panel-intro">Vola can help with approved questions. Use this desk when a person needs to review a technical, delivery, or account-specific detail.</p>{portal.data?.tickets.length ? <div className="stack-list">{portal.data.tickets.map((ticket) => <div className="portal-list-row" key={ticket.id}><div><strong>{ticket.subject}</strong><span>{ticket.lastMessage || "Our team has your note."}</span></div><BadgeStatus label={ticket.status.replace("_", " ")} /></div>)}</div> : <EmptyState icon={<Headphones />} title="No support tickets" copy="Open a note below and the human support team can take it from here." />}<div className="support-form"><Input value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} placeholder="Subject" aria-label="Support subject" /><Input value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="How can we help?" aria-label="Support message" /><Button disabled={!supportSubject.trim() || !supportMessage.trim() || openTicket.isPending} onClick={() => openTicket.mutate({ subject: supportSubject, message: supportMessage })} className="primary-cta">{openTicket.isPending ? "Opening..." : "Open support ticket"} <ArrowRight className="ml-2 size-4" /></Button></div></PortalPanel></main>
    <div className="portal-footer-note"><span>VOLAMP / CUSTOMER SYSTEM</span><span>Your private records are scoped to your account.</span></div></div></div>;
}

function BadgeStatus({ label }: { label: string }) { return <span className="status-badge">{label}</span>; }
function EmptyState({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) { return <div className="empty-state"><span>{icon}</span><strong>{title}</strong><p>{copy}</p></div>; }
