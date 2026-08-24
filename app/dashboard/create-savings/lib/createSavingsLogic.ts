import { ethers } from 'ethers';
import axios from 'axios';
import CONTRACT_ABI from '@/app/abi/contractABI';

export const toChecksum = (addr: string): string => {
    if (!addr) return '';
    try {
        return ethers.getAddress(addr.toLowerCase());
    } catch {
        return addr;
    }
};

export const BASE_CONTRACT_ADDRESS_NEW = toChecksum('0x67FFa7a1eb0D05BEaF9dB039c1bD604063040be9');
export const CELO_CONTRACT_ADDRESS = toChecksum('0x7d839923Eb2DAc3A0d1cABb270102E481A208F33');
export const LISK_CONTRACT_ADDRESS = toChecksum('0x3593546078eECD0FFd1c19317f53ee565be6ca13');
export const BSC_CONTRACT_ADDRESS = toChecksum('0x0C4A310695702ed713BCe816786Fcc31C11fe932');
export const AVALANCHE_CONTRACT_ADDRESS = toChecksum('0x7d839923Eb2DAc3A0d1cABb270102E481A208F33');

export const USDGLO_BASE_ADDRESS = toChecksum('0x4F604735c1cF31399C6E711D5962b2B3E0225AD3');
export const USDGLO_CELO_ADDRESS = toChecksum('0x4F604735c1cF31399C6E711D5962b2B3E0225AD3');
export const USDGLO_LISK_ADDRESS = toChecksum('0x0594a96ec5b36440f3b0E5283f6057a660d5b40d');
export const USDC_BASE_ADDRESS = toChecksum('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
export const USDC_CELO_ADDRESS = toChecksum('0xcebA9300f2b948710d2653dD7B07f33A8B32118C');
export const USDC_LISK_ADDRESS = toChecksum('0x5C63e481816e88544d67362E69d1fD2A3297a7F9');
export const USDC_BSC_ADDRESS = toChecksum('0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d');
export const USDC_AVALANCHE_ADDRESS = toChecksum('0xB97EF3E87dDc3097611D702F04bA57987979705A');
export const USDT_BSC_ADDRESS = toChecksum('0x55d398326f99059fF775485246999027B3197955');
export const USDT_AVALANCHE_ADDRESS = toChecksum('0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7');

export const STANDARD_ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 value) returns (bool)',
    'function symbol() view returns (string)',
    'function name() view returns (string)'
];

export interface NetworkConfig {
    id: string;
    name: string;
    chainId: number;
    contractAddress: string;
    rpcUrl: string;
    nativeSymbol: string;
    isComingSoon?: boolean;
    tokens: Array<{
        symbol: string;
        address: string;
        decimals: number;
    }>;
}

