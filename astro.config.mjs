// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// DGTL House — Free Google Ad Grants Audit landing.
// Static output; Tailwind v4 wired through the Vite plugin (same setup as the
// `nonprofit` reference project) so the ported design tokens resolve identically.
// `site` powers canonical/OG absolute URLs and the generated sitemap.
export default defineConfig({
  site: "https://grants.dgtl-house.com",
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
  // Single landing page → inline the stylesheet so first paint needs no extra
  // render-blocking CSS round-trip.
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
