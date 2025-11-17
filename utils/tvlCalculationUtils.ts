interface SavingCreatedEvent {
  type: string;
  walletAddress?: string;
  userAgent?: string;
  data: {
    amount?: string;
    currency?: string;
    chain?: string;
    planName?: string;
    endDate?: string;
    maturityDate?: string;
    penalty?: string;
    txHash?: string;
    url?: string;
  };
  id: string;
  timestamp: string;
  sessionId: string;
  ip?: string;
}

interface ChainTVL {
  chain: string;
  totalValue: number;
  savingsCount: number;
  currencies: Record<string, number>;
}

interface TVLSummary {
  totalTVL: number;
  chainBreakdown: ChainTVL[];
  totalSavings: number;
  lastUpdated: string;
}

export async function calculateTVLFromUserInteractions(): Promise<TVLSummary> {
  try {
    console.log('🔍 Starting TVL calculation from user interactions...');
    
    // Fetch all user interactions
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://bitsave.io' 
      : 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/user-interactions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user interactions: ${response.status}`);
    }
    
    const interactions: SavingCreatedEvent[] = await response.json();
    console.log(`📊 Fetched ${interactions.length} total interactions`);
    
    // Filter for savings_created events only
    const savingsEvents = interactions.filter(
      (interaction) => interaction.type === 'savings_created'
    );
    
    console.log(`💰 Found ${savingsEvents.length} savings creation events`);
    
    // Group by chain and calculate totals
    const chainTotals: Record<string, ChainTVL> = {};
    
    savingsEvents.forEach((event, index) => {
      const { amount, currency, chain } = event.data;
      
      // Skip events without required data
      if (!amount || !currency || !chain) {
        console.warn('Skipping event with missing data:', event.id);
        return;
      }
      
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        console.warn('Skipping event with invalid amount:', amount, event.id);
        return;
      }
      
      console.log(`📈 Processing savings #${index + 1}: ${amount} ${currency} on ${chain}`);
      
      // Normalize chain name
      const normalizedChain = chain.toLowerCase();
      
      // Initialize chain data if not exists
      if (!chainTotals[normalizedChain]) {
        chainTotals[normalizedChain] = {
          chain: normalizedChain,
          totalValue: 0,
          savingsCount: 0,
          currencies: {}
        };
      }
      
      // Add to totals
      chainTotals[normalizedChain].totalValue += numericAmount;
      chainTotals[normalizedChain].savingsCount += 1;
      
      // Track by currency
      const normalizedCurrency = currency.toUpperCase();
      if (!chainTotals[normalizedChain].currencies[normalizedCurrency]) {
        chainTotals[normalizedChain].currencies[normalizedCurrency] = 0;
      }
      chainTotals[normalizedChain].currencies[normalizedCurrency] += numericAmount;
    });
    
    // Convert to array and calculate overall totals
    const chainBreakdown = Object.values(chainTotals);
    const totalTVL = chainBreakdown.reduce((sum, chain) => sum + chain.totalValue, 0);
    const totalSavings = chainBreakdown.reduce((sum, chain) => sum + chain.savingsCount, 0);
    
    console.log('🎯 TVL Calculation Results:');
    console.log(`   Total TVL: $${totalTVL.toLocaleString()}`);
    console.log(`   Total Savings: ${totalSavings}`);
    console.log('   Chain Breakdown:');
    chainBreakdown.forEach(chain => {
      console.log(`     ${chain.chain}: $${chain.totalValue.toLocaleString()} (${chain.savingsCount} savings)`);
    });
    
    const result: TVLSummary = {
      totalTVL,
      chainBreakdown,
      totalSavings,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('TVL Calculation Result:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error calculating TVL from user interactions:', error);
    
    // Return empty result on error
    return {
      totalTVL: 0,
      chainBreakdown: [],
      totalSavings: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

export function formatTVLForDisplay(tvlSummary: TVLSummary): {
  totalTVL: string;
  chainBreakdown: Array<{
    chain: string;
    displayName: string;
    totalValue: string;
    savingsCount: number;
    currencies: Array<{ currency: string; amount: string }>;
  }>;
  totalSavings: string;
} {
  const chainDisplayNames: Record<string, string> = {
    'celo': 'Celo',
    'lisk': 'Lisk',
    'base': 'Base'
  };
  
  return {
    totalTVL: tvlSummary.totalTVL.toFixed(2),
    chainBreakdown: tvlSummary.chainBreakdown.map(chain => ({
      chain: chain.chain,
      displayName: chainDisplayNames[chain.chain] || chain.chain.charAt(0).toUpperCase() + chain.chain.slice(1),
      totalValue: chain.totalValue.toFixed(2),
      savingsCount: chain.savingsCount,
      currencies: Object.entries(chain.currencies).map(([currency, amount]) => ({
        currency,
        amount: amount.toFixed(2)
      }))
    })),
    totalSavings: tvlSummary.totalSavings.toString()
  };
}