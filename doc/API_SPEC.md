# 🔌 API Specification - OPOS Resident Billing System

## 📌 Overview

This API is designed based on PRD and DATABASE.md.

- Single Admin system
- No authentication complexity
- No role-based APIs
- Clean REST structure

---

## 🏠 Houses API

### Get All Houses
GET /houses

### Create House
POST /houses

Body:
{
  "name": "A1",
  "type": "Studio"
}

---

## 👤 Residents API

### Get All Residents
GET /residents

### Create Resident
POST /residents

Body:
{
  "name": "Alice",
  "houseId": "HOUSE_ID",
  "startDate": "2026-04-01"
}

### Get Resident Details
GET /residents/:id

---

## 💸 Charge Definitions API

### Add Monthly Charge Rule
POST /charge-definitions

Body:
{
  "residentId": "RESIDENT_ID",
  "type": "Rent",
  "amount": 1200,
  "startDate": "2026-01-01"
}

### Get Charge Definitions
GET /charge-definitions?residentId=RESIDENT_ID

---

## 📅 Charges API

### Get Charges by Resident
GET /charges?residentId=RESIDENT_ID

---

## 💰 Payments API

### Record Payment (Manual)

POST /payments

Body:
{
  "residentId": "RESIDENT_ID",
  "amount": 1200,
  "date": "2026-04-03",
  "method": "Cash"
}

---

## 🔗 Payment Allocation API

### Allocate Payment to Charge

POST /payments/allocate

Body:
{
  "paymentId": "PAYMENT_ID",
  "allocations": [
    {
      "chargeId": "CHARGE_ID",
      "amount": 1000
    }
  ]
}

---

## 🏦 Bank Transactions API

### Upload CSV

POST /bank/upload

Description:
Upload bank CSV file

---

### Get Bank Transactions

GET /bank

---

### Match Bank Transaction

POST /bank/match

Body:
{
  "transactionId": "TX_ID",
  "residentId": "RESIDENT_ID",
  "chargeId": "CHARGE_ID"
}

---

## 📊 Reports API

### Resident Ledger

GET /reports/resident/:id

---

## 🔄 Core Flow

1. Create House
2. Add Resident
3. Add Charge Definition
4. Auto-generate Charges
5. Import Bank Data
6. Match Transaction
7. Create Payment
8. Allocate Payment
9. Update Ledger

---

## ⚠️ Rules

- Payment must be linked to resident
- Payment should be allocated to charge
- Bank transaction does NOT update ledger directly
- Matching must happen first

---

## 💡 Goal

Provide simple and clear APIs that:

- Follow PRD logic
- Match database structure
- Enable clean backend implementation