import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Github, Linkedin, Mail, Terminal, Sparkles, Command, ArrowRight, Music2, Film, Gamepad2, Heart, Disc3, ExternalLink, Monitor, X, Minus, Maximize2, FolderKanban, UserRound, Grip, Wifi, Radio, Headphones, LockKeyhole, ShieldCheck, ScanSearch, Database, Search } from 'lucide-react';
import emailjs from '@emailjs/browser';

const ALIAS = 'NOVA';
const caesar = (text: string, shift: number) => text.replace(/[A-Z]/g, (letter) => String.fromCharCode((letter.charCodeAt(0) - 65 + shift + 26) % 26 + 65));

function ArcadeApp() {
  type Point = { x: number; y: number };
  type Direction = 'up' | 'down' | 'left' | 'right';
  const GRID = 16;
  const initialSnake: Point[] = [{ x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }];
  const [game, setGame] = useState<'snake' | 'reaction'>('snake');
  const [snake, setSnake] = useState<Point[]>(initialSnake);
  const [food, setFood] = useState<Point>({ x: 11, y: 8 });
  const [direction, setDirection] = useState<Direction>('right');
  const directionRef = useRef<Direction>('right');
  const [snakeRunning, setSnakeRunning] = useState(false);
  const [snakeOver, setSnakeOver] = useState(false);
  const [snakeScore, setSnakeScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try { return Number(window.localStorage.getItem('nova-snake-best') || 0); } catch { return 0; }
  });
  const [reactionState, setReactionState] = useState<'idle' | 'wait' | 'ready' | 'done' | 'early'>('idle');
  const [reactionStart, setReactionStart] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [reactionRound, setReactionRound] = useState(0);
  const [reactionMessage, setReactionMessage] = useState('Start a round, then click when the panel turns lime.');
  const reactionTimer = useRef<number | null>(null);
  const directionMap: Record<string, Direction> = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  const opposite: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };

  useEffect(() => () => { if (reactionTimer.current !== null) window.clearTimeout(reactionTimer.current); }, []);
  useEffect(() => {
    if (game !== 'snake' || !snakeRunning || snakeOver) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'p') { event.preventDefault(); setSnakeRunning((running) => !running); return; }
      const next = directionMap[event.key];
      if (!next) return;
      event.preventDefault();
      if (next !== opposite[directionRef.current]) {
        directionRef.current = next;
        setDirection(next);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game, snakeRunning, snakeOver]);
  useEffect(() => {
    if (game !== 'snake' || !snakeRunning || snakeOver) return;
    const timer = window.setInterval(() => {
      setSnake((current) => {
        const head = current[0];
        const dir = directionRef.current;
        const nextHead: Point = { x: head.x + (dir === 'right' ? 1 : dir === 'left' ? -1 : 0), y: head.y + (dir === 'down' ? 1 : dir === 'up' ? -1 : 0) };
        const ate = nextHead.x === food.x && nextHead.y === food.y;
        const body = ate ? current : current.slice(0, -1);
        if (nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= GRID || nextHead.y >= GRID || body.some((part) => part.x === nextHead.x && part.y === nextHead.y)) {
          setSnakeRunning(false); setSnakeOver(true); return current;
        }
        const nextSnake = [nextHead, ...body];
        if (ate) {
          setSnakeScore((score) => {
            const updated = score + 10;
            setBestScore((best) => {
              const nextBest = Math.max(best, updated);
              try { window.localStorage.setItem('nova-snake-best', String(nextBest)); } catch { /* storage is optional */ }
              return nextBest;
            });
            return updated;
          });
          const empty: Point[] = [];
          for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) if (!nextSnake.some((part) => part.x === x && part.y === y)) empty.push({ x, y });
          if (empty.length) setFood(empty[Math.floor(Math.random() * empty.length)]);
        }
        return nextSnake;
      });
    }, Math.max(75, 155 - Math.floor(snakeScore / 50) * 8));
    return () => window.clearInterval(timer);
  }, [game, snakeRunning, snakeOver, food, snakeScore]);

  const resetSnake = (start = false) => {
    setSnake(initialSnake); setFood({ x: 11, y: 8 }); directionRef.current = 'right'; setDirection('right'); setSnakeScore(0); setSnakeOver(false); setSnakeRunning(start);
  };
  const startReaction = () => {
    setReactionTime(null); setReactionState('wait'); setReactionMessage('Wait for the signal...');
    if (reactionTimer.current !== null) window.clearTimeout(reactionTimer.current);
    const delay = 1000 + Math.floor(Math.random() * 2500);
    reactionTimer.current = window.setTimeout(() => { setReactionStart(performance.now()); setReactionState('ready'); setReactionMessage('CLICK NOW!'); }, delay);
    setReactionRound((n) => n + 1);
  };
  const hitReaction = () => {
    if (reactionState === 'wait') { if (reactionTimer.current !== null) window.clearTimeout(reactionTimer.current); setReactionState('early'); setReactionMessage('Too soon! False start. Try again.'); return; }
    if (reactionState === 'ready') { const elapsed = Math.round(performance.now() - reactionStart); setReactionTime(elapsed); setReactionState('done'); setReactionMessage(`Signal caught in ${elapsed} ms.`); }
  };
  const changeDirection = (next: Direction) => {
    if (next !== opposite[directionRef.current]) { directionRef.current = next; setDirection(next); }
  };

  return <div className="arcade-app">
    <span className="desktop-kicker">RECREATION MODULE / ARCADE_01</span>
    <h2>Take a break.</h2>
    <p>Two tiny games. No downloads, no accounts — just you versus the system.</p>
    <div className="arcade-tabs" role="tablist" aria-label="Arcade games">
      <button className={game === 'snake' ? 'is-selected' : ''} onClick={() => { setGame('snake'); setSnakeRunning(false); }} role="tab" aria-selected={game === 'snake'}>SNAKE.exe</button>
      <button className={game === 'reaction' ? 'is-selected' : ''} onClick={() => { setGame('reaction'); setSnakeRunning(false); }} role="tab" aria-selected={game === 'reaction'}>REACTION TEST</button>
    </div>
    {game === 'snake' ? <div className="arcade-game-panel">
      <div className="arcade-game-heading"><div><span className="mono tiny-label">SINGLE PLAYER / SURVIVAL MODE</span><h3>{snakeOver ? 'SYSTEM FAILURE — GAME OVER' : snakeRunning ? 'Collect the data packets.' : 'Ready when you are.'}</h3></div><div className="snake-scores mono"><span>SCORE <b>{snakeScore}</b></span><span>BEST <b>{bestScore}</b></span></div></div>
      <div className="snake-board" role="img" aria-label={`Snake game board. Score ${snakeScore}. Use arrow keys or WASD to move.`}>
        {Array.from({ length: GRID * GRID }, (_, index) => {
          const point = { x: index % GRID, y: Math.floor(index / GRID) };
          const isHead = snake[0]?.x === point.x && snake[0]?.y === point.y;
          const isBody = snake.slice(1).some((part) => part.x === point.x && part.y === point.y);
          const isFood = food.x === point.x && food.y === point.y;
          return <span key={index} className={`snake-cell${isHead ? ' snake-head' : isBody ? ' snake-body' : isFood ? ' snake-food' : ''}`}>{isHead ? '◆' : isFood ? '✦' : ''}</span>;
        })}
        {!snakeRunning && <div className="snake-overlay"><strong>{snakeOver ? 'GAME OVER' : 'N0VA SNAKE'}</strong><span>{snakeOver ? `Final score: ${snakeScore}` : 'Eat the data. Avoid the walls and yourself.'}</span><button className="arcade-reset" onClick={() => resetSnake(true)}>{snakeOver ? 'PLAY AGAIN' : 'START GAME'}</button></div>}
      </div>
      <div className="snake-controls" aria-label="Touch controls">
        <button onClick={() => changeDirection('up')} aria-label="Move up">↑</button><div><button onClick={() => changeDirection('left')} aria-label="Move left">←</button><button onClick={() => changeDirection('down')} aria-label="Move down">↓</button><button onClick={() => changeDirection('right')} aria-label="Move right">→</button></div>
      </div>
      <div className="snake-actions"><span className="arcade-footnote">MOVE: ARROWS / WASD · P: PAUSE · EAT ✦ TO SCORE</span><button className="arcade-reset" onClick={() => resetSnake(false)}>RESET</button><button className="arcade-reset" onClick={() => setSnakeRunning((running) => !running)} disabled={snakeOver}>{snakeRunning ? 'PAUSE' : 'RESUME'}</button></div>
    </div> : <div className="arcade-game-panel">
      <div className="arcade-game-heading"><div><span className="mono tiny-label">TEST YOUR REFLEXES</span><h3>{reactionTime === null ? 'How fast are you?' : `${reactionTime} ms`}</h3></div><span className="reaction-round mono">ROUND {String(reactionRound).padStart(2,'0')}</span></div>
      <button className={`reaction-pad reaction-${reactionState}`} onClick={reactionState === 'idle' || reactionState === 'done' || reactionState === 'early' ? startReaction : hitReaction}>{reactionState === 'ready' ? 'CLICK!' : reactionState === 'wait' ? 'WAIT FOR GREEN' : reactionState === 'early' ? 'TRY AGAIN' : reactionState === 'done' ? 'PLAY AGAIN' : 'START TEST'}</button>
      <p className="arcade-footnote" aria-live="polite">{reactionMessage}</p>
    </div>}
    <div className="arcade-status mono"><span><i/> LOCAL SESSION</span><span>NO SCORE UPLOAD</span></div>
  </div>;
}


