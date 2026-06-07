import type { LocalizedText } from "../i18n";

export type PlaygroundItem = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  tags: LocalizedText[];
  link?: string;
  accent: "green" | "yellow" | "purple" | "cyan";
};

export const playgroundItems: PlaygroundItem[] = [
  {
    id: "pending-playground",
    title: { en: "To be added", zh: "待添加" },
    description: { en: "To be added", zh: "待添加" },
    tags: [{ en: "To be added", zh: "待添加" }],
    accent: "yellow"
  }
];
