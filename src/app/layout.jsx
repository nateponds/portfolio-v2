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
      <body>{children}</body>
    </html>
  );
}
