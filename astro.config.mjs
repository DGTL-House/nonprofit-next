// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// DGTL House — Free Google Ad Grants Audit landing.
// Static output; Tailwind v4 wired through the Vite plugin (same setup as the
// `nonprofit` reference project) so the ported design tokens resolve identically.
export default defineConfig({
  site: "https://grants.dgtl-house.com",
  vite: {
    plugins: [tailwindcss()],
  },
});
