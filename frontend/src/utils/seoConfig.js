export const SEO_CONFIG = {

  // ===== HOMEPAGE =====
  home: {
    title: 'Atyant — AI-Powered Career Guidance for Engineering Students',
    description:
      'Atyant helps Tier-2 and Tier-3 engineering students get internships and placements. Get senior roadmaps, professor email templates, mentor guidance, and AI answers.',
    canonical: 'https://atyant.in/',
    ogImage: 'https://atyant.in/og-home.png',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Atyant',
      url: 'https://atyant.in',
      description:
        'AI-powered student guidance platform for engineering students seeking internships and placements.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://atyant.in/chat?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
      sameAs: [
        'https://www.instagram.com/atyant.in/',
        'https://in.linkedin.com/company/atyant',
        'https://www.facebook.com/atyant',
      ],
    },
  },

  // ===== INTERNSHIPS =====
  internships: {
    title: 'Research Internship at IIT & IIM — Professor Emails & Templates | Atyant',
    description:
      'Get direct professor email templates and research internship roadmap for IIT, IIM, NIT, and top colleges. Off-campus internship guide for engineering students.',
    canonical: 'https://atyant.in/internships',
    ogImage: 'https://atyant.in/og-internships.png',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How to email a professor for research internship at IIT?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Write a concise 150-word cold email with your background, specific research interest matching the professor work, and attach a 1-page resume. Atyant provides ready-to-use templates.',
          },
        },
        {
          '@type': 'Question',
          name: 'How to get research internship from Tier-2 college?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Target professors whose research matches your skills, email directly with a customized template, follow up once after 7 days, and apply to 20-30 professors in parallel.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the success rate of cold emailing professors for internships?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Generally 5-15% reply rate. Sending 30+ personalized emails increases chances significantly. Quality of email and resume match to professor research matters most.',
          },
        },
      ],
    },
  },

  // ===== CAREER GUIDES =====
  careerGuides: {
    title: 'Career Guides for Engineering Students — CSE, Analytics, Product, AI/ML | Atyant',
    description:
      'Step-by-step career roadmaps for Tier-2 and Tier-3 engineering students. Complete guides for CSE placements, off-campus internships, Data Analytics, Product Management, and AI/ML roles.',
    canonical: 'https://atyant.in/career-guides',
    ogImage: 'https://atyant.in/og-career-guides.png',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How to get off-campus internship for Tier-2 engineering students?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Build 1-2 strong projects, create ATS-friendly resume with GitHub and LinkedIn, apply on Internshala, Cuvette, Wellfound, and LinkedIn. Practice DSA regularly and show proof of work.',
          },
        },
        {
          '@type': 'Question',
          name: 'What skills are needed for Data Analytics internship in India?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'SQL, Python (Pandas, NumPy), Power BI or Tableau, statistics basics, and a portfolio of 3-4 data projects on GitHub or Tableau Public.',
          },
        },
        {
          '@type': 'Question',
          name: 'How to get into AI ML roles from Tier-3 college?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Learn Python and ML basics, build 2-4 real ML projects, participate in Kaggle competitions, and apply via LinkedIn, Internshala, and Wellfound with a strong GitHub profile.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the roadmap for CSE placement from non-IIT college?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Pick one language (C++/Java/Python), solve 200-400 DSA problems, build 2-3 full-stack projects, create resume with GitHub links, and apply through LinkedIn, Hirist, and Naukri.',
          },
        },
        {
          '@type': 'Question',
          name: 'How to become a Product Manager from engineering college?',
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              'Study strong products, write 2-3 product case studies, learn SQL basics and Figma, build a small product or feature, and apply for APM, Product Intern, and Product Analyst roles.',
          },
        },
      ],
    },
  },

  // ===== NEARBY MENTORS =====
  nearbyMentors: {
    title: 'Find Nearby Mentors for Placements & Internships | Atyant',
    description:
      'Connect with senior engineering students and graduates near you for placement guidance, resume reviews, mock interviews, and career advice. Find mentors on Atyant.',
    canonical: 'https://atyant.in/nearby-mentors',
    ogImage: 'https://atyant.in/og-mentors.png',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Nearby Mentors — Atyant',
      description:
        'Find senior engineering student mentors near you for placement, internship, and career guidance.',
      url: 'https://atyant.in/nearby-mentors',
      provider: {
        '@type': 'Organization',
        name: 'Atyant',
        url: 'https://atyant.in',
      },
    },
  },
};
