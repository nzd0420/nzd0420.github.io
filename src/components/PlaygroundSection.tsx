import { playgroundItems } from "../data/playground";

export function PlaygroundSection() {
  return (
    <section className="content-section section-shell" id="playground">
      <div className="section-heading">
        <p className="section-kicker">Small builds</p>
        <h2>Playground</h2>
      </div>
      <div className="playground-grid">
        {playgroundItems.map((item) => (
          <a
            className={`playground-card panel playground-card--${item.accent}`}
            href={item.link}
            key={item.title}
          >
            <span className="playground-card__dot" aria-hidden="true" />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <ul className="inline-tags" aria-label={`${item.title} tags`}>
              {item.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </a>
        ))}
      </div>
    </section>
  );
}
