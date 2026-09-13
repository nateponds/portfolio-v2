import { site, technologies } from '@/content/site';

export function StackCarousel() {
  const items = [...technologies, ...technologies];
  return (
    <section className="stack-showcase" aria-labelledby="stack-title">
      <div className="stack-showcase-header">
        <p className="section-kicker">{site.stack.kicker}</p>
        <h3 id="stack-title">{site.stack.title}</h3>
      </div>
      <div className="stack-carousel" aria-label="Technology stack carousel">
        <div className="stack-track">
          {items.map((stack, index) => (
            <article className="stack-item" key={`${stack.name}-${index}`}>
              <img
                src={stack.icon}
                alt={`${stack.name} logo`}
                loading="lazy"
                className={stack.inverted ? 'stack-icon-inverted' : ''}
              />
              <span>{stack.name}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
