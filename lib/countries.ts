export interface CountryData {
  name: string;
  code: string;
  currency: string;
  symbol: string;
  flag: string;
}

export const ONSWITCH_COUNTRIES: CountryData[] = [
  // Africa
  { name: 'Cameroon', code: 'CM', currency: 'XAF', symbol: 'FCFA', flag: '🇨🇲' },
  { name: "Côte d'Ivoire", code: 'CI', currency: 'XOF', symbol: 'CFA', flag: '🇨🇮' },
  { name: 'Ethiopia', code: 'ET', currency: 'ETB', symbol: 'Br', flag: '🇪🇹' },
  { name: 'Ghana', code: 'GH', currency: 'GHS', symbol: 'GH₵', flag: '🇬🇭' },
  { name: 'Kenya', code: 'KE', currency: 'KES', symbol: 'KSh', flag: '🇰🇪' },
  { name: 'Nigeria', code: 'NG', currency: 'NGN', symbol: '₦', flag: '🇳🇬' },
  { name: 'Republic of Congo', code: 'CG', currency: 'XAF', symbol: 'FCFA', flag: '🇨🇬' },
  { name: 'Rwanda', code: 'RW', currency: 'RWF', symbol: 'FRw', flag: '🇷🇼' },
  { name: 'Senegal', code: 'SN', currency: 'XOF', symbol: 'CFA', flag: '🇸🇳' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR', symbol: 'R', flag: '🇿🇦' },
  { name: 'Uganda', code: 'UG', currency: 'UGX', symbol: 'USh', flag: '🇺🇬' },

  // Europe (EUR zone)
  { name: 'Andorra', code: 'AD', currency: 'EUR', symbol: '€', flag: '🇦🇩' },
  { name: 'Austria', code: 'AT', currency: 'EUR', symbol: '€', flag: '🇦🇹' },
  { name: 'Belgium', code: 'BE', currency: 'EUR', symbol: '€', flag: '🇧🇪' },
  { name: 'Bulgaria', code: 'BG', currency: 'EUR', symbol: '€', flag: '🇧🇬' },
  { name: 'Croatia', code: 'HR', currency: 'EUR', symbol: '€', flag: '🇭🇷' },
  { name: 'Czech Republic', code: 'CZ', currency: 'EUR', symbol: '€', flag: '🇨🇿' },
  { name: 'Denmark', code: 'DK', currency: 'EUR', symbol: '€', flag: '🇩🇰' },
  { name: 'Estonia', code: 'EE', currency: 'EUR', symbol: '€', flag: '🇪🇪' },
  { name: 'Finland', code: 'FI', currency: 'EUR', symbol: '€', flag: '🇫🇮' },
  { name: 'France', code: 'FR', currency: 'EUR', symbol: '€', flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', currency: 'EUR', symbol: '€', flag: '🇩🇪' },
  { name: 'Greece', code: 'GR', currency: 'EUR', symbol: '€', flag: '🇬🇷' },
  { name: 'Hungary', code: 'HU', currency: 'EUR', symbol: '€', flag: '🇭🇺' },
  { name: 'Iceland', code: 'IS', currency: 'EUR', symbol: '€', flag: '🇮🇸' },
  { name: 'Ireland', code: 'IE', currency: 'EUR', symbol: '€', flag: '🇮🇪' },
  { name: 'Italy', code: 'IT', currency: 'EUR', symbol: '€', flag: '🇮🇹' },
  { name: 'Latvia', code: 'LV', currency: 'EUR', symbol: '€', flag: '🇱🇻' },
  { name: 'Liechtenstein', code: 'LI', currency: 'EUR', symbol: '€', flag: '🇱🇮' },
  { name: 'Lithuania', code: 'LT', currency: 'EUR', symbol: '€', flag: '🇱🇹' },
  { name: 'Luxembourg', code: 'LU', currency: 'EUR', symbol: '€', flag: '🇱🇺' },
  { name: 'Malta', code: 'MT', currency: 'EUR', symbol: '€', flag: '🇲🇹' },
  { name: 'Monaco', code: 'MC', currency: 'EUR', symbol: '€', flag: '🇲🇨' },
  { name: 'Netherlands', code: 'NL', currency: 'EUR', symbol: '€', flag: '🇳🇱' },
  { name: 'Norway', code: 'NO', currency: 'EUR', symbol: '€', flag: '🇳🇴' },
  { name: 'Poland', code: 'PL', currency: 'EUR', symbol: '€', flag: '🇵🇱' },
  { name: 'Portugal', code: 'PT', currency: 'EUR', symbol: '€', flag: '🇵🇹' },
  { name: 'Romania', code: 'RO', currency: 'EUR', symbol: '€', flag: '🇷🇴' },
  { name: 'San Marino', code: 'SM', currency: 'EUR', symbol: '€', flag: '🇸🇲' },
  { name: 'Slovakia', code: 'SK', currency: 'EUR', symbol: '€', flag: '🇸🇰' },
  { name: 'Slovenia', code: 'SI', currency: 'EUR', symbol: '€', flag: '🇸🇮' },
  { name: 'Spain', code: 'ES', currency: 'EUR', symbol: '€', flag: '🇪🇸' },
  { name: 'Sweden', code: 'SE', currency: 'EUR', symbol: '€', flag: '🇸🇪' },
  { name: 'Switzerland', code: 'CH', currency: 'EUR', symbol: '€', flag: '🇨🇭' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP', symbol: '£', flag: '🇬🇧' },
  { name: 'Vatican City', code: 'VA', currency: 'EUR', symbol: '€', flag: '🇻🇦' },

  // Asia
  { name: 'Australia', code: 'AU', currency: 'AUD', symbol: 'A$', flag: '🇦🇺' },
  { name: 'China', code: 'CN', currency: 'CNY', symbol: '¥', flag: '🇨🇳' },
  { name: 'Hong Kong', code: 'HK', currency: 'HKD', symbol: 'HK$', flag: '🇭🇰' },
  { name: 'India', code: 'IN', currency: 'INR', symbol: '₹', flag: '🇮🇳' },
  { name: 'Singapore', code: 'SG', currency: 'SGD', symbol: 'S$', flag: '🇸🇬' },
  { name: 'South Korea', code: 'KR', currency: 'KRW', symbol: '₩', flag: '🇰🇷' },

  // Other
  { name: 'Argentina', code: 'AR', currency: 'ARS', symbol: '$', flag: '🇦🇷' },
  { name: 'United Arab Emirates', code: 'AE', currency: 'AED', symbol: 'د.إ', flag: '🇦🇪' },
  { name: 'United States', code: 'US', currency: 'USD', symbol: '$', flag: '🇺🇸' },
];
