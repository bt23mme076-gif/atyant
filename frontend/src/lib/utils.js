/**
 * cn — class name merger utility (replaces shadcn's clsx + tailwind-merge)
 * Works without installing clsx or tailwind-merge.
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}
