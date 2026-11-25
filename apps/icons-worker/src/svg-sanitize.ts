import type { IconInput, IconRecord, IconVariant } from "./types.ts";

const NAME_RE = /^[a-z][a-z0-9-]{1,48}$/;
const COMPONENT_RE = /^[A-Z][A-Za-z0-9]{1,60}Icon$/;
const ALLOWED_TAGS = new Set(["path", "circle", "rect", "ellipse", "line", "polyline", "polygon"]);
const ALLOWED_ATTRS = new Set([
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "width",
  "height",
  "points",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "fill-rule",
  "clip-rule",
  "opacity",
]);

const FORBIDDEN_PATTERNS = [
  /<\s*script\b/i,
  /<\s*foreignobject\b/i,
  /<\s*style\b/i,
  /<\s*iframe\b/i,
  /<\s*object\b/i,
  /<\s*embed\b/i,
  /<\s*image\b/i,
  /<\s*use\b/i,
  /<\s*link\b/i,
  /\bon[a-z]+\s*=/i,
  /javascript:/i,
  /data:/i,
  /xlink:href/i,
  /\bhref\s*=/i,
  /url\s*\(/i,
  /expression\s*\(/i,
];

const VALID_NUMBER_LIST = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[\s,]+[-+]?(?:\d+\.?\d*|\.\d+))*$/;
const VALID_PATH_D = /^[MmLlHhVvCcSsQqTtAaZz0-9.,+\-\s]+$/;

export function toComponentName(name: string): string {
  const pascal = name
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  return pascal.endsWith("Icon") ? pascal : `${pascal}Icon`;
}

function normalizeAttrName(attr: string): string {
  return attr
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function validateAttribute(name: string, value: string): string {
  const v = value.trim();
  if (!ALLOWED_ATTRS.has(name)) {
    throw new Error(`Attribute "${name}" is not allowed on SVG primitives.`);
  }
  if (name === "fill" || name === "stroke") {
    if (v !== "currentColor" && v !== "none" && v !== "var(--primary, currentColor)") {
      throw new Error(`Attribute ${name}="${v}" must use "currentColor" or "none".`);
    }
    return v;
  }
  if (name === "stroke-linecap") {
    if (!["round", "butt", "square"].includes(v)) throw new Error(`Invalid stroke-linecap "${v}".`);
    return v;
  }
  if (name === "stroke-linejoin") {
    if (!["round", "miter", "bevel"].includes(v)) throw new Error(`Invalid stroke-linejoin "${v}".`);
    return v;
  }
  if (name === "fill-rule" || name === "clip-rule") {
    if (v !== "evenodd" && v !== "nonzero") throw new Error(`Invalid ${name} "${v}".`);
    return v;
  }
  if (name === "d") {
    if (!v || !VALID_PATH_D.test(v)) throw new Error("Invalid SVG path data.");
    return v.replace(/\s+/g, " ").trim();
  }
  if (name === "points") {
    if (!v || !VALID_NUMBER_LIST.test(v)) throw new Error("Invalid SVG points attribute.");
    return v;
  }
  if (!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(v)) {
    throw new Error(`Invalid numeric value "${v}" for ${name}.`);
  }
  return v;
}

export function sanitizeSvg(rawSvgOrBody: string): { body: string; svg: string } {
  const input = rawSvgOrBody.trim();
  if (!input) throw new Error("Either svg or body is required.");
  if (input.length > 24000) throw new Error("SVG payload exceeds 24KB limit.");

  for (const re of FORBIDDEN_PATTERNS) {
    if (re.test(input)) {
      throw new Error("SVG contains forbidden elements, scripts, or event handlers.");
    }
  }

  let inner = input;
  let rootStroke: string | undefined;
  let rootFill: string | undefined;

  const svgWrapperMatch = /^<svg\b([^>]*)>([\s\S]*)<\/svg>$/i.exec(input);
  if (svgWrapperMatch) {
    const [, rootAttrs, children] = svgWrapperMatch;
    inner = children.trim();
    for (const m of rootAttrs.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      const k = normalizeAttrName(m[1]);
      const v = (m[2] ?? m[3] ?? "").trim();
      if (k === "viewbox" && !/^0\s+0\s+24\s+24$/.test(v.replace(/\s+/g, " "))) {
        throw new Error('Root <svg> viewBox must be "0 0 24 24".');
      }
      if (k === "stroke") {
        if (v !== "currentColor" && v !== "none") {
          throw new Error(`Root stroke="${v}" must use "currentColor" or "none".`);
        }
        rootStroke = v;
      }
      if (k === "fill") {
        if (v !== "none" && v !== "currentColor") {
          throw new Error(`Root fill="${v}" must use "none" or "currentColor".`);
        }
        rootFill = v;
      }
    }
  } else if (/<\s*svg\b/i.test(input)) {
    throw new Error("Malformed <svg> wrapper.");
  }

  if (!inner) throw new Error("SVG contains no drawable primitives.");

  // Ensure every character outside tags is whitespace/comments only.
  const outsideTags = inner.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "").trim();
  if (outsideTags.length > 0) {
    throw new Error("Unexpected text content inside SVG.");
  }

  const cleanedInner = inner.replace(/<!--[\s\S]*?-->/g, "").trim();
  const elementRe = /<\/?([a-zA-Z0-9-]+)([^>]*?)(\/?)>/g;
  const serialized: string[] = [];
  let count = 0;

  for (const match of cleanedInner.matchAll(elementRe)) {
    const [full, rawTag, rawAttrs] = match;
    if (full.startsWith("</")) {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) throw new Error(`SVG element <${tag}> is not allowed.`);
      continue;
    }
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      throw new Error(`SVG element <${tag}> is not allowed.`);
    }
    count++;
    if (count > 64) throw new Error("Too many SVG primitives (max 64).");

    const attrs = new Map<string, string>();
    let attrSrc = rawAttrs.trim();
    if (attrSrc.endsWith("/")) attrSrc = attrSrc.slice(0, -1).trim();

    for (const a of attrSrc.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      const attrName = normalizeAttrName(a[1]);
      const attrVal = validateAttribute(attrName, a[2] ?? a[3] ?? "");
      attrs.set(attrName, attrVal);
    }

    // Check for leftover unparsed tokens inside attributes.
    const leftover = attrSrc.replace(/([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"[^"]*"|'[^']*')/g, "").trim();
    if (leftover.length > 0) {
      throw new Error(`Malformed attributes on <${tag}>.`);
    }

    if (!attrs.has("stroke") && rootStroke === "currentColor" && attrs.get("fill") !== "currentColor") {
      attrs.set("stroke", "currentColor");
    }
    if (!attrs.has("fill") && rootFill === "currentColor") {
      attrs.set("fill", "currentColor");
    }
    if (!attrs.has("stroke") && !attrs.has("fill")) {
      attrs.set("stroke", "currentColor");
    }

    const attrString = [...attrs.entries()].map(([k, v]) => `${k}="${escapeAttr(v)}"`).join(" ");
    serialized.push(`<${tag} ${attrString} />`);
  }

  if (serialized.length === 0) {
    throw new Error("SVG must contain at least one primitive element.");
  }

  const body = serialized.join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return { body, svg };
}

export function normalizeIconInput(input: IconInput, now = new Date().toISOString()): Omit<IconRecord, "source"> {
  const name = String(input.name ?? "").trim().toLowerCase();
  if (!NAME_RE.test(name)) {
    throw new Error('Invalid icon name. Use kebab-case (2–49 chars matching /^[a-z][a-z0-9-]{1,48}$/).');
  }

  const component = input.component?.trim() || toComponentName(name);
  if (!COMPONENT_RE.test(component)) {
    throw new Error('Invalid component name. Use PascalCase ending in "Icon" (e.g. "RocketIcon").');
  }

  const category = String(input.category ?? "UI").trim() || "UI";
  if (category.length > 40) throw new Error("Category must be 40 characters or fewer.");

  const variant: IconVariant = input.variant === "filled" ? "filled" : "outline";

  const rawTags = Array.isArray(input.tags)
    ? input.tags
    : typeof input.tags === "string"
      ? input.tags.split(",")
      : [];

  const tagSet = new Set<string>([
    name,
    category.toLowerCase(),
    variant,
    ...name.split("-").filter(Boolean),
    ...rawTags.map((t) => String(t).trim().toLowerCase()).filter(Boolean),
  ]);
  const tags = [...tagSet].slice(0, 24);

  const { body, svg } = sanitizeSvg(input.svg ?? input.body ?? "");

  return {
    name,
    component,
    category,
    tags,
    variant,
    body,
    svg,
    jsx: `<${component} />`,
    createdAt: now,
    updatedAt: now,
  };
}
