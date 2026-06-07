import type { LocalizedText } from "../i18n";

export type ProjectStatus =
  | "completed"
  | "in-progress"
  | "experimental"
  | "archived"
  | "pending";

export type Project = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  stack: LocalizedText[];
  status: ProjectStatus;
  statusLabel: LocalizedText;
  links: {
    label: LocalizedText;
    href: string;
  }[];
};

export const projects: Project[] = [
  {
    id: "pending-project",
    name: { en: "To be added", zh: "待添加" },
    description: { en: "To be added", zh: "待添加" },
    stack: [{ en: "To be added", zh: "待添加" }],
    status: "pending",
    statusLabel: { en: "To be added", zh: "待添加" },
    links: []
  }
];
