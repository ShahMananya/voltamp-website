import type { Express, Request, Response } from "express";
import { getQuickOrderById } from "./db";
import { generateQuickOrderPdf, type QuickOrderItem } from "@shared/quickOrderPdf";

export function registerQuickOrderPdfRoute(app: Express) {
  app.get("/api/quickorder/pdf/:quickOrderId", async (req: Request, res: Response) => {
    try {
      const { quickOrderId } = req.params;
      if (!quickOrderId) {
        return res.status(400).send("Quick Order ID required");
      }

      const order = await getQuickOrderById(quickOrderId);
      if (!order) {
        return res.status(404).send("Quick Order not found");
      }

      let parsedItems: QuickOrderItem[] = [];
      try {
        parsedItems = Array.isArray(order.items)
          ? (order.items as unknown as QuickOrderItem[])
          : JSON.parse((order.items as string) || "[]");
      } catch {
        parsedItems = [];
      }

      const doc = generateQuickOrderPdf({
        quickOrderId: order.quickOrderId,
        customerName: order.customerName,
        companyName: order.companyName || undefined,
        phone: order.phone,
        email: order.email || undefined,
        location: order.location || undefined,
        items: parsedItems,
        notes: order.notes || undefined,
        date: new Date(order.createdAt),
      });

      const cleanId = order.quickOrderId.replace(/[^a-zA-Z0-9-_]/g, "");
      const pdfArrayBuffer = doc.output("arraybuffer");
      const pdfBuffer = Buffer.from(pdfArrayBuffer);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="VOLAMP_Invoice_${cleanId}.pdf"`);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(pdfBuffer);
    } catch (err: any) {
      console.error("Failed to stream Quick Order PDF:", err);
      res.status(500).send("Failed to generate PDF document");
    }
  });
}
