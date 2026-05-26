const bs58 = require('bs58');
const hex = "86d11c590c483cbe0783ce5ec1ec619579e6b631399d1c5f4693526665c1eaf8";
const bytes = Buffer.from(hex, 'hex');
console.log(bs58.default ? bs58.default.encode(bytes) : bs58.encode(bytes));
