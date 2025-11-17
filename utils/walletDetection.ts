/**
 * Utility functions for detecting wallet types
 */

export interface WalletInfo {
  name: string;
  isDetected: boolean;
  provider?: any;
}

/**
 * Detect the type of wallet the user is using
 */
export function detectWalletType(): WalletInfo {
  if (typeof window === 'undefined' || !window.ethereum) {
    return {
      name: 'No Wallet',
      isDetected: false
    };
  }

  const provider = window.ethereum;

  // MetaMask detection
  if (provider.isMetaMask) {
    return {
      name: 'MetaMask',
      isDetected: true,
      provider
    };
  }

  // Rabby Wallet detection
  if (provider.isRabby) {
    return {
      name: 'Rabby Wallet',
      isDetected: true,
      provider
    };
  }

  // Coinbase Wallet detection
  if (provider.isCoinbaseWallet || provider.isCoinbase) {
    return {
      name: 'Coinbase Wallet',
      isDetected: true,
      provider
    };
  }

  // Trust Wallet detection
  if (provider.isTrust || provider.isTrustWallet) {
    return {
      name: 'Trust Wallet',
      isDetected: true,
      provider
    };
  }

  // Rainbow Wallet detection
  if (provider.isRainbow) {
    return {
      name: 'Rainbow Wallet',
      isDetected: true,
      provider
    };
  }

  // Frame Wallet detection
  if (provider.isFrame) {
    return {
      name: 'Frame Wallet',
      isDetected: true,
      provider
    };
  }

  // Brave Wallet detection
  if (provider.isBraveWallet) {
    return {
      name: 'Brave Wallet',
      isDetected: true,
      provider
    };
  }

  // Phantom Wallet detection (Solana/Ethereum)
  if (provider.isPhantom) {
    return {
      name: 'Phantom Wallet',
      isDetected: true,
      provider
    };
  }

  // OKX Wallet detection
  if (provider.isOKEx || provider.isOKX) {
    return {
      name: 'OKX Wallet',
      isDetected: true,
      provider
    };
  }

  // Bitget Wallet detection
  if (provider.isBitget) {
    return {
      name: 'Bitget Wallet',
      isDetected: true,
      provider
    };
  }

  // Zerion Wallet detection
  if (provider.isZerion) {
    return {
      name: 'Zerion Wallet',
      isDetected: true,
      provider
    };
  }

  // Generic WalletConnect detection
  if (provider.wc) {
    return {
      name: 'WalletConnect',
      isDetected: true,
      provider
    };
  }

  // Check for other common wallet identifiers
  const walletNames = [
    'imToken', 'TokenPocket', 'MathWallet', 'HuobiWallet',
    'AlphaWallet', 'Status', 'Cipher', 'Toshi', 'CipherBrowser'
  ];

  for (const walletName of walletNames) {
    if (provider[walletName] || provider[`is${walletName}`]) {
      return {
        name: walletName,
        isDetected: true,
        provider
      };
    }
  }

  // Default to generic Ethereum provider
  return {
    name: 'Ethereum Wallet',
    isDetected: true,
    provider
  };
}

/**
 * Check if the user is using a specific wallet
 */
export function isWalletType(walletName: string): boolean {
  const detectedWallet = detectWalletType();
  return detectedWallet.name.toLowerCase().includes(walletName.toLowerCase());
}

/**
 * Check if the user is using Rabby Wallet specifically
 */
export function isRabbyWallet(): boolean {
  return isWalletType('rabby');
}

/**
 * Check if the user is using MetaMask specifically
 */
export function isMetaMask(): boolean {
  return isWalletType('metamask');
}

/**
 * Get a list of all detected wallet providers
 */
export function getWalletProviders(): string[] {
  if (typeof window === 'undefined' || !window.ethereum) {
    return [];
  }

  const provider = window.ethereum;
  const providers: string[] = [];

  // Check for multiple wallet providers
  if (provider.providers && Array.isArray(provider.providers)) {
    provider.providers.forEach((p: any) => {
      if (p.isMetaMask) providers.push('MetaMask');
      if (p.isRabby) providers.push('Rabby Wallet');
      if (p.isCoinbaseWallet || p.isCoinbase) providers.push('Coinbase Wallet');
      if (p.isTrust || p.isTrustWallet) providers.push('Trust Wallet');
      if (p.isRainbow) providers.push('Rainbow Wallet');
      if (p.isFrame) providers.push('Frame Wallet');
      if (p.isBraveWallet) providers.push('Brave Wallet');
      if (p.isPhantom) providers.push('Phantom Wallet');
      if (p.isOKEx || p.isOKX) providers.push('OKX Wallet');
      if (p.isBitget) providers.push('Bitget Wallet');
      if (p.isZerion) providers.push('Zerion Wallet');
    });
  }

  return [...new Set(providers)]; // Remove duplicates
}