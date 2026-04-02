import {
  createMatch,
  getState,
  joinMatch,
  pushInput,
  quickMatch
} from '../../lib/match-engine';

const directionMap = {
  w: { x: 0, y: -1 },
  a: { x: -1, y: 0 },
  s: { x: 0, y: 1 },
  d: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowDown: { x: 0, y: 1 },
  ArrowRight: { x: 1, y: 0 }
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    const result = getState({
      roomCode: req.query.roomCode,
      playerId: req.query.playerId
    });

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  }

  if (req.method === 'POST') {
    const { action } = req.body || {};

    if (action === 'create') {
      return res.status(200).json(createMatch());
    }

    if (action === 'join') {
      const result = joinMatch(req.body?.roomCode);
      if (result.error) {
        return res.status(400).json(result);
      }
      return res.status(200).json(result);
    }

    if (action === 'quick') {
      return res.status(200).json(quickMatch());
    }

    if (action === 'input') {
      const next = directionMap[req.body?.key];
      if (!next) {
        return res.status(400).json({ error: 'Ungültige Eingabe.' });
      }

      const result = pushInput({
        roomCode: req.body?.roomCode,
        playerId: req.body?.playerId,
        direction: next
      });

      if (result.error) {
        return res.status(400).json(result);
      }

      return res.status(200).json({ ok: true });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
