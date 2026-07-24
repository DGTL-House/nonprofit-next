// Shared content + config for the DGTL House audit landing.

// Primary CTA target. The reference project points its CTAs at a LeadConnector
// booking widget; here we anchor to the on-page booking/final-CTA section so the
// page is fully functional without a backend. Swap to a real URL when wired up.
export const BOOK_HREF = "#book";
export const BOOK_CALL =
  "https://api.dgtl-house.com/widget/bookings/dgtlhouse-nonprofits";
export const CTA_PRIMARY = "Get My Free Audit";
export const CTA_SECONDARY = "Book a Free Audit";

// The three switchable blocks called out in the brief.
export const SWITCH_BLOCKS = [
  { label: "Case Studies", href: "#case-studies" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Who We Are", href: "#who-we-are" },
] as const;