// Configure these personal details. Lanyard provides CURRENT Discord presence, not Spotify listening history.
// Configure these personal details. Lanyard provides CURRENT Discord presence, not Spotify listening history.
const DISCORD_USER_ID = '932917645563551744';
// Optional fallback shown when Discord doesn't detect a game. Leave blank to show only live Discord activity.
const MANUAL_GAME = { title: 'Cyberpunk 2077', details: 'Favs', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsUmO8JvO-xxcnknZUhGCGgT0ri4SC0DJecfMHpdLauuLsIoYIHD0nzyGe&s=10' };
// Paste direct image URLs here for the Off-duty favorites cards. These are editable starter images.
const FAVORITE_MEDIA = {
  currentGame: { title: 'Gaming', details: 'Witcher 3: The Wild Hunt', imageUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202211/0711/kh4MUIuMmHlktOHar3lVl6rY.png' },
  music: { title: 'Music', detail: 'Goodbye', imageUrl: 'https://c.saavncdn.com/463/Goodbye-Theme-from-Dark-A-Netflix-Original-Series--English-2018-20180213191518-500x500.jpg' },
  movie: { title: 'Movies & shows', detail: 'Dune : Part Two', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original' },
  game: { title: 'Games', detail: 'Cyberpunk 2077', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsUmO8JvO-xxcnknZUhGCGgT0ri4SC0DJecfMHpdLauuLsIoYIHD0nzyGe&s=10' },
};
// Spotify activity is supplied automatically by Discord/Lanyard when visible.

type PresenceData = {
  discord_status?: string;
  activities?: Array<{ name: string; type: number; details?: string; state?: string; application_id?: string; assets?: { large_image?: string; large_text?: string; small_image?: string; small_text?: string } }>;
  listening_to_spotify?: boolean;
  spotify?: { track_id: string; song: string; artist: string; album: string; album_art_url: string; timestamps?: { start: number; end: number } } | null;
};

function LiveStatusApp() {
  const [presence, setPresence] = useState<PresenceData | null>(null);
  const [connection, setConnection] = useState<'setup' | 'loading' | 'live' | 'offline' | 'error'>('setup');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [cardOrder, setCardOrder] = useState<'music-first' | 'game-first'>(() => {
    try { return (window.localStorage.getItem('nova-live-card-order') as 'music-first' | 'game-first') || 'music-first'; } catch { return 'music-first'; }
  });
  useEffect(() => {
    if (!DISCORD_USER_ID) return;
    let alive = true;
    const refresh = async () => {
      try {
        setConnection((current) => current === 'live' ? current : 'loading');
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        if (!response.ok) throw new Error('Presence request failed');
        const payload = await response.json();
        if (!alive) return;
        if (!payload.success || !payload.data) { setConnection('offline'); return; }
        setPresence(payload.data as PresenceData);
        setConnection('live');
        setUpdatedAt(new Date());
      } catch { if (alive) setConnection('error'); }
    };
    void refresh();
    const timer = window.setInterval(refresh, 30000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);
  const spotify = presence?.spotify;
  const detectedGame = presence?.activities?.find((activity) => activity.type === 0 && activity.name !== 'Spotify');
  const manualGame = MANUAL_GAME.title.trim() ? MANUAL_GAME : null;
  const game = detectedGame || (manualGame ? { name: manualGame.title, details: manualGame.details, state: '' } : null);
  const status = presence?.discord_status ?? 'offline';
  const moveCards = () => {
    const next = cardOrder === 'music-first' ? 'game-first' : 'music-first';
    setCardOrder(next);
    try { window.localStorage.setItem('nova-live-card-order', next); } catch { /* local storage is optional */ }
  };
  const musicCard = <article className="live-status-card live-music-card" key="music">
    <div className="live-card-top">
      <span><Headphones size={16}/> SPOTIFY / LISTENING</span>
      <span className="mono">{spotify ? 'NOW PLAYING' : 'DISCORD LINK'}</span>
    </div>
    {spotify ? <>
      <div className="live-media-row">
        <img className="now-playing-art-image" src={spotify.album_art_url} alt={`${spotify.album} album art`} loading="lazy" />
        <div className="live-media-copy">
          <h3>{spotify.song}</h3>
          <p>{spotify.artist}</p>
          <small>{spotify.album}</small>
          <span className="spotify-live-badge"><i /> DETECTED VIA DISCORD</span>
        </div>
      </div>
      <div className="spotify-card-actions">
        <a className="spotify-play-button" href={`https://open.spotify.com/track/${spotify.track_id}`} target="_blank" rel="noreferrer">
          <ExternalLink size={14}/> PLAY ON SPOTIFY
        </a>
        <a className="spotify-profile-button" href="https://open.spotify.com/" target="_blank" rel="noreferrer">
          <UserRound size={14}/> SPOTIFY
        </a>
      </div>
    </> : <div className="live-empty-state">
      <Music2 size={26}/>
      <h3>{connection === 'setup' ? 'Your soundtrack goes here.' : 'Nothing playing right now.'}</h3>
      <p>{connection === 'setup' ? 'Connect Discord presence to show your current Spotify track automatically.' : 'When Spotify activity is visible on Discord, your track and album artwork will appear here automatically.'}</p>
    </div>}
  </article>;
  const gameCard = <article className="live-status-card live-game-card" key="game"><div className="live-card-top"><span><Gamepad2 size={16}/> GAMING STATUS</span><span className="mono">{detectedGame ? 'DISCORD LIVE' : manualGame ? 'MANUAL' : 'DISCORD'}</span></div>
    {game ? <div className="live-game-copy">{manualGame && !detectedGame && manualGame.imageUrl ? <img className="live-game-art" src={manualGame.imageUrl} alt={`${game.name} artwork`} loading="lazy"/> : <span className="live-game-icon"><Gamepad2 size={25}/></span>}<div><h3>{game.name}</h3><p>{game.details || game.state || (detectedGame ? 'Currently playing' : 'Manually added game')}</p>{game.state && game.details && <small>{game.state}</small>}</div></div> : <div className="live-empty-state"><Radio size={26}/><h3>{connection === 'setup' ? 'What are you playing?' : 'No game detected.'}</h3><p>{connection === 'setup' ? 'Configure Discord presence or add a manual game in src/App.tsx.' : 'Launch a game with Discord activity enabled, or add a manual game in src/App.tsx.'}</p></div>}
    <div className="discord-presence-line"><span className={`discord-status-dot status-${status}`}/><span>DISCORD: {status.toUpperCase()}</span><span className="mono">{connection === 'live' ? 'SYNCING · 30S' : 'AWAITING SIGNAL'}</span></div>
  </article>;
  return <div className="live-status-app">
    <div className="live-status-heading"><div><span className="desktop-kicker">PRESENCE MODULE / LIVE_01</span><h2>Signal detected.</h2><p>Music in the headphones. One more game. Here's what I'm up to right now.</p></div><span className={`presence-badge presence-${connection}`}><i/>{connection === 'setup' ? 'SETUP REQUIRED' : connection === 'loading' ? 'CONNECTING' : connection === 'live' ? 'LIVE SIGNAL' : connection === 'offline' ? 'NO SIGNAL' : 'RETRY LATER'}</span></div>
    <div className="live-order-controls"><span className="mono">CARD ORDER: {cardOrder === 'music-first' ? 'MUSIC → GAME' : 'GAME → MUSIC'}</span><button onClick={moveCards}><Grip size={13}/> MOVE SECTION ORDER <ArrowUpRight size={12}/></button></div>
    <div className={`live-status-grid ${cardOrder}`}>{cardOrder === 'music-first' ? <>{musicCard}{gameCard}</> : <>{gameCard}{musicCard}</>}</div>
    <div className="live-status-footer"><span className="mono">{connection === 'setup' ? 'CONFIG: src/App.tsx → DISCORD_USER_ID' : updatedAt ? `LAST SYNC: ${updatedAt.toLocaleTimeString()}` : 'PRESENCE IS OPTIONAL'}</span><button onClick={() => window.open('https://discord.com/app', '_blank', 'noopener,noreferrer')}><Wifi size={13}/> DISCORD <ArrowUpRight size={13}/></button></div>
  </div>;
}


function ClassifiedApp() {
  const [answer, setAnswer] = useState('');
  const [unlocked, setUnlocked] = useState(() => {
    try { return window.localStorage.getItem('nova-classified-unlocked') === 'yes'; } catch { return false; }
  });
  const [message, setMessage] = useState('Three signals point to one idea. Enter the passphrase to decrypt the archive.');
  const [showHints, setShowHints] = useState(false);
  const normalized = answer.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const submitAnswer = (event: React.FormEvent) => {
    event.preventDefault();
    if (normalized === 'CURIOSITY') {
      setUnlocked(true);
      setMessage('IDENTITY VERIFIED. CLASSIFIED ARCHIVE UNLOCKED.');
      try { window.localStorage.setItem('nova-classified-unlocked', 'yes'); } catch { /* storage is optional */ }
    } else {
      setMessage('ACCESS DENIED. Revisit the clues and try again.');
    }
  };
  const resetArchive = () => {
    setUnlocked(false); setAnswer(''); setMessage('Archive reset. Follow the clues to decrypt it again.');
    try { window.localStorage.removeItem('nova-classified-unlocked'); } catch { /* storage is optional */ }
  };
  return <div className="classified-app">
    <div className="classified-header"><div className="classified-emblem"><LockKeyhole size={23}/></div><div><span className="desktop-kicker">RESTRICTED ACCESS / FILE 000</span><h2>Classified.exe</h2><p>A small puzzle for the curious. Nothing here is actually private—just a hidden corner of the portfolio.</p></div></div>
    <div className="classified-signal"><span className="classified-pulse"/><span className="mono">SIGNAL DETECTED</span><span className="mono">3 FRAGMENTS</span></div>
    <div className="classified-clues">
      <article><span className="classified-clue-num">FRAGMENT_01</span><ScanSearch size={17}/><b>The beginning</b><p>Find the page where a name is shifted through the alphabet.</p></article>
      <article><span className="classified-clue-num">FRAGMENT_02</span><Terminal size={17}/><b>The voice</b><p>The terminal says the exploit isn't a vulnerability. It's a mindset.</p></article>
      <article><span className="classified-clue-num">FRAGMENT_03</span><ShieldCheck size={17}/><b>The key</b><p>What keeps a builder exploring, experimenting, and asking why?</p></article>
    </div>
    {!unlocked ? <form className="classified-form" onSubmit={submitAnswer}><label className="mono" htmlFor="classified-answer">PASSPHRASE</label><div><input id="classified-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="ENTER DECRYPTION KEY" autoComplete="off"/><button type="submit">DECRYPT <LockKeyhole size={13}/></button></div><p className={`classified-message ${message.startsWith('ACCESS DENIED') ? 'is-error' : ''}`} aria-live="polite">{message}</p><button type="button" className="classified-hint-button" onClick={() => setShowHints((value) => !value)}>{showHints ? 'HIDE HINTS −' : 'NEED A HINT? +'}</button>{showHints && <div className="classified-hints"><p>Hint 1: It's the phrase used throughout this website.</p><p>Hint 2: It starts with C and has nine letters.</p></div>}</form> : <div className="classified-unlocked"><ShieldCheck size={28}/><span className="mono">ACCESS GRANTED / ACHIEVEMENT UNLOCKED</span><h3>Curiosity is the exploit.</h3><p>You found the key. Keep building, keep breaking, keep asking better questions.</p><div className="classified-badge">✦ ARCHIVE EXPLORER</div><button type="button" className="classified-hint-button" onClick={resetArchive}>RESET PUZZLE</button></div>}
    <div className="classified-foot mono">LOCAL PUZZLE · PROGRESS SAVED ON THIS DEVICE</div>
  </div>;
}

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus('');

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('Email configuration is missing.');
      }

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: name.trim(),
          reply_to: email.trim() || 'Not provided',
          message: message.trim(),
        },
        { publicKey }
      );

      setStatus('MESSAGE TRANSMITTED SUCCESSFULLY.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('N0VA contact form error:', error);
      setStatus('TRANSMISSION FAILED. PLEASE TRY AGAIN.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="nova-contact-form" onSubmit={handleSubmit}>
      <label htmlFor="nova-name">YOUR NAME</label>
      <input
        id="nova-name"
        name="from_name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        autoComplete="name"
        required
        placeholder="Your callsign"
      />

      <label htmlFor="nova-email">YOUR EMAIL (OPTIONAL)</label>
      <input
        id="nova-email"
        name="reply_to"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        maxLength={254}
        autoComplete="email"
        placeholder="you@example.com"
      />

      <label htmlFor="nova-message">MESSAGE</label>
      <textarea
        id="nova-message"
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={2000}
        rows={5}
        required
        placeholder="Tell me what you're thinking..."
      />

      <button type="submit" disabled={sending}>
        <Mail size={17} />
        {sending ? 'TRANSMITTING...' : 'SEND MESSAGE'}
        <ArrowUpRight size={15} />
      </button>

      {status && (
        <p className="nova-contact-status" role="status">
          {status}
        </p>
      )}
    </form>
  );
}

function App() {
  const [shift, setShift] = useState(7);
  const [revealed, setRevealed] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('VOID OS terminal ready. Type “help” to see available commands.');
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [desktopWindows, setDesktopWindows] = useState<Array<{ id: string; title: string; minimized: boolean; maximized: boolean; x: number; y: number; z: number }>>([]);
  const [activeWindow, setActiveWindow] = useState('');
  const [windowZ, setWindowZ] = useState(10);
  const [dragging, setDragging] = useState<{ id: string; pointerX: number; pointerY: number; x: number; y: number } | null>(null);

  const openApp = (id: string, title: string) => {
    setDesktopOpen(true);
    setDesktopWindows((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) return current.map((item) => item.id === id ? { ...item, minimized: false, z: windowZ + 1 } : item);
      return [...current, { id, title, minimized: false, maximized: false, x: 80 + current.length * 28, y: 72 + current.length * 24, z: windowZ + 1 }];
    });
    setWindowZ((z) => z + 1); setActiveWindow(id);
  };
  const updateWindow = (id: string, changes: Partial<{ minimized: boolean; maximized: boolean; x: number; y: number; z: number }>) => setDesktopWindows((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  const closeWindow = (id: string) => { setDesktopWindows((current) => current.filter((item) => item.id !== id)); if (activeWindow === id) setActiveWindow(''); };
  const focusWindow = (id: string) => { setWindowZ((z) => z + 1); setActiveWindow(id); setDesktopWindows((current) => current.map((item) => item.id === id ? { ...item, z: windowZ + 1 } : item)); };
  const openTerminal = () => { setDesktopOpen(false); setTerminalOpen(true); };
  const desktopAppContent = (id: string) => {
    if (id === 'about') return <><span className="desktop-kicker">USER PROFILE / YUVRAJ</span><h2>Curiosity is the exploit.</h2><p>Second-year Computer Science student interested in full-stack development, cybersecurity, OSINT, reverse engineering, and competitive programming. I learn by investigating systems and building projects.</p><div className="desktop-tags"><span>JAVA</span><span>PYTHON</span><span>SQL</span><span>WEB DEVELOPMENT</span><span>CTF / bi0sblr</span></div></>;
    if (id === 'projects') return <><span className="desktop-kicker">ARCHIVE / SELECTED WORK</span><h2>Projects.exe</h2><p>Current builds, with status kept honest.</p><div className="desktop-mini-card"><Database size={18}/><div><b>InvestWise</b><small>Portfolio management system · In progress</small></div><span className="desktop-project-state">BUILDING</span></div><div className="desktop-mini-card"><Search size={18}/><div><b>Detective Mystery Game</b><small>Python GUI mystery game · Working prototype</small></div><span className="desktop-project-state">PROTOTYPE</span></div><button className="desktop-primary" onClick={() => { setDesktopOpen(false); scrollTo('projects'); }}>VIEW PROJECT DETAILS <ArrowRight size={14}/></button></>;
    if (id === 'favorites') return <><span className="desktop-kicker">PERSONAL ARCHIVE / OFF-DUTY</span><h2>Beyond the code.</h2><p>Music on repeat, stories worth rewatching, and games that steal one more hour.</p><div className="desktop-tags"><span>♫ MUSIC</span><span>FILM</span><span>GAMES</span><span>NOW PLAYING</span></div><button className="desktop-primary" onClick={() => { setDesktopOpen(false); scrollTo('favorites'); }}>VIEW FAVORITES <ArrowRight size={14}/></button></>;
    if (id === 'arcade') return <ArcadeApp />;
    if (id === 'status') return <LiveStatusApp />;
    if (id === 'classified') return <ClassifiedApp />;
    if (id === 'lab') return <><span className="desktop-kicker">EXPERIMENTS / UNSTABLE BY DESIGN</span><h2>The Lab</h2><p>A space for tiny tools, puzzles, and ideas that deserve to be tried instead of just talked about.</p><div className="desktop-lab-status"><span className="status-dot"/> SYSTEM READY <span>MORE EXPERIMENTS SOON</span></div></>;
    return <><span className="desktop-kicker">SYSTEM CONSOLE</span><h2>VOID Terminal</h2><p>Launch the command terminal to explore the archive.</p><button className="desktop-primary" onClick={openTerminal}><Terminal size={14}/> LAUNCH TERMINAL</button></>;
  };
  const reduceMotion = useReducedMotion();
  const headline = useMemo(() => caesar(ALIAS, shift), [shift]);
  const isSolved = shift === 0;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setTerminalOpen(true);
      }
      if (event.key === 'Escape') { setTerminalOpen(false); setDesktopOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const runCommand = (event: React.FormEvent) => {
    event.preventDefault();
    const value = command.trim().toLowerCase();
    const commands: Record<string, string> = {
      help: 'Available: help · whoami · about · projects · favorites · status · arcade · classified · scan · skills · contact · clear',
      whoami: 'Yuvraj — second-year CSE student, CTF player at bi0sblr, and creative developer.',
      about: 'Interested in full-stack development, cybersecurity, OSINT, reverse engineering, and competitive programming. I learn by investigating systems and building projects.',
      projects: 'InvestWise — portfolio management system (in progress). Detective Mystery Game — Python GUI mystery game (working prototype). More details in the Selected Work section.',
      favorites: 'Off-duty archive: music, movies, games, and currently playing. Scroll to the Off-duty section.',
      status: 'Live music and gaming presence. Open VOID OS and launch Live Status.',
      arcade: 'N0VA Arcade is inside VOID OS. Close this terminal, launch OS, then open Arcade from the desktop or dock.',
      classified: 'Classified.exe is inside VOID OS. Open the desktop and launch Classified to solve the archive puzzle.',
      scan: 'HIDDEN SIGNAL DETECTED. Three fragments point to one passphrase. Open Classified.exe to investigate.',
      skills: 'Java · Python · SQL · Web development · Reverse engineering · CTFs · OSINT · Competitive programming',
      contact: 'Use the contact form below, or visit GitHub: github.com/yuvrajj0202-cyber and LinkedIn: linkedin.com/in/yuvraj-j-365a44389.',
      clear: '',
    };
    setTerminalOutput(commands[value] ?? `Command not found: ${value || '(empty)'}. Type “help” for the list.`);
    setCommand('');
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });

  return <main>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar wrap">
      <a className="brand" href="#top" aria-label="N0VA home"><span className="brand-mark">N</span><span>N0VA<span className="brand-slash">//</span>ARCHIVE</span></a>
      <div className="top-right"><span className="status-dot" /><span className="mono status-label">SYSTEM ONLINE</span><button className="command-hint" onClick={() => setTerminalOpen(true)} aria-label="Open terminal"><Command size={14}/><span>CTRL K</span></button><button className="desktop-launch" onClick={() => setDesktopOpen(true)}><Monitor size={14}/> LAUNCH OS</button></div>
    </header>

    <section className="hero wrap" id="top">
      <motion.div className="eyebrow mono" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}><span className="eyebrow-line"/> N0VA / PERSONAL ARCHIVE <span className="eyebrow-year">IDENTITY PROTOCOL</span></motion.div>
      <motion.div className="headline-wrap" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .08 }}>
        <h1 aria-label={revealed ? `${ALIAS}. Yuvraj` : headline} className={revealed ? 'headline solved' : 'headline'}>{headline}<span className="headline-period">.</span></h1>
        {revealed && <motion.div className="operator-reveal" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} aria-live="polite"><span className="mono operator-kicker">OPERATOR IDENTIFIED</span><span className="operator-name">YUVRAJ</span><span className="operator-tagline">THE MIND BEHIND THE SYSTEM.</span></motion.div>}
        <span className="headline-index mono">ID-{String(shift).padStart(2, '0')}</span>
      </motion.div>
      <motion.p className="hero-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .28, duration: .6 }}>I build software. <span>I investigate systems.</span></motion.p>
      <motion.p className="hero-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .38, duration: .6 }}>A second-year Computer Science student interested in full-stack development, cybersecurity, reverse engineering, and competitive programming. I enjoy understanding how systems work, investigating how they fail, and turning ideas into working projects.</motion.p>

      <div className="cipher-panel">
        <div className="cipher-heading"><label htmlFor="cipher">Decrypt the identity</label><span className="mono cipher-shift">SHIFT <b>{shift}</b> / 25</span></div>
        <input id="cipher" className="cipher-slider" type="range" min="0" max="25" value={shift} onChange={(e) => { setShift(Number(e.target.value)); setRevealed(false); }} style={{ '--progress': `${shift / 25 * 100}%` } as React.CSSProperties} aria-label="Caesar cipher shift" />
        <div className="slider-ticks mono"><span>ROT 0</span><span>ROT 13</span><span>ROT 25</span></div>
        <div className={`cipher-message ${isSolved ? 'success' : ''}`} aria-live="polite">{isSolved ? 'Identity recovered. You found the signal.' : 'The headline is a Caesar cipher. Slide until it reads right.'}</div>
        {isSolved && <button className="reveal-button" onClick={() => setRevealed(!revealed)}>{revealed ? 'HIDE OPERATOR ID' : 'REVEAL OPERATOR'} <ArrowRight size={14}/></button>}
      </div>

      <div className="hero-actions"><button className="primary-button" onClick={() => scrollTo('projects')}>EXPLORE THE ARCHIVE <ArrowDownRight size={16}/></button><button className="text-button" onClick={() => setTerminalOpen(true)}><Terminal size={15}/> OPEN TERMINAL <span className="mono">↗</span></button><button className="text-button desktop-text-button" onClick={() => setDesktopOpen(true)}><Monitor size={15}/> ENTER VOID OS <span className="mono">↗</span></button></div>
      <div className="scroll-cue mono"><span className="scroll-line"/> SCROLL TO EXPLORE <span className="scroll-arrow">↓</span></div>
    </section>

    <section className="about-section wrap section-rule" id="about">
      <div className="section-label"><span className="mono section-number">01 /</span><h2>About</h2></div>
      <div className="section-content"><p className="about-lead">Second-year Computer Science student, CTF player at bi0sblr, and creative developer.</p><p>I’m interested in full-stack development and cybersecurity, especially reverse engineering and OSINT. I also enjoy competitive programming and the process of breaking a problem down until the solution becomes clear.</p><p>I’m building projects to deepen my skills in application development, databases, and interactive experiences.</p><div className="chips"><span>JAVA</span><span>PYTHON</span><span>SQL</span><span>FULL-STACK</span><span>CYBERSECURITY</span><span>OSINT</span><span>CTF / bi0sblr</span><span>COMPETITIVE PROGRAMMING</span></div></div>
    </section>

    <section className="projects-section wrap section-rule" id="projects">
      <div className="section-label"><span className="mono section-number">02 /</span><h2>Selected work</h2></div>
      <p className="projects-intro">A snapshot of what I’m building now. Status labels reflect the current stage, not a claim of production readiness.</p>
      <div className="project-grid">
        <article className="project-card"><div className="project-top mono"><span>PROJECT_001</span><span className="project-status"><span/> IN PROGRESS</span></div><div className="project-icon icon-lime"><Database size={23}/></div><h3>InvestWise</h3><p>A portfolio management system project. The current focus is developing the application with Java, Spring Boot, and a MySQL database.</p><div className="project-tags"><span>JAVA 21</span><span>SPRING BOOT</span><span>MYSQL</span></div><div className="project-link project-link-static"><span>UNDER DEVELOPMENT</span><ArrowUpRight size={15}/></div></article>
        <article className="project-card"><div className="project-top mono"><span>PROJECT_002</span><span className="project-status muted"><span/> WORKING PROTOTYPE</span></div><div className="project-icon icon-pink"><Search size={23}/></div><h3>Detective Mystery Game</h3><p>A GUI-based mystery game where players inspect crime-scene images and interact with clues. The prototype uses Python and a MySQL-backed game database.</p><div className="project-tags"><span>PYTHON</span><span>CUSTOMTKINTER</span><span>MYSQL</span></div><div className="project-link project-link-static"><span>PROTOTYPE IN PROGRESS</span><ArrowUpRight size={15}/></div></article>
      </div>
      <div className="project-footnote"><span className="mono">// CURRENT FOCUS</span><p>Building, testing, and improving these projects. Public demos and repository links will be added when available.</p></div>
    </section>

    <section className="favorites-section wrap section-rule" id="favorites">
      <div className="section-label"><span className="mono section-number">03 /</span><h2>Off-duty</h2></div>
      <div className="favorites-content">
        <div className="favorites-intro"><p className="favorites-lead">The stuff I keep coming back to when I'm not staring at a terminal.</p><p>Favorite sounds, stories, games, and the little things that make the brain go brrrr. This corner is yours to personalize.</p></div>
        <div className="now-playing-card">
          <div className="now-playing-top mono"><span><span className="status-dot"/> CURRENTLY PLAYING</span><span>NOW.exe</span></div>
          <div className="now-playing-main">{FAVORITE_MEDIA.currentGame.imageUrl ? <img className="now-playing-art-image" src={FAVORITE_MEDIA.currentGame.imageUrl} alt={`${FAVORITE_MEDIA.currentGame.title} cover`} loading="lazy"/> : <div className="now-playing-art"><Gamepad2 size={30}/><span className="art-cross">✳</span></div>}<div className="now-playing-info"><span className="mono tiny-label">IN THE ROTATION</span><h3>{FAVORITE_MEDIA.currentGame.title}</h3><p>{FAVORITE_MEDIA.currentGame.details}</p><span className="playing-pill"><i/> IN PROGRESS</span></div></div>
          <div className="now-playing-bottom mono"><span>PLAYER STATUS</span><span className="lime-text">AVAILABLE FOR ONE MORE ROUND</span></div>
        </div>
        <div className="favorites-grid">
          <article className="favorite-card favorite-music">{FAVORITE_MEDIA.music.imageUrl && <img className="favorite-cover-image" src={FAVORITE_MEDIA.music.imageUrl} alt="Music cover artwork" loading="lazy"/>}<div className="favorite-card-head"><span className="favorite-icon"><Music2 size={18}/></span><span className="mono favorite-index">FAV_001</span></div><span className="mono tiny-label">ON REPEAT</span><h3>Music</h3><p>Your current soundtrack, favorite artists, and songs on repeat.</p><div className="favorite-detail"><Disc3 size={15}/><span>{FAVORITE_MEDIA.music.detail}</span></div></article>
          <article className="favorite-card favorite-movies">{FAVORITE_MEDIA.movie.imageUrl && <img className="favorite-cover-image" src={FAVORITE_MEDIA.movie.imageUrl} alt="Movie or show poster" loading="lazy"/>}<div className="favorite-card-head"><span className="favorite-icon"><Film size={18}/></span><span className="mono favorite-index">FAV_002</span></div><span className="mono tiny-label">WATCHLIST</span><h3>{FAVORITE_MEDIA.movie.title}</h3><p>Comfort movies, mind-bending plots, and shows worth recommending.</p><div className="favorite-detail"><Heart size={15}/><span>{FAVORITE_MEDIA.movie.detail}</span></div></article>
          <article className="favorite-card favorite-games">{FAVORITE_MEDIA.game.imageUrl && <img className="favorite-cover-image" src={FAVORITE_MEDIA.game.imageUrl} alt="Game cover artwork" loading="lazy"/>}<div className="favorite-card-head"><span className="favorite-icon"><Gamepad2 size={18}/></span><span className="mono favorite-index">FAV_003</span></div><span className="mono tiny-label">PLAYER ONE</span><h3>{FAVORITE_MEDIA.game.title}</h3><p>Games I love, games I'm grinding, and games I keep saying I'll finish.</p><div className="favorite-detail"><span className="game-status-dot"/><span>{FAVORITE_MEDIA.game.detail}</span></div></article>
        </div>
        <div className="favorites-footer mono"><span>// MORE INTERESTS WILL BE ADDED TO THE ARCHIVE</span><span>STATUS: PERSONAL</span></div>
      </div>
    </section>

    <section className="live-status-section wrap section-rule" id="live-status"><div className="section-label"><span className="mono section-number">04 /</span><h2>Live signal</h2></div><LiveStatusApp /></section>
    
    
<section className="contact-section wrap section-rule" id="contact">
  <div>
    <span className="mono section-number">05 / LET'S CONNECT</span>
    <h2>
      Have a good problem?
      <br />
      <span>I'm listening.</span>
    </h2>
    <p>
      Have a project idea, a puzzle, or a collaboration in mind?
      Send a signal directly to my inbox.
    </p>

    <div className="contact-links">
      <a href="https://github.com/yuvrajj0202-cyber" target="_blank" rel="noreferrer">
        <Github size={17} /> GitHub <ArrowUpRight size={15} />
      </a>
      <a href="https://www.linkedin.com/in/yuvraj-j-365a44389/" target="_blank" rel="noreferrer">
        <Linkedin size={17} /> LinkedIn <ArrowUpRight size={15} />
      </a>
    </div>
  </div>

  <ContactForm />
</section>


    <footer className="footer wrap"><a className="brand footer-brand" href="#top"><span className="brand-mark">N</span><span>N0VA<span className="brand-slash">//</span>ARCHIVE</span></a><span className="mono footer-note">BUILT WITH CURIOSITY <span>✳</span> © 2026</span><button className="back-top mono" onClick={() => scrollTo('top')}>BACK TO TOP ↑</button></footer>

    {desktopOpen && <div className="desktop-overlay" role="dialog" aria-modal="true" aria-label="N0VA desktop environment">
      <div className="desktop-topbar"><div className="desktop-brand"><span className="brand-mark">N</span><span>N0VA <i>//</i> VOID OS</span></div><div className="desktop-top-status"><span className="status-dot"/> SYSTEM ONLINE <span className="desktop-version">BUILD 01.00</span></div><button className="desktop-exit" onClick={() => setDesktopOpen(false)} aria-label="Exit desktop"><X size={17}/><span>EXIT OS</span></button></div>
      <div className="desktop-workspace" onPointerMove={(event) => { if (!dragging) return; const nextX = Math.max(8, Math.min(window.innerWidth - 220, dragging.x + event.clientX - dragging.pointerX)); const nextY = Math.max(54, Math.min(window.innerHeight - 130, dragging.y + event.clientY - dragging.pointerY)); updateWindow(dragging.id, { x: nextX, y: nextY }); }} onPointerUp={() => setDragging(null)} onPointerCancel={() => setDragging(null)}>
        <div className="desktop-wallpaper-grid"/>
        <div className="desktop-welcome"><span className="mono">PERSONAL COMPUTING ENVIRONMENT / 001</span><h2>Welcome back,<br/><em>operator.</em></h2><p>Choose an application to explore the archive.</p><div className="desktop-clock mono">N0VA SYSTEMS <span>● READY</span></div></div>
        <div className="desktop-shortcuts">
          {[{id:'projects',title:'Projects',icon:<FolderKanban size={20}/>,color:'lime'},{id:'about',title:'About me',icon:<UserRound size={20}/>,color:'cyan'},{id:'terminal',title:'Terminal',icon:<Terminal size={20}/>,color:'pink'},{id:'favorites',title:'Off-duty',icon:<Heart size={20}/>,color:'violet'},{id:'lab',title:'The Lab',icon:<Sparkles size={20}/>,color:'cyan'},{id:'arcade',title:'Arcade',icon:<Gamepad2 size={20}/>,color:'lime'},{id:'status',title:'Live Status',icon:<Radio size={20}/>,color:'pink'},{id:'classified',title:'Classified',icon:<LockKeyhole size={20}/>,color:'violet'}].map((app) => <button className={`desktop-shortcut shortcut-${app.color}`} key={app.id} onDoubleClick={() => app.id === 'terminal' ? openTerminal() : openApp(app.id, app.title)} onClick={() => setActiveWindow(app.id)} title={`Double-click to open ${app.title}`}><span>{app.icon}</span><b>{app.title}</b><small>DOUBLE-CLICK</small></button>)}
        </div>
        {desktopWindows.filter((item) => !item.minimized).map((item) => <section key={item.id} className={`os-window ${item.maximized ? 'is-maximized' : ''} ${activeWindow === item.id ? 'is-active' : ''}`} style={item.maximized ? { zIndex: item.z } : { left: item.x, top: item.y, zIndex: item.z }} onPointerDown={() => focusWindow(item.id)}>
          <div className="os-window-titlebar" onPointerDown={(event) => { if ((event.target as HTMLElement).closest('button')) return; if (!item.maximized) setDragging({ id: item.id, pointerX: event.clientX, pointerY: event.clientY, x: item.x, y: item.y }); }}><div className="window-dots"><i/><i/><i/></div><span className="mono">{item.title.toUpperCase().replaceAll(' ', '_')}.EXE</span><div className="os-window-controls"><button onClick={() => updateWindow(item.id, { minimized: true })} aria-label="Minimize window"><Minus size={13}/></button><button onClick={() => updateWindow(item.id, { maximized: !item.maximized })} aria-label="Maximize or restore window"><Maximize2 size={12}/></button><button onClick={() => closeWindow(item.id)} aria-label="Close window"><X size={14}/></button></div></div>
          <div className="os-window-content">{desktopAppContent(item.id)}</div>
        </section>)}
        <div className="desktop-dock" role="toolbar" aria-label="Desktop applications">{[{id:'projects',title:'Projects',icon:<FolderKanban size={19}/>},{id:'about',title:'About',icon:<UserRound size={19}/>},{id:'terminal',title:'Terminal',icon:<Terminal size={19}/>},{id:'favorites',title:'Off-duty',icon:<Heart size={19}/>},{id:'lab',title:'The Lab',icon:<Sparkles size={19}/>},{id:'arcade',title:'Arcade',icon:<Gamepad2 size={19}/>},{id:'status',title:'Live Status',icon:<Radio size={19}/>},{id:'classified',title:'Classified',icon:<LockKeyhole size={19}/>}].map((app) => <button key={app.id} className={`dock-app ${activeWindow === app.id ? 'dock-active' : ''}`} title={app.title} onClick={() => app.id === 'terminal' ? openTerminal() : openApp(app.id, app.title)}>{app.icon}{desktopWindows.some((w) => w.id === app.id) && <i/>}</button>)}<span className="dock-divider"/><button className="dock-exit" title="Exit VOID OS" onClick={() => setDesktopOpen(false)}><X size={18}/></button></div>
        <div className="desktop-bottom-status mono"><span><Grip size={12}/> DRAG WINDOWS BY THEIR TITLE BAR</span><span>ESC TO EXIT</span></div>
      </div>
    </div>}

    {terminalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setTerminalOpen(false); }}><motion.section className="terminal-modal" role="dialog" aria-modal="true" aria-labelledby="terminal-title" initial={{ opacity: 0, y: 14, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }}><div className="terminal-titlebar"><div className="window-dots"><i/><i/><i/></div><span id="terminal-title" className="mono">VOID_TERMINAL.EXE</span><button onClick={() => setTerminalOpen(false)} aria-label="Close terminal">×</button></div><div className="terminal-body"><p className="mono terminal-welcome">N0VA SYSTEMS [Version 1.0.0]<br/>Curiosity is the exploit.<br/><br/>{terminalOutput}</p><form onSubmit={runCommand} className="terminal-form"><label htmlFor="terminal-command" className="mono">guest@n0va:~$</label><input id="terminal-command" autoFocus value={command} onChange={(e) => setCommand(e.target.value)} placeholder="type a command..." autoComplete="off"/><button aria-label="Run command"><ArrowRight size={16}/></button></form><div className="terminal-foot mono">TIP: TYPE HELP TO GET STARTED <span>ESC TO CLOSE</span></div></div></motion.section></div>}
  </main>;
}

export default App;
