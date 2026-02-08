[
    {
      "type": "constructor",
      "inputs": [
        { "name": "_collateralToken", "type": "address", "internalType": "address" },
        { "name": "_implementation", "type": "address", "internalType": "address" },
        { "name": "_creationFee", "type": "uint256", "internalType": "uint256" },
        { "name": "_initialLiquidity", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "COLLATERAL_TOKEN",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "contract IERC20" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "IMPLEMENTATION",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MAX_CREATION_FEE",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "allMarkets",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "createMarket",
      "inputs": [
        { "name": "_oracle", "type": "address", "internalType": "address" },
        { "name": "_tradingDeadline", "type": "uint256", "internalType": "uint256" },
        { "name": "_resolveTime", "type": "uint256", "internalType": "uint256" },
        { "name": "_b", "type": "uint256", "internalType": "uint256" },
        { "name": "_metadataUri", "type": "string", "internalType": "string" }
      ],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "creationFee",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAllMarkets",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address[]", "internalType": "address[]" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getMarket",
      "inputs": [{ "name": "_id", "type": "uint256", "internalType": "uint256" }],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getMarketCount",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getMarketInfo",
      "inputs": [{ "name": "_id", "type": "uint256", "internalType": "uint256" }],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct PredictionMarketFactory.MarketInfo",
          "components": [
            { "name": "marketId", "type": "uint256", "internalType": "uint256" },
            { "name": "market", "type": "address", "internalType": "address" },
            { "name": "creator", "type": "address", "internalType": "address" },
            { "name": "metadataURI", "type": "string", "internalType": "string" },
            { "name": "createdAt", "type": "uint256", "internalType": "uint256" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getMarketMetadata",
      "inputs": [{ "name": "_market", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initialLiquidity",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "marketCount",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "marketInfoByAddress",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [
        { "name": "marketId", "type": "uint256", "internalType": "uint256" },
        { "name": "market", "type": "address", "internalType": "address" },
        { "name": "creator", "type": "address", "internalType": "address" },
        { "name": "metadataURI", "type": "string", "internalType": "string" },
        { "name": "createdAt", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "markets",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [
        { "name": "marketId", "type": "uint256", "internalType": "uint256" },
        { "name": "market", "type": "address", "internalType": "address" },
        { "name": "creator", "type": "address", "internalType": "address" },
        { "name": "metadataURI", "type": "string", "internalType": "string" },
        { "name": "createdAt", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "setCreationFee",
      "inputs": [{ "name": "_newFee", "type": "uint256", "internalType": "uint256" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "setInitialLiquidity",
      "inputs": [{ "name": "_newAmount", "type": "uint256", "internalType": "uint256" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [{ "name": "_newOwner", "type": "address", "internalType": "address" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "updateMetadataURI",
      "inputs": [
        { "name": "_market", "type": "address", "internalType": "address" },
        { "name": "_newUri", "type": "string", "internalType": "string" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdrawFees",
      "inputs": [
        { "name": "_to", "type": "address", "internalType": "address" },
        { "name": "_amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "CreationFeeUpdated",
      "inputs": [
        { "name": "oldFee", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "newFee", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "FeesWithdrawn",
      "inputs": [
        { "name": "to", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "InitialLiquidityUpdated",
      "inputs": [
        { "name": "oldAmount", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "newAmount", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "MarketCreated",
      "inputs": [
        { "name": "marketId", "type": "uint256", "indexed": true, "internalType": "uint256" },
        { "name": "market", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "creator", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "oracle", "type": "address", "indexed": false, "internalType": "address" },
        { "name": "tradingDeadline", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "resolveTime", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "liquidityParam", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "initialLiquidity", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "metadataURI", "type": "string", "indexed": false, "internalType": "string" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "MetadataUpdated",
      "inputs": [
        { "name": "market", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "newURI", "type": "string", "indexed": false, "internalType": "string" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        { "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }
      ],
      "anonymous": false
    },
    { "type": "error", "name": "FailedDeployment", "inputs": [] },
    {
      "type": "error",
      "name": "InsufficientBalance",
      "inputs": [
        { "name": "balance", "type": "uint256", "internalType": "uint256" },
        { "name": "needed", "type": "uint256", "internalType": "uint256" }
      ]
    }
  ]