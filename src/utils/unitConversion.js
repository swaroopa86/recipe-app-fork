/**
 * Unit Conversion Utility for Recipe App
 * Handles conversion between common cooking measurements
 */

// Base unit conversion factors (all converted to milliliters for volume, grams for weight)
const VOLUME_CONVERSIONS = {
  // Volume units to milliliters
  'ml': 1,
  'milliliter': 1,
  'milliliters': 1,
  'l': 1000,
  'liter': 1000,
  'liters': 1000,
  'cup': 236.588,
  'cups': 236.588,
  'tbsp': 14.7868,
  'tablespoon': 14.7868,
  'tablespoons': 14.7868,
  'tsp': 4.92892,
  'teaspoon': 4.92892,
  'teaspoons': 4.92892,
  'fl oz': 29.5735,
  'fluid ounce': 29.5735,
  'fluid ounces': 29.5735,
  'pint': 473.176,
  'pints': 473.176,
  'quart': 946.353,
  'quarts': 946.353,
  'gallon': 3785.41,
  'gallons': 3785.41
};

const WEIGHT_CONVERSIONS = {
  // Weight units to grams
  'g': 1,
  'gram': 1,
  'grams': 1,
  'kg': 1000,
  'kilogram': 1000,
  'kilograms': 1000,
  'oz': 28.3495,
  'ounce': 28.3495,
  'ounces': 28.3495,
  'lb': 453.592,
  'pound': 453.592,
  'pounds': 453.592
};

// Common ingredient density approximations (grams per milliliter)
const INGREDIENT_DENSITIES = {
  'flour': 0.593,
  'sugar': 0.845,
  'brown sugar': 0.845,
  'butter': 0.911,
  'oil': 0.92,
  'milk': 1.03,
  'water': 1.0,
  'honey': 1.42,
  'salt': 1.2,
  'baking powder': 0.9,
  'baking soda': 2.2,
  'cocoa powder': 0.41,
  'vanilla': 0.88,
  'rice': 0.75,
  'oats': 0.41
};

/**
 * Normalize unit names to lowercase and handle common variations
 */
function normalizeUnit(unit) {
  if (!unit) return '';
  
  const trimmed = unit.trim();
  
  // Handle case-sensitive abbreviations first
  if (trimmed === 'T') return 'tbsp';
  if (trimmed === 't') return 'tsp';
  
  const normalized = trimmed.toLowerCase();
  
  // Handle common abbreviations and variations
  const unitMappings = {
    'ts': 'tsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'tb': 'tbsp',
    'tbs': 'tbsp',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'c': 'cup',
    'cups': 'cup',
    'fl. oz': 'fl oz',
    'fluid oz': 'fl oz',
    'floz': 'fl oz',
    'pt': 'pint',
    'pts': 'pint',
    'qt': 'quart',
    'qts': 'quart',
    'gal': 'gallon',
    'gals': 'gallon',
    'ounce': 'oz',
    'ounces': 'oz',
    'pound': 'lb',
    'pounds': 'lb',
    'lbs': 'lb',
    'gram': 'g',
    'grams': 'g',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'kgs': 'kg',
    'liter': 'l',
    'liters': 'l',
    'milliliter': 'ml',
    'milliliters': 'ml'
  };
  
  return unitMappings[normalized] || normalized;
}

/**
 * Check if a unit is a volume unit
 */
function isVolumeUnit(unit) {
  const normalizedUnit = normalizeUnit(unit);
  return normalizedUnit in VOLUME_CONVERSIONS;
}

/**
 * Check if a unit is a weight unit
 */
function isWeightUnit(unit) {
  const normalizedUnit = normalizeUnit(unit);
  return normalizedUnit in WEIGHT_CONVERSIONS;
}

/**
 * Check if two units are compatible (both volume or both weight)
 */
function areUnitsCompatible(unit1, unit2) {
  const norm1 = normalizeUnit(unit1);
  const norm2 = normalizeUnit(unit2);
  
  return (isVolumeUnit(norm1) && isVolumeUnit(norm2)) ||
         (isWeightUnit(norm1) && isWeightUnit(norm2));
}

/**
 * Convert between volume units
 */
function convertVolume(quantity, fromUnit, toUnit) {
  const normalizedFrom = normalizeUnit(fromUnit);
  const normalizedTo = normalizeUnit(toUnit);
  
  if (!isVolumeUnit(normalizedFrom) || !isVolumeUnit(normalizedTo)) {
    throw new Error(`Cannot convert volume from ${fromUnit} to ${toUnit}`);
  }
  
  // Convert to milliliters first, then to target unit
  const milliliters = quantity * VOLUME_CONVERSIONS[normalizedFrom];
  return milliliters / VOLUME_CONVERSIONS[normalizedTo];
}

/**
 * Convert between weight units
 */
function convertWeight(quantity, fromUnit, toUnit) {
  const normalizedFrom = normalizeUnit(fromUnit);
  const normalizedTo = normalizeUnit(toUnit);
  
  if (!isWeightUnit(normalizedFrom) || !isWeightUnit(normalizedTo)) {
    throw new Error(`Cannot convert weight from ${fromUnit} to ${toUnit}`);
  }
  
  // Convert to grams first, then to target unit
  const grams = quantity * WEIGHT_CONVERSIONS[normalizedFrom];
  return grams / WEIGHT_CONVERSIONS[normalizedTo];
}

