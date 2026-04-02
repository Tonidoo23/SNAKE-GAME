# Multiplayer Snake

Kleine Browser-Version von Snake mit **zwei Spielern auf einem Spielfeld**.

## Regeln

- Spieler 1 steuert mit **WASD**.
- Spieler 2 steuert mit den **Pfeiltasten**.
- Es gibt **keinen Wand-Tod**: Schlangen erscheinen auf der gegenüberliegenden Seite (Wrap-around).
- Man verliert **nur**, wenn der eigene Kopf die **andere Schlange** berührt.

## Entwicklung lokal

```bash
npm install
npm run dev
```

Dann im Browser öffnen: `http://localhost:3000`

## Production Build

```bash
npm run build
npm run start
```

## Vercel Deployment (wichtig)

Nutze in Vercel folgende Einstellungen:

- **Framework Preset:** `Next.js`
- **Root Directory:** `.` (Repo-Root)
- **Install Command:** `npm install`
- **Build Command:** `npm run build`
- **Output Directory:** leer lassen (Next.js Standard)
- **Node.js Version:** `20.x` oder höher

Zusätzlich ist eine `vercel.json` im Repo vorhanden, die Framework + Build/Install explizit setzt.
