import { ethers } from 'ethers';
import axios from 'axios';
import CONTRACT_ABI from '@/app/abi/contractABI.js';
import erc20ABIFile from '@/app/abi/erc20ABI.json';
const erc20ABI = erc20ABIFile.abi;
import { getSavingFeeFromContract } from '@/utils/contractUtils';

const CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13"
const BASE_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33"
const BSC_CONTRACT_ADDRESS = "0x0C4A310695702ed713BCe816786Fcc31C11fe932"
const AVALANCHE_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33"
const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13"

export type NetworkToken = {
    symbol: string;
    address: string;
    decimals: number;
};

export type NetworkConfig = {
    id: string;         // internal key, e.g. 'base'
    name: string;       // display name
    chainId: number;
    contractAddress: string;
    tokens: NetworkToken[];
    isComingSoon?: boolean;
};

export const NETWORKS: NetworkConfig[] = [
    {
        id: 'base',
        name: 'Base',
        chainId: 8453,
        contractAddress: CONTRACT_ADDRESS,
        tokens: [
            { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 }, // Correct Base USDC address
            { symbol: 'USDGLO', address: '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3', decimals: 18 },
            { symbol: 'cNGN', address: '0x46C85152bFe9f96829aA94755D9f915F9B10EF5F', decimals: 6 },
        ],
    },
    {
        id: 'celo',
        name: 'Celo',
        chainId: 42220,
        contractAddress: CELO_CONTRACT_ADDRESS,
        tokens: [
            { symbol: 'USDGLO', address: '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3', decimals: 18 },
            { symbol: 'cUSD', address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', decimals: 18 },
            { symbol: 'USDC', address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', decimals: 6 },
            { symbol: 'Gooddollar', address: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', decimals: 18 },
        ],
    },
    {
        id: 'bsc',
        name: 'BSC',
        chainId: 56,
        contractAddress: BSC_CONTRACT_ADDRESS,
        tokens: [
            { symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
            { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
        ],
    },
    {
        id: 'lisk',
        name: 'Lisk',
        chainId: 1135,
        contractAddress: LISK_CONTRACT_ADDRESS,
        tokens: [
            { symbol: 'USDC', address: '0xf242275d3a6527d877f2c927a82d9b057609cc71', decimals: 6 },
            { symbol: 'cNGN', address: '0x999E3A32eF3F9EAbF133186512b5F29fADB8a816', decimals: 6 },
        ],
    },
    {
        id: 'avalanche',
        name: 'Avalanche',
        chainId: 43114,
        contractAddress: AVALANCHE_CONTRACT_ADDRESS,
        tokens: [
            // USDC.e on Avalanche C-Chain
            { symbol: 'USDC', address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', decimals: 6 },
        ],
    },
    {
        id: 'solana',
        name: 'Solana',
        chainId: 0, // Placeholder - Solana uses different chain identification
        contractAddress: '', // Coming soon - no contract yet
        tokens: [
            { symbol: 'SOL', address: '', decimals: 9 },
            { symbol: 'USDC', address: '', decimals: 6 },
            { symbol: 'USDT', address: '', decimals: 6 },
        ],
        isComingSoon: true,
    },
];

// --- Unified createSavingsGeneric implementation ---
export const createSavingsGeneric = async ({
    networkId,
    tokenSymbol,
    planName,
    amountRaw,
    maturity,
    penalty,
    safeMode = false,
    providerOverride = undefined,
    signerOverride = undefined,
    address,
    additionalOptions = {}
}: {
    networkId: string;
    tokenSymbol: string;
    planName: string;
    amountRaw: string;
    maturity: number;
    penalty: number;
    safeMode?: boolean;
    providerOverride?: any;
    signerOverride?: any;
    address: string;
    additionalOptions?: any;
}) => {
    const network = NETWORKS.find(n => n.id === networkId);
    if (!network) throw new Error('Invalid network selected.');
    const tokenObj = network.tokens.find(t => t.symbol === tokenSymbol);
    if (!tokenObj || !tokenObj.address) throw new Error('Invalid or missing token address for selected network.');
    let provider, signer;
    if (providerOverride && signerOverride) {
        provider = providerOverride;
        signer = signerOverride;
    } else {
        if (!window.ethereum) throw new Error('No Ethereum wallet detected.');
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        signer = await provider.getSigner();
    }
    const chainIdFromChain = (await provider.getNetwork()).chainId;
    if (Number(chainIdFromChain) !== Number(network.chainId)) {
        throw new Error(`Please switch your wallet to the ${network.name} network.`);
    }
    const contract = new ethers.Contract(network.contractAddress, CONTRACT_ABI, signer);
    let userChildContractAddress;
    try {
        userChildContractAddress = await contract.getUserChildContractAddress();
    } catch (e) { userChildContractAddress = undefined; }
    if (userChildContractAddress === ethers.ZeroAddress || !userChildContractAddress) {
        let feeInWei = undefined;
        if (typeof additionalOptions.getFeeFn === 'function') {
            feeInWei = await additionalOptions.getFeeFn(provider, network.contractAddress);
        } else if (typeof fetchSavingFee === 'function') {
            feeInWei = await fetchSavingFee(provider, network.contractAddress);
        }

        // If fee fetching fails, try with a default fee or skip fee requirement
        if (!feeInWei) {
            console.warn('Could not fetch saving fee, trying with default fee or no fee');
            // Try with a small default fee (0.001 ETH) or no fee
            feeInWei = ethers.parseEther('0.001');
        }

        try {
            const joinTx = await contract.joinBitsave({ value: feeInWei });
            await joinTx.wait();
            userChildContractAddress = await contract.getUserChildContractAddress();
        } catch (joinError: any) {
            // If joinBitsave fails with fee, try without fee (some networks/contracts don't require it)
            if (joinError?.message?.includes('revert') || joinError?.code === 'CALL_EXCEPTION') {
                console.warn('joinBitsave with fee failed, trying without fee:', joinError.message);
                try {
                    const joinTxNoFee = await contract.joinBitsave({ value: 0 });
                    await joinTxNoFee.wait();
                    userChildContractAddress = await contract.getUserChildContractAddress();
                } catch (noFeeError) {
                    console.error('joinBitsave without fee also failed:', noFeeError);
                    throw noFeeError;
                }
            } else {
                throw joinError;
            }
        }
    }
    const cleanAmount = amountRaw.replace(/[^0-9.]/g, '');
    const parsedAmount = parseFloat(cleanAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid amount. Please enter an amount greater than zero.');
    }
    const tokenAmount = ethers.parseUnits(parsedAmount.toString(), tokenObj.decimals);
    await approveERC20(tokenObj.address, tokenAmount, signer);
    let txOptions = {};
    if (network.id === 'celo' && typeof fetchCeloPrice === 'function') {
        const celoPrice = await fetchCeloPrice();
        if (!celoPrice) throw new Error('Could not fetch CELO price for fee calculation.');
        const feeInCelo = (1 / celoPrice).toFixed(6);
        txOptions = { gasLimit: 2717330, value: ethers.parseEther(feeInCelo) };
    } else {
        let feeInWei = undefined;
        if (typeof additionalOptions.getFeeFn === 'function') {
            feeInWei = await additionalOptions.getFeeFn(provider, network.contractAddress);
        } else if (typeof fetchSavingFee === 'function') {
            feeInWei = await fetchSavingFee(provider, network.contractAddress);
        }
        // If fee fetching fails, use a default fee or skip
        if (!feeInWei && network.id !== 'celo') {
            console.warn('Could not fetch saving fee for create transaction, using default');
            feeInWei = ethers.parseEther('0.001'); // Default 0.001 ETH
        }
        if (feeInWei) txOptions = { ...txOptions, value: feeInWei };
    }
    const tx = await contract.createSaving(
        planName,
        maturity,
        penalty,
        safeMode,
        tokenObj.address,
        tokenAmount,
        txOptions
    );
    const receipt = await tx.wait();
    return receipt;
};

// Approve ERC20 Helper
export const approveERC20 = async (
    tokenAddress: string,
    amount: any,
    signer: any
) => {
    try {
        // Contract to approve is determined by network or can be made generic
        const network = await signer.provider?.getNetwork();
        const chainId = network?.chainId;
        // const contractToApprove = Number(chainId) === 42220 ? CELO_CONTRACT_ADDRESS : CONTRACT_ADDRESS;
        // Dynamic lookup for contract address
        const contractToApprove = NETWORKS.find(n => n.chainId === Number(chainId))?.contractAddress || CONTRACT_ADDRESS;

        const erc20Contract = new ethers.Contract(
            tokenAddress,
            erc20ABI,
            signer
        );
        const tx = await erc20Contract.approve(contractToApprove, amount);
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error approving ERC20 tokens:", error);
        throw error;
    }
};

// Fetch Saving Fee Helper
export const fetchSavingFee = async (provider: any, contractAddress: string) => {
    try {
        if (!getSavingFeeFromContract) throw new Error('getSavingFeeFromContract not imported');
        const feeInWei = await getSavingFeeFromContract(contractAddress, provider);
        return feeInWei;
    } catch (error) {
        console.error('Error fetching saving fee from contract:', error);
        return null;
    }
};

// Fetch Celo Price Helper
export const fetchCeloPrice = async () => {
    try {
        const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd');
        return data.celo.usd;
    } catch (error) {
        console.error('Error fetching CELO price:', error);
        return null;
    }
};

// Helper function to ensure image URLs are properly formatted for Next.js Image
export const ensureImageUrl = (url: string | undefined): string => {
    if (!url) return '/default-network.png';
    if (url.startsWith('/')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `/${url}`;
    }
    return url;
};

// Network switch configs — data-driven to avoid repetitive if/else
const NETWORK_SWITCH_CONFIGS: Record<string, { chainId: string; chainName: string; nativeCurrency: { name: string; symbol: string; decimals: number }; rpcUrls: string[]; blockExplorerUrls: string[] }> = {
    base: { chainId: '0x2105', chainName: 'Base', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://mainnet.base.org'], blockExplorerUrls: ['https://basescan.org'] },
    celo: { chainId: '0xA4EC', chainName: 'Celo', nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 }, rpcUrls: ['https://forno.celo.org'], blockExplorerUrls: ['https://explorer.celo.org'] },
    lisk: { chainId: '0x46F', chainName: 'Lisk', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://rpc.api.lisk.com'], blockExplorerUrls: ['https://blockscout.lisk.com'] },
    avalanche: { chainId: '0xA86A', chainName: 'Avalanche', nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 }, rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'], blockExplorerUrls: ['https://snowtrace.io'] },
    bsc: { chainId: '0x38', chainName: 'Binance Smart Chain', nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }, rpcUrls: ['https://bsc-dataseed.binance.org/'], blockExplorerUrls: ['https://bscscan.com'] },
};

export const switchToNetwork = async (networkName: string) => {
    try {
        if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') return;
        const config = NETWORK_SWITCH_CONFIGS[networkName];
        if (!config) return;
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: config.chainId }],
            });
        } catch (switchError: unknown) {
            if ((switchError as { code: number }).code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: config.chainId,
                        chainName: config.chainName,
                        nativeCurrency: config.nativeCurrency,
                        rpcUrls: config.rpcUrls,
                        blockExplorerUrls: config.blockExplorerUrls,
                    }],
                });
            }
        }
    } catch (error) {
        console.error(`Error switching to ${networkName} network:`, error);
    }
};

