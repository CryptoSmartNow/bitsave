const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load ABIs
const contractABIPath = path.join(__dirname, '../app/abi/contractABI.js');
const childContractABIPath = path.join(__dirname, '../app/abi/childContractABI.js');

// Helper to extract ABI from JS file export
function loadAbi(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple regex to extract the array content
    const match = content.match(/\[([\s\S]*)\]/);
    if (match) {
        return JSON.parse(`[${match[1]}]`);
    }
    throw new Error(`Could not extract ABI from ${filePath}`);
}

const BitSaveABI = loadAbi(contractABIPath);
const childContractABI = loadAbi(childContractABIPath);

// Configuration
const BASE_RPC_URL = 'https://base.publicnode.com';
const BASE_CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13";
const TEST_USER_ADDRESS = process.argv[2]; // Pass user address as argument

if (!TEST_USER_ADDRESS) {
    console.error('Please provide a user address as an argument');
    process.exit(1);
}

async function debugSavingsFetch() {
    console.log(`=== Debugging Savings Fetch for ${TEST_USER_ADDRESS} ===`);

    try {
        const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);

        // 1. Check Network Connection
        const blockNumber = await provider.getBlockNumber();
        console.log(`Connected to Base. Current Block: ${blockNumber}`);

        // 2. Initialize Main Contract
        const contract = new ethers.Contract(BASE_CONTRACT_ADDRESS, BitSaveABI, provider);

        // 3. Get User Child Contract
        console.log('Fetching user child contract address...');
        // Note: getUserChildContractAddress uses msg.sender, so we need to simulate the call from the user address
        // In ethers v6, we can use callStatic or just call with from override if supported by the provider for view functions
        // However, for view functions that depend on msg.sender, we need to be careful.
        // Let's try to see if the contract function accepts an address argument or relies solely on msg.sender.
        // Looking at ABI: getUserChildContractAddress() view returns (address)
        // It likely relies on msg.sender.

        // We can use provider.call to simulate
        const userChildContractAddress = await contract.getUserChildContractAddress.staticCall({ from: TEST_USER_ADDRESS });
        console.log(`Child Contract Address: ${userChildContractAddress}`);

        if (userChildContractAddress === ethers.ZeroAddress) {
            console.log('User has no child contract (not registered or no savings).');
            return;
        }

        // 4. Initialize Child Contract
        const childContract = new ethers.Contract(userChildContractAddress, childContractABI, provider);

        // 5. Get Savings Names
        console.log('Fetching savings names (WITH from)...');
        try {
            const savingsNamesObj = await childContract.getSavingsNames.staticCall({ from: TEST_USER_ADDRESS });
            const savingsNames = savingsNamesObj.savingsNames || [];
            console.log(`Found ${savingsNames.length} savings plans (with from):`, savingsNames);
        } catch (e) {
            console.log('getSavingsNames (with from) failed:', e.message);
        }

        console.log('Fetching savings names (WITHOUT from)...');
        let savingsNames = [];
        try {
            const savingsNamesObj = await childContract.getSavingsNames.staticCall();
            savingsNames = savingsNamesObj.savingsNames || [];
            console.log(`Found ${savingsNames.length} savings plans (without from):`, savingsNames);
        } catch (e) {
            console.log('getSavingsNames (without from) failed:', e.message);
        }

        // 6. Fetch Details for Each Plan
        for (const name of savingsNames) {
            if (!name) continue;
            console.log(`\n--- Fetching details for plan: "${name}" ---`);

            try {
                // Try with from
                console.log('Attempting getSaving WITH from...');
                const savingData = await childContract.getSaving.staticCall(name, { from: TEST_USER_ADDRESS });

                console.log('Raw Data:', {
                    isValid: savingData.isValid,
                    amount: savingData.amount.toString(),
                    tokenId: savingData.tokenId,
                    startTime: savingData.startTime.toString(),
                    maturityTime: savingData.maturityTime.toString(),
                    penaltyPercentage: savingData.penaltyPercentage.toString()
                });

                const amount = ethers.formatUnits(savingData.amount, 6); // Assuming USDC (6 decimals) for simplicity in debug
                const startTime = new Date(Number(savingData.startTime) * 1000).toISOString();
                const maturityTime = new Date(Number(savingData.maturityTime) * 1000).toISOString();

                console.log(`Formatted:
          Amount: ${amount} (assuming 6 decimals)
          Start: ${startTime}
          Maturity: ${maturityTime}
          Token: ${savingData.tokenId}
        `);

            } catch (err) {
                console.error(`getSaving (with from) failed:`, err.message);

                // Try without from
                try {
                    console.log('Attempting getSaving WITHOUT from...');
                    const savingData = await childContract.getSaving.staticCall(name);
                    console.log('Raw Data (without from):', {
                        isValid: savingData.isValid,
                        amount: savingData.amount.toString()
                    });

                    const amount = ethers.formatUnits(savingData.amount, 6); // Assuming USDC (6 decimals) for simplicity in debug
                    const startTime = new Date(Number(savingData.startTime) * 1000).toISOString();
                    const maturityTime = new Date(Number(savingData.maturityTime) * 1000).toISOString();

                    console.log(`Formatted (without from):
            Amount: ${amount} (assuming 6 decimals)
            Start: ${startTime}
            Maturity: ${maturityTime}
            Token: ${savingData.tokenId}
          `);

                } catch (err2) {
                    console.error(`getSaving (without from) failed:`, err2.message);
                }
            }
        }

    } catch (error) {
        console.error('Debug script failed:', error);
    }
}

debugSavingsFetch();
