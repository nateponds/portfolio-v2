import { About } from '@/components/about';
import { Contact } from '@/components/contact';
import { Hero } from '@/components/hero';
import { Navigation } from '@/components/navigation';
import { Projects } from '@/components/projects';
import { SkyBackground } from '@/components/sky-background';

export default function HomePage() {
  return (
    <>
      <SkyBackground />
      <Navigation />
      <div id="content">
        <Hero />
        <main>
          <About />
          <Projects />
        </main>
        <Contact />
      </div>
    </>
  );
}