/**
 * Convert between volume and weight using ingredient density
 */
function convertVolumeToWeight(quantity, volumeUnit, weightUnit, ingredientName) {
  const normalizedVolumeUnit = normalizeUnit(volumeUnit);
  const normalizedWeightUnit = normalizeUnit(weightUnit);
  
  if (!isVolumeUnit(normalizedVolumeUnit) || !isWeightUnit(normalizedWeightUnit)) {
    throw new Error(`Cannot convert from ${volumeUnit} to ${weightUnit}`);
  }
  
  // Find ingredient density
  const ingredient = ingredientName.toLowerCase();
  let density = INGREDIENT_DENSITIES[ingredient];
  
  // Try to find partial matches for common ingredients
  if (!density) {
    for (const [key, value] of Object.entries(INGREDIENT_DENSITIES)) {
      if (ingredient.includes(key) || key.includes(ingredient)) {
        density = value;
        break;
      }
    }
  }
  
  // Use default density if ingredient not found
  if (!density) {
    density = 1.0; // Assume water-like density
  }
  
  // Convert volume to milliliters
  const milliliters = quantity * VOLUME_CONVERSIONS[normalizedVolumeUnit];
  
  // Convert to grams using density
  const grams = milliliters * density;
  
  // Convert to target weight unit
  return grams / WEIGHT_CONVERSIONS[normalizedWeightUnit];
}

/**
 * Convert between weight and volume using ingredient density
 */
function convertWeightToVolume(quantity, weightUnit, volumeUnit, ingredientName) {
  const normalizedWeightUnit = normalizeUnit(weightUnit);
  const normalizedVolumeUnit = normalizeUnit(volumeUnit);
  
  if (!isWeightUnit(normalizedWeightUnit) || !isVolumeUnit(normalizedVolumeUnit)) {
    throw new Error(`Cannot convert from ${weightUnit} to ${volumeUnit}`);
  }
  
  // Find ingredient density
  const ingredient = ingredientName.toLowerCase();
  let density = INGREDIENT_DENSITIES[ingredient];
  
  // Try to find partial matches for common ingredients
  if (!density) {
    for (const [key, value] of Object.entries(INGREDIENT_DENSITIES)) {
      if (ingredient.includes(key) || key.includes(ingredient)) {
        density = value;
        break;
      }
    }
  }
  
  // Use default density if ingredient not found
  if (!density) {
    density = 1.0; // Assume water-like density
  }
  
  // Convert weight to grams
  const grams = quantity * WEIGHT_CONVERSIONS[normalizedWeightUnit];
  
  // Convert to milliliters using density
  const milliliters = grams / density;
  
  // Convert to target volume unit
  return milliliters / VOLUME_CONVERSIONS[normalizedVolumeUnit];
}

/**
 * Main conversion function that handles all types of conversions
 */
function convertUnits(quantity, fromUnit, toUnit, ingredientName = '') {
  if (!quantity || !fromUnit || !toUnit) {
    return quantity;
  }
  
  const normalizedFrom = normalizeUnit(fromUnit);
  const normalizedTo = normalizeUnit(toUnit);
  
  // If units are the same, no conversion needed
  if (normalizedFrom === normalizedTo) {
    return quantity;
  }
  
  try {
    // Both volume units
    if (isVolumeUnit(normalizedFrom) && isVolumeUnit(normalizedTo)) {
      return convertVolume(quantity, normalizedFrom, normalizedTo);
    }
    
    // Both weight units
    if (isWeightUnit(normalizedFrom) && isWeightUnit(normalizedTo)) {
      return convertWeight(quantity, normalizedFrom, normalizedTo);
    }
    
    // Volume to weight conversion
    if (isVolumeUnit(normalizedFrom) && isWeightUnit(normalizedTo)) {
      return convertVolumeToWeight(quantity, normalizedFrom, normalizedTo, ingredientName);
    }
    
    // Weight to volume conversion
    if (isWeightUnit(normalizedFrom) && isVolumeUnit(normalizedTo)) {
      return convertWeightToVolume(quantity, normalizedFrom, normalizedTo, ingredientName);
    }
    
    // Units are not compatible
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
    
  } catch (error) {
    console.warn(`Unit conversion failed: ${error.message}`);
    return quantity; // Return original quantity if conversion fails
  }
}

/**
 * Compare quantities with different units
 * Returns: 1 if quantity1 > quantity2, -1 if quantity1 < quantity2, 0 if equal
 */
function compareQuantities(quantity1, unit1, quantity2, unit2, ingredientName = '') {
  try {
    // Convert quantity2 to the same unit as quantity1
    const convertedQuantity2 = convertUnits(quantity2, unit2, unit1, ingredientName);
    
    if (quantity1 > convertedQuantity2) return 1;
    if (quantity1 < convertedQuantity2) return -1;
    return 0;
  } catch (error) {
    console.warn(`Quantity comparison failed: ${error.message}`);
    return 0; // Assume equal if comparison fails
  }
}

/**
 * Format a quantity with appropriate precision
 */
function formatQuantity(quantity) {
  if (quantity === 0) return '0';
  if (quantity < 0.01) return quantity.toFixed(4);
  if (quantity < 0.1) return quantity.toFixed(3);
  if (quantity < 1) return quantity.toFixed(2);
  if (quantity < 10) return quantity.toFixed(1);
  return Math.round(quantity).toString();
}

export {
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
};
