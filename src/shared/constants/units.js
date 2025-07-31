export const UNITS = [
  'cups', 'tbsp', 'tsp', 'oz', 'lbs', 'grams', 'kg', 'ml', 'liters', 
  'pieces', 'cloves', 'bunches', 'cans', 'bottles', 'boxes', 'bags'
];

export const UNIT_MAPPING = {
  'l': 'liters', 'lt': 'liters', 'ltr': 'liters', 'gallon': 'liters', 'gal': 'liters',
  'ml': 'ml', 'g': 'grams', 'kg': 'kg', 'kgs': 'kg', 'kilogram': 'kg',
  'lb': 'lbs', 'lbs': 'lbs', 'pound': 'lbs', 'pounds': 'lbs',
  'oz': 'oz', 'ounce': 'oz', 'ounces': 'oz',
  'pcs': 'pieces', 'pc': 'pieces', 'ea': 'pieces', 'each': 'pieces',
  'ct': 'pieces', 'count': 'pieces', 'pack': 'pieces', 'pkg': 'pieces',
  'can': 'cans', 'cans': 'cans', 'bottle': 'bottles', 'bottles': 'bottles',
  'box': 'boxes', 'boxes': 'boxes', 'bag': 'bags', 'bags': 'bags'
};

export const SKIP_LINES = [
  'SUBTOTAL', 'TOTAL', 'TAX', 'RECEIPT', 'THANK YOU', 'STORE', 'ADDRESS', 
  'PHONE', 'CASH', 'CARD', 'CHANGE', 'CREDIT', 'DEBIT', 'BALANCE DUE',
  'CASHIER', 'REGISTER', 'TRANSACTION', 'DATE', 'TIME', 'STORE #',
  'REWARDS', 'SAVINGS', 'DISCOUNT', 'COUPON', 'REFUND', 'TENDER',
  'WELCOME', 'VISIT', 'SURVEY', 'FEEDBACK', 'BARCODE', 'SCAN',
  'CUSTOMER', 'MEMBER', 'ACCOUNT', 'POINTS', 'MILES', 'FUEL'
]; 