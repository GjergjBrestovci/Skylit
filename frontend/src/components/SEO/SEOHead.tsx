import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'SkyLit AI - AI-Powered Website Generator',
  description = 'Create professional websites instantly with AI. Generate responsive websites using React, Vue, Next.js, and more. No coding required.',
  keywords = ['AI website generator', 'website builder', 'AI web development', 'responsive design', 'React websites', 'Vue websites', 'Next.js generator'],
  image = '/og-image.jpg',
  url = 'https://skylit.ai',
  type = 'website',
  author = 'SkyLit AI',
  publishedTime,
  modifiedTime,
  noIndex = false
}) => {
  const fullTitle = title.includes('SkyLit') ? title : `${title} | SkyLit AI`;
  const canonicalUrl = url.startsWith('http') ? url : `https://skylit.ai${url}`;
  const imageUrl = image.startsWith('http') ? image : `https://skylit.ai${image}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SkyLit AI",
    "description": description,
    "url": canonicalUrl,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free AI website generation with premium options"
    },
    "creator": {
      "@type": "Organization",
      "name": "SkyLit AI",
      "url": "https://skylit.ai"
    },
    "featureList": [
      "AI-powered website generation",
      "Multi-framework support",
      "Responsive design",
      "Real-time preview",
      "Template library",
      "Code export"
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="SkyLit AI" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:creator" content="@skylitai" />
      <meta name="twitter:site" content="@skylitai" />
      
      {/* Article Meta Tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* Robots Meta */}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#0b0b0f" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Performance Hints */}
      <link rel="dns-prefetch" href="//api.skylit.ai" />
      <link rel="preload" as="font" type="font/woff2" href="/fonts/inter-var.woff2" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default SEOHead;
