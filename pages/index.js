import Head from 'next/head';
import Script from 'next/script';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Multiplayer Snake</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="container">
        <h1>🐍 Multiplayer Snake</h1>
        <p>
          Spieler 1: <strong>WASD</strong> · Spieler 2: <strong>Pfeiltasten</strong> · Wände sind
          harmlos (Wrap-around)
        </p>
        <canvas id="game" width="600" height="600" aria-label="Snake Spielfeld" />
        <div className="hud">
          <span id="scoreP1">P1 Punkte: 0</span>
          <span id="scoreP2">P2 Punkte: 0</span>
        </div>
        <p id="status">Drücke eine Taste, um zu starten.</p>
        <button id="restart" type="button">
          Neu starten
        </button>
      </main>

      <Script src="/game.js" strategy="afterInteractive" />
    </>
  );
}
