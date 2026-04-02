# Multiplayer Snake

Online-Snake mit **2 Spielern auf einem Feld**.

## Multiplayer-Modi

1. **Party Code**
   - Spieler A klickt auf `Code erstellen`.
   - Spieler B gibt den Code ein und klickt auf `Mit Code beitreten`.
2. **Quick Match**
   - Klick auf `Quick Match`.
   - Falls jemand wartet, joinst du sofort.
   - Sonst öffnest du ein Wartezimmer, bis ein anderer Spieler kommt.

Rollen:

- **Grün (P1)**: WASD
- **Rot (P2)**: Pfeiltasten

Regeln:

- Wände sind Wrap-around (kein Tod an der Wand).
- Verlust nur bei Berührung der **anderen** Schlange.

## Entwicklung lokal

```bash
npm install
npm run dev
```

Dann öffnen: `http://localhost:3000`

## Vercel Deployment

- **Framework Preset:** `Next.js`
- **Root Directory:** `.`
- **Install Command:** `npm install`
- **Build Command:** `npm run build`
- **Output Directory:** leer lassen
- **Node.js Version:** `20.x` oder höher
