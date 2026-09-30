import React from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  FileText,
  PackageSearch,
  Sparkles,
  Lock,
  LogIn,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function CartDrawer() {
  const { user } = useAuth();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount,
    totalAmount,
    isCartOpen,
    closeCart,
  } = useCart();

  if (!isCartOpen) return null;

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    if (!user) {
      toast.error("Account Required to Place Order", {
        description: "Please login or create your customer account to place orders with Volamp Elektrikals.",
      });
      window.dispatchEvent(
        new CustomEvent("volamp:open-auth", { detail: { accountType: "customer" } })
      );
      return;
    }

    const itemsList = items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.name}* (Qty: ${it.quantity} ${it.unit || "unit"}${
            it.price ? ` @ ₹${it.price.toLocaleString("en-IN")}` : ""
          })`
      )
      .join("\n");

    const message = `Hello Volamp Supply Desk, I am logged in as *${user.name || user.email}* (Account ID: ${user.id}). I would like to place an official order for the following items in my cart:\n\n${itemsList}\n\nEstimated Subtotal: ₹${totalAmount.toLocaleString(
      "en-IN"
    )}\n\nPlease confirm availability, GST input credit invoice, and dispatch schedule.`;

    const waUrl = `https://wa.me/919512365582?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp Supply Desk...");
  };

  const handleOpenRFQ = () => {
    if (!user) {
      toast.error("Account Required to Request RFQ", {
        description: "Please login or create your customer account to generate official BOM quotations.",
      });
      window.dispatchEvent(
        new CustomEvent("volamp:open-auth", { detail: { accountType: "customer" } })
      );
      return;
    }

    closeCart();
    const details = items
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.name} | Qty: ${it.quantity} ${it.unit || "unit"}${
            it.sku ? ` | SKU: ${it.sku}` : ""
          }`
      )
      .join("\n");

    window.dispatchEvent(
      new CustomEvent("volamp:open-enquire", {
        detail: {
          category: items[0]?.category || "Wire Cables (LT / HT / Armoured / FRLS)",
          product: `Cart BOM (${items.length} items for ${user.name || user.email}):\n${details}`,
        },
      })
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 print:hidden"
      role="dialog"
      aria-modal="true"
      onClick={closeCart}
    >
      <aside
        className="relative w-full max-w-[480px] h-full bg-white text-[#102b42] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#4d1217] via-[#5c161d] to-[#6b2024] text-white flex items-center justify-between border-b border-[#822a31] shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  VOLAMP SUPPLY CART
                </span>
                <span className="text-xs font-semibold text-white/80">
                  ({totalCount} {totalCount === 1 ? "item" : "items"})
                </span>
              </div>
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-white">
                Project BOM & Orders
              </h3>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Free Dispatch / Assurance Strip */}
        <div className="px-5 py-2 bg-[#fff8f0] border-b border-[#fed7aa] flex items-center justify-between text-xs text-[#7c2d12] shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-[#c56718] shrink-0" />
            <span className="font-medium text-[11px]">Factory Direct MTC · Pan-India Dispatch</span>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-stone-500 hover:text-red-600 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-stone-50/50">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="size-16 rounded-full bg-amber-50 border border-amber-200 text-[#c56718] flex items-center justify-center mx-auto shadow-xs">
                <ShoppingCart className="size-8 opacity-60" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-stone-800">Your cart is empty</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Browse our industrial supply catalog to add cables, switchgears, conduits, and accessories to your project requisition.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={() => {
                    closeCart();
                    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded-lg bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-semibold transition-colors"
                >
                  Explore Categories
                </button>
                <button
                  onClick={handleOpenRFQ}
                  className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Request Custom RFQ
                </button>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white border border-stone-200/80 shadow-xs flex items-start gap-3 hover:border-amber-300 transition-colors"
              >
                {/* Thumbnail */}
                <div className="size-16 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={item.image || "/products/cables.jpg"}
                    alt={item.name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-bold text-stone-900 leading-tight line-clamp-2">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-400 hover:text-red-500 transition-colors p-0.5 shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {item.detail && (
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">
                      {item.detail}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100">
                    <div className="text-xs font-bold text-[#c56718]">
                      {item.price
                        ? `₹${(item.price * item.quantity).toLocaleString("en-IN")}`
                        : "Quote on Request"}
                      {item.price && (
                        <span className="text-[10px] text-stone-400 font-normal ml-1">
                          (₹{item.price.toLocaleString("en-IN")}/{item.unit || "unit"})
                        </span>
                      )}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="px-2.5 py-0.5 text-xs font-semibold text-stone-800 min-w-7 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 bg-white border-t border-stone-200 space-y-3 shrink-0">
            {/* Subtotal */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600 font-medium">Estimated Subtotal:</span>
                <strong className="text-lg font-bold text-stone-900 font-['Space_Grotesk']">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </strong>
              </div>
              <p className="text-[10px] text-stone-400">
                GST, freight and commercial discounts calculated upon formal quotation verification.
              </p>
            </div>

            {/* Account Status / Requirement Banner */}
            {!user ? (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-semibold text-amber-900">
                    Account required to place order
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("volamp:open-auth", { detail: { accountType: "customer" } })
                    );
                  }}
                  className="text-[11px] font-bold text-[#c56718] hover:text-[#9a3412] flex items-center gap-1 shrink-0 underline cursor-pointer"
                >
                  <LogIn className="size-3" />
                  <span>Login / Register</span>
                </button>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-[11px] text-emerald-800">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Logged in as <strong>{user.name || user.email}</strong></span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-900 uppercase">
                  Verified
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
              >
                <MessageCircle className="size-4 shrink-0" />
                <span>WhatsApp Order</span>
              </button>

              <button
                onClick={handleOpenRFQ}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#c56718] to-[#b45309] hover:from-[#d97706] hover:to-[#c56718] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
              >
                <span>Request Official RFQ</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
