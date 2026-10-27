
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, BookOpen, Send, RefreshCw } from 'lucide-react';
import { supabase } from './lib/supabase';

type GuestbookEntry = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

const MAX_NAME = 32;
const MAX_MESSAGE = 280;

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');

  const loadEntries = useCallback(async () => {
    if (!supabase) {
      setNotice('DATABASE CONFIG MISSING — CHECK .env.local');
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('guestbook_entries')
      .select('id, name, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      setNotice('COULD NOT LOAD ENTRIES — CHECK DATABASE POLICIES');
    } else {
      setEntries(data ?? []);
      setNotice('');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanMessage) {
      setNotice('ENTER A NAME AND MESSAGE FIRST.');
      return;
    }

    if (cleanName.length > MAX_NAME || cleanMessage.length > MAX_MESSAGE) {
      setNotice('YOUR ENTRY EXCEEDS THE ALLOWED LENGTH.');
      return;
    }

    if (!supabase) {
      setNotice('DATABASE NOT CONFIGURED.');
      return;
    }

    setSending(true);
    setNotice('');

    const { error } = await supabase
      .from('guestbook_entries')
      .insert({ name: cleanName, message: cleanMessage });

    setSending(false);

    if (error) {
      setNotice('TRANSMISSION FAILED. PLEASE TRY AGAIN.');
      return;
    }

    setName('');
    setMessage('');
    setNotice('MESSAGE TRANSMITTED SUCCESSFULLY.');
    await loadEntries();
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  return (
    <div className="guestbook-app">
      <div className="guestbook-heading">
        <div>
          <span className="mono tiny-label">PUBLIC MESSAGE ARCHIVE</span>
          <h2>Leave a signal.</h2>
          <p>
            You made it this far into the archive. Leave a thought,
            a hello, or a message for the next curious visitor.
          </p>
        </div>
        <div className="guestbook-emblem" aria-hidden="true">
          <BookOpen size={25} />
        </div>
      </div>

      <form className="guestbook-form" onSubmit={handleSubmit}>
        <label htmlFor="guestbook-name" className="mono">
          YOUR CALLSIGN
        </label>
        <input
          id="guestbook-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. curious_human"
          maxLength={MAX_NAME}
          autoComplete="nickname"
          required
        />

        <div className="guestbook-message-label">
          <label htmlFor="guestbook-message" className="mono">
            MESSAGE
          </label>
          <span className="mono">
            {message.length}/{MAX_MESSAGE}
          </span>
        </div>
        <textarea
          id="guestbook-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What brought you to N0VA?"
          maxLength={MAX_MESSAGE}
          rows={4}
          required
        />

        <div className="guestbook-form-bottom">
          <span className="mono">TRANSMISSION: PUBLIC</span>
          <button type="submit" disabled={sending || !supabase}>
            {sending ? 'SENDING...' : 'SIGN GUESTBOOK'}
            <Send size={14} />
          </button>
        </div>
      </form>

      {notice && (
        <p className="guestbook-notice" role="status">
          {notice}
        </p>
      )}

      <div className="guestbook-feed-heading">
        <div>
          <span className="mono tiny-label">INCOMING TRANSMISSIONS</span>
          <h3>Visitor log <span>({entries.length})</span></h3>
        </div>
        <button
          type="button"
          className="guestbook-refresh"
          onClick={() => void loadEntries()}
          disabled={loading}
          aria-label="Refresh guestbook"
        >
          <RefreshCw size={14} />
          REFRESH
        </button>
      </div>

      {loading ? (
        <div className="guestbook-empty">
          <RefreshCw size={18} className="guestbook-spin" />
          <p>CONNECTING TO THE ARCHIVE...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="guestbook-empty">
          <BookOpen size={22} />
          <p>NO ENTRIES FOUND. BE THE FIRST TO LEAVE A SIGNAL.</p>
        </div>
      ) : (
        <div className="guestbook-entries">
          {entries.map((entry, index) => (
            <article className="guestbook-entry" key={entry.id}>
              <div className="guestbook-entry-top">
                <span className="guestbook-entry-index mono">
                  ENTRY_{String(index + 1).padStart(3, '0')}
                </span>
                <time className="mono" dateTime={entry.created_at}>
                  {formatDate(entry.created_at)}
                </time>
              </div>
              <h4>{entry.name}</h4>
              <p>{entry.message}</p>
              <span className="guestbook-entry-mark">
                <ArrowUpRight size={13} />
                ARCHIVED
              </span>
            </article>
          ))}
        </div>
      )}

      <div className="guestbook-footer mono">
        <span>// 50 MOST RECENT ENTRIES</span>
        <span>END OF TRANSMISSION ✳</span>
      </div>
    </div>
  );
}
