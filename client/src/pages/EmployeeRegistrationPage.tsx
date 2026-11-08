import React, { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import SeoHead from "@/components/seo/SeoHead";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FileCheck2,
  HelpCircle,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";

const DEPARTMENTS = [
  "CEO",
  "CEO & Executive Leadership",
  "Executive Office (Office of the CEO)",
  "Engineering",
  "Quality Assurance",
  "Production & Testing",
  "Sales & Marketing",
  "Supply Chain & Logistics",
  "Finance & Accounts",
  "Human Resources",
  "Customer Operations",
  "Maintenance & Facilities",
  "IT & Systems",
];

export default function EmployeeRegistrationPage() {
  const [, setLocation] = useLocation();

  // Wizard Step: "register" | "verify_otp" | "pending_ceo"
  const [step, setStep] = useState<"register" | "verify_otp" | "pending_ceo">("register");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Domain validation in real-time
  const domainValidation = useMemo(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) return { valid: false, message: null };
    const parts = trimmed.split("@");
    const domain = parts[1];
    if (domain === "volampelektrikals.com") {
      return { valid: true, message: "Valid company domain @volampelektrikals.com" };
    }
    const publicDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "rediffmail.com"];
    if (publicDomains.includes(domain)) {
      return {
        valid: false,
        message: "Personal email addresses are strictly prohibited. You must use your @volampelektrikals.com company address.",
      };
    }
    return {
      valid: false,
      message: `Domain @${domain} is not authorized. Must be @volampelektrikals.com.`,
    };
  }, [email]);

  // Password Strength Checklist
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      matches: password.length > 0 && password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const isPasswordValid =
    passwordCriteria.length &&
    passwordCriteria.uppercase &&
    passwordCriteria.lowercase &&
    passwordCriteria.number &&
    passwordCriteria.special;

  // tRPC Mutations
  const registerMutation = trpc.auth.registerEmployee.useMutation({
    onSuccess: (data) => {
      setRegisteredEmail(data.email || email.trim().toLowerCase());
      setOtpCode("");
      toast.success("Verification Code Dispatched", {
        description: `A 6-digit confirmation code was sent to ${data.email}.`,
      });
      setStep("verify_otp");
    },
    onError: (err) => {
      toast.error("Registration Error", { description: err.message });
    },
  });

  const verifyOtpMutation = trpc.auth.verifyEmailOtp.useMutation({
    onSuccess: (data) => {
      toast.success("Email Verified Successfully!", {
        description: "Registration dossier forwarded to ceo@volampelektrikals.com for authorization.",
      });
      setStep("pending_ceo");
    },
    onError: (err) => {
      toast.error("Verification Failed", { description: err.message });
    },
  });

  const resendOtpMutation = trpc.auth.resendEmailVerificationOtp.useMutation({
    onSuccess: () => {
      setOtpCode("");
      toast.success("Code Resent", {
        description: `A fresh 6-digit verification code has been dispatched.`,
      });
    },
    onError: (err) => {
      toast.error("Resend Failed", { description: err.message });
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!domainValidation.valid) {
      toast.error("Invalid Company Email", {
        description: "Only official @volampelektrikals.com email addresses are permitted.",
      });
      return;
    }

    if (!isPasswordValid) {
      toast.error("Weak Password", {
        description: "Password must meet all 5 security criteria (8+ chars, upper, lower, number, special).",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password Mismatch", {
        description: "Password and Confirm Password do not match.",
      });
      return;
    }

    if (!termsAccepted) {
      toast.error("Agreement Required", {
        description: "Please accept company employment guidelines and IT security terms.",
      });
      return;
    }

    registerMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      employeeId: employeeId.trim() || undefined,
      department: department.trim(),
      designation: designation.trim(),
      password,
      termsAccepted: true,
    });
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error("Incomplete Code", { description: "Please enter all 6 digits of the verification code." });
      return;
    }
    verifyOtpMutation.mutate({
      email: registeredEmail,
      code: otpCode.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#071b2d] text-[#0f172a] dark:text-slate-100 flex flex-col justify-between">
      <SeoHead
        title="Official Employee Registration • VOLAMP ELEKTRIKALS PVT. LTD."
        description="Corporate staff onboarding and employee portal registration desk. CEO authorization required for activation."
        noindex={true}
      />

      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c2438]/95 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="size-8 sm:size-9 rounded-xl bg-gradient-to-br from-[#102a40] to-[#1d73b7] flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0">
              V
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-black tracking-wider text-[#102a40] dark:text-white uppercase truncate">
                VOLAMP <span className="text-[#f59e0b] hidden min-[400px]:inline">ELEKTRIKALS</span>
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold text-slate-500 tracking-wider uppercase -mt-0.5 truncate">
                Staff Onboarding Desk
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <ThemeToggle />
            <Link href="/employee-portal">
              <Button
                variant="outline"
                className="text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 sm:h-9 px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Employee Sign In</span>
                <span className="sm:hidden">Sign In</span>
                <ArrowRight className="ml-1 sm:ml-1.5 size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 w-full flex-1 flex flex-col justify-center">
        {/* Progress Tracker */}
        <div className="mb-8 max-w-xl mx-auto w-full">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div
              className={`pb-2 border-b-2 font-bold transition-colors ${
                step === "register"
                  ? "border-[#1d73b7] text-[#1d73b7] dark:text-[#38bdf8]"
                  : "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              1. Registration Dossier
            </div>
            <div
              className={`pb-2 border-b-2 font-bold transition-colors ${
                step === "verify_otp"
                  ? "border-[#1d73b7] text-[#1d73b7] dark:text-[#38bdf8]"
                  : step === "pending_ceo"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-400"
              }`}
            >
              2. Email Verification
            </div>
            <div
              className={`pb-2 border-b-2 font-bold transition-colors ${
                step === "pending_ceo"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-400"
              }`}
            >
              3. CEO Authorization
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: REGISTRATION FORM                                                 */}
        {/* ========================================================================= */}
        {step === "register" && (
          <div className="bg-white dark:bg-[#102b42] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Card Banner */}
            <div className="bg-gradient-to-r from-[#0a1f33] via-[#102a40] to-[#1e4e75] px-6 py-6 text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold tracking-wider uppercase mb-2 backdrop-blur-sm border border-white/15">
                <Shield className="size-3.5 text-[#f59e0b]" /> Official Corporate Access
              </div>
              <h1 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                Employee Account Registration
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Enter your official company credentials. Having an official email address is required, but employee portal access is activated only upon explicit authorization by the CEO (<strong className="text-white">ceo@volampelektrikals.com</strong>).
              </p>
            </div>

            {/* Form Container */}
            <form onSubmit={handleRegisterSubmit} className="p-6 md:p-8 space-y-6">
              {/* Row 1: Full Name & Official Email */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="reg-name" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Employee Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <User className="size-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      id="reg-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="pl-10 text-sm h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reg-email" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Official Company Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Mail className="size-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@volampelektrikals.com"
                      className={`pl-10 text-sm h-11 ${
                        email && !domainValidation.valid
                          ? "border-red-400 focus-visible:ring-red-400"
                          : email && domainValidation.valid
                          ? "border-emerald-400 focus-visible:ring-emerald-400"
                          : ""
                      }`}
                    />
                  </div>
                  {email && domainValidation.message && (
                    <p
                      className={`text-[11px] mt-1.5 font-medium flex items-center gap-1 ${
                        domainValidation.valid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {domainValidation.valid ? (
                        <CheckCircle2 className="size-3.5 shrink-0" />
                      ) : (
                        <XCircle className="size-3.5 shrink-0" />
                      )}
                      {domainValidation.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Department, Job Designation, Employee ID */}
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <Label htmlFor="reg-dept" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="reg-dept"
                    value={department}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDepartment(val);
                      if ((val === "CEO" || val === "CEO & Executive Leadership") && !designation) {
                        setDesignation("Chief Executive Officer (CEO)");
                      }
                    }}
                    className="w-full mt-1.5 h-11 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="reg-desig" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Job Designation <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reg-desig"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Chief Executive Officer (CEO) / Senior Electrical Engineer"
                    className="mt-1.5 text-sm h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="reg-empid" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Employee ID <span className="text-slate-400 font-normal">(if assigned)</span>
                  </Label>
                  <Input
                    id="reg-empid"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. VLT-2026-QA04"
                    className="mt-1.5 text-sm h-11"
                  />
                </div>
              </div>

              {/* Row 3: Passwords */}
              <div className="grid md:grid-cols-2 gap-5 pt-2">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reg-pwd" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="size-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      id="reg-pwd"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="pl-10 text-sm h-11"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reg-cpwd" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      {showConfirmPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <KeyRound className="size-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      id="reg-cpwd"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="pl-10 text-sm h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Password Requirements Guidance Box */}
              {password.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Password Security Requirements:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                    <span className={`flex items-center gap-1.5 ${passwordCriteria.length ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                      {passwordCriteria.length ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />} At least 8 characters
                    </span>
                    <span className={`flex items-center gap-1.5 ${passwordCriteria.uppercase ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                      {passwordCriteria.uppercase ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />} Uppercase letter (A-Z)
                    </span>
                    <span className={`flex items-center gap-1.5 ${passwordCriteria.lowercase ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                      {passwordCriteria.lowercase ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />} Lowercase letter (a-z)
                    </span>
                    <span className={`flex items-center gap-1.5 ${passwordCriteria.number ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                      {passwordCriteria.number ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />} Number digit (0-9)
                    </span>
                    <span className={`flex items-center gap-1.5 ${passwordCriteria.special ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                      {passwordCriteria.special ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />} Special symbol (!@#$)
                    </span>
                    <span className={`flex items-center gap-1.5 ${passwordCriteria.matches ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                      {passwordCriteria.matches ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />} Passwords match
                    </span>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2.5 sm:gap-3">
                <Checkbox
                  id="emp-terms"
                  checked={termsAccepted}
                  onCheckedChange={(c) => setTermsAccepted(Boolean(c))}
                  className="mt-1 shrink-0"
                />
                <label htmlFor="emp-terms" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer block flex-1">
                  I confirm that I am an authorized employee of <strong>VOLAMP ELEKTRIKALS PVT. LTD.</strong> I agree to comply with company IT security protocols, corporate confidentiality guidelines, and the{" "}
                  <Link href="/terms-conditions" className="text-[#1d73b7] underline font-semibold" target="_blank">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-[#1d73b7] underline font-semibold" target="_blank">
                    Privacy Policy
                  </Link>
                  . I understand that registration does not grant portal access until explicitly authorized by the CEO.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full h-12 bg-[#1d73b7] hover:bg-[#155a90] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  {registerMutation.isPending ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" /> Submitting Employee Dossier...
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="size-4" /> Submit Registration & Verify Email{" "}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: EMAIL OTP VERIFICATION                                            */}
        {/* ========================================================================= */}
        {step === "verify_otp" && (
          <div className="bg-white dark:bg-[#102b42] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-lg mx-auto w-full p-8 text-center">
            <div className="size-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1d73b7] flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-900">
              <Mail className="size-8" />
            </div>

            <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#102a40] dark:text-white">
              Verify Company Email
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
              We have dispatched a 6-digit confirmation code to your official address:
              <br />
              <strong className="text-slate-800 dark:text-slate-100 font-mono text-sm">{registeredEmail}</strong>
            </p>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(val) => setOtpCode(val)}
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
                disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> Confirm Email & Forward to CEO
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep("register")}
                  className="hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" /> Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => resendOtpMutation.mutate({ email: registeredEmail })}
                  disabled={resendOtpMutation.isPending}
                  className="text-[#1d73b7] font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`size-3 ${resendOtpMutation.isPending ? "animate-spin" : ""}`} /> Resend Code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PENDING CEO APPROVAL SCREEN                                        */}
        {/* ========================================================================= */}
        {step === "pending_ceo" && (
          <div className="bg-white dark:bg-[#102b42] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-w-xl mx-auto w-full p-8 text-center">
            <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-900">
              <Clock className="size-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="size-3.5" /> Official Email Verified
            </div>

            <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#102a40] dark:text-white">
              Awaiting CEO Authorization
            </h2>

            {/* Exact Required Spec Paragraph */}
            <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
              "Your employee registration has been successfully submitted and verified. Your account is currently awaiting authorization from VOLAMP management. You will receive an email once your registration is reviewed."
            </div>

            {/* Workflow Timeline */}
            <div className="space-y-3 text-left my-6 bg-white dark:bg-[#0c2438] p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>1. Registration form submitted with company credentials</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>2. Official email verified via secure OTP</span>
              </div>
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 font-bold">
                <Clock className="size-4 shrink-0 animate-pulse" />
                <span>3. Authorization request sent to ceo@volampelektrikals.com (In Review)</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-medium">
                <Lock className="size-4 shrink-0" />
                <span>4. Employee Portal access unlocked upon executive decision</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              You will receive an automatic email notification at <strong>{registeredEmail}</strong> once Executive Leadership makes a decision.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-xs font-semibold border-slate-200 dark:border-slate-700"
                >
                  <ArrowLeft className="mr-2 size-3.5" /> Back to Homepage
                </Button>
              </Link>
              <Link href="/employee-portal">
                <Button className="w-full sm:w-auto bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold">
                  Employee Portal Sign In <ArrowRight className="ml-2 size-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer Notice */}
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