// Fetch GoodDollar price from Coingecko
export const fetchGoodDollarPrice = async () => {
    try {
        const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=gooddollar&vs_currencies=usd');
        return data.gooddollar.usd;
    } catch (error) {
        console.error(error);
        return 0.0001; // fallback
    }
};

// NLP parser — client-side regex extraction
export const parseNLPInput = (text: string) => {
    const parsed: {
        name?: string; amount?: string; currency?: string;
        network?: string; duration?: number; penalty?: string;
    } = {};
    
    // Normalize text
    const lowerText = text.toLowerCase();

    // 1. Amount Extraction (Robust)
    // Matches: 50 usdc, $500, 50k, 1.5k, 5,000
    const extractAmount = (t: string) => {
        const match = t.match(/(?:(?:save|deposit|lock|put|add)\s+)?\$?\s*([\d,]+(?:\.\d+)?)\s*(?:k|m|b)?\s*(?:usdc|usdt|cusd|usdglo|cngn|gooddollar|\$g|dollars|bucks)?/i);
        if (match) {
            let numStr = match[1].replace(/,/g, '');
            let val = parseFloat(numStr);
            // Handle 'k' multiplier
            if (t.match(new RegExp(match[1] + '\s*k', 'i'))) val *= 1000;
            if (t.match(new RegExp(match[1] + '\s*m', 'i'))) val *= 1000000;
            return val.toString();
        }
        return undefined;
    };
    parsed.amount = extractAmount(text);

    // 2. Currency Extraction
    const currencyMap: Record<string, string> = {
        'usdc': 'USDC', 'cusd': 'cUSD', 'usdglo': 'USDGLO', 'cngn': 'cNGN',
        'gooddollar': 'Gooddollar', '$g': 'Gooddollar', 'usdt': 'USDT'
    };
    const currMatch = text.match(/\b(usdc|cusd|usdglo|cngn|gooddollar|\$g|usdt)\b/i);
    if (currMatch) parsed.currency = currencyMap[currMatch[1].toLowerCase()] || 'USDC';

    // 3. Network Extraction
    const netMap: Record<string, string> = {
        'base': 'base', 'celo': 'celo', 'lisk': 'lisk',
        'avalanche': 'avalanche', 'avax': 'avalanche', 
        'bsc': 'bsc', 'binance': 'bsc', 'solana': 'solana', 'sol': 'solana'
    };
    const netMatch = text.match(/\b(?:on|using|network)?\s*(base|celo|lisk|avalanche|avax|bsc|binance|solana|sol)\b/i);
    if (netMatch) parsed.network = netMap[netMatch[1].toLowerCase()] || 'base';

    // 4. Duration Extraction
    const durMatch = text.match(/(\d+)\s*(months?|mos?|years?|yrs?|days?|weeks?|wks?)/i);
    if (durMatch) {
        const num = parseInt(durMatch[1]);
        const unit = durMatch[2].toLowerCase();
        if (unit.startsWith('y')) parsed.duration = num * 365;
        else if (unit.startsWith('mo')) parsed.duration = num * 30;
        else if (unit.startsWith('w')) parsed.duration = num * 7;
        else parsed.duration = num;
    }

    // 5. Penalty Extraction
    const penMatch = text.match(/(\d+)%?\s*(?:penalty|strictness|loss)/i) || text.match(/(?:penalty|strictness)\s*(?:of)?\s*(\d+)%/i);
    if (penMatch) {
        let p = parseInt(penMatch[1]);
        // Snap to valid penalties
        if (p <= 10) parsed.penalty = '10%';
        else if (p <= 20) parsed.penalty = '20%';
        else parsed.penalty = '30%';
    }

    // 6. Name Extraction (Highly robust)
    // Matches: called "Vacation", named Tech Fund, for House Deposit, etc.
    const nameMatch = text.match(/(?:called|named|for|title|as)\s+["']?([A-Za-z0-9\s]+?)["']?(?:\s+(?:on|with|for|saving|and)|$)/i);
    if (nameMatch) {
        // Filter out accidental preposition captures
        const extracted = nameMatch[1].trim();
        const ignoreWords = ['base', 'celo', 'usdc', 'months', 'days', 'penalty'];
        if (!ignoreWords.some(w => extracted.toLowerCase().includes(w)) && extracted.length > 2) {
            parsed.name = extracted;
        }
    }

    return parsed;
};
