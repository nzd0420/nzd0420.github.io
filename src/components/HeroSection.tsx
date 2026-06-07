import { StartLights } from "./StartLights";

export function HeroSection() {
  return (
    <section className="hero-section section-shell" id="top">
      <div className="hero-visual" aria-hidden="true">
        <svg viewBox="0 0 520 340" role="img">
          <path
            className="track-line track-line--base"
            d="M70 238 C82 104 164 70 250 105 C334 140 276 220 352 244 C444 274 476 196 425 147 C384 108 329 66 385 38"
          />
          <path
            className="track-line track-line--red"
            d="M70 238 C82 104 164 70 250 105 C334 140 276 220 352 244 C444 274 476 196 425 147 C384 108 329 66 385 38"
          />
          <circle cx="70" cy="238" r="6" />
          <circle cx="385" cy="38" r="6" />
          <path className="scan-line" d="M38 300 H480" />
          <path className="scan-line scan-line--cyan" d="M116 28 H320" />
          <path className="scan-line scan-line--yellow" d="M266 314 H422" />
        </svg>
      </div>

      <div className="hero-content">
        <StartLights />
        <p className="section-kicker">Static portfolio</p>
        <h1>Ning Z.</h1>
        <p className="hero-subtitle">Computer Science Student</p>
        <p className="hero-description">
          Projects, experiments, tools, and technical notes.
        </p>
        <div className="hero-actions">
          <a className="control-button control-button--primary" href="#projects">
            View Projects
          </a>
          <a className="control-button" href="#playground">
            Explore Playground
          </a>
        </div>
      </div>
    </section>
  );
}
