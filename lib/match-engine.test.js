const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createMatch,
  joinMatch,
  quickMatch,
  getState,
  pushInput,
  __resetForTests
} = require('./match-engine');

test.afterEach(() => {
  __resetForTests();
});

test('create + join by party code', () => {
  const p1 = createMatch();
  assert.equal(p1.role, 'p1');
  assert.equal(p1.roomCode.length, 6);

  const p2 = joinMatch(p1.roomCode);
  assert.equal(p2.role, 'p2');

  const s1 = getState({ roomCode: p1.roomCode, playerId: p1.playerId });
  const s2 = getState({ roomCode: p1.roomCode, playerId: p2.playerId });
  assert.equal(s1.waiting, false);
  assert.equal(s2.waiting, false);
});

test('quick match pairs two players in same room', () => {
  const a = quickMatch();
  const b = quickMatch();

  assert.equal(a.roomCode, b.roomCode);
  assert.notEqual(a.role, b.role);
});

test('invalid code returns error', () => {
  const res = joinMatch('XXXXXX');
  assert.equal(typeof res.error, 'string');
});

test('rejects invalid player input', () => {
  const p1 = createMatch();
  const res = pushInput({
    roomCode: p1.roomCode,
    playerId: 'bad-player',
    direction: { x: 1, y: 0 }
  });

  assert.equal(typeof res.error, 'string');
});
