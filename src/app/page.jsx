import { SkyBackground } from '@/components/sky-background';
import { site } from '@/content/site';

export default function HomePage() {
  return (
    <>
      <SkyBackground />
      <main id="content">
        <h1>{site.heading}</h1>
      </main>
    </>
  );
}
