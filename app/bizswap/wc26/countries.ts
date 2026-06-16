export interface CountryData {
  name: string;
  code: string;
  currency: string;
  symbol: string;
  flag: string;
}

export const ONSWITCH_COUNTRIES: CountryData[] = [
  { name: 'Nigeria', code: 'NG', currency: 'NGN', symbol: '₦', flag: '🇳🇬' }
];
