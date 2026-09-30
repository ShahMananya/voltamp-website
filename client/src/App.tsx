import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import CustomerPortal from "@/pages/CustomerPortal";
import EmployeePortal from "@/pages/EmployeePortal";
import { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocationProvider } from "./contexts/LocationContext";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutVolamp from "./pages/AboutVolamp";
import ShippingPolicy from "./pages/ShippingPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import BusinessSegments from "./pages/BusinessSegments";
import TrackPage from "./pages/TrackPage";
import PayInvoice from "./pages/PayInvoice";
import CalculatorPage from "./pages/CalculatorPage";
import WhereVolampContributed from "./pages/WhereVolampContributed";
import CollaboratePage from "./pages/CollaboratePage";
import CareersPage from "./pages/CareersPage";
import BlogPage from "./pages/BlogPage";
import EnquirePage from "./pages/EnquirePage";
import CertificationsAndAwards from "./pages/CertificationsAndAwards";
import InTheNews from "./pages/InTheNews";
import BranchLocations from "./pages/BranchLocations";
import TermsConditions from "./pages/TermsConditions";
import ComplaintsCasesPage from "./pages/ComplaintsCasesPage";
import FloatingActions from "./components/FloatingActions";
import { LocationModal } from "./components/location/LocationModal";
import CookieConsentBanner from "./components/cookie/CookieConsentBanner";
import GlobalVolaChat from "./components/chat/GlobalVolaChat";
import EnquireSideTab from "./components/layout/EnquireSideTab";
import { EnquireModal } from "./components/enquire/EnquireModal";
import { CartProvider } from "./contexts/CartContext";
import CartDrawer from "./components/cart/CartDrawer";
import { CompareProvider } from "./contexts/CompareContext";
import { CompareBar } from "./components/compare/CompareBar";
import { CompareModal } from "./components/compare/CompareModal";
import { CategoryMismatchModal } from "./components/compare/CategoryMismatchModal";
import { AuthModal } from "./components/auth/AuthModal";

function GlobalAuthManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialType, setInitialType] = useState<"customer" | "employee">("customer");

  useEffect(() => {
    const handleOpen = (e: any) => {
      setInitialType(e?.detail?.accountType || "customer");
      setIsOpen(true);
    };
    window.addEventListener("volamp:open-auth", handleOpen);
    return () => window.removeEventListener("volamp:open-auth", handleOpen);
  }, []);

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      initialAccountType={initialType}
    />
  );
}

function GlobalEnquireManager() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [initialCategory, setInitialCategory] = useState<string | undefined>();
  const [initialProduct, setInitialProduct] = useState<string | undefined>();

  const isPortal = location.startsWith("/portal") || location.startsWith("/employee-portal");
  const isEnquirePage = location.startsWith("/enquire") || location.startsWith("/quote") || location.startsWith("/contact");

  useEffect(() => {
    const handleOpen = (e: any) => {
      if (e?.detail?.category) setInitialCategory(e.detail.category);
      if (e?.detail?.product) setInitialProduct(e.detail.product);
      setIsOpen(true);
    };
    window.addEventListener("volamp:open-enquire", handleOpen);
    return () => window.removeEventListener("volamp:open-enquire", handleOpen);
  }, []);

  if (isPortal || isEnquirePage) return null;

  const hasLocalModal = location === "/" || location.startsWith("/category") || location.startsWith("/business-segments");

  return (
    <>
      <EnquireSideTab onOpen={() => window.dispatchEvent(new CustomEvent("volamp:open-enquire"))} />
      {!hasLocalModal && (
        <EnquireModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setInitialCategory(undefined);
            setInitialProduct(undefined);
          }}
          initialCategory={initialCategory}
          initialProduct={initialProduct}
        />
      )}
    </>
  );
}

