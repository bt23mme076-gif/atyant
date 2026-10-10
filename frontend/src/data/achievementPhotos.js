// Achievements page photos — one source of truth for the page (AchievementsPage.jsx)
// and the build-time HTML (scripts/prerender-achievements.mjs). Plain JS, no JSX,
// so Node can import it. Descriptive file names + compressed JPGs so the photos
// can rank in Google Images; the old img-*.png originals stay in public/.

export const SITE = 'https://atyant.in';
export const PAGE_URL = `${SITE}/achievements`;
const IMG = '/achievements/';

export const A = {
  hultStage: IMG + 'atyant-hult-prize-2026-iit-bombay-stage.jpg',
  hultStage2:IMG + 'atyant-founder-hult-prize-india-nationals-2026.jpg',
  hultPitch: IMG + 'atyant-hult-prize-pitch-how-atyant-works.jpg',
  pitchWar:  IMG + 'atyant-pitch-wars-right-answer-right-person-right-time.jpg',
  pitchWar2: IMG + 'atyant-pitch-wars-ai-human-engine-presentation.jpg',
  pitchWar3: IMG + 'atyant-pitch-wars-cofounder-pitch.jpg',
  founders:  IMG + 'atyant-founders-vnit-nagpur.jpg',
  team:      IMG + 'atyant-team-student-community.jpg',
  discussion:IMG + 'atyant-student-career-guidance-session.jpg',
  vnitDir:   IMG + 'atyant-demo-vnit-nagpur-director.jpg',
  vnitEcell: IMG + 'atyant-vnit-ecell-pitch-market-opportunity.jpg',
  manit:     IMG + 'atyant-campus-visit-manit.jpg',
  pce:       IMG + 'atyant-campus-outreach-pce.jpg',
  ghrce:     IMG + 'atyant-recognition-ghrce.jpg',
  iim:       IMG + 'atyant-student-internship-iim-mumbai.jpg',
  success:   IMG + 'atyant-student-outcomes-iim-ahmedabad-iit-mandi.jpg',
  bny:       IMG + 'atyant-online-mentor-session.jpg',
};

// One accurate description per photo: alt text everywhere it appears, the
// ImageGallery structured data and the image sitemap.
export const ALT = {
  [A.hultStage]:  'Atyant founders on stage at the Hult Prize 2026 national finals at IIT Bombay',
  [A.hultStage2]: 'Atyant founder in the auditorium at Hult Prize India Nationals 2026, IIT Bombay',
  [A.hultPitch]:  'Atyant founders explaining how the Atyant career engine works to the Hult Prize panel at IIT Bombay',
  [A.pitchWar]:   'Atyant founders pitching on stage with the slide "Right answer. Right person. Right time."',
  [A.pitchWar2]:  'Atyant founder presenting the Atyant AI + human engine at Pitch Wars',
  [A.pitchWar3]:  'Atyant co-founder pitching how students learn from someone who faced the same problem',
  [A.founders]:   'The Atyant founders at VNIT Nagpur',
  [A.team]:       'The Atyant team and student community at a campus meet',
  [A.discussion]: 'Engineering students in a live Atyant career guidance session on campus',
  [A.vnitDir]:    'Atyant founders demonstrating the platform to the VNIT Nagpur director and faculty',
  [A.vnitEcell]:  "Atyant pitch on India's career guidance market at the VNIT Nagpur E-Cell",
  [A.manit]:      'Atyant campus visit meeting engineering students at MANIT',
  [A.pce]:        'Students sharing Atyant during campus outreach at PCE',
  [A.ghrce]:      'Atyant recognised for innovation and entrepreneurship at GHRCE',
  [A.iim]:        'Atyant student who found their path and landed an internship at IIM Mumbai',
  [A.success]:    'Atyant student outcomes: internships at IIM Ahmedabad and IIT Mandi',
  [A.bny]:        'Online Atyant mentor session with seniors guiding students',
};

export const PAGE_SEO = {
  title: "Atyant Achievements — Hult Prize 2026, Pitch Wars & Milestones",
  description: "Photos and milestones of Atyant, India's first Human + AI career execution platform: Hult Prize 2026 Top 20 at IIT Bombay, Pitch Wars champion, backed at VNIT Nagpur.",
  h1: 'Milestones that define Atyant',
  ogImage: SITE + A.hultStage,
};

export const GALLERY_LD = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'Atyant achievements and milestones',
  url: PAGE_URL,
  description: PAGE_SEO.description,
  publisher: { '@type': 'Organization', name: 'Atyant', url: SITE },
  image: Object.entries(ALT).map(([src, caption]) => ({
    '@type': 'ImageObject',
    contentUrl: SITE + src,
    caption,
    name: caption,
    creditText: 'Atyant',
    copyrightNotice: 'Atyant',
  })),
};
