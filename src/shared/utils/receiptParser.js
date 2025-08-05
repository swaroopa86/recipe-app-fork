import { UNIT_MAPPING, SKIP_LINES } from '../constants/units';

// Enhanced patterns for real grocery receipts
const ITEM_PATTERNS = [
  // General: 'ITEM_NAME    £PRICE' or 'ITEM_NAME    $PRICE' or 'ITEM_NAME    PRICE'
  /^([A-Z\s\-]+?)\s+[$£]?(\d+\.\d{2})$/i,
  // Walmart style: "BANANAS 3143 2.18 lbs @ $0.68/lb $1.48 F"
  /^(.+?)\s+\d+\s+(\d+(?:\.\d+)?)\s*(\w+)?\s*@?\s*\$?\d+(?:\.\d+)?\/?\w*\s+\$(\d+\.\d+)/,
  
  // Target style: "2 Honeycrisp Apples $4.99"
  /^(\d+(?:\.\d+)?)\s+(.+?)\s+\$(\d+\.\d+)/,
  
  // Generic style: "Milk Whole Gallon $3.49"
  /^(.+?)\s+\$(\d+\.\d+)$/,
  
  // With item code: "012345678901 BREAD WHITE $2.99"
  /^\d{10,}\s+(.+?)\s+\$(\d+\.\d+)/,
  
  // Weight-based: "GROUND BEEF 93/7 1.25 LB @ $5.99/LB $7.49"
  /^(.+?)\s+(\d+(?:\.\d+)?)\s+(LB|LBS|KG|OZ)\s*@\s*\$\d+\.\d+\/\w+\s+\$(\d+\.\d+)/i,
  
  // Quantity x item: "3 x Yogurt Cups $1.99 each"
  /^(\d+)\s*x\s*(.+?)\s+\$\d+\.\d+\s+each/i,
  
  // Simple quantity first: "2 Apples $3.99"
  /^(\d+(?:\.\d+)?)\s+(.+?)\s+\$(\d+\.\d+)/,
  
  // Item with parentheses: "Milk (1 Gallon) $4.99"
  /^(.+?)\s*\((\d+(?:\.\d+)?)\s*([^)]+)\)\s*\$(\d+\.\d+)/,
  
  // Original patterns
  /^(.+?)\s+(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s*\$?\d+\.\d+/,
  /^(\d+)x?\s+(.+?)\s+\$?\d+\.\d+/,
  /^(.+?)\s*\((\d+(?:\.\d+)?)\s*([a-zA-Z]+)\)\s*\$?\d+\.\d+/,
  /^(.+?)\s+\$?\d+\.\d+$/
];

const shouldSkipLine = (line) => {
  return SKIP_LINES.some(skip => line.toUpperCase().includes(skip)) ||
         line.length < 3 || 
         /^\d+$/.test(line) ||
         /^[-=*]+$/.test(line) ||
         /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line) ||
         /^\d{1,2}:\d{2}/.test(line);
};

const cleanItemName = (name) => {
  if (!name) return '';
  
  let cleaned = name
    .replace(/^\d+\s*x?\s*/, '') // Remove quantity prefix
    .replace(/\s*\(.*?\)\s*/, '') // Remove parenthetical content
    .replace(/\d{10,}/, '') // Remove UPC codes
    .trim();
  
  // Convert ALL CAPS to Title Case
  if (/^[A-Z\s]*$/.test(cleaned)) {
    cleaned = cleaned.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return cleaned;
};

const normalizeUnit = (unit) => {
  if (!unit) return 'pieces';
  return UNIT_MAPPING[unit.toLowerCase()] || unit.toLowerCase() || 'pieces';
};

const parseItemFromMatch = (match, patternIndex) => {
  let name, quantity = '1', unit = 'pieces', price = undefined;
  
  switch (patternIndex) {
    case 0: // General: ITEM_NAME    (currency)PRICE
      name = match[1];
      price = match[2];
      quantity = '1';
      unit = 'pieces';
      break;
    case 0: // Walmart style
      name = match[1];
      quantity = match[2] || '1';
      unit = match[3] || 'pieces';
      break;
      
    case 1:
    case 6: // Target/quantity first
      quantity = match[1];
      name = match[2];
      unit = 'pieces';
      break;
      
    case 2:
    case 3:
    case 11: // Generic/item code
      name = match[1];
      quantity = '1';
      unit = 'pieces';
      break;
      
    case 4: // Weight-based
      name = match[1];
      quantity = match[2];
      unit = match[3].toLowerCase();
      break;
      
    case 5: // Quantity x item
      quantity = match[1];
      name = match[2];
      unit = 'pieces';
      break;
      
    case 7: // Item with parentheses
      name = match[1];
      quantity = match[2];
      unit = match[3] || 'pieces';
      break;
      
    case 8: // Original patterns
      if (/^\d/.test(match[1])) {
        const parts = match[1].split(' ');
        quantity = parts[0];
        name = parts.slice(1).join(' ');
        unit = match[3] || 'pieces';
      } else {
        name = match[1];
        quantity = match[2];
        unit = match[3] || 'pieces';
      }
      break;
      
    case 9: // 3x Bananas
      quantity = match[1];
      name = match[2];
      unit = 'pieces';
      break;
      
    case 10: // Milk (1L)
      name = match[1];
      quantity = match[2];
      unit = match[3] || 'pieces';
      break;
      
    default:
      name = match[1];
      quantity = '1';
      unit = 'pieces';
  }
  
  return {
    name: cleanItemName(name),
    quantity: parseFloat(quantity).toString(),
    unit: normalizeUnit(unit),
    ...(price !== undefined ? { price } : {})
  };
};

export const parseReceiptText = (text) => {
  if (!text || !text.trim()) return [];
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const items = [];
  
  lines.forEach((line, index) => {
    if (shouldSkipLine(line)) return;
    
    let matched = false;
    
    // Try each pattern
    for (let i = 0; i < ITEM_PATTERNS.length; i++) {
      const pattern = ITEM_PATTERNS[i];
      const match = line.match(pattern);
      
      if (match) {
        const item = parseItemFromMatch(match, i);
        
        if (item.name && item.quantity && item.name.length > 1) {
          items.push({
            id: `receipt-${index}-${Date.now()}-${Math.random()}`,
            name: item.name.toLowerCase(),
            quantity: item.quantity,
            unit: item.unit,
            ...(item.price !== undefined ? { price: item.price } : {})
          });
          matched = true;
          break;
        }
      }
    }
    
    // Fallback for unmatched lines that look like items
    if (!matched && line.length > 2 && line.includes('$') && !line.includes('TOTAL')) {
      const name = cleanItemName(line.replace(/\s*\$.*$/, '').replace(/^\d+\s*/, ''));
      if (name && name.length > 2 && !/^[^a-zA-Z]*$/.test(name)) {
        items.push({
          id: `receipt-${index}-${Date.now()}-${Math.random()}`,
          name: name.toLowerCase(),
          quantity: '1',
          unit: 'pieces'
        });
      }
    }
  });
  
  // Combine duplicates: sum quantity for same name+unit, keep latest price
  const combined = {};
  for (const item of items) {
    const key = `${item.name}||${item.unit}`;
    if (!combined[key]) {
      combined[key] = { ...item };
    } else {
      // sum quantities (as numbers)
      combined[key].quantity = (parseFloat(combined[key].quantity) + parseFloat(item.quantity)).toString();

    }
  }
  return Object.values(combined);
}; 