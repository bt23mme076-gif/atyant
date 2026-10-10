// Build step: writes dist/achievements.html — the built SPA shell with
// /achievements-specific head tags (title, description, canonical, Open Graph,
// ImageGallery JSON-LD) and the photos as real <img> tags inside #root, so
// crawlers see the page and its images without running JS. React replaces the
// #root content on load. vercel.json routes /achievements to this file.
//
// Without it every marketing route served index.html, whose canonical points
// at /company — telling Google /achievements is a duplicate of /company.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ALT, PAGE_URL, PAGE_SEO, GALLERY_LD } from '../src/data/achievementPhotos.js';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
let html = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Replace one tag; fail the build if the shell changed, rather than shipping
// the /company head on this page.
function swap(re, replacement) {
  if (!re.test(html)) throw new Error(`prerender-achievements: tag not found: ${re}`);
  html = html.replace(re, replacement);
}

const { title, description, ogImage, h1 } = PAGE_SEO;
swap(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
swap(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(description)}" />`);
swap(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${PAGE_URL}" id="canonical-tag" />`);
swap(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${PAGE_URL}" />`);
swap(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`);
swap(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(description)}" />`);
swap(/<meta property="og:image" [^>]*>/, `<meta property="og:image" content="${ogImage}" />`);
swap(/<meta property="og:image:alt"[^>]*>/, `<meta property="og:image:alt" content="${esc(ALT[ogImage.replace(/^https:\/\/atyant\.in/, '')])}" />`);
swap(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(title)}" />`);
swap(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(description)}" />`);
swap(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${ogImage}" />`);
swap(/<\/head>/, `  <script type="application/ld+json">${JSON.stringify(GALLERY_LD)}</script>\n</head>`);

const figures = Object.entries(ALT)
  .map(([src, alt]) => `<figure><img src="${src}" alt="${esc(alt)}" loading="lazy" width="320" /><figcaption>${esc(alt)}</figcaption></figure>`)
  .join('');
swap(/<div id="root"><\/div>/, `<div id="root"><main><h1>${esc(h1)}</h1><p>${esc(description)}</p>${figures}</main></div>`);

writeFileSync(join(dist, 'achievements.html'), html);
console.log(`prerender-achievements: wrote dist/achievements.html (${Object.keys(ALT).length} photos)`);
