/*
 * PaneUI icon set, emoji style: full-colour glossy objects with the same exports as the default
 * rounded set (packages/ui/src/icons/index.tsx). Install over it with
 * `shadcn add <site>/r/icons-emoji.json --overwrite`.
 *
 * Objects use the palette below (vertical gradients, a white shine). UI glyphs (arrows, chevrons,
 * text tools) keep the rounded geometry, heavier, in currentColor so they sit in buttons and text.
 * <Name>FilledIcon exports are the same drawing (this style is filled throughout).
 */
import * as React from "react";
import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number; weight?: "regular" | "bold" };

/* Palette: vertical gradients, light top to deep bottom. */
const PALETTE = {
  red: ["#ff8a80", "#e5322d"],
  orange: ["#ffb35c", "#f06a12"],
  gold: ["#ffe27a", "#f5a913"],
  green: ["#7fe08a", "#22a447"],
  teal: ["#6fe3d4", "#119e93"],
  sky: ["#8fd3ff", "#2b8ef0"],
  blue: ["#7aa8ff", "#2a5fe0"],
  purple: ["#c3a2ff", "#7446e0"],
  pink: ["#ffa6c9", "#e94b8a"],
  paper: ["#ffffff", "#e3e6ee"],
  silver: ["#eef0f5", "#a9afbd"],
  steel: ["#a8b0c0", "#5d6576"],
  graphite: ["#6b7180", "#2c303a"],
  wood: ["#d9a066", "#9a5a2a"],
  glass: ["#e9f6ff", "#9fd2f5"],
} as const;
type Tone = keyof typeof PALETTE;

type Paint = { f: (t: Tone) => string; s: (t: Tone) => string };

