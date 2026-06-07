import { useI18n } from "../i18n";

export function Header() {
  const { t, toggleLanguage } = useI18n();
  const navItems = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.projects, href: "#projects" },
    { label: t.nav.playground, href: "#playground" },
    { label: t.nav.notes, href: "#notes" },
    { label: t.nav.contact, href: "#contact" }
  ];

  return (
    <header className="site-header">
      <a className="brand-mark" href="#top" aria-label={t.homeAria}>
        <span className="brand-mark__signal" aria-hidden="true" />
        <span>LongNeckCAT</span>
      </a>
      <div className="site-header__actions">
        <nav className="site-nav" aria-label={t.navAria}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className="language-toggle"
          type="button"
          aria-label={t.languageLabel}
          onClick={toggleLanguage}
        >
          {t.languageToggle}
        </button>
      </div>
    </header>
  );
}
