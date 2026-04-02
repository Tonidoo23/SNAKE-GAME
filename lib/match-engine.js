const GRID_SIZE = 20;
const TILE_COUNT = 30;
const TICK_MS = 140;
const ROOM_TTL_MS = 1000 * 60 * 30;
const MAX_TICKS_PER_ADVANCE = 20;

const rooms = new Map();

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function isOnSnake(point, snake) {
  return snake.body.some((part) => part.x === point.x && part.y === point.y);
}

function spawnFood(room) {
  let point;
  do {
    point = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
  } while (isOnSnake(point, room.snake1) || isOnSnake(point, room.snake2));
  return point;
}

function createInitialSnake(player) {
  if (player === 'p1') {
    return {
      body: [
        { x: 6, y: 15 },
        { x: 5, y: 15 },
        { x: 4, y: 15 }
      ],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      score: 0,
      color: '#22c55e'
    };
  }

  return {
    body: [
      { x: 23, y: 15 },
      { x: 24, y: 15 },
      { x: 25, y: 15 }
    ],
    dir: { x: -1, y: 0 },
    nextDir: { x: -1, y: 0 },
    score: 0,
    color: '#ef4444'
  };
}

function createRoom(code) {
  const room = {
    code,
    players: {
      p1: null,
      p2: null
    },
    snake1: createInitialSnake('p1'),
    snake2: createInitialSnake('p2'),
    food: { x: 15, y: 15 },
    running: false,
    message: 'Warte auf zweiten Spieler …',
    updatedAt: Date.now(),
    lastTickAt: Date.now(),
    inputQueue: { p1: null, p2: null },
    tickCount: 0
  };

  room.food = spawnFood(room);
  return room;
}

function moveHead(snake) {
  const head = snake.body[0];
  return {
    x: (head.x + snake.dir.x + TILE_COUNT) % TILE_COUNT,
    y: (head.y + snake.dir.y + TILE_COUNT) % TILE_COUNT
  };
}

function setDirection(snake, next) {
  if (snake.dir.x + next.x === 0 && snake.dir.y + next.y === 0) {
    return;
  }
  snake.nextDir = next;
}

function tickRoom(room) {
  if (!room.running) {
    return;
  }

  if (room.inputQueue.p1) {
    setDirection(room.snake1, room.inputQueue.p1);
    room.inputQueue.p1 = null;
  }

  if (room.inputQueue.p2) {
    setDirection(room.snake2, room.inputQueue.p2);
    room.inputQueue.p2 = null;
  }

  room.snake1.dir = room.snake1.nextDir;
  room.snake2.dir = room.snake2.nextDir;

  const nextHead1 = moveHead(room.snake1);
  const nextHead2 = moveHead(room.snake2);

  room.snake1.body.unshift(nextHead1);
  room.snake2.body.unshift(nextHead2);

  let grew1 = false;
  let grew2 = false;

  if (nextHead1.x === room.food.x && nextHead1.y === room.food.y) {
    room.snake1.score += 1;
    grew1 = true;
    room.food = spawnFood(room);
  }

  if (nextHead2.x === room.food.x && nextHead2.y === room.food.y) {
    room.snake2.score += 1;
    grew2 = true;
    room.food = spawnFood(room);
  }

  if (!grew1) room.snake1.body.pop();
  if (!grew2) room.snake2.body.pop();

  const p1HitP2 = isOnSnake(nextHead1, room.snake2);
  const p2HitP1 = isOnSnake(nextHead2, room.snake1);

  if (p1HitP2 && p2HitP1) {
    room.running = false;
    room.message = 'Unentschieden! Beide berühren die andere Schlange.';
  } else if (p1HitP2) {
    room.running = false;
    room.message = 'Spieler Rot gewinnt!';
  } else if (p2HitP1) {
    room.running = false;
    room.message = 'Spieler Grün gewinnt!';
  }

  room.updatedAt = Date.now();
  room.tickCount += 1;
}

function advanceRoom(room) {
  const now = Date.now();
  const elapsed = now - room.lastTickAt;
  if (elapsed < TICK_MS) {
    return;
  }

  const ticks = Math.min(Math.floor(elapsed / TICK_MS), MAX_TICKS_PER_ADVANCE);
  for (let i = 0; i < ticks; i += 1) {
    tickRoom(room);
  }
  room.lastTickAt += ticks * TICK_MS;
}

function cleanupRooms() {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.updatedAt > ROOM_TTL_MS) {
      rooms.delete(code);
    }
  }
}

function createMatch() {
  cleanupRooms();
  let code = randomCode();
  while (rooms.has(code)) {
    code = randomCode();
  }

  const room = createRoom(code);
  const playerId = randomId();
  room.players.p1 = playerId;
  room.updatedAt = Date.now();
  rooms.set(code, room);

  return { roomCode: code, playerId, role: 'p1', waiting: true };
}

function joinMatch(code) {
  cleanupRooms();
  const roomCode = String(code || '').toUpperCase().trim();
  const room = rooms.get(roomCode);

  if (!room) {
    return { error: 'Code nicht gefunden.' };
  }

  if (room.players.p2) {
    return { error: 'Raum ist bereits voll.' };
  }

  const playerId = randomId();
  room.players.p2 = playerId;
  room.running = true;
  room.message = 'Match gestartet!';
  room.lastTickAt = Date.now();
  room.updatedAt = Date.now();

  return { roomCode, playerId, role: 'p2', waiting: false };
}

function quickMatch() {
  cleanupRooms();
  for (const room of rooms.values()) {
    if (room.players.p1 && !room.players.p2) {
      const playerId = randomId();
      room.players.p2 = playerId;
      room.running = true;
      room.message = 'Match gestartet!';
      room.lastTickAt = Date.now();
      room.updatedAt = Date.now();
      return { roomCode: room.code, playerId, role: 'p2', waiting: false };
    }
  }

  return createMatch();
}

function getRole(room, playerId) {
  if (room.players.p1 === playerId) return 'p1';
  if (room.players.p2 === playerId) return 'p2';
  return null;
}

function pushInput({ roomCode, playerId, direction }) {
  const room = rooms.get(String(roomCode || '').toUpperCase().trim());
  if (!room) return { error: 'Raum nicht gefunden.' };

  const role = getRole(room, playerId);
  if (!role) return { error: 'Ungültiger Spieler.' };

  room.inputQueue[role] = direction;
  advanceRoom(room);
  room.updatedAt = Date.now();
  return { ok: true };
}

function getState({ roomCode, playerId }) {
  const room = rooms.get(String(roomCode || '').toUpperCase().trim());
  if (!room) {
    return { error: 'Raum nicht gefunden.' };
  }

  const role = getRole(room, playerId);
  if (!role) {
    return { error: 'Ungültiger Spieler.' };
  }

  advanceRoom(room);
  room.updatedAt = Date.now();

  return {
    roomCode: room.code,
    role,
    waiting: !room.players.p2,
    running: room.running,
    message: room.message,
    snake1: room.snake1,
    snake2: room.snake2,
    food: room.food
  };
}

module.exports = {
  createMatch,
  joinMatch,
  quickMatch,
  pushInput,
  getState,
  TILE_COUNT,
  GRID_SIZE,
  __resetForTests: () => rooms.clear()
};
