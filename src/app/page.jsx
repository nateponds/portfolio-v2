import { About } from '@/components/about';
import { Contact } from '@/components/contact';
import { Hero } from '@/components/hero';
import { Navigation } from '@/components/navigation';
import { Projects } from '@/components/projects';
import { SiteShell } from '@/components/site-shell';

export default function HomePage() {
  return (
    <SiteShell>
      <Navigation />
      <div id="content">
        <Hero />
        <main>
          <About />
          <Projects />
        </main>
        <Contact />
      </div>
    </SiteShell>
  );
}
