import * as bankService from './bank.service.js';

/**
 * Extracts a potential invoice or resident reference from transaction description
 * @param {string} text - Bank transaction description
 * @returns {string|null} - Extracted reference or null
 */
const extractReference = (text) => {
    // Basic example regex to find something like RE12345 or INV9876
    const match = text.match(/(RE|INV|Rechnung)?\s*-?\s*([0-9]{5,8})/i);
    return match ? match[0] : null;
};

/**
 * Mock function to simulate fetching data from an Open Banking API (like GoCardless)
 * and syncing it with our internal database.
 */
export const syncTransactions = async () => {
    console.log("Initiating Mock Bank API Sync...");

    // 1. Simulate API Fetching (This would be replaced by actual GoCardless API calls later)
    const simulatedApiData = [
        {
            transaction_id: `tx_mock_${Date.now()}`,
            booking_date: new Date().toISOString(),
            remittance_information: "Rent Payment RE10045 Max Mustermann",
            transaction_amount: { amount: "550.00", currency: "EUR" }
        },
        {
            transaction_id: `tx_mock_${Date.now() + 1}`,
            booking_date: new Date().toISOString(),
            remittance_information: "Deposit INV99211 Anna Schmidt",
            transaction_amount: { amount: "1200.00", currency: "EUR" }
        }
    ];

    // 2. Normalize Data to our internal format
    const normalizedData = simulatedApiData.map(tx => ({
        externalId: tx.transaction_id,
        date: tx.booking_date,
        description: tx.remittance_information,
        amount: parseFloat(tx.transaction_amount.amount),
        reference: extractReference(tx.remittance_information)
    }));

    // 3. Feed into existing pipeline
    const uploadResult = await bankService.uploadTransactions(normalizedData);
    
    // 4. Trigger auto-matching
    const matchResult = await bankService.autoReconcile();

    return {
        success: true,
        message: "Mock API sync completed successfully",
        apiTransactionsFetched: simulatedApiData.length,
        uploadStats: uploadResult,
        autoReconcileStats: matchResult
    };
};
