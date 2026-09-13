import { site } from '@/content/site';
import { GitHubIcon, LinkedInIcon, MailIcon, PhoneIcon } from '@/components/icons';

export function Contact() {
  return (
    <footer id="contact" className="site-footer" aria-labelledby="contact-title">
      <div className="section-container contact-container">
        <div className="contact-heading">
          <p className="contact-kicker">{site.contact.kicker}</p>
          <h2 id="contact-title">
            {site.contact.titleLead} <span>{site.contact.titleAccent}</span>
            <br />
            {site.contact.titleSecondLead} <span>{site.contact.titleSecondAccent}</span>
          </h2>
          <p>{site.contact.description}</p>
        </div>
        <div className="contact-layout">
          <div className="contact-primary">
            <div className="contact-circle-mark" aria-hidden="true" />
            <span className="contact-label">{site.contact.availability}</span>
            <a className="contact-email" href={`mailto:${site.email}`}>
              <MailIcon />
              {site.email}
            </a>
            <p>{site.contact.emailNote}</p>
          </div>
          <div className="contact-methods" aria-label="Contact links">
            <a
              className="contact-method"
              href={site.githubProfile}
              target="_blank"
              rel="noreferrer"
            >
              <GitHubIcon />
              <span>
                <strong>GitHub</strong>
                <small>{site.contact.githubLabel}</small>
              </span>
            </a>
            <a
              className="contact-method contact-method-muted"
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              <LinkedInIcon />
              <span>
                <strong>LinkedIn</strong>
                <small>{site.contact.linkedinLabel}</small>
              </span>
            </a>
            <a className="contact-method" href={site.phoneHref}>
              <PhoneIcon />
              <span>
                <strong>Phone</strong>
                <small>{site.phone}</small>
              </span>
            </a>
          </div>
        </div>
        <div className="contact-bottom">
          <div className="contact-legal">
            <p>{site.footer.copyright}</p>
            <p>{site.footer.credit}</p>
          </div>
          <a className="contact-top-link" href="#hero">
            <span>Back to top</span>
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
