const https = require('https');

// The new transaction ID from the user
const transactionId = "1761686306.205675619";

const options = {
  hostname: 'testnet.mirrornode.hedera.com',
  path: `/api/v1/transactions/${transactionId}`,
  method: 'GET'
};

const req = https.request(options, res => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.transactions && jsonData.transactions.length > 0) {
        console.log('Transaction details:', JSON.stringify(jsonData.transactions[0], null, 2));
      } else {
        console.log('No transaction data found for this ID.');
      }
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', error => {
  console.error('Error fetching transaction:', error);
});

req.end();