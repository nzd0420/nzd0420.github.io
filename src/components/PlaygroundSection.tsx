import { playgroundItems } from "../data/playground";
import { useI18n } from "../i18n";
import nightImage from "../assets/track-night.png";

export function PlaygroundSection() {
  const { language, t } = useI18n();

  return (
    <section className="content-section section-shell" id="playground">
      <div className="section-heading">
        <p className="section-kicker">{t.playground.kicker}</p>
        <h2>{t.playground.title}</h2>
      </div>
      <figure className="playground-feature">
        <img src={nightImage} alt={t.playground.imageAlt} />
        <figcaption>
          <span>{t.playground.featureLabel}</span>
          <strong>{playgroundItems[0]?.title[language]}</strong>
        </figcaption>
      </figure>
      <div className="playground-grid">
        {playgroundItems.map((item) => {
          const title = item.title[language];
          const cardContent = (
            <>
              <span className="playground-card__dot" aria-hidden="true" />
              <h3>{title}</h3>
              <p>{item.description[language]}</p>
              <ul className="inline-tags" aria-label={`${title} tags`}>
                {item.tags.map((tag) => (
                  <li key={tag[language]}>{tag[language]}</li>
                ))}
              </ul>
            </>
          );
          const className = `playground-card panel playground-card--${item.accent}`;

          return item.link ? (
            <a className={className} href={item.link} key={item.id}>
              {cardContent}
            </a>
          ) : (
            <article className={className} key={item.id}>
              {cardContent}
            </article>
          );
        })}
      </div>
    </section>
  );
}
