import { notes } from "../data/notes";
import { useI18n } from "../i18n";

export function NotesSection() {
  const { language, t } = useI18n();

  return (
    <section className="content-section section-shell" id="notes">
      <div className="section-heading">
        <p className="section-kicker">{t.notes.kicker}</p>
        <h2>{t.notes.title}</h2>
      </div>
      <div className="notes-list">
        {notes.map((note) => {
          const date = note.date[language];
          const dateTime = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
          const rowContent = (
            <>
              <div>
                <span className="note-category">{note.category[language]}</span>
                <h3>{note.title[language]}</h3>
                <p>{note.summary[language]}</p>
              </div>
              <time dateTime={dateTime}>{date}</time>
            </>
          );

          return note.link ? (
            <a className="note-row panel" href={note.link} key={note.id}>
              {rowContent}
            </a>
          ) : (
            <article className="note-row panel" key={note.id}>
              {rowContent}
            </article>
          );
        })}
      </div>
    </section>
  );
}
