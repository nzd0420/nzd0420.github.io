const navItems = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Playground", href: "#playground" },
  { label: "Notes", href: "#notes" },
  { label: "Contact", href: "#contact" }
];

export function Header() {
  return (
    <header className="site-header">
      <a className="brand-mark" href="#top" aria-label="Ning Z. home">
        <span className="brand-mark__signal" aria-hidden="true" />
        <span>Ning Z.</span>
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
