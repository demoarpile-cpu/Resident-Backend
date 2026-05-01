import { uploadTransactions } from '../src/services/bank.service.js';

async function test() {
  try {
    const txs = [
      {
        date: "2023-10-01",
        description: "Test CSV Transaction",
        amount: "150.00"
      }
    ];
    console.log("Testing uploadTransactions...");
    const res = await uploadTransactions(txs);
    console.log("Result:", res);
  } catch (e) {
    console.error("Test Error:", e);
  }
}
test();
