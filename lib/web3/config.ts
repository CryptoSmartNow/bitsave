export const BIZFI_CONFIG = {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org',
    chainId: 8453,
    contracts: {
        // TODO: Update with actual factory address
        predictionMarketFactory: process.env.PREDICTION_MARKET_FACTORY_ADDRESS || '0xADBeAF3b2C610fa71003660605087341779f2EE9',
        // Default to Base USDC, but allow override for MockUSDC
        mockUsdc: process.env.MOCK_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    }
};
