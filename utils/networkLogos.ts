// Utility functions to fetch network logos from CoinGecko API

export interface NetworkLogoData {
  [key: string]: {
    id: string;
    name: string;
    logoUrl: string;
    fallbackUrl?: string;
    small?: string;
    large?: string;
    thumb?: string;
  };
}

// Map of network names to CoinGecko asset platform IDs
const NETWORK_ID_MAP: { [key: string]: string } = {
  'base': 'base',
  'celo': 'celo',
  'lisk': 'lisk', 
  'avalanche': 'avalanche',
  'ethereum': 'ethereum',
  'polygon': 'polygon-pos',
  'arbitrum': 'arbitrum-one',
  'optimism': 'optimistic-ethereum',
  'bsc': 'binance-smart-chain',
  'binance-smart-chain': 'binance-smart-chain',
  'solana': 'solana',
  'fantom': 'fantom',
  'harmony': 'harmony-shard-0',
  'moonriver': 'moonriver',
  'moonbeam': 'moonbeam',
  'aurora': 'aurora',
  'metis': 'metis-andromeda',
  'cronos': 'cronos',
  'fuse': 'fuse',
  'iotex': 'iotex',
  'kucoin': 'kucoin-community-chain',
  'okx': 'okex-chain'
};

// Fallback logo URLs for common networks (can be updated with actual logos)
const FALLBACK_LOGOS: { [key: string]: string } = {
  'base': '/base-square-logo.svg',
  'celo': '/celo.png',
  'lisk': '/lisk-logo.png',
  'avalanche': '/avalanche-logo.svg', // Using local avalanche logo
  'ethereum': '/eth.png',
  'polygon': '/polygon.png',
  'arbitrum': '/arbitrum.png',
  'optimism': '/optimism.png',
  'binance-smart-chain': '/bsc.png',
  'bsc': '/bsc.png',
  'solana': '/solana.png'
};

// Helper function to ensure URL is properly formatted
function ensureValidUrl(url: string): string {
  // If URL starts with //, it's protocol-relative, convert to absolute
  if (url.startsWith('//')) {
    console.warn(`Protocol-relative URL detected: ${url}, converting to HTTPS`);
    return 'https:' + url;
  }
  // If URL doesn't start with http:// or https:// and doesn't start with /, it's likely a malformed URL
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    console.warn(`Potentially malformed URL detected: ${url}, prefixing with /`);
    return '/' + url;
  }
  return url;
}

/**
 * Fetches network logo from CoinGecko API
 * @param networkName - The network name (e.g., 'base', 'celo', 'avalanche')
 * @returns Promise<NetworkLogoData> - Object containing network logo data
 */
export async function fetchNetworkLogo(networkName: string): Promise<NetworkLogoData[string]> {
  // Normalize network name
  const normalizedName = networkName.toLowerCase().replace(/\s+/g, '-');
  const coingeckoId = NETWORK_ID_MAP[normalizedName] || normalizedName;
  
  // Return fallback logo directly to prevent CoinGecko API errors
  const fallbackUrl = FALLBACK_LOGOS[normalizedName] || '/default-network.png';
  const safeFallbackUrl = ensureValidUrl(fallbackUrl);
  return {
    id: coingeckoId,
    name: networkName,
    logoUrl: safeFallbackUrl,
    fallbackUrl: FALLBACK_LOGOS[normalizedName]
  };
}

/**
 * Fetches multiple network logos in batch
 * @param networkNames - Array of network names
 * @returns Promise<NetworkLogoData> - Object with network names as keys and logo data as values
 */
export async function fetchMultipleNetworkLogos(networkNames: string[]): Promise<NetworkLogoData> {
  const result: NetworkLogoData = {};
  
  networkNames.forEach(networkName => {
    const normalizedName = networkName.toLowerCase().replace(/\s+/g, '-');
    const coingeckoId = NETWORK_ID_MAP[normalizedName] || normalizedName;
    const fallbackUrl = FALLBACK_LOGOS[normalizedName] || '/default-network.png';
    const safeFallbackUrl = ensureValidUrl(fallbackUrl);
    
    result[normalizedName] = {
      id: coingeckoId,
      name: networkName,
      logoUrl: safeFallbackUrl,
      fallbackUrl: FALLBACK_LOGOS[normalizedName]
    };
  });
  
  return result;
}

/**
 * Gets the CoinGecko ID for a network name
 * @param networkName - The network name
 * @returns string - The CoinGecko ID
 */
export function getNetworkCoinGeckoId(networkName: string): string {
  const normalizedName = networkName.toLowerCase().replace(/\s+/g, '-');
  return NETWORK_ID_MAP[normalizedName] || normalizedName;
}

/**
 * Preloads network logos for better performance
 * @param networkLogos - Array of logo URLs to preload
 */
export function preloadNetworkLogos(networkLogos: string[]): void {
  if (typeof window === 'undefined') return;
  
  networkLogos.forEach(logoUrl => {
    if (logoUrl && !logoUrl.startsWith('/')) {
      const img = new Image();
      img.src = logoUrl;
    }
  });
}