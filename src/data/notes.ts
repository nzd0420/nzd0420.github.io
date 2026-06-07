export type Note = {
  title: string;
  summary: string;
  date: string;
  category: string;
  link: string;
};

export const notes: Note[] = [
  {
    title: "TypeScript Patterns I Reuse",
    summary:
      "A short collection of practical typing patterns for components, data models, and API responses.",
    date: "2026-05-14",
    category: "TypeScript",
    link: "#"
  },
  {
    title: "Building Static Sites for GitHub Pages",
    summary:
      "Notes on routing, relative assets, deployment scripts, and keeping static builds simple.",
    date: "2026-04-28",
    category: "Web",
    link: "#"
  },
  {
    title: "Graph Search Study Log",
    summary:
      "Comparing breadth-first search, Dijkstra, and A* with small examples and edge cases.",
    date: "2026-03-19",
    category: "Algorithms",
    link: "#"
  }
];