export const NETWORKS: NetworkConfig[] = [
    {
        id: 'base',
        name: 'Base',
        chainId: 8453,
        contractAddress: BASE_CONTRACT_ADDRESS_NEW,
        rpcUrl: 'https://mainnet.base.org',
        nativeSymbol: 'ETH',
        isComingSoon: false,
        tokens: [
            { symbol: 'USDC', address: USDC_BASE_ADDRESS, decimals: 6 },
            { symbol: 'USDGLO', address: USDGLO_BASE_ADDRESS, decimals: 18 },
        ]
    },
    {
        id: 'celo',
        name: 'Celo',
        chainId: 42220,
        contractAddress: CELO_CONTRACT_ADDRESS,
        rpcUrl: 'https://forno.celo.org',
        nativeSymbol: 'CELO',
        isComingSoon: false,
        tokens: [
            { symbol: 'cUSD', address: toChecksum('0x765DE816845861e75A25fCA122bb6898B8B1282a'), decimals: 18 },
            { symbol: 'USDC', address: USDC_CELO_ADDRESS, decimals: 6 },
            { symbol: 'USDGLO', address: USDGLO_CELO_ADDRESS, decimals: 18 },
            { symbol: 'cNGN', address: toChecksum('0xE899557C3eD87d49911e3b6a9A316A34F9f7A999'), decimals: 18 },
            { symbol: 'Gooddollar', address: toChecksum('0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A'), decimals: 18 }
        ]
    },
    {
        id: 'lisk',
        name: 'Lisk',
        chainId: 1135,
        contractAddress: LISK_CONTRACT_ADDRESS,
        rpcUrl: 'https://rpc.api.lisk.com',
        nativeSymbol: 'ETH',
        isComingSoon: false,
        tokens: [
            { symbol: 'USDC', address: USDC_LISK_ADDRESS, decimals: 6 },
            { symbol: 'USDGLO', address: USDGLO_LISK_ADDRESS, decimals: 18 },
        ]
    },
    {
        id: 'bsc',
        name: 'Binance Smart Chain',
        chainId: 56,
        contractAddress: BSC_CONTRACT_ADDRESS,
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        nativeSymbol: 'BNB',
        isComingSoon: false,
        tokens: [
            { symbol: 'USDT', address: USDT_BSC_ADDRESS, decimals: 18 },
            { symbol: 'USDC', address: USDC_BSC_ADDRESS, decimals: 18 }
        ]
    },
    {
        id: 'avalanche',
        name: 'Avalanche',
        chainId: 43114,
        contractAddress: AVALANCHE_CONTRACT_ADDRESS,
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        nativeSymbol: 'AVAX',
        isComingSoon: false,
        tokens: [
            { symbol: 'USDC', address: USDC_AVALANCHE_ADDRESS, decimals: 6 },
            { symbol: 'USDT', address: USDT_AVALANCHE_ADDRESS, decimals: 6 }
        ]
    }
];

export const ensureImageUrl = (url?: string) => {
    if (!url) return '/base-square-logo.svg';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
    return `/${url}`;
};

export const fetchGoodDollarPrice = async (): Promise<number> => {
    try {
        const res = await axios.get('/api/prices?ids=gooddollar');
        return res.data?.gooddollar?.usd || 0.0001;
    } catch {
        return 0.0001;
    }
};

export const fetchCeloPrice = async (): Promise<number> => {
    try {
        const res = await axios.get('/api/prices?ids=celo');
        return res.data?.celo?.usd || 0.5;
    } catch {
        return 0.5;
    }
};

// Network Switcher
export const switchToNetwork = async (networkId: string) => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    const network = NETWORKS.find(n => n.id === networkId);
    if (!network) return;

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${network.chainId.toString(16)}` }],
        });
    } catch (switchError: any) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${network.chainId.toString(16)}`,
                        chainName: network.name,
                        rpcUrls: [network.rpcUrl],
                        nativeCurrency: { name: network.nativeSymbol, symbol: network.nativeSymbol, decimals: 18 }
                    }],
                });
            } catch (addError) {
                console.error('Failed to add network:', addError);
            }
        }
    }
};

/**
 * Fetch wallet token balance and native balance safely across any network
 */
export const getWalletBalances = async (
    networkId: string,
    tokenSymbol: string,
    userAddress: string
) => {
    const network = NETWORKS.find(n => n.id === networkId);
    if (!network || !userAddress) return { tokenBalance: '0', nativeBalance: '0', decimals: 18 };

    const tokenObj = network.tokens.find(t => t.symbol === tokenSymbol);
    if (!tokenObj) return { tokenBalance: '0', nativeBalance: '0', decimals: 18 };

    try {
        const cleanUserAddress = toChecksum(userAddress);
        const cleanTokenAddress = toChecksum(tokenObj.address);

        // Always query targeted network's JSON RPC endpoint
        const prov = new ethers.JsonRpcProvider(network.rpcUrl);

        // Native balance
        let nativeBalanceFormatted = '0';
        try {
            const nativeBal = await prov.getBalance(cleanUserAddress);
            nativeBalanceFormatted = ethers.formatEther(nativeBal);
        } catch {
            // Silently handle
        }

        // Token balance
        let tokenBalanceFormatted = '0';
        try {
            const erc20Contract = new ethers.Contract(cleanTokenAddress, STANDARD_ERC20_ABI, prov);
            const tokenBal = await erc20Contract.balanceOf(cleanUserAddress);
            tokenBalanceFormatted = ethers.formatUnits(tokenBal, tokenObj.decimals);
        } catch {
            // Silently handle
        }

        return {
            tokenBalance: tokenBalanceFormatted,
            nativeBalance: nativeBalanceFormatted,
            decimals: tokenObj.decimals,
        };
    } catch {
        return { tokenBalance: '0', nativeBalance: '0', decimals: tokenObj.decimals };
    }
};

