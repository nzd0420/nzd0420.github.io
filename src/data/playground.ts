export type PlaygroundItem = {
  title: string;
  description: string;
  tags: string[];
  link: string;
  accent: "green" | "yellow" | "purple" | "cyan";
};

export const playgroundItems: PlaygroundItem[] = [
  {
    title: "Canvas Pathfinder",
    description:
      "A compact visual demo for exploring grid search, heuristics, and obstacle layouts.",
    tags: ["Canvas", "A*", "Interaction"],
    link: "#",
    accent: "cyan"
  },
  {
    title: "Tiny Shader Lab",
    description:
      "A browser playground for testing fragment shader ideas and animated procedural textures.",
    tags: ["WebGL", "GLSL", "Motion"],
    link: "#",
    accent: "purple"
  },
  {
    title: "API Latency Toy",
    description:
      "A small dashboard for simulating request timing, retries, caching, and error states.",
    tags: ["Fetch", "Charts", "UX"],
    link: "#",
    accent: "green"
  },
  {
    title: "Snippet Switchboard",
    description:
      "Reusable UI and TypeScript snippets organized as quick cards for future projects.",
    tags: ["TypeScript", "CSS", "Notes"],
    link: "#",
    accent: "yellow"
  }
];
