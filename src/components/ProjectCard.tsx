import type { Project } from "../data/projects";
import { useI18n } from "../i18n";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { language, t } = useI18n();
  const name = project.name[language];
  const status = project.statusLabel[language];

  return (
    <article className="project-card panel">
      <div className="card-topline">
        <span className={`status-pill status-pill--${project.status}`}>
          {status}
        </span>
        <span className="signal-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
      <h3>{name}</h3>
      <p>{project.description[language]}</p>
      <ul className="tech-stack" aria-label={`${name} ${t.projects.stackAriaSuffix}`}>
        {project.stack.map((item) => (
          <li key={item[language]}>{item[language]}</li>
        ))}
      </ul>
      {project.links.length > 0 ? (
        <div className="card-links">
          {project.links.map((link) => (
            <a key={link.label[language]} href={link.href}>
              {link.label[language]}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
