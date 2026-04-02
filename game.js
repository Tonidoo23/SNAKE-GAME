const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreP1 = document.getElementById('scoreP1');
const scoreP2 = document.getElementById('scoreP2');
const statusText = document.getElementById('status');
const restartButton = document.getElementById('restart');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

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

let snake1;
let snake2;
let food;
let running;
let started;

function resetGame() {
  snake1 = {
    body: [
      { x: 6, y: 15 },
      { x: 5, y: 15 },
      { x: 4, y: 15 }
    ],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    score: 0,
    color: '#22c55e',
    name: 'Spieler 1'
  };

  snake2 = {
    body: [
      { x: 23, y: 15 },
      { x: 24, y: 15 },
      { x: 25, y: 15 }
    ],
    dir: { x: -1, y: 0 },
    nextDir: { x: -1, y: 0 },
    score: 0,
    color: '#ef4444',
    name: 'Spieler 2'
  };

  running = true;
  started = false;
  food = spawnFood();
  updateHud();
  statusText.textContent = 'Drücke WASD oder Pfeiltasten zum Start.';
  draw();
}

function spawnFood() {
  let point;
  do {
    point = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (isOnSnake(point, snake1) || isOnSnake(point, snake2));
  return point;
}

function isOnSnake(point, snake) {
  return snake.body.some((part) => part.x === point.x && part.y === point.y);
}

function setDirection(snake, next) {
  if (!running) {
    return;
  }

  if (snake.dir.x + next.x === 0 && snake.dir.y + next.y === 0) {
    return;
  }

  snake.nextDir = next;
  started = true;
}

document.addEventListener('keydown', (event) => {
  const next = directionMap[event.key];
  if (!next) {
    return;
  }

  if (['w', 'a', 's', 'd'].includes(event.key)) {
    setDirection(snake1, next);
  } else {
    setDirection(snake2, next);
  }
});

restartButton.addEventListener('click', resetGame);

function tick() {
  if (!running || !started) {
    draw();
    return;
  }

  snake1.dir = snake1.nextDir;
  snake2.dir = snake2.nextDir;

  const nextHead1 = moveHead(snake1);
  const nextHead2 = moveHead(snake2);

  snake1.body.unshift(nextHead1);
  snake2.body.unshift(nextHead2);

  let grew1 = false;
  let grew2 = false;

  if (nextHead1.x === food.x && nextHead1.y === food.y) {
    snake1.score += 1;
    grew1 = true;
    food = spawnFood();
  }

  if (nextHead2.x === food.x && nextHead2.y === food.y) {
    snake2.score += 1;
    grew2 = true;
    food = spawnFood();
  }

  if (!grew1) {
    snake1.body.pop();
  }

  if (!grew2) {
    snake2.body.pop();
  }

  const p1HitP2 = isOnSnake(nextHead1, { body: snake2.body });
  const p2HitP1 = isOnSnake(nextHead2, { body: snake1.body });

  if (p1HitP2 && p2HitP1) {
    running = false;
    statusText.textContent = 'Unentschieden! Beide Köpfe haben die andere Schlange berührt.';
  } else if (p1HitP2) {
    running = false;
    statusText.textContent = 'Spieler 2 gewinnt! Spieler 1 hat die andere Schlange berührt.';
  } else if (p2HitP1) {
    running = false;
    statusText.textContent = 'Spieler 1 gewinnt! Spieler 2 hat die andere Schlange berührt.';
  }

  updateHud();
  draw();
}

function moveHead(snake) {
  const head = snake.body[0];
  return {
    x: (head.x + snake.dir.x + tileCount) % tileCount,
    y: (head.y + snake.dir.y + tileCount) % tileCount
  };
}

function updateHud() {
  scoreP1.textContent = `P1 Punkte: ${snake1.score}`;
  scoreP2.textContent = `P2 Punkte: ${snake2.score}`;
}

function drawSnake(snake) {
  snake.body.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? '#f8fafc' : snake.color;
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1);
  });
}

function draw() {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);

  drawSnake(snake1);
  drawSnake(snake2);
}

resetGame();
setInterval(tick, 120);
