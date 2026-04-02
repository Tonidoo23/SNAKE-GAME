import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';

const GRID_SIZE = 20;
const P1_KEYS = ['w', 'a', 's', 'd'];
const P2_KEYS = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];

export default function HomePage() {
  const canvasRef = useRef(null);
  const [joinCode, setJoinCode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [role, setRole] = useState('');
  const [state, setState] = useState(null);
  const [status, setStatus] = useState('Erstelle einen Party-Code oder nutze Quick Match.');
  const [busy, setBusy] = useState(false);

  const connected = useMemo(() => Boolean(roomCode && playerId), [roomCode, playerId]);

  async function postAction(payload) {
    const response = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unbekannter Fehler');
    }
    return data;
  }

  async function createRoom() {
    setBusy(true);
    try {
      const result = await postAction({ action: 'create' });
      setRoomCode(result.roomCode);
      setPlayerId(result.playerId);
      setRole(result.role);
      setStatus(`Code erstellt: ${result.roomCode}. Warte auf Gegner …`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    if (!joinCode.trim()) {
      setStatus('Bitte zuerst einen Code eingeben.');
      return;
    }

    setBusy(true);
    try {
      const result = await postAction({ action: 'join', roomCode: joinCode.trim().toUpperCase() });
      setRoomCode(result.roomCode);
      setPlayerId(result.playerId);
      setRole(result.role);
      setStatus(`Beigetreten: ${result.roomCode}`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function quickMatch() {
    setBusy(true);
    try {
      const result = await postAction({ action: 'quick' });
      setRoomCode(result.roomCode);
      setPlayerId(result.playerId);
      setRole(result.role);
      setStatus(result.waiting ? `Wartezimmer offen: ${result.roomCode}` : `Match gefunden: ${result.roomCode}`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!connected) {
      return undefined;
    }

    let active = true;

    const pull = async () => {
      try {
        const response = await fetch(`/api/match?roomCode=${roomCode}&playerId=${playerId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'State-Fehler');
        }

        if (active) {
          setState(data);
          setStatus(data.message);
        }
      } catch (error) {
        if (active) {
          setStatus(error.message);
        }
      }
    };

    pull();
    const interval = setInterval(pull, 150);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [connected, roomCode, playerId]);

  useEffect(() => {
    if (!connected) {
      return undefined;
    }

    const onKeyDown = async (event) => {
      const key = event.key;
      if (![...P1_KEYS, ...P2_KEYS].includes(key)) {
        return;
      }

      if (role === 'p1' && !P1_KEYS.includes(key)) {
        return;
      }

      if (role === 'p2' && !P2_KEYS.includes(key)) {
        return;
      }

      try {
        await postAction({
          action: 'input',
          roomCode,
          playerId,
          key
        });
      } catch {
        // polling updates status
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [connected, roomCode, playerId, role]);

  useEffect(() => {
    if (!state || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(state.food.x * GRID_SIZE, state.food.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);

    const drawSnake = (snake) => {
      snake.body.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#f8fafc' : snake.color;
        ctx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
      });
    };

    drawSnake(state.snake1);
    drawSnake(state.snake2);
  }, [state]);

  return (
    <>
      <Head>
        <title>Multiplayer Snake Party</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="container">
        <p className="badge">2-Player Online Lobby</p>
        <h1>🐍 Multiplayer Snake</h1>
        <p>Online-Modus: Party-Code erstellen/beitreten oder Quick Match.</p>

        <section className="lobby">
          <div className="row">
            <button type="button" onClick={createRoom} disabled={busy || connected}>
              Code erstellen
            </button>
            <button type="button" onClick={quickMatch} disabled={busy || connected}>
              Quick Match
            </button>
          </div>
          <div className="row">
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="Party-Code"
              maxLength={6}
              disabled={busy || connected}
            />
            <button type="button" onClick={joinRoom} disabled={busy || connected}>
              Mit Code beitreten
            </button>
          </div>
        </section>

        <canvas ref={canvasRef} id="game" width={600} height={600} aria-label="Snake Spielfeld" />

        <div className="hud">
          <span>Raum: {roomCode || '—'}</span>
          <span>Du bist: {role === 'p1' ? 'Grün (WASD)' : role === 'p2' ? 'Rot (Pfeile)' : '—'}</span>
          <span>P1: {state?.snake1?.score ?? 0}</span>
          <span>P2: {state?.snake2?.score ?? 0}</span>
        </div>

        <p id="status">{status}</p>
        <p className="hint">Nur Kollision mit der anderen Schlange beendet das Match. Wände sind Wrap-around.</p>
      </main>
    </>
  );
}
