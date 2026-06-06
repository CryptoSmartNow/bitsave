import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getCache, setCache } from '@/lib/redis';
import BitSaveABI from '@/app/abi/contractABI.js';
import childContractABI from '@/app/abi/childContractABI.js';

const DEBUG = process.env.NODE_ENV === 'development';

// Contract addresses for different networks
const BASE_CONTRACT_ADDRESS_OLD = "0x3593546078eecd0ffd1c19317f53ee565be6ca13";
const BASE_CONTRACT_ADDRESS_NEW = "0x67FFa7a1eb0D05BEaF9dB039c1bD604063040be9";
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";
const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13";
const BSC_CONTRACT_ADDRESS = "0x0C4A310695702ed713BCe816786Fcc31C11fe932";
const AVALANCHE_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";

// Network chain IDs
const BASE_CHAIN_ID = BigInt(8453);
const CELO_CHAIN_ID = BigInt(42220);
const LISK_CHAIN_ID = BigInt(1135);
const BSC_CHAIN_ID = BigInt(56);
const AVALANCHE_CHAIN_ID = BigInt(43114);

// Token mapping for Celo network
const CELO_TOKEN_MAP: Record<string, { name: string; decimals: number; logo: string }> = {
  "0x765de816845861e75a25fca122bb6898b8b1282a": { name: "cUSD", decimals: 18, logo: "/cusd.png" },
  "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3": { name: "USDGLO", decimals: 18, logo: "/usdglo.png" },
  "0xceba9300f2b948710d2653dd7b07f33a8b32118c": { name: "USDC", decimals: 6, logo: "/usdclogo.png" },
  "0x62b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a": { name: "Gooddollar", decimals: 18, logo: "/$g.png" }
};
const AVALANCHE_USDC_E = "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664";

