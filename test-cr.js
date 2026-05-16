require('dotenv').config({ path: '.env.local' });
const { Chainrails, crapi } = require('@chainrails/sdk');

Chainrails.config({ api_key: process.env.CHAINRAILS_API_KEY });

async function test() {
  try {
    const quotes = await crapi.ramp.getQuotes({
      fiatAmount: 100,
      fiatCurrency: 'USD',
      cryptoCurrency: 'USDC',
      network: 'BASE'
    });
    console.log("Ramp quotes:", quotes);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
