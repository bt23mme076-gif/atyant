import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords,
  image = 'https://atyant.in/assets/og-banner.png',
  url 
}) => {
  const siteTitle = 'Atyant';
  const fullTitle = title ? `${title} | ${siteTitle}` : 'Atyant – AI-Powered Student Guidance';
  const defaultDescription = 'AI matches you with seniors who\'ve already cracked it. Get human-verified roadmaps for internships, placements & career clarity.';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || 'https://atyant.in/'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url || 'https://atyant.in/'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical */}
      {url && <link rel="canonical" href={url} />}
    </Helmet>
  );
};

export default SEO;