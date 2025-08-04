import {
  normalizeUnit,
  isVolumeUnit,
  isWeightUnit,
  areUnitsCompatible,
  convertVolume,
  convertWeight,
  convertVolumeToWeight,
  convertWeightToVolume,
  convertUnits,
  compareQuantities,
  formatQuantity,
  VOLUME_CONVERSIONS,
  WEIGHT_CONVERSIONS,
  INGREDIENT_DENSITIES
} from './unitConversion';

describe('Unit Conversion Utility', () => {
  describe('normalizeUnit', () => {
    test('normalizes common unit abbreviations', () => {
      expect(normalizeUnit('t')).toBe('tsp');
      expect(normalizeUnit('T')).toBe('tbsp');
      expect(normalizeUnit('c')).toBe('cup');
      expect(normalizeUnit('fl. oz')).toBe('fl oz');
      expect(normalizeUnit('lbs')).toBe('lb');
    });

    test('handles case insensitive input', () => {
      expect(normalizeUnit('CUP')).toBe('cup');
      expect(normalizeUnit('Tablespoon')).toBe('tbsp');
      expect(normalizeUnit('GRAM')).toBe('g');
    });

    test('handles empty or null input', () => {
      expect(normalizeUnit('')).toBe('');
      expect(normalizeUnit(null)).toBe('');
      expect(normalizeUnit(undefined)).toBe('');
    });
  });

  describe('isVolumeUnit and isWeightUnit', () => {
    test('correctly identifies volume units', () => {
      expect(isVolumeUnit('cup')).toBe(true);
      expect(isVolumeUnit('tbsp')).toBe(true);
      expect(isVolumeUnit('ml')).toBe(true);
      expect(isVolumeUnit('fl oz')).toBe(true);
      expect(isVolumeUnit('g')).toBe(false);
      expect(isVolumeUnit('oz')).toBe(false);
    });

    test('correctly identifies weight units', () => {
      expect(isWeightUnit('g')).toBe(true);
      expect(isWeightUnit('oz')).toBe(true);
      expect(isWeightUnit('lb')).toBe(true);
      expect(isWeightUnit('kg')).toBe(true);
      expect(isWeightUnit('cup')).toBe(false);
      expect(isWeightUnit('ml')).toBe(false);
    });
  });

  describe('areUnitsCompatible', () => {
    test('identifies compatible volume units', () => {
      expect(areUnitsCompatible('cup', 'ml')).toBe(true);
      expect(areUnitsCompatible('tbsp', 'tsp')).toBe(true);
      expect(areUnitsCompatible('fl oz', 'l')).toBe(true);
    });

    test('identifies compatible weight units', () => {
      expect(areUnitsCompatible('g', 'kg')).toBe(true);
      expect(areUnitsCompatible('oz', 'lb')).toBe(true);
      expect(areUnitsCompatible('gram', 'ounce')).toBe(true);
    });

    test('identifies incompatible units', () => {
      expect(areUnitsCompatible('cup', 'g')).toBe(false);
      expect(areUnitsCompatible('ml', 'oz')).toBe(false);
      expect(areUnitsCompatible('tbsp', 'lb')).toBe(false);
    });
  });

  describe('convertVolume', () => {
    test('converts between common volume units', () => {
      expect(convertVolume(1, 'cup', 'ml')).toBeCloseTo(236.588, 2);
      expect(convertVolume(1, 'tbsp', 'tsp')).toBeCloseTo(3, 1);
      expect(convertVolume(1, 'l', 'ml')).toBe(1000);
      expect(convertVolume(8, 'fl oz', 'cup')).toBeCloseTo(1, 1);
    });

    test('handles same unit conversion', () => {
      expect(convertVolume(5, 'cup', 'cup')).toBe(5);
      expect(convertVolume(10, 'ml', 'ml')).toBe(10);
    });

    test('throws error for incompatible units', () => {
      expect(() => convertVolume(1, 'cup', 'g')).toThrow();
      expect(() => convertVolume(1, 'ml', 'oz')).toThrow();
    });
  });

  describe('convertWeight', () => {
    test('converts between common weight units', () => {
      expect(convertWeight(1, 'kg', 'g')).toBe(1000);
      expect(convertWeight(1, 'lb', 'oz')).toBeCloseTo(16, 1);
      expect(convertWeight(1000, 'g', 'kg')).toBe(1);
      expect(convertWeight(1, 'oz', 'g')).toBeCloseTo(28.35, 1);
    });

    test('handles same unit conversion', () => {
      expect(convertWeight(5, 'g', 'g')).toBe(5);
      expect(convertWeight(10, 'oz', 'oz')).toBe(10);
    });

    test('throws error for incompatible units', () => {
      expect(() => convertWeight(1, 'g', 'cup')).toThrow();
      expect(() => convertWeight(1, 'oz', 'ml')).toThrow();
    });
  });

  describe('convertVolumeToWeight', () => {
    test('converts volume to weight using ingredient density', () => {
      // 1 cup of flour ≈ 140g (using density 0.593 g/ml)
      const result = convertVolumeToWeight(1, 'cup', 'g', 'flour');
      expect(result).toBeCloseTo(140, 0);
    });

    test('converts volume to weight using water density for unknown ingredients', () => {
      // 1 cup of unknown ingredient ≈ 237g (using water density 1.0 g/ml)
      const result = convertVolumeToWeight(1, 'cup', 'g', 'unknown ingredient');
      expect(result).toBeCloseTo(237, 0);
    });

    test('handles partial ingredient name matches', () => {
      // Should find 'sugar' in 'brown sugar'
      const result = convertVolumeToWeight(1, 'cup', 'g', 'brown sugar');
      expect(result).toBeCloseTo(200, 0); // Using sugar density 0.845 g/ml
    });
  });

  describe('convertWeightToVolume', () => {
    test('converts weight to volume using ingredient density', () => {
      // 100g of flour ≈ 0.71 cups (using density 0.593 g/ml)
      const result = convertWeightToVolume(100, 'g', 'cup', 'flour');
      expect(result).toBeCloseTo(0.71, 1);
    });

    test('converts weight to volume using water density for unknown ingredients', () => {
      // 100g of unknown ingredient ≈ 0.42 cups (using water density 1.0 g/ml)
      const result = convertWeightToVolume(100, 'g', 'cup', 'unknown ingredient');
      expect(result).toBeCloseTo(0.42, 1);
    });
  });

  describe('convertUnits', () => {
    test('handles volume to volume conversions', () => {
      expect(convertUnits(1, 'cup', 'ml')).toBeCloseTo(236.588, 2);
      expect(convertUnits(3, 'tsp', 'tbsp')).toBeCloseTo(1, 1);
    });

    test('handles weight to weight conversions', () => {
      expect(convertUnits(1, 'kg', 'g')).toBe(1000);
      expect(convertUnits(16, 'oz', 'lb')).toBeCloseTo(1, 1);
    });

    test('handles volume to weight conversions with ingredient', () => {
      const result = convertUnits(1, 'cup', 'g', 'flour');
      expect(result).toBeCloseTo(140, 0);
    });

    test('handles weight to volume conversions with ingredient', () => {
      const result = convertUnits(100, 'g', 'cup', 'flour');
      expect(result).toBeCloseTo(0.71, 1);
    });

    test('returns original quantity for same units', () => {
      expect(convertUnits(5, 'cup', 'cup')).toBe(5);
      expect(convertUnits(10, 'g', 'g')).toBe(10);
    });

    test('returns original quantity for invalid inputs', () => {
      expect(convertUnits(0, 'cup', 'ml')).toBe(0);
      expect(convertUnits(5, '', 'ml')).toBe(5);
      expect(convertUnits(5, 'cup', '')).toBe(5);
    });

    test('handles conversion errors gracefully', () => {
      // Should return original quantity when conversion fails
      const result = convertUnits(5, 'invalid', 'cup');
      expect(result).toBe(5);
    });
  });

  describe('compareQuantities', () => {
    test('compares quantities with same units', () => {
      expect(compareQuantities(2, 'cup', 1, 'cup')).toBe(1);
      expect(compareQuantities(1, 'cup', 2, 'cup')).toBe(-1);
      expect(compareQuantities(1, 'cup', 1, 'cup')).toBe(0);
    });

    test('compares quantities with different compatible units', () => {
      expect(compareQuantities(1, 'cup', 200, 'ml')).toBe(1); // 1 cup > 200ml
      expect(compareQuantities(1, 'cup', 300, 'ml')).toBe(-1); // 1 cup < 300ml
      expect(compareQuantities(1000, 'g', 1, 'kg')).toBe(0); // 1000g = 1kg
    });

    test('handles comparison errors gracefully', () => {
      // Should return 0 when comparison fails
      expect(compareQuantities(1, 'invalid', 1, 'cup')).toBe(0);
    });
  });

  describe('formatQuantity', () => {
    test('formats quantities with appropriate precision', () => {
      expect(formatQuantity(0)).toBe('0');
      expect(formatQuantity(0.0001)).toBe('0.0001');
      expect(formatQuantity(0.01)).toBe('0.010');
      expect(formatQuantity(0.1)).toBe('0.10');
      expect(formatQuantity(0.5)).toBe('0.50');
      expect(formatQuantity(1.5)).toBe('1.5');
      expect(formatQuantity(5.7)).toBe('5.7');
      expect(formatQuantity(15.3)).toBe('15');
      expect(formatQuantity(100.7)).toBe('101');
    });
  });

  describe('Constants', () => {
    test('VOLUME_CONVERSIONS contains expected units', () => {
      expect(VOLUME_CONVERSIONS).toHaveProperty('cup');
      expect(VOLUME_CONVERSIONS).toHaveProperty('tbsp');
      expect(VOLUME_CONVERSIONS).toHaveProperty('tsp');
      expect(VOLUME_CONVERSIONS).toHaveProperty('ml');
      expect(VOLUME_CONVERSIONS).toHaveProperty('l');
      expect(VOLUME_CONVERSIONS).toHaveProperty('fl oz');
    });

    test('WEIGHT_CONVERSIONS contains expected units', () => {
      expect(WEIGHT_CONVERSIONS).toHaveProperty('g');
      expect(WEIGHT_CONVERSIONS).toHaveProperty('kg');
      expect(WEIGHT_CONVERSIONS).toHaveProperty('oz');
      expect(WEIGHT_CONVERSIONS).toHaveProperty('lb');
    });

    test('INGREDIENT_DENSITIES contains common ingredients', () => {
      expect(INGREDIENT_DENSITIES).toHaveProperty('flour');
      expect(INGREDIENT_DENSITIES).toHaveProperty('sugar');
      expect(INGREDIENT_DENSITIES).toHaveProperty('butter');
      expect(INGREDIENT_DENSITIES).toHaveProperty('milk');
      expect(INGREDIENT_DENSITIES).toHaveProperty('water');
    });
  });
});
