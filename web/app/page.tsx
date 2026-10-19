import { Footer } from '@/components/Footer';
import { WaitlistForm } from '@/components/WaitlistForm';

import styles from './page.module.css';

const steps = [
  {
    title: 'Fotografieren',
    text: 'Brief der Pflegekasse, Rechnung vom Pflegedienst, Einladung vom Medizinischen Dienst: einfach abfotografieren oder als PDF hinzufügen.',
  },
  {
    title: 'Verstehen',
    text: 'Pflegepost erklärt dir in einfachen Worten, worum es geht, was zu tun ist und bis wann – jede Frist mit der Stelle im Original.',
  },
  {
    title: 'Gemeinsam erledigen',
    text: 'Aufgaben verteilen, mit einem Tipp übernehmen und rechtzeitig erinnert werden. Ohne dass eine Person alles allein trägt.',
  },
];

const promises = [
  ['Daten in Deutschland', 'Gespeichert auf Servern in Frankfurt, verschlüsselt bei Übertragung und Speicherung.'],
  ['Du entscheidest', 'Die KI macht Vorschläge. Verschickt wird nichts ohne dich.'],
  ['Nur eure Familie', 'Nur Menschen, die du einlädst, sehen den Fall.'],
  ['Ehrlich begrenzt', 'Keine Rechts- oder Medizinberatung. Bei Fragen verweisen wir an Pflegeberatung und Fachstellen.'],
];

export default function Home() {
  return (
    <>
      <header className={`container ${styles.nav}`}>
        <span className={styles.logo}>
          <span className={styles.logoMark} aria-hidden />
          Pflegepost
        </span>
        <a className={styles.navLink} href="#warteliste">
          Warteliste
        </a>
      </header>

      <main>
        <section className={`container ${styles.hero}`}>
          <div className={styles.heroText}>
            <p className="eyebrow">Für Familien, die sich um ihre Eltern kümmern</p>
            <h1 className={styles.title}>Die Post für deine Eltern – gemeinsam im Griff.</h1>
            <p className={`muted ${styles.lead}`}>
              Pflegepost erklärt Briefe von Pflegekasse, Ärzten und Ämtern in einfachen Worten, erinnert an Fristen
              und verteilt die Aufgaben fair in der Familie.
            </p>
            <div className={styles.ctaRow}>
              <a className="button" href="#warteliste">
                Auf die Warteliste
              </a>
              <span className={`muted ${styles.note}`}>Kostenlos · Start zuerst in Deutschland</span>
            </div>
          </div>
          <div className={styles.phone}>
            <picture>
              <source srcSet="/app-start-dark.webp" media="(prefers-color-scheme: dark)" />
              <img
                src="/app-start-light.webp"
                width={430}
                height={932}
                alt="Startbildschirm der Pflegepost-App: großer Button „Brief erfassen“ und darunter die nächsten Aufgaben mit Fristen"
              />
            </picture>
          </div>
        </section>

        <section className={`container ${styles.section}`} aria-labelledby="so-gehts">
          <p className="eyebrow">So einfach wie eine Sprachnachricht</p>
          <h2 id="so-gehts" className={styles.h2}>
            Öffnen, fotografieren, verstehen.
          </h2>
          <ol className={styles.steps}>
            {steps.map((s, i) => (
              <li key={s.title} className="card">
                <span className={styles.stepNumber} aria-hidden>
                  {i + 1}
                </span>
                <h3 className={styles.h3}>{s.title}</h3>
                <p className="muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={`container ${styles.section}`}>
          <blockquote className={styles.quote}>
            <p>
              Stell dir vor: Du wohnst 300 Kilometer entfernt, und trotzdem siehst du sofort, wenn ein wichtiger Brief
              kommt. Du weißt, was zu tun ist und bis wann – und deine Schwester muss nicht mehr alles allein machen.
            </p>
            <footer>Pflegepost entsteht gerade – gemeinsam mit Familien, die genau das erleben.</footer>
          </blockquote>
        </section>

        <section className={`container ${styles.section}`} aria-labelledby="vertrauen">
          <p className="eyebrow">Datenschutz als Grundsatz</p>
          <h2 id="vertrauen" className={styles.h2}>
            Es geht um Gesundheit und Familie. Entsprechend gehen wir damit um.
          </h2>
          <ul className={styles.promises}>
            {promises.map(([title, text]) => (
              <li key={title}>
                <span className={styles.check} aria-hidden>
                  ✓
                </span>
                <div>
                  <h3 className={styles.h3}>{title}</h3>
                  <p className="muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="warteliste" className={`container ${styles.section}`} aria-labelledby="warteliste-title">
          <div className={`card ${styles.waitlist}`}>
            <div className={styles.waitlistText}>
              <p className="eyebrow">Warteliste</p>
              <h2 id="warteliste-title" className={styles.h2}>
                Sei von Anfang an dabei.
              </h2>
              <p className="muted">
                Wir melden uns, sobald Pflegepost startet – und vorher vielleicht mit einer Frage, wie es dir mit der
                Post für deine Eltern geht. Versprochen: kein Spam.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
