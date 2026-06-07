import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { NotesSection } from "./components/NotesSection";
import { PlaygroundSection } from "./components/PlaygroundSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { ScrollEffects } from "./components/ScrollEffects";
import { LanguageProvider } from "./i18n";
import heroImage from "./assets/track-hero.png";
import nightImage from "./assets/track-night.png";
import peopleImage from "./assets/track-people.png";

export default function App() {
  return (
    <LanguageProvider>
      <div className="app-shell">
        <ScrollEffects />
        <div className="site-backdrop" aria-hidden="true">
          <img
            className="site-backdrop__image site-backdrop__image--hero"
            src={heroImage}
            alt=""
          />
          <img
            className="site-backdrop__image site-backdrop__image--people"
            src={peopleImage}
            alt=""
          />
          <img
            className="site-backdrop__image site-backdrop__image--night"
            src={nightImage}
            alt=""
          />
          <span />
        </div>
        <Header />
        <main>
          <HeroSection />
          <div className="content-stage">
            <AboutSection />
            <ProjectsSection />
            <PlaygroundSection />
            <NotesSection />
            <ContactSection />
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
}
