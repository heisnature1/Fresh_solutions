/** Inline SVG icon set (24×24 stroke style) — no external icon dependency. */

const PATHS: Record<string, React.ReactNode> = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </>
  ),
  smartphone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 5.8v5.4c0 4.5 3 7.8 7 9.3 4-1.5 7-4.8 7-9.3V5.8L12 3Z" />
      <path d="m9.3 11.8 1.9 1.9 3.6-3.7" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="10" y="10" width="4" height="4" rx="1" />
      <path d="M9 6V3.5M15 6V3.5M9 20.5V18M15 20.5V18M6 9H3.5M6 15H3.5M20.5 9H18M20.5 15H18" />
    </>
  ),
  code: <path d="m8 8-4.5 4L8 16M16 8l4.5 4L16 16M13.5 5l-3 14" />,
  wrench: (
    <path d="M20.3 6.7a4.5 4.5 0 0 1-6 6L8 19a2.1 2.1 0 0 1-3-3l6.3-6.3a4.5 4.5 0 0 1 6-6l-3 3 2.4 2.4 3-3c.4.5.6 1 .6 1.6Z" />
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 13h18" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18.5a4.5 4.5 0 1 1 .9-8.9 5.5 5.5 0 0 1 10.6 2A3.7 3.7 0 0 1 17.5 19H7Z" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    </>
  ),
  circuit: (
    <>
      <rect x="8" y="8" width="8" height="8" rx="1.5" />
      <path d="M12 8V4.5M12 19.5V16M8 12H4.5M19.5 12H16" />
      <circle cx="12" cy="3" r="1.5" />
      <circle cx="12" cy="21" r="1.5" />
      <circle cx="3" cy="12" r="1.5" />
      <circle cx="21" cy="12" r="1.5" />
    </>
  ),
  tool: (
    <path d="M13.4 6.1 16.9 2.6l4.5 4.5-3.5 3.5-4.5-4.5ZM14.4 9.6 4.9 19.1l1.9 1.9 9.5-9.5-1.9-1.9Z" />
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.3 2.3 2.3 4.7-4.9" />
    </>
  ),
  "arrow-right": <path d="M4 12h15M13 6l6 6-6 6" />,
  "chevron-down": <path d="m6 9.5 6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  phone: (
    <path d="M5 4h4l1.5 4.5L8 10a12.5 12.5 0 0 0 6 6l1.5-2.5L20 15v4a1.8 1.8 0 0 1-2 2A16.5 16.5 0 0 1 3 6a1.8 1.8 0 0 1 2-2Z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  whatsapp: (
    <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.2A8.5 8.5 0 1 0 12 3.5Zm4.2 11.4c-.6.9-1.3 1.3-2.1 1.3-1.9 0-4.6-1.7-5.9-4.3-.6-1.2-.7-2.3-.3-3 .2-.4.6-.7 1-.7h.5c.3 0 .6.2.8.5l.8 1.5c.1.2.1.5 0 .7l-.5.7c.5 1 1.7 2.2 2.8 2.7l.6-.5c.2-.2.5-.2.7-.1l1.5.8c.2.2.3.3.1.9Z" />
  ),
  "map-pin": (
    <>
      <path d="M12 21s-7-5.8-7-11a7 7 0 0 1 14 0c0 5.2-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  star: <path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2-5.6-3-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3Z" />,
  "file-text": (
    <>
      <path d="M6 2.5h8L19 8v13.5H6V2.5Z" />
      <path d="M14 2.5V8H19M9 12.5h6M9 16h6" />
    </>
  ),
  download: <path d="M12 3.5V15m0 0 4.5-4.5M12 15 7.5 10.5M4.5 20.5h15" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4.6-4.6" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4 10.5 13.5M18 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 20c.5-3.5 2.8-5.3 5.5-5.3s5 1.8 5.5 5.3M15.5 5a3.5 3.5 0 0 1 0 6.5M17.5 14.9c1.8.7 2.8 2.3 3 5.1" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="m8.8 13.5-1.3 7 4.5-2.5 4.5 2.5-1.3-7" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 4l1.7 4.6L18.5 10l-4.8 1.4L12 16l-1.7-4.6L5.5 10l4.8-1.4L12 4Z" />
      <path d="M18.5 15.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1Z" />
    </>
  ),
  "alert-triangle": (
    <>
      <path d="M12 4 2.8 19.5h18.4L12 4Z" />
      <path d="M12 10v4M12 17.2v.3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.5" />
    </>
  ),
  logout: <path d="M14 4h-8a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8M10 12h10.5m0 0L17 8.5m3.5 3.5L17 15.5" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6" />
    </>
  ),
  home: <path d="M4 11.5 12 4l8 7.5M6 9.5V20h12V9.5" />,
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12.5 9 5 9-5M3 17l9 5 9-5" opacity="0.55" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13.5 6.5 5h11l2.5 8.5V19H4v-5.5Z" />
      <path d="M4 13.5h5l1 2h4l1-2h5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M8 2.8V6.5M16 2.8V6.5" />
    </>
  ),
  printer: (
    <>
      <path d="M7 8V3.5h10V8" />
      <rect x="3.5" y="8" width="17" height="8.5" rx="2" />
      <path d="M7 14h10v6.5H7V14Z" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  "arrow-left": <path d="M20 12H5M11 6l-6 6 6 6" />,
  camera: (
    <>
      <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  refresh: <path d="M20 5v5h-5M4 19v-5h5M19.5 10a8 8 0 0 0-14-3M4.5 14a8 8 0 0 0 14 3" />,
  send: <path d="M21 3.5 10.4 13.9M21 3.5l-6.8 17-3.8-6.6L3.5 10 21 3.5Z" />,
  edit: <path d="M14.5 5.5 18.5 9.5M4 20l1-4L15.5 5.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" />,
  trash: <path d="M4.5 6.5h15M9 6V4h6v2M6.5 6.5 7.5 20.5h9l1-14M10 10.5v6M14 10.5v6" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.5v.3" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M9 15.5h2M13 15.5h2M10.5 20.5v-3h3v3" />
    </>
  ),
  graduation: (
    <>
      <path d="m12 4 10 5-10 5L2 9l10-5Z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.7-9.3-9C1.3 7.6 3.4 4.5 6.6 4.5c2 0 3.6 1.1 4.4 2.8.8-1.7 2.4-2.8 4.4-2.8 3.2 0 5.3 3.1 3.9 6.5-1.8 4.3-7.3 9-7.3 9Z" />,
  tag: (
    <>
      <path d="M3.5 11.2V4.5a1 1 0 0 1 1-1h6.7a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8l-5.9 5.9a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1-.6-1.4Z" />
      <circle cx="8" cy="8" r="1.2" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  className,
  strokeWidth = 1.8,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const content = PATHS[name];
  if (!content) return null;
  const filled = name === "whatsapp" || name === "star";
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {content}
    </svg>
  );
}

export function ServiceIcon({ icon, className }: { icon: string; className?: string }) {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-electric-600/10 text-electric-600 ring-1 ring-inset ring-electric-600/15">
      <Icon name={icon} className={className ?? "h-[22px] w-[22px]"} strokeWidth={1.7} />
    </span>
  );
}
