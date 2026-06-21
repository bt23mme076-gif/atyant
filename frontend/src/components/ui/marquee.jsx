import React from "react";
import { CheckCircle } from "lucide-react";

const AVATAR_COLORS = [
  { bg: '#EDE9FE', text: '#5B21B6' }, // violet
  { bg: '#DBEAFE', text: '#1D4ED8' }, // blue
  { bg: '#D1FAE5', text: '#065F46' }, // green
  { bg: '#FEF3C7', text: '#92400E' }, // amber
  { bg: '#FCE7F3', text: '#9D174D' }, // pink
  { bg: '#E0F2FE', text: '#0369A1' }, // sky
  { bg: '#FEE2E2', text: '#991B1B' }, // red
  { bg: '#F3E8FF', text: '#6B21A8' }, // purple
];

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name }) {
  const { bg, text } = getColor(name);
  return (
    <div
      className="size-11 rounded-full shrink-0 flex items-center justify-center font-bold text-sm select-none"
      style={{ background: bg, color: text }}
    >
      {getInitials(name)}
    </div>
  );
}

/**
 * Marquee — infinite scrolling testimonial/avatar cards.
 * Ported from demo.tsx → plain JSX (no TypeScript needed).
 *
 * Props:
 *   row1: CardT[]  — top row data
 *   row2: CardT[]  — bottom row data (scrolls reverse)
 *
 * CardT shape: { image: string, name: string, handle: string, date?: string }
 */

const DEFAULT_DATA = [
  {
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop",
    name: "Briar Martin",
    handle: "@neilstellar",
  },
  {
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    name: "Avery Johnson",
    handle: "@averywrites",
  },
  {
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
    name: "Jordan Lee",
    handle: "@jordantalks",
  },
  {
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60",
    name: "Casey Rivera",
    handle: "@caseybuilds",
  },
];

// Verified badge — uses lucide-react CheckCircle instead of custom SVG polygon
const VerifyIcon = () => (
  <CheckCircle size={14} className="inline-block text-blue-500 fill-blue-500 stroke-white" />
);

const Card = ({ card }) => (
  <div className="p-4 rounded-lg mx-4 shadow hover:shadow-lg transition-all duration-200 w-72 shrink-0 bg-white">
    <div className="flex gap-2">
      <Avatar name={card.name} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <p className="font-medium text-sm">{card.name}</p>
          <VerifyIcon />
        </div>
        <span className="text-xs text-slate-500">{card.handle}</span>
      </div>
    </div>
    <p className="text-sm pt-4 text-gray-800">
      {card.text || "Atyant made finding the right mentor for my exact career problem an absolute breeze."}
    </p>
  </div>
);

function MarqueeRow({ data, reverse = false, speed = 25 }) {
  const doubled = React.useMemo(() => [...data, ...data], [data]);

  return (
    <div className="relative w-full mx-auto max-w-5xl overflow-hidden">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 md:w-32 z-10 bg-gradient-to-r from-white to-transparent" />

      <div
        className={`flex transform-gpu min-w-[200%] ${reverse ? "pt-5 pb-10" : "pt-10 pb-5"}`}
        style={{
          animation: `marqueeScroll ${speed}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {doubled.map((c, i) => (
          <Card key={i} card={c} />
        ))}
      </div>

      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 md:w-32 z-10 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}

export default function Marquee({ row1 = DEFAULT_DATA, row2 = DEFAULT_DATA }) {
  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="flex flex-col gap-6">
        <MarqueeRow data={row1} reverse={false} speed={25} />
        <MarqueeRow data={row2} reverse={true}  speed={25} />
      </div>
    </>
  );
}
