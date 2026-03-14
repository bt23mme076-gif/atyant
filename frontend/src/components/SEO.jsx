// src/components/SEO.jsx
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  canonical,
  ogImage,
  schema,
  keywords,
  noIndex = false,
}) => {
  const defaultImage = 'https://atyant.in/og-default.png';

  const defaultKeywords =
    'career guidance, student mentorship India, internship roadmap, placement guide, engineering students, atyant';

  return (
    <Helmet>
      {/* ===== BASIC META ===== */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <title>{title}</title>

      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content="Atyant" />
      <meta name="language" content="English" />

      {/* ===== ROBOTS ===== */}
      <meta
        name="robots"
        content={noIndex ? 'noindex, nofollow' : 'index, follow'}
      />
      <meta
        name="googlebot"
        content={noIndex ? 'noindex, nofollow' : 'index, follow'}
      />

      {/* ===== CANONICAL ===== */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* ===== FAVICON ===== */}
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* ===== BRANDING ===== */}
      <meta name="theme-color" content="#6C2BD9" />

      {/* ===== GEO LOCATION ===== */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Nagpur, Maharashtra, India" />

      {/* ===== GOOGLE VERIFICATION ===== */}
      {/* Replace with your actual code from Google Search Console */}
      <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />

      {/* ===== OPEN GRAPH (Facebook, LinkedIn, WhatsApp) ===== */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Atyant Career Guidance Platform" />
      <meta property="og:site_name" content="Atyant" />
      <meta property="og:locale" content="en_IN" />

      {/* ===== TWITTER CARD ===== */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
      <meta name="twitter:site" content="@atyant_in" />
      <meta name="twitter:creator" content="@atyant_in" />

      {/* ===== PERFORMANCE ===== */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preconnect"
        href="https://firebasestorage.googleapis.com"
      />

      {/* ===== STRUCTURED DATA (SCHEMA) ===== */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;