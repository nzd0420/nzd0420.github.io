export type ProjectStatus =
  | "Completed"
  | "In Progress"
  | "Experimental"
  | "Archived";

export type Project = {
  name: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
  links: {
    label: string;
    href: string;
  }[];
};

export const projects: Project[] = [
  {
    name: "Campus Resource Scheduler",
    description:
      "A planning tool for coordinating rooms, equipment, and study sessions across a busy academic week.",
    stack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    status: "In Progress",
    links: [
      { label: "Repository", href: "#" },
      { label: "Demo", href: "#" }
    ]
  },
  {
    name: "Study Graph",
    description:
      "A knowledge map that connects courses, notes, references, and practice problems into one searchable view.",
    stack: ["Next.js", "D3", "SQLite", "MDX"],
    status: "Completed",
    links: [
      { label: "Repository", href: "#" },
      { label: "Writeup", href: "#" }
    ]
  },
  {
    name: "Static Site Toolkit",
    description:
      "A small generator for publishing project pages, changelogs, and reading lists from structured data.",
    stack: ["Vite", "TypeScript", "Markdown", "GitHub Actions"],
    status: "Experimental",
    links: [
      { label: "Repository", href: "#" },
      { label: "Docs", href: "#" }
    ]
  },
  {
    name: "Algorithm Visual Notes",
    description:
      "Interactive sketches for sorting, graph traversal, dynamic programming, and complexity analysis.",
    stack: ["Canvas", "TypeScript", "CSS"],
    status: "Archived",
    links: [
      { label: "Repository", href: "#" },
      { label: "Archive", href: "#" }
    ]
  }
];
