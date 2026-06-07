import { projects } from "../data/projects";
import { ProjectCard } from "./ProjectCard";

export function ProjectsSection() {
  return (
    <section className="content-section section-shell" id="projects">
      <div className="section-heading">
        <p className="section-kicker">Selected work</p>
        <h2>Projects</h2>
      </div>
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </section>
  );
}
