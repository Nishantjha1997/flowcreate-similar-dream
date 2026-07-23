/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Canonical origin baked into index.html's static OG tags at build time.
// Set VITE_SITE_URL in Vercel when the custom domain goes live.
const SITE_URL = (process.env.VITE_SITE_URL ?? "https://flowcreate-similar-dream.vercel.app").replace(/\/$/, "");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: "inject-site-url",
      transformIndexHtml: (html: string) => html.replaceAll("__SITE_URL__", SITE_URL),
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Keep CI and Windows development runs deterministic. The default fork
    // pool intermittently exits workers before Vitest can report results.
    pool: 'threads',
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,
  },
}));
