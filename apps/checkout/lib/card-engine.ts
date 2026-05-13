export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'diners' | 'unknown'

const BRANDS: { brand: CardBrand; pattern: RegExp }[] = [
  { brand: 'amex',      pattern: /^3[47]/ },
  { brand: 'diners',    pattern: /^3(?:0[0-5]|[68])/ },
  { brand: 'elo',       pattern: /^(4011|431274|438935|451416|457393|4576|457631|457632|504175|627780|636297|636368|6363686)/ },
  { brand: 'hipercard', pattern: /^(606282|3841)/ },
  { brand: 'mastercard',pattern: /^5[1-5]|^2(2[2-9][1-9]|[3-6]\d{2}|7\d|720)/ },
  { brand: 'visa',      pattern: /^4/ },
]

export function detectBrand(number: string): CardBrand {
  const clean = number.replace(/\D/g, '')
  return BRANDS.find(b => b.pattern.test(clean))?.brand ?? 'unknown'
}

export function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 16)
  return clean.replace(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 4)
  return clean.length >= 2 ? clean.slice(0, 2) + '/' + clean.slice(2) : clean
}

export function validateLuhn(number: string): boolean {
  const digits = number.replace(/\D/g, '').split('').reverse().map(Number)
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 !== 0) d *= 2
    if (d > 9) d -= 9
    return acc + d
  }, 0)
  return sum % 10 === 0
}
