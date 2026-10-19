'use client';

import { useId, useState, type FormEvent } from 'react';

import styles from './WaitlistForm.module.css';

type State = 'idle' | 'sending' | 'pending' | 'closed' | 'invalid' | 'error';

const messages: Partial<Record<State, { title: string; text: string }>> = {
  pending: {
    title: 'Fast geschafft!',
    text: 'Wir haben dir eine E-Mail geschickt. Bitte bestätige darin deine Adresse – erst dann stehst du auf der Liste.',
  },
  closed: {
    title: 'Die Warteliste öffnet in Kürze',
    text: 'Wir richten gerade alles ein. Schau bald wieder vorbei – wir freuen uns auf dich.',
  },
  error: {
    title: 'Das hat leider nicht geklappt',
    text: 'Bitte versuche es in ein paar Minuten noch einmal.',
  },
};

export function WaitlistForm() {
  const [state, setState] = useState<State>('idle');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const emailId = useId();
  const consentId = useId();
  const errorId = useId();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setState('sending');
    try {
      const res = await fetch('/api/warteliste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      });
      const body = (await res.json().catch(() => ({}))) as { status?: State };
      setState(body.status && body.status in messages ? body.status : res.status === 400 ? 'invalid' : 'error');
    } catch {
      setState('error');
    }
  }

  const message = messages[state];
  if (message && state !== 'error') {
    return (
      <div className={styles.result} role="status">
        <h3>{message.title}</h3>
        <p className="muted">{message.text}</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <label htmlFor={emailId} className={styles.label}>
        Deine E-Mail-Adresse
      </label>
      <input
        id={emailId}
        className={styles.input}
        type="email"
        autoComplete="email"
        placeholder="name@beispiel.de"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={state === 'invalid'}
        aria-describedby={state === 'invalid' ? errorId : undefined}
      />
      {state === 'invalid' ? (
        <p id={errorId} className={styles.error}>
          Bitte prüfe deine E-Mail-Adresse.
        </p>
      ) : null}
      <label htmlFor={consentId} className={styles.consent}>
        <input id={consentId} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          Ich möchte per E-Mail informiert werden, wenn Pflegepost startet. Abmelden geht jederzeit. Mehr in der{' '}
          <a href="/datenschutz">Datenschutzerklärung</a>.
        </span>
      </label>
      <button className="button" type="submit" disabled={!consent || state === 'sending'}>
        {state === 'sending' ? 'Einen Moment…' : 'Auf die Warteliste'}
      </button>
      {message ? (
        <p className={styles.error} role="alert">
          {message.title}. {message.text}
        </p>
      ) : null}
    </form>
  );
}
