const CARD_BRANDS = [
  {
    brand: "amex",
    bins: [/^34/, /^37/],
    lengths: [15],
    cvvLength: 4,
    luhn: true
  },
  {
    brand: "diners",
    bins: [/^30[0-5]/, /^36/, /^38/],
    lengths: [14],
    cvvLength: 3,
    luhn: true
  },
  {
    brand: "jcb",
    bins: [/^35(2[89]|[3-8][0-9])/],
    lengths: [16],
    cvvLength: 3,
    luhn: true
  },
  {
    brand: "elo",
    bins: [
      /^4011/, /^4312/, /^4389/, /^4514/, /^4576/,
      /^5041/, /^5067/, /^5090/,
      /^6277/, /^6362/, /^6363/,
      /^6504/, /^6505/, /^6509/,
      /^6516/, /^6550/
    ],
    lengths: [16],
    cvvLength: 3,
    luhn: true
  },
  {
    brand: "hipercard",
    bins: [/^6062/],
    lengths: [16],
    cvvLength: 3,
    luhn: true
  },
  {
    brand: "cabal",
    bins: [/^6042/],
    lengths: [16],
    cvvLength: 3,
    luhn: true
  },
  {
    brand: "banescard",
    bins: [/^6361/],
    lengths: [16],
    cvvLength: 3,
    luhn: true
  },
  {
    brand: "discover",
    bins: [
      /^6011/,
      /^65/,
      /^64[4-9]/,
      /^622(12[6-9]|1[3-9]|[2-8][0-9]|9[0-1]|92[0-5])/
    ],
    lengths: [16],
    cvvLength: 3,
    luhn: true
  },
  {
    brand: "mastercard",
    bins: [
      /^5[1-5]/,
      /^2(2[2-9][1-9]|[3-6][0-9]{2}|7([01][0-9]|20))/
    ],
    lengths: [16],
    cvvLength: 3,
    luhn: true
  },
  {
    brand: "visa",
    bins: [/^4/],
    lengths: [13, 16, 19],
    cvvLength: 3,
    luhn: true
  }
];

const BIN_CACHE = {};

function luhnCheck(cardNumber) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function detectCard(cardNumberRaw) {
  const number = cardNumberRaw.replace(/\D/g, "");
  if (!number) {
    return { valid: false, brand: null, reason: "empty", confidence: 0 };
  }
  let detectedBrand = null;
  for (const card of CARD_BRANDS) {
    for (const pattern of card.bins) {
      if (pattern.test(number)) {
        detectedBrand = card;
        break;
      }
    }
    if (detectedBrand) break;
  }
  if (!detectedBrand) {
    return { valid: false, brand: "unknown", reason: "brand_not_found", confidence: 0 };
  }
  const lengthValid = detectedBrand.lengths.includes(number.length);
  const luhnValid = detectedBrand.luhn ? luhnCheck(number) : true;
  let confidence = 0;
  if (number.length >= 6) confidence += 40;
  else if (number.length >= 4) confidence += 20;
  else if (number.length >= 1) confidence += 10;
  if (lengthValid) confidence += 30;
  if (luhnValid && number.length >= 13) confidence += 30;
  return {
    valid: lengthValid && luhnValid,
    brand: detectedBrand.brand,
    cvvLength: detectedBrand.cvvLength,
    length: number.length,
    reason: !lengthValid ? "invalid_length" : !luhnValid ? "luhn_failed" : null,
    confidence: Math.min(confidence, 100)
  };
}

async function lookupBin(bin) {
  if (BIN_CACHE[bin]) return BIN_CACHE[bin];
  try {
    const res = await fetch(`https://lookup.binlist.net/${bin}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      const result = {
        brand: data.scheme?.toLowerCase() || null,
        bank: data.bank?.name || null,
        country: data.country?.name || null,
        countryCode: data.country?.alpha2 || null,
        type: data.type || null
      };
      BIN_CACHE[bin] = result;
      return result;
    }
  } catch (e) {}
  return null;
}

async function tokenizeCard(cardData) {
  const res = await fetch('/api/tokenize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
    },
    body: JSON.stringify(cardData)
  });
  if (!res.ok) throw new Error('Tokenization failed');
  return res.json();
}

if (typeof window !== 'undefined') {
  window.CardEngine = { CARD_BRANDS, luhnCheck, detectCard, lookupBin, tokenizeCard, BIN_CACHE };
}
