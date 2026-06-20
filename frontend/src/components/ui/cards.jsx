import { cn } from "../../lib/utils";
import { useState } from "react";

/**
 * BlogCards — Latest Blog section with 3 cards.
 * Ported from cards.tsx → plain JSX (no TypeScript needed).
 *
 * Props:
 *   cards: Array<{ image: string, title: string, category: string }>
 *   title: string (default "Latest Blog")
 *   subtitle: string
 */

const DEFAULT_CARDS = [
  {
    image:
      "https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=1200&h=800&auto=format&fit=crop&q=60",
    title: "Color Psychology in UI: How to Choose the Right Palette",
    category: "UI/UX design",
  },
  {
    image:
      "https://images.unsplash.com/photo-1714974528646-ea024a3db7a7?w=1200&h=800&auto=format&fit=crop&q=60",
    title: "Understanding Typography: Crafting a Visual Voice for Your Brand",
    category: "Branding",
  },
  {
    image:
      "https://images.unsplash.com/photo-1713947501966-34897f21162e?w=1200&h=800&auto=format&fit=crop&q=60",
    title: "Design Thinking in Practice: How to Solve Real User Problems",
    category: "Product Design",
  },
];

export default function BlogCards({
  cards = DEFAULT_CARDS,
  title = "Latest Blog",
  subtitle = "Stay ahead of the curve with fresh content on code, design, startups, and everything in between.",
}) {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}</style>

      <div
        className="flex flex-col items-center w-full"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Header */}
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-lg text-center">
          {subtitle}
        </p>

        {/* Cards grid */}
        <div className="mt-10 flex flex-wrap justify-center gap-8">
          {cards.map((card, i) => (
            <div
              key={i}
              className="max-w-72 w-full hover:-translate-y-0.5 transition duration-300"
            >
              <img
                className="rounded-xl w-full object-cover"
                src={card.image}
                alt={card.title}
              />
              <h3 className="text-base text-slate-900 font-medium mt-3">
                {card.title}
              </h3>
              <p className="text-xs text-indigo-600 font-medium mt-1">
                {card.category}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
