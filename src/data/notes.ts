import type { LocalizedText } from "../i18n";

export type Note = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  date: LocalizedText;
  category: LocalizedText;
  link?: string;
};

export const notes: Note[] = [
  {
    id: "pending-note",
    title: { en: "To be added", zh: "待添加" },
    summary: { en: "To be added", zh: "待添加" },
    date: { en: "To be added", zh: "待添加" },
    category: { en: "To be added", zh: "待添加" }
  }
];
