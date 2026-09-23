import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCATION,
  formatLocationName,
  extractCountryFromLocation,
} from "../client/src/contexts/LocationContext";

// Test helper mirroring LocationModal logic
const isGlobalLocation = (loc: string) => {
  const lower = loc.toLowerCase();
  const isIndia =
    lower.includes("india") ||
    lower.includes("gujarat") ||
    lower.includes("maharashtra") ||
    lower.includes("delhi") ||
    lower.includes("karnataka") ||
    lower.includes("tamil nadu") ||
    lower.includes("telangana") ||
    lower.includes("west bengal") ||
    lower.includes("rajasthan") ||
    lower.includes("madhya pradesh") ||
    lower.includes("punjab") ||
    lower.includes("uttar pradesh") ||
    lower.includes("haryana");
  return !isIndia;
};

const extractCityName = (loc: string) => {
  return loc.split(/[·,.]/)[0]?.trim() || loc;
};

const formatWelcomeTitle = (loc: string) => {
  const city = extractCityName(loc);
  return `Welcome to VOLAMP from ${city}!`;
};

const generateTagline = (loc: string) => {
  const isInternational = isGlobalLocation(loc);
  if (isInternational) {
    return `Powering world-class infrastructure in ${loc} with certified, precision-engineered cables and trusted global export logistics.`;
  }
  return `Powering your infrastructure projects in ${loc} with certified, precision-engineered cables and dependable India-wide & global dispatch.`;
};

describe("Global & Domestic Location Logic & Formatting", () => {
  it("defaults to Ahmedabad · Gujarat · India", () => {
    expect(DEFAULT_LOCATION).toBe("Ahmedabad · Gujarat · India");
  });

  it("extracts city name cleanly for single words, middots, commas, and dots", () => {
    expect(formatWelcomeTitle("Mumbai · Maharashtra")).toBe("Welcome to VOLAMP from Mumbai!");
    expect(formatWelcomeTitle("Dubai · UAE")).toBe("Welcome to VOLAMP from Dubai!");
    expect(formatWelcomeTitle("London · UK")).toBe("Welcome to VOLAMP from London!");
    expect(formatWelcomeTitle("New York · USA")).toBe("Welcome to VOLAMP from New York!");
    expect(formatWelcomeTitle("Ahmedabad.Gujarta.India")).toBe("Welcome to VOLAMP from Ahmedabad!");
    expect(formatWelcomeTitle("Frankfurt, Germany")).toBe("Welcome to VOLAMP from Frankfurt!");
    expect(formatWelcomeTitle("Singapore")).toBe("Welcome to VOLAMP from Singapore!");
  });

  it("identifies international vs domestic locations correctly", () => {
    // International hubs
    expect(isGlobalLocation("Dubai · UAE")).toBe(true);
    expect(isGlobalLocation("London · UK")).toBe(true);
    expect(isGlobalLocation("New York · USA")).toBe(true);
    expect(isGlobalLocation("Frankfurt · Germany")).toBe(true);
    expect(isGlobalLocation("Singapore · APAC")).toBe(true);
    expect(isGlobalLocation("Sydney · Australia")).toBe(true);
    expect(isGlobalLocation("Riyadh · Saudi Arabia")).toBe(true);
    expect(isGlobalLocation("Tokyo · Japan")).toBe(true);

    // Domestic Indian hubs
    expect(isGlobalLocation("Ahmedabad · Gujarat (HQ)")).toBe(false);
    expect(isGlobalLocation("Mumbai · Maharashtra")).toBe(false);
    expect(isGlobalLocation("Delhi NCR")).toBe(false);
    expect(isGlobalLocation("Bengaluru · Karnataka")).toBe(false);
    expect(isGlobalLocation("Ahmedabad.Gujarta.India")).toBe(false);
  });

  it("generates international vs domestic customized taglines", () => {
    const dubaiTagline = generateTagline("Dubai · UAE");
    expect(dubaiTagline).toContain("world-class infrastructure in Dubai · UAE");
    expect(dubaiTagline).toContain("global export logistics");

    const londonTagline = generateTagline("London · UK");
    expect(londonTagline).toContain("world-class infrastructure in London · UK");
    expect(londonTagline).toContain("global export logistics");

    const ahmedabadTagline = generateTagline("Ahmedabad.Gujarta.India");
    expect(ahmedabadTagline).toContain("Ahmedabad.Gujarta.India");
    expect(ahmedabadTagline).toContain("dependable India-wide & global dispatch");
  });

  it("formats automatically detected IP locations accurately", () => {
    expect(
      formatLocationName("Jersey City", "New Jersey", "United States of America", "US")
    ).toBe("Jersey City · New Jersey · USA");

    expect(
      formatLocationName("Ahmedabad", "Gujarat", "India", "IN")
    ).toBe("Ahmedabad · Gujarat · India");

    expect(
      formatLocationName("London", "England", "United Kingdom", "GB")
    ).toBe("London · England · UK");

    expect(
      formatLocationName("Dubai", "Dubai", "United Arab Emirates", "AE")
    ).toBe("Dubai · UAE");
  });

  it("generates 'Let's Build [Country] Together' breadcrumbs accurately based on location access", () => {
    const makeBreadcrumb = (loc: string) => `Let's Build ${extractCountryFromLocation(loc)} Together`;

    expect(makeBreadcrumb("Jersey City · New Jersey · USA")).toBe("Let's Build USA Together");
    expect(makeBreadcrumb("Ahmedabad · Gujarat · India")).toBe("Let's Build India Together");
    expect(makeBreadcrumb("Ahmedabad.Gujarta.India")).toBe("Let's Build India Together");
    expect(makeBreadcrumb("London · England · UK")).toBe("Let's Build UK Together");
    expect(makeBreadcrumb("Dubai · UAE")).toBe("Let's Build UAE Together");
    expect(makeBreadcrumb("Frankfurt · Germany")).toBe("Let's Build Germany Together");
    expect(makeBreadcrumb("Sydney · Australia")).toBe("Let's Build Australia Together");
    expect(makeBreadcrumb("Singapore · APAC")).toBe("Let's Build Singapore Together");
    expect(makeBreadcrumb("Tokyo · Japan")).toBe("Let's Build Japan Together");
    expect(makeBreadcrumb("Toronto · Canada")).toBe("Let's Build Canada Together");
  });
});
