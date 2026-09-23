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
  Mail,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
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
}

export function AuthModal({ isOpen, onClose, initialAccountType }: AuthModalProps) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Navigation / View State
  const [view, setView] = useState<ModalView>(() => {
    if (initialAccountType === "employee") return "employee-login";
    if (initialAccountType === "customer") return "customer-login";
    return "type-selection";
  });

  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register Form State
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP State
  const [otpCode, setOtpCode] = useState("");
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
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
      if (initialAccountType === "employee") setView("employee-login");
      else if (initialAccountType === "customer") setView("customer-login");
      else setView("type-selection");
      setDomainError(null);
      setDevOtpHint(null);
      setOtpCode("");
    }
  }, [isOpen, initialAccountType]);

  // Mutations
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.mfaRequired) {
        setMfaPendingToken(data.mfaPendingToken);
        setActiveEmail(data.email ?? email);
        setTargetAccountType(data.accountType);
        if (data.devOtp) setDevOtpHint(data.devOtp);
        setOtpCode("");
        setView("mfa-verify");
        toast.info("MFA Verification Required", {
          description: `Enter the 6-digit code sent to ${data.email}.`,
        });
      } else {
        utils.auth.me.setData(undefined, data.user);
        toast.success("Welcome back!", {
          description: `Signed in as ${data.user.name || data.user.email}`,
        });
        onClose();
        if (data.user.accountType === "employee") {
          setLocation("/employee-portal");
        } else {
          setLocation("/portal");
        }
      }
    },
    onError: (err) => {
      toast.error("Sign-in Failed", { description: err.message });
    },
  });

  const mfaMutation = trpc.auth.verifyMfaOtp.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, data.user);
      toast.success("Verification successful!", {
        description: `Authenticated as ${data.user.name || data.user.email}`,
      });
      onClose();
      if (data.user.accountType === "employee") {
        setLocation("/employee-portal");
      } else {
        setLocation("/portal");
      }
    },
    onError: (err) => {
      toast.error("Verification Error", { description: err.message });
    },
  });

  const resendMfaMutation = trpc.auth.resendMfaOtp.useMutation({
    onSuccess: (data) => {
      if (data.devOtp) setDevOtpHint(data.devOtp);
      toast.info("Code resent", { description: "A new 6-digit verification code has been generated." });
    },
    onError: (err) => toast.error(err.message),
  });

  const registerEmployeeMutation = trpc.auth.registerEmployee.useMutation({
    onSuccess: (data) => {
      setActiveEmail(data.email ?? email);
      setTargetAccountType("employee");
      if (data.devOtp) setDevOtpHint(data.devOtp);
      setOtpCode("");
      setView("email-verify");
      toast.success("Verification code sent", {
        description: `Sent to official address ${data.email}`,
      });
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
      if (data.devOtp) setDevOtpHint(data.devOtp);
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

  const verifyEmailOtpMutation = trpc.auth.verifyEmailOtp.useMutation({
    onSuccess: (data) => {
      if (data.accountType === "employee") {
        setView("pending-approval");
      } else {
        utils.auth.me.setData(undefined, data.user);
        toast.success("Account active!", { description: "Welcome to VOLAMP customer portal." });
        onClose();
        setLocation("/portal");
      }
    },
    onError: (err) => {
      toast.error("Verification Failed", { description: err.message });
    },
  });

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      if (data.devOtp) setDevOtpHint(data.devOtp);
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
      setView(targetAccountType === "employee" ? "employee-login" : "customer-login");
    },
    onError: (err) => toast.error(err.message),
  });

  if (!isOpen) return null;

  // Handlers
  const handleEmployeeRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.toLowerCase().trim();
    if (!normalized.endsWith("@volampelektrikals.com")) {
      setDomainError(
        "Employee registration requires an official VOLAMP email address ending in @volampelektrikals.com."
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Password mismatch", { description: "Passwords do not match." });
      return;
    }
    setDomainError(null);
    registerEmployeeMutation.mutate({ name, email: normalized, password });
  };

  const handleCustomerRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password mismatch", { description: "Passwords do not match." });
      return;
    }
    registerCustomerMutation.mutate({ name, email: email.trim(), password });
  };

  const handleEmployeeLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: email.trim(),
      password,
      rememberMe,
      expectedAccountType: "employee",
    });
  };

  const handleCustomerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: email.trim(),
      password,
      rememberMe,
      expectedAccountType: "customer",
    });
  };

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
        {/* VIEW 1: ACCOUNT TYPE SELECTION                                     */}
        {/* ------------------------------------------------------------------ */}
        {view === "type-selection" && (
          <div className="flex flex-col items-center text-center">
            <div className="size-14 rounded-2xl bg-[#1d73b7]/10 dark:bg-[#1d73b7]/20 flex items-center justify-center text-[#1d73b7] mb-4">
              <UserRound className="size-7" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-[#102a40] font-['Space_Grotesk']">
              Welcome to <span className="text-[#c46b19]">VOLAMP</span>
            </h2>
            <p className="text-xs text-[#5a6b78] mt-1 mb-6 max-w-[340px]">
              Please select your account type to proceed to your dedicated portal.
            </p>

            <div className="grid grid-cols-1 gap-3.5 w-full">
              {/* Employee Option */}
              <div className="flex flex-col items-start p-4 rounded-xl border-2 border-[#d2e0e8] dark:border-[#254259] hover:border-[#1d73b7] dark:hover:border-[#1d73b7] bg-[#f8fafc] dark:bg-[#15344d] transition-all text-left group">
                <div className="flex items-center gap-3 w-full mb-2">
                  <div className="p-2.5 rounded-lg bg-[#1d73b7]/10 text-[#1d73b7]">
                    <Briefcase className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#102a40] dark:text-white">
                      Employee
                    </h3>
                    <p className="text-[11px] text-[#6e808b] dark:text-[#b6c8d3]">
                      For VOLAMP employees
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setView("employee-login")}
                  className="w-full mt-2 bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  Login / Register as Employee <ArrowRight className="size-3.5" />
                </Button>
              </div>

              {/* Customer Option */}
              <div className="flex flex-col items-start p-4 rounded-xl border-2 border-[#d2e0e8] dark:border-[#254259] hover:border-[#d97818] dark:hover:border-[#d97818] bg-[#f8fafc] dark:bg-[#15344d] transition-all text-left group">
                <div className="flex items-center gap-3 w-full mb-2">
                  <div className="p-2.5 rounded-lg bg-[#d97818]/10 text-[#d97818]">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#102a40] dark:text-white">
                      Customer
                    </h3>
                    <p className="text-[11px] text-[#6e808b] dark:text-[#b6c8d3]">
                      For VOLAMP customers
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setView("customer-login")}
                  className="w-full mt-2 bg-[#d97818] hover:bg-[#b86412] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  Login / Register as Customer <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: EMPLOYEE LOGIN                                             */}
        {/* ------------------------------------------------------------------ */}
        {view === "employee-login" && (
          <div>
            <button
              onClick={() => setView("type-selection")}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1d73b7] hover:underline mb-4"
            >
              <ArrowLeft className="size-3.5" /> Change account type
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 rounded-md bg-[#1d73b7]/10 text-[#1d73b7]">
                <Briefcase className="size-4" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-[#1d73b7] uppercase">
                OFFICIAL WORKSPACE
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#102a40] font-['Space_Grotesk']">
              Employee Login
            </h2>
            <p className="text-xs text-[#5a6b78] mt-0.5 mb-5">
              Sign in with your official VOLAMP credentials.
            </p>

            <form onSubmit={handleEmployeeLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="emp-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="emp-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@volampelektrikals.com"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="emp-password" className="text-xs font-semibold">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAccountType("employee");
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
                    id="emp-password"
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
                  id="emp-remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(Boolean(v))}
                />
                <Label htmlFor="emp-remember" className="text-xs font-normal cursor-pointer">
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

            <div className="mt-6 pt-4 border-t border-[#e2ecf2] text-center">
              <span className="text-xs text-[#5a6b78]">
                New Employee?{" "}
              </span>
              <button
                onClick={() => {
                  setDomainError(null);
                  setView("employee-register");
                }}
                className="text-xs font-bold text-[#1d73b7] hover:underline"
              >
                Register
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 3: EMPLOYEE REGISTRATION                                      */}
        {/* ------------------------------------------------------------------ */}
        {view === "employee-register" && (
          <div>
            <button
              onClick={() => setView("employee-login")}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1d73b7] hover:underline mb-4"
            >
              <ArrowLeft className="size-3.5" /> Back to Employee Login
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Shield className="size-4 text-[#1d73b7]" />
              <span className="text-[10px] font-black tracking-widest text-[#1d73b7] uppercase">
                OFFICIAL ONBOARDING
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#102a40] font-['Space_Grotesk']">
              Employee Registration
            </h2>
            <p className="text-xs text-[#5a6b78] mt-0.5 mb-4">
              Requires an official VOLAMP address ending in{" "}
              <strong className="text-[#102a40]">@volampelektrikals.com</strong>.
            </p>

            {domainError && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                <ShieldAlert className="size-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <p className="leading-snug">{domainError}</p>
              </div>
            )}

            <form onSubmit={handleEmployeeRegisterSubmit} className="space-y-3.5">
              <div>
                <Label htmlFor="emp-reg-name" className="text-xs font-semibold">
                  Full Name
                </Label>
                <div className="relative mt-1">
                  <User className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="emp-reg-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emp-reg-email" className="text-xs font-semibold">
                  Official Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="emp-reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (domainError) setDomainError(null);
                    }}
                    placeholder="name@volampelektrikals.com"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emp-reg-pwd" className="text-xs font-semibold">
                  Password (min 6 characters)
                </Label>
                <div className="relative mt-1">
                  <Lock className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="emp-reg-pwd"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emp-reg-cpwd" className="text-xs font-semibold">
                  Confirm Password
                </Label>
                <div className="relative mt-1">
                  <KeyRound className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="emp-reg-cpwd"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={registerEmployeeMutation.isPending}
                className="w-full bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-2"
              >
                {registerEmployeeMutation.isPending ? "Creating Account..." : "Register as Employee"}{" "}
                <ArrowRight className="size-3.5" />
              </Button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 4: CUSTOMER LOGIN                                             */}
        {/* ------------------------------------------------------------------ */}
        {view === "customer-login" && (
          <div>
            <button
              onClick={() => setView("type-selection")}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#d97818] hover:underline mb-4"
            >
              <ArrowLeft className="size-3.5" /> Change account type
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1.5 rounded-md bg-[#d97818]/10 text-[#d97818]">
                <Building2 className="size-4" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-[#d97818] uppercase">
                CUSTOMER PORTAL
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#102a40] font-['Space_Grotesk']">
              Customer Login
            </h2>
            <p className="text-xs text-[#5a6b78] mt-0.5 mb-5">
              Access your quotation requests, orders, documents and support.
            </p>

            <form onSubmit={handleCustomerLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cust-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="cust-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com or personal"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="cust-password" className="text-xs font-semibold">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetAccountType("customer");
                      setForgotStep("email");
                      setView("forgot-password");
                    }}
                    className="text-[11px] font-medium text-[#d97818] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <Lock className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="cust-password"
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
                  id="cust-remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(Boolean(v))}
                />
                <Label htmlFor="cust-remember" className="text-xs font-normal cursor-pointer">
                  Remember Me
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-[#d97818] hover:bg-[#b86412] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-2"
              >
                {loginMutation.isPending ? "Authenticating..." : "Login"} <ArrowRight className="size-3.5" />
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#e2ecf2] text-center">
              <span className="text-xs text-[#5a6b78]">
                New Customer?{" "}
              </span>
              <button
                onClick={() => setView("customer-register")}
                className="text-xs font-bold text-[#d97818] hover:underline"
              >
                Create an Account
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 5: CUSTOMER REGISTRATION                                      */}
        {/* ------------------------------------------------------------------ */}
        {view === "customer-register" && (
          <div>
            <button
              onClick={() => setView("customer-login")}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#d97818] hover:underline mb-4"
            >
              <ArrowLeft className="size-3.5" /> Back to Customer Login
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Building2 className="size-4 text-[#d97818]" />
              <span className="text-[10px] font-black tracking-widest text-[#d97818] uppercase">
                CUSTOMER ACCOUNT
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#102a40] font-['Space_Grotesk']">
              Create Customer Account
            </h2>
            <p className="text-xs text-[#5a6b78] mt-0.5 mb-4">
              Register using your personal or business email address.
            </p>

            <form onSubmit={handleCustomerRegisterSubmit} className="space-y-3.5">
              <div>
                <Label htmlFor="cust-reg-name" className="text-xs font-semibold">
                  Full Name / Contact Person
                </Label>
                <div className="relative mt-1">
                  <User className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="cust-reg-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cust-reg-email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="cust-reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com or personal"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cust-reg-pwd" className="text-xs font-semibold">
                  Password (min 6 characters)
                </Label>
                <div className="relative mt-1">
                  <Lock className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="cust-reg-pwd"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cust-reg-cpwd" className="text-xs font-semibold">
                  Confirm Password
                </Label>
                <div className="relative mt-1">
                  <KeyRound className="size-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="cust-reg-cpwd"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={registerCustomerMutation.isPending}
                className="w-full bg-[#d97818] hover:bg-[#b86412] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-2"
              >
                {registerCustomerMutation.isPending ? "Creating Account..." : "Create Account"}{" "}
                <ArrowRight className="size-3.5" />
              </Button>
            </form>
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
            <h2 className="text-xl font-bold text-[#102a40] font-['Space_Grotesk'] mt-0.5">
              Enter Verification Code
            </h2>
            <p className="text-xs text-[#5a6b78] mt-1 mb-4">
              Enter the 6-digit one-time code sent to{" "}
              <strong className="text-[#102a40]">{activeEmail}</strong>.
            </p>

            {devOtpHint && (
              <div className="p-2.5 mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span className="font-mono font-bold text-sm tracking-wider">{devOtpHint}</span>
                <span className="text-[10px] font-semibold uppercase bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded">
                  Localhost Code
                </span>
              </div>
            )}

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
                  onClick={() =>
                    setView(targetAccountType === "employee" ? "employee-login" : "customer-login")
                  }
                  className="hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" /> Back
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
            <h2 className="text-xl font-bold text-[#102a40] font-['Space_Grotesk'] mt-0.5">
              Verify Email Address
            </h2>
            <p className="text-xs text-[#5a6b78] mt-1 mb-4">
              Enter the 6-digit confirmation code sent to{" "}
              <strong className="text-[#102a40]">{activeEmail}</strong>.
            </p>

            {devOtpHint && (
              <div className="p-2.5 mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span className="font-mono font-bold text-sm tracking-wider">{devOtpHint}</span>
                <span className="text-[10px] font-semibold uppercase bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded">
                  Localhost Code
                </span>
              </div>
            )}

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

            <h2 className="text-xl font-bold text-[#102a40] font-['Space_Grotesk'] mt-1">
              Pending Admin Approval
            </h2>
            <p className="text-xs text-[#5a6b78] mt-2 mb-6 leading-relaxed max-w-[360px] mx-auto">
              Your employee account has been created and verified. A VOLAMP administrator must approve your official access before you can log in to the Employee Portal.
            </p>

            <Button
              onClick={onClose}
              className="w-full bg-[#102a40] hover:bg-[#09233a] text-white text-xs font-semibold py-2.5 rounded-lg"
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
              onClick={() =>
                setView(targetAccountType === "employee" ? "employee-login" : "customer-login")
              }
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1d73b7] hover:underline mb-4"
            >
              <ArrowLeft className="size-3.5" /> Back to Login
            </button>

            <h2 className="text-xl font-bold text-[#102a40] font-['Space_Grotesk']">
              Reset Password
            </h2>
            <p className="text-xs text-[#5a6b78] mt-0.5 mb-5">
              {forgotStep === "email"
                ? "Enter your registered email to receive a password reset code."
                : `Enter the code sent to ${email} and your new password.`}
            </p>

            {devOtpHint && (
              <div className="p-2.5 mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span className="font-mono font-bold text-sm tracking-wider">{devOtpHint}</span>
                <span className="text-[10px] font-semibold uppercase bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded">
                  Reset Code
                </span>
              </div>
            )}

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
