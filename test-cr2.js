require('dotenv').config({ path: '.env.local' });
const { Chainrails, crapi } = require('@chainrails/sdk');

Chainrails.config({ api_key: process.env.CHAINRAILS_API_KEY });

async function test() {
  try {
    const quotes = await crapi.quotes.getAll({
      fromChain: 'ETHEREUM',
      toChain: 'BASE',
      fromToken: 'USDC',
      toToken: 'USDC',
      amount: '100'
    });
    console.log("Quotes:", quotes);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
