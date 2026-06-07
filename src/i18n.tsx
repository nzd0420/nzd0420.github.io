import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type Language = "en" | "zh";
export type LocalizedText = Record<Language, string>;

export const translations = {
  en: {
    languageToggle: "ZH",
    languageLabel: "Switch language",
    homeAria: "LongNeckCAT home",
    navAria: "Primary navigation",
    nav: {
      about: "About",
      projects: "Projects",
      playground: "Playground",
      notes: "Notes",
      contact: "Contact"
    },
    hero: {
      kicker: "Portfolio / CS student",
      realName: "Zidong Ning",
      affiliation: "ShanghaiTech University · 2024 Undergraduate",
      subtitle: "Computer Science Student",
      description: "Projects, experiments, tools, and technical notes.",
      viewProjects: "View Projects",
      explorePlayground: "Explore Playground",
      snapshotAria: "Portfolio snapshot",
      snapshotLabel: "ShanghaiTech 2024",
      snapshotText: "Web tools, visual systems, and small technical experiments."
    },
    about: {
      kicker: "Profile",
      title: "About",
      imageAlt:
        "A realistic circuit concourse scene with people and modern architecture",
      highlightsAria: "Portfolio highlights",
      paragraphs: [
        "Hi, I am Zidong Ning, a computer science student who uses LongNeckCAT as a personal nickname online. I am a 2024 undergraduate student at ShanghaiTech University, interested in building useful software with clear interfaces and thoughtful engineering.",
        "I enjoy working across web development, data visualization, algorithms, and small tools that make learning or everyday work smoother. This site collects larger projects, quick experiments, technical notes, and links I want to keep easy to find."
      ],
      stats: [
        { value: "2024", label: "Undergraduate" },
        { value: "ShanghaiTech University", label: "University" },
        { value: "Static", label: "GitHub Pages ready" }
      ]
    },
    projects: {
      kicker: "Selected work",
      title: "Projects",
      stackAriaSuffix: "technology stack"
    },
    playground: {
      kicker: "Small builds",
      title: "Playground",
      imageAlt:
        "A realistic night circuit scene with light trails and reflections",
      featureLabel: "Playground"
    },
    notes: {
      kicker: "Learning log",
      title: "Notes"
    },
    contact: {
      kicker: "Links",
      title: "Contact",
      body:
        "Open to project conversations, internship opportunities, and technical collaboration.",
      labels: {
        github: "GitHub",
        email: "Email",
        wechat: "WeChat",
        qq: "QQ"
      }
    },
    footer: {
      built: "Built with React, Vite, and TypeScript."
    }
  },
  zh: {
    languageToggle: "EN",
    languageLabel: "切换语言",
    homeAria: "LongNeckCAT 主页",
    navAria: "主要导航",
    nav: {
      about: "关于",
      projects: "项目",
      playground: "实验场",
      notes: "笔记",
      contact: "联系"
    },
    hero: {
      kicker: "作品集 / 计算机科学学生",
      realName: "宁梓栋",
      affiliation: "上海科技大学 · 2024 本科生",
      subtitle: "计算机科学学生",
      description: "项目、实验、工具和技术笔记。",
      viewProjects: "查看项目",
      explorePlayground: "探索实验场",
      snapshotAria: "作品集概览",
      snapshotLabel: "上海科技大学 2024",
      snapshotText: "网页工具、视觉系统和小型技术实验。"
    },
    about: {
      kicker: "简介",
      title: "关于",
      imageAlt: "带有人群和现代建筑的写实赛道大厅场景",
      highlightsAria: "作品集亮点",
      paragraphs: [
        "你好，我是宁梓栋，一名计算机科学学生，在线上使用 LongNeckCAT 作为个人昵称。我是上海科技大学 2024 级本科生，兴趣是用清晰的界面和细致的工程实现构建实用软件。",
        "我喜欢在网页开发、数据可视化、算法以及能让学习或日常工作更顺畅的小工具之间探索。这个网站收集我想方便查找的大型项目、快速实验、技术笔记和链接。"
      ],
      stats: [
        { value: "2024", label: "本科生" },
        { value: "上海科技大学", label: "大学" },
        { value: "静态站点", label: "已可部署到 GitHub Pages" }
      ]
    },
    projects: {
      kicker: "精选作品",
      title: "项目",
      stackAriaSuffix: "技术栈"
    },
    playground: {
      kicker: "小型作品",
      title: "实验场",
      imageAlt: "带有光轨和反射的写实夜间赛道场景",
      featureLabel: "实验场"
    },
    notes: {
      kicker: "学习记录",
      title: "笔记"
    },
    contact: {
      kicker: "链接",
      title: "联系",
      body: "欢迎交流项目、实习机会和技术协作。",
      labels: {
        github: "GitHub",
        email: "邮箱",
        wechat: "微信",
        qq: "QQ"
      }
    },
    footer: {
      built: "使用 React、Vite 和 TypeScript 构建。"
    }
  }
} as const;

export type Translation = (typeof translations)[Language];

type LanguageContextValue = {
  language: Language;
  t: Translation;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      t: translations[language],
      toggleLanguage: () =>
        setLanguage((current) => (current === "en" ? "zh" : "en"))
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error("useI18n must be used inside LanguageProvider");
  }

  return value;
}
