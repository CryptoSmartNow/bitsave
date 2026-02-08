 [
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
  ]