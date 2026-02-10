export const PREDICTION_MARKET_FACTORY_ABI = [
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
] as const;

export const PREDICTION_MARKET_ABI = [
    {
      "type": "function",
      "name": "b",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "buyNo",
      "inputs": [{ "name": "amountShares", "type": "uint256", "internalType": "uint256" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "buyYes",
      "inputs": [{ "name": "amountShares", "type": "uint256", "internalType": "uint256" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    { "type": "function", "name": "closeMarket", "inputs": [], "outputs": [], "stateMutability": "nonpayable" },
    {
      "type": "function",
      "name": "collateralToken",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "contract IERC20" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "creator",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "initialize",
      "inputs": [
        { "name": "_collateral", "type": "address", "internalType": "address" },
        { "name": "_oracle", "type": "address", "internalType": "address" },
        { "name": "_creator", "type": "address", "internalType": "address" },
        { "name": "_tradingDeadline", "type": "uint256", "internalType": "uint256" },
        { "name": "_resolveTime", "type": "uint256", "internalType": "uint256" },
        { "name": "_b", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "initialized",
      "inputs": [],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "marketState",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint8", "internalType": "enum PredictionMarket.MarketState" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "noShares",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "oracle",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    { "type": "function", "name": "pause", "inputs": [], "outputs": [], "stateMutability": "nonpayable" },
    {
      "type": "function",
      "name": "paused",
      "inputs": [],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "quoteBuyNo",
      "inputs": [{ "name": "amountShares", "type": "uint256", "internalType": "uint256" }],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "quoteBuyYes",
      "inputs": [{ "name": "amountShares", "type": "uint256", "internalType": "uint256" }],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    { "type": "function", "name": "redeem", "inputs": [], "outputs": [], "stateMutability": "nonpayable" },
    {
      "type": "function",
      "name": "resolve",
      "inputs": [{ "name": "outcome", "type": "uint8", "internalType": "uint8" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "resolveTime",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "resolvedOutcome",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint8", "internalType": "uint8" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "sellNo",
      "inputs": [{ "name": "amountShares", "type": "uint256", "internalType": "uint256" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "sellYes",
      "inputs": [{ "name": "amountShares", "type": "uint256", "internalType": "uint256" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "tradingDeadline",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transferNoShares",
      "inputs": [
        { "name": "_to", "type": "address", "internalType": "address" },
        { "name": "_amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferYesShares",
      "inputs": [
        { "name": "_to", "type": "address", "internalType": "address" },
        { "name": "_amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    { "type": "function", "name": "unpause", "inputs": [], "outputs": [], "stateMutability": "nonpayable" },
    {
      "type": "function",
      "name": "userNo",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "userYes",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "yesShares",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    { "type": "event", "name": "MarketClosed", "inputs": [], "anonymous": false },
    { "type": "event", "name": "MarketPaused", "inputs": [], "anonymous": false },
    {
      "type": "event",
      "name": "MarketResolved",
      "inputs": [{ "name": "outcome", "type": "uint8", "indexed": false, "internalType": "uint8" }],
      "anonymous": false
    },
    { "type": "event", "name": "MarketUnpaused", "inputs": [], "anonymous": false },
    {
      "type": "event",
      "name": "Redeemed",
      "inputs": [
        { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "payout", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "SharesBought",
      "inputs": [
        { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "isYes", "type": "bool", "indexed": true, "internalType": "bool" },
        { "name": "shares", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "cost", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "SharesSold",
      "inputs": [
        { "name": "user", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "isYes", "type": "bool", "indexed": true, "internalType": "bool" },
        { "name": "shares", "type": "uint256", "indexed": false, "internalType": "uint256" },
        { "name": "refund", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "SharesTransferred",
      "inputs": [
        { "name": "from", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "to", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "isYes", "type": "bool", "indexed": true, "internalType": "bool" },
        { "name": "shares", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "PRBMath_MulDiv18_Overflow",
      "inputs": [
        { "name": "x", "type": "uint256", "internalType": "uint256" },
        { "name": "y", "type": "uint256", "internalType": "uint256" }
      ]
    },
    {
      "type": "error",
      "name": "PRBMath_MulDiv_Overflow",
      "inputs": [
        { "name": "x", "type": "uint256", "internalType": "uint256" },
        { "name": "y", "type": "uint256", "internalType": "uint256" },
        { "name": "denominator", "type": "uint256", "internalType": "uint256" }
      ]
    },
    { "type": "error", "name": "PRBMath_SD59x18_Div_InputTooSmall", "inputs": [] },
    {
      "type": "error",
      "name": "PRBMath_SD59x18_Div_Overflow",
      "inputs": [
        { "name": "x", "type": "int256", "internalType": "SD59x18" },
        { "name": "y", "type": "int256", "internalType": "SD59x18" }
      ]
    },
    {
      "type": "error",
      "name": "PRBMath_SD59x18_Exp2_InputTooBig",
      "inputs": [{ "name": "x", "type": "int256", "internalType": "SD59x18" }]
    },
    {
      "type": "error",
      "name": "PRBMath_SD59x18_Exp_InputTooBig",
      "inputs": [{ "name": "x", "type": "int256", "internalType": "SD59x18" }]
    },
    {
      "type": "error",
      "name": "PRBMath_SD59x18_Log_InputTooSmall",
      "inputs": [{ "name": "x", "type": "int256", "internalType": "SD59x18" }]
    },
    { "type": "error", "name": "PRBMath_SD59x18_Mul_InputTooSmall", "inputs": [] },
    {
      "type": "error",
      "name": "PRBMath_SD59x18_Mul_Overflow",
      "inputs": [
        { "name": "x", "type": "int256", "internalType": "SD59x18" },
        { "name": "y", "type": "int256", "internalType": "SD59x18" }
      ]
    }
] as const;

export const ERC20_ABI = [
  {
      type: "function",
      name: "balanceOf",
      inputs: [{ name: "owner", type: "address", internalType: "address" }],
      outputs: [{ name: "balance", type: "uint256", internalType: "uint256" }],
      stateMutability: "view"
  },
  {
      type: "function",
      name: "allowance",
      inputs: [
          { name: "owner", type: "address", internalType: "address" },
          { name: "spender", type: "address", internalType: "address" },
      ],
      outputs: [{ name: "remaining", type: "uint256", internalType: "uint256" }],
      stateMutability: "view"
  },
  {
      type: "function",
      name: "approve",
      inputs: [
          { name: "spender", type: "address", internalType: "address" },
          { name: "value", type: "uint256", internalType: "uint256" },
      ],
      outputs: [{ name: "success", type: "bool", internalType: "bool" }],
      stateMutability: "nonpayable"
  },
  {
      type: "function",
      name: "decimals",
      inputs: [],
      outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
      stateMutability: "view"
  }
] as const;

export const MOCK_USDC_ABI = [
    { "type": "constructor", "inputs": [], "stateMutability": "nonpayable" },
    {
      "type": "function",
      "name": "DECIMALS",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint8", "internalType": "uint8" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "FAUCET_AMOUNT",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "NAME",
      "inputs": [],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "SYMBOL",
      "inputs": [],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "allowance",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        { "name": "spender", "type": "address", "internalType": "address" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "decimals",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint8", "internalType": "uint8" }],
      "stateMutability": "pure"
    },
    { "type": "function", "name": "faucet", "inputs": [], "outputs": [], "stateMutability": "nonpayable" },
    {
      "type": "function",
      "name": "mint",
      "inputs": [
        { "name": "to", "type": "address", "internalType": "address" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "name",
      "inputs": [],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "pure"
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
      "name": "symbol",
      "inputs": [],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "pure"
    },
    {
      "type": "function",
      "name": "totalSupply",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transfer",
      "inputs": [
        { "name": "to", "type": "address", "internalType": "address" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferFrom",
      "inputs": [
        { "name": "from", "type": "address", "internalType": "address" },
        { "name": "to", "type": "address", "internalType": "address" },
        { "name": "amount", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "Approval",
      "inputs": [
        { "name": "owner", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "spender", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "value", "type": "uint256", "indexed": false, "internalType": "uint256" }
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
    {
      "type": "event",
      "name": "Transfer",
      "inputs": [
        { "name": "from", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "to", "type": "address", "indexed": true, "internalType": "address" },
        { "name": "value", "type": "uint256", "indexed": false, "internalType": "uint256" }
      ],
      "anonymous": false
    }
] as const;
