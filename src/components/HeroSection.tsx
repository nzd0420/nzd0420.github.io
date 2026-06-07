import { useI18n } from "../i18n";
import { StartLights } from "./StartLights";

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="hero-section" id="top">
      <div className="hero-inner section-shell">
        <div className="hero-content">
          <StartLights />
          <p className="section-kicker">{t.hero.kicker}</p>
          <h1>LongNeckCAT</h1>
          <p className="hero-realname">{t.hero.realName}</p>
          <p className="hero-affiliation">{t.hero.affiliation}</p>
          <p className="hero-subtitle">{t.hero.subtitle}</p>
          <p className="hero-description">{t.hero.description}</p>
          <div className="hero-actions">
            <a className="control-button control-button--primary" href="#projects">
              {t.hero.viewProjects}
            </a>
            <a className="control-button" href="#playground">
              {t.hero.explorePlayground}
            </a>
          </div>
        </div>
        <div className="hero-snapshot" aria-label={t.hero.snapshotAria}>
          <span className="snapshot-label">{t.hero.snapshotLabel}</span>
          <strong>{t.hero.snapshotText}</strong>
          <div className="snapshot-meter" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
