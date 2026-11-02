import { copyFile, readFile, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const routes = JSON.parse(
  await readFile(
    new URL("../../apps/native/docs/routes.json", import.meta.url),
    "utf8",
  ),
);
const root = new URL("../../apps/native/dist/", import.meta.url);
const base = (process.env.NATIVE_BASE_PATH ?? "").replace(/\/$/, "");

// The web bundler leaves CSS font URLs untouched. Export the shared font files with the documents.
const require = createRequire(
  new URL("../../packages/tokens/package.json", import.meta.url),
);
await mkdir(new URL("fonts/", root), { recursive: true });
let fontCss = "";
for (const family of ["noto-sans", "noto-sans-sc", "jetbrains-mono", "source-serif-4", "noto-serif-sc"]) {
  const cssPath = require.resolve(`@fontsource-variable/${family}/wght.css`);
  const css = await readFile(cssPath, "utf8");
  await copyFile(join(dirname(cssPath), "LICENSE"), new URL(`fonts/${family}-LICENSE.txt`, root));
  const files = [...css.matchAll(/url\(\.\/files\/([^\)]+)\)/g)].map(
    (match) => match[1],
  );
  await Promise.all(
    files.map((file) =>
      copyFile(
        join(dirname(cssPath), "files", file),
        new URL(`fonts/${file}`, root),
      ),
    ),
  );
  fontCss += css.replace(/url\(\.\/files\/([^\)]+)\)/g, 'url("./fonts/$1")');
}
await writeFile(new URL("fonts.css", root), fontCss);

await copyFile(new URL("../../apps/docs/public/icon.svg", import.meta.url), new URL("icon.svg", root));

const html = (await readFile(new URL("index.html", root), "utf8")).replace(
  "</head>",
  `<link rel="stylesheet" href="${base}/fonts.css"><link rel="icon" type="image/svg+xml" href="${base}/icon.svg"></head>`,
);
await writeFile(new URL("index.html", root), html);
for (const route of routes.filter(Boolean)) {
  await mkdir(new URL(`${route}/`, root), { recursive: true });
  await writeFile(
    new URL(`${route}/index.html`, root),
    html.replace(
      "<title>paneui Native</title>",
      `<title>${route} · paneui Native</title>`,
    ),
  );
}
console.log(`Exported ${routes.length} Native docs routes with shared fonts`);