// Network Configurations
const NETWORKS_CONFIG = [
  { chainId: BASE_CHAIN_ID, rpcUrl: 'https://base.publicnode.com', contractAddress: BASE_CONTRACT_ADDRESS_OLD, name: 'Base' },
  { chainId: BASE_CHAIN_ID, rpcUrl: 'https://base.publicnode.com', contractAddress: BASE_CONTRACT_ADDRESS_NEW, name: 'Base' },
  { chainId: CELO_CHAIN_ID, rpcUrl: 'https://forno.celo.org', contractAddress: CELO_CONTRACT_ADDRESS, name: 'Celo' },
  { chainId: LISK_CHAIN_ID, rpcUrl: 'https://rpc.api.lisk.com', contractAddress: LISK_CONTRACT_ADDRESS, name: 'Lisk' },
  { chainId: BSC_CHAIN_ID, rpcUrl: 'https://bsc-dataseed.binance.org/', contractAddress: BSC_CONTRACT_ADDRESS, name: 'BSC' },
  { chainId: AVALANCHE_CHAIN_ID, rpcUrl: 'https://api.avax.network/ext/bc/C/rpc', contractAddress: AVALANCHE_CONTRACT_ADDRESS, name: 'Avalanche' }
];

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  
  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  const cacheKey = `bitsave:savings:${address.toLowerCase()}`;
  
  try {
    // 1. Tick Redis Cache
    const cachedData = await getCache<any>(cacheKey);
    if (cachedData) {
      if (DEBUG) console.log(`Serving savings for ${address} from Redis`);
      return NextResponse.json(cachedData);
    }

    // 2. Fetch Prices 
    let currentEthPrice = 3500;
    let goodDollarPrice = 0.0001086;
    try {
      const priceRes = await fetch(`${request.nextUrl.origin}/api/prices?ids=ethereum,gooddollar`);
      if (priceRes.ok) {
        const prices = await priceRes.json();
        if (prices.ethereum?.usd) currentEthPrice = prices.ethereum.usd;
        if (prices.gooddollar?.usd) goodDollarPrice = prices.gooddollar.usd;
      }
    } catch(e) { console.warn("Failed to fetch internal prices"); }

    // 3. Process Networks in Parallel
    const networkPromises = NETWORKS_CONFIG.map(async (network) => {
      try {
        const provider = new ethers.JsonRpcProvider(network.rpcUrl);
        const contract = new ethers.Contract(network.contractAddress, BitSaveABI, provider);

        let userChildContractAddress;
        try {
          const contractPromise = contract.getUserChildContractAddress({ from: address });
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Contract call timeout')), 10000));
          userChildContractAddress = await Promise.race([contractPromise, timeoutPromise]);
          if (!userChildContractAddress || userChildContractAddress === ethers.ZeroAddress) return null;
        } catch (err) { return null; }

        const childContract = new ethers.Contract(userChildContractAddress, childContractABI, provider);

        const savingsNamesPromise = childContract.getSavingsNames();
        const savingsTimeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Savings names timeout')), 5000));
        let savingsNamesArray: string[] = [];
        try {
          const savingsNamesObj: any = await Promise.race([savingsNamesPromise, savingsTimeoutPromise]);
          if (savingsNamesObj?.savingsNames && Array.isArray(savingsNamesObj.savingsNames)) savingsNamesArray = savingsNamesObj.savingsNames;
          else if (Array.isArray(savingsNamesObj)) {
            if (Array.isArray(savingsNamesObj[0])) savingsNamesArray = savingsNamesObj[0];
            else savingsNamesArray = savingsNamesObj;
          } else if (savingsNamesObj?.savingsNames) savingsNamesArray = savingsNamesObj.savingsNames;
        } catch (err) { return null; }

        if (!savingsNamesArray || savingsNamesArray.length === 0) return null;

        const processedPlanNames = new Set();
        const validSavingNames = savingsNamesArray.filter((savingName: string) => savingName && typeof savingName === "string" && savingName !== "" && !processedPlanNames.has(savingName));

        const BATCH_SIZE = 5;
        const networkPlans = [];
        const networkCompletedPlans = [];
        let networkDeposits = 0;
        let networkTotalUsdValue = 0;
        let networkRewards = 0;

        for (let i = 0; i < validSavingNames.length; i += BATCH_SIZE) {
          const batch = validSavingNames.slice(i, i + BATCH_SIZE);
          const batchPromises = batch.map(async (savingName: string) => {
            try {
              processedPlanNames.add(savingName);
              const savingDataPromise = childContract.getSaving(savingName);
              const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout for ${savingName}`)), 5000));
              const savingData: any = await Promise.race([savingDataPromise, timeoutPromise]);
              return { savingName, savingData };
            } catch (err) { return null; }
          });

          const batchResults = await Promise.allSettled(batchPromises);
          for (const result of batchResults) {
            if (result.status === 'fulfilled' && result.value) {
              const { savingName, savingData } = result.value;
              if (!savingData || !savingData.isValid) continue;

              const tokenId = savingData.tokenId || ethers.ZeroAddress;
              const isEth = tokenId.toLowerCase() === ethers.ZeroAddress.toLowerCase();
              let tokenName = "USDC"; let decimals = 6; let tokenLogo = '/usdclogo.png';

              if (isEth) { tokenName = "ETH"; decimals = 18; tokenLogo = '/eth.png'; }
              else if (network.chainId === CELO_CHAIN_ID) {
                const tokenInfo = CELO_TOKEN_MAP[(tokenId as string).toLowerCase()];
                if (tokenInfo) { tokenName = tokenInfo.name; decimals = tokenInfo.decimals; tokenLogo = tokenInfo.logo; }
                else { tokenName = 'USDGLO'; decimals = 6; tokenLogo = '/usdglo.png'; }
              } else if (network.chainId === BASE_CHAIN_ID) {
                if (tokenId.toLowerCase() === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913") { tokenName = "USDC"; decimals = 6; tokenLogo = '/usdclogo.png'; }
                else if (tokenId.toLowerCase() === "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3") { tokenName = "USDGLO"; decimals = 18; tokenLogo = '/usdglo.png'; }
                else if (tokenId.toLowerCase() === "0x46c85152bfe9f96829aa94755d9f915f9b10ef5f") { tokenName = "cNGN"; decimals = 6; tokenLogo = '/cngn.png'; }
              } else if (network.chainId === LISK_CHAIN_ID) {
                if (tokenId.toLowerCase() === "0xf242275d3a6527d877f2c927a82d9b057609cc71") { tokenName = "USDC"; decimals = 6; tokenLogo = '/usdclogo.png'; }
                else if (tokenId.toLowerCase() === "0x999e3a32ef3f9eabf133186512b5f29fadb8a816") { tokenName = "cNGN"; decimals = 6; tokenLogo = '/cngn.png'; }
              } else if (network.chainId === AVALANCHE_CHAIN_ID) {
                if (tokenId.toLowerCase() === AVALANCHE_USDC_E) { tokenName = 'USDC'; decimals = 6; tokenLogo = '/usdclogo.png'; }
              }

              let amountFormatted = "0";
              try { if (savingData.amount) amountFormatted = ethers.formatUnits(savingData.amount, decimals); } catch (e) { amountFormatted = "0"; }

              const now = Math.floor(Date.now() / 1000);
              const startTime = savingData.startTime ? Number(savingData.startTime) : now;
              const maturityTime = savingData.maturityTime ? Number(savingData.maturityTime) : startTime + (30 * 24 * 60 * 60);

              let progress = 0;
              if (maturityTime <= startTime || now >= maturityTime) progress = 100;
              else progress = Math.min(Math.floor(((now - startTime) / (maturityTime - startTime)) * 100), 100);
              const isCompleted = savingData.isCompleted || progress >= 100;

              const amountVal = parseFloat(amountFormatted);
              let price = 1;
              if (tokenName === "ETH") price = currentEthPrice || 3500;
              if (tokenName === "Gooddollar") price = goodDollarPrice || 0.0001086;
              const usdValue = amountVal * price;
              networkRewards += usdValue * 5;
              networkTotalUsdValue += usdValue;

              const plan = {
                id: savingName, name: savingName, amount: amountFormatted, currentAmount: amountFormatted,
                startTime, maturityTime, isEth, tokenName, tokenLogo, progress,
                status: isCompleted ? 'Completed' : 'Active',
                timeLeft: isCompleted ? 'Completed' : `${Math.ceil((maturityTime - now) / (24 * 60 * 60))} days`,
                penalty: (savingData.penaltyPercentage ?? savingData[5] ?? 0).toString(),
                penaltyPercentage: Number(savingData.penaltyPercentage ?? savingData[5] ?? 0),
                network: network.name, chainId: Number(network.chainId), contractAddress: network.contractAddress
              };

              if (isCompleted) networkCompletedPlans.push(plan);
              else networkPlans.push(plan);
              networkDeposits++;
            }
          }
        }
        return { plans: networkPlans, completedPlans: networkCompletedPlans, deposits: networkDeposits, totalUsdValue: networkTotalUsdValue, rewards: networkRewards };
      } catch (error) { return null; }
    });

    const results = await Promise.allSettled(networkPromises);
    let aggregatedPlans: any[] = [];
    let aggregatedCompletedPlans: any[] = [];
    let aggregatedDeposits = 0;
    let aggregatedTotalUsdValue = 0;
    let aggregatedRewards = 0;

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        aggregatedPlans = [...aggregatedPlans, ...result.value.plans];
        aggregatedCompletedPlans = [...aggregatedCompletedPlans, ...result.value.completedPlans];
        aggregatedDeposits += result.value.deposits;
        aggregatedTotalUsdValue += result.value.totalUsdValue;
        aggregatedRewards += (result.value as any).rewards || 0;
      }
    });

    const finalData = {
      totalLocked: aggregatedTotalUsdValue.toFixed(2),
      deposits: aggregatedDeposits,
      rewards: aggregatedRewards.toFixed(0),
      currentPlans: aggregatedPlans,
      completedPlans: aggregatedCompletedPlans
    };

    // Cache in Redis for 120 seconds
    await setCache(cacheKey, finalData, 120);

    return NextResponse.json(finalData);
  } catch (error: any) {
    console.error("Error fetching savings data in API route:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch savings data" }, { status: 500 });
  }
}
