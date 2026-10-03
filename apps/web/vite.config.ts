import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { brand } from "@govpeep/contracts";

const escapeHtml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      {
        name: "product-branding",
        transformIndexHtml: (html) =>
          html
            .replaceAll("__PRODUCT_NAME__", escapeHtml(brand.name))
            .replaceAll(
              "__PRODUCT_DESCRIPTION__",
              escapeHtml(brand.description),
            ),
      },
    ],
    server: {
      proxy: {
        "/api": {
          target:
            process.env.API_PROXY_TARGET ||
            env.API_PROXY_TARGET ||
            "http://127.0.0.1:8787",
          changeOrigin: true,
        },
      },
    },
  };
});
