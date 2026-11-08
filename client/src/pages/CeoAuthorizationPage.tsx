import React, { useState, useEffect } from "react";
import { Link, useSearch, useLocation } from "wouter";
import SeoHead from "@/components/seo/SeoHead";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeAlert,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Mail,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";

export default function CeoAuthorizationPage() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, logout, refresh } = useAuth();

  // Parse URL search parameters
  const params = new URLSearchParams(searchString);
  const token = params.get("token") || "";
  const employeeEmail = params.get("employeeEmail") || "";
  const initialAction = params.get("action") === "reject" ? "reject" : "approve";

  // Selected decision state
  const [selectedDecision, setSelectedDecision] = useState<"approve" | "reject">(initialAction);
  const [remarks, setRemarks] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [decisionCompleted, setDecisionCompleted] = useState<{
    decision: "approve" | "reject";
    employeeName: string;
    employeeEmail: string;
    decidedAt: string;
    decidedBy: string;
  } | null>(null);

  // CEO Inline Auth State (if CEO is not signed in)
  const [ceoEmail, setCeoEmail] = useState("ceo@volampelektrikals.com");
  const [ceoPassword, setCeoPassword] = useState("");
  const [ceoOtpCode, setCeoOtpCode] = useState("");
  const [mfaPendingToken, setMfaPendingToken] = useState<string | null>(null);
  const [ceoAuthStep, setCeoAuthStep] = useState<"credentials" | "mfa">("credentials");

  const isCeo =
    user?.email?.toLowerCase() === "ceo@volampelektrikals.com" ||
    user?.email?.toLowerCase() === "admin@volampelektrikals.com" ||
    (user?.role === "admin" && user?.accountType === "employee");

  // Query token info
  const tokenInfoQuery = trpc.employee.getApprovalRequestInfo.useQuery(
    {
      token: token || undefined,
      employeeEmail: employeeEmail || undefined,
    },
    {
      enabled: Boolean(token || employeeEmail),
      retry: false,
    }
  );

  // Mutations
  const processDecisionMutation = trpc.employee.processCeoDecision.useMutation({
    onSuccess: (data) => {
      setDecisionCompleted({
        decision: data.decision,
        employeeName: data.employeeName || "Employee",
        employeeEmail: data.employeeEmail || "",
        decidedAt: new Date(data.decidedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        decidedBy: data.decidedBy,
      });
      setIsConfirmOpen(false);
      tokenInfoQuery.refetch();
      toast.success(
        data.decision === "approve"
          ? "Employee Account Authorized & Activated!"
          : "Employee Registration Rejected",
        {
          description: `Decision recorded. Official email notification dispatched.`,
        }
      );
    },
    onError: (err) => {
      toast.error("Decision Processing Error", { description: err.message });
    },
  });

  const ceoLoginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.mfaRequired) {
        setMfaPendingToken(data.mfaPendingToken);
        setCeoOtpCode("");
        toast.info("CEO MFA Required", {
          description: "A 6-digit verification code has been dispatched to ceo@volampelektrikals.com.",
        });
        setCeoAuthStep("mfa");
      } else {
        refresh();
        toast.success("CEO Authenticated");
      }
    },
    onError: (err) => {
      toast.error("CEO Authentication Failed", { description: err.message });
    },
  });

  const ceoMfaMutation = trpc.auth.verifyMfaOtp.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("CEO MFA Verified Successfully");
    },
    onError: (err) => {
      toast.error("MFA Verification Failed", { description: err.message });
    },
  });

  const handleCeoLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ceoLoginMutation.mutate({
      email: ceoEmail.trim().toLowerCase(),
      password: ceoPassword,
    });
  };

  const handleCeoMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaPendingToken || ceoOtpCode.length !== 6) return;
    ceoMfaMutation.mutate({
      mfaPendingToken,
      code: ceoOtpCode.trim(),
    });
  };

  const handleExecuteDecision = () => {
    if (!token && !employeeEmail) return;
    processDecisionMutation.mutate({
      token: token || undefined,
      employeeEmail: employeeEmail || undefined,
      decision: selectedDecision,
      reason: remarks.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#071b2d] text-[#0f172a] dark:text-slate-100 flex flex-col justify-between">
      <SeoHead
        title="CEO Authorization Desk • VOLAMP ELEKTRIKALS PVT. LTD."
        description="Executive leadership employee registration review and authorization desk."
        noindex={true}
      />

      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c2438]/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#102a40] to-[#0f3f63] flex items-center justify-center text-white font-black text-sm shadow-sm">
              V
            </div>
            <div>
              <div className="text-base font-black tracking-wider text-[#102a40] dark:text-white uppercase">
                VOLAMP <span className="text-[#f59e0b]">ELEKTRIKALS</span>
              </div>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase -mt-0.5">
                Executive Leadership Desk
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300 hidden sm:inline">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <LogOut className="size-3.5 mr-1" /> Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/employee-portal">
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  Employee Portal
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 w-full flex-1">
        {/* Token and employee email not supplied */}
        {!token && !employeeEmail && (
          <div className="bg-white dark:bg-[#102b42] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-lg">
            <div className="size-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="size-7" />
            </div>
            <h1 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif]">
              Missing Authorization Token
            </h1>
            <p className="text-xs text-slate-500 mt-2 mb-6 max-w-md mx-auto">
              Please open this page using the direct authorization link received at{" "}
              <strong>ceo@volampelektrikals.com</strong>, or manage authorizations directly in the Employee Portal.
            </p>
            <Link href="/employee-portal?tab=governance">
              <Button className="bg-[#1d73b7] text-white text-xs font-semibold">
                Go to Executive Governance Portal &rarr;
              </Button>
            </Link>
          </div>
        )}

        {/* Loading Token Info */}
        {(token || employeeEmail) && tokenInfoQuery.isLoading && (
          <div className="bg-white dark:bg-[#102b42] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-lg">
            <RefreshCw className="size-8 text-[#1d73b7] animate-spin mx-auto mb-4" />
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">
              Validating Security Authorization Token...
            </h2>
            <p className="text-xs text-slate-400 mt-1">Connecting to VOLAMP cryptographic ledger.</p>
          </div>
        )}

        {/* Invalid or Expired Token Alert */}
        {(token || employeeEmail) && tokenInfoQuery.data && !tokenInfoQuery.data.valid && (
          <div className="bg-white dark:bg-[#102b42] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xl">
            <div className="size-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-900">
              <ShieldAlert className="size-8" />
            </div>

            <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-red-600 dark:text-red-400">
              {tokenInfoQuery.data.alreadyUsed
                ? "Link Already Processed"
                : tokenInfoQuery.data.expired
                ? "Authorization Link Expired (24h Limit)"
                : "Invalid Authorization Link"}
            </h1>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 mb-6 max-w-lg mx-auto leading-relaxed">
              {tokenInfoQuery.data.error}
            </p>

            {tokenInfoQuery.data.alreadyUsed && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-left max-w-md mx-auto mb-6 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Processed Timestamp:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {new Date(tokenInfoQuery.data.usedAt!).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Processed By:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {tokenInfoQuery.data.usedBy || "Executive Administration"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Link href="/employee-portal">
                <Button className="bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold">
                  Open Employee Portal Dashboard <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Valid Token Card */}
        {(token || employeeEmail) && tokenInfoQuery.data && tokenInfoQuery.data.valid && (
          <div className="space-y-6">
            {/* Step 1: Check CEO Authentication */}
            {!isCeo ? (
              <div className="bg-white dark:bg-[#102b42] rounded-2xl border border-amber-300 dark:border-amber-800 shadow-xl overflow-hidden p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                    <Lock className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#102a40] dark:text-white">
                      CEO Authentication Required
                    </h2>
                    <p className="text-xs text-slate-500">
                      Per company security rules, only the authorized CEO account (<strong className="text-slate-800 dark:text-slate-200">ceo@volampelektrikals.com</strong>) with multi-factor authentication can authorize or reject employee accounts.
                    </p>
                  </div>
                </div>

                {/* Form to log in as CEO directly */}
                {ceoAuthStep === "credentials" ? (
                  <form onSubmit={handleCeoLoginSubmit} className="space-y-4 max-w-md mx-auto pt-4">
                    <div>
                      <Label htmlFor="ceo-auth-email" className="text-xs font-bold">
                        CEO Email Address
                      </Label>
                      <Input
                        id="ceo-auth-email"
                        type="email"
                        required
                        value={ceoEmail}
                        onChange={(e) => setCeoEmail(e.target.value)}
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ceo-auth-pwd" className="text-xs font-bold">
                        Executive Password
                      </Label>
                      <Input
                        id="ceo-auth-pwd"
                        type="password"
                        required
                        value={ceoPassword}
                        onChange={(e) => setCeoPassword(e.target.value)}
                        placeholder="••••••••"
                        className="mt-1 text-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={ceoLoginMutation.isPending}
                      className="w-full bg-[#102a40] hover:bg-[#0a1f33] text-white text-xs font-bold h-11"
                    >
                      {ceoLoginMutation.isPending ? "Authenticating..." : "Sign In with CEO Credentials"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleCeoMfaSubmit} className="space-y-4 max-w-sm mx-auto pt-4 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Enter the 6-digit MFA verification code sent to <strong>{ceoEmail}</strong>:
                    </p>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={ceoOtpCode}
                        onChange={(val) => setCeoOtpCode(val)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      type="submit"
                      disabled={ceoMfaMutation.isPending || ceoOtpCode.length !== 6}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-11"
                    >
                      {ceoMfaMutation.isPending ? "Verifying..." : "Verify MFA & Unlock Authorization"}
                    </Button>
                  </form>
                )}
              </div>
            ) : decisionCompleted ? (
              /* Success Certificate View */
              <div className="bg-white dark:bg-[#102b42] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center">
                <div
                  className={`size-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
                    decisionCompleted.decision === "approve"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-950/40 text-red-600 border-red-200 dark:border-red-800"
                  }`}
                >
                  {decisionCompleted.decision === "approve" ? (
                    <CheckCircle2 className="size-8" />
                  ) : (
                    <UserX className="size-8" />
                  )}
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 border ${
                    decisionCompleted.decision === "approve"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 border-emerald-200"
                      : "bg-red-50 dark:bg-red-950/40 text-red-700 border-red-200"
                  }`}
                >
                  {decisionCompleted.decision === "approve" ? "ACCOUNT ACTIVATED" : "REGISTRATION REJECTED"}
                </div>

                <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                  {decisionCompleted.decision === "approve"
                    ? `Employee Access Authorized for ${decisionCompleted.employeeName}`
                    : `Registration Rejected for ${decisionCompleted.employeeName}`}
                </h1>

                <p className="text-xs text-slate-500 mt-2 mb-6 max-w-md mx-auto leading-relaxed">
                  The decision was recorded in the company audit log and an automated decision notification email was dispatched to{" "}
                  <strong>{decisionCompleted.employeeEmail}</strong>.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-left max-w-md mx-auto mb-6 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Authorized Employee:</span>
                    <span className="font-semibold">{decisionCompleted.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Decided By:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{decisionCompleted.decidedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Decision Timestamp:</span>
                    <span className="font-mono">{decisionCompleted.decidedAt} IST</span>
                  </div>
                </div>

                <Link href="/employee-portal">
                  <Button className="bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold">
                    Return to Employee Operations Portal &rarr;
                  </Button>
                </Link>
              </div>
            ) : (
              /* Review & Authorization Decision Interface */
              <div className="bg-white dark:bg-[#102b42] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0a1f33] via-[#102a40] to-[#1e4e75] px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wider uppercase border border-emerald-400/30">
                      <ShieldCheck className="size-3.5" /> Authenticated as CEO
                    </div>
                    <span className="text-xs text-slate-300 font-mono">
                      Single-Use 24h Token Active
                    </span>
                  </div>
                  <h1 className="text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] mt-2">
                    Executive Review: Employee Account Authorization
                  </h1>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Carefully review the employee dossier below before making an explicit decision.
                  </p>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Dossier Card */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                      <User className="size-3.5 text-[#1d73b7]" /> Employee Candidate Dossier
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-0.5 font-medium">Employee Full Name</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {tokenInfoQuery.data.employee.name}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-0.5 font-medium">Official Company Email</span>
                        <span className="text-sm font-mono font-bold text-[#1d73b7] dark:text-[#38bdf8]">
                          {tokenInfoQuery.data.employee.email}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-0.5 font-medium">Department</span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {tokenInfoQuery.data.employee.department}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-0.5 font-medium">Job Designation</span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {tokenInfoQuery.data.employee.designation}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-0.5 font-medium">Employee ID</span>
                        <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {tokenInfoQuery.data.employee.employeeId}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-0.5 font-medium">Email Verification</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                          <CheckCircle2 className="size-3" /> Verified via OTP
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-0.5 font-medium">Registration Timestamp</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                          {new Date(tokenInfoQuery.data.employee.createdAt).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                          })}{" "}
                          IST
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-0.5 font-medium">Current Status</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 text-[11px] font-bold">
                          <Clock className="size-3" /> {tokenInfoQuery.data.employee.currentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Decision Selection Tabs */}
                  <div>
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                      Select Authorization Action:
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedDecision("approve")}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selectedDecision === "approve"
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 shadow-sm"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-4" /> Approve Employee
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Activate official access to the Employee Operations Portal and send welcome credentials.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDecision("reject")}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selectedDecision === "reject"
                            ? "border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-900 dark:text-red-200 shadow-sm"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-sm text-red-600 dark:text-red-400">
                          <UserX className="size-4" /> Reject Registration
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          Decline access to employee systems and send formal notice to the registrant.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Remarks Input */}
                  <div>
                    <Label htmlFor="ceo-remarks" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Executive Remarks / Notes <span className="text-slate-400 font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      id="ceo-remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder={
                        selectedDecision === "approve"
                          ? "e.g. Authorized for Vadodara HT cables engineering plant"
                          : "e.g. Identity could not be matched against current payroll roster"
                      }
                      className="mt-1.5 text-xs h-20"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setIsConfirmOpen(true)}
                      className={`flex-1 h-12 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                        selectedDecision === "approve"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                    >
                      {selectedDecision === "approve" ? (
                        <>
                          <CheckCircle2 className="size-4" /> Finalize Employee Approval
                        </>
                      ) : (
                        <>
                          <UserX className="size-4" /> Finalize Employee Rejection
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#102b42] rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
              <div
                className={`size-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                  selectedDecision === "approve"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {selectedDecision === "approve" ? (
                  <CheckCircle2 className="size-7" />
                ) : (
                  <AlertTriangle className="size-7" />
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif]">
                {selectedDecision === "approve"
                  ? "Confirm Employee Authorization?"
                  : "Confirm Employee Rejection?"}
              </h3>
              <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
                {selectedDecision === "approve"
                  ? `You are about to authorize official portal access for ${tokenInfoQuery.data?.employee?.name} (${tokenInfoQuery.data?.employee?.email}). This action will activate their account immediately.`
                  : `You are about to reject the registration for ${tokenInfoQuery.data?.employee?.name} (${tokenInfoQuery.data?.employee?.email}). Their access will remain locked.`}
              </p>

              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExecuteDecision}
                  disabled={processDecisionMutation.isPending}
                  className={`flex-1 text-xs font-bold text-white ${
                    selectedDecision === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {processDecisionMutation.isPending ? "Processing..." : "Confirm & Execute"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          VOLAMP ELEKTRIKALS PVT. LTD. &bull; Corporate Headquarters, Vadodara, Gujarat, India
          <br />
          Executive Authorization Contact:{" "}
          <a href="mailto:ceo@volampelektrikals.com" className="text-[#1d73b7] underline">
            ceo@volampelektrikals.com
          </a>
        </p>
      </footer>
    </div>
  );
}

