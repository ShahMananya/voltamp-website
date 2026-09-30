import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface CompareProduct {
  productId: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  sku?: string;
  price?: string;
  numericPrice?: number;
  discount?: string;
  availability?: string;
  size?: string;
  material?: string;
  unit?: string;
  image?: string;
  specifications?: any;
}

interface CompareContextType {
  compareItems: CompareProduct[];
  compareCategory: string | null;
  addToCompare: (product: CompareProduct) => { success: boolean; reason?: string };
  removeFromCompare: (productId: string) => void;
  toggleCompare: (product: CompareProduct) => void;
  clearCompare: () => void;
  isProductInCompare: (productId: string) => boolean;
  switchCategoryAndAdd: (product: CompareProduct) => void;
  pendingMismatchProduct: CompareProduct | null;
  setPendingMismatchProduct: (prod: CompareProduct | null) => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
  openCompare: () => void;
  closeCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = "volamp_compare_items_v2";
const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareProduct[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed.slice(0, MAX_COMPARE_ITEMS);
        }
      } catch (e) {
        console.error("Failed to parse compare items from localStorage", e);
      }
    }
    return [];
  });

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [pendingMismatchProduct, setPendingMismatchProduct] = useState<CompareProduct | null>(null);

  // Derive the active compare category from the first item
  const compareCategory = compareItems.length > 0 ? compareItems[0].category : null;

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
      } catch (e) {
        console.error("Failed to save compare items to localStorage", e);
      }
    }
  }, [compareItems]);

  const addToCompare = (product: CompareProduct): { success: boolean; reason?: string } => {
    // 1. Check if item already exists
    if (compareItems.some((item) => item.productId === product.productId)) {
      toast.info("Already in comparison", {
        description: `${product.name} is already added to comparison.`,
      });
      return { success: true };
    }

    // 2. Category Check: MUST MATCH SAME CATEGORY
    if (compareCategory && compareCategory !== product.category) {
      // Trigger mismatch modal & toast
      setPendingMismatchProduct(product);
      toast.error("Cannot compare different categories", {
        description: `Current shortlist is comparing '${compareCategory}'. You cannot compare '${product.category}' with '${compareCategory}'.`,
        action: {
          label: `Switch to ${product.category}`,
          onClick: () => switchCategoryAndAdd(product),
        },
        duration: 6000,
      });
      return { success: false, reason: "CATEGORY_MISMATCH" };
    }

    // 3. Limit to MAX_COMPARE_ITEMS
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      toast.warning("Comparison limit reached", {
        description: `You can compare up to ${MAX_COMPARE_ITEMS} products at once. Remove one product to add another.`,
      });
      return { success: false, reason: "LIMIT_REACHED" };
    }

    // 4. Add product
    setCompareItems((prev) => [...prev, product]);
    toast.success("Added to comparison", {
      description: `${product.name} added (${compareItems.length + 1}/${MAX_COMPARE_ITEMS}) in ${product.category}.`,
    });
    return { success: true };
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems((prev) => {
      const filtered = prev.filter((item) => item.productId !== productId);
      if (filtered.length === 0) {
        setIsCompareOpen(false);
      }
      return filtered;
    });
  };

  const switchCategoryAndAdd = (product: CompareProduct) => {
    setCompareItems([product]);
    setPendingMismatchProduct(null);
    toast.success(`Switched comparison to ${product.category}`, {
      description: `${product.name} is now in your comparison shortlist.`,
    });
  };

  const toggleCompare = (product: CompareProduct) => {
    if (isProductInCompare(product.productId)) {
      removeFromCompare(product.productId);
      toast.info("Removed from comparison", {
        description: `${product.name} removed.`,
      });
    } else {
      addToCompare(product);
    }
  };

  const clearCompare = () => {
    setCompareItems([]);
    setIsCompareOpen(false);
    setPendingMismatchProduct(null);
    toast.info("Comparison shortlist cleared");
  };

  const isProductInCompare = (productId: string) => {
    return compareItems.some((item) => item.productId === productId);
  };

  const openCompare = () => {
    if (compareItems.length < 2) {
      toast.info("Add at least 2 products to compare", {
        description: `Select another product from '${compareCategory || "the catalog"}' to view side-by-side comparison.`,
      });
      return;
    }
    setIsCompareOpen(true);
  };

  const closeCompare = () => {
    setIsCompareOpen(false);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        compareCategory,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isProductInCompare,
        switchCategoryAndAdd,
        pendingMismatchProduct,
        setPendingMismatchProduct,
        isCompareOpen,
        setIsCompareOpen,
        openCompare,
        closeCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
