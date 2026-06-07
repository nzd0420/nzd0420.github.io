import { projects } from "../data/projects";
import { useI18n } from "../i18n";
import { ProjectCard } from "./ProjectCard";

export function ProjectsSection() {
  const { t } = useI18n();

  return (
    <section className="content-section section-shell" id="projects">
      <div className="section-heading">
        <p className="section-kicker">{t.projects.kicker}</p>
        <h2>{t.projects.title}</h2>
      </div>
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
