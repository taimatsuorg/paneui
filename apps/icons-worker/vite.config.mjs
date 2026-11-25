import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const docsRequire = createRequire(path.join(root, "apps/docs/package.json"));
const tailwindcss = docsRequire("@tailwindcss/vite").default;

export default {
  root: path.join(here, "web"),
  publicDir: path.join(here, "web/public"),
  plugins: [tailwindcss()],
  resolve: {
    alias: [
      { find: /^@paneui\/ui\//, replacement: path.join(root, "packages/ui/src/") },
      { find: /^@paneui\/core\//, replacement: path.join(root, "packages/core/src/") },
      { find: /^@paneui\/tokens\//, replacement: path.join(root, "packages/tokens/") },
    ],
  },
  build: {
    outDir: path.join(here, ".cloudflare/output/v1/workers/default/assets"),
    emptyOutDir: true,
  },
};
