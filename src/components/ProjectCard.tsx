import type { Project } from "../data/projects";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const statusClass = project.status.toLowerCase().replace(/\s+/g, "-");

  return (
    <article className="project-card panel">
      <div className="card-topline">
        <span className={`status-pill status-pill--${statusClass}`}>
          {project.status}
        </span>
        <span className="signal-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <ul className="tech-stack" aria-label={`${project.name} technology stack`}>
        {project.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="card-links">
        {project.links.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </article>
  );
}
