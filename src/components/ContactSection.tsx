const contactLinks = [
  { label: "GitHub", value: "github.com/your-username", href: "#" },
  { label: "Email", value: "your.email@example.com", href: "mailto:your.email@example.com" },
  { label: "LinkedIn", value: "linkedin.com/in/your-profile", href: "#" },
  { label: "Resume", value: "Download PDF", href: "#" }
];

export function ContactSection() {
  return (
    <section className="content-section section-shell" id="contact">
      <div className="section-heading">
        <p className="section-kicker">Links</p>
        <h2>Contact</h2>
      </div>
      <div className="contact-panel panel">
        <p>
          Open to project conversations, internship opportunities, and technical
          collaboration. Replace the placeholders below with current links.
        </p>
        <div className="contact-grid">
          {contactLinks.map((link) => (
            <a href={link.href} key={link.label}>
              <span>{link.label}</span>
              <strong>{link.value}</strong>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
