import { useI18n } from "../i18n";
import { Footer } from "./Footer";

export function ContactSection() {
  const { t } = useI18n();
  const contactLinks = [
    {
      label: t.contact.labels.github,
      value: "github.com/nzd0420",
      href: "https://github.com/nzd0420"
    },
    {
      label: t.contact.labels.email,
      value: "ningzidong0420@gmail.com",
      href: "mailto:ningzidong0420@gmail.com"
    },
    { label: t.contact.labels.wechat, value: "17622825228" },
    { label: t.contact.labels.qq, value: "1757219320" }
  ];

  return (
    <section className="content-section section-shell" id="contact">
      <div className="section-heading">
        <p className="section-kicker">{t.contact.kicker}</p>
        <h2>{t.contact.title}</h2>
      </div>
      <div className="contact-panel panel">
        <p>{t.contact.body}</p>
        <div className="contact-grid">
          {contactLinks.map((link) =>
            link.href ? (
              <a
                className="contact-link"
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target={link.href.startsWith("http") ? "_blank" : undefined}
              >
                <span>{link.label}</span>
                <strong>{link.value}</strong>
              </a>
            ) : (
              <div className="contact-link" key={link.label}>
                <span>{link.label}</span>
                <strong>{link.value}</strong>
              </div>
            )
          )}
        </div>
      </div>
      <Footer />
    </section>
  );
}
