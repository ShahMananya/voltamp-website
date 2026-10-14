import { describe, expect, it } from "vitest";
import { parseVoiceOrderText } from "./services/voiceOrderParser";

describe("AI Voice Ordering Parser & Inventory Recognition", () => {
  it("accurately extracts multi-product voice requirements and matches exact catalog SKUs", () => {
    const speech =
      "I need 10 pieces of Polycab 1.5 sq mm single-core unarmoured copper cable, 5 pieces of Polycab 2.5 sq mm cable, and 2 LK power contactors 3 pole 9 amp.";

    const result = parseVoiceOrderText(speech, "en-IN");

    expect(result.success).toBe(true);
    expect(result.totalItemsDetected).toBe(3);

    // Item 1: 10 pcs Polycab 1.5 sq mm single-core unarmoured copper cable
    const item1 = result.items[0];
    expect(item1.detectedQuantity).toBe(10);
    expect(item1.detectedBrand).toBe("Polycab");
    expect(item1.detectedSize).toBe("1.5 SQMM");
    expect(item1.matchedProduct).not.toBeNull();
    expect(item1.matchedProduct?.productId).toBe("CAB-000004");
    expect(item1.matchedProduct?.name).toBe("1.5 SQMM X 1 CORE Unarmoured Copper CABLE");

    // Item 2: 5 pcs Polycab 2.5 sq mm cable
    const item2 = result.items[1];
    expect(item2.detectedQuantity).toBe(5);
    expect(item2.detectedBrand).toBe("Polycab");
    expect(item2.detectedSize).toBe("2.5 SQMM");
    expect(item2.matchedProduct).not.toBeNull();
    expect(item2.matchedProduct?.productId).toBe("CAB-000005");
    expect(item2.matchedProduct?.name).toBe("2.5 SQMM X 1 CORE Unarmoured Copper CABLE");

    // Item 3: 2 LK power contactors 3 pole 9 amp
    const item3 = result.items[2];
    expect(item3.detectedQuantity).toBe(2);
    expect(item3.detectedBrand).toBe("LK");
    expect(item3.matchedProduct).not.toBeNull();
    expect(item3.matchedProduct?.productId).toBe("SWG-000001");
    expect(item3.matchedProduct?.name).toBe("Power Contactors 3P 9A");
  });

  it("handles Hindi and Gujarati voice inputs with number word recognition", () => {
    const hindiSpeech = "मुझे 10 पीस पॉलीकैब 1.5 sq mm केबल चाहिए और 2 एलके पावर कॉन्टैक्टर 3 पोल 9 एम्प";
    const hindiResult = parseVoiceOrderText(hindiSpeech, "hi-IN");

    expect(hindiResult.totalItemsDetected).toBe(2);
    expect(hindiResult.items[0].detectedQuantity).toBe(10);
    expect(hindiResult.items[0].matchedProduct?.productId).toBe("CAB-000004");
    expect(hindiResult.items[1].detectedQuantity).toBe(2);
    expect(hindiResult.items[1].matchedProduct?.productId).toBe("SWG-000001");
  });

  it("handles Gujarati voice inputs and populates candidates when multiple matches exist", () => {
    const gujaratiSpeech = "મને 5 નંગ પોલીકેબ 2.5 સ્ક્વેર એમએમ કેબલ જોઈએ છે અને 1 નંગ એલકે પાવર કોન્ટેક્ટર";
    const gujResult = parseVoiceOrderText(gujaratiSpeech, "gu-IN");

    expect(gujResult.totalItemsDetected).toBe(2);
    expect(gujResult.items[0].detectedQuantity).toBe(5);
    expect(gujResult.items[0].matchedProduct?.productId).toBe("CAB-000005");
    expect(gujResult.items[0].candidates.length).toBeGreaterThan(0);
    expect(gujResult.items[1].detectedQuantity).toBe(1);
    expect(gujResult.items[1].matchedProduct?.brand).toBe("LK");
  });
});
