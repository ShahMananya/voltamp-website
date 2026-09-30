import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  category?: string;
  sku?: string;
  detail?: string;
  price?: number;
  unit?: string;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "volamp_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse cart items from localStorage", e);
      }
    }
    return [
      {
        id: "sample-cable-1",
        name: "Polycab 4C x 185 Sqmm XLPE Armoured Cable",
        category: "Wire Cables",
        sku: "CAB-ARM-4C185",
        detail: "1.1kV Grade, Aluminium Conductor, IS 7098",
        price: 1850,
        unit: "per meter",
        quantity: 100,
        image: "/products/cables.jpg",
      },
    ];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart items", e);
    }
  }, [items]);

  useEffect(() => {
    const handleOpen = () => setIsCartOpen(true);
    const handleToggle = () => setIsCartOpen((prev) => !prev);
    window.addEventListener("volamp:open-cart", handleOpen);
    window.addEventListener("volamp:toggle-cart", handleToggle);
    return () => {
      window.removeEventListener("volamp:open-cart", handleOpen);
      window.removeEventListener("volamp:toggle-cart", handleToggle);
    };
  }, []);

  const addItem = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const addQty = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === newItem.id || i.name === newItem.name);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += addQty;
        return updated;
      }
      return [...prev, { ...newItem, quantity: addQty }];
    });
    toast.success("Added to Cart", {
      description: `${newItem.name} (${addQty} ${newItem.unit || "unit"}) added to your supply cart.`,
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        toast.info("Removed from Cart", {
          description: `${item.name} was removed.`,
        });
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.info("Cart cleared");
  };

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = items.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
