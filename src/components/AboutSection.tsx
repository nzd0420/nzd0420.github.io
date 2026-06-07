export function AboutSection() {
  return (
    <section className="content-section section-shell" id="about">
      <div className="section-heading">
        <p className="section-kicker">Profile</p>
        <h2>About</h2>
      </div>
      <div className="about-grid">
        <article className="panel panel--wide">
          <p>
            Hi, I am Ning, a computer science student interested in building
            useful software with clear interfaces and thoughtful engineering. I
            enjoy working across web development, data visualization, algorithms,
            and small tools that make learning or everyday work smoother.
          </p>
          <p>
            This site collects larger projects, quick experiments, technical
            notes, and links I want to keep easy to find. The placeholder content
            is designed to be replaced as the portfolio grows.
          </p>
        </article>
        <aside className="panel stats-panel" aria-label="Portfolio highlights">
          <div>
            <span className="stat-value">04</span>
            <span className="stat-label">Project slots</span>
          </div>
          <div>
            <span className="stat-value">12</span>
            <span className="stat-label">Reusable notes</span>
          </div>
          <div>
            <span className="stat-value">100%</span>
            <span className="stat-label">Static build</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
