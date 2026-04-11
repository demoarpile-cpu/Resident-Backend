import axios from 'axios';

async function test() {
  try {
    const response = await axios.post('http://localhost:5000/api/residents', {
      name: "Auto History Test",
      houseId: "3c1b9b05-59cf-4dbf-9d38-fad88bd08bd0",
      startDate: "2026-02-01",
      monthlyCharge: 1200
    });
    console.log("Response Success:", response.data.success);
    console.log("Charge Definitions:", response.data.data.chargeDefs.length);
    console.log("Generated Charges:", response.data.data.charges.length);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

test();