function Icon({ size = 18, weight: _w, children, tones, ...props }: IconProps & { tones: Tone[]; children: (p: Paint) => React.ReactNode }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const paint: Paint = { f: (t) => `url(#${id}${t})`, s: (t) => `url(#${id}${t}u)` };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <defs>
        {tones.map((t) => (
          <React.Fragment key={t}>
            <linearGradient id={`${id}${t}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={PALETTE[t][0]} />
              <stop offset="1" stopColor={PALETTE[t][1]} />
            </linearGradient>
            <linearGradient id={`${id}${t}u`} gradientUnits="userSpaceOnUse" x1="0" y1="3" x2="0" y2="21">
              <stop offset="0" stopColor={PALETTE[t][0]} />
              <stop offset="1" stopColor={PALETTE[t][1]} />
            </linearGradient>
          </React.Fragment>
        ))}
      </defs>
      {children(paint)}
    </svg>
  );
}

/* Shared marks. */
const shine = { fill: "#fff", opacity: 0.55 } as const;
const rim = (c: string, w = 0.6) => ({ stroke: c, strokeWidth: w, strokeLinejoin: "round", strokeLinecap: "round" }) as const;
const glyph = (paint: string, w = 3.2) => ({ fill: "none", stroke: paint, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" }) as const;

/* UI glyphs (arrows, chevrons, text tools): the rounded geometry, heavier, in currentColor so they sit in buttons. */
function Glyph({ size = 18, weight: _w, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      {children}
    </svg>
  );
}
const line = { fill: "none", stroke: "currentColor", strokeWidth: 2.25, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const dot = { fill: "currentColor", stroke: "none" } as const;

export const CheckIcon = (p: IconProps) => (
  <Icon {...p} tones={["green"]}>
    {(c) => <path d="M4.8 12.6 l4.6 4.6 L19.2 7" {...glyph(c.s("green"), 3.2)} />}
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M12 4v16M4 12h16" />
  </Glyph>
);

export const MinusIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M4 12h16" />
  </Glyph>
);

export const XIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M6 6l12 12M18 6L6 18" />
  </Glyph>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M6 9l6 6 6-6" />
  </Glyph>
);

export const ChevronUpIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M6 15l6-6 6 6" />
  </Glyph>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M15 6l-6 6 6 6" />
  </Glyph>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M9 6l6 6-6 6" />
  </Glyph>
);

export const ChevronsUpDownIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M7.5 8.5L12 4l4.5 4.5M7.5 15.5L12 20l4.5-4.5" />
  </Glyph>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M4 12h16M14 6l6 6-6 6" />
  </Glyph>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M20 12H4M10 6l-6 6 6 6" />
  </Glyph>
);

export const ArrowUpIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M12 20V4M6 10l6-6 6 6" />
  </Glyph>
);

export const ArrowDownIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M12 4v16M6 14l6 6 6-6" />
  </Glyph>
);

export const ArrowUpRightIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M6.5 17.5l11-11M8 6.5h9.5V16" />
  </Glyph>
);

export const ExternalLinkIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M10 3.5H7.5a4 4 0 0 0-4 4v9a4 4 0 0 0 4 4h9a4 4 0 0 0 4-4V14" />
    <path {...line} d="M14.5 3.5h6v6M20 4l-8.5 8.5" />
  </Glyph>
);

export const MenuIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M4 6h16M4 12h16M4 18h16" />
  </Glyph>
);

export const ListIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M9 6h11M9 12h11M9 18h11" />
    <circle {...dot} cx="4.5" cy="6" r="1.25" />
    <circle {...dot} cx="4.5" cy="12" r="1.25" />
    <circle {...dot} cx="4.5" cy="18" r="1.25" />
  </Glyph>
);

export const MoreHorizontalIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle {...dot} cx="5" cy="12" r="1.4" />
    <circle {...dot} cx="12" cy="12" r="1.4" />
    <circle {...dot} cx="19" cy="12" r="1.4" />
  </Glyph>
);

export const MoreVerticalIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle {...dot} cx="12" cy="5" r="1.4" />
    <circle {...dot} cx="12" cy="12" r="1.4" />
    <circle {...dot} cx="12" cy="19" r="1.4" />
  </Glyph>
);

export const GripVerticalIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle {...dot} cx="9" cy="5.5" r="1.4" />
    <circle {...dot} cx="15" cy="5.5" r="1.4" />
    <circle {...dot} cx="9" cy="12" r="1.4" />
    <circle {...dot} cx="15" cy="12" r="1.4" />
    <circle {...dot} cx="9" cy="18.5" r="1.4" />
    <circle {...dot} cx="15" cy="18.5" r="1.4" />
  </Glyph>
);

export const UndoIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M8.5 4L4 8.5 8.5 13" />
    <path {...line} d="M4.5 8.5H14a5.5 5.5 0 0 1 0 11h-3.5" />
  </Glyph>
);

export const PhoneIcon = (p: IconProps) => (
  <Icon {...p} tones={["green"]}>
    {(c) => (
      <>
        <path d="M4.4 2.9l2.9-.7c.9-.2 1.8.3 2.1 1l1.6 3.7c.3.7.2 1.6-.5 2.1l-1.9 1.6a12.4 12.4 0 0 0 5.7 5.7l1.6-1.9c.5-.7 1.4-.9 2.1-.5l3.7 1.6c.7.3 1.2 1.2 1 2.1l-.7 2.9c-.2.9-1 1.4-1.9 1.4C9.6 21.8 2.6 14.8 2.5 4.8c0-.9.5-1.7 1.9-1.9z" fill={c.f("green")} />
        <ellipse cx="6.2" cy="5.6" rx="1.1" ry="2" transform="rotate(-20 6.2 5.6)" {...shine} />
        <path d="M15.2 18.4 Q17 19.2 19.2 18.7" {...glyph("#fff", 0.9)} opacity={0.45} />
      </>
    )}
  </Icon>
);

export const CarIcon = (p: IconProps) => (
  <Icon {...p} tones={["red", "glass", "graphite", "silver"]}>
    {(c) => (
      <>
        <path d="M2.4 16.4v-2.8a2.2 2.2 0 0 1 1.6 -2.1l2.7 -.8 2.7 -3.6a3 3 0 0 1 2.4 -1.2h3.5a3 3 0 0 1 2.3 1.1l2.9 3.6 1.4 .3a2.2 2.2 0 0 1 1.7 2.1v3.4a1.2 1.2 0 0 1 -1.2 1.2H3.6a1.2 1.2 0 0 1 -1.2 -1.2Z" fill={c.f("red")} />
        <path d="M8.2 10.9l2.1 -2.9a1.6 1.6 0 0 1 1.3 -.7h.9v3.6Z" fill={c.f("glass")} />
        <path d="M14 7.3h1.2a1.6 1.6 0 0 1 1.2 .6l2.4 3h-4.8Z" fill={c.f("glass")} />
        <rect x="19.6" y="12.6" width="1.9" height="1.4" rx="0.6" fill="#ffe27a" />
        <path d="M4.6 12.4 H17.6" {...glyph("#fff", 0.9)} opacity={0.5} />
        <circle cx="7" cy="17.4" r="2.8" fill={c.f("graphite")} />
        <circle cx="17" cy="17.4" r="2.8" fill={c.f("graphite")} />
        <circle cx="7" cy="17.4" r="1.2" fill={c.f("silver")} />
        <circle cx="17" cy="17.4" r="1.2" fill={c.f("silver")} />
      </>
    )}
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p} tones={["graphite", "silver", "glass"]}>
    {(c) => (
      <>
        <path d="M15.4 15.4 L20.4 20.4" {...glyph(c.s("graphite"), 3.4)} />
        <circle cx="10.4" cy="10.4" r="6.4" fill={c.f("glass")} stroke={c.s("silver")} strokeWidth="2.4" />
        <path d="M7.2 9.6 a3.4 3.4 0 0 1 2.6 -2.5" {...glyph("#fff", 1.2)} />
      </>
    )}
  </Icon>
);

export const FilterIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M4 6.5h16M7 12h10M10 17.5h4" />
  </Glyph>
);

export const SlidersIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M3 7h7.5M18.5 7H21M3 17h2.5M13.5 17H21" />
    <circle {...line} cx="14.5" cy="7" r="2.5" />
    <circle {...line} cx="9.5" cy="17" r="2.5" />
  </Glyph>
);

export const SortIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M8 20V4M4 8l4-4 4 4M16 4v16M12 16l4 4 4-4" />
  </Glyph>
);

export const RefreshIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M19.94 11A8 8 0 0 0 5.39 7.5M4.06 13a8 8 0 0 0 14.55 3.5" />
    <path {...line} d="M5.4 3v4.5h4.5M18.6 21v-4.5h-4.5" />
  </Glyph>
);

export const LinkIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M10.5 7.5l1.6-1.6a4.6 4.6 0 0 1 6.5 6.5L17 14M13.5 16.5l-1.6 1.6a4.6 4.6 0 0 1-6.5-6.5L7 10M9.5 14.5l5-5" />
  </Glyph>
);

export const CopyIcon = (p: IconProps) => (
  <Glyph {...p}>
    <rect {...line} x="8" y="8" width="13.5" height="13.5" rx="3.5" />
    <path {...line} d="M15.8 4.8A3.5 3.5 0 0 0 12.5 2.5H6A3.5 3.5 0 0 0 2.5 6v6.5a3.5 3.5 0 0 0 2.3 3.3" />
  </Glyph>
);

export const UploadIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M12 15V3.5M7.5 8L12 3.5 16.5 8M3.5 15v1.5a4 4 0 0 0 4 4h9a4 4 0 0 0 4-4V15" />
  </Glyph>
);

export const DownloadIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M12 3.5V15M7.5 10.5L12 15l4.5-4.5M3.5 15v1.5a4 4 0 0 0 4 4h9a4 4 0 0 0 4-4V15" />
  </Glyph>
);

export const CodeIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M8 6.5L2.5 12 8 17.5M16 6.5l5.5 5.5-5.5 5.5" />
  </Glyph>
);

export const TerminalIcon = (p: IconProps) => (
  <Icon {...p} tones={["graphite", "steel"]}>
    {(c) => (
      <>
        <rect x="2.5" y="4" width="19" height="16.5" rx="3" fill={c.f("graphite")} {...rim("#a9afbd", 0.6)} />
        <path d="M2.5 7 a3 3 0 0 1 3 -3 h13 a3 3 0 0 1 3 3 v1.4 h-19 Z" fill={c.f("steel")} />
        <circle cx="5.4" cy="6.3" r="0.85" fill="#ff8a80" />
        <circle cx="7.9" cy="6.3" r="0.85" fill="#ffe27a" />
        <circle cx="10.4" cy="6.3" r="0.85" fill="#7fe08a" />
        <path d="M6.4 11.4 l3 2.6 l-3 2.6" {...glyph("#7fe08a", 1.9)} />
        <path d="M11.6 17.2 h5.2" {...glyph("#eef0f5", 1.9)} />
      </>
    )}
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon {...p} tones={["teal", "paper", "graphite"]}>
    {(c) => (
      <>
        <circle cx="12" cy="12" r="9.6" fill={c.f("teal")} />
        <circle cx="12" cy="12" r="7.3" fill={c.f("paper")} />
        <path d="M12 5.6 v1.3 M18.4 12 h-1.3 M12 18.4 v-1.3 M5.6 12 h1.3" {...glyph("#a9afbd", 1.2)} />
        <path d="M12 7.8 V12 l3.2 2.2" {...glyph(c.s("graphite"), 1.7)} />
        <circle cx="12" cy="12" r="1.1" fill="#e5322d" />
        <path d="M4.6 9.2 a8 8 0 0 1 4.4 -4.6" {...glyph("#fff", 0.9)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const InfoIcon = (p: IconProps) => (
  <Icon {...p} tones={["blue"]}>
    {(c) => (
      <>
        <circle cx="12" cy="12" r="9.6" fill={c.f("blue")} />
        <ellipse cx="7.6" cy="7" rx="2.6" ry="1.3" transform="rotate(-38 7.6 7)" {...shine} opacity={0.45} />
        <circle cx="12" cy="7.5" r="1.7" fill="#fff" />
        <path d="M12 11.2 v5.8" {...glyph("#fff", 3)} />
      </>
    )}
  </Icon>
);

export const AlertCircleIcon = (p: IconProps) => (
  <Icon {...p} tones={["orange"]}>
    {(c) => (
      <>
        <circle cx="12" cy="12" r="9.6" fill={c.f("orange")} />
        <ellipse cx="7.6" cy="7" rx="2.6" ry="1.3" transform="rotate(-38 7.6 7)" {...shine} opacity={0.45} />
        <path d="M12 6.8 v6.4" {...glyph("#fff", 3)} />
        <circle cx="12" cy="17" r="1.7" fill="#fff" />
      </>
    )}
  </Icon>
);

export const HelpCircleIcon = (p: IconProps) => (
  <Icon {...p} tones={["purple"]}>
    {(c) => (
      <>
        <circle cx="12" cy="12" r="9.6" fill={c.f("purple")} />
        <ellipse cx="7.6" cy="7" rx="2.6" ry="1.3" transform="rotate(-38 7.6 7)" {...shine} opacity={0.45} />
        <path d="M9.1 9.3 a3 3 0 0 1 5.9 .8 c0 2 -3 2.3 -3 4.1" {...glyph("#fff", 2.7)} />
        <circle cx="12" cy="17.4" r="1.6" fill="#fff" />
      </>
    )}
  </Icon>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Icon {...p} tones={["green"]}>
    {(c) => (
      <>
        <circle cx="12" cy="12" r="9.6" fill={c.f("green")} />
        <ellipse cx="7.6" cy="7" rx="2.6" ry="1.3" transform="rotate(-38 7.6 7)" {...shine} opacity={0.45} />
        <path d="M7.5 12.4 l3 3 l6 -6.2" {...glyph("#fff", 3)} />
      </>
    )}
  </Icon>
);

export const XCircleIcon = (p: IconProps) => (
  <Icon {...p} tones={["red"]}>
    {(c) => (
      <>
        <circle cx="12" cy="12" r="9.6" fill={c.f("red")} />
        <ellipse cx="7.6" cy="7" rx="2.6" ry="1.3" transform="rotate(-38 7.6 7)" {...shine} opacity={0.45} />
        <path d="M8.7 8.7 l6.6 6.6 M15.3 8.7 l-6.6 6.6" {...glyph("#fff", 3)} />
      </>
    )}
  </Icon>
);

export const WarningIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold"]}>
    {(c) => (
      <>
        <path d="M10 3.8 a2.3 2.3 0 0 1 4 0 l8.2 14.4 a2.3 2.3 0 0 1 -2 3.4 H3.8 a2.3 2.3 0 0 1 -2 -3.4 Z" fill={c.f("gold")} />
        <path d="M10.6 6.2 L6.4 13.6" {...glyph("#fff", 1)} opacity={0.6} />
        <path d="M12 9.2 v5" {...glyph("#6b4300", 2.6)} />
        <circle cx="12" cy="17.6" r="1.5" fill="#6b4300" />
      </>
    )}
  </Icon>
);

export const GlobeIcon = (p: IconProps) => (
  <Icon {...p} tones={["sky", "green"]}>
    {(c) => (
      <>
        <circle cx="12" cy="12" r="9.6" fill={c.f("sky")} />
        <path d="M5.6 6.4 c1.6 -1 3.8 -1 4.7 .2 c.7 1 -.4 1.9 -1.4 2.4 c-.9 .5 -.6 1.6 .2 2.3 c.9 .8 .6 2.4 -.4 3.4 c-.6 .6 -.4 1.8 -.9 2.8 c-.4 .8 -1.5 .5 -1.8 -.4 c-.4 -1.2 -.2 -2.4 -1.1 -3.4 c-.9 -1 -1.9 -1.7 -1.7 -3.2 c.2 -1.6 1.1 -3.2 2.4 -4.1 Z" fill={c.f("green")} />
        <path d="M13.4 2.8 c2.4 .2 5.2 1.6 6.6 4 c.4 .8 -.2 1.5 -1 1.4 c-1 -.1 -1.6 .6 -1.3 1.5 c.3 1 -.4 1.8 -1.4 1.6 c-1.2 -.3 -2.4 .1 -2.6 -1 c-.2 -1 .8 -1.6 .5 -2.6 c-.3 -.9 -1.4 -1.2 -1.2 -2.3 c.1 -.9 .7 -2.6 1.4 -2.6 Z" fill={c.f("green")} />
        <path d="M15.6 14.4 c1.2 -.5 3 -.2 3.4 .8 c.4 1 -.6 2.5 -1.8 3.1 c-1 .5 -2.2 .1 -2.4 -.9 c-.2 -1 -.2 -2.5 .8 -3 Z" fill={c.f("green")} />
        <path d="M17.6 19.2 a8.2 8.2 0 0 0 2.6 -3" {...glyph("#fff", 0.9)} opacity={0.4} />
        <path d="M4.2 9.6 a8.2 8.2 0 0 1 1.4 -2.6" {...glyph("#fff", 1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const MailIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper", "silver", "red"]}>
    {(c) => (
      <>
        <rect x="2.5" y="5" width="19" height="14.5" rx="2.4" fill={c.f("paper")} {...rim("#c4c9d6", 0.5)} />
        <path d="M3.2 18.6 L10.2 12.6 M20.8 18.6 L13.8 12.6" {...glyph("#cfd3de", 0.9)} />
        <path d="M2.9 6.1 Q3.4 5 4.9 5 H19.1 Q20.6 5 21.1 6.1 L13.4 12.5 a2.2 2.2 0 0 1 -2.8 0 Z" fill={c.f("silver")} />
        <circle cx="12" cy="11.2" r="1.7" fill={c.f("red")} />
      </>
    )}
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper", "red", "graphite"]}>
    {(c) => (
      <>
        <rect x="3" y="4.5" width="18" height="16.5" rx="3" fill={c.f("paper")} {...rim("#c4c9d6", 0.5)} />
        <path d="M3 7.5 a3 3 0 0 1 3 -3 h12 a3 3 0 0 1 3 3 v2.3 H3 Z" fill={c.f("red")} />
        <rect x="7" y="2.4" width="2" height="4.4" rx="1" fill={c.f("graphite")} />
        <rect x="15" y="2.4" width="2" height="4.4" rx="1" fill={c.f("graphite")} />
        {[6.6, 10.8, 15].map((x) => [12.4, 16.4].map((y) => <rect key={`${x}${y}`} x={x} y={y} width="2.4" height="2.2" rx="0.6" fill={x === 10.8 && y === 16.4 ? "#e5322d" : "#c4c9d6"} />))}
      </>
    )}
  </Icon>
);

export const SidebarIcon = (p: IconProps) => (
  <Glyph {...p}>
    <rect {...line} x="2.5" y="3.5" width="19" height="17" rx="4.5" />
    <path {...line} d="M9 3.5v17" />
  </Glyph>
);

export const GridIcon = (p: IconProps) => (
  <Glyph {...p}>
    <rect {...line} x="3" y="3" width="7.5" height="7.5" rx="2.5" />
    <rect {...line} x="13.5" y="3" width="7.5" height="7.5" rx="2.5" />
    <rect {...line} x="3" y="13.5" width="7.5" height="7.5" rx="2.5" />
    <rect {...line} x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" />
  </Glyph>
);

export const EyeIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper", "teal"]}>
    {(c) => (
      <>
        <path d="M1.8 12 C4.4 7.2 7.9 5.2 12 5.2 s7.6 2 10.2 6.8 c-2.6 4.8 -6.1 6.8 -10.2 6.8 S4.4 16.8 1.8 12 Z" fill={c.f("paper")} {...rim("#b5bccb", 0.7)} />
        <circle cx="12" cy="12" r="4.6" fill={c.f("teal")} />
        <circle cx="12" cy="12" r="2.2" fill="#1b2330" />
        <circle cx="13.6" cy="10.4" r="1" fill="#fff" />
      </>
    )}
  </Icon>
);

export const EyeOffIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper", "teal", "red"]}>
    {(c) => (
      <>
        <path d="M1.8 12 C4.4 7.2 7.9 5.2 12 5.2 s7.6 2 10.2 6.8 c-2.6 4.8 -6.1 6.8 -10.2 6.8 S4.4 16.8 1.8 12 Z" fill={c.f("paper")} {...rim("#b5bccb", 0.7)} />
        <circle cx="12" cy="12" r="4.6" fill={c.f("teal")} />
        <circle cx="12" cy="12" r="2.2" fill="#1b2330" />
        <circle cx="13.6" cy="10.4" r="1" fill="#fff" />
        <path d="M4 3.6 L20 20.4" {...glyph("#fff", 4.4)} />
        <path d="M4 3.6 L20 20.4" {...glyph(c.s("red"), 2.4)} />
      </>
    )}
  </Icon>
);

export const LoaderIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M12 3a9 9 0 109 9" />
  </Glyph>
);

export const BoldIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M7 6.5a2 2 0 012-2h3.5a3.75 3.75 0 010 7.5H7zM7 12h6.5a3.75 3.75 0 010 7.5H9a2 2 0 01-2-2z" />
  </Glyph>
);

export const ItalicIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M10 4.5h8M6 19.5h8M15 4.5l-6 15" />
  </Glyph>
);

export const UnderlineIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M7 4v6.5a5 5 0 0010 0V4M5 20.5h14" />
  </Glyph>
);

export const StrikethroughIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M17 6.8c-.8-1.5-2.5-2.5-5-2.5-3 0-5 1.6-5 3.7 0 1 .4 1.8 1.2 2.4M4 12h16M7 17.2c.8 1.5 2.6 2.5 5.2 2.5 3 0 5-1.6 5-3.8 0-.6-.1-1.1-.4-1.6" />
  </Glyph>
);

export const HighlighterIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "steel", "orange"]}>
    {(c) => (
      <>
        <rect x="10.2" y="18.4" width="11.4" height="3" rx="1.5" fill={c.f("gold")} opacity={0.8} />
        <path d="M7.6 15.2 L4 20.6 L9.6 17.2 Z" fill="#e09a0e" />
        <path d="M11.2 12.8 L18.6 5.4" {...glyph(c.s("gold"), 6.4)} />
        <path d="M8.4 15.6 L10.6 13.4" fill="none" stroke={c.s("steel")} strokeWidth="6.6" strokeLinecap="butt" />
        <path d="M12.2 9.8 L16.6 5.4" {...glyph("#fff", 1)} opacity={0.65} />
      </>
    )}
  </Icon>
);

export const BaselineIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M6.5 16l4.6-10.4a1 1 0 011.8 0L17.5 16M8.3 12h7.4M4 20.5h16" />
  </Glyph>
);

export const ListOrderedIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M10.5 6.5h10M10.5 12h10M10.5 17.5h10M3.8 4.6l1.7-1.1v6" />
    <path {...line} d="M3.7 15a1.7 1.7 0 013.2.8c0 1.6-3.2 2.3-3.2 4.2h3.4" />
  </Glyph>
);

export const ListTodoIcon = (p: IconProps) => (
  <Icon {...p} tones={["wood", "paper", "silver", "green"]}>
    {(c) => (
      <>
        <rect x="3.8" y="3.6" width="16.4" height="18.2" rx="2.4" fill={c.f("wood")} />
        <rect x="5.6" y="6" width="12.8" height="14" rx="1" fill={c.f("paper")} />
        <rect x="8.8" y="2.3" width="6.4" height="3.9" rx="1.3" fill={c.f("silver")} {...rim("#a9afbd", 0.5)} />
        <rect x="7.1" y="8.3" width="3.8" height="3.8" rx="0.9" fill={c.f("green")} />
        <path d="M8 10.2 l.9 .9 l1.4 -1.6" {...glyph("#fff", 1)} />
        <rect x="12.4" y="9.6" width="4.6" height="1.3" rx="0.65" fill="#c4c9d6" />
        <rect x="7.1" y="14.1" width="3.8" height="3.8" rx="0.9" fill="#fff" {...rim("#b5bccb", 0.8)} />
        <rect x="12.4" y="15.4" width="4.6" height="1.3" rx="0.65" fill="#c4c9d6" />
      </>
    )}
  </Icon>
);

export const QuoteIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M4 4v16M9 6.5h11M9 12h11M9 17.5h7" />
  </Glyph>
);

export const TypeIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M4.5 7.5V6a2 2 0 012-2h11a2 2 0 012 2v1.5M12 4v16M9 20h6" />
  </Glyph>
);

export const TableIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper", "green"]}>
    {(c) => (
      <>
        <rect x="2.5" y="4" width="19" height="16.5" rx="2.6" fill={c.f("paper")} {...rim("#c4c9d6", 0.5)} />
        <path d="M2.5 6.6 a2.6 2.6 0 0 1 2.6 -2.6 h13.8 a2.6 2.6 0 0 1 2.6 2.6 v2.4 h-19 Z" fill={c.f("green")} />
        <path d="M9.4 9 v11.2 M3 12.9 h18 M3 16.7 h18" {...glyph("#c4c9d6", 1)} />
        <path d="M4.6 5.6 h7" {...glyph("#fff", 0.8)} opacity={0.5} />
      </>
    )}
  </Icon>
);

export const ListCollapseIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M4 4.5l3 3-3 3M11 7.5h10M11 16.5h10" />
    <circle {...dot} cx="5.5" cy="16.5" r="1.25" />
  </Glyph>
);

export const SquareCodeIcon = (p: IconProps) => (
  <Icon {...p} tones={["purple"]}>
    {(c) => (
      <>
        <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="4.6" fill={c.f("purple")} />
        <ellipse cx="7.4" cy="5.6" rx="2.6" ry="1.1" {...shine} opacity={0.45} />
        <path d="M10 8.6 l-3.4 3.4 l3.4 3.4 M14 8.6 l3.4 3.4 l-3.4 3.4" {...glyph("#fff", 2.6)} />
      </>
    )}
  </Icon>
);

export const CalloutIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper", "orange"]}>
    {(c) => (
      <>
        <rect x="2.5" y="4.5" width="19" height="15" rx="3" fill={c.f("paper")} {...rim("#c4c9d6", 0.5)} />
        <path d="M2.5 7.5 a3 3 0 0 1 3 -3 h.4 v15 h-.4 a3 3 0 0 1 -3 -3 Z" fill={c.f("orange")} />
        <circle cx="9.2" cy="9.8" r="1.9" fill={c.f("orange")} />
        <path d="M12.6 9.8 H18.2 M8.6 14.6 H18.2" {...glyph("#c4c9d6", 1.6)} />
      </>
    )}
  </Icon>
);

export const AlignLeftIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M3 4.5h18M3 9.5h11M3 14.5h18M3 19.5h11" />
  </Glyph>
);

export const AlignCenterIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M3 4.5h18M6.5 9.5h11M3 14.5h18M6.5 19.5h11" />
  </Glyph>
);

export const AlignRightIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M3 4.5h18M10 9.5h11M3 14.5h18M10 19.5h11" />
  </Glyph>
);

export const SmartphoneIcon = (p: IconProps) => (
  <Icon {...p} tones={["graphite", "blue"]}>
    {(c) => (
      <>
        <rect x="5.4" y="2" width="13.2" height="20" rx="3.2" fill={c.f("graphite")} {...rim("#a9afbd", 0.6)} />
        <rect x="6.8" y="3.4" width="10.4" height="17.2" rx="2" fill={c.f("blue")} />
        <rect x="10.2" y="4.2" width="3.6" height="1.2" rx="0.6" fill="#2c303a" />
        <path d="M6.8 9.6 L13.4 3.4 H15.4 L6.8 11.8 Z" {...shine} opacity={0.3} />
      </>
    )}
  </Icon>
);

export const TabletIcon = (p: IconProps) => (
  <Icon {...p} tones={["silver", "sky"]}>
    {(c) => (
      <>
        <rect x="3" y="2.5" width="18" height="19" rx="3" fill={c.f("silver")} {...rim("#a9afbd", 0.6)} />
        <rect x="4.6" y="4.2" width="14.8" height="15.6" rx="1.6" fill={c.f("sky")} />
        <circle cx="12" cy="3.35" r="0.45" fill="#5d6576" />
        <path d="M4.6 10.4 L10.8 4.2 H13.2 L4.6 12.8 Z" {...shine} opacity={0.3} />
      </>
    )}
  </Icon>
);

export const MaximizeIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M3 8.5V7a4 4 0 014-4h1.5M15.5 3H17a4 4 0 014 4v1.5M21 15.5V17a4 4 0 01-4 4h-1.5M8.5 21H7a4 4 0 01-4-4v-1.5" />
  </Glyph>
);

export const PanelBottomIcon = (p: IconProps) => (
  <Glyph {...p}>
    <rect {...line} x="2.5" y="3.5" width="19" height="17" rx="4.5" />
    <path {...line} d="M2.5 14.5h19" />
  </Glyph>
);

export const RectangleHorizontalIcon = (p: IconProps) => (
  <Glyph {...p}>
    <rect {...line} x="2" y="6" width="20" height="12" rx="4" />
    <path {...line} d="M8.5 12h7" />
  </Glyph>
);

export const MoveVerticalIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M12 3.5v17M8.5 7L12 3.5 15.5 7M8.5 17l3.5 3.5 3.5-3.5" />
  </Glyph>
);

export const BracesIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M8.5 3.5H8a2.5 2.5 0 00-2.5 2.5v3.5C5.5 10.9 4.5 12 3 12c1.5 0 2.5 1.1 2.5 2.5V18A2.5 2.5 0 008 20.5h.5M15.5 3.5h.5A2.5 2.5 0 0118.5 6v3.5c0 1.4 1 2.5 2.5 2.5-1.5 0-2.5 1.1-2.5 2.5V18a2.5 2.5 0 01-2.5 2.5h-.5" />
  </Glyph>
);

export const GitBranchIcon = (p: IconProps) => (
  <Icon {...p} tones={["steel", "green", "orange"]}>
    {(c) => (
      <>
        <path d="M6 5 V19 M18 8.6 v.6 a6.4 6.4 0 0 1 -6.4 6.4 H6.4" {...glyph(c.s("steel"), 2.4)} />
        <circle cx="6" cy="4.6" r="2.8" fill={c.f("green")} />
        <circle cx="6" cy="19.4" r="2.8" fill={c.f("green")} />
        <circle cx="18" cy="6" r="2.8" fill={c.f("orange")} />
        <circle cx="5.1" cy="3.7" r="0.8" {...shine} />
        <circle cx="5.1" cy="18.5" r="0.8" {...shine} />
        <circle cx="17.1" cy="5.1" r="0.8" {...shine} />
      </>
    )}
  </Icon>
);

export const CircleDotIcon = (p: IconProps) => (
  <Icon {...p} tones={["green", "paper"]}>
    {(c) => (
      <>
        <circle cx="12" cy="12" r="9.6" fill={c.f("green")} />
        <circle cx="12" cy="12" r="6.4" fill={c.f("paper")} />
        <circle cx="12" cy="12" r="3.3" fill={c.f("green")} />
        <circle cx="11" cy="11" r="1" {...shine} />
        <path d="M4.4 9.4 a8 8 0 0 1 4.4 -4.8" {...glyph("#fff", 0.9)} opacity={0.55} />
      </>
    )}
  </Icon>
);

export const GitPullRequestIcon = (p: IconProps) => (
  <Icon {...p} tones={["steel", "purple"]}>
    {(c) => (
      <>
        <path d="M6 8 v8 M18 16 V9.6 a3 3 0 0 0 -3 -3 h-3.6 M13.6 4 L11 6.6 L13.6 9.2" {...glyph(c.s("steel"), 2.3)} />
        <circle cx="6" cy="5.4" r="2.8" fill={c.f("purple")} />
        <circle cx="6" cy="18.6" r="2.8" fill={c.f("purple")} />
        <circle cx="18" cy="18.6" r="2.8" fill={c.f("purple")} />
        <circle cx="5.1" cy="4.5" r="0.8" {...shine} />
        <circle cx="5.1" cy="17.7" r="0.8" {...shine} />
        <circle cx="17.1" cy="17.7" r="0.8" {...shine} />
      </>
    )}
  </Icon>
);

export const PanelRightIcon = (p: IconProps) => (
  <Glyph {...p}>
    <rect {...line} x="2.5" y="3.5" width="19" height="17" rx="4.5" />
    <path {...line} d="M15 3.5v17" />
  </Glyph>
);

export const CornerDownRightIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M5 4.5V10a4 4 0 004 4h10.5M15 9.5l4.5 4.5-4.5 4.5" />
  </Glyph>
);

export const AsteriskIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M12 4v16M5.07 8l13.86 8M5.07 16l13.86-8" />
  </Glyph>
);

export const ApertureIcon = (p: IconProps) => (
  <Icon {...p} tones={["steel", "silver", "graphite"]}>
    {(c) => (
      <>
        <circle cx="12" cy="12" r="9.6" fill={c.f("graphite")} stroke="#a9afbd" strokeWidth="0.6" />
        <circle cx="12" cy="12" r="8.1" fill="#1e2129" />
        <path d="M12.00 9.30 L14.34 10.65 L19.70 13.75 A7.9 7.9 0 0 0 17.37 6.20 Z M14.34 13.35 L12.00 14.70 L6.63 17.80 A7.9 7.9 0 0 0 14.34 19.55 Z M9.66 13.35 L9.66 10.65 L9.66 4.45 A7.9 7.9 0 0 0 4.30 10.25 Z" fill={c.f("silver")} />
        <path d="M14.34 10.65 L14.34 13.35 L14.34 19.55 A7.9 7.9 0 0 0 19.70 13.75 Z M12.00 14.70 L9.66 13.35 L4.30 10.25 A7.9 7.9 0 0 0 6.63 17.80 Z M9.66 10.65 L12.00 9.30 L17.37 6.20 A7.9 7.9 0 0 0 9.66 4.45 Z" fill={c.f("steel")} />
        <path d="M12 9.3 L14.34 10.65 L14.34 13.35 L12 14.7 L9.66 13.35 L9.66 10.65 Z" fill="#1e2129" />
        <circle cx="11.2" cy="11" r="0.8" fill="#8fd3ff" />
        <path d="M5.4 8.2 a7.6 7.6 0 0 1 4 -3.6" {...glyph("#fff", 0.9)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const HeartIcon = (p: IconProps) => (
  <Icon {...p} tones={["red"]}>
    {(c) => (
      <>
        <path d="M12 20.6 C6 16.6 2.4 13.2 2.4 8.9 A4.9 4.9 0 0 1 12 6.6 A4.9 4.9 0 0 1 21.6 8.9 C21.6 13.2 18 16.6 12 20.6 Z" fill={c.f("red")} />
        <ellipse cx="7.3" cy="8.6" rx="2.1" ry="1.3" {...shine} />
      </>
    )}
  </Icon>
);

export const StarIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold"]}>
    {(c) => (
      <>
        <path d="M12.00 4.00 L14.29 9.44 L20.18 9.94 L15.71 13.81 L17.05 19.56 L12.00 16.50 L6.95 19.56 L8.29 13.81 L3.82 9.94 L9.71 9.44Z" fill={c.f("gold")} stroke={c.s("gold")} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M10.4 9.9 L12 6.4" {...glyph("#fff", 1)} opacity={0.65} />
      </>
    )}
  </Icon>
);

export const BoltIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold"]}>
    {(c) => (
      <>
        <path d="M14.4 2.4 L4.4 13.8 H11 L9.6 21.6 L19.6 10.2 H13 Z" fill={c.f("gold")} stroke={c.s("gold")} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12.6 5.4 L7.6 11.2" {...glyph("#fff", 1)} opacity={0.65} />
      </>
    )}
  </Icon>
);

export const SparklesIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "orange"]}>
    {(c) => (
      <>
        <path d="M9.8 2.4 Q11.2 8.6 17.4 10 Q11.2 11.4 9.8 17.6 Q8.4 11.4 2.2 10 Q8.4 8.6 9.8 2.4 Z" fill={c.f("gold")} stroke={c.s("gold")} strokeWidth="1" strokeLinejoin="round" />
        <path d="M18 13.4 Q18.7 16.4 21.6 17.2 Q18.7 18 18 21 Q17.3 18 14.4 17.2 Q17.3 16.4 18 13.4 Z" fill={c.f("orange")} stroke={c.s("orange")} strokeWidth="0.8" strokeLinejoin="round" />
        <path d="M18.4 2.8 Q18.8 4.4 20.4 4.8 Q18.8 5.2 18.4 6.8 Q18 5.2 16.4 4.8 Q18 4.4 18.4 2.8 Z" fill={c.f("gold")} />
        <path d="M9.8 5.6 L9.8 8.4" {...glyph("#fff", 1)} opacity={0.65} />
      </>
    )}
  </Icon>
);

export const HomeIcon = (p: IconProps) => (
  <Icon {...p} tones={["red", "paper", "wood", "sky"]}>
    {(c) => (
      <>
        <rect x="15.6" y="4.2" width="2.8" height="5" rx="0.8" fill={c.f("red")} />
        <path d="M5 11.2 L12 5.4 L19 11.2 V19.2 a2 2 0 0 1 -2 2 H7 a2 2 0 0 1 -2 -2 Z" fill={c.f("paper")} {...rim("#c4c9d6", 0.5)} />
        <rect x="10" y="14.6" width="4" height="6.6" rx="1.2" fill={c.f("wood")} />
        <rect x="6.6" y="12.6" width="2.6" height="2.6" rx="0.7" fill={c.f("sky")} />
        <rect x="14.8" y="12.6" width="2.6" height="2.6" rx="0.7" fill={c.f("sky")} />
        <path d="M12 2.6 L22.1 11.4 a1.3 1.3 0 0 1 -1.7 2 L12 6.1 L3.6 13.4 a1.3 1.3 0 0 1 -1.7 -2 Z" fill={c.f("red")} />
        <path d="M12 3.9 L5 10" {...glyph("#fff", 0.8)} opacity={0.5} />
      </>
    )}
  </Icon>
);

export const HomeFilledIcon = HomeIcon;

export const UserIcon = (p: IconProps) => (
  <Icon {...p} tones={["blue", "gold"]}>
    {(c) => (
      <>
        <path d="M3.8 19.8 c0 -4 3.7 -6.6 8.2 -6.6 s8.2 2.6 8.2 6.6 v.4 a1.2 1.2 0 0 1 -1.2 1.2 H5 a1.2 1.2 0 0 1 -1.2 -1.2 Z" fill={c.f("blue")} />
        <circle cx="12" cy="7.4" r="4.8" fill={c.f("gold")} />
        <ellipse cx="10.1" cy="5.6" rx="1.4" ry="1" {...shine} />
        <path d="M6.4 16.6 a7 7 0 0 1 3.4 -1.8" {...glyph("#fff", 0.9)} opacity={0.5} />
      </>
    )}
  </Icon>
);

export const UserFilledIcon = UserIcon;

export const UsersIcon = (p: IconProps) => (
  <Icon {...p} tones={["purple", "teal", "gold"]}>
    {(c) => (
      <>
        <path d="M10.4 18.4 c0 -3.4 2.6 -5.6 5.8 -5.6 s5.8 2.2 5.8 5.6 v.6 a1 1 0 0 1 -1 1 H11.4 a1 1 0 0 1 -1 -1 Z" fill={c.f("purple")} />
        <circle cx="16.2" cy="7" r="3.7" fill="#f2b630" />
        <path d="M2.2 19.6 c0 -3.6 3 -6 6.8 -6 s6.8 2.4 6.8 6 v.4 a1.2 1.2 0 0 1 -1.2 1.2 H3.4 a1.2 1.2 0 0 1 -1.2 -1.2 Z" fill={c.f("teal")} />
        <circle cx="9" cy="8.4" r="4.1" fill={c.f("gold")} />
        <ellipse cx="7.4" cy="6.9" rx="1.2" ry="0.85" {...shine} />
      </>
    )}
  </Icon>
);

export const PaletteIcon = (p: IconProps) => (
  <Icon {...p} tones={["wood"]}>
    {(c) => (
      <>
        <path d="M12 2.5a9.5 9.5 0 0 0 0 19c1.2 0 2-.8 2-1.9 0-1.3-1-1.7-1-2.8 0-1 .8-1.8 1.8-1.8h2c2.7 0 4.7-2 4.7-4.6C21.5 6.1 17.3 2.5 12 2.5z" fill={c.f("wood")} />
        <circle cx="7" cy="12.4" r="1.9" fill="#e5322d" />
        <circle cx="8.2" cy="7.4" r="1.9" fill="#f5a913" />
        <circle cx="13" cy="5.9" r="1.9" fill="#22a447" />
        <circle cx="17.3" cy="8.8" r="1.9" fill="#2a5fe0" />
        <path d="M4.6 15.4 a8 8 0 0 0 3.6 3.9" {...glyph("#fff", 0.9)} opacity={0.45} />
      </>
    )}
  </Icon>
);

export const SettingsIcon = (p: IconProps) => (
  <Icon {...p} tones={["silver", "steel"]}>
    {(c) => (
      <>
        <path d="M19.28 10.70 L21.55 11.05 L21.55 12.95 L19.28 13.30 L18.07 16.23 L19.43 18.08 L18.08 19.43 L16.23 18.07 L13.30 19.28 L12.95 21.55 L11.05 21.55 L10.70 19.28 L7.77 18.07 L5.92 19.43 L4.57 18.08 L5.93 16.23 L4.72 13.30 L2.45 12.95 L2.45 11.05 L4.72 10.70 L5.93 7.77 L4.57 5.92 L5.92 4.57 L7.77 5.93 L10.70 4.72 L11.05 2.45 L12.95 2.45 L13.30 4.72 L16.23 5.93 L18.08 4.57 L19.43 5.92 L18.07 7.77Z" fill={c.f("silver")} stroke={c.s("silver")} strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="5.6" fill={c.f("steel")} />
        <circle cx="12" cy="12" r="2.6" fill="#2c303a" />
        <path d="M8.4 9.6 a4.4 4.4 0 0 1 3.6 -2" {...glyph("#fff", 0.9)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const SettingsFilledIcon = SettingsIcon;

export const BellIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "orange"]}>
    {(c) => (
      <>
        <circle cx="12" cy="19.2" r="2.3" fill={c.f("orange")} />
        <circle cx="12" cy="3.3" r="1.4" fill="#e09a0e" />
        <path d="M12 3.4 a6.2 6.2 0 0 1 6.2 6.2 v3.4 l2 3.1 a1 1 0 0 1 -.8 1.6 H4.6 a1 1 0 0 1 -.8 -1.6 l2 -3.1 V9.6 A6.2 6.2 0 0 1 12 3.4 Z" fill={c.f("gold")} />
        <rect x="3.6" y="15.9" width="16.8" height="1.8" rx="0.9" fill="#e09a0e" />
        <ellipse cx="9.2" cy="9" rx="1.2" ry="2.8" {...shine} />
      </>
    )}
  </Icon>
);

export const BellFilledIcon = BellIcon;

export const LockIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "silver"]}>
    {(c) => (
      <>
        <path d="M7.6 11 V7.6 a4.4 4.4 0 0 1 8.8 0 V11" {...glyph(c.s("silver"), 2.6)} />
        <rect x="3.8" y="10" width="16.4" height="11.6" rx="3" fill={c.f("gold")} />
        <circle cx="12" cy="14.6" r="1.7" fill="#9a5a0a" />
        <rect x="11.25" y="15" width="1.5" height="3.4" rx="0.75" fill="#9a5a0a" />
        <rect x="5.6" y="11.3" width="12.8" height="1" rx="0.5" {...shine} opacity={0.5} />
      </>
    )}
  </Icon>
);

export const TrashIcon = (p: IconProps) => (
  <Icon {...p} tones={["silver", "steel"]}>
    {(c) => (
      <>
        <path d="M5.6 8 h12.8 l-1 11.6 a2 2 0 0 1 -2 1.8 h-6.8 a2 2 0 0 1 -2 -1.8 Z" fill={c.f("silver")} {...rim("#a9afbd", 0.5)} />
        <path d="M9.6 11 v7.4 M12 11 v7.4 M14.4 11 v7.4" {...glyph("#9aa1b0", 1.1)} />
        <rect x="8.8" y="3" width="6.4" height="3.4" rx="1.4" fill="none" stroke={c.s("steel")} strokeWidth="1.4" />
        <rect x="3.8" y="5.4" width="16.4" height="3" rx="1.5" fill={c.f("steel")} />
      </>
    )}
  </Icon>
);

export const EditIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "wood", "silver", "pink"]}>
    {(c) => (
      <>
        <path d="M3.20 20.80 L4.83 14.79 L9.21 19.17Z" fill="#f0c99a" stroke="#f0c99a" strokeWidth="0.6" strokeLinejoin="round" />
        <path d="M3.20 20.80 L3.80 18.57 L5.43 20.20Z" fill="#2c303a" stroke="#2c303a" strokeWidth="0.6" strokeLinejoin="round" />
        <path d="M4.83 14.79 L12.60 7.01 L16.99 11.40 L9.21 19.17Z" fill={c.f("gold")} />
        <path d="M7.16 17.12 L14.94 9.34 L16.99 11.40 L9.21 19.17Z" fill="#f5a913" />
        <path d="M14.16 5.46 L17.15 2.47 A1.5 1.5 0 0 1 19.27 2.47 L21.53 4.73 A1.5 1.5 0 0 1 21.53 6.85 L18.54 9.84Z" fill={c.f("pink")} />
        <path d="M12.46 7.15 L14.30 5.31 L18.69 9.70 L16.85 11.54Z" fill={c.f("silver")} />
        <path d="M6.45 15.00 L12.96 8.50" {...glyph("#fff", 0.9)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const BookmarkIcon = (p: IconProps) => (
  <Icon {...p} tones={["purple"]}>
    {(c) => (
      <>
        <path d="M5.2 5 a2.6 2.6 0 0 1 2.6 -2.6 h8.4 a2.6 2.6 0 0 1 2.6 2.6 v15 c0 .9 -1 1.4 -1.7 .9 L12 17 l-5.1 3.9 c-.7 .5 -1.7 0 -1.7 -.9 Z" fill={c.f("purple")} />
        <path d="M8 8.8 V15" {...glyph("#fff", 1.1)} opacity={0.55} />
      </>
    )}
  </Icon>
);

export const FlagIcon = (p: IconProps) => (
  <Icon {...p} tones={["red", "steel"]}>
    {(c) => (
      <>
        <path d="M5.2 4.6 C7.4 3.2 9.6 3.4 12 4.4 C14.4 5.4 16.8 5.6 19.6 4.4 a.8 .8 0 0 1 1.1 .8 V14 a1 1 0 0 1 -.5 .9 C17.4 16.2 15 16 12.6 15 C10.2 14 7.6 13.8 5.2 15 Z" fill={c.f("red")} />
        <path d="M5.2 2.8 V21.2" {...glyph(c.s("steel"), 2)} />
        <circle cx="5.2" cy="2.8" r="1.4" fill="#f5a913" />
        <path d="M7.8 6 C9.4 5.5 10.6 5.8 12 6.3" {...glyph("#fff", 1)} opacity={0.55} />
      </>
    )}
  </Icon>
);

export const TagIcon = (p: IconProps) => (
  <Icon {...p} tones={["orange"]}>
    {(c) => (
      <>
        <path d="M2.5 4.8v5.8c0 .8.3 1.6.9 2.1l8.1 8.1a2.6 2.6 0 0 0 3.6 0l5.8-5.8a2.6 2.6 0 0 0 0-3.6L12.8 3.3c-.6-.6-1.3-.9-2.1-.9H4.9a2.4 2.4 0 0 0-2.4 2.4z" fill={c.f("orange")} />
        <circle cx="7.4" cy="7.4" r="2.1" fill="#fff" stroke="#c9520c" strokeWidth="0.8" />
        <path d="M11 11 L15 15" {...glyph("#fff", 1.1)} opacity={0.45} />
        <path d="M4.2 11 V5.4" {...glyph("#fff", 0.9)} opacity={0.5} />
      </>
    )}
  </Icon>
);

export const PinIcon = (p: IconProps) => (
  <Icon {...p} tones={["red"]}>
    {(c) => (
      <>
        <ellipse cx="12" cy="21" rx="4" ry="1.2" fill="#000" opacity={0.18} />
        <path d="M12 2.2a7.6 7.6 0 0 0-7.6 7.6c0 4.6 4.5 8.9 6.4 10.6.7.6 1.7.6 2.4 0 1.9-1.7 6.4-6 6.4-10.6A7.6 7.6 0 0 0 12 2.2z" fill={c.f("red")} />
        <circle cx="12" cy="9.8" r="2.9" fill="#fff" />
        <ellipse cx="8" cy="7" rx="1.1" ry="1.8" transform="rotate(30 8 7)" {...shine} />
      </>
    )}
  </Icon>
);

export const FolderIcon = (p: IconProps) => (
  <Icon {...p} tones={["sky", "paper"]}>
    {(c) => (
      <>
        <path d="M2.5 6.5 a2 2 0 0 1 2 -2 h4.6 a2 2 0 0 1 1.5 .7 l1.3 1.5 h7.6 a2 2 0 0 1 2 2 v9.8 a2 2 0 0 1 -2 2 h-15 a2 2 0 0 1 -2 -2 Z" fill="#1f6fd0" />
        <rect x="4.8" y="7.6" width="14.4" height="8" rx="1" fill={c.f("paper")} />
        <path d="M2.5 11 a2 2 0 0 1 2 -2 h15 a2 2 0 0 1 2 2 v7.5 a2 2 0 0 1 -2 2 h-15 a2 2 0 0 1 -2 -2 Z" fill={c.f("sky")} />
        <rect x="4" y="10.2" width="16" height="1" rx="0.5" {...shine} opacity={0.4} />
      </>
    )}
  </Icon>
);

export const FolderFilledIcon = FolderIcon;

export const FolderOpenIcon = (p: IconProps) => (
  <Icon {...p} tones={["sky", "paper"]}>
    {(c) => (
      <>
        <path d="M2.5 6.5 a2 2 0 0 1 2 -2 h4.6 a2 2 0 0 1 1.5 .7 l1.3 1.5 h7.6 a2 2 0 0 1 2 2 v9.8 a2 2 0 0 1 -2 2 h-15 a2 2 0 0 1 -2 -2 Z" fill="#1f6fd0" />
        <rect x="4.8" y="7.6" width="14.4" height="8" rx="1" fill={c.f("paper")} />
        <path d="M2.6 18.6 l2.2 -7.4 a2 2 0 0 1 1.9 -1.4 h14.4 a1.4 1.4 0 0 1 1.3 1.8 l-2.1 7.4 a2 2 0 0 1 -1.9 1.4 h-14 a1.9 1.9 0 0 1 -1.8 -1.8 Z" fill={c.f("sky")} />
      </>
    )}
  </Icon>
);

export const FileIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper", "silver"]}>
    {(c) => (
      <>
        <path d="M14 2.4 H7 a2.6 2.6 0 0 0 -2.6 2.6 v14 a2.6 2.6 0 0 0 2.6 2.6 h10 a2.6 2.6 0 0 0 2.6 -2.6 V8 Z" fill={c.f("paper")} {...rim("#c4c9d6", 0.5)} />
        <path d="M14 2.4 V6.4 a1.6 1.6 0 0 0 1.6 1.6 H19.6 Z" fill={c.f("silver")} stroke="#a9afbd" strokeWidth="0.5" strokeLinejoin="round" />
        <path d="M7.8 12 H16.2 M7.8 15 H16.2 M7.8 18 H12.8" {...glyph("#b8bdc9", 1.2)} />
      </>
    )}
  </Icon>
);

export const ImageIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper", "sky", "green", "gold"]}>
    {(c) => (
      <>
        <rect x="2.4" y="3.6" width="19.2" height="16.8" rx="2.8" fill={c.f("paper")} {...rim("#c4c9d6", 0.5)} />
        <rect x="4.2" y="5.4" width="15.6" height="13.2" rx="1.4" fill={c.f("sky")} />
        <circle cx="9" cy="9.6" r="2" fill={c.f("gold")} />
        <path d="M4.2 16 L9 11.8 L12.4 14.6 L15.6 11 L19.8 15.4 V17.2 a1.4 1.4 0 0 1 -1.4 1.4 H5.6 a1.4 1.4 0 0 1 -1.4 -1.4 Z" fill={c.f("green")} />
      </>
    )}
  </Icon>
);

export const CameraIcon = (p: IconProps) => (
  <Icon {...p} tones={["silver", "graphite", "steel", "glass"]}>
    {(c) => (
      <>
        <path d="M8.4 6.6 l1 -2 a1.6 1.6 0 0 1 1.4 -.9 h2.4 a1.6 1.6 0 0 1 1.4 .9 l1 2 Z" fill={c.f("steel")} />
        <rect x="2.4" y="6.2" width="19.2" height="14" rx="3" fill={c.f("silver")} {...rim("#a9afbd", 0.5)} />
        <rect x="2.4" y="10.2" width="19.2" height="6.4" fill={c.f("graphite")} />
        <circle cx="12" cy="13.2" r="4.9" fill={c.f("steel")} stroke="#eef0f5" strokeWidth="0.8" />
        <circle cx="12" cy="13.2" r="3.1" fill="#1e2129" />
        <circle cx="10.9" cy="12.1" r="1" fill={c.f("glass")} />
        <rect x="16.8" y="7.6" width="2.6" height="1.4" rx="0.6" fill="#f5a913" />
      </>
    )}
  </Icon>
);

export const ChatIcon = (p: IconProps) => (
  <Icon {...p} tones={["blue"]}>
    {(c) => (
      <>
        <path d="M7 3.4h10a4.6 4.6 0 0 1 4.6 4.6v5.6a4.6 4.6 0 0 1-4.6 4.6h-4l-4.4 3.3c-.7.5-1.7 0-1.7-.8v-2.6A4.6 4.6 0 0 1 2.4 13.6V8A4.6 4.6 0 0 1 7 3.4z" fill={c.f("blue")} />
        <circle cx="7.8" cy="10.8" r="1.4" fill="#fff" />
        <circle cx="12" cy="10.8" r="1.4" fill="#fff" />
        <circle cx="16.2" cy="10.8" r="1.4" fill="#fff" />
        <path d="M5 7.4 a2.6 2.6 0 0 1 2.2 -1.6" {...glyph("#fff", 1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const ChatFilledIcon = ChatIcon;

export const SendIcon = (p: IconProps) => (
  <Icon {...p} tones={["teal"]}>
    {(c) => (
      <>
        <path d="M6.6 12 L21 12 L3.4 20 Z" fill="#0d7f76" stroke="#0d7f76" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M3.4 4 L21 12 L6.6 12 Z" fill={c.f("teal")} stroke={c.s("teal")} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M5.6 6.4 L12 9.4" {...glyph("#fff", 1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const MicIcon = (p: IconProps) => (
  <Icon {...p} tones={["silver", "steel", "graphite"]}>
    {(c) => (
      <>
        <path d="M5.4 10.8 a6.6 6.6 0 0 0 13.2 0" {...glyph(c.s("graphite"), 1.8)} />
        <path d="M12 17.6 V20.4" {...glyph(c.s("graphite"), 1.8)} />
        <rect x="7.6" y="20" width="8.8" height="2" rx="1" fill={c.f("steel")} />
        <rect x="8.2" y="2.2" width="7.6" height="12.6" rx="3.8" fill={c.f("silver")} {...rim("#a9afbd", 0.5)} />
        <path d="M8.6 6.4 H15.4 M8.4 9 H15.6" {...glyph("#8d94a3", 1)} />
        <rect x="8.2" y="11.2" width="7.6" height="1.6" fill={c.f("steel")} />
        <ellipse cx="10" cy="4.8" rx="0.8" ry="1.3" {...shine} />
      </>
    )}
  </Icon>
);

export const AttachIcon = (p: IconProps) => (
  <Icon {...p} tones={["purple"]}>
    {(c) => (
      <>
        <path d="M16.5 6.5l-8 8.2a2 2 0 0 0 2.8 2.8l8.1-8.2a4 4 0 0 0-5.7-5.7l-8.1 8.2a6 6 0 0 0 8.5 8.5l8-8.1" {...glyph(c.s("purple"), 2.4)} />
        <path d="M14.4 4.4 a3 3 0 0 1 2.8 -.6" {...glyph("#fff", 0.8)} opacity={0.7} />
        <path d="M4.4 15.6 a4.6 4.6 0 0 0 1.4 3" {...glyph("#fff", 0.8)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const PlayIcon = (p: IconProps) => (
  <Icon {...p} tones={["green"]}>
    {(c) => (
      <>
        <path d="M7 5.6 v12.8 c0 1.1 1.2 1.8 2.2 1.2 l10 -6.4 c.9 -.6 .9 -1.8 0 -2.4 l-10 -6.4 C8.2 3.8 7 4.5 7 5.6 Z" fill={c.f("green")} stroke={c.s("green")} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M9.4 7.4 V12" {...glyph("#fff", 1.1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const PauseIcon = (p: IconProps) => (
  <Icon {...p} tones={["sky"]}>
    {(c) => (
      <>
        <rect x="5" y="3.4" width="5.2" height="17.2" rx="2" fill={c.f("sky")} />
        <rect x="13.8" y="3.4" width="5.2" height="17.2" rx="2" fill={c.f("sky")} />
        <path d="M6.9 5.8 V10 M15.7 5.8 V10" {...glyph("#fff", 1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const StopIcon = (p: IconProps) => (
  <Icon {...p} tones={["red"]}>
    {(c) => (
      <>
        <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="3.6" fill={c.f("red")} />
        <ellipse cx="8" cy="7.4" rx="2.2" ry="1.3" {...shine} />
      </>
    )}
  </Icon>
);

export const SkipBackIcon = (p: IconProps) => (
  <Icon {...p} tones={["sky"]}>
    {(c) => (
      <>
        <path d="M19.6 6.4 v11.2 c0 1.1 -1.2 1.8 -2.2 1.2 l-8.6 -5.6 c-.9 -.6 -.9 -1.8 0 -2.4 l8.6 -5.6 c1 -.6 2.2 .1 2.2 1.2 Z" fill={c.f("sky")} />
        <rect x="3.4" y="4.6" width="3.4" height="14.8" rx="1.7" fill={c.f("sky")} />
        <path d="M17.6 7.6 V11" {...glyph("#fff", 1.1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const SkipForwardIcon = (p: IconProps) => (
  <Icon {...p} tones={["sky"]}>
    {(c) => (
      <>
        <path d="M4.4 6.4 v11.2 c0 1.1 1.2 1.8 2.2 1.2 l8.6 -5.6 c.9 -.6 .9 -1.8 0 -2.4 l-8.6 -5.6 c-1 -.6 -2.2 .1 -2.2 1.2 Z" fill={c.f("sky")} />
        <rect x="17.2" y="4.6" width="3.4" height="14.8" rx="1.7" fill={c.f("sky")} />
        <path d="M6.4 7.6 V11" {...glyph("#fff", 1.1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const Volume2Icon = (p: IconProps) => (
  <Icon {...p} tones={["steel", "sky"]}>
    {(c) => (
      <>
        <path d="M11.6 4.6 v14.8 c0 1 -1.1 1.5 -1.9 .9 L6.1 16.6 H4.4 a2 2 0 0 1 -2 -2 V9.4 a2 2 0 0 1 2 -2 h1.7 l3.6 -3.7 c.8 -.6 1.9 -.1 1.9 .9 Z" fill={c.f("steel")} />
        <path d="M8.2 7.2 L10.2 5.4" {...glyph("#fff", 0.9)} opacity={0.6} />
        <path d="M14.8 8.6 a4.8 4.8 0 0 1 0 6.8" {...glyph(c.s("sky"), 2)} />
        <path d="M17.8 5.6 a9 9 0 0 1 0 12.8" {...glyph(c.s("sky"), 2)} />
      </>
    )}
  </Icon>
);

export const VolumeXIcon = (p: IconProps) => (
  <Icon {...p} tones={["steel", "red"]}>
    {(c) => (
      <>
        <path d="M11.6 4.6 v14.8 c0 1 -1.1 1.5 -1.9 .9 L6.1 16.6 H4.4 a2 2 0 0 1 -2 -2 V9.4 a2 2 0 0 1 2 -2 h1.7 l3.6 -3.7 c.8 -.6 1.9 -.1 1.9 .9 Z" fill={c.f("steel")} />
        <path d="M8.2 7.2 L10.2 5.4" {...glyph("#fff", 0.9)} opacity={0.6} />
        <path d="M15.2 9.2 l5.4 5.6 M20.6 9.2 l-5.4 5.6" {...glyph(c.s("red"), 2.4)} />
      </>
    )}
  </Icon>
);

export const HeadphonesIcon = (p: IconProps) => (
  <Icon {...p} tones={["graphite", "purple"]}>
    {(c) => (
      <>
        <path d="M4 15.4 V12 a8 8 0 0 1 16 0 v3.4" {...glyph(c.s("graphite"), 2)} />
        <rect x="2.6" y="12.8" width="6" height="8.6" rx="2.6" fill={c.f("purple")} />
        <rect x="15.4" y="12.8" width="6" height="8.6" rx="2.6" fill={c.f("purple")} />
        <path d="M4.4 14.6 V17 M17.2 14.6 V17" {...glyph("#fff", 1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const AudioLinesIcon = (p: IconProps) => (
  <Icon {...p} tones={["purple"]}>
    {(c) => <path d="M3 10v4M7.5 6.5v11M12 3.5v17M16.5 7.5v9M21 10v4" {...glyph(c.s("purple"), 2.6)} />}
  </Icon>
);

export const MonitorIcon = (p: IconProps) => (
  <Icon {...p} tones={["graphite", "sky", "silver"]}>
    {(c) => (
      <>
        <path d="M10.4 16.6 h3.2 l.6 3.4 h-4.4 Z" fill={c.f("silver")} />
        <rect x="7" y="19.4" width="10" height="2" rx="1" fill={c.f("silver")} />
        <rect x="2" y="3" width="20" height="14.2" rx="2.6" fill={c.f("graphite")} stroke="#8a91a0" strokeWidth="0.5" />
        <rect x="3.6" y="4.6" width="16.8" height="11" rx="1.2" fill={c.f("sky")} />
        <path d="M5.6 13.4 L11.6 6.6 M8.6 13.4 L12.6 9" {...glyph("#fff", 1)} opacity={0.4} />
      </>
    )}
  </Icon>
);

export const SunIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "orange"]}>
    {(c) => (
      <>
        <path d="M19.4 12 L21.6 12 M17.23 17.23 L18.79 18.79 M12 19.4 L12 21.6 M6.77 17.23 L5.21 18.79 M4.6 12 L2.4 12 M6.77 6.77 L5.21 5.21 M12 4.6 L12 2.4 M17.23 6.77 L18.79 5.21" {...glyph(c.s("orange"), 2.6)} />
        <circle cx="12" cy="12" r="5.9" fill={c.f("gold")} />
        <ellipse cx="9.9" cy="9.6" rx="1.9" ry="1.2" {...shine} />
      </>
    )}
  </Icon>
);

export const MoonIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold"]}>
    {(c) => (
      <>
        <path d="M10.8 2.4 a7.4 7.4 0 0 0 10.8 10.4 A9.7 9.7 0 1 1 10.8 2.4 Z" fill={c.f("gold")} />
        <circle cx="9" cy="15.6" r="1.5" fill="#f5b52a" />
        <circle cx="13.6" cy="17.6" r="0.9" fill="#f5b52a" />
        <path d="M5.2 10.6 a7 7 0 0 1 2.6 -4.4" {...glyph("#fff", 1.1)} opacity={0.65} />
      </>
    )}
  </Icon>
);

export const CloudIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper"]}>
    {(c) => (
      <>
        <path d="M6.6 19.6 a4.1 4.1 0 0 1 -.7 -8.1 a6.1 6.1 0 0 1 11.7 -1.5 a4.8 4.8 0 0 1 .3 9.6 Z" fill={c.f("paper")} {...rim("#a9bfd6", 0.6)} />
        <path d="M5.4 17.6 Q8 18.4 10.6 17.6 Q14.4 18.6 17.6 17.4" {...glyph("#cfdcea", 1.1)} />
        <ellipse cx="11" cy="8.4" rx="2.4" ry="1.1" fill="#fff" />
      </>
    )}
  </Icon>
);

export const LightbulbIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "silver", "graphite"]}>
    {(c) => (
      <>
        <path d="M12 2.4 a7 7 0 0 1 4.3 12.5 c-.8 .6 -1.3 1.5 -1.3 2.4 v.4 H9 v-.4 c0 -.9 -.5 -1.8 -1.3 -2.4 A7 7 0 0 1 12 2.4 Z" fill={c.f("gold")} />
        <path d="M10.2 17.3 V13 l1.8 -1.6 l1.8 1.6 v4.3" {...glyph("#f06a12", 0.9)} />
        <rect x="8.8" y="17.4" width="6.4" height="3" rx="1" fill={c.f("silver")} />
        <rect x="10.2" y="20" width="3.6" height="1.8" rx="0.9" fill={c.f("graphite")} />
        <ellipse cx="9" cy="7.6" rx="1.2" ry="2.3" {...shine} />
      </>
    )}
  </Icon>
);

export const ThumbsUpIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "green"]}>
    {(c) => (
      <>
        <path d="M7 10.5 h.2 a2 2 0 0 0 1.8 -1.1 l2.6 -5.4 c.3 -.6 1 -.9 1.6 -.7 c1.5 .5 2.4 2.1 2 3.7 l-.7 3 h4.2 a2.5 2.5 0 0 1 2.4 3.2 l-1.9 6.5 c-.4 1.1 -1.4 1.8 -2.5 1.8 H7 Z" fill={c.f("gold")} />
        <path d="M15.4 13.6 h4.6 M15.2 17 h3.8" {...glyph("#e9a017", 1)} />
        <rect x="2.3" y="9.8" width="5.6" height="12.2" rx="1.6" fill={c.f("green")} />
        <path d="M11.6 5.6 L10 9" {...glyph("#fff", 1.1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const ThumbsDownIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "red"]}>
    {(c) => (
      <>
        <path d="M7 13.5 h.2 a2 2 0 0 1 1.8 1.1 l2.6 5.4 c.3 .6 1 .9 1.6 .7 c1.5 -.5 2.4 -2.1 2 -3.7 l-.7 -3 h4.2 a2.5 2.5 0 0 0 2.4 -3.2 l-1.9 -6.5 c-.4 -1.1 -1.4 -1.8 -2.5 -1.8 H7 Z" fill={c.f("gold")} />
        <path d="M15.4 10.4 h4.6 M15.2 7 h3.8" {...glyph("#e9a017", 1)} />
        <rect x="2.3" y="2" width="5.6" height="12.2" rx="1.6" fill={c.f("red")} />
        <path d="M9.6 4.6 h3.6" {...glyph("#fff", 1.1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const CartIcon = (p: IconProps) => (
  <Icon {...p} tones={["silver", "green", "red", "steel"]}>
    {(c) => (
      <>
        <rect x="9.4" y="3.6" width="5.2" height="5.2" rx="1" fill={c.f("green")} />
        <circle cx="17.4" cy="6.2" r="2.6" fill={c.f("red")} />
        <path d="M2.4 3.4 h1.6 c.9 0 1.6 .6 1.8 1.5 l2.4 11.3 h11.2" {...glyph(c.s("steel"), 1.8)} />
        <path d="M5.4 7.6 H20.6 a1.3 1.3 0 0 1 1.3 1.6 l-1.3 5.2 a2.4 2.4 0 0 1 -2.3 1.8 H10.2 a2.4 2.4 0 0 1 -2.3 -1.9 Z" fill={c.f("silver")} {...rim("#8c93a3", 0.6)} />
        <path d="M11.6 9.6 v4.6 M15 9.6 v4.6 M18.4 9.6 v4.6" {...glyph("#9aa1b0", 1)} />
        <circle cx="9.6" cy="19.8" r="2" fill={c.f("steel")} />
        <circle cx="17.6" cy="19.8" r="2" fill={c.f("steel")} />
        <circle cx="9.6" cy="19.8" r="0.8" fill="#2c303a" />
        <circle cx="17.6" cy="19.8" r="0.8" fill="#2c303a" />
      </>
    )}
  </Icon>
);

export const CreditCardIcon = (p: IconProps) => (
  <Icon {...p} tones={["purple", "gold"]}>
    {(c) => (
      <>
        <rect x="2" y="4.5" width="20" height="15" rx="2.8" fill={c.f("purple")} />
        <rect x="5" y="9" width="4.6" height="3.6" rx="0.9" fill={c.f("gold")} />
        <rect x="5" y="15.4" width="5" height="1.4" rx="0.7" fill="#fff" opacity={0.8} />
        <rect x="11.4" y="15.4" width="3" height="1.4" rx="0.7" fill="#fff" opacity={0.55} />
        <rect x="4.4" y="6" width="15.2" height="1" rx="0.5" {...shine} opacity={0.4} />
      </>
    )}
  </Icon>
);

export const ShieldIcon = (p: IconProps) => (
  <Icon {...p} tones={["green", "silver"]}>
    {(c) => (
      <>
        <path d="M11.2 2.6 l-6.4 2.4 c-.8 .3 -1.3 1.1 -1.3 1.9 v5 c0 4.8 3.4 8.4 7.6 9.9 .6 .2 1.2 .2 1.8 0 4.2 -1.5 7.6 -5.1 7.6 -9.9 v-5 c0 -.8 -.5 -1.6 -1.3 -1.9 l-6.4 -2.4 c-.5 -.2 -1.1 -.2 -1.6 0 Z" fill={c.f("green")} stroke={c.s("silver")} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 4.6 V19.6 c3.4 -1.4 5.9 -4.4 5.9 -8 V7.3 Z" fill="#1d8f3e" opacity={0.45} />
        <ellipse cx="8.6" cy="8.6" rx="1.4" ry="2.3" {...shine} />
      </>
    )}
  </Icon>
);

export const KeyIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold"]}>
    {(c) => (
      <>
        <path d="M10.6 13.4 L20.2 3.8 M15.6 8.4 l2.8 2.8 M18.4 5.6 l2.4 2.4" {...glyph(c.s("gold"), 3)} />
        <path d="M7.4 10.6 a5.6 5.6 0 1 1 0 11.2 a5.6 5.6 0 1 1 0 -11.2 Z M6.2 16.2 a1.7 1.7 0 1 0 3.4 0 a1.7 1.7 0 1 0 -3.4 0 Z" fill={c.f("gold")} fillRule="evenodd" />
        <path d="M4 15 a3.6 3.6 0 0 1 2.4 -2.6" {...glyph("#fff", 1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const LogOutIcon = (p: IconProps) => (
  <Icon {...p} tones={["steel", "wood", "gold", "red"]}>
    {(c) => (
      <>
        <rect x="2.6" y="2.6" width="10.4" height="18.8" rx="2" fill={c.f("steel")} />
        <rect x="4.2" y="4.2" width="7.2" height="17.2" rx="1" fill={c.f("wood")} />
        <circle cx="9.6" cy="13" r="0.9" fill={c.f("gold")} />
        <rect x="9.6" y="10.6" width="7.4" height="2.8" rx="1.4" fill={c.f("red")} />
        <path d="M15.6 7.4 L21.2 12 L15.6 16.6 Z" fill={c.f("red")} stroke={c.s("red")} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M11 11.4 h4.6" {...glyph("#fff", 0.8)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const DatabaseIcon = (p: IconProps) => (
  <Icon {...p} tones={["blue", "sky"]}>
    {(c) => (
      <>
        <path d="M4 5.6 v12.8 c0 1.8 3.6 3.2 8 3.2 s8 -1.4 8 -3.2 V5.6 Z" fill={c.f("blue")} />
        <path d="M4 11.4 c0 1.8 3.6 3.2 8 3.2 s8 -1.4 8 -3.2 M4 16.2 c0 1.8 3.6 3.2 8 3.2 s8 -1.4 8 -3.2" {...glyph("#8fb4ff", 0.9)} opacity={0.8} />
        <ellipse cx="12" cy="5.6" rx="8" ry="3.2" fill={c.f("sky")} />
        <ellipse cx="9.4" cy="4.9" rx="2.4" ry="0.9" {...shine} />
      </>
    )}
  </Icon>
);

export const ChartIcon = (p: IconProps) => (
  <Icon {...p} tones={["orange", "green", "sky"]}>
    {(c) => (
      <>
        <rect x="2.4" y="12.6" width="5" height="8.8" rx="1.6" fill={c.f("orange")} />
        <rect x="9.5" y="2.6" width="5" height="18.8" rx="1.6" fill={c.f("green")} />
        <rect x="16.6" y="8" width="5" height="13.4" rx="1.6" fill={c.f("sky")} />
        <path d="M3.8 14.2 v2.4 M10.9 4.2 v4 M18 9.6 v3" {...glyph("#fff", 1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const BotIcon = (p: IconProps) => (
  <Icon {...p} tones={["silver", "steel", "graphite", "red"]}>
    {(c) => (
      <>
        <path d="M12 7 V4.4" {...glyph(c.s("steel"), 1.4)} />
        <circle cx="12" cy="3.6" r="1.7" fill={c.f("red")} />
        <rect x="1.6" y="11.6" width="2.2" height="4.6" rx="1.1" fill={c.f("steel")} />
        <rect x="20.2" y="11.6" width="2.2" height="4.6" rx="1.1" fill={c.f("steel")} />
        <rect x="3.2" y="6.8" width="17.6" height="14" rx="4.4" fill={c.f("silver")} {...rim("#8c93a3", 0.5)} />
        <rect x="5.6" y="9.6" width="12.8" height="7.6" rx="3" fill={c.f("graphite")} />
        <rect x="8.2" y="11.4" width="2" height="4" rx="1" fill="#6fe3d4" />
        <rect x="13.8" y="11.4" width="2" height="4" rx="1" fill="#6fe3d4" />
        <rect x="6.4" y="7.8" width="7" height="0.9" rx="0.45" {...shine} opacity={0.7} />
      </>
    )}
  </Icon>
);

export const TerminalSquareIcon = (p: IconProps) => (
  <Icon {...p} tones={["graphite", "silver", "steel", "green"]}>
    {(c) => (
      <>
        <rect x="2.5" y="3" width="19" height="18" rx="3.4" fill={c.f("graphite")} stroke={c.s("steel")} strokeWidth="0.8" />
        <path d="M2.5 6.4 a3.4 3.4 0 0 1 3.4 -3.4 h12.2 a3.4 3.4 0 0 1 3.4 3.4 v1.4 h-19 Z" fill={c.f("silver")} />
        <circle cx="5.6" cy="5.5" r="0.85" fill="#e5322d" />
        <circle cx="8.2" cy="5.5" r="0.85" fill="#f5a913" />
        <circle cx="10.8" cy="5.5" r="0.85" fill="#22a447" />
        <path d="M6.6 11.2 l3 2.8 -3 2.8 M12.2 17 h4.6" {...glyph(c.s("green"), 2)} />
      </>
    )}
  </Icon>
);

export const ShapesIcon = (p: IconProps) => (
  <Icon {...p} tones={["red", "blue", "gold"]}>
    {(c) => (
      <>
        <path d="M12 3 L17 11 H7 Z" fill={c.f("red")} stroke={c.s("red")} strokeWidth="2.2" strokeLinejoin="round" />
        <rect x="2.4" y="13" width="8.6" height="8.6" rx="2.2" fill={c.f("blue")} />
        <circle cx="17.5" cy="17.3" r="4.4" fill={c.f("gold")} />
        <path d="M11.2 5.6 L9.6 8.4" {...glyph("#fff", 0.9)} opacity={0.6} />
        <rect x="4" y="14.4" width="3.4" height="1" rx="0.5" {...shine} />
        <ellipse cx="16" cy="15.4" rx="1.4" ry="0.9" {...shine} />
      </>
    )}
  </Icon>
);

export const NavigationIcon = (p: IconProps) => (
  <Icon {...p} tones={["blue", "sky"]}>
    {(c) => (
      <>
        <path d="M19.7 3.5 Q21 3 20.5 4.3 L14.3 19.3 Q13.8 20.6 13.4 19.3 L11.7 13.6 Q11.4 12.6 10.4 12.3 L4.7 10.6 Q3.4 10.2 4.7 9.7 Z" fill={c.f("blue")} stroke={c.s("blue")} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M19.8 3.9 L4.9 10 L10.4 11.7 Q11.8 12 12.2 12.1 Z" fill={c.f("sky")} />
        <path d="M17.4 5.6 L8.6 9.3" {...glyph("#fff", 0.9)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const ServerIcon = (p: IconProps) => (
  <Icon {...p} tones={["steel", "silver"]}>
    {(c) => (
      <>
        <rect x="2.5" y="3" width="19" height="7.8" rx="2.6" fill={c.f("steel")} stroke={c.s("silver")} strokeWidth="0.8" />
        <rect x="2.5" y="13.2" width="19" height="7.8" rx="2.6" fill={c.f("steel")} stroke={c.s("silver")} strokeWidth="0.8" />
        <circle cx="6.8" cy="6.9" r="1.3" fill="#7fe08a" />
        <circle cx="6.8" cy="17.1" r="1.3" fill="#7fe08a" />
        <path d="M11.6 6.9 h6.4 M11.6 17.1 h6.4" {...glyph("#2c303a", 1.4)} />
        <rect x="4.4" y="4" width="15.2" height="0.8" rx="0.4" {...shine} opacity={0.5} />
        <rect x="4.4" y="14.2" width="15.2" height="0.8" rx="0.4" {...shine} opacity={0.5} />
      </>
    )}
  </Icon>
);

export const InboxIcon = (p: IconProps) => (
  <Icon {...p} tones={["teal", "paper"]}>
    {(c) => (
      <>
        <rect x="2.5" y="3.5" width="19" height="17" rx="3.6" fill="#0f857c" />
        <rect x="6" y="5.6" width="12" height="9" rx="1" fill={c.f("paper")} />
        <path d="M8.2 8.4 h7.6 M8.2 10.8 h5" {...glyph("#c4c9d6", 1)} />
        <path d="M2.5 13 h4.2 c.6 0 1.1 .4 1.3 .9 l.5 1.4 c.2 .5 .7 .9 1.3 .9 h4.4 c.6 0 1.1 -.4 1.3 -.9 l.5 -1.4 c.2 -.5 .7 -.9 1.3 -.9 h4.2 v3.9 a3.6 3.6 0 0 1 -3.6 3.6 H6.1 a3.6 3.6 0 0 1 -3.6 -3.6 Z" fill={c.f("teal")} />
        <path d="M3.8 14.2 h2.6" {...glyph("#fff", 0.8)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const InboxFilledIcon = InboxIcon;

export const CalendarDaysIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper", "blue", "graphite"]}>
    {(c) => (
      <>
        <rect x="3" y="4.5" width="18" height="16.5" rx="3" fill={c.f("paper")} {...rim("#c4c9d6", 0.5)} />
        <path d="M3 7.5 a3 3 0 0 1 3 -3 h12 a3 3 0 0 1 3 3 v2.3 H3 Z" fill={c.f("blue")} />
        <rect x="7" y="2.4" width="2" height="4.4" rx="1" fill={c.f("graphite")} />
        <rect x="15" y="2.4" width="2" height="4.4" rx="1" fill={c.f("graphite")} />
        {[7.6, 12, 16.4].map((x) => [13.4, 17.2].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.35" fill={x === 16.4 && y === 13.4 ? "#f06a12" : "#b9c0ce"} />))}
      </>
    )}
  </Icon>
);

export const CalendarDaysFilledIcon = CalendarDaysIcon;

export const HistoryIcon = (p: IconProps) => (
  <Icon {...p} tones={["blue", "paper", "graphite"]}>
    {(c) => (
      <>
        <path d="M3.4 12 A8.6 8.6 0 1 0 6.9 5.1" {...glyph(c.s("blue"), 2.2)} />
        <path d="M3.9 7.6 L5 3 L8.6 7.4 Z" fill={c.f("blue")} stroke={c.s("blue")} strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="6.2" fill={c.f("paper")} {...rim("#c4c9d6", 0.5)} />
        <path d="M12 8.4 V12 l2.6 1.6" {...glyph(c.s("graphite"), 1.5)} />
        <circle cx="12" cy="12" r="0.9" fill="#e5322d" />
      </>
    )}
  </Icon>
);

export const ClipboardListIcon = (p: IconProps) => (
  <Icon {...p} tones={["wood", "paper", "silver", "green"]}>
    {(c) => (
      <>
        <rect x="3.8" y="3.8" width="16.4" height="18" rx="2.6" fill={c.f("wood")} />
        <rect x="6" y="6.4" width="12" height="13.4" rx="1" fill={c.f("paper")} />
        <rect x="8.4" y="2.2" width="7.2" height="4.4" rx="1.6" fill={c.f("silver")} {...rim("#8c93a3", 0.5)} />
        <circle cx="8.9" cy="11.2" r="1.2" fill={c.f("green")} />
        <circle cx="8.9" cy="15.6" r="1.2" fill={c.f("green")} />
        <path d="M11.4 11.2 h4.6 M11.4 15.6 h4.6" {...glyph("#b9c0ce", 1.3)} />
      </>
    )}
  </Icon>
);

/** The PaneUI mark: an app window whose sidebar and top-right pane read as a P. */
export const PaneuiLogoIcon = (p: IconProps) => (
  <Icon {...p} tones={["graphite", "silver"]}>
    {(c) => <path fillRule="evenodd" d="M8 2H16A6 6 0 0 1 22 8V16A6 6 0 0 1 16 22H8A6 6 0 0 1 2 16V8A6 6 0 0 1 8 2Z M7.25 4.75H7.25A2.5 2.5 0 0 1 9.75 7.25V16.75A2.5 2.5 0 0 1 7.25 19.25H7.25A2.5 2.5 0 0 1 4.75 16.75V7.25A2.5 2.5 0 0 1 7.25 4.75Z M15 4.75H16A3.25 3.25 0 0 1 19.25 8V11A3.25 3.25 0 0 1 16 14.25H15A3.25 3.25 0 0 1 11.75 11V8A3.25 3.25 0 0 1 15 4.75Z" fill={c.f("graphite")} stroke={c.s("silver")} strokeWidth="0.6" />}
  </Icon>
);

/** The PaneUI mark in one colour, for single-ink places (a solid chip, print, a favicon mask). */
export const PaneuiLogoMonoIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path fillRule="evenodd" d="M8 2H16A6 6 0 0 1 22 8V16A6 6 0 0 1 16 22H8A6 6 0 0 1 2 16V8A6 6 0 0 1 8 2Z M7.25 4.75H7.25A2.5 2.5 0 0 1 9.75 7.25V16.75A2.5 2.5 0 0 1 7.25 19.25H7.25A2.5 2.5 0 0 1 4.75 16.75V7.25A2.5 2.5 0 0 1 7.25 4.75Z M15 4.75H16A3.25 3.25 0 0 1 19.25 8V11A3.25 3.25 0 0 1 16 14.25H15A3.25 3.25 0 0 1 11.75 11V8A3.25 3.25 0 0 1 15 4.75Z" fill="currentColor" />
  </Glyph>
);

export const GithubIcon = (p: IconProps) => (
  <Icon {...p} tones={["graphite", "silver"]}>
    {(c) => (
      <>
        <circle cx="12" cy="12" r="9.8" fill={c.f("graphite")} stroke={c.s("silver")} strokeWidth="0.9" />
        <path d="M7.66 4.77 c.76 0 2.04 .89 2.67 1.52 a10.69 10.69 0 0 1 4.07 0 c.64 -.64 1.91 -1.52 2.67 -1.52 .38 1.02 .51 2.29 .25 3.31 .76 .89 1.15 1.91 1.15 3.06 0 2.8 -1.66 4.2 -4.2 4.58 .38 .51 .51 1.15 .51 1.91 v3.6 H9.95 v-3.6 c0 -.76 .13 -1.4 .51 -1.91 -2.55 -.38 -4.2 -1.78 -4.2 -4.58 0 -1.15 .38 -2.16 1.15 -3.06 -.25 -1.02 -.13 -2.29 .25 -3.31 Z" fill={c.f("silver")} />
        <path d="M9.95 18.4 c-1.66 0 -2.55 -.51 -3.18 -1.4" {...glyph("#d6dae3", 1.2)} />
        <path d="M5.6 7.6 a7.6 7.6 0 0 1 3 -3" {...glyph("#fff", 0.9)} opacity={0.45} />
      </>
    )}
  </Icon>
);

export const Columns2Icon = (p: IconProps) => (
  <Glyph {...p}>
    <rect {...line} x="2.5" y="3.5" width="19" height="17" rx="4.5" />
    <path {...line} d="M12 3.5v17" />
  </Glyph>
);

export const Rows2Icon = (p: IconProps) => (
  <Glyph {...p}>
    <rect {...line} x="2.5" y="3.5" width="19" height="17" rx="4.5" />
    <path {...line} d="M2.5 12h19" />
  </Glyph>
);

export const Heading1Icon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M3.5 5.5v13M11.5 5.5v13M3.5 12h8M16 10l3-2v10.5" />
  </Glyph>
);

export const Heading2Icon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M3.5 5.5v13M11.5 5.5v13M3.5 12h8M15.5 10a2.5 2.5 0 015 .6c0 2.6-5 4.4-5 7.9h5" />
  </Glyph>
);

export const Heading3Icon = (p: IconProps) => (
  <Glyph {...p}>
    <path {...line} d="M3.5 5.5v13M11.5 5.5v13M3.5 12h8M15.5 8.5h4.5l-2.6 3.6a3 3 0 11-2.2 5.6" />
  </Glyph>
);

export const LibraryIcon = (p: IconProps) => (
  <Icon {...p} tones={["red", "blue", "gold"]}>
    {(c) => (
      <>
        <rect x="2" y="3" width="5" height="18.4" rx="1.4" fill={c.f("red")} />
        <rect x="8.3" y="5.4" width="5" height="16" rx="1.4" fill={c.f("blue")} />
        <path d="M16.3 3.75 L17.4 3.5 a1.4 1.4 0 0 1 1.66 1.08 L21.9 18.1 a1.4 1.4 0 0 1 -1.08 1.66 L19.7 20 a1.4 1.4 0 0 1 -1.66 -1.08 L15.2 5.4 a1.4 1.4 0 0 1 1.1 -1.65 Z" fill={c.f("gold")} />
        <rect x="2" y="6.6" width="5" height="1.3" fill="#a81e1b" />
        <rect x="8.3" y="9" width="5" height="1.3" fill="#1d43a8" />
        <path d="M3.6 10 V18.2 M9.9 12.6 V18.6" {...glyph("#fff", 1)} opacity={0.55} />
        <path d="M16.8 7.4 L18.4 15" {...glyph("#fff", 1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const PlugIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "steel"]}>
    {(c) => (
      <>
        <path d="M12 16.4 V21.6" {...glyph(c.s("steel"), 2.6)} />
        <rect x="7.8" y="2.2" width="2.4" height="5.8" rx="1.2" fill={c.f("gold")} />
        <rect x="13.8" y="2.2" width="2.4" height="5.8" rx="1.2" fill={c.f("gold")} />
        <path d="M6.6 6.6 h10.8 a1.4 1.4 0 0 1 1.4 1.4 v2.6 a6.8 6.8 0 0 1 -13.6 0 V8 a1.4 1.4 0 0 1 1.4 -1.4 Z" fill={c.f("steel")} />
        <ellipse cx="9" cy="9.4" rx="1.9" ry="1.1" {...shine} />
      </>
    )}
  </Icon>
);

export const RssIcon = (p: IconProps) => (
  <Icon {...p} tones={["orange"]}>
    {(c) => (
      <>
        <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="5" fill={c.f("orange")} />
        <path d="M6.8 11.4a5.8 5.8 0 0 1 5.8 5.8M6.8 6.6a10.6 10.6 0 0 1 10.6 10.6" {...glyph("#fff", 2.4)} />
        <circle cx="7.6" cy="16.4" r="1.9" fill="#fff" />
        <ellipse cx="6.6" cy="4.9" rx="2.3" ry="1" {...shine} />
      </>
    )}
  </Icon>
);

export const LanguagesIcon = (p: IconProps) => (
  <Icon {...p} tones={["purple", "sky"]}>
    {(c) => (
      <>
        <rect x="2.2" y="2.2" width="12.6" height="12.6" rx="3.4" fill={c.f("purple")} />
        <path d="M5 5.9h6.6M8.3 4.4v1.5M10 5.9c-.5 2.3-2 4.2-4.6 5.4M6.6 8.2c.8 1.3 1.9 2.4 3.3 3" {...glyph("#fff", 1.3)} />
        <rect x="9.2" y="9.2" width="12.6" height="12.6" rx="3.4" fill={c.f("sky")} />
        <path d="M12.6 19.2l2.9-6.8 2.9 6.8M13.6 17.1h3.8" {...glyph("#fff", 1.5)} />
        <ellipse cx="12.4" cy="10.9" rx="1.8" ry="0.8" {...shine} />
      </>
    )}
  </Icon>
);

export const BlocksIcon = (p: IconProps) => (
  <Icon {...p} tones={["gold", "red", "blue", "green"]}>
    {(c) => (
      <>
        <rect x="2.4" y="4" width="8.6" height="8.6" rx="2.2" fill={c.f("gold")} />
        <rect x="2.4" y="13" width="8.6" height="8.6" rx="2.2" fill={c.f("red")} />
        <rect x="11.4" y="13" width="8.6" height="8.6" rx="2.2" fill={c.f("blue")} />
        <rect x="13.4" y="2.4" width="8.2" height="8.2" rx="2.2" fill={c.f("green")} />
        <rect x="4" y="5.4" width="3.4" height="1" rx="0.5" {...shine} />
        <rect x="4" y="14.4" width="3.4" height="1" rx="0.5" {...shine} />
        <rect x="13" y="14.4" width="3.4" height="1" rx="0.5" {...shine} />
        <rect x="15" y="3.8" width="3.2" height="1" rx="0.5" {...shine} />
      </>
    )}
  </Icon>
);

export const PuzzleIcon = (p: IconProps) => (
  <Icon {...p} tones={["green"]}>
    {(c) => (
      <>
        <path d="M3.2 10a2.6 2.6 0 0 1 2.6-2.6h2.1a2.7 2.7 0 1 1 4.4 0h2.1a2.6 2.6 0 0 1 2.6 2.6v2.1a2.7 2.7 0 1 1 0 4.4v1.9a2.6 2.6 0 0 1-2.6 2.6H5.8a2.6 2.6 0 0 1-2.6-2.6z" fill={c.f("green")} />
        <ellipse cx="7" cy="10.2" rx="2" ry="1.1" {...shine} />
        <ellipse cx="10.1" cy="4.6" rx="1" ry="0.6" {...shine} />
      </>
    )}
  </Icon>
);

export const MessageSquareIcon = (p: IconProps) => (
  <Icon {...p} tones={["teal"]}>
    {(c) => (
      <>
        <path d="M7 3.4h10a4.6 4.6 0 0 1 4.6 4.6v5.6a4.6 4.6 0 0 1-4.6 4.6H8.4l-4.2 3.3c-.7.5-1.8.1-1.8-.8V8A4.6 4.6 0 0 1 7 3.4z" fill={c.f("teal")} />
        <path d="M7.4 9.6h9.2M7.4 13.2h6" {...glyph("#fff", 1.6)} opacity={0.9} />
        <path d="M5 7.4 a2.6 2.6 0 0 1 2.2 -1.6" {...glyph("#fff", 1)} opacity={0.6} />
      </>
    )}
  </Icon>
);

export const ScrollTextIcon = (p: IconProps) => (
  <Icon {...p} tones={["paper", "wood", "steel"]}>
    {(c) => (
      <>
        <rect x="5.2" y="4" width="13.6" height="15.6" fill={c.f("paper")} {...rim("#a9afbd")} />
        <path d="M8.6 9h6.8M8.6 12h6.8M8.6 15h4.4" {...glyph(c.s("steel"), 1.3)} />
        <rect x="3.2" y="2.4" width="17.6" height="3.4" rx="1.7" fill={c.f("wood")} />
        <rect x="3.2" y="18.2" width="17.6" height="3.4" rx="1.7" fill={c.f("wood")} />
        <rect x="5" y="3.1" width="5" height="0.9" rx="0.45" {...shine} />
        <rect x="5" y="18.9" width="5" height="0.9" rx="0.45" {...shine} />
      </>
    )}
  </Icon>
);
