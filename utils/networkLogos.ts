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
  'base': '/base.png',
  'celo': '/celo.png',
  'lisk': '/lisk-logo.png',
  'avalanche': '/eth.png', // Using ETH logo as fallback for Avalanche
  'ethereum': '/eth.png',
  'polygon': '/polygon.png',
  'arbitrum': '/arbitrum.png',
  'optimism': '/optimism.png',
  'binance-smart-chain': '/bnb.png',
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
  try {
    // Normalize network name
    const normalizedName = networkName.toLowerCase().replace(/\s+/g, '-');
    const coingeckoId = NETWORK_ID_MAP[normalizedName] || normalizedName;
    
    // Try to fetch from CoinGecko asset platforms endpoint
    const response = await fetch(`https://api.coingecko.com/api/v3/asset_platforms`);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const assetPlatforms = await response.json();
    
    // Find the matching network
    const platform = assetPlatforms.find((platform: any) => 
      platform.id === coingeckoId || 
      platform.name.toLowerCase() === normalizedName ||
      platform.shortname?.toLowerCase() === normalizedName
    );
    
    if (platform && platform.image) {
      const logoUrl = ensureValidUrl(platform.image.small || platform.image.thumb || platform.image.large);
      console.log(`Found CoinGecko logo for ${networkName}: ${logoUrl}`);
      return {
        id: platform.id,
        name: platform.name,
        logoUrl: logoUrl,
        fallbackUrl: FALLBACK_LOGOS[normalizedName],
        small: platform.image.small,
        large: platform.image.large,
        thumb: platform.image.thumb
      };
    }
    
    // If not found in asset platforms, try to fetch the native coin data
    if (platform && platform.native_coin_id) {
      const coinResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${platform.native_coin_id}`);
      
      if (coinResponse.ok) {
        const coinData = await coinResponse.json();
        if (coinData.image) {
          return {
            id: platform.id,
            name: platform.name,
            logoUrl: coinData.image.small || coinData.image.thumb,
            fallbackUrl: FALLBACK_LOGOS[normalizedName],
            small: coinData.image.small,
            large: coinData.image.large,
            thumb: coinData.image.thumb
          };
        }
      }
    }
    
    // Return fallback if CoinGecko data is not available
    const fallbackUrl = FALLBACK_LOGOS[normalizedName] || '/default-network.png';
    console.log(`Using fallback for ${networkName}: ${fallbackUrl}`);
    const safeFallbackUrl = ensureValidUrl(fallbackUrl);
    return {
      id: coingeckoId,
      name: networkName,
      logoUrl: safeFallbackUrl,
      fallbackUrl: FALLBACK_LOGOS[normalizedName]
    };
    
  } catch (error) {
    console.error('Error fetching network logo from CoinGecko:', error);
    
    // Return fallback logo on error
    const fallbackId = networkName.toLowerCase().replace(/\s+/g, '-');
    const fallbackUrl = FALLBACK_LOGOS[fallbackId] || '/default-network.png';
    console.log(`Error fallback for ${networkName}: ${fallbackUrl}`);
    const safeFallbackUrl = ensureValidUrl(fallbackUrl);
    return {
      id: fallbackId,
      name: networkName,
      logoUrl: safeFallbackUrl,
      fallbackUrl: FALLBACK_LOGOS[fallbackId]
    };
  }
}

/**
 * Fetches multiple network logos in batch
 * @param networkNames - Array of network names
 * @returns Promise<NetworkLogoData> - Object with network names as keys and logo data as values
 */
export async function fetchMultipleNetworkLogos(networkNames: string[]): Promise<NetworkLogoData> {
  try {
    // Fetch all asset platforms once for efficiency
    const response = await fetch('https://api.coingecko.com/api/v3/asset_platforms');
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const assetPlatforms = await response.json();
    
    const result: NetworkLogoData = {};
    
    networkNames.forEach(networkName => {
      const normalizedName = networkName.toLowerCase().replace(/\s+/g, '-');
      const coingeckoId = NETWORK_ID_MAP[normalizedName] || normalizedName;
      
      const platform = assetPlatforms.find((platform: any) => 
        platform.id === coingeckoId || 
        platform.name.toLowerCase() === normalizedName ||
        platform.shortname?.toLowerCase() === normalizedName
      );
      
      if (platform && platform.image) {
        const logoUrl = ensureValidUrl(platform.image.small || platform.image.thumb || platform.image.large);
        console.log(`Batch found CoinGecko logo for ${networkName}: ${logoUrl}`);
        result[normalizedName] = {
          id: platform.id,
          name: platform.name,
          logoUrl: logoUrl,
          fallbackUrl: FALLBACK_LOGOS[normalizedName],
          small: platform.image.small,
          large: platform.image.large,
          thumb: platform.image.thumb
        };
      } else {
        const fallbackUrl = FALLBACK_LOGOS[normalizedName] || '/default-network.png';
        console.log(`Batch fallback for ${networkName}: ${fallbackUrl}`);
        result[normalizedName] = {
          id: coingeckoId,
          name: networkName,
          logoUrl: fallbackUrl,
          fallbackUrl: FALLBACK_LOGOS[normalizedName]
        };
      }
    });
    
    return result;
    
  } catch (error) {
    console.error('Error fetching multiple network logos:', error);
    
    // Return fallback logos on error
    const result: NetworkLogoData = {};
    networkNames.forEach(networkName => {
      const normalizedName = networkName.toLowerCase().replace(/\s+/g, '-');
      const fallbackUrl = FALLBACK_LOGOS[normalizedName] || '/default-network.png';
      console.log(`Batch error fallback for ${networkName}: ${fallbackUrl}`);
      const safeFallbackUrl = ensureValidUrl(fallbackUrl);
      result[normalizedName] = {
        id: normalizedName,
        name: networkName,
        logoUrl: safeFallbackUrl,
        fallbackUrl: FALLBACK_LOGOS[normalizedName]
      };
    });
    return result;
  }
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