import { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tec-app.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/privacy', '/terms'],
        disallow: ['/api/', '/dashboard', '/dashboard/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
