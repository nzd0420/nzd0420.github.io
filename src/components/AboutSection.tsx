import { useI18n } from "../i18n";
import peopleImage from "../assets/track-people.png";

export function AboutSection() {
  const { t } = useI18n();

  return (
    <section className="content-section section-shell" id="about">
      <div className="section-heading">
        <p className="section-kicker">{t.about.kicker}</p>
        <h2>{t.about.title}</h2>
      </div>
      <div className="about-grid">
        <article className="panel panel--wide about-copy">
          {t.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
        <figure className="about-photo">
          <img src={peopleImage} alt={t.about.imageAlt} />
        </figure>
        <aside className="panel stats-panel" aria-label={t.about.highlightsAria}>
          {t.about.stats.map((stat) => (
            <div key={`${stat.value}-${stat.label}`}>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