function GlobalFloatingActions() {
  const [location] = useLocation();
  const isPortal = location.startsWith("/portal") || location.startsWith("/employee-portal");
  if (isPortal) return null;

  const handleOpenChat = () => {
    // Open or toggle chat on the current page without redirecting
    window.dispatchEvent(new CustomEvent("volamp:toggle-chat"));
  };

  return <FloatingActions onOpenChat={handleOpenChat} />;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/category/:slug"} component={CategoryPage} />
      <Route path="/product/:productId/:slug" component={ProductDetailPage} />
      <Route path="/product/:productId" component={ProductDetailPage} />
      <Route path="/p/:productId" component={ProductDetailPage} />
      <Route path="/products" component={CategoryPage} />
      <Route path="/shop" component={CategoryPage} />
      <Route path="/marketplace" component={CategoryPage} />
      <Route path="/portal" component={CustomerPortal} />
      <Route path="/employee-portal" component={EmployeePortal} />
      <Route path="/about-volamp" component={AboutVolamp} />
      <Route path="/about" component={AboutVolamp} />
      <Route path="/about-us" component={AboutVolamp} />
      <Route path="/footprint" component={AboutVolamp} />
      <Route path="/where-volamp-contributed" component={WhereVolampContributed} />
      <Route path="/contributions" component={WhereVolampContributed} />
      <Route path="/landmark-projects" component={WhereVolampContributed} />
      <Route path="/projects" component={WhereVolampContributed} />
      <Route path="/collaborate" component={CollaboratePage} />
      <Route path="/collaborate-with-us" component={CollaboratePage} />
      <Route path="/partner" component={CollaboratePage} />
      <Route path="/dealership" component={CollaboratePage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/career" component={CareersPage} />
      <Route path="/jobs" component={CareersPage} />
      <Route path="/join-us" component={CareersPage} />
      <Route path="/careers-at-volamp" component={CareersPage} />
      <Route path="/enquire" component={EnquirePage} />
      <Route path="/enquiry" component={EnquirePage} />
      <Route path="/quote" component={EnquirePage} />
      <Route path="/contact" component={EnquirePage} />
      <Route path="/contact-us" component={EnquirePage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/journal" component={BlogPage} />
      <Route path="/insights" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPage} />
      <Route path="/business-segments" component={BusinessSegments} />
      <Route path="/segments" component={BusinessSegments} />
      <Route path="/track" component={TrackPage} />
      <Route path="/track-order" component={TrackPage} />
      <Route path="/tracking" component={TrackPage} />
      <Route path="/shipping-policy" component={ShippingPolicy} />
      <Route path="/shipping" component={ShippingPolicy} />
      <Route path="/delivery-policy" component={ShippingPolicy} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/return-policy" component={RefundPolicy} />
      <Route path="/no-refund-policy" component={RefundPolicy} />
      <Route path="/terms-and-conditions" component={TermsConditions} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/terms" component={TermsConditions} />
      <Route path="/t-and-c" component={TermsConditions} />
      <Route path="/tc" component={TermsConditions} />
      <Route path="/pay-invoice" component={PayInvoice} />
      <Route path="/pay-an-invoice" component={PayInvoice} />
      <Route path="/payment-guide" component={PayInvoice} />
      <Route path="/payment-desk" component={PayInvoice} />
      <Route path="/calculator" component={CalculatorPage} />
      <Route path="/cable-calculator" component={CalculatorPage} />
      <Route path="/estimator" component={CalculatorPage} />
      <Route path="/certifications-and-awards" component={CertificationsAndAwards} />
      <Route path="/certifications-and-quality" component={CertificationsAndAwards} />
      <Route path="/certifications-quality" component={CertificationsAndAwards} />
      <Route path="/certifications" component={CertificationsAndAwards} />
      <Route path="/quality" component={CertificationsAndAwards} />
      <Route path="/standards" component={CertificationsAndAwards} />
      <Route path="/awards" component={CertificationsAndAwards} />
      <Route path="/in-the-news" component={InTheNews} />
      <Route path="/news" component={InTheNews} />
      <Route path="/media" component={InTheNews} />
      <Route path="/press" component={InTheNews} />
      <Route path="/branch-locations" component={BranchLocations} />
      <Route path="/branch-location" component={BranchLocations} />
      <Route path="/branches" component={BranchLocations} />
      <Route path="/locations" component={BranchLocations} />
      <Route path="/complaints-cases" component={ComplaintsCasesPage} />
      <Route path="/complaints" component={ComplaintsCasesPage} />
      <Route path="/cases" component={ComplaintsCasesPage} />
      <Route path="/grievance" component={ComplaintsCasesPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    <GlobalFloatingActions />
    <LocationModal />
    <CookieConsentBanner />
    <GlobalVolaChat />
    <GlobalEnquireManager />
    <CartDrawer />
    <CompareBar />
    <CompareModal />
    <CategoryMismatchModal />
    <GlobalAuthManager />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <LocationProvider>
          <CartProvider>
            <CompareProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </CompareProvider>
          </CartProvider>
        </LocationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
