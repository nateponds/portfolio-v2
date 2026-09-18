import { site } from '@/content/site';
import './globals.css';

export const metadata = {
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  icons: {
    icon: '/assets/portfolio/logo.png',
    apple: '/assets/portfolio/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <noscript>
          <style>{`.boot-veil{display:none!important}html{overflow:auto!important}.hero-rise-inner,.hero-btn-rise,.site-nav{opacity:1!important;transform:none!important;animation:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