/**
 * Creates savings on EVM with strict pre-flight balance and allowance checks.
 */
export const createSavingsGeneric = async ({
    networkId,
    tokenSymbol,
    planName,
    amountRaw,
    maturity,
    penalty,
    safeMode = false,
    providerOverride,
    signerOverride,
    address,
    onProgress,
}: {
    networkId: string;
    tokenSymbol: string;
    planName: string;
    amountRaw: string;
    maturity: number;
    penalty: number | string;
    safeMode?: boolean;
    providerOverride?: any;
    signerOverride?: any;
    address: string;
    onProgress?: (status: string) => void;
}) => {
    const network = NETWORKS.find(n => n.id === networkId);
    if (!network) throw new Error('Invalid network selected.');

    const tokenObj = network.tokens.find(t => t.symbol === tokenSymbol);
    if (!tokenObj || !tokenObj.address) throw new Error(`Token ${tokenSymbol} is not supported on ${network.name}.`);

    let provider = providerOverride;
    let signer = signerOverride;

    if (!signer) {
        if (typeof window !== 'undefined' && window.ethereum) {
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
        } else {
            throw new Error('No wallet connected. Please connect your wallet.');
        }
    }

    if (!provider && signer.provider) {
        provider = signer.provider;
    }

    const rawUserAddress = address || await signer.getAddress();
    const userAddress = toChecksum(rawUserAddress);
    const tokenAddress = toChecksum(tokenObj.address);
    const contractAddress = toChecksum(network.contractAddress);

    // 1. Validate Amount
    const cleanAmount = amountRaw.replace(/[^0-9.]/g, '');
    const parsedAmount = parseFloat(cleanAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Please enter a valid amount greater than zero.');
    }
    const tokenAmount = ethers.parseUnits(parsedAmount.toString(), tokenObj.decimals);

    // 2. Validate Maturity
    const nowUnix = Math.floor(Date.now() / 1000);
    if (!maturity || maturity <= nowUnix) {
        throw new Error('Please select a target maturity date in the future.');
    }

    const penaltyPercentage = typeof penalty === 'number' 
        ? penalty 
        : parseInt(String(penalty).replace('%', '')) || 10;

    // 3. Strict Pre-flight Wallet Balance Check directly via network RPC
    onProgress?.('Verifying wallet balance & protocol fee onchain...');
    const directNetworkProvider = new ethers.JsonRpcProvider(network.rpcUrl);
    const erc20ReadContract = new ethers.Contract(tokenAddress, STANDARD_ERC20_ABI, directNetworkProvider);
    
    // Check token balance
    const userTokenBalance = await erc20ReadContract.balanceOf(userAddress);
    if (userTokenBalance < tokenAmount) {
        const formattedBal = ethers.formatUnits(userTokenBalance, tokenObj.decimals);
        throw new Error(
            `Insufficient ${tokenSymbol} balance. Your wallet has ${parseFloat(formattedBal).toFixed(2)} ${tokenSymbol}, but you are trying to save ${parsedAmount} ${tokenSymbol}. Please add funds to your wallet first.`
        );
    }

    // Check native gas & protocol creation fee
    const userNativeBalance = await directNetworkProvider.getBalance(userAddress);
    let requiredProtocolFee = 0n;
    try {
        const tempContract = new ethers.Contract(contractAddress, CONTRACT_ABI, directNetworkProvider);
        const fee = await tempContract.SavingFee();
        if (fee && fee > 0n) requiredProtocolFee = fee;
    } catch {
        // continue
    }

    // Minimum buffer for network gas (~0.00005 ETH or equivalent)
    const minGasBuffer = network.id === 'celo' ? ethers.parseEther('0.05') : ethers.parseEther('0.00005');
    const totalRequiredNative = requiredProtocolFee + minGasBuffer;

    if (userNativeBalance < totalRequiredNative) {
        const currentNativeFormatted = ethers.formatEther(userNativeBalance);
        const requiredNativeFormatted = ethers.formatEther(totalRequiredNative);
        throw new Error(
            `Insufficient ${network.nativeSymbol} for network gas & protocol fee. Your wallet has ${parseFloat(currentNativeFormatted).toFixed(6)} ${network.nativeSymbol}, but at least ~${parseFloat(requiredNativeFormatted).toFixed(4)} ${network.nativeSymbol} is required on ${network.name} to cover the protocol creation fee and gas.`
        );
    }

    // 4. Ensure wallet is switched to target network
    if (signer.provider) {
        try {
            const currentNet = await signer.provider.getNetwork();
            if (Number(currentNet.chainId) !== network.chainId) {
                onProgress?.(`Please switch wallet network to ${network.name}...`);
                await switchToNetwork(network.id);
            }
        } catch {
            // continue
        }
    }

    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    const erc20SignerContract = new ethers.Contract(tokenAddress, STANDARD_ERC20_ABI, signer);

    // 5. Check if user needs to join BitSave
    onProgress?.('Verifying BitSave vault setup...');
    let userChildContractAddress;
    try {
        userChildContractAddress = await contract.getUserChildContractAddress();
    } catch {
        userChildContractAddress = undefined;
    }

    if (!userChildContractAddress || userChildContractAddress === ethers.ZeroAddress) {
        onProgress?.('Initializing your personal BitSave child vault contract...');
        let feeInWei = 0n;
        try {
            const contractFee = await contract.SavingFee();
            if (contractFee && contractFee > 0n) feeInWei = contractFee;
        } catch {
            // default to 0
        }

        try {
            const joinTx = await contract.joinBitsave({ value: feeInWei });
            await joinTx.wait();
        } catch (joinErr: any) {
            if (joinErr?.message?.includes('revert') || joinErr?.code === 'CALL_EXCEPTION') {
                const joinTxNoFee = await contract.joinBitsave({ value: 0 });
                await joinTxNoFee.wait();
            } else {
                throw joinErr;
            }
        }
    }

    // 6. Token Approval Check
    onProgress?.(`Checking ${tokenSymbol} approval...`);
    try {
        const currentAllowance = await erc20SignerContract.allowance(userAddress, contractAddress);
        if (BigInt(currentAllowance.toString()) < BigInt(tokenAmount.toString())) {
            onProgress?.(`Approving ${tokenSymbol} for lock...`);
            const approveTx = await erc20SignerContract.approve(contractAddress, ethers.MaxUint256);
            await approveTx.wait();
        }
    } catch (approveErr) {
        console.warn('Allowance check failed, sending standard approval...', approveErr);
        onProgress?.(`Approving ${tokenSymbol}...`);
        const approveTx = await erc20SignerContract.approve(contractAddress, tokenAmount);
        await approveTx.wait();
    }

    // 7. Create Saving
    onProgress?.('Creating your locked savings plan onchain...');
    let txOptions: Record<string, any> = {};
    
    try {
        const savingFee = await contract.SavingFee();
        if (savingFee && savingFee > 0n) {
            txOptions.value = savingFee;
        }
    } catch {
        // Continue
    }

    if (network.id === 'celo') {
        const celoPrice = await fetchCeloPrice();
        if (celoPrice && celoPrice > 0) {
            const feeInCelo = (1 / celoPrice).toFixed(6);
            txOptions = { ...txOptions, value: ethers.parseEther(feeInCelo) };
        }
    }

    const tx = await contract.createSaving(
        planName,
        maturity,
        penaltyPercentage,
        safeMode,
        tokenAddress,
        tokenAmount,
        txOptions
    );

    onProgress?.('Waiting for block confirmation...');
    const receipt = await tx.wait();

    if (!receipt || (receipt.status !== 1 && receipt.status !== undefined)) {
        throw new Error('Transaction was not confirmed on the blockchain.');
    }

    return receipt;
};
