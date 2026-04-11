# 🔄 System Flow - OPOS Resident Billing System

## 📌 Overview

This document defines the complete system flow of the OPOS Resident Billing System.

It describes how data moves through the system and how each module interacts.

This flow must be strictly followed for correct accounting behavior.

---

## 🧠 Core Concept

The system is based on OPOS (Open Item Accounting):

- Charges = money owed
- Payments = money received
- Allocation = payment mapped to specific charge
- Ledger = source of truth

---

## 🚀 Complete System Flow

---

## 🏗️ STEP 1: Setup (Admin Action)

1. Admin creates Houses:
   - Example: A1, A2, B1

2. Admin adds Residents:
   - Assign resident to a house
   - Example: Alice → A1

---

## 💸 STEP 2: Define Monthly Charges

Admin defines recurring charges per resident:

Example:
- Rent → 1200
- Care Fee → 300

Stored in:
→ ChargeDefinition

---

## 📅 STEP 3: Monthly Charge Generation

System automatically generates charges:

For each resident:
- Read chargeDefinitions
- Generate monthly entries

Example:

April 2026:
- Rent → 1200
- Care Fee → 300

Stored in:
→ Charge table

⚠️ Rule:
- No duplicate charges for same month

---

## 💳 STEP 4: Payment Entry

Payments can come from 2 sources:

---

### Option 1: Manual Payment

Admin records payment:

Example:
- Alice paid ₹1200 cash

Creates:
→ Payment record

---

### Option 2: Bank Import

Admin uploads CSV

System creates:
→ BankTransaction records

Example:
"UPI FROM ALICE - 1200"

---

## 🧠 STEP 5: Smart Matching (Bank)

System processes bank transactions:

1. Detect name
2. Detect house (A1, A2)
3. Match amount

Result:
- Auto Match
- Suggested Match
- Manual selection

⚠️ Rule:
- Bank does NOT update ledger directly

---

## 🔗 STEP 6: Create Payment from Bank Match

After confirmation:

- System creates Payment
- Links to resident

---

## 🔥 STEP 7: Payment Allocation (CORE LOGIC)

Payment must be assigned to charges

Flow:

1. Select payment
2. Select charge(s)
3. Allocate amount

Example:

Payment: 1200

→ Rent: 1000  
→ Care Fee: 200  

Creates:
→ PaymentAllocation records

---

## ⚙️ STEP 8: Update Charge Status

For each charge:

- paidAmount += allocation

Status:

- 0 → UNPAID
- < amount → PARTIAL
- ≥ amount → PAID

---

## 💰 STEP 9: Credit Handling

If payment exceeds total charges:

extra = payment - allocated

→ Add to:
resident.creditBalance

---

## 📊 STEP 10: Ledger Update

Ledger shows:

- Charges
- Payments
- Status
- Balance

Grouped by month:

Example:

April:
- Rent → PAID
- Care Fee → PARTIAL

---

## 🔔 STEP 11: Reminder System

System checks:

If charge.status != PAID

→ Send reminder

---

## 🔁 Full Flow Summary

1. Create House  
2. Add Resident  
3. Define Charges  
4. Generate Monthly Charges  
5. Payment received  
6. Match transaction  
7. Create payment  
8. Allocate payment  
9. Update charge  
10. Update ledger  
11. Send reminder  

---

## ⚠️ Critical Rules

- Payment must map to charge
- No direct ledger modification
- No duplicate charges
- Bank data is only input, not final data

---

## 🚫 What NOT Allowed

- No invoice system
- No role-based flow
- No tenant interaction
- No direct payment → balance update without allocation

---

## 💡 Final Goal

System should:

- Clearly show who owes money
- Track payments accurately
- Reduce manual work
- Maintain accounting accuracy