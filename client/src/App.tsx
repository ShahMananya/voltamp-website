import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import CustomerPortal from "@/pages/CustomerPortal";
import EmployeePortal from "@/pages/EmployeePortal";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LocationProvider } from "./contexts/LocationContext";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import AboutVolamp from "./pages/AboutVolamp";
import ShippingPolicy from "./pages/ShippingPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import BusinessSegments from "./pages/BusinessSegments";
import TrackPage from "./pages/TrackPage";
import PayInvoice from "./pages/PayInvoice";
import CalculatorPage from "./pages/CalculatorPage";
import CollaboratePage from "./pages/CollaboratePage";
import BlogPage from "./pages/BlogPage";
import EnquirePage from "./pages/EnquirePage";
import FloatingActions from "./components/FloatingActions";

function GlobalFloatingActions() {
  const [location, setLocation] = useLocation();
  const isPortal = location.startsWith("/portal") || location.startsWith("/employee-portal");
  if (isPortal) return null;

  const handleOpenChat = () => {
    if (location === "/") {
      window.dispatchEvent(new CustomEvent("volamp:open-chat"));
    } else {
      setLocation("/?surface=chat");
    }
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
      <Route path="/portal" component={CustomerPortal} />
      <Route path="/employee-portal" component={EmployeePortal} />
      <Route path="/about-volamp" component={AboutVolamp} />
      <Route path="/about" component={AboutVolamp} />
      <Route path="/about-us" component={AboutVolamp} />
      <Route path="/footprint" component={AboutVolamp} />
      <Route path="/collaborate" component={CollaboratePage} />
      <Route path="/collaborate-with-us" component={CollaboratePage} />
      <Route path="/partner" component={CollaboratePage} />
      <Route path="/dealership" component={CollaboratePage} />
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
      <Route path="/pay-invoice" component={PayInvoice} />
      <Route path="/pay-an-invoice" component={PayInvoice} />
      <Route path="/payment-guide" component={PayInvoice} />
      <Route path="/payment-desk" component={PayInvoice} />
      <Route path="/calculator" component={CalculatorPage} />
      <Route path="/cable-calculator" component={CalculatorPage} />
      <Route path="/estimator" component={CalculatorPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    <GlobalFloatingActions />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <LocationProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LocationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
