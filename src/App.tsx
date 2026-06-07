import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { NotesSection } from "./components/NotesSection";
import { PlaygroundSection } from "./components/PlaygroundSection";
import { ProjectsSection } from "./components/ProjectsSection";

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <PlaygroundSection />
        <NotesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
