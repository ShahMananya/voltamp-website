import { describe, it, expect, beforeEach } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("Product Comparison Same-Category Enforcement", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const cable1 = {
    productId: "CAB-001",
    name: "3 Core 2.5 Sqmm Copper Armoured Cable",
    category: "Wires & Cables",
    numericPrice: 120,
  };

  const cable2 = {
    productId: "CAB-002",
    name: "4 Core 4 Sqmm Copper Armoured Cable",
    category: "Wires & Cables",
    numericPrice: 180,
  };

  const lug1 = {
    productId: "LUG-001",
    name: "Ring Type Copper Lug 2.5 Sqmm",
    category: "Lugs",
    numericPrice: 15,
  };

  const switchgear1 = {
    productId: "SWG-001",
    name: "3P 32A MCB C-Curve",
    category: "Switchgear",
    numericPrice: 450,
  };

  // Pure logic engine replicating CompareContext rules
  class CompareEngine {
    items: any[] = [];
    maxItems = 4;

    get category() {
      return this.items.length > 0 ? this.items[0].category : null;
    }

    add(product: any) {
      if (this.items.some((i) => i.productId === product.productId)) {
        return { success: true, reason: "ALREADY_PRESENT" };
      }
      if (this.category && this.category !== product.category) {
        return {
          success: false,
          reason: "CATEGORY_MISMATCH",
          currentCategory: this.category,
          newCategory: product.category,
        };
      }
      if (this.items.length >= this.maxItems) {
        return { success: false, reason: "LIMIT_REACHED" };
      }
      this.items.push(product);
      return { success: true };
    }

    remove(productId: string) {
      this.items = this.items.filter((i) => i.productId !== productId);
    }

    switchCategory(product: any) {
      this.items = [product];
    }

    clear() {
      this.items = [];
    }
  }

  it("should allow adding products of the same category (Wires & Cables)", () => {
    const engine = new CompareEngine();
    const res1 = engine.add(cable1);
    expect(res1.success).toBe(true);
    expect(engine.category).toBe("Wires & Cables");
    expect(engine.items).toHaveLength(1);

    const res2 = engine.add(cable2);
    expect(res2.success).toBe(true);
    expect(engine.items).toHaveLength(2);
  });

  it("STRICT: should REJECT adding Lugs when Wires & Cables is active", () => {
    const engine = new CompareEngine();
    engine.add(cable1);
    expect(engine.category).toBe("Wires & Cables");

    // Attempting to add Lug to Cable comparison
    const res = engine.add(lug1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe("CATEGORY_MISMATCH");
    expect(res.currentCategory).toBe("Wires & Cables");
    expect(res.newCategory).toBe("Lugs");

    // Shortlist should still only have the cable
    expect(engine.items).toHaveLength(1);
    expect(engine.items[0].productId).toBe("CAB-001");
  });

  it("STRICT: should REJECT adding Switchgear when Wires & Cables is active", () => {
    const engine = new CompareEngine();
    engine.add(cable1);

    const res = engine.add(switchgear1);
    expect(res.success).toBe(false);
    expect(res.reason).toBe("CATEGORY_MISMATCH");
    expect(engine.items).toHaveLength(1);
  });

  it("should allow switching category explicitly", () => {
    const engine = new CompareEngine();
    engine.add(cable1);
    expect(engine.category).toBe("Wires & Cables");

    // User accepts to switch category to Lugs
    engine.switchCategory(lug1);
    expect(engine.category).toBe("Lugs");
    expect(engine.items).toHaveLength(1);
    expect(engine.items[0].productId).toBe("LUG-001");
  });

  it("should cap comparison at maximum 4 items", () => {
    const engine = new CompareEngine();
    for (let i = 1; i <= 4; i++) {
      engine.add({
        productId: `CAB-00${i}`,
        name: `Cable ${i}`,
        category: "Wires & Cables",
      });
    }
    expect(engine.items).toHaveLength(4);

    // 5th item
    const res5 = engine.add({
      productId: "CAB-005",
      name: "Cable 5",
      category: "Wires & Cables",
    });
    expect(res5.success).toBe(false);
    expect(res5.reason).toBe("LIMIT_REACHED");
    expect(engine.items).toHaveLength(4);
  });

  it("should reset category lock when shortlist is cleared", () => {
    const engine = new CompareEngine();
    engine.add(cable1);
    expect(engine.category).toBe("Wires & Cables");

    engine.clear();
    expect(engine.category).toBeNull();
    expect(engine.items).toHaveLength(0);

    // Now adding Lug succeeds since list was cleared
    const res = engine.add(lug1);
    expect(res.success).toBe(true);
    expect(engine.category).toBe("Lugs");
  });
});
