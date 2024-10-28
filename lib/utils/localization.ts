const CURRENCY_FORMATS: Record<string, { currency: string, locale: string }> = {
  'US': { currency: 'USD', locale: 'en-US' },
  'UK': { currency: 'GBP', locale: 'en-GB' },
  'CA': { currency: 'CAD', locale: 'en-CA' },
  'AU': { currency: 'AUD', locale: 'en-AU' },
  'IN': { currency: 'INR', locale: 'en-IN' },
  'JP': { currency: 'JPY', locale: 'ja-JP' },
  'DE': { currency: 'EUR', locale: 'de-DE' },
  'FR': { currency: 'EUR', locale: 'fr-FR' },
  'IT': { currency: 'EUR', locale: 'it-IT' },
  'ES': { currency: 'EUR', locale: 'es-ES' }
};

const WEIGHT_FORMATS: Record<string, { unit: 'g' | 'oz', conversion: number }> = {
  'US': { unit: 'oz', conversion: 0.035274 },
  'UK': { unit: 'g', conversion: 1 },
  'CA': { unit: 'g', conversion: 1 },
  'AU': { unit: 'g', conversion: 1 },
  'IN': { unit: 'g', conversion: 1 },
  'JP': { unit: 'g', conversion: 1 },
  'DE': { unit: 'g', conversion: 1 },
  'FR': { unit: 'g', conversion: 1 },
  'IT': { unit: 'g', conversion: 1 },
  'ES': { unit: 'g', conversion: 1 }
};

export const formatCurrency = (amount: number, location: string): string => {
  const format = CURRENCY_FORMATS[location] || CURRENCY_FORMATS['US'];
  return new Intl.NumberFormat(format.locale, {
    style: 'currency',
    currency: format.currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatWeight = (grams: number, location: string): string => {
  const format = WEIGHT_FORMATS[location] || WEIGHT_FORMATS['US'];
  const converted = grams * format.conversion;
  return `${converted.toFixed(1)}${format.unit}`;
};

export const convertCurrency = async (amount: number, fromLocation: string, toLocation: string): Promise<number> => {
  // In a real app, you would fetch current exchange rates from an API
  // For now, using mock conversion rates
  const mockRates: Record<string, number> = {
    'USD': 1,
    'GBP': 0.79,
    'CAD': 1.35,
    'AUD': 1.52,
    'INR': 83.12,
    'JPY': 149.42,
    'EUR': 0.92
  };

  const fromCurrency = CURRENCY_FORMATS[fromLocation].currency;
  const toCurrency = CURRENCY_FORMATS[toLocation].currency;
  
  const inUSD = amount / (mockRates[fromCurrency] || 1);
  return inUSD * (mockRates[toCurrency] || 1);
};
