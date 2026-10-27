// Проверки формул: node calc.test.js
const assert = require('node:assert');
const C = require('./calc.js');
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

// parseNum
assert.strictEqual(C.parseNum('0,5'), 0.5);
assert.strictEqual(C.parseNum(' 1 050 '), 1050);
assert.strictEqual(C.parseNum('1 050,25'), 1050.25);
assert.strictEqual(C.parseNum('.5'), 0.5);
assert.strictEqual(C.parseNum(''), null);
assert.strictEqual(C.parseNum(null), null);
assert.ok(Number.isNaN(C.parseNum('abc')));
assert.ok(Number.isNaN(C.parseNum('-1')));
assert.ok(Number.isNaN(C.parseNum('1,2,3')));

// Толщина по граммажу: 300 г/м² при 0,75 г/см³ → 0,4 мм; своя плотность
near(C.thicknessFromGrammage(300), 0.4);
near(C.thicknessFromGrammage(300, 0.6), 0.5);

// Длина рулона: D=1000, d=76, t=0,5 → π·994224/2 мм
near(C.rollLength(1000, 76, 0.5), Math.PI * 994224 / 2 / 1000);
near(C.rollLength(1000, 76, 0.5), 1561.7234, 1e-6);
near(C.rollTurns(1000, 76, 0.5), 924);

// Вес рулона и обратный расчёт
near(C.rollWeight(1000, 1.05, 300), 315);
near(C.rollLengthFromWeight(315, 1.05, 300), 1000);
const len = C.rollLength(1200, 76, 0.4);
near(C.rollLengthFromWeight(C.rollWeight(len, 1.05, 300), 1.05, 300), len);

// Листы: 0,7 × 1,0 м, 300 г/м²
near(C.sheetWeight(0.7, 1, 300), 0.21);
near(C.sheetsPerTonne(0.7, 1, 300), 1e6 / 210);
near(C.batchWeight(5000, 0.7, 1, 300), 1050);
assert.strictEqual(C.sheetsInTonnes(2, 0.7, 1, 300), 9523);
assert.strictEqual(C.sheetsInTonnes(1, 0.5, 0.5, 400), 10000);
assert.strictEqual(C.sheetsInTonnes(0.3, 1, 1, 100), 3000); // ловушка плавающей точки
assert.strictEqual(C.sheetsInTonnes(0.7, 0.1, 1, 100), 70000);

console.log('Все проверки прошли');
