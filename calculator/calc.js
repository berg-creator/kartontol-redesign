// Формулы калькулятора картона. Чистые функции, без DOM.
// Единицы — в имени параметра: Mm — миллиметры, M — метры, Gsm — г/м², Gcm3 — г/см³, Kg — кг.
// Обычный скрипт: в браузере доступен как глобальный Calc, в Node — через require.
var Calc = {
  DEFAULT_DENSITY: 0.75, // г/см³, только для оценки толщины; точное значение — в паспорте продукции

  // Текст поля → число. «0,5», « 1 050 » → 0.5, 1050; пусто → null; не число → NaN.
  parseNum: function (s) {
    var v = String(s == null ? '' : s).replace(/[\s  ]/g, '').replace(',', '.');
    if (v === '') return null;
    return /^(\d+\.?\d*|\.\d+)$/.test(v) ? Number(v) : NaN;
  },

  // Оценка толщины по граммажу: t(мм) = граммаж / (плотность · 1000)
  thicknessFromGrammage: function (grammageGsm, densityGcm3) {
    return grammageGsm / ((densityGcm3 == null ? Calc.DEFAULT_DENSITY : densityGcm3) * 1000);
  },

  // Длина рулона, м: π·(D² − d²) / (4·t), всё в мм, перевод мм → м
  rollLength: function (outerMm, coreMm, thicknessMm) {
    return Math.PI * (outerMm * outerMm - coreMm * coreMm) / (4 * thicknessMm) / 1000;
  },

  // Число витков намотки
  rollTurns: function (outerMm, coreMm, thicknessMm) {
    return (outerMm - coreMm) / (2 * thicknessMm);
  },

  // Вес рулона, кг = длина(м) · ширина(м) · граммаж / 1000
  rollWeight: function (lengthM, widthM, grammageGsm) {
    return lengthM * widthM * grammageGsm / 1000;
  },

  // Длина по весу, м = вес·1000 / (ширина · граммаж)
  rollLengthFromWeight: function (weightKg, widthM, grammageGsm) {
    return weightKg * 1000 / (widthM * grammageGsm);
  },

  // Вес листа, кг
  sheetWeight: function (widthM, lengthM, grammageGsm) {
    return widthM * lengthM * grammageGsm / 1000;
  },

  // Листов в тонне (дробное, это норма); целые листы — sheetsInTonnes(1, …)
  sheetsPerTonne: function (widthM, lengthM, grammageGsm) {
    return 1e6 / (widthM * lengthM * grammageGsm);
  },

  // Вес партии из N листов, кг
  batchWeight: function (count, widthM, lengthM, grammageGsm) {
    return count * Calc.sheetWeight(widthM, lengthM, grammageGsm);
  },

  // Сколько целых листов в X тоннах (вниз; 1e-9 гасит ошибку плавающей точки)
  sheetsInTonnes: function (tonnes, widthM, lengthM, grammageGsm) {
    return Math.floor(tonnes * Calc.sheetsPerTonne(widthM, lengthM, grammageGsm) + 1e-9);
  }
};

if (typeof module !== 'undefined') module.exports = Calc;
