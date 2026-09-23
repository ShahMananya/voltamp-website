import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createQuickOrder, getQuickOrderById, getQuickOrders } from "./db";

describe("Quick Order Product Add / Remove & Submission Flow", () => {
  it("generates a unique Quick Order ID starting with QO-", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    const result = await caller.quickOrder.submit({
      customerName: "Rajesh Sharma",
      phone: "+91 98765 43210",
      companyName: "Mega Infra Ltd",
      location: "Ahmedabad, Gujarat, India",
      items: [
        { name: "Finolex 1.5 Sqmm Wire", quantity: 10 },
        { name: "300 SQMM Copper Cable", quantity: 2 },
      ],
      notes: "Urgent site delivery required.",
    });

    expect(result.success).toBe(true);
    expect(result.quickOrderId).toMatch(/^QO-\d{4}-\d{5}$/);
    expect(result.order.customerName).toBe("Rajesh Sharma");
  });

  it("strictly excludes removed products from the submitted order data", async () => {
    // Simulating user starting with 3 products:
    // 1. Finolex 1.5 Sqmm Wire (10)
    // 2. Polycab 2.5 Sqmm Wire (5)
    // 3. 300 SQMM Copper Cable (2)
    // User removes Polycab, submitting ONLY the remaining 2 products.
    const initialProducts = [
      { name: "Finolex 1.5 Sqmm Wire", quantity: 10 },
      { name: "Polycab 2.5 Sqmm Wire", quantity: 5 },
      { name: "300 SQMM Copper Cable", quantity: 2 },
    ];

    // Remove Polycab:
    const remainingProducts = initialProducts.filter((p) => p.name !== "Polycab 2.5 Sqmm Wire");

    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    const result = await caller.quickOrder.submit({
      customerName: "Contractor Patel",
      phone: "9876500000",
      items: remainingProducts,
    });

    const parsedItems = JSON.parse(result.order.items);
    expect(parsedItems).toHaveLength(2);
    expect(parsedItems.map((i: any) => i.name)).toEqual([
      "Finolex 1.5 Sqmm Wire",
      "300 SQMM Copper Cable",
    ]);
    expect(parsedItems.some((i: any) => i.name.includes("Polycab"))).toBe(false);
  });

  it("rejects quick order submission when all items are blank or empty", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    // Case 1: Empty items array
    await expect(
      caller.quickOrder.submit({
        customerName: "Test User",
        phone: "9876543210",
        items: [],
      })
    ).rejects.toThrow("At least one valid product is required");

    // Case 2: Item with blank/whitespace name
    await expect(
      caller.quickOrder.submit({
        customerName: "Test User",
        phone: "9876543210",
        items: [{ name: "   ", quantity: 1 }],
      })
    ).rejects.toThrow("Product name is required");
  });

  it("allows retrieval of submitted order by unique Quick Order ID", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    const submitted = await caller.quickOrder.submit({
      customerName: "Deepak Construction",
      phone: "9512365582",
      items: [{ name: "Industrial MCB 63A", quantity: 4 }],
    });

    const fetched = await caller.quickOrder.getById({
      quickOrderId: submitted.quickOrderId,
    });

    expect(fetched).not.toBeNull();
    expect(fetched.quickOrderId).toBe(submitted.quickOrderId);
    expect(fetched.customerName).toBe("Deepak Construction");
  });

  it("allows employees to view submitted quick orders in employee queue", async () => {
    const employeeCaller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: {
        id: 1,
        openId: "emp-admin-01",
        email: "admin@volampelektrikals.com",
        name: "Admin",
        role: "admin",
        accountType: "employee",
        employeeStatus: "approved",
      } as any,
    });

    const orders = await employeeCaller.quickOrder.list();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
  });
});
