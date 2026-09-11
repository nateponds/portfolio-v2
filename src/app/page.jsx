import { SkyBackground } from '@/components/sky-background';
import { site } from '@/content/site';

export default function HeroSection() {
  return (
    <>
      <SkyBackground />
      <main id="content">
        <div className="intro">
          <p className="kicker">{site.kicker}</p>
          <h1>{site.heading}</h1>
          <p className="role">{site.role}</p>
          <p className="lede">{site.description}</p>
        </div>
      </main>
    </>
  );
}
