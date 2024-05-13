export function smallUnit(unit) {
  return {
    gram: 'g',
    kilo: 'g',
    pound: 'oz',
    ounce: 'oz'
  }[unit];
}

export function largeUnit(unit) {
  return {
    gram: 'kg',
    kilo: 'kg',
    pound: 'lb',
    ounce: 'lb'
  }[unit];
}
