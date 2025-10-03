/**
 * Tweet utility functions for handling social sharing with appropriate images
 */

export type TransactionType = 'first-time-saving' | 'subsequent-saving' | 'top-up' | 'withdrawal';

export interface TweetConfig {
  text: string;
  imageUrl?: string;
  referralLink?: string;
}

/**
 * Get the appropriate image URL based on transaction type
 */
export function getTransactionImage(transactionType: TransactionType): string {
  const baseUrl = '/images/tweets/';
  
  switch (transactionType) {
    case 'first-time-saving':
      return `${baseUrl}firsttimesaving.png`;
    case 'subsequent-saving':
      return `${baseUrl}consistent.png`;
    case 'top-up':
      return `${baseUrl}topupsavings.png`;
    case 'withdrawal':
      return `${baseUrl}withdrawcomplete.png`;
    default:
      return `${baseUrl}consistent.png`; // fallback
  }
}

/**
 * Generate tweet configuration for different transaction types
 */
export function generateTweetConfig(
  transactionType: TransactionType,
  options: {
    currency?: string;
    planName?: string;
    amount?: string;
    referralLink?: string;
    isCompleted?: boolean;
  } = {}
): TweetConfig {
  const { currency = 'crypto', planName, amount, referralLink = 'https://bitsave.io', isCompleted = false } = options;
  
  let text = '';
  
  switch (transactionType) {
    case 'first-time-saving':
      text = `Just started my savings journey on @bitsaveprotocol! 🎯 Locked up some ${currency} for my future self - no degen plays today, web3 savings never looked this good 💰\n\nYou should be doing #SaveFi → ${referralLink}`;
      break;
      
    case 'subsequent-saving':
      text = `Staying consistent with my savings on @bitsaveprotocol! 💪 Another ${currency} deposit locked in for my future self. Building wealth one transaction at a time 📈\n\nYou should be doing #SaveFi → ${referralLink}`;
      break;
      
    case 'top-up':
      text = `Just topped up my savings plan${planName ? ` "${planName}"` : ''} on @bitsaveprotocol! 🚀 Adding more ${currency} to reach my goals faster. Consistency is key! 💎\n\nYou should be doing #SaveFi → ${referralLink}`;
      break;
      
    case 'withdrawal':
      if (isCompleted) {
        text = `🎉 GOAL ACHIEVED! Just completed my savings plan${planName ? ` "${planName}"` : ''} on @bitsaveprotocol and withdrew my funds! 🎯 Proof that web3 savings actually works 💰\n\nYou should be doing #SaveFi → ${referralLink}`;
      } else {
        text = `Successfully withdrew from my savings plan${planName ? ` "${planName}"` : ''} on @bitsaveprotocol. Sometimes you need access to your funds - that's the beauty of flexible savings! 💰\n\nYou should be doing #SaveFi → ${referralLink}`;
      }
      break;
      
    default:
      text = `Building my future with @bitsaveprotocol! 💰 Web3 savings made simple and rewarding 🚀\n\nYou should be doing #SaveFi → ${referralLink}`;
  }
  
  return {
    text,
    imageUrl: getTransactionImage(transactionType),
    referralLink
  };
}

/**
 * Create a tweet URL with text and image
 * Note: Twitter doesn't support direct image uploads via URL parameters,
 * but we can include the image URL in the tweet text or use it for display purposes
 */
export function createTweetUrl(config: TweetConfig): string {
  const encodedText = encodeURIComponent(config.text);
  return `https://twitter.com/intent/tweet?text=${encodedText}`;
}

/**
 * Determine if this is a first-time savings transaction
 * This would typically check against user's transaction history
 */
export function isFirstTimeSaving(userTransactionCount: number): boolean {
  return userTransactionCount === 0;
}

/**
 * Generate tweet button component props
 */
export function getTweetButtonProps(
  transactionType: TransactionType,
  options: {
    currency?: string;
    planName?: string;
    amount?: string;
    referralLink?: string;
    isCompleted?: boolean;
    userTransactionCount?: number;
  } = {}
) {
  // For savings transactions, determine if it's first-time or subsequent
  let actualTransactionType = transactionType;
  if (transactionType === 'subsequent-saving' && options.userTransactionCount !== undefined) {
    actualTransactionType = isFirstTimeSaving(options.userTransactionCount) ? 'first-time-saving' : 'subsequent-saving';
  }
  
  const config = generateTweetConfig(actualTransactionType, options);
  const tweetUrl = createTweetUrl(config);
  
  return {
    href: tweetUrl,
    text: config.text,
    imageUrl: config.imageUrl,
    onClick: () => {
      // Optional: Track tweet clicks
      console.log(`Tweet clicked for ${actualTransactionType}`);
    }
  };
}