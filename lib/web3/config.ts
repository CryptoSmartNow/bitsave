export const CHAINS_CONFIG: Record<number, { rpcUrl: string, contracts: { predictionMarketFactory: string, mockUsdc: string } }> = {
    8453: { // Base Mainnet
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org',
        contracts: {
            predictionMarketFactory: process.env.PREDICTION_MARKET_FACTORY_ADDRESS || '0xADBeAF3b2C610fa71003660605087341779f2EE9',
            mockUsdc: process.env.MOCK_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        }
    },
    56: { // BSC Mainnet
        rpcUrl: 'https://binance.llamarpc.com',
        contracts: {
            predictionMarketFactory: '0xADBeAF3b2C610fa71003660605087341779f2EE9',
            mockUsdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        }
    },
    143: { // Monad Mainnet
        rpcUrl: 'https://rpc-monad.xyz', // Update if known, otherwise keep placeholder or assume user will supply/wallet has it
        contracts: {
            predictionMarketFactory: '0xADBeAF3b2C610fa71003660605087341779f2EE9',
            mockUsdc: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603',
        }
    }
};

export const BIZFI_CONFIG = {
    rpcUrl: CHAINS_CONFIG[8453].rpcUrl,
    chainId: 8453,
    contracts: CHAINS_CONFIG[8453].contracts
};
