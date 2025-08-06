import { UNIT_MAPPING, SKIP_LINES } from '../constants/units';

// Flexible patterns to handle various receipt formats and spacing
const ITEM_PATTERNS = [
  // General: 'ITEM_NAME    £PRICE' or 'ITEM_NAME    $PRICE' or 'ITEM_NAME    PRICE'
  /^([A-Z\s-]+?)\s+[$£]?(\d+\.\d{2})$/i,
  // Walmart style: "BANANAS 3143 2.18 lbs @ $0.68/lb $1.48 F"
  /^(.+?)\s+\d+\s+(\d+(?:\.\d+)?)\s*(\w+)?\s*@?\s*\$?\d+(?:\.\d+)?\/?\w*\s+\$(\d+\.\d+)/,
  
  // Target style: "2 Honeycrisp Apples $4.99"
  /^(\d+(?:\.\d+)?)\s+(.+?)\s+\$(\d+\.\d+)/,
  
  // US format with flexible spacing: "MILK                $3.49"
  /^([A-Z][A-Z\s&]+?)\s+\$(\d+\.\d+)$/,
  
  // Mixed case format: "Brown Onions     £0.99"
  /^([A-Za-z][A-Za-z\s&]+?)\s+£(\d+\.\d+)$/,
  
  // Mixed case US format: "Whole Milk       $3.49"
  /^([A-Za-z][A-Za-z\s&]+?)\s+\$(\d+\.\d+)$/,
  
  // Quantity first: "2 APPLES £2.50"
  /^(\d+(?:\.\d+)?)\s+([A-Za-z][A-Za-z\s&]+?)\s+[£$](\d+\.\d+)$/,
  
  // With item codes: "012345 BREAD £1.48"
  /^\d{5,}\s+([A-Za-z][A-Za-z\s&]+?)\s+[£$](\d+\.\d+)$/,
  
  // Weight based: "BANANAS 2.18 lbs @ $0.68/lb $1.48"
  /^([A-Za-z][A-Za-z\s&]+?)\s+(\d+(?:\.\d+)?)\s+(lbs?|kg|oz)\s+@.*[£$](\d+\.\d+)$/i,
  
  // Very flexible fallback: anything with price at end
  /^(.+?)\s+[£$](\d+\.\d+)$/
];

const shouldSkipLine = (line) => {
  return SKIP_LINES.some(skip => line.toUpperCase().includes(skip)) ||
         line.length < 3 || 
         /^\d+$/.test(line) ||
         /^[-=*]+$/.test(line) ||
         /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line) ||
         /^\d{1,2}:\d{2}/.test(line) ||
         line.includes('TOTAL') ||
         line.includes('TAX') ||
         line.includes('CHANGE') ||
         line.includes('CARD') ||
         line.includes('CASH') ||
         line.includes('ITEMS SOLD') ||
         line.includes('CONTACTLESS') ||
         line.includes('APPROVED') ||
         line.includes('***') ||
         /^ST\.\s+\d+/.test(line) ||
         /^NO\.\s+ITEMS/.test(line);
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
    case 1: // Walmart style
      name = match[1];
      quantity = '1';
      unit = 'pieces';
      break;
      
    case 2:
    case 10: // Target/quantity first
      quantity = match[1];
      name = match[2];
      unit = 'pieces';
      break;
      
    case 3:
    case 4:
    case 11: // Generic/item code
      name = match[1];
      quantity = '1';
      unit = 'pieces';
      break;
      
    case 5: // Weight-based
      name = match[1];
      quantity = match[2];
      unit = match[3].toLowerCase();
      break;
      
    case 22: // Quantity x item
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
      
    case 12: // Milk (1L)
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
  
  console.log('🔍 RAW OCR TEXT:');
  console.log('================');
  console.log(text);
  console.log('================');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const items = [];
  
  console.log(`\n📋 Parsing receipt with ${lines.length} lines:`);
  
  lines.forEach((line, index) => {
    console.log(`\nLine ${index}: "${line}"`);
    console.log(`  Length: ${line.length} chars`);
    console.log(`  Characters: ${line.split('').map(c => c === ' ' ? '·' : c).join('')}`);
    
    if (shouldSkipLine(line)) {
      console.log('  ❌ Skipped (skip line rule)');
      return;
    }
    
    let matched = false;
    
    // Try each pattern
    for (let i = 0; i < ITEM_PATTERNS.length; i++) {
      const pattern = ITEM_PATTERNS[i];
      const match = line.match(pattern);
      
      if (match) {
        console.log(`  ✅ Matched pattern ${i}:`, match);
        const item = parseItemFromMatch(match, i);
        
        if (item.name && item.quantity && item.name.length > 1) {
          const newItem = {
            id: `receipt-${index}-${Date.now()}-${Math.random()}`,
            name: item.name.trim(),
            quantity: item.quantity,
            unit: item.unit,
            ...(item.price !== undefined ? { price: item.price } : {})
          });
          matched = true;
          break;
        } else {
          console.log(`  ⚠️ Pattern matched but item invalid:`, item);
        }
      }
    }
    
    if (!matched) {
      console.log('  ❌ No pattern matched');
      
      // Show what patterns we tried
      console.log('  Tried patterns:');
      ITEM_PATTERNS.forEach((pattern, i) => {
        console.log(`    ${i}: ${pattern}`);
      });
    }
  });
  
  // Combine duplicate items by increasing quantity instead of removing them
  const combinedItems = {};
  items.forEach(item => {
    const key = item.name.toLowerCase();
    if (combinedItems[key]) {
      combinedItems[key].quantity = (parseInt(combinedItems[key].quantity) + parseInt(item.quantity)).toString();
    } else {
      combinedItems[key] = { ...item };
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