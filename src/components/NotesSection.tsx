import { notes } from "../data/notes";

export function NotesSection() {
  return (
    <section className="content-section section-shell" id="notes">
      <div className="section-heading">
        <p className="section-kicker">Learning log</p>
        <h2>Notes</h2>
      </div>
      <div className="notes-list">
        {notes.map((note) => (
          <a className="note-row panel" href={note.link} key={note.title}>
            <div>
              <span className="note-category">{note.category}</span>
              <h3>{note.title}</h3>
              <p>{note.summary}</p>
            </div>
            <time dateTime={note.date}>{note.date}</time>
          </a>
        ))}
      </div>
    </section>
  );
}
