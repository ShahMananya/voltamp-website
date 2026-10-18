import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  X,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Save,
  Check,
  LogOut,
  ExternalLink,
  Boxes,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const STOCK_CHECK_URL =
  "https://script.google.com/macros/s/AKfycby_LZjD_6KFK33CCaCrV4Xxgbav0HceiHg1YL0U1iVEnnHMHYbrdXIFhwRILa8VFuuV/exec";
const EMPLOYEE_WORKSPACE_URL =
  "https://script.google.com/macros/s/AKfycbwgYP4k3qFbgwxfsaXqcHzBIZyyOknjPDPqBoeT0FvEchs8sY8FMT-A_tcQ2TF_qTQF/exec";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const utils = trpc.useUtils();

  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [activeTab, setActiveTab] = useState<"profile" | "shortcuts">("profile");

  const portalQuery = trpc.customer.portal.useQuery(undefined, {
    enabled: isOpen && Boolean(user) && user?.accountType === "customer",
  });

  const saveMutation = trpc.customer.saveProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile saved successfully!", {
        description: "Your business and delivery details have been updated.",
      });
      utils.customer.portal.invalidate();
      utils.auth.me.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to save profile", { description: err.message });
    },
  });

  useEffect(() => {
    if (portalQuery.data?.profile) {
      const p = portalQuery.data.profile;
      setForm({
        fullName: p.fullName || user?.name || "",
        mobile: p.mobile || "",
        companyName: p.companyName || "",
        gstin: p.gstin || "",
        address: p.address || "",
        state: p.state || "",
        city: p.city || "",
        pinCode: p.pinCode || "",
        customerType: p.customerType || "business",
        preferredCommunication: p.preferredCommunication || "email",
        deliveryInstructions: p.deliveryInstructions || "",
      });
    } else if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
      }));
    }
  }, [portalQuery.data?.profile, user]);

  if (!isOpen || !user) return null;

  const isEmployee = user.accountType === "employee";

  const updateField = (key: keyof ProfileForm, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    saveMutation.mutate(form);
  };

  const handleLogout = async () => {
    await logout();
    toast.info("Logged out successfully");
    onClose();
    setLocation("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0f1f2e] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#102a40] to-[#1d405e] text-white">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[#c56718] text-white flex items-center justify-center font-bold text-base shadow-inner">
              {(user.name || user.email || "V").charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="profile-modal-title" className="text-base sm:text-lg font-bold leading-tight">
                  {user.name || (isEmployee ? "VOLAMP Employee" : "Customer Account")}
                </h2>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    isEmployee
                      ? "bg-purple-500/20 text-purple-200 border border-purple-400/30"
                      : "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                  }`}
                >
                  {isEmployee ? "Employee" : "Customer"}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Quick Actions Strip */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-[#132537] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {isEmployee ? (
              <a
                href={EMPLOYEE_WORKSPACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs"
              >
                <Briefcase className="size-3.5" />
                <span>Open Employee Workspace</span>
                <ExternalLink className="size-3 opacity-80" />
              </a>
            ) : (
              <a
                href={STOCK_CHECK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0d6e6e] hover:bg-[#0a5252] text-white transition-colors shadow-xs"
              >
                <Boxes className="size-3.5" />
                <span>Check Live Stock</span>
                <ExternalLink className="size-3 opacity-80" />
              </a>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                setLocation(isEmployee ? "/employee-portal" : "/portal");
              }}
              className="text-xs font-semibold h-8"
            >
              <FileText className="size-3.5 mr-1" />
              <span>{isEmployee ? "Employee Portal" : "Orders & Quotes"}</span>
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8"
          >
            <LogOut className="size-3.5 mr-1" /> Sign Out
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isEmployee ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-sm">
                  <ShieldCheck className="size-4 text-purple-600" />
                  Official Corporate Account
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                  You are authenticated with official VOLAMP credentials (<code>@volampelektrikals.com</code>). You
                  have access to employee-only procurement, catalog commit tools, and operations workspaces.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={EMPLOYEE_WORKSPACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#172b3c] hover:border-purple-400 transition-all flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    <Briefcase className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-purple-600">
                      Corporate Workspace <ExternalLink className="size-3" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Open live ERP Google Apps Script workspace for inventory and commercial records.
                    </p>
                  </div>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setLocation("/employee-portal");
                  }}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#172b3c] hover:border-purple-400 transition-all text-left flex items-start gap-3 group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 group-hover:text-blue-600">
                      Employee Operations Portal <ArrowRight className="size-3" />
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Review incoming enquiries, complaints dossiers, press requests, and product catalog sync.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile & Delivery Details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add or update your company and project delivery information.
                  </p>
                </div>
                {portalQuery.data?.profile && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <Check className="size-3" /> Profile Active
                  </span>
                )}
              </div>

              {portalQuery.isLoading ? (
                <div className="py-12 flex items-center justify-center text-slate-400">
                  <Loader2 className="size-6 animate-spin text-[#c56718]" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <Label htmlFor="prof-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="prof-name"
                        value={form.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        placeholder="e.g. Anand Verma"
                        className="mt-1 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="prof-mobile" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Mobile / WhatsApp Number
                      </Label>
                      <Input
                        id="prof-mobile"
                        value={form.mobile}
                        onChange={(e) => updateField("mobile", e.target.value)}
                        placeholder="+91 98220 54321"
                        className="mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="prof-company" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Company / Contractor Entity
                      </Label>
                      <Input
                        id="prof-company"
                        value={form.companyName}
                        onChange={(e) => updateField("companyName", e.target.value)}
                        placeholder="e.g. Apex Electrotech Ltd."
                        className="mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="prof-gstin" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        GSTIN (for Tax Invoices)
                      </Label>
                      <Input
                        id="prof-gstin"
                        value={form.gstin}
                        onChange={(e) => updateField("gstin", e.target.value)}
                        placeholder="24AAAAA0000A1Z5"
                        className="mt-1 text-xs uppercase"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="prof-address" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Site / Delivery Address
                      </Label>
                      <Input
                        id="prof-address"
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="Plot No., Industrial Zone, Road, Landmark"
                        className="mt-1 text-xs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="prof-city" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        City
                      </Label>
                      <Input
                        id="prof-city"
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Ahmedabad / Vadodara"
                        className="mt-1 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="prof-state" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          State
                        </Label>
                        <Input
                          id="prof-state"
                          value={form.state}
                          onChange={(e) => updateField("state", e.target.value)}
                          placeholder="Gujarat"
                          className="mt-1 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prof-pin" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          PIN Code
                        </Label>
                        <Input
                          id="prof-pin"
                          value={form.pinCode}
                          onChange={(e) => updateField("pinCode", e.target.value)}
                          placeholder="380001"
                          className="mt-1 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="prof-type" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Business Entity Type
                      </Label>
                      <select
                        id="prof-type"
                        value={form.customerType}
                        onChange={(e) => updateField("customerType", e.target.value as any)}
                        className="mt-1 w-full h-9 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#172b3c] px-3 py-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c56718]"
                      >
                        <option value="business">Industrial Business / Enterprise</option>
                        <option value="contractor">EPC / Electrical Contractor</option>
                        <option value="dealer">Authorized Dealer / Retailer</option>
                        <option value="distributor">Regional Distributor</option>
                        <option value="individual">Individual Buyer</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="prof-comm" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Preferred Communication
                      </Label>
                      <select
                        id="prof-comm"
                        value={form.preferredCommunication}
                        onChange={(e) => updateField("preferredCommunication", e.target.value as any)}
                        className="mt-1 w-full h-9 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#172b3c] px-3 py-1 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c56718]"
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="phone">Phone Call</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="prof-notes" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Delivery & Unloading Instructions (Optional)
                      </Label>
                      <Input
                        id="prof-notes"
                        value={form.deliveryInstructions}
                        onChange={(e) => updateField("deliveryInstructions", e.target.value)}
                        placeholder="e.g. Crane required for unloading drum; delivery between 9 AM - 6 PM"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onClose}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveMutation.isPending || !form.fullName.trim()}
                      className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold px-4 cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="size-3.5" />
                          <span>Save Profile Details</span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
