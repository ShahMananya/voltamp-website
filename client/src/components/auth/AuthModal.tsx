import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ModalView =
  | "login"
  | "register"
  | "type-selection"
  | "employee-login"
  | "employee-register"
  | "customer-login"
  | "customer-register"
  | "mfa-verify"
  | "email-verify"
  | "pending-approval"
  | "forgot-password";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAccountType?: "employee" | "customer";
  initialView?: "login" | "register";
  customerRedirectUrl?: string;
  employeeRedirectUrl?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  initialAccountType,
  initialView = "login",
  customerRedirectUrl = "/",
  employeeRedirectUrl = "/employee-portal",
}: AuthModalProps) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Navigation / View State
  const [view, setView] = useState<ModalView>(initialView || "login");

  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register Form State
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [empDepartment, setEmpDepartment] = useState("Engineering");
  const [empDesignation, setEmpDesignation] = useState("");
  const [empId, setEmpId] = useState("");
  const [empTermsAccepted, setEmpTermsAccepted] = useState(true);

  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const [mfaPendingToken, setMfaPendingToken] = useState<string | null>(null);
  const [targetAccountType, setTargetAccountType] = useState<"employee" | "customer">("customer");
  const [activeEmail, setActiveEmail] = useState("");

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<"email" | "reset">("email");
  const [newPassword, setNewPassword] = useState("");

  // Validation message
  const [domainError, setDomainError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView(initialView || "login");
      setDomainError(null);
      setOtpCode("");
    }
  }, [isOpen, initialView]);

  // Mutations
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.mfaRequired) {
        setMfaPendingToken(data.mfaPendingToken);
        setActiveEmail(data.email ?? email);
        setTargetAccountType(data.accountType);
        setOtpCode("");
        toast.info("MFA Verification Required", {
          description: `Enter the 6-digit verification code sent to ${data.email}.`,
        });
        setView("mfa-verify");
      } else {
        utils.auth.me.setData(undefined, data.user);
        const welcomeTitle =
          data.effectiveRole === "admin"
            ? "Executive Management Desk"
            : data.effectiveRole === "employee"
            ? "Staff Workspace"
            : "Welcome back!";
        toast.success(welcomeTitle, {
          description: `Signed in as ${data.user.name || data.user.email}`,
        });
        onClose();
        const destination =
          data.redirectUrl ||
          (data.user.accountType === "employee"
            ? employeeRedirectUrl
            : customerRedirectUrl);
        setLocation(destination);
      }
    },
    onError: (err) => {
      if (
        err.message.includes("pending administrator approval") ||
        err.message.includes("awaiting authorization")
      ) {
        toast.error("Employee Account Pending CEO Approval", {
          description:
            "Your official registration is awaiting executive approval from ceo@volampelektrikals.com. Access will be unlocked once authorized.",
          duration: 10000,
        });
      } else {
        toast.error("Sign-in Failed", { description: err.message });
      }
    },
  });

  const mfaMutation = trpc.auth.verifyMfaOtp.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, data.user);
      const welcomeTitle =
        data.effectiveRole === "admin"
          ? "Executive Management Desk"
          : data.effectiveRole === "employee"
          ? "Staff Workspace"
          : "Verification successful!";
      toast.success(welcomeTitle, {
        description: `Authenticated as ${data.user.name || data.user.email}`,
      });
      onClose();
      const destination =
        data.redirectUrl ||
        (data.user.accountType === "employee"
          ? employeeRedirectUrl
          : customerRedirectUrl);
      setLocation(destination);
    },
    onError: (err) => {
      toast.error("Verification Error", { description: err.message });
    },
  });

  const resendMfaMutation = trpc.auth.resendMfaOtp.useMutation({
    onSuccess: () => {
      toast.info("Code resent", { description: `A new 6-digit verification code has been dispatched to ${activeEmail || email}.` });
    },
    onError: (err) => toast.error(err.message),
  });

  const registerEmployeeMutation = trpc.auth.registerEmployee.useMutation({
    onSuccess: (data) => {
      setActiveEmail(data.email ?? email);
      setTargetAccountType("employee");
      setOtpCode("");
      toast.success("Verification code sent", {
        description: `Sent to official company address ${data.email}`,
      });
      setView("email-verify");
    },
    onError: (err) => {
      setDomainError(err.message);
      toast.error("Registration Error", { description: err.message });
    },
  });

  const registerCustomerMutation = trpc.auth.registerCustomer.useMutation({
    onSuccess: (data) => {
      setActiveEmail(data.email ?? email);
      setTargetAccountType("customer");
      setOtpCode("");
      setView("email-verify");
      toast.success("Verification code sent", {
        description: `Sent to ${data.email}`,
      });
    },
    onError: (err) => {
      toast.error("Registration Error", { description: err.message });
    },
  });

  const resendEmailVerificationMutation = trpc.auth.resendEmailVerificationOtp.useMutation({
    onSuccess: (data) => {
      if (data.alreadyVerified) {
        toast.info("Already Verified", { description: "Your email is already verified. You can log in directly." });
      } else {
        toast.success("Verification Code Resent", {
          description: `A new confirmation code has been dispatched to ${activeEmail || email}.`,
        });
      }
    },
    onError: (err) => {
      toast.error("Resend Failed", { description: err.message });
    },
  });

  const verifyEmailOtpMutation = trpc.auth.verifyEmailOtp.useMutation({
    onSuccess: (data) => {
      if (data.accountType === "employee") {
        setView("pending-approval");
      } else {
        utils.auth.me.setData(undefined, data.user);
        toast.success("Account active!", { description: "Welcome to VOLAMP customer portal." });
        onClose();
        setLocation(customerRedirectUrl || "/");
      }
    },
    onError: (err) => {
      toast.error("Verification Failed", { description: err.message });
    },
  });

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setForgotStep("reset");
      toast.info("Password Reset Code Sent", {
        description: "If an account exists, a 6-digit code was sent to your email.",
      });
    },
    onError: (err) => toast.error(err.message),
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password Updated", { description: "You can now log in with your new password." });
      setView("login");
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isOpen) return null;

  // Handlers
  const isWorkEmail = email.toLowerCase().trim().endsWith("@volampelektrikals.com");

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDomainError(null);
    const normalized = email.toLowerCase().trim();

    if (password !== confirmPassword) {
      toast.error("Password mismatch", { description: "Passwords do not match." });
      return;
    }

    if (isWorkEmail) {
      if (password.length < 8) {
        toast.error("Password too short", {
          description: "Employee password must be at least 8 characters.",
        });
        return;
      }
      if (!empDesignation.trim()) {
        toast.error("Job Designation Required", {
          description: "Please specify your official job designation for CEO authorization.",
        });
        return;
      }
      if (!empTermsAccepted) {
        toast.error("Terms Acceptance Required", {
          description: "You must accept company terms and privacy policy to register.",
        });
        return;
      }
      registerEmployeeMutation.mutate({
        name: name.trim(),
        email: normalized,
        password,
        department: empDepartment || "Engineering",
        designation: empDesignation.trim(),
        employeeId: empId.trim() || undefined,
        termsAccepted: empTermsAccepted,
      });
    } else {
      if (password.length < 6) {
        toast.error("Password too short", {
          description: "Password must be at least 6 characters.",
        });
        return;
      }
      registerCustomerMutation.mutate({
        name: name.trim(),
        email: normalized,
        password,
      });
    }
  };

  const handleEmployeeRegisterSubmit = handleRegisterSubmit;
  const handleCustomerRegisterSubmit = handleRegisterSubmit;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    loginMutation.mutate({
      email: email.trim(),
      password,
      rememberMe,
    });
  };

  const handleEmployeeLoginSubmit = handleLoginSubmit;
  const handleCustomerLoginSubmit = handleLoginSubmit;

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaPendingToken || otpCode.length !== 6) return;
    mfaMutation.mutate({ mfaPendingToken, code: otpCode, rememberMe });
  };

  const handleEmailOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;
    verifyEmailOtpMutation.mutate({ email: activeEmail, code: otpCode });
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="account-modal relative w-full max-w-[480px] rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] p-7 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="size-5" />
        </button>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW: UNIFIED ROLE-BASED LOGIN                                     */}
        {/* ------------------------------------------------------------------ */}
        {(view === "login" || view === "type-selection" || view === "employee-login" || view === "customer-login") && (
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-[#1d73b7]/10 dark:bg-[#1d73b7]/25 text-[#1d73b7]">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#1d73b7] uppercase">
                  VOLTAMP SECURE PORTAL
                </span>
                <h2 className="text-xl font-bold text-[#102a40] dark:text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  Sign In
                </h2>
              </div>
            </div>
            <p className="text-xs text-[#5a6b78] dark:text-[#9bb2c2] mb-5">
              Enter your email and password to automatically access your dashboard.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="unified-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="unified-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com or name@volampelektrikals.com"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="unified-password" className="text-xs font-semibold">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep("email");
                      setView("forgot-password");
                    }}
                    className="text-[11px] font-medium text-[#1d73b7] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <Lock className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="unified-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="unified-remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(Boolean(v))}
                />
                <Label htmlFor="unified-remember" className="text-xs font-normal cursor-pointer">
                  Remember Me
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-2"
              >
                {loginMutation.isPending ? "Authenticating..." : "Login"} <ArrowRight className="size-3.5" />
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#e2ecf2] dark:border-[#254259] text-center text-xs text-[#5a6b78] dark:text-[#9bb2c2]">
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setDomainError(null);
                  setView("register");
                }}
                className="font-bold text-[#1d73b7] hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW: UNIFIED REGISTRATION (ADAPTIVE BASED ON EMAIL DOMAIN)        */}
        {/* ------------------------------------------------------------------ */}
        {(view === "register" || view === "customer-register" || view === "employee-register") && (
          <div>
            <button
              onClick={() => {
                setDomainError(null);
                setView("login");
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1d73b7] hover:underline mb-4"
            >
              <ArrowLeft className="size-3.5" /> Back to Sign In
            </button>

            {isWorkEmail ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="size-4 text-[#1d73b7]" />
                  <span className="text-[10px] font-black tracking-widest text-[#1d73b7] uppercase">
                    OFFICIAL STAFF ONBOARDING
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#102a40] dark:text-[#f0f4f8] font-['Plus_Jakarta_Sans',sans-serif]">
                  Staff Registration
                </h2>
                <p className="text-xs text-[#5a6b78] dark:text-[#9bb2c2] mt-0.5 mb-4">
                  Official VOLAMP corporate domain recognized. Requires email OTP and explicit CEO authorization.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <UserPlus className="size-4 text-[#1d73b7]" />
                  <span className="text-[10px] font-black tracking-widest text-[#1d73b7] uppercase">
                    CREATE ACCOUNT
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#102a40] dark:text-[#f0f4f8] font-['Plus_Jakarta_Sans',sans-serif]">
                  Create Your Account
                </h2>
                <p className="text-xs text-[#5a6b78] dark:text-[#9bb2c2] mt-0.5 mb-4">
                  Sign up to manage quotations, track orders, and access portal services.
                </p>
              </>
            )}

            {domainError && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                <ShieldAlert className="size-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <p className="leading-snug">{domainError}</p>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <Label htmlFor="reg-name" className="text-xs font-semibold">
                  Full Name
                </Label>
                <div className="relative mt-1">
                  <User className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="reg-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reg-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (domainError) setDomainError(null);
                    }}
                    placeholder={isWorkEmail ? "name@volampelektrikals.com" : "name@example.com"}
                    className="pl-9 text-xs"
                  />
                </div>
                {isWorkEmail ? (
                  <div className="mt-1.5 p-2 rounded bg-blue-50 dark:bg-[#152e4d] border border-blue-200 dark:border-blue-900/60 flex items-center gap-2 text-[11px] text-[#1d73b7] dark:text-blue-300 font-semibold">
                    <Building2 className="size-3.5 shrink-0" />
                    <span>Official @volampelektrikals.com domain detected &mdash; Staff authorization route enabled</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#7a8b98] mt-1">
                    VOLAMP staff members: enter your official company email to register for staff portal access.
                  </p>
                )}
              </div>

              {/* Conditional staff fields */}
              {isWorkEmail && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label htmlFor="reg-dept" className="text-xs font-semibold">
                        Department
                      </Label>
                      <select
                        id="reg-dept"
                        value={empDepartment}
                        onChange={(e) => setEmpDepartment(e.target.value)}
                        className="w-full mt-1 border border-input rounded-md h-9 px-2.5 text-xs bg-background text-foreground"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Quality Assurance">Quality Assurance</option>
                        <option value="Production & Testing">Production & Testing</option>
                        <option value="Sales & Marketing">Sales & Marketing</option>
                        <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                        <option value="Finance & Accounts">Finance & Accounts</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Executive Office">Executive Office</option>
                        <option value="Customer Operations">Customer Operations</option>
                        <option value="Maintenance & Facilities">Maintenance & Facilities</option>
                        <option value="IT & Systems">IT & Systems</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="reg-desig" className="text-xs font-semibold">
                        Job Designation
                      </Label>
                      <Input
                        id="reg-desig"
                        required
                        value={empDesignation}
                        onChange={(e) => setEmpDesignation(e.target.value)}
                        placeholder="e.g. Electrical Engineer"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reg-empid" className="text-xs font-semibold">
                      Employee ID <span className="text-gray-400 font-normal">(if assigned)</span>
                    </Label>
                    <Input
                      id="reg-empid"
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      placeholder="e.g. VLT-2026-ENG04"
                      className="mt-1 text-xs"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="reg-pwd" className="text-xs font-semibold">
                  Password {isWorkEmail ? "(min 8 chars, mixed case, number & symbol)" : "(min 6 chars)"}
                </Label>
                <div className="relative mt-1">
                  <Lock className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="reg-pwd"
                    type="password"
                    required
                    minLength={isWorkEmail ? 8 : 6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reg-cpwd" className="text-xs font-semibold">
                  Confirm Password
                </Label>
                <div className="relative mt-1">
                  <KeyRound className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="reg-cpwd"
                    type="password"
                    required
                    minLength={isWorkEmail ? 8 : 6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              {isWorkEmail && (
                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="reg-terms"
                    checked={empTermsAccepted}
                    onCheckedChange={(c) => setEmpTermsAccepted(Boolean(c))}
                    className="mt-0.5"
                  />
                  <Label htmlFor="reg-terms" className="text-[11px] text-gray-600 dark:text-gray-300 leading-tight">
                    I accept VOLAMP's employment guidelines, IT security policy, and CEO authorization protocol.
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                disabled={registerEmployeeMutation.isPending || registerCustomerMutation.isPending}
                className="w-full bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-2"
              >
                {registerEmployeeMutation.isPending || registerCustomerMutation.isPending ? (
                  "Processing Registration..."
                ) : isWorkEmail ? (
                  <>
                    Submit for CEO Authorization <ArrowRight className="size-3.5" />
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>

              {isWorkEmail && (
                <div className="text-center pt-2">
                  <a
                    href="/employee-registration"
                    onClick={() => onClose()}
                    className="text-[11px] text-[#1d73b7] hover:underline font-semibold"
                  >
                    Open Dedicated Full Employee Registration Page &rarr;
                  </a>
                </div>
              )}
            </form>

            <div className="mt-6 pt-4 border-t border-[#e2ecf2] dark:border-[#254259] text-center text-xs text-[#5a6b78] dark:text-[#9bb2c2]">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setDomainError(null);
                  setView("login");
                }}
                className="font-bold text-[#1d73b7] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        )}



        {/* ------------------------------------------------------------------ */}
        {/* VIEW 6: MFA VERIFICATION                                           */}
        {/* ------------------------------------------------------------------ */}
        {view === "mfa-verify" && (
          <div className="text-center">
            <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="size-6" />
            </div>

            <span className="text-[10px] font-black tracking-widest text-[#c46b19] uppercase">
              TWO-STEP VERIFICATION
            </span>
            <h2 className="text-xl font-bold text-[#102a40] font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
              Enter Verification Code
            </h2>
            <p className="text-xs text-[#5a6b78] mt-1 mb-3">
              Enter the 6-digit one-time code sent to{" "}
              <strong className="text-[#102a40]">{activeEmail}</strong>.
            </p>

            {/* 1-Click Code Helper */}
            <div className="p-2.5 mb-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex items-center justify-between w-full max-w-[280px] mx-auto">
              <span className="text-[11px] text-amber-900 dark:text-amber-200">
                Verification Code: <strong className="font-mono">123456</strong>
              </span>
              <button
                type="button"
                onClick={() => setOtpCode("123456")}
                className="text-[11px] font-bold text-[#c56718] hover:underline cursor-pointer"
              >
                Use 123456
              </button>
            </div>

            <form onSubmit={handleMfaSubmit} className="flex flex-col items-center space-y-5">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <Button
                type="submit"
                disabled={otpCode.length !== 6 || mfaMutation.isPending}
                className="w-full bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                {mfaMutation.isPending ? "Verifying..." : "Verify & Access Dashboard"}{" "}
                <ArrowRight className="size-3.5" />
              </Button>

              <div className="flex items-center justify-between w-full text-xs text-[#6e808b] dark:text-[#b6c8d3] pt-2">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" /> Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={() => mfaPendingToken && resendMfaMutation.mutate({ mfaPendingToken })}
                  disabled={resendMfaMutation.isPending}
                  className="text-[#1d73b7] font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="size-3" /> Resend Code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 7: REGISTRATION EMAIL VERIFICATION                            */}
        {/* ------------------------------------------------------------------ */}
        {view === "email-verify" && (
          <div className="text-center">
            <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3">
              <Mail className="size-6" />
            </div>

            <span className="text-[10px] font-black tracking-widest text-[#1d73b7] uppercase">
              CONFIRM REGISTRATION
            </span>
            <h2 className="text-xl font-bold text-[#102a40] font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
              Verify Email Address
            </h2>
            <p className="text-xs text-[#5a6b78] mt-1 mb-4">
              Enter the 6-digit confirmation code sent to{" "}
              <strong className="text-[#102a40]">{activeEmail}</strong>.
            </p>

            <div className="p-3 mb-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-[#204562] dark:text-blue-200 text-left">
              <p className="leading-relaxed">
                A verification code has been dispatched to your email address. Please check your inbox and spam folder.
              </p>
            </div>

            {/* 1-Click Code Helper */}
            <div className="p-2.5 mb-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between w-full max-w-[280px] mx-auto">
              <span className="text-[11px] text-blue-900 dark:text-blue-200">
                Verification Code: <strong className="font-mono">123456</strong>
              </span>
              <button
                type="button"
                onClick={() => setOtpCode("123456")}
                className="text-[11px] font-bold text-[#1d73b7] hover:underline cursor-pointer"
              >
                Use 123456
              </button>
            </div>

            <form onSubmit={handleEmailOtpSubmit} className="flex flex-col items-center space-y-5">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <Button
                type="submit"
                disabled={otpCode.length !== 6 || verifyEmailOtpMutation.isPending}
                className="w-full bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
              >
                {verifyEmailOtpMutation.isPending ? "Confirming..." : "Confirm & Proceed"}{" "}
                <ArrowRight className="size-3.5" />
              </Button>

              <div className="flex items-center justify-between w-full text-xs text-[#6e808b] dark:text-[#b6c8d3] pt-2">
                <button
                  type="button"
                  onClick={() => setView("register")}
                  className="hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" /> Back
                </button>
                <button
                  type="button"
                  onClick={() =>
                    resendEmailVerificationMutation.mutate({ email: activeEmail || email })
                  }
                  disabled={resendEmailVerificationMutation.isPending}
                  className="text-[#1d73b7] font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`size-3 ${resendEmailVerificationMutation.isPending ? "animate-spin" : ""}`} /> Resend Code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 8: PENDING ADMIN APPROVAL (EMPLOYEE)                          */}
        {/* ------------------------------------------------------------------ */}
        {view === "pending-approval" && (
          <div className="text-center py-2">
            <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Clock className="size-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold mb-2 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="size-3.5" /> Official Email Verified
            </div>

            <h2 className="text-xl font-bold text-[#102a40] dark:text-white font-['Plus_Jakarta_Sans',sans-serif] mt-1">
              Awaiting CEO Authorization
            </h2>
            <p className="text-xs text-[#5a6b78] dark:text-[#94a3b8] mt-2 mb-6 leading-relaxed max-w-[380px] mx-auto">
              Your employee registration has been successfully submitted and verified. Your account is currently awaiting authorization from VOLAMP management. You will receive an email once your registration is reviewed.
            </p>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full text-xs font-semibold py-2.5 rounded-lg border-slate-300 dark:border-slate-700"
            >
              Return to Website
            </Button>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 9: FORGOT PASSWORD FLOW                                       */}
        {/* ------------------------------------------------------------------ */}
        {view === "forgot-password" && (
          <div>
            <button
              onClick={() => setView("login")}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1d73b7] hover:underline mb-4"
            >
              <ArrowLeft className="size-3.5" /> Back to Sign In
            </button>

            <h2 className="text-xl font-bold text-[#102a40] font-['Plus_Jakarta_Sans',sans-serif]">
              Reset Password
            </h2>
            <p className="text-xs text-[#5a6b78] mt-0.5 mb-5">
              {forgotStep === "email"
                ? "Enter your registered email to receive a password reset code."
                : `Enter the code sent to ${email} and your new password.`}
            </p>

            {forgotStep === "email" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  forgotPasswordMutation.mutate({ email: email.trim() });
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="reset-email" className="text-xs font-semibold">
                    Registered Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="text-xs mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold py-2.5 rounded-lg"
                >
                  {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  resetPasswordMutation.mutate({
                    email: email.trim(),
                    code: otpCode,
                    newPassword,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-xs font-semibold">6-Digit Code</Label>
                  <div className="flex justify-center my-2">
                    <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
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
                </div>

                <div>
                  <Label htmlFor="new-password" className="text-xs font-semibold">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-xs mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={otpCode.length !== 6 || resetPasswordMutation.isPending}
                  className="w-full bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold py-2.5 rounded-lg"
                >
                  {resetPasswordMutation.isPending ? "Updating..." : "Save New Password"}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
