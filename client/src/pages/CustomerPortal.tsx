import { useEffect, useState } from "react";
import { Link } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Check, FileText, Headphones, Loader2, MapPin, PackageSearch, Save, UserRound } from "lucide-react";

type ProfileForm = { fullName: string; mobile: string; companyName: string; gstin: string; address: string; state: string; city: string; pinCode: string; customerType: "individual" | "contractor" | "dealer" | "distributor" | "business"; preferredCommunication: "email" | "phone" | "whatsapp"; deliveryInstructions: string };

const emptyProfile: ProfileForm = {
  fullName: "", mobile: "", companyName: "", gstin: "", address: "", state: "", city: "", pinCode: "", customerType: "business", preferredCommunication: "email", deliveryInstructions: "",
};

const statusLabels: Record<string, string> = { requested: "Requested", under_review: "Under review", quoted: "Quoted", approved: "Approved", closed: "Closed", received: "Order received", confirmed: "Confirmed", processing: "Processing", packed: "Packed", dispatched: "Dispatched", in_transit: "In transit", delivered: "Delivered", completed: "Completed" };

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

  if (loading) return <div className="portal-shell"><Loader2 className="animate-spin text-orange" /></div>;
  if (!user) return <div className="portal-shell"><div className="portal-login"><Link href="/" className="back-link"><ArrowLeft className="size-4" /> Back to VOLTAMP</Link><div className="portal-logo"><UserRound /></div><p className="eyebrow">Customer portal</p><h1>Everything you need,<br /><span>in one bright place.</span></h1><p>Sign in to access your own quotations, orders, documents, support tickets, and delivery details.</p><Button onClick={startLogin} className="mt-7 rounded-full bg-orange px-6 py-6 font-black text-white hover:bg-orange/90">Sign in or create account <ArrowLeft className="ml-2 size-4 rotate-180" /></Button></div></div>;

  const profile = portal.data?.profile;
  const update = (key: keyof typeof emptyProfile, value: string) => setProfileForm((current) => ({ ...current, [key]: value }));
  const profileReady = Boolean(profileForm.fullName.trim());

  return <div className="portal-shell"><div className="container max-w-6xl py-8 md:py-12"><div className="flex flex-wrap items-center justify-between gap-4"><Link href="/" className="back-link"><ArrowLeft className="size-4" /> Back to VOLTAMP</Link><div className="flex items-center gap-3 text-sm font-bold"><span className="portal-avatar">{(user.name || user.email || "V").charAt(0).toUpperCase()}</span>{user.name || user.email}</div></div><div className="portal-hero"><div><p className="eyebrow text-sun">Your private customer space</p><h1>Welcome back,<br /><span>{user.name?.split(" ")[0] || "bright mind"}.</span></h1><p>Keep your project moving without the paperwork shuffle.</p></div><div className="portal-hero-icon"><PackageSearch className="size-12" /></div></div>

    <div className="portal-grid"><section className="portal-panel profile-panel"><div className="panel-heading"><div><p className="eyebrow">Your details</p><h2>Profile & delivery</h2></div><MapPin className="text-orange" /></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="portal-fullName">Full name</Label><Input id="portal-fullName" value={profileForm.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Your full name" /></div><div><Label htmlFor="portal-mobile">Mobile</Label><Input id="portal-mobile" value={profileForm.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="+91 ..." /></div><div><Label htmlFor="portal-company">Company</Label><Input id="portal-company" value={profileForm.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Company name" /></div><div><Label htmlFor="portal-gstin">GSTIN</Label><Input id="portal-gstin" value={profileForm.gstin} onChange={(e) => update("gstin", e.target.value)} placeholder="Optional" /></div><div className="sm:col-span-2"><Label htmlFor="portal-address">Address</Label><Input id="portal-address" value={profileForm.address} onChange={(e) => update("address", e.target.value)} placeholder="Delivery address" /></div><div><Label htmlFor="portal-city">City</Label><Input id="portal-city" value={profileForm.city} onChange={(e) => update("city", e.target.value)} placeholder="Ahmedabad" /></div><div><Label htmlFor="portal-state">State</Label><Input id="portal-state" value={profileForm.state} onChange={(e) => update("state", e.target.value)} placeholder="Gujarat" /></div><div><Label htmlFor="portal-pin">PIN code</Label><Input id="portal-pin" value={profileForm.pinCode} onChange={(e) => update("pinCode", e.target.value)} placeholder="380001" /></div><div><Label htmlFor="portal-delivery">Delivery note</Label><Input id="portal-delivery" value={profileForm.deliveryInstructions} onChange={(e) => update("deliveryInstructions", e.target.value)} placeholder="Optional instruction" /></div></div><Button disabled={!profileReady || saveProfile.isPending} onClick={() => saveProfile.mutate(profileForm)} className="mt-5 rounded-full bg-brown px-5 font-black text-white hover:bg-brown/90"><Save className="mr-2 size-4" /> {saveProfile.isPending ? "Saving..." : profile ? "Save changes" : "Save profile"}</Button>{profile && <span className="ml-3 text-xs font-bold text-orange"><Check className="mr-1 inline size-3" /> Profile active</span>}</section>

      <section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Your requests</p><h2>Quotations</h2></div><FileText className="text-orange" /></div>{portal.isLoading ? <Loader2 className="animate-spin text-orange" /> : portal.data?.quotations.length ? <div className="stack-list">{portal.data.quotations.map((quote) => <div className="portal-list-row" key={quote.id}><div><strong>{quote.reference}</strong><span>{quote.productName} · {quote.quantity.toLocaleString("en-IN")} units</span></div><BadgeStatus label={statusLabels[quote.status] || quote.status} /></div>)}</div> : <EmptyState icon={<FileText />} title="No quotations yet" copy="Your quotation requests will appear here once you start a project." />}</section>

      <section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Keep an eye on progress</p><h2>Orders & tracking</h2></div><PackageSearch className="text-orange" /></div>{portal.data?.orders.length ? <div className="stack-list">{portal.data.orders.map((order) => <div className="portal-list-row" key={order.id}><div><strong>{order.orderNumber}</strong><span>{order.trackingNumber || "Tracking will appear after dispatch"}</span></div><BadgeStatus label={statusLabels[order.status] || order.status} /></div>)}</div> : <EmptyState icon={<PackageSearch />} title="No orders yet" copy="When an order is confirmed, its status and tracking details will live here." />}</section>

      <section className="portal-panel"><div className="panel-heading"><div><p className="eyebrow">Your documents</p><h2>Invoices & files</h2></div><FileText className="text-orange" /></div>{portal.data?.documents.length ? <div className="stack-list">{portal.data.documents.map((document) => <a className="portal-list-row" href={document.fileUrl} key={document.id}><div><strong>{document.title}</strong><span>{document.kind}</span></div><ArrowLeft className="size-4 rotate-180 text-orange" /></a>)}</div> : <EmptyState icon={<FileText />} title="No documents yet" copy="Authorized invoices and project files will appear here." />}</section>

      <section className="portal-panel support-panel"><div className="panel-heading"><div><p className="eyebrow">Need a human?</p><h2>Support desk</h2></div><Headphones className="text-orange" /></div>{portal.data?.tickets.length ? <div className="stack-list">{portal.data.tickets.map((ticket) => <div className="portal-list-row" key={ticket.id}><div><strong>{ticket.subject}</strong><span>{ticket.lastMessage || "Our team has your note."}</span></div><BadgeStatus label={ticket.status.replace("_", " ")} /></div>)}</div> : <EmptyState icon={<Headphones />} title="No support tickets" copy="Ask Volt first, or leave a note for the human support team below." />}<div className="mt-6 grid gap-3 sm:grid-cols-[.8fr_1.2fr]"><Input value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} placeholder="Subject" aria-label="Support subject" /><Input value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="How can we help?" aria-label="Support message" /></div><Button disabled={!supportSubject.trim() || !supportMessage.trim() || openTicket.isPending} onClick={() => openTicket.mutate({ subject: supportSubject, message: supportMessage })} className="mt-3 rounded-full bg-orange font-black text-white hover:bg-orange/90">{openTicket.isPending ? "Opening..." : "Open support ticket"}</Button></section>
    </div></div></div>;
}

function BadgeStatus({ label }: { label: string }) { return <span className="status-badge">{label}</span>; }
function EmptyState({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <div className="empty-state"><span>{icon}</span><strong>{title}</strong><p>{copy}</p></div>; }
